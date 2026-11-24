/** 本地时间格式化，替代 React 版的 dayjs（Vue 侧不引入 dayjs 依赖）。 */

const pad = (n: number) => (n < 10 ? `0${n}` : String(n));

/** HH:mm（对应 dayjs(...).format('HH:mm')）。 */
export function formatHHmm(value: number): string {
    const date = new Date(value);
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** YYYY-MM-DD HH:mm:ss（对应 dayjs(...).format('YYYY-MM-DD HH:mm:ss')）。 */
export function formatFull(value: number): string {
    const date = new Date(value);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
        date.getMinutes()
    )}:${pad(date.getSeconds())}`;
}
