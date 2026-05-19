<script setup lang="ts">
import type { ApiRow } from './styles';
defineProps<{ rows: ApiRow[] }>();
</script>

<template>
    <div class="api-wrap">
        <div class="api-label">API</div>
        <div class="api-box">
            <table class="api-table">
                <thead>
                    <tr>
                        <th>属性</th>
                        <th>说明</th>
                        <th>类型</th>
                        <th>默认值</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, i) in rows" :key="i">
                        <td>
                            <span class="prop-name">{{ row.prop }}</span>
                            <span v-if="row.required" class="required">*</span>
                        </td>
                        <td>{{ row.desc }}</td>
                        <td class="type-cell">{{ row.type }}</td>
                        <td class="default-cell">{{ row.defaultVal }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.api-wrap { margin-top: 24px; }
.api-label {
    font-size: 14px;
    font-weight: 600;
    color: #e7e4e0;
    padding: 6px 12px;
    background: #3d3028;
    border-radius: 10px 10px 0 0;
    display: inline-block;
}
.api-box {
    background: #2b2118;
    border-radius: 0 20px 20px 20px;
    overflow: hidden;
}
.api-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}
.api-table thead tr {
    background: #3d3028;
    color: #e8d5bc;
}
.api-table th {
    padding: 10px 16px;
    text-align: left;
    font-weight: 600;
}
.api-table tbody tr {
    color: #c8bba8;
    border-top: 1px solid #3d3028;
}
.api-table td { padding: 10px 16px; }
.prop-name { color: #e8c87a; }
.required { color: #f0a870; margin-left: 4px; }
.type-cell { color: #d4a0e0; }
.default-cell { color: #a8d4a0; }
</style>
