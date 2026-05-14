import React from 'react';
import styles from './DescPanel.module.css';

type Props = {
  description: string;
  colorDark: string;
  categoryColor: string;
  imageSrc?: string;
  origin?: string;
};

export default function DescPanel({
  description,
  colorDark,
  categoryColor,
  imageSrc = '/background_backup.png',
  origin,
}: Props) {
  return (
    <section className={styles.descGrid}>
      <div className={styles.descTextCard} style={{ background: colorDark }}>
        <p className={styles.descText}>{description}</p>
      </div>

      <div
        className={styles.descImageCard}
        style={{
          backgroundImage: `url(${imageSrc})`,
        }}
      >
        {origin ? (
          <div className={styles.originLabel} style={{ background: categoryColor }}>
            {origin}
          </div>
        ) : null}
      </div>
    </section>
  );
}
