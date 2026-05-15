/*
 * @Author: Lemon C
 * @Date: 2026-03-20 17:12:59
 * @LastEditTime: 2026-05-13 15:42:13
 */
import { defineStore } from 'pinia';


interface FileState {
    documentType: number;
    appRootPath: string;
    resRootPath: string;
    uniDownloadTempPath: string;
    unzipPassword: string;
    fileName: string;
    filePath: string;
    fileResType: number;
}

export const useFileStore = defineStore('file', {
    state: (): FileState => ({
        documentType: 0,//文件模式 0：沙盒模式  1：U盘模式
        // appRootPath_android_t: "/storage/emulated/0/Android/data/com.realengine.androidofflineapp",// 应用根目录
        // appRootPath_ios_t: "/Users/apple/Library/Containers/5D32538B-2C7A-4CD7-AB8F-3DD1CABD819A/Data",// 应用根目录
        appRootPath: "",// 应用根目录
        // resRootPath_android_t: "/storage/emulated/0/Android/data/com.realengine.androidofflineapp/files/REOfflineDoc",// 资源根目录
        // resRootPath_ios_t: "/Users/apple/Library/Containers/5D32538B-2C7A-4CD7-AB8F-3DD1CABD819A/Data/Documents/REOfflineDoc",// 资源根目录
        resRootPath: "",// 资源根目录
        uniDownloadTempPath: "",// uniapp api下载的临时路径
        unzipPassword: "@Yr5!Uk9$Bn3*Lp6#Qj8&Mx2",// 资源压缩包解压密码
        fileName: "",// 文件名
        filePath: "",// 文件地址
        fileResType: 0,//文件资源类型 0: 类型错误 1: 单一模型/模型组 2: 场景
    }),
    actions: {
        async update_rootPath(e: any) {
            const roolFolder = await uni.$tool.toPromise((cb: any) => uni.$re.fileGetAppRootFolder({}, cb));
            if (!roolFolder.data) return { data: null, isSuccess: false, errMsg: "应用存储文件获取失败", };

            const roolFolderPath = roolFolder.data.filePath;
            this.appRootPath = roolFolderPath;

            if (!e || !e.osName || e.osName === 'ios') {
                this.resRootPath = roolFolderPath + "/Documents/REOfflineDoc";
                this.uniDownloadTempPath = roolFolderPath + "/Library/Pandora/apps";
            } else {
                this.resRootPath = roolFolderPath + "/files/REOfflineDoc";
                this.uniDownloadTempPath = roolFolderPath + "/apps";
            }

            // 判断资源根目录是否存在
            const res_fileExist = await uni.$tool.toPromise((cb: any) => uni.$re.fileExist({ filePath: this.resRootPath }, cb));
            if (!res_fileExist.data) {
                // 创建资源根目录
                await uni.$tool.toPromise((cb: any) => uni.$re.fileCreateFolder({ folderPath: this.resRootPath }, cb));
            }
        },
    }
});