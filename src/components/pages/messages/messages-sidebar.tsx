import { Icon } from "@iconify/react";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ConversationList } from "./conversation-list";
import { FriendsList } from "./friends-list";
import { OnlineFriendsStrip } from "./online-friends-strip";

interface MessagesSidebarProps {
  activeId?: string;
  className?: string;
}

export function MessagesSidebar({ activeId, className }: MessagesSidebarProps) {
  const { t } = useTranslation();

  const [search, setSearch] = useQueryState("q", { defaultValue: "" });

  return (
    <aside className={cn("min-h-0 flex-col", className)}>
      <div className="flex flex-col gap-3 border-b border-border p-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="flex items-center gap-2 text-lg font-bold">
            <Icon icon="lucide:messages-square" className="size-5" />
            {t("chat:title")}
          </h1>

          <NewMessageButton />
        </div>

        <SearchInput value={search} onChange={(value) => setSearch(value || null)} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <OnlineFriendsStrip search={search} />

        <h2 className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("chat:conversations")}
        </h2>

        <ConversationList search={search} activeId={activeId} />
      </div>
    </aside>
  );
}

function NewMessageButton() {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" aria-label={t("chat:newMessage")} onClick={() => setOpen(true)}>
        <Icon icon="lucide:square-pen" className="size-5" />
      </Button>

      <DialogContent className="flex max-h-[80svh] flex-col">
        <DialogHeader>
          <DialogTitle>{t("chat:newMessage")}</DialogTitle>
          <DialogDescription>{t("chat:description")}</DialogDescription>
        </DialogHeader>

        <SearchInput value={search} onChange={setSearch} />

        <div className="min-h-0 flex-1 overflow-y-auto">
          <FriendsList search={search} onStarted={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
