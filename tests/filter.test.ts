import * as assert from 'assert';
import { promises as fs } from 'fs';
import * as path from 'path';
import { filterTeas, Tea } from '../utils/filter';

async function run() {
  // Load tea data
  const dataPath = path.join(process.cwd(), 'data', 'teas.json');
  const data = await fs.readFile(dataPath, 'utf8');
  const teas: Tea[] = JSON.parse(data);

  // Should match by name
  const byName = filterTeas(teas, 'szolid');
  assert.ok(byName.some((t) => t.name === 'Szolid Optimizmus'));

  // Should match by ingredient (accent-insensitive)
  const byIngredient = filterTeas(teas, 'homoktovis');
  assert.ok(byIngredient.some((t) => t.name === 'Szolid Optimizmus'));

  // Should match by description text
  const byDescription = filterTeas(teas, 'hidegben');
  assert.ok(byDescription.some((t) => t.name === 'Szolid Optimizmus'));
}

run();