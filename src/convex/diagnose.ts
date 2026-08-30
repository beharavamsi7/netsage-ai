"use node";

import { v } from "convex/values";
import { action } from "./_generated/server.js";
import { GoogleGenAI } from "@google/genai";

/**
 * Gemini Diagnosis Action
 *
 * Runs server-side (Node.js) so the API key never reaches the browser.
 * The key is read from the GEMINI_API_KEY environment variable set in
 * the Convex dashboard under Settings → Environment Variables.
 */

const SYSTEM_PROMPT = `You are NetSage, an AI network troubleshooting assistant for Cisco Packet Tracer and lab scenarios.

Your task is to diagnose the network problem described by the user and return a structured JSON response.

RULES:
1. Use ONLY the evidence provided in the user's input. Do not invent evidence that is not present in the symptoms, notes, or show-command output.
2. Clearly distinguish confirmed evidence (directly observable from the input) from assumptions (inferred but not directly observed).
3. Assign a confidence value between 0 and 1 based on how well the evidence supports your diagnosis.
4. If the evidence is insufficient, recommend the single most useful next diagnostic command.
5. Never claim that a network configuration was changed or that a fix was applied. You are diagnosing, not executing.
6. Treat every diagnosis as a recommendation that requires human review before action.

Return ONLY valid JSON with these exact fields:
{
  "root_cause": "string — concise description of the diagnosed problem",
  "confidence": number between 0 and 1,
  "osi_layer": "string — e.g. Layer 1, Layer 2, Layer 3, Layer 4, Layer 7",
  "evidence": ["string array — each item is a piece of evidence from the input OR clearly marked as an assumption"],
  "next_command": "string — one Cisco IOS command to gather more information",
  "fix_steps": ["string array — ordered steps to remediate the issue"]
}`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    root_cause: { type: "string" },
    confidence: { type: "number" },
    osi_layer: { type: "string" },
    evidence: { type: "array", items: { type: "string" } },
    next_command: { type: "string" },
    fix_steps: { type: "array", items: { type: "string" } },
  },
  required: ["root_cause", "confidence", "osi_layer", "evidence", "next_command", "fix_steps"],
};

export const run = action({
  args: {
    symptoms: v.string(),
    packetTracerNotes: v.string(),
    showCommandOutput: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured. Set it in the Convex dashboard under Settings → Environment Variables."
      );
    }

    const userMessage = [
      args.symptoms,
      args.packetTracerNotes
        ? `\n\nPacket Tracer Notes:\n${args.packetTracerNotes}`
        : "",
      args.showCommandOutput
        ? `\n\nShow-Command Output:\n${args.showCommandOutput}`
        : "",
    ]
      .filter(Boolean)
      .join("");

    const genai = new GoogleGenAI({ apiKey });

    const response = await genai.models.generateContent({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    // Parse and validate the JSON response
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`Failed to parse Gemini response as JSON: ${text.slice(0, 200)}`);
    }

    // Validate required fields
    const required = ["root_cause", "confidence", "osi_layer", "evidence", "next_command", "fix_steps"];
    for (const field of required) {
      if (parsed[field] === undefined || parsed[field] === null) {
        throw new Error(`Gemini response missing required field: ${field}`);
      }
    }

    // Clamp confidence to 0-1
    const confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5));

    return {
      root_cause: String(parsed.root_cause),
      confidence,
      osi_layer: String(parsed.osi_layer),
      evidence: Array.isArray(parsed.evidence)
        ? parsed.evidence.map(String)
        : ["Evidence not provided by model"],
      next_command: String(parsed.next_command),
      fix_steps: Array.isArray(parsed.fix_steps)
        ? parsed.fix_steps.map(String)
        : ["No fix steps provided"],
    };
  },
});
