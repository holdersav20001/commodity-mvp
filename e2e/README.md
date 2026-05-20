# MacroSignal Oil E2E

Playwright smoke tests for the MacroSignal Oil web app.

## Commands

```bash
npm install
npm run install:browsers
npm test
```

By default, Playwright starts the frontend with:

```bash
npm --prefix ../frontend run dev -- --host 127.0.0.1 --port 5173
```

To point tests at an already running app:

```bash
E2E_BASE_URL=http://127.0.0.1:5173 npm test
```

The smoke test intentionally checks for `MacroSignal Oil` because TASK-006 depends on the product shell from TASK-001.
