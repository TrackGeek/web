import { Comments } from "@/components/shared/comments";
import type { ApiTypes } from "@/lib/api";
import { useSession } from "@/lib/auth/client";
import { resolveProfileColorHex } from "@/lib/cosmetics";
import { AboutCard } from "./about-card";
import { ActivityCard } from "./activity-card";
import { FavoritesCard } from "./favorites-card";
import { MedalsCard } from "./medals-card";
import { SetupCard } from "./setup-card";
import { StatisticsCard } from "./statistics-card";
import { XpCard } from "./xp-card";

interface UserOverviewTabProps {
  user: ApiTypes.User;
  onSeeFavorites?: () => void;
  onSeeProgress?: (contentType: ApiTypes.ReviewContentType) => void;
}

export function UserOverviewTab({ user, onSeeFavorites, onSeeProgress }: UserOverviewTabProps) {
  const session = useSession();

  return (
    <div className="flex flex-col gap-5">
      <StatisticsCard user={user} onSeeProgress={onSeeProgress} />

      <div className="flex max-sm:flex-col gap-5">
        <div className="w-full md:w-2/3 flex flex-col gap-5">
          <ActivityCard userId={user.id} color={resolveProfileColorHex(user.profile.color)} />

          <Comments type="Profile" profileId={user.profile.id} canModerate={session.data?.user?.id === user.id} />
        </div>

        <div className="w-full md:w-1/3 flex flex-col gap-5">
          <XpCard xp={user.xp} coins={user.coins} />
          <AboutCard about={user.profile.about} />
          <SetupCard user={user} isOwner={session.data?.user?.id === user.id} />
          <FavoritesCard userId={user.id} onSeeMore={onSeeFavorites} />
          <MedalsCard userMedals={user.userMedals} />
        </div>
      </div>
    </div>
  );
}
