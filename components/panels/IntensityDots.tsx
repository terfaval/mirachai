import React from 'react';
import { Scale1to3 } from '../../src/types/tea';

interface Props {
  intensity: Scale1to3;
  /**
   * Optional color for the active dots and text. Defaults to black which works on
   * light backgrounds, but callers (like the header panel) can override it with
   * a darker brand color.
   */
  color?: string;
  /**
   * Layout direction. Use "column" to stack the label below the dots. Defaults
   * to a horizontal row layout with the label on the right.
   */
  orientation?: 'row' | 'column';
}

const LABELS = ['enyhe', 'közepes', 'erős'];

export default function IntensityDots({
  intensity,
  color = '#000',
  orientation = 'row',
}: Props) {
  const dotStyle = (active: boolean): React.CSSProperties => ({
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: `1px solid ${active ? color : '#ccc'}`,
    backgroundColor: active ? color : 'transparent',
    display: 'inline-block',
  });

  const isColumn = orientation === 'column';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: isColumn ? 'column' : 'row',
        gap: isColumn ? 4 : 8,
      }}
      aria-label="intenzitás"
    >
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3].map((i) => (
          <span key={`intensity-dot-${i}`} style={dotStyle(i <= intensity)} />
        ))}
      </div>
      <span style={{ fontSize: '0.875rem', color }}>{LABELS[intensity - 1]}</span>
    </div>
  );
}