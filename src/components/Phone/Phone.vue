<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, useAttrs } from 'vue';
import type { CSSProperties } from 'vue';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';

const attrs = useAttrs();

interface AppDef {
    id: string;
    iconName: IconName;
    color: string;
    offset?: boolean;
    hasNewMessage?: boolean;
    iconStyle?: CSSProperties;
}

const apps: AppDef[] = [
    { id: 'camera', iconName: 'icon-camera', color: '#B77DEE', hasNewMessage: true },
    { id: 'app', iconName: 'icon-miles', color: '#889DF0', offset: true },
    { id: 'critterpedia', iconName: 'icon-critterpedia', color: '#F7CD67', iconStyle: { width: '105px' } },
    { id: 'diy', iconName: 'icon-diy', color: '#E59266' },
    { id: 'shopping', iconName: 'icon-design', color: '#F8A6B2' },
    { id: 'variant', iconName: 'icon-map', color: '#82D5BB', hasNewMessage: true, iconStyle: { width: '90px' } },
    { id: 'design', iconName: 'icon-variant', color: '#8AC68A', iconStyle: { width: '80px' } },
    { id: 'map', iconName: 'icon-helicopter', color: '#FC736D' },
    { id: 'chat', iconName: 'icon-chat', color: '#D1DA49' },
];

const now = ref(new Date());
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
    timer = setInterval(() => { now.value = new Date(); }, 1000);
});
onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
});

const display = computed(() => {
    const h = now.value.getHours();
    const m = now.value.getMinutes();
    return {
        hours: (h % 12 || 12).toString(),
        minutes: m.toString().padStart(2, '0'),
        ampm: h >= 12 ? 'PM' : 'AM',
    };
});

const iconStyleFor = (app: AppDef): CSSProperties => ({
    backgroundSize: '70% auto',
    ...(app.iconStyle || {}),
});
</script>

<template>
    <div class="animal-phone-wrap" v-bind="attrs">
        <div class="animal-phone">
            <div class="animal-phone__inner">
                <div class="animal-phone__home">
                    <div class="animal-phone__statusbar">
                        <div class="animal-phone__topbar">
                            <span class="animal-phone__icon animal-phone__icon--wifi" />
                            <div class="animal-phone__time">
                                {{ display.hours }}<span class="animal-phone__blink">:</span>{{ display.minutes }}{{ display.ampm }}
                            </div>
                            <span class="animal-phone__icon animal-phone__icon--loc" />
                        </div>
                        <div class="animal-phone__welcome">Welcome!</div>
                    </div>
                    <div class="animal-phone__grid">
                        <div
                            v-for="app in apps"
                            :key="app.id"
                            class="animal-phone__app"
                            :class="{ 'animal-phone__app--clip': app.offset }"
                            :style="{ backgroundColor: app.color }"
                        >
                            <span v-if="app.hasNewMessage" class="animal-phone__badge" />
                            <Icon
                                :name="app.iconName"
                                size="100%"
                                class="animal-phone__app-icon"
                                :class="{ 'animal-phone__app-icon--offset': app.offset }"
                                :style="iconStyleFor(app)"
                            />
                        </div>
                    </div>
                    <div class="animal-phone__pageindicator">
                        <span class="animal-phone__icon animal-phone__icon--page" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.animal-phone-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
}

.animal-phone {
    position: relative;
    width: 527px;
    height: 788px;
    border-radius: 136px;
    overflow: hidden;
    background: #f8f4e8;

    &__inner {
        overflow: hidden;
    }

    &__home {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 40px;
        background: #f8f4e8;
        background-size: 100% 200%;
        animation: animal-phone-grasswave 8s ease-in-out infinite;
    }

    &__statusbar {
        text-align: center;
        width: 100%;
        padding: 0 70px 31px;
        font-family: var(--font-animal, inherit);
    }

    &__topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 32px;
        color: #dddbcc;
        font-weight: 800;
        letter-spacing: 2px;
    }

    &__time {
        display: flex;
        align-items: baseline;
    }

    &__blink {
        font-size: 32px;
        font-weight: 800;
        color: #dddbcc;
        animation: animal-phone-blink 1s steps(1) infinite;
    }

    &__welcome {
        display: block;
        font-size: 48px;
        font-weight: 800;
        height: 56px;
        margin-top: 20px;
        color: #725c4e;
        letter-spacing: 2px;
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 32px;
        padding: 8px;
        flex: 1;
        align-items: center;
        justify-content: center;
        align-content: center;
    }

    &__app {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 123px;
        height: 123px;
        border-radius: 45px;

        &--clip {
            overflow: hidden;
        }

        &:hover :deep(.animal-phone__app-icon) {
            animation: animal-phone-bounce 0.3s ease-in-out forwards;
        }
        &:hover :deep(.animal-phone__app-icon--offset) {
            animation: animal-phone-bounce-offset 0.3s ease-in-out forwards;
        }
    }

    &__badge {
        position: absolute;
        top: 0;
        left: 0;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #ff544a;
        border: 5px solid #f8f4e8;
        z-index: 1;
    }

    :deep(.animal-phone__app-icon) {
        &.animal-phone__app-icon--offset {
            transform: translateY(15px);
        }
    }

    &__pageindicator {
        display: flex;
        justify-content: center;
        margin-top: 74px;
        align-items: center;
    }

    &__icon {
        display: inline-block;

        &--wifi {
            width: 79px;
            height: 29px;
            background: url('../../assets/img/icons/wifi.svg') center / contain no-repeat;
        }
        &--loc {
            width: 36px;
            height: 36px;
            background: url('../../assets/img/icons/location.svg') center / contain no-repeat;
        }
        &--page {
            width: 65px;
            height: 32px;
            background: url('../../assets/img/icons/page.svg') center / contain no-repeat;
        }
    }
}

@keyframes animal-phone-grasswave {
    0%, 100% { background-position: 0% 0%; }
    50% { background-position: 0% 100%; }
}

@keyframes animal-phone-blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}

@keyframes animal-phone-bounce {
    0% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.2) rotate(-5deg); }
    100% { transform: scale(1.1) rotate(-4deg); }
}

@keyframes animal-phone-bounce-offset {
    0% { transform: scale(1) rotate(0deg) translateY(15px); }
    50% { transform: scale(1.2) rotate(-5deg) translateY(15px); }
    100% { transform: scale(1.1) rotate(-4deg) translateY(15px); }
}
</style>
