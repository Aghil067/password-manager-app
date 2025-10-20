import crypto from "crypto";

const ALGO = "aes-256-gcm";

export function encrypt(text, masterKeyHex) {
  const key = Buffer.from(masterKeyHex, "hex"); // must be 32 bytes
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // store ciphertext+tag
  return {
    ciphertext: Buffer.concat([ciphertext, tag]).toString("base64"),
    nonce: iv.toString("base64")
  };
}

export function decrypt(ciphertextBase64, nonceBase64, masterKeyHex) {
  const key = Buffer.from(masterKeyHex, "hex");
  const iv = Buffer.from(nonceBase64, "base64");
  const data = Buffer.from(ciphertextBase64, "base64");
  const tag = data.slice(data.length - 16);
  const ciphertext = data.slice(0, data.length - 16);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plain.toString("utf8");
}
