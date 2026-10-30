<script setup lang="ts">
import { Image, type ImageColor } from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

/**
 * 演示照片池：动态引入 demo/assets/images 下全部照片，每次刷新随机洗牌后展示
 * （本地打包，不依赖任何外部图床服务）
 */
const pictures = Object.values(import.meta.glob('../assets/images/*.{jpg,jpeg,png}', { eager: true })).map(
    (m) => (m as { default: string }).default
);

/** Fisher-Yates 洗牌，返回打乱后的新数组 */
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const photos = shuffle(pictures);
const pick = (i: number) => photos[i % Math.max(photos.length, 1)];

const IMAGE_COLORS: { color: ImageColor; label: string }[] = [
    { color: 'white', label: 'White 白色' },
    { color: 'default', label: 'Default 奶油色' },
    { color: 'app-pink', label: 'App Pink 应用粉' },
    { color: 'purple', label: 'Purple 紫色' },
    { color: 'app-blue', label: 'App Blue 应用蓝' },
    { color: 'app-yellow', label: 'App Yellow 应用黄' },
    { color: 'app-orange', label: 'App Orange 应用橙' },
    { color: 'app-teal', label: 'App Teal 应用青' },
    { color: 'app-green', label: 'App Green 应用绿' },
    { color: 'app-red', label: 'App Red 应用红' },
    { color: 'lime-green', label: 'Lime Green 青柠绿' },
    { color: 'yellow-green', label: 'Yellow-Green 黄绿色' },
    { color: 'brown', label: 'Brown 棕色' },
    { color: 'warm-peach-pink', label: 'Warm Peach Pink 暖桃粉' },
];

const IMAGE_API: ApiRow[] = [
    { prop: 'src', desc: '图片地址', type: 'string', defaultVal: '-', required: true },
    { prop: 'alt', desc: '图片替代文本（无障碍）；留空表示装饰性图片', type: 'string', defaultVal: "''" },
    { prop: 'width', desc: '图片宽度', type: 'number | string', defaultVal: '-' },
    { prop: 'height', desc: '图片高度', type: 'number | string', defaultVal: '-' },
    {
        prop: 'color',
        desc: "背景颜色（Card pattern 同款底色，无花纹；white 为纯白；仅 variant='bordered' 时生效）",
        type: "'white' | 'default' | 'app-pink' | 'purple' | 'app-blue' | 'app-yellow' | 'app-orange' | 'app-teal' | 'app-green' | 'app-red' | 'lime-green' | 'yellow-green' | 'brown' | 'warm-peach-pink'",
        defaultVal: "'white'",
    },
    {
        prop: 'variant',
        desc: "相框类型：'default' 卡片大阴影+大圆角（默认），'bordered' 柔和阴影+小圆角，'stamp' 邮票齿孔边框",
        type: "'default' | 'bordered' | 'stamp'",
        defaultVal: "'default'",
    },
    {
        prop: 'stampYear',
        desc: "邮票类型（variant='stamp'）下的发行年份，印在右上角照片上（如「2026」）",
        type: 'string',
        defaultVal: '-',
    },
    { prop: 'lazy', desc: '是否启用懒加载', type: 'boolean', defaultVal: 'false' },
    {
        prop: 'preview',
        desc: '点击图片弹出大图预览（默认开启；支持 ESC / 点击遮罩 / 关闭按钮）',
        type: 'boolean',
        defaultVal: 'true',
    },
    { prop: 'load', desc: '图片加载完成回调', type: '(event: Event) => void', defaultVal: '-' },
    { prop: 'error', desc: '图片加载失败回调', type: '(event: Event) => void', defaultVal: '-' },
    { prop: 'class', desc: '自定义类名（合并到相框）', type: 'string', defaultVal: '-' },
    { prop: 'style', desc: '自定义样式（合并到相框）', type: 'CSSProperties', defaultVal: '-' },
];

