export function normalizeInstructionSteps(steps: string[]): string[] {
  return steps
    .map((step) => step.trim())
    .filter((step) => step.length > 0)
    .map((step) => step.replace(/\s+/g, ' '))
    .map((step) => step.replace(/^\d+[.)]\s*/, ''))
    .map((step) => step.replace(/^[•*-]\s*/, ''));
}