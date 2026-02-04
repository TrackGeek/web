import { Footer } from "./footer";
import { Header } from "./header";

interface MainLayoutProps {
	children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
	return (
		<div className="bg-background flex flex-col min-h-screen">
			<Header />

			<main className="flex flex-col grow py-5 px-4 max-w-7xl w-full flex-1 mx-auto">
				{children}
			</main>

			<Footer />
		</div>
	);
}
