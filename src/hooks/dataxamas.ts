import { useEffect } from "react";
import { tracking } from "@/dataxamas";
import { useSession } from "@/lib/auth/client";

export function useDataxamasIdentify() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (isPending) return;

    tracking?.identify(userId);
  }, [isPending, userId]);
}
