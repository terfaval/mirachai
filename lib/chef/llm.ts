// lib/chef/llm.ts
// Minimál wrapper OpenAI JSON-kimenettel. Cseréld a projekt standardjára, ha van.
type LLMArgs = { system: string; user: string; maxTokens?: number; temperature?: number; topP?: number; };

export async function callLLM({ system, user, maxTokens = 700, temperature = 0.2, topP = 0.9 }: LLMArgs): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature,
      top_p: topP,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      max_tokens: maxTokens
    })
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`LLM HTTP ${resp.status}: ${text}`);
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("Empty LLM content");
  return content;
}
