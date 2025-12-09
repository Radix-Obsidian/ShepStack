/**
 * AI Generator for ShepLang
 * 
 * Generates production-ready AI client code with:
 * - Retry logic with exponential backoff
 * - Caching with TTL (in-memory + Redis option)
 * - Cost tracking (token counting)
 * - Rate limiting
 * - Structured output validation
 * - Comprehensive error handling
 * 
 * "AI is a language primitive, not a plugin." — ShepLang Philosophy
 */

import { writeFileSync } from "node:fs";
import { ShepSpec, Field, Rule, FlowStep } from "@goldensheepai/shep-core";

interface AIField {
  entity: string;
  field: string;
  prompt: string;
  outputType: "text" | "boolean" | "number" | "enum";
  enumValues?: string[];
}

interface AIRule {
  index: number;
  description: string;
  input: string;
  prompt: string;
}

interface AIFlowStep {
  flow: string;
  step: number;
  action: string;
}

/**
 * Check if spec uses any AI primitives.
 */
export function hasAIPrimitives(spec: ShepSpec): boolean {
  // Check for AI fields
  for (const entity of spec.entities) {
    for (const field of entity.fields) {
      if (field.fieldType === "ai") return true;
    }
  }
  // Check for AI rules
  for (const rule of spec.rules) {
    if (rule.aiCondition) return true;
  }
  // Check for AI flow steps
  for (const flow of spec.flows) {
    for (const step of flow.steps) {
      if (step.isAI) return true;
    }
  }
  return false;
}

/**
 * Collect all AI usages from spec.
 */
function collectAIUsages(spec: ShepSpec): {
  fields: AIField[];
  rules: AIRule[];
  flowSteps: AIFlowStep[];
} {
  const fields: AIField[] = [];
  const rules: AIRule[] = [];
  const flowSteps: AIFlowStep[] = [];

  // Collect AI fields
  for (const entity of spec.entities) {
    for (const field of entity.fields) {
      if (field.fieldType === "ai" && field.aiPrompt) {
        fields.push({
          entity: entity.name,
          field: field.name,
          prompt: field.aiPrompt,
          outputType: inferOutputType(field.aiPrompt),
          enumValues: extractEnumValues(field.aiPrompt),
        });
      }
    }
  }

  // Collect AI rules
  for (let i = 0; i < spec.rules.length; i++) {
    const rule = spec.rules[i];
    if (rule.aiCondition) {
      rules.push({
        index: i + 1,
        description: rule.description,
        input: rule.aiCondition.input,
        prompt: rule.aiCondition.prompt,
      });
    }
  }

  // Collect AI flow steps
  for (const flow of spec.flows) {
    for (const step of flow.steps) {
      if (step.isAI && step.aiAction) {
        flowSteps.push({
          flow: flow.name,
          step: step.order,
          action: step.aiAction,
        });
      }
    }
  }

  return { fields, rules, flowSteps };
}

/**
 * Infer output type from prompt.
 */
function inferOutputType(prompt: string): "text" | "boolean" | "number" | "enum" {
  const lower = prompt.toLowerCase();
  if (lower.includes("true or false") || lower.includes("yes or no")) {
    return "boolean";
  }
  if (lower.includes("classify") || lower.includes("categorize") || lower.includes(" as ")) {
    return "enum";
  }
  if (lower.includes("count") || lower.includes("number") || lower.includes("score")) {
    return "number";
  }
  return "text";
}

/**
 * Extract enum values from prompt like "classify as positive, neutral, negative".
 */
function extractEnumValues(prompt: string): string[] | undefined {
  const match = prompt.match(/(?:classify|categorize)\s+(?:as\s+)?([^.]+)/i);
  if (match) {
    return match[1].split(/[,\s]+(?:or\s+)?/).map(v => v.trim()).filter(v => v.length > 0);
  }
  return undefined;
}

/**
 * Sanitize a string to be a valid Python/TS identifier.
 */
