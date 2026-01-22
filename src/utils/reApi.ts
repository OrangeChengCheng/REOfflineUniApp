/*
 * @Author: Lemon C
 * @Date: 2024-09-14 14:22:08
 * @LastEditTime: 2026-01-22 15:47:22
 */


interface ApiMethods {
    unipluginLog(log: string): void;
    realEngineRender(data: any): Promise<any>;
    getREModule(): any;
    registerAppMsg(onCallBack: (data: any) => void): Promise<void>; // 添加一个回调参数来处理每条消息
    sendMsgUniToApp(data: any): void;
}

const api: ApiMethods = {
    // MARK re-api 获取插件对象
    getREModule: (): any => {
        if (Object.prototype.hasOwnProperty.call(uni, 'requireNativePlugin')) {
            return uni.requireNativePlugin('REUniPlugin-REModule');
        } else {
            return null;
        }
    },

    // MARK re-api 插件打印信息
    unipluginLog: (log: string) => {
        api.getREModule()?.unipluginLog({ msg: log });
    },

    // MARK re-api 加载模型
    realEngineRender: (data: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            api.unipluginLog('render: ' + JSON.stringify(data));
            api.getREModule()?.realEngineRender(data, (ret: any) => {
                resolve(ret);
            });
        });
    },

    // MARK re-api 原生&uni-app通信
    registerAppMsg: async (onCallBack: (data: any) => void): Promise<void> => {
        const reModule = api.getREModule();
        if (reModule && reModule.registerAppMsg) {
            reModule.registerAppMsg((res: any) => {
                api.unipluginLog('registerAppMsg: ' + JSON.stringify(res));
                // 不能使用promise的resolve进行返回，要使用传递回调进行处理，不然resolve执行后函数就结束，无法再次执行resolve，需要保持函数一直在，使用参数的回调
                onCallBack(res);
            });
        } else {
            api.unipluginLog('registerAppMsg: 消息监听机制加载失败');
        }
    },

    // MARK re-api 向app发送数据
    sendMsgUniToApp: (data: any) => {
        api.getREModule()?.sendMsgUniToApp(data);
    },


}

export default api;