import React, { useEffect, useRef, useState } from 'react';
import type { BrewMethodPlan } from '../../lib/brew.integration';
import ui from '../../data/ui_texts.json';

const fmt = (sec:number)=>`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(Math.floor(sec%60)).padStart(2,'0')}`;
const pick = (arr:string[], fallback:string)=> (arr && arr.length ? arr[Math.floor(Math.random()*arr.length)] : fallback);

function parseHint(csv?: string): number[] {
  if (!csv) return [];
  return csv.split(',').map(s=>parseInt(s.trim(),10)).filter(n=>Number.isFinite(n)&&n>0);
}

export default function Timer({ plan, onBack, onDone }:{
  plan: BrewMethodPlan; onBack:()=>void; onDone:()=>void;
}) {
  const inf = parseHint(plan.timer_hint);
  const [stage, setStage] = useState(0);
  const baseSec = inf.length ? inf[stage] : (plan.timer_seconds ?? 0);
  const [sec, setSec] = useState(baseSec);
  const [running, setRunning] = useState(true);
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);
  const [msg, setMsg] = useState(()=>pick(ui.brewJourney.timer.messages.default, 'Lassan kész.'));

  useEffect(()=>{
    const id = setInterval(()=> setMsg(pick(ui.brewJourney.timer.messages.default, 'Lassan kész.')), 12000);
    return ()=> clearInterval(id);
  }, []);

  useEffect(()=>{ setSec(baseSec); }, [baseSec]);

  useEffect(()=>{
    const tick = (t:number)=>{
      if (!running) { last.current = t; raf.current = requestAnimationFrame(tick); return; }
      if (last.current == null) last.current = t;
      const dt = Math.max(0, t - last.current); last.current = t;
      setSec(s=>{
        const next = s - dt/1000;
        if (next <= 0) {
          if (inf.length && stage < inf.length - 1) { setStage(x=>x+1); return 0; }
          cancelAnimationFrame(raf.current!); onDone(); return 0;
        }
        return next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return ()=> { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [running, stage, baseSec, inf.length, onDone]);

  const total = inf.length ? inf[stage] : (plan.timer_seconds ?? 1);
  const pct = Math.max(0, Math.min(1, sec / total));

  return (
    <div className="grid place-items-center gap-4">
      <div className="text-sm opacity-70">
        {inf.length ? `Leöntés ${stage+1}/${inf.length}` : 'Időzítő'}
      </div>
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle cx="50" cy="50" r="45" stroke="#eee" strokeWidth="8" fill="none"/>
          <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="8" fill="none"
            strokeDasharray={`${Math.PI*2*45}`}
            strokeDashoffset={`${(1-pct)*Math.PI*2*45}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.2s linear' }}
          />
          <text x="50" y="55" textAnchor="middle" fontSize="16">{fmt(sec)}</text>
        </svg>
      </div>
      <div aria-live="polite" className="text-center text-sm opacity-80">{msg}</div>
      <div className="mt-2 flex gap-2">
        <button className="rounded-xl border px-4 py-2" onClick={onBack}>Vissza</button>
        <button className="rounded-xl border px-4 py-2" onClick={()=>setRunning(r=>!r)}>{running?'Szünet':'Folytatás'}</button>
        <button className="rounded-xl bg-black px-4 py-2 text-white" onClick={()=>setSec(total)}>Reset</button>
      </div>
    </div>
  );
}
