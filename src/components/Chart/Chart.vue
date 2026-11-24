<script lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, watch, type PropType, type VNodeChild } from 'vue';
import { NoData } from '../NoData';
import { Button } from '../Button';
import ChartTooltip from './ChartTooltip.vue';
import { interactionKey, nearestMark, relatedMarks, SHARED_TYPES } from './interaction';
import { cartesianScene } from './Cartesian';
import { gaugeScene, pieScene, radarScene } from './Polar';
import { funnelScene, mapScene, wordScene } from './Specialty';
import { AXIS_TYPES, ITEM_TYPES, CHART_COLORS, finite, normalize, type ChartMark, type SceneContext } from './geometry';
import { formatFull } from './time';
import type { ChartDataEvent, ChartProps, ChartTooltipContext, ChartTooltipOptions, ChartType } from './types';

let uid = 0;

/** 默认数值格式化，保留小数信息并压缩过长坐标刻度。 */
function defaultFormat(value: number): string {
    // Intl 避免浮点尾数直接污染轴标签。
    return new Intl.NumberFormat('zh-CN', {
        maximumFractionDigits: 2,
        notation: Math.abs(value) >= 10000 ? 'compact' : 'standard',
    }).format(value);
}

function renderNode(value: string | VNodeChild | undefined | null): VNodeChild {
    if (value === undefined || value === null) return null;
    return value as VNodeChild;
}

