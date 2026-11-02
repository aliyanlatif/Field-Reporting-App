export interface ChaosSettings {
  latencyMs: number;
  dropRate: number;
  loseResponseRate: number;
  errorRate: number;
  refuseUploads: boolean;
  hang: boolean;
  dropUploadAfterBytes: number;
}

type Parser = (value: unknown) => number | boolean | undefined;

const rate: Parser = value =>
  typeof value === 'number' && value >= 0 && value <= 1 ? value : undefined;
const count: Parser = value =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
const flag: Parser = value => (typeof value === 'boolean' ? value : undefined);

const parsers: Record<keyof ChaosSettings, Parser> = {
  latencyMs: count,
  dropRate: rate,
  loseResponseRate: rate,
  errorRate: rate,
  refuseUploads: flag,
  hang: flag,
  dropUploadAfterBytes: count,
};

const fromEnv = (name: string) => {
  const raw = process.env[name];
  return raw === undefined ? undefined : Number(raw);
};

const defaults = (): ChaosSettings => ({
  latencyMs: fromEnv('CHAOS_LATENCY_MS') ?? 0,
  dropRate: fromEnv('CHAOS_DROP_RATE') ?? 0,
  loseResponseRate: fromEnv('CHAOS_LOSE_RESPONSE_RATE') ?? 0,
  errorRate: fromEnv('CHAOS_ERROR_RATE') ?? 0,
  refuseUploads: process.env.CHAOS_REFUSE_UPLOADS === '1',
  hang: process.env.CHAOS_HANG === '1',
  dropUploadAfterBytes: fromEnv('CHAOS_DROP_UPLOAD_AFTER_BYTES') ?? 0,
});

let current = defaults();

export const chaosSettings = {
  get: (): ChaosSettings => ({ ...current }),

  reset() {
    current = defaults();
  },

  /** Applies a partial update; returns the names of invalid fields instead of applying anything. */
  update(patch: Record<string, unknown>): string[] {
    const invalid = Object.keys(patch).filter(
      key => !(key in parsers) || parsers[key as keyof ChaosSettings](patch[key]) === undefined,
    );
    if (invalid.length === 0) {
      current = { ...current, ...patch };
    }
    return invalid;
  },
};
