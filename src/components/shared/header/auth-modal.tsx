import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { type JSX, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getLastUsedLoginMethod, requestPasswordReset, signIn, signUp } from "@/lib/auth";
import { type AuthModalTab, setAuthModalOpen, useAuthModal } from "@/lib/auth-modal";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

const providers: { id: string; icon: JSX.Element }[] = [
  { id: "discord", icon: <Icon icon={"simple-icons:discord"} className="size-6" /> },
  { id: "github", icon: <Icon icon={"simple-icons:github"} className="size-5" /> },
  { id: "google", icon: <Icon className="size-6" icon="fa7-brands:google" /> },
  { id: "kick", icon: <Icon icon={"simple-icons:kick"} className="size-5" /> },
  { id: "twitch", icon: <Icon icon={"simple-icons:twitch"} className="size-5" /> },
  { id: "twitter", icon: <Icon icon={"simple-icons:x"} className="size-5" /> },
  { id: "notion", icon: <Icon icon={"simple-icons:notion"} className="size-5" /> },
  { id: "microsoft", icon: <Icon className="size-6" icon="fluent:store-microsoft-20-filled" /> },
  { id: "spotify", icon: <Icon icon={"simple-icons:spotify"} className="size-5" /> },
  { id: "slack", icon: <Icon className="size-5" icon="mdi:slack" /> },
  // { id: "tiktok", icon: <SiTiktok className="size-5" /> },
  // { id: "roblox", icon: <SiRoblox className="size-5" /> },
  // { id: "apple", icon: <SiApple className="size-5" /> },
  // { id: "facebook", icon: <SiFacebook className="size-5" /> },
  // { id: "reddit", icon: <SiReddit className="size-5" /> },
  // { id: "linkedin", icon: <Linkedin className="size-5" /> },
];

const passwordSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const magicLinkSchema = z.object({
  email: z.email(),
});

const registerSchema = z
  .object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const requestPasswordResetSchema = z.object({
  email: z.email(),
});

type MagicLinkFormData = z.infer<typeof magicLinkSchema>;

type PasswordFormData = z.infer<typeof passwordSchema>;

type RegisterFormData = z.infer<typeof registerSchema>;

type RequestPasswordResetFormData = z.infer<typeof requestPasswordResetSchema>;

