/*
 * @Author: Lemon C
 * @Date: 2025-11-19 14:50:45
 * @LastEditTime: 2026-01-22 15:45:40
 */
import {
    getSharedUrlInfo,
} from '@/service/interface';




interface ApiMethods {
    getSharedUrlInfo(params: any): Promise<any>;
}

const api: ApiMethods = {
    // MARK Service 根据分享id获取分享url信息
    getSharedUrlInfo: async (params: any): Promise<any> => {
        try {
            const res = await getSharedUrlInfo(params);
            if (res.isSuccess) {
                if (!res.data) {
                    throw new Error(res.errMsg || '获取分享信息失败');
                }
                let shareUrlInfo = res.data;
                if (!shareUrlInfo || !shareUrlInfo.shareItem.platformMode || !shareUrlInfo.shareItem.loginMode) {
                    shareUrlInfo.shareItem.source = 0;
                    return shareUrlInfo;
                }
                // 判断分享链接来源 0: 私有化 1：黑洞 2：星河 3: 星云
                if (shareUrlInfo.shareItem.loginMode.value === 'Private') {
                    shareUrlInfo.shareItem.source = 0;
                    return shareUrlInfo;
                }
                if (shareUrlInfo.shareItem.platformMode.value === 'BlackHole') {
                    shareUrlInfo.shareItem.source = 1;
                    return shareUrlInfo;
                } else if (shareUrlInfo.shareItem.platformMode.value === 'StarRiver') {
                    shareUrlInfo.shareItem.source = 2;
                    return shareUrlInfo;
                } else if (shareUrlInfo.shareItem.platformMode.value === 'Nebula') {
                    shareUrlInfo.shareItem.source = 3;
                    return shareUrlInfo;
                } else {
                    shareUrlInfo.shareItem.source = 0;
                    return shareUrlInfo;
                }
            } else {
                throw new Error(res.errMsg || '获取分享信息失败');
            }
        } catch (error) {
            throw error;
        }
    },


}


export default api;