import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { Image } from "@unpic/react";
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
import { useUploadImage, validateScreenshotFile } from "@/hooks/game";
import {
  type SetupItemRequest,
  useAddSetupPhoto,
  useCreateSetupItem,
  useDeleteSetupItem,
  useDeleteSetupPhoto,
  useReorderSetupItems,
  useUpdateSetupItem,
} from "@/hooks/setup";
import type { ApiTypes } from "@/lib/api";

const NAME_MAX_LENGTH = 100;
const BRAND_MAX_LENGTH = 60;

interface UploadingPhoto {
  tempId: string;
  previewUrl: string;
}

function createSetupItemSchema(t: TFunction) {
  return z.object({
    name: z.string().trim().min(1, t("user:setupNameRequired")).max(NAME_MAX_LENGTH, t("user:setupNameMax")),
    brand: z.string().trim().max(BRAND_MAX_LENGTH, t("user:setupBrandMax")),
    link: z.union([z.literal(""), z.string().trim().url(t("user:setupLinkInvalid"))]),
  });
}

function createSetupTitleSchema(t: TFunction) {
  return z.object({
    name: z.string().trim().min(1, t("user:setupTitleRequired")).max(NAME_MAX_LENGTH, t("user:setupNameMax")),
  });
}

type SetupItemFormData = z.infer<ReturnType<typeof createSetupItemSchema>>;
type SetupTitleFormData = z.infer<ReturnType<typeof createSetupTitleSchema>>;

function errorMessage(error: unknown, t: TFunction) {
  const code = (error as { response?: { data?: { code?: { code?: string } } } })?.response?.data?.code?.code;

  if (code === "SETUP_PHOTO_LIMIT_REACHED" || code === "SETUP_ITEM_LIMIT_REACHED") {
    return t("user:setupLimitReached");
  }

  return t("user:error");
}

interface SetupItemFormProps {
  defaultValues?: SetupItemFormData;
  submitLabel: string;
  pending: boolean;
  onSubmit: (data: SetupItemRequest) => Promise<unknown>;
  onCancel?: () => void;
}

function SetupItemForm({ defaultValues, submitLabel, pending, onSubmit, onCancel }: SetupItemFormProps) {
  const { t } = useTranslation();

  const schema = useMemo(() => createSetupItemSchema(t), [t]);

  const form = useForm<SetupItemFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { name: "", brand: "", link: "" },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit({ name: data.name, brand: data.brand, link: data.link });

    if (!defaultValues) form.reset({ name: "", brand: "", link: "" });
  });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="setup-item-name">{t("user:setupComponent")}</FieldLabel>

          <Input
            id="setup-item-name"
            placeholder={t("user:setupComponentPlaceholder")}
            aria-invalid={!!form.formState.errors.name}
            {...form.register("name")}
          />

          {form.formState.errors.name?.message && <FieldError>{form.formState.errors.name.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="setup-item-brand">{t("user:setupBrand")}</FieldLabel>

          <Input
            id="setup-item-brand"
            placeholder={t("user:setupBrandPlaceholder")}
            aria-invalid={!!form.formState.errors.brand}
            {...form.register("brand")}
          />

          {form.formState.errors.brand?.message && <FieldError>{form.formState.errors.brand.message}</FieldError>}
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="setup-item-link">{t("user:setupLink")}</FieldLabel>

        <Input
          id="setup-item-link"
          placeholder="https://"
          aria-invalid={!!form.formState.errors.link}
          {...form.register("link")}
        />

        {form.formState.errors.link?.message && <FieldError>{form.formState.errors.link.message}</FieldError>}
      </Field>

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

interface SetupTitleFormProps {
  defaultValue?: string;
  submitLabel: string;
  pending: boolean;
  onSubmit: (name: string) => Promise<unknown>;
  onCancel?: () => void;
}

function SetupTitleForm({ defaultValue, submitLabel, pending, onSubmit, onCancel }: SetupTitleFormProps) {
  const { t } = useTranslation();

  const schema = useMemo(() => createSetupTitleSchema(t), [t]);

  const form = useForm<SetupTitleFormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultValue ?? "" },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data.name);

    if (defaultValue === undefined) form.reset({ name: "" });
  });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <Field>
        <FieldLabel htmlFor="setup-title-name">{t("user:setupTitle")}</FieldLabel>

        <Input
          id="setup-title-name"
          placeholder={t("user:setupTitlePlaceholder")}
          aria-invalid={!!form.formState.errors.name}
          {...form.register("name")}
        />

        {form.formState.errors.name?.message && <FieldError>{form.formState.errors.name.message}</FieldError>}
      </Field>

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

