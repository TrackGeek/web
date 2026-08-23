import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import type { TFunction } from "i18next";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useCreateWatchLink,
  useDeleteWatchLink,
  useReorderWatchLinks,
  useUpdateWatchLink,
  useWatchLinks,
} from "@/hooks/watch-link";
import { CONTENT_TYPE_ICONS, CONTENT_TYPE_LABELS } from "@/lib/content-types";
import { apiErrorMessage } from "@/lib/utils/api-error";
import {
  isKnownWatchLinkVariable,
  isSafeWatchLinkUrl,
  MAX_WATCH_LINK_URL_LENGTH,
  MAX_WATCH_LINKS,
  previewWatchLinkUrl,
  WATCH_LINK_CONTENT_TYPE,
  WATCH_LINK_MEDIA_TYPE,
  WATCH_LINK_MEDIA_TYPES,
  WATCH_LINK_VARIABLE_SUPPORT,
  WATCH_LINK_VARIABLES,
  type WatchLinkMediaType,
  type WatchLinkVariable,
  watchLinkVariableExample,
  watchLinkVariables,
} from "@/lib/watch-links";

const LABEL_MAX_LENGTH = 40;

function createWatchLinkSchema(t: TFunction) {
  return z.object({
    label: z.string().trim().min(1, t("user:linkLabelRequired")).max(LABEL_MAX_LENGTH, t("user:linkLabelMax")),
    url: z
      .string()
      .trim()
      .min(1, t("settings:watchLinks.urlInvalid"))
      .max(MAX_WATCH_LINK_URL_LENGTH, t("settings:watchLinks.urlTooLong", { count: MAX_WATCH_LINK_URL_LENGTH }))
      .refine((value) => isSafeWatchLinkUrl(value), t("settings:watchLinks.urlInvalid"))
      .refine(
        (value) => watchLinkVariables(value).every(isKnownWatchLinkVariable),
        t("settings:watchLinks.urlUnknownVariable"),
      ),
    contentTypes: z.array(z.enum(["Movie", "TVShow", "Anime"])).min(1, t("settings:watchLinks.contentTypesRequired")),
  });
}

type WatchLinkFormData = z.infer<ReturnType<typeof createWatchLinkSchema>>;

function mediaTypeLabelKey(mediaType: WatchLinkMediaType) {
  return CONTENT_TYPE_LABELS[mediaType];
}

interface WatchLinkFormProps {
  formId: string;
  defaultValues?: WatchLinkFormData;
  submitLabel: string;
  pending: boolean;
  onSubmit: (data: WatchLinkFormData) => Promise<unknown>;
  onCancel?: () => void;
}

