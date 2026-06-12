import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

// Encrypt the per-user session private key at rest with AES-256-GCM, key derived from
// SESSION_KEY_ENC_SECRET. A plaintext column would compromise every agent account.
// Stored format: enc:v1:<iv_b64>:<tag_b64>:<ciphertext_b64>; the prefix keeps
// decryptSessionKey compatible with legacy plaintext rows.

const PREFIX = "enc:v1:";

function encKey(): Buffer {
  const secret = process.env.SESSION_KEY_ENC_SECRET;
  if (!secret) {
    throw new Error("missing env: SESSION_KEY_ENC_SECRET (32+ char secret for session-key encryption)");
  }
  // Derive a fixed 32-byte key from the secret (sha256). Secret itself can be any length.
  return createHash("sha256").update(secret, "utf8").digest();
}

export function encryptSessionKey(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${ct.toString("base64")}`;
}

// Decrypt a stored session key. Legacy unprefixed rows are returned as-is until rotated.
export function decryptSessionKey(stored: string): string {
  if (!stored.startsWith(PREFIX)) return stored; // legacy plaintext
  const [ivB64, tagB64, ctB64] = stored.slice(PREFIX.length).split(":");
  if (!ivB64 || !tagB64 || !ctB64) {
    throw new Error("malformed encrypted session key envelope");
  }
  const decipher = createDecipheriv("aes-256-gcm", encKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const pt = Buffer.concat([decipher.update(Buffer.from(ctB64, "base64")), decipher.final()]);
  return pt.toString("utf8");
}
