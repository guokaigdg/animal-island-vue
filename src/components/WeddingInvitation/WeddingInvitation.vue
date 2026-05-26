<script setup lang="ts">
import { ref, useSlots } from 'vue';
import { domToCanvas } from 'modern-screenshot';
// @ts-ignore
import weddingTitleImg from './wedding.PNG';
import iconMap from '../../assets/img/icons/icon-map.svg';
// @ts-ignore
import brideAndGroomImg from './img/brideandgroom.PNG';
import { injectWeddingFonts, prepareWeddingFontsForExport } from './fonts';
import type { WeddingInvitationProps, WeddingInvitationExpose } from './types';

// 模块加载即注入 @font-face —— 网页本身就用这套字体；
// 导出 PNG 时同一批字体会被转成 data URL 注入 SVG，确保渲染一致。
injectWeddingFonts();

const props = withDefaults(defineProps<WeddingInvitationProps>(), {
    groomName: '小狸',
    brideName: '小兔',
    date: '2026.06.15',
    weekday: '星期六',
    time: '10:00 AM',
    venue: '彩虹岛 · 樱花广场',
    address: '动物之森 · 无人岛 · K.K. 演奏台前',
    title: 'Wedding Invitation',
    subtitle: '',
    message: '哎呀，恭喜恭喜！我们要在小岛上举办婚礼啦~ 诚挚邀请您一同前来见证这个被花瓣和音符包围的日子！',
    showLotteryNumber: true,
    lotteryNumber: '0001',
    lotteryLabel: 'LUCKY NUMBER',
    lotteryHint: '凭此号码参与现场抽奖 · Keep this stub for the lucky draw',
});

const slots = useSlots();

// 与 LESS 中 --notch-r / --lottery-h 保持一致
const NOTCH_RADIUS = 14;
const LOTTERY_HEIGHT = 160;

const rootRef = ref<HTMLDivElement | null>(null);

