// components/brew/EquipmentHint.tsx
import React, { useEffect, useState } from 'react';
import { getEquipmentHowTo } from '../../lib/brew.integration';

export default function EquipmentHint({ code }: { code: string }) {
  const [data, setData] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    getEquipmentHowTo(code).then((d) => alive && setData(d));
    return () => { alive = false; };
  }, [code]);

  if (!data) return null;

  return (
    <div className="inline-block">
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border px-3 py-1 text-sm"
      >
        {data.name ?? code}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 text-sm uppercase tracking-wide opacity-70">Eszköztipp</div>
            <div className="text-lg font-medium">{data.name ?? code}</div>
            {data.desc && <p className="text-sm opacity-80 mb-2">{data.desc}</p>}
            {Array.isArray(data.steps) && data.steps.length > 0 && (
              <ol className="list-decimal pl-5 text-sm">
                {data.steps.map((s: string, i: number) => <li key={i}>{s}</li>)}
              </ol>
            )}
            <div className="mt-4 text-right">
              <button
                className="rounded-xl bg-black px-4 py-2 text-white"
                onClick={() => setOpen(false)}
              >
                Oké
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
