// Client-side registry: Owner › Accounts › Sessions. Persisted to localStorage so the page can
// list accounts/agents and the relayer can sign with each scoped session key. Session keys are
// policy-capped and revocable on-chain, so localStorage exposure is bounded (not the owner key).
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { type Address, type Hex } from "viem";
import { type PolicySettings } from "@/constants/dolfin";

const STORAGE_KEY = "dolfin_accounts";

export interface StoredSession {
  key: Address;
  privateKey: Hex;
  settings: PolicySettings;
  createdAt: number;
}

export interface StoredAccount {
  salt: number;
  address: Address;
  sessions: StoredSession[];
}

type Store = Record<string, StoredAccount[]>; // owner (lowercase) -> accounts

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

export function listAccounts(owner: Address): StoredAccount[] {
  return readStore()[owner.toLowerCase()] ?? [];
}

export function getAccount(owner: Address, address: Address): StoredAccount | null {
  return listAccounts(owner).find((a) => a.address.toLowerCase() === address.toLowerCase()) ?? null;
}

// Next salt = current account count (0-based), keeping addresses unique per owner.
export function nextSalt(owner: Address): number {
  return listAccounts(owner).length;
}

export function addAccount(owner: Address, salt: number, address: Address): void {
  const store = readStore();
  const key = owner.toLowerCase();
  const accounts = store[key] ?? [];
  if (!accounts.some((a) => a.address.toLowerCase() === address.toLowerCase())) {
    accounts.push({ salt, address, sessions: [] });
    store[key] = accounts;
    writeStore(store);
  }
}

function mutateAccount(owner: Address, address: Address, fn: (a: StoredAccount) => void): void {
  const store = readStore();
  const accounts = store[owner.toLowerCase()] ?? [];
  const acct = accounts.find((a) => a.address.toLowerCase() === address.toLowerCase());
  if (!acct) return;
  fn(acct);
  store[owner.toLowerCase()] = accounts;
  writeStore(store);
}

export function addSession(owner: Address, address: Address, session: StoredSession): void {
  mutateAccount(owner, address, (a) => a.sessions.push(session));
}

// Rotate: drop the old key entry, append the new one.
export function replaceSession(owner: Address, address: Address, oldKey: Address, session: StoredSession): void {
  mutateAccount(owner, address, (a) => {
    a.sessions = a.sessions.filter((s) => s.key.toLowerCase() !== oldKey.toLowerCase());
    a.sessions.push(session);
  });
}

export function getSession(owner: Address, address: Address, key: Address): StoredSession | null {
  return getAccount(owner, address)?.sessions.find((s) => s.key.toLowerCase() === key.toLowerCase()) ?? null;
}

// Generate a fresh random session keypair (not persisted until addSession/replaceSession).
export function newSession(settings: PolicySettings): StoredSession {
  const privateKey = generatePrivateKey();
  return { key: privateKeyToAccount(privateKey).address, privateKey, settings, createdAt: Date.now() };
}
