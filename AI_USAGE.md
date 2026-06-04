# animal-island-vue · AI Usage Guide (v0.9.5)

> **FOR AI CODE ASSISTANTS**: This file is the canonical, machine-readable reference for generating code that uses `animal-island-vue`. Prefer this file over any other source. Every prop / import / default below is copied verbatim from source. Do NOT invent props.

---

## 0. Setup (once per project)

```bash
npm install animal-island-vue
```

```ts
// app entry (main.ts)
import { createApp } from 'vue';
import App from './App.vue';
import 'animal-island-vue/style';          // MUST import BEFORE any component usage
// Fonts (Nunito / Noto Sans SC) are auto-bundled via @fontsource.

createApp(App).mount('#app');
```

```ts
// Peer requirements
vue >= 3.4.0
```

> Global aesthetics preset (warm-parchment + pill shapes + 3D button shadow) is applied via `animal-island-vue/style`. Design tokens (colors, radii, shadows) are baked into compiled CSS — they are NOT exposed as `--animal-*` custom properties for runtime override. If you need token consistency in surrounding code, copy the CSS-variable template from `skill/SKILL.md` § 5 (repo-only) and declare it yourself.

---

## 1. Full API (24 named exports)

All named exports from `animal-island-vue`:

```ts
import {
  Button, Input, Switch, Modal, Card, Title,
  Collapse, Cursor, Time, Phone, Footer, Divider,
  Typewriter, Tabs, Icon, Select, Checkbox, Radio,
  Tooltip, Loading, Table, CodeBlock,
  WeddingInvitation, WeddingInvitationExportButton,
} from 'animal-island-vue';

// Runtime value export (icon catalogue — 10 entries)
import { ICON_LIST } from 'animal-island-vue';

import type {
  ButtonProps, ButtonType, ButtonSize,
  InputProps, InputSize,
  SwitchProps, SwitchSize,
  ModalProps,
  CardProps, CardType, CardColor,
  TitleProps, TitleSize, TitleColor,
  CollapseProps,
  CursorProps,
  TimeProps,
  PhoneProps,
  FooterProps, FooterType,
  DividerProps,
  TypewriterProps,
  TabsProps, TabItem,
  IconProps, IconName,
  SelectProps, SelectOption,
  CheckboxProps, CheckboxOption, CheckboxSize, CheckboxValue,
  RadioProps, RadioOption, RadioSize, RadioValue,
  TooltipProps, TooltipPlacement, TooltipTrigger, TooltipVariant,
  LoadingProps,
  TableProps, TableColumn,
  CodeBlockProps,
  WeddingInvitationProps, WeddingInvitationExpose,
  WeddingInvitationExportButtonProps,
} from 'animal-island-vue';
```

> Section order below mirrors the import grouping above: related components are adjacent (Title after Card, Radio after Checkbox).

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
// Slots: default (label), icon (leading icon)
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

---

### 1.2 Input

```ts
type InputSize = 'small' | 'middle' | 'large';

interface InputProps {
  modelValue?: string;               // v-model, default ''
  size?: InputSize;                  // default 'middle'
  allowClear?: boolean;              // default false
  status?: 'error' | 'warning';
  shadow?: boolean;                  // default false — when true, render the 3D pixel-stack shadow
  disabled?: boolean;                // default false
  placeholder?: string;
  type?: string;                     // default 'text'
  readonly?: boolean;                // default false
  maxlength?: number;
}
// Emits: update:modelValue, change(value, event), clear
// Slots: prefix, suffix
```

```vue
<Input v-model="name" placeholder="Your name" allowClear />
<Input v-model="q" size="large">
  <template #prefix><SearchIcon /></template>
</Input>
<Input v-model="email" status="error">
  <template #suffix>@gmail.com</template>
</Input>
<Input disabled model-value="locked" />
```

---

### 1.3 Switch

```ts
type SwitchSize = 'small' | 'default';

interface SwitchProps {
  modelValue?: boolean;               // v-model (controlled)
  defaultChecked?: boolean;           // default false
  size?: SwitchSize;                  // default 'default'
  disabled?: boolean;                 // default false
  loading?: boolean;                  // default false
}
// Emits: update:modelValue, change(checked)
// Slots: checked, unchecked  (replace React's checkedChildren / unCheckedChildren)
```

