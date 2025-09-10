import React from 'react';
import TasteChart from '@/components/panels/TasteChart';
import FocusChart from '@/components/FocusChart';
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
          <TasteChart tea={tea} size={220} minValue={1} pointRadiusBase={6} connectByStrongest colorDark={colorDark} />
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
        <FocusChart data={focus} colorDark={colorDark} size={220} />
      </div>
    </div>
  );
}