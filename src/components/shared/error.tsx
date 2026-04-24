import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty.tsx";

export function ErrorComponent() {
  const { t } = useTranslation();

  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden grow">
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="mask-b-from-20% mask-b-to-80% font-extrabold text-9xl text-red-500">Error</EmptyTitle>
          <EmptyDescription className="-mt-8 text-nowrap text-white">
            <Trans i18nKey={"common:internalError"} />
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/" search={{ landing: "true" }}>
                <Icon icon={"lucide:home"} data-icon={"inline-start"} />
                {t("common:goHome")}
              </Link>
            </Button>
            <Button asChild variant={"link"}>
              <a href={"https://github.com/TrackGeek/web/issues/new/choose"} target="_blank" rel="noopener">
                <Icon icon={"simple-icons:github"} data-icon={"inline-start"} />
                {t("common:reportError")}
              </a>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
