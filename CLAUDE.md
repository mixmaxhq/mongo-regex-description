# mongo-regex-description — repo card

> A map, not a manual. Keep it ~1 screen; point to detail, don't inline it.

## What it is

Published npm library that converts a human-readable filter description (`{ operator, value }` — 8 operators: `contains`, `does not contain`, `is`, `is not`, `is empty`, `is not empty`, `starts with`, `ends with`) into a Mongo `$regex` query value, and parses one back. Exports `create(operator, value)`, `parse(query)`, and `supportedOperators`; built for rule/filter UX on top of regexes. Dormant (last publish 2022, last code change 2023) but stable and in production use.

## serves

role: description ↔ Mongo `$regex` query conversion (`create`/`parse`) for filter and rule UX
referenced-by: [app, notifications, rule-distribution]

## Code map

- Entire implementation (create, parse, escaping) -> src/index.js
- Tests -> spec/src/indexSpec.js
- Browser bundle build (dist/browser) -> rollup.config.js
- CI + npm publish pipeline -> Jenkinsfile

## Conventions

- npm (package-lock.json); Jasmine 2 tests (config: spec/support/jasmine.json); ESLint (eslint-config-mixmax) + Prettier
- `main` serves src/index.js directly; Rollup builds a CJS browser bundle to dist/browser/index.js on `prepublishOnly`
- CI/publish via Jenkins `npmModulePipeline` (scm-service-library) — no GitHub Actions; published unscoped to public npm (MIT); Renovate manages deps

## Run / test

- `npm install`
- `npm test` — Jasmine specs
- `npm run lint`
- `npm run build` — Rollup browser bundle
- `npm run ci` — lint + test (what Jenkins runs)

## Load the matching domain card

- Cross-cutting library — load the consuming capability's card, not a domain-* for this repo.
