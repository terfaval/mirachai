import { NextRequest } from 'next/server';
import { getBrewMethodsForTea } from '@/lib/data/brew.server';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const brew = await getBrewMethodsForTea(id);
  return Response.json(brew);
}