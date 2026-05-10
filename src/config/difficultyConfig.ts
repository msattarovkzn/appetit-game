export interface LevelConfig {
  level: number;
  spawnInterval: number;
  goodProb: number;
  neutralProb: number;
  dangerProb: number;
  fallSpeed: number;
}

export const SCORE_PER_LEVEL = 600;

export function getLevel(score: number): number {
  return Math.floor(score / SCORE_PER_LEVEL) + 1;
}

export function getLevelConfig(level: number): LevelConfig {
  const l = Math.min(level, 12);
  return {
    level: l,
    spawnInterval: Math.max(42, 115 - l * 6),
    goodProb:      Math.max(0.25, 0.60 - l * 0.03),
    neutralProb:   0.20,
    dangerProb:    Math.min(0.55, 0.14 + l * 0.035),
    fallSpeed:     Math.min(6.5, 2.4 + l * 0.35),
  };
}
