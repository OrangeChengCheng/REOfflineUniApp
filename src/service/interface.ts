/*
 * @Author: Lemon C
 * @Date: 2024-04-19 12:22:25
 * @LastEditTime: 2026-03-24 15:31:54
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

// 是否具有空间信息
export function isSharedRoomExistService(data: any) {
    return requestPost('/engine/v3/room/exists', data);
}


// MOD-- 数据集 相关
// 获取工程信息模型
export function getProjectModel(data: any) {
    return requestPost('/dataSet/v3/viewDataSetModel', data);
}