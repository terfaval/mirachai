import { NextRequest } from 'next/server';
import { readBrewProfiles } from '@/lib/data/brew.server'; // vagy ami a teljes listát adja

export async function GET(_req: NextRequest) {
  const profiles = await readBrewProfiles();    // ha nincs ilyen, csinálj egy listázó függvényt
  return Response.json(profiles);
}
