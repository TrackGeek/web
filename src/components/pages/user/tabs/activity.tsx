import { FeedListFollowing } from "@/components/pages/feed/listFollowing";

export function UserActivityTab() {
  return (
    <div className="flex max-sm:flex-col gap-5">
      <FeedListFollowing />
    </div>
  );
}
