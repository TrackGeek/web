export interface ResolvedLink {
  icon: string;
  platform: string | null;
  hostname: string;
}

const GENERIC_ICON = "lucide:link";

const KNOWN_HOSTS: Record<string, { icon: string; platform: string }> = {
  "github.com": { icon: "simple-icons:github", platform: "GitHub" },
  "gitlab.com": { icon: "simple-icons:gitlab", platform: "GitLab" },
  "x.com": { icon: "simple-icons:x", platform: "X" },
  "twitter.com": { icon: "simple-icons:x", platform: "X" },
  "instagram.com": { icon: "simple-icons:instagram", platform: "Instagram" },
  "youtube.com": { icon: "simple-icons:youtube", platform: "YouTube" },
  "youtu.be": { icon: "simple-icons:youtube", platform: "YouTube" },
  "twitch.tv": { icon: "simple-icons:twitch", platform: "Twitch" },
  "kick.com": { icon: "simple-icons:kick", platform: "Kick" },
  "tiktok.com": { icon: "simple-icons:tiktok", platform: "TikTok" },
  "discord.gg": { icon: "simple-icons:discord", platform: "Discord" },
  "discord.com": { icon: "simple-icons:discord", platform: "Discord" },
  "linkedin.com": { icon: "simple-icons:linkedin", platform: "LinkedIn" },
  "reddit.com": { icon: "simple-icons:reddit", platform: "Reddit" },
  "steamcommunity.com": { icon: "simple-icons:steam", platform: "Steam" },
  "myanimelist.net": { icon: "simple-icons:myanimelist", platform: "MyAnimeList" },
  "anilist.co": { icon: "simple-icons:anilist", platform: "AniList" },
  "letterboxd.com": { icon: "simple-icons:letterboxd", platform: "Letterboxd" },
  "open.spotify.com": { icon: "simple-icons:spotify", platform: "Spotify" },
  "spotify.com": { icon: "simple-icons:spotify", platform: "Spotify" },
  "bsky.app": { icon: "simple-icons:bluesky", platform: "Bluesky" },
  "threads.net": { icon: "simple-icons:threads", platform: "Threads" },
  "threads.com": { icon: "simple-icons:threads", platform: "Threads" },
  "t.me": { icon: "simple-icons:telegram", platform: "Telegram" },
  "telegram.me": { icon: "simple-icons:telegram", platform: "Telegram" },
  "mastodon.social": { icon: "simple-icons:mastodon", platform: "Mastodon" },
  "behance.net": { icon: "simple-icons:behance", platform: "Behance" },
  "dribbble.com": { icon: "simple-icons:dribbble", platform: "Dribbble" },
  "medium.com": { icon: "simple-icons:medium", platform: "Medium" },
  "dev.to": { icon: "simple-icons:devdotto", platform: "DEV" },
  "ko-fi.com": { icon: "simple-icons:kofi", platform: "Ko-fi" },
  "patreon.com": { icon: "simple-icons:patreon", platform: "Patreon" },
  "wikipedia.org": { icon: "simple-icons:wikipedia", platform: "Wikipedia" },
  "wikidata.org": { icon: "simple-icons:wikidata", platform: "Wikidata" },
  "crunchbase.com": { icon: "simple-icons:crunchbase", platform: "Crunchbase" },
  "facebook.com": { icon: "simple-icons:facebook", platform: "Facebook" },
};

function matchHost(hostname: string) {
  const labels = hostname.split(".");

  for (let i = 0; i < labels.length - 1; i++) {
    const known = KNOWN_HOSTS[labels.slice(i).join(".")];

    if (known) {
      return known;
    }
  }

  return null;
}

export function resolveLink(url: string): ResolvedLink {
  let hostname: string;

  try {
    hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return { icon: GENERIC_ICON, platform: null, hostname: url };
  }

  const known = matchHost(hostname);

  if (known) {
    return { ...known, hostname };
  }

  return { icon: GENERIC_ICON, platform: null, hostname };
}
