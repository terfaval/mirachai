import React from 'react';
import { getMandalaPath } from '@/utils/mandala';

export default function MandalaBackground({
  color = 'rgba(0,0,0,0.1)',
  category,
  className,
}: {
  color?: string;
  category: string;
  className?: string;
}) {
  const src = getMandalaPath(category);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
      <img
        src={src}
        alt=""
        className={className}
        style={
          className
            ? { opacity: 0.5, filter: `drop-shadow(0 0 0 ${color})` }
            : { width: '200%', maxWidth: 'none', opacity: 0.5, filter: `drop-shadow(0 0 0 ${color})` }
        }
      />
    </div>
  );
}