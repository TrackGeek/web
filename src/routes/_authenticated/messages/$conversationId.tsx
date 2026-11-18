import { createFileRoute } from "@tanstack/react-router";
import { Thread } from "@/components/pages/messages/thread";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/_authenticated/messages/$conversationId")({
  head: () => ({
    meta: [...seo({ title: "Messages" })],
  }),
  component: ConversationRoute,
});

function ConversationRoute() {
  const { conversationId } = Route.useParams();

  return <Thread key={conversationId} conversationId={conversationId} />;
}
