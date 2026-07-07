import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  const { t } = useTranslation();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();

      onChange(text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  return (
    <div className={cn("flex-1 relative w-full", className)}>
      <Input
        placeholder={placeholder ?? `${t("user:search")}...`}
        className="bg-muted/50 flex-1 pr-12"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={handlePaste}
        aria-label={t("user:pasteFromClipboard")}
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        <Icon icon="lucide:clipboard" className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
