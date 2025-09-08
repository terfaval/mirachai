import React from 'react';

interface Props {
  category: string;
  subcategory: string;
  categoryColors: Record<string, string>;
}

export default function CategoryPills({ category, subcategory, categoryColors }: Props) {
  const categoryColor = categoryColors[category] || '#666';
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 justify-center mb-6 max-w-xs mx-auto">
      <span
        className="px-3 py-1 rounded-full text-sm text-center text-white"
        style={{ backgroundColor: categoryColor }}
      >
        {category}
      </span>
      <span className="px-3 py-1 rounded-md border border-gray-300 text-sm text-center">
        {subcategory}
      </span>
    </div>
  );
}