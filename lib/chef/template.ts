// lib/chef/template.ts
import fs from "fs/promises";

export async function loadText(path: string) {
  const buf = await fs.readFile(path);
  return buf.toString("utf8");
}

export async function renderTemplate(path: string, vars: Record<string, string>) {
  let tpl = await loadText(path);
  for (const [k, v] of Object.entries(vars)) {
    const token = `{{${k}}}`;
    tpl = tpl.split(token).join(v ?? "");
  }
  return tpl;
}
