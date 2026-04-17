/** Decode base64 tile payloads (see `healthboxSingles4bppB64.ts`) in browser and Vitest. */
export const decodeBase64ToUint8Array = (b64: string): Uint8Array => {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    out[i] = bin.charCodeAt(i) & 0xff;
  }
  return out;
};
