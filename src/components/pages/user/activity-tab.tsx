import { UserActivity } from "@/components/pages/feed/user-activity";

interface UserActivityTabProps {
  userId: string;
}

export function UserActivityTab({ userId }: UserActivityTabProps) {
  return (
    <div className="flex max-sm:flex-col gap-5">
      <UserActivity userId={userId} />
    </div>
  );
}
