<script setup lang="ts">
import { computed } from 'vue';
import { Typewriter } from '../src';
import { PAGE_INFO } from './pageInfo';
import ButtonDemo from './pages/ButtonDemo.vue';
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
    tabs: TabsDemo,
    footer: FooterDemo,
    codeblock: CodeBlockDemo,
    loading: LoadingDemo,
    table: TableDemo,
    time: TimeDemo,
    phone: PhoneDemo,
    'wedding-invitation': WeddingInvitationDemo,
};

const info = computed(() => PAGE_INFO[props.activeKey]);
const PageComponent = computed(() => PAGES[props.activeKey] ?? null);
</script>

<template>
    <template v-if="info && PageComponent">
        <div class="page-title">{{ info.title }}</div>
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
.page-title {
    font-size: 24px;
    font-weight: 700;
    color: #794f27;
    margin-bottom: 12px;
    line-height: 1.4;
}
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

