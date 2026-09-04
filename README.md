# 🏝 Animal-Island-Vue

<div align="center">
一款自然可爱风格的 Vue 3 UI 组件库
</div>
<br/>
<div align="center">
    <a href="https://github.com/guokaigdg/animal-island-vue/stargazers"><img src="https://img.shields.io/github/stars/guokaigdg/animal-island-vue?style=flat-square" alt="Stars"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License"></a>
    <a href="LICENSE"><img src="https://img.shields.io/npm/dm/animal-island-vue.svg?style=flat-square" alt=""></a>
    <a href="https://github.com/guokaigdg/animal-island-vue/releases"><img src="https://img.shields.io/github/v/tag/guokaigdg/animal-island-vue?label=version&style=flat-square" alt="Version"></a>
</div>
<br/>
<div align="center">
    <a href="https://hellogithub.com/repository/guokaigdg/animal-island-vue" target="_blank"><img src="https://api.hellogithub.com/v1/widgets/recommend.svg?rid=98ecff41d142466d8d72694a6fadf9e9&claim_uid=pyGqTPIRMdo7fBS&theme=neutral" alt="Featured｜HelloGitHub" style="width: 250px; height: 54px;" width="250" height="54" /></a>
</div>
<br/>
<p align="center">
    简体中文 | <a href="./docs/README.en.md">English</a>
</p>

## 介绍

本项目是基于 Vue 3 + TypeScript + Less 实现的轻量 UI 组件库，是 [animal-island-ui](https://github.com/guokaigdg/animal-island-ui)（React 版）的 Vue 移植版本，设计风格为自然可爱的手绘小岛风，用于个人前端技术练习与组件化开发学习。

所有视觉元素、布局、图标、动画均为独立原创设计实现，不使用任何第三方受版权保护的美术素材、代码或资源文件。

## ⚠️ Git 历史已重写 — 请重新克隆

2026 年 9 月，本仓库的全部 git 历史已重写，以移除涉嫌侵犯任天堂版权的内容（依据 DMCA 下架通知）。此前所有提交、标签与发行版均已替换为清洁历史。

**如果你在历史重写前克隆或 fork 过本仓库：**

- 请勿 pull 或 merge —— 这会把已移除的内容重新带回你的副本。
- 请删除旧的克隆/fork，然后从本仓库重新克隆或重新 fork。
- 仅接受基于新历史的 Pull Request。

## 🎉 React 版本

- [animal-island-ui](https://github.com/guokaigdg/animal-island-ui)

## 预览

- 在线预览 (PC 端) [animal-island-vue-pc](https://guokaigdg.github.io/animal-island-vue/#/)

- 在线预览（移动端）[animal-island-vue-mobile](https://guokaigdg.github.io/animal-island-vue/#/)

## 🚀 用 AI 工具一键生成 animal-island-vue 风格页面（无需写代码）

非研发人员，不想自己写代码？用 [`PROMPT.md`](./PROMPT.md) 即可，不需要 npm，不需要打包工具。

**4 步使用：**

1. 复制 [`PROMPT.md`](./PROMPT.md) 全文。
2. 粘贴到任意 AI 工具（Cursor / Claude / ChatGPT / Gemini / DeepSeek）发送。
3. AI 会反问做什么页面，用一句话回答即可（如「个人博客」「商品列表」「FAQ」）。
4. 保存 AI 输出的 `index.html`，双击即可预览。

## 安装

```bash
npm install animal-island-vue
```

## 快速上手

> ⚠️ **重要**: 请务必导入样式文件 `import 'animal-island-vue/style'`，否则组件将没有样式与字体!

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Button, Card, Modal } from 'animal-island-vue';
import 'animal-island-vue/style';

const open = ref(false);
</script>

<template>
    <Title color="green">欢迎来到小岛</Title>
    <Card>
        <Button type="primary" @click="open = true">开始冒险</Button>
    </Card>

    <Modal v-model:open="open" title="Welcome"> 欢迎来到 animal-island-vue。 </Modal>
</template>
```

## 文档

面向不同场景的完整参考：

| 文档                                       | 用途                                                                                                              |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [`PROMPT.md`](./PROMPT.md)               | 🚀 给普通用户的一键提示词，复制到 Cursor / Claude / ChatGPT / v0 / Bolt / Lovable / Windsurf 即可生成 animal-island-vue 风格 Vue 页面。 |
| [`AI_USAGE.md`](./AI_USAGE.md)           | 面向 AI 代码助手的使用手册，逐字收录全部组件 props、类型与默认值，附硬性规则与可复制样板，杜绝臆造 API。                                                     |
| [`DESIGN_PROMPT.md`](./DESIGN_PROMPT.md) | 视觉风格提示词，适配 v0 / Figma AI / Midjourney / DALL-E，含色板、字体、尺寸表、Modal clip-path 与禁用清单。                                |
| [`skill/SKILL.md`](./skill/SKILL.md)     | 像素级样式规范 Skill，覆盖设计 token、全部组件精确 CSS、Demo 布局数值、Less 变量模板与新组件开发 Checklist。                                        |
| [`CHANGELOG.md`](./CHANGELOG.md)         | 版本更新日志。                                                                                                         |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md)   | 贡献指南。                                                                                                           |

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/guokaigdg/animal-island-vue.git
cd animal-island-vue

# 安装依赖
npm install

# 启动 Demo 开发服务器
npm run dev

# 构建组件库
npm run build

# 构建 Demo 站点
npm run build:docs
```

## 注意事项

- 本项目仅用于个人学习、研究与非商业展示，禁止任何形式的商业使用、二次售卖或盈利行为。

- 不用于任何商业产品、企业项目、对外服务或付费模板。

- 使用本组件库产生的任何风险由使用者自行承担。

## 版权与免责声明

- 本项目所有视觉元素、界面设计、图标与动画均为独立原创设计，不复制任何第三方游戏或产品的受版权保护的素材。

- 若版权方认为相关内容存在侵权嫌疑，可通过邮箱联系，本人将在第一时间进行整改或删除处理。

## 联系方式

如有问题或版权相关沟通，请通过 Issue 或邮件联系。

## License

MIT
本项目基于 MIT 开源协议发布，仅限学习使用，作者不对因使用本库导致的任何法律问题或损失承担责任。
