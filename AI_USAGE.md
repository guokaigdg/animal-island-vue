# animal-island-vue · AI Usage Guide (v0.1.0)

> **FOR AI CODE ASSISTANTS**: This file is the canonical, machine-readable reference for generating code that uses `animal-island-vue`. Prefer this file over any other source. Every prop / import / default below is copied verbatim from source. Do NOT invent props.

This is the **Vue 3** port of [animal-island-ui](https://github.com/guokaigdg/animal-island-ui). API shape mirrors the React version where possible, but adapts to Vue idioms (`v-model`, slots, emits) — see "Vue conventions" in §3.

---

## 0. Setup (once per project)

```bash
npm install animal-island-vue
```

```ts
// app entry (main.ts)
import { createApp } from 'vue';
import App from './App.vue';
import 'animal-island-vue/style';   // MUST import BEFORE any component usage
// Fonts (Nunito / Noto Sans SC / Zen Maru Gothic) are auto-bundled via @fontsource.

createApp(App).mount('#app');
```

```ts
// Peer requirements
vue >= 3.4.0
```

> Global aesthetics preset (warm-parchment + pill shapes + 3D button shadow) is applied via `animal-island-vue/style`. The library is built on **Less + CSS Custom Properties** design tokens. After import, the components carry their own styles — no extra CSS setup required in your host app.

---

## 1. Full API (19 components)

All named exports from `animal-island-vue`:

```ts
import {
    Button, Input, Switch, Modal, Card, Collapse,
    Cursor, Time, Phone, Footer, Divider, Typewriter,
    Icon, Select, Tabs, Checkbox, CodeBlock,
    Loading, Table,
} from 'animal-island-vue';

// Runtime value export (icon catalogue — 10 entries)
import { ICON_LIST } from 'animal-island-vue';

import type {
    ButtonProps, ButtonType, ButtonSize, ButtonHTMLType,
    InputProps, InputSize,
    SwitchProps, SwitchSize,
    ModalProps,
    CardProps, CardType, CardColor,
    CollapseProps,
    CursorProps,
    TimeProps,
    PhoneProps,
    FooterProps, FooterType,
    DividerProps,
    TypewriterProps,
    IconProps, IconName,
    SelectProps, SelectOption,
    TabsProps, TabItem,
    CheckboxProps, CheckboxOption, CheckboxSize, CheckboxValue,
    CodeBlockProps,
    LoadingProps,
    TableProps, TableColumn, TableRecord,
} from 'animal-island-vue';
```

---

### 1.1 Button

```ts
type ButtonType     = 'primary' | 'default' | 'dashed' | 'text' | 'link';
type ButtonSize     = 'small' | 'middle' | 'large';
type ButtonHTMLType = 'submit' | 'reset' | 'button';

interface ButtonProps {
    type?: ButtonType;          // default 'default'
    size?: ButtonSize;          // default 'middle'
    danger?: boolean;           // default false
    ghost?: boolean;            // default false
    block?: boolean;            // default false
    loading?: boolean;          // default false — renders diagonal-stripe animation
    disabled?: boolean;         // default false
    htmlType?: ButtonHTMLType;  // default 'button'
}
// Emits: (e: 'click', event: MouseEvent)
// Slots: default, icon
```

Canonical usage:
```vue
<Button type="primary" @click="save">Save</Button>
<Button type="primary" danger loading>Deleting…</Button>
<Button type="dashed" size="large" block>
    <template #icon><PlusIcon /></template>
    Add
</Button>
<Button type="text">Cancel</Button>
```

> Vue note: pass an icon via the `#icon` slot (the React `icon` prop is not used).

---

### 1.2 Input

```ts
type InputSize = 'small' | 'middle' | 'large';

interface InputProps {
    modelValue?: string;               // v-model — controlled value
    size?: InputSize;                  // default 'middle'
    allowClear?: boolean;              // default false
    status?: 'error' | 'warning';
    shadow?: boolean;                  // default false — disables 3D shadow
    disabled?: boolean;
    placeholder?: string;
    type?: string;                     // default 'text'
    readonly?: boolean;
    maxlength?: number;
}
// Emits: update:modelValue(value), change(value, event), clear()
// Slots: prefix, suffix
```

```vue
<Input v-model="name" placeholder="Your name" allow-clear />
<Input v-model="q" size="large">
    <template #prefix><SearchIcon /></template>
</Input>
<Input v-model="email" status="error">
    <template #suffix>@gmail.com</template>
</Input>
<Input disabled model-value="locked" />
```

> Vue note: `prefix` / `suffix` are **slots** (not props). Use `v-model` instead of `value` + `onChange`.

---

### 1.3 Switch

```ts
type SwitchSize = 'small' | 'default';

interface SwitchProps {
    modelValue?: boolean;       // v-model
    size?: SwitchSize;          // default 'default'
    disabled?: boolean;         // default false
    loading?: boolean;          // default false
}
// Emits: update:modelValue(value), change(value)
// Slots: checked, unchecked
```

```vue
<Switch v-model="on" @change="v => console.log(v)" />
<Switch v-model="on" size="small">
    <template #checked>ON</template>
    <template #unchecked>OFF</template>
</Switch>
<Switch loading disabled />
```

> Vue note: `checkedChildren` / `unCheckedChildren` (React) are exposed as `#checked` / `#unchecked` slots.

---

### 1.4 Modal

```ts
interface ModalProps {
    open: boolean;                       // REQUIRED — usable with v-model:open
    title?: string;
    width?: number | string;             // default 520
    maskClosable?: boolean;              // default true
    showFooter?: boolean;                // default true — false hides footer
    typewriter?: boolean;                // default true — body plays typewriter on open
    typeSpeed?: number;                  // default 80 (ms/char)
}
// Emits: update:open(v), close(), ok()
// Slots: default, title, footer
```

```vue
<script setup lang="ts">
import { ref } from 'vue';
const open = ref(false);
function submit() { /* ... */ }
</script>

<template>
    <Modal v-model:open="open" title="Confirm" @ok="() => { submit(); open = false; }">
        Proceed to delete this island?
    </Modal>
</template>
```

Notes:
- Modal already ships the required SVG blob `<clipPath id="animal-modal-clip">` internally.
- To disable the typewriter animation: `:typewriter="false"`.
- To hide the footer: `:show-footer="false"`. To customize the footer content, use the `#footer` slot.

---

### 1.5 Card

```ts
type CardType  = 'default' | 'title' | 'dashed';

type CardColor =
    | 'default'          // rgb(247,243,223) / #725d42 text
    | 'app-pink'         // #f8a6b2 / #fff
    | 'purple'           // #b77dee / #fff
    | 'app-blue'         // #889df0 / #fff
    | 'app-yellow'       // #f7cd67 / #725d42
    | 'app-orange'       // #e59266 / #fff
    | 'app-teal'         // #82d5bb / #fff
    | 'app-green'        // #8ac68a / #fff
    | 'app-red'          // #fc736d / #fff
    | 'lime-green'       // #d1da49 / #3d5a1a
    | 'yellow-green'     // #ecdf52 / #725d42
    | 'brown'            // #9a835a / #fff
    | 'warm-peach-pink'; // #e18c6f / #fff

interface CardProps {
    type?: CardType;     // default 'default'
    color?: CardColor;   // default 'default'
}
// Slots: default, title (only used by type="title")
```

```vue
<Card>Default parchment card</Card>
<Card type="title">
    <template #title>Chapter One</template>
    Body text
</Card>
<Card type="dashed">Draft / empty-state container</Card>
<Card color="app-yellow">Notification</Card>
```

---

### 1.6 Collapse

```ts
interface CollapseProps {
    question?: string;            // OR use #question slot for ReactNode-like content
    answer?: string;              // OR use #answer slot
    defaultExpanded?: boolean;    // default false (uncontrolled)
    expanded?: boolean;           // controlled — pair with @update:expanded
    disabled?: boolean;           // default false
}
// Emits: update:expanded(value), change(value)
// Slots: question, answer
```

```vue
<Collapse question="What is Animal Island?" answer="A cozy Vue UI kit." />
<Collapse default-expanded>
    <template #question>FAQ #1</template>
    <template #answer><p>Long rich content…</p></template>
</Collapse>
<!-- Controlled -->
<Collapse v-model:expanded="open" question="Q" answer="A" />
```

> Uses pure CSS grid-row transition — no JS height measurement, safe for SSR.

---

### 1.7 Cursor

```ts
interface CursorProps {}
// Slots: default
```

Wrap the region where you want a game-style finger cursor:

```vue
<Cursor>
    <App />
</Cursor>
```

> Applies `cursor: url(...) 4 0, auto !important` to all descendants. Do NOT nest multiple `<Cursor>`.

---

### 1.8 Time

```ts
interface TimeProps {}
```

```vue
<Time />   <!-- auto-updates every second, shows weekday + date + clock -->
```

No configurable props — it is a self-contained HUD widget.

---

### 1.9 Phone (decorative NookPhone)

```ts
interface PhoneProps {}
```

```vue
<Phone />
```

> Fixed size 527×788px. A decorative showcase widget: 3×3 app grid + live AM/PM clock + blinking colon + hover icon bounce. Not configurable.

---

### 1.10 Footer

```ts
type FooterType = 'sea' | 'tree';

interface FooterProps {
    type?: FooterType;          // default 'tree'
}
```

```vue
<Footer />              <!-- forest silhouette, 60px tall — default -->
<Footer type="sea" />   <!-- ocean wave, 80px tall -->
```

---

### 1.11 Divider

```ts
type DividerType = 'line-brown' | 'line-teal' | 'line-white' | 'line-yellow' | 'wave-yellow';

interface DividerProps {
    type?: DividerType;         // default 'line-brown'
}
```

```vue
<Divider />
<Divider type="wave-yellow" />
```

> Height is fixed 12px. Purely decorative background-image band.

---

### 1.12 Typewriter

```ts
interface TypewriterProps {
    speed?: number;       // ms per char, default 90
    trigger?: unknown;    // change this value to restart animation (e.g. modal openCount)
    autoPlay?: boolean;   // default true (false = show full immediately)
    text?: string;        // optional plain-text shortcut; otherwise use default slot
}
// Emits: done()
// Slots: default — ANY VNode tree; preserves element structure, classes, inline styles
```

```vue
<Typewriter :speed="60" @done="step = 2">
    <p>Hello, <strong>traveler</strong>.</p>
    <p>Welcome to the island.</p>
</Typewriter>

<!-- Restart on modal open -->
<Typewriter :trigger="openCount">{{ dialogueText }}</Typewriter>

<!-- Plain-text shortcut -->
<Typewriter text="Hello, traveler." />
```

> Renders NO wrapper element; zero layout impact. Recursively truncates VNode tree by char count while preserving structure.

---

### 1.13 Tabs

```ts
interface TabItem {
    key: string;
    label: string;
}

interface TabsProps {
    items: TabItem[];           // REQUIRED
    modelValue?: string;        // v-model — defaults to first tab when omitted
    leafAnimation?: boolean;    // default true — active-tab leaf wiggle
    shadow?: boolean;           // default true — outer card shadow
}
// Emits: update:modelValue(key), change(key)
// Slots: dynamic, named after each item.key — receives { item }
```

```vue
<Tabs
    v-model="activeKey"
    :items="[
        { key: 'tab1', label: '鱼类' },
        { key: 'tab2', label: '昆虫' },
    ]"
>
    <template #tab1>鲈鱼、鲷鱼…</template>
    <template #tab2>蝴蝶、蜻蜓…</template>
</Tabs>
```

> Vue note: tab content is rendered via **named slots keyed by `item.key`** (not `item.children` like React). `defaultActiveKey` (React) becomes the initial `v-model` value (or omit to fall back to the first tab).

---

### 1.14 Icon

```ts
type IconName =
    | 'icon-miles' | 'icon-camera' | 'icon-chat' | 'icon-critterpedia'
    | 'icon-design' | 'icon-diy'    | 'icon-helicopter'
    | 'icon-map'   | 'icon-shopping' | 'icon-variant';

interface IconProps {
    name: IconName;                // REQUIRED — one of the 10 built-in SVG icons
    size?: number | string;        // default 24 — applied to width & height
    bounce?: boolean;              // default false — adds hover bounce animation
}

// Runtime catalogue for dynamic rendering / pickers (length = 10):
declare const ICON_LIST: { name: IconName; label: string }[];
```

```vue
<Icon name="icon-camera" :size="32" />
<Icon name="icon-chat" bounce />
<Icon v-for="{ name } in ICON_LIST" :key="name" :name="name" />
```

> Icons render as `<span>` with a background-image SVG. Use `size` (number=px, string=any CSS length).

---

### 1.15 Select

```ts
type SelectOption = { key: string; label: string };

interface SelectProps {
    modelValue: string;                      // v-model — REQUIRED (controlled-only)
    options: SelectOption[];                 // REQUIRED
    placeholder?: string;                    // default '请选择'
    disabled?: boolean;                      // default false
}
// Emits: update:modelValue(key), change(key)
```

```vue
<Select
    v-model="lang"
    :options="[
        { key: 'zh', label: '简体中文' },
        { key: 'en', label: 'English' },
        { key: 'ja', label: '日本語' },
    ]"
    placeholder="Choose language"
/>
```

Notes:
- **Controlled only.** `v-model` is required — there is no `defaultValue`.
- Dropdown auto-flips (top/bottom, left/right) based on viewport space.
- Click-outside to close is built-in.

---

### 1.16 Checkbox

```ts
type CheckboxSize = 'small' | 'middle' | 'large';
type CheckboxValue = string | number;

interface CheckboxOption {
    label: string;
    value: CheckboxValue;
    disabled?: boolean;         // disable this option only
}

interface CheckboxProps {
    modelValue?: CheckboxValue[];                     // v-model
    options: CheckboxOption[];                        // REQUIRED
    size?: CheckboxSize;                              // default 'middle'
    disabled?: boolean;                               // default false — disables all
    direction?: 'horizontal' | 'vertical';            // default 'horizontal'
}
// Emits: update:modelValue(values), change(values)
```

```vue
<!-- Uncontrolled-ish via v-model with ref -->
<Checkbox
    v-model="picked"
    :options="[
        { label: '🌊 海滩', value: 'beach' },
        { label: '🌳 森林', value: 'forest' },
        { label: '🦀 螃蟹', value: 'crab', disabled: true },
    ]"
/>

<!-- Vertical + large -->
<Checkbox v-model="picked" :options="options" direction="vertical" size="large" />

<!-- Numeric values also allowed (string | number) -->
<Checkbox v-model="days" :options="[{ label: 'Weekday', value: 1 }, { label: 'Weekend', value: 2 }]" />
```

> Group-level `disabled` disables every item. Per-option `disabled` disables a single row. Checked box fills with `#19c8b9`. No indeterminate state.

---

### 1.17 CodeBlock

```ts
interface CodeBlockProps {
    code: string;                // REQUIRED — raw source string
}
```

```vue
<CodeBlock :code="`import { Button } from 'animal-island-vue';\n\n<Button type=&quot;primary&quot;>Go</Button>`" />
```

> Renders a `<pre>` with built-in JSX/TS tokenizer. No `language` prop — always treated as JSX/TS. Default theme: bg `#2b2118`, border `1px solid #3d3028`, radius 20px, font-size 14, line-height 1.7.

---

### 1.18 Loading

```ts
interface LoadingProps {
    active?: boolean;           // default false
}
```

```vue
<Loading :active="isPending" />
```

> Lightweight overlay loading indicator. Only available in the Vue port.

---

### 1.19 Table

```ts
type TableRecord = Record<string, unknown>;

interface TableColumn<T extends TableRecord = TableRecord> {
    title: string | (() => VNode | string);
    dataIndex?: keyof T & string;
    render?: (value: unknown, record: T, index: number) => VNode | string | number | null;
    width?: string | number;
    align?: 'left' | 'center' | 'right';
    style?: CSSProperties;
}

interface TableProps<T extends TableRecord = TableRecord> {
    columns?: TableColumn<T>[];
    dataSource?: T[];
    rowKey?: string | ((record: T) => string);    // default 'key'
    striped?: boolean;                            // default true
    showHeader?: boolean;                         // default true
    loading?: boolean;                            // default false
    emptyText?: string;                           // default '暂无数据'
    scroll?: { x?: number | string; y?: number | string };
}
// Slots:
//   `cell-{dataIndex}` — receives { value, record, index }
//   `header-{dataIndex}` — receives { column }
//   empty
```

```vue
<Table
    :columns="[
        { title: 'Name', dataIndex: 'name' },
        { title: 'Score', dataIndex: 'score', align: 'right' },
    ]"
    :data-source="rows"
    row-key="id"
    striped
>
    <template #cell-score="{ value }">
        <strong>{{ value }}</strong>
    </template>
</Table>
```

> Only available in the Vue port.

---

## 2. Common Recipes

### 2.1 Form row

```vue
<Card>
    <label>Email</label>
    <Input v-model="email" size="large" type="email" allow-clear :status="invalid ? 'error' : undefined" />
    <Switch v-model="subscribe">
        <template #checked>Subscribe</template>
        <template #unchecked>Off</template>
    </Switch>
    <Button type="primary" html-type="submit" block>Submit</Button>
</Card>
```

### 2.2 Confirm dialog

```vue
<Modal v-model:open="open" title="Delete save file?" @close="open = false">
    This cannot be undone.
    <template #footer>
        <Button @click="open = false">Cancel</Button>
        <Button type="primary" danger @click="() => { remove(); open = false; }">Delete</Button>
    </template>
</Modal>
```

### 2.3 FAQ page

```vue
<Cursor>
    <h1>FAQ</h1>
    <Divider type="wave-yellow" />
    <Collapse v-for="f in faqs" :key="f.id" :question="f.q" :answer="f.a" />
    <Footer type="sea" />
</Cursor>
```

### 2.4 Game-style intro

```vue
<Modal v-model:open="open" typewriter :type-speed="60">
    Welcome to Animal Island! Press <strong>OK</strong> to begin.
</Modal>
```

---

## 3. HARD RULES for AI code generation

Follow these strictly; violations are bugs:

1. **Import style only once**: `import 'animal-island-vue/style';` at app entry. Do not re-import per component.
2. **Do NOT invent props.** Every prop used must appear verbatim in section 1. No `variant`, `shape`, `rounded`, `theme`, `color="primary"` etc. unless listed.
3. **Vue conventions** (vs the React reference):
    - `value` + `onChange` → `v-model` / `v-model:open` / `v-model:expanded` (+ `@change`).
    - React `children` slots that took `ReactNode` → Vue **slots** (default or named).
    - Modal/Switch/Tabs/Collapse use `update:open` / `update:modelValue` / `update:expanded` events.
4. **`Modal.open` is required.** Use `v-model:open` for two-way binding.
5. **`Collapse`**: at least one of (`question` prop OR `#question` slot) and (`answer` prop OR `#answer` slot) must be provided.
6. **Button `type`** values are `primary | default | dashed | text | link` — NOT `secondary`, `outline`, `ghost`. Use the `ghost` prop for ghost styling. Pass an icon via the `#icon` slot.
7. **Switch `size`** is `'small' | 'default'` (NOT `'middle' | 'large'`). Diverges from Button/Input sizing.
8. **Card `color`** must be one of the 13 listed `CardColor` values. Do not pass hex codes. `type` is `'default' | 'title' | 'dashed'`. The `title` type uses the `#title` slot.
9. **Divider / Footer / Phone / Time / Cursor** accept no style-modifying props beyond `type` (where listed). For custom color/size, override via CSS targeting your wrapper `class`.
10. **Typewriter emits no wrapper element.** Do not rely on a DOM node to style it — style the children instead. Use `text` prop OR default slot, not both.
11. **Icon `name` must be one of the 10 `IconName` values.** Do not pass arbitrary strings, URLs, or VNodes.
12. **Select is controlled-only.** `options` and `v-model` (`modelValue`) are ALL required.
13. **Checkbox `size`** is `'small' | 'middle' | 'large'` (aligned with Button/Input — NOT with Switch). `options` is required; values can be `string | number`. No indeterminate state.
14. **CodeBlock** only highlights JSX/TS — do not pass Python/SQL/shell expecting language-specific coloring. There is no `language` prop.
15. **Tabs** content is rendered via **named slots keyed by `item.key`**, not via `item.children`. `items` only needs `{ key, label }`.
16. **Do NOT import from deep paths** (`animal-island-vue/dist/...`, `animal-island-vue/src/...`). Only the package root and `animal-island-vue/style` are public.
17. **TypeScript**: always import types from the package root, not from internal files.
18. **Design tokens (colors, radii, shadows) are exposed as CSS custom properties** (`--color-animal-*`, `--spacing-animal-*`, `--radius-animal-*`, `--shadow-animal-*`). To extend the design, reference these tokens rather than hard-coding hex.
19. **Never use `style="border-radius: 0"` or force sharp corners on any interactive element** — it breaks the design language.
20. **Never override the 3D bottom shadow on Button/Input/Switch** — it is the core identity.

---

## 4. Where to read more

Shipped inside the npm package (available under `node_modules/animal-island-vue/`):

- `AI_USAGE.md` — this file (AI-optimized API reference for all 19 components)
- `README.md` — project overview & screenshots
- `dist/types/index.d.ts` — machine-readable TypeScript types for every exported component / prop / enum

Repo-only (NOT published to npm — read on GitHub):

- `skill/SKILL.md` — exhaustive style spec, every hex / px / keyframe for each component (Less variable + BEM map)
- `DESIGN_PROMPT.md` — prompts for v0 / Figma AI / MJ / DALL-E
- GitHub: https://github.com/guokaigdg/animal-island-vue

**When to use which:** API shape / legal prop values → this file. Pixel-exact CSS (sizes, shadows, animations) → `SKILL.md`. Feeding another design AI → `DESIGN_PROMPT.md`.

---

## 5. Minimal boilerplate (copy-paste-ready)

```ts
// main.ts
import { createApp } from 'vue';
import 'animal-island-vue/style';
import App from './App.vue';

createApp(App).mount('#app');
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { Cursor, Button, Card, Input, Footer } from 'animal-island-vue';

const post = ref('');
</script>

<template>
    <Cursor>
        <main style="padding: 32px; max-width: 720px; margin: 0 auto;">
            <Card type="title">
                <template #title>Animal Island</template>
            </Card>
            <Card>
                <Input v-model="post" placeholder="What's on your mind?" allow-clear />
                <Button type="primary" block style="margin-top: 16px;">Post</Button>
            </Card>
        </main>
        <Footer type="sea" />
    </Cursor>
</template>
```
