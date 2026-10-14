import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export function ImportFileEmpty() {
  const { t } = useTranslation();

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon icon={"lucide:inbox"} className="size-6" />
        </EmptyMedia>

        <EmptyTitle>{t("settings:import.file.emptyTitle")}</EmptyTitle>

        <EmptyDescription>{t("settings:import.file.emptyDescription")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
