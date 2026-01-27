import i18next from "i18next";
import i18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import i18nextHttpBackend from "i18next-http-backend";
import * as i18nextReact from "react-i18next";

const modules = import.meta.glob("./locales/**/*.json", { eager: true });

const resources: Record<string, Record<string, any>> = {};

for (const path in modules) {
	const parts = path.split("/");
	const lang = parts[2];
	const file = parts[3].replace(".json", "");

	resources[lang] ??= {};
	resources[lang][file] = modules[path];
}

console.log(resources);

export const SUPPORTED_LANGUAGES = Object.keys(resources).map((language) => ({
	id: language,
	name: `common:languages.${language.replace("-", "")}`,
}));

export const LANGUAGE_TOKEN = "@trackgeek/language";

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0].id;

i18next
	.use(i18nextHttpBackend)
	.use(i18nextBrowserLanguageDetector)
	.use(i18nextReact.initReactI18next)
	.init({
		resources,
		supportedLngs: SUPPORTED_LANGUAGES.map((lang) => lang.id),
		lng: window.localStorage.getItem(LANGUAGE_TOKEN) ?? DEFAULT_LANGUAGE,
		fallbackLng: DEFAULT_LANGUAGE,
		interpolation: {
			escapeValue: false,
		},
	});

export default i18next;
