import React, { useEffect, useRef, useState } from 'react';

interface Props {
  onStart: () => void;
  bestScore: number;
}

export function StartScreen({ onStart, bestScore }: Props) {
  const [logoSrc, setLogoSrc] = useState('/logo.png');

  useEffect(() => {
    const img = new Image();
    img.src = '/logo.png';
    img.onload = () => {
      try {
        const oc = document.createElement('canvas');
        oc.width = img.naturalWidth;
        oc.height = img.naturalHeight;
        const ctx = oc.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const id = ctx.getImageData(0, 0, oc.width, oc.height);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          // Убираем чёрные и тёмно-серые пиксели
          if (r < 30 && g < 30 && b < 30) {
            d[i + 3] = 0;
          } else if (r < 60 && g < 60 && b < 60) {
            const darkness = Math.max(r, g, b);
            d[i + 3] = Math.round(d[i + 3] * (darkness / 60));
          }
        }
        ctx.putImageData(id, 0, 0);
        setLogoSrc(oc.toDataURL());
      } catch {
        // Если не удалось — оставляем оригинал
      }
    };
  }, []);

  return (
    <div className="screen fade-in" style={{
      background: 'radial-gradient(ellipse at 50% 110%, #1a0500 0%, #0a0a1a 60%)',
    }}>
      {/* Силуэт города */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <svg width="100%" height="100%" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="700" fill="url(#bg)" />
          <defs>
            <radialGradient id="bg" cx="50%" cy="90%">
              <stop offset="0%" stopColor="#1a0500" />
              <stop offset="100%" stopColor="#08081a" />
            </radialGradient>
          </defs>
          {[[0,200,58],[62,165,52],[118,210,46],[168,145,72],[244,180,54],[302,158,56],[360,195,40]].map(([x,h,w],i) => (
            <rect key={i} x={x} y={580-h} width={w} height={h+20} fill="#0c0c22" />
          ))}
          {Array.from({length:25},(_,i)=>(
            <circle key={i} cx={(i*137+30)%400} cy={(i*61+5)%280} r={1+(i%2)*0.5} fill="white" opacity={0.4+(i%5)*0.1} />
          ))}
        </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: '0 24px' }}>

        {/* Лого без чёрного фона */}
        <img src={logoSrc} alt="АППЕТИТ" style={{
          height: 130, objectFit: 'contain',
          filter: 'drop-shadow(0 0 18px rgba(229,57,53,0.7))',
        }} className="pulse" />

        {/* Заголовок */}
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.25, textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
            Помоги курьеру<br />довезти заказ 🍣
          </h1>
          <p style={{ marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, maxWidth: 300 }}>
            Лови заказы, бонусы и чаевые.<br />Избегай пробок и красных светофоров.
          </p>
        </div>

        {/* Рекорд */}
        {bestScore > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '7px 20px', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
            🏆 Рекорд: <strong style={{ color: '#ffd700' }}>{bestScore}</strong>
          </div>
        )}

        {/* Старт */}
        <button className="btn btn-primary pulse" onClick={onStart}
          style={{ width: 270, fontSize: 20, borderRadius: 16, marginTop: 4 }}>
          🚀 НАЧАТЬ ДОСТАВКУ
        </button>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>АППЕТИТ — доставим вкусную еду</p>
      </div>
    </div>
  );
}
