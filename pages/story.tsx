import Head from "next/head";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

type FlavorCard = {
  category: string;
  sub: string;
  bg?: string; // optional category color class e.g. "from-emerald-500/30 to-emerald-700/40"
};
type BrewCard = {
  icon: string;
  title: string;
  oneliner: string;
};

const FLAVOR_MOSAIC: FlavorCard[] = [
  { category: "Japán Zöld", sub: "Kreatív lendület", bg: "from-emerald-500/25 to-emerald-700/30" },
  { category: "Álom Kapu", sub: "Esti relax", bg: "from-indigo-500/25 to-fuchsia-700/30" },
  { category: "Kínai Klasszikus", sub: "Nyári frissesség", bg: "from-lime-500/25 to-green-700/30" },
  { category: "Fekete Teák", sub: "Reggeli mélység", bg: "from-amber-500/25 to-orange-700/30" },
  { category: "Fehér Teák", sub: "Tiszta nyugalom", bg: "from-sky-400/25 to-blue-700/30" },
  { category: "Gyógyfüvek", sub: "Puha esti meleg", bg: "from-rose-400/25 to-pink-700/30" },
  { category: "Oolong", sub: "Virágos átmenet", bg: "from-violet-400/25 to-purple-700/30" },
  { category: "Puer", sub: "Föld illata", bg: "from-stone-500/25 to-stone-700/30" },
  { category: "Matcha", sub: "Sűrű fókusz", bg: "from-green-500/25 to-emerald-700/30" }
];

const BREW_MOSAIC: BrewCard[] = [
  { icon: "/ui/ico_tinycup.svg", title: "Tiny cup", oneliner: "Egy kortyban derül ki a lényeg." },
  { icon: "/ui/ico_teapot.svg", title: "Teapot", oneliner: "Megosztható nyugalom, pontos ritmusban." },
  { icon: "/ui/ico_coldbrew.svg", title: "Cold brew", oneliner: "Időben áztatott tisztaság." },
  { icon: "/ui/ico_samovar.svg", title: "Samovar", oneliner: "Meleg testű folyam, lassan hömpölyög." }
];

