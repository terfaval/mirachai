import fs from 'node:fs/promises';
import path from 'node:path';

import type { RawTea } from '@/lib/normalize';

const DATA_DIR = path.join(process.cwd(), 'data');
const TEAS_PATH = path.join(DATA_DIR, 'teas.json');
const TEA_DESCRIPTIONS_PATH = path.join(DATA_DIR, 'teas_descriptions.json');

export type Tea = RawTea;
export type TeaDescription = Record<string, unknown> & {
  id?: number | string;
  slug?: string;
};

async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content) as T;
}

export async function readTeas(): Promise<Tea[]> {
  return readJsonFile<Tea[]>(TEAS_PATH);
}

export async function readTeaDescriptions(): Promise<TeaDescription[]> {
  return readJsonFile<TeaDescription[]>(TEA_DESCRIPTIONS_PATH);
}