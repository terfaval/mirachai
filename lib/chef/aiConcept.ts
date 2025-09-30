// lib/chef/aiConcept.ts
export async function generateConceptsAI(opts: { dishName?: string; mustHave?: string[] }) {
  const r = await fetch("/api/chef/concepts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts ?? {})
  });
  if (!r.ok) throw new Error("AI concepts API error");
  const data = await r.json(); // { concepts: [...] }
  return data.concepts;
}
