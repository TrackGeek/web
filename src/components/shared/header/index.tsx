import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth/client";
import { AuthModal } from "./auth-modal";
import { UserDropdown } from "./user-dropdown";

export function Header() {
  const { t } = useTranslation();

  const session = useSession();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>
      <header className="bg-border/30 backdrop-blur border-b border-border w-full h-14 flex items-center justify-between px-5 py-2">
        <div className="flex items-center justify-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-fit">
              <Button>
                <Icon icon={"lucide:menu"} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-42 rounded-lg" align="start">
              <DropdownMenuItem asChild>
                <Link to="/" className="cursor-pointer" search={{ landing: "true" }}>
                  <Icon icon={"lucide:home"} className="text-white size-4.5" />
                  {t("common:home")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/feed" className="cursor-pointer">
                  <Icon icon={"lucide:newspaper"} className="text-white size-4.5" />
                  {t("common:feed")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/anime" className="cursor-pointer">
                  <Icon icon={"lucide:mountain"} className="text-white size-4.5" />
                  {t("common:types.anime_other")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/book" className="cursor-pointer">
                  <Icon icon={"lucide:book"} className="text-white size-4.5" />
                  {t("common:types.book_other")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/game" className="cursor-pointer">
                  <Icon icon={"lucide:gamepad-2"} className="text-white size-4.5" />
                  {t("common:types.game_other")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/tv" className="cursor-pointer">
                  <Icon icon={"lucide:tv-minimal-play"} className="text-white size-4.5" />
                  {t("common:types.tv_other")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/manga" className="cursor-pointer">
                  <Icon icon={"lucide:library-big"} className="text-white size-4.5" />
                  {t("common:types.manga_other")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/movie" className="cursor-pointer">
                  <Icon icon={"lucide:clapperboard"} className="text-white size-4.5" />
                  {t("common:types.movie_other")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to={session.data?.user ? "/feed" : "/"}>
            <img src="/logo.svg" alt="Logo" className="h-10 max-sm:hidden" />
            <img src="/favicon.svg" alt="Logo" className="h-10 sm:hidden" />
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link to="/search">
            <Button>
              <Icon icon={"lucide:search"} />
            </Button>
          </Link>
          <Link to="/donate" className="max-sm:hidden">
            <Button variant={"outline"}>
              <Icon icon={"lucide:heart"} className="text-red-500 [&_path]:fill-red-500" />
              {t("common:donate")}
            </Button>
          </Link>

          {session.isPending ? <Skeleton className="h-8 w-8" /> : session.data ? <UserDropdown /> : <AuthModal />}
        </div>
      </header>
    </>
  );
}
