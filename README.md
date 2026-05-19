# 🏝 Animal-Island-Vue


<div align="center">
    <img src="docs/img/readme-home.png" alt="animal-island-vue" style="border-radius: 12px; width: 40%; display: block; margin: 0 auto;" />    
</div>
<div align="center">
一款参考《动物森友会》风格的 Vue 3 UI 组件库
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

本项目是基于 Vue 3 + TypeScript + Less 实现的轻量 UI 组件库，是 [animal-island-ui](../animal-island-ui)（React 版）的 Vue 移植版本，设计风格灵感来源于任天堂《集合啦！动物森友会》游戏界面，用于个人前端技术练习与组件化开发学习。

所有视觉元素、布局、图标、动画均为独立设计实现，未直接使用任何任天堂官方美术素材、代码或资源文件。


## 预览

- 在线预览 (PC 端) [animal-island-vue-pc](https://guokaigdg.github.io/animal-island-vue/#/)
- 在线预览（移动端）[animal-island-vue-mobile](https://guokaigdg.github.io/animal-island-vue/#/)

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
    <Card type="title" color="green">
        <template #title>欢迎来到无人岛</template>
        <Button type="primary" @click="open = true">开始冒险</Button>
    </Card>

    <Modal v-model:open="open" title="Welcome">
        欢迎来到 animal-island-vue。
    </Modal>
</template>
```

## 文档
面向不同场景的完整参考：

| 文档 | 用途 |
|---|---|
| [`AI_USAGE.md`](./AI_USAGE.md) | 面向 AI 代码助手的使用手册，逐字收录全部组件 props、类型与默认值，附硬性规则与可复制样板，杜绝臆造 API。 |
| [`CHANGELOG.md`](./CHANGELOG.md) | 版本更新日志。 |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | 贡献指南。 |


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


## 案例

|<a href="https://github.com/yunxinz/ac-site-template">ac-site-template</a>（动森主题个人网站模板）  |  <a href="https://github.com/xiaochong/hi-kid">HiKid</a>（儿童教育练习英语口语和听力） |
| --- | --- |
|  <img src="docs/img/ac-site-template.png" alt="ac-site-template" style="border-radius: 8px; width: 90%; display: block; margin: 0 auto;" /> | <img src="docs/img/hi-kid.png" alt="HiKid" style="border-radius: 8px; width: 90%; display: block; margin: 0 auto;" />| 
|<a href="https://github.com/guokaigdg/animal-island-blog">animal-island-blog</a>（动森风格博客）  |   |
|  <img src="docs/img/case-animal-blog.png" alt="ac-site-template" style="border-radius: 8px; width: 90%; display: block; margin: 0 auto;" /> | | 



## 注意事项

- 本项目仅用于个人学习、研究与非商业展示，禁止任何形式的商业使用、二次售卖或盈利行为。
- 不用于任何商业产品、企业项目、对外服务或付费模板。
- 使用本组件库产生的任何风险由使用者自行承担。

## 版权与免责声明

- 本项目并非任天堂官方产品，与任天堂株式会社无任何关联、授权或合作关系。
- 项目名称中包含的游戏名称仅为风格描述性引用，不构成商标使用或品牌关联。
- 所有界面风格仅为设计灵感参考，不构成对原作品的复制或侵权。
- 若版权方认为相关内容存在侵权嫌疑，可通过邮箱联系，本人将在第一时间进行整改或删除处理。

## 联系方式

如有问题或版权相关沟通，请通过 Issue 或邮件联系。

## License

MIT
本项目基于 MIT 开源协议发布，仅限学习使用，作者不对因使用本库导致的任何法律问题或损失承担责任。
