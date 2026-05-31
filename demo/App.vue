<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Cursor, Loading } from '../src';
import HomePage from './HomePage.vue';
import ComponentPage from './ComponentPage.vue';
import { PAGE_INFO } from './pageInfo';
import { useHash, useIsMobile } from './router';

import nook1Url from './img/nook-phone/nook1.svg';
import contentBgUrl from './img/content_bg_pc.jpg';
import menuBgUrl from './img/menu_bg.svg';
import homeBgUrl from './img/home_bg.webp';
import guideLineUrl from './img/guide-bg-line.webp';

interface MenuChild { key: string; label: string; isNew?: boolean }
interface MenuItem { key: string; label: string; children?: MenuChild[] }

const MENU_ITEMS: MenuItem[] = [
    {
        key: 'cat-basic',
        label: '── 基础组件 ──',
        children: [
            { key: 'title', label: 'Title 标题', isNew: true },
            { key: 'button', label: 'Button 按钮' },
            { key: 'input', label: 'Input 输入框' },
            { key: 'switch', label: 'Switch 开关' },
            { key: 'card', label: 'Card 卡片' },
            { key: 'collapse', label: 'Collapse 折叠面板' },
            { key: 'cursor', label: 'Cursor 光标' },
            { key: 'modal', label: 'Modal 弹窗' },
            { key: 'typewriter', label: 'Typewriter 打字机' },
            { key: 'divider-comp', label: 'Divider 分割线' },
            { key: 'icon', label: 'Icon 图标' },
            { key: 'select', label: 'Select 选择器' },
            { key: 'checkbox', label: 'Checkbox 多选框' },
            { key: 'radio', label: 'Radio 单选框' },
            { key: 'tooltip', label: 'Tooltip 气泡提示' },
            { key: 'tabs', label: 'Tabs 标签页' },
            { key: 'footer', label: 'Footer 页脚' },
            { key: 'codeblock', label: 'CodeBlock 代码高亮' },
            { key: 'loading', label: 'Loading 加载', isNew: true },
            { key: 'table', label: 'Table 表格' },
        ],
    },
    {
        key: 'cat-complex',
        label: '── 复杂组件 ──',
        children: [
            { key: 'time', label: 'Time 时间' },
            { key: 'phone', label: 'Phone 手机' },
            { key: 'wedding-invitation', label: 'Wedding 婚礼请柬', isNew: true },
        ],
    },
];

const { hash, navigate } = useHash();
const isMobile = useIsMobile();
const drawerOpen = ref(false);
const loadingActive = ref(false);
const loadingMounted = ref(false);
const mainRef = ref<HTMLElement | null>(null);

const activeKey = computed(() => {
    const v = hash.value;
    return v.startsWith('/') && v.length > 1 ? v.slice(1) : 'home';
});
const isHomePage = computed(() => activeKey.value === 'home');

watch(isMobile, v => { if (!v) drawerOpen.value = false; });
watch(activeKey, () => {
    drawerOpen.value = false;
    mainRef.value?.scrollTo({ top: 0 });
});

function handleNavigate(path: string) {
    navigate(path);
    drawerOpen.value = false;
}
function handleHomeNavigate(path: string) {
    loadingMounted.value = true;
    loadingActive.value = true;
    navigate(path);
    window.setTimeout(() => { loadingActive.value = false; }, 2000);
    window.setTimeout(() => { loadingMounted.value = false; }, 3500);
}

// 包装为完整 url() 值，避免 url(v-bind(...)) 被 css minifier 解析失败
const contentBgImage = `url("${contentBgUrl}")`;
const homeBgImage = `url("${homeBgUrl}")`;
const menuBgImage = `url("${menuBgUrl}")`;
</script>

