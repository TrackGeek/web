import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "@unpic/react";
import type { TFunction } from "i18next";
import { useEffect, useMemo } from "react";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import { Field, FieldError, FieldLabel } from "@/components/ui/field.tsx";
import { RatingGroupAdvanced } from "@/components/ui/rating-group-advanced.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { REVIEW_CONTENT, type ReviewContentConfig, useUpdateReview } from "@/hooks/review.ts";
import type { ApiTypes } from "@/lib/api.ts";

const SUMMARY_MAX_LENGTH = 500;
const STORY_MAX_LENGTH = 500;
const NOTES_MAX_LENGTH = 1000;

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: ApiTypes.ReviewContentType;
  review: ApiTypes.Review;
  userId: string;
  mediaTitle: string;
  mediaImage: string;
  onSaved?: () => void;
}

const toRating = (value: unknown): string => (value === null || value === undefined ? "0" : String(Number(value)));

function createReviewSchema(t: TFunction, config: ReviewContentConfig) {
  const shape: Record<string, z.ZodTypeAny> = {
    overall: z.string(),
    summary: z.string().trim().max(SUMMARY_MAX_LENGTH, t("feed:reviewSummaryMax")),
    notes: z.string().trim().max(NOTES_MAX_LENGTH, t("feed:reviewNotesMax")),
    recommended: z.boolean(),
  };

  for (const criterion of config.criteria) {
    shape[criterion.field] = z.string();
  }

  if (config.hasStory) {
    shape.story = z.string().trim().max(STORY_MAX_LENGTH, t("feed:reviewStoryMax"));
  }

  return z.object(shape);
}

type ReviewFormData = Record<string, string | boolean>;

