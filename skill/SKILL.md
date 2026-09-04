---

name: animal-island-vue-style
description: >
使用 animal-island-vue 设计风格创建 Vue 3 UI 界面或组件。当用户需要：
(1) 用自然可爱小岛风格创建 UI 页面或组件；
(2) 使用 animal-island-vue 组件库开发界面；
(3) 构建温馨自然、圆润可爱风格的 Vue 界面；
(4) 复现或扩展 animal-island-vue 的视觉语言；
(5) 提问"自然小岛风格"、"animal island 风格"、"可爱圆润风格"的 UI 时，务必使用此 skill。
-------------------------------------------------------------

# Animal Island Vue 设计风格指南

> **三文档分工**（生成代码 / 调样式时按需查阅，避免互相翻查）：
>
> - `AI_USAGE.md` — API 手册：每个组件的 props、类型、默认值、合法取值、禁用用法。**写代码优先查这里**。
>
> - `skill/SKILL.md`（本文档）— 像素级样式：设计 token、每组件精确 CSS（hex/px/keyframe）、Demo 布局、新组件开发模板。**要自己实现/扩展样式时查这里**。
>
> - `DESIGN_PROMPT.md` — 给外部工具（v0 / Figma AI / Midjourney / DALL-E）的提示词包，含 clip-path、色板速查、禁用清单。**只在喂别的 AI 时用**。

## 概述

animal-island-vue 是一套自然可爱小岛风格的 Vue 3 + TypeScript UI 组件库。
设计语言核心：**温暖大地色系 + 大圆角 pill 形 + 游戏按键立体感 + 柔和动效 + 几何 / 有机形状并存**（几何代表：Title 飘带的 swallowtail clip-path；有机代表：Modal 的 SVG blob）。

- 源码：`src/components/<ComponentName>/`（每组件包含 `*.vue` + `index.ts` + 可选 `types.ts`）

- Demo 站：`demo/pages/<ComponentName>Demo.vue`

- 构建：Vite (library mode) + `vite.config.ts`（库）/ `vite.config.docs.ts`（Demo）

- 样式系统：**scoped** **`<style lang="less" scoped>`** **+ BEM** + `src/styles/variables.less` 设计 token（**不使用 CSS Modules**）

### 全量导出清单（40 个 named exports — 含子组件、命令式 API 与伴生导出）

从 `src/index.ts` 导出：

| 组件           | 职责                                                                                                              | 交互   | 装饰 / 纯展示 |
| -------------- | ----------------------------------------------------------------------------------------------------------------- | ------ | ------------- |
| `BackTop`      | 返回顶部按钮，钱袋图标浮窗，支持自定义滚动容器、动画时长和可见高度                                                | ✓      | <br />        |
| `Button`       | 按钮，5 种类型 × 3 种尺寸                                                                                         | ✓      | <br />        |
| `Input`        | 输入框，3 种尺寸 + clear/prefix/suffix                                                                            | ✓      | <br />        |
| `Switch`       | 开关，默认/小号                                                                                                   | ✓      | <br />        |
| `Modal`        | SVG blob 裁切弹窗                                                                                                 | ✓      | <br />        |
| `Card`         | 容器，`default`/`dashed`，13 种调色板实色 + 13 种 `pattern` 波点墙纸（CSS radial-gradient，非图片）               | <br /> | ✓             |
| `Title`        | 章节标题，飘带横幅（swallowtail clip-path 燕尾 + 折角阴影 + 微透视正面），13 种配色（替代旧 `Card type="title"`） | <br /> | ✓             |
| `Collapse`     | 手风琴（动画用 CSS Grid 0fr↔1fr 实现，无 JS 动画）                                                                | ✓      | <br />        |
| `Select`       | 下拉选择器（受控）                                                                                                | ✓      | <br />        |
| `Skeleton`     | 加载占位骨架屏（SkeletonButton、SkeletonInput、SkeletonAvatar）                                                   | <br /> | ✓             |
| `Checkbox`     | 多选框组，水平/垂直，3 种尺寸                                                                                     | ✓      | <br />        |
| `Radio`        | 单选框组，3 种尺寸，键盘 roving tabindex                                                                          | ✓      | <br />        |
| `Tooltip`      | 12 种 placement，`hover`/`focus`/`click` 触发，`default`/`island` 形态                                            | ✓      | <br />        |
| `Time`         | HUD 实时时钟                                                                                                      | <br /> | ✓             |
| `Footer`       | 底部装饰（14 个 🎄 居中一行，`seamless` 铺满整行）                                                                | <br /> | ✓             |
| `Divider`      | 装饰分割线，5 种风格                                                                                              | <br /> | ✓             |
| `Cursor`       | 游戏手指光标包裹器                                                                                                | <br /> | ✓             |
| `Typewriter`   | 打字机效果，保留 VNode 结构                                                                                       | <br /> | ✓             |
| `Tabs`         | 标签页切换，叶子摆动动画可选                                                                                      | ✓      | <br />        |
| `CodeBlock`    | JSX/TS 语法高亮代码块                                                                                             | <br /> | ✓             |
| `Loading`      | 全屏遮罩 + SVG spinner（mint `#19c8b9`，`stroke-dasharray` 动画）                                                 | <br /> | ✓             |
| `Table`        | 数据表格，固定列、空状态、loading                                                                                 | ✓      | <br />        |
| `Pagination`   | 分页器，条数切换 / 快速跳转 / 总数展示，可内置于 Table                                                            | ✓      | <br />        |
| `Carousel`     | 轮播图，自动播放 / 箭头 / 圆点 / 键盘导航                                                                         | ✓      | <br />        |
| `Countdown`    | 倒计时，里程表式单向滚动数字                                                                                      | <br /> | ✓             |
| `Form`         | 表单系统（Form、FormItem、FormProvider、useForm）                                                                 | ✓      | <br />        |
| `Image`        | 相框图片，14 种底色、懒加载、点击预览                                                                             | ✓      | <br />        |
| `DatePicker`   | 日期选择器，日历网格 / 范围选择                                                                                   | ✓      | <br />        |
| `TimePicker`   | 时间选择器，时/分/秒滚动列                                                                                        | ✓      | <br />        |
| `Notification` | 命令式通知（含 NotificationContainer）                                                                            | ✓      | <br />        |
| `Tag`          | 标签，3 变体 × 13 色                                                                                              | <br /> | ✓             |
| `Progress`     | 进度条，斜纹动画填充                                                                                              | <br /> | ✓             |
| `Drawer`       | 抽屉，四方向弹出 + 焦点陷阱                                                                                       | ✓      | <br />        |

类型导出：`BackTopProps`、`ButtonProps/ButtonType/ButtonSize/ButtonHTMLType`、`InputProps/InputSize`、`SwitchProps/SwitchSize`、`ModalProps`、`CardProps/CardType/CardColor`、`TitleProps/TitleSize/TitleColor`、`CollapseProps`、`CursorProps`、`DividerProps/DividerType`、`TypewriterProps`、`SelectProps/SelectOption`、`SkeletonProps/SkeletonVariant`、`TabsProps/TabItem`、`CheckboxProps/CheckboxOption/CheckboxSize/CheckboxValue`、`RadioProps/RadioOption/RadioSize/RadioValue`、`TooltipProps/TooltipPlacement/TooltipTrigger/TooltipVariant`、`CodeBlockProps`、`TableProps/TableColumn/TableRecord`、`PaginationProps/PaginationVariant`、`CarouselProps`、`CountdownProps/CountdownSize/CountdownVariant`、`FormProps` 系列、`ImageProps/ImageColor`、`DatePickerProps/DatePickerSize/DatePickerStatus/DatePickerValue`、`TimePickerProps/TimePickerSize/TimePickerStatus/TimePart`、`NotificationConfig` 系列、`TagProps/TagSize/TagVariant/TagColor`、`ProgressProps/ProgressSize/ProgressInfoPosition`、`DrawerProps/DrawerPlacement`。

> Vue 端约定：
>
> - 受控值统一通过 `v-model` / `v-model:open` / `v-model:expanded`（即 `modelValue` + `update:modelValue` 等事件）
>
> - React 中的 `ReactNode` props 在 Vue 端改为**命名插槽**（`#icon`、`#prefix`、`#suffix`、`#footer`、`#checked`、`#unchecked`、`#question`、`#empty`、Table 的 `#cell-{dataIndex}` / `#header-{dataIndex}`、Tabs 按 `item.key` 命名的动态插槽等）；其余可结构化的内容统一通过**默认插槽**承载（如 Card、Collapse 答案区、Modal 主体、Typewriter 等）

---

## 1. Design Tokens

### 色彩系统

```less
// 主色（薄荷青绿）
@primary-color: #19c8b9;
@primary-color-hover: #3dd4c6;
@primary-color-active: #11a89b;
@primary-color-bg: #e6f9f6;

// 文字（温暖棕色系）
@text-color: #794f27; // 主文字（header/sidebar）
@text-color-body: #725d42; // 正文（组件内文字）
@text-color-secondary: #9f927d; // 次级文字
@text-color-muted: #8a7b66; // 浅棕（modal body）
@text-color-disabled: #c4b89e; // 禁用

// 边框
@border-color: #9f927d;
@border-color-light: #c4b89e; // 输入框边框
@border-color-hover: #a89878; // 输入框 hover

// 背景（奶油米白）
@bg-color: #f8f8f0; // 主背景
@bg-color-content: rgb(247, 243, 223); // 内容区（Modal、Card）
@bg-color-secondary: #f0e8d8;
@bg-color-disabled: #f0ece2;
@bg-color-input: rgb(247, 243, 223); // 输入框背景
@bg-color-input-dis: #ece8dc; // 输入框禁用

// 状态色
@success-color: #6fba2c;
@success-color-active: #5a9e1e;
@warning-color: #f5c31c;
@warning-color-active: #dba90e;
@error-color: #e05a5a;
@error-color-active: #c94444;

// 游戏特殊色
@focus-yellow: #ffcc00; // 焦点高亮（非蓝色）
@focus-yellow-dark: #e0b800; // 焦点阴影
@sidebar-active-bg: #b7c6e5; // 侧边栏选中背景
@sidebar-hover-bg: #d6dff0; // 侧边栏 hover 背景

// 3D 阴影色
@shadow-btn: #bdaea0; // 按钮 3D 阴影
@shadow-input: #d4c9b4; // 输入框 3D 阴影
@shadow-switch-on: #5a9e1e; // Switch 开启 3D 阴影
```

**应用调色板**（Card `color` prop 可选值）：

| color 值        | 背景色               | 文字色    |
| --------------- | -------------------- | --------- |
| default         | `rgb(247, 243, 223)` | `#725d42` |
| app-pink        | `#f8a6b2`            | `#fff`    |
| purple          | `#b77dee`            | `#fff`    |
| app-blue        | `#889df0`            | `#fff`    |
| app-yellow      | `#f7cd67`            | `#725d42` |
| app-orange      | `#e59266`            | `#fff`    |
| app-teal        | `#82d5bb`            | `#fff`    |
| app-green       | `#8ac68a`            | `#fff`    |
| app-red         | `#fc736d`            | `#fff`    |
| lime-green      | `#d1da49`            | `#3d5a1a` |
| yellow-green    | `#ecdf52`            | `#725d42` |
| brown           | `#9a835a`            | `#fff`    |
| warm-peach-pink | `#e18c6f`            | `#fff`    |

---

### 字体

项目使用两款 Google Fonts 圆体字，**必须**按以下方式引入，本地未安装时通过在线地址加载：

```html
<!-- 在 index.html <head> 中引入 -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
    href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Noto+Sans+SC:wght@400;500;700&display=swap"
    rel="stylesheet"
/>
```

或在 CSS / Less 入口文件顶部：

```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Noto+Sans+SC:wght@400;500;700&display=swap');
```

```css
font-family:
    Nunito,
    'Noto Sans SC',
    -apple-system,
    'PingFang SC',
    'Hiragino Sans GB',
    'Microsoft YaHei',
    sans-serif;
```

| 字体             | 用途               | Google Fonts key      |
| ---------------- | ------------------ | --------------------- |
| **Nunito**       | 主字体，拉丁字符   | `family=Nunito`       |
| **Noto Sans SC** | 中文字体，简体覆盖 | `family=Noto+Sans+SC` |

> Vue 版本同时通过 `@fontsource/*` 在 `src/index.ts` 直接 import 字体子集（`nunito` / `noto-sans-sc` / `zen-maru-gothic`），库消费者无需手动 `<link>`；如果你脱离组件库自实现，按上文 `<link>` 引入即可。如需扩展日文字符，自行 `@import` `Zen Maru Gothic` 或类似字体并追加到 `font-family` 末尾。

字重分级：

- 正文内容：**500**

- 按钮文字、标题、菜单项：**600–700**

