import { reactive } from 'vue';
import type { NotificationConfig, NotificationItem, NotificationPosition, NotificationType, NotificationPlacement } from './types';

const DEFAULT_DURATION = 4.5;

const POSITION_PLACEMENT: Record<NotificationPosition, NotificationPlacement> = {
    top: 'top',
    topLeft: 'top',
    topRight: 'top',
    bottom: 'bottom',
    bottomLeft: 'bottom',
    bottomRight: 'bottom',
};

// 模块级 reactive store
export const notificationStore = reactive<{ items: NotificationItem[] }>({
    items: [],
});

let counter = 0;

function buildItem(config: NotificationConfig | string, type: NotificationType): NotificationItem {
    const normalized: NotificationConfig = typeof config === 'string' ? { message: config } : { ...config };
    const position: NotificationPosition = normalized.position ?? 'top';
    counter += 1;
    return {
        ...normalized,
        type,
        key: normalized.key ?? `animal-notification-${Date.now()}-${counter}`,
        position,
        placement: POSITION_PLACEMENT[position],
        duration: normalized.duration ?? DEFAULT_DURATION,
        createdAt: Date.now(),
    };
}

function open(config: NotificationConfig | string, type: NotificationType = 'info'): void {
    if (typeof document === 'undefined') return;
    const item = buildItem(config, type);

    // 显式 key 时，先尝试更新现有通知
    if (item.key) {
        const idx = notificationStore.items.findIndex((it) => it.key === item.key);
        if (idx !== -1) {
            notificationStore.items[idx] = item;
            return;
        }
    }

    notificationStore.items.push(item);
}

export function removeNotification(key: string): void {
    const idx = notificationStore.items.findIndex((it) => it.key === key);
    if (idx === -1) return;
    notificationStore.items.splice(idx, 1);
}

function destroy(key?: string): void {
    if (key) {
        const removed: NotificationItem[] = [];
        const idx = notificationStore.items.findIndex((it) => it.key === key);
        if (idx !== -1) {
            removed.push(notificationStore.items[idx]);
            notificationStore.items.splice(idx, 1);
        }
        removed.forEach((it) => it.onClose?.());
    } else {
        const removed = notificationStore.items.slice();
        notificationStore.items.splice(0, notificationStore.items.length);
        removed.forEach((it) => it.onClose?.());
    }
}

// 构建 Notification 命令式 API
const notificationApi = ((config: NotificationConfig | string) => open(config, 'info')) as import('./types').NotificationStatic;
notificationApi.open = (config) => open(config, 'info');
notificationApi.success = (config) => open(config, 'success');
notificationApi.info = (config) => open(config, 'info');
notificationApi.warning = (config) => open(config, 'warning');
notificationApi.error = (config) => open(config, 'error');
notificationApi.destroy = destroy;

export { notificationApi as Notification };
export const NOTIFICATION_DEFAULT_DURATION = DEFAULT_DURATION;
