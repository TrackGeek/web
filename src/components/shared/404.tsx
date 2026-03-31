import { Link } from "@tanstack/react-router";
import { HomeIcon } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty.tsx";

export function NotFoundComponent() {
  const { t } = useTranslation();

  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden grow">
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="mask-b-from-20% mask-b-to-80% font-extrabold text-9xl text-primary">404</EmptyTitle>
          <EmptyDescription className="-mt-8 text-nowrap text-white">
            <Trans i18nKey={"common:notFound"} />
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/" search={{ landing: "true" }}>
                <HomeIcon data-icon="inline-start" />
                {t("common:goHome")}
              </Link>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
