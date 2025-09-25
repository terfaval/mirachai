import { getBrewMethodsForTea } from '@/lib/data/brew.server';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const brew = await getBrewMethodsForTea(params.id);
  return Response.json(brew);
}