import React from 'react';
import { getTeaColor } from '../../utils/colorMap';
import PrepInfo from '@/components/panels/PrepInfo';
import MoreInfoPanel from '@/components/panels/MoreInfoPanel';
import ColorCup from '@/components/ColorCup';

type Props = {
  tea: any;
  colorDark: string;
  infoText: string;
};

export default function PrepServePanel({ tea, colorDark, infoText }: Props) {
  const tempC = Number(tea.tempC ?? tea.temperatureC ?? 0) || undefined;
  const steepMin = Number(tea.steepMin ?? tea.steepMinutes ?? 0) || undefined;

  // >>> ColorCup MÉRET: itt állítsd (px vagy pl. '10rem')
  const CUP_SIZE: number | string = 112;

  // tea.color lehet címke vagy hex – getTeaColor mindkettőt kezeli
  const cupHex = getTeaColor(tea.color ?? '');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 24 }}>
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          padding: 12,
          borderRadius: 12,
          background: 'rgba(0,0,0,0.03)',
        }}
      >
        <ColorCup
          color={cupHex}
          size={CUP_SIZE}     // <<< a csésze/“chart” teljes mérete
          teaInsetPct={12}    // belső perem
          cupScale={2}     // kicsit kisebb csésze
          cupOffsetY={-2}     // 2px-rel feljebb
          aria-label={tea?.name ? `Szín: ${tea.name}` : 'Tea szín'}
        />
      </div>

      <div style={{ padding: 16, borderRadius: 12, background: 'rgba(0,0,0,0.03)' }}>
        <PrepInfo tempC={tempC} steepMin={steepMin} />
      </div>

      <div style={{ padding: 16, borderRadius: 12, background: 'rgba(0,0,0,0.03)' }}>
        <MoreInfoPanel text={infoText} colorDark={colorDark} />
      </div>
    </div>
  );
}
