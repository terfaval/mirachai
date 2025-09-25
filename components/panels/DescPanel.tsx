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
    <div style={{ display:'grid', gridTemplateColumns:'40% 60%', gap:16, minHeight:220 }}>
      <div style={{ background: colorDark, color:'#fff', padding:'20px 24px', fontSize:'1.4rem', lineHeight:1.5, borderRadius:12, alignContent:'center' }}>
        {description}
      </div>
      <div style={{
        backgroundImage:`url(${imageSrc})`,
        backgroundSize:'cover',
        backgroundPosition:'center',
        borderRadius:12,
        minHeight:220,
        position:'relative'
      }}>
        <div className={styles.originLabel} style={{ background: categoryColor }}>
          {origin}
        </div>
      </div>
    </div>
  );
}