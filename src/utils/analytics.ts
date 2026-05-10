const KEY = 'appetit_game_stats';

export interface Stats {
  gamesPlayed: number;
  bestScore: number;
  totalScore: number;
  maxCombo: number;
  rewardsGiven: number;
  orderClicks: number;
}

function load(): Stats {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { gamesPlayed: 0, bestScore: 0, totalScore: 0, maxCombo: 0, rewardsGiven: 0, orderClicks: 0 };
}

function save(stats: Stats) {
  try { localStorage.setItem(KEY, JSON.stringify(stats)); } catch {}
}

export function recordGame(score: number, maxCombo: number) {
  const s = load();
  s.gamesPlayed++;
  s.totalScore += score;
  if (score > s.bestScore) s.bestScore = score;
  if (maxCombo > s.maxCombo) s.maxCombo = maxCombo;
  save(s);
}

export function recordReward() {
  const s = load();
  s.rewardsGiven++;
  save(s);
}

export function recordOrderClick() {
  const s = load();
  s.orderClicks++;
  save(s);
}

export function getStats(): Stats {
  return load();
}

export function getAvgScore(): number {
  const s = load();
  return s.gamesPlayed > 0 ? Math.round(s.totalScore / s.gamesPlayed) : 0;
}
