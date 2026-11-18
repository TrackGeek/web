import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { MessagesSidebar } from "@/components/pages/messages/messages-sidebar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/messages")({
  component: MessagesLayout,
});

function MessagesLayout() {
  const { conversationId } = useParams({ strict: false });

  return (
    <div className="grid h-[calc(100svh-12rem)] min-h-96 overflow-hidden rounded-xl border border-border bg-card md:grid-cols-[20rem_1fr]">
      <MessagesSidebar
        activeId={conversationId}
        className={cn("md:flex md:border-r md:border-border", conversationId ? "hidden" : "flex")}
      />

      <section className={cn("min-h-0 min-w-0 md:flex md:flex-col", conversationId ? "flex flex-col" : "hidden")}>
        <Outlet />
      </section>
    </div>
  );
}
