import { Icon } from "@iconify/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnreadNotificationsCount } from "@/hooks/notification";
import { signOut, useSession } from "@/lib/auth";
import { AVATAR_BLUR } from "@/lib/image";
import { getInitialsFromName } from "@/lib/utils";

export function UserDropdown() {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const session = useSession();

  const { data: unreadCount } = useUnreadNotificationsCount();

  const unread = unreadCount ?? 0;
  const hasUnread = unread > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer">
          <Avatar className="border border-border size-9">
            {session.data?.user?.profile?.avatarUrl ? (
              <Image
                className="aspect-square size-full"
                src={session.data.user.profile.avatarUrl}
                width={36}
                height={36}
                background={AVATAR_BLUR}
                alt={session.data.user.name ?? ""}
              />
            ) : (
              <AvatarFallback>{getInitialsFromName(session.data?.user?.name ?? "")}</AvatarFallback>
            )}
          </Avatar>

          {hasUnread && (
            <span className="absolute right-0 top-0 size-2.5 rounded-full bg-destructive ring-2 ring-background">
              <span className="sr-only">{t("notifications:unreadCount", { count: unread })}</span>
            </span>
          )}
        </div>
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
        {session.data?.user?.username && (
          <DropdownMenuItem asChild>
            <Link to={"/user/$username"} params={{ username: session.data.user.username }} className="cursor-pointer">
              <Icon icon={"lucide:user"} className="text-white size-4.5" />
              {t("common:profile")}
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link to="/notifications" className="cursor-pointer">
            <Icon icon={"lucide:bell"} className="text-white size-4.5" />
            {t("common:notifications")}

            {hasUnread && (
              <Badge variant="destructive" className="ml-auto">
                {unread > 99 ? "99+" : unread}
              </Badge>
            )}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/billing" className="cursor-pointer">
            <Icon icon={"lucide:credit-card"} className="text-white size-4.5" />
            {t("common:billing")}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer">
            <Icon icon={"lucide:settings"} className="text-white size-4.5" />
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
                    navigate({ to: "/", search: { landing: "true" } });

                    toast.success(t("auth:logoutSuccessful"));
                  },
                  onError: () => {
                    toast.error(t("auth:failedToLogout"));
                  },
                },
              });
            }}
          >
            <Icon icon={"lucide:log-out"} className="text-white size-4.5" />
            {t("auth:logout")}
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
