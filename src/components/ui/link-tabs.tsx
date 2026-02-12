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

function LinkTabsList({
	className,
	children,
	...props
}: LinkTabsListProps) {
	return (
		<div
			data-slot="link-tabs-list"
			className={cn(
				"border border-border text-malachite-400 bg-card inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

interface LinkTabsTriggerProps
	extends React.ComponentProps<typeof Link> {
	to: string;
	className?: string;
	activeMatchFn?: (pathname: string, href: string) => boolean;
}

function LinkTabsTrigger({
	className,
	to,
	children,
	activeMatchFn,
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
				"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:outline-1 border border-transparent text-malachite-400 dark:text-malachite-400 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			{children}
		</Link>
	);
}

interface LinkTabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string;
}

function LinkTabsContent({
	className,
	children,
	...props
}: LinkTabsContentProps) {
	return (
		<div
			data-slot="link-tabs-content"
			className={cn("flex-1 outline-none", className)}
			{...props}
		>
			{children}
		</div>
	);
}

export { LinkTabs, LinkTabsList, LinkTabsTrigger, LinkTabsContent };
