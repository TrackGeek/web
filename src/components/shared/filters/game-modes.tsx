import {useTranslation} from "react-i18next";
import {Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList} from "@/components/ui/combobox.tsx";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

const PLATFORMS = [
  "Nintendo Switch 2",
  "PlayStation 5",
  "visionOS",
  "Meta Quest 3",
  "Mac",
  "Atari 2600",
  "PlayStation VR2",
  "Nintendo Switch",
  "Evercade",
  "Android",
  "Polymega",
  "Playdate",
  "Oculus Quest",
  "PC (Microsoft Windows)",
  "Xbox Series X|S",
  "Meta Quest 2",
  "LeapTV",
  "Oculus Rift",
  "Xbox One",
  "Gear VR",
  "PlayStation VR",
  "New Nintendo 3DS",
  "Nintendo 3DS",
  "Oculus Go",
  "Windows Phone",
  "Arduboy",
  "PlayStation 4",
  "PlayStation Vita",
  "Wii",
  "Ouya",
  "Wii U",
  "PlayStation 3",
  "PlayStation Portable",
  "Leapster Explorer/LeadPad Explorer",
  "Xbox 360",
  "Nintendo DSi",
  "Nintendo DS",
  "Zeebo",
  "PlayStation 2",
  "Arcade",
  "Uzebox",
  "Legacy Mobile Device",
  "iOS",
  "Windows Mobile",
  "Blu-ray Player",
  "HyperScan",
  "Advanced Pico Beena",
  "Game Boy Advance",
  "Gizmondo",
  "Digiblast",
  "N-Gage",
  "V.Smile",
  "Nintendo 64",
  "Tapwave Zodiac",
  "e-Reader / Card-e Reader",
  "Leapster",
  "WonderSwan",
  "WonderSwan Color",
  "Xbox",
  "Nintendo GameCube",
  "Pokémon mini",
  "PlayStation",
  "Nuon",
  "Dreamcast",
  "PocketStation",
  "Game Boy Color",
  "Neo Geo Pocket Color",
  "DVD Player",
  "BlackBerry OS",
  "64DD",
  "Visual Memory Unit / Visual Memory System",
  "Game Boy",
  "Super Nintendo Entertainment System",
  "Sega Mega Drive/Genesis",
  "Neo Geo Pocket",
  "Game.com",
  "Super Famicom",
  "Satellaview",
  "Hyper Neo Geo 64",
  "Apple Pippin",
  "Palm OS",
  "R-Zone",
  "Sega Pico",
  "Casio Loopy",
  "Sega 32X",
  "Neo Geo CD",
  "Atari Jaguar CD",
  "Super A'Can",
  "Virtual Boy",
  "Sega CD 32X",
  "Sega Saturn",
  "PC-FX",
  "Terebikko / See 'n Say Video Phone",
  "3DO Interactive Multiplayer",
  "Sega Master System/Mark III",
  "FM Towns",
  "Playdia",
  "Nintendo Entertainment System",
  "Family Computer",
  "Atari Jaguar",
  "Mega Duck/Cougar Boy",
  "Amiga CD32",
  "LaserActive",
  "Sega CD",
  "Amiga",
  "Philips CD-i",
  "Sega Game Gear",
  "Watara/QuickShot Supervision",
  "Linux",
  "Atari Lynx",
  "Neo Geo MVS",
  "Neo Geo AES",
  "Commodore CDTV",
  "Turbografx-16/PC Engine CD",
  "TurboGrafx-16/PC Engine",
  "BBC Microcomputer System",
  "Gamate",
  "Amstrad GX4000",
  "Apple IIGS",
  "PC Engine SuperGrafx",
  "PC-9800 Series",
  "Sharp X1",
  "Acorn Archimedes",
  "Sharp X68000",
  "Commodore C64/128/MAX",
  "Family Computer Disk System",
  "Amstrad PCW",
  "Acorn Electron",
  "Dragon 32/64",
  "Atari ST/STE",
  "Tatung Einstein",
  "Amstrad CPC",
  "HP 3000",
  "Atari 7800",
  "Atari 5200",
  "Commodore 16",
  "Epoch Super Cassette Vision",
  "Sinclair QL",
  "Thomson MO5",
  "Sharp MZ-2200",
  "Commodore Plus/4",
  "NEC PC-6000 Series",
  "SG-1000",
  "Vectrex",
  "MSX2",
  "MSX",
  "Tomy Tutor / Pyuta / Grandstand Tutor",
  "ZX Spectrum",
  "Arcadia 2001",
  "TRS-80",
  "Intellivision",
  "FM-7",
  "Commodore VIC-20",
  "ColecoVision",
  "PC-8800 Series",
  "Sinclair ZX81",
  "Epoch Cassette Vision",
  "Texas Instruments TI-99",
  "DOS",
  "Microvision",
  "TRS-80 Color Computer",
  "Atari 8-bit",
  "Game & Watch",
  "Odyssey 2 / Videopac G7000",
  "Elektor TV Games Computer",
  "1292 Advanced Programmable Video System",
  "Exidy Sorcerer",
  "PC-50X Family",
  "Apple II",
  "VC 4000",
  "AY-3-8606",
  "Bally Astrocade",
  "AY-3-8500",
  "Fairchild Channel F",
  "AY-3-8607",
  "AY-3-8610",
  "AY-3-8710",
  "AY-3-8603",
  "AY-3-8760",
  "Commodore PET",
  "AY-3-8605",
  "Sol-20",
  "Odyssey",
  "PLATO",
  "CDC Cyber 70",
  "PDP-11",
  "HP 2100",
  "SDS Sigma 7",
  "PDP-10",
  "Call-A-Computer time-shared mainframe computer system",
  "PDP-8",
  "Super NES CD-ROM System",
  "PDP-1",
  "Donner Model 30",
  "EDSAC",
  "Ferranti Nimrod Computer",
  "SwanCrystal",
  "Handheld Electronic LCD",
  "Intellivision Amico",
  "Legacy Computer",
  "Panasonic Jungle",
  "Panasonic M2",
];

const CLEAR_VALUE = "__clear__";

interface GameModesProps {
  value?: string[];
  platforms?: string[];
  onChange?: (patch: { gameModes?: string[]; platforms?: string[] }) => void;
}

export function GameModes({ value, platforms = [], onChange }: GameModesProps) {
  const { t } = useTranslation();

  return (
    <>
      <div>
        <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:gameModes")}</h5>
        <Select
          value={value?.[0] ?? CLEAR_VALUE}
          onValueChange={(v) => onChange?.({ gameModes: v === CLEAR_VALUE ? undefined : [v] })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("library:gameModes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={CLEAR_VALUE}>{t("common:all")}</SelectItem>
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
          items={PLATFORMS}
          multiple={true}
          value={platforms}
          onValueChange={(selected) => onChange?.({ platforms: selected.length > 0 ? selected : undefined })}
        >
          <ComboboxInput placeholder={t("library:platforms")} showClear readOnly={true} />
          <ComboboxContent>
            <ComboboxList>
              {PLATFORMS.map((platform) => (
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
