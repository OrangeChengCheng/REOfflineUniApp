<!--
 * @Author: Lemon C
 * @Date: 2026-01-22 10:16:05
 * @LastEditTime: 2026-01-22 10:19:56
-->
<template>
    <view class="content">
        <image class="logo" src="/static/logo.png" />
        <view class="text-area">
            <text class="title">{{ title }}</text>
        </view>
        <view @click.stop="btnAction">点击我</view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const title = ref('Hello');

const reModule = uni.requireNativePlugin('REUniPlugin-REModule');

const btnAction = () => {
    reModule.testAsyncFunc(
        {
            name: 'uni-app',
            age: 12,
        },
        (ret: any) => {
            uni.showToast({
                title: '调用异步方法' + ret,
                icon: 'none',
            });
        }
    );
};
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
