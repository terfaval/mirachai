import React, { useEffect, useMemo, useState } from 'react';
import uiTexts from '../../data/ui_texts.json';
import MandalaBackground from '../panels/MandalaBackground';

export default function Intro({ tea, onDone }:{ tea:{ name:string; category?:string; colorMain?:string; colorDark?:string }, onDone:()=>void }) {
  const { h1, lead } = uiTexts.brewJourney.intro;
  const h1Text = useMemo(() => h1[Math.floor(Math.random()*h1.length)], []);
  const leadText = useMemo(() => lead[Math.floor(Math.random()*lead.length)], []);
  const [phase, setPhase] = useState<'logo' | 'text'>('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 1000);
    const t2 = setTimeout(onDone, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className="relative h-72 w-full [perspective:1000px]">
      <div className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${phase==='text' ? '' : 'rotate-y-180'}`}>
        {/* Front side with text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center [backface-visibility:hidden]" style={{backgroundColor: tea.colorMain}}>
          <MandalaBackground color={tea.colorDark ?? '#000'} category={tea.category ?? ''} />
          <div className="relative z-10 text-center px-4">
            <h1 className="mb-2 text-2xl font-bold">{h1Text}</h1>
            <p className="text-base">{leadText}</p>
          </div>
        </div>
        {/* Back side with logo */}
        <div className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden] rotate-y-180" style={{backgroundColor: tea.colorMain}}>
          <MandalaBackground color={tea.colorDark ?? '#000'} category={tea.category ?? ''} />
          <img src="/mirachai_logo.svg" alt="Mirachai" className="relative z-10 w-32" />
        </div>
      </div>
    </div>
  );
}