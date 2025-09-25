import styles from '../../styles/TasteChart.module.css';
import { Tea } from '../../utils/filter';
import { getTasteColor } from '../../utils/colorMap';
import { useState } from 'react';

const N = (v: string | number | null | undefined) =>
  typeof v === 'number' ? v : v != null ? Number(v) : NaN;

type ChartItem = {
  key: string;
  label: string;
  value: number;
  color: string;
  icon?: string;
  tooltipSuffix?: string;
};

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
  dataOverride?: ChartItem[];    // külső adatforrás (pl. fókusz)
  tooltipLabelSuffix?: string;   // tooltip második sor
  includeZero?: boolean;         // 0 értékek megtartása (fókusz)
  variant?: 'dots' | 'petals';   // megjelenési mód
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
  colorDark: _colorDark = 'colorDark',
  iconSizePx = 48,
  rotationDeg = 0,
  dataOverride,
  tooltipLabelSuffix = 'íz',
  includeZero = false,
  variant = 'dots',
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const isCompact = !showLabels;
  const radius = size * (showLabels ? 0.38 : 0.34);
  const step = radius / 3;
  const spacingFactor = isCompact ? 0.82 : 1;

  const [tooltip, setTooltip] = useState<
    { label: string; value: number; color: string; icon?: string; suffix: string } | null
  >(null);

  const rotationRad = (rotationDeg * Math.PI) / 180;
  
  const tasteEntries = dataOverride
    ? dataOverride.map((entry) => ({
        ...entry,
        label: entry.label ?? entry.key,
        tooltipSuffix: entry.tooltipSuffix ?? tooltipLabelSuffix,
      }))
    : ORDER.map((key) => {
        const raw = N((tea as any)[key]);
        const clamped = Math.max(0, Math.min(raw, 3));
        const value = Number.isNaN(clamped) ? 0 : clamped;
        const label = key.replace('taste_', '').replace(/_/g, ' ');
        const color = getTasteColor(key);
        const icon = `/tastes/icon_${ICON_FILE[key] ?? key.replace('taste_', '')}.svg`;
        return { key, label, value, color, icon, tooltipSuffix: tooltipLabelSuffix };
      });

  const filteredEntries = tasteEntries.filter((entry) => {
    const value = Number.isFinite(entry.value) ? entry.value : 0;
    if (includeZero) {
      return value >= minValue;
    }
    return value > 0 && value >= minValue;
  });

  const sortedEntries = dataOverride
    ? filteredEntries
    : [...filteredEntries].sort((a, b) => {
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
  const radialOffset = base * (isCompact ? 0.6 : 1);
  const inactiveRadius = Math.max(2, base * (isCompact ? 0.35 : 0.3));
  const POINT_RADII = isCompact
    ? [base * 0.55, base * 0.8, base * 0.95]
    : [base * 0.6, base * 0.9, base];

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

  const applyAlpha = (hex: string | undefined, alpha: number) => {
    if (!hex || !/^#/.test(hex)) return `rgba(0, 0, 0, ${alpha})`;
    const normalized =
      hex.length === 4
        ? hex
            .slice(1)
            .split('')
            .map((ch) => ch + ch)
            .join('')
        : hex.slice(1);
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const renderDots = () => (
    <>
      {entries.map((p) => (
        <g key={p.key}>
          {[1, 2, 3].map((lvl) => {
            const active = lvl <= p.value;
            const pr = active ? POINT_RADII[lvl - 1] : inactiveRadius;
            let r = step * lvl * spacingFactor + radialOffset; // távolság a mérettel arányosan
            if (lvl === 2) r -= pr * (isCompact ? 0.15 : 0.3); // második szint kicsit beljebb
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
                          suffix: p.tooltipSuffix ?? tooltipLabelSuffix,
                        })
                    : undefined
                }
                onMouseLeave={isTop ? () => setTooltip(null) : undefined}
              />
            );
          })}
        </g>
      ))}
    </>
  );

  const renderPetals = () => {
    const baseInner = radialOffset + step * (isCompact ? 0.25 : 0.35);
    const baseOuter =
      radialOffset +
      step * 3 * spacingFactor +
      pointRadiusBase * (isCompact ? 0.55 : 0.7);
    const sweepAngle = (2 * Math.PI) / 4; // ~120° körcikk

    const buildArc = (
      innerRadius: number,
      outerRadius: number,
      start: number,
      end: number,
    ) => {
      const clampRadius = (r: number) => Math.max(0, r);
      const r0 = clampRadius(innerRadius);
      const r1 = clampRadius(Math.max(innerRadius + 1, outerRadius));
      const startOuter = {
        x: cx + Math.cos(start) * r1,
        y: cy + Math.sin(start) * r1,
      };
      const endOuter = {
        x: cx + Math.cos(end) * r1,
        y: cy + Math.sin(end) * r1,
      };
      const startInner = {
        x: cx + Math.cos(end) * r0,
        y: cy + Math.sin(end) * r0,
      };
      const endInner = {
        x: cx + Math.cos(start) * r0,
        y: cy + Math.sin(start) * r0,
      };
      const largeArcFlag = end - start > Math.PI ? 1 : 0;
      return [
        `M ${startOuter.x} ${startOuter.y}`,
        `A ${r1} ${r1} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
        `L ${startInner.x} ${startInner.y}`,
        `A ${r0} ${r0} 0 ${largeArcFlag} 0 ${endInner.x} ${endInner.y}`,
        'Z',
      ].join(' ');
    };

    return entries.map((p) => {
      const ratio = Math.max(0, Math.min(1, p.value / 4));
      const startAngle = p.angle - sweepAngle / 2;
      const endAngle = p.angle + sweepAngle / 2;
      const overlayOuter = baseInner + (baseOuter - baseInner) * ratio;
      const overlayVisible = ratio > 0;

      return (
        <g key={p.key}>
          <path
            d={buildArc(baseInner, baseOuter, startAngle, endAngle)}
            fill={applyAlpha(p.color, isCompact ? 0.18 : 0.15)}
            aria-hidden
          />
          {overlayVisible && (
            <path
              d={buildArc(baseInner, overlayOuter, startAngle, endAngle)}
              fill={p.color}
              onMouseEnter={() =>
                setTooltip({
                  label: p.label,
                  value: p.value,
                  color: p.color,
                  icon: p.icon,
                  suffix: p.tooltipSuffix ?? tooltipLabelSuffix,
                })
              }
              onMouseLeave={() => setTooltip(null)}
            />
          )}
        </g>
      );
    });
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
        {variant === 'petals' ? renderPetals() : renderDots()}
      </svg>

      {/* Ikonok a korábbi szövegcímkék helyén – CSS maszkkal színezve */}
      {showLabels &&
        entries.map((p) => {
          const lx = cx + Math.cos(p.angle) * labelRadius;
          const ly = cy + Math.sin(p.angle) * labelRadius;
          return p.icon ? (
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
                  suffix: p.tooltipSuffix ?? tooltipLabelSuffix,
                })
              }
              onMouseLeave={() => setTooltip(null)}
            />
          ) : null;
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
          {tooltip.icon && (
            <span
              className={styles.tooltipIcon}
              style={{
                backgroundColor: textColorFor(tooltip.color),
                WebkitMaskImage: `url(${tooltip.icon})`,
                maskImage: `url(${tooltip.icon})`,
              }}
              aria-hidden
            />
          )}
          <div className={styles.tooltipContent}>
            <div className={styles.tooltipTitle}>
              {`${STRENGTH_LABELS[tooltip.value]} ${tooltip.label}`.trim()}
            </div>
            <div className={styles.tooltipLabel}>{tooltip.suffix}</div>
          </div>
        </div>
      )}
    </div>
  );
}