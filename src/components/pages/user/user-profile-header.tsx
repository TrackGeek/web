import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export interface UserProfileHeaderProps {
  user: {
    username: string;
    avatarUrl?: string;
    bio?: string;
    followers?: number;
    following?: number;
  };
  medalsCount?: number;
  entriesCount?: number;
}

export function UserProfileHeader({ user, medalsCount = 0, entriesCount = 0 }: UserProfileHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 flex items-center gap-6 w-full justify-between mb-5">
      <div className="flex items-center gap-4">
        <Avatar size="lg">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={`${user.username} avatar`} />
          ) : (
            <AvatarFallback>{(user.username || "?").charAt(0).toUpperCase()}</AvatarFallback>
          )}
        </Avatar>

        <span className="text-lg font-semibold text-card-foreground">{user.username}</span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="bg-muted px-3 py-1 rounded-full text-sm">
            <strong className="font-semibold text-card-foreground">{entriesCount}</strong>
            <span className="text-muted-foreground ml-2">{t("user:entry_plural")}</span>
          </div>
          <div className="bg-muted px-3 py-1 rounded-full text-sm">
            <strong className="font-semibold text-card-foreground">{medalsCount}</strong>
            <span className="text-muted-foreground ml-2">{t("user:medals")}</span>
          </div>
          <div className="bg-muted px-3 py-1 rounded-full text-sm">
            <strong className="font-semibold text-card-foreground">{user.followers || 0}</strong>
            <span className="text-muted-foreground ml-2">{t("user:follower_plural")}</span>
          </div>
          <div className="bg-muted px-3 py-1 rounded-full text-sm">
            <strong className="font-semibold text-card-foreground">{user.following || 0}</strong>
            <span className="text-muted-foreground ml-2">{t("user:following")}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Button variant="secondary">{t("user:follow")}</Button>
        </div>
      </div>
    </div>
  );
}