<template>
    <Cursor>
        <!-- Home page — full screen, no sidebar -->
        <div v-if="isHomePage" class="layout home-bg" :style="{ justifyContent: 'center' }">
            <HomePage @navigate="handleHomeNavigate" />
        </div>

        <!-- Component page -->
        <div v-else class="layout">
            <!-- Desktop sidebar -->
            <aside v-if="!isMobile" class="sidebar">
                <div class="sidebar-header" @click="handleNavigate('/')">
                    <img :src="nook1Url" class="sidebar-logo" alt="nook" />
                    集合啦！Animal
                </div>
                <nav class="menu-list">
                    <template v-for="item in MENU_ITEMS" :key="item.key">
                        <div v-if="item.children">
                            <div class="cat-label">{{ item.label }}</div>
                            <div v-for="child in item.children" :key="child.key" class="menu-item"
                                :class="{ active: activeKey === child.key }" @click="handleNavigate(`/${child.key}`)">
                                <span>{{ child.label }}</span>
                                <span v-if="child.isNew" class="menu-badge">NEW</span>
                            </div>
                        </div>
                        <div v-else class="menu-item" :class="{ active: activeKey === item.key }"
                            @click="handleNavigate(`/${item.key}`)">
                            <span>{{ item.label }}</span>
                        </div>
                    </template>
                </nav>
            </aside>

            <!-- Mobile top bar -->
            <div v-if="isMobile" class="mobile-bar">
                <button class="icon-btn" @click="navigate('/')">←</button>
                <span class="mobile-title">{{ PAGE_INFO[activeKey]?.title ?? '组件文档' }}</span>
                <button class="icon-btn" @click="drawerOpen = true">☰</button>
            </div>

            <!-- Mobile drawer -->
            <template v-if="isMobile && drawerOpen">
                <div class="drawer-mask" @click="drawerOpen = false" />
                <aside class="sidebar drawer">
                    <div class="sidebar-header" @click="handleNavigate('/')">
                        <img :src="nook1Url" class="sidebar-logo" alt="nook" />
                        集合啦！Animal
                    </div>
                    <nav class="menu-list">
                        <template v-for="item in MENU_ITEMS" :key="item.key">
                            <div v-if="item.children">
                                <div class="cat-label">{{ item.label }}</div>
                                <div v-for="child in item.children" :key="child.key" class="menu-item"
                                    :class="{ active: activeKey === child.key }"
                                    @click="handleNavigate(`/${child.key}`)">
                                    <span>{{ child.label }}</span>
                                    <span v-if="child.isNew" class="menu-badge">NEW</span>
                                </div>
                            </div>
                        </template>
                    </nav>
                </aside>
            </template>

            <main ref="mainRef" class="main" :style="{
                padding: isMobile ? '16px' : '32px 40px',
                paddingTop: isMobile ? '68px' : '32px',
            }">
                <ComponentPage :active-key="activeKey" />
            </main>

            <img v-if="!isMobile" :src="guideLineUrl" alt="" loading="lazy" decoding="async" class="guide-line" />
        </div>

        <!-- Loading transition -->
        <div v-if="loadingMounted" class="loading-overlay" :style="{ pointerEvents: loadingActive ? 'auto' : 'none' }">
            <Loading :active="loadingActive" />
        </div>
    </Cursor>
</template>

<style scoped>
@keyframes bgScroll {
    0% {
        background-position: 100% 0%;
    }

    100% {
        background-position: 0% 100%;
    }
}

.layout {
    display: flex;
    height: 100dvh;
    overflow: hidden;
    font-family: Nunito, 'Noto Sans SC', 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    background-image: v-bind(contentBgImage);
    background-position: center;
    background-size: auto;
    background-repeat: repeat;
}

.home-bg {
    background-image: v-bind(homeBgImage);
    background-color: #7DC395;
    background-position: 0 0;
    background-size: auto;
    background-repeat: repeat;
    animation: bgScroll 80s linear infinite;
}

.sidebar {
    width: 220px;
    min-width: 220px;
    background-image: v-bind(menuBgImage);
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.sidebar-header {
    padding: 20px 16px 12px;
    border-bottom: 1px solid #e8e2d6;
    font-weight: 700;
    font-size: 15px;
    color: #725d42;
    letter-spacing: -0.3px;
    display: flex;
    align-items: center;
    cursor: pointer;
}

.sidebar-logo {
    width: 24px;
    height: 24px;
    margin-right: 8px;
}

.menu-list {
    flex: 1;
    overflow: auto;
    padding: 8px 0;
}

.cat-label {
    padding: 12px 16px 4px;
    font-size: 11px;
    color: #a0936e;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin: 1px 5px;
    height: 40px;
    padding: 0 12px 0 26px;
    font-weight: 600;
    font-size: 14px;
    color: #8a7b66;
    background: transparent;
    border-radius: 12px;
    transition: all 0.15s;
    cursor: pointer;
}

.menu-item:hover {
    background: #d6dff0;
}

.menu-item.active {
    background: #B7C6E5;
    color: #fff;
}

.menu-item.active span {
    color: #fff;
}

.menu-badge {
    flex-shrink: 0;
    padding: 1px 7px;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.6px;
    color: #fff;
    background: linear-gradient(135deg, #fc736d, #f7825a);
    border-radius: 8px;
    line-height: 14px;
    box-shadow: 0 1px 0 rgba(114, 93, 66, 0.25);
    animation: badgePulse 1.8s ease-in-out infinite;
}

.menu-item.active .menu-badge {
    background: #fff;
    color: #fc736d;
    box-shadow: 0 1px 0 rgba(114, 93, 66, 0.15);
}

.menu-item.active .menu-badge {
    color: #fc736d;
}

@keyframes badgePulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.08);
    }
}

.main {
    flex: 1;
    overflow: auto;
    position: relative;
    z-index: 1;
}

.mobile-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    background: rgba(255, 252, 244, 0.92);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid #e8e2d6;
    z-index: 50;
}

.icon-btn {
    background: none;
    border: none;
    font-size: 20px;
    color: #725d42;
    padding: 4px 8px;
    border-radius: 8px;
    line-height: 1;
    cursor: pointer;
}

.mobile-title {
    font-weight: 700;
    font-size: 15px;
    color: #725d42;
}

.drawer-mask {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 98;
}

.drawer {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 240px;
    z-index: 99;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
}

.guide-line {
    position: fixed;
    left: 220px;
    right: 0;
    bottom: 0;
    width: calc(100% - 220px);
    pointer-events: none;
    z-index: 0;
}

.loading-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
}
</style>
