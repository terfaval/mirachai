import MandalaBackground from '../panels/MandalaBackground';

export const FLIP_DUR = 0.9;
export const FLIP_EASE = [0.22, 1, 0.36, 1] as const;
export const MID_HOLD = 0.5;
export const MID_LIFT = 160;
export const TARGET_LIFT = 280;

type SetupProps = {
  tea: { slug: string; name: string; category?: string; colorMain?: string; colorDark?: string };
  value: { methodId: string | null; volumeMl: number };
  onChange: (v: { methodId: string | null; volumeMl: number }) => void;
  onNext: () => void;
  onBack: () => void;
};

type JourneyTopProps = {
  tea: SetupProps['tea'];
  methodId?: string | null;
  volumeMl?: number;
  showControls?: boolean;
  onBack?: () => void;
  onNext?: () => void;
};

const formatMethod = (methodId?: string | null) => {
  if (!methodId) return 'Módszer kiválasztása hamarosan';
  const cleaned = methodId.replace(/[-_]/g, ' ').trim();
  if (!cleaned) return 'Módszer kiválasztása hamarosan';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const formatVolume = (volume?: number) => {
  if (!volume || Number.isNaN(volume)) return 'Add meg, mennyi teát főznél';
  return `${volume} ml`;
};

export function SetupJourneyTop({
  tea,
  methodId,
  volumeMl,
  showControls = false,
  onBack,
  onNext,
}: JourneyTopProps) {
  const mainColor = tea.colorMain ?? '#B88E63';
  const darkColor = tea.colorDark ?? '#2D1E3E';

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-[32px]"
      style={{ background: `linear-gradient(160deg, ${mainColor} 0%, ${darkColor} 68%)` }}
    >
      <div className="relative flex flex-col gap-6 px-10 py-12 text-white">
        <MandalaBackground
          color={tea.colorDark ?? darkColor}
          category={tea.category ?? ''}
          className="max-w-none opacity-40"
        />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="text-xs uppercase tracking-[0.4em] text-white/60">Mirachai Brew Journey</span>
          <h1 className="text-4xl font-semibold leading-tight">{tea.name}</h1>
          <p className="max-w-md text-base leading-relaxed text-white/80">
            Hangoljuk össze az elkészítést. A módszer és a mennyiség beállítása után végigvezetlek majd a
            főzésen, lépésről lépésre.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap items-center gap-3 text-sm text-white/70">
          <span className="rounded-full border border-white/25 px-4 py-1 uppercase tracking-[0.3em]">1. lépés</span>
          <span className="rounded-full border border-white/10 px-4 py-1">Előkészítés</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 bg-white/92 px-10 py-8 text-slate-900 backdrop-blur">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-black/5 bg-white/90 p-6 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">Módszer</div>
            <div className="mt-3 text-2xl font-semibold text-slate-900">{formatMethod(methodId)}</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Hamarosan itt listázzuk a különböző elkészítési módokat, részletes ajánlásokkal.
            </p>
          </div>
          <div className="rounded-3xl border border-black/5 bg-white/90 p-6 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">Mennyiség</div>
            <div className="mt-3 text-2xl font-semibold text-slate-900">{formatVolume(volumeMl)}</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Az arányokat automatikusan számoljuk majd a választott térfogat alapján – könnyű lesz követni.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-dashed border-black/10 bg-white/70 p-6 text-sm leading-relaxed text-slate-600">
          <div className="font-semibold text-slate-700">Felszerelés előkészítése</div>
          <p className="mt-2">
            Megmutatjuk, milyen eszközökre lesz szükség, és mikor érdemes előkészíteni őket. Minden lépés előtt kapsz majd
            jelzést.
          </p>
        </div>

        {showControls ? (
          <div className="mt-auto flex flex-col gap-3 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>Ez egy előnézet – hamarosan interaktív beállításokkal.</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onBack}
                className="rounded-full border border-slate-300 px-5 py-2 font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                Vissza
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={!methodId}
                className="rounded-full bg-slate-900 px-6 py-2 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Folytatás
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function Setup({ tea, value, onChange, onNext, onBack }: SetupProps) {
  void onChange;
  return (
    <div
      className="h-full w-full"
      style={{ marginTop: `${-TARGET_LIFT}px` }}
    >
      <SetupJourneyTop
        tea={tea}
        methodId={value.methodId}
        volumeMl={value.volumeMl}
        showControls
        onBack={onBack}
        onNext={onNext}
      />
    </div>
  );
}