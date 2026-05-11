export interface RankReward {
  minLevel: number;
  title: string;
  subtitle: string;
  promoCode: string;
  description: string;
  minOrder: number;
  color: string;
  glowColor: string;
  panelIndex: number; // 0=green, 1=yellow, 2=red (в картинке levels-rewards.png)
}

export const RANK_REWARDS: RankReward[] = [
  {
    minLevel: 5,
    title: 'Аппетитный курьер',
    subtitle: 'Открыта пицца в подарок!',
    promoCode: 'ИГРА',
    description: 'Пицца в подарок к заказу',
    minOrder: 1399,
    color: '#69f0ae',
    glowColor: '#00e676',
    panelIndex: 0,
  },
  {
    minLevel: 13,
    title: 'VIP-курьер АППЕТИТ',
    subtitle: 'Открыта скидка 15%!',
    promoCode: 'VIP КУРЬЕР',
    description: 'Скидка 15% на заказ',
    minOrder: 1399,
    color: '#ffd740',
    glowColor: '#ffab00',
    panelIndex: 1,
  },
  {
    minLevel: 20,
    title: 'КОРОЛЬ ДОСТАВКИ АППЕТИТ 👑',
    subtitle: 'Открыт сертификат 3000₽!',
    promoCode: 'КОРОЛЬ АППЕТИТ',
    description: 'Сертификат на 3000₽',
    minOrder: 0,
    color: '#ff5252',
    glowColor: '#d50000',
    panelIndex: 2,
  },
];

// Ключевые уровни с паузой и большим попапом
export const KEY_LEVELS = [5, 13, 20];

// Получить наибольшую разблокированную награду
export function getEarnedReward(level: number): RankReward | null {
  const earned = RANK_REWARDS.filter(r => level >= r.minLevel);
  return earned.length > 0 ? earned[earned.length - 1] : null;
}

// Получить награду именно этого уровня (для попапа)
export function getKeyLevelReward(level: number): RankReward | null {
  return RANK_REWARDS.find(r => r.minLevel === level) ?? null;
}

export function isKeyLevel(level: number): boolean {
  return KEY_LEVELS.includes(level);
}

// Цвет баннера по уровню
export function getLevelBannerColor(level: number): string {
  if (level <= 5) return '#69f0ae';
  if (level <= 13) return '#ffd740';
  return '#ff5252';
}
