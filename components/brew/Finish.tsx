import React from 'react';
import ui from '../../data/ui_texts.json';
const pick = (arr:string[], fallback:string)=> (arr && arr.length ? arr[Math.floor(Math.random()*arr.length)] : fallback);

export default function Finish({ tea, message, onRestart, onClose }:{
  tea:{ name:string };
  message?: string | null;
  onRestart?:()=>void;
  onClose:()=>void;
}) {
  const title = message && message.trim().length > 0
    ? message
    : pick(ui.brewJourney.timer.finished, 'Fogyaszd egészséggel!');
  return (
    <div className="grid place-items-center gap-3 text-center">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="opacity-80">{tea?.name ?? 'A tea'} kész. Jó teázást!</p>
      <div className="mt-2 flex gap-2">
        {onRestart && <button className="rounded-xl border px-4 py-2" onClick={onRestart}>Új főzet</button>}
        <button className="rounded-xl bg-black px-4 py-2 text-white" onClick={onClose}>Vissza</button>
      </div>
    </div>
  );
}