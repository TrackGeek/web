import { Footer } from "../shared/footer";
import { Header } from "../shared/header";
import { InstallPrompt } from "../shared/install-prompt";

interface LayoutProps {
  variant: "full" | "main";
  children: React.ReactNode;
}

const contentClassName: Record<LayoutProps["variant"], string> = {
  full: "flex flex-col w-full flex-1",
  main: "flex flex-col grow py-5 px-4 max-w-7xl w-full flex-1 mx-auto",
};

export function Layout({ variant, children }: LayoutProps) {
  return (
    <div className="antialiased bg-background flex flex-col min-h-screen">
      <Header />

      <main id="main-content" className={contentClassName[variant]}>
        {children}
      </main>

      <Footer />

      <InstallPrompt />
    </div>
  );
}
