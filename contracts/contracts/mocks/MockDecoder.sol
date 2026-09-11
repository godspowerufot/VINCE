// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IEvmV1Decoder} from "../interfaces/IEvmV1Decoder.sol";

contract MockDecoder is IEvmV1Decoder {
    bytes32 public constant ANSWER_UPDATED =
        0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f;

    ReceiptFields private _receipt;
    bool private _has;

    function setAnswerUpdated(
        address emitter,
        int256 answer,
        uint256 roundId,
        uint256 updatedAt,
        uint8 status
    ) external {
        bytes32[] memory topics = new bytes32[](3);
        topics[0] = ANSWER_UPDATED;
        topics[1] = bytes32(uint256(answer));
        topics[2] = bytes32(roundId);
        LogEntry[] memory logs = new LogEntry[](1);
        logs[0] = LogEntry({address_: emitter, topics: topics, data: abi.encode(updatedAt)});
        _receipt = ReceiptFields({
            receiptStatus: status,
            receiptGasUsed: 21_000,
            receiptLogs: logs,
            receiptLogsBloom: hex"00"
        });
        _has = true;
    }

    function setReceipt(ReceiptFields calldata receipt) external {
        _receipt = receipt;
        _has = true;
    }

    function getTransactionType(bytes calldata) external pure returns (uint8) {
        return 2;
    }

    function isValidTransactionType(uint8 txType) external pure returns (bool) {
        return txType <= 4;
    }

    function decodeReceiptFields(bytes calldata) external view returns (ReceiptFields memory) {
        require(_has, "no receipt");
        return _receipt;
    }

    function getLogsByEventSignature(
        ReceiptFields calldata receipt,
        bytes32 eventSignature
    ) external pure returns (LogEntry[] memory matched) {
        uint256 n;
        for (uint256 i; i < receipt.receiptLogs.length; ++i) {
            if (receipt.receiptLogs[i].topics.length > 0 && receipt.receiptLogs[i].topics[0] == eventSignature) {
                ++n;
            }
        }
        matched = new LogEntry[](n);
        uint256 w;
        for (uint256 i; i < receipt.receiptLogs.length; ++i) {
            if (receipt.receiptLogs[i].topics.length > 0 && receipt.receiptLogs[i].topics[0] == eventSignature) {
                matched[w++] = receipt.receiptLogs[i];
            }
        }
    }
}
