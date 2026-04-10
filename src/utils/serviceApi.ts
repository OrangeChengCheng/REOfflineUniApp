/*
 * @Author: Lemon C
 * @Date: 2025-11-19 14:50:45
 * @LastEditTime: 2026-04-10 11:37:08
 */
import {
    isRoomExistService,
    getProjectModel,
    getSceneById,
    getProjectTreeSubNodes,
    getProjectTreeSubNodesByLazy,
    getSingleSceneTreeById,
    getProjectTree,
    getCadDatasetFiles,
    getRoomList,
} from '@/service/interface';

import dataTool from '@/utils/dataTool';



interface ApiMethods {
    getSceneInfo(params: any): Promise<any>;
    getSceneTree(params: any, sceneInfo: any): Promise<any>;
    getModelTree(params: any): Promise<any>;
    getProjectTreeSubNodes(params: any): Promise<any>;
    getProjectTreeSubNodesByLazy(params: any): Promise<any>;
    getDataSetList(params: any): Promise<any>;
    getCadDataSetList(params: any): Promise<any>;
    // getExtrudeTexList(sceneTree: any): Promise<any>;
    isRoomExistService(params: any): Promise<any>;
    getRoomList(params: any): Promise<any>;
}

const api: ApiMethods = {


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
                uni.$re.unipluginLog(res.errMsg || '获取场景信息失败');
                throw new Error(res.errMsg || '获取场景信息失败');
            }
        } catch (error) {
            throw error;
        }
    },

    // MARK Service 获取场景目录树
    getSceneTree: async (params: any, sceneInfo: any): Promise<any> => {
        try {
            const res = await getSingleSceneTreeById(params);
            if (res.isSuccess) {
                const treeList = dataTool.handle_formatSceneTree(res.data, sceneInfo);
                return treeList;
            } else {
                uni.$re.unipluginLog(res.errMsg || '场景目录树获取失败');
                throw new Error(res.errMsg || '场景目录树获取失败');
            }
        } catch (error) {
            throw error;
        }
    },

    // MARK Service 获取模型目录树
    getModelTree: async (params: any): Promise<any> => {
        try {
            const res = await getProjectTree(params);
            if (res.isSuccess) {
                return res.data;
            } else {
                uni.$re.unipluginLog(res.errMsg || '模型目录树获取失败');
                throw new Error(res.errMsg || '模型目录树获取失败');
            }
        } catch (error) {
            throw error;
        }
    },

    // MARK 请求模型目录树子节点
    getProjectTreeSubNodes: async (paran: any): Promise<any> => {
        try {
            const res = await getProjectTreeSubNodes(paran);
            if (res.isSuccess) {
                return res.data;
            } else {
                uni.$re.unipluginLog(res.errMsg || '目录树子节点获取失败');
                throw new Error(res.errMsg || '目录树子节点获取失败');
            }
        } catch (error) {
            throw error;
        }
    },

    // MARK 请求模型目录树子节点-懒加载
    getProjectTreeSubNodesByLazy: async(paran: any): Promise<any> => {
        try {
            const res = await getProjectTreeSubNodesByLazy(paran);
            if (res.isSuccess) {
                return res.data;
            } else {
                uni.$re.unipluginLog(res.errMsg || '目录树子节点懒加载获取失败');
                throw new Error(res.errMsg || '目录树子节点懒加载获取失败');
            }
        } catch (error) {
            throw error;
        }
    },

    // MARK Service 获取开挖纹理列表
    // getExtrudeTexList: async (sceneTree: any): Promise<any> => {
    //     const state_store = useStateStore();
    //     const allLeafNodes = dataTool.handle_findAllNodeByLevel(sceneTree, 2);
    //     const allExtrudes = allLeafNodes.filter((item: any) => item.dataSetType == state_store.appSupportExtrudeType);
    //     if (!allExtrudes.length) return [];

    //     try {
    //         const res = await getSharedExtrudeTexturesList();
    //         if (res.isSuccess) {
    //             const intrinsicTextures = res.data.intrinsicTextures;
    //             let textureList: any[] = [];
    //             if (intrinsicTextures && intrinsicTextures.length) {
    //                 textureList = intrinsicTextures.map((item: any) => {
    //                     const picPath = `${state_store.downloadUrl}/${item.fileDataId}?token=${state_store.token}`;
    //                     const size = [5.0, 5.0];
    //                     return {
    //                         picPath: picPath,
    //                         picSize: size,
    //                         textureGuid: item.TextureImageId,
    //                     };
    //                 });
    //             }
    //             return textureList;
    //         } else {
    //             throw new Error(res.errMsg || '挤出纹理信息获取失败');
    //         }
    //     } catch (error) {
    //         throw error;
    //     }
    // },


    // MARK Service 获取数据集资源地址
    getDataSetList: async (params: any): Promise<any> => {
        try {
            const res = await getProjectModel(params);
            if (res.isSuccess) {
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
                uni.$re.unipluginLog(res.errMsg || '资源地址获取失败');
                throw new Error(res.errMsg || '资源地址获取失败');
            }
        } catch (error) {
            throw error;
        }
    },

    // MARK Service 获取数据集下CAD资源地址
    getCadDataSetList: async (params: any): Promise<any> => {
        try {
            const res = await getCadDatasetFiles(params);
            if (res.isSuccess) {
                let dataSetList: any[] = [];
                if (res.data.items && res.data.items.length > 0) {
                    let cad_file = res.data.items[0];
                    const cadUnitMap: any = {
                        Meter: 'CAD_UNIT_Meter',
                        Centimeter: 'CAD_UNIT_Centimeter',
                        Millimeter: 'CAD_UNIT_Millimeter',
                        Kilometer: 'CAD_UNIT_Kilometer',
                        Inch: 'CAD_UNIT_Inch',
                        Foot: 'CAD_UNIT_Foot',
                        Mile: 'CAD_UNIT_Mile',
                    };
                    dataSetList.push({
                        dataSetId: 're_cad',
                        resourcesAddress: cad_file.resourcesAddress,
                        unit: cadUnitMap[cad_file.unit || 'Meter'],
                    });
                }
                return dataSetList;
            } else {
                uni.$re.unipluginLog(res.errMsg || 'CAD资源地址获取失败');
                throw new Error(res.errMsg || 'CAD资源地址获取失败');
            }
        } catch (error) {
            throw error;
        }
    },

    // MARK 是否具有空间信息
    isRoomExistService: async (paran: any): Promise<any> => {
        try {
            const res = await isRoomExistService(paran);
            if (res.isSuccess) {
                return res.data;
            } else {
                uni.$re.unipluginLog(res.errMsg || '是否具有空间信息获取失败');
                throw new Error(res.errMsg || '是否具有空间信息获取失败');
            }
        } catch (error) {
            throw error;
        }
    },

    // MARK 获取空间信息
    getRoomList: async (paran: any): Promise<any> => {
        try {
            const res = await getRoomList(paran);
            if (res.isSuccess) {
                return res.data;
            } else {
                uni.$re.unipluginLog(res.errMsg || '空间信息获取失败');
                throw new Error(res.errMsg || '空间信息获取失败');
            }
        } catch (error) {
            throw error;
        }
    },



}


export default api;