function WatchLinkForm({ formId, defaultValues, submitLabel, pending, onSubmit, onCancel }: WatchLinkFormProps) {
  const { t } = useTranslation();

  const schema = useMemo(() => createWatchLinkSchema(t), [t]);

  const emptyValues: WatchLinkFormData = { label: "", url: "", contentTypes: ["Movie", "TVShow", "Anime"] };

  const form = useForm<WatchLinkFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? emptyValues,
  });

  const urlRef = useRef<HTMLInputElement | null>(null);

  const { ref: registerUrlRef, ...urlField } = form.register("url");

  const url = form.watch("url");
  const contentTypes = form.watch("contentTypes");

  const preview = url.trim() ? previewWatchLinkUrl(url) : "";

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);

    if (!defaultValues) form.reset(emptyValues);
  });

  function insertVariable(variable: WatchLinkVariable) {
    const input = urlRef.current;
    const token = `%${variable}%`;
    const current = form.getValues("url");

    if (!input) {
      form.setValue("url", `${current}${token}`, { shouldValidate: true });

      return;
    }

    const start = input.selectionStart ?? current.length;
    const end = input.selectionEnd ?? current.length;
    const next = `${current.slice(0, start)}${token}${current.slice(end)}`;

    form.setValue("url", next, { shouldValidate: true });

    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + token.length, start + token.length);
    });
  }

  function toggleContentType(mediaType: WatchLinkMediaType, checked: boolean) {
    const contentType = WATCH_LINK_CONTENT_TYPE[mediaType];

    const next = checked
      ? WATCH_LINK_MEDIA_TYPES.map((type) => WATCH_LINK_CONTENT_TYPE[type]).filter(
          (type) => type === contentType || contentTypes.includes(type),
        )
      : contentTypes.filter((type) => type !== contentType);

    form.setValue("contentTypes", next, { shouldValidate: true });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${formId}-label`}>{t("user:linkLabel")}</FieldLabel>

          <Input
            id={`${formId}-label`}
            placeholder={t("settings:watchLinks.labelPlaceholder")}
            aria-invalid={!!form.formState.errors.label}
            {...form.register("label")}
          />

          {form.formState.errors.label?.message && <FieldError>{form.formState.errors.label.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor={`${formId}-url`}>{t("user:linkUrl")}</FieldLabel>

          <Input
            id={`${formId}-url`}
            placeholder="stremio://detail/movie/%ID_IMDB%"
            spellCheck={false}
            autoComplete="off"
            className="font-mono text-xs"
            aria-invalid={!!form.formState.errors.url}
            {...urlField}
            ref={(element) => {
              registerUrlRef(element);

              urlRef.current = element;
            }}
          />

          {form.formState.errors.url?.message && <FieldError>{form.formState.errors.url.message}</FieldError>}
        </Field>
      </div>

      <Field>
        <FieldLabel>{t("settings:watchLinks.contentTypes")}</FieldLabel>

        <div className="flex flex-wrap gap-4">
          {WATCH_LINK_MEDIA_TYPES.map((mediaType) => (
            <Label key={mediaType} htmlFor={`${formId}-${mediaType}`} className="flex items-center gap-2">
              <Checkbox
                id={`${formId}-${mediaType}`}
                checked={contentTypes.includes(WATCH_LINK_CONTENT_TYPE[mediaType])}
                onCheckedChange={(checked) => toggleContentType(mediaType, checked === true)}
              />

              <Icon icon={CONTENT_TYPE_ICONS[mediaType]} className="size-4 text-muted-foreground" />

              {t(mediaTypeLabelKey(mediaType))}
            </Label>
          ))}
        </div>

        {form.formState.errors.contentTypes?.message && (
          <FieldError>{form.formState.errors.contentTypes.message}</FieldError>
        )}
      </Field>

      {preview && (
        <p className="break-all rounded-md bg-muted/40 p-2 font-mono text-muted-foreground text-xs">
          {t("settings:watchLinks.preview")}: {preview}
        </p>
      )}

      <VariableReference onInsert={insertVariable} />

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

interface VariableReferenceProps {
  onInsert: (variable: WatchLinkVariable) => void;
}

function VariableReference({ onInsert }: VariableReferenceProps) {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="w-fit gap-1 text-muted-foreground text-xs">
          <Icon icon={open ? "lucide:chevron-down" : "lucide:chevron-right"} className="size-3.5" />

          {t("settings:watchLinks.variablesTitle")}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <ul className="mt-2 flex flex-col gap-1">
          {WATCH_LINK_VARIABLES.map((variable) => (
            <li key={variable} className="flex flex-wrap items-center gap-2 text-xs">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 font-mono text-xs"
                onClick={() => onInsert(variable)}
              >
                %{variable}%
              </Button>

              <span className="font-mono text-muted-foreground">{watchLinkVariableExample(variable)}</span>

              <span className="flex items-center gap-1">
                {WATCH_LINK_VARIABLE_SUPPORT[variable].map((mediaType) => (
                  <Tooltip key={mediaType}>
                    <TooltipTrigger asChild>
                      <span>
                        <Icon icon={CONTENT_TYPE_ICONS[mediaType]} className="size-3.5 text-muted-foreground" />
                      </span>
                    </TooltipTrigger>

                    <TooltipContent>{t(mediaTypeLabelKey(mediaType))}</TooltipContent>
                  </Tooltip>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function WatchLinksCard() {
  const { t } = useTranslation();

  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  const watchLinksQuery = useWatchLinks();

  const createLink = useCreateWatchLink();
  const updateLink = useUpdateWatchLink();
  const deleteLink = useDeleteWatchLink();
  const reorderLinks = useReorderWatchLinks();

  const links = watchLinksQuery.data ?? [];

  async function handleCreate(data: WatchLinkFormData) {
    try {
      await createLink.mutateAsync(data);
    } catch (error) {
      toast.error(apiErrorMessage(t, error));
    }
  }

  async function handleUpdate(linkId: string, data: Partial<WatchLinkFormData> & { enabled?: boolean }) {
    try {
      await updateLink.mutateAsync({ linkId, ...data });

      setEditingLinkId(null);
    } catch (error) {
      toast.error(apiErrorMessage(t, error));
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;

    if (target < 0 || target >= links.length) return;

    const linkIds = links.map((link) => link.id);
    [linkIds[index], linkIds[target]] = [linkIds[target], linkIds[index]];

    try {
      await reorderLinks.mutateAsync(linkIds);
    } catch (error) {
      toast.error(apiErrorMessage(t, error));
    }
  }

  async function handleDelete(linkId: string) {
    try {
      await deleteLink.mutateAsync(linkId);
    } catch (error) {
      toast.error(apiErrorMessage(t, error));
    }
  }

  return (
    <Card>
      <CardHeader className="gap-2">
        <CardTitle>
          <Icon icon="lucide:link" className="size-5" />

          {t("settings:watchLinks.title")}
        </CardTitle>

        <CardDescription>{t("settings:watchLinks.description")}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {links.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("settings:watchLinks.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {links.map((link, index) =>
              editingLinkId === link.id ? (
                <li key={link.id}>
                  <WatchLinkForm
                    formId={`watch-link-${link.id}`}
                    defaultValues={{ label: link.label, url: link.url, contentTypes: link.contentTypes }}
                    submitLabel={t("common:save")}
                    pending={updateLink.isPending}
                    onSubmit={(data) => handleUpdate(link.id, data)}
                    onCancel={() => setEditingLinkId(null)}
                  />
                </li>
              ) : (
                <li key={link.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{link.label}</p>

                    <p className="truncate font-mono text-muted-foreground text-xs">{link.url}</p>

                    <div className="mt-1 flex flex-wrap gap-1">
                      {link.contentTypes.map((contentType) => (
                        <Badge key={contentType} variant="secondary" className="gap-1">
                          <Icon icon={CONTENT_TYPE_ICONS[WATCH_LINK_MEDIA_TYPE[contentType]]} className="size-3" />

                          {t(mediaTypeLabelKey(WATCH_LINK_MEDIA_TYPE[contentType]))}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Switch
                      checked={link.enabled}
                      aria-label={t("settings:watchLinks.toggle")}
                      disabled={updateLink.isPending}
                      onCheckedChange={(checked) => handleUpdate(link.id, { enabled: checked })}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t("user:setupMoveUp")}
                      disabled={index === 0 || reorderLinks.isPending}
                      onClick={() => handleMove(index, -1)}
                    >
                      <Icon icon="lucide:chevron-up" className="size-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t("user:setupMoveDown")}
                      disabled={index === links.length - 1 || reorderLinks.isPending}
                      onClick={() => handleMove(index, 1)}
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
                      disabled={deleteLink.isPending}
                      onClick={() => handleDelete(link.id)}
                    >
                      <Icon icon="lucide:trash-2" className="size-4" />
                    </Button>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}

        {links.length >= MAX_WATCH_LINKS ? (
          <p className="text-muted-foreground text-sm">
            {t("settings:watchLinks.limitReached", { count: MAX_WATCH_LINKS })}
          </p>
        ) : (
          <WatchLinkForm
            formId="watch-link-new"
            submitLabel={t("user:linksAddLink")}
            pending={createLink.isPending}
            onSubmit={handleCreate}
          />
        )}
      </CardContent>
    </Card>
  );
}