export function ReviewModal({
  open,
  onOpenChange,
  contentType,
  review,
  userId,
  mediaTitle,
  mediaImage,
  onSaved,
}: ReviewModalProps) {
  const { t } = useTranslation();
  const config = REVIEW_CONTENT[contentType];
  const { criteria, hasStory } = config;

  const updateReview = useUpdateReview(contentType, userId);

  const schema = useMemo(() => createReviewSchema(t, config), [t, config]);

  const buildDefaults = useMemo<() => ReviewFormData>(() => {
    return () => {
      const source = review as unknown as Record<string, unknown>;

      const values: ReviewFormData = {
        overall: toRating(review.overall),
        summary: review.summary ?? "",
        notes: review.notes ?? "",
        recommended: !!review.recommended,
      };

      for (const criterion of criteria) {
        values[criterion.field] = toRating(source[criterion.field]);
      }

      if (hasStory) {
        values.story = review.story ?? "";
      }

      return values;
    };
  }, [review, criteria, hasStory]);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(schema) as Resolver<ReviewFormData>,
    defaultValues: buildDefaults(),
  });

  useEffect(() => {
    if (open) form.reset(buildDefaults());
  }, [open, buildDefaults, form.reset]);

  const summary = String(form.watch("summary") ?? "");
  const notes = String(form.watch("notes") ?? "");
  const story = String(form.watch("story") ?? "");

  const handleSubmit = form.handleSubmit(async (data) => {
    const payload: Record<string, unknown> = {
      [`${config.mediaKey}Id`]: review[config.mediaKey]?.id,
      overall: Number(data.overall),
      summary: String(data.summary).trim() || undefined,
      notes: String(data.notes).trim() || undefined,
      recommended: Boolean(data.recommended),
    };

    for (const criterion of criteria) {
      payload[criterion.field] = Number(data[criterion.field] ?? "0");
    }

    if (hasStory) {
      payload.story = String(data.story ?? "").trim() || undefined;
    }

    await updateReview.mutateAsync({ reviewId: review.id, payload });

    onOpenChange(false);
    onSaved?.();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="h-48 p-4 flex flex-row items-center bg-cover bg-center px-6 relative rounded-t-lg">
          {mediaImage && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center rounded-t-lg"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url("${mediaImage}")`,
                }}
              />
              <div className="absolute inset-0 backdrop-blur-sm bg-black/20 rounded-t-lg" />
            </>
          )}

          {mediaImage && (
            <Image
              src={mediaImage}
              width={96}
              height={128}
              alt="Cover"
              className="w-24 h-32 object-cover rounded-lg shadow-2xl relative z-10 border-2 border-white/30"
            />
          )}
          <div className="flex-1 px-6 relative z-10">
            <DialogTitle className="text-white font-bold text-2xl drop-shadow-lg">{mediaTitle}</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 px-6 py-2 flex flex-col gap-4">
            <div className="rounded-lg p-4 border border-border/50">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-foreground">{t("feed:overall")}</h3>
                <Controller
                  control={form.control}
                  name="overall"
                  render={({ field }) => (
                    <RatingGroupAdvanced
                      max={5}
                      allowHalf
                      allowClear
                      value={String(field.value ?? "0")}
                      onValueChange={field.onChange}
                    />
                  )}
                />
              </div>

              {criteria.length > 0 && (
                <>
                  <hr className="my-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {criteria.map((criterion) => (
                      <div key={criterion.field} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{t(`feed:criteries.${criterion.labelKey}`)}</span>
                        <Controller
                          control={form.control}
                          name={criterion.field}
                          render={({ field }) => (
                            <RatingGroupAdvanced
                              max={5}
                              allowHalf
                              allowClear
                              value={String(field.value ?? "0")}
                              onValueChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Field>
              <FieldLabel htmlFor="summary" className="text-sm font-medium">
                {t("feed:summary")}
              </FieldLabel>
              <Textarea
                id="summary"
                placeholder={t("feed:summaryPlaceholder")}
                className="resize-none min-h-25"
                maxLength={SUMMARY_MAX_LENGTH}
                aria-invalid={Boolean(form.formState.errors.summary)}
                {...form.register("summary")}
              />
              <div className="flex items-center justify-between gap-2">
                {form.formState.errors.summary?.message ? (
                  <FieldError>{String(form.formState.errors.summary.message)}</FieldError>
                ) : (
                  <span />
                )}
                <span className="text-xs text-muted-foreground">
                  {summary.length}/{SUMMARY_MAX_LENGTH}
                </span>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="notes" className="text-sm font-medium">
                {t("feed:notes")}
              </FieldLabel>
              <Textarea
                id="notes"
                placeholder={t("feed:notesPlaceholder")}
                className="resize-none min-h-25"
                maxLength={NOTES_MAX_LENGTH}
                aria-invalid={Boolean(form.formState.errors.notes)}
                {...form.register("notes")}
              />
              <div className="flex items-center justify-between gap-2">
                {form.formState.errors.notes?.message ? (
                  <FieldError>{String(form.formState.errors.notes.message)}</FieldError>
                ) : (
                  <span />
                )}
                <span className="text-xs text-muted-foreground">
                  {notes.length}/{NOTES_MAX_LENGTH}
                </span>
              </div>
            </Field>

            {hasStory && (
              <Field>
                <FieldLabel htmlFor="story" className="text-sm font-medium">
                  {t("feed:story")}
                </FieldLabel>
                <Textarea
                  id="story"
                  placeholder={t("feed:storyPlaceholder")}
                  className="resize-none min-h-25"
                  maxLength={STORY_MAX_LENGTH}
                  aria-invalid={Boolean(form.formState.errors.story)}
                  {...form.register("story")}
                />
                <div className="flex items-center justify-between gap-2">
                  {form.formState.errors.story?.message ? (
                    <FieldError>{String(form.formState.errors.story.message)}</FieldError>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {story.length}/{STORY_MAX_LENGTH}
                  </span>
                </div>
              </Field>
            )}

            <Field orientation="horizontal" className="pb-4">
              <Controller
                control={form.control}
                name="recommended"
                render={({ field }) => (
                  <Checkbox
                    id="recommended"
                    checked={Boolean(field.value)}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                )}
              />
              <FieldLabel htmlFor="recommended" className="cursor-pointer text-sm">
                {t("feed:recommended")}
              </FieldLabel>
            </Field>
          </div>

          <div className="border-t border-border px-6 py-4 flex justify-between gap-3 bg-background rounded-b-lg">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("feed:cancel")}
            </Button>
            <Button type="submit" className="gap-2" disabled={updateReview.isPending}>
              {updateReview.isPending ? t("feed:saving") : t("feed:save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
