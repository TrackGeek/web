import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftRight, Dices, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CardItem } from "@/components/cards/card.tsx";
import { Grid } from "@/components/layouts/grid.tsx";
import { UserLayout } from "@/components/layouts/user";
import { Button } from "@/components/ui/button.tsx";
import {
	Combobox,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox.tsx";
import { Input } from "@/components/ui/input.tsx";
import { List } from "@/components/ui/list.tsx";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select.tsx";
import { getGenreLabel } from "@/lib/utils/genre-utils.ts";

export const Route = createFileRoute("/user/$username/game/")({
	head: ({ params }) => ({
		meta: [{ title: `Game List | TrackGeek` }],
	}),
	component: GameListRoute,
});

export function GameListRoute() {
	const { username } = Route.useParams();
	const { t } = useTranslation();

	const genres = [
		"Pinball",
		"Adventure",
		"Indie",
		"Arcade",
		"Visual Novel",
		"Card & Board Game",
		"MOBA",
		"Point-and-click",
		"Fighting",
		"Shooter",
		"Music",
		"Platform",
		"Puzzle",
		"Racing",
		"Real Time Strategy (RTS)",
		"Role-playing (RPG)",
		"Simulator",
		"Sport",
		"Strategy",
		"Turn-based Strategy (TBS)",
		"Tactical",
		"Hack and slash/Beat 'em up",
		"Quiz/Trivia",
	];

	const user = {
		username,
		avatarUrl: "https://github.com/Kuriel23.png",
		bio: "Apaixonada por anime, leitora ávida e avaliadora. Gosto de slice-of-life e sci-fi. Escrevo reviews detalhadas e listas de favoritos.",
		followers: 324,
		following: 48,
	};

	const medals = [
		{
			id: "m1",
			name: "Top Reviewer",
			description: "100+ reviews and highly rated",
		},
		{
			id: "m2",
			name: "Marathon Watcher",
			description: "1000+ episodes watched",
		},
		{ id: "m3", name: "Community Helper", description: "10 helpful reviews" },
		{ id: "m3", name: "Community Helper", description: "10 helpful reviews" },
	];

	const game = [
		{ id: "a1", title: "Attack on Titan", image: "/tv.svg", score: 9 },
		{ id: "a2", title: "Steins;Gate", image: "/logo.svg", score: 9.5 },
		{ id: "a3", title: "Cowboy Bebop", image: "/logo.svg", score: 9.3 },
	];

	const platforms = [
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

	return (
		<UserLayout user={user} medalsCount={medals.length} entriesCount={5}>
			<div className="flex max-sm:flex-col gap-5">
				<div className="w-full md:w-1/4 flex flex-col gap-6">
					<div className="bg-card rounded-2xl shadow-lg p-6 gap-4 flex flex-col">
						<div className="flex items-center justify-between">
							<h4 className="text-md font-semibold text-card-foreground">
								{t("user:filter")}
							</h4>
							<Button>
								<Dices className={"size-5"} />
							</Button>
						</div>
						<Input
							placeholder={`${t("user:search")}...`}
							className="bg-muted/50"
						/>
						<div className="flex items-center justify-between">
							<h5 className="text-md font-semibold text-card-foreground">
								{t("feed:customLists")}
							</h5>
							<div className={"flex gap-2"}>
								<ArrowLeftRight className={"size-5 cursor-pointer"} />
								<Plus className={"size-5 cursor-pointer"} />
							</div>
						</div>
						<div className="flex flex-col gap-1">
							{[
								t("feed:lists.planning"),
								t("feed:lists.playing"),
								t("feed:lists.replaying"),
								t("feed:lists.completed"),
								"Planning with my love",
								"2️⃣0️⃣2️⃣6️⃣",
								t("feed:lists.dropped"),
							].map((listName) => (
								<List
									key={listName}
									name={listName}
									active={listName === t("feed:lists.planning")}
								/>
							))}
						</div>
						<Select>
							<SelectTrigger className="w-full">
								<SelectValue
									placeholder={t("library:status")}
									className="w-full"
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value={"released"}>
										{t("library:statusAir.released")}
									</SelectItem>
									<SelectItem value={"unreleased"}>
										{t("library:statusAir.unreleased")}
									</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
						<Combobox items={genres} multiple={true}>
							<ComboboxInput
								placeholder={t("library:genres")}
								showClear
								readOnly={true}
							/>
							<ComboboxContent>
								<ComboboxList>
									{genres.map((genre) => (
										<ComboboxItem
											key={genre}
											value={genre}
											className={"capitalize"}
										>
											{getGenreLabel(t, genre)}
										</ComboboxItem>
									))}
								</ComboboxList>
							</ComboboxContent>
						</Combobox>
						<Input
							type={"number"}
							placeholder={`${t("library:year")}`}
							min={1958}
							max={new Date().getFullYear() + 2}
						/>
						<Select>
							<SelectTrigger className="w-full">
								<SelectValue
									placeholder={t("user:sort.placeholder")}
									className="w-full"
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value={"title"}>
										{t("user:sort.title")}
									</SelectItem>
									<SelectItem value={"lastAdded"}>
										{t("user:sort.lastAdded")}
									</SelectItem>
									<SelectItem value={"lastUpdated"}>
										{t("user:sort.lastUpdated")}
									</SelectItem>
									<SelectItem value={"rating"}>
										{t("user:sort.rating")}
									</SelectItem>
									<SelectItem value={"releaseDate"}>
										{t("user:sort.releaseDate")}
									</SelectItem>
									<SelectItem value={"popularity"}>
										{t("user:sort.popularity")}
									</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
						<Select>
							<SelectTrigger className="w-full">
								<SelectValue
									placeholder={t("library:gameModes")}
									className="w-full"
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value={"cooperative"}>
										{t("library:gameModesList.cooperative")}
									</SelectItem>
									<SelectItem value={"singleplayer"}>
										{t("library:gameModesList.singleplayer")}
									</SelectItem>{" "}
									<SelectItem value={"multiplayer"}>
										{t("library:gameModesList.multiplayer")}
									</SelectItem>{" "}
									<SelectItem value={"massivelyMultiplayerOnline"}>
										{t("library:gameModesList.massivelyMultiplayerOnline")}
									</SelectItem>{" "}
									<SelectItem value={"battleRoyale"}>
										{t("library:gameModesList.battleRoyale")}
									</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
						<Select>
							<SelectTrigger className="w-full">
								<SelectValue placeholder={t("library:platforms")} />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{platforms.map((platform) => (
										<SelectItem key={platform} value={platform}>
											{platform}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>
				<Grid
					minColSize={"128px"}
					className="flex-1 md:w-2/3 grid grid-cols-1 gap-6"
				>
					{game.map((f) => (
						<CardItem
							key={f.id}
							title={f.title}
							url={"/"}
							imageURL={f.image}
							rating={f.score ?? 0}
							year={2025}
							synopsis={f.title}
							mediaType={"game"}
						/>
					))}
				</Grid>
			</div>
		</UserLayout>
	);
}
