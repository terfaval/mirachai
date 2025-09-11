import { BREW_PROFILES, getProfile, getEquipmentHowto } from "../../../lib/brew.data.server";
import { gramsForVolume, approxTspFromGrams, coldbrewSecondsRange } from "../../../lib/brew.math";
import { scaleDoseText } from "../../../lib/brew.finishing";

export default function Page() {
  const tea = BREW_PROFILES[0];
  const profile = getProfile(tea.tea_slug, tea.profiles[0].profile_id)!;
  const volumeMl = 250;

  const grams = gramsForVolume(profile.ratio_g_per_100ml, volumeMl, profile.rounding_g ?? 0.1);
  const tsp = approxTspFromGrams(grams, tea.grams_per_tsp.measured ?? tea.grams_per_tsp.estimated);
  const timer =
    (profile as any).time_s ??
    (profile as any).multi_infusions?.[0] ??
    (coldbrewSecondsRange((profile as any).time_h ?? "")?.[0] ?? null);

  const eq = profile.equipment?.[0]?.code
    ? getEquipmentHowto(profile.equipment[0].code)
    : null;

  return (
    <main style={{padding:24, fontFamily:"system-ui"}}>
      <h1>Brew Playground</h1>
      <p><b>Tea:</b> {tea.tea_name} — <b>Profil:</b> {profile.label}</p>
      <p><b>Térfogat:</b> {volumeMl} ml</p>
      <p><b>Arány:</b> {profile.ratio_g_per_100ml} g / 100 ml</p>
      <p><b>Tea mennyiség:</b> {grams.toFixed(1)} g {tsp ? `(~${tsp} tk)` : ""}</p>
      <p><b>Hőfok:</b> {profile.water_temp_c} °C</p>
      <p><b>Timer induló:</b> {timer ? `${Math.round(timer)} mp` : "—"}</p>

      <h3>Ízesítés (skálázva)</h3>
      <ul>
        {(profile.flavor_suggestions ?? []).map((f, i) => (
          <li key={i}>{f.hint}: {scaleDoseText(f.dose, volumeMl)} {f.when ? `— ${f.when}` : ""}</li>
        ))}
      </ul>

      {eq && (
        <>
          <h3>Eszköz: {eq.name}</h3>
          <p>{eq.desc}</p>
          <ol>{eq.steps.slice(0,5).map((s,i)=><li key={i}>{s}</li>)}</ol>
        </>
      )}
    </main>
  );
}