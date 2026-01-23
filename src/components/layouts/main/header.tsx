import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
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
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
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
import { extractNameFromEmail, getInitialsFromName } from "@/lib/utils";

const requestEmailLoginLinkSchema = z.object({
	email: z.email(),
});

type RequestEmailLoginLinkFormData = z.infer<
	typeof requestEmailLoginLinkSchema
>;

export function Header() {
	const { t } = useTranslation();

	const auth = useAuth();

	const requestEmailLoginLinkForm = useForm<RequestEmailLoginLinkFormData>({
		resolver: zodResolver(requestEmailLoginLinkSchema),
		mode: "onChange",
	});

	const meQuery = useQuery<apiTypes.AuthMeResponse>({
		queryKey: ["me"],
		queryFn: () => api.get(apiEndpoints.auth.me).then(({ data }) => data),
		enabled: auth.isAuthenticated,
	});

	const name = meQuery.data
		? (meQuery.data.user.name ?? extractNameFromEmail(meQuery.data.user.email))
		: "";

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
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						align="start"
					>
						<DropdownMenuItem asChild>
							<Link to="/anime" className="cursor-pointer">
								<Mountain size={18} className="text-white" />
								{t("common:types.anime_plural")}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/books" className="cursor-pointer">
								<Book size={18} className="text-white" />
								{t("common:types.book_plural")}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/games" className="cursor-pointer">
								<Gamepad2 size={18} className="text-white" />
								{t("common:types.game_plural")}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/tv" className="cursor-pointer">
								<TvMinimalPlay size={18} className="text-white" />
								{t("common:types.tv_plural")}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/mangas" className="cursor-pointer">
								<LibraryBig size={18} className="text-white" />
								{t("common:types.manga_plural")}
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/movies" className="cursor-pointer">
								<Clapperboard size={18} className="text-white" />
								{t("common:types.movie_plural")}
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
				<Link to="/donate">
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
										<AvatarFallback>{getInitialsFromName(name)}</AvatarFallback>
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
													{meQuery.data.user.name ??
														extractNameFromEmail(meQuery.data.user.email)}
												</span>

												<span className="truncate text-xs">
													{meQuery.data.user.email}
												</span>
											</div>
										</div>
									</DropdownMenuLabel>

									<DropdownMenuSeparator />

									<DropdownMenuItem asChild>
										<Link to="/profile" className="cursor-pointer">
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
											onClick={() => auth.logout()}
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
								requestEmailLoginLinkForm.reset();
								requestEmailLoginLinkForm.clearErrors();
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
									disabled={auth.hasLoginPopup}
									onClick={() => auth.requestLogin("google")}
								>
									<Icon icon="fa7-brands:google" className="size-5" />
									{t("auth:continueWithGoogle")}
								</Button>

								<Button
									className="w-full"
									disabled={auth.hasLoginPopup}
									onClick={() => auth.requestLogin("discord")}
								>
									<Icon icon="fa7-brands:discord" className="size-5" />
									{t("auth:continueWithDiscord")}
								</Button>

								<Button
									className="w-full"
									disabled={auth.hasLoginPopup}
									onClick={() => auth.requestLogin("github")}
								>
									<Icon icon="fa7-brands:github" className="size-5" />
									{t("auth:continueWithGithub")}
								</Button>

								<Separator />

								<form
									className="flex flex-col gap-2"
									onSubmit={requestEmailLoginLinkForm.handleSubmit(
										async (formData) => {
											await auth.requestLogin("email", {
												email: formData.email,
											});

											requestEmailLoginLinkForm.reset();
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
												auth.hasLoginPopup ||
												requestEmailLoginLinkForm.formState.isSubmitting
											}
											{...requestEmailLoginLinkForm.register("email")}
										/>

										{requestEmailLoginLinkForm.formState.errors.email
											?.message && (
											<FieldError>
												{
													requestEmailLoginLinkForm.formState.errors.email
														?.message
												}
											</FieldError>
										)}
									</Field>

									<Button
										className="w-full mt-2"
										disabled={
											auth.hasLoginPopup ||
											requestEmailLoginLinkForm.formState.isSubmitting
										}
									>
										{requestEmailLoginLinkForm.formState.isSubmitting ? (
											<Icon
												className="size-5"
												icon="line-md:loading-twotone-loop"
											/>
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