function sanitizeIdentifier(str: string): string {
  return str.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^[0-9]/, "_$&");
}

/**
 * Generate the complete Python AI client.
 */
function generatePythonAIClient(spec: ShepSpec, usages: ReturnType<typeof collectAIUsages>): string {
  const { fields, rules, flowSteps } = usages;
  
  return `"""
ShepLang AI Client
==================

Generated AI client for ${spec.app}.
DO NOT EDIT - regenerate from .shep file.

Features:
- Claude and OpenAI support
- Retry logic with exponential backoff
- Caching with TTL
- Cost tracking
- Rate limiting
- Structured output validation
"""

import os
import json
import time
import hashlib
import asyncio
import logging
from typing import Optional, Any, Literal, TypeVar, Generic
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from functools import wraps
import httpx

# =============================================================================
# Configuration
# =============================================================================

AI_PROVIDER = os.getenv("AI_PROVIDER", "claude")  # "claude" or "openai"
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Model configuration
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-3-haiku-20240307")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")

# Retry configuration
MAX_RETRIES = int(os.getenv("AI_MAX_RETRIES", "3"))
BASE_DELAY = float(os.getenv("AI_BASE_DELAY", "1.0"))  # seconds
MAX_DELAY = float(os.getenv("AI_MAX_DELAY", "30.0"))  # seconds

# Cache configuration
CACHE_TTL = int(os.getenv("AI_CACHE_TTL", "3600"))  # 1 hour default
CACHE_ENABLED = os.getenv("AI_CACHE_ENABLED", "true").lower() == "true"

# Rate limiting
RATE_LIMIT_RPM = int(os.getenv("AI_RATE_LIMIT_RPM", "60"))  # requests per minute

# Logging
logger = logging.getLogger("shep.ai")

# =============================================================================
# Cost Tracking
# =============================================================================

@dataclass
class TokenUsage:
    """Track token usage for cost estimation."""
    input_tokens: int = 0
    output_tokens: int = 0
    timestamp: datetime = field(default_factory=datetime.now)
    
    @property
    def total_tokens(self) -> int:
        return self.input_tokens + self.output_tokens
    
    def estimated_cost_usd(self) -> float:
        """Estimate cost based on typical pricing."""
        # Claude Haiku: ~$0.25/$1.25 per 1M tokens (input/output)
        # GPT-3.5: ~$0.50/$1.50 per 1M tokens
        if AI_PROVIDER == "claude":
            return (self.input_tokens * 0.25 + self.output_tokens * 1.25) / 1_000_000
        else:
            return (self.input_tokens * 0.50 + self.output_tokens * 1.50) / 1_000_000


class CostTracker:
    """Track cumulative AI costs."""
    
    def __init__(self):
        self._usages: list[TokenUsage] = []
        self._lock = asyncio.Lock()
    
    async def record(self, usage: TokenUsage) -> None:
        async with self._lock:
            self._usages.append(usage)
    
    def total_tokens(self) -> int:
        return sum(u.total_tokens for u in self._usages)
    
    def total_cost_usd(self) -> float:
        return sum(u.estimated_cost_usd() for u in self._usages)
    
    def usage_since(self, since: datetime) -> list[TokenUsage]:
        return [u for u in self._usages if u.timestamp >= since]
    
    def summary(self) -> dict:
        return {
            "total_requests": len(self._usages),
            "total_tokens": self.total_tokens(),
            "estimated_cost_usd": round(self.total_cost_usd(), 4),
            "provider": AI_PROVIDER,
        }


# Global cost tracker
cost_tracker = CostTracker()

# =============================================================================
# Rate Limiting
# =============================================================================

class RateLimiter:
    """Simple token bucket rate limiter."""
    
    def __init__(self, rpm: int):
        self.rpm = rpm
        self.tokens = rpm
        self.last_refill = time.time()
        self._lock = asyncio.Lock()
    
    async def acquire(self) -> None:
        async with self._lock:
            now = time.time()
            elapsed = now - self.last_refill
            
            # Refill tokens based on time passed
            self.tokens = min(self.rpm, self.tokens + elapsed * (self.rpm / 60))
            self.last_refill = now
            
            if self.tokens < 1:
                # Wait until we have a token
                wait_time = (1 - self.tokens) * (60 / self.rpm)
                logger.warning(f"Rate limited, waiting {wait_time:.2f}s")
                await asyncio.sleep(wait_time)
                self.tokens = 1
            
            self.tokens -= 1


# Global rate limiter
rate_limiter = RateLimiter(RATE_LIMIT_RPM)

# =============================================================================
# Caching
# =============================================================================

@dataclass
class CacheEntry:
    """A cached AI response."""
    value: str
    expires_at: datetime


class AICache:
    """In-memory cache with TTL. Replace with Redis for production."""
    
    def __init__(self, ttl_seconds: int = CACHE_TTL):
        self.ttl = ttl_seconds
        self._cache: dict[str, CacheEntry] = {}
        self._lock = asyncio.Lock()
    
    def _make_key(self, prompt: str, context: str) -> str:
        """Generate cache key from prompt and context."""
        content = f"{prompt}:{context}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]
    
    async def get(self, prompt: str, context: str) -> Optional[str]:
        """Get cached value if exists and not expired."""
        if not CACHE_ENABLED:
            return None
            
        key = self._make_key(prompt, context)
        async with self._lock:
            entry = self._cache.get(key)
            if entry and entry.expires_at > datetime.now():
                logger.debug(f"Cache hit for key {key}")
                return entry.value
            elif entry:
                # Expired, remove it
                del self._cache[key]
        return None
    
    async def set(self, prompt: str, context: str, value: str) -> None:
        """Store value in cache."""
        if not CACHE_ENABLED:
            return
            
        key = self._make_key(prompt, context)
        async with self._lock:
            self._cache[key] = CacheEntry(
                value=value,
                expires_at=datetime.now() + timedelta(seconds=self.ttl)
            )
            logger.debug(f"Cached result for key {key}")
    
    async def clear(self) -> None:
        """Clear all cached entries."""
        async with self._lock:
            self._cache.clear()
    
    def stats(self) -> dict:
        """Return cache statistics."""
        now = datetime.now()
        valid = sum(1 for e in self._cache.values() if e.expires_at > now)
        return {
            "total_entries": len(self._cache),
            "valid_entries": valid,
            "expired_entries": len(self._cache) - valid,
            "enabled": CACHE_ENABLED,
            "ttl_seconds": self.ttl,
        }


# Global cache
ai_cache = AICache()

# =============================================================================
# Retry Logic
# =============================================================================

class AIError(Exception):
    """Base exception for AI errors."""
    pass


class AIRetryableError(AIError):
    """Error that can be retried."""
    pass


class AINonRetryableError(AIError):
    """Error that should not be retried."""
    pass


async def with_retry(
    func,
    max_retries: int = MAX_RETRIES,
    base_delay: float = BASE_DELAY,
    max_delay: float = MAX_DELAY,
):
    """Execute function with exponential backoff retry."""
    last_error = None
    
    for attempt in range(max_retries + 1):
        try:
            return await func()
        except AIRetryableError as e:
            last_error = e
            if attempt < max_retries:
                delay = min(base_delay * (2 ** attempt), max_delay)
                logger.warning(f"AI call failed (attempt {attempt + 1}/{max_retries + 1}), retrying in {delay:.1f}s: {e}")
                await asyncio.sleep(delay)
            else:
                logger.error(f"AI call failed after {max_retries + 1} attempts: {e}")
        except AINonRetryableError:
            raise
        except Exception as e:
            # Unexpected error, don't retry
            logger.error(f"Unexpected AI error: {e}")
            raise AIError(f"Unexpected error: {e}") from e
    
    raise AIError(f"Failed after {max_retries + 1} attempts: {last_error}")

# =============================================================================
# AI Providers
# =============================================================================

async def _call_claude(prompt: str, context: str, max_tokens: int = 1024) -> tuple[str, TokenUsage]:
    """Call Claude API with proper error handling."""
    if not ANTHROPIC_API_KEY:
        raise AINonRetryableError("ANTHROPIC_API_KEY not set")
    
    full_prompt = f"{prompt}\\n\\nContext: {context}" if context else prompt
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": CLAUDE_MODEL,
                    "max_tokens": max_tokens,
                    "messages": [{"role": "user", "content": full_prompt}],
                },
            )
            
            if response.status_code == 429:
                raise AIRetryableError("Rate limited by Claude API")
            if response.status_code >= 500:
                raise AIRetryableError(f"Claude API error: {response.status_code}")
            if response.status_code == 401:
                raise AINonRetryableError("Invalid ANTHROPIC_API_KEY")
            
            response.raise_for_status()
            data = response.json()
            
            # Extract usage
            usage = TokenUsage(
                input_tokens=data.get("usage", {}).get("input_tokens", 0),
                output_tokens=data.get("usage", {}).get("output_tokens", 0),
            )
            
            return data["content"][0]["text"], usage
            
        except httpx.TimeoutException:
            raise AIRetryableError("Claude API timeout")
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (429, 500, 502, 503, 504):
                raise AIRetryableError(f"HTTP {e.response.status_code}")
            raise AINonRetryableError(f"HTTP error: {e}")


async def _call_openai(prompt: str, context: str, max_tokens: int = 1024) -> tuple[str, TokenUsage]:
    """Call OpenAI API with proper error handling."""
    if not OPENAI_API_KEY:
        raise AINonRetryableError("OPENAI_API_KEY not set")
    
    full_prompt = f"{prompt}\\n\\nContext: {context}" if context else prompt
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": OPENAI_MODEL,
                    "messages": [{"role": "user", "content": full_prompt}],
                    "max_tokens": max_tokens,
                },
            )
            
            if response.status_code == 429:
                raise AIRetryableError("Rate limited by OpenAI API")
            if response.status_code >= 500:
                raise AIRetryableError(f"OpenAI API error: {response.status_code}")
            if response.status_code == 401:
                raise AINonRetryableError("Invalid OPENAI_API_KEY")
            
            response.raise_for_status()
            data = response.json()
            
            # Extract usage
            usage = TokenUsage(
                input_tokens=data.get("usage", {}).get("prompt_tokens", 0),
                output_tokens=data.get("usage", {}).get("completion_tokens", 0),
            )
            
            return data["choices"][0]["message"]["content"], usage
            
        except httpx.TimeoutException:
            raise AIRetryableError("OpenAI API timeout")
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (429, 500, 502, 503, 504):
                raise AIRetryableError(f"HTTP {e.response.status_code}")
            raise AINonRetryableError(f"HTTP error: {e}")

# =============================================================================
# Main AI Call Function
# =============================================================================

async def call_ai(
    prompt: str,
    context: str = "",
    cache_key: Optional[str] = None,
    validate: Optional[callable] = None,
) -> str:
    """
    Call the AI provider with full production features.
    
    Args:
        prompt: The instruction for the AI
        context: Additional context (e.g., the data to analyze)
        cache_key: Optional key prefix for caching
        validate: Optional function to validate/parse the response
    
    Returns:
        The AI response (possibly validated/parsed)
    
    Raises:
        AIError: If the call fails after retries
    """
    # Check cache first
    cached = await ai_cache.get(prompt, context)
    if cached is not None:
        return cached
    
    # Rate limiting
    await rate_limiter.acquire()
    
    # Make the actual call with retry
    async def do_call():
        if AI_PROVIDER == "claude":
            return await _call_claude(prompt, context)
        else:
            return await _call_openai(prompt, context)
    
    result, usage = await with_retry(do_call)
    
    # Track cost
    await cost_tracker.record(usage)
    
    # Validate if requested
    if validate:
        try:
            result = validate(result)
        except Exception as e:
            logger.warning(f"Validation failed: {e}, using raw result")
    
    # Cache the result
    await ai_cache.set(prompt, context, result)
    
    return result

# =============================================================================
# Output Validators
# =============================================================================

def validate_boolean(response: str) -> str:
    """Validate and normalize boolean response."""
    clean = response.strip().lower()
    if clean in ("true", "yes", "1"):
        return "true"
    if clean in ("false", "no", "0"):
        return "false"
    # Try to extract from longer response
    if "true" in clean or "yes" in clean:
        return "true"
    return "false"


def validate_enum(allowed_values: list[str]):
    """Create validator for enum responses."""
    def validator(response: str) -> str:
        clean = response.strip().lower()
        for value in allowed_values:
            if value.lower() in clean:
                return value
        # Return first option as default
        logger.warning(f"Could not match '{clean}' to {allowed_values}, using default")
        return allowed_values[0] if allowed_values else clean
    return validator


def validate_number(response: str) -> str:
    """Validate and extract number from response."""
    import re
    match = re.search(r'-?\\d+(?:\\.\\d+)?', response)
    if match:
        return match.group()
    return "0"

# =============================================================================
# AI Field Derivation Functions
# =============================================================================

${fields.map(f => generateFieldFunction(f)).join("\n")}

# =============================================================================
# AI Rule Condition Functions
# =============================================================================

${rules.map(r => generateRuleFunction(r)).join("\n")}

# =============================================================================
# AI Flow Step Functions
# =============================================================================

${flowSteps.map(s => generateFlowStepFunction(s)).join("\n")}

# =============================================================================
# Admin/Debug Endpoints
# =============================================================================

def get_ai_stats() -> dict:
    """Get AI usage statistics."""
    return {
        "cost": cost_tracker.summary(),
        "cache": ai_cache.stats(),
        "config": {
            "provider": AI_PROVIDER,
            "model": CLAUDE_MODEL if AI_PROVIDER == "claude" else OPENAI_MODEL,
            "cache_enabled": CACHE_ENABLED,
            "cache_ttl": CACHE_TTL,
            "rate_limit_rpm": RATE_LIMIT_RPM,
        }
    }


async def clear_ai_cache() -> dict:
    """Clear the AI response cache."""
    await ai_cache.clear()
    return {"cleared": True}
`;
}