// ============================================
// DOM → PNG（基于 modern-screenshot）
// 字体通过 ./fonts 模块统一管理：网页注入 url 版 @font-face；
// 导出时把同一批 woff2 转 data URL 塞进截图根节点 <style>，
// 解决 Chromium 在 SVG-as-image 渲染时不读 document.fonts 的问题。
// ============================================
const exportNodeAsPng = async (node: HTMLElement, filename: string, scale = 2): Promise<void> => {
    const fontCssText = await prepareWeddingFontsForExport();

    // 临时关掉 mask-image —— 用动态 calc 定位的 mask 在导出管线里位置会偏，
    // 改成下面用 canvas globalCompositeOperation 手动打孔
    const prevMask = node.style.maskImage;
    const prevWebkitMask = (node.style as unknown as { webkitMaskImage: string }).webkitMaskImage;
    node.style.maskImage = 'none';
    (node.style as unknown as { webkitMaskImage: string }).webkitMaskImage = 'none';

    // 必须把带 data URL 的 @font-face 作为 <style> 子节点塞进截图节点
    const fontStyleEl = document.createElement('style');
    fontStyleEl.setAttribute('data-wedding-export-fonts', '');
    fontStyleEl.textContent = fontCssText;
    node.insertBefore(fontStyleEl, node.firstChild);

    try {
        const canvas = await domToCanvas(node, {
            scale,
            backgroundColor: undefined,
            font: { cssText: fontCssText },
        });

        // 手动「打孔」两侧半圆缺口
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const r = NOTCH_RADIUS * scale;
            const y = canvas.height - LOTTERY_HEIGHT * scale;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            for (const x of [0, canvas.width]) {
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        const dataUrl = canvas.toDataURL('image/png');
        if (!dataUrl || dataUrl === 'data:,') {
            throw new Error('modern-screenshot 返回空 dataURL');
        }

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } finally {
        fontStyleEl.remove();
        node.style.maskImage = prevMask;
        (node.style as unknown as { webkitMaskImage: string }).webkitMaskImage = prevWebkitMask;
    }
};

const exportAsImage = async (filename = 'wedding-invitation'): Promise<void> => {
    if (!rootRef.value) return;
    await exportNodeAsPng(rootRef.value, filename);
};

const getElement = (): HTMLDivElement | null => rootRef.value;

defineExpose<WeddingInvitationExpose>({ exportAsImage, getElement });
</script>

<template>
    <div
        ref="rootRef"
        class="animal-wedding"
        :class="[{ 'animal-wedding--no-lottery': !props.showLotteryNumber }, props.class]"
        :style="props.style"
    >
        <!-- 边角装饰 -->
        <svg class="animal-wedding__corner-leaf animal-wedding__corner-leaf--tl" viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
            <path d="M8 56 C 8 24, 32 4, 60 6 C 58 36, 38 58, 8 56 Z" fill="#8ac68a" stroke="#3d5a1a" stroke-width="2.5" stroke-linejoin="round" />
            <path d="M14 50 C 26 40, 40 26, 56 12" stroke="#3d5a1a" stroke-width="2" fill="none" stroke-linecap="round" />
            <path d="M22 42 C 28 38, 32 34, 36 30" stroke="#3d5a1a" stroke-width="1.4" fill="none" stroke-linecap="round" />
            <path d="M30 48 C 34 44, 38 40, 42 36" stroke="#3d5a1a" stroke-width="1.4" fill="none" stroke-linecap="round" />
        </svg>
        <svg class="animal-wedding__corner-leaf animal-wedding__corner-leaf--tr" viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
            <path d="M8 56 C 8 24, 32 4, 60 6 C 58 36, 38 58, 8 56 Z" fill="#8ac68a" stroke="#3d5a1a" stroke-width="2.5" stroke-linejoin="round" />
            <path d="M14 50 C 26 40, 40 26, 56 12" stroke="#3d5a1a" stroke-width="2" fill="none" stroke-linecap="round" />
            <path d="M22 42 C 28 38, 32 34, 36 30" stroke="#3d5a1a" stroke-width="1.4" fill="none" stroke-linecap="round" />
            <path d="M30 48 C 34 44, 38 40, 42 36" stroke="#3d5a1a" stroke-width="1.4" fill="none" stroke-linecap="round" />
        </svg>
        <svg class="animal-wedding__corner-leaf animal-wedding__corner-leaf--bl" viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
            <path d="M8 56 C 8 24, 32 4, 60 6 C 58 36, 38 58, 8 56 Z" fill="#8ac68a" stroke="#3d5a1a" stroke-width="2.5" stroke-linejoin="round" />
            <path d="M14 50 C 26 40, 40 26, 56 12" stroke="#3d5a1a" stroke-width="2" fill="none" stroke-linecap="round" />
            <path d="M22 42 C 28 38, 32 34, 36 30" stroke="#3d5a1a" stroke-width="1.4" fill="none" stroke-linecap="round" />
            <path d="M30 48 C 34 44, 38 40, 42 36" stroke="#3d5a1a" stroke-width="1.4" fill="none" stroke-linecap="round" />
        </svg>
        <svg class="animal-wedding__corner-leaf animal-wedding__corner-leaf--br" viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
            <path d="M8 56 C 8 24, 32 4, 60 6 C 58 36, 38 58, 8 56 Z" fill="#8ac68a" stroke="#3d5a1a" stroke-width="2.5" stroke-linejoin="round" />
            <path d="M14 50 C 26 40, 40 26, 56 12" stroke="#3d5a1a" stroke-width="2" fill="none" stroke-linecap="round" />
            <path d="M22 42 C 28 38, 32 34, 36 30" stroke="#3d5a1a" stroke-width="1.4" fill="none" stroke-linecap="round" />
            <path d="M30 48 C 34 44, 38 40, 42 36" stroke="#3d5a1a" stroke-width="1.4" fill="none" stroke-linecap="round" />
        </svg>

        <!-- 飘散花瓣 / 星星 -->
        <span class="animal-wedding__float-item animal-wedding__float-item--f1">
            <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
                <ellipse v-for="a in [0, 72, 144, 216, 288]" :key="a" cx="16" cy="8" rx="5" ry="7" fill="#f8a6b2" stroke="#725d42" stroke-width="1.2" :transform="`rotate(${a} 16 16)`" />
                <circle cx="16" cy="16" r="3.5" fill="#f7cd67" stroke="#725d42" stroke-width="1.2" />
            </svg>
        </span>
        <span class="animal-wedding__float-item animal-wedding__float-item--f2">
            <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
                <ellipse v-for="a in [0, 72, 144, 216, 288]" :key="a" cx="16" cy="8" rx="5" ry="7" fill="#ecdf52" stroke="#725d42" stroke-width="1.2" :transform="`rotate(${a} 16 16)`" />
                <circle cx="16" cy="16" r="3.5" fill="#e59266" stroke="#725d42" stroke-width="1.2" />
            </svg>
        </span>
        <span class="animal-wedding__float-item animal-wedding__float-item--f3">
            <svg viewBox="0 0 32 32" width="20" height="20" aria-hidden="true">
                <ellipse v-for="a in [0, 72, 144, 216, 288]" :key="a" cx="16" cy="8" rx="5" ry="7" fill="#b77dee" stroke="#725d42" stroke-width="1.2" :transform="`rotate(${a} 16 16)`" />
                <circle cx="16" cy="16" r="3.5" fill="#f7cd67" stroke="#725d42" stroke-width="1.2" />
            </svg>
        </span>
        <span class="animal-wedding__float-item animal-wedding__float-item--s1">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M12 2 L14.5 9 L22 9.5 L16 14.5 L18 22 L12 17.5 L6 22 L8 14.5 L2 9.5 L9.5 9 Z" fill="#f7cd67" stroke="#725d42" stroke-width="1.4" stroke-linejoin="round" />
            </svg>
        </span>
        <span class="animal-wedding__float-item animal-wedding__float-item--s2">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                <path d="M12 2 L14.5 9 L22 9.5 L16 14.5 L18 22 L12 17.5 L6 22 L8 14.5 L2 9.5 L9.5 9 Z" fill="#82d5bb" stroke="#725d42" stroke-width="1.4" stroke-linejoin="round" />
            </svg>
        </span>

        <div class="animal-wedding__banner">
            <span class="animal-wedding__banner-line" />
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M12 2 L14.5 9 L22 9.5 L16 14.5 L18 22 L12 17.5 L6 22 L8 14.5 L2 9.5 L9.5 9 Z" fill="#f7cd67" stroke="#725d42" stroke-width="1.4" stroke-linejoin="round" />
            </svg>
            <span class="animal-wedding__banner-line" />
        </div>

        <div class="animal-wedding__title-en">
            <slot name="title">{{ props.title }}</slot>
        </div>
        <div class="animal-wedding__title-zh">
            <slot name="subtitle">
                <template v-if="props.subtitle">{{ props.subtitle }}</template>
                <img v-else :src="weddingTitleImg" alt="集合啦 婚礼森友会" />
            </slot>
        </div>

        <div class="animal-wedding__bride-and-groom">
            <img :src="brideAndGroomImg" alt="bride and groom" />
        </div>

        <div class="animal-wedding__couple-row">
            <div class="animal-wedding__mascot">
                <div class="animal-wedding__name">{{ props.brideName }}</div>
            </div>
            <div class="animal-wedding__heart-col">
                <svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true">
                    <path d="M32 56 C 8 40, 4 22, 16 14 C 24 9, 30 14, 32 20 C 34 14, 40 9, 48 14 C 60 22, 56 40, 32 56 Z" fill="#fc736d" stroke="#725d42" stroke-width="2.5" stroke-linejoin="round" />
                    <ellipse cx="22" cy="22" rx="3.5" ry="5" fill="#fff" opacity="0.7" transform="rotate(-25 22 22)" />
                </svg>
            </div>
            <div class="animal-wedding__mascot">
                <div class="animal-wedding__name">{{ props.groomName }}</div>
            </div>
        </div>

        <div class="animal-wedding__date-card">
            <div class="animal-wedding__date-label">婚礼时间</div>
            <div class="animal-wedding__date-value">{{ props.date }}</div>
            <div class="animal-wedding__date-meta">
                <span>{{ props.weekday }}</span>
                <span class="animal-wedding__dot">·</span>
                <span>{{ props.time }}</span>
            </div>
        </div>

        <div class="animal-wedding__venue-card">
            <span class="animal-wedding__venue-icon">
                <img :src="iconMap" alt="venue" width="26" height="26" />
            </span>
            <div class="animal-wedding__venue-text">
                <div class="animal-wedding__venue-name">{{ props.venue }}</div>
                <div class="animal-wedding__venue-addr">{{ props.address }}</div>
            </div>
        </div>

        <div class="animal-wedding__message">
            <slot name="message">{{ props.message }}</slot>
        </div>

        <template v-if="props.showLotteryNumber">
            <div class="animal-wedding__signature-lottery">
                <span>抽奖码</span>
                <span class="animal-wedding__signature-lottery-no">
                    <span class="animal-wedding__lottery-hash">NO.</span>{{ props.lotteryNumber }}
                </span>
            </div>

            <div class="animal-wedding__lottery">
                <span class="animal-wedding__tear-hint">
                    <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
                        <g fill="none" stroke="#725d42" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="6" cy="6" r="2.4" />
                            <circle cx="6" cy="18" r="2.4" />
                            <path d="M8 7.5 L21 17 M8 16.5 L21 7" />
                        </g>
                    </svg>
                    <span>沿虚线剪开</span>
                    <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
                        <g fill="none" stroke="#725d42" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="6" cy="6" r="2.4" />
                            <circle cx="6" cy="18" r="2.4" />
                            <path d="M8 7.5 L21 17 M8 16.5 L21 7" />
                        </g>
                    </svg>
                </span>
                <div class="animal-wedding__lottery-title">婚礼抽奖券</div>
                <div class="animal-wedding__lottery-label">
                    <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
                        <path d="M12 2 L14.5 9 L22 9.5 L16 14.5 L18 22 L12 17.5 L6 22 L8 14.5 L2 9.5 L9.5 9 Z" fill="#f7cd67" stroke="#725d42" stroke-width="1.4" stroke-linejoin="round" />
                    </svg>
                    <span>{{ props.lotteryLabel }}</span>
                    <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
                        <path d="M12 2 L14.5 9 L22 9.5 L16 14.5 L18 22 L12 17.5 L6 22 L8 14.5 L2 9.5 L9.5 9 Z" fill="#f7cd67" stroke="#725d42" stroke-width="1.4" stroke-linejoin="round" />
                    </svg>
                </div>
                <div class="animal-wedding__lottery-number">
                    <span class="animal-wedding__lottery-hash">NO.</span>{{ props.lotteryNumber }}
                </div>
                <div v-if="slots.lotteryHint || props.lotteryHint" class="animal-wedding__lottery-hint">
                    <slot name="lotteryHint">{{ props.lotteryHint }}</slot>
                </div>
            </div>
        </template>
    </div>
</template>

<style lang="less" scoped>
@import './weddingInvitation.less';
</style>
