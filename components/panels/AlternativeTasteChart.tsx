import { useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import styles from '../../styles/AlternativeTasteChart.module.css';
import { Tea } from '../../utils/filter';
import { getTasteColor } from '../../utils/colorMap';

const N = (v: string | number | null | undefined) =>
  typeof v === 'number' ? v : v != null ? Number(v) : NaN;

const clampToScale = (value: number) => {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 3) return 3;
  return value;
};

const STRENGTH_LABELS: Record<number, string> = {
  0: 'nem jellemző',
  1: 'enyhe',
  2: 'közepes',
  3: 'erős',
};

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

const PAIRS = [
  { positive: 'taste_friss', negative: 'taste_földes' },
  { positive: 'taste_gyümölcsös', negative: 'taste_umami' },
  { positive: 'taste_virágos', negative: 'taste_fűszeres' },
  { positive: 'taste_savanykás', negative: 'taste_csípős' },
  { positive: 'taste_kesernyés', negative: 'taste_édeskés' },
] as const;

const AXIS_TICKS = [-3, -2, -1, 0, 1, 2, 3];

type PairEntry = {
  positiveKey: string;
  negativeKey: string;
  positiveLabel: string;
  negativeLabel: string;
  positiveValue: number;
  negativeValue: number;
  positiveColor: string;
  negativeColor: string;
  magnitude: number;
};

type TooltipState = {
  label: string;
  value: number;
  color: string;
  x: number;
  y: number;
};

interface Props {
  tea: Tea;
  width?: number;
  rowHeight?: number;
  barHeight?: number;
  iconSize?: number;
  paddingX?: number;
  topMargin?: number;
  bottomMargin?: number;
}

