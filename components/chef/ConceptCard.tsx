import { RecipeConcept } from "@/lib/chef/types";

type Props = {
  concept: RecipeConcept;
  onSelect: (concept: RecipeConcept) => void;
};

const PROFILE_LABELS: Record<RecipeConcept["profile"], string> = {
  mediterran: "Mediterrán",
  balkan: "Balkán",
  azsiai: "Ázsiai",
  salata: "Saláta",
};

export function ConceptCard({ concept, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(concept)}
      className="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">{concept.title}</h3>
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-600">
          {PROFILE_LABELS[concept.profile]}
        </span>
      </div>
      <p className="text-sm text-slate-500">{concept.summary}</p>
      <div className="flex flex-wrap gap-2">
        {concept.focus.map((focus) => (
          <span
            key={focus}
            className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
          >
            #{focus}
          </span>
        ))}
      </div>
    </button>
  );
}