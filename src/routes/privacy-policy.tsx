import { createFileRoute } from "@tanstack/react-router";
import { Trans, useTranslation } from "react-i18next";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/privacy-policy")({
	head: () => ({
		meta: [...seo({ title: "Privacy Policy" })],
	}),
	component: PrivacyPolicyRoute,
});

function PrivacyPolicyRoute() {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-8">
			<div className="bg-card rounded-2xl shadow-lg p-8 text-muted-foreground">
				<h1 className="text-3xl lg:text-4xl font-bold text-card-foreground mb-2 text-center">
					{t("pages:privacyPolicy.title")}
				</h1>

				<p className="text-sm text-center mb-6">
					{t("pages:privacyPolicy.lastUpdated", {
						date: new Date("02/08/2026").toLocaleDateString(),
					})}
				</p>

				<div className="space-y-6 leading-relaxed">
					<p>{t("pages:privacyPolicy.intro")}</p>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:privacyPolicy.dataWeCollect.title")}
						</h2>
						<ul className="list-disc pl-5 space-y-1">
							<li>{t("pages:privacyPolicy.dataWeCollect.account")}</li>
							<li>{t("pages:privacyPolicy.dataWeCollect.auth")}</li>
							<li>{t("pages:privacyPolicy.dataWeCollect.content")}</li>
							<li>{t("pages:privacyPolicy.dataWeCollect.cookies")}</li>
						</ul>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:privacyPolicy.howWeUseData.title")}
						</h2>
						<ul className="list-disc pl-5 space-y-1">
							<li>{t("pages:privacyPolicy.howWeUseData.list1")}</li>
							<li>{t("pages:privacyPolicy.howWeUseData.list2")}</li>
							<li>{t("pages:privacyPolicy.howWeUseData.list3")}</li>
							<li>{t("pages:privacyPolicy.howWeUseData.list4")}</li>
						</ul>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:privacyPolicy.thirdParties.title")}
						</h2>
						<p>{t("pages:privacyPolicy.thirdParties.metadata")}</p>
						<p className="mt-2">
							{t("pages:privacyPolicy.thirdParties.analytics")}
						</p>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:privacyPolicy.payments.title")}
						</h2>
						<p>{t("pages:privacyPolicy.payments.info")}</p>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:privacyPolicy.dataRetention.title")}
						</h2>
						<p>{t("pages:privacyPolicy.dataRetention.text")}</p>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:privacyPolicy.userRights.title")}
						</h2>
						<ul className="list-disc pl-5 space-y-1">
							<li>{t("pages:privacyPolicy.userRights.access")}</li>
							<li>{t("pages:privacyPolicy.userRights.export")}</li>
							<li>{t("pages:privacyPolicy.userRights.delete")}</li>
							<li>{t("pages:privacyPolicy.userRights.rectify")}</li>
						</ul>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:privacyPolicy.security.title")}
						</h2>
						<p>{t("pages:privacyPolicy.security.text")}</p>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:privacyPolicy.children.title")}
						</h2>
						<p>{t("pages:privacyPolicy.children.text")}</p>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:privacyPolicy.changes.title")}
						</h2>
						<p>{t("pages:privacyPolicy.changes.text")}</p>
					</section>

					<section>
						<h2 className="font-semibold text-lg mb-2 text-primary">
							{t("pages:privacyPolicy.contact.title")}
						</h2>
						<Trans
							parent="p"
							i18nKey="pages:privacyPolicy.contact.text"
							components={{
								email: (
									<a
										href="mailto:privacy@trackgeek.net"
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
