// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IVinceEngine} from "./interfaces/IVinceEngine.sol";
import {VinceRegistry} from "./VinceRegistry.sol";

/// @title VincePolicy
/// @notice Sepolia policy lab (ADR-012). Does not call Attestcoin 0x0FD2.
/// UI must require verifySingle before submitting.
contract VincePolicy is IVinceEngine, Ownable {
    uint8 public constant DECISION_PASS = 1;
    uint8 public constant DECISION_REJECT = 2;
    uint256 public constant WINDOW_SECONDS = 1_800;

    VinceRegistry public immutable registry;
    mapping(bytes32 => bool) public processedSourceTx;

    LiveWindow private _window;

    event ObservationNormalized(
        bytes32 indexed txKey,
        address indexed emitter,
        int256 answer,
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

    constructor(address registry_) Ownable(msg.sender) {
        require(registry_ != address(0), "registry");
        registry = VinceRegistry(registry_);
    }

    function inWindow() public view returns (bool) {
        return _window.pass && _window.validUntil >= block.timestamp;
    }

    function liveWindow() external view returns (LiveWindow memory) {
        return _window;
    }

    function evaluate(bytes32, bytes calldata) external pure returns (uint8, string[] memory) {
        revert("use submitAttestedFeedUpdate");
    }

    function submitAttestedFeedUpdate(
        bytes32 sourceTxHash,
        uint64 chainKey,
        address emitter,
        int256 answer,
        uint256 updatedAt,
        bytes32 merkleRoot,
        bytes32 continuityDigest
    ) external returns (uint8 decision, string[] memory reasons) {
        require(sourceTxHash != bytes32(0), "tx");
        require(merkleRoot != bytes32(0) && continuityDigest != bytes32(0), "PROOF_REQUIRED");
        require(emitter != address(0), "emitter");
        require(!processedSourceTx[sourceTxHash], "REPLAY");
        processedSourceTx[sourceTxHash] = true;

        bytes32 txKey = sourceTxHash;
        emit ObservationNormalized(txKey, emitter, answer, updatedAt);

        (bytes32 marketKey, VinceRegistry.Market memory market) = registry.findByAggregator(emitter);
        string[] memory failed = new string[](4);
        uint256 n;

        if (marketKey == bytes32(0) || !market.listed) {
            failed[n++] = "REJECT_FEED";
        } else {
            if (market.paused) failed[n++] = "REJECT_FEED_FROZEN";
            if (market.sourceChainKey != chainKey) failed[n++] = "REJECT_SOURCE_CHAIN";
            if (updatedAt > block.timestamp || block.timestamp - updatedAt > market.maxAgeSeconds) {
                failed[n++] = "REJECT_STALE";
            }
            if (answer < market.minimumPrice) failed[n++] = "REJECT_THRESHOLD";
        }

        if (n > 0) {
            string[] memory trimmed = new string[](n);
            for (uint256 i; i < n; ++i) trimmed[i] = failed[i];
            return _reject(txKey, trimmed, marketKey, emitter, answer, updatedAt);
        }

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
        reasons = new string[](0);
        decision = DECISION_PASS;
        emit DecisionEmitted(txKey, decision, reasons, marketKey, emitter, answer, updatedAt, validUntil);
        emit GateCompleted(txKey, decision, validUntil);
    }

    function _reject(
        bytes32 txKey,
        string[] memory reasons,
        bytes32 marketId,
        address emitter,
        int256 answer,
        uint256 updatedAt
    ) internal returns (uint8 decision, string[] memory) {
        decision = DECISION_REJECT;
        emit DecisionEmitted(txKey, decision, reasons, marketId, emitter, answer, updatedAt, 0);
        emit GateCompleted(txKey, decision, 0);
        return (decision, reasons);
    }
}