/** 统一图表外壳：尺寸测量、图例、可聚焦数据点、提示、数据明细与空态。 */
export default defineComponent({
    name: 'Chart',
    props: {
        type: { type: String as PropType<ChartType>, default: 'column' },
        series: { type: Array as PropType<ChartProps['series']>, required: true },
        categories: { type: Array as PropType<ChartProps['categories']>, default: undefined },
        title: { type: [String, Object] as PropType<ChartProps['title']>, default: undefined },
        description: { type: [String, Object] as PropType<ChartProps['description']>, default: undefined },
        height: { type: Number, default: 300 },
        colors: { type: Array as PropType<ChartProps['colors']>, default: () => CHART_COLORS },
        legend: { type: Boolean, default: true },
        tooltip: { type: [Boolean, Object] as PropType<ChartProps['tooltip']>, default: true },
        highlight: { type: Boolean, default: true },
        selectable: { type: Boolean, default: true },
        stacked: { type: Boolean, default: false },
        smooth: { type: Boolean, default: false },
        showAxes: { type: Boolean, default: true },
        showLabels: { type: Boolean, default: false },
        min: { type: Number, default: undefined },
        max: { type: Number, default: undefined },
        valueFormatter: { type: Function as PropType<ChartProps['valueFormatter']>, default: undefined },
        xFormatter: { type: Function as PropType<ChartProps['xFormatter']>, default: undefined },
        regions: { type: Array as PropType<ChartProps['regions']>, default: undefined },
        loading: { type: Boolean, default: false },
        emptyText: { type: [String, Object] as PropType<ChartProps['emptyText']>, default: undefined },
        animated: { type: Boolean, default: true },
    },
    emits: {
        /** 点击、Enter 或 Space 触发，携带原数据与下标（对齐 React onDataClick）。 */
        dataClick: (_event: ChartDataEvent) => true,
    },
    setup(props, { emit, attrs }) {
        const instanceId = `animal-chart-${++uid}`;
        const tooltipId = `${instanceId}-tooltip`;
        const viewport = ref<HTMLElement | null>(null);
        const width = ref(640);
        const viewportWidth = ref(640);
        const scrollLeft = ref(0);
        const hidden = ref<string[]>([]);
        const activeKey = ref<string | null>(null);
        const focusedKey = ref<string | null>(null);
        const selectedKey = ref<string | null>(null);
        const legendFocus = ref<string | null>(null);
        const marksRef = ref(new Map<string, SVGGElement>());
        const pointerFrame = ref<number | null>(null);
        const pendingPointer = ref<{ node: SVGSVGElement; x: number; y: number; key: string | null } | null>(null);

        const tooltipOptions = computed<ChartTooltipOptions>(() =>
            props.tooltip && typeof props.tooltip === 'object' ? props.tooltip : {}
        );
        const shared = computed(
            () => tooltipOptions.value.trigger !== 'item' && SHARED_TYPES.has(props.type)
        );
        const itemLegend = computed(() => ITEM_TYPES.has(props.type));
        const chartHeight = computed(() => (finite(props.height) ? Math.max(180, props.height) : 300));
        const valueFormat = computed(() => props.valueFormatter ?? defaultFormat);

        const measure = () => {
            const node = viewport.value;
            if (!node) return;
            // 极窄容器保留可读坐标字，通过局部横向滚动查看。
            if (node.clientWidth > 0) {
                width.value = Math.max(280, node.clientWidth);
                viewportWidth.value = node.clientWidth;
            }
        };
        let observer: ResizeObserver | undefined;
        onMounted(() => {
            measure();
            if (typeof ResizeObserver !== 'undefined') {
                observer = new ResizeObserver(measure);
                if (viewport.value) observer.observe(viewport.value);
            }
            window.addEventListener('resize', measure);
        });
        onBeforeUnmount(() => {
            observer?.disconnect();
            window.removeEventListener('resize', measure);
            if (pointerFrame.value !== null) cancelAnimationFrame(pointerFrame.value);
        });

        const options = computed<ChartProps>(() => ({
            type: props.type,
            series: props.series,
            categories: props.categories,
            colors: props.colors,
            stacked: props.stacked,
            smooth: props.smooth,
            showAxes: props.showAxes,
            showLabels: props.showLabels,
            min: props.min,
            max: props.max,
            regions: props.regions,
            xFormatter: props.xFormatter,
        }));
        const allPoints = computed(() => normalize(options.value));
        /** 按系列名或数据项身份维护图例状态，更新数据后不会误隐藏不同名称的系列。 */
        const legendKey = (seriesIndex: number, name: string, index?: number) =>
            // 加入类型，防止切换图表种类时继承另一种图表的隐藏状态。
            `${props.type}:${props.series[seriesIndex]?.name}:${itemLegend.value ? `${index}:${name}` : 'series'}`;

        const entries = computed(() =>
            itemLegend.value
                ? allPoints.value.map((p) => ({ key: legendKey(p.seriesIndex, p.name, p.dataIndex), name: p.name, color: p.color }))
                : props.series.map((s, i) => ({
                      key: legendKey(i, s.name),
                      name: s.name,
                      color: s.color ?? (props.colors.length ? props.colors : CHART_COLORS)[i % (props.colors.length || CHART_COLORS.length)],
                  }))
        );
        const visiblePoints = computed(() =>
            allPoints.value.filter((p) => !hidden.value.includes(legendKey(p.seriesIndex, p.name, p.dataIndex)))
        );
        const scene = computed(() => {
            // 提示焦点变化不会重新排布词云或重算全部图形。
            const context: SceneContext = {
                props: options.value,
                points: visiblePoints.value,
                width: width.value,
                height: chartHeight.value,
                format: valueFormat.value,
            };
            const type = props.type;
            return AXIS_TYPES.has(type)
                ? cartesianScene(context)
                : ['pie', 'ring', 'rose'].includes(type)
                  ? pieScene(context)
                  : type === 'radar'
                    ? radarScene(context)
                    : ['gauge', 'arcbar'].includes(type)
                      ? gaugeScene(context)
                      : type === 'funnel'
                        ? funnelScene(context)
                        : type === 'word'
                          ? wordScene(context)
                          : mapScene(context);
        });
        const selected = computed(() =>
            props.selectable ? scene.value.marks.find((mark) => interactionKey(mark) === selectedKey.value) : undefined
        );
        const active = computed(
            () => selected.value ?? scene.value.marks.find((mark) => interactionKey(mark) === (activeKey.value ?? focusedKey.value))
        );
        const related = computed(() => (active.value ? relatedMarks(scene.value.marks, active.value, shared.value) : []));
        const relatedKeys = computed(() => new Set(related.value.map((mark) => mark.key)));

        /** 丢弃未提交的悬停，避免离开、锁定或切换数据后旧帧重新弹出提示。 */
        const cancelPointer = () => {
            // 事件结束后不再保留 DOM 节点；帧编号使用 null，兼容编号为零的实现。
            if (pointerFrame.value !== null) cancelAnimationFrame(pointerFrame.value);
            pointerFrame.value = null;
            pendingPointer.value = null;
        };
        watch([scene, () => props.loading, selectedKey, shared], cancelPointer);

        /** 同一绘制帧只处理最后一次指针位置，命中及布局测量也随帧合并。 */
        const movePointer = (event: PointerEvent) => {
            if (event.pointerType === 'touch' || selected.value) return;
            const target = (event.target as Element).closest('[data-chart-mark]');
            pendingPointer.value = {
                node: event.currentTarget as SVGSVGElement,
                x: event.clientX,
                y: event.clientY,
                key: target?.getAttribute('data-chart-mark') ?? null,
            };
            if (pointerFrame.value !== null) return;
            // 只保存事件数据，不把 DOM 事件对象带入下一帧。
            pointerFrame.value = requestAnimationFrame(() => {
                pointerFrame.value = null;
                const pointer = pendingPointer.value;
                pendingPointer.value = null;
                if (!pointer) return;
                let key = pointer.key;
                if (!key) {
                    const bounds = pointer.node.getBoundingClientRect();
                    const mark =
                        bounds.width > 0 && bounds.height > 0
                            ? nearestMark(
                                  scene.value,
                                  ((pointer.x - bounds.left) * width.value) / bounds.width,
                                  ((pointer.y - bounds.top) * chartHeight.value) / bounds.height,
                                  shared.value
                              )
                            : undefined;
                    key = mark ? interactionKey(mark) : null;
                }
                activeKey.value = activeKey.value === key ? activeKey.value : key;
            });
        };

        const focusedLegend = computed(() => entries.value.find((entry) => entry.key === legendFocus.value && !hidden.value.includes(entry.key)));
        const validFocus = computed(() => scene.value.marks.some((mark) => interactionKey(mark) === focusedKey.value));
        const hiddenCount = computed(() => entries.value.filter((entry) => hidden.value.includes(entry.key)).length);

        watch([scene, () => props.loading, selectedKey], () => {
            // 隐藏、换图或异步数据删除当前点后取消锁定，恢复数据时不会意外复活旧选择。
            if (props.loading) {
                activeKey.value = null;
                focusedKey.value = null;
                legendFocus.value = null;
            }
            if (props.loading || !props.selectable || !scene.value.marks.some((mark) => interactionKey(mark) === selectedKey.value))
                selectedKey.value = null;
        });

        const empty = computed(() => !scene.value.marks.length);
        const allHidden = computed(() => allPoints.value.length > 0 && !visiblePoints.value.length);
        const missingMap = computed(() => props.type === 'map' && !props.regions?.length);
        const label = computed(
            () => (attrs['aria-label'] as string) ?? (typeof props.title === 'string' ? props.title : '统计图表')
        );

        /** 提示与屏幕阅读器使用同一份数值描述，保留二维坐标和 OHLC 信息。 */
        const describe = (mark: ChartMark) => {
            const p = mark.point;
            // K 线不能仅报收盘价，否则用户无法读取蜡烛的上下影线含义。
            if (p.candle)
                return `开 ${valueFormat.value(p.candle.open)} / 收 ${valueFormat.value(p.candle.close)} / 低 ${valueFormat.value(p.candle.low)} / 高 ${valueFormat.value(p.candle.high)}`;
            if (['scatter', 'bubble', 'time'].includes(props.type))
                return `${props.xFormatter?.(p.x) ?? (props.type === 'time' ? formatFull(p.x) : valueFormat.value(p.x))} · ${valueFormat.value(p.value)}${props.type === 'bubble' ? ` · 权重 ${valueFormat.value(p.size)}` : ''}`;
            return valueFormat.value(p.value);
        };

        /** 清理临时和锁定状态，Escape、恢复图例与关闭按钮保持一致。 */
        const clearActive = () => {
            // 同时清理焦点对应的提示状态，防止解除锁定后旧提示立即出现。
            cancelPointer();
            activeKey.value = null;
            focusedKey.value = null;
            selectedKey.value = null;
        };
        /** 保持原数据点击回调，同时允许再次激活同一点解除锁定。 */
        const activate = (mark: ChartMark) => {
            const key = interactionKey(mark);
            // selection 不依赖 onDataClick，只有查看需求的图表也可以锁定读数。
            cancelPointer();
            activeKey.value = key;
            if (props.selectable) selectedKey.value = selectedKey.value === key ? null : key;
            emit('dataClick', mark.point);
        };
        /** 图例联动优先突出整个系列；读数时仅突出当前对比组。 */
        const muted = (mark: ChartMark) => {
            if (!props.highlight) return false;
            // 不把未匹配或已隐藏的图例当作激活对象，避免整个图面被淡化。
            if (focusedLegend.value)
                return legendKey(mark.point.seriesIndex, mark.point.name, mark.point.dataIndex) !== focusedLegend.value.key;
            return Boolean(active.value && !relatedKeys.value.has(mark.key));
        };

        const total = computed(() => scene.value.marks.reduce((sum, mark) => sum + Math.max(0, mark.point.value), 0));
        const tooltipContext = computed<ChartTooltipContext | undefined>(() => {
            const current = active.value;
            if (!current) return undefined;
            return {
                type: props.type,
                name:
                    props.type === 'time'
                        ? (props.xFormatter?.(current.point.x) ?? formatFull(current.point.x))
                        : current.point.name,
                locked: Boolean(selected.value),
                items: related.value.map((mark) => {
                    const index = scene.value.marks.indexOf(mark);
                    const first = scene.value.marks[0]?.point.value ?? 0;
                    const previous = scene.value.marks[index - 1]?.point.value ?? 0;
                    const denominator = props.type === 'funnel' ? first : total.value;
                    return {
                        ...mark.point,
                        formattedValue: describe(mark),
                        percentage:
                            ['pie', 'ring', 'rose', 'funnel'].includes(props.type) && denominator > 0
                                ? (mark.point.value / denominator) * 100
                                : undefined,
                        conversion: props.type === 'funnel' && previous > 0 ? (mark.point.value / previous) * 100 : undefined,
                    };
                }),
            };
        });
        const tooltipContent = computed<VNodeChild>(() => {
            const context = tooltipContext.value;
            if (!context) return null;
            if (tooltipOptions.value.render) return renderNode(tooltipOptions.value.render(context));
            return [
                h('div', { class: 'animal-chart__tooltip-title' }, [
                    h('strong', null, context.name),
                    selected.value ? h('span', { class: 'animal-chart__tooltip-locked' }, '已锁定') : null,
                ]),
                ...context.items.map((item) =>
                    h('div', { class: 'animal-chart__tooltip-row', key: `${item.seriesIndex}-${item.dataIndex}` }, [
                        h('span', { class: 'animal-chart__swatch', style: { background: item.color }, 'aria-hidden': 'true' }),
                        h('div', { class: 'animal-chart__tooltip-value' }, [
                            h('span', null, item.seriesName),
                            h('strong', null, item.formattedValue),
                            tooltipOptions.value.showPercentage !== false && item.percentage !== undefined
                                ? h('small', null, `${props.type === 'funnel' ? '较首阶段' : '占比'} ${defaultFormat(item.percentage)}%`)
                                : null,
                            tooltipOptions.value.showPercentage !== false && item.conversion !== undefined
                                ? h('small', null, `较上阶段 ${defaultFormat(item.conversion)}%`)
                                : null,
                        ]),
                    ])
                ),
                props.selectable
                    ? h('div', { class: 'animal-chart__tooltip-hint' }, selected.value ? '再次点击或按 Esc 解除锁定' : '点击锁定读数')
                    : null,
            ];
        });
        const hasTooltip = computed(
            () => Boolean(props.tooltip) && tooltipContent.value !== null && tooltipContent.value !== undefined && tooltipContent.value !== false
        );

        const handleKeydown = (event: KeyboardEvent) => {
            if (!event.defaultPrevented && event.key === 'Escape') clearActive();
        };
        const onMarkKeydown = (event: KeyboardEvent, mark: ChartMark, index: number) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                activate(mark);
            }
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
                event.preventDefault();
                clearActive();
                const next =
                    event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? scene.value.marks.length - 1
                          : (index + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1) + scene.value.marks.length) %
                            scene.value.marks.length;
                marksRef.value.get(scene.value.marks[next].key)?.focus();
                // Home/End 可能仍停留在同一节点，此时浏览器不会再次触发 focus。
                focusedKey.value = interactionKey(scene.value.marks[next]);
            }
        };

        return () => {
            const chartClass = ['animal-chart', props.animated && 'animal-chart--animated'].filter(Boolean).join(' ');
            return h(
                'div',
                {
                    role: 'figure',
                    class: chartClass,
                    'aria-label': label.value,
                    'aria-busy': props.loading || undefined,
                    onKeydown: handleKeydown,
                },
                [
                    props.title || props.description
                        ? h('div', { class: 'animal-chart__header' }, [
                              props.title ? h('div', { class: 'animal-chart__title' }, [renderNode(props.title)]) : null,
                              props.description
                                  ? h('div', { class: 'animal-chart__description' }, [renderNode(props.description)])
                                  : null,
                          ])
                        : null,
                    h(
                        'div',
                        {
                            ref: viewport,
                            class: 'animal-chart__viewport',
                            style: { minHeight: `${chartHeight.value}px` },
                            onScroll: (event: Event) => (scrollLeft.value = (event.currentTarget as HTMLElement).scrollLeft),
                            onPointerleave: () => {
                                cancelPointer();
                                activeKey.value = null;
                            },
                        },
                        [
                            props.loading
                                ? h('div', { class: 'animal-chart__state', style: { height: `${chartHeight.value}px` }, role: 'status' }, '正在整理数据…')
                                : [
                                      h(
                                          'svg',
                                          {
                                              width: width.value,
                                              height: chartHeight.value,
                                              viewBox: `0 0 ${width.value} ${chartHeight.value}`,
                                              class: 'animal-chart__canvas',
                                              role: 'group',
                                              'aria-label': label.value,
                                              onPointermove: movePointer,
                                              onClick: (event: MouseEvent) => {
                                                  if (!(event.target as Element).closest('[data-chart-mark]')) clearActive();
                                              },
                                          },
                                          [
                                              h('g', { 'aria-hidden': 'true' }, [
                                                  empty.value ? null : scene.value.background,
                                              ]),
                                              ...(scene.value.layers ?? []).map((layer) =>
                                                  h(
                                                      'g',
                                                      {
                                                          key: layer.seriesIndex,
                                                          'aria-hidden': 'true',
                                                          class: [
                                                              'animal-chart__layer',
                                                              props.highlight &&
                                                                  focusedLegend.value &&
                                                                  legendKey(layer.seriesIndex, '') !== focusedLegend.value.key &&
                                                                  'animal-chart__muted',
                                                          ]
                                                              .filter(Boolean)
                                                              .join(' '),
                                                      },
                                                      [layer.node]
                                                  )
                                              ),
                                              props.tooltip && tooltipOptions.value.crosshair !== false && active.value && scene.value.plot
                                                  ? h('g', { class: 'animal-chart__crosshair', 'aria-hidden': 'true' }, [
                                                        scene.value.plot.horizontal
                                                            ? h('line', {
                                                                  x1: scene.value.plot.left,
                                                                  x2: scene.value.plot.right,
                                                                  y1: active.value.axisPosition ?? active.value.y,
                                                                  y2: active.value.axisPosition ?? active.value.y,
                                                              })
                                                            : h('line', {
                                                                  x1: active.value.axisPosition ?? active.value.x,
                                                                  x2: active.value.axisPosition ?? active.value.x,
                                                                  y1: scene.value.plot.top,
                                                                  y2: scene.value.plot.bottom,
                                                              }),
                                                        !shared.value && !scene.value.plot.horizontal
                                                            ? h('line', {
                                                                  x1: scene.value.plot.left,
                                                                  x2: scene.value.plot.right,
                                                                  y1: active.value.y,
                                                                  y2: active.value.y,
                                                              })
                                                            : null,
                                                    ])
                                                  : null,
                                              ...scene.value.marks.map((mark, index) =>
                                                  h(
                                                      'g',
                                                      {
                                                          key: mark.key,
                                                          ref: (node: unknown) => {
                                                              const el = node as SVGGElement | null;
                                                              if (el) marksRef.value.set(mark.key, el);
                                                              else marksRef.value.delete(mark.key);
                                                          },
                                                          class: [
                                                              'animal-chart__mark',
                                                              muted(mark) && 'animal-chart__muted',
                                                              props.highlight && active.value && relatedKeys.value.has(mark.key) && 'animal-chart__mark-active',
                                                          ]
                                                              .filter(Boolean)
                                                              .join(' '),
                                                          'data-chart-mark': interactionKey(mark),
                                                          role: 'button',
                                                          tabIndex: validFocus.value
                                                              ? focusedKey.value === interactionKey(mark)
                                                                  ? 0
                                                                  : -1
                                                              : index === 0
                                                                ? 0
                                                                : -1,
                                                          'aria-pressed': props.selectable ? selected.value === mark : undefined,
                                                          'aria-describedby': hasTooltip.value && active.value === mark ? tooltipId : undefined,
                                                          'aria-label': `${mark.point.seriesName}，${mark.point.name}，${describe(mark)}`,
                                                          onPointerenter: (event: PointerEvent) => {
                                                              cancelPointer();
                                                              if (event.pointerType !== 'touch') activeKey.value = interactionKey(mark);
                                                          },
                                                          onFocus: () => {
                                                              cancelPointer();
                                                              activeKey.value = null;
                                                              focusedKey.value = interactionKey(mark);
                                                          },
                                                          onBlur: () => (focusedKey.value = null),
                                                          onClick: () => activate(mark),
                                                          onKeydown: (event: KeyboardEvent) => onMarkKeydown(event, mark, index),
                                                      },
                                                      [
                                                          mark.point.value === 0 ||
                                                          ['line', 'area', 'mix', 'time', 'scatter', 'bubble', 'radar'].includes(props.type)
                                                              ? h('ellipse', {
                                                                    cx: mark.x,
                                                                    cy: mark.y,
                                                                    rx: 12,
                                                                    ry: 12,
                                                                    fill: 'transparent',
                                                                    'aria-hidden': 'true',
                                                                })
                                                              : null,
                                                          ...(Array.isArray(mark.node) ? mark.node : [mark.node]),
                                                      ]
                                                  )
                                              ),
                                              props.highlight && active.value && (scene.value.plot || props.type === 'radar')
                                                  ? h('g', { class: 'animal-chart__indicators', 'aria-hidden': 'true' },
                                                        related.value.map((mark) =>
                                                            h('circle', {
                                                                key: mark.key,
                                                                cx: mark.x,
                                                                cy: mark.y,
                                                                r: 7,
                                                                fill: 'var(--animal-bg-color, #f8f8f0)',
                                                                stroke: mark.point.color,
                                                                'stroke-width': 2.5,
                                                            })
                                                        )
                                                    )
                                                  : null,
                                          ]
                                      ),
                                      empty.value
                                          ? h('div', { class: 'animal-chart__empty', role: 'status' }, [
                                                !allHidden.value && !missingMap.value && isVNodeValue(props.emptyText)
                                                    ? renderNode(props.emptyText)
                                                    : h(NoData, {
                                                          size: 'small',
                                                          title: allHidden.value
                                                              ? '所有图例已隐藏'
                                                              : missingMap.value
                                                                ? '请提供地图区域轮廓'
                                                                : (props.emptyText as string) || '暂无数据',
                                                          description: allHidden.value ? '恢复图例后，即可继续查看统计。' : undefined,
                                                          extra:
                                                              hiddenCount.value > 0
                                                                  ? h(Button, { size: 'small', onClick: () => { hidden.value = []; clearActive(); } }, { default: () => '恢复全部图例' })
                                                                  : undefined,
                                                      }),
                                            ])
                                          : null,
                                      hasTooltip.value && active.value
                                          ? h(
                                                ChartTooltip,
                                                {
                                                    id: tooltipId,
                                                    x: active.value.x,
                                                    y: active.value.y,
                                                    height: chartHeight.value,
                                                    viewportWidth: viewportWidth.value,
                                                    scrollLeft: scrollLeft.value,
                                                    locked: Boolean(selected.value),
                                                },
                                                { default: () => tooltipContent.value }
                                            )
                                          : null,
                                  ],
                        ]
                    ),
                    props.legend && entries.value.length > 0
                        ? h('div', { class: 'animal-chart__legend', 'aria-label': '图例' }, [
                              ...entries.value.map((entry) =>
                                  h(
                                      'button',
                                      {
                                          type: 'button',
                                          key: entry.key,
                                          'aria-pressed': !hidden.value.includes(entry.key),
                                          onPointerenter: () => (legendFocus.value = entry.key),
                                          onPointerleave: () => (legendFocus.value = null),
                                          onFocus: () => (legendFocus.value = entry.key),
                                          onBlur: () => (legendFocus.value = null),
                                          onClick: () => {
                                              hidden.value = hidden.value.includes(entry.key)
                                                  ? hidden.value.filter((v) => v !== entry.key)
                                                  : [...hidden.value, entry.key];
                                              clearActive();
                                          },
                                      },
                                      [
                                          h('span', {
                                              class: 'animal-chart__swatch',
                                              style: { background: entry.color },
                                              'aria-hidden': 'true',
                                          }),
                                          entry.name,
                                      ]
                                  )
                              ),
                              hiddenCount.value > 0 && !empty.value
                                  ? h('button', {
                                        type: 'button',
                                        onClick: () => { hidden.value = []; clearActive(); },
                                    }, '恢复全部图例')
                                  : null,
                          ])
                        : null,
                    !props.loading && selected.value
                        ? h('div', { class: 'animal-chart__selection' }, [
                              h('span', null, `已锁定：${selected.value.point.name}`),
                              h('button', { type: 'button', onClick: clearActive }, '解除锁定'),
                          ])
                        : null,
                    !props.loading && allPoints.value.length > 0
                        ? h('details', { class: 'animal-chart__data' }, [
                              h('summary', null, `查看数据（${allPoints.value.length}）`),
                              h('div', { class: 'animal-chart__table-scroll' }, [
                                  h('table', null, [
                                      h('caption', null, `${label.value}数据明细`),
                                      h('thead', null, [h('tr', null, [
                                          h('th', { scope: 'col' }, '系列'),
                                          h('th', { scope: 'col' }, '项目'),
                                          h('th', { scope: 'col' }, '数值'),
                                      ])]),
                                      h('tbody', null, allPoints.value.map((p) =>
                                          h('tr', { key: `${p.seriesIndex}-${p.dataIndex}` }, [
                                              h('td', null, p.seriesName),
                                              h('td', null, p.name),
                                              h('td', null, describe({ key: '', point: p, node: null, x: 0, y: 0 })),
                                          ])
                                      )),
                                  ]),
                              ]),
                          ])
                        : null,
                    props.type === 'word' && scene.value.marks.length < visiblePoints.value.filter((p) => p.value > 0).length
                        ? h('div', { class: 'animal-chart__description' }, '部分词条未能放入当前绘图区，完整数值可展开查看数据。')
                        : null,
                ]
            );
        };
    },
});

