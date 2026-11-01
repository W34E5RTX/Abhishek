const returnToOrigin = "https://return-to.invalid";

export function safeReturnTo(value: string | null, fallback = "/dashboard"): string {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;

  try {
    const destination = new URL(value, returnToOrigin);
    if (destination.origin !== returnToOrigin) return fallback;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return fallback;
  }
}
