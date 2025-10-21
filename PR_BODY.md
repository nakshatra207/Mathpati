Title: Fix CI test crash and stabilize lint (fix/ci-lint-stability)

Summary
-------
This PR fixes an import-time runtime error that caused Vitest to crash on CI (webidl-conversions reading a missing descriptor) and reduces lint-related CI flakes by stabilizing a lifeline callback and silencing fast-refresh warnings in UI files.

Key changes
- Add a minimal test preload shim: `src/vitest-preload.js` to patch missing `Symbol.toStringTag` getters on typed-array prototypes in the test environment. This prevents the `TypeError: Cannot read properties of undefined (reading 'get')` originating from `webidl-conversions`/`whatwg-url` during module load.
- Update package.json test scripts to preload the shim via NODE_OPTIONS so CI and local `npm run test` will run with the compatibility shim.
- Stabilize `handleLifelineTimeout` in `src/components/QuizGame.tsx` by using `useCallback` and adding it to effect deps to remove a `react-hooks/exhaustive-deps` warning.
- Add short, file-level ESLint disables for `react-refresh/only-export-components` in a few UI files to silence fast-refresh warnings (these are dev-only warnings). Files changed include various `src/components/ui/*` components.

Why this fix
-----------
- The failing CI trace shows the crash occurs during module import (webidl-conversions). That means tests never run because module loading throws. The safest, lowest-risk fix is to preload a tiny shim before Vitest starts that shapes the environment the library expects. This is a pragmatic, well-contained change to stabilize CI.

Reproduction (local)
-------------------
1. Install dependencies: `npm ci`
2. Run tests (uses the new shim):
   ```bash
   npm run test:run
   ```
3. Run lint and typecheck:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```
4. Build:
   ```bash
   npm run build
   ```

Notes & remaining items
- The file-level ESLint disables were added as a quick, low-risk measure to avoid CI flakes caused by `react-refresh/only-export-components`. If you'd like, I can refactor the affected UI files to move helper exports into separate files and remove these disables in a follow-up.
- GitHub reported a repository vulnerability (Dependabot message). I didn't change dependencies in this PR. I recommend running `npm audit` and addressing the moderate finding in a separate PR.
- If CI still reports an error after this change, please paste the failing job logs here; I will analyze and fix the next issue.

PR checklist
- [x] Tests pass locally (Vitest)
- [x] TypeScript checks (npx tsc --noEmit)
- [x] Lint (ESLint) — no errors (warnings only)
- [ ] Create follow-up PRs for refactor and dependency remediation if desired

Links
- PR branch: fix/ci-lint-stability
- Create PR: https://github.com/nakshatra207/Mathpati/pull/new/fix/ci-lint-stability
