import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

const VERSION = "s1"
const DELIM = ":"

const PREFIX_LEN = 8
const SECRET_LEN = 32
const SALT_LEN = 16
const KEY_LEN = 32

export function generateApiKeyToken() {
  const prefix = `ag_live_${randomId(PREFIX_LEN)}`
  const secret = base64(randomBytes(SECRET_LEN))
  const token = `${prefix}.${secret}`
  const secret_hash = hashSecret(secret)
  return { token, prefix, secret_hash }
}

export function hashSecret(secret: string) {
  const salt = base64(randomBytes(SALT_LEN))
  const derived = scryptSync(secret, salt, KEY_LEN)
  return [VERSION, salt, base64(derived)].join(DELIM)
}

export function verifySecret(secret: string, hashed: string) {
  const [version, salt, digest] = hashed.split(DELIM)
  if (version !== VERSION || !salt || !digest) {
    return false
  }
  const derived = scryptSync(secret, salt, KEY_LEN)
  return timingSafeEqual(derived, fromBase64(digest))
}

function randomId(len: number) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
  const bytes = randomBytes(len)
  let out = ""
  for (let i = 0; i < len; i++) {
    out += alphabet[bytes[i] % alphabet.length]
  }
  return out
}

function base64(b: Uint8Array) {
  return Buffer.from(b).toString("base64url")
}

function fromBase64(s: string) {
  return Buffer.from(s, "base64url")
}
