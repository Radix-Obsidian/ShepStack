// Generated React Hooks for SupportAI
// DO NOT EDIT - regenerate from .shep file

import { useState, useEffect, useCallback } from 'react';
import type { Company, KnowledgeBase, Conversation, Message, Escalation } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// =============================================================================
// Generic Fetch Hook
// =============================================================================

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useQuery<T>(endpoint: string): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// =============================================================================
// Entity Hooks
// =============================================================================

export function useCompanys() {
  return useQuery<Company[]>("/companys");
}

export function useCompany(id: string) {
  return useQuery<Company>(`/companys/${id}`);
}

export function useKnowledgeBases() {
  return useQuery<KnowledgeBase[]>("/knowledgebases");
}

export function useKnowledgeBase(id: string) {
  return useQuery<KnowledgeBase>(`/knowledgebases/${id}`);
}

export function useConversations() {
  return useQuery<Conversation[]>("/conversations");
}

export function useConversation(id: string) {
  return useQuery<Conversation>(`/conversations/${id}`);
}

export function useMessages() {
  return useQuery<Message[]>("/messages");
}

export function useMessage(id: string) {
  return useQuery<Message>(`/messages/${id}`);
}

export function useEscalations() {
  return useQuery<Escalation[]>("/escalations");
}

export function useEscalation(id: string) {
  return useQuery<Escalation>(`/escalations/${id}`);
}

// =============================================================================
// AI Hooks
// =============================================================================

interface UseAIResult {
  result: string | null;
  loading: boolean;
  error: Error | null;
  compute: (data: Record<string, unknown>) => Promise<string>;
}

function useAI(endpoint: string): UseAIResult {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const compute = useCallback(async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`AI call failed: ${res.status}`);
      const json = await res.json();
      setResult(json.result);
      setError(null);
      return json.result;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  return { result, loading, error, compute };
}

/**
 * AI Hook: Compute Message.sentiment
 * Prompt: "classify as positive, neutral, or negative"
 */
export function useMessageSentiment() {
  return useAI("message_sentiment");
}

/**
 * AI Hook: Compute Message.summary
 * Prompt: "summarize in one sentence"
 */
export function useMessageSummary() {
  return useAI("message_summary");
}

/**
 * AI Rule Hook: "Auto-escalate frustrated customers":
 */
export function useAIRule1() {
  return useAI("rule_1");
}

/**
 * AI Rule Hook: "Flag potential spam":
 */
export function useAIRule2() {
  return useAI("rule_2");
}

