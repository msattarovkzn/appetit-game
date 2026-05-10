export type GameScreen = 'start' | 'courier-select' | 'rules' | 'game' | 'result';
export type CourierType = 'male' | 'female';
export type ObjectType = 'good' | 'neutral' | 'danger';
export type BackgroundType = 'day' | 'night' | 'rain' | 'rush';
export type SpecialType = 'turbo' | 'magnet' | 'shield' | 'energy' | 'combo' | null;

export interface ObjectDef {
  emoji: string;
  name: string;
  points: number;
  special?: SpecialType;
}

export interface FallingObject {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
  type: ObjectType;
  name: string;
  points: number;
  radius: number;
  rotation: number;
  rotSpeed: number;
  special: SpecialType;
  pulse: number;
  objIndex: number;
}

export interface Player {
  x: number;
  y: number;
  targetX: number;
  radius: number;
  shieldActive: boolean;
  shieldTime: number;
  magnetActive: boolean;
  magnetTime: number;
  turboActive: boolean;
  turboTime: number;
  comboBoost: boolean;
  comboBoostTime: number;
  hitTime: number;
  bonusTime: number;
}

export interface Popup {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  radius: number;
}

export interface GameResult {
  score: number;
  maxCombo: number;
  level: number;
  reason: 'time' | 'lives';
}

export interface Reward {
  type: 'common' | 'rare' | 'epic' | 'legendary';
  emoji: string;
  name: string;
  description: string;
  promoCode: string;
  minOrder: number;
}
