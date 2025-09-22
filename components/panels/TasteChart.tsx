import styles from '../../styles/TasteChart.module.css';
import { Tea } from '../../utils/filter';
import { getTasteColor } from '../../utils/colorMap';
import { useState } from 'react';

const N = (v: string | number | null | undefined) =>
  typeof v === 'number' ? v : v != null ? Number(v) : NaN;

interface Props {
  tea: Tea;
  size?: number;
  showLabels?: boolean;          // most már: ikonok megjelenítése
  minValue?: number;
  pointRadiusBase?: number;      // az aktív pontok mérete
  connectByStrongest?: boolean;  // (unused)
  strongColor?: string;          // (unused)
  colorDark?: string;
  iconSizePx?: number;           // ikon méret px-ben
  rotationDeg?: number;          // diagram elforgatása fokban
}

const ORDER = [
  'taste_friss',
  'taste_gyümölcsös',
  'taste_virágos',
  'taste_savanykás',
  'taste_kesernyés',
  'taste_földes',
  'taste_umami',
  'taste_fűszeres',
  'taste_csípős',
  'taste_édeskés',
];

const STRENGTH_LABELS: Record<number, string> = {
  1: 'enyhe',
  2: 'közepes',
  3: 'erős',
};

// ékezetek → fájlnév slug (a /public/icon_*.svg-hez)
const ICON_FILE: Record<string, string> = {
  taste_friss: 'friss',
  taste_gyümölcsös: 'gyumolcsos',
  taste_virágos: 'viragos',
  taste_savanykás: 'savanyu',
  taste_kesernyés: 'keseru',
  taste_földes: 'foldes',
  taste_umami: 'umami',
  taste_fűszeres: 'fuszeres',
  taste_csípős: 'csipos',
  taste_édeskés: 'edes',
};

export default function TasteChart({
  tea,
  size = 200,
  showLabels = true,         // ikonok
  minValue = 0,
  pointRadiusBase = 15,
  connectByStrongest: _connectByStrongest = true,
  strongColor: _strongColor,
  colorDark = 'colorDark',
  iconSizePx = 48,
  rotationDeg = 0,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const step = radius / 3;

  const [tooltip, setTooltip] = useState<
    { label: string; value: number; color: string; icon: string } | null
  >(null);

  const rotationRad = (rotationDeg * Math.PI) / 180;
  
  const tasteEntries = ORDER.map((key) => {
    const raw = N((tea as any)[key]);
    const clamped = Math.max(0, Math.min(raw, 3));
    const value = Number.isNaN(clamped) ? 0 : clamped;
    const label = key.replace('taste_', '').replace(/_/g, ' ');
    const color = getTasteColor(key);
    const icon = `/tastes/icon_${ICON_FILE[key] ?? key.replace('taste_', '')}.svg`;
    return { key, label, value, color, icon };
  });

  const filteredEntries = tasteEntries.filter(
    (entry) => entry.value > 0 && entry.value >= minValue,
  );

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (b.value !== a.value) {
      return b.value - a.value;
    }
    return ORDER.indexOf(a.key) - ORDER.indexOf(b.key);
  });

  const entries = sortedEntries.map((entry, index, array) => {
    const total = array.length || 1;
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2 + rotationRad;
    return { ...entry, angle };
  });

  const labelRadius = radius + (showLabels ? iconSizePx : 0);
  const base = pointRadiusBase;
  const POINT_RADII = [base * .6, base * .9, base];

  const textColorFor = (hex?: string) => {
    if (!hex || !/^#/.test(hex)) return '#111';
    const c = hex.slice(1);
    const normalized = c.length === 3 ? c.split('').map((ch) => ch + ch).join('') : c;
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return lum > 0.55 ? '#111' : '#fff';
  };

  return (
    <div
      className={styles.container}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className={styles.chart}
        role="img"
        aria-label="ízprofil diagram"
        style={{ background: 'transparent' }}
      >
        {/* Pontok */}
        {entries.map((p) => (
          <g key={p.key}>
            {[1, 2, 3].map((lvl) => {
              const active = lvl <= p.value;
              const pr = active ? POINT_RADII[lvl - 1] : 3;
              let r = step * lvl + pr;          // távolság a mérettel arányosan
              if (lvl === 2) r -= pr * 0.3;     // második szint kicsit beljebb
              const x = cx + Math.cos(p.angle) * r;
              const y = cy + Math.sin(p.angle) * r;
              const fill = active ? p.color : '#ccc';
              const opacity = active ? 0.9 : 1;
              const isTop = active && lvl === p.value;
              return (
                <circle
                  key={lvl}
                  cx={x}
                  cy={y}
                  r={pr}
                  fill={fill}
                  fillOpacity={opacity}
                  onMouseEnter={
                    isTop
                      ? () =>
                          setTooltip({
                            label: p.label,
                            value: p.value,
                            color: p.color,
                            icon: p.icon,
                          })
                      : undefined
                  }
                  onMouseLeave={isTop ? () => setTooltip(null) : undefined}
                />
              );
            })}
          </g>
        ))}
      </svg>

      {/* Ikonok a korábbi szövegcímkék helyén – CSS maszkkal színezve */}
      {showLabels &&
        entries.map((p) => {
          const lx = cx + Math.cos(p.angle) * labelRadius;
          const ly = cy + Math.sin(p.angle) * labelRadius;
          return (
            <span
              key={`ico-${p.key}`}
              className={styles.tasteIcon}
              style={
                {
                  left: `${lx}px`,
                  top: `${ly}px`,
                  width: `${iconSizePx}px`,
                  height: `${iconSizePx}px`,
                  backgroundColor: p.color,             // szín = íz szín
                  WebkitMaskImage: `url(${p.icon})`,
                  maskImage: `url(${p.icon})`,
                } as React.CSSProperties
              }
              aria-label={p.label}
              title={p.label}
              onMouseEnter={() =>
                setTooltip({
                  label: p.label,
                  value: p.value,
                  color: p.color,
                  icon: p.icon,
                })
              }
              onMouseLeave={() => setTooltip(null)}
            />
          );
        })}

      {tooltip && (
        <div
          className={styles.tooltip}
          style={{
            backgroundColor: tooltip.color,
            color: textColorFor(tooltip.color),
          }}
          role="tooltip"
        >
          <span
            className={styles.tooltipIcon}
            style={{
              backgroundColor: textColorFor(tooltip.color),
              WebkitMaskImage: `url(${tooltip.icon})`,
              maskImage: `url(${tooltip.icon})`,
            }}
            aria-hidden
          />
          <div className={styles.tooltipContent}>
            <div className={styles.tooltipTitle}>
              {STRENGTH_LABELS[tooltip.value]}
            </div>
            <div className={styles.tooltipLabel}>{tooltip.label} íz</div>
          </div>
        </div>
      )}
    </div>
  );
}