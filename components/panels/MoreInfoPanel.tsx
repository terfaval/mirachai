import React from 'react';

type Props = {
  text: string;
  colorDark: string;
};

export default function MoreInfoPanel({ text, colorDark }: Props) {
  return (
    <div
      style={{
        background: 'transparent',
        color: colorDark,
        padding: '20px 24px',
        borderRadius: 12,
        fontSize: '1.3rem',
        lineHeight: 1.5,
      }}
    >
      {text}
    </div>
  );
}