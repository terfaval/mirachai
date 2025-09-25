// app/api/brew-profiles/route.ts
import { NextRequest } from 'next/server';
import { getBrewMethodsForTea } from '@/lib/data/brew.server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') ?? searchParams.get('teaId');

  if (!id) {
    return Response.json(
      { error: 'Missing required "id" query parameter.' },
      { status: 400 },
    );
  }

  const brew = await getBrewMethodsForTea(id);
  return Response.json(brew);
}