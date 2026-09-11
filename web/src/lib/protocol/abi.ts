export const GATE_ABI = [
  "function submitSourceTransaction(tuple(uint64 chainKey,uint64 blockHeight,bytes encodedTransaction,tuple(bytes32 root,tuple(bytes32 hash,bool isLeft)[] siblings) merkleProof,tuple(bytes32 lowerEndpointDigest,bytes32[] roots) continuityProof) proof) returns (uint8 decision,string[] reasons)",
  "function inWindow() view returns (bool)",
] as const;

export const ENGINE_ABI = [
  "function inWindow() view returns (bool)",
  "function liveWindow() view returns (tuple(bool pass,bytes32 marketId,bytes32 txKey,address emitter,int256 answer,uint256 updatedAt,uint256 verifiedAt,uint256 validUntil))",
  "function WINDOW_SECONDS() view returns (uint256)",
  "event DecisionEmitted(bytes32 indexed txKey,uint8 decision,string[] reasons,bytes32 marketId,address emitter,int256 answer,uint256 updatedAt,uint256 validUntil)",
] as const;

export const REGISTRY_ABI = [
  "function owner() view returns (address)",
  "function listedMarkets() view returns (tuple(bool listed,bool paused,uint8 kind,uint64 sourceChainKey,uint64 sourceChainId,address feedAggregator,address asset,address pool,int256 minimumPrice,uint32 maxAgeSeconds,uint8 decimals,string id,string displayName)[])",
  "function getMarket(bytes32 key) view returns (tuple(bool listed,bool paused,uint8 kind,uint64 sourceChainKey,uint64 sourceChainId,address feedAggregator,address asset,address pool,int256 minimumPrice,uint32 maxAgeSeconds,uint8 decimals,string id,string displayName))",
  "function findByAggregator(address feedAggregator) view returns (bytes32 key, tuple(bool listed,bool paused,uint8 kind,uint64 sourceChainKey,uint64 sourceChainId,address feedAggregator,address asset,address pool,int256 minimumPrice,uint32 maxAgeSeconds,uint8 decimals,string id,string displayName) market)",
  "function listMarket(string id,uint64 sourceChainKey,uint64 sourceChainId,address feedAggregator,int256 minimumPrice,uint32 maxAgeSeconds,string displayName)",
  "function unlistMarket(string id)",
  "function pauseMarket(string id,bool paused)",
  "function setMinimumPrice(string id,int256 minimumPrice)",
] as const;

export const DESK_ABI = [
  "function engine() view returns (address)",
  "function releaseFinancing()",
  "event FinancingReleased(address indexed desk,bytes32 indexed txKey,address emitter,int256 answer,uint256 validUntil)",
] as const;
