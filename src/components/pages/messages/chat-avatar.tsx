import { Icon } from "@iconify/react";
import { Image } from "@unpic/react";
import { PresenceDot } from "@/components/shared/presence/presence-dot";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePresence } from "@/hooks/presence";
import type { ApiTypes } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ChatAvatarProps {
  user: ApiTypes.ChatUser | null;
  size?: number;
  className?: string;
  showPresence?: boolean;
  fallbackPresence?: ApiTypes.PresenceState;
}

export function ChatAvatar({ user, size = 40, className, showPresence = false, fallbackPresence }: ChatAvatarProps) {
  const { data } = usePresence(showPresence ? user?.id : undefined);

  const presence = showPresence ? (data ?? fallbackPresence) : undefined;

  const avatar = (
    <Avatar className={cn("shrink-0 border border-border/50", className)} style={{ width: size, height: size }}>
      {user?.profile?.avatarUrl ? (
        <Image
          className="aspect-square size-full"
          src={user.profile.avatarUrl}
          width={size}
          height={size}
          alt={user.username}
        />
      ) : (
        <AvatarFallback>
          {user ? (
            (user.username || "?").charAt(0).toUpperCase()
          ) : (
            <Icon icon="lucide:user-round-x" className="size-1/2" />
          )}
        </AvatarFallback>
      )}
    </Avatar>
  );

  if (!presence || "hidden" in presence) return avatar;

  return (
    <div className="relative shrink-0">
      {avatar}
      <PresenceDot presence={presence} className="absolute bottom-0 right-0" />
    </div>
  );
}
