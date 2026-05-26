// 直接 bundle 组件需要的字体文件 —— 不依赖外部 @fontsource CSS，
// 这样网页渲染、PNG 导出都可以用同一份资源稳定获取。
//
// vite 会把这些 woff2 处理成最终发布产物里的 URL；对应字体也会自动复制到 dist。
//
// 注意：仅引入项目实际会用到的字重（500/700/900），且只覆盖以下 subset：
//   - Nunito       latin
//   - Noto Sans SC latin + chinese-simplified
//   - Zen Maru Gothic latin + japanese

// ---------- Nunito (拉丁) ----------
import nunito500 from '@fontsource/nunito/files/nunito-latin-500-normal.woff2?url';
import nunito700 from '@fontsource/nunito/files/nunito-latin-700-normal.woff2?url';
import nunito900 from '@fontsource/nunito/files/nunito-latin-900-normal.woff2?url';

// ---------- Noto Sans SC ----------
import notoLatin400 from '@fontsource/noto-sans-sc/files/noto-sans-sc-latin-400-normal.woff2?url';
import notoLatin500 from '@fontsource/noto-sans-sc/files/noto-sans-sc-latin-500-normal.woff2?url';
import notoLatin700 from '@fontsource/noto-sans-sc/files/noto-sans-sc-latin-700-normal.woff2?url';
import notoCN400 from '@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff2?url';
import notoCN500 from '@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-500-normal.woff2?url';
import notoCN700 from '@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-700-normal.woff2?url';

// ---------- Zen Maru Gothic ----------
import zenLatin500 from '@fontsource/zen-maru-gothic/files/zen-maru-gothic-latin-500-normal.woff2?url';
import zenLatin700 from '@fontsource/zen-maru-gothic/files/zen-maru-gothic-latin-700-normal.woff2?url';
import zenLatin900 from '@fontsource/zen-maru-gothic/files/zen-maru-gothic-latin-900-normal.woff2?url';
import zenJP500 from '@fontsource/zen-maru-gothic/files/zen-maru-gothic-japanese-500-normal.woff2?url';
import zenJP700 from '@fontsource/zen-maru-gothic/files/zen-maru-gothic-japanese-700-normal.woff2?url';
import zenJP900 from '@fontsource/zen-maru-gothic/files/zen-maru-gothic-japanese-900-normal.woff2?url';

interface FontDef {
    family: string;
    weight: number;
    url: string;
}

const WEDDING_FONTS: FontDef[] = [
    { family: 'Nunito', weight: 500, url: nunito500 },
    { family: 'Nunito', weight: 700, url: nunito700 },
    { family: 'Nunito', weight: 900, url: nunito900 },
    { family: 'Noto Sans SC', weight: 400, url: notoLatin400 },
    { family: 'Noto Sans SC', weight: 500, url: notoLatin500 },
    { family: 'Noto Sans SC', weight: 700, url: notoLatin700 },
    { family: 'Noto Sans SC', weight: 400, url: notoCN400 },
    { family: 'Noto Sans SC', weight: 500, url: notoCN500 },
    { family: 'Noto Sans SC', weight: 700, url: notoCN700 },
    { family: 'Zen Maru Gothic', weight: 500, url: zenLatin500 },
    { family: 'Zen Maru Gothic', weight: 700, url: zenLatin700 },
    { family: 'Zen Maru Gothic', weight: 900, url: zenLatin900 },
    { family: 'Zen Maru Gothic', weight: 500, url: zenJP500 },
    { family: 'Zen Maru Gothic', weight: 700, url: zenJP700 },
    { family: 'Zen Maru Gothic', weight: 900, url: zenJP900 },
];

/** 组件统一字体栈 —— 所有 .envelope 内的 text 元素继承此值 */
export const WEDDING_FONT_FAMILY =
    "Nunito, 'Noto Sans SC', 'Zen Maru Gothic', 'HarmonyOS Sans SC', 'MiSans', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif";

const buildFontFaceCss = (urlResolver: (url: string) => string): string =>
    WEDDING_FONTS.map(
        ({ family, weight, url }) =>
            `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;src:url('${urlResolver(url)}') format('woff2');}`,
    ).join('\n');

// ---------- 网页用：模块加载即把指向 woff2 url 的 @font-face 注入 <head> ----------
let injected = false;
export const injectWeddingFonts = (): void => {
    if (injected || typeof document === 'undefined') return;
    injected = true;
    const style = document.createElement('style');
    style.setAttribute('data-wedding-fonts', '');
    style.textContent = buildFontFaceCss((u) => u);
    document.head.appendChild(style);
};

// ---------- 导出 PNG 用：把所有 woff2 抓成 ArrayBuffer，
// 一次性完成「FontFace 注册到 document.fonts」+「拼出 data URL @font-face cssText」。
// 后者用于塞到截图根节点的 <style> 里 —— Chromium 在 SVG-as-image 渲染时
// 不读 document.fonts，必须把 @font-face 直接放进 foreignObject 的 HTML 里才会应用 ----------
let exportPrepPromise: Promise<string> | null = null;
export const prepareWeddingFontsForExport = (): Promise<string> => {
    if (exportPrepPromise) return exportPrepPromise;
    if (typeof document === 'undefined') {
        exportPrepPromise = Promise.resolve('');
        return exportPrepPromise;
    }
    exportPrepPromise = (async () => {
        const dataUrlMap = new Map<string, string>();
        await Promise.all(
            WEDDING_FONTS.map(async ({ family, weight, url }) => {
                try {
                    const r = await fetch(url, { mode: 'cors', credentials: 'omit' });
                    if (!r.ok) return;
                    const buf = await r.arrayBuffer();

                    // 1) 注册到 document.fonts —— 让网页本身也能立刻用上
                    if (typeof FontFace !== 'undefined' && document.fonts) {
                        try {
                            const ff = new FontFace(family, buf, {
                                weight: String(weight),
                                style: 'normal',
                                display: 'swap',
                            });
                            await ff.load();
                            (document.fonts as unknown as { add: (f: FontFace) => void }).add(ff);
                        } catch {
                            // FontFace 注册失败也不阻塞 data URL 生成
                        }
                    }

                    // 2) 转 data URL —— 给截图用
                    const blob = new Blob([buf], { type: 'font/woff2' });
                    const dataUrl: string = await new Promise((resolve) => {
                        const fr = new FileReader();
                        fr.onload = () => resolve(fr.result as string);
                        fr.readAsDataURL(blob);
                    });
                    dataUrlMap.set(url, dataUrl);
                } catch (err) {
                    console.warn('[WeddingInvitation] 字体抓取失败：', url, err);
                }
            }),
        );
        try {
            await document.fonts?.ready;
        } catch {
            // 容错
        }
        console.info(
            `[WeddingInvitation] 字体已就绪：${dataUrlMap.size}/${WEDDING_FONTS.length}`,
        );
        return buildFontFaceCss((u) => dataUrlMap.get(u) ?? u);
    })();
    return exportPrepPromise;
};
