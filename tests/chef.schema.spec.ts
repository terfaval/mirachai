// tests/chef.schema.spec.ts
import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import { ConceptSchema } from "@/lib/chef/schema";

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(ConceptSchema);

describe("ConceptSchema", () => {
  it("accepts valid payload", () => {
    const sample = {
      concepts: [
        {
          title: "Mediterrán bowl – quinoa",
          profile: "mediterran",
          summary: "Friss, könnyű bowl mediterrán ízekkel és quinoával.",
          focus: ["több rost", "komplett fehérje"],
          why_healthy: "Quinoa és hüvelyesek együtt komplett fehérjét adnak.",
          superfoods: ["quinoa"]
        }
      ]
    };
    expect(validate(sample)).toBe(true);
  });

  it("rejects invalid payload", () => {
    const bad = { foo: "bar" };
    expect(validate(bad)).toBe(false);
  });
});
