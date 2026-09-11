// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockVUSD
/// @notice Hackathon dummy dollars on Creditcoin. 18 decimals. Not USDC.
contract MockVUSD is ERC20, Ownable {
    uint256 public constant FAUCET_AMOUNT = 1_000 ether;
    mapping(address => bool) public claimed;

    constructor() ERC20("VINCE USD", "vUSD") Ownable(msg.sender) {}

    function decimals() public pure override returns (uint8) {
        return 18;
    }

    function faucet() external {
        require(!claimed[msg.sender], "claimed");
        claimed[msg.sender] = true;
        _mint(msg.sender, FAUCET_AMOUNT);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
