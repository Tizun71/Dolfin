import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts";
import {
  AccountCreated,
} from "../generated/DolfinAccountFactory/DolfinAccountFactory";
import {
  SessionKeyRegistered,
  SessionKeyRevoked,
  SessionKeyRotated,
  ActionExecuted,
} from "../generated/templates/DolfinSmartAccount/DolfinSmartAccount";
import {
  PolicySet,
} from "../generated/PolicyManager/PolicyManager";
import { DolfinSmartAccount } from "../generated/templates";
import {
  SmartAccount,
  SessionKey,
  Action,
  PolicySnapshot,
} from "../generated/schema";

export function handleAccountCreated(event: AccountCreated): void {
  let accountAddress = event.params.account.toHex();
  let smartAccount = SmartAccount.load(accountAddress);

  if (!smartAccount) {
    smartAccount = new SmartAccount(accountAddress);
    smartAccount.owner = event.params.owner;
    smartAccount.address = event.params.account;
    smartAccount.salt = event.params.salt;
    smartAccount.createdAt = event.block.timestamp;
    smartAccount.txHash = event.transaction.hash;
    smartAccount.save();
  }

  DolfinSmartAccount.create(event.params.account);
}

export function handleSessionKeyRegistered(event: SessionKeyRegistered): void {
  let accountAddress = event.address.toHex();
  let sessionKeyAddress = event.params.sessionKey.toHex();
  let id = accountAddress + "-" + sessionKeyAddress;

  let sessionKey = new SessionKey(id);
  sessionKey.smartAccount = accountAddress;
  sessionKey.sessionKey = event.params.sessionKey;
  sessionKey.validUntil = event.params.validUntil;
  sessionKey.revoked = false;
  sessionKey.exists = true;
  sessionKey.registeredAt = event.block.timestamp;
  sessionKey.revokedAt = null;
  sessionKey.txHash = event.transaction.hash;
  sessionKey.save();
}

export function handleSessionKeyRevoked(event: SessionKeyRevoked): void {
  let accountAddress = event.address.toHex();
  let sessionKeyAddress = event.params.sessionKey.toHex();
  let id = accountAddress + "-" + sessionKeyAddress;

  let sessionKey = SessionKey.load(id);
  if (sessionKey) {
    sessionKey.revoked = true;
    sessionKey.revokedAt = event.block.timestamp;
    sessionKey.save();
  }
}

export function handleSessionKeyRotated(event: SessionKeyRotated): void {
  let accountAddress = event.address.toHex();

  let oldKeyId = accountAddress + "-" + event.params.oldKey.toHex();
  let oldKey = SessionKey.load(oldKeyId);
  if (oldKey) {
    oldKey.revoked = true;
    oldKey.exists = false;
    oldKey.revokedAt = event.block.timestamp;
    oldKey.save();
  }

  let newKeyId = accountAddress + "-" + event.params.newKey.toHex();
  let newKey = new SessionKey(newKeyId);
  newKey.smartAccount = accountAddress;
  newKey.sessionKey = event.params.newKey;
  newKey.validUntil = event.params.validUntil;
  newKey.revoked = false;
  newKey.exists = true;
  newKey.registeredAt = event.block.timestamp;
  newKey.revokedAt = null;
  newKey.txHash = event.transaction.hash;
  newKey.save();
}

export function handleActionExecuted(event: ActionExecuted): void {
  let accountAddress = event.address.toHex();
  let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();

  let action = new Action(id);
  action.smartAccount = accountAddress;
  action.sessionKey = event.params.sessionKey;
  action.adapter = event.params.adapter;
  action.actionType = event.params.actionType;
  action.timestamp = event.block.timestamp;
  action.blockNumber = event.block.number;
  action.txHash = event.transaction.hash;
  action.save();
}

export function handlePolicySet(event: PolicySet): void {
  let accountAddress = event.params.account.toHex();
  let sessionKeyAddress = event.params.sessionKey.toHex();
  let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();

  let policy = event.params.policy;

  let snapshot = new PolicySnapshot(id);
  snapshot.smartAccount = accountAddress;
  snapshot.sessionKey = event.params.sessionKey;
  snapshot.expiry = policy.expiry;
  snapshot.maxTradePerTx = policy.maxTradePerTx;
  snapshot.maxDailyVolume = policy.maxDailyVolume;
  snapshot.maxExposure = policy.maxExposure;
  snapshot.maxLossPerDay = policy.maxLossPerDay;
  snapshot.maxDrawdownBps = policy.maxDrawdownBps;
  snapshot.maxLeverageBps = policy.maxLeverageBps;
  snapshot.paused = policy.paused;
  snapshot.timestamp = event.block.timestamp;
  snapshot.txHash = event.transaction.hash;
  snapshot.save();
}
