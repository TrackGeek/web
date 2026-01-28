import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	AvatarGroupCount,
	AvatarImage,
} from "@/components/ui/avatar";

export function ListItem() {
	return (
		<Link
			to={"/user/johndoe/list/true-story"}
			className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border"
		>
			<div className="flex items-center justify-between mb-2">
				<AvatarGroup className="items-center -space-x-3 overflow-x-hidden">
					<Avatar className="aspect-3/4 h-max w-16 rounded-md">
						<AvatarImage
							src="https://assets.hardcover.app/edition/31601422/3a01ea07-01f4-45a2-9940-6fc7e00e0d08.jpeg"
							alt="Book Title"
							className="object-cover aspect-3/4 h-full"
						/>
						<AvatarFallback className="rounded-lg">Book Title</AvatarFallback>
					</Avatar>
					<Avatar className="aspect-3/4 h-max w-16 rounded-md">
						<AvatarImage
							src="https://assets.hardcover.app/edition/32508798/62c09422-138d-42ef-81d9-a9599e2fba5c.jpg"
							alt="Book Title"
							className="object-cover aspect-3/4 h-full"
						/>
						<AvatarFallback className="rounded-lg">Book Title</AvatarFallback>
					</Avatar>
					<Avatar className="aspect-3/4 h-max w-16 rounded-md">
						<AvatarImage
							src="https://assets.hardcover.app/editions/30399846/4434002844651.jpg"
							alt="Book Title"
							className="object-cover aspect-3/4 h-full"
						/>
						<AvatarFallback className="rounded-lg">Book Title</AvatarFallback>
					</Avatar>
					<AvatarGroupCount className="w-16 size-none h-max aspect-3/4 rounded-lg">
						+34
					</AvatarGroupCount>
				</AvatarGroup>
			</div>
			<p className="text-card-foreground font-bold">
				The Human Shadow: True Crime
			</p>
			<div className="flex justify-between items-center mt-2">
				<Link to={"/user/johndoe"} className="flex gap-1 items-center">
					<Avatar size="sm">
						<AvatarImage src="https://assets.hardcover.app/editions/30399846/4434002844651.jpg"></AvatarImage>
					</Avatar>
					<p className="text-md font-bold text-muted-foreground">John Doe</p>
				</Link>
				<Heart className="text-muted-foreground" />
			</div>
		</Link>
	);
}
