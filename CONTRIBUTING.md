# Contributing

Thanks for wanting to contribute.

## Workflow

1. Fork the repo and clone your fork.
2. Create a branch and make your changes.
3. Run the checks: `pnpm run check` (build, lint, format, typecheck, tests).
4. Commit, push to your fork, and open a pull request against `main`.

## Repo conventions

- Node 22+, ESM-only JavaScript, with TypeScript `checkJs` validation (no `.ts` source).
- Add or update tests for any behavior change (see the `test/` directory).
- Keep telemetry docs minimal: usage is anonymous, carries no sensitive content, and is off unless a telemetry host is configured (`CANVAS_FLOW_TELEMETRY=0` to force off).

## Questions

Open an issue.
