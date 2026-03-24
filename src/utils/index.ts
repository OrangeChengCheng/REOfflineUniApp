/*
 * @Author: Lemon C
 * @Date: 2024-09-14 10:05:14
 * @LastEditTime: 2026-03-24 11:52:09
 */
import config from './config'
import reApi from './reApi'
import uniApi from './uniApi'
import tool from './tool'
import serviceApi from './serviceApi'


export default {
    install() {
        if (!uni || typeof uni !== 'object') {
            return;
        }
        uni.$service = {
            commonTimeout: config.getTimeout(),
            isSharedRoomExistService: serviceApi.isSharedRoomExistService,
            getDataSetList: serviceApi.getDataSetList,
            getSceneInfo: serviceApi.getSceneInfo,
        };
        uni.$re = {
            unipluginLog: reApi.unipluginLog,
            isNavivePlugin: reApi.isNavivePlugin,
            realEngineRender: reApi.realEngineRender,
            registerAppMsg: reApi.registerAppMsg,
            sendMsgUniToApp: reApi.sendMsgUniToApp,
            unzipFile: reApi.unzipFile,
            saveUniFile: reApi.saveUniFile,
            useFileUniToApp: reApi.useFileUniToApp,
            getLocFileList: reApi.getLocFileList,
            delFile: reApi.delFile,
            selFile: reApi.selFile,
            showOfflineEngine: reApi.showOfflineEngine,
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
        uni.scan_code = uniApi.scan_code;
        uni.show_loading = uniApi.show_loading;
        uni.hide_loading = uniApi.hide_loading;
    }
}