import { listTeas, getProfiles, calcGrams, gramsToTsp, getEquipmentHowTo } from "@/brewing";
import { coldbrewSecondsRange } from "@/lib/brew.math";
import { scaleDoseText } from "@/lib/brew.finishing";

export default async function Page() {
  const teas = await listTeas();
  const first = teas[0];
  if (!first) {
    return <main className="p-6 font-sans">No teas available</main>;
  }
  const profiles = await getProfiles(first.slug);
  const profile = profiles[0];
  if (!profile) {
    return <main className="p-6 font-sans">No profile found</main>;
  }
  const volumeMl = 250;
  const grams = calcGrams(profile.ratio_g_per_100ml, volumeMl, profile.rounding_g ?? 0.1);
  const tsp = gramsToTsp(grams, profile.spoon_equiv?.teaspoon_g ?? undefined);
  const timer =
    profile.time_s ??
    profile.multi_infusions?.[0] ??
    (profile.time_h ? coldbrewSecondsRange(profile.time_h)?.[0] ?? null : null);
  const eqCode = profile.equipment?.[0]?.code;
  const eq = eqCode ? await getEquipmentHowTo(eqCode) : null;

  return (
    <main className="p-6 font-sans">
      <h1>Brew Playground</h1>
      <p>
        <b>Tea:</b> <span className="font-display">{first.name}</span> — <b>Profil:</b> {profile.label}
      </p>
      <p>
        <b>Térfogat:</b> {volumeMl} ml
      </p>
      <p>
        <b>Arány:</b> {profile.ratio_g_per_100ml} g / 100 ml
      </p>
      <p>
        <b>Tea mennyiség:</b> {grams.toFixed(1)} g {tsp ? `(~${tsp} tk)` : ""}
      </p>
      <p>
        <b>Hőfok:</b> {profile.water_temp_c} °C
      </p>
      <p>
        <b>Timer induló:</b> {timer ? `${Math.round(timer)} mp` : "—"}
      </p>
      <h3>Ízesítés (skálázva)</h3>
      <ul>
        {(profile.flavor_suggestions ?? []).map((f, i) => (
          <li key={i}>
            {f.hint}: {f.dose ? scaleDoseText(f.dose, volumeMl) : ""} {f.when ? `— ${f.when}` : ""}
          </li>
        ))}
      </ul>
      {eq && (
        <>
          <h3>Eszköz: {eq.name}</h3>
          {eq.desc && <p>{eq.desc}</p>}
          <ol>
            {eq.steps.slice(0, 5).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </>
      )}
    </main>
  );
}