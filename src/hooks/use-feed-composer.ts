import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreatePost } from "@/hooks/post";
import { useSession } from "@/lib/auth/client";
import { CONTENT_TYPE_API } from "@/lib/content-types";
import type { AttachedMedia } from "@/types/attached-media";

export function useFeedComposer(maxLength: number) {
  const { t } = useTranslation();
  const session = useSession();
  const user = session.data?.user;
  const createPost = useCreatePost(user?.id);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [media, setMedia] = useState<AttachedMedia | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const trimmed = content.trim();
  const canSubmit = trimmed.length > 0 && content.length <= maxLength && !createPost.isPending;

  function updateContent(value: string) {
    setContent(value);
    if (createPost.isSuccess || createPost.isError) createPost.reset();
  }

  function submit() {
    if (!canSubmit) return;

    createPost.mutate(
      {
        content: trimmed,
        isSpoiler,
        ...(media && { mediaType: CONTENT_TYPE_API[media.type], mediaExternalId: media.externalId }),
      },
      {
        onSuccess: () => {
          setContent("");
          setIsSpoiler(false);
          setMedia(null);
          setIsPreviewing(false);
        },
      },
    );
  }

  return {
    user,
    editorRef,
    content,
    trimmed,
    updateContent,
    isSpoiler,
    setIsSpoiler,
    media,
    setMedia,
    isPreviewing,
    setIsPreviewing,
    canSubmit,
    isPending: createPost.isPending,
    isError: createPost.isError,
    status: createPost.isError ? t("feed:postError") : createPost.isSuccess ? t("feed:postSuccess") : null,
    submit,
  };
}
