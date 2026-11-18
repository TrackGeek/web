import { useTranslation } from "react-i18next";

const DOT_DELAYS = ["[animation-delay:-0.3s]", "[animation-delay:-0.15s]", ""];

export function TypingBubble() {
  const { t } = useTranslation();

  return (
    <div className="flex shrink-0">
      <div
        role="status"
        aria-label={t("chat:typing")}
        className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3 animate-in fade-in slide-in-from-bottom-1"
      >
        {DOT_DELAYS.map((delay) => (
          <span key={delay} className={`size-2 rounded-full bg-muted-foreground/70 animate-bounce ${delay}`} />
        ))}
      </div>
    </div>
  );
}
