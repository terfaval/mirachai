import styles from '../styles/TeaModal.module.css';
import { Tea } from '../utils/filter';
import { getCategoryColor } from '../utils/colorMap';
import { getMandalaPath } from '../utils/mandala';


interface Props {
  tea: Tea;
  onClose: () => void;
}

// típus a hozzávalókhoz – ETTŐL múlik a “never” hibák megszűnése
type IngredientItem = { name: string; rate: number };

function buildIngredients(tea: Tea): IngredientItem[] {
  const items: IngredientItem[] = [];
  for (let i = 1; i <= 6; i++) {
    const name = (tea as any)[`ingerdient-${i}`];
    const rateRaw = (tea as any)[`rate-${i}`];
    const rate = Number(rateRaw ?? 0);
    if (name && rate > 0) items.push({ name: String(name), rate });
  }
  if (!items.length) return items;
  const sum = items.reduce((s, it) => s + it.rate, 0) || 1;
  // 100%-ra normalizálás, kerekítve
  const norm = items.map((it) => ({ ...it, rate: Math.round((it.rate / sum) * 100) }));
  // kis kerekítési hiba korrekció (összeg 100 maradjon)
  const diff = 100 - norm.reduce((s, it) => s + it.rate, 0);
  if (diff !== 0) norm[0].rate += diff;
  return norm;
}

function buildTaste(tea: Tea): Record<string, 1 | 2 | 3> {
  const out: Record<string, 1 | 2 | 3> = {} as any;
  Object.keys(tea as any).forEach((k) => {
    if (/^taste[_-]?/i.test(k)) {
      const label = k.replace(/^taste[_-]?/i, '') || 'taste';
      const v = Number((tea as any)[k]);
      if (v === 1 || v === 2 || v === 3) (out as any)[label] = v;
    }
  });
  return out;
}