const code = `import { Image } from 'animal-island-vue';

// 基础用法
<Image src="/photo.png" alt="岛屿风景" :width="200" :height="150" />

// 相框类型：default（默认，大阴影） / bordered（边框，原样式） / stamp（邮票齿孔）
<Image src="/photo.png" alt="默认类型" :width="200" :height="150" variant="default" />
<Image src="/photo.png" alt="边框类型" :width="200" :height="150" variant="bordered" />

// 邮票类型：四周齿孔 + 暖白底纸，可选 stampYear 印发行年份
<Image src="/photo.png" alt="邮票（带年份）" :width="210" :height="154" variant="stamp" stamp-year="2026" />
// 仅齿孔边框，不印文字
<Image src="/photo.png" alt="纯邮票边框" :width="210" :height="154" variant="stamp" />

// 懒加载
<Image src="/photo.png" alt="懒加载" :width="240" :height="150" lazy />

// 点击预览：弹出大图
<Image src="/photo.png" alt="预览" :width="200" :height="130" preview />

// 失败占位：加载失败显示内置占位
<Image src="/broken.png" alt="失败" :width="140" :height="140" />`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Image <span :style="tagStyle">图片</span> <span :style="tagStyle">13 props</span>
        </div>
        <div :style="demoBodyStyle">
            <!-- 点击预览 -->
            <div :style="labelStyle">点击预览（preview 默认开启，点击图片弹出大图，ESC / 遮罩 / 关闭按钮均可关闭）</div>
            <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap">
                <Image :src="pick(0)" alt="点击预览大图" :width="330" :height="200" preview lazy />
            </div>

            <!-- 相框类型 -->
            <div :style="labelStyle">
                相框类型（variant）— <code style="color: #a09080">default</code> 卡片大阴影+大圆角（默认），
                <code style="color: #a09080">bordered</code> 柔和阴影+小圆角（原样式）
            </div>
            <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap">
                <div style="text-align: center">
                    <Image :src="pick(1)" alt="默认类型" :width="330" :height="200" variant="default" lazy />
                    <div style="font-size: 12px; color: #a0936e; margin-top: 6px">default（默认）</div>
                </div>
                <div style="text-align: center">
                    <Image :src="pick(2)" alt="边框类型" :width="330" :height="200" variant="bordered" lazy />
                    <div style="font-size: 12px; color: #a0936e; margin-top: 6px">bordered（边框）</div>
                </div>
            </div>

            <!-- 邮票类型 -->
            <div :style="labelStyle">
                邮票类型（variant=&quot;stamp&quot;）— 四周齿孔 + 暖白底纸 + 半色调网点；可选
                <code style="color: #a09080">stampYear</code> 在右上角印发行年份
            </div>
            <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap">
                <div style="text-align: center">
                    <Image
                        :src="pick(1)"
                        alt="邮票（带年份）"
                        :width="210"
                        :height="154"
                        variant="stamp"
                        stamp-year="2026"
                        lazy
                    />
                    <div style="font-size: 12px; color: #a0936e; margin-top: 6px">带年份</div>
                </div>
                <div style="text-align: center">
                    <Image :src="pick(2)" alt="纯邮票边框" :width="210" :height="154" variant="stamp" lazy />
                    <div style="font-size: 12px; color: #a0936e; margin-top: 6px">仅齿孔边框（无文字）</div>
                </div>
            </div>

            <!-- 基础用法 -->
            <div :style="labelStyle">基础用法（自定义宽高）</div>
            <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap">
                <Image :src="pick(3)" alt="林间溪流" :width="330" :height="200" lazy />
                <Image :src="pick(4)" alt="阳光田野" :width="480" :height="300" lazy />
            </div>

            <!-- 背景颜色 -->
            <div :style="labelStyle">背景颜色（color，Card pattern 同款底色，无花纹）</div>
            <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap">
                <div v-for="(c, i) in IMAGE_COLORS" :key="c.color" style="text-align: center">
                    <Image
                        :src="pick(i + 5)"
                        :alt="c.label"
                        :width="300"
                        :height="200"
                        :color="c.color"
                        variant="bordered"
                        lazy
                    />
                    <div style="font-size: 12px; color: #a0936e; margin-top: 6px">{{ c.label }}</div>
                </div>
            </div>

            <!-- 懒加载 -->
            <div :style="labelStyle">懒加载（lazy，滚动到视口附近才加载）</div>
            <Image :src="pick(4)" alt="晨光湖面" :width="360" :height="230" lazy />

            <!-- 错误占位 -->
            <div :style="labelStyle">错误占位（加载失败时显示占位）</div>
            <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap">
                <Image src="./no-such-image.png" alt="加载失败" :width="210" :height="210" />
            </div>
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="IMAGE_API" />
    </div>
</template>
