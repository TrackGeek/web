const LEVEL_MEDAL = /^level-(\d+)$/;

export function getMedalKeys(name: string) {
  const level = LEVEL_MEDAL.exec(name)?.[1];

  return {
    nameKey: level ? "medals:level.name" : `medals:${name}.name`,
    descriptionKey: level ? "medals:level.description" : `medals:${name}.description`,
    options: level ? { level } : undefined,
  };
}
