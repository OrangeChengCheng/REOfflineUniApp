/*
 * @Author: Lemon C
 * @Date: 2024-04-19 12:22:25
 * @LastEditTime: 2026-01-22 15:47:46
 */
import { requestPost, requestGet } from '@/service/request';





// MOD-- 分享 相关
// 获取分享链接信息
export function getSharedUrlInfo(shareId: string) {
    return requestPost(`/share/v3/longUrl/${shareId}`);
}


// MOD-- 场景 相关
// 获取场景信息
export function getSceneById(sceneId: string) {
    return requestGet(`/scene/v3/${sceneId}`);
}

