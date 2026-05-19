<script setup lang="ts">
import { CodeBlock as CodeBlockBase } from '../../src';
defineProps<{ code: string }>();
</script>

<template>
    <div class="codeblock-wrap">
        <div class="code-label">使用示例</div>
        <CodeBlockBase
            :code="code"
            :style="{ marginTop: '0px', borderRadius: '0 20px 20px 20px' }"
        />
    </div>
</template>

<style scoped>
.codeblock-wrap { margin-top: 36px; }
.code-label {
    font-size: 14px;
    font-weight: 600;
    color: #e7e4e0;
    padding: 6px 12px;
    background: #3d3028;
    border-radius: 10px 10px 0 0;
    display: inline-block;
}
</style>
