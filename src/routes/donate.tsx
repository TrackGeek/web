/** biome-ignore-all lint/a11y/useValidAriaRole: it's a component */
/** biome-ignore-all lint/a11y/noLabelWithoutControl: input is buttons */

import { SiPaypal } from "@icons-pack/react-simple-icons";
import { useQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Coffee, CreditCard } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ContributorsItem } from "@/components/cards/contributors.tsx";
import { Grid } from "@/components/layouts/grid.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";

export const Route = createFileRoute("/donate")({
	head: () => ({
		meta: [{ title: "Donate | TrackGeek" }],
	}),
	component: DonateRoute,
});

interface GitHubContributor {
	login: string;
	avatar_url: string;
	html_url: string;
	contributions: number;
}

async function fetchRepoContributors(
	repo: string,
): Promise<GitHubContributor[]> {
	const response = await fetch(
		`https://api.github.com/repos/TrackGeek/${repo}/contributors?anon=1`,
	);
	if (!response.ok) throw new Error(`Failed to fetch ${repo} contributors`);
	return response.json();
}

function DonateRoute() {
	const { t } = useTranslation();

	const [donationType, setDonationType] = useState<"one-time" | "monthly">(
		"one-time",
	);
	const [amountType, setAmountType] = useState<"fixed" | "custom">("fixed");
	const [selectedAmount, setSelectedAmount] = useState<number>(5);
	const [customAmount, setCustomAmount] = useState<string>("");
	const [paymentMethod, setPaymentMethod] = useState<"paypal" | "card" | null>(
		null,
	);

	const fixedAmounts = [5, 10, 25, 50];
	const finalAmount =
		amountType === "fixed" ? selectedAmount : parseFloat(customAmount) || 0;

	const isValidAmount = finalAmount >= 1;

	const handlePayment = () => {
		if (!isValidAmount || !paymentMethod) return;

		const _donationData = {
			amount: finalAmount,
			type: donationType,
			method: paymentMethod,
		};
	};

	const queries = useQueries({
		queries: [
			{
				queryKey: ["contributors", "web"],
				queryFn: () => fetchRepoContributors("web"),
				staleTime: 1000 * 60 * 60,
			},
		],
	});

	const loading = queries.some((query) => query.isPending);
	const contributors = (() => {
		const webContributors = queries[0].data || [];

		const allContributors = [...webContributors] as GitHubContributor[];
		return Array.from(
			new Map(
				allContributors.map((contributor) => [
					contributor.login.toLowerCase(),
					contributor,
				]),
			).values(),
		)
			.sort((a, b) => b.contributions - a.contributions)
			.filter(
				(contributor) => !contributor.login.toLowerCase().includes("bot"),
			);
	})();

	return (
		<div className="flex flex-col gap-8">
			<div className="bg-card rounded-2xl shadow-lg p-8 text-muted-foreground">
				<div>
					<h1 className="text-3xl lg:text-4xl font-bold text-card-foreground mb-2 bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text text-center">
						{t("common:donate")}
					</h1>
					<p className="text-center">{t("pages:donate.description")}</p>
				</div>

				<div className="p-10 sm:px-56 bg-linear-to-br from-muted/50 to-muted my-10 rounded-lg text-white flex flex-col items-center gap-y-3 text-center">
					<h3 className="text-4xl sm:text-5xl font-extrabold">
						{t("pages:donate.wantsToDonate.title")}
					</h3>
					<p className="text-muted-foreground">
						{t("pages:donate.wantsToDonate.description")}
					</p>
					<Dialog>
						<DialogTrigger asChild>
							<Button className="flex flex-wrap h-12 w-full mt-5 sm:w-1/4">
								<Coffee />
								{t("common:donate")}
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 gap-6 flex flex-col bg-card text-card-foreground">
							<DialogHeader>
								<DialogTitle className="text-2xl font-bold">
									{t("common:donate")}
								</DialogTitle>
								<DialogDescription className="text-sm text-muted-foreground">
									{t("pages:donate.modal.description")}
								</DialogDescription>
							</DialogHeader>
							<div>
								<label className="text-sm font-semibold mb-3 block">
									{t("pages:donate.modal.type")}
								</label>
								<div className="flex gap-3">
									<Button
										onClick={() => setDonationType("one-time")}
										className={`flex-1 h-14 py-3 px-4 rounded-lg font-medium transition-all ${
											donationType === "one-time"
												? "bg-primary text-primary-foreground"
												: "bg-muted text-muted-foreground hover:bg-muted/80"
										}`}
									>
										{t("pages:donate.modal.one-time")}
									</Button>
									<Button
										onClick={() => setDonationType("monthly")}
										className={`flex-1 h-14 py-3 px-4 rounded-lg font-medium transition-all ${
											donationType === "monthly"
												? "bg-primary text-primary-foreground"
												: "bg-muted text-muted-foreground hover:bg-muted/80"
										}`}
									>
										{t("pages:donate.modal.monthly")}
									</Button>
								</div>
							</div>

							<div>
								<label className="text-sm font-semibold mb-3 block">
									{t("pages:donate.modal.select")}
								</label>
								<div className="flex gap-3 mb-4">
									<Button
										onClick={() => setAmountType("fixed")}
										className={`flex-1 h-12 py-3 px-4 rounded-lg font-medium transition-all ${
											amountType === "fixed"
												? "bg-primary text-primary-foreground"
												: "bg-muted text-muted-foreground hover:bg-muted/80"
										}`}
									>
										{t("pages:donate.modal.fixed")}
									</Button>
									<Button
										onClick={() => setAmountType("custom")}
										className={`flex-1 h-12 py-3 px-4 rounded-lg font-medium transition-all ${
											amountType === "custom"
												? "bg-primary text-primary-foreground"
												: "bg-muted text-muted-foreground hover:bg-muted/80"
										}`}
									>
										{t("pages:donate.modal.custom")}
									</Button>
								</div>

								{amountType === "fixed" ? (
									<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
										{fixedAmounts.map((amount) => (
											<Button
												key={amount}
												onClick={() => setSelectedAmount(amount)}
												className={`h-12 py-3 px-4 rounded-lg font-semibold transition-all ${
													selectedAmount === amount
														? "bg-primary text-primary-foreground border-2 border-primary"
														: "bg-muted text-muted-foreground hover:bg-muted/80 border-2 border-transparent"
												}`}
											>
												${amount}
											</Button>
										))}
									</div>
								) : (
									<div className="flex gap-2">
										<span className="text-lg font-semibold py-3 px-4">$</span>
										<Input
											type="number"
											min="1"
											step="0.01"
											placeholder={t("pages:donate.modal.enter")}
											value={customAmount}
											onChange={(e) => setCustomAmount(e.target.value)}
											className="flex-1"
										/>
									</div>
								)}
							</div>

							{isValidAmount && (
								<div className="bg-muted/50 rounded-lg p-4">
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">
											{donationType === "one-time"
												? "One-time donation"
												: "Monthly donation"}
										</span>
										<span className="text-2xl font-bold text-primary">
											${finalAmount.toFixed(2)}
										</span>
									</div>
								</div>
							)}

							<div>
								<label className="text-sm font-semibold mb-3 block">
									{t("pages:donate.modal.method")}
								</label>
								<div className="grid grid-cols-2 gap-3">
									<Button
										onClick={() => setPaymentMethod("paypal")}
										className={`p-4 h-14 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
											paymentMethod === "paypal"
												? "bg-primary text-primary-foreground border-2 border-primary"
												: "bg-muted text-muted-foreground hover:bg-muted/80 border-2 border-transparent"
										}`}
									>
										<SiPaypal size={20} />
										PayPal
									</Button>
									<Button
										onClick={() => setPaymentMethod("card")}
										className={`p-4 h-14 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
											paymentMethod === "card"
												? "bg-primary text-primary-foreground border-2 border-primary"
												: "bg-muted text-muted-foreground hover:bg-muted/80 border-2 border-transparent"
										}`}
									>
										<CreditCard size={20} />
										{t("pages:donate.modal.card")}
									</Button>
								</div>
							</div>

							<Button
								onClick={handlePayment}
								disabled={!isValidAmount || !paymentMethod}
								className="w-full py-3 text-md font-semibold"
							>
								{t("common:donate")} ${finalAmount.toFixed(2)}
							</Button>

							<p className="text-xs text-muted-foreground text-center">
								{t("pages:donate.modal.footer")}
							</p>
						</DialogContent>
					</Dialog>
				</div>

				<div className="my-10">
					<h2 className="text-2xl font-bold text-card-foreground mb-2 bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text text-center">
						{t("pages:donate.perks.title")}
					</h2>
					<p className="text-center">{t("pages:donate.perks.description")}</p>
					<div className="grid md:grid-cols-2 gap-6">
						{[
							{
								title: "5$",
								benefits: [
									t("pages:donate.perks.benefit1"),
									t("pages:donate.perks.benefit2"),
									t("pages:donate.perks.benefit3"),
									t("pages:donate.perks.benefit4"),
								],
							},
							{
								title: "10$",
								benefits: [
									t("pages:donate.perks.benefit5"),
									t("pages:donate.perks.benefit6"),
								],
							},
						].map((item) => {
							return (
								<div
									key={item.title}
									className="p-6 rounded-xl border border-border bg-linear-to-br from-muted/50 to-muted hover:border-primary/50 translate-y-3 hover:-translate-y-1 transition-all duration-300"
								>
									<h3 className="text-lg font-semibold mb-4 text-white text-center">
										{item.title}
									</h3>
									<ul className="text-muted-foreground text-sm space-y-2">
										{item.benefits.map((benefit) => (
											<li key={benefit} className="flex items-start gap-2 mt-1">
												<span className="text-primary">✓</span>
												<span>{benefit}</span>
											</li>
										))}
									</ul>
								</div>
							);
						})}
					</div>
				</div>

				<hr className="my-10" />

				<div>
					<h2 className="text-2xl font-bold text-card-foreground mb-2 bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text text-center">
						{t("pages:donate.geeks")}
					</h2>
					<Grid minColSize="96px" className="gap-2 mt-4">
						{loading ? (
							<p className="text-center col-span-4">{t("common:loading")}</p>
						) : (
							contributors.map((contributor) => (
								<ContributorsItem
									key={contributor.login}
									name={contributor.login}
									url={contributor.html_url}
									avatarURL={contributor.avatar_url}
									role="supporter"
								/>
							))
						)}
					</Grid>
				</div>
			</div>
		</div>
	);
}
