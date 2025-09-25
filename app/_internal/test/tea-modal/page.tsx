'use client';

import { useEffect, useState } from 'react';
import TeaModal from '@/components/TeaModal';
import type { Tea } from '@/utils/filter';

export default function TeaModalPlaywrightPage() {
  const [open, setOpen] = useState(true);
  const [tea, setTea] = useState<Tea | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/teas');
        if (!response.ok) {
          throw new Error('tea-fetch-failed');
        }
        const payload = (await response.json()) as Tea[];
        if (!cancelled) {
          setTea(payload[0] ?? null);
        }
      } catch {
        if (!cancelled) {
          setTea(null);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!tea) {
    return <p>Nincs tea adat a teszthez.</p>;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f2ff',
        padding: '2rem',
        boxSizing: 'border-box',
      }}
    >
      {open ? (
        <TeaModal tea={tea} onClose={() => setOpen(false)} />
      ) : (
        <button type="button" onClick={() => setOpen(true)}>
          Újra megnyitás
        </button>
      )}
    </div>
  );
}