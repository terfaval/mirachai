import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { listMethodsForTea, getDescriptionFor } from '../../lib/brew.integration';

export default function Setup({
  layoutId,
  tea,
  value,
  onChange,
  onNext,
  onBack,
}:{
  layoutId:string;
  tea:{ slug:string; name:string };
  value:{ methodId:string|null; volumeMl:number };
  onChange:(v:{ methodId:string|null; volumeMl:number })=>void;
  onNext:()=>void; onBack:()=>void;
}) {
  const [methods, setMethods] = useState<Array<{id:string; label:string; one_liner?:string}>>([]);
  useEffect(()=>{ let alive=true;
    listMethodsForTea(tea.slug).then(async (m) => {
      if (!alive) return;
      const withDesc = await Promise.all(m.map(async (x) => {
        const d = await getDescriptionFor(tea.slug, x.id);
        return { ...x, one_liner: d?.one_liner };
      }));
      if (alive) setMethods(withDesc);
    });
    return ()=>{ alive=false; };
  }, [tea.slug]);

  const presetVolumes = [
    { value: 200, label: '200 ml', icon: '/icon_tinycup.svg' },
    { value: 300, label: '300 ml', icon: '/icon_cup.svg' },
    { value: 500, label: '500 ml', icon: '/icon_mug.svg' },
    { value: 1000, label: '1 l', icon: '/icon_bottle.svg' },
    { value: 2000, label: '2 l', icon: '/icon_teapot.svg' },
  ];

  return (
    <motion.div
      layoutId={layoutId}
      className="flex h-full w-full flex-col justify-between rounded-2xl bg-white p-6 shadow-xl"
      style={{ width: 'var(--brew-w)', height: 'var(--brew-h)' }}
      initial={false}
    >
      <motion.h2 layout className="mb-4 text-center text-lg font-semibold">
        {tea.name}
      </motion.h2>
      <motion.div layout className="space-y-10 overflow-y-auto">
        <div>
          <h2 className="mb-4 text-center text-lg font-semibold">Hogyan szeretnéd elkészíteni a teát?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {methods.length === 0 && (
              <div className="text-sm opacity-70">Hiányzó profil</div>
            )}
            {methods.map((m) => (
              <button
                key={m.id}
                className={`w-40 rounded-2xl border p-4 text-center transition hover:bg-gray-100 ${
                  value.methodId === m.id ? 'border-black' : 'border-gray-300'
                }`}
                onClick={() => onChange({ ...value, methodId: m.id })}
              >
                <img
                  src={`/icon_${m.id}.svg`}
                  alt=""
                  className="mx-auto mb-2 h-12 w-12"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="font-medium">{m.label}</div>
                {m.one_liner && (
                  <div className="mt-1 text-sm opacity-70">{m.one_liner}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-center text-lg font-semibold">Mennyi teát szeretnél főzni?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {presetVolumes.map((v) => (
              <button
                key={v.value}
                className={`w-28 rounded-2xl border p-4 text-center transition hover:bg-gray-100 ${
                  value.volumeMl === v.value ? 'border-black' : 'border-gray-300'
                }`}
                onClick={() => onChange({ ...value, volumeMl: v.value })}
              >
                <img src={v.icon} alt="" className="mx-auto mb-1 h-8 w-8" />
                <div className="text-sm font-medium">{v.label}</div>
              </button>
            ))}
            <div className="w-28 rounded-2xl border p-4 text-center">
              <img src="/icon_jug.svg" alt="" className="mx-auto mb-1 h-8 w-8" />
              <input
                type="number"
                min={50}
                step={10}
                value={value.volumeMl}
                onChange={(e) =>
                  onChange({ ...value, volumeMl: Number(e.target.value) })
                }
                className="w-full border-none bg-transparent text-center text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div layout className="mt-6 flex justify-end gap-2">
        <button className="rounded-xl border px-4 py-2" onClick={onBack}>
          Vissza
        </button>
        <button
          className="rounded-xl bg-black px-6 py-2 text-white disabled:opacity-50"
          disabled={!value.methodId}
          onClick={onNext}
        >
          Következő lépés
        </button>
      </motion.div>
    </motion.div>
  );
}