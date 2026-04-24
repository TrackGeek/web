import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/auth";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const Route = createFileRoute("/reset-password")({
  component: RouteComponent,
  validateSearch: (search) => {
    const schema = z.object({
      token: z.string(),
    });

    const result = schema.safeParse(search);

    return {
      token: result.success ? result.data.token : undefined,
    };
  },
  beforeLoad: ({ search }) => {
    if (!search.token) {
      throw redirect({ to: "/", search: { landing: "true" } });
    }
  },
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { token } = Route.useSearch();

  const { t } = useTranslation();

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  async function handleResetPassword(formData: ResetPasswordFormData) {
    const resetPasswordResponse = await resetPassword({
      newPassword: formData.password,
      token,
    });

    if (resetPasswordResponse.error) {
      toast.error(t("auth:resetPassword.then.error"));
    } else {
      toast.success(t("auth:resetPassword.then.success"));
    }

    resetPasswordForm.reset();
    resetPasswordForm.clearErrors();

    navigate({ to: "/", search: { landing: "true" } });
  }

  return (
    <div className="size-full my-40 flex items-center justify-center">
      <div className="max-w-md w-full flex flex-col border-border border bg-card rounded-2xl p-6 col-span-1">
        <Field className="gap-2">
          <FieldLabel>{t("auth:resetPassword.title")}</FieldLabel>

          <FieldDescription>{t("auth:resetPassword.description")}</FieldDescription>

          <form className="flex flex-col gap-2" onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)}>
            <Field>
              <FieldLabel htmlFor="password">{t("auth:password")}</FieldLabel>

              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={resetPasswordForm.formState.isSubmitting}
                {...resetPasswordForm.register("password")}
              />

              {resetPasswordForm.formState.errors.password?.message && (
                <FieldError>{resetPasswordForm.formState.errors.password?.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">{t("auth:confirmPassword")}</FieldLabel>

              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                disabled={resetPasswordForm.formState.isSubmitting}
                {...resetPasswordForm.register("confirmPassword")}
              />

              {resetPasswordForm.formState.errors.confirmPassword?.message && (
                <FieldError>{resetPasswordForm.formState.errors.confirmPassword?.message}</FieldError>
              )}
            </Field>

            <Button className="w-full mt-2" disabled={resetPasswordForm.formState.isSubmitting}>
              {resetPasswordForm.formState.isSubmitting ? (
                <Icon className="size-5" icon="eos-icons:loading" />
              ) : (
                <>
                  <Icon icon={"lucide:mail"} className="size-5" />

                  {t("auth:resetPassword.button")}
                </>
              )}
            </Button>
          </form>
        </Field>
      </div>
    </div>
  );
}
