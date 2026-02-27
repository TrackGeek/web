import { ExternalLink, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";

interface RefreshDataProps {
	sourceURL: string;
}

export function RefreshData({ sourceURL }: RefreshDataProps) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="w-full">
					{t("library:refreshData")}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-white font-bold">
						{t("library:refreshDataModal.title")}
					</DialogTitle>
				</DialogHeader>

				<div className="overflow-y-auto max-h-[calc(90vh-12rem)]">
					<p className="mb-4">{t("library:refreshDataModal.description")}</p>
					<div className="flex justify-between items-center pt-4 border-t border-border/50">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setOpen(false);
							}}
						>
							{t("feed:cancel")}
						</Button>
						<div className="flex gap-2">
							<a href={sourceURL} target="_blank">
								<Button size="sm" className="gap-2">
									<ExternalLink className="size-4" />
									{t("library:refreshDataModal.checkSource")}
								</Button>
							</a>
							<Button
								size="sm"
								className="gap-2"
								onClick={() => {
									setOpen(false);
								}}
							>
								<RefreshCcw className="size-4" />
								{t("library:refreshDataModal.refreshInfoButton")}
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
