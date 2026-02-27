import { animate, round } from "animejs";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function Counter() {
	const { t } = useTranslation();
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries, obs) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;

					const item = entry.target as HTMLElement;

					animate(item, {
						opacity: [0, 1],
						translateY: [20, 0],
						duration: 800,
						easing: "easeOutExpo",
					});

					item.querySelectorAll<HTMLElement>(".counter").forEach((counter) => {
						const target = Number(counter.dataset.target ?? 0);

						animate(counter, {
							innerHTML: [0, target],
							duration: 2000,
							ease: "easeOutExpo",
							modifier: round(0),
						});
					});

					obs.unobserve(item);
				});
			},
			{ threshold: 0.2 },
		);

		document.querySelectorAll<HTMLElement>(".stat-item").forEach((el) => {
			observer.observe(el);
		});

		return () => observer.disconnect();
	}, []);

	return (
		<section className="border-y border-border bg-secondary/20 py-16">
			<div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
				<div className="stat-item opacity-0">
					<div className="text-4xl font-bold mb-2">
						<span className="counter" data-target="350">
							0
						</span>
						k+
					</div>
					<div className="text-sm text-muted-foreground">
						{t("common:types.game_other")}
					</div>
				</div>

				<div className="stat-item opacity-0">
					<div className="text-4xl font-bold mb-2">
						<span className="counter" data-target="1.1">
							0
						</span>
						M+
					</div>
					<div className="text-sm text-muted-foreground">
						{t("common:types.movie_other")}
					</div>
				</div>

				<div className="stat-item opacity-0">
					<div className="text-4xl font-bold mb-2">
						<span className="counter" data-target="214">
							0
						</span>
						k+
					</div>
					<div className="text-sm text-muted-foreground">
						{t("common:types.tv_other")}
					</div>
				</div>

				<div className="stat-item opacity-0">
					<div className="text-4xl font-bold mb-2">
						<span className="counter" data-target="1.6">
							0
						</span>
						M+
					</div>
					<div className="text-sm text-muted-foreground">
						{t("common:types.book_other")}
					</div>
				</div>
			</div>
		</section>
	);
}
