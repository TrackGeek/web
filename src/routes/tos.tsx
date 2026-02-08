import { createFileRoute } from "@tanstack/react-router";
import { Trans, useTranslation } from "react-i18next";

export const Route = createFileRoute("/tos")({
	head: () => ({
		meta: [{ title: "Terms of Service | TrackGeek" }],
	}),
	component: TermsRoute,
});

function TermsRoute() {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-8">
			<div className="bg-card rounded-2xl shadow-lg p-8 text-muted-foreground">
				<h1 className="text-3xl lg:text-4xl font-bold text-card-foreground mb-2 text-center">
					{t("pages:terms.title")}
				</h1>

				<p className="text-sm text-center mb-6">
					{t("pages:terms.lastUpdated", {
						date: new Date("02/08/2026").toLocaleDateString(),
					})}
				</p>

				<div className="space-y-6 leading-relaxed">
					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:terms.intro.title")}
						</h2>
						<p>{t("pages:terms.intro.text")}</p>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:terms.definitions.title")}
						</h2>
						<ul className="list-disc pl-5 space-y-1">
							<li>{t("pages:terms.definitions.trackgeek")}</li>
							<li>{t("pages:terms.definitions.user")}</li>
							<li>{t("pages:terms.definitions.content")}</li>
							<li>{t("pages:terms.definitions.linkedAccounts")}</li>
						</ul>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:terms.userResponsibilities.title")}
						</h2>
						<ul className="list-disc pl-5 space-y-1">
							<li>{t("pages:terms.userResponsibilities.respect")}</li>
							<li>{t("pages:terms.userResponsibilities.legal")}</li>
							<li>{t("pages:terms.userResponsibilities.ip")}</li>
							<li>{t("pages:terms.userResponsibilities.security")}</li>
						</ul>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:terms.contentOwnership.title")}
						</h2>
						<p>{t("pages:terms.contentOwnership.text")}</p>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:terms.linkedAccounts.title")}
						</h2>
						<p>{t("pages:terms.linkedAccounts.text")}</p>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:terms.platformRights.title")}
						</h2>
						<p>{t("pages:terms.platformRights.text")}</p>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:terms.disclaimer.title")}
						</h2>
						<p>{t("pages:terms.disclaimer.text")}</p>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:terms.liability.title")}
						</h2>
						<p>{t("pages:terms.liability.text")}</p>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:terms.changes.title")}
						</h2>
						<p>{t("pages:terms.changes.text")}</p>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:terms.governingLaw.title")}
						</h2>
						<p>{t("pages:terms.governingLaw.text")}</p>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:terms.contact.title")}
						</h2>
						<Trans
							parent="p"
							i18nKey="pages:terms.contact.text"
							components={{
								email: (
									<a
										href="mailto:support@trackgeek.net"
										className="underline"
									/>
								),
							}}
						/>
					</section>
				</div>
			</div>
		</div>
	);
}