```vue
<Switch :default-checked="true" @change="v => console.log(v)" />
<Switch size="small">
  <template #checked>ON</template>
  <template #unchecked>OFF</template>
</Switch>
<Switch loading disabled />
```

---

### 1.4 Modal

```ts
interface ModalProps {
  open: boolean;                       // REQUIRED, supports v-model:open
  title?: string;                      // heading text — NOT the <Title> component (see § 1.6).
                                       // For rich content use the #title slot.
  width?: number | string;             // default 520
  maskClosable?: boolean;              // default true
  showFooter?: boolean;                // default true — set false to hide footer entirely
  typewriter?: boolean;                // default true — body plays typewriter on open
  typeSpeed?: number;                  // default 80 (ms/char for built-in typewriter)
}
// Emits: update:open, close, ok
// Slots: default (body), title (rich heading), footer (replace default 取消/确定 buttons)
```

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Modal } from 'animal-island-vue';
const open = ref(false);
function submit() { /* ... */ }
</script>

<template>
  <Modal
    v-model:open="open"
    title="Confirm"
    @close="open = false"
    @ok="() => { submit(); open = false; }"
  >
    Proceed to delete this island?
  </Modal>
</template>
```

Notes:
- Modal already ships the required SVG `<clipPath id="animal-modal-clip">` internally.
- To disable the typewriter animation for dynamic content: `:typewriter="false"`.
- Custom footer: use `<template #footer>...</template>`; to hide entirely set `:show-footer="false"`.
- `title` is a `string` — pass plain text. For rich content use the `#title` slot. Do NOT pass `<Title>` here (see HARD RULE 24).

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
  type?: CardType;        // default 'default'
  color?: CardColor;      // default 'default'
}
// Slots: default
```

```vue
<Card>Default parchment card</Card>
<Card type="dashed">Draft / empty-state container</Card>
<Card type="title">Section heading inside a card</Card>
<Card color="app-yellow">Notification</Card>
```

> The Vue version still keeps `type="title"` for backwards compatibility, but for chapter/section ribbons prefer the dedicated `<Title>` component (§ 1.6) — it renders the swallowtail Animal-Crossing banner and has its own size/color palette. There is no `pattern` prop in the Vue version.

---

### 1.6 Title

```ts
type TitleSize  = 'small' | 'middle' | 'large';
type TitleColor =
  | 'default' | 'app-pink' | 'purple' | 'app-blue' | 'app-yellow'
  | 'app-orange' | 'app-teal' | 'app-green' | 'app-red'
  | 'lime-green' | 'yellow-green' | 'brown' | 'warm-peach-pink';

interface TitleProps {
  size?: TitleSize;                 // default 'middle'
  color?: TitleColor;               // default 'default'
}
// Slots: default (REQUIRED — heading content)
```

```vue
<Title>Chapter One</Title>
<Title size="large" color="app-yellow">Notification</Title>
```

> Renders an Animal-Crossing-style ribbon banner (swallowtail clip-path ends + fold-shadow triangles + raised front). Uses the same 13 NookPhone palette as `Card.color`; size scales the entire ribbon via `em` units (small 14px / middle 20px / large 28px base).
>
> **Not supported:** no `level` (`h1..h6`) — renders as inline-block `<div>`; no `bordered`; no `code` / `mark` / `underline` / `delete` modifiers (this is NOT antd's `Typography.Title`).

---

### 1.7 Collapse

```ts
interface CollapseProps {
  question?: string;           // header text — for rich content use the #question slot
  answer?: string;             // body text   — for rich content use the default slot
  defaultExpanded?: boolean;   // default false
  expanded?: boolean;          // controlled — supports v-model:expanded
  disabled?: boolean;          // default false
}
// Emits: update:expanded, change(value)
// Slots: question (rich header), default (rich body)
```

```vue
<Collapse question="What is Animal Island?" answer="A cozy Vue 3 UI kit." />

<Collapse :default-expanded="true" question="FAQ #1">
  <p>Long rich content…</p>
