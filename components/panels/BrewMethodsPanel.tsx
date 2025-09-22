import React, { type CSSProperties } from 'react';
import styles from '../../styles/TeaModal.module.css';
import type { BrewMethodSummary } from '@/utils/brewMethods';

type Props = {
  methods: BrewMethodSummary[];
  onSelect: (methodId: string) => void;
  selectedId?: string | null;
};

const INITIAL_FALLBACK = '★';

const EQUIPMENT_ICON_MAP: Record<string, string> = {
  'agar/pecsétgyanta vagy zselésítő': '/teasets/icon_teaready.svg',
  'bögre': '/teasets/icon_mug.svg',
  'calabash (tökhéj) vagy bögre': '/teasets/icon_mug.svg',
  'bombilla (szűrős szívószál)': '/teasets/icon_tinycup.svg',
  'colbrew üveg': '/teasets/icon_teaready.svg',
  'csapolófej/pohár': '/teasets/icon_teaready.svg',
  'csésze': '/teasets/icon_cup.svg',
  'cukor': '/teasets/icon_sweetening.svg',
  'finom szita': '/teasets/icon_filter_ok.svg',
  'finom szűrő': '/teasets/icon_filter_ok.svg',
  'finom szűrő/papír': '/teasets/icon_filter_ok.svg',
  'finom szűrő/szűrőpapír': '/teasets/icon_filter_ok.svg',
  'gaiwan/yi xing kanna': '/teasets/icon_gaiwan.svg',
  'hőforrás': '/teasets/icon_pot.svg',
  'hűtő': '/teasets/icon_ice.svg',
  'jég': '/teasets/icon_ice.svg',
  'kancsó': '/teasets/icon_jug.svg',
  'kanál': '/teasets/icon_spoon.svg',
  'kanál (chashaku)': '/teasets/icon_spoon.svg',
  'kanál (rétegezéshez)': '/teasets/icon_spoon.svg',
  'keverőkanál': '/teasets/icon_spoon.svg',
  'kis lábas': '/teasets/icon_pot.svg',
  'kis teáskanna koncentrátumhoz': '/teasets/icon_teapot.svg',
  'kisméretű teáskanna': '/teasets/icon_teapot.svg',
  'lábas': '/teasets/icon_pot.svg',
  'matcha tál (chawan)': '/teasets/icon_teaready.svg',
  'pohár': '/teasets/icon_cup.svg',
  'pohár/palack': '/teasets/icon_teaready.svg',
  'n₂ patron': '/teasets/icon_teaready.svg',
  'nitro whipper vagy mini keg': '/teasets/icon_teaready.svg',
  'samovár vagy vízmelegítő': '/teasets/icon_pot.svg',
  'shot pohár': '/teasets/icon_tinycup.svg',
  'szűrő': '/teasets/icon_filter_ok.svg',
  'szűrőpapír': '/teasets/icon_filter_ok.svg',
  'tárolóüveg': '/teasets/icon_teaready.svg',
  'tej (növényi is lehet)': '/teasets/icon_milkjug.svg',
  'teáskanna': '/teasets/icon_teapot.svg',
  'teáskanna vagy lábas': '/teasets/icon_teapot.svg',
  'tölcsér': '/teasets/icon_filter_no.svg',
  'vízforraló': '/teasets/icon_pot.svg',
  'vízkiöntő': '/teasets/icon_jug.svg',
  'vízmérő/kancsó': '/teasets/icon_jug.svg',
  'szódás palack vagy szóda': '/teasets/icon_teaready.svg',
  'zárható edény cold brew-höz': '/teasets/icon_teaready.svg',
  'zárható üveg': '/teasets/icon_teaready.svg',
};

function getEquipmentIcon(item: string): string | undefined {
  const key = item.trim().toLowerCase();
  return EQUIPMENT_ICON_MAP[key];
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