import React, { useState } from 'react';
import Setup from './Setup';
import RecipeCard from './RecipeCard';
import Timer from './Timer';
import Finish from './Finish';
import type { BrewMethodPlan } from '../../lib/brew.integration';

export default function BrewJourney({ tea, onClose }:{ tea:{ slug:string; name:string }, onClose:()=>void }) {
  const [stage, setStage] = useState<'setup'|'plan'|'timer'|'finish'>('setup');
  const [methodId, setMethodId] = useState<string|null>(null);
  const [volumeMl, setVolumeMl] = useState<number>(250);
  const [plan, setPlan] = useState<BrewMethodPlan | null>(null);

  return (
    <div role="dialog" aria-modal className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
        {stage === 'setup' && (
          <Setup
            tea={tea}
            value={{ methodId, volumeMl }}
            onChange={(v)=>{ setMethodId(v.methodId); setVolumeMl(v.volumeMl); }}
            onNext={()=> setStage('plan')}
            onBack={onClose}
          />
        )}
        {stage === 'plan' && methodId && (
          <RecipeCard
            tea={tea}
            methodId={methodId}
            volumeMl={volumeMl}
            onBack={()=> setStage('setup')}
            onStart={(p)=>{ setPlan(p); setStage('timer'); }}
          />
        )}
        {stage === 'timer' && plan && (
          <Timer
            plan={plan}
            onBack={()=> setStage('plan')}
            onDone={()=> setStage('finish')}
          />
        )}
        {stage === 'finish' && (
          <Finish tea={tea} onClose={onClose} onRestart={()=>{ setStage('setup'); setPlan(null); }} />
        )}
      </div>
    </div>
  );
}
