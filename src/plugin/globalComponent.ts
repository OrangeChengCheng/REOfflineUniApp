/*
 * @Author: Lemon C
 * @Date: 2024-08-26 12:39:38
 * @LastEditTime: 2024-08-26 18:15:01
 */
import IconFont from '@/components/iconfont/iconfont.vue'

const allGlobalComponents = {
    IconFont
}

export default {
    install(app : any) {
        // 注册项目的全部公共组件
        Object.values(allGlobalComponents).forEach((component) => {
            if (typeof component.name === 'string') {
                app.component(component.name, component);
            } else {
                console.error(`Component does not have a valid "name" property.`);
            }
        })
    }
}