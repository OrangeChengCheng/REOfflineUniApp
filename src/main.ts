import { createSSRApp } from "vue";
import App from "./App.vue";
import * as Pinia from 'pinia';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn' //1 引入中文
import GlobalComponents from "./plugin/globalComponent";
import tool from "@/utils"



export function createApp() {
    const app = createSSRApp(App);
    const pinia = Pinia.createPinia();

    app.use(pinia);
    app.use(tool);

    app.use(ElementPlus, {
        locale: zhCn //2 这里使用中文
    });

    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
        app.component(key, component)
    }

    app.use(GlobalComponents); // 全局注册vue组件

    return {
        app,
        pinia,
    };
}
