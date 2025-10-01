import Head from "next/head";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/**
 * Mirachai Story Page – scroll narrative
 * - Full-width, stage-by-stage storytelling
 * - Uses Tailwind for layout/typography
 * - Minimal framer-motion for subtle entrances
 *
 * Assets you’ll need to point to:
 *  - /public/bg/desktop_background_opening.jpg  (a nyitó varid)
 *  - /public/bg/desktop_background_morning.jpg  (példa további háttér)
 *  - /public/ui/mirachai_logo.svg
 *  - opcionálisan 3 kis illusztráció ikon: /public/ui/ico_app.svg, /public/ui/ico_house.svg, /public/ui/ico_product.svg
 */

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function StoryPage() {
  return (
    <>
      <Head>
        <title>Mirachai • Story</title>
        <meta name="description" content="Mirachai – Tea-kultúra új dimenzióban" />
      </Head>

      <main className="min-h-screen w-full bg-neutral-950 text-neutral-100">
        {/* HERO / OPENING – mágikus szoba egy asztallal + logo + tagline */}
        <section className="relative w-full min-h-[92svh] overflow-hidden">
          <Image
            src="/story/background_opening.png"
            alt="Mirachai opening background"
            fill
            priority
            className="object-cover object-center opacity-98"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          <div className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-20 flex flex-col items-center text-center">
            <Image
              src="/mirachai_logo.svg"
              alt="Mirachai"
              width={200}
              height={200}
              className="mb-6 opacity-95"
            />
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-20%" }}
              className="text-4xl md:text-6xl font-semibold tracking-tight"
            >
              Tea-kultúra új dimenzióban
            </motion.h1>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-20%" }}
              className="mt-4 max-w-3xl text-base md:text-lg text-neutral-200/90"
            >
              Nem csak app. Nem csak teaház. Nem csak termék. Egy világ, ahová belépsz.
            </motion.p>
          </div>
        </section>

        {/* WHAT IS MIRACHAI – 3 pillér, röviden */}
        <section className="relative w-full py-20 md:py-28 bg-neutral-900">
          <div className="mx-auto max-w-6xl px-6">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-2xl md:text-4xl font-semibold"
            >
              Mi a Mirachai?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="mt-3 text-neutral-300 max-w-3xl"
            >
              Ökoszisztéma a tea köré: digitális tudás, közösségi élmény és fizikai tér –
              egymást erősítve, mirachaios hangulattal.
            </motion.p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Digitális réteg",
                  desc: "Interaktív tudásbázis, felfedező élmény, brewing guide.",
                  icon: "/ui/ico_app.svg",
                },
                {
                  title: "Fizikai réteg",
                  desc: "Saját teaház: találkozóhely, élmény, közösség.",
                  icon: "/ui/ico_house.svg",
                },
                {
                  title: "Termék réteg",
                  desc: "Signature teák, kiegészítők, később DIY és szezonális sorozatok.",
                  icon: "/ui/ico_product.svg",
                },
              ].map((c, i) => (
                <motion.div
                  key={c.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i }}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 backdrop-blur-sm"
                >
                  {c.icon ? (
                    <Image
                      src={c.icon}
                      alt=""
                      width={36}
                      height={36}
                      className="mb-3 opacity-90"
                    />
                  ) : null}
                  <h3 className="text-lg font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm text-neutral-300">{c.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* WORLD WE BUILD – triptichon (app – teaház – termék) */}
        <section className="relative w-full py-20 md:py-28 bg-neutral-950">
          <div className="mx-auto max-w-6xl px-6">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-2xl md:text-4xl font-semibold"
            >
              A világ, amit építünk
            </motion.h2>
            <p className="mt-3 text-neutral-300 max-w-3xl">
              A digitális, a fizikai és a termék rétegei egymásra hangolva adják a Mirachai élményt.
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  img: "/bg/desktop_background_morning.jpg",
                  label: "App",
                  copy:
                    "Felfedezés, tanulás, vizuális teadoboz – inspiráció és útmutatás.",
                },
                {
                  img: "/bg/desktop_background_evening.jpg",
                  label: "Teaház",
                  copy:
                    "Valós tér, közösségi események, tematikus esték – rituálé és találkozás.",
                },
                {
                  img: "/bg/desktop_background_noon.jpg",
                  label: "Termék",
                  copy:
                    "Signature keverékek és kiegészítők – fokozatosan bevezetve, közösséggel hangolva.",
                },
              ].map((b, i) => (
                <motion.figure
                  key={b.label}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i }}
                  className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={b.img}
                      alt={b.label}
                      fill
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                      <figcaption className="text-lg font-semibold">{b.label}</figcaption>
                      <p className="text-sm text-neutral-300">{b.copy}</p>
                    </div>
                  </div>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>

        {/* ROADMAP – 4 lépcső (egyszerű, őszinte) */}
        <section className="relative w-full py-20 md:py-28 bg-neutral-900">
          <div className="mx-auto max-w-6xl px-6">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-2xl md:text-4xl font-semibold"
            >
              Roadmap
            </motion.h2>
            <ol className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: "1",
                  title: "Közösség & Tudás",
                  copy: "App MVP + tartalom, finom hangulatok és útmutatók.",
                },
                {
                  step: "2",
                  title: "Saját Teaház",
                  copy: "Központi helyszín – márkaélmény és közösség.",
                },
                {
                  step: "3",
                  title: "Klubtagság",
                  copy: "Rendszeres élmény és előnyök a közösségnek.",
                },
                {
                  step: "4",
                  title: "Termék + Crowdfunding",
                  copy: "Signature teák, kiegészítők – közösen indítva.",
                },
              ].map((r, i) => (
                <motion.li
                  key={r.step}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i }}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6"
                >
                  <div className="text-sm text-neutral-400">Lépés {r.step}</div>
                  <div className="mt-1 text-lg font-semibold">{r.title}</div>
                  <p className="mt-2 text-sm text-neutral-300">{r.copy}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* DIFFERENTIATION – miért különleges */}
        <section className="relative w-full py-20 md:py-28 bg-neutral-950">
          <div className="mx-auto max-w-6xl px-6">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-2xl md:text-4xl font-semibold"
            >
              Miért különleges?
            </motion.h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                "Tea mint élményvilág, nem mint piac.",
                "Digitális és fizikai réteg természetes integrációja.",
                "Közösségi híd: kultúra megnyitása, nem kényszeres problémamegoldás.",
              ].map((t, i) => (
                <motion.p
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i }}
                  className="text-sm text-neutral-300 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4"
                >
                  {t}
                </motion.p>
              ))}
            </div>
          </div>
        </section>

        {/* CLOSER – nagy atmoszférikus kép + CTA */}
        <section className="relative w-full min-h-[80svh] overflow-hidden">
          <Image
            src="/bg/desktop_background_evening.jpg"
            alt="Mirachai evening"
            fill
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
              A Mirachai nem csak tea. Egy világ, ahová belépsz.
            </motion.h3>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="mt-4 text-neutral-200/90"
            >
              Csatlakozz a történethez – digitálisan, fizikailag, közösségileg.
            </motion.p>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="mt-8 flex justify-center"
            >
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                Találd meg a teádat
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
