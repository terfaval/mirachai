import React, { type CSSProperties } from 'react';
import styles from '../../styles/TeaModal.module.css';
import type { BrewMethodSummary } from '@/utils/brewMethods';

type Props = {
  methods: BrewMethodSummary[];
  onSelect: (methodId: string) => void;
  selectedId?: string | null;
};

const INITIAL_FALLBACK = '★';

const EQUIPMENT_ICON_BASE = '/teasets';

const EQUIPMENT_ICON_ENTRIES: Array<{ names: string[]; icon: string }> = [
  { icon: `${EQUIPMENT_ICON_BASE}/icon_cup.svg`, names: ['csésze'] },
  {
    icon: `${EQUIPMENT_ICON_BASE}/icon_tinycup.svg`,
    names: ['tiny cup', 'kis pohár', 'tiny cup / kis pohár'],
  },
  { icon: `${EQUIPMENT_ICON_BASE}/icon_shotglass.svg`, names: ['shot pohár'] },
  { icon: `${EQUIPMENT_ICON_BASE}/icon_mug.svg`, names: ['bögre'] },
  {
    icon: `${EQUIPMENT_ICON_BASE}/icon_jug.svg`,
    names: ['kancsó', 'vízmérő/kancsó', 'vízkiöntő', 'vízmérő / kancsó'],
  },
  {
    icon: `${EQUIPMENT_ICON_BASE}/icon_teapot.svg`,
    names: [
      'teáskanna',
      'kis teáskanna koncentrátumhoz',
      'kisméretű teáskanna',
      'teáskanna vagy lábas',
      'kis teáskanna',
    ],
  },
  { icon: `${EQUIPMENT_ICON_BASE}/icon_yixing.svg`, names: ['yi xing kanna'] },
  { icon: `${EQUIPMENT_ICON_BASE}/icon_gaiwan.svg`, names: ['gaiwan/yi xing kanna'] },
  { icon: `${EQUIPMENT_ICON_BASE}/icon_calabash.svg`, names: ['calabash (tökhéj) vagy bögre'] },
  { icon: `${EQUIPMENT_ICON_BASE}/icon_bombilla.svg`, names: ['bombilla (szűrős szívószál)'] },
  {
    icon: `${EQUIPMENT_ICON_BASE}/icon_spoon.svg`,
    names: ['kanál', 'keverőkanál', 'kanál (rétegezéshez)'],
  },
  {
    icon: `${EQUIPMENT_ICON_BASE}/icon_chashaku.svg`,
    names: ['kanál (chashaku)', 'chashaku'],
  },
  {
    icon: `${EQUIPMENT_ICON_BASE}/icon_pot.svg`,
    names: ['lábas', 'kis lábas', 'hőforrás'],
  },
  {
    icon: `${EQUIPMENT_ICON_BASE}/icon_filter_ok.svg`,
    names: [
      'szűrő',
      'finom szűrő',
      'finom szűrő/papír',
      'finom szűrő/szűrőpapír',
      'szűrőpapír',
      'finom szita',
      'szűrő / szűrőpapír / szita',
    ],
  },
  { icon: `${EQUIPMENT_ICON_BASE}/icon_filter_no.svg`, names: ['tölcsér'] },
  { icon: `${EQUIPMENT_ICON_BASE}/icon_ice.svg`, names: ['jég', 'hűtő'] },
  { icon: `${EQUIPMENT_ICON_BASE}/icon_milkjug.svg`, names: ['tej (növényi is lehet)'] },
  { icon: `${EQUIPMENT_ICON_BASE}/icon_sweetening.svg`, names: ['cukor', 'édesítés', 'cukor / édesítés'] },
  { icon: `${EQUIPMENT_ICON_BASE}/icon_teaready.svg`, names: ['vízforraló'] },
  { icon: `${EQUIPMENT_ICON_BASE}/icon_tap.svg`, names: ['csapolófej/pohár', 'csapolófej'] },
  {
    icon: `${EQUIPMENT_ICON_BASE}/icon_bottle.svg`,
    names: [
      'palack',
      'pohár/palack',
      'pohár / palack',
      'colbrew üveg',
      'szódás palack vagy szóda',
      'tárolóüveg',
      'zárható üveg',
      'zárható edény cold brew-höz',
    ],
  },
  { icon: `${EQUIPMENT_ICON_BASE}/icon_glass.svg`, names: ['pohár'] },
  {
    icon: `${EQUIPMENT_ICON_BASE}/icon_samovar.svg`,
    names: ['samovár vagy vízmelegítő', 'samovár'],
  },
  { icon: `${EQUIPMENT_ICON_BASE}/icon_kettle.svg`, names: ['vízmelegítő'] },
  { icon: `${EQUIPMENT_ICON_BASE}/icon_top.svg`, names: ['fedő', 'fedő/pohárbúra'] },
];

