import React from 'react';
import TasteChart from '@/components/TasteChart';
import { sortTasteDescending, getFocusOrdered } from '@/utils/teaTransforms';

type Props = {
  tea: any;
  colorDark: string;
};

export default function TasteFocusPanel({ tea, colorDark }: Props) {
  const tastes = sortTasteDescending(tea);
  const focus = getFocusOrdered(tea);

  return (
    <div style={{ display:'grid', gridTemplateColumns:'60% 40%', gap:24 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', gap:16 }}>
        <div style={{ padding:16, borderRadius:12, background:'rgba(0,0,0,0.03)' }}>
          <TasteChart tea={tea} size={220} showLabels={false} />
        </div>
        <div>
          {tastes.map(t => (
            <div key={t.key} style={{ display:'flex', justifyContent:'space-between', gap:12, padding:'6px 0', borderBottom:'1px dashed rgba(0,0,0,0.08)' }}>
              <span style={{ textTransform:'capitalize' }}>{t.label}</span>
              <strong>{t.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:16, borderRadius:12, background:'rgba(0,0,0,0.03)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {focus.map(f => (
            <div key={f.key} style={{ textAlign:'center' }}>
              <div style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:4 }}>{f.value}</div>
              <div style={{ fontSize:'.9rem', opacity:.85, textTransform:'capitalize' }}>{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
