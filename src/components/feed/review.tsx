import { Heart, MessageCircle, Star } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface TempCriteries {
  gameplay: number;
  soundtrack: number;
  story: number;
  graphics: number;
  all: number;
}

interface TempUser {
	name: string;
	avatarURL: string;
}

interface TempItem {
	coverURL: string;
	title: string;
	content?: string;
	time: Date;
	likes?: number;
  criteries: TempCriteries;
}

interface feedReviewProps {
	profile: TempUser;
	item: TempItem;
}

export function FeedReview({ profile, item }: feedReviewProps) {
	const { i18n } = useTranslation();
	return (
		<div className="flex w-full h-50">
			<Link to={"/"} className="w-auto min-w-16 shrink-0">
				<img
					src={item.coverURL}
					className="h-full object-cover rounded-l-2xl aspect-3/4"
					alt=""
				/>
			</Link>

			<div className="flex flex-1 px-4 py-3 bg-card border-y border-r border-border rounded-r-2xl justify-between items-start">
				<div className="flex flex-col items-start justify-between gap-3 ml-0 shrink-0 h-full">
					<div className="flex flex-col">
						<Link
							to={"/"}
							className="font-bold hover:text-primary transition-colors truncate"
						>
							{profile.name}
						</Link>
						<span className="text-muted-foreground text-sm capitalize">
							<Trans>{item.title}</Trans>
						</span>
					</div>
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-1">
							{[...Array(5)].map((_, index) => {
								const ratingValue = item.criteries.all;
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
							<span className="text-sm text-muted-foreground ml-2">
								{item.criteries.all}/10
							</span>
						</div>

						<div className="flex gap-4 text-xs">
							<div className="flex items-center gap-1">
								<span className="text-muted-foreground">Gameplay:</span>
								<div className="flex">
									{[...Array(5)].map((_, index) => {
										const ratingValue = item.criteries.gameplay;
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
								<span className="text-muted-foreground ml-1">
									{item.criteries.gameplay}
								</span>
							</div>
							<p>•</p>
							<div className="flex items-center gap-1">
								<span className="text-muted-foreground">Story:</span>
								<div className="flex">
									{[...Array(5)].map((_, index) => {
										const ratingValue = item.criteries.story;
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
								<span className="text-muted-foreground ml-1">
									{item.criteries.story}
								</span>
							</div>
							<p>•</p>
							<div className="flex items-center gap-1">
								<span className="text-muted-foreground">Graphics:</span>
								<div className="flex">
									{[...Array(5)].map((_, index) => {
										const ratingValue = item.criteries.graphics;
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
								<span className="text-muted-foreground ml-1">
									{item.criteries.graphics}
								</span>
							</div>
							<p>•</p>
							<div className="flex items-center gap-1">
								<span className="text-muted-foreground">Soundtrack:</span>
								<div className="flex">
									{[...Array(5)].map((_, index) => {
										const ratingValue = item.criteries.soundtrack;
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
								<span className="text-muted-foreground ml-1">
									{item.criteries.soundtrack}
								</span>
							</div>
						</div>
						<p className="text-sm line-clamp-2 text-foreground/90">
							{item.content}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Link to={"/"}>
							<img
								src={profile.avatarURL}
								className="w-8 h-8 shrink-0 rounded-full object-cover"
								alt={`Avatar of ${profile.name}`}
							/>
						</Link>
					</div>
				</div>
				<div className="flex flex-col items-end justify-between gap-3 ml-4 shrink-0 h-full">
					<p className="text-xs text-muted-foreground whitespace-nowrap">
						{item.time.toLocaleString(i18n.language)}
					</p>

					<div className="flex items-center gap-3">
						<div className="flex gap-1.5 items-center">
							<Heart className="w-4 h-4" />
							<p className="text-muted-foreground">{item.likes}</p>
						</div>
						<div className="flex gap-1.5 items-center">
							<MessageCircle className="w-4 h-4" />
							<p className="text-muted-foreground">{item.likes}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
