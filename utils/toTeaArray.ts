import { Tea } from '@/utils/filter';
export function toTeaArray(input: Tea[] | Record<string, Tea> | undefined | null): Tea[] {
  if (!input) return [];
  return Array.isArray(input) ? input : Object.values(input);
}