- 数字强调（时间数字、时钟）：**900**

- placeholder / 说明文字：**400**

字间距：`letter-spacing: 0.01em`（正文）/ `0.02em`（按钮/标题）/ `1.5px`（星期大写）

禁止使用细体（weight < 400）或等宽字体。

---

### 间距 / 圆角 / 边框

```
间距：xs=4px  sm=8px  md=12px  lg=16px  xl=24px
圆角：sm=12px  base=18px  lg=24px  pill=50px（按钮/输入框）
边框：默认 2px solid，输入框 2.5px，大尺寸输入框 3px
```

---

### 阴影

```css
/* 卡片/容器阴影（暖色调，非冷黑）*/
box-shadow: 0 3px 10px 0 rgba(61, 52, 40, 0.1); /* 基础 */
box-shadow: 0 8px 24px 0 rgba(61, 52, 40, 0.14); /* 较大 */
/* Card 默认无 box-shadow（依赖 border / pattern 营造层次，不靠悬浮阴影）*/

/* 默认/虚线/文字/链接按钮阴影（柔和 elevation —— 非 3D 厚阴影）*/
box-shadow: 0 2px 4px 0 rgba(61, 52, 40, 0.06); /* btn-default 静止：--animal-shadow-sm */
box-shadow: 0 3px 10px 0 rgba(61, 52, 40, 0.1); /* btn-default hover：--animal-shadow-base */
/* active 回落到 --animal-shadow-sm，translateY(0) */

/* 游戏按键 3D 立体阴影（仅 primary / danger-primary 按钮；Input 仅 shadow={true} 时启用；Switch 仅 track inset 阴影，handle 无 box-shadow）*/
box-shadow: 0 5px 0 0 #bdaea0; /* primary 按钮默认 */
box-shadow: 0 6px 0 0 #bdaea0; /* primary 按钮 hover */
box-shadow: 0 1px 0 0 #bdaea0; /* primary 按钮 active */
box-shadow: 0 5px 0 0 #c94444; /* danger-primary 按钮默认（hover 6 / active 1） */
box-shadow: 0 3px 0 0 #d4c9b4; /* 输入框 shadow={true} 中号 */
box-shadow: 0 2px 0 0 #d4c9b4; /* 输入框 shadow={true} 小号 */
box-shadow: 0 4px 0 0 #d4c9b4; /* 输入框 shadow={true} 大号 */
/* Switch 仅 track 有 inset 阴影：inset 0 2px 4px rgba(114,93,66,0.15) (OFF) / inset 0 2px 4px rgba(90,158,30,0.20) (ON)；handle 无 outer box-shadow */
```

> **重要**：只有 primary 风格按钮（含 danger primary）才使用 `0 5px 0 0` 这种像素级 3D 厚阴影；`default` / `dashed` / `text` / `link` 用上面的柔和 elevation 阴影。把 3D 阴影套到所有按钮上会让界面变得过重过游戏化。

---

### 动效

```css
transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); /* 通用 */
transition: all 0.15s; /* 快速（clear 按钮等）*/
transition: all 0.3s ease; /* 卡片 */
transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* 手风琴 */

/* Hover：上浮 */
transform: translateY(-1px); /* 按钮 / 输入框 */
transform: translateY(-2px); /* 卡片 */
/* Switch handle: 始终 translateY(-50%) 垂直居中，无 hover 上浮 */

/* Active：下压（游戏按键反馈）*/
transform: translateY(2px); /* 按钮 active */

/* 出现动画 */
@keyframes animal-zoom-in {
    from {
        opacity: 0;
        transform: scale(0.92);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}
@keyframes animal-fade-in {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
@keyframes ac-fade-up {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

---

## 2. 组件精确样式规范

### BackTop

返回顶部按钮，钱袋图标浮窗，固定在右下角（`position: fixed`），滚动超过 `visibilityHeight` px 后出现。

| 属性               | 说明               | 默认值         |
| ------------------ | ------------------ | -------------- |
| `visibilityHeight` | 滚动多少 px 后显示 | `400`          |
| `duration`         | 滚动动画时长(ms)   | `300`          |
| `target`           | 滚动容器函数       | `() => window` |
| `onClick`          | 点击回调           | `-`            |
| `className`        | 自定义类名         | `-`            |
| `style`            | 自定义样式         | `-`            |

```vue
<BackTop :visibilityHeight="400" />
<BackTop :duration="800" />
<BackTop :target="() => containerRef" :visibilityHeight="200" />
```

---

### Button

| 属性          | small    | middle   | large    |
| ------------- | -------- | -------- | -------- |
| height        | 32px     | **45px** | 48px     |
| padding       | `0 16px` | `0 20px` | `0 32px` |
| font-size     | 12px     | 14px     | 16px     |
| border-radius | 12px     | **50px** | 24px     |
| border-width  | 2px      | 2px      | 2px      |

**primary 按钮精确值（仅 primary / danger-primary 用 3D 厚阴影**）：

```css
color: #794f27;
background: #f8f8f0;
border-color: #f8f8f0;
font-weight: 600;
letter-spacing: 0.02em;
line-height: 1;
box-shadow: 0 5px 0 0 #bdaea0;

/* hover */
transform: translateY(-1px);
box-shadow: 0 6px 0 0 #bdaea0;

/* active */
transform: translateY(2px);
box-shadow: 0 1px 0 0 #bdaea0;

/* focus-visible */
outline: 2px solid #19c8b9;
outline-offset: 2px;

/* disabled */
opacity: 0.5;
```

**default / dashed / text / link 按钮（柔和 elevation）：**

```css
/* 静止 */
box-shadow: var(--animal-shadow-sm); /* 0 2px 4px 0 rgba(61,52,40,0.06) */

/* hover */
color: #19c8b9;
border-color: #19c8b9;
box-shadow: var(--animal-shadow-base); /* 0 3px 10px 0 rgba(61,52,40,0.10) */
transform: translateY(-1px);

/* active */
color: #11a89b;
border-color: #11a89b;
transform: translateY(0);
box-shadow: var(--animal-shadow-sm); /* 回落到静止态 */
```

> 不要把 primary 那套 `0 5px / 6px / 1px #bdaea0` 套到 default / dashed 上 —— 整体会显得过重过 cartoon。

**loading 斜纹动画（精确值）：**

```css
background: #0ec4b6;
border: 4px solid #4de2da;
color: #fff;
background-image: repeating-linear-gradient(-45deg, #0ec4b6, #0ec4b6 10px, #01b0a7 10px, #01b0a7 20px);
background-size: 28.28px 28.28px;
animation: animal-btn-loading 1s linear infinite;

@keyframes animal-btn-loading {
    0% {
        background-position: 0 0;
    }
    100% {
        background-position: -28.28px 0;
    }
}
```

**danger primary 按钮：**

```css
color: #fff;
box-shadow: 0 5px 0 0 #c94444; /* error-active */
```

---

### Input

> ⚠️ **`shadow`** **prop 默认** **`false`**：默认无阴影，下表的 `box-shadow` 仅在 `<Input shadow />` 显式开启时生效。status (error/warning) 阴影与 focus 黄色光晕不受此 prop 控制。

| 属性                             | small               | middle              | large               |
| -------------------------------- | ------------------- | ------------------- | ------------------- |
| height                           | 32px                | 40px                | 48px                |
| padding                          | `0 14px`            | `0 18px`            | `0 22px`            |
| font-size                        | 12px                | 14px                | 16px                |
| border-radius                    | 40px                | 50px                | 50px                |
| border-width                     | 2.5px               | 2.5px               | **3px**             |
| box-shadow（仅 `shadow={true}`） | `0 2px 0 0 #d4c9b4` | `0 3px 0 0 #d4c9b4` | `0 4px 0 0 #d4c9b4` |

**精确颜色值：**

```css
background: rgb(247, 243, 223);
border: 2.5px solid #c4b89e;
/* 默认无 box-shadow；shadow={true} 时按上表中号取 0 3px 0 0 #d4c9b4 */

/* 文字 */
color: #725d42;
font-weight: 500;
letter-spacing: 0.01em;

/* placeholder */
color: #c4b89e;
font-weight: 400;

/* prefix/suffix */
color: #a0936e;

/* prefix margin-right */
margin-right: 6px;

/* suffix margin-left */
margin-left: 6px;

/* hover */
border-color: #a89878;
box-shadow: 0 3px 0 0 #c4b89e;

/* focus */
border-color: #ffcc00;
box-shadow:
    0 3px 0 0 #e0b800,
    0 0 0 3px rgba(255, 204, 0, 0.15);

/* disabled */
background: #ece8dc;
border-color: #d4c9b4;
box-shadow: none;
opacity: 0.6;
color: #c4b89e;

/* error */
box-shadow: 0 3px 0 0 #c94444;

/* warning */
box-shadow: 0 3px 0 0 #dba90e;
```

**clear 按钮：**

```css
width: 20px;
height: 20px;
margin-left: 4px;
color: #c4b89e;
font-size: 13px;
font-weight: 700;
border-radius: 50%;
transition: all 0.15s;
/* hover */
color: #725d42;
background: rgba(114, 93, 66, 0.1);
```

---

### Switch

**默认尺寸：**

```css
min-width: 52px;
height: 28px;
border: 2.5px solid #c4b89e;
border-radius: 50px;
background: #d4c9b4;
box-shadow: inset 0 2px 4px rgba(114, 93, 66, 0.15);

/* handle */
width: 21px;
height: 21px;
top: 50%;
left: 2px;
transform: translateY(-50%); /* 垂直居中 */
background: rgb(247, 243, 223);
border: 2.5px solid #bdaea0;
border-radius: 50%;
/* handle 无 outer box-shadow，仅靠 border 与 track inset 阴影分层 */

/* 开启态 */
background: #86d67a;
border-color: #6fba2c;
box-shadow: inset 0 2px 4px rgba(90, 158, 30, 0.2);
/* handle 开启后 left */
left: calc(100% - 24px);
border-color: #5a9e1e;

/* focus-visible */
outline: 2px solid #ffcc00;
outline-offset: 2px;

/* disabled */
opacity: 0.5;
```

**small 尺寸：**

```css
min-width: 38px;
height: 20px;
border-width: 2px;
/* handle */
width: 14px;
height: 14px;
top: 1px;
left: 1px;
box-shadow: 0 2px 0 0 #bdaea0;
/* 开启 handle left */
left: calc(100% - 16px);
box-shadow: 0 2px 0 0 #5a9e1e;
```

**inner 文字（#checked / #unchecked 插槽）：**

```css
font-size: 11px;
font-weight: 700;
color: #fff;
line-height: 1;
letter-spacing: 0.02em;
text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
padding: 0 8px 0 28px; /* 未开启 */
padding: 0 28px 0 8px; /* 开启 */
/* small 版 */
padding: 0 6px 0 20px;
font-size: 9px;
```

**loading spinner：**

```css
width: 11px;
height: 11px;
border: 2px solid #6fba2c;
border-right-color: transparent;
border-radius: 50%;
animation: animal-spin 0.6s linear infinite;
/* 关闭态 */
border-color: #a89878;
@keyframes animal-spin {
    to {
        transform: rotate(360deg);
    }
}
```

---

### Card

```css
/* 默认 */
border-radius: 20px;
background: rgb(247, 243, 223);
padding: 16px 24px;
color: #725d42;
font-weight: 500;
/* 默认 NO box-shadow（依赖 border / pattern 分层，不靠悬浮阴影）*/
transition: all 0.3s ease;
/* hover */
transform: translateY(-2px);

/* dashed 类型 */
border: 2px dashed #e8dcc8;
background: rgb(250, 248, 242);
box-shadow: none;

/* pattern 叠加（pattern !== 'none' 时，纯 CSS 实现，**无 png/svg**） */
/* 双层 radial-gradient 点阵 + 同色调 1.5px solid 边框 + pastel 浅底，
   13 种命名（default / app-pink / purple / app-blue / app-yellow / app-orange /
   app-teal / app-green / app-red / lime-green / yellow-green / brown / warm-peach-pink）
   与 Card.color 同名，但呈现为浅底波点"墙纸"而非实色块。 */
/* 例：pattern="app-pink" */
background:
    radial-gradient(circle, rgba(248, 166, 178, 0.18) 1.5px, transparent 1.5px) 0 0/28px 28px,
    radial-gradient(circle, rgba(255, 200, 210, 0.12) 1px, transparent 1px) 7px 7px/14px 14px,
    #fde4e8;
border: 1.5px solid #f8a6b2;
color: #a85565;
/* 当 color 与 pattern 同时设置时，pattern 视觉上覆盖 color */
```

> 旧版 `Card type="title"` 在 v0.9.x 移除，章节标题请使用独立的 `<Title>` 组件（见下文）。

---

### Title（飘带 Ribbon 章节标题）

