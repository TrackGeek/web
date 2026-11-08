import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { createInstance } from "i18next";
import { REWIND_THEME } from "../src/constants/rewind";
import { REWIND_AUDIO_PROFILES } from "../src/constants/rewind-audio";
import rewindEnglish from "../src/lib/i18n/locales/en-US/rewind.json";
import type { PersonalRewind } from "../src/types/rewind";
import { buildRewindScenes, rewindSceneLabel } from "../src/utils/rewind-scenes";

const types = ["movie", "tv", "anime", "game", "manga", "book"] as const;
const fixture: PersonalRewind = {
  reviewFavoriteBonus: 1,
  year: 2026,
  startsAt: "2026-01-01T00:00:00Z",
  endsAt: "2027-01-01T00:00:00Z",
  launchAt: "2026-08-04T00:00:00Z",
  generatedAt: "2026-11-08T00:00:00Z",
  isPreview: true,
  tracked: 6,
  completed: 0,
  categories: types.map((type) => ({ type, tracked: 1, completed: 0, titles: [] })),
  monthly: Array.from({ length: 12 }, (_, month) => ({ month, count: month === 8 ? 6 : 0 })),
  first: { id: "first", type: "book", title: "First book", image: null, slug: "1", recordedAt: "2026-09-01T00:00:00Z" },
};

describe("Replay chapter composition", () => {
  test("offers community chapters without a personal session", () => {
    expect(buildRewindScenes().map(({ id }) => id)).toEqual(["intro", "global", "outro"]);
  });

  test("offers community chapters when personal progress is empty", () => {
    expect(buildRewindScenes({ ...fixture, tracked: 0, categories: [], first: null }).map(({ id }) => id)).toEqual([
      "intro",
      "global",
      "outro",
    ]);
  });

  test("creates two distinct chapters for each category with a single entry", () => {
    const scenes = buildRewindScenes(fixture);
    expect(scenes).toHaveLength(18);
    expect(new Set(scenes.map(({ id }) => id)).size).toBe(18);
    for (const type of types) {
      expect(scenes.some(({ id }) => id === type)).toBe(true);
      expect(scenes.some(({ id }) => id === `${type}-shelf`)).toBe(true);
      expect(REWIND_THEME[type]).toBeDefined();
    }
    expect(scenes.at(-2)?.kind).toBe("global");
  });

  test("does not create empty category chapters", () => {
    const scenes = buildRewindScenes({
      ...fixture,
      categories: [{ type: "game", tracked: 0, completed: 0, titles: [] }],
    });
    expect(scenes.some(({ id }) => id === "game")).toBe(false);
  });

  test("does not create a first-title chapter when no saved first title exists", () => {
    expect(buildRewindScenes({ ...fixture, first: null }).some(({ kind }) => kind === "first")).toBe(false);
  });
});

describe("Replay translations", () => {
  test("resolves the dedicated namespace and every chapter name", async () => {
    const i18n = createInstance();
    await i18n.init({
      lng: "en-US",
      resources: { "en-US": { rewind: rewindEnglish } },
      interpolation: { escapeValue: false },
    });
    for (const scene of buildRewindScenes(fixture)) {
      expect(rewindSceneLabel(scene, i18n.t)).not.toContain("rewind:");
    }
    expect(i18n.t("rewind:overview.count", { count: 1 })).toBe("<value>1</value> title in your story.");
    expect(i18n.t("rewind:overview.count", { count: 2 })).toBe("<value>2</value> titles in your story.");
    expect(i18n.t("rewind:hero.title", { year: 2026 })).toBe("Replay <year>2026</year>");
  });
});

const localesDirectory = new URL("../src/lib/i18n/locales/", import.meta.url);
const languages = readdirSync(localesDirectory).sort();
const pluralKeys = ["overview.count", "category.completed", "global.count", "global.people", "share.text"];

function strings(object: Record<string, unknown>, prefix = ""): Record<string, string> {
  return Object.fromEntries(
    Object.entries(object).flatMap(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return typeof value === "string"
        ? [[path, value]]
        : Object.entries(strings(value as Record<string, unknown>, path));
    }),
  );
}

describe("Replay locale coverage", () => {
  test.each(languages)("%s has translated keys, placeholders, markup and complete plural forms", async (language) => {
    const resource = JSON.parse(readFileSync(new URL(`${language}/rewind.json`, localesDirectory), "utf8"));
    const localized = strings(resource);
    const english = strings(rewindEnglish);
    for (const key of Object.keys(english)) expect(localized[key], `${language}:${key}`).toBeString();
    for (const [key, value] of Object.entries(localized)) {
      const reference = english[key] ?? english[key.replace(/_(zero|two|few|many)$/, "_other")];
      expect(reference, `${language}:${key}`).toBeDefined();
      expect(value.match(/{{[^}]+}}/g)?.sort(), `${language}:${key} placeholders`).toEqual(
        reference.match(/{{[^}]+}}/g)?.sort(),
      );
      expect(value.match(/<\/?[\w-]+>/g)?.sort(), `${language}:${key} markup`).toEqual(
        reference.match(/<\/?[\w-]+>/g)?.sort(),
      );
    }
    for (const plural of new Intl.PluralRules(language).resolvedOptions().pluralCategories) {
      for (const key of pluralKeys) expect(localized[`${key}_${plural}`], `${language}:${key}_${plural}`).toBeString();
    }
    const i18n = createInstance();
    await i18n.init({ lng: language, fallbackLng: false, resources: { [language]: { rewind: resource } } });
    for (const count of [0, 1, 2, 3, 5, 11, 21, 101, 1_000_000, 1.5]) {
      for (const key of pluralKeys) {
        const translated = i18n.t(`rewind:${key}`, { count, date: "date", year: 2026 });
        expect(translated).not.toContain("rewind:");
        expect(translated).not.toContain("{{");
      }
    }
  });
});

describe("Replay soundtrack profiles", () => {
  test("each category has a distinct timbre or rhythm, and games use fast square-wave arpeggios", () => {
    const profiles = Object.values(REWIND_AUDIO_PROFILES);
    expect(new Set(profiles.map((profile) => JSON.stringify(profile))).size).toBe(profiles.length);
    expect(REWIND_AUDIO_PROFILES.game.lead).toBe("square");
    expect(REWIND_AUDIO_PROFILES.game.beat).toBeLessThan(REWIND_AUDIO_PROFILES.story.beat);
    expect(REWIND_AUDIO_PROFILES.book.beat).toBeGreaterThan(REWIND_AUDIO_PROFILES.story.beat);
    for (const profile of profiles) expect(profile.release).toBeGreaterThan(profile.attack);
  });
});
