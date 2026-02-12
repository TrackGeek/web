import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export interface FavoriteItem {
	id: string;
	title: string;
	image: string;
	score?: number | null;
}

export function FavoriteCard({ item }: { item: FavoriteItem }) {
	return (
		<Link
			to="/"
			className={cn(
				"bg-card rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-shadow",
			)}
		>
			<img
				src={item.image}
				alt={item.title}
				className="w-full h-44 object-cover"
			/>
			<div className="p-3">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold text-card-foreground truncate">
						{item.title}
					</h3>
					{typeof item.score === "number" && (
						<span className="text-sm font-medium text-muted-foreground">
							{item.score}
						</span>
					)}
				</div>
			</div>
		</Link>
	);
}