const EQUIPMENT_ICON_MAP: Record<string, string> = EQUIPMENT_ICON_ENTRIES.reduce(
  (map, entry) => {
    for (const name of entry.names) {
      const key = normalizeEquipmentKey(name);
      if (!map[key]) {
        map[key] = entry.icon;
      }
    }
    return map;
  },
  {} as Record<string, string>,
);

const EQUIPMENT_ICON_FALLBACK = `${EQUIPMENT_ICON_BASE}/icon_missing.svg`;

function normalizeEquipmentKey(value: string): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function getEquipmentIcon(item: string): string {
  const key = normalizeEquipmentKey(item);
  return EQUIPMENT_ICON_MAP[key] ?? EQUIPMENT_ICON_FALLBACK;
}

export default function BrewMethodsPanel({ methods, onSelect, selectedId }: Props) {
  if (!methods.length) {
    return null;
  }

  return (
    <section className={`${styles.panelCard} ${styles.brewMethodsPanel}`} aria-labelledby="brew-methods-heading">
      <div className={styles.brewMethodsHeader}>
        <h3 id="brew-methods-heading" className={styles.sectionTitle}>
          Főzési módok
        </h3>
        <p className={styles.brewMethodsLead}>
          Nézd át a Mirāchai ajánlott elkészítéseit, és válassz egyet a részletes főzési útmutatóhoz.
        </p>
      </div>
      <div className={`${styles.brewBody} ${styles.brewMethodsGrid}`}>
        {methods.map((method) => {
          const isSelected = selectedId === method.id;
          return (
            <button
              type="button"
              key={method.id}
              className={`${styles.brewCard} ${styles.brewMethodCard}`}
              data-selected={isSelected ? 'true' : undefined}
              aria-pressed={isSelected}
              onClick={() => onSelect(method.id)}
            >
              <div className={styles.brewMethodHeader}>
                <div className={styles.brewMethodIcon} aria-hidden>
                  {method.icon ? (
                    <img src={method.icon} alt="" />
                  ) : (
                    <span className={styles.brewMethodInitial}>
                      {(method.name ?? INITIAL_FALLBACK).charAt(0) || INITIAL_FALLBACK}
                    </span>
                  )}
                </div>
                <div className={styles.brewMethodTitleGroup}>
                  <h4 className={styles.brewMethodName}>{method.name}</h4>
                  {method.description ? (
                    <p className={styles.brewMethodDescription}>{method.description}</p>
                  ) : null}
                </div>
              </div>

              {method.equipment.length > 0 ? (
                <div className={styles.brewMethodEquipment}>
                  <span className={styles.equipmentLabel}>Felszerelés</span>
                  <ul className={styles.equipmentList}>
                    {method.equipment.map((item) => {
                      const iconSrc = getEquipmentIcon(item);
                      return (
                        <li key={item} className={styles.equipmentItem}>
                          {iconSrc ? <img src={iconSrc} alt="" className={styles.equipmentIcon} /> : null}
                          {item}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {method.serveModes.length > 0 ? (
                <div className={styles.serveRow}>
                  {method.serveModes.map((serve) => {
                    const style: CSSProperties & {
                      ['--serve-tag-bg']?: string;
                      ['--serve-tag-border']?: string;
                      ['--serve-tag-color']?: string;
                    } = {
                      '--serve-tag-bg': `${serve.color}1A`,
                      '--serve-tag-border': `${serve.color}33`,
                      '--serve-tag-color': serve.color,
                    };
                    return (
                      <span key={serve.id} className={styles.serveTag} style={style}>
                        <img src={serve.icon} alt="" className={styles.serveTagIcon} />
                        <span>{serve.label}</span>
                      </span>
                    );
                  })}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}