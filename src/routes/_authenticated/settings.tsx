import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { CircleX, Image, Palette, Settings, Upload, User } from "lucide-react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import ViteImage from "@son426/vite-image/react";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { api, apiEndpoints } from "@/lib/api";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Label } from "@/components/ui/label";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
	SelectContent,
	SelectLabel,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/config";
import { useSession } from "@/lib/auth";

const colorOptions = [
	"#3b82f6", // Blue
	"#8b5cf6", // Violet
	"#ec4899", // Pink
	"#ef4444", // Red
	"#f97316", // Orange
	"#eab308", // Yellow
	"#22c55e", // Green
	"#06b6d4", // Cyan
	"#6366f1", // Indigo
	"#a855f7", // Purple
];

export const Route = createFileRoute("/_authenticated/settings")({
	head: () => ({
		meta: [{ title: "Settings | TrackGeek" }],
	}),
	component: SettingsRoute,
});

function SettingsRoute() {
	const { t, i18n } = useTranslation();

	const session = useSession();

	const timezonesByGroup = new Map<string, string[]>([
		[
			t("common:continents.Africa"),
			Intl.supportedValuesOf("timeZone").filter((tz) =>
				tz.startsWith("Africa/"),
			),
		],
		[
			t("common:continents.America"),
			Intl.supportedValuesOf("timeZone").filter((tz) =>
				tz.startsWith("America/"),
			),
		],
		[
			t("common:continents.Asia"),
			Intl.supportedValuesOf("timeZone").filter((tz) => tz.startsWith("Asia/")),
		],
		[
			t("common:continents.Europe"),
			Intl.supportedValuesOf("timeZone").filter((tz) =>
				tz.startsWith("Europe/"),
			),
		],
		[
			t("common:continents.Pacific"),
			Intl.supportedValuesOf("timeZone").filter(
				(tz) => tz.startsWith("Pacific/") || tz.startsWith("Australia/"),
			),
		],
	]);

	const bannerInputRef = useRef<HTMLInputElement>(null);
	const avatarInputRef = useRef<HTMLInputElement>(null);

	const uploadBannerMutation = useMutation({
		mutationFn: (file: File) => {
			const formData = new FormData();

			formData.append("file", file);

			return api.post(apiEndpoints.profileBanner.post, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
		},
		onSuccess: async () => {
			await session.refetch();

			toast.success(t("settings:banner.upload.success"));
		},
		onError: () => {
			toast.error(t("settings:banner.upload.error"));
		},
	});

	const deleteBannerMutation = useMutation({
		mutationFn: () => {
			return api.delete(apiEndpoints.profileBanner.delete);
		},
		onSuccess: async () => {
			await session.refetch();

			toast.success(t("settings:banner.delete.success"));
		},
		onError: () => {
			toast.error(t("settings:banner.delete.error"));
		},
	});

	const uploadAvatarMutation = useMutation({
		mutationFn: (file: File) => {
			const formData = new FormData();

			formData.append("file", file);

			return api.post(apiEndpoints.profileAvatar.post, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
		},
		onSuccess: async () => {
			await session.refetch();

			toast.success(t("settings:avatar.upload.success"));
		},
		onError: () => {
			toast.error(t("settings:avatar.upload.error"));
		},
	});

	const deleteAvatarMutation = useMutation({
		mutationFn: () => {
			return api.delete(apiEndpoints.profileAvatar.delete);
		},
		onSuccess: async () => {
			await session.refetch();

			toast.success(t("settings:avatar.delete.success"));
		},
		onError: () => {
			toast.error(t("settings:avatar.delete.error"));
		},
	});

	function handleImageUpload(
		event: React.ChangeEvent<HTMLInputElement>,
		type: "avatar" | "banner",
	) {
		const file = event.target.files?.[0];

		if (!file) return;

		if (type === "banner") {
			uploadBannerMutation.mutate(file);
		}

		if (type === "avatar") {
			uploadAvatarMutation.mutate(file);
		}
	}

	return (
		<div className="grid grid-cols-3 gap-8">
			<div className="w-full flex flex-col border-border border bg-card rounded-2xl p-6 col-span-1">
				<Field className="gap-2">
					<FieldLabel>
						<Image className="h-6 w-6" />

						{t("settings:avatar.title")}
					</FieldLabel>

					<FieldDescription>
						{t("settings:avatar.description")}
					</FieldDescription>

					<div className="flex items-center justify-center gap-2 h-55">
						{session.data?.user?.profile?.avatarUrl ? (
							<div className="w-55 h-55 relative">
								<ViteImage
									className="w-full h-full rounded-lg border-accent border"
									src={{
										src: session.data?.user?.profile.avatarUrl,
										blurDataURL: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH",
										width: 220,
										height: 220,
									}}
								/>

								{(deleteAvatarMutation.isPending ||
									uploadAvatarMutation.isPending) && (
									<div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col justify-center items-center gap-2">
										<Icon
											icon="eos-icons:loading"
											className="w-8 h-8 text-white animate-spin"
										/>
									</div>
								)}

								{(!deleteAvatarMutation.isPending ||
									!uploadAvatarMutation.isPending) && (
									<>
										<button
											className="absolute top-2 right-10 bg-black/50 rounded-full p-1.5 hover:bg-black/70 transition cursor-pointer"
											onClick={() => avatarInputRef.current?.click()}
										>
											<Upload className="w-4 h-4 text-white" />
										</button>

										<button
											className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 hover:bg-black/70 transition cursor-pointer"
											onClick={() => deleteAvatarMutation.mutate()}
										>
											<CircleX className="w-4 h-4 text-white" />
										</button>
									</>
								)}
							</div>
						) : (
							<div
								className="w-55 h-55 rounded-lg cursor-pointer relative"
								style={{ backgroundColor: session.data?.user?.profile?.color }}
								onClick={() => avatarInputRef.current?.click()}
							>
								{uploadAvatarMutation.isPending ? (
									<div className="w-full h-full flex flex-col justify-center items-center gap-2">
										<Icon
											icon="eos-icons:loading"
											className="w-8 h-8 text-white animate-spin"
										/>
									</div>
								) : (
									<div className="w-full h-full flex flex-col justify-center items-center gap-2">
										<Upload className="w-8 h-8 text-white/70" />

										<span className="text-white/70">
											{t("settings:avatar.upload.title")}
										</span>
									</div>
								)}
							</div>
						)}

						<input
							type="file"
							ref={avatarInputRef}
							className="hidden"
							accept=".jpg,.jpeg,.png,.gif"
							onChange={(e) => handleImageUpload(e, "avatar")}
						/>
					</div>
				</Field>
			</div>

			<div className="w-full flex flex-col border-border border bg-card rounded-2xl p-6 col-span-2">
				<Field className="gap-2">
					<FieldLabel>
						<Image className="h-6 w-6" />

						{t("settings:banner.title")}
					</FieldLabel>

					<FieldDescription>
						{t("settings:banner.description")}
					</FieldDescription>

					<div className="flex items-center gap-2 h-55">
						{session.data?.user?.profile?.bannerUrl ? (
							<div className="w-full h-full relative">
								<ViteImage
									className="w-full h-full rounded-lg border-accent border"
									src={{
										src: session.data?.user?.profile.bannerUrl,
										blurDataURL: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH",
										width: 300,
										height: 220,
									}}
								/>

								{(deleteBannerMutation.isPending ||
									uploadBannerMutation.isPending) && (
									<div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col justify-center items-center gap-2">
										<Icon
											icon="eos-icons:loading"
											className="w-8 h-8 text-white animate-spin"
										/>
									</div>
								)}

								{(!deleteBannerMutation.isPending ||
									!uploadBannerMutation.isPending) && (
									<>
										<button
											className="absolute top-2 right-10 bg-black/50 rounded-full p-1.5 hover:bg-black/70 transition cursor-pointer"
											onClick={() => bannerInputRef.current?.click()}
										>
											<Upload className="w-4 h-4 text-white" />
										</button>

										<button
											className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 hover:bg-black/70 transition cursor-pointer"
											onClick={() => deleteBannerMutation.mutate()}
										>
											<CircleX className="w-4 h-4 text-white" />
										</button>
									</>
								)}
							</div>
						) : (
							<div
								className="w-full h-full rounded-lg cursor-pointer relative"
								style={{ backgroundColor: session.data?.user?.profile?.color }}
								onClick={() => bannerInputRef.current?.click()}
							>
								{uploadBannerMutation.isPending ? (
									<div className="w-full h-full flex flex-col justify-center items-center gap-2">
										<Icon
											icon="eos-icons:loading"
											className="w-8 h-8 text-white animate-spin"
										/>
									</div>
								) : (
									<div className="w-full h-full flex flex-col justify-center items-center gap-2">
										<Upload className="w-8 h-8 text-white/70" />

										<span className="text-white/70">
											{t("settings:banner.upload.title")}
										</span>
									</div>
								)}
							</div>
						)}

						<input
							type="file"
							ref={bannerInputRef}
							className="hidden"
							accept=".jpg,.jpeg,.png,.gif"
							onChange={(e) => handleImageUpload(e, "banner")}
						/>
					</div>
				</Field>
			</div>

			<div className="w-full flex flex-col gap-4 border-border border bg-card rounded-2xl p-6 col-span-3">
				<Field className="gap-2">
					<FieldLabel>
						<User className="h-6 w-6" />

						{t("settings:profile.title")}
					</FieldLabel>

					<FieldDescription>
						{t("settings:profile.description")}
					</FieldDescription>
				</Field>

				<Field className="gap-2">
					<FieldLabel htmlFor="name">{t("settings:profile.name")}</FieldLabel>

					<Input id="name" type="text" placeholder="Jhon Doe" />
				</Field>

				<Field className="gap-2">
					<FieldLabel htmlFor="username">
						{t("settings:profile.username")}
					</FieldLabel>

					<ButtonGroup>
						<ButtonGroupText asChild>
							<Label htmlFor="username">@</Label>
						</ButtonGroupText>

						<InputGroup>
							<InputGroupInput
								id="username"
								type="text"
								placeholder="jhondoe"
							/>
						</InputGroup>
					</ButtonGroup>
				</Field>

				<Field className="gap-2">
					<FieldLabel htmlFor="about">{t("settings:profile.about")}</FieldLabel>

					<Textarea
						id="about"
						placeholder="Tell us about yourself..."
						rows={6}
					/>
				</Field>
			</div>

			<div className="w-full flex flex-col gap-4 border-border border bg-card rounded-2xl p-6 col-span-3">
				<Field className="gap-2">
					<FieldLabel>
						<Palette className="h-6 w-6" />

						{t("settings:color.title")}
					</FieldLabel>

					<FieldDescription>{t("settings:color.description")}</FieldDescription>

					<div className="flex flex-wrap gap-2 mt-2">
						{colorOptions.map((color) => (
							<button
								key={color}
								className="w-10 h-10 rounded-full border-2 border-transparent hover:border-accent transition"
								style={{ backgroundColor: color }}
								onClick={() => {}}
							/>
						))}
					</div>

					<FieldLabel htmlFor="color">{t("settings:color.custom")}</FieldLabel>

					<div className="flex items-center gap-2">
						<input
							type="color"
							id="customColor"
							value="#FFF"
							onChange={() => {}}
							className="h-10 w-14 cursor-pointer rounded-xl border-transparent border-0 bg-transparent"
						/>

						<span className="text-sm text-muted-foreground">#FFF</span>
					</div>
				</Field>
			</div>

			<div className="w-full flex flex-col gap-4 border-border border bg-card rounded-2xl p-6 col-span-3">
				<Field className="gap-2">
					<FieldLabel>
						<Settings className="h-6 w-6" />

						{t("settings:preferrences.title")}
					</FieldLabel>

					<FieldDescription>
						{t("settings:preferrences.description")}
					</FieldDescription>
				</Field>

				<Field className="w-full gap-2">
					<FieldLabel>{t("settings:preferrences.language.title")}</FieldLabel>

					<Select value={i18n.language}>
						<SelectTrigger className="w-full max-w-full">
							<SelectValue
								placeholder={t("settings:preferrences.language.placeholder")}
							/>
						</SelectTrigger>

						<SelectContent position="popper">
							<SelectGroup>
								{SUPPORTED_LANGUAGES.map((lang) => (
									<SelectItem key={lang.id} value={lang.id}>
										{t(lang.name)}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</Field>

				<Field className="gap-2">
					<FieldLabel>{t("settings:preferrences.timezone.title")}</FieldLabel>

					<Select value={new Intl.DateTimeFormat().resolvedOptions().timeZone}>
						<SelectTrigger className="w-full max-w-full">
							<SelectValue
								placeholder={t("settings:preferrences.timezone.placeholder")}
							/>
						</SelectTrigger>

						<SelectContent position="popper">
							{Array.from(timezonesByGroup.entries()).map(
								([group, timezones]) => (
									<SelectGroup>
										<SelectLabel>{group}</SelectLabel>

										{timezones.map((timezone) => (
											<SelectItem key={timezone} value={timezone}>
												{timezone}
											</SelectItem>
										))}
									</SelectGroup>
								),
							)}
						</SelectContent>
					</Select>
				</Field>
			</div>

			<div className="flex justify-end col-span-3">
				<Button>{t("settings:save.title")}</Button>
			</div>
		</div>
	);
}
