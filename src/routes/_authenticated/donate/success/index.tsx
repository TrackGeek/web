import { Link, createFileRoute } from "@tanstack/react-router";
import { HomeIcon, HeartIcon } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/_authenticated/donate/success/")({
  head: () => ({
    meta: [...seo({ title: "Donation Success" })],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden grow">
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="mask-b-from-20% mask-b-to-80% font-extrabold text-9xl text-primary">
            <HeartIcon className="size-24" />
          </EmptyTitle>
          <EmptyTitle className="text-2xl font-bold text-white">
            <Trans i18nKey={"pages:donate.success.title"} />
          </EmptyTitle>
          <EmptyDescription className="text-nowrap text-white">
            <Trans i18nKey={"pages:donate.success.description"} />
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/">
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
