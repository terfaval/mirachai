import React from 'react';
import ServeModes from '@/components/ServeModes';
import { getTeaColor } from '../../utils/colorMap';
import PrepInfo from '@/components/panels/PrepInfo';

// Ha van külön ColorCup komponensed, használd azt; itt egy lightweight helyettesítő:
function ColorCup({ hex }: { hex: string }) {
  return (
    <div style={{ width:100, height:100, borderRadius:'50%', border:'2px solid rgba(0,0,0,0.15)', overflow:'hidden', display:'grid', placeItems:'center' }}>
      <div style={{ width:'76%', height:'76%', borderRadius:'50%', background: hex }} />
    </div>
  );
}

type Props = {
  tea: any;
};

export default function PrepServePanel({ tea }: Props) {
  const tempC = Number(tea.tempC ?? tea.temperatureC ?? 0) || undefined;
  const steepMin = Number(tea.steepMin ?? tea.steepMinutes ?? 0) || undefined;
  const cupHex = getTeaColor?.(tea.color) ?? '#D9D9D9';

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 2fr', gap:24 }}>
      <div style={{ display:'grid', placeItems:'center', padding:12, borderRadius:12, background:'rgba(0,0,0,0.03)' }}>
        <ColorCup hex={cupHex} />
      </div>

      <div style={{ padding:16, borderRadius:12, background:'rgba(0,0,0,0.03)' }}>
        <PrepInfo tempC={tempC} steepMin={steepMin} />
      </div>

      <div style={{ padding:16, borderRadius:12, background:'rgba(0,0,0,0.03)' }}>
        <ServeModes tea={tea} />
      </div>
    </div>
  );
}