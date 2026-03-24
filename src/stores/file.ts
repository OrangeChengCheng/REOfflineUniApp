import { defineStore } from 'pinia';


interface FileState {
    rootPath: string;
    fileName: string;
}

export const useFileStore = defineStore('file', {
    state: (): FileState => ({
        rootPath: "storage/emulated/0/Android/data/com.realengine.androidofflineapp/files/REOfflineDoc",// 文件根目录
        fileName: "",// 文件名
    }),
    actions: {
        
    }
});