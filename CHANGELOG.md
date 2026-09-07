# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-09-06

### Added

- `Cursor` 新增 `type` 属性：`default` 箭头（默认）/ `raindrop` 蓝色雨滴两种风格
- 新增 `Background` 装饰背景组件：`dots` 波点 / `sprinkles` 彩色针糖壁纸，纯 CSS + 内联 SVG 实现

### Changed

- `Cursor` 光标改为内联 SVG data URI，移除外部 SVG 图片资源（零图片依赖）

## [1.1.0] - 2026-09-05

### Removed

- 移除 `Loading`、`Time` 组件（版权整改，详见 README）
- 移除 `icon-leaf.svg` 叶子图标及 demo 位图 favicon，改为内联 SVG / 纯 CSS 实现

### Security

- 建议所有用户从 1.0.0 及以下版本升级至 1.1.0+

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
