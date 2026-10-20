export function containsBook(value: unknown, hardcoverId?: number, visited = new WeakSet<object>()): boolean {
  if (!value || typeof value !== "object" || visited.has(value)) return false;
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype) return false;
  visited.add(value);
  if ("hardcoverId" in value && "imageUrl" in value && (hardcoverId == null || value.hardcoverId === hardcoverId)) {
    return true;
  }
  return Object.values(value).some((item) => containsBook(item, hardcoverId, visited));
}
