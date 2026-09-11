export const GATE_ABI = [
  "function submitAttestedFeedUpdate(bytes32 sourceTxHash,uint64 chainKey,address emitter,int256 answer,uint256 updatedAt,bytes32 merkleRoot,bytes32 continuityDigest) returns (uint8 decision,string[] reasons)",
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

export const VAULT_ABI = [
  "function vusd() view returns (address)",
  "function engine() view returns (address)",
  "function collateral(address) view returns (uint256)",
  "function debt(address) view returns (uint256)",
  "function inWindow() view returns (bool)",
  "function borrowLimitOf(address) view returns (uint256)",
  "function deposit(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function requestBorrow(uint256 amount)",
  "function repay(uint256 amount)",
  "event VaultActionExecuted(address indexed user,string action,uint256 amount,uint256 collateralAfter,uint256 debtAfter,uint256 borrowLimit)",
] as const;

export const VUSD_ABI = [
  "function faucet()",
  "function claimed(address) view returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
] as const;
