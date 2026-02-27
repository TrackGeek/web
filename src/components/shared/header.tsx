import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import ViteImage from "@son426/vite-image/react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	Bell,
	Book,
	Clapperboard,
	Gamepad2,
	Heart,
	LibraryBig,
	Linkedin,
	Lock,
	LogIn,
	LogOut,
	Mail,
	Menu,
	Mountain,
	Search,
	Settings,
	Slack,
	TvMinimalPlay,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
	getLastUsedLoginMethod,
	signIn,
	signOut,
	signUp,
	useSession,
} from "@/lib/auth";
import { cn, getInitialsFromName } from "@/lib/utils";
import {
  SiApple,
  SiDiscord,
  SiFacebook,
  SiGithub,
  SiKick,
  SiReddit,
  SiRoblox,
  SiTiktok,
  SiTwitch,
  SiX,
} from '@icons-pack/react-simple-icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export const providers: { id: string; icon: React.ElementType | string }[] = [
  { id: "apple", icon: SiApple },
  { id: "discord", icon: SiDiscord },
  { id: "facebook", icon: SiFacebook },
  { id: "github", icon: SiGithub },
  { id: "google", icon: "fa7-brands:google" },
  { id: "kick", icon: SiKick },
  { id: "reddit", icon: SiReddit },
  { id: "roblox", icon: SiRoblox },
  { id: "tiktok", icon: SiTiktok },
  { id: "twitch", icon: SiTwitch },
  { id: "twitter", icon: SiX },
  { id: "slack", icon: Slack },
  { id: "microsoft", icon: "fluent:store-microsoft-20-filled" },
  { id: "linkedin", icon: Linkedin },
]

const passwordSchema = z.object({
	email: z.email(),
  password: z.string().min(6),
});

const magicLinkSchema = z.object({
	email: z.email(),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
});

type MagicLinkFormData = z.infer<typeof magicLinkSchema>;

type PasswordFormData = z.infer<typeof passwordSchema>;

type RegisterFormData = z.infer<typeof registerSchema>;

