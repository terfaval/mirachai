import React from 'react';

interface Props {
  name: string;
}

export default function TeaTitle({ name }: Props) {
  return (
    <div className="text-center mb-4">
      <h1 className="font-display lowercase text-4xl md:text-5xl leading-tight line-clamp-2">
        {name}
      </h1>
      <hr className="mt-2 border-t border-gray-200" />
    </div>
  );
}