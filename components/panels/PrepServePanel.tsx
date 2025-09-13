import React from 'react';
import { getTeaColor } from '../../utils/colorMap';
import PrepInfo from '@/components/panels/PrepInfo';
import ColorCup from '@/components/ColorCup';

type Props = {
  tea: any;
  infoText: string;
};

// egyszerű slug – ékezetek le, nem betű/szám → '_'
const toSlug = (s: string) =>
  s
    ?.toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '') || 'default';

export default function PrepServePanel({ tea, infoText }: Props) {
  const tempC = Number(tea.tempC ?? tea.temperatureC ?? 0) || undefined;
  const steepMin = Number(tea.steepMin ?? tea.steepMinutes ?? 0) || undefined;

  // >>> ColorCup MÉRET: ITT ÁLLÍTSD (px vagy pl. '10rem')
  const CUP_SIZE: number | string = '25%';

  // tea.color lehet címke vagy hex – getTeaColor mindkettőt kezeli
  const cupHex = getTeaColor(tea.color ?? '');

  // kategória szerinti háttér
  const tableSrc = `/table_background/table_${toSlug(tea?.category ?? '')}.png`;

  return (
    <div
      style={{
        position: 'relative', // rétegezéshez kötelező
        display: 'grid',
        placeItems: 'center',
        width: '100%',
        aspectRatio: '3 / 2',
        padding: 12,
        borderRadius: 12,
        background: 'rgba(0,0,0,0.03)',
        overflow: 'hidden',
      }}
    >
        {/* 1) LEGALSÓ: kategória háttér (table_*.png) */}
        <img
          src={tableSrc}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',    // ha torzít, tehetsz 'contain'-t
            zIndex: 0,
            opacity: 0.9,          // igény szerint
            pointerEvents: 'none',
          }}
          // fallback: ha hiányzik a kategória-kép
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              '/table_background/table_default.png';
          }}
          draggable={false}
        />

        {/* 2) KÖZÉPSŐ: csésze PNG */}
        <img
          src="/colorCup.png"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            zIndex: 1,
            pointerEvents: 'none',
          }}
          draggable={false}
        />

        {/* 3) FELSŐ: a színes „tea” kör */}
        <ColorCup
          color={cupHex}
          size={CUP_SIZE}    // <<< a „chart”/csésze vizuális mérete
          teaInsetPct={100}
          teaOpacity={1}
          aria-label={tea?.name ? `Szín: ${tea.name}` : 'Tea szín'}
        />

        {/* Bal oldali felirat */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width:"30%",
            transform: 'translateY(-50%)',
            background: cupHex,
            color: '#000',
            fontWeight: 'bold',
            padding: '0.25rem 0.75rem',
            borderRadius: '4px',
            zIndex: 3,
          }}
        >
          {infoText}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            zIndex: 4,
          }}
        >
          <PrepInfo tempC={tempC} steepMin={steepMin} />
        </div>
    </div>
  );
}