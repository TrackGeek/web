import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox.tsx";

/** IGDB platform names — the API resolves them to slugs before querying. */
const PLATFORMS = [
  "Nintendo Switch 2",
  "PlayStation 5",
  "Xbox Series X|S",
  "PC (Microsoft Windows)",
  "Nintendo Switch",
  "PlayStation 4",
  "Xbox One",
  "Mac",
  "Linux",
  "Android",
  "iOS",
  "visionOS",
  "Meta Quest 3",
  "Meta Quest 2",
  "PlayStation VR2",
  "PlayStation VR",
  "Oculus Rift",
  "Oculus Quest",
  "Oculus Go",
  "Gear VR",
  "Arcade",
  "New Nintendo 3DS",
  "Nintendo 3DS",
  "Nintendo DSi",
  "Nintendo DS",
  "Wii U",
  "Wii",
  "Nintendo GameCube",
  "Nintendo 64",
  "Super Nintendo Entertainment System",
  "Nintendo Entertainment System",
  "Game Boy Advance",
  "Game Boy Color",
  "Game Boy",
  "Virtual Boy",
  "PlayStation 3",
  "PlayStation 2",
  "PlayStation",
  "PlayStation Vita",
  "PlayStation Portable",
  "Xbox 360",
  "Xbox",
  "Dreamcast",
  "Sega Saturn",
  "Sega Mega Drive/Genesis",
  "Sega Master System/Mark III",
  "Sega Game Gear",
  "Sega CD",
  "Sega 32X",
  "Atari 2600",
  "Atari 5200",
  "Atari 7800",
  "Atari Jaguar",
  "Atari Lynx",
  "Atari ST/STE",
  "Amiga",
  "Commodore C64/128/MAX",
  "ZX Spectrum",
  "Amstrad CPC",
  "MSX",
  "MSX2",
  "DOS",
  "Neo Geo AES",
  "Neo Geo MVS",
  "Neo Geo Pocket",
  "Neo Geo Pocket Color",
  "TurboGrafx-16/PC Engine",
  "Turbografx-16/PC Engine CD",
  "WonderSwan",
  "WonderSwan Color",
  "Philips CD-i",
  "3DO Interactive Multiplayer",
  "ColecoVision",
  "Intellivision",
  "Vectrex",
  "Apple II",
  "Playdate",
  "Evercade",
  "Ouya",
  "Windows Phone",
  "Legacy Mobile Device",
  "Blu-ray Player",
  "DVD Player",
];

interface PlatformsProps {
  value?: string[];
  onChange?: (value: string[] | undefined) => void;
}

export function Platforms({ value = [], onChange }: PlatformsProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filteredPlatforms = useMemo(() => {
    const query = search.toLowerCase();

    return PLATFORMS.filter((platform) => platform.toLowerCase().includes(query));
  }, [search]);

  return (
    <div>
      <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:platforms")}</h5>
      <Combobox
        items={filteredPlatforms}
        multiple={true}
        value={value}
        onValueChange={(selected) => onChange?.(selected.length > 0 ? selected : undefined)}
      >
        <ComboboxInput
          placeholder={t("library:platforms")}
          showClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ComboboxContent>
          <ComboboxList>
            {filteredPlatforms.map((platform) => (
              <ComboboxItem key={platform} value={platform}>
                {platform}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
