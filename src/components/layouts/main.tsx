import { Footer } from "../shared/footer";
import { Header } from "../shared/header";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="antialiased bg-background flex flex-col min-h-screen">
      <Header />

      <div id="main-content" className="flex flex-col grow py-6 px-4 max-w-7xl w-full flex-1 mx-auto">
        {children}
      </div>

      <Footer />
    </div>
  );
}
