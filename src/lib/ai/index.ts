import type { DiagnosisProvider } from "./types";
import { mockProvider } from "./mock-provider";

/**
 * AI Diagnosis Service
 *
 * This module is the single entry point for diagnosis. To swap providers:
 *   1. Implement the DiagnosisProvider interface in a new file.
 *   2. Import it here and assign it to `provider`.
 *
 * The UI never imports a provider directly — it calls `diagnose()` from here.
 */

// ─── Active provider ─────────────────────────────────────────────────────────

let provider: DiagnosisProvider = mockProvider;

/** Replace the active diagnosis provider at runtime. */
export function setDiagnosisProvider(next: DiagnosisProvider) {
  provider = next;
}

/** Return the currently active provider (useful for displaying the provider name). */
export function getDiagnosisProvider(): DiagnosisProvider {
  return provider;
}

// ─── Convenience wrapper ─────────────────────────────────────────────────────

/**
 * Run a diagnosis through the active provider.
 * This is the only function the UI should call.
 */
export async function diagnose(
  request: import("./types").DiagnosisRequest
): Promise<import("./types").DiagnosisResponse> {
  return provider.diagnose(request);
}

// ─── Re-export types for consumers ───────────────────────────────────────────

export type {
  DiagnosisRequest,
  DiagnosisResponse,
  DiagnosisProvider,
  ReviewAction,
  DiagnosisReview,
} from "./types";
