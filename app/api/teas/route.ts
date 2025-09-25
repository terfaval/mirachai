import { readTeas } from '@/lib/data/teas.server';

export async function GET() {
  const teas = await readTeas();
  return Response.json(teas);
}