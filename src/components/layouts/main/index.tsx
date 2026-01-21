import { Helmet } from "react-helmet";

import { Footer } from './footer';
import { Header } from './header';

interface LayoutProps {
	title: string;
	children: React.ReactNode;
}

export function Layout({ title, children }: LayoutProps) {
	return (
		<>
			<Helmet>
				<title>{title} | TrackGeek</title>
			</Helmet>

			<div className="bg-background flex flex-col min-h-screen">
				<Header />
        
				<main className="flex flex-col grow px-5 py-5">{children}</main>
        
				<Footer />
			</div>
		</>
	);
}
