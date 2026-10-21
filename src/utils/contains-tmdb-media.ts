export function containsTmdbMedia(value: unknown, visited = new WeakSet<object>()): boolean {
  if (!value || typeof value !== "object" || visited.has(value)) return false;
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype) return false;
  visited.add(value);
  if ("tmdbId" in value && "posterUrl" in value) return true;
  if ("key" in value && typeof value.key === "string" && /^(movie|tv):\d+$/.test(value.key) && "imageUrl" in value) {
    return true;
  }
  return Object.values(value).some((item) => containsTmdbMedia(item, visited));
}