interface SetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ApiTypes.User;
}

export function SetupModal({ open, onOpenChange, user }: SetupModalProps) {
  const { t } = useTranslation();

  const [uploadingPhotos, setUploadingPhotos] = useState<UploadingPhoto[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [addingTitle, setAddingTitle] = useState(false);

  const uploadImage = useUploadImage();
  const addPhoto = useAddSetupPhoto(user.username);
  const deletePhoto = useDeleteSetupPhoto(user.username);
  const createItem = useCreateSetupItem(user.username);
  const updateItem = useUpdateSetupItem(user.username);
  const deleteItem = useDeleteSetupItem(user.username);
  const reorderItems = useReorderSetupItems(user.username);

  const photos = user.profile.setupPhotos ?? [];
  const items = user.profile.setupItems ?? [];

  const uploadPhoto = async (file: File) => {
    const tempId = crypto.randomUUID();
    const previewUrl = URL.createObjectURL(file);

    setUploadingPhotos((prev) => [...prev, { tempId, previewUrl }]);

    try {
      const url = await uploadImage.mutateAsync(file);

      await addPhoto.mutateAsync(url);
    } catch (error) {
      toast.error(errorMessage(error, t));
    } finally {
      setUploadingPhotos((prev) => prev.filter((photo) => photo.tempId !== tempId));
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    for (const file of Array.from(files)) {
      const error = validateScreenshotFile(file);

      if (error) {
        toast.error(t(error, { name: file.name }));
        continue;
      }

      void uploadPhoto(file);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deletePhoto.mutateAsync(photoId);
    } catch (error) {
      toast.error(errorMessage(error, t));
    }
  };

  const handleCreateItem = async (data: SetupItemRequest) => {
    try {
      await createItem.mutateAsync({
        name: data.name,
        brand: data.brand || undefined,
        link: data.link || undefined,
      });
    } catch (error) {
      toast.error(errorMessage(error, t));
    }
  };

  const handleCreateTitle = async (name: string) => {
    try {
      await createItem.mutateAsync({ type: "TITLE", name });

      setAddingTitle(false);
    } catch (error) {
      toast.error(errorMessage(error, t));
    }
  };

  const handleCreateDivider = async () => {
    try {
      await createItem.mutateAsync({ type: "DIVIDER" });
    } catch (error) {
      toast.error(errorMessage(error, t));
    }
  };

  const handleUpdateItem = async (itemId: string, data: SetupItemRequest) => {
    try {
      await updateItem.mutateAsync({ itemId, ...data });

      setEditingItemId(null);
    } catch (error) {
      toast.error(errorMessage(error, t));
    }
  };

  const handleUpdateTitle = async (itemId: string, name: string) => {
    try {
      await updateItem.mutateAsync({ itemId, name });

      setEditingItemId(null);
    } catch (error) {
      toast.error(errorMessage(error, t));
    }
  };

  const handleMoveItem = async (index: number, direction: -1 | 1) => {
    const target = index + direction;

    if (target < 0 || target >= items.length) return;

    const itemIds = items.map((item) => item.id);
    [itemIds[index], itemIds[target]] = [itemIds[target], itemIds[index]];

    try {
      await reorderItems.mutateAsync(itemIds);
    } catch (error) {
      toast.error(errorMessage(error, t));
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem.mutateAsync(itemId);
    } catch (error) {
      toast.error(errorMessage(error, t));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("user:setupEdit")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{t("user:setupPhotos")}</h3>

              <label className="cursor-pointer inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                <Icon icon="lucide:image-plus" className="size-4" />

                {t("user:setupAddPhoto")}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    handleFileSelect(event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>

            {photos.length === 0 && uploadingPhotos.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("user:setupNoPhotos")}</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative overflow-hidden rounded-lg border border-border aspect-video">
                    <Image className="size-full object-cover" src={photo.url} layout="fullWidth" alt="" />

                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      aria-label={t("common:delete")}
                      className="cursor-pointer absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                    >
                      <Icon icon="lucide:x" className="size-3.5" />
                    </button>
                  </div>
                ))}

                {uploadingPhotos.map((photo) => (
                  <div
                    key={photo.tempId}
                    className="relative overflow-hidden rounded-lg border border-border aspect-video"
                  >
                    <img className="size-full object-cover opacity-50" src={photo.previewUrl} alt="" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon icon="eos-icons:loading" className="size-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{t("user:setupComponents")}</h3>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAddingTitle(true)}
                  className="cursor-pointer inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  <Icon icon="lucide:heading" className="size-4" />

                  {t("user:setupAddTitle")}
                </button>

                <button
                  type="button"
                  onClick={handleCreateDivider}
                  disabled={createItem.isPending}
                  className="cursor-pointer inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline disabled:opacity-50"
                >
                  <Icon icon="lucide:minus" className="size-4" />

                  {t("user:setupAddDivider")}
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("user:setupNoComponents")}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {items.map((item, index) =>
                  editingItemId === item.id ? (
                    <li key={item.id}>
                      {item.type === "TITLE" ? (
                        <SetupTitleForm
                          defaultValue={item.name ?? ""}
                          submitLabel={t("common:save")}
                          pending={updateItem.isPending}
                          onSubmit={(name) => handleUpdateTitle(item.id, name)}
                          onCancel={() => setEditingItemId(null)}
                        />
                      ) : (
                        <SetupItemForm
                          defaultValues={{ name: item.name ?? "", brand: item.brand ?? "", link: item.link ?? "" }}
                          submitLabel={t("common:save")}
                          pending={updateItem.isPending}
                          onSubmit={(data) => handleUpdateItem(item.id, data)}
                          onCancel={() => setEditingItemId(null)}
                        />
                      )}
                    </li>
                  ) : (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                    >
                      {item.type === "DIVIDER" ? (
                        <div className="h-px flex-1 bg-border" />
                      ) : item.type === "TITLE" ? (
                        <p className="truncate text-sm font-semibold uppercase text-muted-foreground">{item.name}</p>
                      ) : (
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item.name}</p>

                          {item.brand && <p className="truncate text-sm text-muted-foreground">{item.brand}</p>}

                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="truncate text-sm text-primary hover:underline"
                            >
                              {item.link}
                            </a>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={t("user:setupMoveUp")}
                          disabled={index === 0 || reorderItems.isPending}
                          onClick={() => handleMoveItem(index, -1)}
                        >
                          <Icon icon="lucide:chevron-up" className="size-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={t("user:setupMoveDown")}
                          disabled={index === items.length - 1 || reorderItems.isPending}
                          onClick={() => handleMoveItem(index, 1)}
                        >
                          <Icon icon="lucide:chevron-down" className="size-4" />
                        </Button>

                        {item.type !== "DIVIDER" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={item.type === "TITLE" ? t("user:setupEditTitle") : t("user:setupEditItem")}
                            onClick={() => setEditingItemId(item.id)}
                          >
                            <Icon icon="lucide:pencil" className="size-4" />
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={t("common:delete")}
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Icon icon="lucide:trash-2" className="size-4" />
                        </Button>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            )}

            {addingTitle && (
              <SetupTitleForm
                submitLabel={t("user:setupAddTitle")}
                pending={createItem.isPending}
                onSubmit={handleCreateTitle}
                onCancel={() => setAddingTitle(false)}
              />
            )}

            <SetupItemForm
              submitLabel={t("user:setupAddItem")}
              pending={createItem.isPending}
              onSubmit={handleCreateItem}
            />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
