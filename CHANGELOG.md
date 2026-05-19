# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Styling** — migrated all 19 components from Tailwind CSS v4 to Less +
  BEM with CSS custom properties for runtime theme overrides
  (`src/styles/variables.less`, `themes/default.less`, `reset.less`).

## [0.1.0] - 2026-05-19

### Added

Initial release. Vue 3 port of `animal-island-ui`, rebuilt on Less +
CSS Custom Properties.

- **Scaffold** — Vue 3.5 + TypeScript 5.7 + Vite 7 (library mode) + Less
- **Basic components** — `Icon`, `Button`, `Divider`, `Cursor`, `Loading`
- **Form components** — `Input`, `Switch`, `Checkbox`, `Select`, `Tabs`
- **Container components** — `Card`, `Collapse`, `Modal`, `Footer`
- **Display components** — `Time`, `Typewriter`, `CodeBlock`, `Table`, `Phone`
- **Theme tokens** — full design-token set in `src/styles/variables.less`,
  exposed as CSS custom properties for runtime overrides
- **Fonts** — Nunito, Noto Sans SC, Zen Maru Gothic via `@fontsource`
- **Documentation** — VitePress site with guides + 19 component pages and live demos
- **Build output** — dual ESM / CJS, `.d.ts` via `vite-plugin-dts`, tree-shakable

[Unreleased]: https://github.com/guokaigdg/animal-island-ui/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/guokaigdg/animal-island-ui/releases/tag/v0.1.0
