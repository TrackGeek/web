import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { Image } from "@unpic/react";
import type { AxiosResponse } from "axios";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentTypes } from "@/hooks/content-type";
import { api } from "@/lib/api";
import { CONTENT_TYPE_ICONS, CONTENT_TYPE_LABELS, type ContentTypeSlug } from "@/lib/content-types";
import { useDebounce } from "@/lib/utils/useDebounce";
import type { AttachedMedia } from "@/types/attached-media";

export type { AttachedMedia } from "@/types/attached-media";

const RESULT_LIMIT = 8;

interface SearchResultItem {
  malId?: number | null;
  anilistId?: number | null;
  tmdbId?: number | null;
  igdbId?: number | null;
  hardcoverId?: number | null;
  title?: string | null;
  name?: string | null;
  imageUrl?: string | null;
  posterUrl?: string | null;
  coverUrl?: string | null;
}

function getItems(response: AxiosResponse, type: ContentTypeSlug): SearchResultItem[] {
  const data = response?.data;

  switch (type) {
    case "movie":
      return data?.movies?.items ?? [];
    case "tv":
      return data?.tvShows?.items ?? [];
    case "anime":
      return data?.animes?.items ?? [];
    case "manga":
      return data?.mangas?.items ?? [];
    case "book":
      return data?.books?.items ?? [];
    case "game":
      return data?.games?.items ?? [];
    default:
      return [];
  }
}

const EXTERNAL_ID_BY_TYPE: Record<ContentTypeSlug, (item: SearchResultItem) => number | null | undefined> = {
  anime: (item) => item.malId,
  manga: (item) => item.anilistId,
  tv: (item) => item.tmdbId,
  movie: (item) => item.tmdbId,
  game: (item) => item.igdbId,
  book: (item) => item.hardcoverId,
};

function toAttachedMedia(item: SearchResultItem, type: ContentTypeSlug): AttachedMedia | null {
  const externalId = EXTERNAL_ID_BY_TYPE[type](item);

  if (!externalId) return null;

  return {
    type,
    externalId: Number(externalId),
    title: item.title ?? item.name ?? "",
    imageURL: item.imageUrl ?? item.posterUrl ?? item.coverUrl ?? null,
  };
}

interface MediaPickerProps {
  value: AttachedMedia | null;
  onChange: (media: AttachedMedia | null) => void;
  disabled?: boolean;
}

export function MediaPicker({ value, onChange, disabled = false }: MediaPickerProps) {
  const { t } = useTranslation();
  const { visible } = useContentTypes();
  const searchRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ContentTypeSlug>(visible[0]);
  const [query, setQuery] = useState("");

  const debouncedQuery = useDebounce(query, 500);

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["post-media-search", type, debouncedQuery],
    queryFn: () => api.get(`/${type}/search?query=${encodeURIComponent(debouncedQuery)}`),
    enabled: open && !disabled && debouncedQuery.trim().length > 1,
  });

  const results: AttachedMedia[] = data
    ? getItems(data, type)
        .map((item) => toAttachedMedia(item, type))
        .filter((item): item is AttachedMedia => item !== null)
        .slice(0, RESULT_LIMIT)
    : [];

  function handleSelect(media: AttachedMedia) {
    onChange(media);
    setOpen(false);
    setQuery("");
  }

  if (value) {
    return (
      <div className="flex min-w-0 items-center gap-3 rounded-md bg-muted/40 p-2">
        {value.imageURL ? (
          <Image
            src={value.imageURL}
            width={30}
            height={40}
            alt={value.title}
            className="h-9 w-7.5 shrink-0 rounded object-cover"
          />
        ) : (
          <span className="flex h-9 w-7.5 shrink-0 items-center justify-center rounded bg-muted">
            <Icon icon={CONTENT_TYPE_ICONS[value.type]} className="size-3.5 text-muted-foreground" aria-hidden />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" title={value.title}>
            {value.title}
          </p>
          <p className="text-xs text-muted-foreground">{t(CONTENT_TYPE_LABELS[value.type])}</p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange(null)}
          disabled={disabled}
          aria-label={t("feed:postAttachRemove")}
          className="size-9 text-muted-foreground transition-none hover:bg-muted hover:text-destructive focus-visible:ring-ring active:bg-muted/70"
        >
          <Icon icon="lucide:x" className="size-4" aria-hidden />
        </Button>
      </div>
    );
  }

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          aria-label={t("feed:postAttach")}
          className="h-9 min-w-11 max-w-full gap-2 px-3 text-muted-foreground transition-none hover:bg-muted hover:text-card-foreground focus-visible:ring-ring active:bg-muted/70"
        >
          <Icon icon="lucide:paperclip" className="size-4" aria-hidden />
          <span className="hidden min-w-0 truncate @sm:inline">{t("feed:postAttach")}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        collisionPadding={16}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          searchRef.current?.focus();
        }}
        className="flex max-h-(--radix-popover-content-available-height) w-96 max-w-[calc(100vw-2rem)] flex-col gap-3 overflow-y-auto p-3 motion-reduce:animate-none!"
      >
        <Select value={type} onValueChange={(next) => setType(next as ContentTypeSlug)}>
          <SelectTrigger
            aria-label={t("feed:postAttach")}
            className="h-9! w-full border-muted-foreground/60 transition-none focus-visible:ring-ring"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="motion-reduce:animate-none!">
            {visible.map((slug) => (
              <SelectItem key={slug} value={slug} className="min-h-9 active:bg-muted">
                <Icon icon={CONTENT_TYPE_ICONS[slug]} className="size-4" aria-hidden />
                {t(CONTENT_TYPE_LABELS[slug])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          ref={searchRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("feed:postAttachSearch")}
          aria-label={t("feed:postAttachSearch")}
          autoComplete="off"
          className="h-9 border-muted-foreground/60 text-base transition-none focus-visible:ring-ring md:text-base"
        />

        <div className="flex min-h-0 max-h-64 flex-col gap-1 overflow-y-auto" aria-busy={isFetching}>
          {isFetching &&
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2 p-1">
                <Skeleton className="h-12 w-9 rounded" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}

          {!isFetching &&
            !isError &&
            results.map((media) => (
              <button
                key={`${media.type}-${media.externalId}`}
                type="button"
                onClick={() => handleSelect(media)}
                className="flex min-h-14 w-full items-center gap-3 rounded-md p-2 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:bg-muted/70"
              >
                {media.imageURL ? (
                  <Image
                    src={media.imageURL}
                    width={36}
                    height={48}
                    alt={media.title}
                    className="h-12 w-9 shrink-0 rounded object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-9 shrink-0 items-center justify-center rounded bg-muted">
                    <Icon icon={CONTENT_TYPE_ICONS[media.type]} className="size-4 text-muted-foreground" aria-hidden />
                  </span>
                )}

                <span className="min-w-0 truncate text-sm">{media.title}</span>
              </button>
            ))}

          {isError && !isFetching && (
            <div className="flex flex-col items-center gap-2 p-2">
              <p role="alert" className="text-center text-sm text-destructive">
                {t("common:somethingWentWrong")}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => refetch()}
                className="h-9 transition-none focus-visible:ring-ring"
              >
                {t("common:tryAgain")}
              </Button>
            </div>
          )}

          {!isFetching && !isError && debouncedQuery.trim().length > 1 && results.length === 0 && (
            <p role="status" className="p-2 text-center text-sm text-muted-foreground">
              {t("common:noResults")}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
