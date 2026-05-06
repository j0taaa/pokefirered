# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mainRoute.spec.ts >> Main route: Badge-to-Hall-of-Fame >> new game: canvas, HUD, and debug hooks are available
- Location: e2e/mainRoute.spec.ts:44:3

# Error details

```
Error: Channel closed
```

```
Error: page.waitForSelector: Target page, context or browser has been closed
Call log:
  - waiting for locator('canvas') to be visible

```

```
Error: browserContext.close: Target page, context or browser has been closed
```