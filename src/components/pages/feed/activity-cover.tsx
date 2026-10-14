import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import type { FeedItemData } from "./normalize";

type ActivityCoverProps = Pick<FeedItemData, "coverURL" | "mediaTitle" | "icon" | "media">;

export function ActivityCover({ coverURL, mediaTitle, icon, media }: ActivityCoverProps) {
  const className =
    "relative isolate flex w-20 shrink-0 items-center justify-center self-stretch overflow-hidden rounded-l-xl bg-muted/30 py-3 sm:w-24";
  const content = coverURL ? (
    <>
      <Image
        src={coverURL}
        layout="fullWidth"
        aspectRatio={2 / 3}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full scale-125 object-cover opacity-60 blur-lg"
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-card/30" />
      <Image
        src={coverURL}
        layout="fullWidth"
        aspectRatio={2 / 3}
        alt={mediaTitle ?? ""}
        className="relative aspect-[2/3] w-full rounded-sm object-cover"
      />
    </>
  ) : (
    <Icon icon={icon ?? "lucide:activity"} aria-hidden="true" className="size-8 text-muted-foreground sm:size-10" />
  );

  return media ? (
    <Link
      to={media.to}
      params={{ slug: media.slug }}
      aria-label={mediaTitle || undefined}
      className={`${className} focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring`}
    >
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}
