import { Comments } from "@/components/shared/comments";
import { useDiscordPresence } from "@/hooks/discord";
import type { ApiTypes } from "@/lib/api";
import { useSession } from "@/lib/auth/client";
import { resolveProfileColorHex } from "@/lib/cosmetics";
import { cn } from "@/lib/utils";
import { AboutCard } from "./about-card";
import { ActivityCard } from "./activity-card";
import { DiscordActivityCard } from "./discord-activity-card";
import { FavoritesCard } from "./favorites-card";
import { LinksCard } from "./links-card";
import { MedalsCard } from "./medals-card";
import { SetupCard } from "./setup-card";
import { SpotifyCard } from "./spotify-card";
import { StatisticsCard } from "./statistics-card";
import { XpCard } from "./xp-card";

interface UserOverviewTabProps {
  user: ApiTypes.User;
  onSeeFavorites?: () => void;
  onSeeProgress?: (contentType: ApiTypes.ReviewContentType) => void;
}

export function UserOverviewTab({ user, onSeeFavorites, onSeeProgress }: UserOverviewTabProps) {
  const session = useSession();

  const presenceQuery = useDiscordPresence(user.id);

  const presence = presenceQuery.data;

  const showSpotify = presenceQuery.isPending || !!presence?.spotify;
  const showDiscordActivity = presenceQuery.isPending || !!presence?.status || (presence?.activities?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-5">
      <StatisticsCard user={user} onSeeProgress={onSeeProgress} />

      <div className="flex max-sm:flex-col gap-5">
        <div className="w-full md:w-2/3 flex flex-col gap-5">
          <AboutCard about={user.profile.about} />

          <ActivityCard userId={user.id} color={resolveProfileColorHex(user.profile.color)} />

          {(showSpotify || showDiscordActivity) && (
            <div className={cn("grid grid-cols-1 gap-5", showSpotify && showDiscordActivity && "md:grid-cols-2")}>
              {showSpotify && <SpotifyCard userId={user.id} />}
              {showDiscordActivity && <DiscordActivityCard userId={user.id} />}
            </div>
          )}

          <FavoritesCard userId={user.id} onSeeMore={onSeeFavorites} />

          <Comments type="Profile" profileId={user.profile.id} canModerate={session.data?.user?.id === user.id} />
        </div>

        <div className="w-full md:w-1/3 flex flex-col gap-5">
          <XpCard xp={user.xp} coins={user.coins} />
          {user.userMedals.length > 0 && <MedalsCard userMedals={user.userMedals} />}
          <LinksCard user={user} isOwner={session.data?.user?.id === user.id} />
          <SetupCard user={user} isOwner={session.data?.user?.id === user.id} />
        </div>
      </div>
    </div>
  );
}
