function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET environment variable is required");
  return s;
}

function encodeBase64url(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString("base64url");
}

function decodeBase64url(str: string): Buffer {
  return Buffer.from(str, "base64url");
}

async function hmacSign(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return encodeBase64url(sig);
}

async function hmacVerify(data: string, sigBase64: string): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  return crypto.subtle.verify("HMAC", key, decodeBase64url(sigBase64) as unknown as ArrayBuffer, enc.encode(data));
}

export async function signToken(payload: string): Promise<string> {
  const ts = Date.now().toString();
  const data = `${payload}:${ts}`;
  const sig = await hmacSign(data);
  return Buffer.from(`${data}:${sig}`).toString("base64url");
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    const [payload, ts, sig] = parts;
    const data = `${payload}:${ts}`;
    const valid = await hmacVerify(data, sig);
    if (!valid) return null;
    if (Date.now() - parseInt(ts) > 24 * 60 * 60 * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}
