import { Icon } from "@iconify/react";
import { useState } from "react";
import { CONTENT_TYPE_ICONS, type ContentTypeSlug } from "@/lib/content-types";
import type { RewindTitle } from "@/types/rewind";

interface RewindTitleArtProps {
  title: RewindTitle;
  alternatives?: RewindTitle[];
  type: ContentTypeSlug;
  className?: string;
}

export function RewindTitleArt({ title, alternatives = [], type, className = "" }: RewindTitleArtProps) {
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const image = [title, ...alternatives].find(
    (candidate) => candidate.image?.trim() && !failedImages.includes(candidate.image),
  )?.image;

  return (
    <div data-replay-art className={`relative aspect-2/3 overflow-clip rounded-lg bg-replay-ink/10 ${className}`}>
      {image ? (
        <img
          key={image}
          src={image}
          alt=""
          width={400}
          height={600}
          loading="lazy"
          onError={() => setFailedImages((failed) => [...failed, image])}
          className="size-full object-cover"
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-5 p-5">
          <Icon icon={CONTENT_TYPE_ICONS[type]} className="size-16" aria-hidden="true" />
          <span className="text-center text-xl font-bold">{title.title}</span>
        </div>
      )}
    </div>
  );
}
