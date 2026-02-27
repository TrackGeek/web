import type { JSX } from "react";

interface DetailsCardProps {
	title: string;
	icon: JSX.Element;
	description: JSX.Element | string;
}

export function DetailsCard({ title, icon, description }: DetailsCardProps) {
	return (
		<div
			key={title}
			className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border"
		>
			<div className="shrink-0">{icon}</div>
			<div className="flex-1 min-w-0">
				<p className="text-sm text-muted-foreground">{title}</p>
				<p className="font-medium text-card-foreground">{description}</p>
			</div>
		</div>
	);
}
