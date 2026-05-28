import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import ViteImage from "@son426/vite-image/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
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
import { Textarea } from "@/components/ui/textarea";
import { api, apiEndpoints } from "@/lib/api";
import { useSession } from "@/lib/auth";
import { LANGUAGE_TOKEN, SUPPORTED_LANGUAGES } from "@/lib/i18n/config";
import { seo } from "@/lib/utils/seo";

const profileSchema = z.object({
  name: z.string(),
  username: z.string(),
  about: z.string(),
  color: z.string(),
  language: z.string(),
  timezone: z.string(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [...seo({ title: "Settings" })],
  }),
  component: SettingsRoute,
});

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

function SettingsRoute() {
  const { t, i18n } = useTranslation();

  const session = useSession();

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: session.data?.user?.name ?? "",
      username: session.data?.user?.username ?? "",
      about: session.data?.user?.profile?.about ?? "",
      color: session.data?.user?.profile?.color ?? DEFAULT_COLOR,
      language: session.data?.user?.profile?.language ?? i18n.language,
      timezone:
        session.data?.user?.profile?.timezone ?? new Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const color = profileForm.watch("color");

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      await Promise.all([
        api.patch(apiEndpoints.updateUser, {
          name: data.name,
          username: data.username,
        }),
        api.patch(apiEndpoints.updateProfile, {
          about: data.about,
          color: data.color,
          language: data.language,
          timezone: data.timezone,
        }),
      ]);
    },
    onSuccess: async (_, variables) => {
      await session.refetch();

      if (variables.language !== i18n.language) {
        window.localStorage.setItem(LANGUAGE_TOKEN, variables.language);

        await i18n.changeLanguage(variables.language);
      }

      toast.success(t("settings:save.success"));
    },
    onError: () => {
      toast.error(t("settings:save.error"));
    },
  });

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

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const uploadBannerMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();

      formData.append("file", file);

      return api.patch(apiEndpoints.updateProfileBanner, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: async () => {
      await session.refetch();

      toast.success(t("settings:banner.upload.success"));
    },
    onError: () => {
      toast.error(t("settings:banner.upload.error"));
    },
  });

  const deleteBannerMutation = useMutation({
    mutationFn: () => {
      return api.delete(apiEndpoints.deleteProfileBanner);
    },
    onSuccess: async () => {
      await session.refetch();

      toast.success(t("settings:banner.delete.success"));
    },
    onError: () => {
      toast.error(t("settings:banner.delete.error"));
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();

      formData.append("file", file);

      return api.patch(apiEndpoints.updateProfileAvatar, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: async () => {
      await session.refetch();

      toast.success(t("settings:avatar.upload.success"));
    },
    onError: () => {
      toast.error(t("settings:avatar.upload.error"));
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: () => {
      return api.delete(apiEndpoints.deleteProfileAvatar);
    },
    onSuccess: async () => {
      await session.refetch();

      toast.success(t("settings:avatar.delete.success"));
    },
    onError: () => {
      toast.error(t("settings:avatar.delete.error"));
    },
  });

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "banner") {
    const file = event.target.files?.[0];

    if (!file) return;

    if (type === "banner") {
      uploadBannerMutation.mutate(file);
    }

    if (type === "avatar") {
      uploadAvatarMutation.mutate(file);
    }
  }

  return (
    <form
      className="grid grid-cols-3 gap-8"
      onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))}
    >
      <div className="w-full flex flex-col border-border border bg-card rounded-2xl p-6 col-span-1">
        <Field className="gap-2">
          <FieldLabel>
            <Icon icon={"lucide:image"} className="size-6" />

            {t("settings:avatar.title")}
          </FieldLabel>

          <FieldDescription>{t("settings:avatar.description")}</FieldDescription>

          <div className="flex items-center justify-center gap-2 h-55">
            {session.data?.user?.profile?.avatarUrl ? (
              <div className="size-55 relative">
                <ViteImage
                  className="size-full rounded-lg border-accent border"
                  src={{
                    src: session.data?.user?.profile.avatarUrl,
                    blurDataURL: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH",
                    width: 220,
                    height: 220,
                  }}
                />

                {(deleteAvatarMutation.isPending || uploadAvatarMutation.isPending) && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col justify-center items-center gap-2">
                    <Icon icon="eos-icons:loading" className="size-8 text-white animate-spin" />
                  </div>
                )}

                {(!deleteAvatarMutation.isPending || !uploadAvatarMutation.isPending) && (
                  <>
                    <button
                      type="button"
                      className="absolute top-2 right-10 bg-black/50 rounded-full p-1.5 hover:bg-black/70 transition cursor-pointer"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      <Icon icon={"lucide:upload"} className="size-4 text-white" />
                    </button>

                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 hover:bg-black/70 transition cursor-pointer"
                      onClick={() => deleteAvatarMutation.mutate()}
                    >
                      <Icon icon={"lucide:circle-x"} className="size-4 text-white" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              // biome-ignore lint/a11y/noStaticElementInteractions: false positive
              <div
                className="size-55 rounded-lg cursor-pointer relative"
                style={{ backgroundColor: session.data?.user?.profile?.color }}
                onClick={() => avatarInputRef.current?.click()}
                onKeyDown={() => avatarInputRef.current?.click()}
              >
                {uploadAvatarMutation.isPending ? (
                  <div className="size-full flex flex-col justify-center items-center gap-2">
                    <Icon icon="eos-icons:loading" className="size-8 text-white animate-spin" />
                  </div>
                ) : (
                  <div className="size-full flex flex-col justify-center items-center gap-2">
                    <Icon icon={"lucide:upload"} className="size-8 text-white/70" />

                    <span className="text-white/70">{t("settings:avatar.upload.title")}</span>
                  </div>
                )}
              </div>
            )}

            <input
              type="file"
              ref={avatarInputRef}
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif"
              onChange={(e) => handleImageUpload(e, "avatar")}
            />
          </div>
        </Field>
      </div>

      <div className="w-full flex flex-col border-border border bg-card rounded-2xl p-6 col-span-2">
        <Field className="gap-2">
          <FieldLabel>
            <Icon icon={"lucide:image"} className="size-6" />

            {t("settings:banner.title")}
          </FieldLabel>

          <FieldDescription>{t("settings:banner.description")}</FieldDescription>

          <div className="flex items-center gap-2 h-55">
            {session.data?.user?.profile?.bannerUrl ? (
              <div className="size-full relative">
                <ViteImage
                  className="size-full rounded-lg border-accent border"
                  src={{
                    src: session.data?.user?.profile.bannerUrl,
                    blurDataURL: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH",
                    width: 300,
                    height: 220,
                  }}
                />

                {(deleteBannerMutation.isPending || uploadBannerMutation.isPending) && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col justify-center items-center gap-2">
                    <Icon icon="eos-icons:loading" className="size-8 text-white animate-spin" />
                  </div>
                )}

                {(!deleteBannerMutation.isPending || !uploadBannerMutation.isPending) && (
                  <>
                    <button
                      type="button"
                      className="absolute top-2 right-10 bg-black/50 rounded-full p-1.5 hover:bg-black/70 transition cursor-pointer"
                      onClick={() => bannerInputRef.current?.click()}
                    >
                      <Icon icon={"lucide:upload"} className="size-4 text-white" />
                    </button>

                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 hover:bg-black/70 transition cursor-pointer"
                      onClick={() => deleteBannerMutation.mutate()}
                    >
                      <Icon icon={"lucide:circle-x"} className="size-4 text-white" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              // biome-ignore lint/a11y/noStaticElementInteractions: false positive
              <div
                className="size-full rounded-lg cursor-pointer relative"
                style={{ backgroundColor: session.data?.user?.profile?.color }}
                onClick={() => bannerInputRef.current?.click()}
                onKeyDown={() => bannerInputRef.current?.click()}
              >
                {uploadBannerMutation.isPending ? (
                  <div className="size-full flex flex-col justify-center items-center gap-2">
                    <Icon icon="eos-icons:loading" className="size-8 text-white animate-spin" />
                  </div>
                ) : (
                  <div className="size-full flex flex-col justify-center items-center gap-2">
                    <Icon icon={"lucide:upload"} className="size-8 text-white/70" />

                    <span className="text-white/70">{t("settings:banner.upload.title")}</span>
                  </div>
                )}
              </div>
            )}

            <input
              type="file"
              ref={bannerInputRef}
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif"
              onChange={(e) => handleImageUpload(e, "banner")}
            />
          </div>
        </Field>
      </div>

      <div className="w-full flex flex-col gap-4 border-border border bg-card rounded-2xl p-6 col-span-3">
        <Field className="gap-2">
          <FieldLabel>
            <Icon icon={"lucide:user"} className="size-6" />

            {t("settings:profile.title")}
          </FieldLabel>

          <FieldDescription>{t("settings:profile.description")}</FieldDescription>
        </Field>

        <Field className="gap-2">
          <FieldLabel htmlFor="name">{t("settings:profile.name")}</FieldLabel>

          <Input id="name" type="text" placeholder="Jhon Doe" {...profileForm.register("name")} />
        </Field>

        <Field className="gap-2">
          <FieldLabel htmlFor="username">{t("settings:profile.username")}</FieldLabel>

          <ButtonGroup>
            <ButtonGroupText asChild>
              <Label htmlFor="username">@</Label>
            </ButtonGroupText>

            <InputGroup>
              <InputGroupInput
                id="username"
                type="text"
                placeholder="jhondoe"
                {...profileForm.register("username")}
              />
            </InputGroup>
          </ButtonGroup>
        </Field>

        <Field className="gap-2">
          <FieldLabel htmlFor="about">{t("settings:profile.about")}</FieldLabel>

          <Textarea
            id="about"
            placeholder="Tell us about yourself..."
            rows={6}
            {...profileForm.register("about")}
          />
        </Field>
      </div>

      <div className="w-full flex flex-col gap-4 border-border border bg-card rounded-2xl p-6 col-span-3">
        <Field className="gap-2">
          <FieldLabel>
            <Icon icon={"lucide:palette"} className="size-6" />

            {t("settings:color.title")}
          </FieldLabel>

          <FieldDescription>{t("settings:color.description")}</FieldDescription>

          <div className="flex flex-wrap gap-2 mt-2">
            {colorOptions.map((option) => (
              <button
                type="button"
                key={option}
                className={`size-10 rounded-full border-2 transition ${color === option ? "border-accent" : "border-transparent hover:border-accent"}`}
                style={{ backgroundColor: option }}
                onClick={() => profileForm.setValue("color", option)}
              />
            ))}
          </div>

          <FieldLabel htmlFor="customColor">{t("settings:color.custom")}</FieldLabel>

          <div className="flex items-center gap-2">
            <input
              type="color"
              id="customColor"
              value={color}
              onChange={(e) => profileForm.setValue("color", e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-xl border-transparent border-0 bg-transparent"
            />

            <span className="text-sm text-muted-foreground">{color}</span>

            {color !== DEFAULT_COLOR && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => profileForm.setValue("color", DEFAULT_COLOR)}
              >
                <Icon icon={"lucide:rotate-ccw"} className="size-4" />

                {t("settings:color.reset")}
              </Button>
            )}
          </div>
        </Field>
      </div>

      <div className="w-full flex flex-col gap-4 border-border border bg-card rounded-2xl p-6 col-span-3">
        <Field className="gap-2">
          <FieldLabel>
            <Icon icon={"lucide:settings"} className="size-6" />

            {t("settings:preferrences.title")}
          </FieldLabel>

          <FieldDescription>{t("settings:preferrences.description")}</FieldDescription>
        </Field>

        <Field className="w-full gap-2">
          <FieldLabel>{t("settings:preferrences.language.title")}</FieldLabel>

          <Controller
            control={profileForm.control}
            name="language"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full max-w-full">
                  <SelectValue placeholder={t("settings:preferrences.language.placeholder")} />
                </SelectTrigger>

                <SelectContent position="popper">
                  <SelectGroup>
                    {SUPPORTED_LANGUAGES
                      .sort((a, b) => t(a.name).localeCompare(t(b.name)))
                    .map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {t(lang.name)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field className="gap-2">
          <FieldLabel>{t("settings:preferrences.timezone.title")}</FieldLabel>

          <Controller
            control={profileForm.control}
            name="timezone"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full max-w-full">
                  <SelectValue placeholder={t("settings:preferrences.timezone.placeholder")} />
                </SelectTrigger>

                <SelectContent position="popper">
                  {Array.from(timezonesByGroup.entries()).map(([group, timezones]) => (
                    <SelectGroup key={group}>
                      <SelectLabel>{group}</SelectLabel>

                      {timezones.map((timezone) => (
                        <SelectItem key={timezone} value={timezone}>
                          {timezone}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <div className="flex justify-end col-span-3">
        <Button disabled={updateProfileMutation.isPending}>
          {updateProfileMutation.isPending && <Icon icon="eos-icons:loading" className="size-4 animate-spin" />}

          {t("settings:save.title")}
        </Button>
      </div>
    </form>
  );
}
