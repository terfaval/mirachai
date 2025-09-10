import React from 'react';

type Props = {
  colorDark: string;
};

export default function MoreInfoPanel({ colorDark }: Props) {
  return (
    <div
      style={{
        background: 'transparent',
        color: colorDark,
        padding: '20px 24px',
        borderRadius: 12,
        fontSize: '1rem',
        lineHeight: 1.5,
      }}
    >
      Itt lesz egy hosszabb leírás a teáról: ízéről, hozzávalókról, hatásokról stb.
    </div>
  );
}