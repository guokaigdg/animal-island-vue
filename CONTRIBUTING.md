# 贡献指南

感谢你对 `animal-island-vue` 的兴趣。本文档介绍了在提交 PR 之前需要了解的本
地工作流程和约定。

## 开发环境搭建

```bash
npm install
npm run docs:dev   # VitePress 站点，包含实时组件演示
npm run build      # 构建库到 dist/
npm run typecheck  # vue-tsc 严格类型检查
```

推荐使用 Node 18+。

## 项目结构

```
src/
  components/   # 每个组件一个文件夹（.vue + index.ts）
  styles/       # variables.less、themes/default.less、reset.less、index.less
  index.ts      # 公共入口 — 每个导出的组件必须在此列出
docs/
  .vitepress/   # 站点配置和主题覆盖
  guide/        # 说明文档
  components/   # 每个组件一个 .md 文件，包含实时演示
```

## 约定

- **Less + BEM。** 在 scoped `<style lang="less">` 块中使用 BEM 命名构建组件样式
  （`.animal-btn`、`.animal-btn--primary`、`.animal-btn__icon`）。使用
  `@import '@/styles/variables.less'` 导入共享变量。
- **设计令牌。** 新的颜色/间距/圆角应添加到 `src/styles/variables.less`
  （Less 变量），并通过 `src/styles/themes/default.less` 导出为 CSS 自定义属性
  —— 不要在组件中硬编码。
- **TypeScript 严格模式。** 公共 API 中不允许使用 `any`。优先使用
  `defineProps<Props>()` 泛型，并从每个组件的 `index.ts` 重新导出 props 类型。
- **组合式 API + `<script setup>`** 用于所有组件。
- **文档与代码同在。** 每个新组件需要在 `docs/components/<name>.md` 添加页面，
  包含：实时演示、代码片段、props/events/slots 表格；在
  `docs/.vitepress/config.ts` 中添加侧边栏条目。

## 提交信息

遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范：

```
feat(button): 添加 ghost 变体
fix(modal): 打字机动画时按 Escape 关闭
docs(table): 文档化插槽渲染
```

## 文档分工

新增 / 修改组件时，按下表同步更新对应文件，避免文档漂移：

| 文件 | 受众 | 维护要点 |
| --- | --- | --- |
| [`PROMPT.md`](./PROMPT.md) | 普通 AI 工具用户 | self-contained 一键提示词；新增组件需追加 `### 组件名` spec 段落 |
| [`AI_USAGE.md`](./AI_USAGE.md) | AI 代码助手 | 组件 Props / 类型 / 默认值；新增组件需追加 API 表 |
| [`DESIGN_PROMPT.md`](./DESIGN_PROMPT.md) | v0 / Figma AI / Midjourney / DALL·E | 视觉风格描述；颜色 / 尺寸 / 形状变化时同步 |
| [`skill/SKILL.md`](./skill/SKILL.md) | 内部 Skill | 像素级 CSS 规范；与源码 `*.module.less` 100% 对齐 |

## Pull Request

1. Fork 并创建功能分支。
2. 本地运行 `npm run typecheck && npm run build && npm run docs:build`。
3. 在 `CHANGELOG.md` 的 `## [Unreleased]` 下更新内容。
4. 用简短摘要和截图/GIF（针对视觉变更）打开 PR。
