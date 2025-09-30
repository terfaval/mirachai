// lib/chef/telemetry.ts
export type Telemetry = {
  reqId: string;
  cacheHit: boolean;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  outputLen?: number;
};

export function startTimer() {
  const t0 = Date.now();
  return () => Date.now() - t0;
}

export function logTelemetry(t: Telemetry) {
  // eslint-disable-next-line no-console
  console.info("[chef.telemetry]", JSON.stringify(t));
}
