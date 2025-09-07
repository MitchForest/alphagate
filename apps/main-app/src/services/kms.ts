import { env } from "../config/env"

export async function kmsDecrypt(ciphertext: Uint8Array): Promise<Uint8Array> {
  const { KMSClient, DecryptCommand } = await import("@aws-sdk/client-kms")
  const client = new KMSClient({ region: env.AWS_REGION })
  const out = await client.send(
    new DecryptCommand({ CiphertextBlob: ciphertext, KeyId: env.AWS_KMS_KEY_ID })
  )
  if (!out.Plaintext) {
    throw new Error("KMS decrypt returned empty Plaintext")
  }
  return out.Plaintext as Uint8Array
}
