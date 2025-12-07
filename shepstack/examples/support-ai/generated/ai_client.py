# Generated AI Client for SupportAI
# DO NOT EDIT - regenerate from .shep file
#
# This module handles all AI primitives defined in your spec.
# It uses Claude (Anthropic) by default, but can be configured for OpenAI.

import os
import json
import hashlib
from typing import Optional, Any
from functools import lru_cache
import httpx

# Configuration
AI_PROVIDER = os.getenv("AI_PROVIDER", "claude")  # "claude" or "openai"
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Cache for AI responses (simple in-memory, replace with Redis in production)
_ai_cache: dict[str, Any] = {}


async def call_ai(prompt: str, context: str = "", cache_key: Optional[str] = None) -> str:
    """
    Call the AI provider with a prompt and optional context.
    Results are cached based on the cache_key.
    """
    # Check cache first
    if cache_key:
        cache_id = hashlib.md5(f"{cache_key}:{prompt}:{context}".encode()).hexdigest()
        if cache_id in _ai_cache:
            return _ai_cache[cache_id]

    if AI_PROVIDER == "claude":
        result = await _call_claude(prompt, context)
    else:
        result = await _call_openai(prompt, context)

    # Cache result
    if cache_key:
        _ai_cache[cache_id] = result

    return result


async def _call_claude(prompt: str, context: str) -> str:
    """Call Claude API."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-3-haiku-20240307",
                "max_tokens": 1024,
                "messages": [
                    {
                        "role": "user",
                        "content": f"{prompt}\n\nContext: {context}" if context else prompt,
                    }
                ],
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        return data["content"][0]["text"]


async def _call_openai(prompt: str, context: str) -> str:
    """Call OpenAI API."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "user",
                        "content": f"{prompt}\n\nContext: {context}" if context else prompt,
                    }
                ],
                "max_tokens": 1024,
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


# =============================================================================
# AI Field Derivation Functions
# =============================================================================

async def compute_message_sentiment(data: dict) -> str:
    """
    AI-derived field: Message.sentiment
    Prompt: classify as positive, neutral, or negative
    """
    context = json.dumps(data, default=str)
    return await call_ai(
        prompt="""classify as positive, neutral, or negative

Respond with only the result, no explanation.""",
        context=context,
        cache_key=f"Message_sentiment_{hash(context) if context else 'empty'}"
    )

async def compute_message_summary(data: dict) -> str:
    """
    AI-derived field: Message.summary
    Prompt: summarize in one sentence
    """
    context = json.dumps(data, default=str)
    return await call_ai(
        prompt="""summarize in one sentence

Respond with only the result, no explanation.""",
        context=context,
        cache_key=f"Message_summary_{hash(context) if context else 'empty'}"
    )


# =============================================================================
# AI Rule Condition Functions
# =============================================================================

async def check_rule_1(message_content: str) -> bool:
    """
    AI rule condition: "Auto-escalate frustrated customers":
    Input: message.content
    Prompt: sounds frustrated or angry
    """
    result = await call_ai(
        prompt="""Analyze this text and determine if it: sounds frustrated or angry

Text: {message_content}

Respond with only "true" or "false".""",
        cache_key=f"rule_1_{hash(message_content)}"
    )
    return result.strip().lower() == "true"

async def check_rule_2(message_content: str) -> bool:
    """
    AI rule condition: "Flag potential spam":
    Input: message.content
    Prompt: looks like spam or marketing
    """
    result = await call_ai(
        prompt="""Analyze this text and determine if it: looks like spam or marketing

Text: {message_content}

Respond with only "true" or "false".""",
        cache_key=f"rule_2_{hash(message_content)}"
    )
    return result.strip().lower() == "true"


# =============================================================================
# AI Flow Step Functions
# =============================================================================

async def flow_company_uploads_knowledge_base_step_5(context: dict) -> str:
    """
    AI flow step: "Company uploads knowledge base":, Step 5
    Action: indexes it for search
    """
    return await call_ai(
        prompt="""indexes it for search

Provide a clear, actionable response.""",
        context=json.dumps(context, default=str),
        cache_key=f"flow_company_uploads_knowledge_base_step_5"
    )

async def flow_customer_asks_a_question_step_3(context: dict) -> str:
    """
    AI flow step: "Customer asks a question":, Step 3
    Action: search knowledge base for relevant articles
    """
    return await call_ai(
        prompt="""search knowledge base for relevant articles

Provide a clear, actionable response.""",
        context=json.dumps(context, default=str),
        cache_key=f"flow_customer_asks_a_question_step_3"
    )

async def flow_customer_asks_a_question_step_4(context: dict) -> str:
    """
    AI flow step: "Customer asks a question":, Step 4
    Action: generate answer based on knowledge base context
    """
    return await call_ai(
        prompt="""generate answer based on knowledge base context

Provide a clear, actionable response.""",
        context=json.dumps(context, default=str),
        cache_key=f"flow_customer_asks_a_question_step_4"
    )

async def flow_ai_escalates_to_agent_step_1(context: dict) -> str:
    """
    AI flow step: "AI escalates to agent":, Step 1
    Action: confidence score below 60 percent
    """
    return await call_ai(
        prompt="""confidence score below 60 percent

Provide a clear, actionable response.""",
        context=json.dumps(context, default=str),
        cache_key=f"flow_ai_escalates_to_agent_step_1"
    )