export function Header() {
	const navigate = useNavigate();

	const { t } = useTranslation();

	const session = useSession();

	const [lastMethod, setLastMethod] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

	useEffect(() => {
		setLastMethod(getLastUsedLoginMethod());
	}, []);

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

	async function handleLoginWithMagicLink(formData: MagicLinkFormData) {
		const data = await signIn.magicLink({
			email: formData.email,
			callbackURL: window.location.href,
		});

		if (data.error) {
			toast.error(t("auth:failedToLogin"));

			return;
		}

		toast.success(t("auth:enterYourEmail"));

		magicLinkForm.reset();
		magicLinkForm.clearErrors();
	}
  
  async function handleLoginWithPassword(formData: PasswordFormData) {
    const data = await signIn.email({
      email: formData.email,
      password: formData.password,
      callbackURL: window.location.href,
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
    const data = await signUp.email({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      callbackURL: window.location.href,
    });

    if (data.error) {
      toast.error(t("auth:failedToLogin"));

      return;
    }

    toast.success(t("auth:loginSuccessful"));

    registerForm.reset();
    registerForm.clearErrors();
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

	return (
		<header className="bg-border/30 backdrop-blur border-b border-border w-full h-14 flex items-center justify-between px-5 py-2">
			<div className="flex items-center justify-center gap-3">
				<DropdownMenu>
					<DropdownMenuTrigger asChild className="w-fit">
						<Button>
							<Menu />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-42 rounded-lg"
						align="start"
					>
						<DropdownMenuItem asChild>
							<Link to="/" className="cursor-pointer">
								<Mountain size={18} className="text-white" />
								{t("common:types.anime_other")}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/" className="cursor-pointer">
								<Book size={18} className="text-white" />
								{t("common:types.book_other")}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/" className="cursor-pointer">
								<Gamepad2 size={18} className="text-white" />
								{t("common:types.game_other")}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/" className="cursor-pointer">
								<TvMinimalPlay size={18} className="text-white" />
								{t("common:types.tv_other")}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/" className="cursor-pointer">
								<LibraryBig size={18} className="text-white" />
								{t("common:types.manga_other")}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/" className="cursor-pointer">
								<Clapperboard size={18} className="text-white" />
								{t("common:types.movie_other")}
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<Link to={session.data?.user ? "/feed" : "/"}>
					<img src="/logo.svg" alt="Logo" className="h-full w-45" />
				</Link>
			</div>

			<div className="flex items-center justify-center gap-3">
				<Link to="/search">
					<Button>
						<Search />
					</Button>
				</Link>
				<Link to="/donate" className="max-sm:hidden">
					<Button variant={"outline"} className="">
						<Heart color="red" fill="red" />
						{t("common:donate")}
					</Button>
				</Link>

				{session.isPending ? (
					<Skeleton className="h-8 w-8" />
				) : session.data ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Avatar className="border border-border size-9 cursor-pointer">
								{session.data?.user?.profile?.avatarUrl ? (
									<ViteImage
										className="aspect-square size-full"
										src={{
											src: session.data.user.profile.avatarUrl,
											blurDataURL: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH",
											width: 36,
											height: 36,
										}}
									/>
								) : (
									<AvatarFallback>
										{getInitialsFromName(
											session.data?.user?.name || "John Doe",
										)}
									</AvatarFallback>
								)}
							</Avatar>
						</DropdownMenuTrigger>

						<DropdownMenuContent
							className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
							align="end"
						>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">
											{session.data?.user?.name}
										</span>

										<span className="truncate text-xs">
											{session.data?.user?.email}
										</span>
									</div>
								</div>
							</DropdownMenuLabel>

							<DropdownMenuSeparator />

							<DropdownMenuItem asChild>
								<Link
									to={"/user/$username"}
									params={{ username: session.data?.user?.username! }}
									className="cursor-pointer"
								>
									<User size={18} className="text-white" />
									{t("common:profile")}
								</Link>
							</DropdownMenuItem>

							<DropdownMenuItem asChild>
								<Link to="/" className="cursor-pointer">
									<Bell size={18} className="text-white" />
									{t("common:notifications")}
								</Link>
							</DropdownMenuItem>

							<DropdownMenuItem asChild>
								<Link to="/settings" className="cursor-pointer">
									<Settings size={18} className="text-white" />
									{t("common:settings")}
								</Link>
							</DropdownMenuItem>

							<DropdownMenuSeparator />

							<DropdownMenuItem asChild>
								<button
									type="button"
									className="w-full cursor-pointer"
									onClick={async () => {
										await signOut({
											fetchOptions: {
												onSuccess: () => {
													navigate({ to: "/" });

													toast.success(t("auth:logoutSuccessful"));
												},
												onError: () => {
													toast.error(t("auth:failedToLogout"));
												},
											},
										});
									}}
								>
									<LogOut size={18} className="text-white" />
									{t("auth:logout")}
								</button>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<Dialog
						onOpenChange={(open) => {
							if (!open) {
								magicLinkForm.reset();
								magicLinkForm.clearErrors();
							}
						}}
					>
						<DialogTrigger asChild>
							<Button className="font-semibold">
								<LogIn />

								{t("auth:login")}
							</Button>
						</DialogTrigger>

						<DialogContent className='sm:max-w-md'>
							<DialogHeader>
								<DialogTitle>{t("auth:welcome")}</DialogTitle>

								<DialogDescription>{t("auth:welcomeBack")}</DialogDescription>
							</DialogHeader>
              
              <Tabs defaultValue="login">
                <div className='flex flex-col gap-3'>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <TabsList className="w-full max-sm:overflow-x-auto items-center justify-start">
                      <TabsTrigger value="login">{t("auth:login")}</TabsTrigger>
                      <TabsTrigger value="register">{t("auth:register")}</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    {providers
                      .sort((a, b) => a.id.localeCompare(b.id))
                      .map((provider) => (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button key={provider.id} variant="outline" className={cn(lastMethod === provider.id && "bg-primary/10 border-primary border-2")} onClick={() => handleLoginWithProvider(provider.id)}>
                              {typeof provider.icon === "string" ? (
                                <Icon className="size-4" icon={provider.icon} />
                              ) : (
                                <provider.icon className="size-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          
                          <TooltipContent side="bottom">
                            {t(`auth:providers.${provider.id}`)}
                          </TooltipContent>
                        </Tooltip>
                      ))
                    }
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Separator className="flex-1" />
                    
                    <span className="text-sm text-muted-foreground">
                      {t("auth:or")}
                    </span>

                    <Separator className="flex-1" />
                  </div>
                  
                  <TabsContent value="login">
                    <Tabs defaultValue='password'>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <TabsList className="w-full max-sm:overflow-x-auto items-center justify-start">
                          <TabsTrigger value="password">{t("auth:password")}</TabsTrigger>
                          <TabsTrigger value="magicLink">{t("auth:magicLink")}</TabsTrigger>
                        </TabsList>
                      </div>
                      
                      <TabsContent value='password'>
                        <form
                          className="flex flex-col gap-2"
                          onSubmit={passwordForm.handleSubmit(handleLoginWithPassword)}
                        >
                          <Field>
                            <FieldLabel htmlFor="email">
                              {t("auth:email")}
                            </FieldLabel>

                            <Input
                              id="email"
                              type="email"
                              placeholder="jhondoe@example.com"
                              disabled={passwordForm.formState.isSubmitting}
                              {...passwordForm.register("email")}
                            />

                            {passwordForm.formState.errors.email?.message && (
                              <FieldError>
                                {passwordForm.formState.errors.email?.message}
                              </FieldError>
                            )}
                          </Field>
                          
                          <Field>
                            <FieldLabel htmlFor="password" className="flex items-center justify-between">
                              {t("auth:password")}
                              
                              <p className="text-xs text-muted-foreground cursor-pointer text-right">
                                {t("auth:forgotPassword")}
                              </p>
                            </FieldLabel>

                            <Input
                              id="password"
                              type="password"
                              placeholder="••••••••"
                              disabled={passwordForm.formState.isSubmitting}
                              {...passwordForm.register("password")}
                            />

                            {passwordForm.formState.errors.password?.message && (
                              <FieldError>
                                {passwordForm.formState.errors.password?.message}
                              </FieldError>
                            )}
                          </Field>

                          <Button
                            className="w-full mt-2"
                            disabled={passwordForm.formState.isSubmitting}
                          >
                            {passwordForm.formState.isSubmitting ? (
                              <Icon className="size-5" icon="eos-icons:loading" />
                            ) : (
                              <>
                                <Lock className="size-5" />

                                {t("auth:login")}
                              </>
                            )}
                          </Button>
                        </form>
                      </TabsContent>
                      
                      <TabsContent value='magicLink'>
                        <form
                          className="flex flex-col gap-2"
                          onSubmit={magicLinkForm.handleSubmit(handleLoginWithMagicLink)}
                        >
                          <Field>
                            <FieldLabel htmlFor="email">
                              {t("auth:email")}
                            </FieldLabel>

                            <Input
                              id="email"
                              type="email"
                              placeholder="jhondoe@example.com"
                              disabled={magicLinkForm.formState.isSubmitting}
                              {...magicLinkForm.register("email")}
                            />

                            {magicLinkForm.formState.errors.email?.message && (
                              <FieldError>
                                {magicLinkForm.formState.errors.email?.message}
                              </FieldError>
                            )}
                          </Field>

                          <Button
                            className="w-full mt-2"
                            disabled={magicLinkForm.formState.isSubmitting}
                          >
                            {magicLinkForm.formState.isSubmitting ? (
                              <Icon className="size-5" icon="eos-icons:loading" />
                            ) : (
                              <>
                                <Mail className="size-5" />

                                {t("auth:sendMagicLink")}
                              </>
                            )}
                          </Button>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <form
                      className="flex flex-col gap-2"
                      onSubmit={registerForm.handleSubmit(handleRegister)}
                    >
                      <Field>
                        <FieldLabel htmlFor="name">
                          {t("auth:name")}
                        </FieldLabel>

                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          disabled={registerForm.formState.isSubmitting}
                          {...registerForm.register("name")}
                        />

                        {registerForm.formState.errors.name?.message && (
                          <FieldError>
                            {registerForm.formState.errors.name?.message}
                          </FieldError>
                        )}
                      </Field>
                      
                      <Field>
                        <FieldLabel htmlFor="email">
                          {t("auth:email")}
                        </FieldLabel>

                        <Input
                          id="email"
                          type="email"
                          placeholder="jhondoe@example.com"
                          disabled={registerForm.formState.isSubmitting}
                          {...registerForm.register("email")}
                        />

                        {registerForm.formState.errors.email?.message && (
                          <FieldError>
                            {registerForm.formState.errors.email?.message}
                          </FieldError>
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
                          <FieldError>
                            {registerForm.formState.errors.password?.message}
                          </FieldError>
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
                          <FieldError>
                            {registerForm.formState.errors.confirmPassword?.message}
                          </FieldError>
                        )}
                      </Field>

                      <Button
                        className="w-full mt-2"
                        disabled={registerForm.formState.isSubmitting}
                      >
                        {registerForm.formState.isSubmitting ? (
                          <Icon className="size-5" icon="eos-icons:loading" />
                        ) : (
                          <>
                            <User className="size-5" />

                            {t("auth:register")}
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </div>
              </Tabs>
						</DialogContent>
					</Dialog>
				)}
			</div>
		</header>
	);
}
