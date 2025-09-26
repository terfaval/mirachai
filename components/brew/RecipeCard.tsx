import React from 'react';
import type { BrewMethodPlan } from '../../lib/brew.integration';

const formatDuration = (seconds?: number) => {
  if (!seconds || Number.isNaN(seconds)) {
    return null;
  }
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

type RecipeCardProps = {
  plan: BrewMethodPlan | null;
  isLoading: boolean;
  error?: string | null;
  onBack: () => void;
  onStart: (plan: BrewMethodPlan) => void;
  onRetry?: () => void;
};

export default function RecipeCard({ plan, isLoading, error, onBack, onStart, onRetry }: RecipeCardProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4">
        <div className="text-sm uppercase tracking-wide opacity-70">Recept betöltése…</div>
        <div className="text-lg">Számoljuk a pontos arányokat.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4">
        <div className="text-lg font-semibold text-slate-900">{error}</div>
        <div className="mt-2 flex gap-2">
          <button className="rounded-xl border px-4 py-2" type="button" onClick={onBack}>
            Vissza
          </button>
          {onRetry ? (
            <button className="rounded-xl bg-black px-4 py-2 text-white" type="button" onClick={onRetry}>
              Próbáld újra
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="grid gap-4">
        <div className="text-lg font-semibold text-slate-900">Nincs elérhető recept ehhez a módszerhez.</div>
        <button className="rounded-xl border px-4 py-2" type="button" onClick={onBack}>
          Vissza
        </button>
      </div>
    );
  }

  const timerFormatted = formatDuration(plan.timer_seconds);

  return (
    <div className="grid gap-4">
      <div className="text-sm uppercase tracking-wide opacity-70">{plan.method_label}</div>
      <div className="text-lg">
        {plan.grams} g • {plan.volume_ml} ml • {plan.tempC} °C
        {timerFormatted ? <>{' • T: '}{timerFormatted}</> : null}
      </div>

      {plan.steps.length > 0 ? (
        <ol className="grid gap-2">
          {plan.steps.map((step, index) => (
            <li key={`${step.title}-${index}`} className="rounded-lg bg-black/5 px-3 py-2">
              <div className="text-sm font-medium">{step.title}</div>
              <div className="text-sm opacity-80">{step.action}</div>
            </li>
          ))}
        </ol>
      ) : null}

      {plan.notes && plan.notes.length ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm leading-relaxed text-slate-600">
          {plan.notes.join(' • ')}
        </div>
      ) : null}

      <div className="mt-2 flex gap-2">
        <button className="rounded-xl border px-4 py-2" type="button" onClick={onBack}>
          Vissza
        </button>
        <button className="rounded-xl bg-black px-4 py-2 text-white" type="button" onClick={() => onStart(plan)}>
          Indítsd az időzítőt
        </button>
      </div>
    </div>
  );
}