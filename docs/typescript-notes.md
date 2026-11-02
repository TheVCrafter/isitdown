# TypeScript notes

Short notes on the setup choices and on what I learned while implementing.

## Compiler options in `tsconfig.json`

- `strict`: enables the strict type checks as a group.
- `noUncheckedIndexedAccess`: indexing an array or record may return `undefined`, so it has to be handled.
- `exactOptionalPropertyTypes`: an optional property can be missing, but cannot be set to `undefined` explicitly.
- `module` set to `nodenext` (which also selects Node's module resolution): TypeScript follows Node's ES module rules.
- `verbatimModuleSyntax`: imports and exports are kept as written, so type-only imports need `import type`.

## ES modules

- `package.json` has `"type": "module"`.
- Relative imports in TypeScript use the `.js` extension (for example `../src/index.js`), because that is the file name after compilation.

## Tooling

- ESLint uses `typescript-eslint` with the recommended rules (flat config in `eslint.config.js`).
- Prettier settings are in `.prettierrc`, with LF line endings.
- Vitest runs the tests in `tests/`. `vitest.config.ts` excludes `tests/integration`, and `vitest.integration.config.ts` includes only that folder, so the two kinds of test have separate commands.
- Helper files such as `tests/helpers/target-server.ts` are not named `*.test.ts`, so Vitest does not run them as tests.

## Types and patterns used in the code

- **Union types:** `CheckStatus` is `"up" | "down"`, so only those two strings are allowed.
- **Discriminated union:** `CheckResult` is `Responded | Failed`, told apart by the `outcome` field. Checking `result.outcome` narrows the type, so only the matching fields (`httpStatus` or `error`) are available.
- **`readonly`:** result fields cannot be changed after they are created.
- **Async code:** `checkUrl` returns a `Promise<CheckResult>` and uses `await` on the request. Errors from `fetch` are caught with `try/catch`, and the caught value is `unknown`, so it is checked with `instanceof Error`.
- **Injected dependencies:** `checkUrl` takes `fetchFn`, `now` and `timeoutMs` as options with defaults, so tests can pass fakes instead of using the network and the real clock.
- **Result objects instead of exceptions:** `validateUrl` returns `{ valid, ... }` because invalid input is expected, not exceptional.
- **Classes and interfaces:** `SqliteStorage` implements the `ResultStorage` interface, so TypeScript checks that it has every method with the right types.
- **Runtime checks on `unknown` values:** values read from the database have broad types, so each column is checked (`typeof`, comparison with the allowed strings) before it is used. After the check, TypeScript treats the value as the narrower type.
- **Two tsconfig files:** `tsconfig.json` is used by the editor and `typecheck` and includes the tests; `tsconfig.build.json` extends it and builds only `src`.
- **Return type with `null`:** `calculateUptime` returns `number | null`, so callers must handle the "no data" case before they use the number.
- **Type predicates:** `isPeriodName` returns `value is keyof typeof PERIODS`, so after the check TypeScript knows the string is one of the valid period names.
- **`as const`:** the `PERIODS` object is read-only and its keys are literal types, which makes a lookup by a checked key a plain number.
- **`??` for defaults:** `a ?? b` uses `b` only when `a` is `null` or `undefined`, so an empty string or `0` is kept. The monitor uses it for the database path.
- **Promises and `await`:** forgetting `await` on a promise-returning call (for example `storage.save`) is not a type error, but errors then escape the `try/catch`. Each missing `await` found so far changed when errors surface, not only the result.
- **Object types with methods:** the test helper returns a `TargetServer` object with a `baseUrl` and a `close()` function. The caller only sees what the type declares, not the server behind it.
