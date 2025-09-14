import React, { useEffect, useState } from 'react';
import { buildPlanFor, type BrewMethodPlan } from '../../lib/brew.integration';

const mmss = (sec:number)=>`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(Math.floor(sec%60)).padStart(2,'0')}`;

export default function RecipeCard({
  tea, methodId, volumeMl, onBack, onStart
}:{
  tea:{ slug:string; name:string };
  methodId:string; volumeMl:number;
  onBack:()=>void; onStart:(p:BrewMethodPlan)=>void;
}) {
  const [plan, setPlan] = useState<BrewMethodPlan | null>(null);
  useEffect(()=>{ let ok=true;
    buildPlanFor(tea.slug, methodId, volumeMl).then(p => { if (ok) setPlan(p); });
    return ()=>{ ok=false; };
  }, [tea.slug, methodId, volumeMl]);

  if (!plan) return <div>Számolás…</div>;

  return (
    <div className="grid gap-4">
      <div className="text-sm uppercase tracking-wide opacity-70">{plan.method_label}</div>
      <div className="text-lg">
        {plan.grams} g • {plan.volume_ml} ml • {plan.tempC} °C
        {plan.timer_seconds ? <> • T: {mmss(plan.timer_seconds)}</> : null}
      </div>

      {!!plan.steps.length && (
        <ol className="grid gap-2">
          {plan.steps.map((s, i)=>(
            <li key={i} className="rounded-lg bg-black/5 px-3 py-2">
              <div className="text-sm font-medium">{s.title}</div>
              <div className="text-sm opacity-80">{s.action}</div>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-2 flex gap-2">
        <button className="rounded-xl border px-4 py-2" onClick={onBack}>Vissza</button>
        <button className="rounded-xl bg-black px-4 py-2 text-white" onClick={()=>onStart(plan!)}>Indítsd az időzítőt</button>
      </div>
    </div>
  );
}
