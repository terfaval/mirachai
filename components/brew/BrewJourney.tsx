import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore framer-motion types may miss LayoutGroup
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import Intro from './Intro';
import Setup from './Setup';
import RecipeCard from './RecipeCard';
import Timer from './Timer';
import Finish from './Finish';
import type { BrewMethodPlan } from '../../lib/brew.integration';
import { FLIP_DUR, FLIP_EASE, HOLD_MS } from './constants';
import { lockSize } from '@/utils/lockSize';

export default function BrewJourney({ layoutId, tea, onClose }:{ layoutId:string; tea:{ slug:string; name:string; category?:string; colorMain?:string; colorDark?:string }, onClose:()=>void }) {
  const [stage, setStage] = useState<'bridge'|'setup'|'plan'|'timer'|'finish'>('bridge');
  const [methodId, setMethodId] = useState<string|null>(null);
  const [volumeMl, setVolumeMl] = useState<number>(250);
  const [plan, setPlan] = useState<BrewMethodPlan | null>(null);
  const [animating, setAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [autoForward, setAutoForward] = useState(true);

  useEffect(() => {
    if (stage === 'bridge' && autoForward) {
      const t = setTimeout(() => {
        setStage('setup');
        setAutoForward(false);
      }, FLIP_DUR * 1000 + HOLD_MS);
      return () => clearTimeout(t);
    }
  }, [stage, autoForward]);

  return (
    <div role="dialog" aria-modal className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div style={{ perspective: 1200 }}>
        <LayoutGroup>
          {(stage === 'bridge' || stage === 'setup') && (
            <motion.div
              ref={cardRef}
              layoutId={layoutId}
              data-animating={animating}
              className="relative overflow-hidden rounded-2xl shadow-xl"
              style={{
                width: 'var(--brew-w)',
                height: 'var(--brew-h)',
                backgroundColor: tea.colorMain,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
              initial={{ rotateY: 180 }}
              animate={{ rotateY: stage === 'bridge' ? 360 : 0 }}
              transition={{ duration: FLIP_DUR, ease: FLIP_EASE }}
              onAnimationStart={() => {
                setAnimating(true);
                lockSize(cardRef.current, true);
              }}
              onAnimationComplete={() => {
                lockSize(cardRef.current, false);
                setAnimating(false);
              }}
            >
              {stage === 'bridge' && <Intro tea={tea} />}
              {stage === 'setup' && !animating && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full w-full"
                >
                  <Setup
                    tea={tea}
                    value={{ methodId, volumeMl }}
                    onChange={(v) => {
                      setMethodId(v.methodId);
                      setVolumeMl(v.volumeMl);
                    }}
                    onNext={() => setStage('plan')}
                    onBack={() => setStage('bridge')}
                  />
                </motion.div>
              )}
            </motion.div>
          )}
          <AnimatePresence mode="wait">
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