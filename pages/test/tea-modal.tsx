import { useMemo, useState } from 'react';
import TeaModal from '@/components/TeaModal';
import teasData from '@/data/teas.json';
import type { Tea } from '@/utils/filter';

const fallbackTea: Tea = (teasData as Tea[])[0];

export default function TeaModalPlaywrightPage() {
  const [open, setOpen] = useState(true);
  const tea = useMemo(() => fallbackTea, []);

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