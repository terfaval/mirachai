import React from 'react';
import ServeModes from '@/components/ServeModes';
import { normalizeServeFlags, resolveColorForCup } from '@/utils/teaTransforms';

// Ha van külön ColorCup komponensed, használd azt; itt egy lightweight helyettesítő:
function ColorCup({ hex }: { hex: string }) {
  return (
    <div style={{ width:100, height:100, borderRadius:'50%', border:'2px solid rgba(0,0,0,0.15)', overflow:'hidden', display:'grid', placeItems:'center' }}>
      <div style={{ width:'76%', height:'76%', borderRadius:'50%', background: hex }} />
    </div>
  );
}

function PrepMini({ tempC, steepMin }: { tempC?: number; steepMin?: number }) {
  return (
    <div style={{ display:'grid', gap:12 }}>
      <div>
        <div style={{ fontWeight:700, fontSize:'1.05rem' }}>{tempC ?? '—'}°C</div>
        <div style={{ opacity:.8 }}>forrázási hőmérséklet</div>
      </div>
      <div>
        <div style={{ fontWeight:700, fontSize:'1.05rem' }}>{steepMin ?? '—'} perc</div>
        <div style={{ opacity:.8 }}>áztatási idő</div>
      </div>
    </div>
  );
}

type Props = {
  tea: any;
  colorScale: Record<string,string>;
};

export default function PrepServePanel({ tea }: Props) {
  const tempC = Number(tea.tempC ?? tea.temperatureC ?? 0) || undefined;
  const steepMin = Number(tea.steepMin ?? tea.steepMinutes ?? 0) || undefined;
  const serve = normalizeServeFlags(tea);
  const cupHex = resolveColorForCup(tea);

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:24 }}>
      <div style={{ display:'grid', placeItems:'center', padding:12, borderRadius:12, background:'rgba(0,0,0,0.03)' }}>
        <ColorCup hex={cupHex} />
      </div>

      <div style={{ padding:16, borderRadius:12, background:'rgba(0,0,0,0.03)' }}>
        <PrepMini tempC={tempC} steepMin={steepMin} />
      </div>

      <div style={{ padding:16, borderRadius:12, background:'rgba(0,0,0,0.03)' }}>
        <ServeModes tea={tea} />
      </div>
    </div>
  );
}
