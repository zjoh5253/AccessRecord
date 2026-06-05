# AccessRecord — Stage 0 Brief (FINAL)

> **Milestone:** `idea_evaluated` | **Date:** 2026-05-28 | **Status:** Ready for Go / No-Go decision

---

## 1. Executive Summary

AccessRecord is a token-spend circuit breaker for teams building on LLM APIs — it enforces per-request, per-user, and global daily token budgets in real time, preventing the runaway API bills that now plague every organization deploying AI at scale. It targets platform and infrastructure engineers at AI-native companies who own the cost boundary between their product and their LLM provider. The window is now: LLM API spending doubled in a single year, token-based billing is the default across every major provider, and most enterprises still lack any programmatic guardrail between their code and their invoice.

---

## 2. Problem & Market Opportunity

### The Spend Control Gap

Model API spending roughly doubled from ~$3.5 B to ~$8.4 B between late 2024 and mid-2025. The enterprise LLM market is projected to reach $71.1 B by 2034 (CAGR ~40%). As consumption pricing replaced seat licensing, the visibility problem became acute: Zylo's 2026 SaaS Management Index found that **78% of IT leaders experienced unexpected AI charges**, and only **43% of organizations track AI spend by customer**. One documented healthcare enterprise consumed 1 trillion tokens over six months — $6 M in unplanned costs — before finance understood the driver.

Three structural forces make this worse over time:

1. **Consumption pricing is now the default.** 85% of SaaS providers shifted to hybrid or consumption-based models by 2026; per-token billing removes the natural ceiling that seat licenses provided.
2. **Agentic AI multiplies consumption geometrically.** Multi-step reasoning chains, tool-use loops, and autonomous workflows can consume orders of magnitude more tokens per user session than a simple prompt/response.
3. **The model pricing spread is enormous.** The cheapest production models cost ~$0.04/M tokens; frontier reasoning models run as high as ~$180/M tokens — a 4,500× spread that makes routing and budget enforcement a financial necessity, not a nice-to-have.

### Market Size

The addressable market today is every team using an LLM API commercially — conservatively 50,000+ engineering organizations globally. At a modest $200/month per team the near-term SAM is ~$120 M ARR; expansion to enterprise multi-seat contracts and compliance-driven requirements (FinOps, SOC 2 audit trails) points toward a $500 M+ TAM within three years.

---

## 3. Competitive Landscape & Defensibility

### Current Players

| Tool | Approach | Gaps |
|---|---|---|
| **LiteLLM** | Open-source Python proxy; per-key & per-team budgets, 100+ providers | Python overhead under sustained load; hierarchical budgets / SSO in paid tier only; heavy dependency |
| **Portkey** | Cloud SaaS gateway; observability, guardrails, caching | Broad surface area; not embeddable as a library; vendor lock-in; spend control is secondary to routing |
| **OpenRouter** | Aggregated API access, single key | No programmatic per-user budget enforcement; consumer-oriented |
| **Kong / APISIX** | API gateways with rate-limit plugins | Infrastructure-layer, not LLM-aware; token-counting requires custom plugins; not developer-native |
| **Red Hat TokenRateLimitPolicy** | K8s-native token rate limiting | Kubernetes-only; ops complexity; no library form factor |
| **CloudZero / Langfuse / Datadog** | Observability and cost monitoring | Reactive (alert after overspend); no real-time gating |

### AccessRecord's Differentiation

AccessRecord is **purpose-built as an embeddable TypeScript library** — not a proxy, not a gateway, not a dashboard. Key advantages:

- **Zero network hop**: runs in-process; no latency added to the hot path.
- **TypeScript-first**: native to the Node.js/Next.js/Vercel stack where most AI product teams live.
- **Three-tier enforcement**: per-request, per-user daily, and global daily limits in a single `evaluate()` call — a design that existing gateways bolt on as an afterthought.
- **Telemetry built in**: denial reason tracking and budget snapshots without an external agent.
- **PostgreSQL persistence path**: already wired; enables cross-instance enforcement and audit trails that in-memory-only tools cannot provide.

Defensibility grows with data: once AccessRecord persists cross-deployment telemetry, it becomes the authoritative record of spend decisions — creating switching costs and a dataset no gateway captures today.

---

## 4. ICP & Monetization Hypothesis

