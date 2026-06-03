# AccessRecord — Idea Validation

## Problem Statement

HR and IT teams at small and mid-sized companies waste hours — often entire days — manually revoking employee access when someone leaves the organization. Offboarding a single employee means logging into dozens of SaaS tools (Google Workspace, Slack, GitHub, Salesforce, Jira, AWS IAM, and more), hunting down every account associated with that person, and revoking permissions one by one. This process is error-prone, poorly documented, and routinely leaves "ghost accounts" active long after departure — creating real security and compliance exposure.

The core pain:
- **Time cost**: Manual offboarding takes 2–8 hours per employee across tools
- **Error rate**: Studies show 15–30% of departing-employee accounts remain active 30 days after termination
- **Audit gaps**: No centralized record of what was revoked, when, and by whom — a direct SOC 2 / ISO 27001 audit failure
- **No early warning**: Access granted months ago to contractors or temp staff is often forgotten entirely

## Target Market

**Primary**: Small and mid-sized businesses (SMBs), 10–500 employees
- IT administrators and HR managers who own onboarding/offboarding workflows
- Companies using 5–30 SaaS tools with no dedicated IAM team
- Industries with elevated compliance pressure: fintech, healthtech, legal, professional services, e-commerce

**Secondary**: MSPs (managed service providers) managing offboarding across multiple client orgs

**Pricing**:
| Tier | Price | Seats / Records |
|------|-------|-----------------|
| Free | $0/mo | 1 admin, up to 20 access records |
| Starter | $49/mo | Up to 5 admins, unlimited records, audit log export |
| Pro | $199/mo | Unlimited admins, integrations, Slack alerts, API access |

## Revenue Path

- **Go-to-market**: Bottom-up SaaS — free tier drives organic sign-up; usage-triggered upgrade prompts at record limits
- **Monetization engine**: Stripe Checkout subscriptions (monthly + annual, annual at 20% discount)
- **Expansion revenue**: Per-seat overages, integration add-ons (one-click SCIM connectors), white-label for MSPs
- **Year-1 target**: 200 paying customers → ~$180k ARR (blended $75/mo ARPU)
- **Capital efficiency**: Vercel + Neon Postgres = near-zero infra cost at early scale; path to profitability at <100 customers

## Why Now

1. **SOC 2 / compliance pressure is mainstream**: SOC 2 Type II is now a procurement requirement even at Series A startups. Access review evidence is one of the top audit findings. Teams that never cared about IAM now *have* to care.

2. **SaaS sprawl hit an inflection point**: The average SMB uses 130+ SaaS apps (up from 80 in 2020). Manual offboarding has become operationally impossible to do well.

3. **Recent high-profile breaches from ghost accounts**: Several 2024–2025 incidents (Okta, Snowflake-adjacent) were traced to stale credentials. Security consciousness is high.

4. **No dominant SMB solution**: Enterprise IAM (Okta, SailPoint) starts at $8–$15/user/month with 6-month implementation. SMBs are massively underserved — no product owns this space for teams under 500.

5. **AI-assisted integrations unlock the long tail**: LLM tooling makes it feasible to build lightweight connectors to hundreds of SaaS tools without a large engineering team, compressing time-to-integration dramatically.

## Unfair Advantages

- **Simple, opinionated UX**: Enterprise IAM is complex by design. AccessRecord does one thing: track and revoke access records with a full audit trail.
- **Compliance-first output**: Every action produces an exportable audit log formatted for SOC 2 reviewers — not an afterthought.
- **Network effects**: As more orgs use AccessRecord, aggregate anonymized data on which tools are hardest to offboard creates a flywheel for prioritizing integrations.
