// Minimal ABI fragments — only the functions the frontend calls.
// Source: packages/smart_contract/artifacts/contracts/dolfin/*.

export const FACTORY_ABI = [
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "salt", type: "uint256" },
    ],
    name: "getAddress",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "salt", type: "uint256" },
    ],
    name: "createAccount",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// IPolicyManager.Policy tuple, shared by configureSession + getPolicy.
const POLICY_COMPONENTS = [
  { name: "expiry", type: "uint48" },
  { name: "maxTradePerTx", type: "uint128" },
  { name: "maxDailyVolume", type: "uint128" },
  { name: "maxExposure", type: "uint128" },
  { name: "maxLossPerDay", type: "uint128" },
  { name: "maxDrawdownBps", type: "uint16" },
  { name: "maxLeverageBps", type: "uint16" },
  { name: "exists", type: "bool" },
  { name: "paused", type: "bool" },
] as const;

export const ACCOUNT_ABI = [
  {
    inputs: [
      { name: "key", type: "address" },
      { name: "validUntil", type: "uint48" },
      { name: "policy", type: "tuple", components: POLICY_COMPONENTS },
      { name: "adapters", type: "address[]" },
      { name: "tokens", type: "address[]" },
      {
        name: "protocolGrants",
        type: "tuple[]",
        components: [
          { name: "protocol", type: "address" },
          { name: "actionMask", type: "uint256" },
        ],
      },
    ],
    name: "configureSession",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [], name: "pauseAgent", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "resumeAgent", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [{ name: "key", type: "address" }],
    name: "revokeSessionKey",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "oldKey", type: "address" },
      { name: "newKey", type: "address" },
      { name: "validUntil", type: "uint48" },
    ],
    name: "rotateSessionKey",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "accountPaused",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "sessionKeys",
    outputs: [
      { name: "validUntil", type: "uint48" },
      { name: "revoked", type: "bool" },
      { name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const POLICY_MANAGER_ABI = [
  {
    inputs: [
      { name: "account", type: "address" },
      { name: "sessionKey", type: "address" },
    ],
    name: "getPolicy",
    outputs: [{ name: "", type: "tuple", components: POLICY_COMPONENTS }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "account", type: "address" },
      { name: "sessionKey", type: "address" },
    ],
    name: "exposure",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "account", type: "address" },
      { name: "sessionKey", type: "address" },
    ],
    name: "dayVolume",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "account", type: "address" },
      { name: "sessionKey", type: "address" },
    ],
    name: "isBroken",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