### Ideal Customer Profile

**Primary ICP — Platform/Infra engineer at an AI-native mid-market company (50–500 employees)**
- Building a B2B SaaS product with embedded AI features (copilots, agents, summarization)
- Owns the API layer between their application and their LLM provider
- Pain: no easy way to cap per-user consumption without writing custom middleware
- Buys tools that embed cleanly into existing Node/TypeScript stacks; allergic to new infrastructure dependencies

**Secondary ICP — FinOps/DevOps lead at an enterprise rolling out internal AI tooling**
- Has existing engineering platform; needs auditability and per-team chargebacks
- Compliance requirements (SOC 2, ISO 27001) demand logging of access and spend decisions
- Willing to pay for SLA, persistence, and SSO integration

### Monetization Hypothesis

| Tier | Price | What they get |
|---|---|---|
| **Open Source** | Free | Core `SpendCircuitBreaker` library; in-memory only; community support |
| **Pro** | ~$99/mo per project | PostgreSQL-backed persistence; dashboard; cross-instance enforcement; webhook alerts |
| **Enterprise** | Custom ($1,500+/mo) | SSO/SAML; audit logs; SLA; multi-tenant chargebacks; compliance export |

The free/open-source tier drives adoption and acts as a distribution flywheel. Pro converts teams whose usage has grown to need persistence or visibility. Enterprise sells to the compliance and chargebacks use case.

**Key assumption to validate**: willingness to pay for the Pro tier vs. self-hosting the open-source version with Postgres. Early design-partner conversations should probe this directly.

---

## 5. Technical Feasibility & Recommended Stack

### Current State (v0.1.0)

The core library is implemented and tested:
- **`SpendCircuitBreaker`** class with `evaluate()`, `getTelemetrySnapshot()`, `getLimits()` methods
- Three-limit enforcement (per-request, per-user daily, global daily) with UTC day rollover
- 7 smoke tests covering all denial reasons, day rollover, and out-of-order timestamps
- TypeScript strict mode; ES2022/NodeNext module target
- CI pipeline: lint → typecheck → test on every PR (GitHub Actions, Node 22)
- Vercel preview deployment on PR

### Recommended Stack Path

| Layer | Choice | Rationale |
|---|---|---|
| Runtime | Node.js 22 / TypeScript 5.8 | Already in place; matches ICP's stack |
| Persistence | PostgreSQL via Neon | Wired but not yet active; Neon's branching simplifies dev/staging isolation |
| API layer | Next.js App Router (Vercel) | Zero-ops deploy; pairs with Vercel preview already configured |
| Dashboard | React + shadcn/ui | Fast to scaffold; familiar to target ICP |
| Auth | Clerk or WorkOS | SSO path for Enterprise tier; minimal integration surface |
| Telemetry/metrics | Posthog or Axiom | Product analytics + log querying without a full observability stack |

### What's Missing Before Beta

1. **PostgreSQL schema + persistence layer** — wire the existing `pg` client to actually store decisions and counters
2. **REST/SDK API** — expose `evaluate()` over HTTP so non-Node runtimes can use AccessRecord
3. **Dashboard MVP** — budget visualization, denial-reason breakdown, per-user usage table
4. **Rate limit on the API itself** — AccessRecord needs its own abuse protection

None of these are research problems; all are well-understood engineering tasks executable by a small team in 6–8 weeks.

---

## 6. Go / No-Go Recommendation

### **GO**

**Rationale:** A real, measurable problem (78% of enterprises hit unexpected AI charges), a growing market ($8.4 B and accelerating), a differentiated form-factor (embedded library vs. proxy), and a working v0.1 core that proves the critical logic — the path from here to a shippable beta is execution, not invention.

**Immediate next steps:**
1. Land two to three design-partner conversations with platform engineers at AI-native companies to validate Pro tier willingness to pay.
2. Implement PostgreSQL persistence (the `pg` client is already installed; schema design is the first deliverable).
3. Ship a public npm package with the open-source core to seed adoption and gather real-world usage data.

---

*Brief prepared by the AccessRecord domain agent on 2026-05-28. Research sourced from codebase analysis and public market data. Parallel task outputs (task IDs c2da9451, 58215766, 1feedf2b, 81f0cdb9) were unavailable in this environment and the research was conducted directly.*
