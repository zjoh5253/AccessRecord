# AccessRecord

Initial scaffold for repository setup and reliability-gated CI/CD.

## Local checks

```bash
npm ci
npm run lint
npm run typecheck
npm test
```

## PostgreSQL provider decision

Neon is the selected provider for initial PostgreSQL setup.

Reasons:
- Fast setup with a single pooled connection string (`DATABASE_URL`) that works directly with `pg`.
- Native branching and serverless-friendly defaults suitable for preview/development workflows.
- Lower integration overhead than introducing Supabase-specific auth/storage components for this task.

### Required environment variables

- `DATABASE_URL`: Neon pooled Postgres connection string (required).
- `DATABASE_URL_DIRECT`: Neon direct connection string for migrations/maintenance (optional but recommended).

### Connection proof command

```bash
npm run db:check
```

This command connects using `DATABASE_URL` and prints current database/user/version metadata.

## CI/CD

- `.github/workflows/ci.yml` runs lint, typecheck, and tests on PRs and pushes to `main`.
- `.github/workflows/vercel-preview.yml` builds and deploys Vercel preview environments for PRs.

## Required repository configuration

Set these GitHub repository secrets before preview deploys will work:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Enable branch protection on `main` and require both workflow checks to pass.
