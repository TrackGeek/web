import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function CharacterItem() {
  return (
			<Link
				to={"/cast/banana"}
				className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border"
			>
				<div className="flex items-center justify-between mb-2">
					<Avatar className="w-full aspect-square h-full rounded-2xl">
						<AvatarImage
							src="https://cdn.myanimelist.net/images/characters/12/619183.jpg?s=15f45c66440c0e9843e2f0109f0c1aef"
							alt="Avatar of "
							className="object-cover aspect-3/4 h-full"
						/>
						<AvatarFallback className="rounded-lg">Fern</AvatarFallback>
					</Avatar>
				</div>
				<p className="text-card-foreground font-bold text-center">Fern</p>
			</Link>
		);
}
