import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function CastItem() {
	return (
		<Link
			to={"/cast/banana"}
			className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border"
		>
			<div className="flex items-center justify-between mb-2">
				<Avatar className="w-full aspect-square h-full rounded-2xl">
					<AvatarImage
						src="https://media.themoviedb.org/t/p/w132_and_h132_face/59IhgCtiWI5yTfzPhsjzg7GjCjm.jpg"
						alt="Avatar of "
						className="object-cover aspect-3/4 h-full"
					/>
					<AvatarFallback className="rounded-lg">Book Title</AvatarFallback>
				</Avatar>
			</div>
			<p className="text-card-foreground font-bold text-center">Jack Black</p>
			<p className="text-muted-foreground text-center">Doug McCallister</p>
		</Link>
	);
}
