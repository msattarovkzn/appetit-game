import { Reward } from '../types/game';

export interface WeightedReward {
  reward: Reward;
  weight: number;
}

export const REWARDS: WeightedReward[] = [
  {
    weight: 45,
    reward: {
      type: 'common',
      emoji: '🎟️',
      name: 'Бонус 100 руб.',
      description: 'Бонус на следующий заказ',
      promoCode: 'START100',
      minOrder: 500,
    },
  },
  {
    weight: 30,
    reward: {
      type: 'common',
      emoji: '🏷️',
      name: 'Скидка 10%',
      description: 'Промокод на скидку',
      promoCode: 'ROLLRUN',
      minOrder: 700,
    },
  },
  {
    weight: 15,
    reward: {
      type: 'rare',
      emoji: '🍣',
      name: 'Роллы в подарок',
      description: '2 ролла при заказе',
      promoCode: 'ROLLRUN',
      minOrder: 1000,
    },
  },
  {
    weight: 7,
    reward: {
      type: 'epic',
      emoji: '🍕',
      name: 'Маленькая пицца',
      description: 'Пицца 25см в подарок',
      promoCode: 'PIZZABOX',
      minOrder: 1500,
    },
  },
  {
    weight: 2,
    reward: {
      type: 'epic',
      emoji: '🍕',
      name: 'Большая пицца',
      description: 'Пицца 40см в подарок',
      promoCode: 'BIGBOX',
      minOrder: 2000,
    },
  },
  {
    weight: 0.8,
    reward: {
      type: 'legendary',
      emoji: '🎉',
      name: 'Сет «Аппетит»',
      description: 'Фирменный сет в подарок',
      promoCode: 'MEGASET',
      minOrder: 2500,
    },
  },
  {
    weight: 0.2,
    reward: {
      type: 'legendary',
      emoji: '👑',
      name: 'Сертификат 3000 руб.',
      description: 'Подарочный сертификат',
      promoCode: 'APPETIT3000',
      minOrder: 0,
    },
  },
];