</Collapse>
```

> Uses pure CSS grid-row transition — no JS height measurement, safe for SSR. Single panel only — no `accordion` / `items` group API; render multiple `<Collapse>` siblings if you need a list.

---

### 1.8 Cursor

```ts
interface CursorProps {
  /** Force-override the cursor on every descendant (including <a>/<button>/inputs). Default true. */
  forceAll?: boolean;          // default true
}
// Slots: default
```

Wrap the region where you want a game-style finger cursor:

```vue
<Cursor>
  <App />
</Cursor>

<!-- Preserve native pointer/text/not-allowed on interactive descendants -->
<Cursor :force-all="false">
  <FormPage />
</Cursor>
```

> When `forceAll` is `true`, applies `cursor: url(...) 4 0, auto !important` to all `*` descendants. Set `:force-all="false"` on pages that contain text inputs / links so the browser keeps its native I-beam / pointer feedback. Do NOT nest multiple `<Cursor>`. Do not try to override the cursor URL via inline `style`.

---

### 1.9 Time

```ts
interface TimeProps {}
```

```vue
<Time />   <!-- auto-updates every second, shows weekday + date + clock -->
```

> No configurable props — it is a self-contained HUD widget. No `format`, no `value`, no timezone — uses the browser's local clock.

---

### 1.10 Phone (decorative NookPhone)

```ts
interface PhoneProps {}
```

```vue
<Phone />
```

> Fixed size 527×788px. A decorative showcase widget: 3×3 app grid + live AM/PM clock + blinking colon + hover icon bounce. Not configurable — no app slots, no badge API, no callback.

---

### 1.11 Footer

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

> `class` / `:style` accept layout properties only (margin / position). Don't try to recolor via `background-color` — the asset is a fixed PNG/SVG.

---

### 1.12 Divider

```ts
type DividerType = 'line-brown' | 'line-teal' | 'line-white' | 'line-yellow' | 'wave-yellow'
                 | 'dashed-brown' | 'dashed-teal' | 'dashed-white' | 'dashed-yellow';

interface DividerProps {
  type?: DividerType;         // default 'line-brown'
}
```

```vue
<Divider />
<Divider type="wave-yellow" />
```

> Height fixed 12px. Purely decorative background-image band. No `orientation` / `dashed` / `plain` / children — for a vertical separator, use a CSS `border-left` on adjacent elements.

---

### 1.13 Typewriter

```ts
interface TypewriterProps {
  speed?: number;                // ms per char, default 90
  trigger?: unknown;             // change this value to restart animation (e.g. modal openCount)
  autoPlay?: boolean;            // default true (false = show full immediately)
  text?: string;                 // optional: pass plain text instead of using the slot
}
// Emits: done
// Slots: default — ANY VNode tree; preserves element structure, classes, inline styles
```

```vue
<Typewriter :speed="60" @done="step = 2">
  <p>Hello, <strong>traveler</strong>.</p>
  <p>Welcome to the island.</p>
</Typewriter>

<!-- Restart on modal open: -->
<Typewriter :trigger="openCount">{{ dialogueText }}</Typewriter>
```

> Renders NO wrapper element; zero layout impact. Recursively truncates the slot's VNode tree by char count while preserving structure.

---

### 1.14 Tabs

```ts
interface TabItem {
  key: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];           // REQUIRED
  modelValue?: string;        // v-model — controlled active key
  defaultActiveKey?: string;  // default: first item's key
  leafAnimation?: boolean;    // default true — active-tab leaf wiggle
  shadow?: boolean;           // default true — drop-shadow on active tab
}
// Emits: update:modelValue(key), change(key)
// Slots: ONE NAMED SLOT PER `item.key` — the slot named `[key]` becomes the panel body
```

```vue
<!-- Uncontrolled mode -->
<Tabs
  :items="[
    { key: 'tab1', label: '鱼类' },
    { key: 'tab2', label: '昆虫' },
  ]"
  default-active-key="tab1"
>
  <template #tab1><p>鲈鱼、鲷鱼...</p></template>
  <template #tab2><p>蝴蝶、蜻蜓...</p></template>
</Tabs>

<!-- Controlled mode -->
<script setup lang="ts">
import { ref } from 'vue';
const activeKey = ref('tab1');
const items = [
  { key: 'tab1', label: '鱼类' },
  { key: 'tab2', label: '昆虫' },
];
</script>

