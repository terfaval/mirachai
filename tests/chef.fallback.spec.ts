// tests/chef.fallback.spec.ts
import { describe, it, expect, vi } from "vitest";
import handler from "@/pages/api/chef/concepts";
import { createMocks } from "node-mocks-http";

vi.mock("@/lib/chef/llm", () => ({
  callLLM: vi.fn().mockRejectedValue(new Error("forced fail"))
}));

vi.mock("@/lib/chef/generate", () => ({
  generateConcepts: vi.fn().mockReturnValue([
    { title: "Saláta újragondolva – quinoa", profile: "salata", summary: "Ropogós bowl.", focus: ["több rost"], superfoods: ["quinoa"] },
    { title: "Ázsiai tál – edamame", profile: "azsiai", summary: "Zöld, ropogós.", focus: ["növényi fehérje"], superfoods: ["edamame"] }
  ])
}));

describe("fallback", () => {
  it("returns non-empty concepts on LLM failure", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: { dishName: "csilisbab", mustHave: [] }
    });
    await handler(req as any, res as any);
    const data = JSON.parse(res._getData());
    expect(Array.isArray(data.concepts)).toBe(true);
    expect(data.concepts.length).toBeGreaterThan(0);
  });
});
