// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IVinceEngine} from "./interfaces/IVinceEngine.sol";

/// @title VinceVault
/// @notice Consumes the PASS window. Does not verify proofs or accept a price.
contract VinceVault {
    using SafeERC20 for IERC20;

    uint256 public constant LTV_BPS = 5000;
    uint256 public constant BPS_DENOM = 10_000;

    IVinceEngine public immutable engine;
    IERC20 public immutable vusd;

    mapping(address => uint256) public collateral;
    mapping(address => uint256) public debt;

    event VaultActionExecuted(
        address indexed user,
        string action,
        uint256 amount,
        uint256 collateralAfter,
        uint256 debtAfter,
        uint256 borrowLimit
    );

    constructor(address engine_, address vusd_) {
        require(engine_ != address(0) && vusd_ != address(0), "addrs");
        engine = IVinceEngine(engine_);
        vusd = IERC20(vusd_);
    }

    function inWindow() public view returns (bool) {
        return engine.inWindow();
    }

    function borrowLimitOf(address user) public view returns (uint256) {
        if (!engine.inWindow()) return 0;
        return (collateral[user] * LTV_BPS) / BPS_DENOM;
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "amount");
        vusd.safeTransferFrom(msg.sender, address(this), amount);
        collateral[msg.sender] += amount;
        emit VaultActionExecuted(
            msg.sender,
            "deposit",
            amount,
            collateral[msg.sender],
            debt[msg.sender],
            borrowLimitOf(msg.sender)
        );
    }

    function withdraw(uint256 amount) external {
        require(amount > 0 && collateral[msg.sender] >= amount, "amount");
        uint256 remaining = collateral[msg.sender] - amount;
        require(debt[msg.sender] <= _limit(remaining), "LTV");
        collateral[msg.sender] = remaining;
        vusd.safeTransfer(msg.sender, amount);
        emit VaultActionExecuted(
            msg.sender,
            "withdraw",
            amount,
            collateral[msg.sender],
            debt[msg.sender],
            borrowLimitOf(msg.sender)
        );
    }

    function requestBorrow(uint256 amount) external {
        require(amount > 0, "amount");
        require(engine.inWindow(), "NO_WINDOW");
        uint256 limit = borrowLimitOf(msg.sender);
        require(debt[msg.sender] + amount <= limit, "LTV");
        debt[msg.sender] += amount;
        vusd.safeTransfer(msg.sender, amount);
        emit VaultActionExecuted(
            msg.sender,
            "borrow",
            amount,
            collateral[msg.sender],
            debt[msg.sender],
            limit
        );
    }

    function repay(uint256 amount) external {
        require(amount > 0, "amount");
        uint256 owed = debt[msg.sender];
        require(owed > 0, "no debt");
        uint256 pay = amount > owed ? owed : amount;
        vusd.safeTransferFrom(msg.sender, address(this), pay);
        debt[msg.sender] = owed - pay;
        emit VaultActionExecuted(
            msg.sender,
            "repay",
            pay,
            collateral[msg.sender],
            debt[msg.sender],
            borrowLimitOf(msg.sender)
        );
    }

    function _limit(uint256 collat) internal view returns (uint256) {
        if (!engine.inWindow()) return 0;
        return (collat * LTV_BPS) / BPS_DENOM;
    }
}
