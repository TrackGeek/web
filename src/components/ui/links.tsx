import type * as React from "react";

import { cn } from "@/lib/utils";

function Links({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			data-slot="links"
			className={cn("flex flex-col gap-2", className)}
			{...props}
		/>
	);
}

function LinksList({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			data-slot="links-list"
			className={cn(
				"border border-border text-malachite-400 bg-card inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
				className,
			)}
			{...props}
		/>
	);
}

function LinksItem({
	className,
	...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
	return (
		<a
			data-slot="links-item"
			className={cn(
				"cursor-pointer hover:bg-malachite-900 dark:hover:text-malachite-100 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:hover:border-input dark:hover:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 duration-300",
				className,
			)}
			{...props}
		/>
	);
}

export { Links, LinksList, LinksItem };