export default function AlternativeTasteChart({
  tea,
  width = 420,
  rowHeight = 58,
  barHeight = 18,
  iconSize = 44,
  paddingX = 48,
  topMargin = 40,
  bottomMargin = 52,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const pairs = useMemo<PairEntry[]>(() => {
    return PAIRS.map(({ positive, negative }) => {
      const rawPositive = N((tea as any)[positive]);
      const rawNegative = N((tea as any)[negative]);
      const positiveValue = clampToScale(rawPositive);
      const negativeValue = clampToScale(rawNegative);
      const positiveLabel = positive.replace('taste_', '').replace(/_/g, ' ');
      const negativeLabel = negative.replace('taste_', '').replace(/_/g, ' ');
      const positiveColor = getTasteColor(positive);
      const negativeColor = getTasteColor(negative);
      const magnitude = Math.max(positiveValue, negativeValue);
      return {
        positiveKey: positive,
        negativeKey: negative,
        positiveLabel,
        negativeLabel,
        positiveValue,
        negativeValue,
        positiveColor,
        negativeColor,
        magnitude,
      };
    })
      .sort((a, b) => b.magnitude - a.magnitude);
  }, [tea]);

  const chartHeight = topMargin + pairs.length * rowHeight + bottomMargin;
  const centerX = width / 2;
  const rawHalfAxis = Math.min(centerX - paddingX, width - paddingX - centerX);
  const halfAxis = Math.max(rawHalfAxis, 1);
  const axisStart = centerX - halfAxis;
  const axisEnd = centerX + halfAxis;
  const unitWidth = halfAxis / 3;

  const iconOffset = iconSize / 2 + 12;

  const handleTooltipMove = (event: ReactMouseEvent<Element>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    setTooltip((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        x: event.clientX - (rect?.left ?? 0) + 8,
        y: event.clientY - (rect?.top ?? 0) + 8,
      };
    });
  };

  const showTooltip = (
    event: ReactMouseEvent<Element>,
    entry: { label: string; value: number; color: string },
  ) => {
    const rect = containerRef.current?.getBoundingClientRect();
    setTooltip({
      label: entry.label,
      value: entry.value,
      color: entry.color,
      x: event.clientX - (rect?.left ?? 0) + 8,
      y: event.clientY - (rect?.top ?? 0) + 8,
    });
  };

  const hideTooltip = () => setTooltip(null);

  const icons = pairs.flatMap((entry, index) => {
    const rowTop = topMargin + index * rowHeight;
    const rowCenter = rowTop + rowHeight / 2;
    const positiveWidth = entry.positiveValue * unitWidth;
    const negativeWidth = entry.negativeValue * unitWidth;

    let positiveX = centerX + positiveWidth + iconOffset;
    if (entry.positiveValue === 0) {
      positiveX = centerX + iconOffset;
    }
    positiveX = Math.min(width - iconSize / 2, positiveX);

    let negativeX = centerX - negativeWidth - iconOffset;
    if (entry.negativeValue === 0) {
      negativeX = centerX - iconOffset;
    }
    negativeX = Math.max(iconSize / 2, negativeX);

    const positiveIcon = {
      key: `icon-${entry.positiveKey}-${index}`,
      x: positiveX,
      y: rowCenter,
      color: entry.positiveColor,
      icon: `/icon_${ICON_FILE[entry.positiveKey] ?? entry.positiveKey.replace('taste_', '')}.svg`,
      label: entry.positiveLabel,
      value: entry.positiveValue,
    };

    const negativeIcon = {
      key: `icon-${entry.negativeKey}-${index}`,
      x: negativeX,
      y: rowCenter,
      color: entry.negativeColor,
      icon: `/icon_${ICON_FILE[entry.negativeKey] ?? entry.negativeKey.replace('taste_', '')}.svg`,
      label: entry.negativeLabel,
      value: entry.negativeValue,
    };

    return [positiveIcon, negativeIcon];
  });

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{ width, height: chartHeight }}
    >
      <svg
        width={width}
        height={chartHeight}
        className={styles.chart}
        role="img"
        aria-label="Alternatív ízprofil diagram"
      >
        <line
          x1={axisStart}
          x2={axisEnd}
          y1={chartHeight - bottomMargin}
          y2={chartHeight - bottomMargin}
          className={styles.axisLine}
        />

        {AXIS_TICKS.map((tick) => {
          const x = centerX + tick * unitWidth;
          const isZero = tick === 0;
          return (
            <g key={tick} aria-hidden="true">
              <line
                x1={x}
                x2={x}
                y1={topMargin - 12}
                y2={chartHeight - bottomMargin + barHeight / 2 + 12}
                className={`${styles.tickLine} ${isZero ? styles.zeroLine : ''}`.trim()}
              />
              <text
                x={x}
                y={chartHeight - bottomMargin + barHeight + 18}
                textAnchor="middle"
                className={styles.tickLabel}
              >
                {tick}
              </text>
            </g>
          );
        })}

        {pairs.map((entry, index) => {
          const rowTop = topMargin + index * rowHeight;
          const rowCenter = rowTop + rowHeight / 2;
          const barY = rowCenter - barHeight / 2;
          const positiveWidth = entry.positiveValue * unitWidth;
          const negativeWidth = entry.negativeValue * unitWidth;

          return (
            <g key={`${entry.positiveKey}-${entry.negativeKey}`}>
              <line
                x1={axisStart}
                x2={axisEnd}
                y1={rowCenter}
                y2={rowCenter}
                className={styles.rowGuide}
                aria-hidden="true"
              />
              {negativeWidth > 0 && (
                <rect
                  x={centerX - negativeWidth}
                  y={barY}
                  width={negativeWidth}
                  height={barHeight}
                  rx={barHeight / 2}
                  fill={entry.negativeColor}
                  fillOpacity={0.85}
                  onMouseEnter={(event) =>
                    showTooltip(event, {
                      label: entry.negativeLabel,
                      value: entry.negativeValue,
                      color: entry.negativeColor,
                    })
                  }
                  onMouseMove={handleTooltipMove}
                  onMouseLeave={hideTooltip}
                  aria-label={`${entry.negativeLabel}: ${entry.negativeValue}`}
                />
              )}
              {positiveWidth > 0 && (
                <rect
                  x={centerX}
                  y={barY}
                  width={positiveWidth}
                  height={barHeight}
                  rx={barHeight / 2}
                  fill={entry.positiveColor}
                  fillOpacity={0.85}
                  onMouseEnter={(event) =>
                    showTooltip(event, {
                      label: entry.positiveLabel,
                      value: entry.positiveValue,
                      color: entry.positiveColor,
                    })
                  }
                  onMouseMove={handleTooltipMove}
                  onMouseLeave={hideTooltip}
                  aria-label={`${entry.positiveLabel}: ${entry.positiveValue}`}
                />
              )}
            </g>
          );
        })}
      </svg>

      {icons.map((icon) => (
        <span
          key={icon.key}
          className={styles.tasteIcon}
          style={
            {
              left: `${icon.x}px`,
              top: `${icon.y}px`,
              width: `${iconSize}px`,
              height: `${iconSize}px`,
              backgroundColor: icon.color,
              WebkitMaskImage: `url(${icon.icon})`,
              maskImage: `url(${icon.icon})`,
            } as CSSProperties
          }
          aria-label={icon.label}
          title={icon.label}
          onMouseEnter={(event) =>
            showTooltip(event, {
              label: icon.label,
              value: icon.value,
              color: icon.color,
            })
          }
          onMouseMove={handleTooltipMove}
          onMouseLeave={hideTooltip}
        />
      ))}

      {tooltip && (
        <div
          className={styles.tooltip}
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px`, color: tooltip.color }}
          role="tooltip"
        >
          <div className={styles.tooltipTitle}>
            {STRENGTH_LABELS[tooltip.value] ?? 'nem jellemző'}
          </div>
          <div>{tooltip.label} íz</div>
        </div>
      )}
    </div>
  );
}