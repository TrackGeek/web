import { Icon } from "@iconify/react";
import { useState } from "react";
import { CONTENT_TYPE_ICONS, type ContentTypeSlug } from "@/lib/content-types";
import type { RewindTitle } from "@/types/rewind";

interface RewindTitleArtProps {
  title: RewindTitle;
  type: ContentTypeSlug;
  className?: string;
}

export function RewindTitleArt({ title, type, className = "" }: RewindTitleArtProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative aspect-2/3 overflow-clip rounded-lg bg-replay-ink/10 ${className}`}>
      {title.image && !failed ? (
        <img
          src={title.image}
          alt=""
          width={400}
          height={600}
          loading="lazy"
          onError={() => setFailed(true)}
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