替代旧 `Card type="title"`，渲染游戏风飘带横幅：燕尾两端 + 折角阴影 + 微透视正面主体。
源码：`src/components/Title/Title.vue`（scoped Less，BEM 类名 `animal-title__*`）。

```css
/* 默认（绿色配色，可被 .animal-title--color-* 覆盖） */
--rf: #27d039; /* front 正面 */
--rb: #20992a; /* back  燕尾 */
--rk: #115017; /* fold  折角阴影 */
--rt: #fff; /* text  文字色 */

font-family: Nunito, 'Noto Sans SC', sans-serif;
font-weight: 800; /* 外层 wrapper */
/* .animal-title__text 内层文字 font-weight 900；padding-top 0.11em CJK 光学居中 */

/* 飘带主体 */
display: inline-flex;
height: 2em;
padding: 0 1.6em;
letter-spacing: 0.04em;
filter: drop-shadow(0 0.08em 0.12em rgba(0, 0, 0, 0.05));

/* 燕尾（左/右）—— clip-path 鱼尾形 */
.animal-title__back--left {
    clip-path: polygon(100% 0%, 100% 100%, 0% 100%, 30% 50%, 0% 0%);
}
.animal-title__back--right {
    clip-path: polygon(0% 0%, 100% 0%, 70% 50%, 100% 100%, 0% 100%);
}
width: 1.7em;
height: 1.7em;
bottom: -0.4em;

/* 折角阴影 —— CSS border 三角 */
.animal-title__fold--left {
    border-width: 0 0.95em 0.45em 0;
    border-color: transparent var(--rk) transparent transparent;
}
.animal-title__fold--right {
    border-width: 0 0 0.45em 0.95em;
    border-color: transparent transparent transparent var(--rk);
}

/* 正面主体 */
.animal-title__front {
    inset: 0 0.1em;
    border-radius: 0.2em;
    transform: perspective(11.5em) rotateX(3deg);
}
```

尺寸（`SIZE_MAP` 通过 inline `font-size` 注入；所有内部 `em` 自动缩放）：

| size   | font-size |
| ------ | --------- |
| small  | 14px      |
| middle | 20px      |
| large  | 28px      |

13 种颜色覆盖：在 wrapper 上叠加 `.animal-title--color-app-pink` / `.animal-title--color-purple` / `.animal-title--color-app-blue` / `.animal-title--color-app-yellow` / `.animal-title--color-app-orange` / `.animal-title--color-app-teal` / `.animal-title--color-app-green` / `.animal-title--color-app-red` / `.animal-title--color-lime-green` / `.animal-title--color-yellow-green` / `.animal-title--color-brown` / `.animal-title--color-warm-peach-pink` 之一；每个类同时覆盖 `--rf / --rb / --rk / --rt` 四个变量。详见 `Title.vue` `<style scoped>` 末尾的 13 行 `.animal-title--color-*` 定义。

例：

```less
.animal-title--color-app-yellow {
    --rf: #f7cd67;
    --rb: #d4a030;
    --rk: #8a6010;
    --rt: #725d42;
}
.animal-title--color-purple {
    --rf: #b77dee;
    --rb: #9050d0;
    --rk: #5a1a9a;
    --rt: #fff;
}
```

---

### Collapse

```css
/* 外层卡片 */
border-radius: 18px;
border: 2px solid #9f927d;
margin-bottom: 12px;
/* disabled */ opacity: 0.6;

/* 问题栏 */
padding: 16px 24px;
gap: 12px;

/* 图标圆圈 */
width: 28px; height: 28px;
background: #19c8b9;
color: #fff;
border-radius: 50%;
font-size: 18px; font-weight: 700;
box-shadow: 0 2px 4px rgba(25, 200, 185, 0.3);
/* 展开时 */ transform: rotate(180deg);

/* 叶子装饰 */
opacity: 0.5;
/* 展开时 */ opacity: 1; transform: rotate(45deg);

/* 问题文字 */
font-size: 16px; font-weight: 600; line-height: 1.4;

/* 答案展开（CSS Grid trick，无 JS）*/
display: grid;
grid-template-rows: 0fr;
transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
/* 展开 */ grid-template-rows: 1fr;
/* 内层 */ overflow: hidden;

/* 答案文字 */
padding: 0 24px;
font-size: 14px; line-height: 1.7;
/* 展开后 padding-bottom */ 24px;
```

---

### Tabs

scoped Less + BEM；类名根 `.animal-tabs`，内部使用 `__list` / `__item` / `__icon` / `__leaf` / `__content` 等子元素。

```css
/* 外层容器 */
.animal-tabs {
    background: rgb(247, 243, 223);
    border-radius: 20px;
    border: 2px solid #9f927d;
    overflow: hidden;
}

/* 标签列表 */
.animal-tabs__list {
    display: flex;
    gap: 4px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.6);
    border-bottom: 2px solid #c4b89e;
}

/* 标签项 */
.animal-tabs__item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: transparent;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #8a7b66;
    transition: all 0.2s ease;
}
/* hover */
.animal-tabs__item:hover {
    background: rgba(25, 200, 185, 0.1);
    color: #725d42;
}
/* 激活状态 — 实心 teal 胶囊 + 奶油色字 */
.animal-tabs__item.animal-tabs__item--active {
    background: #0cc0b5;
    color: #fff9e3;
    font-weight: 600;
}
.animal-tabs__item--active.animal-tabs__item--shadow {
    box-shadow: 0 3px 0 0 #d4c9b4; /* 仅 shadow opt-in 时启用 */
}

/* 标签图标 */
.animal-tabs__icon {
    font-size: 10px;
}
/* 激活时图标放大 */
.animal-tabs__item--active .animal-tabs__icon {
    transform: scale(1.2);
}

/* 叶子装饰动画 */
.animal-tabs__leaf {
    position: absolute;
    right: -6px;
    top: -3px;
    font-size: 12px;
    animation: leafWiggle 2s ease-in-out infinite;
}
/* leafAnimation={false} 时追加 .animal-tabs__leaf--static 修饰符去除 animation */

@keyframes leafWiggle {
    0%,
    100% {
        transform: rotate(0deg);
    }
    25% {
        transform: rotate(-10deg);
    }
    75% {
        transform: rotate(10deg);
    }
}

/* 内容区 */
.animal-tabs__content {
    padding: 24px;
    animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

---

### Modal

**SVG clip-path 完整 path d 值（精确还原 blob 轮廓）：**

```vue
<template>
    <svg style="position: absolute; width: 0; height: 0" aria-hidden="true">
        <defs>
            <clipPath id="animal-modal-clip" clipPathUnits="objectBoundingBox">
                <path
                    d="M0.501,0.005 L0.501,0.005 L0.523,0.005 L0.549,0.006
          C0.704,0.01,0.796,0.017,0.825,0.027
          L0.827,0.028
          C0.872,0.045,0.939,0.044,0.978,0.17
          C1,0.254,1,0.365,0.99,0.505
          L0.988,0.513
          C0.979,0.558,0.971,0.598,0.965,0.633
          C0.956,0.689,0.979,0.77,0.964,0.865
          C0.953,0.928,0.921,0.966,0.869,0.979
          C0.821,0.986,0.773,0.992,0.726,0.995
          L0.712,0.996 L0.694,0.997
          C0.648,1,0.586,1,0.507,1
          L0.501,1 L0.464,1
          C0.385,1,0.325,0.998,0.283,0.995
          C0.234,0.992,0.184,0.987,0.133,0.979
          C0.081,0.966,0.05,0.928,0.039,0.865
          C0.023,0.77,0.047,0.689,0.037,0.633
          C0.031,0.595,0.023,0.552,0.013,0.505
          C-0.006,0.365,-0.002,0.254,0.024,0.17
          C0.064,0.045,0.13,0.045,0.174,0.028
          L0.175,0.028
          C0.204,0.017,0.303,0.009,0.474,0.005
          L0.501,0.005"
                />
            </clipPath>
        </defs>
    </svg>
</template>
```

**Modal 精确样式：**

```css
/* 遮罩 */
background: rgba(0, 0, 0, 0.35);
animation: animal-fade-in 0.25s ease;
z-index: 1000;

/* 弹窗容器 */
max-width: calc(100vw - 32px);
max-height: calc(100vh - 64px);
animation: animal-zoom-in 0.3s ease;

