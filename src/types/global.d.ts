/*
 * @Author: Lemon C
 * @Date: 2024-09-13 18:01:53
 * @LastEditTime: 2026-04-29 17:51:15
 */


import type { Uni as _Uni } from '@dcloudio/types'

declare global {
    /**
     * 拓展全局变量Uni
    */
    interface Uni extends _Uni {
        $re: {
            isNavivePlugin(): boolean;
            unipluginLog(log: string): void;
            realEngineRender(data: any): Promise<any>;
            registerAppMsg(onCallBack: (data: any) => void): Promise<void>;
            sendMsgUniToApp(data: any): void;

            selFile(data: any, onCallBack: (data: any) => void): void;
            
            
            showOfflineEngine(data: any, onCallBack: (data: any) => void): void;
            fileGetAllChild(data: any, onCallBack: (data: any) => void): void;
            fileGetChildBySuffix(data: any, onCallBack: (data: any) => void): void;
            fileDelAllSubFile(data: any, onCallBack: (data: any) => void): void;
            fileGetAppRootFolder(data: any, onCallBack: (data: any) => void): void;
            fileCopyFile(data: any, onCallBack: (data: any) => void): void;
            fileExist(data: any, onCallBack: (data: any) => void): void;
            unzipFile(data: any, onCallBack: (data: any) => void): void;
            zipGetComments(data: any, onCallBack: (data: any) => void): void;
            dbQuery(data: any, onCallBack: (data: any) => void): void;
            dbTableExist(data: any, onCallBack: (data: any) => void): void;
        }
        $service: {
            commonTimeout: number,
            getSceneInfo(params: any): Promise<any>;
            getSceneTree(params: any, sceneInfo: any): Promise<any>;
            getModelTree(params: any): Promise<any>;
            getProjectTreeSubNodes(params: any): Promise<any>;
            getProjectTreeSubNodesByLazy(params: any): Promise<any>;
            getProjectTreeChildren(params: any): Promise<any>;
            getProjectTreeChildrenByLazy(params: any): Promise<any>;
            getDataSetList(params: any): Promise<any>;
            getCadDataSetList(params: any): Promise<any>;
            getExtrudeTexList(): Promise<any>;
            isRoomExistService(params: any): Promise<any>;
            getRoomList(params: any): Promise<any>;
            getRoomElement(params: any): Promise<any>;
            getRoomInfo(params: any): Promise<any>;
            getProjectParam(params: any): Promise<any>;
            getVectorParam(params: any): Promise<any>;
            getElemParamTypeService(params: any): Promise<any>;
            getElemParamService(params: any): Promise<any>;
        };
        $tool: {
            toPromise<T = any>(fn: (callback: (res: any) => void) => void): Promise<T>;
            update_data(): void;
            del_data(): void;
            getAppVersion(): string;
            initializeData(): void;
            url_base(url: string): string;
            time_To_IOSDate(timeStr: string): string;
            time_compare(frontTime: Date, backTime: Date): string;
            time_format(utcTime: Date): string;
        };
        $downloadTool: {
            downloadFile(url: any, onProgress?: (progress: number) => void): Promise<any>;
        };
        scan_code(): Promise<any>;
        show_loading(): void;
        hide_loading(): void;
        get_SystemInfo(): any;
        pop_showModal(title: any, content: any): Promise<any>;
        file_download(title: any, holder: any): Promise<any>;
    }
}



