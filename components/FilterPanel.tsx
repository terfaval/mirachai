import React, { useState, useEffect } from 'react';

interface Props {
  open: boolean;
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  onClose: () => void;
}

export default function FilterPanel({ open, categories, selectedCategory, onSelectCategory, onClose }: Props) {
  const [localCategory, setLocalCategory] = useState<string>(selectedCategory ?? '');

  useEffect(() => {
    setLocalCategory(selectedCategory ?? '');
  }, [selectedCategory]);

  if (!open) return null;

  const apply = () => {
    onSelectCategory(localCategory || null);
    onClose();
  };

  const reset = () => {
    setLocalCategory('');
    onSelectCategory(null);
    onClose();
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div style={{ background: 'white', padding: '1rem', width: '90%', maxWidth: '300px' }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Szűrők</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Kategória:
            <select
              value={localCategory}
              onChange={(e) => setLocalCategory(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            >
              <option value="">(mind)</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button onClick={reset}>Alaphelyzet</button>
          <button onClick={apply}>Alkalmazás</button>
        </div>
      </div>
    </div>
  );
}