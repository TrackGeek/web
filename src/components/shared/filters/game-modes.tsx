import { useTranslation } from "react-i18next";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox.tsx";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

export function GameModes() {
  const { t } = useTranslation();

  return (
    <>
      <div>
        <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:gameModes")}</h5>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("library:gameModes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="cooperative">{t("library:gameModesList.cooperative")}</SelectItem>
              <SelectItem value="singleplayer">{t("library:gameModesList.singleplayer")}</SelectItem>
              <SelectItem value="multiplayer">{t("library:gameModesList.multiplayer")}</SelectItem>
              <SelectItem value="mmo">{t("library:gameModesList.massivelyMultiplayerOnline")}</SelectItem>
              <SelectItem value="battleRoyale">{t("library:gameModesList.battleRoyale")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div>
        <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:platforms")}</h5>
        <Combobox
          items={["PC", "PlayStation 5", "Xbox Series X|S", "Nintendo Switch", "iOS", "Android"]}
          multiple={true}
        >
          <ComboboxInput placeholder={t("library:platforms")} showClear readOnly={true} />
          <ComboboxContent>
            <ComboboxList>
              {["PC", "PlayStation 5", "Xbox Series X|S", "Nintendo Switch", "iOS", "Android"].map((platform) => (
                <ComboboxItem key={platform} value={platform}>
                  {platform}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </>
  );
}
