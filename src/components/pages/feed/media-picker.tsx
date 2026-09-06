import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { Image } from "@unpic/react";
import type { AxiosResponse } from "axios";
import { useState } from "react";
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

export interface AttachedMedia {
  type: ContentTypeSlug;
  externalId: number;
  title: string;
  imageURL: string | null;
}

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

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ContentTypeSlug>(visible[0]);
  const [query, setQuery] = useState("");

  const debouncedQuery = useDebounce(query, 500);

  const { data, isFetching } = useQuery({
    queryKey: ["post-media-search", type, debouncedQuery],
    queryFn: () => api.get(`/${type}/search?query=${encodeURIComponent(debouncedQuery)}`),
    enabled: open && debouncedQuery.trim().length > 1,
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
      <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 py-1 pl-1 pr-2">
        {value.imageURL ? (
          <Image
            src={value.imageURL}
            width={24}
            height={32}
            alt={value.title}
            className="h-8 w-6 rounded object-cover"
          />
        ) : (
          <span className="flex h-8 w-6 items-center justify-center rounded bg-muted">
            <Icon icon={CONTENT_TYPE_ICONS[value.type]} className="size-3.5 text-muted-foreground" />
          </span>
        )}

        <span className="max-w-40 truncate text-xs font-medium">{value.title}</span>

        <button
          type="button"
          onClick={() => onChange(null)}
          disabled={disabled}
          aria-label={t("feed:postAttachRemove")}
          className="text-muted-foreground transition-colors hover:text-destructive"
        >
          <Icon icon="lucide:x" className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={disabled} className="gap-2">
          <Icon icon="lucide:paperclip" className="size-3.5" />
          {t("feed:postAttach")}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="flex w-80 flex-col gap-2 p-3">
        <Select value={type} onValueChange={(next) => setType(next as ContentTypeSlug)}>
          <SelectTrigger size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {visible.map((slug) => (
              <SelectItem key={slug} value={slug}>
                <Icon icon={CONTENT_TYPE_ICONS[slug]} className="size-4" aria-hidden />
                {t(CONTENT_TYPE_LABELS[slug])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("feed:postAttachSearch")}
          className="h-9"
        />

        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {isFetching &&
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2 p-1">
                <Skeleton className="h-12 w-9 rounded" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}

          {!isFetching &&
            results.map((media) => (
              <button
                key={`${media.type}-${media.externalId}`}
                type="button"
                onClick={() => handleSelect(media)}
                className="flex items-center gap-2 rounded-md p-1 text-left transition-colors hover:bg-muted"
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
                    <Icon icon={CONTENT_TYPE_ICONS[media.type]} className="size-4 text-muted-foreground" />
                  </span>
                )}

                <span className="min-w-0 truncate text-sm">{media.title}</span>
              </button>
            ))}

          {!isFetching && debouncedQuery.trim().length > 1 && results.length === 0 && (
            <p className="p-2 text-center text-xs text-muted-foreground">{t("common:noResults")}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
