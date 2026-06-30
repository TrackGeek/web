import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StarRating } from '@/components/shared/star-rating';
import type { ApiTypes } from '@/lib/api';

interface ReviewItemProps {
  user?: ApiTypes.User;
  reviewText: string;
  likes?: number;
  date: Date;
  criteries: {
    gameplay?: number;
    soundtrack?: number;
    story?: number;
    graphics?: number;
    direction?: number;
    production?: number;
    acting?: number;
    characters?: number;
    language?: number;
    theme?: number;
    art?: number;
    worldbuilding?: number;
    animation?: number;
    all?: number;
  };
  reviewName?: string;
  reviewSlug?: string;
}

function buildCriteriaList(criteries?: ReviewItemProps["criteries"]): { label: string; rating: number }[] {
  if (!criteries || typeof criteries !== "object") return [];

  const preferred: Array<keyof ReviewItemProps["criteries"]> = ["language", "story", "theme", "characters"];

  const result: { label: string; rating: number }[] = [];
  const added = new Set<string>();

  for (const key of preferred) {
    const val = (criteries as any)[key];
    if (val !== undefined) {
      result.push({ label: `feed:criteries.${key}`, rating: val as number });
      added.add(String(key));
    }
  }

  for (const [k, v] of Object.entries(criteries)) {
    if (k === "all" || added.has(k)) continue;
    if (v !== undefined) {
      result.push({ label: `feed:criteries.${k}`, rating: v as number });
    }
  }

  return result;
}

export function ReviewItem({ user, reviewText, likes = 0, date, criteries, reviewName }: ReviewItemProps) {
  const { t, i18n } = useTranslation();
  const [showReadMore, setShowReadMore] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!contentRef.current) {
      setShowReadMore(false);
      
      return;
    }
    
    const computed = getComputedStyle(contentRef.current);
    const lineHeight = parseFloat(computed.lineHeight || "0");
    const contentHeight = contentRef.current.scrollHeight;
    const shouldShow = lineHeight > 0 && contentHeight > lineHeight * 3 + 1;
    
    setShowReadMore(shouldShow);
  }, []);

  const criteriaList = buildCriteriaList(criteries);

  return (
    <div className={`w-full min-w-0 px-3 sm:px-4 py-3 rounded-xl sm:rounded-2xl flex flex-col gap-3 sm:gap-4`}>
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:gap-2 gap-2">
            {reviewName ? (
              <Link
                to={"/"}
                search={{ landing: "true" }}
                className="min-w-0 w-auto shrink-0 hover:text-primary transition-colors"
              >
                <p className="font-bold truncate text-sm sm:text-base max-w-48">{reviewName}</p>
              </Link>
            ) : (
              <Link
                to="/user/$username"
                params={{ username: user?.username ?? "" }}
                className="inline-flex items-center gap-2 min-w-0 w-auto shrink-0 hover:text-primary transition-colors"
              >
                <Avatar size="sm">
                  <AvatarImage src={user?.profile.avatarUrl} />
                </Avatar>
                <p className="font-bold truncate text-sm sm:text-base max-w-48">{user?.name}</p>
              </Link>
            )}
            
            <div className="sm:ml-auto sm:flex hidden items-center gap-1">
              <StarRating value={criteries?.all || 0} />
            </div>
          </div>

          <div className="sm:hidden flex items-center gap-1">
            <StarRating value={criteries?.all || 0} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-3 text-xs">
          {criteriaList.length > 0 &&
            criteriaList.map((criterion) => (
              <div key={criterion.label} className="flex items-center gap-1 min-w-0">
                <span className="text-muted-foreground truncate">{t(criterion.label)}:</span>
                
                <StarRating value={criterion.rating} starClassName="size-3" />
              </div>
            ))}
        </div>

        <div className="relative">
          <p
            ref={contentRef}
            className="overflow-hidden wrap-anywhere break-all relative z-10 text-xs sm:text-sm text-foreground/90 transition-all duration-200 whitespace-pre-wrap line-clamp-3"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {reviewText}
          </p>

          {showReadMore && (
            <>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-card via-card/95 to-transparent pointer-events-none z-15" />
              <Link
                to={"/"}
                search={{ landing: "true" }}
                className="absolute bottom-0 right-0 flex justify-end p-2 cursor-pointer z-20"
              >
                <Button className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium transition-colors bg-primary-foreground/80 hover:bg-primary-foreground backdrop-blur-sm rounded-full px-2">
                  {t("library:readMore")}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 sm:pt-4 border-t border-border/30">
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          {date.toLocaleDateString(i18n.language, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>

        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 items-center cursor-pointer hover:text-red-500 transition-colors">
            <Icon icon={"lucide:heart"} className="size-4" />
            <p className="text-muted-foreground min-w-6 text-center text-sm">{likes}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
