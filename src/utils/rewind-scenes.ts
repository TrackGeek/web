import type { TFunction } from "i18next";
import { CONTENT_TYPE_LABELS } from "@/lib/content-types";
import type { PersonalRewind, RewindScene } from "@/types/rewind";

export function buildRewindScenes(rewind?: PersonalRewind): RewindScene[] {
  const scenes: RewindScene[] = [{ id: "intro", kind: "intro" }];

  if (rewind && rewind.tracked > 0) {
    scenes.push({ id: "overview", kind: "overview" });
    if (rewind.first) scenes.push({ id: "first", kind: "first" });
    scenes.push({ id: "rhythm", kind: "rhythm" });

    for (const category of rewind.categories) {
      if (category.tracked < 1) continue;
      scenes.push({ id: category.type, kind: "category", category });
      scenes.push({ id: `${category.type}-shelf`, kind: "shelf", category });
    }
  }

  scenes.push({ id: "global", kind: "global" }, { id: "outro", kind: "outro" });
  return scenes;
}

export function rewindSceneLabel(scene: RewindScene, t: TFunction) {
  if (scene.kind === "category" || scene.kind === "shelf") {
    const type = t(CONTENT_TYPE_LABELS[scene.category.type]);
    return scene.kind === "shelf" ? t("rewind:shelf.title", { type }) : type;
  }
  return t(`rewind:chapters.${scene.kind}`);
}
