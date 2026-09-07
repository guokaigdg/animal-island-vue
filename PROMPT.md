# animal-island-vue 一键提示词

> 给普通用户使用的 self-contained 提示词。把下面整块代码块复制到 Cursor / Claude / ChatGPT / v0 / Bolt / Lovable / Windsurf 等任意 AI 编程工具发送即可。
>
> **AI 会先反问你想做什么页面**（例如「做一个个人博客」、「做一个商品列表」、「做一个 FAQ 页面」），你回答后它再输出**一个 self-contained `index.html` 文件**，**保存后双击即可在浏览器预览**——不需要 npm、不需要打包工具、不需要任何安装。
>
> - **最后同步**：v0.9.5 / 2026-06-02。
> - **真实数据源**：`src/styles/variables.less` + 各组件 `*.less`。
> - **冲突处理**：本文件与源码冲突时，**以源码为准**。新增 / 修改组件时请同步更新本文件。
> - **要 100% 像素级还原**：项目内直接 `npm i animal-island-vue` + `import` 真实组件。

---

````markdown
You are a senior Vue 3 engineer. Generate a **single self-contained `index.html` file** that the user can save to disk and double-click to preview in a browser. It must PERFECTLY match the visual style of the npm package "animal-island-vue" (a natural, cute island-style Vue 3 component library, v0.9.5).

## OUTPUT REQUIREMENTS

- **DELIVER A SINGLE SELF-CONTAINED `index.html` FILE** that the user can save to disk and **double-click to preview directly in any modern browser** — NO build step, NO npm install, NO bundler. The user is non-technical.
- The HTML must use this CDN script inside `<head>` (Vue 3 global build — includes the in-browser template compiler so `template: \`...\`` strings work):
    ```html
    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
    ```
- Write the page logic as a single plain `<script>` block at the bottom of `<body>`. NO Babel, NO `<script type="text/babel">`, NO JSX, NO `.vue` SFC files. Each library component is a plain options object with `props`, `emits`, `setup()` (or `data()`), and a `template: \`...\`` string. Use Vue 3's global API (`Vue.ref`, `Vue.reactive`, `Vue.computed`, `Vue.onMounted`, `Vue.watch`, etc.) — these are all attached to the global `Vue` object exposed by the global build.
- Mount target: `<div id="app"></div>` inside `<body>`. Use `Vue.createApp(App).mount('#app');`.
- Put ALL CSS inline in a single `<style>` block in `<head>` (design tokens on `:root`, then component classes). Do NOT depend on external CSS frameworks. Tailwind is forbidden in this output mode.
- Inject the Modal SVG `<defs>` clip-path block (see Modal section) once at the top of `<body>` so `clip-path: url(#animal-modal-clip)` resolves.
- Every value below is exact. Do NOT round, approximate, or substitute "close" colors.
- The npm package `animal-island-vue` is NOT available via UMD CDN in this offline-HTML mode, so you must **hand-roll the library's components inline as Vue 3 components that mirror the real library's API** (component names, prop names, prop values, `v-model` semantics, slot names). **Always prefer the library API over raw HTML.** Concretely:
    - At the top of the `<script>` block, define inline Vue components with the EXACT names the library exports: `BackTop`, `Button`, `Input`, `Switch`, `Checkbox`, `Radio`, `Card`, `Title`, `Tabs`, `Collapse`, `Modal`, `Select`, `Skeleton`, `SkeletonAvatar`, `SkeletonButton`, `SkeletonInput`, `Tooltip`, `Loading`, `Table`, `Time`, `Divider`, `Footer`, `Cursor`, `Typewriter`, `CodeBlock`. Each component must accept the documented props (e.g. `<Card color="default">`, `<Button type="primary" size="large">`, `<Title color="app-teal" size="large">`, `<Switch v-model="checked" />`).
    - In the page (root `App` component), **compose the UI exclusively with these components in the `template` string** — do NOT write `<div class="card">` / `<button class="btn">` etc. inline. The page should read like real animal-island-vue usage.
    - Only fall back to raw HTML (`<div>`, `<span>`, `<h1>`, `<img>`, layout helpers, page-specific decorations, app-specific widgets) when no library component covers the use case (e.g. page layout, header bar, two-column grid, custom illustration). In that case, still use the design tokens (`var(--text-body)`, `var(--bg-content)` …) instead of raw colors.
    - Forbidden: native `<button>`, native `<input>`, native `<select>`, native checkbox/radio used as visible UI. They MUST be wrapped by the inline `Button` / `Input` / `Select` / `Checkbox` / `Radio` components defined above.
