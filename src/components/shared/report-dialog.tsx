import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReport } from "@/hooks/report";
import type { ApiTypes } from "@/lib/api";

const REASONS: ApiTypes.ReportReason[] = ["Spam", "Harassment", "HateSpeech", "Inappropriate", "Other"];
const MAX_DETAILS = 1000;

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: ApiTypes.ReportTargetType;
  targetId: string;
}

export function ReportDialog({ open, onOpenChange, targetType, targetId }: ReportDialogProps) {
  const { t } = useTranslation();

  const createReport = useCreateReport();

  const schema = useMemo(
    () =>
      z.object({
        reason: z.enum(REASONS, { error: t("report:reasonRequired") }),
        details: z.string().trim().max(MAX_DETAILS, t("report:detailsTooLong")),
      }),
    [t],
  );

  const form = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { details: "" },
  });

  function handleOpenChange(value: boolean) {
    if (!value) form.reset({ details: "" });

    onOpenChange(value);
  }

  function handleSubmit({ reason, details }: z.output<typeof schema>) {
    createReport.mutate(
      { targetType, targetId, reason, details: details || undefined },
      {
        onSuccess: () => {
          toast.success(t("report:success"));
          handleOpenChange(false);
        },
        onError: () => toast.error(t("report:error")),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t(`report:targets.${targetType}`)}</DialogTitle>
            <DialogDescription>{t("report:description")}</DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel>{t("report:reasonLabel")}</FieldLabel>
            <Controller
              control={form.control}
              name="reason"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" aria-invalid={Boolean(form.formState.errors.reason)}>
                    <SelectValue placeholder={t("report:reasonPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {REASONS.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {t(`report:reasons.${reason}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.reason?.message && <FieldError>{form.formState.errors.reason.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>{t("report:detailsLabel")}</FieldLabel>
            <Textarea
              placeholder={t("report:detailsPlaceholder")}
              className="min-h-24 resize-none"
              maxLength={MAX_DETAILS}
              aria-invalid={Boolean(form.formState.errors.details)}
              {...form.register("details")}
            />
            {form.formState.errors.details?.message && <FieldError>{form.formState.errors.details.message}</FieldError>}
          </Field>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common:cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createReport.isPending}>
              {t("common:send")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