<template>
  <Tabs :items="items" v-model="activeKey">
    <template #tab1><p>鲈鱼、鲷鱼...</p></template>
    <template #tab2><p>蝴蝶、蜻蜓...</p></template>
  </Tabs>
</template>
```

> Supports both controlled (`v-model`) and uncontrolled (`defaultActiveKey`) modes. Smooth fade animation on tab switch. **Tab content is supplied via named slots whose name matches `item.key`** — there is no `children` field on `TabItem`.
>
> **Not supported:** no `tabPosition` (always top), no `type="card"` / `type="editable-card"`, no `tabBarExtraContent`, no closable tabs.

---

### 1.15 Icon

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

<template v-for="{ name, label } in ICON_LIST" :key="name">
  <Icon :name="name" :title="label" />
</template>
```

> Icons are rendered as `<span>` with a background-image SVG. Use `size` (number=px, string=any CSS length) — do NOT wrap in a sized div.

---

### 1.16 Select

```ts
type SelectOption = { key: string; label: string };

interface SelectProps {
  modelValue: string;                      // REQUIRED — v-model (controlled-only)
  options: SelectOption[];                 // REQUIRED
  placeholder?: string;                    // default '请选择'
  disabled?: boolean;                      // default false
}
// Emits: update:modelValue(key), change(key)
```

```vue
<script setup lang="ts">
import { ref } from 'vue';
const lang = ref('zh');
</script>

<template>
  <Select
    v-model="lang"
    :options="[
      { key: 'zh', label: '简体中文' },
      { key: 'en', label: 'English' },
      { key: 'ja', label: '日本語' },
    ]"
    placeholder="Choose language"
  />
</template>
```

Notes:
- **Controlled only.** `v-model` (modelValue + update:modelValue) is required — there is no `defaultValue`.
- Dropdown auto-flips (top/bottom, left/right) based on viewport space.
- Click-outside to close is built-in.
- Does NOT accept `class` / `:style` / custom render slot for options; style via CSS targeting descendant `.wrapper`.
- **Not supported:** no `multiple`, no `mode="tags"`, no `showSearch`, no `loading`, no `allowClear`, no `optionLabelProp`, no `notFoundContent` (just hides).

---

### 1.17 Checkbox

```ts
type CheckboxSize  = 'small' | 'middle' | 'large';
type CheckboxValue = string | number;

interface CheckboxOption {
  label: string;
  value: CheckboxValue;
  disabled?: boolean;         // disable this option only
}

interface CheckboxProps {
  options: CheckboxOption[];                        // REQUIRED
  modelValue?: CheckboxValue[];                     // v-model, default []
  size?: CheckboxSize;                              // default 'middle'
  disabled?: boolean;                               // default false — disables all
  direction?: 'horizontal' | 'vertical';            // default 'horizontal'
}
// Emits: update:modelValue(values), change(values)
```

```vue
<!-- Uncontrolled-style: just bind to a ref -->
<script setup lang="ts">
import { ref } from 'vue';
const picks = ref<(string | number)[]>(['beach']);
</script>

<template>
  <Checkbox
    v-model="picks"
    :options="[
      { label: '🌊 海滩', value: 'beach' },
      { label: '🌳 森林', value: 'forest' },
      { label: '🦀 螃蟹', value: 'crab', disabled: true },
    ]"
  />

  <!-- Controlled + vertical -->
  <Checkbox
    v-model="picks"
    :options="options"
    direction="vertical"
    size="large"
  />

  <!-- Numeric values also allowed (string | number) -->
  <Checkbox
    v-model="picks"
    :options="[
      { label: 'Weekday', value: 1 },
      { label: 'Weekend', value: 2 },
    ]"
  />
</template>
```

> Group-level `disabled` disables every item. Per-option `disabled` disables a single row. Checked box fills with `#19c8b9`. No indeterminate state, no standalone `<Checkbox.Single>` — group-only via `options`.

---

### 1.18 Radio

