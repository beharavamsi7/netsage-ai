/**
 * AI Diagnosis Service — Type Definitions
 *
 * These types define the contract between the UI and any diagnosis provider
 * (mock, rule-based, or LLM-backed). Swap the provider in src/lib/ai/index.ts
 * without touching the Troubleshooter component.
 */

/** What the UI sends to the diagnosis provider. */
export interface DiagnosisRequest {
  /** Free-text description of the observed network symptoms. */
  symptoms: string;
  /** Optional topology notes from Packet Tracer. */
  packetTracerNotes: string;
  /** Optional raw output from Cisco IOS show commands. */
  showCommandOutput: string;
}

/** Severity level for the identified root cause. */
export type Severity = "critical" | "high" | "medium" | "low";

/** The provider's diagnosis response. */
export interface DiagnosisResponse {
  /** Short label for the diagnosed problem. */
  root_cause: string;
  /** Confidence score between 0 and 1. */
  confidence: number;
  /** Relevant OSI layer (e.g. "Layer 2", "Layer 3"). */
  osi_layer: string;
  /** Bullet-pointed evidence from the input that supports the diagnosis. */
  evidence: string[];
  /** One suggested IOS command to gather more information. */
  next_command: string;
  /** Ordered steps to remediate the issue. */
  fix_steps: string[];
  /** How long the provider took, in milliseconds. */
  processing_time_ms: number;
}

/** A provider that can produce a DiagnosisResponse from a request. */
export interface DiagnosisProvider {
  name: string;
  diagnose(request: DiagnosisRequest): Promise<DiagnosisResponse>;
}

/** User feedback on a diagnosis. */
export type ReviewAction = "accepted" | "edited" | "rejected";

/** A completed review entry. */
export interface DiagnosisReview {
  diagnosis: DiagnosisResponse;
  action: ReviewAction;
  feedback?: string;
  timestamp: number;
}
