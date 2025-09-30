// tests/chef.determinism.spec.ts
import { describe, it, expect, vi } from "vitest";
import { callLLM } from "@/lib/chef/llm";

vi.mock("@/lib/chef/llm", async (orig) => {
  // Stub: identical input -> identical output string
  return {
    callLLM: vi.fn().mockResolvedValue(JSON.stringify({
      concepts: [
        {
          title: "Mediterrán csilisbab – quinoa",
          profile: "mediterran",
          summary: "Paradicsomos, zöldfűszeres reinterpretáció.",
          focus: ["több rost","komplett fehérje"],
          why_healthy: "Quinoa + bab együtt kész fehérjeprofil.",
          superfoods: ["quinoa"]
        }
      ]
    }))
  };
});

describe("determinism (structure)", () => {
  it("same input => same structure", async () => {
    const a = await callLLM({ system: "s", user: "u" } as any);
    const b = await callLLM({ system: "s", user: "u" } as any);
    expect(a).toBe(b);
  });
});
