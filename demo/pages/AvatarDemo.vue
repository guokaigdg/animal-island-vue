<script setup lang="ts">
import { ref } from 'vue';
import { Avatar, AvatarGroup, Radio, type AvatarShape } from '@';
import {
    UserIcon,
    FishIcon,
    CoffeeIcon,
    RabbitIcon,
    OwlIcon,
    CameraIcon,
    SunIcon,
    RainbowIcon,
    CloudIcon,
    StarIcon,
    LeafIcon,
    MushroomIcon,
    StrawberryIcon,
    DonutIcon,
    IcecreamIcon,
    BalloonIcon,
    RocketIcon,
    SailboatIcon,
    MusicIcon,
    HeartIcon,
} from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

/** 演示照片池：复用 text_to_image 生成的头像风格图（square），裁切展示 */
const pictures = [
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=island%20villager%20cartoon%20cute%20smile%20portrait&image_size=square',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cat%20cartoon%20portrait%20cute%20island&image_size=square',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rabbit%20cartoon%20portrait%20cute%20island&image_size=square',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bird%20cartoon%20portrait%20cute%20island&image_size=square',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=island%20sunny%20beach%20cute%20landscape&image_size=square',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flower%20meadow%20sunny%20cute%20landscape&image_size=square',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=night%20starry%20sky%20moon%20cute%20landscape&image_size=square',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lake%20morning%20dawn%20cute%20landscape&image_size=square',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mountain%20village%20sunny%20cute%20landscape&image_size=square',
];
const pick = (i: number) => pictures[i % pictures.length];

const AVATAR_API: ApiRow[] = [
    {
        prop: 'shape',
        desc: "形状：'circle' 圆形（默认） / 'square' 圆角方形",
        type: `'circle' | 'square'`,
        defaultVal: "'circle'",
    },
    {
        prop: 'size',
        desc: "尺寸：'small' / 'middle' / 'large' 预设，或任意像素数值",
        type: `number | 'small' | 'middle' | 'large'`,
        defaultVal: "'middle'",
    },
    { prop: 'src', desc: '图片地址；加载失败自动回退到图标 / 文字', type: 'string', defaultVal: '-' },
    { prop: 'alt', desc: '图片替代文本（无障碍）', type: 'string', defaultVal: '-' },
    { prop: 'icon', desc: '图标占位：src 为空或加载失败时展示', type: 'VNode', defaultVal: '用户图标' },
    {
        prop: 'gap',
        desc: '文字 / 图标与头像边界的间距（px），文字过宽时按比例自动缩小字号',
        type: 'number',
        defaultVal: '4',
    },
    {
        prop: 'onError',
        desc: '图片加载失败回调；返回 false 可阻止回退到占位内容',
        type: '() => boolean',
        defaultVal: '-',
    },
    {
        prop: 'default',
        desc: '头像内容：文字作为文字头像；传入图标组件时创建图标头像',
        type: 'slot',
        defaultVal: '-',
    },
];

const GROUP_API: ApiRow[] = [
    { prop: 'maxCount', desc: '最多显示的头像数量，超出部分折叠为 "+N"', type: 'number', defaultVal: '-' },
    { prop: 'maxStyle', desc: '折叠 "+N" 头像的自定义样式', type: 'CSSProperties', defaultVal: '-' },
    {
        prop: 'size',
        desc: '传递给子 Avatar 的尺寸（子级未显式指定时生效）',
        type: `number | 'small' | 'middle' | 'large'`,
        defaultVal: '-',
    },
    { prop: 'shape', desc: '传递给子 Avatar 的形状', type: `'circle' | 'square'`, defaultVal: '-' },
    { prop: 'gap', desc: '头像组内头像间距（px），头像间相互叠加', type: 'number', defaultVal: '8' },
];

/** 图标头像展示：20 个内置图标作为 children 创建图标头像（动物 / 天气 / 食物 / 物件随机混合） */
const ICON_AVATARS = [
    UserIcon,
    FishIcon,
    CoffeeIcon,
    RabbitIcon,
    OwlIcon,
    CameraIcon,
    SunIcon,
    RainbowIcon,
    CloudIcon,
    StarIcon,
    LeafIcon,
    MushroomIcon,
    StrawberryIcon,
    DonutIcon,
    IcecreamIcon,
    BalloonIcon,
    RocketIcon,
    SailboatIcon,
    MusicIcon,
    HeartIcon,
];

