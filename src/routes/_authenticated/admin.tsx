import { Icon } from "@iconify/react";
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: ({ context }) => {
    if (context.session?.data?.user?.role !== "Administrator") {
      throw redirect({ to: "/feed" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-4 flex items-center gap-2 text-xl font-bold">
          <Icon icon="lucide:shield" className="size-5" />
          {t("admin:title")}
        </h1>

        <Button asChild variant="outline" size="sm">
          <Link to="/admin/chats" activeProps={{ className: "bg-muted" }}>
            <Icon icon="lucide:messages-square" className="size-4" />
            {t("admin:chats")}
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/reports" activeProps={{ className: "bg-muted" }}>
            <Icon icon="lucide:flag" className="size-4" />
            {t("admin:reports")}
          </Link>
        </Button>
      </div>

      <Outlet />
    </div>
  );
}
