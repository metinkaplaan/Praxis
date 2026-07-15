import sodium from "libsodium-wrappers";
import { requireEnv } from "./env.js";

/**
 * Writes/updates a GitHub Actions repository secret via the REST API.
 * Used by token-refresh to rotate long-lived Instagram tokens.
 *
 * Requires GH_PAT_SECRETS_WRITE (fine-grained PAT, this repo only,
 * "Secrets: Read and write") because the default GITHUB_TOKEN cannot
 * manage Actions secrets.
 */
export async function putRepoSecret(name: string, value: string): Promise<void> {
  const pat = requireEnv("GH_PAT_SECRETS_WRITE");
  const repo = requireEnv("GH_REPO"); // "owner/repo"

  const headers = {
    Authorization: `Bearer ${pat}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const keyRes = await fetch(
    `https://api.github.com/repos/${repo}/actions/secrets/public-key`,
    { headers },
  );
  if (!keyRes.ok) {
    throw new Error(`Failed to fetch repo public key: ${keyRes.status} ${await keyRes.text()}`);
  }
  const { key, key_id } = (await keyRes.json()) as { key: string; key_id: string };

  await sodium.ready;
  const encrypted = sodium.crypto_box_seal(
    sodium.from_string(value),
    sodium.from_base64(key, sodium.base64_variants.ORIGINAL),
  );
  const encryptedValue = sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL);

  const putRes = await fetch(
    `https://api.github.com/repos/${repo}/actions/secrets/${name}`,
    {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ encrypted_value: encryptedValue, key_id }),
    },
  );
  if (!putRes.ok) {
    throw new Error(`Failed to write secret ${name}: ${putRes.status} ${await putRes.text()}`);
  }
}
