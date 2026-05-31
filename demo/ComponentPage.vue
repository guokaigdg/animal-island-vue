<script setup lang="ts">
import { computed } from 'vue';
import { Typewriter, Title } from '../src';
import type { TitleColor } from '../src';
import { PAGE_INFO } from './pageInfo';
import ButtonDemo from './pages/ButtonDemo.vue';
import TitleDemo from './pages/TitleDemo.vue';
import InputDemo from './pages/InputDemo.vue';
import SwitchDemo from './pages/SwitchDemo.vue';
import CardDemo from './pages/CardDemo.vue';
import CollapseDemo from './pages/CollapseDemo.vue';
import CursorDemo from './pages/CursorDemo.vue';
import ModalDemo from './pages/ModalDemo.vue';
import TypewriterDemo from './pages/TypewriterDemo.vue';
import DividerDemo from './pages/DividerDemo.vue';
import IconDemo from './pages/IconDemo.vue';
import SelectDemo from './pages/SelectDemo.vue';
import CheckboxDemo from './pages/CheckboxDemo.vue';
import RadioDemo from './pages/RadioDemo.vue';
import TooltipDemo from './pages/TooltipDemo.vue';
import TabsDemo from './pages/TabsDemo.vue';
import FooterDemo from './pages/FooterDemo.vue';
import CodeBlockDemo from './pages/CodeBlockDemo.vue';
import LoadingDemo from './pages/LoadingDemo.vue';
import TableDemo from './pages/TableDemo.vue';
import TimeDemo from './pages/TimeDemo.vue';
import PhoneDemo from './pages/PhoneDemo.vue';
import WeddingInvitationDemo from './pages/WeddingInvitationDemo.vue';

const props = defineProps<{ activeKey: string }>();

const PAGES: Record<string, unknown> = {
    button: ButtonDemo,
    title: TitleDemo,
    input: InputDemo,
    switch: SwitchDemo,
    card: CardDemo,
    collapse: CollapseDemo,
    cursor: CursorDemo,
    modal: ModalDemo,
    typewriter: TypewriterDemo,
    'divider-comp': DividerDemo,
    icon: IconDemo,
    select: SelectDemo,
    checkbox: CheckboxDemo,
    radio: RadioDemo,
    tooltip: TooltipDemo,
    tabs: TabsDemo,
    footer: FooterDemo,
    codeblock: CodeBlockDemo,
    loading: LoadingDemo,
    table: TableDemo,
    time: TimeDemo,
    phone: PhoneDemo,
    'wedding-invitation': WeddingInvitationDemo,
};

// 与 React 版同款：根据 activeKey 哈希固定映射颜色，同页面不抖动
const TITLE_COLORS: TitleColor[] = [
    'lime-green', 'default', 'app-pink', 'purple', 'app-blue', 'app-yellow',
    'app-orange', 'app-red', 'yellow-green', 'brown', 'warm-peach-pink',
];

const titleColor = computed<TitleColor>(() => {
    const sum = props.activeKey.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return TITLE_COLORS[Math.abs(sum) % TITLE_COLORS.length];
});

const info = computed(() => PAGE_INFO[props.activeKey]);
const PageComponent = computed(() => PAGES[props.activeKey] ?? null);
</script>

<template>
    <template v-if="info && PageComponent">
        <Title
            size="large"
            :color="titleColor"
            :style="{ marginBottom: '30px', marginLeft: '18px' }"
        >
            {{ info.title }}
        </Title>
        <div class="page-desc">
            <Typewriter :key="activeKey" :trigger="activeKey" :speed="30">
                {{ info.desc }}
            </Typewriter>
        </div>
        <component :is="PageComponent" />
    </template>
    <div v-else class="not-found">
        <h2>未找到对应组件</h2>
        <p>activeKey = {{ activeKey }}</p>
    </div>
</template>

<style scoped>
.page-desc {
    font-size: 14px;
    color: #794f27;
    margin-bottom: 20px;
    min-height: 40px;
}
.not-found {
    padding: 48px;
    text-align: center;
    color: #7c5734;
}
</style>
