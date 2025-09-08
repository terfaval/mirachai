import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Filters } from "./types";

type Facets = ReturnType<typeof import("./collectFacets")["collectFacets"]>;
type Props = {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  setFilters: (updater: (prev: Filters) => Filters) => void;
  facets: Facets;
  subcatOptions: string[];
};

const toggleFromArray = (arr: string[], val: string) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

export default function FilterPanel({ open, onClose, filters, setFilters, facets, subcatOptions }: Props) {
  const reset = () => setFilters(() => ({
    category: undefined, subcategory: undefined, tastes: [], focus: [],
    serve: { hot: false, lukewarm: false, iced: false, coldbrew: false },
    allergens_exclude: [], intensity: [], colors: [],
    caffeineRange: [0, 100], tempCRange: [facets.ranges.tempC[0], facets.ranges.tempC[1]],
    steepRange: [facets.ranges.steepMin[0], facets.ranges.steepMin[1]],
    ingredients: []
  }));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/30 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            className="fixed right-0 top-0 h-screen bg-white z-50 shadow-2xl border-l w-full sm:w-2/3 lg:w-[40vw]"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            aria-label="Szűrőpanel"
          >
            <div className="h-full flex flex-col">
              <div className="p-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  <h3 className="font-semibold">Szűrők</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={reset} title="Szűrők visszaállítása">
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onClose} title="Bezárás (Esc)">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                  {/* Category */}
                  <section>
                    <h4 className="font-medium mb-3">Kategória</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Főkategória</Label>
                        <Select value={filters.category ?? ""} onValueChange={(v: string) => setFilters(s => ({ ...s, category: v || undefined, subcategory: undefined }))}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Válassz…" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">(mind)</SelectItem>
                            {facets.categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Alkategória</Label>
                        <Select value={filters.subcategory ?? ""} onValueChange={(v: string) => setFilters(s => ({ ...s, subcategory: v || undefined }))}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Válassz…" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">(mind)</SelectItem>
                            {subcatOptions.map(sc => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  {/* Tastes */}
                  <section>
                    <h4 className="font-medium mb-3">Ízprofil</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {facets.tasteKeys.map(t => (
                        <label key={t} className="flex items-center gap-2 rounded-xl border p-2 hover:bg-muted cursor-pointer">
                          <Checkbox checked={filters.tastes.includes(t)} onCheckedChange={(val: boolean) => setFilters(s => ({ ...s, tastes: val ? [...s.tastes, t] : s.tastes.filter(x => x !== t) }))} />
                          <span className="text-sm capitalize">{t}</span>
                        </label>
                      ))}
                    </div>
                  </section>

                  {/* Focus */}
                  <section>
                    <h4 className="font-medium mb-3">Hatás</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {facets.focusKeys.map(t => (
                        <label key={t} className="flex items-center gap-2 rounded-xl border p-2 hover:bg-muted cursor-pointer">
                          <Checkbox checked={filters.focus.includes(t)} onCheckedChange={(val: boolean) => setFilters(s => ({ ...s, focus: val ? [...s.focus, t] : s.focus.filter(x => x !== t) }))} />
                          <span className="text-sm capitalize">{t}</span>
                        </label>
                      ))}
                    </div>
                  </section>

                  <Separator />

                  {/* Serve */}
                  <section>
                    <h4 className="font-medium mb-3">Tálalás</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {([ ["forró", "hot"], ["langyos", "lukewarm"], ["jeges", "iced"], ["cold brew", "coldbrew"] ] as const).map(([label, key]) => (
                        <label key={key} className="flex items-center gap-2 rounded-xl border p-2 hover:bg-muted cursor-pointer">
                          <Checkbox checked={(filters.serve as any)[key]} onCheckedChange={(val: boolean) => setFilters(s => ({ ...s, serve: { ...s.serve, [key]: !!val } as any }))} />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                  </section>

                  <Separator />

                  {/* Allergens exclude */}
                  <section>
                    <h4 className="font-medium mb-3">Allergének (kizárás)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {facets.allergens.map(a => (
                        <label key={a} className="flex items-center gap-2 rounded-xl border p-2 hover:bg-muted cursor-pointer">
                          <Checkbox checked={filters.allergens_exclude.includes(a)} onCheckedChange={(val: boolean) => setFilters(s => ({ ...s, allergens_exclude: val ? [...s.allergens_exclude, a] : s.allergens_exclude.filter(x => x !== a) }))} />
                          <span className="text-sm capitalize">{a}</span>
                        </label>
                      ))}
                    </div>
                  </section>

                  <Separator />

                  {/* Intensity & Colors */}
                  <section>
                    <h4 className="font-medium mb-3">Intenzitás & Szín</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label className="text-xs">Intenzitás</Label>
                        <div className="flex flex-wrap gap-2">
                          {facets.intensities.map(i => (
                            <Badge key={i} variant={filters.intensity.includes(i) ? "default" : "outline"} className="cursor-pointer" onClick={() => setFilters(s => ({ ...s, intensity: toggleFromArray(s.intensity, i) }))}>{i}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Szín</Label>
                        <div className="flex flex-wrap gap-2">
                          {facets.colors.map(c => (
                            <Badge key={c} variant={filters.colors.includes(c) ? "default" : "outline"} className="cursor-pointer" onClick={() => setFilters(s => ({ ...s, colors: toggleFromArray(s.colors, c) }))}>{c}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  {/* Ranges – sliders: use your Slider component in outer page (or keep here if available) */}
                  <p className="text-sm text-muted-foreground">Koffein/°C/Áztatás csúszkák a fő komponensben (vagy itt), a query builder támogatja.</p>

                  <Separator />

                  {/* Ingredients (multi) */}
                  <section>
                    <h4 className="font-medium mb-3">Hozzávalók</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-2">
                      {facets.ingredientKeys.map(ing => (
                        <label key={ing} className="flex items-center gap-2 rounded-xl border p-2 hover:bg-muted cursor-pointer">
                          <Checkbox checked={filters.ingredients.includes(ing)} onCheckedChange={(val: boolean) => setFilters(s => ({ ...s, ingredients: val ? [...s.ingredients, ing] : s.ingredients.filter(x => x !== ing) }))} />
                          <span className="text-sm">{ing}</span>
                        </label>
                      ))}
                    </div>
                  </section>
                </div>
              </ScrollArea>

              <div className="p-4 border-t flex items-center gap-2 justify-end">
                <Button variant="ghost" onClick={reset}>Alaphelyzet</Button>
                <Button onClick={onClose}>Alkalmazás</Button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}