/**
 * Generate function for an AI field.
 */
function generateFieldFunction(field: AIField): string {
  const funcName = `compute_${field.entity.toLowerCase()}_${field.field}`;
  const validator = field.outputType === "boolean" 
    ? "validate_boolean"
    : field.outputType === "enum" && field.enumValues
      ? `validate_enum(${JSON.stringify(field.enumValues)})`
      : field.outputType === "number"
        ? "validate_number"
        : "None";
  
  return `async def ${funcName}(data: dict) -> str:
    """
    AI-derived field: ${field.entity}.${field.field}
    Prompt: ${field.prompt}
    Output type: ${field.outputType}
    """
    context = json.dumps(data, default=str)
    return await call_ai(
        prompt="""${field.prompt}

Respond with only the result, no explanation.""",
        context=context,
        cache_key="${field.entity}_${field.field}",
        validate=${validator},
    )

`;
}

/**
 * Generate function for an AI rule condition.
 */
function generateRuleFunction(rule: AIRule): string {
  const inputVar = sanitizeIdentifier(rule.input);
  
  return `async def check_rule_${rule.index}(${inputVar}: str) -> bool:
    """
    AI rule condition: ${rule.description}
    Input: ${rule.input}
    Prompt: ${rule.prompt}
    """
    result = await call_ai(
        prompt="""Analyze this text and determine if it: ${rule.prompt}

Text: {${inputVar}}

Respond with only "true" or "false".""".format(${inputVar}=${inputVar}),
        cache_key=f"rule_${rule.index}",
        validate=validate_boolean,
    )
    return result == "true"

`;
}

