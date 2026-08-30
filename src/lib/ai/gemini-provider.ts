import type {
  DiagnosisProvider,
  DiagnosisRequest,
  DiagnosisResponse,
} from "./types";

/**
 * Gemini-backed diagnosis provider.
 *
 * Calls the Convex action `diagnose.run` which runs server-side and
 * holds the API key. If the key is missing or the call fails, this
 * provider throws — the caller should fall back to the mock provider.
 */

async function callGeminiAction(
  request: DiagnosisRequest
): Promise<DiagnosisResponse> {
  // Dynamically import the Convex generated API to avoid hard dependency
  // at module load time (the generated files may not exist yet).
  const { api } = await import("@/convex/_generated/api");
  const { ConvexReactClient } = await import("convex/react");

  // The Convex client must already be initialized in main.tsx.
  // We create a lightweight reference to call the action.
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string;
  const client = new ConvexReactClient(convexUrl);

  const start = performance.now();

  const result = await client.action(api.diagnose.run, {
    symptoms: request.symptoms,
    packetTracerNotes: request.packetTracerNotes,
    showCommandOutput: request.showCommandOutput,
  });

  const elapsed = Math.round(performance.now() - start);

  return {
    ...result,
    processing_time_ms: elapsed,
  };
}

export const geminiProvider: DiagnosisProvider = {
  name: "gemini-flash",

  async diagnose(request: DiagnosisRequest): Promise<DiagnosisResponse> {
    return callGeminiAction(request);
  },
};