const shape = ref<AvatarShape>('circle');

const rowStyle = { display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' as const };

const code = `<Avatar>岛</Avatar>
<Avatar icon={<UserIcon />} />
<Avatar src="/photo.png" alt="岛屿风景" />
<Avatar size={64}>64</Avatar>

<!-- 图标头像：图标组件直接作为 children -->
<Avatar>
    <FishIcon />
</Avatar>

<!-- 头像组：默认叠加，超出折叠为 +N -->
<AvatarGroup maxCount={3}>
    <Avatar src="/a.png" alt="A" />
    <Avatar src="/b.png" alt="B" />
    <Avatar>C</Avatar>
    <Avatar>D</Avatar>
</AvatarGroup>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">Avatar <span :style="tagStyle">头像</span></div>

        <div :style="labelStyle">基础用法 — 文字 / 图标 / 图片三种形态</div>
        <div :style="rowStyle">
            <Avatar>岛</Avatar>
            <Avatar>
                <FishIcon :size="22" />
            </Avatar>
            <Avatar :src="pick(0)" alt="岛屿岛民" />
        </div>

        <div :style="labelStyle">形状 — 圆形 / 方形</div>
        <div :style="{ marginBottom: '12px' }">
            <Radio
                v-model="shape"
                :options="[
                    { label: '圆形', value: 'circle' },
                    { label: '方形', value: 'square' },
                ]"
            />
        </div>
        <div :style="rowStyle">
            <Avatar :shape="shape">岛</Avatar>
            <Avatar :shape="shape">
                <UserIcon :size="22" />
            </Avatar>
            <Avatar :shape="shape" :src="pick(4)" alt="阳光田野" />
            <Avatar :shape="shape" size="large" :src="pick(5)" alt="湖畔清晨" />
        </div>

        <div :style="labelStyle">头像组 — 叠加展示 + 超出折叠</div>
        <div :style="rowStyle">
            <AvatarGroup>
                <Avatar :src="pick(0)" alt="岛民 A" />
                <Avatar :src="pick(1)" alt="岛民 B" />
                <Avatar :src="pick(2)" alt="岛民 C" />
                <Avatar :src="pick(3)" alt="岛民 D" />
            </AvatarGroup>
            <AvatarGroup :max-count="3">
                <Avatar :src="pick(4)" alt="岛民 E" />
                <Avatar :src="pick(5)" alt="岛民 F" />
                <Avatar :src="pick(0)" alt="岛民 J" />
                <Avatar :src="pick(1)" alt="岛民 K" />
            </AvatarGroup>
            <AvatarGroup size="small" shape="square" :gap="12">
                <Avatar :src="pick(6)" alt="岛民 G" />
                <Avatar :src="pick(7)" alt="岛民 H" />
                <Avatar :src="pick(8)" alt="岛民 I" />
            </AvatarGroup>
        </div>

        <div :style="labelStyle">尺寸 — 预设三档 + 任意数值</div>
        <div :style="{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }">
            <Avatar size="small">S</Avatar>
            <Avatar size="middle">M</Avatar>
            <Avatar size="large">L</Avatar>
            <Avatar :size="64">64</Avatar>
            <Avatar :size="96" :src="pick(3)" alt="山间小镇" />
        </div>

        <div :style="labelStyle">加载失败 — 自动回退到图标 / 文字</div>
        <div :style="rowStyle">
            <Avatar src="/broken-avatar.png">
                <UserIcon :size="22" />
            </Avatar>
            <Avatar src="/broken-avatar.png">岛</Avatar>
        </div>

        <div :style="labelStyle">图标头像 — 20 个内置图标作为 children</div>
        <div :style="{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }">
            <Avatar v-for="(Icon, i) in ICON_AVATARS" :key="i" size="middle">
                <component :is="Icon" :size="22" />
            </Avatar>
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="AVATAR_API" />
        <ApiTable :rows="GROUP_API" />
    </div>
</template>