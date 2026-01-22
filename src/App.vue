<!--
 * @Author: Lemon C
 * @Date: 2026-01-22 10:16:05
 * @LastEditTime: 2026-01-22 15:36:20
-->
<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
onLaunch(() => {
    console.log('App Launch');
});
onShow(() => {
    console.log('App Show');
});
onHide(() => {
    console.log('App Hide');
});
</script>

<style lang="scss">
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html,
body {
    width: 100vw;
    height: 100vh;
    position: relative;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
    &::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
    }
}
#app {
    font-family: SourceHanSansCN, SourceHanSansCN;
    font-weight: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    width: 100vw;
    height: 100vh;
}
</style>
