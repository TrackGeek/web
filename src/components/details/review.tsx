import { Heart, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export function ReviewItem() {
	const { t, i18n } = useTranslation();
	const [showReadMore, setShowReadMore] = useState(false);
	const contentRef = useRef<HTMLParagraphElement>(null);

	const reviewText =
		"Very foda! Este livro é uma obra-prima que merece ser lida por todos os amantes de boa literatura. BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA A forma como o autor desenvolve os personagens é simplesmente magnífica, cada um com sua própria voz e personalidade única.";

	useEffect(() => {
		if (contentRef.current) {
			const lineHeight = parseInt(
				getComputedStyle(contentRef.current).lineHeight,
				10,
			);
			const contentHeight = contentRef.current.scrollHeight;

			if (contentHeight > lineHeight * 3) {
				setShowReadMore(true);
			}
		}
	}, [reviewText]);

	return (
		<div className="w-full px-4 py-3 rounded-2xl flex flex-col md:flex-row gap-4">
			<div className="flex-1 flex flex-col gap-3">
				<div className="flex flex-col gap-3">
					<div className="flex items-start gap-2">
						<Link
							to="/"
							className="flex items-center gap-2 min-w-0 hover:text-primary transition-colors"
						>
							<Avatar size="sm">
								<AvatarImage src="https://assets.hardcover.app/editions/30399846/4434002844651.jpg" />
							</Avatar>
							<p className="font-bold truncate">John Doe</p>
						</Link>
						<div className="hidden md:flex items-center gap-1 ml-auto">
							{[...Array(5)].map((_, index) => {
								const ratingValue = 7;
								const starNumber = index + 1;
								const starRating = starNumber * 2;

								if (ratingValue >= starRating) {
									return (
										<Star
											key={`star-all-${starNumber}`}
											className="w-4 h-4 fill-yellow-400 text-yellow-400"
										/>
									);
								} else if (ratingValue >= starRating - 1) {
									return (
										<div
											key={`star-all-${starNumber}`}
											className="relative w-4 h-4"
										>
											<Star className="w-4 h-4 text-gray-300" />
											<div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
												<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
											</div>
										</div>
									);
								} else {
									return (
										<Star
											key={`star-all-${starNumber}`}
											className="w-4 h-4 text-gray-300"
										/>
									);
								}
							})}
						</div>
					</div>

					<div className="flex md:hidden items-center gap-1">
						{[...Array(5)].map((_, index) => {
							const ratingValue = 7;
							const starNumber = index + 1;
							const starRating = starNumber * 2;

							if (ratingValue >= starRating) {
								return (
									<Star
										key={`star-mobile-all-${starNumber}`}
										className="w-4 h-4 fill-yellow-400 text-yellow-400"
									/>
								);
							} else if (ratingValue >= starRating - 1) {
								return (
									<div
										key={`star-mobile-all-${starNumber}`}
										className="relative w-4 h-4"
									>
										<Star className="w-4 h-4 text-gray-300" />
										<div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
											<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
										</div>
									</div>
								);
							} else {
								return (
									<Star
										key={`star-mobile-all-${starNumber}`}
										className="w-4 h-4 text-gray-300"
									/>
								);
							}
						})}
					</div>
				</div>

				<div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3 text-xs">
					<div className="flex items-center gap-1 min-w-0">
						<span className="text-muted-foreground truncate">
							{t("feed:criteries.language")}:
						</span>
						<div className="flex">
							{[...Array(5)].map((_, index) => {
								const ratingValue = 10;
								const starNumber = index + 1;
								const starRating = starNumber * 2;

								if (ratingValue >= starRating) {
									return (
										<Star
											key={`star-lang-${starNumber}`}
											className="w-3 h-3 fill-yellow-400 text-yellow-400"
										/>
									);
								} else if (ratingValue >= starRating - 1) {
									return (
										<div
											key={`star-lang-${starNumber}`}
											className="relative w-3 h-3"
										>
											<Star className="w-3 h-3 text-gray-300" />
											<div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
												<Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
											</div>
										</div>
									);
								} else {
									return (
										<Star
											key={`star-lang-${starNumber}`}
											className="w-3 h-3 text-gray-300"
										/>
									);
								}
							})}
						</div>
					</div>

					<div className="flex items-center gap-1 min-w-0">
						<span className="text-muted-foreground truncate">
							{t("feed:criteries.story")}:
						</span>
						<div className="flex">
							{[...Array(5)].map((_, index) => {
								const ratingValue = 5;
								const starNumber = index + 1;
								const starRating = starNumber * 2;

								if (ratingValue >= starRating) {
									return (
										<Star
											key={`star-story-${starNumber}`}
											className="w-3 h-3 fill-yellow-400 text-yellow-400"
										/>
									);
								} else if (ratingValue >= starRating - 1) {
									return (
										<div
											key={`star-story-${starNumber}`}
											className="relative w-3 h-3"
										>
											<Star className="w-3 h-3 text-gray-300" />
											<div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
												<Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
											</div>
										</div>
									);
								} else {
									return (
										<Star
											key={`star-story-${starNumber}`}
											className="w-3 h-3 text-gray-300"
										/>
									);
								}
							})}
						</div>
					</div>

					<div className="flex items-center gap-1 min-w-0">
						<span className="text-muted-foreground truncate">
							{t("feed:criteries.theme")}:
						</span>
						<div className="flex">
							{[...Array(5)].map((_, index) => {
								const ratingValue = 7;
								const starNumber = index + 1;
								const starRating = starNumber * 2;

								if (ratingValue >= starRating) {
									return (
										<Star
											key={`star-theme-${starNumber}`}
											className="w-3 h-3 fill-yellow-400 text-yellow-400"
										/>
									);
								} else if (ratingValue >= starRating - 1) {
									return (
										<div
											key={`star-theme-${starNumber}`}
											className="relative w-3 h-3"
										>
											<Star className="w-3 h-3 text-gray-300" />
											<div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
												<Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
											</div>
										</div>
									);
								} else {
									return (
										<Star
											key={`star-theme-${starNumber}`}
											className="w-3 h-3 text-gray-300"
										/>
									);
								}
							})}
						</div>
					</div>

					<div className="flex items-center gap-1 min-w-0">
						<span className="text-muted-foreground truncate">
							{t("feed:criteries.characters")}:
						</span>
						<div className="flex">
							{[...Array(5)].map((_, index) => {
								const ratingValue = 8;
								const starNumber = index + 1;
								const starRating = starNumber * 2;

								if (ratingValue >= starRating) {
									return (
										<Star
											key={`star-characters-${starNumber}`}
											className="w-3 h-3 fill-yellow-400 text-yellow-400"
										/>
									);
								} else if (ratingValue >= starRating - 1) {
									return (
										<div
											key={`star-characters-${starNumber}`}
											className="relative w-3 h-3"
										>
											<Star className="w-3 h-3 text-gray-300" />
											<div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
												<Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
											</div>
										</div>
									);
								} else {
									return (
										<Star
											key={`star-characters-${starNumber}`}
											className="w-3 h-3 text-gray-300"
										/>
									);
								}
							})}
						</div>
					</div>
				</div>

				<div className="relative">
					<p
						ref={contentRef}
						className={`text-sm text-foreground/90 transition-all duration-200 line-clamp-3`}
					>
						{reviewText}
					</p>

					{showReadMore && (
						<>
							<div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-card via-card/95 to-transparent pointer-events-none" />
							<div className="absolute bottom-0 right-0 flex justify-end p-2">
								<Link
									to={"/users/kuriel/reviews/58"}
									className="text-sm text-primary hover:text-primary/80 font-medium transition-colors bg-primary-foreground/80 backdrop-blur-sm rounded-full px-2 py-1"
								>
									{t("library:readMore")}
								</Link>
							</div>
						</>
					)}
				</div>
			</div>

			<div className="flex items-center justify-between md:flex-col md:items-end md:justify-start gap-2">
				<p className="text-xs text-muted-foreground whitespace-nowrap">
					{new Date("2023-06-19").toLocaleDateString(i18n.language, {
						day: "numeric",
						month: "short",
						year: "numeric",
					})}
				</p>

				<div className="flex items-center gap-3">
					<div className="flex gap-1.5 items-center">
						<Heart className="w-4 h-4 hover:text-red-500" />
						<p className="text-muted-foreground min-w-[24px] text-center">
							160
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
