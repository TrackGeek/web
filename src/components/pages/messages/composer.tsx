import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { EmojiPicker, EmojiPickerContent, EmojiPickerFooter, EmojiPickerSearch } from "@/components/ui/emoji-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useSendChatMessage, useTypingEmitter } from "@/hooks/chat";

const MAX_LENGTH = 2000;
const STICKER_ID = "trackgeek-logo";

interface ComposerProps {
  conversationId: string;
  disabled?: boolean;
}

export function Composer({ conversationId, disabled = false }: ComposerProps) {
  const { t } = useTranslation();

  const [emojiOpen, setEmojiOpen] = useState(false);

  const sendMessage = useSendChatMessage(conversationId);
  const typing = useTypingEmitter(conversationId);

  const schema = useMemo(() => z.object({ content: z.string().trim().min(1).max(MAX_LENGTH) }), []);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { content: "" },
  });

  const {
    ref: textareaRef,
    onChange: onContentChange,
    onBlur: onContentBlur,
    ...contentField
  } = form.register("content");

  const onError = () => toast.error(t("chat:sendError"));

  function handleSubmit({ content }: z.infer<typeof schema>) {
    typing.stop();
    sendMessage.mutate({ type: "Text", content }, { onSuccess: () => form.reset(), onError });
  }

  function handleEmoji(emoji: string) {
    form.setValue("content", `${form.getValues("content")}${emoji}`, { shouldValidate: true });
    setEmojiOpen(false);
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-end gap-2 border-t border-border p-3">
      <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="icon" aria-label={t("chat:emoji")} disabled={disabled}>
            <Icon icon="lucide:smile" className="size-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0" align="start">
          <EmojiPicker className="h-80" onEmojiSelect={({ emoji }) => handleEmoji(emoji)}>
            <EmojiPickerSearch />
            <EmojiPickerContent />
            <EmojiPickerFooter />
          </EmojiPicker>
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t("chat:sticker")}
        disabled={disabled || sendMessage.isPending}
        onClick={() => sendMessage.mutate({ type: "Sticker", content: STICKER_ID }, { onError })}
      >
        <img src="/favicon.svg" alt="" className="size-5" />
      </Button>

      <Textarea
        placeholder={t("chat:placeholder")}
        maxLength={MAX_LENGTH}
        rows={1}
        disabled={disabled}
        className="min-h-10 max-h-32 flex-1 resize-none"
        ref={textareaRef}
        {...contentField}
        onChange={(event) => {
          onContentChange(event);

          if (event.target.value.trim()) typing.onInput();
          else typing.stop();
        }}
        onBlur={(event) => {
          onContentBlur(event);
          typing.stop();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            form.handleSubmit(handleSubmit)();
          }
        }}
      />

      <Button
        type="submit"
        size="icon"
        aria-label={t("common:send")}
        disabled={disabled || !form.formState.isValid || sendMessage.isPending}
      >
        <Icon icon="lucide:send" className="size-4" />
      </Button>
    </form>
  );
}
