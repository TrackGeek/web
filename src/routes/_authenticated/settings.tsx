import { Icon } from "@iconify/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SettingsImportTab } from "@/components/pages/settings/import-tab";
import { SettingsNotificationsTab } from "@/components/pages/settings/notifications-tab";
import { SettingsPreferencesTab } from "@/components/pages/settings/preferences-tab";
import { SettingsProfileTab } from "@/components/pages/settings/profile-tab";
import { WatchLinksCard } from "@/components/pages/settings/watch-links-card";
import { ConnectionsCard } from "@/components/shared/settings/connections-card";
import { DeleteAccountCard } from "@/components/shared/settings/delete-account-card";
import { PasskeysCard } from "@/components/shared/settings/passkeys-card";
import { PasswordCard } from "@/components/shared/settings/password-card";
import { TwoFactorCard } from "@/components/shared/settings/two-factor-card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/utils/seo";

const SECTIONS = [
  {
    id: "profile",
    label: "common:profile",
    icon: "lucide:user-round",
    description: "settings:navigation.descriptions.profile",
  },
  {
    id: "appearance",
    label: "settings:tabs.appearance",
    icon: "lucide:palette",
    description: "settings:navigation.descriptions.appearance",
  },
  {
    id: "preferences",
    label: "settings:tabs.preferences",
    icon: "lucide:sliders-horizontal",
    description: "settings:navigation.descriptions.preferences",
  },
  {
    id: "watch-links",
    label: "settings:watchLinks.title",
    icon: "lucide:external-link",
    description: "settings:navigation.descriptions.watchLinks",
  },
  {
    id: "notifications",
    label: "common:notifications",
    icon: "lucide:bell",
    description: "notifications:preferences.description",
  },
  {
    id: "security",
    label: "settings:tabs.security",
    icon: "lucide:shield-check",
    description: "settings:navigation.descriptions.security",
  },
  {
    id: "connections",
    label: "settings:tabs.connections",
    icon: "lucide:link",
    description: "settings:connections.description",
  },
  {
    id: "import",
    label: "settings:tabs.data",
    icon: "lucide:arrow-right-left",
    description: "settings:navigation.descriptions.data",
  },
  {
    id: "account",
    label: "settings:tabs.account",
    icon: "lucide:user-round-cog",
    description: "settings:deleteAccount.description",
  },
] as const;

type SettingsSection = (typeof SECTIONS)[number]["id"];

const GROUPS = [
  { label: "settings:navigation.groups.personal", sections: SECTIONS.slice(0, 2) },
  { label: "settings:navigation.groups.application", sections: SECTIONS.slice(2, 5) },
  { label: "settings:navigation.groups.account", sections: SECTIONS.slice(5) },
];

function isSettingsSection(value: unknown): value is SettingsSection {
  return SECTIONS.some((section) => section.id === value);
}

export const Route = createFileRoute("/_authenticated/settings")({
  validateSearch: (search): { tab?: SettingsSection } => ({
    tab: isSettingsSection(search.tab) ? search.tab : undefined,
  }),
  head: () => ({
    meta: [...seo({ title: "Settings" })],
  }),
  component: SettingsRoute,
});

function SettingsRoute() {
  const { t } = useTranslation();
  const { tab = "profile" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const activeSection = SECTIONS.find((section) => section.id === tab) ?? SECTIONS[0];

  return (
    <div className="min-w-0 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight wrap-anywhere">{t("common:settings")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings:navigation.description")}</p>
      </header>

      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8">
        <nav aria-label={t("common:settings")} className="hidden space-y-6 lg:sticky lg:top-24 lg:block">
          {GROUPS.map((group) => (
            <div key={group.label} className="space-y-2">
              <p className="px-3 text-xs font-medium text-muted-foreground">{t(group.label)}</p>
              <div className="space-y-1">
                {group.sections.map((section) => (
                  <Link
                    key={section.id}
                    to="/settings"
                    search={{ tab: section.id }}
                    resetScroll={false}
                    aria-current={tab === section.id ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-medium whitespace-nowrap outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring",
                      tab === section.id
                        ? "border-border/50 bg-primary/10 text-secondary"
                        : "text-muted-foreground hover:text-white",
                    )}
                  >
                    <Icon icon={section.icon} className="size-4 shrink-0" aria-hidden="true" />
                    {t(section.label)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="min-w-0 space-y-5">
          <div className="lg:hidden">
            <Select
              value={tab}
              onValueChange={(value) => {
                if (isSettingsSection(value)) void navigate({ search: { tab: value }, resetScroll: false });
              }}
            >
              <SelectTrigger className="h-11 w-full min-w-0" aria-label={t("settings:navigation.section")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {GROUPS.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{t(group.label)}</SelectLabel>
                    {group.sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        <Icon icon={section.icon} className="size-4 shrink-0" aria-hidden="true" />
                        {t(section.label)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <section aria-labelledby="settings-section-title" className="min-w-0 space-y-5">
            <header className="space-y-1">
              <h2 id="settings-section-title" className="text-xl font-semibold tracking-tight wrap-anywhere">
                {t(activeSection.label)}
              </h2>
              <p className="max-w-prose text-sm text-muted-foreground">{t(activeSection.description)}</p>
            </header>

            <div key={tab} className="min-w-0">
              {tab === "profile" && <SettingsProfileTab />}
              {tab === "appearance" && <SettingsProfileTab section="appearance" />}
              {tab === "preferences" && <SettingsPreferencesTab />}
              {tab === "watch-links" && <WatchLinksCard />}
              {tab === "notifications" && <SettingsNotificationsTab />}
              {tab === "security" && (
                <div className="flex flex-col gap-4">
                  <PasswordCard />
                  <PasskeysCard />
                  <TwoFactorCard />
                </div>
              )}
              {tab === "connections" && <ConnectionsCard />}
              {tab === "import" && <SettingsImportTab />}
              {tab === "account" && <DeleteAccountCard />}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
