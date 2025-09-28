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

function formatGramsPer100(value: number): string {
  if (!Number.isFinite(value)) {
    return '';
  }
  const display = value >= 10 ? Math.round(value).toString() : value.toFixed(1);
  return `${display} g / 100 ml`;
}

function formatPercentNumber(value: number | null | undefined): string | null {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }
  if (value >= 10) {
    return Math.round(value).toString();
  }
  return value.toFixed(1);
}

function formatPercentSingle(value: number | null | undefined): string | null {
  const formatted = formatPercentNumber(value);
  return formatted ? `${formatted}%` : null;
}

function formatPercentRange(min: number | null | undefined, max: number | null | undefined): string | null {
  const minStr = formatPercentNumber(min);
  const maxStr = formatPercentNumber(max);
  if (minStr && maxStr) {
    if (minStr === maxStr) {
      return `${minStr}%`;
    }
    return `${minStr}–${maxStr}%`;
  }
  const single = minStr ?? maxStr;
  return single ? `${single}%` : null;
}

function renderMixingDetails(method: BrewMethodSummary) {
  const mixing = method.mixing;
  if (!mixing) {
    return null;
  }

  if (mixing.type === 'sparkling') {
    const items = [
      mixing.concentrateStrength ? { label: 'Koncentrátum', value: mixing.concentrateStrength } : null,
      mixing.serveDilution ? { label: 'Tálalás', value: mixing.serveDilution } : null,
    ].filter((item): item is { label: string; value: string } => item !== null);
    if (!items.length) {
      return null;
    }
    return (
      <div className={styles.brewMethodMetaBlock}>
        <span className={styles.brewMethodMetaLabel}>Mixing</span>
        <dl className={styles.brewMethodMetaList}>
          {items.map((item) => (
            <div key={item.label} className={styles.brewMethodMetaRow}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  if (mixing.type === 'texture') {
    const agar = formatPercentRange(mixing.agarMinPct ?? null, mixing.agarMaxPct ?? null);
    const lecithin = formatPercentSingle(mixing.lecithinPct ?? null);
    const items = [
      agar ? { label: 'Agar', value: agar } : null,
      lecithin ? { label: 'Lecitin', value: lecithin } : null,
    ].filter((item): item is { label: string; value: string } => item !== null);
    if (!items.length) {
      return null;
    }
    return (
      <div className={styles.brewMethodMetaBlock}>
        <span className={styles.brewMethodMetaLabel}>Texture</span>
        <dl className={styles.brewMethodMetaList}>
          {items.map((item) => (
            <div key={item.label} className={styles.brewMethodMetaRow}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  if (mixing.type === 'layered') {
    const items = [
      mixing.baseStrengths ? { label: 'Alap arány', value: mixing.baseStrengths } : null,
      mixing.notes ? { label: 'Megjegyzés', value: mixing.notes } : null,
    ].filter((item): item is { label: string; value: string } => item !== null);
    if (!items.length) {
      return null;
    }
    return (
      <div className={styles.brewMethodMetaBlock}>
        <span className={styles.brewMethodMetaLabel}>Layered</span>
        <dl className={styles.brewMethodMetaList}>
          {items.map((item) => (
            <div key={item.label} className={styles.brewMethodMetaRow}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  return null;
}

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
          const ratioText = method.ratio?.text ?? null;
          const ratioHint =
            method.ratio?.gPer100ml != null ? formatGramsPer100(method.ratio.gPer100ml) : null;
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

              {ratioText ? (
                <div className={styles.brewMethodMetaBlock}>
                  <span className={styles.brewMethodMetaLabel}>Arány</span>
                  <div className={styles.brewMethodRatioValues}>
                    <span className={styles.brewMethodRatioMain}>{ratioText}</span>
                    {ratioHint ? (
                      <span className={styles.brewMethodRatioHint}>{ratioHint}</span>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {renderMixingDetails(method)}
              
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