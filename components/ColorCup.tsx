import React from 'react';

export default function ColorCup({ color }: { color: string }) {
  return (
    <div className="relative w-32 h-32 mx-auto">
      <div className="absolute inset-0 rounded-full border-8 border-gray-200" />
      <div
        className="absolute inset-1 rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${color}, ${color}cc)`,
        }}
      />
    </div>
  );
}