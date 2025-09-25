// app/api/teas/[id]/brew/route.ts
import { NextRequest } from 'next/server';
import { getBrewMethodsForTea } from '@/lib/data/brew.server';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }   // <-- Promise!
) {
  const { id } = await context.params;           // <-- await
  const brew = await getBrewMethodsForTea(id);
  return Response.json(brew);
}
