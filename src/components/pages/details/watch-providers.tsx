import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useWatchProviderRegions,
  useWatchProviders,
  useWatchRegion,
  type WatchMediaType,
} from "@/hooks/watch-provider";
import type { ApiTypes } from "@/lib/api";
import { cn } from "@/lib/utils";

const OFFER_GROUPS = [
  {
    offer: "flatrate" as const,
    label: "library:watchProviders.stream",
    icon: "lucide:play-circle",
    iconColor: "text-primary",
    gradient: "from-primary/20 to-secondary/20",
    border: "border-primary/30",
  },
  {
    offer: "free" as const,
    label: "library:watchProviders.free",
    icon: "lucide:gift",
    iconColor: "text-chart-3",
    gradient: "from-chart-3/20 to-amber-500/20",
    border: "border-chart-3/30",
  },
  {
    offer: "ads" as const,
    label: "library:watchProviders.ads",
    icon: "lucide:tv-minimal",
    iconColor: "text-purple-400",
    gradient: "from-purple-500/20 to-violet-500/20",
    border: "border-purple-500/30",
  },
  {
    offer: "rent" as const,
    label: "library:watchProviders.rent",
    icon: "lucide:ticket",
    iconColor: "text-chart-1",
    gradient: "from-chart-1/20 to-sky-500/20",
    border: "border-chart-1/30",
  },
  {
    offer: "buy" as const,
    label: "library:watchProviders.buy",
    icon: "lucide:shopping-cart",
    iconColor: "text-chart-5",
    gradient: "from-chart-5/20 to-red-500/20",
    border: "border-chart-5/30",
  },
];

function toFlagEmoji(code: string) {
  return code
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

function useRegionName() {
  const { i18n } = useTranslation();

  const displayNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([i18n.language], { type: "region" });
    } catch {
      return null;
    }
  }, [i18n.language]);

  return (code: string, fallback?: string) => {
    try {
      return displayNames?.of(code) ?? fallback ?? code;
    } catch {
      return fallback ?? code;
    }
  };
}

interface WatchProvidersProps {
  mediaType: WatchMediaType;
  slug: string;
}

export function WatchProviders({ mediaType, slug }: WatchProvidersProps) {
  const { t } = useTranslation();

  const { region, isResolved, setRegion, isSaving } = useWatchRegion();
  const providersQuery = useWatchProviders(mediaType, slug, region, isResolved);
  const providers = providersQuery.data;

  const getRegionName = useRegionName();

  const groups = OFFER_GROUPS.map((group) => ({ ...group, items: providers?.[group.offer] ?? [] })).filter(
    (group) => group.items.length > 0,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-card-foreground text-lg">{t("library:watchProviders.title")}</h3>

        <RegionPicker
          region={region}
          onSelect={setRegion}
          disabled={isSaving}
          availableRegions={providers?.availableRegions ?? []}
          getRegionName={getRegionName}
        />
      </div>

      {!isResolved || providersQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Empty className="border border-border border-dashed bg-muted/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon="lucide:monitor-off" />
            </EmptyMedia>
            <EmptyTitle>{t("library:watchProviders.notAvailable", { country: getRegionName(region) })}</EmptyTitle>
            <EmptyDescription>{t("library:watchProviders.notAvailableDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.offer} className="space-y-3 rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border bg-linear-to-r",
                    group.gradient,
                    group.border,
                  )}
                >
                  <Icon icon={group.icon} className={cn("size-4", group.iconColor)} />
                </span>

                <p className="font-medium text-card-foreground text-sm">{t(group.label)}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {group.items.map((provider) => (
                  <ProviderTile key={provider.id} provider={provider} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <a
          href="https://www.justwatch.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-card-foreground"
        >
          {t("library:watchProviders.attribution")}
          <Icon icon="lucide:external-link" className="size-3" />
        </a>
      </div>
    </div>
  );
}

interface ProviderTileProps {
  provider: ApiTypes.WatchProvider;
}

function ProviderTile({ provider }: ProviderTileProps) {
  const content = (
    <>
      <div className="size-14 overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300">
        {provider.logoUrl ? (
          <img src={provider.logoUrl} alt={provider.name} loading="lazy" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center font-semibold text-muted-foreground text-sm">
            {provider.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      <span className="line-clamp-2 text-center text-[11px] text-muted-foreground leading-tight transition-colors">
        {provider.name}
      </span>
    </>
  );

  return <div className="group flex w-16 flex-col items-center gap-2">{content}</div>;
}

interface RegionPickerProps {
  region: string;
  availableRegions: string[];
  disabled: boolean;
  onSelect: (region: string) => void;
  getRegionName: (code: string, fallback?: string) => string;
}

function RegionPicker({ region, availableRegions, disabled, onSelect, getRegionName }: RegionPickerProps) {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  const regionsQuery = useWatchProviderRegions(open);

  const regions = useMemo(() => {
    const fromApi = regionsQuery.data?.map((item) => ({ code: item.code, name: getRegionName(item.code, item.name) }));

    if (fromApi?.length) {
      return fromApi.sort((a, b) => a.name.localeCompare(b.name));
    }

    return [...new Set([region, ...availableRegions])]
      .map((code) => ({ code, name: getRegionName(code) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [regionsQuery.data, availableRegions, region, getRegionName]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} className="gap-2">
          <span aria-hidden="true">{toFlagEmoji(region)}</span>
          {getRegionName(region)}
          <Icon icon="lucide:chevrons-up-down" className="size-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-64 p-0">
        <Command>
          <CommandInput placeholder={t("library:watchProviders.searchCountry")} />

          <CommandList>
            <CommandEmpty>{t("common:noResults")}</CommandEmpty>

            <CommandGroup>
              {regions.map((item) => (
                <CommandItem
                  key={item.code}
                  value={`${item.name} ${item.code}`}
                  onSelect={() => {
                    onSelect(item.code);

                    setOpen(false);
                  }}
                  className="gap-2"
                >
                  <span aria-hidden="true">{toFlagEmoji(item.code)}</span>

                  <span className="truncate">{item.name}</span>

                  {item.code === region && <Icon icon="lucide:check" className="ml-auto size-3.5 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
