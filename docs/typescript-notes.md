# TypeScript notes

Short notes on the setup choices. Extend this file with things learned while implementing.

## Compiler options in `tsconfig.json`

- `strict`: enables the strict type checks as a group.
- `noUncheckedIndexedAccess`: indexing an array or record may return `undefined`, so it has to be handled.
- `exactOptionalPropertyTypes`: an optional property can be missing, but cannot be set to `undefined` explicitly.
- `module` and `moduleResolution` set to `nodenext`: TypeScript follows Node's ES module rules.
- `verbatimModuleSyntax`: imports and exports are kept as written, so type-only imports need `import type`.

## ES modules

- `package.json` has `"type": "module"`.
- Relative imports in TypeScript use the `.js` extension (for example `../src/index.js`), because that is the file name after compilation.

## Tooling

- ESLint uses `typescript-eslint` with the recommended rules (flat config in `eslint.config.js`).
- Prettier settings are in `.prettierrc`, with LF line endings.
- Vitest runs the tests in `tests/`.
