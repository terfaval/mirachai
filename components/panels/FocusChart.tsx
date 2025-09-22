import React from 'react';

type Item = { key: string; label: string; value: number };
type Layout = 'stack' | 'grid' | 'row';

type Props = { data: Item[]; size?: number; colorDark?: string; layout?: Layout };

const DISPLAY_LABELS: Record<string, string> = {
  immunity: 'Immunitás',
  relax: 'Relaxáció',
  focus: 'Fókusz',
  detox: 'Detox',
};

const LEVEL_LABELS = ['gyenge', 'közepes', 'erős'];
const NO_LEVEL_LABEL = 'nem jellemző';

export default function FocusChart({
  data,
  size = 240,
  colorDark = '#333',
  layout = 'stack',
}: Props) {
  const scale = size / 240;
  const padding = Math.max(12, 16 * scale);
  const containerGap = Math.max(12, 16 * scale);
  const rowGap = Math.max(8, 12 * scale);
  const innerGap = Math.max(6, rowGap * 0.75);
  const columnGap = Math.max(8, 12 * scale);
  const dotSize = Math.max(8, 14 * scale);
  const dotBorder = Math.max(1, 2 * scale);
  const focusFontSize = Math.max(14, 18 * scale);
  const levelFontSize = Math.max(10, 12 * scale);
  const cardRadius = Math.max(12, 16 * scale);
  const cardPadding = Math.max(12, 14 * scale);

  const normalized = data.map((item) => {
    const value = Math.max(0, Math.min(3, Number(item.value) || 0));
    const displayLabel = DISPLAY_LABELS[item.key] ?? item.label ?? item.key;
    const strengthLevel = Math.max(0, Math.min(3, Math.floor(value)));
    const levelLabel =
      strengthLevel > 0 ? LEVEL_LABELS[strengthLevel - 1] : NO_LEVEL_LABEL;
    return { ...item, value, displayLabel, levelLabel };
  });

  const minCardHeight = Math.max(160 * scale, size - padding * 2);

  const renderCard = (
    item: typeof normalized[number],
    fillHeight = false,
  ) => (
    <div
      key={item.key}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: innerGap,
        padding: cardPadding,
        borderRadius: cardRadius,
        backgroundColor: 'rgba(0,0,0,0.04)',
        textAlign: 'center',
        height: fillHeight ? '100%' : undefined,
        minHeight: fillHeight ? minCardHeight : undefined,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: focusFontSize,
          textTransform: 'capitalize',
        }}
      >
        {item.displayLabel}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: columnGap,
        }}
        aria-hidden
      >
        {[1, 2, 3].map((level) => {
          const active = level <= item.value;
          return (
            <span
              key={level}
              style={{
                width: dotSize,
                height: dotSize,
                borderRadius: '50%',
                border: `${dotBorder}px solid ${colorDark}`,
                backgroundColor: active ? colorDark : 'transparent',
                opacity: active ? 1 : 0.2,
                display: 'inline-block',
                transition: 'opacity 0.2s ease',
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          fontSize: levelFontSize,
          color: 'rgba(0,0,0,0.7)',
          textTransform: 'lowercase',
          letterSpacing: '0.01em',
          fontWeight: 600,
        }}
      >
        {item.levelLabel}
      </div>
    </div>
  );

  if (layout === 'row') {
    const minColumnWidth = Math.max(160, 180 * scale);
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${minColumnWidth}px, 1fr))`,
          gridAutoRows: '1fr',
          gap: containerGap,
          padding,
          boxSizing: 'border-box',
          alignItems: 'stretch',
          justifyItems: 'stretch',
        }}
      >
        {normalized.map((item) => renderCard(item, true))}
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: containerGap,
          padding,
          boxSizing: 'border-box',
        }}
      >
        {normalized.map((item) => renderCard(item))}
      </div>
    );
  }

  return (
    <div
      style={{
        height: size,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding,
        boxSizing: 'border-box',
        gap: containerGap,
      }}
    >
      {normalized.map((item) => (
        <div
          key={item.key}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: rowGap,
            flex: 1,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: focusFontSize,
              textAlign: 'center',
              textTransform: 'capitalize',
            }}
          >
            {item.displayLabel}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: innerGap,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                justifyItems: 'center',
                alignItems: 'center',
                columnGap,
              }}
              aria-hidden
            >
              {[1, 2, 3].map((level) => {
                const active = level <= item.value;
                return (
                  <span
                    key={level}
                    style={{
                      width: dotSize,
                      height: dotSize,
                      borderRadius: '50%',
                      border: `${dotBorder}px solid ${colorDark}`,
                      backgroundColor: active ? colorDark : 'transparent',
                      opacity: active ? 1 : 0.2,
                      display: 'inline-block',
                      transition: 'opacity 0.2s ease',
                    }}
                  />
                );
              })}
            </div>
            <div
              style={{
                textAlign: 'center',
                fontSize: levelFontSize,
                color: 'rgba(0,0,0,0.7)',
                textTransform: 'lowercase',
                letterSpacing: '0.01em',
                fontWeight: 600,
              }}
            >
              {item.levelLabel}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}