// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title VinceRegistry
/// @notice Owner-gated list of allowed source-chain feeds. Proof never auto-lists (ADR-011).
/// Identity is feedAggregator (log emitter), never ticker.
contract VinceRegistry is Ownable {
    enum Kind {
        ReferenceFeed,
        B20Market
    }

    struct Market {
        bool listed;
        bool paused;
        Kind kind;
        uint64 sourceChainKey;
        uint64 sourceChainId;
        address feedAggregator;
        address asset;
        address pool;
        int256 minimumPrice;
        uint32 maxAgeSeconds;
        uint8 decimals;
        string id;
        string displayName;
    }

    mapping(bytes32 => Market) private _markets;
    mapping(address => bytes32) public marketIdByAggregator;
    bytes32[] private _ids;

    event RegistryUpdated(
        bytes32 indexed marketKey,
        string id,
        address indexed feedAggregator,
        int256 minimumPrice,
        bool listed,
        bool paused
    );

    constructor() Ownable(msg.sender) {}

    function marketKey(string memory id) public pure returns (bytes32) {
        return keccak256(bytes(id));
    }

    function listMarket(
        string calldata id,
        uint64 sourceChainKey,
        uint64 sourceChainId,
        address feedAggregator,
        int256 minimumPrice,
        uint32 maxAgeSeconds,
        string calldata displayName
    ) external onlyOwner {
        require(bytes(id).length > 0, "id");
        require(feedAggregator != address(0), "aggregator");
        require(minimumPrice > 0, "floor");
        require(maxAgeSeconds > 0, "maxAge");
        require(sourceChainKey != 0, "chainKey");

        bytes32 key = marketKey(id);
        bytes32 existing = marketIdByAggregator[feedAggregator];
        require(existing == bytes32(0) || existing == key, "aggregator taken");

        Market storage row = _markets[key];
        if (!row.listed) {
            _ids.push(key);
        } else if (row.feedAggregator != feedAggregator && row.feedAggregator != address(0)) {
            delete marketIdByAggregator[row.feedAggregator];
        }

        row.listed = true;
        row.paused = false;
        row.kind = Kind.ReferenceFeed;
        row.sourceChainKey = sourceChainKey;
        row.sourceChainId = sourceChainId;
        row.feedAggregator = feedAggregator;
        row.asset = address(0);
        row.pool = address(0);
        row.minimumPrice = minimumPrice;
        row.maxAgeSeconds = maxAgeSeconds;
        row.decimals = 8;
        row.id = id;
        row.displayName = displayName;
        marketIdByAggregator[feedAggregator] = key;

        emit RegistryUpdated(key, id, feedAggregator, minimumPrice, true, false);
    }

    function unlistMarket(string calldata id) external onlyOwner {
        bytes32 key = marketKey(id);
        Market storage row = _markets[key];
        require(row.listed, "not listed");
        address agg = row.feedAggregator;
        row.listed = false;
        row.paused = true;
        if (agg != address(0) && marketIdByAggregator[agg] == key) {
            delete marketIdByAggregator[agg];
        }
        emit RegistryUpdated(key, id, agg, row.minimumPrice, false, true);
    }

    function pauseMarket(string calldata id, bool paused) external onlyOwner {
        bytes32 key = marketKey(id);
        Market storage row = _markets[key];
        require(row.listed, "not listed");
        row.paused = paused;
        emit RegistryUpdated(key, id, row.feedAggregator, row.minimumPrice, true, paused);
    }

    function setMinimumPrice(string calldata id, int256 minimumPrice) external onlyOwner {
        require(minimumPrice > 0, "floor");
        bytes32 key = marketKey(id);
        Market storage row = _markets[key];
        require(row.listed, "not listed");
        row.minimumPrice = minimumPrice;
        emit RegistryUpdated(key, id, row.feedAggregator, minimumPrice, true, row.paused);
    }

    function getMarket(bytes32 key) external view returns (Market memory) {
        return _markets[key];
    }

    function getMarketById(string calldata id) external view returns (Market memory) {
        return _markets[marketKey(id)];
    }

    function findByAggregator(address feedAggregator) external view returns (bytes32 key, Market memory market) {
        key = marketIdByAggregator[feedAggregator];
        market = _markets[key];
    }

    function marketCount() external view returns (uint256) {
        return _ids.length;
    }

    function marketIdAt(uint256 index) external view returns (bytes32) {
        return _ids[index];
    }

    function listedMarkets() external view returns (Market[] memory rows) {
        uint256 n;
        for (uint256 i; i < _ids.length; ++i) {
            if (_markets[_ids[i]].listed) ++n;
        }
        rows = new Market[](n);
        uint256 w;
        for (uint256 i; i < _ids.length; ++i) {
            Market storage row = _markets[_ids[i]];
            if (row.listed) {
                rows[w++] = row;
            }
        }
    }
}
