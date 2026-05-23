<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const now = ref(new Date());
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
    timer = setInterval(() => { now.value = new Date(); }, 1000);
});
onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
});

function pad(n: number) {
    return n.toString().padStart(2, '0');
}
</script>

<template>
    <div class="animal-time">
        <div class="animal-time__date">
            <span class="animal-time__weekday">
                {{ weekdays[now.getDay()] }}
            </span>
            <span class="animal-time__month-day">
                {{ months[now.getMonth()] }} {{ now.getDate() }}
            </span>
        </div>
        <div class="animal-time__clock">
            {{ pad(now.getHours()) }}<span class="animal-time__colon">:</span>{{ pad(now.getMinutes()) }}
        </div>
    </div>
</template>

<style lang="less" scoped>
.animal-time {
    display: inline-flex;
    gap: 20px;
    align-items: center;
    align-self: flex-start;
    width: fit-content;
    max-width: max-content;
    padding: 16px 36px;
    border: 3px solid #d4cfc3;
    border-radius: 18px;
    background: linear-gradient(180deg, #fff 0%, #f8f8f0 100%);
    animation: animal-time-fade-up 0.5s ease-out;

    &__date {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-right: 24px;
        border-right: 3px solid rgba(159, 146, 125, 0.35);
    }

    &__weekday {
        color: #6fba2c;
        font-weight: 900;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1.5px;
    }

    &__month-day {
        color: #8b7355;
        font-weight: 800;
        font-size: 22px;
    }

    &__clock {
        display: flex;
        align-items: center;
        color: #8b7355;
        font-weight: 900;
        font-size: 48px;
        letter-spacing: 2px;
    }

    &__colon {
        position: relative;
        top: -0.08em;
        margin: 0 1px;
        color: #8b7355;
        font-size: 48px;
        animation: animal-time-blink 1s step-end infinite;
    }
}

@keyframes animal-time-fade-up {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes animal-time-blink {
    50% { opacity: 0; }
}
</style>
