import fs from 'node:fs/promises';
import path from 'node:path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'data', 'ui_texts.json');
  const content = await fs.readFile(filePath, 'utf8');
  return new Response(content, {
    headers: {
      'content-type': 'application/json',
    },
  });
}