import { addCollection } from "@iconify/react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { REWIND_ICONS } from "@/constants/rewind-icons";

addCollection(REWIND_ICONS);

export const Route = createFileRoute("/_rewind")({
  staticData: { layout: "rewind" },
  component: Outlet,
});
