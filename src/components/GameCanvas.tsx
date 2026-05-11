import React, { useRef, useEffect, useCallback } from 'react';
import { FallingObject, Player, Popup, Particle, GameResult, CourierType } from '../types/game';
import {
  LOGICAL_WIDTH, LOGICAL_HEIGHT, MAX_LIVES,
  PLAYER_Y, PLAYER_RADIUS, OBJECT_RADIUS,
  GOOD_OBJECTS, NEUTRAL_OBJECTS, DANGER_OBJECTS,
} from '../config/gameConfig';
import { getLevelConfig, getLevel, SCORE_PER_LEVEL } from '../config/difficultyConfig';
import { isKeyLevel, getKeyLevelReward, getLevelBannerColor } from '../config/rankConfig';
import { circleCollide } from '../utils/collision';

interface Props {
  onGameEnd: (result: GameResult) => void;
  courierType: CourierType;
}

let nextId = 0;

export function GameCanvas({ onGameEnd, courierType }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Asset refs ──
  const iconsImg        = useRef<HTMLImageElement | null>(null);
  const bgImg           = useRef<HTMLImageElement | null>(null);
  const courierImg      = useRef<HTMLImageElement | null>(null);
  const courierCanvas   = useRef<HTMLCanvasElement | null>(null);
  const levelsRewardImg = useRef<HTMLImageElement | null>(null);

  // ── Sound refs ──
  const engineRef = useRef<HTMLAudioElement | null>(null);
  const goodRef   = useRef<HTMLAudioElement | null>(null);
  const musicRef  = useRef<HTMLAudioElement | null>(null);
  const audioCtx  = useRef<AudioContext | null>(null);

  const stateRef = useRef({
    running:      true,
    score:        0,
    lives:        MAX_LIVES,
    combo:        0,
    maxCombo:     0,
    currentLevel: 1,
    levelBannerTime: 0,
    levelBannerColor: '#69f0ae',
    // Пауза на ключевых уровнях
    paused:        false,
    pausePhase:    null as 'achievement' | 'countdown' | null,
    pauseTimer:    0,
    countdownNum:  3,
    pauseLevel:    0,
    shownKeyLevels: [] as number[],
    lastTime:     0,
    spawnTimer:   0,
    objects:      [] as FallingObject[],
    popups:       [] as Popup[],
    particles:    [] as Particle[],
    player:       null as unknown as Player,
    shakeTime:    0,
    bgOffset:     0,
    rafId:        0,
  });

  // ── Canvas resize ──
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scale = Math.min(window.innerWidth / LOGICAL_WIDTH, window.innerHeight / LOGICAL_HEIGHT);
    canvas.width  = LOGICAL_WIDTH;
    canvas.height = LOGICAL_HEIGHT;
    canvas.style.width  = `${LOGICAL_WIDTH  * scale}px`;
    canvas.style.height = `${LOGICAL_HEIGHT * scale}px`;
  }, []);

  const getLogicalX = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return LOGICAL_WIDTH / 2;
    const rect = canvas.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * LOGICAL_WIDTH;
  }, []);

  // ── Sound helpers ──
  function playGood() {
    try { const s = goodRef.current; if (!s) return; s.currentTime = 0; s.play().catch(() => {}); } catch {}
  }

  function playHit() {
    try {
      if (!audioCtx.current) audioCtx.current = new AudioContext();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  function updateMusicSpeed(level: number) {
    if (!musicRef.current) return;
    const rate = Math.min(1.6, 1.0 + (level - 1) * 0.035);
    musicRef.current.playbackRate = rate;
  }

  // ── Spawn ──
  function spawnObject(state: typeof stateRef.current, forcedType?: FallingObject['type']) {
    const wave = getLevelConfig(state.currentLevel);
    let type: FallingObject['type'];
    if (forcedType) {
      type = forcedType;
    } else {
      const r = Math.random();
      type = r < wave.goodProb ? 'good' :
             r < wave.goodProb + wave.neutralProb ? 'neutral' : 'danger';
    }

    const pool = type === 'good' ? GOOD_OBJECTS : type === 'neutral' ? NEUTRAL_OBJECTS : DANGER_OBJECTS;
    const idx  = Math.floor(Math.random() * pool.length);
    const def  = pool[idx];
    const speedMult = state.player.turboActive ? 0.55 : 1;
    const vy   = (wave.fallSpeed + Math.random() * 1.5) * speedMult;
    const margin = 44;

    state.objects.push({
      id: nextId++,
      x: margin + Math.random() * (LOGICAL_WIDTH - margin * 2),
      y: -OBJECT_RADIUS,
      vx: (Math.random() - 0.5) * 0.5,
      vy,
      emoji: def.emoji,
      type, name: def.name, points: def.points,
      radius: OBJECT_RADIUS,
      rotation: 0, rotSpeed: (Math.random() - 0.5) * 0.03,
      special: def.special ?? null,
      pulse: Math.random() * Math.PI * 2,
      objIndex: idx,
    });
  }

  function addPopup(state: typeof stateRef.current, text: string, x: number, y: number, color: string, size = 22) {
    state.popups.push({ id: nextId++, text, x, y, vy: -1.8, alpha: 1, color, size });
  }

  function addParticles(state: typeof stateRef.current, x: number, y: number, color: string, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 3;
      state.particles.push({ id: nextId++, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, alpha: 1, color, radius: 4 + Math.random() * 4 });
    }
  }

  function handleCatch(state: typeof stateRef.current, obj: FallingObject) {
    const p = state.player;

    if (obj.type === 'danger') {
      if (p.shieldActive) {
        p.shieldActive = false; p.shieldTime = 0;
        addPopup(state, '🛡️ Щит поглотил!', obj.x, obj.y, '#4fc3f7');
        addParticles(state, obj.x, obj.y, '#4fc3f7', 10);
      } else {
        state.lives = Math.max(0, state.lives - 1);
        state.combo = 0;
        p.hitTime = 28; state.shakeTime = 10;
        playHit();
        addPopup(state, `❌ ${obj.name}`, obj.x, obj.y, '#ff5252', 17);
        addParticles(state, obj.x, obj.y, '#ff5252', 10);
        if (state.lives <= 0) endGame(state);
      }
      return;
    }

    state.combo++;
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;
    const mult   = p.comboBoost ? 2 : state.combo >= 10 ? 3 : state.combo >= 5 ? 2 : 1;
    const earned = obj.points * mult;
    state.score += earned;
    p.bonusTime  = 14;
    if (obj.type === 'good') playGood();

    const color = obj.type === 'good' ? '#69f0ae' : '#fff176';
    addPopup(state, earned > 0 ? `+${earned}` : obj.name, obj.x, obj.y, color, earned > 100 ? 28 : 22);
    addParticles(state, obj.x, obj.y, color, obj.type === 'good' ? 8 : 4);

    switch (obj.special) {
      case 'turbo':  p.turboActive = true;  p.turboTime = 300; addPopup(state, '⚡ ТУРБО!', LOGICAL_WIDTH/2, 200, '#ffe082', 30); break;
      case 'magnet': p.magnetActive = true; p.magnetTime = 360; addPopup(state, '🧲 МАГНИТ!', LOGICAL_WIDTH/2, 200, '#ce93d8', 30); break;
      case 'shield': p.shieldActive = true; p.shieldTime = 600; addPopup(state, '🛡️ ЩИТ!', LOGICAL_WIDTH/2, 200, '#4fc3f7', 30); break;
      case 'energy': if (state.lives < 5) state.lives++; addPopup(state, '💚 +1 жизнь!', LOGICAL_WIDTH/2, 200, '#69f0ae', 30); break;
      case 'combo':  p.comboBoost = true; p.comboBoostTime = 300; addPopup(state, '🎯 КОМБО x2!', LOGICAL_WIDTH/2, 200, '#ffd740', 30); break;
    }
    if (state.combo === 5)  addPopup(state, '🔥 x2 COMBO!', LOGICAL_WIDTH/2, 250, '#ffd740', 26);
    if (state.combo === 10) addPopup(state, '🔥 x3 MEGA!',  LOGICAL_WIDTH/2, 250, '#ff6d00', 30);
  }

  function endGame(state: typeof stateRef.current) {
    state.running = false;
    cancelAnimationFrame(state.rafId);
    engineRef.current?.pause();
    musicRef.current?.pause();
    onGameEnd({ score: state.score, maxCombo: state.maxCombo, level: state.currentLevel, reason: 'lives' });
  }

  function triggerKeyLevelPause(state: typeof stateRef.current, level: number) {
    state.paused      = true;
    state.pausePhase  = 'achievement';
    state.pauseTimer  = 180; // 3 секунды при 60fps
    state.pauseLevel  = level;
    state.shownKeyLevels = [...state.shownKeyLevels, level];
    updateMusicSpeed(level);
  }

  // ── Draw helpers ──

  function drawBackground(ctx: CanvasRenderingContext2D, score: number, bgOffset: number) {
    const bg = bgImg.current;
    if (bg && bg.complete) {
      const level = getLevel(score);
      const panel = level <= 4 ? 0 : level <= 8 ? 1 : 2;
      const pw = bg.naturalWidth / 3;
      ctx.drawImage(bg, panel * pw, 0, pw, bg.naturalHeight, 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    } else {
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    }
    const roadY = LOGICAL_HEIGHT * 0.65;
    const ov = ctx.createLinearGradient(0, roadY - 80, 0, LOGICAL_HEIGHT);
    ov.addColorStop(0, 'rgba(0,0,0,0)');
    ov.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = ov;
    ctx.fillRect(0, roadY - 80, LOGICAL_WIDTH, LOGICAL_HEIGHT - roadY + 80);
    ctx.fillStyle = 'rgba(229,57,53,0.8)';
    ctx.fillRect(0, roadY, LOGICAL_WIDTH, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    const dashH = 28, gap = 22, dashW = 5;
    for (let lane = 0; lane < 2; lane++) {
      const lx = LOGICAL_WIDTH * (0.33 + lane * 0.34) - dashW / 2;
      for (let d = 0; d < 6; d++) {
        const dy = roadY + 4 + ((d * (dashH + gap) + bgOffset) % (LOGICAL_HEIGHT - roadY + dashH + gap)) - dashH;
        ctx.fillRect(lx, dy, dashW, dashH);
      }
    }
  }

  function drawObject(ctx: CanvasRenderingContext2D, obj: FallingObject, t: number) {
    const icons  = iconsImg.current;
    const pulse  = Math.sin(obj.pulse + t * 3) * 0.06 + 1;
    const drawR  = obj.radius * pulse;
    const size   = drawR * 2.1;
    const glowColor = obj.type === 'good' ? 'rgba(100,255,130,0.35)' : obj.type === 'neutral' ? 'rgba(255,210,50,0.35)' : 'rgba(255,60,60,0.35)';
    ctx.save();
    ctx.translate(obj.x, obj.y);
    if (obj.rotation) ctx.rotate(obj.rotation);
    ctx.shadowColor = obj.type === 'good' ? '#69f0ae' : obj.type === 'neutral' ? '#ffd740' : '#ff5252';
    ctx.shadowBlur  = 18;
    if (icons && icons.complete) {
      const row = obj.type === 'good' ? 0 : obj.type === 'neutral' ? 1 : 2;
      const cw  = icons.naturalWidth / 10;
      const ch  = icons.naturalHeight / 3;
      ctx.beginPath();
      ctx.roundRect(-size/2, -size/2, size, size, size * 0.18);
      ctx.clip();
      ctx.drawImage(icons, obj.objIndex * cw, row * ch, cw, ch, -size/2, -size/2, size, size);
    } else {
      ctx.shadowBlur = 0;
      ctx.fillStyle  = obj.type === 'good' ? '#1a3a1a' : obj.type === 'neutral' ? '#3a3010' : '#3a1010';
      ctx.beginPath(); ctx.arc(0, 0, drawR, 0, Math.PI * 2); ctx.fill();
      ctx.font = `${drawR * 1.1}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(obj.emoji, 0, 0);
    }
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = glowColor; ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5 + 0.3 * Math.sin(obj.pulse + t * 4);
    ctx.beginPath(); ctx.arc(obj.x, obj.y, drawR + 4, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function drawPlayer(ctx: CanvasRenderingContext2D, player: Player) {
    const { x, y } = player;
    const hit = player.hitTime > 0;
    const W = 110, H = 130;
    if (player.shieldActive) {
      const t2 = Date.now() / 800;
      ctx.save(); ctx.strokeStyle = `rgba(79,195,247,${0.5 + 0.4 * Math.sin(t2 * 4)})`;
      ctx.lineWidth = 3; ctx.shadowColor = '#4fc3f7'; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(x, y, 62, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    if (player.magnetActive) {
      const t2 = Date.now() / 800;
      ctx.save(); ctx.strokeStyle = 'rgba(206,147,216,0.6)'; ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]); ctx.lineDashOffset = -t2 * 25;
      ctx.beginPath(); ctx.arc(x, y, 70, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    ctx.save();
    const grad = ctx.createRadialGradient(x, y + 30, 0, x, y + 30, 70);
    grad.addColorStop(0, hit ? 'rgba(255,50,50,0.35)' : 'rgba(229,57,53,0.25)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad; ctx.fillRect(x - 70, y - 20, 140, 100); ctx.restore();
    ctx.save();
    if (hit) ctx.globalAlpha = 0.4 + 0.6 * ((player.hitTime % 6) < 3 ? 1 : 0);
    const drawSrc = courierCanvas.current ?? (courierImg.current?.complete ? courierImg.current : null);
    if (drawSrc) ctx.drawImage(drawSrc, x - W/2, y - H/2, W, H);
    else { ctx.font = '70px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🛵', x, y); }
    ctx.restore();
  }

  function drawHUD(ctx: CanvasRenderingContext2D, state: typeof stateRef.current) {
    const { score, lives, combo, currentLevel, player } = state;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, LOGICAL_WIDTH, 60);
    ctx.fillStyle = '#e53935';
    ctx.fillRect(0, 58, LOGICAL_WIDTH, 2);

    // Счёт
    ctx.textBaseline = 'top'; ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.fillText('СЧЁТ', 12, 8);
    ctx.fillStyle = '#69f0ae'; ctx.font = 'bold 24px Nunito, sans-serif';
    ctx.fillText(score.toString(), 12, 22);

    // Уровень
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.fillText('УРОВЕНЬ', LOGICAL_WIDTH / 2, 6);
    ctx.fillStyle = '#ffd740'; ctx.shadowColor = '#ffd740'; ctx.shadowBlur = 10;
    ctx.font = 'bold 26px Nunito, sans-serif';
    ctx.fillText(currentLevel.toString(), LOGICAL_WIDTH / 2, 18);
    ctx.shadowBlur = 0;
    // Прогресс-бар
    const progress = Math.min(((score - (currentLevel - 1) * SCORE_PER_LEVEL) / SCORE_PER_LEVEL), 1);
    const bW = 70, bH = 4, bX = LOGICAL_WIDTH / 2 - bW / 2, bY = 50;
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(bX, bY, bW, bH);
    ctx.fillStyle = '#ffd740'; ctx.fillRect(bX, bY, bW * progress, bH);

    // Жизни
    ctx.textAlign = 'right'; ctx.font = '22px serif'; ctx.textBaseline = 'top';
    let hearts = '';
    for (let i = 0; i < MAX_LIVES; i++) hearts += i < lives ? '❤️' : '🖤';
    ctx.fillText(hearts, LOGICAL_WIDTH - 10, 6);

    // Комбо
    if (combo >= 3) {
      ctx.textAlign = 'right'; ctx.font = 'bold 13px Nunito, sans-serif';
      ctx.fillStyle = combo >= 10 ? '#ff6d00' : combo >= 5 ? '#ffd740' : '#fff176';
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8;
      ctx.fillText(`x${combo} COMBO 🔥`, LOGICAL_WIDTH - 10, 36);
      ctx.shadowBlur = 0;
    }

    // Активные бонусы
    const powers = [player.turboActive && '⚡', player.magnetActive && '🧲', player.shieldActive && '🛡️', player.comboBoost && '🎯'].filter(Boolean) as string[];
    if (powers.length) { ctx.textAlign = 'left'; ctx.font = '16px serif'; ctx.textBaseline = 'top'; powers.forEach((p, i) => ctx.fillText(p, 14 + i * 24, 36)); }
  }

  function drawPopups(ctx: CanvasRenderingContext2D, popups: Popup[]) {
    for (const p of popups) {
      ctx.save(); ctx.globalAlpha = p.alpha;
      ctx.font = `bold ${p.size}px Nunito, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 10;
      ctx.fillText(p.text, p.x, p.y); ctx.restore();
    }
  }

  function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    for (const p of particles) {
      ctx.save(); ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }

  function drawLevelBanner(ctx: CanvasRenderingContext2D, level: number, color: string, alpha: number) {
    ctx.save(); ctx.globalAlpha = Math.min(alpha, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 68, LOGICAL_WIDTH, 42);
    ctx.font = 'bold 19px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14;
    ctx.fillText(`⭐ УРОВЕНЬ ${level}!`, LOGICAL_WIDTH / 2, 89);
    ctx.restore();
  }

  function drawAchievementPopup(ctx: CanvasRenderingContext2D, level: number, phase: 'achievement' | 'countdown', timer: number, countdown: number) {
    const reward = getKeyLevelReward(level);
    if (!reward) return;

    // Затемнение
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.82)';
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    if (phase === 'achievement') {
      const imgW = 240, imgH = 160;
      const imgX = (LOGICAL_WIDTH - imgW) / 2;
      const imgY = LOGICAL_HEIGHT / 2 - imgH / 2 - 60;

      // Glow рамка
      ctx.shadowColor = reward.glowColor;
      ctx.shadowBlur  = 40;
      ctx.strokeStyle = reward.color;
      ctx.lineWidth   = 3;
      ctx.strokeRect(imgX - 4, imgY - 4, imgW + 8, imgH + 8);
      ctx.shadowBlur  = 0;

      // Изображение — нужная панель
      const img = levelsRewardImg.current;
      if (img && img.complete) {
        const panelW = img.naturalWidth / 3;
        ctx.drawImage(img, reward.panelIndex * panelW, 0, panelW, img.naturalHeight, imgX, imgY, imgW, imgH);
      }

      // Заголовок
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold 20px Nunito, sans-serif';
      ctx.fillStyle = reward.color; ctx.shadowColor = reward.glowColor; ctx.shadowBlur = 16;
      ctx.fillText(reward.title, LOGICAL_WIDTH / 2, imgY + imgH + 28);
      ctx.shadowBlur = 0;

      // Текст награды
      ctx.font = 'bold 14px Nunito, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(reward.subtitle, LOGICAL_WIDTH / 2, imgY + imgH + 54);

      // Промокод
      ctx.font = 'bold 22px Nunito, sans-serif';
      ctx.fillStyle = reward.color; ctx.shadowColor = reward.glowColor; ctx.shadowBlur = 12;
      ctx.fillText(reward.promoCode, LOGICAL_WIDTH / 2, imgY + imgH + 80);
      ctx.shadowBlur = 0;

    } else {
      // Countdown 3-2-1
      const alpha2 = Math.min(timer / 35, 1);
      ctx.globalAlpha = alpha2;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold 120px Nunito, sans-serif';
      ctx.fillStyle = '#ffd740'; ctx.shadowColor = '#ffd740'; ctx.shadowBlur = 40;
      ctx.fillText(countdown.toString(), LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);
      ctx.shadowBlur = 0;
      ctx.font = 'bold 18px Nunito, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.globalAlpha = 0.7;
      ctx.fillText('ПОЕХАЛИ...', LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2 + 75);
    }

    ctx.restore();
  }

  // ── Main effect ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) return;

    resize();
    window.addEventListener('resize', resize);

    const state = stateRef.current;
    state.running      = true;
    state.score        = state.combo = state.maxCombo = 0;
    state.lives        = MAX_LIVES;
    state.currentLevel = 1;
    state.levelBannerTime  = 0;
    state.levelBannerColor = '#69f0ae';
    state.paused       = false;
    state.pausePhase   = null;
    state.pauseTimer   = 0;
    state.countdownNum = 3;
    state.pauseLevel   = 0;
    state.shownKeyLevels = [];
    state.lastTime     = performance.now();
    state.spawnTimer   = state.shakeTime = 0;
    state.objects = []; state.popups = []; state.particles = [];
    state.player = {
      x: LOGICAL_WIDTH / 2, y: PLAYER_Y, targetX: LOGICAL_WIDTH / 2,
      radius: PLAYER_RADIUS,
      shieldActive: false, shieldTime: 0, magnetActive: false, magnetTime: 0,
      turboActive: false, turboTime: 0, comboBoost: false, comboBoostTime: 0,
      hitTime: 0, bonusTime: 0,
    };

    // Загрузка изображений
    const loadImg = (src: string, ref: React.MutableRefObject<HTMLImageElement | null>) => {
      const img = new Image();
      img.src = src;
      img.onload = () => { ref.current = img; };
    };
    loadImg('/icons.png', iconsImg);
    loadImg('/backgrounds.png', bgImg);
    loadImg('/levels-rewards.png', levelsRewardImg);

    // Курьер — убираем белый фон
    const cImg = new Image();
    cImg.src = courierType === 'male' ? '/courier-male.png' : '/courier-female.png';
    cImg.onload = () => {
      courierImg.current = cImg;
      try {
        const W2 = 220, H2 = 330;
        const oc = document.createElement('canvas');
        oc.width = W2; oc.height = H2;
        const octx = oc.getContext('2d')!;
        octx.drawImage(cImg, 0, 0, W2, H2);
        const id = octx.getImageData(0, 0, W2, H2);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i+1], b = d[i+2];
          if (r > 235 && g > 235 && b > 235) d[i+3] = 0;
          else if (r > 215 && g > 215 && b > 215) d[i+3] = Math.round(d[i+3] * (1 - (Math.min(r,g,b) - 215) / 20));
        }
        octx.putImageData(id, 0, 0);
        courierCanvas.current = oc;
      } catch { courierCanvas.current = null; }
    };

    // Звук мотора
    try {
      const engine = new Audio('/sounds/engine.mp3');
      engine.loop = true; engine.volume = 0.15;
      engineRef.current = engine;
      engine.play().catch(() => {});
    } catch {}

    // Звук хорошего объекта
    try {
      const good = new Audio('/sounds/good.mp3');
      good.volume = 0.65;
      goodRef.current = good;
    } catch {}

    // Фоновая музыка
    try {
      const music = new Audio('/sounds/music.wav');
      music.loop = true; music.volume = 0.35;
      musicRef.current = music;
      music.play().catch(() => {});
    } catch {}

    // ── Game loop ──
    function loop(now: number) {
      if (!state.running) return;
      const dt = Math.min((now - state.lastTime) / 16.67, 3);
      state.lastTime = now;

      // ── Пауза (ключевой уровень) ──
      if (state.paused && state.pausePhase) {
        state.pauseTimer -= dt;

        if (state.pausePhase === 'achievement' && state.pauseTimer <= 0) {
          // Переход к countdown
          state.pausePhase  = 'countdown';
          state.countdownNum = 3;
          state.pauseTimer  = 42;
        } else if (state.pausePhase === 'countdown' && state.pauseTimer <= 0) {
          state.countdownNum--;
          if (state.countdownNum <= 0) {
            state.paused     = false;
            state.pausePhase = null;
          } else {
            state.pauseTimer = 36;
          }
        }

        // Только рендеринг во время паузы
        ctx.save();
        ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
        drawBackground(ctx, state.score, state.bgOffset);
        for (const obj of state.objects) drawObject(ctx, obj, now / 1000);
        drawPlayer(ctx, state.player);
        drawHUD(ctx, state);
        if (state.pausePhase) drawAchievementPopup(ctx, state.pauseLevel, state.pausePhase, state.pauseTimer, state.countdownNum);
        ctx.restore();
        state.rafId = requestAnimationFrame(loop);
        return;
      }

      // ── Определение уровня ──
      const newLevel = getLevel(state.score);
      if (newLevel > state.currentLevel) {
        state.currentLevel     = newLevel;
        state.levelBannerColor = getLevelBannerColor(newLevel);
        state.levelBannerTime  = 120;
        updateMusicSpeed(newLevel);

        // Ключевой уровень → большой попап с паузой
        if (isKeyLevel(newLevel) && !state.shownKeyLevels.includes(newLevel)) {
          triggerKeyLevelPause(state, newLevel);
        }
      }
      if (state.levelBannerTime > 0) state.levelBannerTime -= dt;

      // ── Спавн объектов ──
      const wave = getLevelConfig(state.currentLevel);
      state.spawnTimer -= dt;
      if (state.spawnTimer <= 0) {
        spawnObject(state);
        // Доп. danger объекты на высоких уровнях
        for (let i = 1; i < wave.multiSpawn; i++) {
          spawnObject(state, 'danger');
        }
        state.spawnTimer = wave.spawnInterval + Math.random() * 20;
      }

      // ── Обновление объектов ──
      const p = state.player;
      state.objects = state.objects.filter(obj => {
        obj.y += obj.vy * dt; obj.x += obj.vx * dt;
        obj.rotation += obj.rotSpeed * dt; obj.pulse += 0.05 * dt;
        if (p.magnetActive && obj.type !== 'danger') {
          const dx = p.x - obj.x, dy = p.y - obj.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 230 && dist > 1) { obj.vx += (dx/dist) * 0.18 * dt; obj.vy += (dy/dist) * 0.18 * dt; }
        }
        if (obj.y > LOGICAL_HEIGHT + 60) { if (obj.type === 'good') state.combo = 0; return false; }
        if (circleCollide(p.x, p.y, p.radius, obj.x, obj.y, obj.radius)) { handleCatch(state, obj); return false; }
        return true;
      });

      // Движение игрока
      p.x += (p.targetX - p.x) * 0.18 * dt;
      p.x = Math.max(p.radius, Math.min(LOGICAL_WIDTH - p.radius, p.x));

      // Таймеры бонусов
      if (p.shieldTime > 0)     { p.shieldTime     -= dt; if (p.shieldTime     <= 0) p.shieldActive = false; }
      if (p.magnetTime > 0)     { p.magnetTime     -= dt; if (p.magnetTime     <= 0) p.magnetActive = false; }
      if (p.turboTime > 0)      { p.turboTime      -= dt; if (p.turboTime      <= 0) p.turboActive  = false; }
      if (p.comboBoostTime > 0) { p.comboBoostTime -= dt; if (p.comboBoostTime <= 0) p.comboBoost   = false; }
      if (p.hitTime   > 0) p.hitTime   -= dt;
      if (p.bonusTime > 0) p.bonusTime -= dt;

      // Частицы и попапы
      state.particles = state.particles.filter(pt => { pt.x += pt.vx*dt; pt.y += pt.vy*dt; pt.vy += 0.09*dt; pt.alpha -= 0.025*dt; return pt.alpha > 0; });
      state.popups    = state.popups.filter(pop => { pop.y += pop.vy*dt; pop.alpha -= 0.018*dt; return pop.alpha > 0; });
      state.bgOffset  = (state.bgOffset + 2 * dt) % 200;

      // Тряска
      let sx = 0, sy = 0;
      if (state.shakeTime > 0) { state.shakeTime -= dt; sx = (Math.random()-0.5)*state.shakeTime*1.2; sy = (Math.random()-0.5)*state.shakeTime*1.2; }

      // ── Рендер ──
      ctx.save();
      ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      if (sx || sy) ctx.translate(sx, sy);
      const t = now / 1000;
      drawBackground(ctx, state.score, state.bgOffset);
      drawParticles(ctx, state.particles);
      for (const obj of state.objects) drawObject(ctx, obj, t);
      drawPlayer(ctx, state.player);
      drawPopups(ctx, state.popups);
      drawHUD(ctx, state);
      if (state.levelBannerTime > 0) drawLevelBanner(ctx, state.currentLevel, state.levelBannerColor, state.levelBannerTime / 40);
      ctx.restore();

      state.rafId = requestAnimationFrame(loop);
    }

    state.rafId = requestAnimationFrame(loop);

    // Управление
    const onMouseMove  = (e: MouseEvent) => { if (!stateRef.current.paused) stateRef.current.player.targetX = getLogicalX(e.clientX); };
    const onTouchMove  = (e: TouchEvent) => { e.preventDefault(); if (!stateRef.current.paused) stateRef.current.player.targetX = getLogicalX(e.touches[0].clientX); };
    const onTouchStart = (e: TouchEvent) => { e.preventDefault(); if (!stateRef.current.paused) stateRef.current.player.targetX = getLogicalX(e.touches[0].clientX); };

    canvas.addEventListener('mousemove',  onMouseMove);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });

    return () => {
      state.running = false;
      cancelAnimationFrame(state.rafId);
      engineRef.current?.pause();
      musicRef.current?.pause();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove',  onMouseMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove',  onTouchMove);
    };
  }, []);

  return (
    <div className="game-wrapper">
      <canvas ref={canvasRef} />
    </div>
  );
}
