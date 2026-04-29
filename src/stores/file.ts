/*
 * @Author: Lemon C
 * @Date: 2026-03-20 17:12:59
 * @LastEditTime: 2026-04-29 12:15:59
 */
import { defineStore } from 'pinia';


interface FileState {
    appRootPath: string;
    resRootPath: string;
    fileName: string;
    filePath: string;
    fileResType: number;
}

export const useFileStore = defineStore('file', {
    state: (): FileState => ({
        appRootPath: "/storage/emulated/0/Android/data/com.realengine.androidofflineapp",// 应用根目录
        resRootPath: "/storage/emulated/0/Android/data/com.realengine.androidofflineapp/files/REOfflineDoc",// 资源根目录
        fileName: "",// 文件名
        filePath: "",// 文件地址
        fileResType: 0,//文件资源类型 0: 类型错误 1: 单一模型/模型组 2: 场景
    }),
    actions: {

    }
});