// lib/chef/schema.ts
export const ConceptSchema = {
  type: "object",
  required: ["concepts"],
  properties: {
    concepts: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: {
        type: "object",
        required: ["title", "profile", "summary", "focus", "why_healthy", "superfoods"],
        properties: {
          title: { type: "string", minLength: 8 },
          profile: { enum: ["mediterran", "balkan", "azsiai", "salata"] },
          summary: { type: "string", minLength: 20, maxLength: 200 },
          focus: {
            type: "array",
            minItems: 2,
            maxItems: 4,
            items: { type: "string", maxLength: 60 }
          },
          why_healthy: { type: "string", minLength: 20, maxLength: 180 },
          superfoods: {
            type: "array",
            minItems: 1,
            maxItems: 3,
            items: { type: "string", maxLength: 30 }
          }
        },
        additionalProperties: false
      }
    }
  },
  additionalProperties: false
} as const;

export type ConceptOutput = {
  concepts: Array<{
    title: string;
    profile: "mediterran" | "balkan" | "azsiai" | "salata";
    summary: string;
    focus: string[];
    why_healthy: string;
    superfoods: string[];
  }>;
};
