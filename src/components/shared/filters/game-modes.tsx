import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

const CLEAR_VALUE = "__clear__";

interface GameModesProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
}

export function GameModes({ value, onChange }: GameModesProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:gameModes")}</h5>
      <Select value={value ?? CLEAR_VALUE} onValueChange={(v) => onChange?.(v === CLEAR_VALUE ? undefined : v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("library:gameModes")} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={CLEAR_VALUE}>{t("common:all")}</SelectItem>
            <SelectItem value="single-player">{t("library:gameModesList.singleplayer")}</SelectItem>
            <SelectItem value="multiplayer">{t("library:gameModesList.multiplayer")}</SelectItem>
            <SelectItem value="co-operative">{t("library:gameModesList.cooperative")}</SelectItem>
            <SelectItem value="split-screen">{t("library:gameModesList.splitscreen")}</SelectItem>
            <SelectItem value="massively-multiplayer-online-mmo">
              {t("library:gameModesList.massivelyMultiplayerOnline")}
            </SelectItem>
            <SelectItem value="battle-royale">{t("library:gameModesList.battleRoyale")}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
