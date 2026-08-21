import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { walletQueryKey } from "./coin";
import { missionsQueryKey } from "./mission";
import { xpQueryKey } from "./xp";

const POLL_INTERVAL = 60_000;
const LAST_SEEN_KEY = "trackgeek-progression-last-seen";

// Sem realtime no app: sondagem leve da primeira página de notificações. Toasts
// só para LevelUp/MissionCompleted criados depois da última notificação vista,
// invalidando as queries de progressão para a UI acompanhar.
export function useProgressionToasts(enabled: boolean) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  const { data: notifications } = useQuery({
    queryKey: ["notifications", "progression-poll"],
    queryFn: () =>
      api
        .get<ApiTypes.GetNotificationsResponse>(apiEndpoints.getNotifications, {
          params: { page: 1, itemsPerPage: 10 },
        })
        .then(({ data }) => data.notifications.items),
    refetchInterval: POLL_INTERVAL,
    enabled,
  });

  useEffect(() => {
    if (!notifications) {
      return;
    }

    const lastSeen = window.localStorage.getItem(LAST_SEEN_KEY);
    const newest = notifications[0]?.createdAt;

    // Primeira carga sem marco salvo: só registra, senão notificação antiga vira toast.
    if (!initialized.current && !lastSeen) {
      initialized.current = true;

      if (newest) {
        window.localStorage.setItem(LAST_SEEN_KEY, newest);
      }

      return;
    }

    initialized.current = true;

    const fresh = notifications.filter(
      (notification) =>
        (notification.type === "LevelUp" || notification.type === "MissionCompleted") &&
        (!lastSeen || notification.createdAt > lastSeen),
    );

    if (newest && (!lastSeen || newest > lastSeen)) {
      window.localStorage.setItem(LAST_SEEN_KEY, newest);
    }

    if (fresh.length === 0) {
      return;
    }

    for (const notification of fresh.reverse()) {
      if (notification.type === "LevelUp") {
        toast.success(t("xp:levelUpToast.title", { level: notification.metadata?.level }), {
          description: t("xp:levelUpToast.description"),
        });
      } else {
        const missionKey = notification.metadata?.missionKey;

        toast.success(t("missions:toast.title"), {
          description: missionKey ? t(`missions:${missionKey}.name`) : undefined,
        });
      }
    }

    queryClient.invalidateQueries({ queryKey: xpQueryKey() });
    queryClient.invalidateQueries({ queryKey: missionsQueryKey() });
    queryClient.invalidateQueries({ queryKey: walletQueryKey() });
  }, [notifications, queryClient, t]);
}
