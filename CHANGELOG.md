# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-11-13

### Removed

- **The generic `<Icon name="...">` component is gone.** Icons are no
  longer part of this package — they come from the standalone
  `naive-icons-vue` package, exactly like the React build gets them
  from `naive-icons`. Every icon is its own component, imported by name:

    ```vue
    <script setup lang="ts">
    import { HeartIcon } from 'naive-icons-vue';
    </script>

    <template>
        <HeartIcon :size="32" color="#e76f51" />
    </template>
    ```

    Removed exports: `Icon` (the component), `IconProps`, `IconName`,
    `IconComponent`, `IconCategory`, `PaletteColor`, `NAIVE_PALETTE`,
    `ICON_LIST`, `ICON_NAMES`, `ICON_MAP`, `ICON_CATEGORIES`,
    `ICONS_BY_CATEGORY`, and the 731 `*Icon` component re-exports.
    `NAIVE_PALETTE` and the icon types are still available — import them
    from `naive-icons-vue` instead.

- `Divider`'s `icon` prop now takes an icon **component** instead of a
  name string: `<Divider :icon="FishIcon" />` (the icon's own `size`
  decides how big it renders; `iconSize` only drives the cycle rhythm).
  The `DividerIconName` type is removed.

### Added

- 530 new icons — the built-in set grows from 201 to 731.
- The demo's icon page now lists every icon grouped into its 18
  upstream categories, with Chinese names and a search filter.

### Changed

- `Collapse`, `Upload`, `Rate`, `Calendar` and `Avatar` import their
  icons straight from `naive-icons-vue` instead of going through an
  in-repo wrapper.
- The CJS bundle no longer inlines the icon set — `naive-icons-vue`
  stays external in both builds, so it is tree-shakeable and the
  bundle stops carrying a second copy of 731 icons.
- Requires `naive-icons-vue >= 1.16.1`.

### Fixed

- Removed the `typings/naive-icons-vue.d.ts` ambient-module shim.
  It existed only because the upstream package pointed its `exports`
  at declaration files it never shipped, which made every icon import
  resolve to `any`. Icons are now fully typed.

## [1.6.0] - 2026-11-12

### Added

- 37 new icons — the built-in set grows from 164 to 201. No existing icon
  was removed, so every named export stays source-compatible.
- New `ICON_MAP` export (icon name → icon component) for looking up an
  icon programmatically.
- `CodeBlock` now highlights shell command blocks: the command name, its
  subcommand, flags and comments each get their own color, and comments
  are rendered in italic.

### Changed

- The built-in icon set is now sourced from the `naive-icons-vue` package
  instead of in-repo SVG copies, so the icon set is upgraded by bumping a
  dependency rather than editing this repository. `Icon` renders the
  upstream icon component; the rendered output is unchanged.
- The ES bundle keeps `naive-icons-vue` external so consumers can
  tree-shake it; the CJS bundle inlines it because the upstream CJS entry
  cannot be `require`d.

### Fixed

- Corrected the documented default icon stroke: it is `#2A2A2A`, not
  `currentColor`.

## [1.5.0] - 2026-10-29

### Added

- New `CountUp` component (animated number counter — five built-in easing
  curves plus custom easing functions, decimal places and separators,
  `formatter` override, opt-in per-digit `digitRoll` rolling, celebration
  animation, auto repeat, scoped `{ value, reset }` slot) plus tests.
- New `Calendar` component (month grid — controlled / uncontrolled
  selection and panel month, event bars with cross-day spans, drag to
  create events, five color themes) plus tests.
- New `CountUpDemo` and `CalendarDemo` pages; both components are
  exported from `src/index.ts`.
- `Select` gained a searchable mode (`showSearch`, `filterOption`,
  `optionFilterProp`, `notFoundContent` and the `#not-found` slot) plus a
  one-click clear button (`allowClear`).
- `Notification` now exports its imperative API (`notificationOpen`,
  `notificationDestroy`) from the package entry.
- Icon set synced with naive-icons 1.6.0 — 101 → 164 icons (+63); no
  existing icon was removed.

### Fixed

- `Drawer` and `Modal` no longer select their own text when the panel is
  clicked — the mask disables selection while the body keeps it.
- `Drawer` depth effect now matches the React implementation: the
  `filter: blur()` (which re-rasterized the whole subtree) is replaced by
  `will-change: transform`, and the effect is skipped under
  `prefers-reduced-motion: reduce`.
- `Drawer` restores the page background when `pushBackground` is switched
  back to `false`.
- `Progress` scene-image fill (`variant`) and styling now match the React
  version; `ariaLabel` / `ariaLabelledby` added for
  `aria-progressbar-name`.
- Corrected prop names in the component docs and added missing prop docs.

### Changed

- Demo images are now bundled locally, removing the dependency on an
  external image host; photo assets are capped at 1200px wide
  (2.97 MB → 0.88 MB).

## [1.4.0] - 2026-10-08

### Added

- New `Rate` component (star rating built on native radio inputs —
  controlled `v-model` and uncontrolled `defaultValue`, custom `count`,
  hover preview, click-to-clear, roving tabindex with arrow / Home / End
  keys, sequential pop-in plus six-point splash on increase) plus tests.
- New `Badge` component (numeric / dot indicator on a `<sup>` —
  `overflowCount` clamping, `showZero`, `dot`, two sizes, 12-color
  palette, `#count` slot, standalone mode) plus tests.
- New `RateDemo` and `BadgeDemo` pages; both components are exported
  from `src/index.ts` (148 named exports).

### Changed

- Synced `AI_USAGE.md`, `PROMPT.md`, `DESIGN_PROMPT.md`, and
  `skill/SKILL.md` with the new components.

## [1.3.0] - 2026-09-16

### Added

- New `Icon` component library with 100+ inline SVG icons (original
  illustrations, no external assets) and a unified `Icon.vue`
  dispatcher backed by `_svg-data.ts`.
- New `Loading` component (snow-flake animation, 50 flakes, fade in/out
  with configurable delay and duration) plus tests.
- New `Time` component (live HH:MM clock with weekday/month-day pill)
  plus tests.
- New `LoadingDemo` and `TimeDemo` pages; `Icon` is exported from
  `src/index.ts`.

### Changed

- Standardized props/types, `index.ts` barrel exports, and styling
  conventions across 26 components (BackTop, Background, Button,
  Carousel, Checkbox, DatePicker, Divider, Drawer, Footer, Form, Image,
  Input, Modal, Notification, Progress, Radio, Select, Skeleton, Switch,
  Table, Tabs, Tag, TimePicker, Title, Tooltip, Typewriter).
- Refreshed demo pages (Background, Divider, Footer, Tooltip) to match
  updated component APIs.
- Synced `AI_USAGE.md`, `PROMPT.md`, `DESIGN_PROMPT.md`, and
  `skill/SKILL.md` with new components and conventions.

### Chore

- Ignored transient `vitest.config.ts.timestamp-*.mjs` artifacts.

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
