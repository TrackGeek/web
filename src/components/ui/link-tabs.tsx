import { Link, useLocation } from "@tanstack/react-router";
import type * as React from "react";

import { cn } from "@/lib/utils";

interface LinkTabsProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string;
}

function LinkTabs({ className, children, ...props }: LinkTabsProps) {
	return (
		<div
			data-slot="link-tabs"
			className={cn("flex flex-col gap-2", className)}
			{...props}
		>
			{children}
		</div>
	);
}

interface LinkTabsListProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string;
}

/**
 * Container for a horizontally scrollable list of link tab triggers.
 *
 * Renders a full-width, rounded div styled for a tab list with horizontal scrolling and hidden vertical overflow. Additional div attributes and children are passed through.
 *
 * @param className - Optional additional class names to apply to the container
 * @returns The rendered div element serving as the link tabs list container
 */
function LinkTabsList({ className, children, ...props }: LinkTabsListProps) {
	return (
		<div
			data-slot="link-tabs-list"
			className={cn(
				"border border-border text-malachite-400 bg-card flex h-9 w-full items-center rounded-lg p-0.75 overflow-y-hidden  overflow-x-auto scroll-smooth",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

interface LinkTabsTriggerProps extends React.ComponentProps<typeof Link> {
	to: string;
	className?: string;
	activeMatchFn?: (pathname: string, href: string) => boolean;
	orientation?: "horizontal" | "vertical";
}

/**
 * A navigational tab trigger rendered as a link that applies active styling based on the current location.
 *
 * @param className - Additional CSS classes to apply to the trigger element.
 * @param to - Destination path or route target for the Link.
 * @param children - Content displayed inside the trigger (label, icon, etc.).
 * @param activeMatchFn - Optional function to determine active state given the current pathname and the `to` value.
 * @param orientation - Layout orientation of the trigger; `"horizontal"` renders inline, `"vertical"` stacks content.
 * @returns A Link element styled as a tab trigger that reflects active/inactive state based on the current location.
 */
function LinkTabsTrigger({
	className,
	to,
	children,
	activeMatchFn,
	orientation = "horizontal",
	...props
}: LinkTabsTriggerProps) {
	const location = useLocation();
	const isActive = activeMatchFn
		? activeMatchFn(location.pathname, to)
		: location.pathname === to;

	return (
		<Link
			to={to}
			data-slot="link-tabs-trigger"
			className={cn(
				"cursor-pointer transition-[color,box-shadow] duration-300",
				isActive
					? "bg-malachite-900 dark:text-malachite-100 dark:border-input dark:bg-input/30 shadow-sm"
					: "text-foreground dark:text-muted-foreground",
				"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:outline-1 border border-transparent text-malachite-400 dark:text-malachite-400 h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				orientation === "horizontal" ? "inline-flex" : "flex-col",
				className,
			)}
			{...props}
		>
			{children}
		</Link>
	);
}

export { LinkTabs, LinkTabsList, LinkTabsTrigger };
