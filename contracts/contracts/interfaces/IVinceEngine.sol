// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IVinceEngine {
    struct LiveWindow {
        bool pass;
        bytes32 marketId;
        bytes32 txKey;
        address emitter;
        int256 answer;
        uint256 updatedAt;
        uint256 verifiedAt;
        uint256 validUntil;
    }

    function WINDOW_SECONDS() external view returns (uint256);

    function inWindow() external view returns (bool);

    function liveWindow() external view returns (LiveWindow memory);

    function evaluate(bytes32 txKey, bytes calldata encodedTransaction)
        external
        returns (uint8 decision, string[] memory reasons);
}
