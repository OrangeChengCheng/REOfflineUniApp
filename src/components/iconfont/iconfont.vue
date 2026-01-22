<!--
 * @Author: Lemon C
 * @Date: 2024-08-26 17:05:26
 * @LastEditTime: 2024-08-26 18:16:23
-->
<template>
    <text class="iconfont" :class="symbolId" :style="[{ color: color_computed, fontSize: size }]" @click="$emit('click', $event)"></text>
</template>

<script setup>
import { defineProps, computed } from 'vue';

defineOptions({
    name: 'IconFont',
});

const props = defineProps({
    prefix: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        default: '--color-main-blue',
    },
    size: {
        type: String,
        default: '30px',
    },
});

const symbolId = computed(() => `${props.prefix}${props.name}`);
const color_computed = computed(() => {
    if (props.color.includes('--')) {
        return `var(${props.color})`;
    } else if (props.color.includes('#')) {
        return `${props.color}`;
    } else if (props.color.length == 6) {
        return `#${props.color}`;
    } else {
        return 'var(--color-main-blue)';
    }
});
</script>

<style scoped>
.iconfont {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: inherit;
}
</style>
