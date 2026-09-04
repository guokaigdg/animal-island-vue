<script setup lang="ts">
import { Carousel } from '@';
import type { CSSProperties } from 'vue';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const CAROUSEL_API: ApiRow[] = [
    { prop: 'default slot', desc: '轮播内容，每个直接子元素为一张', type: 'VNode', defaultVal: '-', required: true },
    { prop: 'modelValue', desc: '当前索引（v-model，受控）', type: 'number', defaultVal: '-' },
    { prop: 'defaultActiveIndex', desc: '初始索引（非受控）', type: 'number', defaultVal: '0' },
    { prop: 'change', desc: '切换回调', type: '(index: number) => void', defaultVal: '-' },
    { prop: 'autoplay', desc: '自动播放', type: 'boolean', defaultVal: 'false' },
    { prop: 'interval', desc: '自动播放间隔（ms）', type: 'number', defaultVal: '3000' },
    { prop: 'loop', desc: '首尾循环', type: 'boolean', defaultVal: 'true' },
    { prop: 'showArrows', desc: '显示箭头', type: 'boolean', defaultVal: 'true' },
    { prop: 'showDots', desc: '显示圆点指示器', type: 'boolean', defaultVal: 'true' },
    { prop: 'pauseOnHover', desc: '悬停或聚焦时暂停', type: 'boolean', defaultVal: 'true' },
];

// 岛屿风景图池（生成接口 URL），demo 加载时随机抽取 3 张
const IMAGE_POOL: { src: string; title: string; desc: string }[] = [
    {
        src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animal%20crossing%20island%20landscape%20vibrant%20green%20grass%20blue%20sky%20cherry%20blossoms%20nintendo%20style&image_size=landscape_16_9',
        title: '岛屿全景',
        desc: '樱花盛开的清晨，草地与蓝天连成一片。',
    },
    {
        src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animal%20crossing%20museum%20interior%20warm%20lighting%20fossils%20art%20gallery&image_size=landscape_16_9',
        title: '博物馆',
        desc: '暖光下的化石展厅与艺术画廊。',
    },
    {
        src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animal%20crossing%20beach%20sunset%20palm%20trees%20coconut%20nintendo%20cute&image_size=landscape_16_9',
        title: '日落海滩',
        desc: '棕榈树影里的椰子与晚霞。',
    },
    {
        src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animal%20crossing%20winter%20snow%20christmas%20lights%20cozy%20village&image_size=landscape_16_9',
        title: '冬日雪镇',
        desc: '彩灯点缀的雪夜小村庄。',
    },
    {
        src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animal%20crossing%20fishing%20river%20peaceful%20nature%20nintendo&image_size=landscape_16_9',
        title: '河畔垂钓',
        desc: '流水潺潺，静候鱼儿上钩。',
    },
    {
        src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animal%20crossing%20villagers%20singing%20together%20happy%20nintendo%20cute&image_size=landscape_16_9',
        title: '广场合唱',
        desc: '村民们围在一起快乐地歌唱。',
    },
    {
        src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animal%20crossing%20campfire%20night%20starry%20sky%20cozy%20tent%20nintendo%20style&image_size=landscape_16_9',
        title: '星空营火',
        desc: '繁星下的营火与帐篷。',
    },
    {
        src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animal%20crossing%20flower%20garden%20tulips%20roses%20colorful%20hybrid%20flowers%20nintendo&image_size=landscape_16_9',
        title: '花圃培育',
        desc: '郁金香与玫瑰交织的缤纷花园。',
    },
    {
        src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animal%20crossing%20wooden%20bridge%20over%20river%20waterfall%20lush%20forest%20nintendo&image_size=landscape_16_9',
        title: '森林木桥',
        desc: '瀑布溪流上的小木桥。',
    },
    {
        src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animal%20crossing%20fruit%20orchard%20apple%20orange%20peach%20trees%20sunny%20nintendo&image_size=landscape_16_9',
        title: '果树园',
        desc: '苹果、橙子与桃树挂满枝头。',
    },
    {
        src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animal%20crossing%20lighthouse%20ocean%20cliff%20seagulls%20blue%20sky%20nintendo%20cute&image_size=landscape_16_9',
        title: '海边灯塔',
        desc: '悬崖上的灯塔与盘旋的海鸥。',
    },
    {
        src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animal%20crossing%20festival%20fireworks%20night%20sky%20lanterns%20celebration%20nintendo&image_size=landscape_16_9',
        title: '烟火大会',
        desc: '夜空中的烟花与升起的灯笼。',
    },
    {
        src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animal%20crossing%20cafe%20interior%20cozy%20coffee%20wooden%20furniture%20warm%20nintendo&image_size=landscape_16_9',
        title: '岛咖暖屋',
        desc: '木家具与咖啡香的小馆。',
    },
    {
        src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animal%20crossing%20hot%20air%20balloon%20sky%20adventure%20clouds%20colorful%20nintendo&image_size=landscape_16_9',
        title: '热气球之旅',
        desc: '乘着彩色的热气球穿过云海。',
    },
];

const slides = [...IMAGE_POOL].sort(() => Math.random() - 0.5).slice(0, 3);

const slideStyle = (src: string): CSSProperties => ({
    minHeight: '360px',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '28px',
    boxSizing: 'border-box',
    color: '#fff9e3',
    background: `linear-gradient(0deg, rgba(43,33,24,.72), transparent 62%), url(${src}) center / cover`,
});

const code = `import { Carousel } from 'animal-island-vue';

<Carousel autoplay :interval="3500" aria-label="岛屿照片">
    <img src="/beach.jpg" alt="海滩" />
    <img src="/plaza.jpg" alt="广场" />
    <img src="/museum.jpg" alt="博物馆" />
</Carousel>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Carousel <span :style="tagStyle">轮播图</span> <span :style="tagStyle">键盘可用</span>
        </div>
        <div :style="demoBodyStyle">
            <div :style="labelStyle">自动播放（悬停或聚焦时暂停）</div>
            <Carousel autoplay :interval="3500" aria-label="岛屿风景" style="max-width: 760px">
                <div v-for="slide in slides" :key="slide.title" :style="slideStyle(slide.src)">
                    <div style="padding-bottom: 30px">
                        <div style="font-size: 26px; font-weight: 900">{{ slide.title }}</div>
                        <div style="margin-top: 6px; font-size: 14px; font-weight: 600">{{ slide.desc }}</div>
                    </div>
                </div>
            </Carousel>
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="CAROUSEL_API" />
    </div>
</template>
