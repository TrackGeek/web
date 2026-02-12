import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CastFavoriteCardProps {
	name: string;
	image: string;
	link: string;
}

export function CastFavoriteCard({ name, image, link }: CastFavoriteCardProps) {
	return (
		<Link
			to={link}
			className={"w-fit flex flex-col items-center gap-2 max-w-24 my-2"}
		>
			<Avatar className="size-24">
				<AvatarImage
					src={image}
					alt={`Avatar of ${name}`}
					className="object-cover object-top"
				/>
				<AvatarFallback className="rounded-lg">{name}</AvatarFallback>
			</Avatar>
			<p className="text-card-foreground font-bold text-center text-sm">
				{name}
			</p>
		</Link>
	);
}
