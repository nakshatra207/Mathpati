<!-- Describe the change and why it matters -->

## Summary

Fix CI test crash caused by a runtime error inside `webidl-conversions` during module load in the test environment. Adds a small preload shim and stabilizes a few lint warnings so CI is reliable.

## Changes
- `src/vitest-preload.js`: preload shim for test env compatibility
- `package.json`: preload shim via NODE_OPTIONS in `test` and `test:run` scripts
- Minor code changes to stabilize hooks and silence fast-refresh warnings

## How to test locally
1. npm ci
2. npm run test:run
3. npm run lint && npx tsc --noEmit

## Notes
- This PR contains file-level ESLint disables for dev tooling warnings; follow-up refactor is recommended to remove those.

## Checklist
- [x] Tests pass locally
- [x] Lint & typecheck pass locally
- [ ] Address dependency vulnerabilities in separate PR
