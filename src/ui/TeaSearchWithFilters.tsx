"use client";

import React, { useMemo, useState } from "react";
import { Filter } from "lucide-react";
// import { motion } from "framer-motion"; // ha nem használod, hagyd kikommentelve

import { Input } from "./input";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Badge } from "./badge";
import { Slider } from "./slider";

import { buildIndex, search } from "../search/engine";
import FilterPanel from "./filters/FilterPanel";
import { collectFacets } from "./filters/collectFacets";
import { buildQueryFromFilters } from "./filters/buildQueryFromFilters";
import { DEFAULT_FILTERS, Filters, Tea } from "./filters/types";

export default function TeaSearchWithFilters({ teas }: { teas: Tea[] }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [open, setOpen] = useState(false);

  const facets = useMemo(() => collectFacets(teas), [teas]);
  const subcatOptions = useMemo(() => {
    if (!filters.category) return Array.from(new Set(Object.values(facets.subcatsByCat).flat()));
    return facets.subcatsByCat[filters.category] ?? [];
  }, [facets, filters.category]);

  React.useEffect(() => {
    setFilters(s => ({
      ...s,
      tempCRange: facets.ranges.tempC,
      steepRange: facets.ranges.steepMin
    }));
  }, [facets.ranges.tempC[0], facets.ranges.tempC[1]]); // eslint-disable-line

  const idx = useMemo(() => buildIndex(teas as any), [teas]);
  const qstr = useMemo(() => buildQueryFromFilters(query, filters), [query, filters]);
  const results = useMemo(() => search(idx as any, qstr, { fuzzy: true }), [idx, qstr]);

  return (
    <div className="w-full h-full relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <Input placeholder='Keress… (pl. "jeges friss chai", vagy: caffeine:<20 taste:virágos)'
                 value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} />
        </div>
        <Button variant="secondary" onClick={() => setOpen(true)} className="gap-2">
          <Filter className="w-4 h-4" /> Szűrők
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1"><span>Koffein (%)</span><span>{filters.caffeineRange[0]}–{filters.caffeineRange[1]}</span></div>
          <Slider min={facets.ranges.caffeine[0]} max={facets.ranges.caffeine[1]} step={5} value={[...filters.caffeineRange]} onValueChange={(v: number[]) => setFilters(s => ({ ...s, caffeineRange: v as [number, number] }))} />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1"><span>Hőfok (°C)</span><span>{filters.tempCRange[0]}–{filters.tempCRange[1]}</span></div>
          <Slider min={facets.ranges.tempC[0]} max={facets.ranges.tempC[1]} step={1} value={[...filters.tempCRange]} onValueChange={(v: number[]) => setFilters(s => ({ ...s, tempCRange: v as [number, number] }))} />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1"><span>Áztatás (perc)</span><span>{filters.steepRange[0]}–{filters.steepRange[1]}</span></div>
          <Slider min={facets.ranges.steepMin[0]} max={facets.ranges.steepMin[1]} step={1} value={[...filters.steepRange]} onValueChange={(v: number[]) => setFilters(s => ({ ...s, steepRange: v as [number, number] }))} />
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-3">{results.length} találat — <Badge variant="outline">{qstr || "—"}</Badge></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {results.map((r: any) => (
          <Card key={r.id} className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg leading-tight">{r.name}</CardTitle>
              <div className="text-xs text-muted-foreground">{r.category} • {r.subcategory}</div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{r.snippet}</p>
              <div className="flex flex-wrap gap-1">
                {typeof r.caffeine_pct === "number" && <Badge variant="outline">koffein: {r.caffeine_pct}%</Badge>}
                {r.score != null && <Badge variant="secondary">score {r.score}</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <FilterPanel
        open={open}
        onClose={() => setOpen(false)}
        filters={filters}
        setFilters={(u) => setFilters(prev => u(prev))}
        facets={facets as any}
        subcatOptions={subcatOptions}
      />
    </div>
  );
}