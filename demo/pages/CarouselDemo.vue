<script setup lang="ts">
import { Carousel } from '@';
import type { CSSProperties } from 'vue';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

// 与 React demo 同款本地照片（同一套图片，仅 Vue 侧做了压缩）
// 显式 import 而非 import.meta.glob：slides 顺序固定，不依赖 glob 键序
import hillsideTown from '../assets/images/hillside-town.jpg';
import sunnyField from '../assets/images/sunny-field.jpg';
import lakeMorning from '../assets/images/lake-morning.jpg';

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

const slides = [
    { src: hillsideTown, title: '山坡小筑', desc: '沿坡而建的小镇，屋顶连成一片暖色。' },
    { src: sunnyField, title: '阳光田野', desc: '风掠过田野，草浪一层层推向天边。' },
    { src: lakeMorning, title: '晨光湖面', desc: '湖面倒映天光，晨雾如薄纱浮在水上。' },
];

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
