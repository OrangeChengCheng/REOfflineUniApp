<!--
 * @Author: Lemon C
 * @Date: 2026-01-22 10:16:05
 * @LastEditTime: 2026-01-22 15:53:57
-->
<template>
    <view class="content">
        <image class="logo" src="/static/logo.png" />
        <view class="text-area">
            <text class="title">{{ title }}</text>
        </view>
        <view @click.stop="shouEngine">展示引擎</view>
        <view @click.stop="downloadFile">下载文件</view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const title = ref('Hello');

const shouEngine = () => {
    uni.$re.unipluginLog('shouEngine');
    uni.$re
        .realEngineRender({
            name: 'uni-app',
        })
        .then((result) => {
            uni.$re.unipluginLog(JSON.stringify(result));
        });
};

const downloadFile = () => {};
</script>

<style>
.content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.logo {
    height: 200rpx;
    width: 200rpx;
    margin-top: 200rpx;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 50rpx;
}

.text-area {
    display: flex;
    justify-content: center;
}

.title {
    font-size: 36rpx;
    color: #8f8f94;
}
</style>
