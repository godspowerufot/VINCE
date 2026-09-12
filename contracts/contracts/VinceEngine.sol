// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IEvmV1Decoder} from "./interfaces/IEvmV1Decoder.sol";
import {IVinceEngine} from "./interfaces/IVinceEngine.sol";
import {IVinceVerifier} from "./interfaces/IVinceVerifier.sol";
import {VinceRegistry} from "./VinceRegistry.sol";

/// @title VinceEngine
/// @notice After Attestcoin verification, open the settlement window (ADR-017).
/// Policy reasons are informational and do not lock the desk.
contract VinceEngine is IVinceEngine, Ownable {
    bytes32 public constant ANSWER_UPDATED =
        0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f;

    uint8 public constant DECISION_PASS = 1;
    uint8 public constant DECISION_REJECT = 2;
    uint256 public constant WINDOW_SECONDS = 1_800;

    VinceRegistry public immutable registry;
    IEvmV1Decoder public immutable decoder;
    IVinceVerifier public immutable verifier;
    address public gate;

    LiveWindow private _window;

    event ObservationNormalized(
        bytes32 indexed txKey,
        address indexed emitter,
        int256 answer,
        uint256 roundId,
        uint256 updatedAt
    );

    event DecisionEmitted(
        bytes32 indexed txKey,
        uint8 decision,
        string[] reasons,
        bytes32 marketId,
        address emitter,
        int256 answer,
        uint256 updatedAt,
        uint256 validUntil
    );

    event GateCompleted(bytes32 indexed txKey, uint8 decision, uint256 validUntil);

    constructor(address registry_, address decoder_, address verifier_) Ownable(msg.sender) {
        require(registry_ != address(0) && decoder_ != address(0) && verifier_ != address(0), "addrs");
        registry = VinceRegistry(registry_);
        decoder = IEvmV1Decoder(decoder_);
        verifier = IVinceVerifier(verifier_);
    }

    function setGate(address gate_) external onlyOwner {
        require(gate_ != address(0), "gate");
        gate = gate_;
    }

    function inWindow() public view returns (bool) {
        return _window.pass && _window.validUntil >= block.timestamp;
    }

    function liveWindow() external view returns (LiveWindow memory) {
        return _window;
    }

    function evaluate(bytes32 txKey, bytes calldata encodedTransaction)
        external
        returns (uint8 decision, string[] memory reasons)
    {
        require(msg.sender == gate, "only gate");

        IVinceVerifier.VerifiedQuery memory q = verifier.queries(txKey);
        require(q.processed, "not verified");
        require(q.encodedHash == keccak256(encodedTransaction), "bytes mismatch");

        (bool decoded, address emitter, int256 answer, uint256 roundId, uint256 updatedAt) =
            _decodeAnswer(encodedTransaction);

        bytes32 marketKey;
        VinceRegistry.Market memory market;
        if (decoded) {
            emit ObservationNormalized(txKey, emitter, answer, roundId, updatedAt);
            (marketKey, market) = registry.findByAggregator(emitter);
        }

        string[] memory failed = new string[](5);
        uint256 n;
        if (!decoded) {
            failed[n++] = "REJECT_DECODE";
        } else if (marketKey == bytes32(0) || !market.listed) {
            failed[n++] = "REJECT_FEED";
        } else {
            if (market.paused) {
                failed[n++] = "REJECT_FEED_FROZEN";
            }
            if (market.sourceChainKey != q.chainKey) {
                failed[n++] = "REJECT_SOURCE_CHAIN";
            }
            if (updatedAt > block.timestamp || block.timestamp - updatedAt > market.maxAgeSeconds) {
                failed[n++] = "REJECT_STALE";
            }
            if (answer < market.minimumPrice) {
                failed[n++] = "REJECT_THRESHOLD";
            }
        }

        reasons = new string[](n);
        for (uint256 i; i < n; ++i) reasons[i] = failed[i];

        // ADR-017: verification already succeeded. Policy notes do not lock settlement.
        uint256 validUntil = block.timestamp + WINDOW_SECONDS;
        _window = LiveWindow({
            pass: true,
            marketId: marketKey,
            txKey: txKey,
            emitter: emitter,
            answer: answer,
            updatedAt: updatedAt,
            verifiedAt: block.timestamp,
            validUntil: validUntil
        });

        decision = DECISION_PASS;
        emit DecisionEmitted(txKey, decision, reasons, marketKey, emitter, answer, updatedAt, validUntil);
        emit GateCompleted(txKey, decision, validUntil);
    }

    function _decodeAnswer(bytes memory encoded)
        internal
        view
        returns (bool ok, address emitter, int256 answer, uint256 roundId, uint256 updatedAt)
    {
        IEvmV1Decoder.ReceiptFields memory receipt;
        try decoder.decodeReceiptFields(encoded) returns (IEvmV1Decoder.ReceiptFields memory parsed) {
            receipt = parsed;
        } catch {
            try this.decodeChunks(encoded) returns (IEvmV1Decoder.ReceiptFields memory parsed) {
                receipt = parsed;
            } catch {
                return (false, address(0), 0, 0, 0);
            }
        }

        IEvmV1Decoder.LogEntry[] memory logs;
        try decoder.getLogsByEventSignature(receipt, ANSWER_UPDATED) returns (IEvmV1Decoder.LogEntry[] memory found) {
            logs = found;
        } catch {
            logs = _filter(receipt.receiptLogs);
        }

        if (logs.length == 0) return (false, address(0), 0, 0, 0);
        IEvmV1Decoder.LogEntry memory log = logs[0];
        if (log.topics.length < 3 || log.data.length < 32) return (false, address(0), 0, 0, 0);

        emitter = log.address_;
        answer = int256(uint256(log.topics[1]));
        roundId = uint256(log.topics[2]);
        updatedAt = abi.decode(log.data, (uint256));
        ok = true;
    }

    function decodeChunks(bytes memory encoded) external view returns (IEvmV1Decoder.ReceiptFields memory) {
        (, bytes[] memory chunks) = abi.decode(encoded, (uint8, bytes[]));
        require(chunks.length > 0, "REJECT_DECODE");
        return decoder.decodeReceiptFields(chunks[chunks.length - 1]);
    }

    function _filter(IEvmV1Decoder.LogEntry[] memory logs)
        internal
        pure
        returns (IEvmV1Decoder.LogEntry[] memory matched)
    {
        uint256 n;
        for (uint256 i; i < logs.length; ++i) {
            if (logs[i].topics.length > 0 && logs[i].topics[0] == ANSWER_UPDATED) ++n;
        }
        matched = new IEvmV1Decoder.LogEntry[](n);
        uint256 w;
        for (uint256 i; i < logs.length; ++i) {
            if (logs[i].topics.length > 0 && logs[i].topics[0] == ANSWER_UPDATED) {
                matched[w++] = logs[i];
            }
        }
    }

}
