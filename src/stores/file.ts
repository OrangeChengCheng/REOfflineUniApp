import { defineStore } from 'pinia';


interface FileState {
    rootPath: string;
    fileName: string;
    fileResType: number;
}

export const useFileStore = defineStore('file', {
    state: (): FileState => ({
        rootPath: "storage/emulated/0/Android/data/com.realengine.androidofflineapp/files/REOfflineDoc",// 文件根目录
        fileName: "",// 文件名
        fileResType: 0,//文件资源类型 0: 类型错误 1: 单一模型/模型组 2: 场景
    }),
    actions: {

    }
});