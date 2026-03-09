import { createFileRoute } from "@tanstack/react-router";
import { Clipboard } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Filters } from "@/components/layouts/filters.tsx";
import { Grid } from "@/components/layouts/grid";
import { CardItem } from "@/components/shared/cards/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/search")({
  head: () => {
    return {
      meta: [...seo({ title: "Search" })],
    };
  },
  component: RouteComponent,
});

type ContentType = "anime" | "manga" | "book" | "game" | "movie" | "tv";

const CONTENT_TYPES: { value: ContentType; labelKey: string }[] = [
  { value: "anime", labelKey: "common:types.anime" },
  { value: "manga", labelKey: "common:types.manga" },
  { value: "book", labelKey: "common:types.book" },
  { value: "game", labelKey: "common:types.game" },
  { value: "movie", labelKey: "common:types.movie" },
  { value: "tv", labelKey: "common:types.tv" },
];

function RouteComponent() {
  const { t } = useTranslation();
  const [contentType, setContentType] = useState<ContentType>("anime");
  const [searchQuery, setSearchQuery] = useState("");

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSearchQuery(text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const mockResults = [
    { id: "1", title: "Result 1", image: "/favicon.svg", score: 8.5 },
    { id: "2", title: "Result 2", image: "/logo.svg", score: 9.0 },
    { id: "3", title: "Result 3", image: "/logo.svg", score: 7.8 },
  ];

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="w-full sm:w-32">
            <Select value={contentType} onValueChange={(value) => setContentType(value as ContentType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {t(type.labelKey)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 relative w-full">
            <Input
              placeholder={`${t("user:search")}...`}
              className="bg-muted/50 flex-1 pr-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Clipboard
              className="size-5 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-primary transition"
              onClick={handlePaste}
            />
          </div>
        </div>

        <div className="flex max-sm:flex-col gap-5">
          <Filters type={contentType} />

          <Grid minColSize="128px" className="flex-1 md:w-2/3 grid gap-6">
            {mockResults.map((item) => (
              <CardItem
                key={item.id}
                title={item.title}
                url={`/${contentType}/${item.id}`}
                imageURL={item.image}
                rating={item.score}
                year={2024}
                synopsis={item.title}
                mediaType={contentType as any}
              />
            ))}
          </Grid>
        </div>
      </div>
    </div>
  );
}
