import { Reward } from '../types/game';
import { REWARDS } from '../config/rewardConfig';

export function getReward(score: number): Reward {
  const totalWeight = REWARDS.reduce((sum, r) => sum + r.weight, 0);
  let rand = Math.random() * totalWeight;

  for (const item of REWARDS) {
    rand -= item.weight;
    if (rand <= 0) return item.reward;
  }
  return REWARDS[0].reward;
}

export function getRewardColor(type: Reward['type']): string {
  switch (type) {
    case 'common': return '#aaaaaa';
    case 'rare': return '#4fc3f7';
    case 'epic': return '#ce93d8';
    case 'legendary': return '#ffd700';
  }
}

export function getRewardLabel(type: Reward['type']): string {
  switch (type) {
    case 'common': return 'Обычная';
    case 'rare': return 'Редкая';
    case 'epic': return 'Эпическая';
    case 'legendary': return '✨ ЛЕГЕНДАРНАЯ';
  }
}
