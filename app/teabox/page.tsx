import React from "react";
import TeaSearchWithFilters from "../../src/ui/TeaSearchWithFilters";
import rawTeas from "../../data/teas.json";
import { toStringArray } from "../../lib/toStringArray";

const teas = (rawTeas as any[]).map((t) => ({
  ...t,
  season_recommended: toStringArray(t.season_recommended),
  daypart_recommended: toStringArray(t.daypart_recommended),
}));

export default function Page() {
  return <div className="p-6"><TeaSearchWithFilters teas={teas as any} /></div>;
}