// determinisztikus szín hozzávaló névből (amíg nincs külön növény-színtérkép)
function ingredientColor(name: string, fallback: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue}, 55%, 55%)` || fallback;
}

export default function TeaModal({ tea, onClose }: Props) {
  const color = getCategoryColor(tea.category);
  const light = getCategoryColor(tea.category, 'light');

  const ingredients = buildIngredients(tea);
  const taste = buildTaste(tea);
  const intensity = Number((tea as any).intensity || 0) as 0 | 1 | 2 | 3;

  const serve = {
    hot: !!(tea as any).serve_hot,
    lukewarm: !!(tea as any).serve_lukewarm,
    iced: !!(tea as any).serve_iced,
    coldbrew: !!(tea as any).serve_coldbrew,
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.panel}
        style={{ backgroundColor: color }}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={getMandalaPath(tea.category)} alt="" className={styles.mandala} />

        <button className={styles.close} onClick={onClose} aria-label="Bezárás">
          ×
        </button>

        <div
          className={styles.content}
          style={{ background: `linear-gradient(to bottom, ${light}, #fff)` }}
        >
          {/* NÉV – Titan One, lowercase, középre */}
          <h2 className={styles.title}>{tea.name}</h2>

          {/* CATEGORY / SUBCATEGORY “pill”-ek */}
          <div className={styles.pillsRow}>
            <span
              className={styles.categoryPill}
              style={{ backgroundColor: color }}
              aria-label="kategória"
            >
              {tea.category}
            </span>
            {tea.subcategory && (
              <span className={styles.subcategoryPill} aria-label="alkategória">
                {tea.subcategory}
              </span>
            )}
          </div>

          {/* MINI STÁTUSZOK: TASTE + INTENSITY (egyszerű, stabil) */}
          {(Object.keys(taste).length > 0 || intensity > 0) && (
            <div className={styles.statusPanel}>
              {/* Taste – “dot” skálák 1–3 */}
              {Object.keys(taste).length > 0 && (
                <div className={styles.card}>
                  <div className={styles.cardTitle}>ízjegyek</div>
                  <div className={styles.tasteList}>
                    {Object.entries(taste).map(([k, v]) => (
                      <div className={styles.tasteRow} key={k}>
                        <span className={styles.tasteLabel}>{k}</span>
                        <span className={styles.dots} aria-label={`${k}: ${v} / 3`}>
                          {Array.from({ length: 3 }).map((_, i) => (
                            <span
                              key={`taste-dot-${k}-${i}`}
                              className={i < v ? styles.dotOn : styles.dotOff}
                              aria-hidden
                            />
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Intensity – 1–3 skála */}
              {intensity > 0 && (
                <div className={styles.card}>
                  <div className={styles.cardTitle}>erősség</div>
                  <div className={styles.intensityDots}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <span
                        key={`intensity-dot-${i}`}
                        className={i < intensity ? styles.dotOnBig : styles.dotOffBig}
                        aria-hidden
                      />
                    ))}
                    <span className={styles.intensityText}>{intensity} / 3</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LEÍRÁS */}
          {tea.description && <p className={styles.description}>{tea.description}</p>}

          {/* KÉT HASÁB: hozzávalók | paraméterek */}
          <div className={styles.twoCol}>
            {/* HOZZÁVALÓK PROGRESS SÁVOKKAL */}
            {ingredients.length > 0 && (
              <div className={styles.leftCol}>
                <h3 className={styles.sectionTitle}>összetevők</h3>
                <ul className={styles.ingList}>
                  {ingredients.map((ing) => {
  const fill = ingredientColor(ing.name, '#cfcfcf');
  return (
    <li className={styles.ingItem} key={ing.name}>
      <div className={styles.ingTop}>
        <span className={styles.ingName}>{ing.name}</span>
        <span className={styles.ingPct}>{ing.rate}%</span>
      </div>
      <div className={styles.barWrap} aria-label={`${ing.name} ${ing.rate}%`}>
        <div
          className={styles.barFill}
          style={{ width: `${ing.rate}%`, backgroundColor: fill }}
        />
      </div>
    </li>
  );
})}

                </ul>
              </div>
            )}

            {/* JOBB: TEA SZÍN + HŐFOK + IDŐ + SERVE MÓDOK (egyszerű megjelenítés) */}
            <div className={styles.rightCol}>
              {(tea as any).color && (
                <div className={styles.cupWrap} aria-label="tea színe">
                  <div
                    className={styles.cup}
                    style={{ backgroundColor: String((tea as any).color) }}
                  />
                  <div className={styles.cupLabel}>tea színe</div>
                </div>
              )}

              <div className={styles.progressCol}>
                {(tea as any).tempC && (
                  <div className={styles.progressRow}>
                    <span className={styles.progressLabel}>hőmérséklet</span>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${Math.min(100, Number((tea as any).tempC))}%` }}
                      />
                    </div>
                    <span className={styles.progressEnd}>
                      {Number((tea as any).tempC)}°C
                    </span>
                  </div>
                )}
                {(tea as any).steepMin && (
                  <div className={styles.progressRow}>
                    <span className={styles.progressLabel}>áztatási idő</span>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${
                            Math.min(
                              100,
                              typeof (tea as any).steepMin === 'string'
                                ? Number(String((tea as any).steepMin).split(/[^\d]/).filter(Boolean)[0]) * 10
                                : Number((tea as any).steepMin) * 10
                            )
                          }%`,
                        }}
                      />
                    </div>
                    <span className={styles.progressEnd}>
                      {typeof (tea as any).steepMin === 'string'
                        ? String((tea as any).steepMin)
                        : `${Number((tea as any).steepMin)} perc`}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.serveRow}>
                {serve.hot && <span className={styles.serveTag}>🔥 forrón</span>}
                {serve.lukewarm && <span className={styles.serveTag}>🌤️ langyosan</span>}
                {serve.iced && <span className={styles.serveTag}>❄️ jegesen</span>}
                {serve.coldbrew && <span className={styles.serveTag}>🧊 coldbrew</span>}
              </div>
            </div>
          </div>

          {/* mood_short + tag-ek (opcionális, alul) */}
          <div className={styles.footerMeta}>
            {tea.mood_short && <div className={styles.mood}>{tea.mood_short}</div>}
            <div className={styles.tags}>
              {(['tag-1', 'tag-2', 'tag-3'] as const)
                .map((k) => (tea as any)[k])
                .filter(Boolean)
                .map((t: any) => (
                  <span className={styles.tag} key={t}>
                    {t}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
