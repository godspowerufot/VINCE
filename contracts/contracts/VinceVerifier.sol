// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IEvmV1Decoder} from "./interfaces/IEvmV1Decoder.sol";
import {INativeQueryVerifier} from "./interfaces/INativeQueryVerifier.sol";
import {IVinceVerifier} from "./interfaces/IVinceVerifier.sol";

/// @title VinceVerifier
/// @notice ASC adapter: Attestcoin inclusion proof + receipt success. Does not compute a price.
contract VinceVerifier is IVinceVerifier {
    INativeQueryVerifier public immutable prover;
    IEvmV1Decoder public immutable decoder;

    mapping(bytes32 => VerifiedQuery) private _queries;

    event SourceTransactionVerified(
        bytes32 indexed txKey,
        uint64 indexed chainKey,
        uint64 blockHeight,
        uint64 txIndex
    );

    constructor(address prover_, address decoder_) {
        require(prover_ != address(0) && decoder_ != address(0), "addrs");
        prover = INativeQueryVerifier(prover_);
        decoder = IEvmV1Decoder(decoder_);
    }

    function queries(bytes32 txKey) external view returns (VerifiedQuery memory) {
        return _queries[txKey];
    }

    function verifySourceTransaction(
        uint64 chainKey,
        uint64 blockHeight,
        bytes calldata encodedTransaction,
        INativeQueryVerifier.MerkleProof calldata merkleProof,
        INativeQueryVerifier.ContinuityProof calldata continuityProof
    ) external returns (bytes32 txKey) {
        bool ok = prover.verifyAndEmit(
            chainKey,
            blockHeight,
            encodedTransaction,
            merkleProof,
            continuityProof
        );
        require(ok, "PROOF_FAILED");

        uint64 txIndex = prover.calculateTxIndex(merkleProof);
        txKey = keccak256(abi.encode(chainKey, blockHeight, txIndex));
        require(!_queries[txKey].processed, "REPLAY");

        IEvmV1Decoder.ReceiptFields memory receipt = _receipt(encodedTransaction);
        require(receipt.receiptStatus == 1, "REJECT_STATUS");

        _queries[txKey] = VerifiedQuery({
            processed: true,
            chainKey: chainKey,
            blockHeight: blockHeight,
            txIndex: txIndex,
            encodedHash: keccak256(encodedTransaction)
        });

        emit SourceTransactionVerified(txKey, chainKey, blockHeight, txIndex);
    }

    function _receipt(bytes memory encoded) internal view returns (IEvmV1Decoder.ReceiptFields memory) {
        try decoder.decodeReceiptFields(encoded) returns (IEvmV1Decoder.ReceiptFields memory parsed) {
            return parsed;
        } catch {
            (, bytes[] memory chunks) = abi.decode(encoded, (uint8, bytes[]));
            require(chunks.length > 0, "REJECT_DECODE");
            return decoder.decodeReceiptFields(chunks[chunks.length - 1]);
        }
    }
}
