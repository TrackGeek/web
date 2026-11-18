import { Icon } from "@iconify/react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/_authenticated/messages/")({
  head: () => ({
    meta: [...seo({ title: "Messages" })],
  }),
  component: MessagesRoute,
});

function MessagesRoute() {
  const { t } = useTranslation();

  return (
    <Empty className="m-auto border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon icon="lucide:messages-square" />
        </EmptyMedia>
        <EmptyTitle>{t("chat:selectConversation.title")}</EmptyTitle>
        <EmptyDescription>{t("chat:selectConversation.description")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