export function AuthModal() {
  const { t } = useTranslation();

  const { open: authModalOpen, tab } = useAuthModal();
  const [lastMethod, setLastMethod] = useState<string | null>(null);
  const [authTab, setAuthTab] = useState<AuthModalTab>("login");
  const [isRequestForgotPassword, setIsRequestForgotPassword] = useState(false);

  const magicLinkForm = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkSchema),
    mode: "onChange",
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const requestPasswordResetForm = useForm<RequestPasswordResetFormData>({
    resolver: zodResolver(requestPasswordResetSchema),
    mode: "onChange",
  });

  async function handleLoginWithMagicLink(formData: MagicLinkFormData) {
    const data = await signIn.magicLink({
      email: formData.email,
      callbackURL: window.location.href,
    });

    if (data.error) {
      toast.error(t("auth:failedToLogin"));

      return;
    }

    toast.success(t("auth:magicLinkSent"));

    magicLinkForm.reset();
    magicLinkForm.clearErrors();
  }

  async function handleLoginWithPassword(formData: PasswordFormData) {
    const data = await signIn.email({
      email: formData.email,
      password: formData.password,
    });

    if (data.error) {
      toast.error(t("auth:failedToLogin"));

      return;
    }

    toast.success(t("auth:loginSuccessful"));

    passwordForm.reset();
    passwordForm.clearErrors();
  }

  async function handleRegister(formData: RegisterFormData) {
    const registerData = await signUp.email({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    if (registerData.error) {
      if (registerData?.error?.code?.includes("USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL")) {
        toast.error(t("api:betterAuth.USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"));
      } else {
        toast.error(t("auth:failedToRegister"));
      }

      return;
    }

    const loginData = await signIn.email({
      email: formData.email,
      password: formData.password,
    });

    if (loginData.error) {
      toast.error(t("auth:failedToLogin"));

      return;
    }

    toast.success(t("auth:loginSuccessful"));

    registerForm.reset();
    registerForm.clearErrors();

    setAuthModalOpen(false);
  }

  async function handleLoginWithProvider(provider: string) {
    const data = await signIn.social({
      provider,
      callbackURL: window.location.href,
    });

    if (data.error) {
      toast.error(t("auth:failedToLogin"));

      return;
    }
  }

  async function handleRequestPasswordReset(formData: RequestPasswordResetFormData) {
    const data = await requestPasswordReset({
      email: formData.email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (data.error) {
      toast.error(t("auth:requestPasswordReset.then.error"));
    } else {
      toast.success(t("auth:requestPasswordReset.then.success"));
    }

    requestPasswordResetForm.reset();
    requestPasswordResetForm.clearErrors();

    setAuthModalOpen(false);

    setTimeout(() => {
      if (isRequestForgotPassword) {
        setIsRequestForgotPassword(false);
      }
    }, 500);
  }

  useEffect(() => {
    setLastMethod(getLastUsedLoginMethod());
  }, []);

  useEffect(() => {
    if (authModalOpen) setAuthTab(tab);
  }, [authModalOpen, tab]);

  return (
    <Dialog
      open={authModalOpen}
      onOpenChange={(open) => {
        if (!open) {
          magicLinkForm.reset();
          magicLinkForm.clearErrors();

          passwordForm.reset();
          passwordForm.clearErrors();

          registerForm.reset();
          registerForm.clearErrors();

          requestPasswordResetForm.reset();
          requestPasswordResetForm.clearErrors();
        }

        setAuthModalOpen(open);

        setTimeout(() => {
          if (isRequestForgotPassword) {
            setIsRequestForgotPassword(false);
          }
        }, 500);
      }}
    >
      <DialogTrigger asChild>
        <Button className="font-semibold">
          <Icon icon={"lucide:log-in"} />

          {t("auth:login")}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {!isRequestForgotPassword ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("auth:welcome.title")}</DialogTitle>

              <DialogDescription>{t("auth:welcome.description")}</DialogDescription>
            </DialogHeader>

            <Tabs value={authTab} onValueChange={(value) => setAuthTab(value as AuthModalTab)}>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <TabsList className="w-full max-sm:overflow-x-auto items-center justify-start">
                    <TabsTrigger value="login">{t("auth:login")}</TabsTrigger>
                    <TabsTrigger value="register">{t("auth:register")}</TabsTrigger>
                  </TabsList>
                </div>

                <div className="grid grid-cols-5 gap-2 w-full">
                  {providers
                    .sort((a, b) => a.id.localeCompare(b.id))
                    .map((provider) => (
                      <Tooltip key={provider.id}>
                        <TooltipTrigger asChild>
                          <Button
                            key={provider.id}
                            variant="outline"
                            className={cn(lastMethod === provider.id && "bg-primary/10 border-primary border-2")}
                            onClick={() => handleLoginWithProvider(provider.id)}
                          >
                            {provider.icon}
                          </Button>
                        </TooltipTrigger>

                        <TooltipContent side="bottom">{t(`auth:providers.${provider.id}`)}</TooltipContent>
                      </Tooltip>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />

                  <span className="text-sm text-muted-foreground">{t("auth:or")}</span>

                  <Separator className="flex-1" />
                </div>

                <TabsContent value="login">
                  <Tabs defaultValue="password">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <TabsList className="w-full max-sm:overflow-x-auto items-center justify-start">
                        <TabsTrigger value="password">{t("auth:password")}</TabsTrigger>
                        <TabsTrigger value="magicLink">{t("auth:magicLink")}</TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="password">
                      <form
                        className="flex flex-col gap-2"
                        onSubmit={passwordForm.handleSubmit(handleLoginWithPassword)}
                      >
                        <Field>
                          <FieldLabel htmlFor="email">{t("auth:email")}</FieldLabel>

                          <Input
                            id="email"
                            type="email"
                            placeholder="johndoe@example.com"
                            disabled={passwordForm.formState.isSubmitting}
                            {...passwordForm.register("email")}
                          />

                          {passwordForm.formState.errors.email?.message && (
                            <FieldError>{passwordForm.formState.errors.email?.message}</FieldError>
                          )}
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="password" className="flex items-center justify-between">
                            {t("auth:password")}

                            <button
                              type="button"
                              className="text-xs text-muted-foreground cursor-pointer text-right"
                              onClick={() => setIsRequestForgotPassword(true)}
                            >
                              {t("auth:resetPasswordField")}
                            </button>
                          </FieldLabel>

                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            disabled={passwordForm.formState.isSubmitting}
                            {...passwordForm.register("password")}
                          />

                          {passwordForm.formState.errors.password?.message && (
                            <FieldError>{passwordForm.formState.errors.password?.message}</FieldError>
                          )}
                        </Field>

                        <Button className="w-full mt-2" disabled={passwordForm.formState.isSubmitting}>
                          {passwordForm.formState.isSubmitting ? (
                            <Icon className="size-5" icon="eos-icons:loading" />
                          ) : (
                            <>
                              <Icon icon={"lucide:lock"} className="size-5" />

                              {t("auth:login")}
                            </>
                          )}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="magicLink">
                      <form
                        className="flex flex-col gap-2"
                        onSubmit={magicLinkForm.handleSubmit(handleLoginWithMagicLink)}
                      >
                        <Field>
                          <FieldLabel htmlFor="email">{t("auth:email")}</FieldLabel>

                          <Input
                            id="email"
                            type="email"
                            placeholder="johndoe@example.com"
                            disabled={magicLinkForm.formState.isSubmitting}
                            {...magicLinkForm.register("email")}
                          />

                          {magicLinkForm.formState.errors.email?.message && (
                            <FieldError>{magicLinkForm.formState.errors.email?.message}</FieldError>
                          )}
                        </Field>

                        <Button className="w-full mt-2" disabled={magicLinkForm.formState.isSubmitting}>
                          {magicLinkForm.formState.isSubmitting ? (
                            <Icon className="size-5" icon="eos-icons:loading" />
                          ) : (
                            <>
                              <Icon icon={"lucide:mail"} className="size-5" />

                              {t("auth:sendMagicLink")}
                            </>
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                <TabsContent value="register">
                  <form className="flex flex-col gap-2" onSubmit={registerForm.handleSubmit(handleRegister)}>
                    <Field>
                      <FieldLabel htmlFor="name">{t("auth:name")}</FieldLabel>

                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        disabled={registerForm.formState.isSubmitting}
                        {...registerForm.register("name")}
                      />

                      {registerForm.formState.errors.name?.message && (
                        <FieldError>{registerForm.formState.errors.name?.message}</FieldError>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="email">{t("auth:email")}</FieldLabel>

                      <Input
                        id="email"
                        type="email"
                        placeholder="johndoe@example.com"
                        disabled={registerForm.formState.isSubmitting}
                        {...registerForm.register("email")}
                      />

                      {registerForm.formState.errors.email?.message && (
                        <FieldError>{registerForm.formState.errors.email?.message}</FieldError>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="password" className="flex items-center justify-between">
                        {t("auth:password")}
                      </FieldLabel>

                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        disabled={registerForm.formState.isSubmitting}
                        {...registerForm.register("password")}
                      />

                      {registerForm.formState.errors.password?.message && (
                        <FieldError>{registerForm.formState.errors.password?.message}</FieldError>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="confirmPassword" className="flex items-center justify-between">
                        {t("auth:confirmPassword")}
                      </FieldLabel>

                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        disabled={registerForm.formState.isSubmitting}
                        {...registerForm.register("confirmPassword")}
                      />

                      {registerForm.formState.errors.confirmPassword?.message && (
                        <FieldError>{registerForm.formState.errors.confirmPassword?.message}</FieldError>
                      )}
                    </Field>

                    <Button className="w-full mt-2" disabled={registerForm.formState.isSubmitting}>
                      {registerForm.formState.isSubmitting ? (
                        <Icon className="size-5" icon="eos-icons:loading" />
                      ) : (
                        <>
                          <Icon icon={"lucide:user"} className="size-5" />

                          {t("auth:register")}
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </div>
            </Tabs>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("auth:requestPasswordReset.title")}</DialogTitle>

              <DialogDescription>{t("auth:requestPasswordReset.description")}</DialogDescription>
            </DialogHeader>

            <form
              className="flex flex-col gap-2"
              onSubmit={requestPasswordResetForm.handleSubmit(handleRequestPasswordReset)}
            >
              <Field>
                <FieldLabel htmlFor="email">{t("auth:email")}</FieldLabel>

                <Input
                  id="email"
                  type="email"
                  placeholder="johndoe@example.com"
                  disabled={requestPasswordResetForm.formState.isSubmitting}
                  {...requestPasswordResetForm.register("email")}
                />

                {requestPasswordResetForm.formState.errors.email?.message && (
                  <FieldError>{requestPasswordResetForm.formState.errors.email?.message}</FieldError>
                )}
              </Field>

              <Button className="w-full mt-2" disabled={requestPasswordResetForm.formState.isSubmitting}>
                {requestPasswordResetForm.formState.isSubmitting ? (
                  <Icon className="size-5" icon="eos-icons:loading" />
                ) : (
                  <>
                    <Icon icon={"lucide:mail"} className="size-5" />

                    {t("auth:requestPasswordReset.button")}
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
