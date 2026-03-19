import ViteImage from "@son426/vite-image/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Settings, User, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth";
import { getInitialsFromName } from "@/lib/utils";

export function UserDropdown() {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const session = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="border border-border size-9 cursor-pointer">
          {session.data?.user?.profile?.avatarUrl ? (
            <ViteImage
              className="aspect-square size-full"
              src={{
                src: session.data.user.profile.avatarUrl,
                blurDataURL: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH",
                width: 36,
                height: 36,
              }}
            />
          ) : (
            <AvatarFallback>{getInitialsFromName(session.data?.user?.name || "John Doe")}</AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" align="end">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{session.data?.user?.name}</span>

              <span className="truncate text-xs">{session.data?.user?.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link to={"/user/$username"} params={{ username: session.data?.user?.username! }} className="cursor-pointer">
            <User size={18} className="text-white" />
            {t("common:profile")}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/" className="cursor-pointer">
            <Bell size={18} className="text-white" />
            {t("common:notifications")}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/billing" className="cursor-pointer">
            <CreditCard size={18} className="text-white" />
            {t("common:billing")}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer">
            <Settings size={18} className="text-white" />
            {t("common:settings")}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <button
            type="button"
            className="w-full cursor-pointer"
            onClick={async () => {
              await signOut({
                fetchOptions: {
                  onSuccess: () => {
                    navigate({ to: "/" });

                    toast.success(t("auth:logoutSuccessful"));
                  },
                  onError: () => {
                    toast.error(t("auth:failedToLogout"));
                  },
                },
              });
            }}
          >
            <LogOut size={18} className="text-white" />
            {t("auth:logout")}
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
