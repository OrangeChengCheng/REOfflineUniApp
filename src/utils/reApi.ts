/*
 * @Author: Lemon C
 * @Date: 2024-09-14 14:22:08
 * @LastEditTime: 2026-05-15 17:11:44
 */


interface ApiMethods {
    unipluginLog(log: string): void;
    realEngineRender(data: any): Promise<any>;
    getREModule(): any;
    isNavivePlugin(): boolean;
    registerAppMsg(onCallBack: (data: any) => void): Promise<void>; // 添加一个回调参数来处理每条消息
    sendMsgUniToApp(data: any): void;



    showOfflineEngine(data: any, onCallBack: (data: any) => void): void;

    safAuthorDocument(data: any, onCallBack: (data: any) => void): void;

    fileGetAllChild(data: any, onCallBack: (data: any) => void): void;
    fileGetChildBySuffix(data: any, onCallBack: (data: any) => void): void;
    fileDelAllSubFile(data: any, onCallBack: (data: any) => void): void;
    fileGetAppRootFolder(data: any, onCallBack: (data: any) => void): void;
    fileCopyFile(data: any, onCallBack: (data: any) => void): void;
    fileCopyFolder(data: any, onCallBack: (progress: any) => void, onProgress?: (progress: any) => void): void;
    fileExist(data: any, onCallBack: (data: any) => void): void;
    fileCreateFolder(data: any, onCallBack: (data: any) => void): void;

    unzipFile(data: any, onCallBack: (progress: any) => void, onProgress?: (progress: any) => void): void;
    zipGetComments(data: any, onCallBack: (data: any) => void): void;

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












    // MOD-- 引擎模块 <---
    // 模型渲染
    showOfflineEngine: (data: any, onCallBack: (data: any) => void) => {
        const module = api.getREModule();
        if (!module) { onCallBack({ success: false, data: null, msg: "RE 模块未初始化" }); return; }
        module.showOfflineEngine(data, (res: any) => {
            onCallBack(res);
        });
    },


    // MOD-- 文件模块（SAF） <---
    // 授权指定的文件夹
    safAuthorDocument: (data: any, onCallBack: (data: any) => void) => {
        const module = api.getREModule();
        if (!module) { onCallBack({ success: false, data: null, msg: "RE 模块未初始化" }); return; }
        module.safAuthorDocument(data, (res: any) => {
            onCallBack(res);
        });
    },


    // MOD-- 文件模块（沙盒） <---
    // 获取指定文件夹下所有文件列表
    fileGetAllChild: (data: any, onCallBack: (data: any) => void) => {
        const module = api.getREModule();
        if (!module) { onCallBack({ success: false, data: null, msg: "RE 模块未初始化" }); return; }
        module.fileGetAllChild(data, (res: any) => {
            onCallBack(res);
        });
    },

    // 获取文件夹内指定后缀的文件列表
    fileGetChildBySuffix: (data: any, onCallBack: (data: any) => void) => {
        const module = api.getREModule();
        if (!module) { onCallBack({ success: false, data: null, msg: "RE 模块未初始化" }); return; }
        module.fileGetChildBySuffix(data, (res: any) => {
            onCallBack(res);
        });
    },

    // 递归删除指定路径下的所有内容
    fileDelAllSubFile: (data: any, onCallBack: (data: any) => void) => {
        const module = api.getREModule();
        if (!module) { onCallBack({ success: false, data: null, msg: "RE 模块未初始化" }); return; }
        module.fileDelAllSubFile(data, (res: any) => {
            onCallBack(res);
        });
    },

    // 获取沙盒默认存储路径（外部存储）
    fileGetAppRootFolder: (data: any, onCallBack: (data: any) => void) => {
        const module = api.getREModule();
        if (!module) { onCallBack({ success: false, data: null, msg: "RE 模块未初始化" }); return; }
        module.fileGetAppRootFolder(data, (res: any) => {
            onCallBack(res);
        });
    },

    // 拷贝单个文件（外部存储）
    fileCopyFile: (data: any, onCallBack: (data: any) => void) => {
        const module = api.getREModule();
        if (!module) { onCallBack({ success: false, data: null, msg: "RE 模块未初始化" }); return; }
        module.fileCopyFile(data, (res: any) => {
            onCallBack(res);
        });
    },

    // 拷贝文件夹（递归，带进度）
    fileCopyFolder: (data: any, onCallBack: (progress: any) => void, onProgress?: (progress: any) => void) => {
        const module = api.getREModule();
        if (!module) { onCallBack({ success: false, data: null, msg: "RE 模块未初始化" }); return; }
        module.fileCopyFolder(data, (res: any) => {
            if (res.data?.status === 'progress') {
                onProgress?.(res.data.data);
            } else if (res.data?.status === 'success') {
                onCallBack(res.data);
            } else {
                onCallBack(res);
            }
        });
    },

    // 判断文件是否存在
    fileExist: (data: any, onCallBack: (data: any) => void) => {
        const module = api.getREModule();
        if (!module) { onCallBack({ success: false, data: null, msg: "RE 模块未初始化" }); return; }
        module.fileExist(data, (res: any) => {
            onCallBack(res);
        });
    },

    // 创建文件夹
    fileCreateFolder: (data: any, onCallBack: (data: any) => void) => {
        const module = api.getREModule();
        if (!module) { onCallBack({ success: false, data: null, msg: "RE 模块未初始化" }); return; }
        module.fileCreateFolder(data, (res: any) => {
            onCallBack(res);
        });
    },

    // MOD-- 压缩包模块 <---
    // 解压ZIP文件（支持加密，带进度）
    unzipFile: (data: any, onCallBack: (progress: any) => void, onProgress?: (progress: any) => void) => {
        const module = api.getREModule();
        if (!module) { onCallBack({ success: false, data: null, msg: "RE 模块未初始化" }); return; }
        module.unzipFile(data, (res: any) => {
            if (res.data?.status === 'progress') {
                onProgress?.(res.data.data);
            } else if (res.data?.status === 'success') {
                onCallBack(res.data);
            } else {
                onCallBack(res);
            }
        });
    },

    // 仅读取ZIP注释信息（不解压/支持加密）
    zipGetComments: (data: any, onCallBack: (data: any) => void) => {
        const module = api.getREModule();
        if (!module) { onCallBack({ success: false, data: null, msg: "RE 模块未初始化" }); return; }
        module.zipGetComments(data, (res: any) => {
            onCallBack(res);
        });
    },


    // MOD-- 数据库模块 <---
    // 数据库查询
    dbQuery: (data: any, onCallBack: (data: any) => void) => {
        const module = api.getREModule();
        if (!module) { onCallBack({ success: false, data: null, msg: "RE 模块未初始化" }); return; }
        module.dbQuery(data, (res: any) => {
            onCallBack(res);
        });
    },

    // 查表是否存在
    dbTableExist: (data: any, onCallBack: (data: any) => void) => {
        const module = api.getREModule();
        if (!module) { onCallBack({ success: false, data: null, msg: "RE 模块未初始化" }); return; }
        module.dbTableExist(data, (res: any) => {
            onCallBack(res);
        });
    },


}

export default api;