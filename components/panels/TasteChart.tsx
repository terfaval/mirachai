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
  pointRadiusBase?: number; // controls size of active points
  connectByStrongest?: boolean; // unused, kept for compat
  strongColor?: string; // unused, kept for compat
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
  size = 1,
  showLabels = true,
  minValue = 0,
  pointRadiusBase = 15,
  connectByStrongest: _connectByStrongest = true,
  strongColor: _strongColor,
  colorDark = '#333',
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.3; // leave room for labels
  const step = radius / 3;

  const allEntries = ORDER.map((k, i) => {
    const raw = N((tea as any)[k]);
    const value = Math.max(0, Math.min(raw, 3));
    const label = k.replace('taste_', '').replace(/_/g, ' ');
    const color = getTasteColor(k);
    const angle = (i / ORDER.length) * Math.PI * 2 - Math.PI / 2;
    return { key: k, label, value: isNaN(value) ? 0 : value, color, angle };
  });

  const entries = allEntries.filter((e) => e.value >= minValue);
  const labelRadius = radius + 30;
  const base = pointRadiusBase;
  const POINT_RADII = [base * 1.5, base, base / 2];

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
        {allEntries.map((p) => (
          <g key={p.key}>
            {[1, 2, 3].map((lvl) => {
              const r = step * lvl;
              const x = cx + Math.cos(p.angle) * r;
              const y = cy + Math.sin(p.angle) * r;
              const active = lvl <= p.value;
              const pr = active ? POINT_RADII[lvl - 1] : 1.1;
              const opacity = active ? 0.85 : 0.15;
              return (
                <circle
                  key={lvl}
                  cx={x}
                  cy={y}
                  r={pr}
                  fill={p.color}
                  fillOpacity={opacity}
                />
              );
            })}
          </g>
        ))}
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
                alignmentBaseline="middle"
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