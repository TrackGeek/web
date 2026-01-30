import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import ViteImage from "@son426/vite-image/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	Bell,
	Book,
	Clapperboard,
	Gamepad2,
	Heart,
	LibraryBig,
	LogIn,
	LogOut,
	Mail,
	Menu,
	Mountain,
	Search,
	Settings,
	TvMinimalPlay,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
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
import { useAuth } from "@/hooks/use-auth";
import { api, apiEndpoints, type apiTypes } from "@/lib/api";
import { getInitialsFromName, openPopup } from "@/lib/utils";

const requestEmailLoginSchema = z.object({
	email: z.email(),
});

type RequestEmailLoginFormData = z.infer<typeof requestEmailLoginSchema>;

export function Header() {
	const { t } = useTranslation();

	const auth = useAuth();

	const [loginPopup, setLoginPopup] = useState<Window | null>(null);
	const [loginType, setLoginType] = useState<
		"email" | "google" | "discord" | "github" | null
	>(null);

	const requestEmailLoginForm = useForm<RequestEmailLoginFormData>({
		resolver: zodResolver(requestEmailLoginSchema),
		mode: "onChange",
		disabled: !!loginPopup && loginType !== "email",
	});

	const meQuery = useQuery<apiTypes.MeResponse>({
		queryKey: ["me"],
		queryFn: () => api.get(apiEndpoints.me.get).then(({ data }) => data),
		enabled: auth.isAuthenticated,
	});

	const requestEmailLoginMutation = useMutation({
		mutationFn: (email: string) =>
			api.get(apiEndpoints.requestEmailLogin.get, { params: { email } }),
		onSuccess: () => {
			setLoginType(null);

			toast.success(t("auth:enterYourEmail"));

			requestEmailLoginForm.reset();
			requestEmailLoginForm.clearErrors();
		},
		onError: () => toast.error(t("auth:failedToLogin")),
	});

	const requestGoogleLoginMutation = useMutation({
		mutationFn: () => api.get(apiEndpoints.requestGoogleLogin.get),
		onSuccess: (response) => {
			setLoginPopup(openPopup(response.data?.url, 600, 600));
			setLoginType("google");
		},
		onError: () => toast.error(t("auth:failedToLogin")),
	});

	const requestDiscordLoginMutation = useMutation({
		mutationFn: () => api.get(apiEndpoints.requestDiscordLogin.get),
		onSuccess: (response) => {
			setLoginPopup(openPopup(response.data?.url, 600, 600));
			setLoginType("discord");
		},
		onError: () => toast.error(t("auth:failedToLogin")),
	});

	const requestGithubLoginMutation = useMutation({
		mutationFn: () => api.get(apiEndpoints.requestGithubLogin.get),
		onSuccess: (response) => {
			setLoginPopup(openPopup(response.data?.url, 600, 600));
			setLoginType("github");
		},
		onError: () => toast.error(t("auth:failedToLogin")),
	});

	const logoutMutation = useMutation({
		mutationFn: () => api.get("/auth/logout"),
		onSuccess: () => {
			auth.setAuthenticated(false);

			toast.success(t("auth:logoutSuccessful"));
		},
		onError: () => toast.error(t("auth:failedToLogout")),
	});

	useEffect(() => {
		if (!loginPopup) return;

		const interval = setInterval(() => {
			if (loginPopup.closed) {
				setLoginPopup(null);
				setLoginType(null);

				clearInterval(interval);
			}
		}, 500);

		return () => {
			clearInterval(interval);
		};
	}, [loginPopup]);

	useEffect(() => {
		function handleListenPopupMessages(event: MessageEvent) {
			if (event.origin !== import.meta.env.VITE_API_URL) return;

			try {
				const data = JSON.parse(event.data) as Record<string, any>;

				if (!data) {
					return;
				}

				if (data?.type !== "SUCCESS_LOGIN") {
					console.error(data);

					auth.setAuthenticated(false);

					setLoginPopup(null);
					setLoginType(null);

					toast.error(t("auth:failedToLogin"));

					return;
				}

				toast.success(t("auth:loginSuccessful"));

				loginPopup?.close();

				auth.setAuthenticated(true);

				setLoginPopup(null);
				setLoginType(null);
			} catch (error) {
				console.error(error);

				auth.setAuthenticated(false);

				setLoginPopup(null);
				setLoginType(null);

				toast.error(t("auth:failedToLogin"));
			}
		}

		window.addEventListener("message", handleListenPopupMessages);

		return () => {
			window.removeEventListener("message", handleListenPopupMessages);
		};
	}, []);

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
							<Link to="/anime" className="cursor-pointer">
								<Mountain size={18} className="text-white" />
								{t("common:types.anime_other")}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/books" className="cursor-pointer">
								<Book size={18} className="text-white" />
								{t("common:types.book_other")}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/games" className="cursor-pointer">
								<Gamepad2 size={18} className="text-white" />
								{t("common:types.game_other")}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/tv" className="cursor-pointer">
								<TvMinimalPlay size={18} className="text-white" />
								{t("common:types.tv_other")}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/mangas" className="cursor-pointer">
								<LibraryBig size={18} className="text-white" />
								{t("common:types.manga_other")}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/movies" className="cursor-pointer">
								<Clapperboard size={18} className="text-white" />
								{t("common:types.movie_other")}
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<Link to="/">
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

				{auth.isAuthenticated ? (
					<>
						{meQuery.isLoading && <Skeleton className="h-8 w-8" />}

						{meQuery.data && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Avatar className="border border-border size-9 cursor-pointer">
										{meQuery.data.user.avatarUrl ? (
											<ViteImage
												className="aspect-square size-full"
												src={{
													src: meQuery.data.user.avatarUrl,
													blurDataURL: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH",
													width: 36,
													height: 36,
												}}
											/>
										) : (
											<AvatarFallback>
												{getInitialsFromName(meQuery.data.user.name)}
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
													{meQuery.data.user.name}
												</span>

												<span className="truncate text-xs">
													{meQuery.data.user.email}
												</span>
											</div>
										</div>
									</DropdownMenuLabel>

									<DropdownMenuSeparator />

									<DropdownMenuItem asChild>
										<Link
											to={`/user/${meQuery.data.user.username}`}
											className="cursor-pointer"
										>
											<User size={18} className="text-white" />
											{t("common:profile")}
										</Link>
									</DropdownMenuItem>

									<DropdownMenuItem asChild>
										<Link to="/notifications" className="cursor-pointer">
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
											onClick={() => logoutMutation.mutate()}
										>
											<LogOut size={18} className="text-white" />
											{t("auth:logout")}
										</button>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</>
				) : (
					<Dialog
						onOpenChange={(open) => {
							if (!open) {
								requestEmailLoginForm.reset();
								requestEmailLoginForm.clearErrors();
							}
						}}
					>
						<DialogTrigger asChild>
							<Button className="font-semibold">
								<LogIn />

								{t("auth:login")}
							</Button>
						</DialogTrigger>

						<DialogContent>
							<DialogHeader>
								<DialogTitle>{t("auth:login")}</DialogTitle>

								<DialogDescription>{t("auth:chooseMethod")}</DialogDescription>
							</DialogHeader>

							<div className="flex flex-col gap-4">
								<Button
									className="w-full"
									disabled={
										!!loginPopup ||
										loginType === "google" ||
										requestEmailLoginMutation.isPending
									}
									onClick={() => requestGoogleLoginMutation.mutate()}
								>
									{loginType === "google" ? (
										<Icon className="size-5" icon="eos-icons:loading" />
									) : (
										<>
											<Icon icon="fa7-brands:google" className="size-5" />

											{t("auth:continueWithGoogle")}
										</>
									)}
								</Button>

								<Button
									className="w-full"
									disabled={
										!!loginPopup ||
										loginType === "discord" ||
										requestEmailLoginMutation.isPending
									}
									onClick={() => requestDiscordLoginMutation.mutate()}
								>
									{loginType === "discord" ? (
										<Icon className="size-5" icon="eos-icons:loading" />
									) : (
										<>
											<Icon icon="fa7-brands:discord" className="size-5" />

											{t("auth:continueWithDiscord")}
										</>
									)}
								</Button>

								<Button
									className="w-full"
									disabled={
										!!loginPopup ||
										loginType === "github" ||
										requestEmailLoginMutation.isPending
									}
									onClick={() => requestGithubLoginMutation.mutate()}
								>
									{loginType === "github" ? (
										<Icon className="size-5" icon="eos-icons:loading" />
									) : (
										<>
											<Icon icon="fa7-brands:github" className="size-5" />

											{t("auth:continueWithGithub")}
										</>
									)}
								</Button>

								<Separator />

								<form
									className="flex flex-col gap-2"
									onSubmit={requestEmailLoginForm.handleSubmit(
										async ({ email }) => {
											setLoginType("email");

											await requestEmailLoginMutation.mutateAsync(email);
										},
									)}
								>
									<Field>
										<FieldLabel htmlFor="email">
											{t("auth:emailAddress")}
										</FieldLabel>

										<Input
											id="email"
											type="email"
											placeholder="jhondoe@example.com"
											disabled={
												!!loginPopup || requestEmailLoginMutation.isPending
											}
											{...requestEmailLoginForm.register("email")}
										/>

										{requestEmailLoginForm.formState.errors.email?.message && (
											<FieldError>
												{requestEmailLoginForm.formState.errors.email?.message}
											</FieldError>
										)}
									</Field>

									<Button
										className="w-full mt-2"
										disabled={
											!!loginPopup || requestEmailLoginMutation.isPending
										}
									>
										{requestEmailLoginMutation.isPending ? (
											<Icon className="size-5" icon="eos-icons:loading" />
										) : (
											<>
												<Mail className="size-5" />

												{t("auth:sendMagicLink")}
											</>
										)}
									</Button>
								</form>
							</div>
						</DialogContent>
					</Dialog>
				)}
			</div>
		</header>
	);
}
