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
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import ViteImage from "@son426/vite-image/react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	getLastUsedLoginMethod,
	signIn,
	signOut,
	useSession,
} from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
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
import { cn, getInitialsFromName } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

const magicLinkSchema = z.object({
	email: z.email(),
});

type MagicLinkFormData = z.infer<typeof magicLinkSchema>;

export function Header() {
	const navigate = useNavigate();

	const { t } = useTranslation();

	const session = useSession();

	const [lastMethod, setLastMethod] = useState<string | null>(null);

	useEffect(() => {
		setLastMethod(getLastUsedLoginMethod());
	}, []);

	const magicLinkForm = useForm<MagicLinkFormData>({
		resolver: zodResolver(magicLinkSchema),
		mode: "onChange",
	});

	async function handleLoginWithMagicLink(formData: MagicLinkFormData) {
		const data = await signIn.magicLink({
			email: formData.email,
			callbackURL: window.location.origin,
		});

		if (data.error) {
			toast.error(t("auth:failedToLogin"));

			return;
		}

		toast.success(t("auth:enterYourEmail"));

		magicLinkForm.reset();
		magicLinkForm.clearErrors();
	}

	async function handleLoginWithGoogle() {
		const data = await signIn.social({
			provider: "google",
			callbackURL: window.location.origin,
		});

		if (data.error) {
			toast.error(t("auth:failedToLogin"));

			return;
		}
	}

	async function handleLoginWithGithub() {
		const data = await signIn.social({
			provider: "github",
			callbackURL: window.location.origin,
		});

		if (data.error) {
			toast.error(t("auth:failedToLogin"));

			return;
		}
	}

	async function handleLoginWithDiscord() {
		const data = await signIn.social({
			provider: "discord",
			callbackURL: window.location.origin,
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

				<Link to="/">
					<img src="/logo.svg" alt="Logo" className="h-full w-45" />
				</Link>
			</div>

			<div className="flex items-center justify-center gap-3">
				<Link to="/">
					<Button>
						<Search />
					</Button>
				</Link>
				<Link to="/" className="max-sm:hidden">
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
								{session.data?.user?.profile.avatarUrl ? (
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
										{getInitialsFromName(session.data.user.name)}
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
											{session.data.user.name}
										</span>

										<span className="truncate text-xs">
											{session.data.user.email}
										</span>
									</div>
								</div>
							</DropdownMenuLabel>

							<DropdownMenuSeparator />

							<DropdownMenuItem asChild>
								<Link
									to={"/user/$slug"}
									params={{ slug: session.data.user.username }}
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

						<DialogContent>
							<DialogHeader>
								<DialogTitle>{t("auth:login")}</DialogTitle>

								<DialogDescription>{t("auth:chooseMethod")}</DialogDescription>
							</DialogHeader>

							<div className="flex flex-col gap-4">
								<Button
									className={cn(
										"w-full",
										lastMethod === "google" && "relative border-3 border-white",
									)}
									disabled={magicLinkForm.formState.isSubmitting}
									onClick={handleLoginWithGoogle}
								>
									{lastMethod === "google" && (
										<div className="absolute right-0 top-0 pl-4 pr-3 text-xs leading-3 bg-white text-black border-b-0 border-l-0 rounded-bl-2xl rounded-tr-md">
											Last used
										</div>
									)}

									<Icon icon="fa7-brands:google" className="size-5" />

									{t("auth:continueWithGoogle")}
								</Button>

								<Button
									className={cn(
										"w-full",
										lastMethod === "discord" &&
											"relative border-3 border-white",
									)}
									disabled={magicLinkForm.formState.isSubmitting}
									onClick={handleLoginWithDiscord}
								>
									{lastMethod === "discord" && (
										<div className="absolute right-0 top-0 pl-4 pr-3 text-xs leading-3 bg-white text-black border-b-0 border-l-0 rounded-bl-2xl rounded-tr-md">
											Last used
										</div>
									)}

									<Icon icon="fa7-brands:discord" className="size-5" />

									{t("auth:continueWithDiscord")}
								</Button>

								<Button
									className={cn(
										"w-full",
										lastMethod === "github" && "relative border-3 border-white",
									)}
									disabled={magicLinkForm.formState.isSubmitting}
									onClick={handleLoginWithGithub}
								>
									{lastMethod === "github" && (
										<div className="absolute right-0 top-0 pl-4 pr-3 text-xs leading-3 bg-white text-black border-b-0 border-l-0 rounded-bl-2xl rounded-tr-md">
											Last used
										</div>
									)}

									<Icon icon="fa7-brands:github" className="size-5" />

									{t("auth:continueWithGithub")}
								</Button>

								<Separator />

								<form
									className="flex flex-col gap-2"
									onSubmit={magicLinkForm.handleSubmit(
										handleLoginWithMagicLink,
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
							</div>
						</DialogContent>
					</Dialog>
				)}
			</div>
		</header>
	);
}
