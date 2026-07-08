import { Comments } from "@/components/shared/comments";
import type { ApiTypes } from "@/lib/api";
import { useSession } from "@/lib/auth";
import { AboutCard } from "./about-card";
import { ActivityCard } from "./activity-card";
import { FavoritesCard } from "./favorites-card";
import { MedalsCard } from "./medals-card";
import { StatisticsCard } from "./statistics-card";

interface UserOverviewTabProps {
  user: ApiTypes.User;
  onSeeFavorites?: () => void;
}

export function UserOverviewTab({ user, onSeeFavorites }: UserOverviewTabProps) {
  const session = useSession();

  return (
    <div className="flex flex-col gap-5">
      <StatisticsCard user={user} />

      <div className="flex max-sm:flex-col gap-5">
        <div className="w-full md:w-2/3 flex flex-col gap-5">
          <ActivityCard />

          <Comments type="Profile" profileId={user.profile.id} canModerate={session.data?.user?.id === user.id} />
        </div>

        <div className="w-full md:w-1/3 flex flex-col gap-5">
          <AboutCard about={user.profile.about} />
          <FavoritesCard userId={user.id} onSeeMore={onSeeFavorites} />
          <MedalsCard userMedals={user.userMedals} />
        </div>
      </div>
    </div>
  );
}
