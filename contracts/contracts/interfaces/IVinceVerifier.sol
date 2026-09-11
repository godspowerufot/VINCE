// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {INativeQueryVerifier} from "./INativeQueryVerifier.sol";

interface IVinceVerifier {
    struct VerifiedQuery {
        bool processed;
        uint64 chainKey;
        uint64 blockHeight;
        uint64 txIndex;
        bytes32 encodedHash;
    }

    function queries(bytes32 txKey) external view returns (VerifiedQuery memory);

    function verifySourceTransaction(
        uint64 chainKey,
        uint64 blockHeight,
        bytes calldata encodedTransaction,
        INativeQueryVerifier.MerkleProof calldata merkleProof,
        INativeQueryVerifier.ContinuityProof calldata continuityProof
    ) external returns (bytes32 txKey);
}
