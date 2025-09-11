import styles from '../../styles/TasteChart.module.css';
import { Tea } from '../../utils/filter';
import { getTasteColor } from '../../utils/colorMap';

const N = (v: string | number | null | undefined) =>
  typeof v === 'number' ? v : v != null ? Number(v) : NaN;

interface Props {
  tea: Tea;
  size?: number;
  showLabels?: boolean;
  minValue?: number;
  pointRadiusBase?: number;
  connectByStrongest?: boolean; // unused, kept for compat
  strongColor?: string;         // unused, kept for compat
  colorDark?: string;
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

export default function TasteChart({
  tea,
  size = 260,
  showLabels = true,
  minValue = 0,
  pointRadiusBase = 15,
  connectByStrongest: _connectByStrongest = true,
  strongColor: _strongColor,
  colorDark = '#333',
}: Props) {
  const cx = size / 2;
  const cy = size / 2;

  // Külső sugár – hagyjunk helyet a kinti vizuáloknak
  const outerRadius = size * 0.32;

  // Belső üres kör (0-tengely) mérete az outer %-ában
  const innerRadius = outerRadius * 0.42;

  // 3 szint marad, de az innerRadius-ról indulnak
  const step = (outerRadius - innerRadius) / 3;

  const allEntries = ORDER.map((k, i) => {
    const raw = N((tea as any)[k]);
    const value = Math.max(0, Math.min(raw, 3));
    const label = k.replace('taste_', '').replace(/_/g, ' ');
    const color = getTasteColor(k);
    const angle = (i / ORDER.length) * Math.PI * 2 - Math.PI / 2;
    return { key: k, label, value: isNaN(value) ? 0 : value, color, angle };
  });

  const entries = allEntries.filter((e) => e.value >= minValue);

  const base = pointRadiusBase;
  const POINT_RADII = [base * 1.5, base, base / 2];

  // ikon-placeholder a belső kör pereme előtt
  const placeholderRadius = innerRadius * 0.7;

  // címkék a belső körön BELÜL, enyhén bejjebb
  const labelRadius = innerRadius - 18;

  return (
    <div className={styles.container}>
      <svg
        width={size}
        height={size}
        className={styles.chart}
        role="img"
        aria-label="ízprofil diagram"
        style={{ background: 'transparent' }}
      >
        {/* 0-tengely (belső kör) */}
        <circle
          cx={cx}
          cy={cy}
          r={innerRadius}
          fill="none"
          stroke="#d0d0d0"
          strokeWidth={1}
          opacity={0.8}
        />

        {allEntries.map((p) => {
          const x0 = cx + Math.cos(p.angle) * innerRadius;
          const y0 = cy + Math.sin(p.angle) * innerRadius;
          const xMax = cx + Math.cos(p.angle) * outerRadius;
          const yMax = cy + Math.sin(p.angle) * outerRadius;

          return (
            <g key={p.key}>
              {/* tengelyvonal a belső körtől kifelé */}
              <line
                x1={x0}
                y1={y0}
                x2={xMax}
                y2={yMax}
                stroke="#ccc"
                strokeWidth={1}
                opacity={0.35}
              />
              {/* 3 szint – az innerRadius-ról indulva */}
              {[1, 2, 3].map((lvl) => {
                const r = innerRadius + step * lvl;
                const x = cx + Math.cos(p.angle) * r;
                const y = cy + Math.sin(p.angle) * r;
                const active = lvl <= p.value;
                const pr = active ? POINT_RADII[lvl - 1] : 3;
                const fill = active ? p.color : '#ccc';
                const opacity = active ? 0.85 : 1;
                return (
                  <circle
                    key={lvl}
                    cx={x}
                    cy={y}
                    r={pr}
                    fill={fill}
                    fillOpacity={opacity}
                  />
                );
              })}

              {/* ikon-slot a belső körön belül */}
              <circle
                cx={cx + Math.cos(p.angle) * placeholderRadius}
                cy={cy + Math.sin(p.angle) * placeholderRadius}
                r={10}
                className={styles.placeholder}
                data-icon-slot={p.key}
              />
            </g>
          );
        })}

        {/* belső feliratok */}
        {showLabels &&
          entries.map((p) => {
            const lx = cx + Math.cos(p.angle) * labelRadius;
            const ly = cy + Math.sin(p.angle) * labelRadius;
            return (
              <text
                key={`label-${p.key}`}
                x={lx}
                y={ly}
                fontSize={12}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={colorDark}
              >
                {p.label}
              </text>
            );
          })}
      </svg>
    </div>
  );
}