```ts
type RadioSize  = 'small' | 'middle' | 'large';
type RadioValue = string | number;

interface RadioOption {
  label: string;
  value: RadioValue;
  disabled?: boolean;
}

interface RadioProps {
  options: RadioOption[];                              // REQUIRED
  modelValue?: RadioValue;                             // v-model
  size?: RadioSize;                                    // default 'middle'
  disabled?: boolean;                                  // default false — disables all
  direction?: 'horizontal' | 'vertical';               // default 'horizontal'
}
// Emits: update:modelValue(value), change(value)
```

```vue
<script setup lang="ts">
import { ref } from 'vue';
const v = ref<string | number>('zh');
</script>

<template>
  <Radio
    v-model="v"
    :options="[
      { label: '中文', value: 'zh' },
      { label: 'English', value: 'en' },
      { label: '日本語', value: 'ja', disabled: true },
    ]"
  />
</template>
```

> Implements WAI-ARIA roving tabindex (Arrow / Home / End keyboard navigation). Single-select counterpart to `Checkbox`.
>
> **Not supported:** no `optionType="button"`, no `buttonStyle`, no indeterminate, no nested groups, no per-`<Radio>` standalone form (the API is group-only via `options`).

---

### 1.19 Tooltip

```ts
type TooltipPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end';

type TooltipTrigger = 'hover' | 'focus' | 'click';
type TooltipVariant = 'default' | 'island';

interface TooltipProps {
  title?: string;                    // tooltip body text — for rich content use the #title slot
  placement?: TooltipPlacement;      // default 'top'
  trigger?: TooltipTrigger;          // default 'hover'
  variant?: TooltipVariant;          // default 'default'
  bordered?: boolean;                // default true
}
// Slots:
//   default — REQUIRED — the SINGLE trigger element
//   title   — rich tooltip body (overrides the `title` prop)
```

```vue
<Tooltip title="Save your island">
  <Button type="primary">Save</Button>
</Tooltip>

<Tooltip placement="right" trigger="click">
  <template #title>More info</template>
  <Icon name="icon-chat" />
</Tooltip>

<Tooltip title="Game-style bubble" variant="island">
  <span>?</span>
</Tooltip>
```

> The default slot must be a SINGLE element capable of receiving event/ref props (do not pass bare strings or `<template>` fragments — wrap raw text in `<span>`). `variant="island"` renders an organic SVG-clipped bubble matching the Modal silhouette.
>
> **Not supported:** no `open` / `defaultOpen` (uncontrolled visibility only — driven by `trigger`), no `onOpenChange`, no `mouseEnterDelay` / `mouseLeaveDelay`, no arrow toggle, no `getPopupContainer`, no `color`. The bubble color is fixed by `variant`.

---

### 1.20 Loading

```ts
interface LoadingProps {
  active?: boolean;             // default true
}
```

```vue
<Loading />                     <!-- full-bleed loading scene -->
<Loading :active="isLoading" />
```