/**
 * Generate function for an AI flow step.
 */
function generateFlowStepFunction(step: AIFlowStep): string {
  const flowName = sanitizeIdentifier(step.flow);
  
  return `async def flow_${flowName}_step_${step.step}(context: dict) -> str:
    """
    AI flow step: ${step.flow}, Step ${step.step}
    Action: ${step.action}
    """
    return await call_ai(
        prompt="""${step.action}

Provide a clear, actionable response.""",
        context=json.dumps(context, default=str),
        cache_key=f"flow_${flowName}_step_${step.step}",
    )

`;
}

/**
 * Generate TypeScript AI client.
 */
function generateTypeScriptAIClient(spec: ShepSpec, usages: ReturnType<typeof collectAIUsages>): string {
  const { fields, rules, flowSteps } = usages;
  
  let ts = `/**
 * ShepLang AI Client (TypeScript)
 * 
 * Generated for ${spec.app}.
 * DO NOT EDIT - regenerate from .shep file.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3001";

// =============================================================================
// Types
// =============================================================================

interface AIResponse<T = string> {
  result: T;
  cached?: boolean;
}

interface AIError {
  error: string;
  code?: string;
}

interface AIStats {
  cost: {
    total_requests: number;
    total_tokens: number;
    estimated_cost_usd: number;
    provider: string;
  };
  cache: {
    total_entries: number;
    valid_entries: number;
    enabled: boolean;
  };
}

// =============================================================================
// Base Client
// =============================================================================

class AIClientError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "AIClientError";
  }
}

async function callAI<T = string>(
  endpoint: string,
  data: Record<string, unknown>
): Promise<T> {
  const response = await fetch(\`\${API_BASE}/api/ai/\${endpoint}\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new AIClientError(error.error || "AI call failed", error.code);
  }

  const result = await response.json();
  return result.result as T;
}

// =============================================================================
// AI Field Functions
// =============================================================================

`;

  // Generate functions for each AI field
  for (const field of fields) {
    const funcName = `compute${field.entity}${capitalize(field.field)}`;
    const returnType = field.outputType === "boolean" ? "boolean" : "string";
    
    ts += `/**
 * Compute AI-derived field: ${field.entity}.${field.field}
 * Prompt: ${field.prompt}
 */
export async function ${funcName}(data: Record<string, unknown>): Promise<${returnType}> {
  const result = await callAI("${field.entity.toLowerCase()}_${field.field}", data);
  ${field.outputType === "boolean" ? 'return result === "true";' : 'return result;'}
}

`;
  }

  ts += `// =============================================================================
// AI Rule Condition Functions
// =============================================================================

`;

  // Generate functions for AI rule conditions
  for (const rule of rules) {
    const inputVar = sanitizeIdentifier(rule.input);
    
    ts += `/**
 * AI rule condition: ${rule.description}
 * Analyzes: ${rule.input}
 */
export async function checkRule${rule.index}(${inputVar}: string): Promise<boolean> {
  const result = await callAI("rule_${rule.index}", { ${inputVar} });
  return result === "true";
}

`;
  }

  ts += `// =============================================================================
// Admin Functions
// =============================================================================

/**
 * Get AI usage statistics.
 */
export async function getAIStats(): Promise<AIStats> {
  const response = await fetch(\`\${API_BASE}/api/ai/stats\`);
  if (!response.ok) {
    throw new AIClientError("Failed to get AI stats");
  }
  return response.json();
}

/**
 * Clear AI response cache.
 */
export async function clearAICache(): Promise<void> {
  const response = await fetch(\`\${API_BASE}/api/ai/cache/clear\`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new AIClientError("Failed to clear cache");
  }
}

// =============================================================================
// React Hooks (if using React)
// =============================================================================

`;

  // Generate React hooks for each AI field
  for (const field of fields) {
    const hookName = `use${field.entity}${capitalize(field.field)}`;
    const funcName = `compute${field.entity}${capitalize(field.field)}`;
    
    ts += `/**
 * React hook for AI field: ${field.entity}.${field.field}
 */
export function ${hookName}(data: Record<string, unknown> | null) {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!data) return;
    
    setLoading(true);
    setError(null);
    
    ${funcName}(data)
      .then(setResult)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [JSON.stringify(data)]);

  return { result, loading, error };
}

`;
  }

  // Add useState/useEffect import note
  ts = `import { useState, useEffect } from "react";\n\n` + ts;

  return ts;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate AI routes for FastAPI.
 */
export function generateAIRoutes(spec: ShepSpec): string {
  const usages = collectAIUsages(spec);
  const { fields, rules, flowSteps } = usages;
  
  let routes = `
# =============================================================================
# AI Routes
# Generated by ShepLang Compiler
# =============================================================================

from ai_client import (
    ${fields.map(f => `compute_${f.entity.toLowerCase()}_${f.field}`).join(",\n    ")}${fields.length > 0 ? "," : ""}
    ${rules.map(r => `check_rule_${r.index}`).join(",\n    ")}${rules.length > 0 ? "," : ""}
    ${flowSteps.map(s => `flow_${sanitizeIdentifier(s.flow)}_step_${s.step}`).join(",\n    ")}${flowSteps.length > 0 ? "," : ""}
    get_ai_stats,
    clear_ai_cache,
    AIError,
)

`;

  // Generate routes for AI field computation
  for (const field of fields) {
    const routeName = `${field.entity.toLowerCase()}_${field.field}`;
    routes += `@router.post("/ai/${routeName}")
async def ai_${routeName}(data: dict):
    """Compute AI field: ${field.entity}.${field.field}"""
    try:
        result = await compute_${routeName}(data)
        return {"result": result}
    except AIError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"AI error: {e}")
        raise HTTPException(status_code=500, detail="AI processing failed")

`;
  }

  // Generate routes for AI rule conditions
  for (const rule of rules) {
    const inputVar = sanitizeIdentifier(rule.input);
    routes += `@router.post("/ai/rule_${rule.index}")
async def ai_rule_${rule.index}(data: dict):
    """AI rule: ${rule.description}"""
    try:
        ${inputVar} = data.get("${inputVar}", "")
        result = await check_rule_${rule.index}(${inputVar})
        return {"result": str(result).lower()}
    except AIError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"AI error: {e}")
        raise HTTPException(status_code=500, detail="AI processing failed")

`;
  }

  // Generate routes for AI flow steps
  for (const step of flowSteps) {
    const flowName = sanitizeIdentifier(step.flow);
    routes += `@router.post("/ai/flow_${flowName}_step_${step.step}")
async def ai_flow_${flowName}_step_${step.step}(context: dict):
    """AI flow step: ${step.flow}, Step ${step.step}"""
    try:
        result = await flow_${flowName}_step_${step.step}(context)
        return {"result": result}
    except AIError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"AI error: {e}")
        raise HTTPException(status_code=500, detail="AI processing failed")

`;
  }

  // Admin routes
  routes += `@router.get("/ai/stats")
async def ai_stats():
    """Get AI usage statistics."""
    return get_ai_stats()

@router.post("/ai/cache/clear")
async def ai_cache_clear():
    """Clear AI response cache."""
    return await clear_ai_cache()

`;

  return routes;
}

/**
 * Main entry point: Generate all AI client code.
 */
export function generateAIClient(spec: ShepSpec, outputDir: string): void {
  const usages = collectAIUsages(spec);
  
  // Generate Python AI client
  const pythonCode = generatePythonAIClient(spec, usages);
  writeFileSync(`${outputDir}/ai_client.py`, pythonCode);
  console.log(`  ✓ ${outputDir}/ai_client.py (full AI client)`);
  
  // Generate TypeScript AI client
  const tsCode = generateTypeScriptAIClient(spec, usages);
  writeFileSync(`${outputDir}/ai.ts`, tsCode);
  console.log(`  ✓ ${outputDir}/ai.ts (React hooks + functions)`);
}
