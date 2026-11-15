import { Icon } from "@iconify/react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { type ContentType, Filters } from "@/components/layouts/filters";
import { CastSearchResults } from "@/components/pages/search/cast-results";
import { SearchResults } from "@/components/pages/search/search-results";
import { UserSearchResults } from "@/components/pages/search/user-results";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NON_CONTENT_SEARCH_TYPES, SEARCH_TYPES } from "@/constants/search";
import { useSearch } from "@/hooks/use-search";
import { seo } from "@/lib/utils/seo";
import { CLEARED_FILTER_QUERY } from "@/utils/search";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [...seo({ title: "Search" })],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const {
    searchType,
    handleSearchTypeChange,
    hiddenClass,
    searchQuery,
    setSearchQuery,
    handlePaste,
    isUserSearch,
    isCastSearch,
    debouncedQuery,
    contentType,
    filters,
    handleFilterChange,
    setFilterQuery,
    items,
    isLoading,
    isError,
    isFetchingNextPage,
    sentinelRef,
  } = useSearch();

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-end">
          <div data-tour="search-type" className="w-full sm:w-32">
            <Select value={searchType} onValueChange={handleSearchTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SEARCH_TYPES.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className={
                        NON_CONTENT_SEARCH_TYPES.includes(type.value) ? "" : hiddenClass(type.value as ContentType)
                      }
                    >
                      {t(type.labelKey)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div data-tour="search-input" className="flex-1 relative w-full">
            <Input
              placeholder={`${t("common:search")}...`}
              className="bg-muted/50 flex-1 pr-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              onClick={handlePaste}
              aria-label={t("common:clipboard.paste")}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              <Icon icon={"lucide:clipboard"} className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {isUserSearch ? (
          <UserSearchResults query={debouncedQuery} />
        ) : isCastSearch ? (
          <CastSearchResults query={debouncedQuery} />
        ) : (
          <div className="flex max-md:flex-col gap-5">
            <Filters
              type={contentType}
              values={filters}
              onChange={handleFilterChange}
              onClear={() => setFilterQuery(CLEARED_FILTER_QUERY)}
            />

            <SearchResults
              items={items}
              contentType={contentType}
              isLoading={isLoading}
              isError={isError}
              isFetchingNextPage={isFetchingNextPage}
              sentinelRef={sentinelRef}
            />
          </div>
        )}
      </div>
    </div>
  );
}
