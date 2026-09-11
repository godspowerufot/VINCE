// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {INativeQueryVerifier} from "../interfaces/INativeQueryVerifier.sol";

contract MockVerifier is INativeQueryVerifier {
    bool public shouldPass = true;

    function setShouldPass(bool v) external {
        shouldPass = v;
    }

    function calculateTxIndex(INativeQueryVerifier.MerkleProof calldata merkleProof)
        external
        pure
        returns (uint64)
    {
        return uint64(uint256(merkleProof.root));
    }

    function verify(
        uint64,
        uint64,
        bytes calldata,
        INativeQueryVerifier.MerkleProof calldata,
        INativeQueryVerifier.ContinuityProof calldata
    ) external view returns (bool) {
        return shouldPass;
    }

    function verifyAndEmit(
        uint64 chainKey,
        uint64 height,
        bytes calldata,
        INativeQueryVerifier.MerkleProof calldata merkleProof,
        INativeQueryVerifier.ContinuityProof calldata
    ) external returns (bool) {
        if (!shouldPass) return false;
        emit TransactionVerified(chainKey, height, uint64(uint256(merkleProof.root)));
        return true;
    }
}
