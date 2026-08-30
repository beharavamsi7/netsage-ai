import type { DiagnosisProvider, DiagnosisRequest, DiagnosisResponse } from "./types";
import { mockProvider } from "./mock-provider";
import { geminiProvider } from "./gemini-provider";

/**
 * AI Diagnosis Service
 *
 * Provider selection:
 *   1. If GEMINI_API_KEY is configured in Convex, use the Gemini provider.
 *   2. If not configured or the call fails, fall back to the mock provider.
 *
 * The UI calls `diagnose()` and `getProviderName()` from this module.
 * It never imports a provider directly.
 */

// ─── Provider state ──────────────────────────────────────────────────────────

let activeProviderName: "gemini-flash" | "mock-v1" = "mock-v1";

/** Return the name of the currently active provider. */
export function getProviderName(): string {
  return activeProviderName;
}

/**
 * Check whether a Gemini API key is likely configured.
 * This probes the Convex action — if it throws because the key is
 * missing, we know to use mock.
 */
let geminiKeyAvailable: boolean | null = null;

async function checkGeminiKey(): Promise<boolean> {
  if (geminiKeyAvailable !== null) return geminiKeyAvailable;
  try {
    // A lightweight probe — we just try the action and catch the
    // "key not configured" error.
    const { api } = await import("@/convex/_generated/api");
    const { ConvexReactClient } = await import("convex/react");
    const convexUrl = import.meta.env.VITE_CONVEX_URL as string;
    const client = new ConvexReactClient(convexUrl);
    await client.action(api.diagnose.run, {
      symptoms: "__probe__",
      packetTracerNotes: "",
      showCommandOutput: "",
    });
    // If it didn't throw, the key is configured
    geminiKeyAvailable = true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    geminiKeyAvailable = !msg.includes("GEMINI_API_KEY");
  }
  return geminiKeyAvailable;
}

// ─── Diagnose ────────────────────────────────────────────────────────────────

/**
 * Run a diagnosis through the best available provider.
 *
 * 1. Try Gemini if the key appears to be configured.
 * 2. On any failure, fall back to the mock provider.
 * 3. Return the diagnosis with `provider_name` so the UI can display it.
 */
export async function diagnose(
  request: DiagnosisRequest
): Promise<DiagnosisResponse & { provider_name: string }> {
  const useGemini = await checkGeminiKey();

  if (useGemini) {
    try {
      const result = await geminiProvider.diagnose(request);
      activeProviderName = "gemini-flash";
      return { ...result, provider_name: "gemini-flash" };
    } catch (err) {
      console.warn(
        "[NetSage] Gemini diagnosis failed, falling back to mock:",
        err instanceof Error ? err.message : err
      );
      // Reset so we re-probe next time
      geminiKeyAvailable = false;
    }
  }

  // Mock fallback
  const result = await mockProvider.diagnose(request);
  activeProviderName = "mock-v1";
  return { ...result, provider_name: "mock-v1" };
}

// ─── Re-export types ─────────────────────────────────────────────────────────

export type {
  DiagnosisRequest,
  DiagnosisResponse,
  DiagnosisProvider,
  ReviewAction,
  DiagnosisReview,
} from "./types";
