# AccessRecord — Idea Validation

## Problem Statement

HR and IT teams waste hours — often days — manually revoking employee access across dozens of SaaS tools, cloud accounts, and internal systems when someone offboards. Mistakes are costly: ex-employees retain access to Salesforce, GitHub, AWS, Slack, and Notion long after their last day. This creates security exposure, compliance failures, and audit findings that can jeopardize SOC 2 certification and enterprise sales.

The status quo is a checklist in a Google Doc or Confluence page, manually worked through by a stressed IT admin. There is no audit trail, no guarantee of completion, and no way to prove to auditors that revocation happened on time.

## Target Market

**Primary:** SMBs with 10–500 employees that are pursuing or maintaining SOC 2 compliance.

- Fast-growing startups hiring rapidly (and offboarding just as fast)
- Companies with distributed IT (no dedicated IAM team)
- Companies that have recently failed a SOC 2 audit or received a finding around access control

**Pricing:** $0 free tier (up to 5 users, manual revocation tracking) → $49/mo Starter (unlimited users, integrations with 3 systems) → $199/mo Pro (unlimited integrations, automated revocation, audit-ready reports, Slack notifications)

## Revenue Path

- **Distribution:** Stripe-powered subscription, in-app upgrade flow
- **Freemium → paid conversion:** Free tier provides the core access-record ledger; paid tiers unlock automation, integrations, and audit exports
- **Land and expand:** One IT admin signs up, invites team members; as the integration library grows, stickiness increases and upsell to Pro becomes natural
- **Estimated ARR at 100 paying customers:** ~$80K (blended $67/mo average)

## Why Now

1. **SOC 2 is now table stakes.** Enterprise buyers require it. Mid-market buyers increasingly require it. SMBs pursuing their first SOC 2 are the fastest-growing segment of compliance tooling buyers.

2. **The offboarding problem is getting worse.** Remote-first workforces use more SaaS tools than ever — the average SMB now has 130+ SaaS apps. Manual checklists don't scale.

3. **Regulation is tightening.** GDPR, CCPA, and emerging state-level privacy laws create legal exposure for retaining ex-employee access. Fines and litigation risk are real and growing.

4. **No dominant SMB solution.** Enterprise IAM (Okta, SailPoint) is too expensive and complex for sub-500-employee companies. The SMB market has no well-known, affordable, purpose-built offboarding access tool.

5. **AI-assisted integrations make automation cheap.** New API tooling and AI-assisted integration development means we can ship integrations with top SaaS tools (GitHub, Slack, Google Workspace, AWS) faster than ever before.
