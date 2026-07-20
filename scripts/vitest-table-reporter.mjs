/**
 * vitest-table-reporter.mjs
 *
 * 跑完测试后,以表格形式输出结果到:
 *   1. stdout —— 终端直接可见
 *   2. test-report.md —— 项目根目录
 *
 * 兼容 vitest 2.x 的 BaseReporter 派生(通过 onInit/onFinished + ctx.state)。
 *
 * 使用:
 *   vitest run --reporter=./scripts/vitest-table-reporter.mjs
 *   或在 vitest.config.ts 的 reporters 数组里注册。
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

/**
 * ms 耗时可读化
 */
function fmtDuration(ms) {
    if (!ms || ms < 1000) return `${Math.round(ms || 0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * 按"显示宽度"取字符串。
 * - CJK 字符(中日韩)按 2 个终端列宽
 * - emoji 按 2 个终端列宽
 * - 其余 ASCII 字符按 1 个
 * 这样才能用 padStart / padEnd 对齐终端表格。
 */
function displayWidth(str) {
    let w = 0;
    for (const ch of str) {
        const code = ch.codePointAt(0);
        // CJK 范围 + emoji
        const isWide =
            // CJK 核心区
            (code >= 0x1100 && code <= 0x115f) || // Hangul Jamo
            (code >= 0x2329 && code <= 0x232a) || // 左右尖括号
            (code >= 0x2e80 && code <= 0x303e) || // CJK 标点
            (code >= 0x3041 && code <= 0x33ff) || // 假名
            (code >= 0x3400 && code <= 0x4dbf) || // CJK 扩展 A
            (code >= 0x4e00 && code <= 0x9fff) || // CJK 基本
            (code >= 0xa000 && code <= 0xa4cf) || // 彝文
            (code >= 0xac00 && code <= 0xd7a3) || // Hangul
            (code >= 0xf900 && code <= 0xfaff) || // CJK 兼容
            (code >= 0xfe30 && code <= 0xfe4f) || // CJK 兼容形式
            (code >= 0xff00 && code <= 0xff60) || // 全角 ASCII
            (code >= 0xffe0 && code <= 0xffe6) || // 全角符号
            // emoji / 符号
            (code >= 0x2000 && code <= 0x22ff) || // 通用符号(部分)
            (code >= 0x25a0 && code <= 0x25ff) || // 几何图形(实心框)
            (code >= 0x2600 && code <= 0x27bf) || // dingbats & 杂项符号(含 ✅ ❌ ⏭️ 📝 ⏳ ⏰)
            (code >= 0x2900 && code <= 0x297f) || // 补充箭头
            (code >= 0x2b00 && code <= 0x2bff) || // 杂项符号和箭头
            (code >= 0x1f300 && code <= 0x1f9ff) || // emoji
            (code >= 0x1fa00 && code <= 0x1faff) || // emoji 扩展
            (code >= 0x20000 && code <= 0x2fffd) || // CJK 扩展 B+
            (code >= 0x30000 && code <= 0x3fffd); // CJK 扩展 G+
        w += isWide ? 2 : 1;
    }
    return w;
}

function pad(str, width, align = 'end') {
    const w = displayWidth(str);
    if (w > width) {
        // 字符串超出宽度,按字符逐个截断到 width
        let out = '';
        let cur = 0;
        for (const ch of str) {
            const cw = displayWidth(ch);
            if (cur + cw > width) break;
            out += ch;
            cur += cw;
        }
        return out + ' '.repeat(width - cur);
    }
    if (w === width) return str;
    const p = ' '.repeat(width - w);
    return align === 'end' ? str + p : p + str;
}

function padStart(str, width) {
    return pad(str, width, 'start');
}

function padEnd(str, width) {
    return pad(str, width, 'end');
}

/**
 * 从完整路径提取组件目录名。
 *   src/components/Button/Button.test.ts → Button
 */
function extractComponent(filepath) {
    if (!filepath) return '?';
    const parts = filepath.split('/');
    for (let i = parts.length - 1; i >= 0; i--) {
        if (parts[i].endsWith('.test.ts') || parts[i].endsWith('.test.tsx')) {
            return parts[i - 1];
        }
    }
    return parts[parts.length - 1];
}

/**
 * 递归统计 task 的 pass/fail/skip 数量。
 * vitest 2.1.8 task 结构:
 *   - type: 'suite' | 'test'
 *   - result.state: 'pass' | 'fail' | 'skip' (注意是单数简写!)
 *   - tasks: 子节点(仅 suite)
 */
function summarizeTask(task, counters) {
    if (!task) return;
    // 只对真正的 test 节点计数;suite 即使有 result.state 也不计入
    if (task.type === 'test') {
        const state = task.result?.state;
        if (state === 'pass' || state === 'passed') counters.pass++;
        else if (state === 'fail' || state === 'failed') counters.fail++;
        else if (state === 'skip' || state === 'skipped' || state === 'pending' || state === 'todo') counters.skip++;
        return;
    }
    if (task.tasks) {
        for (const child of task.tasks) summarizeTask(child, counters);
    }
}

export default class TableReporter {
    ctx = null;
    startTime = 0;

    // vitest 2.x / 3.x reporter API
    onInit(ctx) {
        this.ctx = ctx;
        this.startTime = Date.now();
    }

    onFinished(_files, _errors) {
        this.#render();
    }

    // vitest 4 API 兜底
    onTestRunStart() {
        this.startTime = Date.now();
    }

    onTestRunEnd(testFiles) {
        this.#render(testFiles);
    }

    onTestFileReady(file) {
        if (!this._bufferedFiles) this._bufferedFiles = [];
        this._bufferedFiles.push(file);
    }

    #render(testFiles) {
        const files = testFiles || this._bufferedFiles || (this.ctx?.state?.getFiles?.() ?? []);

        const counters = { pass: 0, fail: 0, skip: 0 };
        const rows = files
            .map((f) => {
                const filepath = f.name || f.filepath || f.moduleId || '';
                const component = extractComponent(filepath);
                const local = { pass: 0, fail: 0, skip: 0 };
                const tasks = f.tasks || f.children;
                if (tasks) {
                    for (const t of tasks) summarizeTask(t, local);
                } else if (f.result?.state) {
                    const s = f.result.state;
                    if (s === 'pass' || s === 'passed') local.pass++;
                    else if (s === 'fail' || s === 'failed') local.fail++;
                }
                counters.pass += local.pass;
                counters.fail += local.fail;
                counters.skip += local.skip;
                const overall = local.fail > 0 ? '❌' : local.pass > 0 ? '✅' : '·';
                return {
                    component,
                    file: filepath.replace(/^.*\/src\//, 'src/'),
                    tests: local.pass + local.fail + local.skip,
                    ...local,
                    duration: fmtDuration(f.result?.duration || f.duration || 0),
                    overall,
                };
            })
            .sort((a, b) => a.component.localeCompare(b.component));

        const total = counters.pass + counters.fail + counters.skip;
        const rate = total === 0 ? '0%' : `${((counters.pass / total) * 100).toFixed(1)}%`;
        const totalDuration = Date.now() - this.startTime;

        const lines = [];
        lines.push('');
        lines.push('┌──────────────────────────────────────────────────────────────────┐');
        lines.push('│                   🧪 animal-island-vue 测试报告                  │');
        lines.push('└──────────────────────────────────────────────────────────────────┘');
        lines.push('');
        lines.push(
            `📊 总览: ${rows.length} 个测试文件 · ${total} 个测试 · 通过 ${counters.pass} · 失败 ${counters.fail} · 跳过 ${counters.skip} · 通过率 ${rate} · 耗时 ${fmtDuration(totalDuration)}`
        );
        lines.push('');

        if (rows.length > 0) {
            // 列宽(显示宽度,中文/emoji 算 2):
            // 组件 14 适配 "Notification" (12 ASCII) 与 4 个中文字符
            // 状态 8   适配 "✅" / "❌" 等 emoji + padding
            const W_NAME = 14;
            const W_STATUS = 8;
            const W_TESTS = 7;
            const W_PASS = 7;
            const W_FAIL = 7;
            const W_SKIP = 8;
            const W_DUR = 8;
            // 每一格 " │ content-padded │ " 的实际显示宽 = W + 4
            // 但 box drawing 字符本身是单列;为了让边线与数据行对齐,
            // box 一段 = `─` × (W + 2),两端各一个 `┌` `┐` 恰好凑成 W+4
            const cellWidths = [W_NAME, W_STATUS, W_TESTS, W_PASS, W_FAIL, W_SKIP, W_DUR];
            const border = (l, m, r) => {
                const segs = cellWidths.map((w) => '─'.repeat(w + 2));
                return l + segs.join(m) + r;
            };
            lines.push(border('┌', '┬', '┐'));
            const renderRow = (cells) => {
                const parts = cellWidths.map((w, i) => {
                    // 所有列都 end(左)对齐,确保边线对齐
                    return ' ' + padEnd(cells[i], w) + ' ';
                });
                return '│' + parts.join('│') + '│';
            };
            lines.push(renderRow(['组件', '状态', '测试数', '通过', '失败', '跳过', '耗时']));
            lines.push(border('├', '┼', '┤'));
            for (const r of rows) {
                lines.push(
                    renderRow([
                        r.component,
                        r.overall,
                        String(r.tests),
                        String(r.pass),
                        String(r.fail),
                        String(r.skip),
                        r.duration,
                    ])
                );
            }
            lines.push(border('└', '┴', '┘'));
            lines.push('');
        }

        const failedFiles = rows.filter((r) => r.fail > 0);
        if (failedFiles.length > 0) {
            lines.push('❌ 失败详情:');
            for (const f of failedFiles) {
                lines.push(`  - ${f.file}: ${f.fail} 个失败`);
            }
            lines.push('');
        }

        const report = lines.join('\n');
        console.log(report);
        console.log(`📄 报告已写入: ${resolve(PROJECT_ROOT, 'test-report.md')}\n`);

        // -------- Markdown 文件输出 --------
        const md = [];
        md.push('# 🧪 animal-island-vue 测试报告\n');
        md.push(`> 自动生成于 ${new Date().toISOString()}\n`);
        md.push(`## 📊 总览\n`);
        md.push('| 指标 | 数值 |');
        md.push('|---|---:|');
        md.push(`| 测试文件 | ${rows.length} |`);
        md.push(`| 测试总数 | ${total} |`);
        md.push(`| 通过 | ${counters.pass} ✅ |`);
        md.push(`| 失败 | ${counters.fail} ${counters.fail > 0 ? '❌' : ''} |`);
        md.push(`| 跳过 | ${counters.skip} |`);
        md.push(`| 通过率 | ${rate} |`);
        md.push(`| 总耗时 | ${fmtDuration(totalDuration)} |`);
        md.push('');
        md.push(`## 📋 各组件明细\n`);
        md.push('| 组件 | 状态 | 测试数 | 通过 | 失败 | 跳过 | 耗时 |');
        md.push('|---|:---:|---:|---:|---:|---:|---:|');
        for (const r of rows) {
            md.push(
                `| ${r.component} | ${r.overall} | ${r.tests} | ${r.pass} | ${r.fail} | ${r.skip} | ${r.duration} |`
            );
        }
        if (failedFiles.length > 0) {
            md.push('');
            md.push('## ❌ 失败详情\n');
            for (const f of failedFiles) {
                md.push(`- \`${f.file}\`: ${f.fail} 个失败`);
            }
        }
        md.push('');
        const outPath = resolve(PROJECT_ROOT, 'test-report.md');
        writeFileSync(outPath, md.join('\n'), 'utf-8');
    }
}
