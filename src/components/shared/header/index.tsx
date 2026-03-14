import { Link } from "@tanstack/react-router";
import { Book, Clapperboard, Gamepad2, Heart, Home, LibraryBig, Menu, Mountain, Newspaper, Search, TvMinimalPlay } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth";
import { AuthModal } from "./auth-modal";
import { UserDropdown } from "./user-dropdown";

export function Header() {
  const { t } = useTranslation();

  const session = useSession();

  return (
    <header className="bg-border/30 backdrop-blur border-b border-border w-full h-14 flex items-center justify-between px-5 py-2">
      <div className="flex items-center justify-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="w-fit">
            <Button>
              <Menu />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-42 rounded-lg" align="start">
            <DropdownMenuItem asChild>
              <Link to="/" className="cursor-pointer">
                <Home size={18} className="text-white" />
                {t("common:home")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/feed" className="cursor-pointer">
                <Newspaper size={18} className="text-white" />
                {t("common:feed")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/anime" className="cursor-pointer">
                <Mountain size={18} className="text-white" />
                {t("common:types.anime_other")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/book" className="cursor-pointer">
                <Book size={18} className="text-white" />
                {t("common:types.book_other")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/game" className="cursor-pointer">
                <Gamepad2 size={18} className="text-white" />
                {t("common:types.game_other")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/tv" className="cursor-pointer">
                <TvMinimalPlay size={18} className="text-white" />
                {t("common:types.tv_other")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/manga" className="cursor-pointer">
                <LibraryBig size={18} className="text-white" />
                {t("common:types.manga_other")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/movie" className="cursor-pointer">
                <Clapperboard size={18} className="text-white" />
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
            <Search />
          </Button>
        </Link>
        <Link to="/donate" className="max-sm:hidden">
          <Button variant={"outline"}>
            <Heart color="red" fill="red" />
            {t("common:donate")}
          </Button>
        </Link>

        {session.isPending ? <Skeleton className="h-8 w-8" /> : session.data ? <UserDropdown /> : <AuthModal />}
      </div>
    </header>
  );
}
