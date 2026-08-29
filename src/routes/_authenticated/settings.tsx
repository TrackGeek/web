import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SettingsImportTab } from "@/components/pages/settings/import-tab";
import { SettingsNotificationsTab } from "@/components/pages/settings/notifications-tab";
import { SettingsPreferencesTab } from "@/components/pages/settings/preferences-tab";
import { SettingsProfileTab } from "@/components/pages/settings/profile-tab";
import { ConnectionsCard } from "@/components/shared/settings/connections-card";
import { DeleteAccountCard } from "@/components/shared/settings/delete-account-card";
import { PasskeysCard } from "@/components/shared/settings/passkeys-card";
import { PasswordCard } from "@/components/shared/settings/password-card";
import { TwoFactorCard } from "@/components/shared/settings/two-factor-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [...seo({ title: "Settings" })],
  }),
  component: SettingsRoute,
});

function SettingsRoute() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="flex w-full gap-2 text-sm justify-start overflow-x-auto mb-5">
        <TabsTrigger value="profile">{t("common:profile")}</TabsTrigger>

        <TabsTrigger value="preferences">{t("settings:tabs.preferences")}</TabsTrigger>

        <TabsTrigger value="notifications">{t("common:notifications")}</TabsTrigger>

        <TabsTrigger value="security">{t("settings:tabs.security")}</TabsTrigger>

        <TabsTrigger value="connections">{t("settings:tabs.connections")}</TabsTrigger>

        <TabsTrigger value="import">{t("settings:tabs.import")}</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <SettingsProfileTab />
      </TabsContent>

      <TabsContent value="preferences">
        <SettingsPreferencesTab />
      </TabsContent>

      <TabsContent value="notifications">
        <SettingsNotificationsTab />
      </TabsContent>

      <TabsContent value="security">
        <div className="flex flex-col gap-4">
          <PasswordCard />

          <PasskeysCard />

          <TwoFactorCard />

          <DeleteAccountCard />
        </div>
      </TabsContent>

      <TabsContent value="connections">
        <ConnectionsCard />
      </TabsContent>

      <TabsContent value="import">
        <SettingsImportTab />
      </TabsContent>
    </Tabs>
  );
}
