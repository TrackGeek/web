import { Icon } from "@iconify/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useContentTypes } from "@/hooks/content-type";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api";
import { useSession } from "@/lib/auth/client";
import {
  CONTENT_TYPE_API,
  CONTENT_TYPE_ICONS,
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_SLUGS,
  type ContentTypeSlug,
} from "@/lib/content-types";
import { LANGUAGE_TOKEN, SUPPORTED_LANGUAGES, setLanguageCookie } from "@/lib/i18n/config";
import { useDebounce } from "@/lib/utils/useDebounce";

const COLOR_DEBOUNCE_DELAY = 600;
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

const DEFAULT_COLOR = "#10b981";

const colorOptions = [
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
  "#a855f7", // Purple
];

type ProfilePreferences = {
  color?: string;
  language?: string;
  timezone?: string;
  contentTypes?: ApiTypes.ContentType[];
};

export function SettingsPreferencesTab() {
  const { t, i18n } = useTranslation();

  const session = useSession();

  const serverColor = session.data?.user?.profile?.color ?? DEFAULT_COLOR;
  const serverLanguage = session.data?.user?.profile?.language ?? i18n.language;
  const serverTimezone = session.data?.user?.profile?.timezone ?? new Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { visible: serverContentTypes } = useContentTypes();

  const [color, setColor] = useState(serverColor);
  const [language, setLanguage] = useState(serverLanguage);
  const [timezone, setTimezone] = useState(serverTimezone);
  const [contentTypes, setContentTypes] = useState<ContentTypeSlug[]>(serverContentTypes);

  useEffect(() => setContentTypes(serverContentTypes), [serverContentTypes]);

  const lastSavedColorRef = useRef(serverColor);

  useEffect(() => {
    lastSavedColorRef.current = serverColor;

    setColor(serverColor);
  }, [serverColor]);

  useEffect(() => setLanguage(serverLanguage), [serverLanguage]);
  useEffect(() => setTimezone(serverTimezone), [serverTimezone]);

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: ProfilePreferences) => {
      return api.patch(apiEndpoints.updateProfile, data);
    },
    onSuccess: async (_, variables) => {
      await session.refetch();

      if (variables.language && variables.language !== i18n.language) {
        setLanguageCookie(variables.language);

        window.localStorage.setItem(LANGUAGE_TOKEN, variables.language);

        await i18n.changeLanguage(variables.language);
      }

      toast.success(t("settings:save.success"));
    },
    onError: () => {
      toast.error(t("settings:save.error"));
    },
  });

  function saveColor(value: string) {
    if (value === lastSavedColorRef.current) return;

    if (!HEX_COLOR_REGEX.test(value)) return;

    lastSavedColorRef.current = value;

    updatePreferencesMutation.mutate({ color: value });
  }

  function toggleContentType(type: ContentTypeSlug, enabled: boolean) {
    const next = enabled
      ? CONTENT_TYPE_SLUGS.filter((slug) => slug === type || contentTypes.includes(slug))
      : contentTypes.filter((slug) => slug !== type);

    if (next.length === 0) return;

    setContentTypes(next);

    updatePreferencesMutation.mutate({ contentTypes: next.map((slug) => CONTENT_TYPE_API[slug]) });
  }

  const debouncedColor = useDebounce(color, COLOR_DEBOUNCE_DELAY);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only the debounced color should trigger the save
  useEffect(() => {
    saveColor(debouncedColor);
  }, [debouncedColor]);

  const timezonesByGroup = new Map<string, string[]>([
    [t("common:continents.Africa"), Intl.supportedValuesOf("timeZone").filter((tz) => tz.startsWith("Africa/"))],
    [t("common:continents.America"), Intl.supportedValuesOf("timeZone").filter((tz) => tz.startsWith("America/"))],
    [t("common:continents.Asia"), Intl.supportedValuesOf("timeZone").filter((tz) => tz.startsWith("Asia/"))],
    [t("common:continents.Europe"), Intl.supportedValuesOf("timeZone").filter((tz) => tz.startsWith("Europe/"))],
    [
      t("common:continents.Pacific"),
      Intl.supportedValuesOf("timeZone").filter((tz) => tz.startsWith("Pacific/") || tz.startsWith("Australia/")),
    ],
  ]);

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon icon={"lucide:palette"} className="size-5" />

            {t("settings:color.title")}
          </CardTitle>

          <CardDescription>{t("settings:color.description")}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-2">
          <FieldLabel htmlFor="colorOptions">{t("settings:color.options")}</FieldLabel>

          <div className="flex flex-wrap gap-2 mt-2">
            {colorOptions.map((option) => (
              <button
                type="button"
                key={option}
                className={`size-10 rounded-full border-2 transition ${color === option ? "border-accent" : "border-transparent hover:border-accent"}`}
                style={{ backgroundColor: option }}
                onClick={() => {
                  setColor(option);

                  saveColor(option);
                }}
              />
            ))}
          </div>

          <FieldLabel htmlFor="customColor">{t("settings:color.custom")}</FieldLabel>

          <div className="flex items-center gap-2">
            <input
              type="color"
              id="customColor"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-xl border-transparent border-0 bg-transparent"
            />

            <span className="text-sm text-muted-foreground">{color}</span>

            {color !== DEFAULT_COLOR && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setColor(DEFAULT_COLOR);

                  saveColor(DEFAULT_COLOR);
                }}
              >
                <Icon icon={"lucide:rotate-ccw"} className="size-4" />

                {t("settings:color.reset")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-2">
          <CardTitle>
            <Icon icon={"lucide:settings"} className="size-5" />

            {t("settings:preferences.title")}
          </CardTitle>

          <CardDescription>{t("settings:preferences.description")}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Field className="w-full gap-2">
            <FieldLabel>{t("common:language")}</FieldLabel>

            <Select
              value={language}
              onValueChange={(value) => {
                setLanguage(value);

                updatePreferencesMutation.mutate({ language: value });
              }}
            >
              <SelectTrigger className="w-full max-w-full" disabled={updatePreferencesMutation.isPending}>
                <SelectValue placeholder={t("settings:preferences.language.placeholder")} />
              </SelectTrigger>

              <SelectContent position="popper">
                <SelectGroup>
                  {SUPPORTED_LANGUAGES.sort((a, b) => t(a.name).localeCompare(t(b.name))).map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {t(lang.name)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Field className="gap-2">
            <FieldLabel>{t("settings:preferences.timezone.title")}</FieldLabel>

            <Select
              value={timezone}
              onValueChange={(value) => {
                setTimezone(value);

                updatePreferencesMutation.mutate({ timezone: value });
              }}
            >
              <SelectTrigger className="w-full max-w-full" disabled={updatePreferencesMutation.isPending}>
                <SelectValue placeholder={t("settings:preferences.timezone.placeholder")} />
              </SelectTrigger>

              <SelectContent position="popper">
                {Array.from(timezonesByGroup.entries()).map(([group, timezones]) => (
                  <SelectGroup key={group}>
                    <SelectLabel>{group}</SelectLabel>

                    {timezones.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-2">
          <CardTitle>
            <Icon icon={"lucide:layers"} className="size-5" />

            {t("settings:contentTypes.title")}
          </CardTitle>

          <CardDescription>{t("settings:contentTypes.description")}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {CONTENT_TYPE_SLUGS.map((slug) => {
            const checked = contentTypes.includes(slug);
            const isLastEnabled = checked && contentTypes.length === 1;

            return (
              <div key={slug} className="flex items-center justify-between gap-4">
                <Label htmlFor={`content-type-${slug}`} className="flex items-center gap-2 min-w-0">
                  <Icon icon={CONTENT_TYPE_ICONS[slug]} className="size-4 shrink-0 text-muted-foreground" />

                  {t(CONTENT_TYPE_LABELS[slug])}
                </Label>

                <Switch
                  id={`content-type-${slug}`}
                  className="shrink-0"
                  checked={checked}
                  disabled={isLastEnabled || updatePreferencesMutation.isPending}
                  onCheckedChange={(value) => toggleContentType(slug, value)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
