// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {INativeQueryVerifier} from "./interfaces/INativeQueryVerifier.sol";
import {IVinceEngine} from "./interfaces/IVinceEngine.sol";
import {IVinceVerifier} from "./interfaces/IVinceVerifier.sol";

/// @title VinceGate
/// @notice User-facing MVP: paste-proven source tx → verify → decide. Vault is a client of the window.
contract VinceGate {
    IVinceVerifier public immutable verifier;
    IVinceEngine public immutable engine;

    struct SourceProof {
        uint64 chainKey;
        uint64 blockHeight;
        bytes encodedTransaction;
        INativeQueryVerifier.MerkleProof merkleProof;
        INativeQueryVerifier.ContinuityProof continuityProof;
    }

    constructor(address verifier_, address engine_) {
        require(verifier_ != address(0) && engine_ != address(0), "addrs");
        verifier = IVinceVerifier(verifier_);
        engine = IVinceEngine(engine_);
    }

    function submitSourceTransaction(SourceProof calldata proof)
        external
        returns (uint8 decision, string[] memory reasons)
    {
        bytes32 txKey = verifier.verifySourceTransaction(
            proof.chainKey,
            proof.blockHeight,
            proof.encodedTransaction,
            proof.merkleProof,
            proof.continuityProof
        );
        return engine.evaluate(txKey, proof.encodedTransaction);
    }
}
