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
  connectByStrongest?: boolean;
  strongColor?: string;
  colorDark?: string;
}

const ORDER = [
  'taste_friss',
  'taste_kesernyés',
  'taste_savanykás',
  'taste_édeskés',
  'taste_csípős',
  'taste_umami',
  'taste_fűszeres',
  'taste_földes',
  'taste_virágos',
  'taste_gyümölcsös',
];

export default function TasteChart({
  tea,
  size = 40,
  showLabels = true,
  minValue = 0,
  pointRadiusBase = 5,
  connectByStrongest = true,
  strongColor,
  colorDark = '#333',
}: Props) {
  const lineColor = '#ccc';

  const center = size / 2;
  const maxRadius = center - 50;

  const allEntries = ORDER.map((k, i) => {
    const raw = N((tea as any)[k]);
    const value = Math.max(0, Math.min(raw, 3));
    const label = k.replace('taste_', '').replace(/_/g, ' ');
    const color = getTasteColor(k);
    const angle = (i / ORDER.length) * Math.PI * 2 - Math.PI / 2;
    return { key: k, label, value: isNaN(value) ? 0 : value, color, angle };
  });

  const entries = allEntries.filter((e) => e.value >= minValue);

  const points = entries.map((entry) => {
    const r = (entry.value / 3) * maxRadius;
    const x = center + r * Math.cos(entry.angle);
    const y = center + r * Math.sin(entry.angle);
    return { ...entry, x, y };
  });

  const sorted = points.slice().sort((a, b) => a.angle - b.angle);
  const strongest = entries.reduce(
    (a, b) => (b.value > (a?.value ?? -1) ? b : a),
    undefined as any,
  );
  const polyStroke =
    strongColor ?? (strongest ? getTasteColor(strongest.key) : undefined) ?? colorDark;
  const polyFill =
    strongest ? getTasteColor(strongest.key, 'alternative') ?? polyStroke : polyStroke;
  const labelRadius = (4 / 3) * maxRadius;

  const polygonPath =
    sorted.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

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
        {[1, 2, 3].map((lvl) => (
          <circle
            key={`grid-${lvl}`}
            cx={center}
            cy={center}
            r={(lvl / 3) * maxRadius}
            stroke={lineColor}
            strokeWidth={1}
            fill="none"
            opacity={0.1 * lvl}
          />
        ))}
        {allEntries.map((p) => (
          <line
            key={`axis-${p.key}`}
            x1={center}
            y1={center}
            x2={center + Math.cos(p.angle) * maxRadius}
            y2={center + Math.sin(p.angle) * maxRadius}
            stroke={lineColor}
            strokeWidth={1}
            opacity={0.2}
          />
        ))}
        <circle cx={center} cy={center} r={2} fill={lineColor} />
        {connectByStrongest && points.length > 1 && (
          <path d={polygonPath} fill={polyFill} fillOpacity={0.2} stroke="none" />
        )}
        {points.map((p) => (
          <circle
            key={`pt-${p.key}`}
            cx={p.x}
            cy={p.y}
            r={pointRadiusBase + p.value * 3}
            fill={p.color}
          />
        ))}
        {connectByStrongest && points.length > 1 && (
          <path d={polygonPath} fill="none" stroke={polyStroke} strokeWidth={2} />
        )}
        {showLabels &&
          points.map((p) => {
            const lx = center + Math.cos(p.angle) * labelRadius;
            const ly = center + Math.sin(p.angle) * labelRadius;
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