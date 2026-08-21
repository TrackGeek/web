import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import type { TFunction } from "i18next";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  type ProfileLinkRequest,
  useCreateProfileLink,
  useDeleteProfileLink,
  useReorderProfileLinks,
  useUpdateProfileLink,
} from "@/hooks/profile-link";
import type { ApiTypes } from "@/lib/api";
import { resolveLink } from "@/lib/utils/social";

const LABEL_MAX_LENGTH = 40;

function createProfileLinkSchema(t: TFunction) {
  return z.object({
    label: z.string().trim().min(1, t("user:linkLabelRequired")).max(LABEL_MAX_LENGTH, t("user:linkLabelMax")),
    url: z.string().trim().url(t("user:setupLinkInvalid")),
  });
}

type ProfileLinkFormData = z.infer<ReturnType<typeof createProfileLinkSchema>>;

function errorMessage(error: unknown, t: TFunction) {
  const code = (error as { response?: { data?: { code?: { code?: string } } } })?.response?.data?.code?.code;

  if (code === "PROFILE_LINK_LIMIT_REACHED") {
    return t("user:linksLimitReached");
  }

  return t("user:error");
}

interface ProfileLinkFormProps {
  defaultValues?: ProfileLinkFormData;
  submitLabel: string;
  pending: boolean;
  onSubmit: (data: ProfileLinkRequest) => Promise<unknown>;
  onCancel?: () => void;
}

function ProfileLinkForm({ defaultValues, submitLabel, pending, onSubmit, onCancel }: ProfileLinkFormProps) {
  const { t } = useTranslation();

  const schema = useMemo(() => createProfileLinkSchema(t), [t]);

  const form = useForm<ProfileLinkFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { label: "", url: "" },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit({ label: data.label, url: data.url });

    if (!defaultValues) form.reset({ label: "", url: "" });
  });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="profile-link-label">{t("user:linkLabel")}</FieldLabel>

          <Input
            id="profile-link-label"
            placeholder={t("user:linkLabelPlaceholder")}
            aria-invalid={!!form.formState.errors.label}
            {...form.register("label")}
          />

          {form.formState.errors.label?.message && <FieldError>{form.formState.errors.label.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="profile-link-url">{t("user:linkUrl")}</FieldLabel>

          <Input
            id="profile-link-url"
            placeholder="https://"
            aria-invalid={!!form.formState.errors.url}
            {...form.register("url")}
          />

          {form.formState.errors.url?.message && <FieldError>{form.formState.errors.url.message}</FieldError>}
        </Field>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            {t("common:cancel")}
          </Button>
        )}

        <Button type="submit" size="sm" disabled={pending}>
          {pending && <Icon icon="eos-icons:loading" className="size-4" />}

          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

interface LinksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ApiTypes.User;
}

export function LinksModal({ open, onOpenChange, user }: LinksModalProps) {
  const { t } = useTranslation();

  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  const createLink = useCreateProfileLink(user.username);
  const updateLink = useUpdateProfileLink(user.username);
  const deleteLink = useDeleteProfileLink(user.username);
  const reorderLinks = useReorderProfileLinks(user.username);

  const links = user.profile.links ?? [];

  const handleCreateLink = async (data: ProfileLinkRequest) => {
    try {
      await createLink.mutateAsync(data);
    } catch (error) {
      toast.error(errorMessage(error, t));
    }
  };

  const handleUpdateLink = async (linkId: string, data: ProfileLinkRequest) => {
    try {
      await updateLink.mutateAsync({ linkId, ...data });

      setEditingLinkId(null);
    } catch (error) {
      toast.error(errorMessage(error, t));
    }
  };

  const handleMoveLink = async (index: number, direction: -1 | 1) => {
    const target = index + direction;

    if (target < 0 || target >= links.length) return;

    const linkIds = links.map((link) => link.id);
    [linkIds[index], linkIds[target]] = [linkIds[target], linkIds[index]];

    try {
      await reorderLinks.mutateAsync(linkIds);
    } catch (error) {
      toast.error(errorMessage(error, t));
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteLink.mutateAsync(linkId);
    } catch (error) {
      toast.error(errorMessage(error, t));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("user:linksEdit")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("user:noLinks")}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {links.map((link, index) => {
                const resolved = resolveLink(link.url);

                return editingLinkId === link.id ? (
                  <li key={link.id}>
                    <ProfileLinkForm
                      defaultValues={{ label: link.label, url: link.url }}
                      submitLabel={t("common:save")}
                      pending={updateLink.isPending}
                      onSubmit={(data) => handleUpdateLink(link.id, data)}
                      onCancel={() => setEditingLinkId(null)}
                    />
                  </li>
                ) : (
                  <li
                    key={link.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Icon icon={resolved.icon} className="size-5 shrink-0 text-muted-foreground" />

                      <div className="min-w-0">
                        <p className="truncate font-medium">{link.label}</p>

                        <p className="truncate text-sm text-muted-foreground">{resolved.platform ?? link.url}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t("user:setupMoveUp")}
                        disabled={index === 0 || reorderLinks.isPending}
                        onClick={() => handleMoveLink(index, -1)}
                      >
                        <Icon icon="lucide:chevron-up" className="size-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t("user:setupMoveDown")}
                        disabled={index === links.length - 1 || reorderLinks.isPending}
                        onClick={() => handleMoveLink(index, 1)}
                      >
                        <Icon icon="lucide:chevron-down" className="size-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t("user:linksEditLink")}
                        onClick={() => setEditingLinkId(link.id)}
                      >
                        <Icon icon="lucide:pencil" className="size-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t("common:delete")}
                        onClick={() => handleDeleteLink(link.id)}
                      >
                        <Icon icon="lucide:trash-2" className="size-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <ProfileLinkForm
            submitLabel={t("user:linksAddLink")}
            pending={createLink.isPending}
            onSubmit={handleCreateLink}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
