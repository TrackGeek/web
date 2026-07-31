import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useMutation } from "@tanstack/react-query";
import { Image } from "@unpic/react";
import type { TFunction } from "i18next";
import { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, apiEndpoints } from "@/lib/api";
import { useSession } from "@/lib/auth/client";
import { AVATAR_BLUR } from "@/lib/image";

const ABOUT_MAX_LENGTH = 500;

function createProfileSchema(t: TFunction) {
  return z.object({
    name: z.string().trim().min(2, t("settings:profile.errors.nameMin")).max(50, t("settings:profile.errors.nameMax")),
    username: z
      .string()
      .trim()
      .min(3, t("settings:profile.errors.usernameMin"))
      .max(30, t("settings:profile.errors.usernameMax"))
      .regex(/^[a-zA-Z0-9_]+$/, t("settings:profile.errors.usernameFormat")),
    about: z.string().trim().max(ABOUT_MAX_LENGTH, t("settings:profile.errors.aboutMax")),
  });
}

type ProfileFormData = z.infer<ReturnType<typeof createProfileSchema>>;

export function SettingsProfileTab() {
  const { t } = useTranslation();

  const session = useSession();

  const profileSchema = useMemo(() => createProfileSchema(t), [t]);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: session.data?.user?.name ?? "",
      username: session.data?.user?.username ?? "",
      about: session.data?.user?.profile?.about ?? "",
    },
  });

  const about = profileForm.watch("about") ?? "";

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      await Promise.all([
        api.patch(apiEndpoints.updateUser, {
          name: data.name,
          username: data.username,
        }),
        api.patch(apiEndpoints.updateProfile, {
          about: data.about,
        }),
      ]);
    },
    onSuccess: async () => {
      await session.refetch();

      toast.success(t("settings:save.success"));
    },
    onError: () => {
      toast.error(t("settings:save.error"));
    },
  });

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
      <Card className="sm:col-span-1 lg:col-span-1">
        <CardHeader>
          <CardTitle>
            <Icon icon={"lucide:image"} className="size-5" />

            {t("settings:avatar.title")}
          </CardTitle>

          <CardDescription>{t("settings:avatar.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-2">
            <div className="w-full max-w-55 aspect-square relative">
              {session.data?.user?.profile?.avatarUrl ? (
                <>
                  <Image
                    className="size-full rounded-lg border-accent border object-cover"
                    src={session.data?.user?.profile.avatarUrl}
                    width={220}
                    height={220}
                    background={AVATAR_BLUR}
                    alt=""
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
                </>
              ) : (
                // biome-ignore lint/a11y/noStaticElementInteractions: false positive
                <div
                  className="size-full rounded-lg cursor-pointer"
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
            </div>
          </div>

          <input
            type="file"
            ref={avatarInputRef}
            className="hidden"
            accept=".jpg,.jpeg,.png,.gif"
            onChange={(e) => handleImageUpload(e, "avatar")}
          />
        </CardContent>
      </Card>

      <Card className="sm:col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>
            <Icon icon={"lucide:image"} className="size-5" />

            {t("settings:banner.title")}
          </CardTitle>

          <CardDescription>{t("settings:banner.description")}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="relative w-full aspect-2/1 sm:aspect-3/1">
            {session.data?.user?.profile?.bannerUrl ? (
              <>
                <div className="absolute inset-0">
                  <Image
                    className="size-full rounded-lg border-accent border object-cover"
                    src={session.data?.user?.profile.bannerUrl}
                    width={300}
                    height={220}
                    background={AVATAR_BLUR}
                    alt=""
                  />
                </div>

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
              </>
            ) : (
              // biome-ignore lint/a11y/noStaticElementInteractions: false positive
              <div
                className="absolute inset-0 rounded-lg cursor-pointer"
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
          </div>

          <input
            type="file"
            ref={bannerInputRef}
            className="hidden"
            accept=".jpg,.jpeg,.png,.gif"
            onChange={(e) => handleImageUpload(e, "banner")}
          />
        </CardContent>
      </Card>

      <Card className="sm:col-span-2 lg:col-span-3">
        <CardHeader className="gap-2">
          <CardTitle>
            <Icon icon={"lucide:user"} className="size-5" />

            {t("settings:profile.title")}
          </CardTitle>

          <CardDescription>{t("settings:profile.description")}</CardDescription>
        </CardHeader>

        <form
          className="flex flex-col gap-6"
          onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))}
        >
          <CardContent className="flex flex-col gap-4">
            <Field className="gap-2">
              <FieldLabel htmlFor="name">{t("settings:profile.name")}</FieldLabel>

              <Input
                id="name"
                type="text"
                placeholder="Jhon Doe"
                aria-invalid={Boolean(profileForm.formState.errors.name)}
                aria-label={t("settings:profile.name")}
                {...profileForm.register("name")}
              />

              {profileForm.formState.errors.name?.message && (
                <FieldError>{profileForm.formState.errors.name.message}</FieldError>
              )}
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="username">{t("settings:profile.username")}</FieldLabel>

              <div className="flex w-full items-stretch">
                <Label
                  htmlFor="username"
                  className="bg-muted text-muted-foreground flex shrink-0 items-center rounded-l-md border border-r-0 px-4 text-sm font-medium shadow-xs"
                >
                  @
                </Label>

                <InputGroup className="flex-1 rounded-l-none border-l-0">
                  <InputGroupInput
                    id="username"
                    type="text"
                    placeholder="jhondoe"
                    aria-invalid={Boolean(profileForm.formState.errors.username)}
                    aria-label={t("settings:profile.username")}
                    {...profileForm.register("username")}
                  />
                </InputGroup>
              </div>

              {profileForm.formState.errors.username?.message && (
                <FieldError>{profileForm.formState.errors.username.message}</FieldError>
              )}
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="about">{t("settings:profile.about")}</FieldLabel>

              <Textarea
                id="about"
                placeholder="Tell us about yourself..."
                rows={10}
                className="min-h-40 resize-none"
                maxLength={ABOUT_MAX_LENGTH}
                aria-invalid={Boolean(profileForm.formState.errors.about)}
                aria-label={t("settings:profile.about")}
                {...profileForm.register("about")}
              />

              <div className="flex items-center justify-between gap-2">
                {profileForm.formState.errors.about?.message ? (
                  <FieldError>{profileForm.formState.errors.about.message}</FieldError>
                ) : (
                  <span />
                )}

                <span className="text-xs text-muted-foreground">
                  {about.length}/{ABOUT_MAX_LENGTH}
                </span>
              </div>
            </Field>
          </CardContent>

          <CardFooter className="justify-end">
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending && <Icon icon="eos-icons:loading" className="size-4 animate-spin" />}

              {t("common:saveChanges")}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