/** 空态：仅把 VNode 视为自定义完整内容，字符串仍交给 NoData 作为标题。 */
function isVNodeValue(value: unknown): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
</script>

<style lang="less">
@import '@/styles/variables.less';

.animal-chart {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    padding: 20px;
    border: 1.5px solid var(--animal-border-color-light, #e8e2d6);
    border-radius: 20px;
    background: var(--animal-bg-color, #f8f8f0);
    color: var(--animal-text-color, #794f27);
    font-family: var(--animal-font-family, 'Nunito', 'Noto Sans SC');
}
.animal-chart__header {
    margin-bottom: 12px;
}
.animal-chart__title {
    font-size: 17px;
    font-weight: 800;
    color: var(--animal-text-color, #794f27);
}
.animal-chart__description {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--animal-text-color-secondary, #8a7b66);
}
.animal-chart__viewport {
    position: relative;
    width: 100%;
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--animal-text-color-disabled, #c8bba3) transparent;
}
.animal-chart__canvas {
    display: block;
    max-width: none;

    text {
        font-family: inherit;
    }
    .chart-grid {
        line {
            stroke: var(--animal-border-color-light, #e4dcc9);
            stroke-dasharray: 3 6;
        }
        text {
            fill: var(--animal-text-color-secondary, #8a7b66);
            font-size: 11px;
            font-weight: 600;
        }
    }
    .chart-grid-line {
        stroke: var(--animal-border-color-light, #e4dcc9);
    }
    .chart-zero {
        stroke: var(--animal-text-color-disabled, #b8a58b);
        stroke-width: 1.5;
    }
    .chart-axis-label {
        fill: var(--animal-text-color-secondary, #8a7b66);
        font-size: 11px;
        font-weight: 600;
    }
    .chart-value-label {
        fill: var(--animal-text-color, #725d42);
        font-size: 12px;
        font-weight: 700;
        pointer-events: none;
    }
    .chart-radar-grid {
        fill: var(--animal-bg-color, #fffdf7);
        fill-opacity: 0.3;
        stroke: var(--animal-border-color-light, #e4dcc9);
    }
    .chart-center text {
        fill: var(--animal-text-color-secondary, #8a7b66);
        font-size: 12px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
    }
    .chart-center-value {
        fill: var(--animal-text-color-secondary, #725d42);
        font-size: 24px;
        font-weight: 900;
    }
    .chart-center .chart-center-value {
        fill: var(--animal-text-color-secondary, #725d42);
        font-size: 24px;
        font-weight: 900;
    }
}
.animal-chart__mark {
    cursor: pointer;
    outline: none;
    transition:
        opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
        filter 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    &:focus-visible {
        outline: 2px solid var(--animal-primary-color, #19c8b9);
        outline-offset: 4px;
    }
}
.animal-chart__layer {
    pointer-events: none;
    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.animal-chart__muted {
    opacity: 0.24;
}
.animal-chart__mark-active {
    filter: drop-shadow(0 2px 3px rgba(61, 52, 40, 0.18));
}
.animal-chart__crosshair,
.animal-chart__indicators {
    pointer-events: none;
}
.animal-chart__crosshair line {
    stroke: var(--animal-text-color-secondary, #725d42);
    stroke-opacity: 0.55;
    stroke-dasharray: 4 5;
    stroke-width: 1;
}
.animal-chart__swatch {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}
.animal-chart__state,
.animal-chart__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--animal-text-color-secondary, #8a7b66);
    font-size: 14px;
    text-align: center;
    padding: 16px;
    box-sizing: border-box;
}
.animal-chart__empty {
    position: absolute;
    inset: 0;
    overflow: auto;
    align-items: safe center;
}
.animal-chart__selection {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 16px;
    margin-top: 12px;
    font-size: 12px;
    color: var(--animal-text-color, #794f27);
    span {
        color: inherit;
        overflow-wrap: anywhere;
    }
    button {
        border: 0;
        border-radius: 50px;
        background: var(--animal-bg-color-secondary, #f0e8d8);
        color: inherit;
        font: inherit;
        padding: 6px 12px;
        cursor: pointer;
        &:hover {
            background: var(--animal-border-color-light, #e5dcc8);
        }
        &:focus-visible {
            outline: 2px solid var(--animal-primary-color, #19c8b9);
            outline-offset: 2px;
        }
    }
}
.animal-chart__legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px 12px;
    margin-top: 8px;
    button {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 5px 10px;
        border: 0;
        border-radius: 50px;
        color: var(--animal-text-color, #725d42);
        background: var(--animal-bg-color-secondary, #f0e8d8);
        font: inherit;
        font-size: 12px;
        cursor: pointer;
        min-height: 32px;
        transition:
            background 0.2s cubic-bezier(0.4, 0, 0.2, 1),
            transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        &:hover {
            background: var(--animal-border-color-light, #e5dcc8);
            transform: translateY(-1px);
        }
        &:active {
            transform: translateY(0);
        }
        &[aria-pressed='false'] {
            opacity: 0.5;
            text-decoration: line-through;
        }
        &:focus-visible {
            outline: 2px solid var(--animal-primary-color, #19c8b9);
            outline-offset: 2px;
        }
    }
}
.animal-chart__data {
    margin-top: 14px;
    font-size: 12px;
    color: var(--animal-text-color-secondary, #8a7b66);
    summary {
        cursor: pointer;
        width: fit-content;
        border-radius: 12px;
        padding: 4px;
        &:focus-visible {
            outline: 2px solid var(--animal-primary-color, #19c8b9);
        }
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        text-align: left;
    }
    th,
    td {
        padding: 8px 12px;
        border-bottom: 1px solid var(--animal-border-color-light, #e8e2d6);
        color: var(--animal-text-color, #725d42);
    }
    caption {
        text-align: left;
        padding: 8px 12px;
        color: var(--animal-text-color, #725d42);
    }
}
.animal-chart__table-scroll {
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--animal-text-color-disabled, #c8bba3) transparent;
    font-variant-numeric: tabular-nums;
}
.animal-chart--animated .animal-chart__canvas {
    animation: animal-chart-appear 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes animal-chart-appear {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
@media (prefers-reduced-motion: reduce) {
    .animal-chart--animated .animal-chart__canvas {
        animation: none;
    }
    .animal-chart__mark,
    .animal-chart__layer,
    .animal-chart__legend button {
        transition: none;
    }
    .animal-chart__legend button:hover {
        transform: none;
    }
}
@media (max-width: 480px) {
    .animal-chart {
        padding: 12px;
    }
}
</style>
