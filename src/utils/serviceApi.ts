/*
 * @Author: Lemon C
 * @Date: 2025-11-19 14:50:45
 * @LastEditTime: 2026-03-24 12:15:58
 */
import {
    isSharedRoomExistService,
    getProjectModel,
    getSceneById,
} from '@/service/interface';

import dataTool from '@/utils/dataTool';



interface ApiMethods {
    // getSharedUrlInfo(params: any): Promise<any>;
    isSharedRoomExistService(params: any): Promise<any>;
    getDataSetList(params: any): Promise<any>;
    getSceneInfo(params: any): Promise<any>;
}

const api: ApiMethods = {
    // // MARK Service 根据分享id获取分享url信息
    // getSharedUrlInfo: async (params: any): Promise<any> => {
    //     try {
    //         const res = await getSharedUrlInfo(params);
    //         if (res.isSuccess) {
    //             if (!res.data) {
    //                 throw new Error(res.errMsg || '获取分享信息失败');
    //             }
    //             let shareUrlInfo = res.data;
    //             if (!shareUrlInfo || !shareUrlInfo.shareItem.platformMode || !shareUrlInfo.shareItem.loginMode) {
    //                 shareUrlInfo.shareItem.source = 0;
    //                 return shareUrlInfo;
    //             }
    //             // 判断分享链接来源 0: 私有化 1：黑洞 2：星河 3: 星云
    //             if (shareUrlInfo.shareItem.loginMode.value === 'Private') {
    //                 shareUrlInfo.shareItem.source = 0;
    //                 return shareUrlInfo;
    //             }
    //             if (shareUrlInfo.shareItem.platformMode.value === 'BlackHole') {
    //                 shareUrlInfo.shareItem.source = 1;
    //                 return shareUrlInfo;
    //             } else if (shareUrlInfo.shareItem.platformMode.value === 'StarRiver') {
    //                 shareUrlInfo.shareItem.source = 2;
    //                 return shareUrlInfo;
    //             } else if (shareUrlInfo.shareItem.platformMode.value === 'Nebula') {
    //                 shareUrlInfo.shareItem.source = 3;
    //                 return shareUrlInfo;
    //             } else {
    //                 shareUrlInfo.shareItem.source = 0;
    //                 return shareUrlInfo;
    //             }
    //         } else {
    //             throw new Error(res.errMsg || '获取分享信息失败');
    //         }
    //     } catch (error) {
    //         throw error;
    //     }
    // },


    // MARK 是否具有空间信息
    isSharedRoomExistService: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            isSharedRoomExistService(paran).then((res) => {
                resolve(res);
            });
        });
    },


    // MARK Service 获取数据集资源地址
    getDataSetList: async (params: any): Promise<any> => {
        try {
            const res = await getProjectModel(params);
            if (res.isSuccess) {
                // return res.data;

                let dataSetList: any[] = [];
                res.data.forEach((item: any) => {
                    let dataSetCRS = dataTool.handle_dataSetCRS(item);
                    let dataSetCRSNorth = dataTool.handle_dataSetCRSNorth(item);
                    let engineOrigin = dataTool.handle_engineOrigin(item);
                    // let dataSetSGContent = item.context ? item.context : '';
                    let dataSetSGContent = '';// 该数据太大了，栋哥说只有同一个场景中的新地形数据超过10以上才会有效果上的区别，app不使用，数据量太大超出通信的1M限制协议
                    dataSetList.push({
                        dataSetId: item.dataSetId,
                        resourcesAddress: item.resourcesAddress,
                        rotate: item.rotate?.split(' ').map(Number),
                        scale: item.scale?.split(' ').map(Number),
                        offset: item.translation?.split(' ').map(Number),
                        dataSetCRS: dataSetCRS,
                        dataSetCRSNorth: dataSetCRSNorth,
                        engineOrigin: engineOrigin,
                        dataSetSGContent: dataSetSGContent,
                        dataSetType: item.dataSetType,
                    });
                });
                return dataSetList;
            } else {
                throw new Error(res.errMsg || '资源地址获取失败');
            }
        } catch (error) {
            throw error;
        }
    },

    // MARK Service 获取场景信息
    getSceneInfo: async (params: any): Promise<any> => {
        try {
            const res = await getSceneById(params);
            if (res.isSuccess) {
                let info = {
                    coordinates: res.data.coordinates,
                    dataSetPosition: res.data.dataSetPosition,
                    sceneName: res.data.sceneName,
                    componentTreeId: res.data.componentTreeId,
                    componentPosition: res.data.componentPosition,
                };
                return info;
            } else {
                throw new Error(res.errMsg || '获取场景信息失败');
            }
        } catch (error) {
            throw error;
        }
    },

}


export default api;