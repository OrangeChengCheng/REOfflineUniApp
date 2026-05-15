/*
 * @Author: Lemon C
 * @Date: 2024-09-14 10:05:14
 * @LastEditTime: 2026-05-14 15:09:41
 */
import config from './config'
import reApi from './reApi'
import uniApi from './uniApi'
import tool from './tool'
import serviceApi from './serviceApi'
import downloadTool from './downloadTool'


export default {
    install() {
        if (!uni || typeof uni !== 'object') {
            return;
        }
        uni.$service = {
            commonTimeout: config.getTimeout(),
            getSceneInfo: serviceApi.getSceneInfo,
            getSceneTree: serviceApi.getSceneTree,
            getModelTree: serviceApi.getModelTree,
            getProjectTreeSubNodes: serviceApi.getProjectTreeSubNodes,
            getProjectTreeSubNodesByLazy: serviceApi.getProjectTreeSubNodesByLazy,
            getProjectTreeChildren: serviceApi.getProjectTreeChildren,
            getProjectTreeChildrenByLazy: serviceApi.getProjectTreeChildrenByLazy,
            getDataSetList: serviceApi.getDataSetList,
            getCadDataSetList: serviceApi.getCadDataSetList,
            getExtrudeTexList: serviceApi.getExtrudeTexList,
            isRoomExistService: serviceApi.isRoomExistService,
            getRoomList: serviceApi.getRoomList,
            getRoomElement: serviceApi.getRoomElement,
            getRoomInfo: serviceApi.getRoomInfo,
            getProjectParam: serviceApi.getProjectParam,
            getVectorParam: serviceApi.getVectorParam,
            getElemParamTypeService: serviceApi.getElemParamTypeService,
            getElemParamService: serviceApi.getElemParamService,
        };
        uni.$re = {
            unipluginLog: reApi.unipluginLog,
            isNavivePlugin: reApi.isNavivePlugin,
            realEngineRender: reApi.realEngineRender,
            registerAppMsg: reApi.registerAppMsg,
            sendMsgUniToApp: reApi.sendMsgUniToApp,
            
            
            showOfflineEngine: reApi.showOfflineEngine,
            safAuthorDocument: reApi.safAuthorDocument,
            fileGetAllChild: reApi.fileGetAllChild,
            fileGetChildBySuffix: reApi.fileGetChildBySuffix,
            fileDelAllSubFile: reApi.fileDelAllSubFile,
            fileGetAppRootFolder: reApi.fileGetAppRootFolder,
            fileCopyFile: reApi.fileCopyFile,
            fileCopyFolder: reApi.fileCopyFolder,
            fileExist: reApi.fileExist,
            fileCreateFolder: reApi.fileCreateFolder,
            unzipFile: reApi.unzipFile,
            zipGetComments: reApi.zipGetComments,
            dbQuery: reApi.dbQuery,
            dbTableExist: reApi.dbTableExist,
        };
        uni.$tool = {
            toPromise: tool.toPromise,
            update_data: tool.update_data,
            del_data: tool.del_data,
            getAppVersion: tool.getAppVersion,
            initializeData: tool.initializeData,
            url_base: tool.url_base,
            time_To_IOSDate: tool.time_To_IOSDate,
            time_compare: tool.time_compare,
            time_format: tool.time_format,
        };
        uni.$downloadTool = {
            downloadFile:downloadTool.downloadFile,
        };
        uni.scan_code = uniApi.scan_code;
        uni.show_loading = uniApi.show_loading;
        uni.hide_loading = uniApi.hide_loading;
        uni.get_SystemInfo = uniApi.get_SystemInfo;
        uni.pop_showModal = uniApi.pop_showModal;
        uni.pop_showToast = uniApi.pop_showToast;
        uni.file_download = uniApi.file_download;
    }
}