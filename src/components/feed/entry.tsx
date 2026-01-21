import { Heart, MessageCircle } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

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
}

interface feedEntryProps {
	profile: TempUser;
	item: TempItem;
}

export function FeedEntry({ profile, item }: feedEntryProps) {
	const { i18n } = useTranslation();
	return (
		<div className="flex w-full max-h-28">
			<Link to={"/"} className="w-auto max-w-20">
				<img
					src={item.coverURL}
					className="h-full w-full object-contain rounded-l-2xl"
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
						<Heart className="w-4 h-4" />
						<MessageCircle className="w-4 h-4" />
					</div>
				</div>
			</div>
		</div>
	);
}
