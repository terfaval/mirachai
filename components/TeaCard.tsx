// components/TeaCard.tsx
import { useState } from 'react';
import styles from '../styles/TeaCard.module.css';
import { Tea } from '../utils/filter';
import { getCategoryColor } from '../utils/colorMap';
import { getMandalaPath } from '../utils/mandala';
import TasteChart from './TasteChart';
import QuarterDonut, { Segment } from './QuarterDonut';
import { toStringArray } from '../lib/toStringArray';

interface Props {
  tea: Tea;
  tileX: number;
  tileY: number;
  tilesX: number;
  tilesY: number;
  onClick?: (tea: Tea) => void;
}

export default function TeaCard({ tea, tileX, tileY, tilesX, tilesY, onClick }: Props) {
  const color = getCategoryColor(tea.category); // main
  const mandalaColor = getCategoryColor(tea.category, 'light'); // LIGHT – kérés szerint
  const mandalaUrl = getMandalaPath(tea.category);
  const dotActiveColor = tea.intensity ? '#000' : getCategoryColor(tea.category, 'dark');
  const dotColor = getCategoryColor(tea.category, 'light');

  const [panel, setPanel] = useState<'taste' | 'category' | 'season' | 'daypart' | 'prep'>('taste');

  const flavorKeys = [
    'friss','édeskés','savanykás','fűszeres','virágos',
    'gyümölcsös','földes','kesernyés','csípős','umami',
  ];
  const allFlavors = flavorKeys
    .map((k) => ({ name: k, value: (tea as any)[`taste_${k}`] || 0 }))
    .filter((f) => f.value > 0);
  const flavors = allFlavors.sort((a, b) => b.value - a.value).slice(0, 3);
  const showChart = allFlavors.length >= 3;

  const intensityMap: Record<string, number> = { enyhe: 1, közepes: 2, erős: 3 };
  const intensityLevel = intensityMap[tea.intensity ?? ''] ?? 0;

  const seasonNames = ['tavasz', 'nyár', 'ősz', 'tél'];
  const seasonColors: Record<string, string> = {
    tavasz: '#92D050',
    nyár: '#FFD966',
    ősz: '#F4B183',
    tél: '#9DC3E6',
  };
  const seasons = toStringArray(tea.season_recommended);
  const seasonSegments: Segment[] = seasonNames.map((s) => ({
    key: s,
    color: seasonColors[s],
    active: seasons.includes(s),
  }));
  const seasonMonthMap: Record<string, string[]> = {
    tavasz: ['március', 'április', 'május'],
    nyár: ['június', 'július', 'augusztus'],
    ősz: ['szeptember', 'október', 'november'],
    tél: ['december', 'január', 'február'],
  };
  const seasonMonthsText =
    seasons.length === 4
      ? 'egész évben'
      : seasons.flatMap((s) => seasonMonthMap[s] || []).join(', ');

  const dayNames = ['reggel', 'délelőtt', 'délután', 'este'];
  const dayColors: Record<string, string> = {
    reggel: '#FFE57F',
    délelőtt: '#FFCA28',
    délután: '#FB8C00',
    este: '#8E24AA',
  };
  const rawDayparts = toStringArray(tea.daypart_recommended);
  const daySet = new Set<string>();
  rawDayparts.forEach((d) => {
    if (d === 'kora_délután' || d === 'étkezés_után') daySet.add('délután');
    else if (d === 'lefekvés_előtt') daySet.add('este');
    else if (d === 'bármikor') dayNames.forEach((n) => daySet.add(n));
    else daySet.add(d);
  });
  const daySegments: Segment[] = dayNames.map((n) => ({
    key: n,
    color: dayColors[n],
    active: daySet.has(n),
  }));
  const dayText = daySet.size === 4 ? 'bármikor' : dayNames.filter((n) => daySet.has(n)).join(', ');

  const temp = tea.tempC ?? 0;
  const steep = tea.steepMin ?? 0;
  const steepPct = Math.max(0, Math.min(steep, 10)) / 10 * 100;

  const icons = [
    { key: 'taste', symbol: '🍵', label: 'íz' },
    { key: 'category', symbol: '📚', label: 'kategória' },
    { key: 'season', symbol: '☀️', label: 'évszak' },
    { key: 'daypart', symbol: '🕒', label: 'napszak' },
    { key: 'prep', symbol: '⚙️', label: 'elkészítés' },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.iconColumn}>
        {icons.map((ic) => (
          <button
            key={ic.key}
            className={styles.iconBtn}
            data-active={panel === ic.key}
            onClick={(e) => {
              e.stopPropagation();
              setPanel(ic.key as any);
            }}
            aria-label={ic.label}
          >
            {ic.symbol}
          </button>
        ))}
      </div>

      <div
        className={styles.card}
        style={{ backgroundColor: color }}
        onClick={() => onClick?.(tea)}
      >
        <div
          className={styles.mandala}
          style={
            {
              '--mandala-fill': mandalaColor,
              '--tiles-x': tilesX,
              '--tiles-y': tilesY,
              '--tile-x': tileX,
              '--tile-y': tileY,
              '--mandala-scale': 1,
              '--mandala-prezoom': 1.5,
              '--mandala-url': `url(${mandalaUrl})`,
            } as React.CSSProperties
          }
        />
        <div className={styles.name}>{tea.name}</div>
        <div className={styles.mood}>{tea.mood_short}</div>

        {panel === 'taste' && (
          <div className={styles.info}>
            <ul className={styles.flavorList}>
              {flavors.map((f) => (
                <li key={f.name}>
                  <span className={styles.flavorValue}>{f.value}</span>
                  <span className={styles.flavorName}>{f.name}</span>
                </li>
              ))}
            </ul>

            {showChart && <TasteChart tea={tea} size={50} showLabels={false} />}

            <div className={styles.intensity}>
              <div className={styles.dots}>
                {[1, 2, 3].map((i) => (
                  <span
                    key={`intensity-${i}`}
                    className={styles.dot}
                    style={{ background: i <= intensityLevel ? dotActiveColor : dotColor }}
                  />
                ))}
              </div>
              <div className={styles.intensityLabel}>{tea.intensity}</div>
            </div>
          </div>
        )}

        {panel === 'category' && (
          <div className={styles.categoryPanel}>
            <div>{tea.category}</div>
            {tea.subcategory && <div>{tea.subcategory}</div>}
          </div>
        )}

        {panel === 'season' && (
          <div className={styles.seasonPanel}>
            <QuarterDonut segments={seasonSegments} size={40} />
            <div className={styles.seasonText}>{seasonMonthsText}</div>
          </div>
        )}

        {panel === 'daypart' && (
          <div className={styles.seasonPanel}>
            <QuarterDonut segments={daySegments} size={40} />
            <div className={styles.seasonText}>{dayText}</div>
          </div>
        )}

        {panel === 'prep' && (
          <div className={styles.prepPanel}>
            <div className={styles.tempBlock}>
              <div className={styles.prepLabel}>forrázás {temp} °C-on</div>
              <div className={styles.thermo}>
                <div className={styles.thermoFill} style={{ width: `${Math.min(100, temp)}%` }} />
              </div>
            </div>
            <div className={styles.steepBlock}>
              <div className={styles.prepLabel}>áztatás {steep} percig</div>
              <div className={styles.steepChart}>
                <svg width={40} height={40} viewBox="0 0 36 36">
                  <circle
                    cx={18}
                    cy={18}
                    r={16}
                    stroke="#eee"
                    strokeWidth={4}
                    fill="none"
                  />
                  <circle
                    cx={18}
                    cy={18}
                    r={16}
                    stroke="#000"
                    strokeWidth={4}
                    fill="none"
                    strokeDasharray={100}
                    strokeDashoffset={100 - steepPct}
                    pathLength={100}
                  />
                </svg>
                <div className={styles.steepIcon}>⏱️</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}