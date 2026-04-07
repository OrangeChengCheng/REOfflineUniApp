/*
 * @Author: Lemon C
 * @Date: 2024-09-14 14:22:08
 * @LastEditTime: 2026-04-07 17:03:30
 */


interface ApiMethods {
    unipluginLog(log: string): void;
    realEngineRender(data: any): Promise<any>;
    getREModule(): any;
    isNavivePlugin(): boolean;
    registerAppMsg(onCallBack: (data: any) => void): Promise<void>; // 添加一个回调参数来处理每条消息
    sendMsgUniToApp(data: any): void;
    unzipFile(data: any, onCallBack: (data: any) => void): void;
    saveUniFile(data: any, onCallBack: (data: any) => void): void;
    getLocFileList(data: any, onCallBack: (data: any) => void): void;
    useFileUniToApp(data: any, onCallBack: (data: any) => void): void;
    file_getChildBySuffix(data: any, onCallBack: (data: any) => void): void;
    delFile(data: any, onCallBack: (data: any) => void): void;
    selFile(data: any, onCallBack: (data: any) => void): void;
    showOfflineEngine(data: any, onCallBack: (data: any) => void): void;
    dbQuery(data: any, onCallBack: (data: any) => void): void;
    dbTableExist(data: any, onCallBack: (data: any) => void): void;
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

    // MARK re-api 判断是否是插件
    isNavivePlugin: (): boolean => {
        return api.getREModule() ? true : false;
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



    unzipFile: (data: any, onCallBack: (data: any) => void) => {
        api.getREModule()?.unzipFile(data, (res: any) => {
            // 不能使用promise的resolve进行返回，要使用传递回调进行处理，不然resolve执行后函数就结束，无法再次执行resolve，需要保持函数一直在，使用参数的回调
            onCallBack(res);
        });
    },


    saveUniFile: (data: any, onCallBack: (data: any) => void) => {
        api.getREModule()?.saveUniFile(data, (res: any) => {
            // 不能使用promise的resolve进行返回，要使用传递回调进行处理，不然resolve执行后函数就结束，无法再次执行resolve，需要保持函数一直在，使用参数的回调
            onCallBack(res);
        });
    },


    useFileUniToApp: (data: any, onCallBack: (data: any) => void) => {
        const module = api.getREModule();
        if (!module) { onCallBack({ success: false, data: null, msg: "RE 模块未初始化" }); return; }
        module.useFileUniToApp(data, (res: any) => {
            // 不能使用promise的resolve进行返回，要使用传递回调进行处理，不然resolve执行后函数就结束，无法再次执行resolve，需要保持函数一直在，使用参数的回调
            onCallBack(res);
        });
    },

    file_getChildBySuffix: (data: any, onCallBack: (data: any) => void) => {
        const module = api.getREModule();
        if (!module) { onCallBack({ success: false, data: null, msg: "RE 模块未初始化" }); return; }
        module.fileGetChildBySuffix(data, (res: any) => {
            // 不能使用promise的resolve进行返回，要使用传递回调进行处理，不然resolve执行后函数就结束，无法再次执行resolve，需要保持函数一直在，使用参数的回调
            onCallBack(res);
        });
    },


    getLocFileList: (data: any, onCallBack: (data: any) => void) => {
        api.getREModule()?.getLocFileList(data, (res: any) => {
            // 不能使用promise的resolve进行返回，要使用传递回调进行处理，不然resolve执行后函数就结束，无法再次执行resolve，需要保持函数一直在，使用参数的回调
            onCallBack(res);
        });
    },


    delFile: (data: any, onCallBack: (data: any) => void) => {
        api.getREModule()?.delFile(data, (res: any) => {
            // 不能使用promise的resolve进行返回，要使用传递回调进行处理，不然resolve执行后函数就结束，无法再次执行resolve，需要保持函数一直在，使用参数的回调
            onCallBack(res);
        });
    },

    selFile: (data: any, onCallBack: (data: any) => void) => {
        api.getREModule()?.selFile(data, (res: any) => {
            // 不能使用promise的resolve进行返回，要使用传递回调进行处理，不然resolve执行后函数就结束，无法再次执行resolve，需要保持函数一直在，使用参数的回调
            onCallBack(res);
        });
    },

    showOfflineEngine: (data: any, onCallBack: (data: any) => void) => {
        const module = api.getREModule();
        if (!module) { onCallBack({ success: false, data: null, msg: "RE 模块未初始化" }); return; }
        module.showOfflineEngine(data, (res: any) => {
            // 不能使用promise的resolve进行返回，要使用传递回调进行处理，不然resolve执行后函数就结束，无法再次执行resolve，需要保持函数一直在，使用参数的回调
            onCallBack(res);
        });
    },

    dbQuery: (data: any, onCallBack: (data: any) => void) => {
        const module = api.getREModule();
        if (!module) { onCallBack({ success: false, data: null, msg: "RE 模块未初始化" }); return; }
        module.dbQuery(data, (res: any) => {
            // 不能使用promise的resolve进行返回，要使用传递回调进行处理，不然resolve执行后函数就结束，无法再次执行resolve，需要保持函数一直在，使用参数的回调
            onCallBack(res);
        });
    },

    dbTableExist: (data: any, onCallBack: (data: any) => void) => {
        api.getREModule()?.dbTableExist(data, (res: any) => {
            // 不能使用promise的resolve进行返回，要使用传递回调进行处理，不然resolve执行后函数就结束，无法再次执行resolve，需要保持函数一直在，使用参数的回调
            onCallBack(res);
        });
    },


}

export default api;