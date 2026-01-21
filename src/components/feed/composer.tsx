import { useTranslation } from "react-i18next";

export function FeedComposer() {
	const { t } = useTranslation();

	return (
		<div className="w-full border-border border bg-card rounded-2xl px-4 py-3">
			<p>Composer is here</p>
		</div>
	);
}
