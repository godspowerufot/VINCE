// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Attestcoin EvmV1Decoder. VINCE does not copy decoder bytecode.
/// CC3 Testnet: 0x731c345d79Fb8BbDC541f9DF3b6317585F849F9f
interface IEvmV1Decoder {
    struct LogEntry {
        address address_;
        bytes32[] topics;
        bytes data;
    }

    struct ReceiptFields {
        uint8 receiptStatus;
        uint64 receiptGasUsed;
        LogEntry[] receiptLogs;
        bytes receiptLogsBloom;
    }

    function getTransactionType(bytes calldata encodedTx) external pure returns (uint8 txType);

    function isValidTransactionType(uint8 txType) external pure returns (bool);

    function decodeReceiptFields(bytes calldata chunk) external view returns (ReceiptFields memory);

    function getLogsByEventSignature(
        ReceiptFields calldata receipt,
        bytes32 eventSignature
    ) external pure returns (LogEntry[] memory);
}
