import type { PushContext, Template, Tone } from "./templates/types";

export type SelectOptions = {
  context: PushContext;
  recentIds?: readonly string[];
  tones?: readonly Tone[];
};

function matches(template: Template, opts: SelectOptions): boolean {
  if (!template.contexts.includes(opts.context)) return false;
  if (opts.tones && opts.tones.length > 0) {
    if (!template.tones.some((t) => opts.tones!.includes(t))) return false;
  }
  return true;
}

export function selectTemplate(
  catalog: readonly Template[],
  opts: SelectOptions,
): Template | null {
  const matching = catalog.filter((t) => matches(t, opts));
  if (matching.length === 0) return null;

  const recent = new Set(opts.recentIds ?? []);
  const fresh = matching.filter((t) => !recent.has(t.id));
  const pool = fresh.length > 0 ? fresh : matching;

  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}
