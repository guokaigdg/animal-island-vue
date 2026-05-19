# Contributing

Thanks for your interest in `animal-island-vue`. This document covers the local
workflow and a few conventions worth knowing before opening a PR.

## Development setup

```bash
npm install
npm run docs:dev   # VitePress site with live component demos
npm run build      # build the library to dist/
npm run typecheck  # vue-tsc strict type check
npm run test       # vitest
```

Node 18+ is recommended.

## Project layout

```
src/
  components/   # one folder per component (.vue + index.ts)
  styles/       # variables.less, themes/default.less, reset.less, index.less
  index.ts      # public entry — every exported component must be listed here
docs/
  .vitepress/   # site config + theme overrides
  guide/        # narrative docs
  components/   # one .md per component, with a live demo block
```

## Conventions

- **Less + BEM.** Build component styles in scoped `<style lang="less">`
  blocks using BEM naming (`.animal-btn`, `.animal-btn--primary`,
  `.animal-btn__icon`). Import shared tokens with
  `@import '@/styles/variables.less'`.
- **Design tokens.** New colors / spacing / radii belong in
  `src/styles/variables.less` (Less variables) and are exported as CSS
  custom properties via `src/styles/themes/default.less` — not hard-coded
  in components.
- **TypeScript strict.** No `any` in public APIs. Prefer `defineProps<Props>()`
  generics, and re-export prop types from each component's `index.ts`.
- **Composition API + `<script setup>`** for all components.
- **Docs alongside code.** Every new component needs a page under
  `docs/components/<name>.md` with: live demo, code snippet, props/events/slots
  table; and a sidebar entry in `docs/.vitepress/config.ts`.

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(button): add ghost variant
fix(modal): close on Escape when typewriter is animating
docs(table): document slot rendering
```

## Pull requests

1. Fork and create a feature branch.
2. Run `npm run typecheck && npm run build && npm run docs:build` locally.
3. Update `CHANGELOG.md` under `## [Unreleased]`.
4. Open the PR with a short summary and screenshots / GIFs for visual changes.
