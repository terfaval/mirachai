import React from 'react';

type Props = {
  description: string;
  colorDark: string;
  imageSrc?: string;
};

export default function DescPanel({ description, colorDark, imageSrc = '/background_backup.png' }: Props) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'40% 60%', gap:16, minHeight:220 }}>
      <div style={{ background: colorDark, color:'#fff', padding:'20px 24px', fontSize:'1.1rem', lineHeight:1.5, borderRadius:12 }}>
        {description}
      </div>
      <div style={{
        backgroundImage:`url(${imageSrc})`,
        backgroundSize:'cover',
        backgroundPosition:'center',
        borderRadius:12,
        minHeight:220
      }}/>
    </div>
  );
}