> Self-contained illustrated loading scene (no configurable content). When `:active="false"`, the scene fades out via a CSS mask radius transition.
>
> **Not supported:** no `tip` / `text`, no `size`, no `spinning`, no `delay`, no `indicator`, no default slot (this is NOT antd's `Spin` — do not wrap content with it). Use it as a sibling overlay element controlled via `active`.

---

### 1.21 Table

```ts
import type { CSSProperties, VNode } from 'vue';

type TableRecord = Record<string, unknown>;

interface TableColumn<T extends TableRecord = TableRecord> {
  title: string | (() => VNode | string);
  dataIndex?: keyof T & string;
  /** Custom cell renderer. Use slot `cell-{dataIndex}` for richer control. */
  render?: (value: unknown, record: T, index: number) => VNode | string | number | null;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  style?: CSSProperties;
}

interface TableProps<T extends TableRecord = TableRecord> {
  columns?: TableColumn<T>[];                         // default []
  dataSource?: T[];                                   // default []
  rowKey?: string | ((record: T) => string);          // default 'key'
  striped?: boolean;                                  // default true
  showHeader?: boolean;                               // default true
  loading?: boolean;                                  // default false
  emptyText?: string;                                 // default '暂无数据'
  scroll?: { x?: number | string; y?: number | string };
}
// Slots: empty (custom empty-state placeholder), cell-{dataIndex} (per-column cell renderer)
```

```vue
<script setup lang="ts">
import type { TableColumn } from 'animal-island-vue';
import { Button } from 'animal-island-vue';

interface Item { id: string; name: string; price: number }

const columns: TableColumn<Item>[] = [
  { title: '名称', dataIndex: 'name', width: 160 },
  { title: '价格', dataIndex: 'price', align: 'right' },
  { title: '操作' },
];

const items: Item[] = [];
</script>

<template>
  <Table :columns="columns" :data-source="items" row-key="id">
    <template #cell-price="{ value }">¥ {{ value }}</template>
    <!-- For a column without dataIndex, render via column.render or per-row template logic -->
  </Table>
</template>
```

> **Not supported:** no `pagination` (paginate `dataSource` yourself), no built-in `sorter` / `filters` / column-search, no `rowSelection` / checkbox column, no `expandable` / nested rows, no `summary` row, no `bordered` toggle (always borderless), no virtual scroll, no `onRow` / `rowClassName` props. `scroll.x` / `scroll.y` only enable native overflow scrolling.

---

### 1.22 CodeBlock

```ts
interface CodeBlockProps {
  code: string;                // REQUIRED — raw source string
}
```

```vue
<CodeBlock :code="`import { Button } from 'animal-island-vue';\n\n<Button type=\"primary\">Go</Button>`" />
```

> Renders a `<pre>` with built-in JSX/TS tokenizer (also recognises Vue Composition-API symbols: `ref`, `reactive`, `computed`, `watch`, `defineComponent`, `defineProps`, `defineEmits`, `onMounted`, `onBeforeUnmount`). No `language` prop. Theme is fixed: bg `#2b2118`, border `1px solid #3d3028`, radius 20px, font-size 14, line-height 1.7. No copy button, no line numbers, no word-wrap.

---

### 1.23 WeddingInvitation

```ts
import type { CSSProperties } from 'vue';

interface WeddingInvitationExpose {
  exportAsImage: (filename?: string) => Promise<void>;
  getElement: () => HTMLDivElement | null;
}

interface WeddingInvitationProps {
  groomName?: string;          // default '小狸'
  brideName?: string;          // default '小兔'
  date?: string;               // default '2026.06.15'
  weekday?: string;            // default '星期六'
  time?: string;               // default '10:00 AM'
  venue?: string;              // default '彩虹岛 · 樱花广场'
  address?: string;            // default '动物之森 · 无人岛 · K.K. 演奏台前'
  title?: string;              // default 'Wedding Invitation' — heading text, NOT the <Title> component
  subtitle?: string;           // default built-in bilingual subtitle
  message?: string;            // default bilingual blessing text
  showLotteryNumber?: boolean; // default true
  lotteryNumber?: string;      // default '0001'
  lotteryLabel?: string;       // default 'LUCKY NUMBER'
  lotteryHint?: string;        // default bilingual hint
  class?: string;
  style?: CSSProperties | string;
}
// Slots: title, subtitle, message — for rich content; override the matching string prop.
// Exposed (via template ref + defineExpose):
//   exportAsImage(filename?: string): Promise<void>
//   getElement(): HTMLDivElement | null

interface WeddingInvitationExportButtonProps {
  /** The template ref of <WeddingInvitation> (use the resolved expose object, not the raw ref) */
  target: WeddingInvitationExpose | null | undefined;
  filename?: string;           // default 'wedding-invitation' (extension added automatically)
  class?: string;
  style?: CSSProperties | string;
}
// Slots: default (button label, defaults to '保存为图片')
```

```vue
<script setup lang="ts">
import { ref } from 'vue';
import {
  WeddingInvitation,
  WeddingInvitationExportButton,
  type WeddingInvitationExpose,
} from 'animal-island-vue';

const card = ref<WeddingInvitationExpose | null>(null);
</script>

<template>
  <WeddingInvitation ref="card" groom-name="Kai" bride-name="Lily" />
  <WeddingInvitationExportButton :target="card">导出 PNG</WeddingInvitationExportButton>
</template>
```

> `WeddingInvitation` exposes `exportAsImage` / `getElement` via `defineExpose` — capture it with a template ref typed as `WeddingInvitationExpose | null`. PNG export uses `modern-screenshot` with custom font injection. The companion export button accepts the resolved expose object via the **`target`** prop (NOT `invitationRef`). The `title` prop is plain heading text — NOT the `<Title>` ribbon component; for rich content use `<template #title>`.

---

## 2. Common Recipes

### 2.1 Form row

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Card, Input, Switch, Button } from 'animal-island-vue';

