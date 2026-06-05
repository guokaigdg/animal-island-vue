# 🏝 Animal-Island-Vue


<div align="center">
    <img src="img/readme-home.png" alt="animal-island-vue" style="border-radius: 12px; width: 40%; display: block; margin: 0 auto;" />
</div>
<div align="center">
A Vue 3 UI component library inspired by Animal Crossing: New Horizons
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
    <a href="../README.md">简体中文</a> | English
</p>


## Introduction

This project is a lightweight UI component library built with Vue 3 + TypeScript + Less. It is the Vue port of [animal-island-ui](https://github.com/guokaigdg/animal-island-ui), with a design style inspired by Nintendo's "Animal Crossing: New Horizons" game interface, created for personal front-end technical practice and component development learning.

All visual elements, layouts, icons, and animations are independently designed and implemented, without directly using any official Nintendo art materials, code, or resource files.

## 🎉 React Version

- [animal-island-ui](https://github.com/guokaigdg/animal-island-ui)

## Preview

- Online Preview (PC) [animal-island-vue-pc](https://guokaigdg.github.io/animal-island-vue/#/)
- Online Preview (Mobile) [animal-island-vue-mobile](https://guokaigdg.github.io/animal-island-vue/#/)

## 🚀 Use AI to Generate animal-island-vue Pages (No Coding Needed)

Non-developer and don't want to write code yourself? Use [`PROMPT.md`](../PROMPT.md) — no npm, no build step.

**4 steps:**

1. Copy [`PROMPT.md`](../PROMPT.md) in full.
2. Paste into any AI tool (Cursor / Claude / ChatGPT / Gemini / DeepSeek) and send.
3. The AI asks what page you want — reply in one phrase (e.g. "personal blog", "product list", "FAQ").
4. Save the `index.html` it returns and double-click to preview.

## Installation

```bash
npm install animal-island-vue
```



## Quick Start

> ⚠️ **Important**: Please make sure to import the styles with `import 'animal-island-vue/style'`, otherwise the components will have no styles or fonts!

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Button, Card, Modal } from 'animal-island-vue';
import 'animal-island-vue/style';

const open = ref(false);
</script>

<template>
    <Title color="green">Welcome to the Deserted Island</Title>
    <Card>
        <Button type="primary" @click="open = true">Start Adventure</Button>
    </Card>

    <Modal v-model:open="open" title="Welcome">
        Welcome to animal-island-vue.
    </Modal>
</template>
```

## Documentation

Complete reference for different scenarios:

| Document | Purpose |
|---|---|
| [`PROMPT.md`](../PROMPT.md) | 🚀 One-click prompt for non-developers — paste into Cursor / Claude / ChatGPT / v0 / Bolt / Lovable / Windsurf to generate animal-island-vue-styled Vue pages. |
| [`AI_USAGE.md`](../AI_USAGE.md) | AI code assistant handbook - all component props, types and defaults word-for-word, hard rules and copy-paste boilerplate, no invented APIs. |
| [`DESIGN_PROMPT.md`](../DESIGN_PROMPT.md) | Visual-style prompts for v0 / Figma AI / Midjourney / DALL-E, including color palette, fonts, size tables, Modal clip-path and prohibition list. |
| [`skill/SKILL.md`](../skill/SKILL.md) | Pixel-perfect style specification Skill - design tokens, all component CSS, Demo layout values, Less variable templates and new component development checklist. |
| [`CHANGELOG.md`](../CHANGELOG.md) | Release notes. |
| [`CONTRIBUTING.md`](../CONTRIBUTING.md) | Contributing Guide |


## Local Development

```bash
# Clone the repository
git clone https://github.com/guokaigdg/animal-island-vue.git
cd animal-island-vue

# Install dependencies
npm install

# Start Demo development server
npm run dev

# Build component library
npm run build

# Build Demo site
npm run build:docs
```


## Usage Cases

<table>
<tr valign="top">
  <td align="center" width="33%">
    <br/>
    <img src="img/animal-island-new-tab.png" alt="animal-island-new-tab" style="border-radius: 8px; width: 90%; display: block; margin: 8px auto 0;" />
    <br/><a href="https://ashleycry.github.io/AnimalIslandNewTab/">Animal Island New Tab</a><br/><sub>Animal Crossing style new tab page</sub>
  </td>
  <td align="center" width="33%">
    <br/>
    <img src="img/ac-site-template.png" alt="ac-site-template" style="border-radius: 8px; width: 90%; display: block; margin: 8px auto 0;" />
    <br/><a href="https://github.com/yunxinz/ac-site-template">ac-site-template</a><br/><sub>Animal Crossing themed personal website template</sub>
  </td>
  <td align="center" width="33%">
    <br/>
    <img src="img/hi-kid.png" alt="HiKid" style="border-radius: 8px; width: 90%; display: block; margin: 8px auto 0;" />
    <br/><a href="https://github.com/xiaochong/hi-kid">HiKid</a><br/><sub>English learning app for children</sub>
  </td>
</tr>
<tr valign="top">
  <td align="center" width="33%">
    <br/>
    <img src="img/android-ui.png" alt="android-ui" style="border-radius: 8px; width: 90%; display: block; margin: 8px auto 0;" />
    <br/><a href="https://github.com/liuyuhong0324/AnimalIslandUI">AnimalIslandUI</a><br/><sub>Animal Crossing style Android UI library</sub>
  </td>
  <td align="center" width="33%">
    <br/>
    <img src="img/itbug-shop.png" alt="ItbugShop" style="border-radius: 8px; width: 90%; display: block; margin: 8px auto 0;" />
    <br/><a href="https://itbug.shop/">ItbugShop</a><br/><sub>Liang Diandian's Blog</sub>
  </td>
  <td align="center" width="33%">
    <br/>
    <img src="img/KidsMathQuest.jpeg" alt="KidsMathQuest" style="border-radius: 8px; width: 90%; display: block; margin: 8px auto 0;" />
    <br/><a href="https://github.com/bk4ice/KidsMathQuest">KidsMathQuest</a><br/><sub>Math practice for elementary school</sub>
  </td>
</tr>
<tr valign="top">
  <td align="center" width="33%">
    <br/>
    <img src="img/flutter-ui.jpeg" alt="animal_island_flutter" style="border-radius: 8px; width: 90%; display: block; margin: 8px auto 0;" />
    <br/><a href="https://github.com/ohmangocat/animal_island_flutter">animal_island_flutter</a><br/><sub>Animal Crossing style Flutter UI library</sub>
  </td>
  <td align="center" width="33%">
    <br/>
    <img src="img/case-animal-blog.png" alt="animal-island-blog" style="border-radius: 8px; width: 90%; display: block; margin: 8px auto 0;" />
    <br/><a href="https://github.com/guokaigdg/animal-island-blog">animal-island-blog</a><br/><sub>Animal Crossing style blog</sub>
  </td>
  <td align="center" width="33%">
    <br/>
    <img src="img/island-life-journal.png" alt="island-life-journal" style="border-radius: 8px; width: 90%; display: block; margin: 8px auto 0;" />
    <br/><a href="https://github.com/TIUCSIB/animal-island-blog">Island Life Journal</a><br/><sub>Island Life Photo Journal</sub>
  </td>
</tr>
</table>



## Notes

- This project is for personal learning, research, and non-commercial demonstration only. Any form of commercial use, resale, or profit-making activities is prohibited.
- Not for use in any commercial products, enterprise projects, external services, or paid templates.
- Users are solely responsible for any risks arising from the use of this component library.

## Copyright and Disclaimer

- This project is not an official Nintendo product and has no association, authorization, or cooperation with Nintendo Co., Ltd.
- The game name included in the project name is only a descriptive reference to the style and does not constitute trademark use or brand association.
- All interface styles are merely design inspiration references and do not constitute reproduction or infringement of the original work.
- If the copyright holder believes that related content is suspected of infringement, they can contact via email, and I will make rectifications or deletions immediately.

## Contact

For any questions or copyright-related communications, please contact via Issue or email.

## License

MIT
This project is released under the MIT open-source license, for learning use only. The author is not responsible for any legal issues or losses caused by the use of this library.
