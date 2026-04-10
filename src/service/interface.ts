/*
 * @Author: Lemon C
 * @Date: 2024-04-19 12:22:25
 * @LastEditTime: 2026-04-10 11:34:14
 */
import { requestPost, requestGet } from '@/service/offlineService';





// // MOD-- 分享 相关
// // 获取分享链接信息
// export function getSharedUrlInfo(shareId: string) {
//     return requestPost(`/share/v3/longUrl/${shareId}`);
// }


// MOD-- 场景 相关
// 获取场景信息
export function getSceneById(sceneId: any) {
    return requestGet(`/scene/v3`, sceneId);
    // return requestGet(`/scene/v3/${sceneId}`);
}



// MOD-- 目录树 相关
// 根据场景ID查询树
export function getSingleSceneTreeById(data: any) {
    return requestPost('/sceneTree/v3/getTreeById', data);
}

// 获取模型目录树
export function getProjectTree(data: any) {
    return requestPost('/dataSet/v3/dataSetRootNodes', data);
}

// 请求模型目录树子节点
export function getProjectTreeSubNodes(data: any) {
    return requestPost('/dataSet/v3/dataSetFileTreeNodes', data);
}

// 请求模型目录树子节点-懒加载
export function getProjectTreeSubNodesByLazy(data: any) {
    return requestPost('/dataSet/v3/dataSetFileTreeNodes/lazy', data);
}

// 是否具有空间信息
export function isRoomExistService(data: any) {
    return requestPost('/engine/v3/room/exists', data);
}

// 获取空间信息
export function getRoomList(data: any) {
    return requestPost('/engine/v3/room/list', data);
}


// MOD-- 数据集 相关
// 获取工程信息模型
export function getProjectModel(data: any) {
    return requestPost('/dataSet/v3/viewDataSetModel', data);
}

// MOD-- CAD 相关
// 获取数据集下的文件列表
export function getCadDatasetFiles(data: any) {
    return requestPost('/cadTree/v3/file/list', data);
}