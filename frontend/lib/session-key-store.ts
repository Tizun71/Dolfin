// Client-side session-key store. The AI session key is generated in the browser and persisted
// to localStorage so the relayer/agent can sign scoped trade UserOps with it. This is NOT the
// owner key — it is policy-capped and revocable on-chain, so localStorage exposure is bounded.
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { type Address, type Hex } from "viem";
import { type PolicySettings } from "@/constants/dolfin";

const STORAGE_KEY = "dolfin_session_keys";

export interface StoredSession {
  privateKey: Hex;
  address: Address;
  settings: PolicySettings; // retained so the key can be re-granted on rotate/register
}

type Store = Record<string, StoredSession>; // owner address (lowercase) -> session

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Store;
  } catch {
    return {};
  }
}

function writeStore(store: Store): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function loadSession(owner: Address): StoredSession | null {
  return readStore()[owner.toLowerCase()] ?? null;
}

export function saveSession(owner: Address, session: StoredSession): void {
  const store = readStore();
  store[owner.toLowerCase()] = session;
  writeStore(store);
}

export function clearSession(owner: Address): void {
  const store = readStore();
  delete store[owner.toLowerCase()];
  writeStore(store);
}

// Generate a fresh random session keypair (not persisted until saveSession).
export function generateSessionKey(settings: PolicySettings): StoredSession {
  const privateKey = generatePrivateKey();
  return { privateKey, address: privateKeyToAccount(privateKey).address, settings };
}
