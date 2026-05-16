hello world
hello world

# Grok_Alice Agent Context & Architecture Notes

## Inbox/Outbox System
We need a persistent inbox/outbox architecture for Alice/Grok agents. 
- **Inbox**: Tasks, messages, handoffs from Jared or other agents. 
- **Outbox**: Outputs, updates, brain pushes. 
This allows reliable multi-agent coordination and state across sessions.

## X.com Post Feed Integration
Build a way to feed @JaredEdwardsPM X.com posts into the inbox/outbox + brain.json. 
Even if using web search / x_keyword_search / x_semantic_search as fallback (no direct API keys needed here). 
All agents/LLMs can pull recent posts for rich context on my thinking, priorities, and work.

## RSS Feed Integration Suggestion
Add RSS polling for blogs, GitHub releases, news, etc. Ingest into inbox for automated updates. Simple Python + feedparser example possible.

## X API Rate Limits
v2 API has strict limits (e.g. ~300-500 tweets/search per 15min window depending on tier). 
Use caching, backoffs, and web/search fallbacks to stay reliable.

## Web Search Code Example (Python fallback)
```python
import requests
# Example using search tools or direct
query = "from:JaredEdwardsPM"
# Integrate with x_keyword_search or web_search results into inbox.md
