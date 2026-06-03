import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * Encrypt the per-user session private key at rest. The key is a real signing key;
 * a plaintext DB column is a direct compromise of every agent account. AES-256-GCM
 * with a key derived from SESSION_KEY_ENC_SECRET.
 *
 * Stored format: `enc:v1:<iv_b64>:<tag_b64>:<ciphertext_b64>`. The prefix lets
 * `decryptSessionKey` stay backward-compatible with any legacy plaintext rows.
 */

const PREFIX = "enc:v1:";

function encKey(): Buffer {
  const secret = process.env.SESSION_KEY_ENC_SECRET;
  if (!secret) {
    throw new Error("missing env: SESSION_KEY_ENC_SECRET (32+ char secret for session-key encryption)");
  }
  // Derive a fixed 32-byte key from the secret (sha256). Secret itself can be any length.
  return createHash("sha256").update(secret, "utf8").digest();
}

/** Encrypt a session key for storage. Returns the prefixed envelope string. */
export function encryptSessionKey(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${ct.toString("base64")}`;
}

/**
 * Decrypt a stored session key. Rows written before encryption (no prefix) are
 * returned as-is so existing configs keep working until rotated.
 */
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
