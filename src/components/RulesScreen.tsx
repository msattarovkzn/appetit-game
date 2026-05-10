import React from 'react';

interface Props { onPlay: () => void; }

export function RulesScreen({ onPlay }: Props) {
  return (
    <div className="screen fade-in" style={{
      background: 'linear-gradient(180deg, #111122 0%, #0d0d1e 100%)',
      padding: '24px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Title */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a3a, #222240)',
          border: '2px solid rgba(229,57,53,0.5)',
          borderRadius: '14px 14px 0 0',
          padding: '14px 20px',
          textAlign: 'center',
          boxShadow: '0 0 20px rgba(229,57,53,0.2)',
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' }}>
            🏆 Правила игры
          </h2>
        </div>

        {/* Rules body */}
        <div style={{
          background: 'rgba(15,15,35,0.95)',
          border: '2px solid rgba(255,255,255,0.08)',
          borderTop: 'none',
          borderRadius: '0 0 14px 14px',
          padding: '20px 18px',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          {[
            { icon: '💚', bg: 'rgba(67,160,71,0.15)', border: 'rgba(67,160,71,0.4)', text: 'Лови хорошие объекты и получай очки!' },
            { icon: '❌', bg: 'rgba(229,57,53,0.12)', border: 'rgba(229,57,53,0.4)', text: 'Избегай плохих — они отнимают жизни.' },
            { icon: '❓', bg: 'rgba(249,168,37,0.12)', border: 'rgba(249,168,37,0.4)', text: 'Нейтральные дают немного очков, но ничего не забирают.' },
            { icon: '🎁', bg: 'rgba(206,147,216,0.12)', border: 'rgba(206,147,216,0.4)', text: 'Чем больше очков — тем лучше награда и промокод!' },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'flex', gap: 14, alignItems: 'center',
              background: r.bg, border: `1px solid ${r.border}`,
              borderRadius: 12, padding: '11px 14px',
            }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{r.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4 }}>{r.text}</span>
            </div>
          ))}

          {/* Power-ups row */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Бонусные силы
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[['⚡','Турбо','медленнее объекты'],['🧲','Магнит','притягивает заказы'],['🛡️','Щит','блокирует удар'],['💚','Энергия','+1 жизнь']].map(([e,n,d])=>(
                <div key={n} style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>{e}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800 }}>{n}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            ♾️ Без ограничения времени · ❤️❤️❤️ 3 жизни · 👆 Управление: тап / мышь
          </div>
        </div>

        <button className="btn btn-primary" onClick={onPlay}
          style={{ width: '100%', fontSize: 20, borderRadius: 14, marginTop: 14 }}>
          🚀 НАЧАТЬ ДОСТАВКУ
        </button>
      </div>
    </div>
  );
}
