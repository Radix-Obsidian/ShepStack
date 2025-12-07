// Generated AI Client for SupportAI
// DO NOT EDIT - regenerate from .shep file
//
// This module handles all AI primitives defined in your spec.
// It calls the Python backend which handles the actual AI calls.

const API_BASE = process.env.API_URL || "http://localhost:3001/api";

/**
 * Call an AI function on the backend.
 */
async function callAI(endpoint: string, data: Record<string, unknown>): Promise<string> {
  const response = await fetch(`${API_BASE}/ai/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`AI call failed: ${response.statusText}`);
  }
  const result = await response.json();
  return result.result;
}

// =============================================================================
// AI Field Hooks
// =============================================================================

/**
 * Hook to compute AI-derived field: Message.sentiment
 * Prompt: classify as positive, neutral, or negative
 */
export async function useMessageSentiment(data: Record<string, unknown>): Promise<string> {
  return callAI("message_sentiment", data);
}

/**
 * Hook to compute AI-derived field: Message.summary
 * Prompt: summarize in one sentence
 */
export async function useMessageSummary(data: Record<string, unknown>): Promise<string> {
  return callAI("message_summary", data);
}


// =============================================================================
// AI Rule Condition Functions
// =============================================================================

/**
 * AI rule condition: "Auto-escalate frustrated customers":
 */
export async function checkRule1(message_content: string): Promise<boolean> {
  const result = await callAI("rule_1", { message_content });
  return result.toLowerCase() === "true";
}

/**
 * AI rule condition: "Flag potential spam":
 */
export async function checkRule2(message_content: string): Promise<boolean> {
  const result = await callAI("rule_2", { message_content });
  return result.toLowerCase() === "true";
}

