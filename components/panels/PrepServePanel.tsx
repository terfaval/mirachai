import React from 'react';
import styles from '../../styles/TeaModal.module.css';
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

  const CUP_SIZE: number | string = '50%';

  // tea.color lehet címke vagy hex – getTeaColor mindkettőt kezeli
  const cupHex = getTeaColor(tea.color ?? '');

  // kategória szerinti háttér
  const tableSrc = `/table_background/table_${toSlug(tea?.category ?? '')}.png`;
  const info = infoText?.trim();

  return (
    <section className={`${styles.panelCard} ${styles.prepServeCard}`} aria-labelledby="prep-serve-heading">
      <h3 id="prep-serve-heading" className={styles.sectionTitle}>
        Előkészítés
      </h3>
      <div className={styles.prepServeCanvas}>
        <img
          src={tableSrc}
          alt=""
          className={styles.prepServeBackground}
          onError={(event) => {
            (event.currentTarget as HTMLImageElement).src = '/table_background/table_default.png';
          }}
          draggable={false}
        />
        <img src="/colorCup.png" alt="" className={styles.prepServeOverlay} draggable={false} />
        <div className={styles.prepServeCup}>
          <ColorCup
            color={cupHex}
            size={CUP_SIZE}
            teaInsetPct={100}
            teaOpacity={1}
            aria-label={tea?.name ? `Szín: ${tea.name}` : 'Tea szín'}
          />
        </div>
        {info ? <div className={styles.prepServeBadge}>{info}</div> : null}
      </div>
      <div className={styles.prepServeDetails}>
        <div className={styles.prepServeInfoCard}>
          <PrepInfo tempC={tempC} steepMin={steepMin} colorDark="#1f2937" />
        </div>
      </div>
    </section>
  );
}