/**
 * Feature flags — controlled via environment variables.
 * All flags default to false (fully free, no restrictions) for MVP launch.
 *
 * To activate freemium: set FREEMIUM_ENABLED=true in Cloud Run env vars.
 * No code changes required.
 */
export const featureFlags = {
  /**
   * When true, enforces free vs pro tier limits (ops/day, file size, etc.)
   * Default: false → all users get unlimited access
   */
  get FREEMIUM_ENABLED(): boolean {
    return process.env.FREEMIUM_ENABLED === 'true'
  },

  /**
   * When true, requires Firebase authentication for all operations.
   * Default: false → anonymous access allowed
   */
  get REQUIRE_AUTH(): boolean {
    return process.env.REQUIRE_AUTH === 'true'
  },

  /**
   * When true, shows upgrade CTA when free limits are reached.
   * Default: false
   */
  get SHOW_UPGRADE_CTA(): boolean {
    return process.env.SHOW_UPGRADE_CTA === 'true'
  },

  /**
   * When true, Stripe payment flows are enabled.
   * Default: false
   */
  get PAYMENT_ENABLED(): boolean {
    return process.env.PAYMENT_ENABLED === 'true'
  },
} as const

/** Free tier limits (only enforced when FREEMIUM_ENABLED=true) */
export const freeTierLimits = {
  operationsPerDay: 10,
  maxFileSizeMB: 20,
  maxBatchFiles: 1,
  historyDays: 0,
} as const

/** Pro tier limits */
export const proTierLimits = {
  operationsPerDay: Infinity,
  maxFileSizeMB: 200,
  maxBatchFiles: 50,
  historyDays: 30,
} as const
