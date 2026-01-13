import { Bell, Heart, LogIn, Menu } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { StarsBackground } from "../ui/starsBackground";

interface LayoutProps {
	title: string;
	children: React.ReactNode;
}

export function Layout({ title, children }: LayoutProps) {
	return (
		<>
			<Helmet>
				<title>{title} | TrackVerse</title>
			</Helmet>

			<div className="flex flex-col min-h-full">
				<StarsBackground />
				<header className="bg-black w-full h-14 flex items-center justify-between px-5 py-2">
					<div className="flex items-center justify-center gap-3">
						<Button>
							<Menu />
						</Button>
						<Link to="/">
							<img src="/logo.svg" alt="Logo" className="h-full w-45" />
						</Link>
					</div>
					<div className="flex items-center justify-center gap-3">
						<Button>
							<Heart fill="red" />
							Donate
						</Button>
						<Button>
							<Bell fill="white" />
						</Button>
						<Button>
							<LogIn />
							Login
						</Button>
					</div>
				</header>
				<main className="flex h-screen flex-col items-center justify-center">
					{children}
				</main>
			</div>
		</>
	);
}
