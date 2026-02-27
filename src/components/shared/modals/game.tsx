import { format } from "date-fns";
import { Calendar1, Image, Plus, Save, Star, Trash } from "lucide-react";
import { type DragEvent, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "../ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

interface GameModalProps {
	mediaData?: any;
}

export function GameModal({ mediaData: _ }: GameModalProps) {
	const [startDate, setStartDate] = useState<Date>();
	const [finishDate, setFinishDate] = useState<Date>();
	const [customLists, setCustomLists] = useState<string[]>([
		"2026",
		"Favorites",
		"Play Later",
	]);
	const { t } = useTranslation();

	const toggleCustomList = (list: string) => {
		setCustomLists((prev) =>
			prev.includes(list) ? prev.filter((l) => l !== list) : [...prev, list],
		);
	};

	const handleDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
	};

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="space-y-4">
					<div className="bg-muted/30 rounded-lg p-4 border border-border/50">
						<h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
							<Star className="size-4" />
							{t("feed:progress")}
						</h3>
						<div className="space-y-3">
							<Field>
								<FieldLabel htmlFor="status" className="text-sm font-medium">
									{t("library:status")}
								</FieldLabel>
								<Select>
									<SelectTrigger className="w-full bg-background">
										<SelectValue placeholder={t("feed:selectStatus")} />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value="planning">
												{t("feed:lists.planning")}
											</SelectItem>
											<SelectItem value="playing">
												{t("feed:lists.playing")}
											</SelectItem>
											<SelectItem value="played">
												{t("feed:lists.played")}
											</SelectItem>
											<SelectItem value="replaying">
												{t("feed:lists.replaying")}
											</SelectItem>
											<SelectItem value="dropped">
												{t("feed:lists.dropped")}
											</SelectItem>
											<SelectItem value="paused">
												{t("feed:lists.paused")}
											</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</Field>

							<Field>
								<FieldLabel
									htmlFor="completionStatus"
									className="text-sm font-medium"
								>
									{t("feed:completionStatus.label")}
								</FieldLabel>
								<Select>
									<SelectTrigger className="w-full bg-background">
										<SelectValue
											placeholder={t("feed:completionStatus.select")}
										/>
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value="mainStory">
												{t("feed:completionStatus.mainStory")}
											</SelectItem>
											<SelectItem value="mainStoryPlusExtras">
												{t("feed:completionStatus.mainStoryPlusExtras")}
											</SelectItem>
											<SelectItem value="100%">100%</SelectItem>
											<SelectItem value="endless">
												{t("feed:completionStatus.endless")}
											</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</Field>

							<Field>
								<FieldLabel htmlFor="progress" className="text-sm font-medium">
									{t("feed:progress")}
								</FieldLabel>
								<InputGroup className="bg-background">
									<InputGroupInput
										id="progress"
										type="number"
										min={0}
										max={100}
										placeholder="0"
									/>
									<InputGroupAddon align="inline-end">
										<InputGroupText>%</InputGroupText>
									</InputGroupAddon>
								</InputGroup>
							</Field>

							<Field>
								<FieldLabel htmlFor="replays" className="text-sm font-medium">
									{t("feed:totalReplays")}
								</FieldLabel>
								<Input
									id="replays"
									type="number"
									min={0}
									placeholder="0"
									className="bg-background"
								/>
							</Field>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<div className="bg-muted/30 rounded-lg p-4 border border-border/50">
						<h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
							<Calendar1 className="size-4" />
							{t("feed:timeline")}
						</h3>
						<div className="space-y-3">
							<Field>
								<FieldLabel htmlFor="startDate" className="text-sm font-medium">
									{t("feed:startDate")}
								</FieldLabel>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											data-empty={!startDate}
											className="w-full justify-start text-left font-normal bg-background"
										>
											<Calendar1 className="size-4 mr-2" />
											{startDate ? (
												format(startDate, "PPP")
											) : (
												<span className="text-muted-foreground">
													{t("feed:pickADate")}
												</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0">
										<Calendar
											mode="single"
											selected={startDate}
											onSelect={setStartDate}
										/>
									</PopoverContent>
								</Popover>
							</Field>

							<Field>
								<FieldLabel
									htmlFor="finishDate"
									className="text-sm font-medium"
								>
									{t("feed:finishDate")}
								</FieldLabel>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											data-empty={!finishDate}
											className="w-full justify-start text-left font-normal bg-background"
										>
											<Calendar1 className="size-4 mr-2" />
											{finishDate ? (
												format(finishDate, "PPP")
											) : (
												<span className="text-muted-foreground">
													{t("feed:pickADate")}
												</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0">
										<Calendar
											mode="single"
											selected={finishDate}
											onSelect={setFinishDate}
										/>
									</PopoverContent>
								</Popover>
							</Field>
						</div>
					</div>
					{/** biome-ignore lint/a11y/noStaticElementInteractions: false positive */}
					<div
						className="flex flex-col justify-center rounded-md border mt-2 border-dashed border-input px-6 py-12 text-muted-foreground"
						onDragOver={(e) => e.preventDefault()}
						onDrop={handleDrop}
					>
						<Image className="mx-auto size-12" aria-hidden={true} />
						<label
							htmlFor="screenshot"
							className="relative text-sm cursor-pointer rounded-sm pl-1 font-medium hover:underline-offset-4 text-center"
						>
							<Trans
								i18nKey={"feed:uploadScreenshot"}
								components={{
									span: <span className="text-primary hover:underline" />,
								}}
							/>
							<input
								id="screenshot"
								name="screenshot"
								type="file"
								className="sr-only"
								accept=".png, .jpeg, .jpg, .webp"
							/>
						</label>
					</div>
				</div>

				<div className="space-y-4">
					<div className="bg-muted/30 rounded-lg p-4 border border-border/50">
						<h3 className="font-semibold text-foreground mb-3">
							{t("feed:notes")}
						</h3>
						<Textarea
							placeholder={t("feed:notesPlaceholder")}
							className="min-h-[100px] bg-background resize-none"
						/>
					</div>

					<div className="bg-muted/30 rounded-lg p-4 border border-border/50">
						<div className="flex items-center justify-between mb-3">
							<h3 className="font-semibold text-foreground">
								{t("feed:customLists")}
							</h3>
							<Button variant="ghost" size="sm" className="h-6 px-2">
								<Plus className="size-3" />
							</Button>
						</div>
						<div className="space-y-2">
							{["2026", "Favorites", "Play Later"].map((list) => (
								<Field key={list} orientation="horizontal">
									<Checkbox
										id={list}
										checked={customLists.includes(list)}
										onCheckedChange={() => toggleCustomList(list)}
									/>
									<FieldLabel htmlFor={list} className="cursor-pointer text-sm">
										{list}
									</FieldLabel>
								</Field>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className="flex justify-between items-center pt-4 border-t border-border/50">
				<Button variant="destructive" size="sm" className="gap-2">
					<Trash className="size-4" />
					{t("feed:remove")}
				</Button>
				<div className="flex gap-2">
					<Button variant="outline" size="sm">
						{t("feed:cancel")}
					</Button>
					<Button size="sm" className="gap-2">
						<Save className="size-4" />
						{t("feed:save")}
					</Button>
				</div>
			</div>
		</div>
	);
}
