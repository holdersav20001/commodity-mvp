# MacroSignal Oil Build Plan

This project is being developed from the planning documents in `docs/`.

Primary references:
- `docs/PRD-MacroSignal-Oil.md`
- `docs/DESIGN-SPEC-MacroSignal-Oil.md`
- `docs/TECH-ARCH-MacroSignal-Oil.md`
- `docs/IMPLEMENTATION-PLAN-MacroSignal-Oil.md`
- `docs/DEV-TASKS-MacroSignal-Oil.md`

Current implementation strategy:
1. Build the Phase 0/1 foundation.
2. Keep schemas, provider contracts, and tests in place before visual depth.
3. Build a Red Sea case-study vertical slice first.
4. Add map layers and UI panels after case data is stable.
5. Add AI gates with a mock LLM before any real model integration.

Initial team split:
- Backend/data: `backend/**`
- Frontend shell: `frontend/src/**`
- QA/E2E/dev commands: `e2e/**` and command documentation
