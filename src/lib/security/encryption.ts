import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const PREFIX = "enc:v1:";

export function encryptSecret(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const key = getEncryptionKey();

  if (!key) {
    return value;
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptSecret(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  if (!value.startsWith(PREFIX)) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Plaintext secret found in production.");
    }

    return value;
  }

  const key = getEncryptionKey();

  if (!key) {
    throw new Error("DATA_ENCRYPTION_KEY is required to decrypt secrets.");
  }

  const [ivValue, tagValue, encryptedValue] = value.slice(PREFIX.length).split(":");

  if (!ivValue || !tagValue || !encryptedValue) {
    throw new Error("Encrypted secret has an invalid format.");
  }

  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivValue, "base64"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

function getEncryptionKey() {
  const rawKey = process.env.DATA_ENCRYPTION_KEY;

  if (!rawKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATA_ENCRYPTION_KEY is required in production.");
    }

    return null;
  }

  const key = parseKey(rawKey);

  if (key.length !== 32) {
    throw new Error("DATA_ENCRYPTION_KEY must decode to 32 bytes.");
  }

  return key;
}

function parseKey(rawKey: string) {
  const normalized = rawKey.trim();

  if (/^[a-f0-9]{64}$/i.test(normalized)) {
    return Buffer.from(normalized, "hex");
  }

  return Buffer.from(normalized, "base64");
}
