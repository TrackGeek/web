import { useNavigate, useRouterState } from "@tanstack/react-router";
import type { Driver, DriveStep } from "driver.js";
import { useEffect, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import {
  TOUR_NEW_ACCOUNT_WINDOW,
  TOUR_STAGES,
  TOUR_STORAGE_KEY,
  type TourStage,
  type TourState,
} from "@/constants/tour";
import { useSession } from "@/lib/auth/client";

const WAIT_INTERVAL = 250;
const WAIT_TIMEOUT = 20000;

let current: TourState | null | undefined;

const listeners = new Set<() => void>();

function read(): TourState | null {
  if (current !== undefined) return current;

  try {
    current = (localStorage.getItem(TOUR_STORAGE_KEY) as TourState | null) ?? null;
  } catch {
    current = "done";
  }

  return current;
}

function write(next: TourState) {
  current = next;

  try {
    localStorage.setItem(TOUR_STORAGE_KEY, next);
  } catch {}

  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function startTour() {
  write("welcome");
}

export function useProductTour() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const session = useSession();

  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const state = useSyncExternalStore(subscribe, read, () => "done" as TourState);

  const user = session.data?.user;
  const username = user?.username;
  const createdAt = user?.createdAt;

  useEffect(() => {
    if (state !== null || !createdAt) return;

    if (Date.now() - new Date(createdAt).getTime() < TOUR_NEW_ACCOUNT_WINDOW) startTour();
  }, [state, createdAt]);

  useEffect(() => {
    if (!user || !state || state === "done") return;

    const stage: TourStage = state;
    const config = TOUR_STAGES[stage];

    if (!config.matches(pathname, username)) return;

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    let tour: Driver | undefined;

    const goNext = () => {
      if (stage === "welcome") {
        write("feed");
        navigate({ to: "/feed" });
      } else if (stage === "feed") {
        write("profile");

        if (username) navigate({ to: "/user/$username", params: { username }, search: { tab: "overview" } });
      } else if (stage === "profile") {
        write("search");
        navigate({ to: "/search" });
      } else if (stage === "search") {
        write("details");
      } else {
        write("done");
      }
    };

    const run = async () => {
      const { driver } = await import("driver.js");

      if (cancelled) return;

      const available = config.steps.filter((step) => !step.selector || document.querySelector(step.selector));

      if (available.length === 0) return;

      const lastLabel =
        stage === "welcome"
          ? t("common:tour.start")
          : stage === "details"
            ? t("common:tour.finish")
            : t("common:tour.continue");

      const steps: DriveStep[] = available.map((step, index) => ({
        element: step.selector,
        popover: {
          title: t(`common:tour.${stage}.${step.id}.title`),
          description: t(`common:tour.${stage}.${step.id}.description`),
          side: step.side,
          align: "center",
          ...(index === available.length - 1
            ? {
                nextBtnText: lastLabel,
                onNextClick: () => {
                  tour?.destroy();
                  goNext();
                },
              }
            : {}),
        },
      }));

      tour = driver({
        steps,
        showProgress: steps.length > 1,
        progressText: "{{current}} / {{total}}",
        nextBtnText: t("common:next"),
        prevBtnText: t("common:previous"),
        doneBtnText: lastLabel,
        popoverClass: "tg-tour",
        stagePadding: 6,
        stageRadius: 10,
        onDestroyStarted: () => {
          write("done");
          tour?.destroy();
        },
      });

      tour.drive();
    };

    const waited = { elapsed: 0 };

    const poll = () => {
      if (!config.waitFor || document.querySelector(config.waitFor)) {
        clearInterval(timer);
        run();

        return;
      }

      waited.elapsed += WAIT_INTERVAL;

      if (waited.elapsed >= WAIT_TIMEOUT) clearInterval(timer);
    };

    timer = setInterval(poll, WAIT_INTERVAL);
    poll();

    return () => {
      cancelled = true;
      clearInterval(timer);
      tour?.destroy();
    };
  }, [state, pathname, user, username, navigate, t]);
}
