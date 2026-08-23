import type { ApiTypes } from "@/lib/api";

export function getMissionDescriptionKeys(mission: ApiTypes.VisibleMission) {
  const base = `missions:descriptions.${mission.metric}`;

  return mission.contentType ? [`${base}_${mission.contentType}`, base] : [base];
}
