type Registry = typeof globalThis & Record<symbol, unknown>;

export function hmrSingleton<T>(key: string, create: () => T): T {
  const registry = globalThis as Registry;
  const symbol = Symbol.for(`trackgeek.${key}`);

  if (!(symbol in registry)) registry[symbol] = create();

  return registry[symbol] as T;
}
