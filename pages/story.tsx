import Head from "next/head";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getCategoryColor, getLightColor, getDarkColor } from "../utils/colorMap";
import { getMandalaPath } from "@/utils/mandala";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

type FlavorCard = {
  category: string;
  sub: string;
};
type BrewCard = {
  icon: string;
  title: string;
  oneliner: string;
};

const FLAVOR_MOSAIC: FlavorCard[] = [
  { category: "Álom Kapu", sub: "Esti relax" },
  { category: "Japán Zöld", sub: "Kreatív lendület" },
  { category: "Indiai Chai", sub: "Fűszeres áramlás" },
  { category: "Tiszta Fókusz", sub: "Éber koncentráció" },
];

const BREW_MOSAIC: BrewCard[] = [
  { icon: "/methods/icon_standard_hot.svg", title: "Tiny cup", oneliner: "Egy kortyban derül ki a lényeg." },
  { icon: "/methods/icon_moroccan_mint.svg", title: "Teapot", oneliner: "Megosztható nyugalom, pontos ritmusban." },
  { icon: "/methods/icon_coldbrew.svg", title: "Cold brew", oneliner: "Időben áztatott tisztaság." },
  { icon: "/methods/icon_samovar.svg", title: "Samovar", oneliner: "Meleg testű folyam, lassan hömpölyög." }
];

const COMMUNITY_POINTS = [
  "Értékelés – minden tea után rövid visszajelzést adhatsz.",
  "Saját keverékek – hozzávalókból saját mixet állíthatsz össze.",
  "Közös előnyök – kuponok, limitált kiadások, közös szavazások.",
];

const PARTNERSHIP_ITEMS = [
  {
    title: "Helyi mód",
    body:
      "Az app a helyben elérhető kínálatot mutatja digitális itallap formában. Rövid jelzések segítik a választást, így a vendég magabiztosabban dönt – te pedig csak hagyod, hogy a tea legyen a csali.",
  },
  {
    title: "Közös kollekciók",
    body:
      "Kísérleti tételek, szezonális kiadások és közös dobozok. A történet a készítésnél kezdődik – és közösen nyílik meg a közösség előtt.",
  },
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
          className="story-manifesto relative w-full overflow-hidden py-16 md:py-24"
          data-analytics-id="story_view_manifesto"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #022c22 0%, #064e3b 45%, #166534 100%)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-45"
            style={{
              backgroundImage: "url(/teacard_background/Mandala.svg)",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "260%",
              mixBlendMode: "soft-light",
              filter: "saturate(0.85)",
            }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="whitespace-pre-line text-lg md:text-xl leading-relaxed text-emerald-50/95"
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
            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 items-start">
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
                  className="grid grid-cols-2 gap-3 sm:grid-cols-2"
                >
                  {FLAVOR_MOSAIC.map((f, i) => {
                    const base = getCategoryColor(f.category); // 'main'
                    const light = getLightColor(f.category);   // 'light'
                    const dark  = getDarkColor(f.category);    // 'dark'
                    const mandala = getMandalaPath(f.category);
                    const gradient = `linear-gradient(135deg, ${light ?? "#f8fafc"} 0%, ${base} 100%)`;
                    return (
                      <figure
                        key={f.category + i}
                        className="relative overflow-hidden rounded-2xl p-4 shadow-lg ring-1 ring-black/10 transition-transform duration-300 hover:-translate-y-1"
                        style={{
                          background: gradient,
                        }}
                      >
                        <div
                          className="pointer-events-none absolute inset-0 opacity-55"
                          style={{
                            backgroundImage: `url(${mandala})`,
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "240%",
                            backgroundPosition: "center",
                            mixBlendMode: "soft-light",
                            filter: "saturate(0.8)",
                          }}
                          aria-hidden
                        />
                        <div className="relative">
                          <div
                            className="font-['Titan One'] text-base tracking-tight text-neutral-900"
                            style={{ color: dark }}
                          >
                            {f.category}
                          </div>
                          <div className="mt-1 font-sans text-xs text-neutral-900/80">
                            {f.sub}
                          </div>
                        </div>
                      </figure>
                    );
                  })}
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
                      className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 transition-transform duration-300 hover:-translate-y-1 hover:border-neutral-700"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/5">
                          <Image
                            src={b.icon}
                            alt=""
                            width={48}
                            height={48}
                            className="h-12 w-12 object-contain filter brightness-0 invert"
                          />
                        </div>
                        <div className="flex flex-col">
                          <div className="font-['Titan One'] text-lg text-neutral-50">
                            {b.title}
                          </div>
                          <div className="mt-1 text-sm text-neutral-300">
                            {b.oneliner}
                          </div>
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
            <div className="mt-6 space-y-10">
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
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {COMMUNITY_POINTS.map((point, i) => {
                  const [rawTitle, ...rest] = point.split("–");
                  const title = rawTitle.trim();
                  const detail = rest.join("–").trim();
                  return (
                    <li
                      key={i}
                      className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4"
                    >
                      <div className="font-['Titan One'] text-base text-neutral-100">
                        {title}
                      </div>
                      {detail ? (
                        <p className="mt-2 text-sm text-neutral-300">{detail}</p>
                      ) : null}
                    </li>
                  );
                })}
              </motion.ul>
            </div>
          </div>
        </section>

        {/* PARTNERSÉG — Finom hidak (kettős grid) */}
        <section className="story-partnership relative w-full bg-neutral-950 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-2xl md:text-4xl font-semibold"
            >
              Partnerség
            </motion.h2>
            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
              {PARTNERSHIP_ITEMS.map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6"
                >
                  <h3 className="font-['Titan One'] text-xl text-neutral-100">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-300">
                    {item.body}
                  </p>
                </motion.div>
              ))}
            </div>
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
