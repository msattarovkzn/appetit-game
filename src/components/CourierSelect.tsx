import React, { useState, useEffect } from 'react';
import { CourierType } from '../types/game';

interface Props {
  onSelect: (courier: CourierType) => void;
}

function useTransparentLogo() {
  const [src, setSrc] = useState('/logo.png');
  useEffect(() => {
    const img = new Image();
    img.src = '/logo.png';
    img.onload = () => {
      try {
        const oc = document.createElement('canvas');
        oc.width = img.naturalWidth; oc.height = img.naturalHeight;
        const ctx = oc.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const id = ctx.getImageData(0, 0, oc.width, oc.height);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i+1], b = d[i+2];
          if (r < 30 && g < 30 && b < 30) d[i+3] = 0;
          else if (r < 60 && g < 60 && b < 60)
            d[i+3] = Math.round(d[i+3] * (Math.max(r,g,b) / 60));
        }
        ctx.putImageData(id, 0, 0);
        setSrc(oc.toDataURL());
      } catch {}
    };
  }, []);
  return src;
}

export function CourierSelect({ onSelect }: Props) {
  const [hovered, setHovered] = useState<CourierType | null>(null);
  const logoSrc = useTransparentLogo();

  return (
    <div className="screen fade-in" style={{
      background: 'radial-gradient(ellipse at 50% 100%, #1a0a00 0%, #0a0a1a 65%)',
      padding: '24px 20px',
      gap: 0,
    }}>
      {/* Лого */}
      <img src={logoSrc} alt="АППЕТИТ" style={{
        height: 70, objectFit: 'contain', marginBottom: 16,
        filter: 'drop-shadow(0 0 10px rgba(229,57,53,0.6))',
      }} />

      <h2 style={{ fontSize: 22, fontWeight: 900, textAlign: 'center', marginBottom: 6 }}>
        Выбери курьера
      </h2>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24, textAlign: 'center' }}>
        Кто сегодня доставляет?
      </p>

      <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 380 }}>
        {([
          // В картинке: слева — девочка, справа — мальчик
          // Контейнер 140px, img 280px (200%). Чтобы показать правую половину: сдвиг -140px = -100% контейнера
          { type: 'male'   as CourierType, label: 'Он',  sub: 'Курьер', offsetX: '-100%' },
          { type: 'female' as CourierType, label: 'Она', sub: 'Курьер', offsetX: '0%'   },
        ]).map(c => (
          <button
            key={c.type}
            onClick={() => onSelect(c.type)}
            onMouseEnter={() => setHovered(c.type)}
            onMouseLeave={() => setHovered(null)}
            style={{
              flex: 1,
              background: hovered === c.type
                ? 'rgba(229,57,53,0.18)'
                : 'rgba(255,255,255,0.05)',
              border: `2px solid ${hovered === c.type ? '#e53935' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 20,
              padding: '16px 8px 12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              transition: 'all 0.2s ease',
              boxShadow: hovered === c.type ? '0 0 24px rgba(229,57,53,0.4)' : 'none',
            }}
          >
            {/* Обрезаем нужную половину общей картинки */}
            <div style={{ width: 140, height: 140, overflow: 'hidden', borderRadius: 12, flexShrink: 0 }}>
              <img
                src="/couriers-start.png"
                alt={c.label}
                style={{
                  width: '200%',
                  height: '100%',
                  objectFit: 'cover',
                  marginLeft: c.offsetX,
                  mixBlendMode: 'screen',
                  filter: hovered === c.type
                    ? 'brightness(1.2) drop-shadow(0 0 8px rgba(229,57,53,0.7))'
                    : 'brightness(1)',
                  transition: 'filter 0.2s ease',
                }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 20, color: hovered === c.type ? '#e53935' : '#fff' }}>
                {c.label}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{c.sub}</div>
            </div>
          </button>
        ))}
      </div>

      <p style={{ marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
        Нажми на курьера чтобы начать
      </p>
    </div>
  );
}
