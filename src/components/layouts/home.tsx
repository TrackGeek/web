import { Footer } from "../shared/footer";
import { Header } from "../shared/header";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className="antialiased bg-background flex flex-col min-h-screen">
      <Header />

      <div id="main-content" className="flex flex-col w-full flex-1">{children}</div>

      <Footer />
    </div>
  );
}