- Vue idioms (don't accidentally write React):
    - Use `class=` (NOT `className=`).
    - Use `@click` (NOT `onClick={...}`), `@input`, `@change`, etc.
    - Two-way bind text inputs / checkbox / switch / select with `v-model` (e.g. `<Input v-model="name" />`, `<Switch v-model="enabled" />`). Internally components use `props.modelValue` + `emit('update:modelValue', next)`. NEVER use a React-style `:value="x" @change="x = ..."` controlled pair.
    - Use `Vue.ref()` for reactive scalars, `Vue.reactive()` for objects, `Vue.computed()` for derived state, `Vue.onMounted()` for mount effects, and a string `ref="el"` on the template + `Vue.ref(null)` in setup for template refs (NOT React's `useRef`/`useState`).
    - Use `v-if` / `v-else` / `v-for="(item, i) in list" :key="i"` for rendering lists (NEVER `array.map(...)` inside a template). Always supply `:key`.
    - Slots replace React children-as-render-prop: use `<slot />`, named slots `<slot name="icon" />`, and at the call site `<template #icon>...</template>`.
    - Use `:prop="expr"` for dynamic binding and `prop="literal"` for static strings.
- The file must work with **zero network access except for the unpkg CDN + Google Fonts** — no other external dependencies.

## TECH STACK CONSTRAINTS

- Fonts: Nunito + Noto Sans SC ONLY. Add to <head>:
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet" />
- Body font-family: Nunito, 'Noto Sans SC', -apple-system, 'PingFang SC', sans-serif;
- Body weight 500, button/heading 600–700, time/Title-ribbon 900, placeholder 400.
- Letter-spacing: body 0.01em, button/heading 0.02em.
- NEVER use system monospace for UI text. Use it only for code blocks.

## DESIGN TOKENS (paste these into :root)

```css
:root {
    /* primary mint teal */
    --primary: #19c8b9;
    --primary-hover: #3dd4c6;
    --primary-active: #11a89b;
    --primary-bg: #e6f9f6;

    /* warm-brown text */
    --text: #794f27; /* headings / sidebar */
    --text-body: #725d42; /* in-component body */
    --text-secondary: #9f927d;
    --text-muted: #8a7b66;
    --text-disabled: #c4b89e;

    /* parchment background */
    --bg: #f8f8f0;
    --bg-content: rgb(247, 243, 223); /* card / modal / table inside */
    --bg-disabled: #f0ece2;

    /* borders */
    --border: #c4b89e;
    --border-hover: #a89878;
    --border-strong: #9f927d;

    /* status */
    --success: #6fba2c;
    --success-active: #5a9e1e;
    --warning: #f5c31c;
    --warning-active: #dba90e;
    --error: #e05a5a;
    --error-active: #c94444;

    /* game-special */
    --focus-yellow: #ffcc00; /* Input/Switch/Checkbox focus — NOT blue */
    --focus-yellow-d: #e0b800;
    --focus-yellow-radio: #f5c31c; /* Radio uses warmer yellow */

    /* 3D shadow taupe */
    --shadow-btn: #bdaea0;
    --shadow-input: #d4c9b4;
    --shadow-switch: #5a9e1e;

    /* radii */
    --r-sm: 12px;
    --r-base: 18px;
    --r-lg: 24px;
    --r-pill: 50px;

    /* motion */
    --ease: cubic-bezier(0.4, 0, 0.2, 1);
    --d-fast: 0.15s;
    --d-base: 0.25s;
    --d-slow: 0.35s;
}
```

## SHADOW SYSTEM (CRITICAL — do not over-apply)

- ONLY `Button(type="primary"|danger+primary)` uses the 3D pixel-stack shadow `0 Npx 0 0 [color]`. Hover lifts +1 (taller shadow), active sinks -1 (shorter shadow).
- `Switch` does NOT have any outer 3D pixel-stack shadow. The track has an INSET shadow only: `inset 0 2px 4px rgba(114,93,66,0.15)` (off) / `inset 0 2px 4px rgba(90,158,30,0.20)` (on). The handle is a flat circle with 2.5px border and NO box-shadow.
- `Input` does NOT show any shadow by default (`shadow` prop defaults to `false`). Only when explicitly opted-in does it apply the 3D pixel-stack shadow described in the Input section. (Status error/warning shadows render regardless.)
- `default`/`dashed`/`text`/`link` buttons use a soft elevation only:
  rest: box-shadow: 0 2px 4px 0 rgba(61, 52, 40, 0.06);
  hover: box-shadow: 0 3px 10px 0 rgba(61, 52, 40, 0.10); transform: translateY(-1px);
- Cards have NO box-shadow. They float on hover with `transform: translateY(-2px);` only. Pattern variants add a 1.5px solid border in the palette hue.
- Switch handle stays vertically centered via `transform: translateY(-50%);` and has a 2.5px border but NO `box-shadow` of its own. Track has only inset shadow (see SHADOW SYSTEM above).

## COMPONENT SPECS (29 named exports = 28 components + 1 export-button companion)

### BackTop (返回顶部)

- 钱袋图标浮窗，滚动到 `visibilityHeight` 时显示
- Props: `target` (() => HTMLElement | Window), `visibilityHeight` (number, default 400), `onClick` (() => void), `className` (string), `style` (CSSProperties | string), `duration` (number, default 300)
- Vue API: `<BackTop />` — 无子组件，无额外类型导出

### Button (3 sizes × 5 types)

- Sizes (height / padding-x / font-size / radius):
  small 32px / 16px / 12px / 16px
  middle 45px / 20px / 14px / 50px ← default
  large 48px / 32px / 16px / 24px
- font-weight 600, letter-spacing 0.02em, line-height 1, border-width 2px.
- type="primary":
  color #794f27; bg #f8f8f0; border #f8f8f0;
  rest: box-shadow: 0 5px 0 0 #bdaea0;
  hover: box-shadow: 0 6px 0 0 #bdaea0; transform: translateY(-1px);
  active: box-shadow: 0 1px 0 0 #bdaea0; transform: translateY(2px);
  focus-visible: outline 2px solid #19c8b9; outline-offset 2px;
- `:danger="true"` + primary: same shape, replace #bdaea0 with #c94444. Text white.
- type="default" / "dashed": bg #f8f8f0, border 2px solid #9f927d (dashed: dashed style),
  rest: box-shadow 0 2px 4px 0 rgba(61,52,40,0.06);
  hover: color/border #19c8b9; box-shadow 0 3px 10px 0 rgba(61,52,40,0.10); transform translateY(-1px);
  active: color/border #11a89b; transform translateY(0); box-shadow back to rest.
- type="text" / "link": no border, no rest shadow; same hover color rules.
- loading state: replace bg with diagonal stripe animation:
  background: #0ec4b6;
  background-image: repeating-linear-gradient(-45deg, #0ec4b6 0 10px, #01b0a7 10px 20px);
  background-size: 28.28px 28.28px;
  border: 4px solid #4de2da; color: #fff; box-shadow: none;
  animation: btn-loading 1s linear infinite;
  @keyframes btn-loading { to { background-position: -28.28px 0; } }
- disabled: opacity 0.5; cursor not-allowed; remove shadow.
- `ghost` prop: transparent bg, no box-shadow (keeps border + text color of the chosen type).
- `block` prop: `display: flex; width: 100%`.
- Vue API: `<Button type="primary" size="large" :danger="false" :loading="busy" :disabled="locked" html-type="submit" @click="onSave">Save</Button>`. Default slot for label content. Real lib props: `type`, `size`, `danger`, `ghost`, `block`, `loading`, `disabled`, `htmlType` (NOT `type="danger"` — danger is its own boolean flag).

### Input (3 sizes)

- **Default `:shadow="false"`** — no box-shadow at rest. The `shadow / hover / focus` shadow values below ONLY apply when the user opts in via `shadow` prop. Status (error/warning) and focus rings render regardless.
- Sizes (height / padding-x / font-size / radius / opt-in-shadow):
  small 32px / 14px / 12px / 40px / 0 2px 0 0 #d4c9b4
  middle 40px / 18px / 14px / 50px / 0 3px 0 0 #d4c9b4
  large 48px / 22px / 16px / 50px / 0 4px 0 0 #d4c9b4
- bg rgb(247, 243, 223); border 2px solid #c4b89e; color #725d42; weight 500; letter-spacing 0.01em.
- placeholder color #c4b89e; weight 400.
- prefix/suffix color #a0936e; gap 6px (use `<template #prefix>` / `<template #suffix>` slots).
- hover: border #a89878. (If `shadow` opt-in: also shadow 0 3px 0 0 #c4b89e.)
- focus: border #ffcc00; box-shadow 0 0 0 3px rgba(255,204,0,0.15). (If `shadow` opt-in: also 0 3px 0 0 #e0b800.)
- error: shadow 0 3px 0 0 #c94444. warning: shadow 0 3px 0 0 #dba90e. (status shadows render regardless of `shadow` prop.)
- disabled: bg #ece8dc; color #c4b89e; border #d4c9b4; opacity 0.6; no shadow.
- clear button: 20×20 circle, color #c4b89e, hover bg rgba(114,93,66,0.1) + color #725d42.
- Vue API: `<Input v-model="name" placeholder="..." size="middle" :allow-clear="true" status="error" :shadow="false" />`. Internally: `props.modelValue` + `emit('update:modelValue', e.target.value)`. Slots `#prefix` / `#suffix`. NEVER expose a `:value` + `@change` controlled pair.

### Switch (default 52×28 / small 38×20)

- Track: min-width 52px (small 38px); height 28px (small 20px); border-radius 50px; bg `#d4c9b4`; border `2.5px solid #c4b89e`; inset shadow `inset 0 2px 4px rgba(114,93,66,0.15)`. NO outer box-shadow.
- Handle: 21×21 circle (small 14×14); bg `rgb(247,243,223)`; border `2.5px solid #c4b89e`; border-radius 50%; absolutely positioned `left: 2px` (small: 1px); vertically centered via `top:50%; transform: translateY(-50%)`. Handle has NO `box-shadow`.
- Hover (off): track border `#a89878`.
- ON state: track bg `#86d67a`; border `#6fba2c`; track shadow `inset 0 2px 4px rgba(90,158,30,0.20)`; handle border `#6fba2c`; handle position `left: calc(100% - 24px)` (small: `calc(100% - 16px)`). Hover (on): track bg `#7ccc70`; track border `#5a9e1e`.
- Inner text (slots `#checked` / `#unchecked`): font-size 11px (small 9px), weight 700, color #fff, letter-spacing 0.02em, text-shadow `0 1px 1px rgba(0,0,0,0.1)`; padding `0 8px 0 28px` (off) / `0 28px 0 8px` (on); for small: `0 6px 0 20px` / `0 20px 0 6px`.
- Loading: opacity 0.7; pointer-events none; replace handle inner with 11×11 spinner (2px circle border `#6fba2c` on; `#a89878` off; `border-right-color: transparent`; rotate 0.6s linear infinite).
- Disabled: opacity 0.5; cursor not-allowed.
- focus-visible: outline `2px solid #ffcc00`; outline-offset 2px.
- Vue API: `<Switch v-model="enabled" size="default" :loading="busy" :disabled="locked"><template #checked>ON</template><template #unchecked>OFF</template></Switch>`. Sizes are `'default' | 'small'` (NO `'middle'`).

### Modal (SVG blob clip-path — cannot be replaced with rounded rect)

- Inject ONCE somewhere in body:
    ```html
    <svg style="position:absolute;width:0;height:0" aria-hidden>
        <defs>
            <clipPath id="animal-modal-clip" clipPathUnits="objectBoundingBox">
                <path
                    d="M0.501,0.005 L0.501,0.005 L0.523,0.005 L0.549,0.006 C0.704,0.01,0.796,0.017,0.825,0.027 L0.827,0.028 C0.872,0.045,0.939,0.044,0.978,0.17 C1,0.254,1,0.365,0.99,0.505 L0.988,0.513 C0.979,0.558,0.971,0.598,0.965,0.633 C0.956,0.689,0.979,0.77,0.964,0.865 C0.953,0.928,0.921,0.966,0.869,0.979 C0.821,0.986,0.773,0.992,0.726,0.995 L0.712,0.996 L0.694,0.997 C0.648,1,0.586,1,0.507,1 L0.501,1 L0.464,1 C0.385,1,0.325,0.998,0.283,0.995 C0.234,0.992,0.184,0.987,0.133,0.979 C0.081,0.966,0.05,0.928,0.039,0.865 C0.023,0.77,0.047,0.689,0.037,0.633 C0.031,0.595,0.023,0.552,0.013,0.505 C-0.006,0.365,-0.002,0.254,0.024,0.17 C0.064,0.045,0.13,0.045,0.174,0.028 L0.175,0.028 C0.204,0.017,0.303,0.009,0.474,0.005 L0.501,0.005"
                />
            </clipPath>
        </defs>
    </svg>
    ```
- Modal content: clip-path: url(#animal-modal-clip); bg rgb(247,243,223); padding 48px 48px 32px 48px; color #725d42.
- Backdrop: rgba(40, 30, 20, 0.45); backdrop-filter: blur(2px).
- Confirm button uses game yellow: bg #ffcc00, color #725d42, 3D shadow #e0b800.
- Vue API: `<Modal v-model:open="visible" title="Hello" :width="520" :mask-closable="true" :show-footer="true" :typewriter="true" :type-speed="80" @ok="onOk" @close="onClose">...</Modal>`. Default slot for body, `#title` / `#footer` slots for header / footer overrides. Use `<Teleport to="body">` internally.

### Card (default radius 20px + 13 colors)

- **VISUAL DEFAULT — for the signature animal-island look, layer the polka-dot wallpaper background (see CSS recipe below) onto the Card via inline `:style` or a custom decoration class.** The dot wallpaper is the signature animal-island look. (The published Vue Card exposes `type` + `color` only — there is no `pattern` prop. The wallpaper is achieved by composing `color="<name>"` with the radial-gradient backgrounds shown below, applied via a wrapper style or extra class on the inline implementation.)
- Default (`type="default"`, `color="default"`): bg rgb(247,243,223); padding 16px 24px; color #725d42; weight 500; **no box-shadow**; transition 0.3s ease; hover transform translateY(-2px); cursor pointer.
- `type="dashed"`: bg rgb(250,248,242); border 2px dashed #e8dcc8; no shadow; hover border-color #d4c4a8 + no transform.
- `color` prop (13 solid variants — choose one):
  default rgb(247,243,223)+#725d42 / app-pink #f8a6b2+#fff / purple #b77dee+#fff / app-blue #889df0+#fff / app-yellow #f7cd67+#725d42 / app-orange #e59266+#fff / app-teal #82d5bb+#fff / app-green #8ac68a+#fff / app-red #fc736d+#fff / lime-green #d1da49+#3d5a1a / yellow-green #ecdf52+#725d42 / brown #9a835a+#fff / warm-peach-pink #e18c6f+#fff
- Polka-dot wallpaper recipe (apply via inline style / decoration class — there is NO `pattern` prop on the Vue Card, so layer it yourself):
    ```css
    /* example: pink wallpaper for color="app-pink" */
    background:
        radial-gradient(circle, rgba(248, 166, 178, 0.18) 1.5px, transparent 1.5px) 0 0/28px 28px,
        radial-gradient(circle, rgba(255, 200, 210, 0.12) 1px, transparent 1px) 7px 7px/14px 14px,
        #fde4e8;
    border: 1.5px solid #f8a6b2;
    color: #a85565;
    ```
    Wallpaper values for the other 12 colors follow the same formula: lighten the palette hue ~70% for bg, use the pure palette hue at 0.18 alpha for the 1.5px dots and a paler tint at 0.12 alpha for the 1px dots, set border to the pure palette hue, choose darker readable text (#3d2e1e, #6a3a9a, etc.).
- Vue API: `<Card type="default" color="app-pink">...</Card>`. Default slot for body. Real lib props: `type` (`'default' | 'dashed'`) + `color` (13 names) + `pattern` (`'none'` or any `CardColor` value, 13 dot-overlay variants).

### Title (ribbon banner — REPLACES old `Card type="title"`)

- Layered structure: back-tail (swallowtail clip-path) → fold-shadow triangle → 3deg-tilted front face → top text.
- Sizes (font-size of wrapper; everything else in em):
  small 14px / middle 20px / large 28px.
- Wrapper: display inline-flex; height 2em; padding 0 1.6em; weight 800; line-height 1; letter-spacing 0.04em; filter drop-shadow(0 0.08em 0.12em rgba(0,0,0,0.05)).
- .ribbonText: weight 900; padding-top 0.11em (CJK optical centering); z-index 4.
- .ribbonBack (z-index 1, width 1.7em, height 1.7em, bottom -0.4em):
  left: clip-path: polygon(100% 0%, 100% 100%, 0% 100%, 30% 50%, 0% 0%);
  right: clip-path: polygon(0% 0%, 100% 0%, 70% 50%, 100% 100%, 0% 100%);
  bg: var(--rb).
- .ribbonFold (z-index 2, top calc(100% - 0.04em); CSS triangle via border):
  left: border-width: 0 0.95em 0.45em 0; border-color: transparent var(--rk) transparent transparent;
  right: border-width: 0 0 0.45em 0.95em; border-color: transparent transparent transparent var(--rk);
- .ribbonFront (z-index 3): inset 0 0.1em; border-radius 0.2em; bg var(--rf); transform perspective(11.5em) rotateX(3deg); inset shadow 0 -0.06em 0 rgba(0,0,0,0.05).
- Color attribute drives 4 vars (--rf front / --rb back / --rk fold / --rt text). 13 schemes:
  default-green: --rf #27d039 --rb #20992a --rk #115017 --rt #fff
  app-pink: --rf #f8a6b2 --rb #e06880 --rk #a03060 --rt #fff
  purple: --rf #b77dee --rb #9050d0 --rk #5a1a9a --rt #fff
  app-blue: --rf #889df0 --rb #5068d8 --rk #2030a0 --rt #fff
  app-yellow: --rf #f7cd67 --rb #d4a030 --rk #8a6010 --rt #725d42
  app-orange: --rf #e59266 --rb #c06a30 --rk #7a3a10 --rt #fff
  app-teal: --rf #82d5bb --rb #40a880 --rk #186048 --rt #fff
  app-green: --rf #8ac68a --rb #509050 --rk #205020 --rt #fff
  app-red: --rf #fc736d --rb #d43030 --rk #900010 --rt #fff
  lime-green: --rf #d1da49 --rb #90a010 --rk #485800 --rt #3d5a1a
  yellow-green: --rf #ecdf52 --rb #c0b010 --rk #706800 --rt #725d42
  brown: --rf #9a835a --rb #705830 --rk #3a2810 --rt #fff
  warm-peach-pink: --rf #e18c6f --rb #b85a30 --rk #6a2a10 --rt #fff
- Vue API: `<Title size="large" color="app-teal">Settings</Title>`. Default slot for the heading text.

### Collapse / Accordion (CSS-only height animation)

- Container: bg rgb(247,243,223); border 2px solid #9f927d; border-radius 18px; margin-bottom 12px.
- Header row: padding 16px 24px; gap 12px; font-size 16px; weight 600; line-height 1.4.
- Toggle icon: 28px circle bg #19c8b9 color #fff; weight 700; border-radius 50%; shadow 0 2px 4px rgba(25,200,185,0.3); content `+` (collapsed) → `−` (expanded), rotated 180deg on expand.
- Animation: display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s var(--ease); expanded: 1fr. Inner wrapper overflow: hidden.
- Vue API: a single panel — `<Collapse question="问题？" answer="答案" :default-expanded="false" :disabled="false" v-model:expanded="open" />`. Optionally use `<template #question>...</template>` for a rich header and the default slot for rich body content. Real lib props: `question`, `answer`, `defaultExpanded`, `expanded`, `disabled`. To stack multiple FAQs, render multiple `<Collapse>` instances via `v-for` in the parent (NEVER `.map()` in template).

### Tabs

- Wrapper: bg rgb(247,243,223); border 2px solid #9f927d; border-radius 24px; overflow hidden.
- Tab list: padding 16px; gap 6px; bg rgba(255,255,255,0.6); border-bottom 2px solid #c4b89e.
- Tab item: padding 8px 16px; border-radius 24px (pill); color #725d42; weight 500.
  hover: bg rgba(25,200,185,0.1); color #725d42.
  active: **bg `#0CC0B5` (solid teal)**; **color `#FFF9E3` (cream)**; weight 600; icon scales 1.2.
  Optional `shadow` modifier (default true): box-shadow 0 3px 0 0 #d4c9b4 on active tab.
- Optional leaf decoration on active tab (top-right, 18×18), animated leafWiggle 2s ease-in-out infinite. Toggle via `:leaf-animation="false"` to freeze.
- Vue API: `<Tabs v-model="key" :items="[{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }]" :leaf-animation="true" :shadow="true">`
  `<template #a>Panel A</template><template #b>Panel B</template></Tabs>`. The active panel is rendered via the slot whose name equals the active `key`. Items have only `{ key, label }` — content lives in named slots, NOT on the items objects. Tab list iteration uses `v-for` + `:key` internally (never `.map(...)`).

### Select

- Trigger is **NOT the Input visual** — it's its own design:
  bg `#fff`; border `2px solid #e8dcc8`; border-radius `12px`; padding `8px 13px`; color `#725d42` weight 600.
  hover: border `#d4c4a8`; bg `#fffdf7`. open: arrow rotated 180deg, color `#19c8b9`.
- Dropdown panel: **bg `#FFEEA0` (banana yellow)**; border-radius `28px`; padding `12px 0`; opacity-fade-in 0.2s; z-index 100.
- Option: display flex center; padding `10px 30px 10px 14px`; font 14px/500 #725d42.
  selected: pill bar background effect via ::before/z-index:-1, font-weight 700 (NOT a tinted bg color).
  hover: subtle highlight (no opaque teal tint).
- Placeholder color `#a09080`; arrow color `#a09080`.
- Vue API: `<Select v-model="value" :options="[{ key: 'a', label: 'Apple' }, { key: 'b', label: 'Banana' }]" placeholder="..." :disabled="false" />`. Options use `{ key, label }` shape (the lib uses `key` rather than `value` for option identity). Options rendered via `v-for` with `:key="opt.key"`.

### Skeleton (placeholder loading — 4 sub-components)

- **Main component**: `<Skeleton>` — renders placeholder shapes while content is loading.
- **Sub-components**: `<SkeletonButton>`, `<SkeletonInput>`, `<SkeletonAvatar>` — shape-specific skeleton variants.
- Variants: `text` (default), `circle`, `rect`, `paragraph`.
- Props: `loading` (boolean, default true — when false, shows default slot content), `variant` (`'text' | 'circle' | 'rect' | 'paragraph'`, default `'text'`), `active` (boolean, default true — pulse animation), `rows` (number, default 3 — for paragraph variant), `width` (number|string), `rowWidths` ((number|string)[]), `widthValue` (number|string), `heightValue` (number|string).
- Default slot: content to render when `loading=false`.
- Visual: warm parchment bg `rgb(247,243,223)` for the skeleton container; placeholder shapes use `#e8e2d6` with a subtle pulse animation (opacity 0.5→1) to indicate loading state. Border-radius matches the component type: pill 50px for SkeletonButton, 50px for SkeletonInput, 50% for SkeletonAvatar, 8px for Skeleton rect.
- Vue API:
  ```vue
  <Skeleton :loading="loading" variant="paragraph" :rows="4" active />
  <SkeletonButton />
  <SkeletonInput />
  <SkeletonAvatar />
  <Skeleton :loading="false">Content loaded</Skeleton>
  ```

### Checkbox (square box, sizes 18 / 22 / 28 px)

- Box: bg rgb(247,243,223); border 2.5px solid #c4b89e; border-radius 8px.
- hover: border #19c8b9; transform translateY(-1px).
- checked: bg #19c8b9; border #11a89b; checkmark color #fff weight 700; pop animation 0.15s.
- focus: outline 2px solid #ffcc00; outline-offset 2px.
- disabled: opacity 0.55; bg #f0ece2; border #d4c9b4; label color #c4b89e.
- Label color #725d42 (hover #794f27); weight 500; letter-spacing 0.01em.
- Group: horizontal flex gap 12px / vertical flex-column gap 8px.
- Per-size label font-size: 12 / 14 / 16 px.
- Vue API: `<Checkbox v-model="picks" :options="[{ label: '苹果', value: 'a' }, { label: '香蕉', value: 'b', disabled: true }]" size="middle" direction="horizontal" :disabled="false" />`. The component IS the group — `v-model` is the array of selected values (NOT a single boolean). Real lib props: `modelValue` (string|number array), `options`, `size`, `disabled`, `direction`.

### Radio (heavily-rounded square with check-mark — NOT a circle, NOT a dot)

- API: `<Radio v-model="value" :options="[{ label, value, disabled? }]" size="middle" direction="horizontal" />`. The component IS the group — there is no separate `<Radio>` item + `<RadioGroup>` split. `direction="horizontal" | "vertical"`. Roving tabindex on the focused circle (don't set tabIndex manually).
- Box (`.circle`, sizes small/middle/large): 18×18 / 22×22 / 28×28 px; bg rgb(247,243,223); border 2px solid #c4b89e; border-radius 12 / 14 / 16 px (heavily rounded square — NOT a circle).
- hover: border #19c8b9; transform translateY(-1px).
- checked: bg #19c8b9; border #11a89b; render an SVG CHECKMARK (✓) inside (white stroke 2.5px, `M2 8L6 12L14 4`), 10/12/16 px. Pop animation 0.15s `scale(0.4) → 1.2 → 1`.
- Item label: color #725d42 (checked: #794f27); weight 500; letter-spacing 0.01em; font-size 12 / 14 / 16 px.
- focus-visible on the circle: outline 2px solid #ffcc00; outline-offset 2px (warmer than other inputs would be `#f5c31c`, but the source uses `#ffcc00`).
- disabled: opacity 0.55; bg #f0ece2; border #d4c9b4; label #c4b89e; cursor not-allowed.
- Group container: flex, gap 16px (horizontal) / 8px (vertical); flex-wrap allowed.

### Tooltip (two distinct variants — do not confuse)

- variant="default": bg rgb(247,243,223); border 2px solid #c4b89e; border-radius 16px;
  padding 6px 12px; max-width 240px; font 12px/500 #725d42; line-height 1.5;
  shadow 0 3px 10px rgba(61,52,40,0.10); z-index 100; gap 10px from trigger;
  arrow 8px diamond with border-radius 2px.
- variant="island": bg transparent; no border; no box-shadow; padding 12px 20px; max-width 280px;
  weight 600; line-height 1.55; text-align center; arrow is a 14px circle dot with drop-shadow 0 4px 14px rgba(121,79,39,0.14).
- Placements (12): `top` / `bottom` / `left` / `right` + each with `-start` / `-end` (e.g. `top-start`, `bottom-end`).
- Vue API: `<Tooltip title="Tip text" placement="top" trigger="hover" variant="default" :bordered="true"><Button>Hover me</Button></Tooltip>`. The default slot is the trigger; pass tip content via the `title` prop OR `<template #title>...</template>` slot for rich content. Triggers: `'hover' | 'focus' | 'click'`.

### Table

- Wrapper: bg rgb(247,243,223); border-radius 20px; padding 6px (NO border).
- Header cell: padding 16px 20px; font 14px/700 #725d42; letter-spacing 0.02em; ::after divider 1px dashed (6px on / 6px off) rgb(240,232,216).
- Body cell: padding 14px 20px; font 14px/500 #725d42; line-height 1.6; same dashed bottom divider via ::after.
- Striped rows: bg rgba(248,248,240,0.6).
- Row hover: diagonal teal stripes
  background: repeating-linear-gradient(-45deg, rgba(25,200,185,0.6) 0 10px, rgba(14,196,182,0.6) 10px 20px);
  background-size: 28.28px 28.28px;
  clip-path: inset(0 round 30px); color #3d2e1e.
- Empty: padding 60px 20px; text-align center; color #9f927d; icon opacity 0.5.
- Loading overlay: rgba(247,243,223,0.8) + backdrop-filter blur(2px); spinner #19c8b9.
- Vue API: `<Table :columns="cols" :data-source="rows" row-key="id" :striped="true" :show-header="true" :loading="false" empty-text="暂无数据" />`. `cols` items: `{ title, dataIndex, render?, width?, align?, style? }`. For rich cell rendering, prefer the `cell-{dataIndex}` named slot over `render`. Both `cols` and `rows` arrays are iterated with `v-for` + `:key` internally — never `.map(...)` in the template.

### Footer (decoration)

- No `type` prop. width 100%; height 80px; centered row of 14 🎄 emoji (font-size 28px, letter-spacing 12px, flex center); `seamless` (default false) spreads them full-width via space-between.

### Divider

- 9 types, all height 12px; background center/contain no-repeat:
  line-brown (default, SVG fill #D8D0C3), line-teal (SVG), line-white (SVG), line-yellow (SVG), wave-yellow (SVG),
  dashed-brown, dashed-teal, dashed-white, dashed-yellow.

### Cursor (wrapper)

- Wraps default-slot content, applies inline-SVG data-URI cursors with !important (and same on all descendants when forceAll). Two `type` styles: `default` 28×28 geometric arrow (fill #fff7e6, stroke #794f27, hotspot 6 4) and `raindrop` 32×32 blue drop (fill #74ccff, stroke #2e86ab, hotspot 16 6). Zero image assets. `forceAll` prop (default true) controls whether the override cascades to all descendants; `forceAll=false` keeps native pointer/text/not-allowed on interactive descendants.
- Vue API: `<Cursor :force-all="true">...</Cursor>` — wraps the app or a region via the default slot; `<Cursor type="raindrop">...</Cursor>` for the raindrop style.

### Background (wallpaper container)

- Decorative full-width wallpaper, zero image assets (pure CSS + inline SVG). `type` prop: `dots` (default) = two offset radial-gradient dot grids (28px dot + 14px small dot, green rgba(90,160,90,.22)/rgba(140,200,140,.15) on #bfe3bf); `sprinkles` = three coprime tiles (190×170 / 230×195 / 255×215) of inline-SVG capsule sprinkles (rounded rects with shared vertical highlight gradient simulating lit cylinders, LCM repeat ≈ 220000×280000px = visually random) on #fdf3e3 cream.
- Container: position relative; width 100%; min-height 100%; children render on top of the pattern. Give explicit height via style.
- Vue API: `<Background type="sprinkles" style="min-height:200px; padding:24px">content</Background>`.

### Typewriter

- Recursively truncates the default slot's vnode tree by character count, preserves element structure, class, inline styles. Returns a fragment (no extra wrapping div/span — zero layout impact).
- Default speed 90ms/char. Restart by changing the `trigger` prop (any value).
- Vue API: `<Typewriter :speed="90" :trigger="key" :auto-play="true">...rich text...</Typewriter>`. Also accepts a `text="..."` prop instead of slot content. Emits `done` when the animation finishes.

### CodeBlock (dark JSX/TS only, with copy button)

- Container: padding 20px 24px; bg #2b2118; border 1px solid #3d3028; border-radius 20px;
  font-size 14px; line-height 1.7; tab-size 4;
  font-family 'SF Mono','Fira Code','Cascadia Code',Consolas,monospace; weight 600;
  white-space pre; overflow auto; default text #e8d5bc.
- Token colors:
  comment #6b5e50 string #a8d4a0 keyword #d4a0e0 react #e06c75
  component #80c0e0 func #61afef prop #e8c87a jsx #f0a870
  operator #d4b896
- Vue API: `<CodeBlock :code="codeString" />`.
- Copy button (default on): top-right pill (top 12px / right 12px, 32px height, 50px radius,
  bg rgba(61,48,40,0.94), text #e8d5bc 12px/700); copies code via Clipboard API with
  execCommand fallback; states 复制 → 已复制 / 复制失败, auto-reset 2s; `@copy` event on success.
  Hide via `:copyable="false"`. When visible and padding not customised, pre gets padding-right 96px.

### Drawer (slide-in panel)

- Props: `open` (required, boolean), `title` (string), `placement` (`'left' | 'right' | 'top' | 'bottom'`, default `'right'`), `width` (number|string, default 378), `height` (number|string, default 300), `maskClosable` (boolean, default true), `pushBackground` (boolean, default true — applies depth-of-field effect to background content), `footer` (string), `maskStyle` (CSSProperties).
- Emits: `close` (when mask clicked or ESC pressed).
- Slots: `default` (body), `footer` (rich footer override).
- Focus trap: ESC to close, Tab cycle within the drawer, focus restoration on close.
- Body scroll lock when open. Push-background effect: siblings get scale+blur+rounded corners.
- Vue API: `<Drawer v-model:open="open" title="Settings" placement="right">...</Drawer>`.

### Notification (imperative toast API)

- Not a component — it's a **command-style API** (like antd's `message`). `NotificationContainer` mounts the DOM layer; `Notification.open()`, `.success()`, `.info()`, `.warning()`, `.error()` push items.
- Config: `message` (string, required), `description` (string), `duration` (number, seconds, default 4.5; 0 = no auto-close), `position` (`'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight'`, default `'top'`), `icon` (VNode), `btn` (VNode), `key` (string), `onClose` (fn), `onClick` (fn), `closeIcon` (VNode), `className`, `style` (CSSProperties).
- `.destroy(key?)` — removes a specific notification or all.
- NotificationView styling: colored left border per type (success green, info teal, warning yellow, error red), warm parchment bg, rounded 16px, 4.5s auto-dismiss, slide-in entrance animation.
- Vue API: `import { Notification } from 'animal-island-vue'; Notification.success({ message: 'Saved', description: 'Your island is safe.' });`. Mount `<NotificationContainer />` once in the app root.

### Progress (linear progress bar)

- Props: `percent` (number, 0–100, required), `size` (`'small' | 'middle' | 'large'`, default `'middle'`), `showInfo` (boolean, default true), `infoPosition` (`'inside' | 'right' | 'top'`, default `'inside'`), `infoFormat` (fn: `(percent) => string`), `duration` (number, default 0.6 — fill width animation seconds; 0 = no animation).
- Track: bg `#f8f8f0`, border `2px solid #e8dcc8`, inset shadow, border-radius 999px. Fill: mint teal `#19c8b9` with 3D bottom shadow, height 12/16/20px (small/middle/large).
- Info text: font-weight 700, color `#725d42`. Inside the fill (white text on fill) or to the right or top.
- Vue API: `<Progress :percent="65" size="middle" info-position="right" />`.

### Tag (pill-shaped label)

- Props: `size` (`'small' | 'medium' | 'large'`, default `'medium'`), `variant` (`'solid' | 'outlined' | 'dashed'`, default `'solid'`), `color` (13 palette colors: `'default' | 'app-pink' | 'purple' | 'app-blue' | 'app-yellow' | 'app-orange' | 'app-teal' | 'app-green' | 'app-red' | 'lime-green' | 'yellow-green' | 'brown' | 'warm-peach-pink'`, default `'default'`), `closable` (boolean, default false), `disabled` (boolean, default false).
- Emits: `close` (when close button clicked).
- Slots: `default` (label content).
- Visual: pill shape (border-radius 999px), font-weight 600, 1.5px border. Solid variant uses warm parchment bg + brown border. Outlined = transparent bg. Dashed = dashed border. Color variants tint the background/border with the palette hue.
- Sizes: small 24px/12px, medium 29px/13px, large 34px/15px (height/font-size).
- Interaction: when `@click` is bound, acts as a clickable button with Enter/Space keyboard support. `disabled` removes interaction.
- Vue API: `<Tag color="app-pink" closable @close="removeTag">Hello</Tag>`.

### Form (declarative form with validation)

- 3 sub-components + 1 hook: `<Form>`, `<FormItem>`, `<FormProvider>`, `useForm()`.
- **Form props**: `form` (FormInstance from useForm), `initialValues`, `layout` (`'horizontal' | 'vertical' | 'inline'`, default `'horizontal'`), `labelAlign` (`'left' | 'right'`), `labelCol` / `wrapperCol` (grid `{ span, offset }`), `size` (`'small' | 'middle' | 'large'`), `disabled`, `colon` (boolean, default true), `requiredMark` (boolean | `'optional'`), `onFinish`, `onFinishFailed`, `onValuesChange`, `onReset`.
- **FormItem props**: `name` (NamePath — string | number | array, supports nested `"user.name"`), `label` (string), `rules` (RuleObject[]), `required` (boolean), `dependencies` (NamePath[]), `valuePropName` (default `'modelValue'`), `trigger` (default `'onUpdate:modelValue'`), `getValueFromEvent` (fn), `normalize` (fn), `hidden`, `hasFeedback`, `validateStatus`, `help`, `noStyle`, `labelCol`, `wrapperCol`, `colon`, `requiredMark`, `layout`, `initialValue`.
- **RuleObject**: `required`, `message`, `min`, `max`, `len`, `pattern` (RegExp), `whitespace`, `type` (`'string' | 'number' | 'boolean' | 'integer' | 'float' | 'array' | 'object' | 'email' | 'url' | 'date'`), `validator` (async fn).
- **FormInstance methods** (from `useForm()`): `getFieldValue`, `getFieldsValue`, `setFieldValue`, `setFieldsValue`, `resetFields`, `validateFields`, `submit`, `setFields`, `isFieldTouched`, `isFieldValidating`, `getFieldError`, `scrollToField`.
- Visual: horizontal layout by default — label left, control right. Vertical stacks them. Inline places them in a row. Error state shows red border + message. HasFeedback adds status icon.
- Vue API: `const [form] = useForm();` then `<Form :form="form" @finish="onSave"><FormItem name="email" label="Email" :rules="[{ required: true, type: 'email' }]"><Input v-model="email" /></FormItem></Form>`.

### Image (framed photo with click-to-preview)

- **Props**: `src` (string, required), `alt` (string, default `''` — empty = decorative), `width` / `height` (number | string; numbers get `px` appended), `color` (`ImageColor`, default `'white'` — 14 Card-pattern palette colors without dots: `'white' | 'default' | 'app-pink' | 'purple' | 'app-blue' | 'app-yellow' | 'app-orange' | 'app-teal' | 'app-green' | 'app-red' | 'lime-green' | 'yellow-green' | 'brown' | 'warm-peach-pink'`), `lazy` (boolean, default false → native `loading="lazy"`), `preview` (boolean, default true).
- **Emits**: `load` (native Event), `error` (native Event).
- Visual: white padded frame (`#fff`, 12px padding, 8px radius, soft shadow) wraps the `<img>`. Image fades in (opacity 0→1) on load. On error: frame shows camera icon + "图片加载失败" text, `role="img"` with `aria-label` (falls back to alt or the failure text).
- `preview=true` (default): frame is a `<button>` (native Enter/Space activation, `cursor: zoom-in`). Click opens a full-size preview teleported to `document.body` via `<Teleport>` — dark mask + centered `<img>` (max 88vw/86vh, 20px radius). Close via ESC, mask click, or close button (top-right, 40px circle). Focus trap: close button auto-focused on open, Tab cycles within, focus restored to trigger on close.
- `preview=false`: frame is a `<span>`, no click handler.
- Non-scoped global Less + BEM (`.animal-image*`), matching Drawer convention so Teleport content is styled.

### DatePicker (calendar date picker)

- Props: `modelValue` (`string | [string, string] | null`, v-model — date `YYYY-MM-DD` / range `[start, end]`), `defaultValue` (non-controlled), `range` (boolean — linked range selection), `picker` (`'date' | 'month'`), `placeholder`, `disabled`, `allowClear`, `size` (`'small' | 'middle' | 'large'`), `status` (`'error' | 'warning'`), `format` (default `'YYYY-MM-DD'`, tokens `YYYY/MM/DD/M/D`), `disabledDate` (fn → true = disabled), `showToday` (default true), `open` (`v-model:open`).
- Emits: `update:modelValue`, `change`, `update:open`.
- Visual: white capsule trigger (`#fffbe7`, 50px radius) matching Input; popup panel `#fffdf7`, 20px radius, 1.5px `#e8dcc8` border. Calendar grid: weekday header + 42 cells; header year/month clicks switch to 3×4 grids; selected day amber `#ffb400`, today teal `#19c8b9`, outside cells muted, disabled grey. Footer: 「今天」+「确定」. Click-outside closes; ESC closes; Enter confirms.
- Vue API: `<DatePicker v-model="date" />`, `<DatePicker v-model="range" range />`, `<DatePicker picker="month" />`.

### TimePicker (rolling time picker)

- Props: `modelValue` (`string | null`, v-model, `HH:mm:ss`), `defaultValue`, `placeholder` (default '请选择时间'), `disabled`, `allowClear`, `size`, `status`, `format` (default `'HH:mm:ss'`; tokens `HH/mm/ss/H/m/s`; contains `ss` → seconds column), `hourStep`/`minuteStep`/`secondStep` (default 1), `open` (`v-model:open`).
- Emits: `update:modelValue`, `change`, `update:open`.
- Visual: hour/minute/second scroll columns (28px options, selected centered on open); hover `#ffd54f`, selected amber `#ffb400` white text; footer 「此刻」(set to now) + 「确定」. Panel width 248px (172px without seconds). Click-outside closes; ESC closes; Enter confirms.
- Vue API: `<TimePicker v-model="time" />`, `<TimePicker format="HH:mm" :minute-step="15" />`.

### Carousel (accessible image carousel)

- Props: `modelValue` (number, v-model — active index), `defaultActiveIndex` (default 0), `autoplay` (default false), `interval` (ms, default 3000, clamped to ≥ 1000), `loop` (default true), `showArrows` / `showDots` (default true), `pauseOnHover` (default true — keyboard focus always pauses), `ariaLabel` (default '轮播图').
- Emits: `update:modelValue`, `change` (index).
- Content: default slot — each direct child element is one slide.
- Visual: viewport `rgb(247,243,223)` bg, 20px radius, min-height 180px; slides fade + 18px translateX over 0.3s `cubic-bezier(0.4,0,0.2,1)`; 42px circular white arrows (9×9 chevron via ::before borders) 14px from edges (36px / 8px on ≤480px); pill dot bar (white 85%, 50px radius) with 10px dots, active stretches to 24px teal `#19c8b9`; top-right 58×32 pill play/pause button (autoplay only).
- A11y: `role="region"` + `aria-roledescription="carousel"` + focusable; slides are `role="group"` with `第 N 张，共 M 张` labels and `aria-hidden`; dots/arrows labelled; ArrowLeft/ArrowRight/Home/End keyboard nav; non-loop disables boundary arrows; single slide renders no controls.
- Vue API: `<Carousel v-model="active" autoplay :interval="3500">` with slide children.

### Countdown (odometer-style countdown)

- Props: `value` (number | Date, required — deadline), `format` (default `'HH:mm:ss'`, tokens DD/HH/mm/ss, literals rendered as separators), `size` (`'small' | 'middle' | 'large'`, default 'middle'), `variant` (`'default' | 'island'`), `bordered` (default false — 1.5px `#d4c9b4` border on digit units).
- Emits: `change` (remaining ms), `finish` (fires once at zero; timer cleared afterwards; value change restarts).
- Slot: `#prefix` (label before the countdown).
- Visual: default = white bg + soft shadow, island = `rgb(247,243,223)` + 2px dashed `#d4c4a8`; digit units = 12px-radius gradient `linear-gradient(180deg,#fff,#f8f8f0)` blocks; digits color `#8b7355` weight 900 tabular-nums; each digit is a 20-face strip (0-9 twice) scrolling one-way downward via `translateY` (5% per face, 0.35s ease); colon weight 900, top -0.08em; sizes: container 40/48/56px, digits 20/26/34px.
- A11y: `role="timer"` `aria-live="off"`; rolling strips `aria-hidden`, sr-only text carries the full formatted value.
- Vue API: `<Countdown :value="deadline" format="DD 天 HH:mm:ss" variant="island"><template #prefix>活动结束还有</template></Countdown>`.

### Pagination (client-side pagination)

- Props: `total` (number, required), `current` (v-model:current, controlled page), `defaultCurrent` (default 1), `pageSize` (v-model:pageSize, controlled size), `defaultPageSize` (default 10), `showSizeChanger` (default false), `pageSizeOptions` (default `[10, 20, 50, 100]`), `showQuickJumper` (default false), `showTotal` (default false), `disabled` (default false), `variant` (`'orange' | 'teal'`, default 'orange').
- Emits: `update:current` (page), `update:pageSize` (size), `change` (page, pageSize), `showSizeChange` (current, size).
- Visual: ghost circular 32px page cells (transparent bg); orange variant hover `#ffd54f` / active `#ffc107` (hover `#ffb400`); teal variant hover `#e6f9f6` + text `#19c8b9` / active `#19c8b9` (hover `#3dd4c6`); active = white text weight 700, default cursor; ellipsis `#c4b89e` weight 900; total text 13px 600 `#a09080`; size changer = Select-style white 34px trigger with 2px `#e8dcc8` border + 12px radius, caret rotates 180° when open, `#ffeea0` 28px-radius listbox popping UP with gold pill bar (`#ffcc00`, 30% opacity) + finger cursor on hover; quick jumper = 52×32px cream `#fffbe7` pill input, no border, no focus emphasis.
- Behavior: ≤7 pages render all; >7 pages render first/last + current±1 + ellipses; prev/next disabled at boundaries; size change clamps current page into new page count; jumper accepts digits only, jumps on Enter/blur, clamps to bounds and clears.
- A11y: `nav[aria-label="分页"]`; active page `aria-current="page"`; prev/next `aria-label="上一页/下一页"`; size trigger `aria-haspopup="listbox"` + `aria-expanded`; options `role="option"` + `aria-selected`; jumper input `aria-label="跳转到指定页"`; ellipses `aria-hidden`.
- Vue API: `<Pagination v-model:current="page" v-model:page-size="pageSize" :total="500" show-total show-quick-jumper />`; Table integration: `<Table :pagination="{ defaultPageSize: 5, showTotal: true, showSizeChanger: true }" />` (total computed from dataSource).

## HARD RULES (must obey — disqualifies the output if violated)

1. Never use pure black (#000) or near-black (#111) text. Use #794f27 / #725d42 / #8a7b66.
2. Never use cold blue focus rings (#0066ff etc.). Use #ffcc00 (Input/Switch/Checkbox) or #f5c31c (Radio) or #19c8b9 (Button).
3. Never apply 0px (sharp) corners to interactive elements. Minimum radius 12px.
4. Never use cold gray backgrounds (#fafafa, #f5f5f5). Use #f8f8f0 / rgb(247,243,223).
5. Never apply the 3D pixel-stack shadow `0 5px 0 0 #bdaea0` to non-primary buttons. Use the soft elevation shadow on default/dashed/text/link.
6. Never replace Modal's blob clip-path with a rounded rectangle. The organic blob is non-negotiable.
7. Never render Title as a blob, pill, or rectangular block. It is a flat heraldic ribbon with swallowtail ends + fold triangles + 3deg perspective.
8. Never use `<Card type="title">` — that variant is removed. Use `<Title>` instead.
9. Never use system fonts. Always include the Nunito + Noto Sans SC Google Fonts link.
10. Never use weight < 400 anywhere. Body 500, headings 600–900.
11. Never animate with hard cubic transitions; always use `cubic-bezier(0.4, 0, 0.2, 1)` over 0.15–0.35s.
12. The `title` prop on `<Modal>` is the literal string heading — do NOT confuse it with the `<Title>` ribbon component.
13. **Always reach for the library component first.** If a feature exists as an animal-island-vue component (BackTop, Card, Button, Input, Switch, Checkbox, Radio, Title, Tabs, Collapse, Modal, Select, Tooltip, Loading, Table, Time, Divider, Footer, Cursor, Typewriter, CodeBlock), use the inline-defined component with documented props in the `template`. Only hand-roll raw HTML when the library has no equivalent (page layout, app-specific composition, decorative blocks).
14. **NO REACT-ISMS — DISQUALIFYING.** This is Vue 3, not React. The following are forbidden in the output:
    - `className="..."` → use `class="..."`.
    - `onClick={fn}` / `onChange={fn}` / `onInput={fn}` → use `@click="fn"` / `@change="fn"` / `@input="fn"`.
    - `useState` / `useEffect` / `useRef` / `useMemo` / any React hook → use `Vue.ref` / `Vue.reactive` / `Vue.computed` / `Vue.watch` / `Vue.onMounted` / template `ref="el"`.
    - Controlled-input pair `:value="x" @input="x = $event.target.value"` for text/select/checkbox/switch → use `v-model` (or `v-model:open`, `v-model:expanded`, etc.).
    - `{array.map(item => <X />)}` inside a template → use `<X v-for="item in array" :key="item.id" />`. Never call `.map()` to render in a Vue template.
    - JSX / TSX, Babel-standalone, `<script type="text/babel">`, `ReactDOM.createRoot`, `<React.Fragment>`, `{children}` — none of these appear. Use Vue 3 global build (`Vue.createApp(App).mount('#app')`) and `template:` strings only. Replace `{children}` with `<slot />`.
    - Inline component definitions like `function X() { return <jsx/> }` → instead `const X = { props: {...}, emits: [...], setup() {...}, template: \`...\` }`registered via`app.component('X', X)`or in`components: { X }` on the parent.

## TASK

**STEP 1 — Ask before generating.** If the user has not yet told you what page/component they want, your FIRST reply must be a short question asking what to build, with 3–5 concrete suggestions. Do NOT generate any HTML in this turn. Example reply (adapt to the user's language):

> 你想生成什么页面？比如：
>
> - 一个个人博客首页
> - 一个商品列表 / 卡片墙
> - 一个 FAQ / 设置页
> - 一个登录 / 注册页
> - 一个仪表盘
>
> 或者直接描述你的需求（标题、要展示的内容、需要哪些交互）。

Only proceed to STEP 2 after the user answers.

**STEP 2 — Generate.** Produce **one complete `index.html` file** implementing the page/component the user asked for, strictly following the spec above. The user will save it as `index.html` and double-click to open in a browser — it MUST render correctly with no extra setup.

Structure the script like this:

```html
<script>
    // 1) Inline Vue components mirroring animal-island-vue's API (Card, Button, Input, Switch, ...)
    const Button = {
        props: {
            type: { type: String, default: 'default' },
            size: { type: String, default: 'middle' },
            danger: Boolean,
            ghost: Boolean,
            block: Boolean,
            loading: Boolean,
            disabled: Boolean,
            htmlType: { type: String, default: 'button' },
        },
        emits: ['click'],
        template: `
    <button
      :type="htmlType"
      class="animal-btn"
      :class="[
        'animal-btn--' + size,
        'animal-btn--' + type,
        { 'is-danger': danger, 'is-loading': loading, 'is-block': block, 'is-ghost': ghost }
      ]"
      :disabled="disabled || loading"
      @click="$emit('click', $event)"
    ><slot /></button>
  `,
    };

    const Card = {
        props: {
            type: { type: String, default: 'default' },
            color: { type: String, default: 'default' },
        },
        template: `
    <div class="animal-card" :class="['animal-card--' + type, 'animal-card--color-' + color]">
      <slot />
    </div>
  `,
    };

    // ... Title, Tabs, Collapse, Modal, Switch, Input, Checkbox, Radio, Select, Skeleton,
    //     SkeletonAvatar, SkeletonButton, SkeletonInput, Tooltip, Loading,
    //     Table, Time, Divider, Footer, Cursor, Typewriter, CodeBlock

    // 2) Page composition uses ONLY those components (plus layout divs)
    const App = {
        components: { Title, Card, Tabs, Switch, Button /* ... */ },
        setup() {
            const enabled = Vue.ref(false);
            const tab = Vue.ref('a');
            const onSave = () => {
                /* ... */
            };
            return { enabled, tab, onSave };
        },
        template: `
    <div class="page">
      <Title color="app-teal" size="large">Settings</Title>
      <Card color="default">...</Card>
      <Tabs v-model="tab" :items="[{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }]">
        <template #a>Panel A</template>
        <template #b>Panel B</template>
      </Tabs>
      <Switch v-model="enabled" />
      <Button type="primary" size="large" @click="onSave">Save</Button>
    </div>
  `,
    };

    Vue.createApp(App).mount('#app');
</script>
```

Wrap the entire file content in a single fenced ` ```html ` code block so the user can copy-paste it as-is. After the code block, list any spec line you intentionally relaxed (e.g., simplified an animation) and why.
````

> 这个提示词是 self-contained 的：不需要打开 `AI_USAGE.md` 或 `skill/SKILL.md` 也能让 AI 工具复现 95%+ 视觉。要 100% 像素级还原，**项目内**直接 `npm i animal-island-vue` + `import` 真实组件即可。
