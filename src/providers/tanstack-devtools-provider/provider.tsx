import { lazy, type ReactNode, Suspense } from "react";

interface TanstackDevtoolsProviderProps {
  children: ReactNode;
}

const Devtools = import.meta.env.DEV ? lazy(() => import("./lazy")) : null;

export function TanstackDevtoolsProvider({ children }: TanstackDevtoolsProviderProps) {
  return (
    <>
      {Devtools && (
        <Suspense fallback={null}>
          <Devtools />
        </Suspense>
      )}

      {children}
    </>
  );
}