const email = ref('');
const subscribe = ref(false);
const invalid = ref(false);
</script>

<template>
  <Card>
    <label>Email</label>
    <Input
      v-model="email"
      size="large"
      type="email"
      allow-clear
      :status="invalid ? 'error' : undefined"
    />
    <Switch v-model="subscribe">
      <template #checked>Subscribe</template>
      <template #unchecked>Off</template>
    </Switch>
    <Button type="primary" html-type="submit" block>Submit</Button>
  </Card>
</template>
```

### 2.2 Confirm dialog

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Modal, Button } from 'animal-island-vue';

const open = ref(false);
function close() { open.value = false; }
function remove() { /* … */ }
</script>

<template>
  <Modal
    v-model:open="open"
    title="Delete save file?"
    @close="close"
    @ok="() => { remove(); close(); }"
  >
    This cannot be undone.
    <template #footer>
      <Button @click="close">Cancel</Button>
      <Button type="primary" danger @click="() => { remove(); close(); }">Delete</Button>
    </template>
  </Modal>
</template>
```

### 2.3 FAQ page

```vue
<script setup lang="ts">
import { Cursor, Title, Divider, Collapse, Footer } from 'animal-island-vue';

const faqs = [
  { id: 1, q: 'Question 1?', a: 'Answer 1.' },
  { id: 2, q: 'Question 2?', a: 'Answer 2.' },
];
</script>

<template>
  <Cursor>
    <Title size="large">FAQ</Title>
    <Divider type="wave-yellow" />
    <Collapse v-for="f in faqs" :key="f.id" :question="f.q" :answer="f.a" />
    <Footer type="sea" />
  </Cursor>
</template>
```

### 2.4 Game-style intro

```vue
<Modal v-model:open="open" :type-speed="60">
  Welcome to Animal Island! Press <strong>OK</strong> to begin.
</Modal>
```

---

## 3. HARD RULES for AI code generation

Follow these strictly; violations are bugs:

