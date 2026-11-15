export function roundToHalfHour(hours: number) {
  return Math.round(hours * 2) / 2;
}

export function formatHltbHours(hours: number, locale: string) {
  const rounded = roundToHalfHour(hours);
  const whole = Math.floor(rounded);
  const wholeText = new Intl.NumberFormat(locale).format(whole);
  if (rounded === whole) return wholeText;
  return whole === 0 ? "½" : `${wholeText}½`;
}
