import { useEffect, useMemo, useRef, useState } from 'react';
import uiTexts from '@/data/ui_texts.json';
import styles from '@/styles/BrewJourney.module.css';
import {
  getServingInfoForMethod,
  type ServingInfo,
  SERVING_INFO_FALLBACK,
  type ServingTemperature,
  type ServingSweetening,
  type ServingGarnish,
} from '@/utils/servingInfo';

type StepFinishProps = {
  teaName: string;
  methodLabel: string;
  methodId?: string | null;
  finishMessage?: string | null;
  notes?: Array<string | null | undefined> | string | null;
  onReview: () => void;
  onClose: () => void;
};

function normalizeNotes(value: StepFinishProps['notes']): string[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value];
  }
  return [];
}

export default function StepFinish({
  teaName,
  methodLabel,
  methodId,
  finishMessage,
  notes,
  onReview,
  onClose,
}: StepFinishProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const normalizedNotes = normalizeNotes(notes);
  const [loggedMissingIds] = useState(() => new Set<string>());

  const servingLookup = useMemo(() => getServingInfoForMethod(methodId), [methodId]);
  const servingInfo = servingLookup.info;
  const isServingFallback = servingLookup.isFallback;
  const effectiveMethodId = servingLookup.methodId;

  useEffect(() => {
    if (!isServingFallback || !effectiveMethodId) {
      return;
    }
    if (loggedMissingIds.has(effectiveMethodId)) {
      return;
    }
    loggedMissingIds.add(effectiveMethodId);
    console.warn(`[serving] missing map for method_id=${effectiveMethodId}`);
  }, [effectiveMethodId, isServingFallback, loggedMissingIds]);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <div className={styles.stepWrapper}>

      <div className={styles.finishPanel}>
        <div className={styles.finishIntroBlock}>
          <h3 className={styles.finishHeading}>Készen van a {teaName}!</h3>
          <p className={styles.finishIntro}>
            Gratulálunk, végigmentél a {methodLabel.toLowerCase()} lépésein. Szűrd le, tálald és élvezd a teát.
          </p>
        </div>
        {finishMessage ? <p className={styles.finishMessage}>{finishMessage}</p> : null}
        <ServingInfoCard info={servingInfo} />
      </div>

      <footer className={styles.finishFooter}>
        <button type="button" className={styles.secondaryButton} onClick={onClose}>
          Vissza a teához
        </button>
        <button type="button" className={styles.primaryButton} onClick={onReview} ref={buttonRef}>
          Értékelem
        </button>
      </footer>
    </div>
  );
}

type ServingTranslations = {
  serving?: {
    title?: string;
    temperature?: Record<string, string> & { label?: string };
    sweetening?: Record<string, string> & { label?: string };
    garnish?: Record<string, string> & { label?: string };
    notes?: { label?: string };
  };
};

const translationSource = uiTexts as ServingTranslations;

function translate(key: string, fallback: string): string {
  const parts = key.split('.');
  let current: any = translationSource;
  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return fallback;
    }
    current = current[part];
  }
  return typeof current === 'string' && current.trim().length > 0 ? current : fallback;
}

const TEMPERATURE_FALLBACK: Record<ServingTemperature, string> = {
  hot: 'Meleg',
  cold: 'Hideg',
  either: 'Meleg vagy hideg',
};

const SWEETENING_FALLBACK: Record<ServingSweetening, string> = {
  unsweetened: 'Édesítés nélkül',
  light_honey: 'Kevés mézzel',
  sugar_syrup: 'Cukorsziruppal',
  fruit_slices: 'Gyümölcsszeletekkel',
  no_recommendation: 'Nincs ajánlás',
};

const GARNISH_FALLBACK: Record<ServingGarnish, string> = {
  none: 'Nincs',
  mint_leaf: 'Mentalevél',
  citrus: 'Citrus',
  optional: 'Opcionális',
};

function ServingInfoCard({ info }: { info: ServingInfo }) {
  const title = translate('serving.title', 'Hogyan fogyaszd?');
  const temperatureLabel = translate('serving.temperature.label', 'Hőmérséklet');
  const sweeteningLabel = translate('serving.sweetening.label', 'Édesítés');
  const garnishLabel = translate('serving.garnish.label', 'Díszítés');
  const notesLabel = translate('serving.notes.label', 'Megjegyzés');

  const temperatureValue = translate(
    `serving.temperature.${info.temperature}`,
    TEMPERATURE_FALLBACK[info.temperature] ?? TEMPERATURE_FALLBACK.either,
  );
  const sweeteningValue = translate(
    `serving.sweetening.${info.sweetening}`,
    SWEETENING_FALLBACK[info.sweetening] ?? SWEETENING_FALLBACK.no_recommendation,
  );
  const garnishValue = translate(
    `serving.garnish.${info.garnish}`,
    GARNISH_FALLBACK[info.garnish] ?? GARNISH_FALLBACK.optional,
  );

  return (
    <section className={styles.servingCard} aria-label={title}>
      <h4 className={styles.servingTitle}>{title}</h4>
      <dl className={styles.servingList}>
        <div className={styles.servingRow}>
          <dt className={styles.servingLabel}>{temperatureLabel}</dt>
          <dd className={styles.servingValue}>{temperatureValue}</dd>
        </div>
        <div className={styles.servingRow}>
          <dt className={styles.servingLabel}>{sweeteningLabel}</dt>
          <dd className={styles.servingValue}>{sweeteningValue}</dd>
        </div>
        <div className={styles.servingRow}>
          <dt className={styles.servingLabel}>{garnishLabel}</dt>
          <dd className={styles.servingValue}>{garnishValue}</dd>
        </div>
        <div className={styles.servingRow}>
          <dt className={styles.servingLabel}>{notesLabel}</dt>
          <dd className={styles.servingValue}>{info.notes ?? SERVING_INFO_FALLBACK.notes}</dd>
        </div>
      </dl>
    </section>
  );
}