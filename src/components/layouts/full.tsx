import { Footer } from "../shared/footer";
import { Header } from "../shared/header";

interface FullLayoutProps {
  children: React.ReactNode;
}

export function FullLayout({ children }: FullLayoutProps) {
  return (
    <div className="antialiased bg-background flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-col w-full flex-1">{children}</div>

      <Footer />
    </div>
  );
}
