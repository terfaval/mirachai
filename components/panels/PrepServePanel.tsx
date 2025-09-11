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

  // tea.color lehet címke vagy hex
  const cupHex = getTeaColor(tea.color ?? '');

  // >>> ColorCup MÉRET: ITT ÁLLÍTSD
  const CUP_SIZE: number | string = 112;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 24 }}>
      {/* Bal kártya: külön háttér PNG (z-0), felette a színes kör (z-10) */}
      <div
        style={{
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
          padding: 12,
          borderRadius: 12,
          background: 'rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        {/* HÁTTÉR – csésze PNG külön rétegben, a kártyában, a színes kör MÖGÖTT */}
        <img
          src="/colorCup.png"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            zIndex: 0,
            pointerEvents: 'none',
          }}
          draggable={false}
        />

        {/* ELŐTÉR – csak a színes kör (opacity állítható) */}
        <ColorCup
          color={cupHex}
          size={CUP_SIZE}     // <<< a „chart”/csésze teljes mérete
          teaInsetPct={2}
          teaOpacity={1}  // <<< ha áttetszőbbet szeretnél, pl. 0.8
          showImage={false}  // <<< ne rajzolja a belső PNG-t
          aria-label={tea?.name ? `Szín: ${tea.name}` : 'Tea szín'}
          className="relative"
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
