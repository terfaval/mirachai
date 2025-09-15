import React, { useState } from 'react';
// @ts-ignore framer-motion types may miss LayoutGroup
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import Intro from './Intro';
import Setup from './Setup';
import RecipeCard from './RecipeCard';
import Timer from './Timer';
import Finish from './Finish';
import type { BrewMethodPlan } from '../../lib/brew.integration';

export default function BrewJourney({ layoutId, tea, onClose }:{ layoutId:string; tea:{ slug:string; name:string; category?:string; colorMain?:string; colorDark?:string }, onClose:()=>void }) {
  const [stage, setStage] = useState<'bridge'|'setup'|'plan'|'timer'|'finish'>('bridge');
  const [methodId, setMethodId] = useState<string|null>(null);
  const [volumeMl, setVolumeMl] = useState<number>(250);
  const [plan, setPlan] = useState<BrewMethodPlan | null>(null);

  return (
    <div role="dialog" aria-modal className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div style={{ perspective: 1200 }}>
        <LayoutGroup>
          <AnimatePresence mode="wait">
            {stage === 'bridge' && (
              <Intro
                key="bridge"
                layoutId={layoutId}
                tea={tea}
                onDone={() => setStage('setup')}
              />
            )}
            {stage === 'setup' && (
              <Setup
                key="setup"
                layoutId={layoutId}
                tea={tea}
                value={{ methodId, volumeMl }}
                onChange={(v) => {
                  setMethodId(v.methodId);
                  setVolumeMl(v.volumeMl);
                }}
                onNext={() => setStage('plan')}
                onBack={() => setStage('bridge')}
              />
            )}
            {stage === 'plan' && methodId && (
              <RecipeCard
                tea={tea}
                methodId={methodId}
                volumeMl={volumeMl}
                onBack={() => setStage('setup')}
                onStart={(p) => {
                  setPlan(p);
                  setStage('timer');
                }}
              />
            )}
            {stage === 'timer' && plan && (
              <Timer
                plan={plan}
                onBack={() => setStage('plan')}
                onDone={() => setStage('finish')}
              />
            )}
            {stage === 'finish' && (
              <Finish
                tea={tea}
                onClose={onClose}
                onRestart={() => {
                  setStage('setup');
                  setPlan(null);
                }}
              />
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </div>
  );
}