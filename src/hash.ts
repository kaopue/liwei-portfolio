export function decodeHash(hash: string): string {
  const value = hash.replace(/^#/, "");

  try {
    return decodeURIComponent(value);
  } catch {
    // Keep malformed shared links readable without interrupting rendering.
    return value;
  }
}
