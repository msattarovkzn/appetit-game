import React, { useState, useEffect } from 'react';
import { GameResult, Reward } from '../types/game';
import { getReward, getRewardColor, getRewardLabel } from '../utils/rewards';
import { recordGame, recordReward, recordOrderClick, getStats } from '../utils/analytics';
import { ORDER_URL } from '../config/gameConfig';

interface Props {
  result: GameResult;
  onPlayAgain: () => void;
}

export function ResultScreen({ result, onPlayAgain }: Props) {
  const [reward, setReward] = useState<Reward | null>(null);
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const stats = getStats();

  useEffect(() => {
    recordGame(result.score, result.maxCombo);
    const r = getReward(result.score);
    setReward(r);
    recordReward();
    setTimeout(() => setRevealed(true), 500);
  }, []);

  const copyPromo = () => {
    if (!reward) return;
    navigator.clipboard.writeText(reward.promoCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleOrder = () => {
    recordOrderClick();
    window.open(ORDER_URL, '_blank');
  };

  const rColor = reward ? getRewardColor(reward.type) : '#aaa';
  const rLabel = reward ? getRewardLabel(reward.type) : '';
  const isLeg  = reward?.type === 'legendary';

  return (
    <div className="screen fade-in" style={{
      background: 'linear-gradient(180deg, #111122 0%, #0d0d1e 100%)',
      padding: '20px', overflowY: 'auto', justifyContent: 'flex-start', paddingTop: 22,
    }}>
      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, #1a1a3a, #222240)',
          border: '2px solid rgba(255,215,0,0.3)',
          borderRadius: 16, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 28 }}>🏆</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
            💔 Жизни кончились!
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>
            Ты спас ужин клиента! 🔥
          </div>
        </div>

        {/* Score row */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Очки</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: '#ffd700', lineHeight: 1.1,
            textShadow: '0 0 20px rgba(255,215,0,0.5)' }}>
            {result.score}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Уровень', value: result.level, color: '#69f0ae' },
            { label: 'Макс. комбо', value: result.maxCombo, color: '#ffd740' },
            { label: 'Лучший счёт', value: stats.bestScore, color: '#ce93d8' },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, textAlign: 'center',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 12, padding: '9px 4px',
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Reward box */}
        <div style={{
          background: 'rgba(0,0,0,0.5)',
          border: `2px solid ${rColor}`,
          borderRadius: 16, padding: '16px',
          textAlign: 'center',
          boxShadow: revealed ? `0 0 28px ${rColor}55` : 'none',
          transition: 'box-shadow 0.6s ease',
          position: 'relative', overflow: 'hidden',
        }}>
          {isLeg && revealed && (
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(255,215,0,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          )}

          <div style={{ fontSize: 11, fontWeight: 800, color: rColor, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
            Твоя награда
          </div>

          {revealed && reward ? (
            <>
              <div style={{ fontSize: 52, lineHeight: 1,
                filter: isLeg ? `drop-shadow(0 0 16px ${rColor})` : undefined }}>
                {reward.emoji}
              </div>
              <div style={{ fontWeight: 900, fontSize: 17, marginTop: 8 }}>{reward.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>{reward.description}</div>
              {reward.minOrder > 0 && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>при заказе от {reward.minOrder} ₽</div>
              )}

              {/* Promo */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Промокод</div>
                <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 2, color: rColor,
                  textShadow: `0 0 12px ${rColor}` }}>
                  {reward.promoCode}
                </div>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 44, padding: '16px 0' }}>🎁</div>
          )}
        </div>

        {/* Buttons */}
        <button className="btn" onClick={copyPromo}
          style={{ width: '100%', fontSize: 16, borderRadius: 13,
            background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)', color: '#fff' }}>
          {copied ? '✅ Скопировано!' : '📋 Скопировать промокод'}
        </button>

        <button className="btn btn-green" onClick={handleOrder}
          style={{ width: '100%', fontSize: 18, borderRadius: 13 }}>
          🍕 Сделать заказ
        </button>

        <button className="btn btn-secondary" onClick={onPlayAgain}
          style={{ width: '100%', fontSize: 16, borderRadius: 13 }}>
          🔄 Играть ещё
        </button>

        {/* Mini stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6,
          background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px',
        }}>
          {[
            { label: 'Игр', value: stats.gamesPlayed },
            { label: 'Средний счёт', value: Math.round(stats.totalScore / Math.max(stats.gamesPlayed, 1)) },
            { label: 'Наград', value: stats.rewardsGiven },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 900, fontSize: 17 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
