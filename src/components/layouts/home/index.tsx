import { Footer } from "../footer";
import { Header } from "../header";

interface HomeLayoutProps {
	children: React.ReactNode;
}

export function HomeLayout({ children }: HomeLayoutProps) {
	return (
		<div className="antialiased bg-background flex flex-col min-h-screen">
			<Header />

			<div className="flex flex-col w-full flex-1">
				{children}
			</div>

			<Footer />
		</div>
	);
}
