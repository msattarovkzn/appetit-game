import { ObjectDef } from '../types/game';

export const LOGICAL_WIDTH = 400;
export const LOGICAL_HEIGHT = 650;

export const MAX_LIVES = 3;
export const PLAYER_Y = 590;
export const PLAYER_RADIUS = 42;
export const OBJECT_RADIUS = 34;

export const GOOD_OBJECTS: ObjectDef[] = [
  { emoji: '📦', name: 'Заказ', points: 100 },
  { emoji: '💵', name: 'Чаевые', points: 150 },
  { emoji: '🚦', name: 'Зелёный свет', points: 80 },
  { emoji: '🎁', name: 'Бонус клиента', points: 120 },
  { emoji: '⚡', name: 'Турбо', points: 200, special: 'turbo' },
  { emoji: '🎯', name: 'Комбо', points: 50, special: 'combo' },
  { emoji: '💚', name: 'Энергия', points: 50, special: 'energy' },
  { emoji: '🧲', name: 'Магнит', points: 100, special: 'magnet' },
  { emoji: '🛡️', name: 'Щит', points: 100, special: 'shield' },
  { emoji: '😄', name: 'Счастливый клиент', points: 300 },
];

export const NEUTRAL_OBJECTS: ObjectDef[] = [
  { emoji: '⚠️', name: 'Конус', points: 10 },
  { emoji: '💦', name: 'Лужа', points: 10 },
  { emoji: '📱', name: 'Уточнение адреса', points: 10 },
  { emoji: '🔀', name: 'Объезд', points: 10 },
  { emoji: '⏳', name: 'Ожидание клиента', points: 10 },
  { emoji: '📣', name: 'Реклама', points: 10 },
  { emoji: '🐈', name: 'Кот на дороге', points: 10 },
  { emoji: '🐌', name: 'Медленный двор', points: 10 },
  { emoji: '🚧', name: 'Шлагбаум', points: 10 },
  { emoji: '🐦', name: 'Голубь', points: 10 },
];

export const DANGER_OBJECTS: ObjectDef[] = [
  { emoji: '🚗', name: 'Пробка', points: 0 },
  { emoji: '🛑', name: 'Красный свет', points: 0 },
  { emoji: '🐕', name: 'Собака', points: 0 },
  { emoji: '⛈️', name: 'Ливень', points: 0 },
  { emoji: '💥', name: 'Авария', points: 0 },
  { emoji: '🕳️', name: 'Яма', points: 0 },
  { emoji: '🍺', name: 'Пьяный водитель', points: 0 },
  { emoji: '📵', name: 'Не берёт трубку', points: 0 },
  { emoji: '🦹', name: 'Грабитель', points: 0 },
  { emoji: '🔥', name: 'Пожар', points: 0 },
];

export const ORDER_URL = 'https://appetitfood.ru/';