/* 裁切内容区 */
clip-path: url(#animal-modal-clip);
background: rgb(247, 243, 223);
color: rgb(128, 115, 89);
padding: 48px 48px 32px 48px;

/* 标题 */
font-size: 28px;
font-weight: 700;
color: rgba(114, 93, 66, 1);
padding-bottom: 15px;

/* 关闭按钮 */
width: 32px;
height: 32px;
font-size: 22px;
color: rgba(114, 93, 66, 0.6);
border-radius: 50%;
transition: all 0.2s;
/* hover */
background: rgba(114, 93, 66, 0.1);
color: rgba(114, 93, 66, 1);

/* body */
font-size: 20px;
font-weight: 600;
line-height: 1.6;
color: #8a7b66;
padding-bottom: 20px;

/* footer */
gap: 12px;

/* 普通按钮 */
height: 40px;
padding: 0 24px;
font-size: 18px;
border: 2px solid rgba(114, 93, 66, 0.3);
border-radius: 39.81px;
transition: all 0.2s;
line-height: 1;
/* hover */
border-color: rgba(114, 93, 66, 0.6);
background: rgba(114, 93, 66, 0.08);

/* 主按钮（确认）*/
color: rgba(114, 93, 66, 1);
background: rgba(255, 204, 0, 1); /* 游戏黄色！*/
border-color: rgba(255, 204, 0, 1);
/* hover */
background: rgba(255, 204, 0, 0.85);
border-color: rgba(255, 204, 0, 0.85);
```

---

---

### Footer

```vue
<template>
    <Footer />
    <!-- 14 个 🎄 居中一行（高 80px） -->
    <Footer seamless />
    <!-- 🎄 铺满整行（space-between） -->
</template>
```

```less
.animal-footer {
    // 14 个 🎄 emoji 居中一行（flex + letter-spacing），非图片
    width: 100%;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    letter-spacing: 12px;
}
.animal-footer--seamless {
    justify-content: space-between;
    padding: 0 8px;
    letter-spacing: 0;
}
```

- 无 `type` prop（原 `sea` 海浪类型与森林像素图均已移除），仅保留 `seamless` prop。

---

### Divider

```vue
<template>
    <Divider type="line-brown" />
    <!-- 默认 -->
    <Divider type="line-teal" />
    <Divider type="line-white" />
    <Divider type="line-yellow" />
    <Divider type="wave-yellow" />
</template>
```

```less
.animal-divider {
    width: 100%;
    height: 12px;
    background: url('./img/divider-line-brown.svg') center/contain no-repeat;
}
.animal-divider--line-teal {
    background-image: url('./img/divider-line-teal.svg');
}
.animal-divider--line-white {
    background-image: url('./img/divider-line-white.svg');
}
.animal-divider--line-yellow {
    background-image: url('./img/divider-line-yellow.svg');
}
.animal-divider--wave-yellow {
    background-image: url('./img/wave-yellow.svg');
}
```

默认 SVG 色值参考：`#D8D0C3`（米褐），`viewBox="0 0 297 14"`。

---

### Cursor

```vue
<template>
    <Cursor>
        <App />
        <!-- 此范围内所有元素变为游戏手指光标 -->
    </Cursor>
</template>
```

样式文件为 **普通全局 CSS**（非 scoped；类名固定为 `animal-cursor`，挂在根 `<div>` 上）：

```css
.animal-cursor,
.animal-cursor * {
    cursor:
        url('./cursor-icon.svg') 4 0,
        auto !important;
}
```

- `cursor-icon.svg`（原创手绘指向光标，49×48）热点坐标 `(4, 0)`

- 使用 `!important` 覆盖默认光标

- ⚠️ 此组件**不能用** **`scoped`**：scoped 选择器无法穿透 slot 内容；必须以全局 CSS 形式注册（`<style>` 不带 `scoped`，或全局样式入口引入）

---

### Typewriter

```vue
<template>
    <Typewriter :speed="90" :trigger="openCount" auto-play @done="handleDone">
        <p>第一行 <strong>加粗</strong></p>
        <p>第二行</p>
    </Typewriter>
</template>
```

Props：

| name       | type          | default | 说明                                                 |
| ---------- | ------------- | ------- | ---------------------------------------------------- |
| 默认插槽   | `Slot`        | —       | 要逐字打出的内容，**保留原有元素结构 / 换行 / 样式** |
| `speed`    | `number (ms)` | `90`    | 每字间隔                                             |
| `trigger`  | `unknown`     | —       | 值变化即重新播放（通常传递弹窗 open 次数或递增 key） |
| `autoPlay` | `boolean`     | `true`  | `false` 直接全量显示                                 |
| `@done`    | `() => void`  | —       | 播放完成事件                                         |

**实现要点：**

- `countText(vnode)`：递归统计 VNode 树（含 children / `el?.textContent` / 字符串子节点）的纯文本长度

- `renderTruncated(vnode, state)`：按剩余字符数递归裁剪，使用 `cloneVNode` 保留原节点与样式

- `watch([() => total.value, () => props.speed, () => props.trigger, () => props.autoPlay])`，内部 `setInterval` 按步递增 `count`

- **无样式文件**，不包裹任何额外 DOM（默认插槽直接 render），对布局零影响

---

### Checkbox

Props：

| name                 | type                             | default        | 说明                                         |
| -------------------- | -------------------------------- | -------------- | -------------------------------------------- |
| `options`            | `CheckboxOption[]`               | —              | **必填**；每项 `{ label, value, disabled? }` |
| `modelValue`         | `Array<string \| number>`        | —              | 受控选中值（配合 `v-model`）                 |
| `defaultValue`       | `Array<string \| number>`        | `[]`           | 非受控默认值                                 |
| `size`               | `'small' \| 'middle' \| 'large'` | `'middle'`     | 尺寸                                         |
| `disabled`           | `boolean`                        | `false`        | 禁用全部项                                   |
| `direction`          | `'horizontal' \| 'vertical'`     | `'horizontal'` | 排列方向                                     |
| `@update:modelValue` | `(values) => void`               | —              | 选中值变化（`v-model`）                      |
| `@change`            | `(values) => void`               | —              | 同上，业务回调                               |

**尺寸表（box 方框）：**

| 属性           | small   | middle      | large   |
| -------------- | ------- | ----------- | ------- |
| 宽高           | 18×18px | **22×22px** | 28×28px |
| border-width   | 2px     | 2.5px       | 3px     |
| 标签 font-size | 12px    | 14px        | 16px    |
| 对勾 font-size | 11px    | 13px        | 16px    |

**精确样式：**

```css
/* group */
display: flex; flex-wrap: wrap;
gap: 12px;                                 /* horizontal */
/* vertical */ flex-direction: column; gap: 8px;

/* item */
display: inline-flex; align-items: center;
gap: 8px;
cursor: pointer;
transition: all 0.25s cubic-bezier(0.4,0,0.2,1);

/* box（未选）*/
background: rgb(247, 243, 223);
border: 2.5px solid #c4b89e;
border-radius: 8px;
display: inline-flex; align-items: center; justify-content: center;

/* box hover */
border-color: #19c8b9;
transform: translateY(-1px);

/* box focus-visible */
outline: 2px solid #ffcc00; outline-offset: 2px;

/* 选中 */
background: #19c8b9;
border-color: #11a89b;
/* 选中 hover */ background: #3dd4c6; border-color: #19c8b9;

/* 对勾 ✓ */
color: #fff; font-weight: 700; line-height: 1;
animation: animal-checkbox-pop 0.15s cubic-bezier(0.4,0,0.2,1);

@keyframes animal-checkbox-pop {
  0%   { transform: scale(0.4); opacity: 0; }
  60%  { transform: scale(1.2); }
  100% { transform: scale(1);   opacity: 1; }
}

/* label */
color: #725d42; font-weight: 500;
letter-spacing: 0.01em;
/* item hover */ label color: #794f27;

/* 禁用（单项或整组）*/
cursor: not-allowed;
opacity: 0.55;
/* box */ background: #f0ece2; border-color: #d4c9b4; transform: none !important;
/* label */ color: #c4b89e;
```

---

### CodeBlock

Props：

| name       | type      | default | 说明                                                 |
| ---------- | --------- | ------- | ---------------------------------------------------- |
| `code`     | `string`  | —       | **必填**；原始源码字符串，内部自动按 JSX/TS 分词高亮 |
| `copyable` | `boolean` | `true`  | 是否显示右上角复制按钮                               |

Emits：`copy(code: string)` — 复制成功后触发。

`class` 与非布局类 `:style` 键落在 `<pre>` 上；`width` / `min-width` / `max-width` / `margin*` 键落在外层 wrapper（`inheritAttrs: false` 手动分派）。显示复制按钮且未自定义 `padding` / `padding-right` 时，`<pre>` 自动加 `padding-right: 96px` 给按钮留位。

结构（BEM，scoped Less）：

```html
<div class="animal-code-block">          <!-- wrapper: relative, min-width 0, margin 1em 0 -->
    <pre class="animal-code-block__code"><!-- 高亮内容 -->
    <button class="animal-code-block__copy-btn">复制</button>
</div>
```

复制逻辑与 React 版一致：优先 `navigator.clipboard.writeText`，不可用时降级临时 `textarea` + `document.execCommand('copy')`（finally 中清理临时节点）；按钮三态文案 复制 / 已复制 / 复制失败，2s 后自动复位（卸载时清定时器）；成功时 emit `copy`。

```css
/* 复制按钮 */
.animal-code-block__copy-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    min-width: 62px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid rgba(232, 213, 188, 0.3);
    border-radius: 50px;
    background: rgba(61, 48, 40, 0.94);
    color: #e8d5bc;
    font-size: 12px;
    font-weight: 700;
}
.animal-code-block__copy-btn:hover {
    background: #4b3b31;
    transform: translateY(-1px);
}
.animal-code-block__copy-btn:focus-visible {
    outline: 2px solid var(--animal-primary-color, #19c8b9);
    outline-offset: 2px;
}
```

**pre 默认主题：**

```css
box-sizing: border-box;
width: 100%;
margin: 0;
padding: 20px 24px;
background: #2b2118;
border: 1px solid #3d3028;
border-radius: 20px;
font-size: 14px;
line-height: 1.7;
font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
font-weight: 600;
color: #e8d5bc;
white-space: pre;
overflow: auto;
tab-size: 4;
```

**Token 调色板（`COLORS`** **常量）：**

| token     | 颜色      | 覆盖                                                                                                     | <br />     |
| --------- | --------- | -------------------------------------------------------------------------------------------------------- | :--------- |
| comment   | `#6b5e50` | `/* */`、`//`                                                                                            | <br />     |
| string    | `#a8d4a0` | 反引号 / 单双引号、数字                                                                                  | <br />     |
| keyword   | `#d4a0e0` | `import/export/const/return/async/...`、`true/false/null/undefined`                                      | <br />     |
| react     | `#e06c75` | `Vue/ref/computed/onMounted/defineProps/defineEmits/PropType/...`（保留 React 名字以兼容跨框架代码片段） | <br />     |
| component | `#80c0e0` | 大写驼峰标识符（组件名、类型名）                                                                         | <br />     |
| func      | `#61afef` | 小写标识符后跟 `(`                                                                                       | <br />     |
| prop      | `#e8c87a` | 标识符后跟 `=`（template props / 赋值）                                                                  | <br />     |
| jsx       | `#f0a870` | `<Tag`、`</Tag`、`/>`                                                                                    | <br />     |
| operator  | `#d4b896` | `{}[]();,` 和 \`+-\*/=<>&                                                                                | ^\~?:\` 等 |
| default   | `#e8d5bc` | 其余文本                                                                                                 | <br />     |

> 不支持 `language` prop；非 JS/TS 代码（Python/Shell/SQL）会按通用规则着色，显示可能不准确。不带行号或折行；复制按钮默认显示（`copyable: false` 关闭）。

---

### Radio

源码：`src/components/Radio/Radio.vue`（scoped Less + BEM 类名 `animal-radio__*`）。

| 属性            | small   | middle  | large                        |
| --------------- | ------- | ------- | ---------------------------- |
| 外盒尺寸        | 18×18px | 22×22px | 28×28px                      |
| 圆角            | 12px    | 14px    | 16px（**重圆方形，非正圆**） |
| 边框宽          | 2px     | 2px     | 2px                          |
| 内勾尺寸        | 10×10px | 12×12px | 16px font-size               |
| label font-size | 12px    | 14px    | 16px                         |

```css
/* 默认（未选） */
background: rgb(247, 243, 223);
border: 2px solid #c4b89e;

/* hover */
border-color: #19c8b9;
transform: translateY(-1px);

/* checked */
background: #19c8b9; /* @primary-color */
border-color: #11a89b; /* @primary-color-active */
/* 内白色勾 pop 动画 */
@keyframes radio-pop {
    0% {
        transform: scale(0.4);
        opacity: 0;
    }
    60% {
        transform: scale(1.2);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}
/* 时长 0.15s ease（@motion-duration-fast） */

/* label */
color: #725d42;
font-weight: 500;
letter-spacing: 0.01em;
/* checked label */
color: #794f27;

/* focus-visible */
outline: 2px solid #f5c31c; /* 注意：Radio 用 @focus-yellow=#f5c31c，而非 Checkbox/Input 的 #ffcc00 */
outline-offset: 2px;

/* disabled */
opacity: 0.55;
cursor: not-allowed;
background: #f0ece2;
border-color: #d4c9b4;
/* label */
color: #c4b89e;

/* group 布局 */
/* horizontal */
display: flex;
gap: 12px;
/* vertical */
display: flex;
flex-direction: column;
gap: 8px;
```

---

### Tooltip

源码：`src/components/Tooltip/Tooltip.vue`（scoped Less + BEM）。`default` 与 `island` 是两套**完全不同**的视觉，不要混淆。

**default 变体（标准温色 bubble）：**

```css
background: rgb(247, 243, 223); /* @tooltip-bg */
border: 2px solid #c4b89e; /* @tooltip-border */
border-radius: 16px; /* @border-radius-sm */
padding: 6px 12px;
max-width: 240px;

font-size: 12px;
font-weight: 500;
line-height: 1.5;
letter-spacing: 0.01em;
color: #725d42;

box-shadow: 0 3px 10px rgba(61, 52, 40, 0.1); /* @shadow-base */
z-index: 100;

/* 距 trigger 间距 */
gap: 10px;
/* 入场动画：translateY 4px → 0，平滑显隐 */

/* 三角箭头 */
size: 8px;
border-radius: 2px; /* 8px 菱形，圆角 2px —— 不是 6px */
```

**island 变体（透明有机气泡）：**

```css
background: transparent; /* 容器透明，无 border 无 shadow */
border: none;
box-shadow: none;
/* 注意：island **不是** Modal blob clip-path —— 它是 transparent 容器 + 内部内容自带气泡 */

/* 内容区 */
padding: 12px 20px;
max-width: 280px;
font-weight: 600;
line-height: 1.55;
text-align: center;

/* 箭头：14px 圆点（borderless）或 10px 菱形（bordered） */
.animal-tooltip__island-arrow {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    filter: drop-shadow(0 4px 14px rgba(121, 79, 39, 0.14));
}
```

placement 12 种：`top` / `top_start` / `top_end` / `bottom` / `bottom_start` / `bottom_end` / `left` / `left_start` / `left_end` / `right` / `right_start` / `right_end`。

---

### Table

源码：`src/components/Table/Table.vue`（scoped Less + BEM）。**外壳无实线 border**；行分隔靠 `::after` 的 dashed 横线实现；hover 行是对角青色条纹。

```css
/* 外壳 wrapper */
background: rgb(247, 243, 223);
border-radius: 20px;
padding: 6px; /* 仅 6px 内边距，无 border */
box-sizing: border-box;

/* 表头 cell */
padding: 16px 20px;
font-size: 14px;
font-weight: 700;
color: #725d42; /* 不是 #794f27 */
letter-spacing: 0.02em;
/* 表头底部分隔（::after dashed） */
border-image: none;
&::after {
    content: '';
    border-bottom: 1px dashed rgb(240, 232, 216);
    /* dash pattern: 6px on / 6px off */
}

/* body cell */
padding: 14px 20px; /* 无固定行高 48px —— 由 padding 撑起 */
font-size: 14px;
font-weight: 500;
color: #725d42;
line-height: 1.6;
/* 行底分隔线同样是 1px dashed (6/6) rgb(240,232,216) */

/* striped 偶数行 */
background: rgba(248, 248, 240, 0.6); /* 不是 rgba(247,243,223,0.5) */

/* row hover —— 对角青色条纹 + 内圆角剪切 */
background: repeating-linear-gradient(-45deg, rgba(25, 200, 185, 0.6) 0 10px, rgba(14, 196, 182, 0.6) 10px 20px);
background-size: 28.28px 28.28px;
clip-path: inset(0 0 0 0 round 30px);
color: #3d2e1e;

/* 空状态 */
padding: 60px 20px;
text-align: center;
color: #9f927d;
/* icon */
opacity: 0.5;

/* loading 遮罩 */
background: rgba(247, 243, 223, 0.8);
backdrop-filter: blur(2px);
/* spinner */
color: #19c8b9;
```

---

### Select

源码：`src/components/Select/Select.vue`（scoped Less + BEM）。受控选择器，触发区非 Input 样式。

```css
/* 触发按钮 */
.animal-select__trigger {
    background: #fff;
    border: 2px solid #e8dcc8;
    border-radius: 12px;
    padding: 8px 13px;
    color: #725d42;
    font-weight: 600;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    transition: all 0.2s ease;
}
.animal-select__trigger:hover {
    border-color: #d4c4a8;
    background: #fffdf7;
}
.animal-select__trigger--open {
    border-color: #19c8b9;
    color: #19c8b9;
}
.animal-select__trigger--disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 下拉面板 */
.animal-select__dropdown {
    background: #ffeea0; /* 香蕉黄 */
    border-radius: 28px;
    padding: 12px 0;
    z-index: 100;
    opacity: 0;
    transition: opacity 0.2s ease;
}
.animal-select__dropdown--open {
    opacity: 1;
}

/* 选项 */
.animal-select__option {
    display: flex;
    align-items: center;
    padding: 10px 30px 10px 14px;
    font-size: 14px;
    font-weight: 500;
    color: #725d42;
    cursor: pointer;
    transition: background 0.15s ease;
}
.animal-select__option:hover {
    background: rgba(25, 200, 185, 0.08);
}
.animal-select__option--selected {
    font-weight: 700;
}
```

Props: `modelValue`（受控，必填）、`options`（`{ key, label }[]`，必填）、`placeholder`（默认 '请选择'）、`disabled`、`ariaLabel`、`ariaLabelledBy`。Options 迭代用 `v-for` + `:key`。

---

### Skeleton

源码：`src/components/Skeleton/Skeleton.vue`（scoped Less + BEM）。加载占位骨架屏，4 个子组件：Skeleton、SkeletonButton、SkeletonInput、SkeletonAvatar。

```css
/* 容器 */
.animal-skeleton {
    display: block;
    width: 100%;
}
/* 骨架占位块 */
.animal-skeleton__block {
    background: #e8e2d6;
    border-radius: 8px;
    animation: animal-skeleton-pulse 1.5s ease-in-out infinite;
}
@keyframes animal-skeleton-pulse {
    0%,
    100% {
        opacity: 0.5;
    }
    50% {
        opacity: 1;
    }
}
/* variant */
.animal-skeleton__block--text {
    height: 16px;
    border-radius: 8px;
}
.animal-skeleton__block--circle {
    border-radius: 50%;
}
.animal-skeleton__block--rect {
    border-radius: 8px;
}
.animal-skeleton__block--paragraph {
    margin-bottom: 12px;
}
/* SkeletonButton */
.animal-skeleton-btn {
    height: 45px;
    border-radius: 50px;
}
/* SkeletonInput */
.animal-skeleton-input {
    height: 40px;
    border-radius: 50px;
}
/* SkeletonAvatar */
.animal-skeleton-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}
```

Props: `loading`（boolean，默认 true）、`variant`（`'text' | 'circle' | 'rect' | 'paragraph'`，默认 `'text'`）、`active`（boolean，默认 true）、`rows`（number，默认 3）、`width`（number|string）、`rowWidths`（`(number|string)[]`）、`widthValue`（number|string）、`heightValue`（number|string）。默认插槽：loading=false 时渲染的内容。

---

### Tag

源码：`src/components/Tag/Tag.vue`（scoped Less + BEM）。Pill 形标签，支持 3 种变体 × 13 色。

```css
/* 基础 */
.animal-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    line-height: 1;
    font-weight: 600;
    border-radius: 999px;
    border: 1.5px solid transparent;
    transition: all 0.2s ease;
    user-select: none;
    white-space: nowrap;
}
/* 尺寸 */
.animal-tag--small {
    height: 24px;
    padding: 0 10px;
    font-size: 12px;
}
.animal-tag--medium {
    height: 29px;
    padding: 0 12px;
    font-size: 13px;
}
.animal-tag--large {
    height: 34px;
    padding: 0 16px;
    font-size: 15px;
}

/* 变体 */
.animal-tag--solid {
    background: rgb(247, 243, 223);
    color: #8f734f;
    border-color: #d4c4a8;
}
.animal-tag--outlined {
    background: transparent;
    color: #8f734f;
    border-color: #c4b89e;
}
.animal-tag--dashed {
    background: transparent;
    color: #8f734f;
    border-style: dashed;
    border-color: #c4b89e;
}

/* 彩色（13 色调色板） */
.animal-tag--colored.animal-tag--solid {
    background: var(--animal-tag-color);
    border-color: var(--animal-tag-color);
    color: #fff;
}
.animal-tag--colored.animal-tag--outlined,
.animal-tag--colored.animal-tag--dashed {
    color: var(--animal-tag-color);
    border-color: var(--animal-tag-color);
    background: transparent;
}

/* 关闭按钮 */
.animal-tag__close {
    width: 16px;
    height: 16px;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.08);
    color: inherit;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s ease;
}
.animal-tag__close:hover {
    background: rgba(0, 0, 0, 0.18);
}

/* 可交互态 */
.animal-tag--clickable {
    cursor: pointer;
}
.animal-tag--clickable:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(61, 52, 40, 0.12);
}
.animal-tag--clickable:focus-visible {
    outline: 2px solid #f5c31c;
    outline-offset: 2px;
}

/* 禁用 */
.animal-tag--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}
```

Props: `size`（`'small' | 'medium' | 'large'`，默认 `'medium'`）、`variant`（`'solid' | 'outlined' | 'dashed'`，默认 `'solid'`）、`color`（13 色，默认 `'default'`）、`closable`、`disabled`。Emits: `close`。默认插槽标签内容。

---

### Progress

源码：`src/components/Progress/Progress.vue`（scoped Less + BEM）。线性进度条，条纹动画 fill。

```css
.animal-progress {
    display: flex;
    align-items: center;
    width: 100%;
    line-height: 1;
    user-select: none;
}
.animal-progress__row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}
.animal-progress__info {
    font-weight: 700;
    color: #725d42;
    white-space: nowrap;
    flex-shrink: 0;
    letter-spacing: 0.02em;
}
.animal-progress__track {
    flex: 1;
    min-width: 80px;
    background: #f8f8f0;
    border: 2px solid #e8dcc8;
    box-shadow: inset 0 2px 4px rgba(114, 93, 66, 0.08);
    overflow: hidden;
    border-radius: 999px;
}
.animal-progress__track--small {
    height: 12px;
    border-width: 1.5px;
}
.animal-progress__track--middle {
    height: 20px;
}
.animal-progress__track--large {
    height: 28px;
}

.animal-progress__fill {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    border-radius: 999px;
    background: #0ec4b6;
    background-image: repeating-linear-gradient(-45deg, #0ec4b6 0, #0ec4b6 10px, #01b0a7 10px, #01b0a7 20px);
    background-size: 28.28px 28.28px;
    animation: animal-progress-stripe 1s linear infinite;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.animal-progress__fill--no-transition {
    transition: none;
}
@keyframes animal-progress-stripe {
    0% {
        background-position: 0 0;
    }
    100% {
        background-position: -28.28px 0;
    }
}

.animal-progress__info-inside {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: #fff;
    font-weight: 800;
    font-size: 11px;
    letter-spacing: 0.02em;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
    white-space: nowrap;
    z-index: 1;
}
```

Props: `percent`（0–100，必填）、`size`（`'small' | 'middle' | 'large'`，默认 `'middle'`）、`showInfo`（默认 true）、`infoPosition`（`'inside' | 'right' | 'top'`，默认 `'inside'`）、`infoFormat`（fn）、`duration`（秒，默认 0.6，0 为不动画）。受 `prefers-reduced-motion: reduce` 影响。

---

### Notification

命令式 API 通知系统。源码：`src/components/Notification/`（`Notification.ts` + `NotificationContainer.vue` + `NotificationView.vue`）。

```css
/* 固定定位容器 */
.animal-notification-root {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2000;
}
.animal-notification__position {
    position: fixed;
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
    max-width: calc(100vw - 32px);
}
.animal-notification__position--top {
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
}
.animal-notification__position--topLeft {
    top: 20px;
    left: 20px;
}
.animal-notification__position--topRight {
    top: 20px;
    right: 20px;
}
.animal-notification__position--bottom {
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
}
.animal-notification__position--bottomLeft {
    bottom: 20px;
    left: 20px;
}
.animal-notification__position--bottomRight {
    bottom: 20px;
    right: 20px;
}

/* 通知卡片 */
.animal-notification {
    pointer-events: auto;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 20px;
    background: rgb(247, 243, 223);
    border-radius: 16px;
    border-left: 5px solid #19c8b9;
    box-shadow: 0 3px 14px rgba(61, 52, 40, 0.12);
    max-width: 400px;
    animation: animal-notification-slide-in 0.3s ease;
}
.animal-notification--leaving {
    animation: animal-notification-slide-out 0.25s ease forwards;
}
@keyframes animal-notification-slide-in {
    from {
        opacity: 0;
        transform: translateY(-12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
@keyframes animal-notification-slide-out {
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0;
        transform: translateY(-12px);
    }
}

/* 类型颜色 */
.animal-notification--type-success {
    border-left-color: #6fba2c;
}
.animal-notification--type-info {
    border-left-color: #19c8b9;
}
.animal-notification--type-warning {
    border-left-color: #f5c31c;
}
.animal-notification--type-error {
    border-left-color: #e05a5a;
}

/* 图标 */
.animal-notification__icon-wrap {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    font-size: 20px;
}
.animal-notification--type-success .animal-notification__icon-wrap {
    color: #6fba2c;
}
.animal-notification--type-info .animal-notification__icon-wrap {
    color: #19c8b9;
}
.animal-notification--type-warning .animal-notification__icon-wrap {
    color: #f5c31c;
}
.animal-notification--type-error .animal-notification__icon-wrap {
    color: #e05a5a;
}

/* 标题/描述 */
.animal-notification__title {
    font-size: 14px;
    font-weight: 600;
    color: #725d42;
    line-height: 1.4;
}
.animal-notification__description {
    margin-top: 4px;
    font-size: 12px;
    font-weight: 500;
    color: #8a7b66;
    line-height: 1.5;
}

/* 关闭按钮 */
.animal-notification__close {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border: none;
    background: transparent;
    color: #c4b89e;
    font-size: 16px;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
}
.animal-notification__close:hover {
    background: rgba(114, 93, 66, 0.1);
    color: #725d42;
}
```

API：`Notification.open(config)`、`.success()`、`.info()`、`.warning()`、`.error()`、`.destroy(key?)`。Config 字段：`message`（必填）、`description`、`duration`（默认 4.5s，0=不自动关闭）、`position`（6 种）、`icon`（VNode）、`btn`（VNode）、`key`、`onClose`、`onClick`、`closeIcon`、`className`、`style`。需在 App 根节点放置 `<NotificationContainer />`。

---

### Drawer

源码：`src/components/Drawer/Drawer.vue`（scoped Less + BEM）。侧边/顶部/底部滑出面板，带焦点陷阱、背景景深效果。

```css
/* 遮罩 */
.animal-drawer__mask {
    position: fixed;
    inset: 0;
    z-index: 999;
    background: rgba(0, 0, 0, 0.35);
    animation: animal-fade-in 0.25s ease;
}
/* 面板 */
.animal-drawer__panel {
    position: fixed;
    z-index: 1000;
    background: rgb(247, 243, 223);
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgba(61, 52, 40, 0.18);
    transition: transform 0.3s cubic-bezier(0.2, 0, 0.2, 1);
}
.animal-drawer__panel--right {
    top: 0;
    right: 0;
    bottom: 0;
    transform: translateX(0);
}
.animal-drawer__panel--left {
    top: 0;
    left: 0;
    bottom: 0;
    transform: translateX(0);
}
.animal-drawer__panel--top {
    top: 0;
    left: 0;
    right: 0;
    transform: translateY(0);
}
.animal-drawer__panel--bottom {
    bottom: 0;
    left: 0;
    right: 0;
    transform: translateY(0);
}
.animal-drawer__panel--enter {
    transform: translateX(0) translateY(0);
}
.animal-drawer__panel--leave {
    transform: translateX(100%);
}

/* 头部 */
.animal-drawer__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 0;
    flex-shrink: 0;
}
.animal-drawer__title {
    font-size: 20px;
    font-weight: 700;
    color: #794f27;
}
.animal-drawer__close {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    font-size: 20px;
    color: #c4b89e;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.15s ease;
}
.animal-drawer__close:hover {
    background: rgba(114, 93, 66, 0.1);
    color: #725d42;
}

/* 内容区 */
.animal-drawer__body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
}
.animal-drawer__footer {
    flex-shrink: 0;
    padding: 16px 24px;
    border-top: 1px solid #e8e2d6;
}
```

Props: `open`（必填）、`title`、`placement`（`'left' | 'right' | 'top' | 'bottom'`，默认 `'right'`）、`width`（默认 378）、`height`（默认 300）、`maskClosable`（默认 true）、`pushBackground`（默认 true）、`footer`、`maskStyle`。Emits: `close`。焦点陷阱：Tab 循环、ESC 关闭、关闭后恢复焦点。打开时锁定 body 滚动。`pushBackground` 对背景元素施加 `scale(0.94) + blur(1px) + borderRadius(14px)`。

---

### Form（表单系统）

源码：`src/components/Form/`（`Form.vue` + `FormItem.vue` + `FormProvider.vue` + `context.ts` + `useForm.ts` + `validators.ts` + `types.ts`）。声明式表单 + 校验，支持嵌套字段。

**Form 组件：**

```less
.animal-form {
    font-family: @font-family;
    &--horizontal {
        .animal-form-item {
            display: flex;
            align-items: center;
            gap: 12px;
        }
    }
    &--vertical {
        .animal-form-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
    }
    &--inline {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
    }
}
```

**FormItem 样式：**

```less
.animal-form-item {
    width: 100%;
    &__label {
        font-size: 14px;
        font-weight: 600;
        color: #725d42;
        white-space: nowrap;
    }
    &__required {
        color: #e05a5a;
        margin-left: 2px;
    }
    &__control {
        flex: 1;
    }
    &__help {
        font-size: 12px;
        font-weight: 500;
        margin-top: 4px;
        line-height: 1.4;
    }
    &__help--error {
        color: #e05a5a;
    }
    &__help--warning {
        color: #dba90e;
    }
    &--has-error .animal-form-item__control :deep(input) {
        border-color: #e05a5a;
    }
}
```

**Form Props**: `form`（FormInstance）、`initialValues`、`layout`（`'horizontal' | 'vertical' | 'inline'`，默认 `'horizontal'`）、`labelAlign`、`labelCol`/`wrapperCol`（`{ span, offset }`）、`size`（`'small' | 'middle' | 'large'`）、`disabled`、`colon`（默认 true）、`requiredMark`（`boolean | 'optional'`）、`onFinish`、`onFinishFailed`、`onValuesChange`、`onReset`。

**FormItem Props**: `name`（NamePath — 支持 `'user.name'` 嵌套）、`label`、`rules`（RuleObject\[]）、`required`、`dependencies`、`valuePropName`（默认 `'modelValue'`）、`trigger`（默认 `'onUpdate:modelValue'`）、`getValueFromEvent`、`normalize`、`hidden`、`hasFeedback`、`validateStatus`、`help`、`noStyle`、`labelCol`、`wrapperCol`、`colon`、`requiredMark`、`layout`、`initialValue`。

**RuleObject**: `required`、`message`、`min`、`max`、`len`、`pattern`（RegExp）、`whitespace`、`type`（`'string' | 'number' | 'boolean' | 'integer' | 'float' | 'array' | 'object' | 'email' | 'url' | 'date'`）、`validator`（async fn → `void | string`）。

**FormInstance 方法**（`useForm()` 产出）：`getFieldValue`、`getFieldsValue`、`setFieldValue`、`setFieldsValue`、`resetFields`、`validateFields`（返回 Promise）、`submit`、`setFields`、`isFieldTouched`、`isFieldValidating`、`getFieldError`、`scrollToField`。

---

### DatePicker

源码：`src/components/DatePicker/DatePicker.vue`（scoped Less + BEM，`animal-date-picker*`）。日历选择器，触发区视觉对齐 Input。

```less
/* 触发区 —— 奶油底、胶囊圆角、无边框 */
.animal-date-picker__trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    background: #fffbe7;
    border-radius: 50px;
    cursor: pointer;
    transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.animal-date-picker__trigger--small {
    height: 32px;
    padding: 0 14px;
    font-size: 12px;
}
.animal-date-picker__trigger--middle {
    height: 40px;
    padding: 0 18px;
    font-size: 14px;
}
.animal-date-picker__trigger--large {
    height: 48px;
    padding: 0 22px;
    font-size: 16px;
}
.animal-date-picker__trigger:hover {
    box-shadow: 0 3px 0 0 #c4b89e;
}
.animal-date-picker__trigger--open {
    box-shadow:
        0 3px 0 0 #e0b800,
        0 0 0 3px rgba(255, 204, 0, 0.15);
}
.animal-date-picker__trigger--error {
    box-shadow: 0 3px 0 0 #c94444;
}
.animal-date-picker__trigger--warning {
    box-shadow: 0 3px 0 0 #dba90e;
}

/* 弹出面板 */
.animal-date-picker__panel {
    position: absolute;
    width: 288px;
    padding: 16px;
    background: #fffdf7;
    border: 1.5px solid #e8dcc8;
    border-radius: 20px;
    box-shadow: 0 6px 18px rgba(61, 52, 40, 0.12);
    z-index: 1000;
}

/* 星期表头 + 日期格 */
.animal-date-picker__week-cell {
    width: 36px;
    text-align: center;
    font-size: 12px;
    font-weight: 700;
    color: #a09080;
}
.animal-date-picker__day-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    color: #725d42;
    cursor: pointer;
    transition: all 0.15s;
}
.animal-date-picker__day-cell--selected {
    background: #ffb400;
    color: #fff;
    font-weight: 700;
}
.animal-date-picker__day-cell--today {
    color: #19c8b9;
    font-weight: 700;
}
.animal-date-picker__day-cell--outside {
    color: #d4c9b4;
}
.animal-date-picker__day-cell--disabled {
    color: #c4b89e;
    cursor: not-allowed;
}
.animal-date-picker__day-cell--in-range {
    background: rgba(255, 180, 0, 0.15);
}
.animal-date-picker__day-cell--range-start,
.animal-date-picker__day-cell--range-end {
    background: #ffb400;
    color: #fff;
    font-weight: 700;
}

/* footer：今天 / 确定 */
.animal-date-picker__confirm-btn {
    padding: 6px 16px;
    border: none;
    background: rgba(114, 93, 66, 0.1);
    border-radius: 12px;
    color: #8a7b66;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
}
.animal-date-picker__confirm-btn:hover {
    background: #8a7b66;
    color: #fff;
}
```

Props / Emits：见 `AI_USAGE.md` §1.30。交互：点击外部关闭（document mousedown）、面板视口不足向上翻转 / 右侧不足右对齐、ESC 关闭、Enter 确定、方向键网格导航。模式切换：date（42 格日历）/ month / year（3×4 网格）。

---

### TimePicker

源码：`src/components/TimePicker/TimePicker.vue`（scoped Less + BEM，`animal-time-picker*`）。时/分/秒滚动列选择。

```less
/* 触发区 —— 与 DatePicker 同款 Input 对齐视觉 */
.animal-time-picker__trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    background: #fffbe7;
    border-radius: 50px;
    cursor: pointer;
    transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.animal-time-picker__trigger--small {
    height: 32px;
    padding: 0 14px;
    font-size: 12px;
}
.animal-time-picker__trigger--middle {
    height: 40px;
    padding: 0 18px;
    font-size: 14px;
}
.animal-time-picker__trigger--large {
    height: 48px;
    padding: 0 22px;
    font-size: 16px;
}
.animal-time-picker__trigger--open {
    box-shadow:
        0 3px 0 0 #e0b800,
        0 0 0 3px rgba(255, 204, 0, 0.15);
}

/* 弹出面板（含秒 248px / 无秒 172px） */
.animal-time-picker__panel {
    position: absolute;
    width: 248px;
    padding: 14px;
    background: #fffdf7;
    border: 1.5px solid #e8dcc8;
    border-radius: 20px;
    box-shadow: 0 6px 18px rgba(61, 52, 40, 0.12);
    z-index: 1000;
}
.animal-time-picker__panel--no-seconds {
    width: 172px;
}

/* 三列滚动 */
.animal-time-picker__column-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-height: 232px;
    overflow-y: auto;
    padding: 2px;
}
.animal-time-picker__option {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0; /* 禁止 flex 压缩，否则选项被压扁 */
    height: 28px;
    border: none;
    background: transparent;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 500;
    color: #725d42;
    cursor: pointer;
    transition: all 0.15s;
}
.animal-time-picker__option:hover {
    background: #ffd54f;
    color: #725d42;
}
.animal-time-picker__option--selected {
    background: #ffb400;
    color: #fff;
    font-weight: 700;
}

/* footer：此刻 / 确定 */
.animal-time-picker__confirm-btn {
    padding: 6px 16px;
    border: none;
    background: rgba(114, 93, 66, 0.1);
    border-radius: 12px;
    color: #8a7b66;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
}
.animal-time-picker__confirm-btn:hover {
    background: #8a7b66;
    color: #fff;
}
```

Props / Emits：见 `AI_USAGE.md` §1.31。交互：打开时选中项滚动居中（`index×38 − clientHeight/2 + 19`）、点击外部关闭、面板向上翻转 / 右对齐、ESC 关闭、Enter 确定。

---

### Image

源码：`src/components/Image/Image.vue`（非 scoped Less + BEM，全局样式与 Drawer 一致以便 Teleport 预览弹层命中）。白色衬板相框图片组件，支持懒加载、加载失败占位、点击预览大图。

```css
/* 相框 */
.animal-image {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #fff;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 8px 14px 0 rgba(0, 0, 0, 0.08);
    line-height: 0;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.animal-image__img {
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.25s ease;
}
.animal-image--loaded .animal-image__img {
    opacity: 1;
}
/* 错误占位 */
.animal-image--error {
    flex-direction: column;
    gap: 8px;
    color: #c4b89e;
    font-size: 13px;
    line-height: 1.5;
}
/* 预览触发（相框升格为 button） */
.animal-image--preview {
    cursor: zoom-in;
    appearance: none;
}
/* 14 种 Card 底色（无花纹） */
.animal-image--default {
    background: rgb(247, 243, 223);
    color: #725d42;
}
.animal-image--app-pink {
    background: #fde4e8;
    color: #a85565;
}
/* ... 其余 12 种同 Card pattern 底色 */
/* 大图预览遮罩（Teleport 到 body） */
.animal-image__mask {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.55);
    animation: animal-image-fade-in 0.2s ease;
}
.animal-image__preview-img {
    max-width: min(88vw, 1100px);
    max-height: 86vh;
    border-radius: 20px;
    object-fit: contain;
    box-shadow: 0 12px 40px rgba(43, 33, 24, 0.55);
}
.animal-image__close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(216, 220, 226, 0.9);
    border: 1.5px solid rgba(255, 255, 255, 0.75);
}
```

Props：`src`（string，必填）、`alt`（string，默认 `''`）、`width`/`height`（number|string，数字自动加 px）、`color`（`ImageColor`，默认 `'white'`，14 种 Card 底色）、`lazy`（boolean，默认 false → 原生 `loading="lazy"`）、`preview`（boolean，默认 true）。Emits：`load`（Event）、`error`（Event）。`preview=true` 时相框渲染为 `<button>`（原生 Enter/Space 激活），预览弹层经 `<Teleport to="body">` 挂载，支持 ESC / 遮罩点击 / 关闭按钮关闭，关闭后焦点归还触发元素。

---

### Carousel

源码：`src/components/Carousel/Carousel.vue`。轮播图组件，默认插槽的每个直接子元素为一张；支持自动播放、首尾循环、箭头与圆点切换、键盘导航。

```css
/* 容器（region 语义，可聚焦） */
.animal-carousel {
    position: relative;
    width: 100%;
    border-radius: 20px;
    font-family: var(--animal-font-family, 'Nunito', 'Noto Sans SC');
}
.animal-carousel:focus-visible {
    outline: 2px solid var(--animal-primary-color, #19c8b9);
    outline-offset: 3px;
}

/* 视口 */
.animal-carousel__viewport {
    position: relative;
    overflow: hidden;
    min-height: 180px;
    background: rgb(247, 243, 223);
    border-radius: 20px;
}

/* 幻灯片：绝对定位淡入 + 位移，active 相对定位撑高 */
.animal-carousel__slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    visibility: hidden;
    transform: translateX(18px);
    transition: opacity/transform/visibility 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.animal-carousel__slide--active {
    position: relative;
    opacity: 1;
    visibility: visible;
    transform: translateX(0);
}

/* 圆形箭头按钮 42×42（移动端 36×36），::before 画 9×9 折角箭头 */
.animal-carousel__arrow {
    position: absolute;
    top: 50%;
    width: 42px;
    height: 42px;
    border: 1.5px solid rgba(121, 79, 39, 0.16);
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.92);
    color: var(--animal-text-color, #794f27);
    transform: translateY(-50%);
}
.animal-carousel__arrow--prev {
    left: 14px;
} /* ::before rotate(-45deg) */
.animal-carousel__arrow--next {
    right: 14px;
} /* ::before rotate(135deg) */

/* 圆点指示器：白色胶囊容器，30×30 命中区 + ::before 10px 圆点，active 拉宽 24px 变主题色 */
.animal-carousel__dots {
    position: absolute;
    bottom: 14px;
    left: 50%;
    padding: 7px 10px;
    border-radius: 50px;
    background: rgba(255, 255, 255, 0.85);
    transform: translateX(-50%);
}
.animal-carousel__dot--active::before {
    width: 24px;
    background: var(--animal-primary-color, #19c8b9);
}

/* 右上角播放/暂停按钮 */
.animal-carousel__rotation-control {
    position: absolute;
    top: 14px;
    right: 14px;
    min-width: 58px;
    height: 32px;
    border-radius: 50px;
    font-size: 12px;
    font-weight: 700;
}

@media (prefers-reduced-motion: reduce) {
    /* 所有过渡归零 */
}
```

Props：`modelValue`（number，v-model 受控索引）、`defaultActiveIndex`（默认 0）、`autoplay`（默认 false）、`interval`（默认 3000，实际最小 1000）、`loop`（默认 true）、`showArrows`/`showDots`（默认 true）、`pauseOnHover`（默认 true）、`ariaLabel`（默认 '轮播图'）。Emits：`update:modelValue(index)`、`change(index)`。键盘：ArrowLeft / ArrowRight / Home / End。autoplay 悬停/聚焦暂停（右上角播放控制按钮），单张内容不渲染控制器，`loop=false` 边界箭头禁用。

---

### Countdown

源码：`src/components/Countdown/Countdown.vue`（内部子组件 `DigitRoll.vue` 实现滚动数字位）。里程表式单向滚动倒计时，`format` 支持 DD / HH / mm / ss token，字面量原样渲染为分隔符。

```css
/* 容器：default 白底软阴影 / island 米色虚线边框 */
.animal-countdown {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    color: var(--animal-text-color, #794f27);
    font-weight: 700;
    border-radius: 20px;
}
.animal-countdown--default {
    padding: 12px 18px;
    background: var(--animal-bg-color, #fff);
    box-shadow: var(--animal-shadow-sm, 0 2px 4px rgba(61, 52, 40, 0.06));
}
.animal-countdown--island {
    padding: 13px 20px;
    background: rgb(247, 243, 223);
    border: 2px dashed #d4c4a8;
}

/* 数字块（Time 同款渐变底，bordered 时加 1.5px #d4c9b4 边框） */
.animal-countdown__unit {
    display: inline-flex;
    gap: 3px;
    padding: 3px 8px;
    border-radius: 12px;
    background: linear-gradient(180deg, #fff 0%, #f8f8f0 100%);
}

/* 滚动数字位：0-9 两轮共 20 面数字条，translateY 每面 5% 单向向下滚动 */
.animal-countdown__digit-cell {
    overflow: hidden;
    height: 1.2em;
}
.animal-countdown__digit-strip {
    display: flex;
    flex-direction: column;
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
}
.animal-countdown__digit-face {
    height: 1.2em;
    color: #8b7355;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
    text-align: center;
}

/* 冒号：900 字重 + top -0.08em 光学居中，字号按尺寸 20/26/34px */
.animal-countdown__colon {
    font-weight: 900;
    position: relative;
    top: -0.08em;
}

/* 尺寸：small 40px / middle 48px / large 56px；数字位字号 20/26/34px */
.animal-countdown--small {
    min-height: 40px;
}
.animal-countdown--middle {
    min-height: 48px;
}
.animal-countdown--large {
    min-height: 56px;
}

/* 读屏专用文本（.sr-only，滚动数字条 aria-hidden） */
```

Props：`value`（number|Date，必填）、`format`（默认 `'HH:mm:ss'`）、`size`（`'small' | 'middle' | 'large'`，默认 `'middle'`）、`variant`（`'default' | 'island'`，默认 `'default'`）、`bordered`（默认 false）。Emits：`change(remaining)`（剩余毫秒）、`finish()`（归零，仅一次）。插槽：`#prefix` 倒计时前的说明内容。250ms 轮询，归零清定时器；`value` 变化重新计时；含 DD 时 HH 取天内小时，否则取总小时。

---

### Pagination

源码：`src/components/Pagination/Pagination.vue`。分页组件（幽灵正圆页码格子 + 双配色），支持受控/非受控、每页条数切换、快速跳转；`Table` 的 `pagination` 属性内嵌同款。

```css
/* 容器：nav 语义 */
.animal-pagination {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-family: var(--animal-font-family, 'Nunito', 'Noto Sans SC');
    font-size: 14px;
    color: #725d42;
    user-select: none;
}
.animal-pagination--disabled {
    opacity: 0.6;
}

/* 总条数 */
.animal-pagination__total {
    margin-right: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #a09080;
    white-space: nowrap;
}

/* 页码/前后翻页：32px 透明底正圆，hover 变色（由变体提供），disabled #d4c9b4 */
.animal-pagination__item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: #725d42;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
}
.animal-pagination__item:focus-visible {
    outline: 2px solid #ffcc00;
    outline-offset: 1px;
}

/* 当前页：白字 700 字重 + 变体底色（orange #ffc107 / teal #19c8b9） */
.animal-pagination__item--active {
    color: #fff;
    font-weight: 700;
    cursor: default;
}
.animal-pagination--orange .animal-pagination__item--active {
    background: #ffc107;
}
.animal-pagination--orange .animal-pagination__item--active:hover {
    background: #ffb400;
}
.animal-pagination--orange .animal-pagination__item:hover:not(:disabled):not(.animal-pagination__item--active) {
    background: #ffd54f;
    color: #725d42;
}
.animal-pagination--teal .animal-pagination__item--active {
    background: #19c8b9;
}
.animal-pagination--teal .animal-pagination__item--active:hover {
    background: #3dd4c6;
}
.animal-pagination--teal .animal-pagination__item:hover:not(:disabled):not(.animal-pagination__item--active) {
    background: #e6f9f6;
    color: #19c8b9;
}

/* 省略号 */
.animal-pagination__ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 32px;
    color: #c4b89e;
    font-weight: 900;
    letter-spacing: 1px;
}

/* 每页条数切换器：白底 2px #e8dcc8 边框 34px 触发器（同 Select），箭头展开旋转 180° */
.animal-pagination__size-changer {
    position: relative;
    display: inline-flex;
    margin-left: 8px;
}
.animal-pagination__size-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    height: 34px;
    padding: 0 12px;
    border: 2px solid #e8dcc8;
    border-radius: 12px;
    background: #fff;
    color: #725d42;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}
.animal-pagination__size-trigger--open .animal-pagination__caret {
    transform: rotate(180deg);
}

/* 弹层：#ffeea0 28px 圆角向上弹出，option 选中金色 pill bar + 手指光标（同 Select） */
.animal-pagination__size-list {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    z-index: 10;
    padding: 8px 0;
    list-style: none;
    background: #ffeea0;
    border-radius: 28px;
    box-shadow: 0 6px 18px rgba(61, 52, 40, 0.12);
}
.animal-pagination__size-option--active::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 56%;
    transform: translateY(-50%);
    height: 14px;
    margin: 0 20px;
    background: #ffcc00;
    border-radius: 7px;
    z-index: -1;
    opacity: 0.3;
}

/* 快速跳转：奶油底胶囊输入框 52×32px，无 border，focus 无强调 */
.animal-pagination__jumper {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-left: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #8a7b66;
}
.animal-pagination__jumper-input {
    width: 52px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: 50px;
    background: #fffbe7;
    color: #725d42;
    font-size: 13px;
    font-weight: 700;
    text-align: center;
    outline: none;
    caret-color: #725d42;
}
```

Props：`total`（number，必填）、`current`（v-model:current，受控当前页）、`defaultCurrent`（默认 1）、`pageSize`（v-model:pageSize，受控每页条数）、`defaultPageSize`（默认 10）、`showSizeChanger`（默认 false）、`pageSizeOptions`（默认 `[10, 20, 50, 100]`）、`showQuickJumper`（默认 false）、`showTotal`（默认 false）、`disabled`（默认 false）、`variant`（`'orange' | 'teal'`，默认 `'orange'`）。Emits：`update:current(page)`、`update:pageSize(size)`、`change(page, pageSize)`、`showSizeChange(current, size)`。页数 ≤7 全量展示；>7 时首尾页 + 当前页 ±1 + 省略号。size changer 弹层点击外部 / Escape 关闭；jumper 仅数字、Enter/失焦跳页、超界收敛到边界页。`Table` 的 `pagination` 属性传对象开启客户端分页（`total` 由 Table 按 dataSource 长度计算）。

---

## 3. Demo 布局精确规范

这是 Demo 站（`demo/App.vue`）的实际布局数值，用于还原完整页面效果：

### 整体布局

```css
/* 页面背景 */
/* 首页 */
background:
    url(home_bg.svg) center/cover no-repeat,
    #7dc395;
/* 组件页 */
background: url(content_bg_pc.jpg) center fixed;

/* Sidebar */
width: 220px;
min-width: 220px;
background: url(menu_bg.svg) center/cover no-repeat;
```

### Sidebar 精确值

```css
/* 顶部 Logo 区 */
padding: 20px 16px 12px;
border-bottom: 1px solid #e8e2d6;
font-weight: 700;
font-size: 15px;
color: #725d42;
letter-spacing: -0.3px;

/* Logo 图片 */
width: 24px;
height: 24px;
margin-right: 8px;

/* 菜单列表 */
padding: 8px 0;

/* 分类标题 */
padding: 12px 16px 4px;
font-size: 11px;
color: #a0936e;
font-weight: 600;
letter-spacing: 0.5px;
text-transform: uppercase;

/* 菜单项 */
margin: 1px 5px;
height: 40px;
padding: 0 16px;
padding-left: 26px;
font-weight: 600;
font-size: 14px;
border-radius: 12px;
transition: all 0.15s;

/* inactive */
color: #8a7b66;
background: transparent;
/* inactive hover */
background: #d6dff0;
/* active */
color: #fff;
background: #b7c6e5;
```

### 主内容区

```css
/* 桌面 */
padding: 32px 40px;

/* 底部装饰图（桌面端，固定定位）*/
left: 220px;
width: calc(100% - 220px);
z-index: 0;
pointer-events: none;
```

### 移动端适配

```css
/* 顶栏 */
height: 52px; padding: 0 12px;
background: rgba(255, 252, 244, 0.92);
backdrop-filter: blur(8px);
border-bottom: 1px solid #e8e2d6;
z-index: 50;

/* 按钮 */ font-size: 20px; color: #725d42; padding: 4px 8px; border-radius: 8px;

/* 主内容区 padding-top */ 68px;

/* 抽屉 */
width: 240px; z-index: 99;
box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
/* 遮罩 */ background: rgba(0, 0, 0, 0.35); z-index: 98;
```

---

## 4. HomePage 精确规范

```css
/* Hero 区域 */
padding: 60px 40px 40px;
min-height: 80vh;

/* 主标题 */
font-size: 50px;
font-weight: 700;
color: #fff9e6;
text-shadow: 0px 4px 1px rgba(0, 0, 0, 0.4);
margin: 0 0 12px;

/* 版本 Badge */
font-size: 12px;
font-weight: 600;
padding: 2px 10px;
border-radius: 10px;
background: #e6f9f6;
color: #19c8b9;
margin-left: 8px;

/* 副标题 */
font-size: 17px;
color: #7c5734;
line-height: 1.7;
margin: 0 0 28px;
max-width: 520px;

/* Logo 图片 */
width: 172px;
height: 172px;

/* Section */
padding: 48px 40px;
max-width: 960px;
margin: 0 auto;

/* Section 标题 */
font-size: 24px;
font-weight: 700;
color: #725d42;
margin: 0 0 8px;

/* Section 描述 */
font-size: 14px;
color: #7c5734;
margin-bottom: 32px;

/* Feature 网格 */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 16px;

/* Feature Card hover */
transform: translateY(-4px);
box-shadow: 0 8px 24px rgba(114, 93, 66, 0.15);

/* Feature 图标 hover */
transform: scale(1.1) rotate(-4deg);

/* 代码块 */
max-width: 600px;
margin: 0 auto;
padding: 20px 28px;
background: #2b2118;
border: 1px solid #3d3028;
border-radius: 20px;
font-size: 13px;
font-weight: 600;
color: #e8d5bc;
line-height: 1.8;
```

**代码高亮配色：**

| Token 类型              | 颜色                            |
| ----------------------- | ------------------------------- |
| 注释                    | `#6b5e50`（italic, weight 400） |
| 字符串                  | `#a8d4a0`                       |
| Vue 模板标签            | `#f0a870`                       |
| 关键字 / npm/pnpm       | `#f0a870`                       |
| 命令动词（install/add） | `#a8d4a0`                       |
| 括号 `{}`               | `#d4b896`                       |
| 箭头 `=>`               | `#d4a0e0`                       |
| CSS 变量名              | `#e8c87a`                       |
| `:root`                 | `#f0a870`                       |
| 十六进制色值            | `#8ab8e0`                       |

---

## 5. 自实现 CSS 变量完整模板

不依赖组件库时，在 `:root` 中声明以下变量：

```css
:root {
    /* 字体 */
    --animal-font: Nunito, 'Noto Sans SC', -apple-system, 'PingFang SC', 'Hiragino Sans GB', sans-serif;

    /* 主色 */
    --animal-primary: #19c8b9;
    --animal-primary-hover: #3dd4c6;
    --animal-primary-active: #11a89b;
    --animal-primary-bg: #e6f9f6;

    /* 文字 */
    --animal-text: #794f27;
    --animal-text-body: #725d42;
    --animal-text-secondary: #9f927d;
    --animal-text-muted: #8a7b66;
    --animal-text-disabled: #c4b89e;

    /* 背景 */
    --animal-bg: #f8f8f0;
    --animal-bg-content: rgb(247, 243, 223);
    --animal-bg-disabled: #f0ece2;

    /* 边框 */
    --animal-border: #c4b89e;
    --animal-border-hover: #a89878;

    /* 圆角 */
    --animal-radius-sm: 12px;
    --animal-radius: 18px;
    --animal-radius-lg: 24px;
    --animal-radius-pill: 50px;

    /* 3D 阴影 */
    --animal-shadow-btn: #bdaea0;
    --animal-shadow-input: #d4c9b4;
    --animal-shadow-switch: #5a9e1e;

    /* 游戏特殊色 */
    --animal-focus-yellow: #ffcc00;
    --animal-focus-yellow-d: #e0b800;
    --animal-sidebar-active: #b7c6e5;
    --animal-sidebar-hover: #d6dff0;

    /* 状态 */
    --animal-success: #6fba2c;
    --animal-warning: #f5c31c;
    --animal-error: #e05a5a;

    /* 动效 */
    --animal-ease: cubic-bezier(0.4, 0, 0.2, 1);
    --animal-duration-fast: 0.15s;
    --animal-duration: 0.25s;
    --animal-duration-slow: 0.35s;
}
```

---

## 6. 7 条设计铁律

1. **颜色**：大地棕色系文字 + 薄荷青绿主色 + 奶油米白背景，禁止纯黑 / 冷灰
2. **圆角**：最小 12px；按钮、输入框必须 50px pill 形
3. **立体感**：3D 厚阴影（`0 Npx 0 0 [暗色]` + hover 上浮 / active 下压）**仅用于 primary 按钮 / danger-primary 按钮 / Input / Switch**；default / dashed / text / link 按钮用柔和 elevation 阴影（`0 2px 4px / 0 3px 10px rgba(61,52,40,...)`）即可
4. **字体**：Nunito（Google Fonts）圆体，按钮/标题 weight 600+，从不使用细体
5. **动效**：过渡 0.15\~0.35s，缓动 `cubic-bezier(0.4, 0, 0.2, 1)`，平滑不生硬
6. **焦点**：输入框用黄色 `#ffcc00`，按钮用青绿 `#19c8b9`，绝不用蓝色
7. **禁止**：直角矩形交互元素、纯黑文字 `#000`、冷蓝色调、扁平无阴影设计

---

## 7. 新组件文件结构模板

```
src/components/MyComponent/
├── MyComponent.vue          # SFC：<script setup lang="ts"> + <template> + <style lang="less" scoped>
├── types.ts                 # （可选）独立类型文件，跨文件复用泛型时必需
└── index.ts                 # 统一导出
```

`src/components/MyComponent/index.ts`：

```ts
export { default as MyComponent } from './MyComponent.vue';
export type { MyComponentProps } from './types';
```

`src/index.ts` 追加：

```ts
export { MyComponent } from './components/MyComponent';
export type { MyComponentProps } from './components/MyComponent';
```

> 仓库内所有组件均使用 `<script setup lang="ts">` + scoped Less + BEM；禁止使用 CSS Modules（`*.module.less`）。

Less / BEM 模板（直接使用设计 token）：

```less
@import '@/styles/variables.less';

.animal-mycomp {
    background: @bg-color-content; // rgb(247,243,223)
    color: @text-color-body; // #725d42
    border: @border-width solid @border-color-light; // 2px solid #c4b89e
    border-radius: @border-radius-base; // 18px
    font-family: @font-family;
    font-weight: 500;
    letter-spacing: 0.01em;
    transition: all @motion-duration-base @motion-ease;
    box-shadow: 0 3px 0 0 @shadow-input; // #d4c9b4

    &:hover:not(.animal-mycomp--disabled) {
        border-color: @border-color-hover; // #a89878
        transform: translateY(-1px);
        box-shadow: 0 4px 0 0 @shadow-input;
    }

    &:focus-within {
        border-color: @focus-yellow; // #ffcc00
        box-shadow:
            0 3px 0 0 @focus-yellow-dark,
            0 0 0 3px rgba(255, 204, 0, 0.15);
    }

    &--disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: @bg-color-disabled;
        color: @text-color-disabled;
        border-color: @shadow-input;
        box-shadow: none;
    }

    &__icon {
        display: inline-flex;
        align-items: center;
    }
}
```

Vue SFC 模板：

```vue
<script setup lang="ts">
import type { MyComponentSize } from './types';

interface Props {
    /** 尺寸 */
    size?: MyComponentSize;
    /** 禁用 */
    disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
    size: 'middle',
    disabled: false,
});

defineEmits<{ (e: 'click', event: MouseEvent): void }>();
defineSlots<{ default?: () => unknown; icon?: () => unknown }>();
</script>

<template>
    <div
        class="animal-mycomp"
        :class="[`animal-mycomp--${size}`, { 'animal-mycomp--disabled': disabled }]"
        @click="$emit('click', $event)"
    >
        <span v-if="$slots.icon" class="animal-mycomp__icon">
            <slot name="icon" />
        </span>
        <slot />
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-mycomp {
    font-family: @font-family;
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1;
    background: @bg-color-input;
    color: @warm-color-soft;
    border: 2px solid @border-color-light;
    border-radius: 50px;
    box-shadow: 0 3px 0 0 @shadow-soft;
    transition: all @motion-duration-base @motion-ease;

    &:hover:not(.animal-mycomp--disabled) {
        border-color: @border-color-hover;
        transform: translateY(-1px);
        box-shadow: 0 4px 0 0 @shadow-soft-hover;
    }

    &:focus-within {
        border-color: #ffcc00;
        box-shadow:
            0 3px 0 0 #e0b800,
            0 0 0 3px rgba(255, 204, 0, 0.15);
    }

    &--disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: @bg-color-disabled;
        color: @text-color-disabled;
        box-shadow: none;
    }

    &--small {
        height: 32px;
        padding: 0 16px;
        font-size: @font-size-sm;
    }
    &--middle {
        height: 45px;
        padding: 0 20px;
        font-size: @font-size-base;
    }
    &--large {
        height: 48px;
        padding: 0 32px;
        font-size: @font-size-lg;
    }

    &__icon {
        display: inline-flex;
        align-items: center;
    }
}
</style>
```

> Less / BEM 提示：
>
> - 顶部 `@import '@/styles/variables.less';` 引入全局 token，组件内统一用 `@xxx` 语法。
>
> - 状态样式用 BEM 修饰符（`&--disabled`、`&--checked`）而非堆叠工具类，便于阅读和覆盖。
>
> - 子元素一律用 `&__name`，避免出现孤立的 `.foo .bar` 选择器，scoped 编译后 BEM 命名足以隔离。
>
> - 时长 token：`@motion-duration-fast` (0.15s) / `@motion-duration-base` (0.25s) / `@motion-duration-slow` (0.35s)，缓动统一用 `@motion-ease`。

---

## 8. Demo 页面规范

每个组件在 `demo/pages/<ComponentName>Demo.vue` 创建演示页：

```vue
<script setup lang="ts">
import { MyComponent } from '../../src';
import { CodeBlock, ApiTable } from '../tools';

const props = [{ name: 'size', type: "'small' | 'middle' | 'large'", default: "'middle'", description: '尺寸' }];
</script>

<template>
    <div>
        <h2>MyComponent</h2>
        <MyComponent size="large">内容</MyComponent>
        <CodeBlock :code="`<MyComponent size=&quot;large&quot;>内容</MyComponent>`" />
        <ApiTable :data="props" />
    </div>
</template>
```

并在 `demo/ComponentPage.vue`（或 `demo/router.ts`）注册路由，同时把 `title / desc` 写入 `demo/pageInfo.ts`：

```ts
// demo/pageInfo.ts — 供 App 静态导入的轻量元信息
export const PAGE_INFO: Record<string, { title: string; desc: string }> = {
    button: { title: 'Button 按钮', desc: '...' },
    input: { title: 'Input 输入框', desc: '...' },
    switch: { title: 'Switch 开关', desc: '...' },
    card: { title: 'Card 卡片', desc: '...' },
    collapse: { title: 'Collapse 折叠面板', desc: '...' },
    cursor: { title: 'Cursor 光标', desc: '...' },
    time: { title: 'Time 时间', desc: '...' },
    footer: { title: 'Footer 底部装饰', desc: '...' },
    modal: { title: 'Modal 弹窗', desc: '...' },
    typewriter: { title: 'Typewriter 打字机', desc: '...' },
    'divider-comp': { title: 'Divider 分割线', desc: '...' },
    select: { title: 'Select 选择器', desc: '...' },
    checkbox: { title: 'Checkbox 多选框', desc: '...' },
    radio: { title: 'Radio 单选框', desc: '...' },
    tooltip: { title: 'Tooltip 文字提示', desc: '...' },
    tabs: { title: 'Tabs 标签页', desc: '...' },
    title: { title: 'Title 章节标题', desc: '...' },
    table: { title: 'Table 表格', desc: '...' },
    codeblock: { title: 'CodeBlock 代码高亮', desc: '...' },
};
```

新增组件务必追加对应条目，否则 Demo 侧栏不会展示。

---

## 9. 新增组件 Checklist

- [ ] 新建文件夹 `src/components/<Name>/`，含 `<Name>.vue` + `index.ts` + 可选 `types.ts`

- [ ] SFC 使用 `<script setup lang="ts">`，样式块用 `<style lang="less" scoped>`，类名遵循 BEM（`.animal-foo` / `.animal-foo--modifier` / `.animal-foo__elem`），**禁止 CSS Modules**

- [ ] Google Fonts 已通过 `@fontsource/*` 在 `src/index.ts` 引入（Nunito + Noto Sans SC + Zen Maru Gothic）

- [ ] Props interface 从组件文件或 `types.ts` 导出（**SFC 中带泛型时，必须使用 inline** **`defineProps<{...}>()`，不要再额外定义命名** **`interface Props`**，否则 vite-plugin-dts 会触发 TS4082 错误）

- [ ] 所有 props 有 JSDoc 注释（中文 OK）

- [ ] 受控值使用 `v-model` / `v-model:open` / `v-model:expanded` 习惯（`modelValue` + `update:modelValue`），同时支持 `defaultValue` 非受控初值

- [ ] React 端的 `ReactNode` 入参 → Vue 端改为命名插槽（`#icon` / `#prefix` / `#suffix` / `#footer` 等），可结构化的内容用默认插槽

- [ ] `disabled` 状态：cursor: not-allowed + opacity 0.5\~0.6 + 移除阴影

- [ ] 颜色优先引用 `variables.less` token（`@xxx`）或 `:root` 上的 `var(--animal-*)` CSS 变量，避免硬编码 hex

- [ ] 阴影使用暖色调（`#bdaea0` / `#d4c9b4` / `rgba(61,52,40,...)`），非冷黑

- [ ] hover 时 `translateY(-1px 或 -4px)` + 阴影加深

- [ ] active 时 `translateY(2px)` + 阴影减小

- [ ] 焦点：输入类用 `#ffcc00`，按钮类用 `#19c8b9`

- [ ] 动画使用 `@motion-duration-*` 和 `@motion-ease` token

- [ ] 组件从 `src/index.ts` 导出

- [ ] Demo 页创建于 `demo/pages/<Name>Demo.vue`

- [ ] Demo 在 `demo/ComponentPage.vue` 或 `demo/router.ts` 中注册

- [ ] `demo/pageInfo.ts` 追加 `{ title, desc }` 元信息

- [ ] 同步更新 `PROMPT.md`、`AI_USAGE.md`、`DESIGN_PROMPT.md`、`skill/SKILL.md` 四个文档

- [ ] `npm run build` 通过 `vue-tsc --noEmit` 类型检查 + `vite build` + `vite-plugin-dts` 声明文件生成
