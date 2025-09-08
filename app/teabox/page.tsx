import React from "react";
import TeaSearchWithFilters from "../../src/ui/TeaSearchWithFilters";
import teas from "../../data/teas.json";

export default function Page() {
  return <div className="p-6"><TeaSearchWithFilters teas={teas as any} /></div>;
}