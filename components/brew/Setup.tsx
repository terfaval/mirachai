import React, { useEffect, useState } from 'react';
import { listMethodsForTea } from '../../lib/brew.integration';

export default function Setup({
  tea, value, onChange, onNext, onBack
}:{
  tea:{ slug:string; name:string };
  value:{ methodId:string|null; volumeMl:number };
  onChange:(v:{ methodId:string|null; volumeMl:number })=>void;
  onNext:()=>void; onBack:()=>void;
}) {
  const [methods, setMethods] = useState<Array<{id:string; label:string}>>([]);
  useEffect(()=>{ let alive=true;
    listMethodsForTea(tea.slug).then(m => { if (alive) setMethods(m); });
    return ()=>{ alive=false; };
  }, [tea.slug]);

  return (
    <div className="grid gap-6">
      <div>
        <div className="text-sm font-medium mb-2">Módszer</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {methods.map(m=>(
            <button key={m.id}
              className={`rounded-xl border px-3 py-2 text-left ${value.methodId===m.id?'border-black':'opacity-80'}`}
              onClick={()=>onChange({...value, methodId: m.id})}
            >
              {m.label}
              <div className="text-xs opacity-60 mt-1">{m.id}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Mennyiség</div>
        <div className="flex items-center gap-3">
          <input type="number" min={50} step={10} value={value.volumeMl}
            onChange={(e)=>onChange({...value, volumeMl: Number(e.target.value)})}
            className="w-32 rounded-xl border px-3 py-2" />
          <span className="opacity-70">ml</span>
          <div className="flex gap-2 ml-4">
            {[250, 400, 500].map(v=>(
              <button key={v} className="rounded-xl border px-3 py-1" onClick={()=>onChange({...value, volumeMl: v})}>{v} ml</button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 flex gap-2">
        <button className="rounded-xl border px-4 py-2" onClick={onBack}>Vissza</button>
        <button className="rounded-xl bg-black px-4 py-2 text-white" disabled={!value.methodId} onClick={onNext}>Számolás és lépések</button>
      </div>
    </div>
  );
}
