// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IVinceEngine} from "./interfaces/IVinceEngine.sol";

/// @title VinceDesk
/// @notice Hackathon consumer of a PASS window. Not a money market.
/// A Creditcoin app would call the same shape after Attestcoin + policy PASS.
contract VinceDesk {
    IVinceEngine public immutable engine;

    event FinancingReleased(
        address indexed desk,
        bytes32 indexed txKey,
        address emitter,
        int256 answer,
        uint256 validUntil
    );

    constructor(address engine_) {
        require(engine_ != address(0), "engine");
        engine = IVinceEngine(engine_);
    }

    function releaseFinancing() external {
        require(engine.inWindow(), "NO_PASS");
        IVinceEngine.LiveWindow memory window = engine.liveWindow();
        emit FinancingReleased(
            msg.sender,
            window.txKey,
            window.emitter,
            window.answer,
            window.validUntil
        );
    }
}