export default function StoryPage() {
  return (
    <>
      <Head>
        <title>Mirachai • Story</title>
        <meta name="description" content="Mirachai – Tea-kultúra új dimenzióban" />
      </Head>

      <main className="min-h-screen w-full bg-neutral-950 text-neutral-100">
        {/* HERO */}
        <section
          className="story-hero relative w-full min-h-[92svh] overflow-hidden"
          data-analytics-id="story_view_hero"
        >
          <Image
            src="/story/background_opening.png"
            alt="Mirachai opening background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-95"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 85%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.78) 100%)",
            }}
          />
          <div className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-20 flex flex-col items-center text-center">
            <Image
              src="/mirachai_logo.svg"
              alt="Mirachai logo"
              width={200}
              height={200}
              className="mb-6 opacity-95 brightness-0 invert"
              priority
            />
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-20%" }}
              className="text-4xl md:text-6xl font-semibold tracking-tight"
            >
              Ahol a gőz mesélni kezd
            </motion.h1>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-20%" }}
              className="mt-4 max-w-3xl text-base md:text-lg text-neutral-200/90 leading-relaxed"
            >
              A Mirachai digitális teadoboz: több mint nyolcvan tea íze, elkészítése és hangulata egy helyen. Nem lexikon – inkább térkép, amely néha máshova vezet, mint tervezted.
            </motion.p>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="mt-8"
            >
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                data-analytics-id="story_click_enter"
              >
                Lépj be
              </Link>
            </motion.div>
          </div>
        </section>

        {/* MANIFESTO */}
        <section
          className="story-manifesto relative w-full py-16 md:py-24 bg-neutral-900"
          data-analytics-id="story_view_manifesto"
        >
          <div className="mx-auto max-w-4xl px-6 text-center">
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="whitespace-pre-line text-lg md:text-xl text-neutral-200/95 leading-relaxed"
            >
{`Nem sietünk.
A víz melegszik, a fény leül mellénk.
A tea néha másképp mesél, mint várnánk.
A Mirachai: térkép egy világba, ami közben változtat rajtad.`}
            </motion.p>
          </div>
        </section>

        {/* APP BEMUTATÁS — Íz & Felfedezés */}
        <section
          className="story-app-intro relative w-full py-20 md:py-28 bg-neutral-950"
          data-analytics-id="story_view_app_intro"
        >
          <div className="mx-auto max-w-6xl px-6">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-2xl md:text-4xl font-semibold"
            >
              Egy digitális teadoboz, ami vezet
            </motion.h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
              {/* Bal: szöveg */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="space-y-4 text-neutral-300"
              >
                <p>
                  A Mirachai app több mint nyolcvan teát mutat be: ízprofil, hatás, intenzitás, hőmérséklet és áztatás jelzi az irányt. Nem lexikon – inkább térkép, amelyben könnyebb rátalálni arra a teára, ami most hozzád szól.
                </p>
                <p>
                  Ha megtaláltad, a főzésben is kapsz segítséget. Több mint tíz különböző módszer közül választhatsz – a gyors csészétől a lassú samovárig. Nem az a cél, hogy hibátlanul kövesd a szabályt, hanem hogy közben észrevedd: minden tea kicsit más történetet mond, mint amire számítottál.
                </p>
              </motion.div>

              {/* Jobb: vizuál – teacard mozaik + brewmethod mozaik */}
              <div className="space-y-8">
                {/* Teacard mozaik */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                >
                  {FLAVOR_MOSAIC.map((f, i) => (
                    <figure
                      key={f.category + i}
                      className="relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60 p-4"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${f.bg ?? "from-neutral-700/20 to-neutral-900/20"}`} />
                      <div className="relative">
                        <div className="text-sm font-medium">{f.category}</div>
                        <div className="text-xs text-neutral-300 mt-1">{f.sub}</div>
                        {/* mandala helye: tehetsz ide egy halvány svg-t háttérbe, ha lesz */}
                      </div>
                    </figure>
                  ))}
                </motion.div>

                {/* Brewmethod mozaik 2x2 */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="grid grid-cols-2 gap-3"
                >
                  {BREW_MOSAIC.map((b) => (
                    <figure
                      key={b.title}
                      className="group overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Image src={b.icon} alt="" width={28} height={28} className="opacity-90" />
                        <div>
                          <div className="text-sm font-medium">{b.title}</div>
                          <div className="text-xs text-neutral-300">{b.oneliner}</div>
                        </div>
                      </div>
                    </figure>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* KÖZÖSSÉGI MODELL — Hogyan lesz közös a tea? */}
        <section
          className="story-community relative w-full py-20 md:py-28 bg-neutral-900"
          data-analytics-id="story_view_community"
        >
          <div className="mx-auto max-w-6xl px-6">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-2xl md:text-4xl font-semibold"
            >
              Közösség, ami kortyokból épül
            </motion.h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="space-y-4 text-neutral-300"
              >
                <p>
                  A Mirachai közösség alapja a teázás élménye. Minden tea után értékelhetsz, kedvencet jelölhetsz, vagy később akár saját keveréket is alkothatsz.
                </p>
                <p>
                  A közös visszajelzések nemcsak a teautadat formálják, hanem hosszabb távon kedvezményekhez, limitált kiadásokhoz és közös döntésekhez is kaput nyitnak. Így a Mirachai nemcsak app, hanem élő, közös tér is.
                </p>
              </motion.div>

              <motion.ul
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {[
                  "Értékelés és kedvencelés – minden tea után rövid visszajelzést adhatsz.",
                  "Saját keverékek – hozzávalókból saját mixet állíthatsz össze.",
                  "Közös előnyök – kuponok, limitált kiadások, közös szavazások."
                ].map((t, i) => (
                  <li key={i} className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 text-sm text-neutral-300">
                    {t}
                  </li>
                ))}
              </motion.ul>
            </div>
          </div>
        </section>

        {/* PARTNERSÉG — Finom hidak (tabs) */}
        <section className="story-partnership relative w-full py-20 md:py-28 bg-neutral-950">
          <div className="mx-auto max-w-6xl px-6">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-2xl md:text-4xl font-semibold"
            >
              Finom hidak
            </motion.h2>

            <Tabs
              tabs={[
                {
                  id: "local",
                  label: "Helyi mód",
                  content: (
                    <p className="text-neutral-300">
                      Az app a helyben elérhető kínálatot mutatja digitális itallap formában. Rövid jelzések segítik a választást, így a vendég magabiztosabban dönt – te pedig csak hagyod, hogy a tea legyen a csali.
                    </p>
                  ),
                },
                {
                  id: "collections",
                  label: "Közös kollekciók",
                  content: (
                    <p className="text-neutral-300">
                      Kísérleti tételek, szezonális kiadások és közös dobozok. A történet a készítésnél kezdődik – és közösen nyílik meg a közösség előtt.
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </section>

        {/* ZÁRÁS */}
        <section className="story-closing relative w-full min-h-[80svh] overflow-hidden">
          <Image
            src="/bg/desktop_background_evening.jpg"
            alt="Mirachai evening background"
            fill
            sizes="100vw"
            className="object-cover object-center opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
          <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 text-center">
            <motion.h3
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-semibold"
            >
              Ahol a tea gondolkodik helyetted
            </motion.h3>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="mt-8 flex justify-center"
            >
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                data-analytics-id="story_click_footer_enter"
              >
                Lépj be
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}

/** ---------- Segéd: Tabs komponens ---------- */
function Tabs({
  tabs,
}: {
  tabs: { id: string; label: string; content: ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  const handleTabClick = (id: string) => {
    setActive(id);
    if (typeof window !== "undefined") {
      const eventName = `story_toggle_partner_tab:${id}`;
      window.dispatchEvent(new CustomEvent(eventName));
    }
  };

  return (
    <div className="mt-6" data-analytics-id={`story_toggle_partner_tab:${active}`}>
      <div className="flex gap-2 border-b border-neutral-800" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => handleTabClick(t.id)}
            className={`px-4 py-2 text-sm rounded-t-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${
              active === t.id
                ? "bg-neutral-900 text-neutral-100 border border-neutral-800 border-b-transparent"
                : "text-neutral-300 hover:text-neutral-100"
            }`}
            aria-pressed={active === t.id}
            aria-selected={active === t.id}
            aria-controls={`tab-${t.id}`}
            id={`tab-button-${t.id}`}
            role="tab"
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        className="border border-neutral-800 border-t-0 rounded-b-lg p-6 bg-neutral-900/60"
        id={`tab-${active}`}
        role="tabpanel"
        aria-labelledby={`tab-button-${active}`}
      >
        {tabs.find((t) => t.id === active)?.content}
      </div>
    </div>
  );
}