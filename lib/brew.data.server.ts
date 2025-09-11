import type { BrewTeaProfiles, EquipmentGuide, BrewProfile } from "../types/brew";
import brewAll from "../data/brew_profiles.json";
import equipmentGuide from "../data/equipment_guide.json";

// Ezt a modult csak szerver-komponensek vagy API-route-ok importálják!
export const BREW_PROFILES = brewAll as BrewTeaProfiles[];
export const EQUIPMENT_GUIDE = equipmentGuide as EquipmentGuide[];

export function listTeaSlugs(): string[] {
  return BREW_PROFILES.map(b => b.tea_slug);
}
export function getTeaBrew(teaSlug: string): BrewTeaProfiles | undefined {
  return BREW_PROFILES.find(b => b.tea_slug === teaSlug);
}
export function getProfile(teaSlug: string, profileId: BrewProfile["profile_id"]) {
  return getTeaBrew(teaSlug)?.profiles.find(p => p.profile_id === profileId);
}
export function getEquipmentHowto(code: string) {
  return EQUIPMENT_GUIDE.find(e => e.code === code);
}