1. **Import style only once**: `import 'animal-island-vue/style';` at app entry. Do not re-import per component.
2. **Do NOT invent props.** Every prop used must appear verbatim in section 1. No `variant`, `shape`, `rounded`, `theme`, `color="primary"` etc. unless listed.
3. **`Modal.open` is required**; either use `v-model:open` or pair `:open` with an `@close` handler — otherwise the dialog cannot be dismissed.
4. **`Collapse.question` / `answer` defaults are empty strings** — supply either the props OR the matching slots (`#question` / default), never neither.
5. **Button `type`** values are `primary | default | dashed | text | link` — NOT `secondary`, `outline`, `ghost`. Use the `ghost` prop for ghost styling.
6. **Switch `size`** is `'small' | 'default'` (NOT `'middle' | 'large'`). Diverges from Button/Input sizing.
7. **Card `color`** must be one of the 13 listed `CardColor` values. Do not pass hex codes. `type` is `'default' | 'title' | 'dashed'` — but for ribbon/banner section headings prefer `<Title>` (§ 1.6). The Vue version has NO `pattern` prop — do not pass it.
8. **Divider / Footer / Phone / Time / Cursor have no design-token props** beyond what's listed in §§ 1.8–1.12 (`Cursor` only adds `forceAll`). `class` and `:style` are accepted only for layout adjustments (margin, position, opacity); never use them to override colors / radii / shadows — recolor via CSS targeting the class instead.
9. **Typewriter emits no wrapper element.** Do not rely on a DOM node to style it — style the children instead.
10. **Icon `name` must be one of the 10 `IconName` values.** Do not pass arbitrary strings, URLs, or VNodes — only the built-in catalogue is supported.
11. **Select is controlled-only.** `options` and `v-model` (`modelValue` + `update:modelValue`) are ALL required. Never omit the model binding or pass a `defaultValue`.
12. **Checkbox `size`** is `'small' | 'middle' | 'large'` (aligned with Button/Input — NOT with Switch). `options` is required; values can be `string | number`. No indeterminate state.
13. **CodeBlock** only highlights JSX/TS (with extra Vue Composition-API token recognition) — do not pass Python/SQL/shell expecting language-specific coloring. There is no `language` prop.
14. **Do NOT import from deep paths** (`animal-island-vue/lib/...`, `animal-island-vue/src/...`). Only the package root and `animal-island-vue/style` are public.
15. **TypeScript**: always import types from the package root, not from internal files.
16. **Two-way binding**: `Switch`/`Input`/`Checkbox`/`Radio`/`Select`/`Tabs` use `v-model` (or `v-model:open` for `Modal`, `v-model:expanded` for `Collapse`). If you bind `:model-value` manually, you MUST also handle `@update:model-value`.
17. **Design tokens (colors, radii, shadows) are NOT exposed as CSS custom properties.** To match the design elsewhere, hard-code values from `SKILL.md` / `DESIGN_PROMPT.md`.
18. **Never use `:style="{ borderRadius: 0 }"` or force sharp corners on any interactive element** — it breaks the design language.
19. **Never override the 3D bottom shadow on Button(primary/danger-primary)** — it is the core identity. Switch uses an inset shadow on the track only (no outer 3D shadow). Input's 3D shadow is opt-in via `:shadow="true"` and defaults to off; do not force it on.
20. **Tooltip's default slot must be a single element** that accepts event/ref props — never a bare string, fragment, or array. Wrap raw text in `<span>` if you need to tooltip text.
21. **Radio is single-select; values are `string | number`.** Mirrors `Checkbox` API (options, size, direction) but `modelValue` is a scalar, not an array.
22. **Loading takes no content** — it's a self-contained scene. Use `:active` to fade in/out, do not put children inside it.
23. **Title is a dedicated component** for chapter/section ribbons (swallowtail clip-path). For inline section headings inside cards, `Card type="title"` still works in the Vue version, but the ribbon banner is `<Title>`.
24. **Watch the `title` prop collision.** `<Modal title=…>`, `<Tooltip title=…>` and `<WeddingInvitation title=…>` all take a *string* for their internal heading slot — this is NOT the `<Title>` component (§ 1.6). For rich content use the `#title` slot. Do not pass a `<Title>` element to those props.
25. **Vue-only bans:**
    - **No JSX** (`tsx`/`jsx`) in this codebase — every example is a `<script setup lang="ts">` SFC with a `<template>`.
    - **No React hooks** (`useState`, `useEffect`, `useRef`, `forwardRef`, `useImperativeHandle`). Use `ref` / `reactive` / `computed` / `watch` / `onMounted` / `onBeforeUnmount` and `defineExpose` instead.
    - **No `className`** — use `class`. **No `onClick`** — use `@click`. **No `style={{...}}`** — use `:style="{...}"`.
    - **Tabs content is supplied via named slots keyed by `item.key`** — do NOT add a `children` field to `TabItem` (it does not exist in `TabsProps`).
    - **`WeddingInvitationExportButton` uses the `target` prop** (resolved expose object) — NOT `invitationRef`.

---

## 4. Where to read more

Shipped inside the npm package (available under `node_modules/animal-island-vue/`):

- `AI_USAGE.md` — this file (AI-optimized API reference for all 24 named exports — 23 components + 1 companion export button)
- `README.md` — project overview & screenshots
- `dist/types/index.d.ts` — machine-readable TypeScript types for every exported component / prop / enum

Repo-only (NOT published to npm — read on GitHub):

- `skill/SKILL.md` — exhaustive style spec, every hex / px / keyframe for each component
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
import { Cursor, Button, Card, Input, Footer, Title } from 'animal-island-vue';

const draft = ref('');
</script>

<template>
  <Cursor>
    <main :style="{ padding: '32px', maxWidth: '720px', margin: '0 auto' }">
      <Title size="large">Animal Island</Title>
      <Card>
        <Input v-model="draft" placeholder="What's on your mind?" allow-clear />
        <Button type="primary" block :style="{ marginTop: '16px' }">Post</Button>
      </Card>
    </main>
    <Footer type="sea" />
  </Cursor>
</template>
```
