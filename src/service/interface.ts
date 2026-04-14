/*
 * @Author: Lemon C
 * @Date: 2024-04-19 12:22:25
 * @LastEditTime: 2026-04-13 10:46:41
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

// 请求模型目录树下的构件ID
export function getProjectTreeChildren(data: any) {
    return requestPost('/element/v3/getTreeChildren', data);
}

// 请求模型目录树下的构件ID-懒加载
export function getProjectTreeChildrenByLazy(data: any) {
    return requestPost('/element/v3/getTreeChildren/lazy', data);
}

// 是否具有空间信息
export function isRoomExistService(data: any) {
    return requestPost('/engine/v3/room/exists', data);
}

// 获取空间信息
export function getRoomList(data: any) {
    return requestPost('/engine/v3/room/list', data);
}

// 获取房间构件
export function getRoomElement(data: any) {
    return requestPost('/element/v3/getRoomTreeChildren', data);
}

// 获取房间信息
export function getRoomInfo(data: any) {
    return requestPost('/engine/v3/room/element/parameter/list', data);
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


// MOD-- 属性 相关
// 查询模型属性
export function getProjectParam(data: any) {
    return requestPost('/element/v3/getElementParam', data);
}

// 获取矢量属性信息
export function getVectorParam(data: any) {
    return requestPost('/element/v3/getVectorParam', data);
}

// 查询构件属性类型
export function getElemParamTypeService(data: any) {
    return requestPost('/componentLibrary/v3/getComponentParamTypes', data);
}

// 查询构件属性
export function getElemParamService(data: any) {
    return requestPost('/componentLibrary/v3/getComponentProperty', data);
}