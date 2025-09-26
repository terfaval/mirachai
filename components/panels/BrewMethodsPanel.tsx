import React, { type CSSProperties } from 'react';
import styles from '../../styles/TeaModal.module.css';
import type { BrewMethodSummary } from '@/utils/brewMethods';
import { getEquipmentIcon, normalizeGear } from '@/utils/equipment';

type Props = {
  methods: BrewMethodSummary[];
  onSelect: (methodId: string) => void;
  onStart?: (methodId: string | null | undefined) => void;
  selectedId?: string | null;
};

const INITIAL_FALLBACK = '★';

export default function BrewMethodsPanel({ methods, onSelect, onStart, selectedId }: Props) {
  if (!methods.length) {
    return null;
  }

  const selectedMethod = selectedId
    ? methods.find((method) => method.id === selectedId)
    : null;

  return (
    <section className={`${styles.panelCard} ${styles.brewMethodsPanel}`} aria-labelledby="brew-methods-heading">
      <div className={styles.brewMethodsHeader}>
        <h3 id="brew-methods-heading" className={styles.sectionTitle}>
          Készítsd el te is!
        </h3>
        <p className={styles.brewMethodsLead}>
          Válassz egy elkészítési módot és már induli is a részletes főzési útmutató!
        </p>
      </div>
      <div className={`${styles.brewBody} ${styles.brewMethodsGrid}`}>
        {methods.map((method) => {
          const isSelected = selectedId === method.id;
          const equipmentItems = method.gear?.length
            ? method.gear
            : normalizeGear(method.equipment);
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
                  {method.oneLiner ?? method.description ? (
                    <p className={styles.brewMethodDescription}>{method.oneLiner}</p>
                  ) : null}
                </div>
              </div>

              {equipmentItems.length > 0 ? (
                <div className={styles.brewMethodEquipment}>
                  <span className={styles.equipmentLabel}>Felszerelés</span>
                  <ul className={styles.equipmentList}>
                    {equipmentItems.map((item) => {
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
      <div className={styles.brewMethodsActions}>
        <button
          type="button"
          className={styles.brewMethodsStart}
          onClick={() => {
            if (onStart) {
              onStart(selectedMethod ? selectedMethod.id : null);
            }
          }}
        >
          Kezdjük a főzést
        </button>
      </div>
    </section>
  );
}