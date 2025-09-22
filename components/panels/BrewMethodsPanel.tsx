import React, { type CSSProperties } from 'react';
import styles from '../../styles/TeaModal.module.css';
import type { BrewMethodSummary } from '@/utils/brewMethods';

type Props = {
  methods: BrewMethodSummary[];
  onSelect: (methodId: string) => void;
  selectedId?: string | null;
};

const INITIAL_FALLBACK = '★';

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
                    {method.equipment.map((item) => (
                      <li key={item} className={styles.equipmentItem}>
                        {item}
                      </li>
                    ))}
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