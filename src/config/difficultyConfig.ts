export interface LevelConfig {
  level: number;
  spawnInterval: number;
  goodProb: number;
  neutralProb: number;
  dangerProb: number;
  fallSpeed: number;
  multiSpawn: number; // сколько объектов спавнить за раз
}

export const SCORE_PER_LEVEL = 600;

export function getLevel(score: number): number {
  return Math.floor(score / SCORE_PER_LEVEL) + 1;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

// Прогрессия сложности до уровня 20
// Уровни 1-5:  очень лёгкие (90% игроков доходят)
// Уровни 6-10: средние      (60%)
// Уровни 11-15: сложные     (30%)
// Уровни 16-18: очень сложные (10%)
// Уровень 19: почти хаос    (3%)
// Уровень 20: legendary     (0.3-0.5%)
export function getLevelConfig(level: number): LevelConfig {
  const l = Math.min(level, 20);
  let spawnInterval: number;
  let goodProb: number;
  let neutralProb: number;
  let dangerProb: number;
  let fallSpeed: number;
  let multiSpawn = 1;

  if (l <= 5) {
    const t = (l - 1) / 4;
    spawnInterval = lerp(108, 80, t);
    goodProb      = lerp(0.62, 0.55, t);
    neutralProb   = lerp(0.24, 0.22, t);
    dangerProb    = lerp(0.14, 0.23, t);
    fallSpeed     = lerp(2.2, 3.0, t);
    multiSpawn    = 1;
  } else if (l <= 10) {
    const t = (l - 5) / 5;
    spawnInterval = lerp(78, 50, t);
    goodProb      = lerp(0.53, 0.40, t);
    neutralProb   = lerp(0.21, 0.18, t);
    dangerProb    = lerp(0.26, 0.42, t);
    fallSpeed     = lerp(3.2, 5.0, t);
    multiSpawn    = 1;
  } else if (l <= 15) {
    const t = (l - 10) / 5;
    spawnInterval = lerp(48, 34, t);
    goodProb      = lerp(0.38, 0.28, t);
    neutralProb   = lerp(0.17, 0.13, t);
    dangerProb    = lerp(0.45, 0.59, t);
    fallSpeed     = lerp(5.2, 6.5, t);
    multiSpawn    = l >= 13 ? 2 : 1;
  } else if (l <= 18) {
    const t = (l - 15) / 3;
    spawnInterval = lerp(32, 24, t);
    goodProb      = lerp(0.26, 0.18, t);
    neutralProb   = lerp(0.12, 0.08, t);
    dangerProb    = lerp(0.62, 0.74, t);
    fallSpeed     = lerp(6.7, 7.8, t);
    multiSpawn    = 2;
  } else if (l === 19) {
    spawnInterval = 21;
    goodProb      = 0.15;
    neutralProb   = 0.07;
    dangerProb    = 0.78;
    fallSpeed     = 8.2;
    multiSpawn    = 3;
  } else {
    // Уровень 20 — legendary
    spawnInterval = 18;
    goodProb      = 0.13;
    neutralProb   = 0.05;
    dangerProb    = 0.82;
    fallSpeed     = 9.0;
    multiSpawn    = 3;
  }

  return { level: l, spawnInterval, goodProb, neutralProb, dangerProb, fallSpeed, multiSpawn };
}
