/**
 * Convert the genre name to camelCase
 * @example
 * formatGenreKey("Boys Love") => "boysLove"
 * formatGenreKey("Science Fiction") => "scienceFiction"
 */
export function formatGenreKey(genreName: string): string {
	const words = genreName.split(" ");
	const formatted = words
		.map((word, index) => {
			if (index === 0) {
				return word.charAt(0).toLowerCase() + word.slice(1);
			}
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join("");

	return formatted;
}

/**
 * Get the genre label with fallback to the original name
 * @example
 * getGenreLabel(t, "Boys Love") => "Boys Love" (if found) or "Boys Love" (fallback)
 */
export function getGenreLabel(
	t: (key: string, defaultValue?: string) => string,
	genreName: string,
): string {
	const genreKey = formatGenreKey(genreName);
	const translationKey = `library:genresList.${genreKey}`;

	return t(translationKey, genreName);
}
