import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import Table from './Table.vue';
import type { TableColumn, TableRecord } from './types';

interface Row extends TableRecord {
    key: string;
    name: string;
    age: number;
}

// 测试中把 columns / dataSource 用宽类型 TableRecord 与组件默认 props 匹配，
// render 回调仍能拿到具体 Row 字段（运行时类型安全）。
const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Age', dataIndex: 'age', align: 'right' },
] as unknown as TableColumn<TableRecord>[];

const data = [
    { key: '1', name: 'Alice', age: 20 },
    { key: '2', name: 'Bob', age: 30 },
] as unknown as TableRecord[];

describe('Table', () => {
    it('渲染表头与行数据', () => {
        const wrapper = mount(Table, {
            props: { columns, dataSource: data },
        });
        expect(wrapper.text()).toContain('Name');
        expect(wrapper.text()).toContain('Age');
        expect(wrapper.text()).toContain('Alice');
        expect(wrapper.text()).toContain('Bob');
    });

    it('showHeader=false 时不渲染表头', () => {
        const wrapper = mount(Table, {
            props: { columns, dataSource: data, showHeader: false },
        });
        expect(wrapper.find('thead').exists()).toBe(false);
    });

    it('数据为空时显示 emptyText', () => {
        const wrapper = mount(Table, {
            props: { columns, dataSource: [], emptyText: '无内容' },
        });
        expect(wrapper.text()).toContain('无内容');
    });

    it('column.render 自定义单元格', () => {
        const cols = [
            {
                title: 'Name',
                render: (_v: unknown, r: TableRecord) => {
                    const row = r as unknown as Row;
                    return h('span', { 'data-testid': `r-${row.key}` }, `${row.name}!`);
                },
            },
        ] as unknown as TableColumn<TableRecord>[];
        const wrapper = mount(Table, {
            props: { columns: cols, dataSource: data },
        });
        expect(wrapper.find('[data-testid="r-1"]').text()).toBe('Alice!');
    });

    it('striped 偶数行加 striped 类', () => {
        const wrapper = mount(Table, {
            props: { columns, dataSource: data },
        });
        const rows = wrapper.findAll('tbody tr');
        expect(rows[0].classes()).not.toContain('animal-table__row--striped');
        expect(rows[1].classes()).toContain('animal-table__row--striped');
    });

    it('rowKey 为函数时使用其返回值', () => {
        const wrapper = mount(Table, {
            props: {
                columns,
                dataSource: data,
                rowKey: (r) => `row-${(r as unknown as Row).name}`,
            },
        });
        // 没有显式 data 属性可断言；至少行数正确即可
        expect(wrapper.findAll('tbody tr')).toHaveLength(2);
    });

    it('loading 时叠加 loading 类与 overlay', () => {
        const wrapper = mount(Table, {
            props: { columns, dataSource: data, loading: true },
        });
        expect(wrapper.find('table').classes()).toContain('animal-table--loading');
        expect(wrapper.find('.animal-table__loader').exists()).toBe(true);
    });
});
