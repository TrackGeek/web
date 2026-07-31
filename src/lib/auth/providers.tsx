import { Icon } from "@iconify/react";
import type { JSX } from "react";

// Shared by the login modal and the settings connections card, so both stay in sync.
export const authProviders: { id: string; icon: JSX.Element }[] = [
  { id: "discord", icon: <Icon icon={"simple-icons:discord"} className="size-6" /> },
  { id: "github", icon: <Icon icon={"simple-icons:github"} className="size-5" /> },
  { id: "google", icon: <Icon className="size-6" icon="fa7-brands:google" /> },
  { id: "kick", icon: <Icon icon={"simple-icons:kick"} className="size-5" /> },
  { id: "twitch", icon: <Icon icon={"simple-icons:twitch"} className="size-5" /> },
  { id: "twitter", icon: <Icon icon={"simple-icons:x"} className="size-5" /> },
  { id: "notion", icon: <Icon icon={"simple-icons:notion"} className="size-5" /> },
  { id: "microsoft", icon: <Icon className="size-6" icon="fluent:store-microsoft-20-filled" /> },
  { id: "spotify", icon: <Icon icon={"simple-icons:spotify"} className="size-5" /> },
  { id: "slack", icon: <Icon className="size-5" icon="mdi:slack" /> },
  // { id: "tiktok", icon: <SiTiktok className="size-5" /> },
  // { id: "roblox", icon: <SiRoblox className="size-5" /> },
  // { id: "apple", icon: <SiApple className="size-5" /> },
  // { id: "facebook", icon: <SiFacebook className="size-5" /> },
  // { id: "reddit", icon: <SiReddit className="size-5" /> },
  // { id: "linkedin", icon: <Linkedin className="size-5" /> },
].sort((a, b) => a.id.localeCompare(b.id));
