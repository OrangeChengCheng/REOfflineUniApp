<!--
 * @Author: Lemon C
 * @Date: 2026-01-22 10:16:05
 * @LastEditTime: 2026-04-13 18:26:37
-->
<template>
    <view class="content">
        <view class="btn-area">
            <view class="btn-line">
                <el-button type="primary" @click.stop="shouEngine">展示引擎</el-button>
                <el-button type="primary" @click.stop="downloadAndBindFile">下载文件</el-button>
                <el-button type="primary" @click.stop="delAllFile">删除所有文件</el-button>
            </view>
            <view class="btn-line">
                <el-button type="primary" @click.stop="getSavedFileList">获取文件列表</el-button>
                <el-button type="primary" @click.stop="callNativeUnzip">解压文件</el-button>
                <el-button type="primary" @click.stop="delFile">删除文件</el-button>
            </view>
            <view class="btn-line">
                <el-button type="primary" @click.stop="getDoc">获取文件对象</el-button>
                <el-button type="primary" @click.stop="selFile">选择文件</el-button>
            </view>
            <view class="btn-line">
                <el-button type="primary" @click.stop="dbQuery(offlineFileList[0])">数据库查询</el-button>
                <el-button type="primary" @click.stop="dbTableExist(offlineFileList[0])">查询表存在</el-button>
            </view>
            <view class="btn-line">
                <el-button type="primary" @click.stop="getDataSetList(offlineFileList[0])">获取模型列表</el-button>
                <el-button type="primary" @click.stop="getDataSetList(offlineFileList[1])">获取场景列表</el-button>
            </view>
            <view class="btn-line">
                <el-button type="primary" @click.stop="getScene(offlineFileList[2])">获取场景信息</el-button>
                <el-button type="primary" @click.stop="getModels(offlineFileList[3])">获取模型组信息</el-button>
            </view>
            <view class="btn-line">
                <el-button type="primary" @click.stop="getCAD(offlineFileList[4])">获取CAD信息</el-button>
            </view>
            <view class="btn-line">
                <el-button type="primary" @click.stop="getTreeNode(offlineFileList[0])">获取树子节点</el-button>
                <el-button type="primary" @click.stop="getTreeNode_lazy(offlineFileList[6])">获取树子节点-懒加载</el-button>
            </view>
            <view class="btn-line">
                <el-button type="primary" @click.stop="getElemIdList(offlineFileList[0])">获取构件id集合</el-button>
                <el-button type="primary" @click.stop="getElemIdList_lazy(offlineFileList[6])">获取构件id集合-懒加载</el-button>
            </view>
            <view class="btn-line">
                <el-button type="primary" @click.stop="getRoomList(offlineFileList[5])">获取房间列表</el-button>
                <el-button type="primary" @click.stop="getRoomInfo(offlineFileList[5])">获取房间信息</el-button>
            </view>
            <view class="btn-line">
                <el-button type="primary" @click.stop="getAttr_model(offlineFileList[5])">获取模型构件属性</el-button>
            </view>
            <view class="btn-line">
                <el-button type="primary" @click.stop="getAttr_entity_default(offlineFileList[2])">获取默认单构件属性</el-button>
                <el-button type="primary" @click.stop="getAttr_entity(offlineFileList[2])">获取单构件属性</el-button>
            </view>
            <view class="btn-line">
                <el-button type="primary" @click.stop="getAttr_shp(offlineFileList[7])">获取矢量属性</el-button>
                <el-button type="primary" @click.stop="getAttr_shp_scene(offlineFileList[2])">获取场景矢量属性</el-button>
            </view>
        </view>
        <view class="progress-area">
            <progress :percent="percentage" show-info stroke-width="3" />
        </view>
        <view class="file-area">
            <view class="file-item" v-for="item in offlineFileList">
                <view class="file-item-left">
                    <text class="item-text">文件名：{{ item.fileName }}</text>
                    <text class="item-text">类型：{{ item.type }}</text>
                </view>
                <view class="file-item-right">
                    <el-button type="primary" @click.stop="showFileEngine(item)">查看资源</el-button>
                </view>
            </view>
        </view>
        <view class="info-area">
            {{ fileStr_computed }}
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import dataTool from '@/utils/dataTool';
import { useFileStore } from '@/stores/file';

const file_store = useFileStore();

const title = ref('Hello');
const offlineFileList = ref<any[]>([
    {
        fileName: '[model]药店-BIM案例模型.rvt',
        type: 1,
        filePath: 'storage/emulated/0/Android/data/com.realengine.androidofflineapp/files/REOfflineDoc/[model]药店-BIM案例模型.rvt',
        id: '3a1e60e5-00f9-3f4d-a9f4-a7a4e497a7ee',
        dataSetTypeStr: 'bim',
    },
    {
        fileName: '[scene]离线场景',
        type: 2,
        filePath: 'storage/emulated/0/Android/data/com.realengine.androidofflineapp/files/REOfflineDoc/[scene]离线场景',
        id: '3a1ff815-fd2a-39d0-db7e-5d7c1bdadbb8',
        subId: ['3a1dac58-d288-f55b-e902-ea8b7d573a5e', '3a1e60e5-00f9-3f4d-a9f4-a7a4e497a7ee'],
    },
    {
        fileName: '[scene_lib]离线场景',
        type: 2,
        filePath: 'storage/emulated/0/Android/data/com.realengine.androidofflineapp/files/REOfflineDoc/[scene_lib]离线场景',
        id: '3a1ff815-fd2a-39d0-db7e-5d7c1bdadbb8',
        subId: [
            '3a1d83c0-c8ac-eca5-6bf3-874e8f2f7d39',
            '3a1dac58-d288-f55b-e902-ea8b7d573a5e',
            '3a1e60e5-00f9-3f4d-a9f4-a7a4e497a7ee',
            '3a202af8-f025-1c9e-19e2-34d5cf844c97',
            '3a2036c2-0b9a-d7c2-789a-b96b53d62e4d',
        ],
    },
    {
        fileName: '[models]bim模型组',
        type: 1,
        filePath: 'storage/emulated/0/Android/data/com.realengine.androidofflineapp/files/REOfflineDoc/[models]bim模型组',
        id: '3a207e76-2018-6dbb-d07c-c7a28a314518',
        dataSetTypeStr: 'bim',
    },
    {
        fileName: '[cad]7_17-⑦-①立面图.dwg',
        type: 1,
        filePath: 'storage/emulated/0/Android/data/com.realengine.androidofflineapp/files/REOfflineDoc/[cad]7_17-⑦-①立面图.dwg',
        id: '3a2063b6-4a88-19cb-72a3-c2f333d6d995',
        dataSetTypeStr: 'CAD',
    },
    {
        fileName: '[model]BIMFACE示例模型.rvt',
        type: 1,
        filePath: 'storage/emulated/0/Android/data/com.realengine.androidofflineapp/files/REOfflineDoc/[model]BIMFACE示例模型.rvt',
        id: '3a1d16de-2ced-0f6a-6b6c-dc5f90cf1624',
        dataSetTypeStr: 'bim',
    },
    {
        fileName: '[model]实施版_建筑.ifc',
        type: 1,
        filePath: 'storage/emulated/0/Android/data/com.realengine.androidofflineapp/files/REOfflineDoc/[model]实施版_建筑.ifc',
        id: '3a1dac58-810a-6b00-995a-472456285d3d',
        dataSetTypeStr: 'bim',
    },
    {
        fileName: '[vector]省界_region.shp.zip',
        type: 1,
        filePath: 'storage/emulated/0/Android/data/com.realengine.androidofflineapp/files/REOfflineDoc/[vector]省界_region.shp.zip',
        id: '3a1d16de-f277-f6a3-c1b3-cdec88c8e7fc',
        dataSetTypeStr: 'Vector',
    },
]);
const percentage = ref(0);
const fileList = ref({});
const filePath_temp = ref('');
const filePath_save = ref('');
const fileList_loc = ref({});
const fileList_apploc = ref([]);

const fileStr_computed = computed(() => {
    return `文件名称：${FILE_META.customName}
    \n 文件下载路径：${FILE_META.downloadUrl}
    \n 文件下载的临时路径：${filePath_temp.value}
    \n 文件沙盒保存路径：${filePath_save.value}
    \n 文件列表：${JSON.stringify(fileList.value)}
    \n 文件映射表：${JSON.stringify(fileList_loc.value)}
    \n app文件列表：${JSON.stringify(fileList_apploc.value)}`;
});

const shouEngine = () => {
    uni.$re
        .realEngineRender({
            name: 'uni-app',
        })
        .then((result) => {
            uni.$re.unipluginLog(JSON.stringify(result));
        });
};

const getDoc = () => {
    const docObj = uni.getFileSystemManager();
    uni.showModal({
        title: '文件对象',
        content: JSON.stringify(docObj),
    });
};

const delAllFile = () => {
    uni.getSavedFileList({
        success: function (res) {
            if (res.fileList.length > 0) {
                res.fileList.forEach((element) => {
                    uni.removeSavedFile({
                        filePath: element.filePath,
                        success: function (res) {
                            uni.showToast({ title: '删除成功', icon: 'none' });
                            fileList.value = [];
                            // 清空映射表
                            uni.removeStorageSync('file_bind_map');
                            fileList_loc.value = {};
                        },
                    });
                });
            } else {
                uni.showToast({ title: '暂无文件可删除', icon: 'none' });
            }
        },
    });

    uni.$re.delFile({}, (res: any) => {
        uni.showModal({
            title: '删除结果',
            content: JSON.stringify(res),
        });
    });
};

const delFile = () => {
    uni.removeSavedFile({
        filePath: '_doc/uniapp_save/17732974828590',
        success: function (res) {
            uni.showModal({
                title: '删除成功',
                content: JSON.stringify(res),
            });
        },
        fail: function name(err) {
            uni.showModal({
                title: '删除失败',
                content: JSON.stringify(err),
            });
        },
    });
};

// --------------- 核心：定义文件的「唯一标识」和「元数据」 ---------------
// 你可以自定义这个对象，作为下载文件的“身份标签”
// const FILE_META = {
//     fileId: '666',
//     // 自定义文件名称（用于你识别，和保存后的沙盒文件名无关）
//     customName: 'BlackHole_Engine_SDK_v3.2.0.3559.zip',
//     // 下载URL（唯一标识，确保和其他文件区分）
//     downloadUrl:
//         'https://developer.bjblackhole.com/api/developercenter/download/Sources/2026_01_09_16_42_38_3a1eb418-dcd6-c449-4697-3185fe76fcec_3a049d33-017c-c541-7c08-bc4bd5e7524a_BlackHole%20Engine%20SDK_v3.2.0.3559.zip',
// };
const FILE_META = {
    fileId: '666',
    // 自定义文件名称（用于你识别，和保存后的沙盒文件名无关）
    customName: '[model]药店-BIM案例模型.rvt.zip',
    // 下载URL（唯一标识，确保和其他文件区分）
    downloadUrl: 'https://demo.bjblackhole.com/BlackHole3.0/app/AppRes/[model]药店-BIM案例模型.rvt.zip',
};

// --------------- 新增核心：下载前校验本地文件是否存在 ---------------
/**
 * 校验本地是否存在对应fileId的文件（唯一标识匹配）
 * @returns Promise<boolean> true=存在，false=不存在
 */
const checkLocalFileExist = (): Promise<boolean> => {
    return new Promise((resolve) => {
        // 1. 读取本地映射表
        const fileBindMap = uni.getStorageSync('file_bind_map') || {};
        fileList_loc.value = fileBindMap;

        // 2. 根据fileId查找对应的沙盒路径
        const bindInfo = fileBindMap[FILE_META.fileId];
        if (!bindInfo) {
            console.log('🔍 本地映射表无该文件：', FILE_META.fileId);
            resolve(false);
            return;
        }

        // 3. 验证沙盒路径对应的文件是否真的存在（避免映射表有但文件已被清理）
        uni.getSavedFileInfo({
            filePath: bindInfo.savedFilePath,
            success: () => {
                console.log('✅ 本地存在该文件：', bindInfo.savedFilePath);
                resolve(true);
            },
            fail: () => {
                // 文件已被清理，删除映射表中的无效记录
                delete fileBindMap[FILE_META.fileId];
                uni.setStorageSync('file_bind_map', fileBindMap);
                fileList_loc.value = fileBindMap;
                console.log('🔍 映射表有记录，但文件已被清理');
                resolve(false);
            },
        });
    });
};

/**
 * 删除本地对应fileId的旧文件（覆盖前清理）
 */
const deleteOldFile = (): Promise<boolean> => {
    return new Promise((resolve) => {
        const fileBindMap = uni.getStorageSync('file_bind_map') || {};
        const bindInfo = fileBindMap[FILE_META.fileId];

        if (!bindInfo) {
            resolve(true);
            return;
        }

        // 删除沙盒文件
        uni.removeSavedFile({
            filePath: bindInfo.savedFilePath,
            success: () => {
                // 删除映射表中的旧记录
                delete fileBindMap[FILE_META.fileId];
                uni.setStorageSync('file_bind_map', fileBindMap);
                fileList_loc.value = fileBindMap;
                console.log('🗑️ 已删除旧文件：', bindInfo.savedFilePath);
                resolve(true);
            },
            fail: (err) => {
                console.error('❌ 删除旧文件失败：', err);
                resolve(false);
            },
        });
    });
};

// --------------- 核心函数：下载 + 保存 + 建立对应关系（整合校验逻辑） ---------------
const downloadAndBindFile = async () => {
    // 重置进度和路径
    percentage.value = 0;
    filePath_temp.value = '';
    filePath_save.value = '';

    try {
        // 1. 前置校验：本地是否有对应文件
        const fileExist = await checkLocalFileExist();

        // 2. 如果存在，先删除旧文件（覆盖逻辑）
        if (fileExist) {
            uni.showLoading({ title: '清理旧文件...' });
            const deleteSuccess = await deleteOldFile();
            uni.hideLoading();

            if (!deleteSuccess) {
                uni.showToast({ title: '清理旧文件失败', icon: 'none' });
                return;
            }
            uni.showToast({ title: '旧文件已清理，开始下载新版本', icon: 'success' });
        }

        // 3. 执行下载（官网 API）
        const downloadTask = uni.downloadFile({
            url: FILE_META.downloadUrl,
            success: (downloadRes) => {
                if (downloadRes.statusCode === 200) {
                    const tempFilePath = downloadRes.tempFilePath;
                    console.log(`📥 下载完成：临时路径 = ${tempFilePath}`);
                    filePath_temp.value = tempFilePath;

                    const params = {
                        uniDownloadTempPath: tempFilePath,
                    };
                    uni.$re.saveUniFile(params, (res: any) => {
                        uni.showModal({
                            title: '保存结果',
                            content: JSON.stringify(res),
                        });
                    });

                    // // 4. 保存到沙盒
                    // uni.saveFile({
                    //     tempFilePath: tempFilePath,
                    //     success: (saveRes) => {
                    //         const savedFilePath = saveRes.savedFilePath;
                    //         console.log(`📌 保存完成：沙盒路径 = ${savedFilePath}`);
                    //         filePath_save.value = savedFilePath;

                    //         // 5. 建立映射关系
                    //         bindFileMeta(savedFilePath);
                    //         uni.showToast({ title: '下载并保存成功', icon: 'success' });
                    //     },
                    //     fail: (err) => {
                    //         uni.showToast({ title: '保存失败', icon: 'none' });
                    //         console.error('❌ 保存失败：', err);
                    //     },
                    // });
                } else {
                    uni.showToast({ title: `下载失败：${downloadRes.statusCode}`, icon: 'none' });
                }
            },
            fail: (err) => {
                uni.showToast({ title: '下载失败，请检查网络', icon: 'none' });
                console.error('❌ 下载失败：', err);
            },
        });

        // 进度监听
        downloadTask.onProgressUpdate(async (res) => {
            percentage.value = res.progress;
            await nextTick();
        });
    } catch (err) {
        console.error('❌ 前置校验异常：', err);
        uni.showToast({ title: '校验失败，请重试', icon: 'none' });
    }
};

// --------------- 核心：记录映射关系 ---------------
const bindFileMeta = (savedFilePath: string) => {
    const fileBindMap = uni.getStorageSync('file_bind_map') || {};

    // 建立对应关系（fileId 作为唯一key）
    fileBindMap[FILE_META.fileId] = {
        fileId: FILE_META.fileId,
        savedFilePath: savedFilePath,
        bindTime: new Date().getTime(),
        customName: FILE_META.customName,
        downloadUrl: FILE_META.downloadUrl,
    };

    uni.setStorageSync('file_bind_map', fileBindMap);
    fileList_loc.value = fileBindMap;
    console.log(`✅ 对应关系已建立：${FILE_META.fileId} → ${savedFilePath}`);

    getSavedFileList(); //更新
};

/**
 * 获取已保存的文件列表
 */
const getSavedFileList = () => {
    uni.getSavedFileList({
        success: (res) => {
            console.log('📋 已保存文件列表：', res.fileList);
            fileList.value = res.fileList;
        },
        fail: (err) => {
            console.error('❌ 获取文件列表失败：', err);
            uni.showToast({ title: '获取列表失败', icon: 'none' });
        },
    });

    uni.$re.getLocFileList({}, (res: any) => {
        uni.showModal({
            title: '文件列表',
            content: JSON.stringify(res),
        });
        fileList_apploc.value = res.fileList;
    });
};

/**
 * 调用安卓原生解压接口
 */
const callNativeUnzip = () => {
    // const fileBindMap = uni.getStorageSync('file_bind_map') || {};
    // const bindInfo = fileBindMap[FILE_META.fileId];

    // if (!bindInfo) {
    //     uni.showToast({ title: '文件获取失败', icon: 'none' });
    //     return;
    // }
    if (!fileList_apploc.value.length) {
        uni.showToast({ title: '文件获取失败', icon: 'none' });
        return;
    }

    const file: any = fileList_apploc.value[0];

    const unzipParams = {
        filePath: file.filePath,
        fileName: file.fileName,
    };

    console.log('📤 向原生发送解压请求：', unzipParams);

    // 2. 调用原生通信接口（基于你已有的uni.$re通道）
    uni.$re.unzipFile(unzipParams, (res: any) => {
        uni.showModal({
            title: '解压结果',
            content: JSON.stringify(res),
        });
    });

    // 自定义原生方法名，需和安卓端一致
    // uni.$re.unzipFile(unzipParams); // 自定义原生方法名，需和安卓端一致
    // .then((result: any) => {
    //     // 3. 接收原生解压成功回调
    //     console.log('✅ 原生解压成功：', result);
    //     uni.showModal({
    //         title: '解压成功',
    //         content: `解压路径：${result.unzipDir}\n解压文件数：${result.fileCount}`,
    //         showCancel: false,
    //     });
    // })
    // .catch((error: any) => {
    //     // 4. 接收原生解压失败回调
    //     console.error('❌ 原生解压失败：', error);
    //     uni.showToast({
    //         title: `解压失败：${error.msg}`,
    //         icon: 'none',
    //         duration: 3000,
    //     });
    // });
};

const selFile = () => {
    uni.$re.selFile({}, (res: any) => {
        uni.showModal({
            title: '获取结果',
            content: JSON.stringify(res),
        });
    });
};

const showFileEngine = (item: any) => {
    file_store.fileName = item.fileName;
    const params = { dataSetIds: item.type == 2 ? item.subId : [item.id] };
    uni.$service.getDataSetList(params).then((res: any) => {
        const param_t = { filePath: `${file_store.rootPath}/${file_store.fileName}`, dataSetList: res, shareType: item.type, sceneId: item.id };
        uni.$re.showOfflineEngine(param_t, (res: any) => {});
    });
};

const dbQuery = (item: any) => {
    const param = {
        dbPath: item.filePath + '/data/' + item.id + '.db',
        sql: `SELECT HostFileName, FileSuffix FROM "${item.id.replace(/-/g, '') + '_filename'}";`, //不能使用replaceAll,app端异常
    };
    uni.$re.dbQuery(param, (res: any) => {
        uni.showModal({
            title: '获取结果',
            content: JSON.stringify(res),
        });
    });
};
const dbTableExist = (item: any) => {
    // const param = {
    //     dbPath: item.filePath + '/data/' + item.id + '.db',
    //     tableName: item.id.replace(/-/g, '') + '_filename', //不能使用replaceAll,app端异常
    // };
    // uni.$re.dbTableExist(param, (res: any) => {
    //     uni.showModal({
    //         title: '获取结果',
    //         content: JSON.stringify(res),
    //     });
    // });

    let params = { dataSetId: item.id };
    uni.$service.isRoomExistService(params).then((res: any) => {
        uni.showModal({
            title: '获取结果',
            content: JSON.stringify(res),
        });
    });
};

const getDataSetList = (item: any) => {
    file_store.fileName = item.fileName;
    let params = { dataSetIds: item.type == 2 ? item.subId : [item.id] };
    uni.$service.getDataSetList(params).then((res: any) => {
        uni.showModal({
            title: '获取结果',
            content: JSON.stringify(res),
        });
    });
};

const getScene = async (item: any) => {
    file_store.fileName = item.fileName;

    // 获取场景信息
    const res_1 = await uni.$service.getSceneInfo(item.id);
    // 获取场景树
    const res_2 = await uni.$service.getSceneTree({ sceneId: item.id, isPublished: true }, res_1);
    // 处理数据集ID列表
    const dataSetIdList = dataTool.handle_dataSetIdList(res_2, res_1);
    // 并行处理各种数据
    const [terrainList, entityList, waterList, extrudeList, monomerList] = await Promise.all([
        dataTool.handle_terrainDataSetList(res_2, 2),
        dataTool.handle_entityData(res_2, res_1.componentPosition),
        dataTool.handle_waterData(res_2),
        dataTool.handle_extrudeData(res_2, []),
        dataTool.handle_monomerData(res_2),
    ]);
    // 获取数据集信息
    const res_3 = await uni.$service.getDataSetList({ dataSetIds: dataSetIdList });
    // 处理数据
    const dataSetList_temp1: any[] = dataTool.handle_dataSetTrans(res_3, res_1.dataSetPosition);
    const dataSetList_temp2 = dataTool.handle_terrainLayerLev(dataSetList_temp1, terrainList);
    const dataSetList = dataTool.handle_dataSetId(dataSetList_temp2);

    const engineData = {
        filePath: `${file_store.rootPath}/${file_store.fileName}`,
        sceneId: item.id,
        projName: item.fileName,
        dataSetList: dataSetList,
        worldCRS: res_1.coordinates,
        shareType: 2,
        shareViewMode: res_1.displayMode,
        entityList: entityList,
        waterList: waterList,
        extrudeList: extrudeList,
        extrudeTexList: [],
        monomerList: monomerList,
    };

    uni.$re.showOfflineEngine(engineData, (res: any) => {});
};

const getModels = async (item: any) => {
    file_store.fileName = item.fileName;

    // 获取资源数据
    const dataSetList = await uni.$service.getDataSetList({ dataSetIds: [item.id] });

    const engineData = {
        filePath: `${file_store.rootPath}/${file_store.fileName}`,
        sceneId: item.id,
        projName: item.fileName,
        dataSetList: dataSetList,
        shareType: 1,
        shareDataType: item.dataSetTypeStr,
    };

    uni.$re.showOfflineEngine(engineData, (res: any) => {});
};
const getCAD = async (item: any) => {
    file_store.fileName = item.fileName;

    // 获取资源数据
    const cadDataSetList = await uni.$service.getCadDataSetList({ dataSetId: item.id });

    const engineData = {
        filePath: `${file_store.rootPath}/${file_store.fileName}`,
        sceneId: item.id,
        projName: item.fileName,
        dataSetList: cadDataSetList,
        shareType: 1,
        shareDataType: item.dataSetTypeStr,
    };

    uni.$re.showOfflineEngine(engineData, (res: any) => {});
};
// MARK data 获取房间名称
const handle_getRoomName = (treeData: any, formatType: any = 0) => {
    // 带有房间和图纸信息的模型来源(根据srcCatalog字段判断来源)
    const FileSrcWithRoomInfo = [0, 1, 4];
    let pakNodeDatas = [];
    if (formatType === 1) {
        pakNodeDatas = treeData;
    } else {
        pakNodeDatas = treeData[0].nodes;
    }
    let roomFiles = pakNodeDatas.filter((el: any) => FileSrcWithRoomInfo.includes(el.srcCatalog));
    let roomFilesName = roomFiles.map((item: any) => {
        return item.name;
    });
    return roomFilesName;
};

const getTreeNode = async (item: any) => {
    file_store.fileName = item.fileName;

    // 获取模型目录树
    const res = await uni.$service.getModelTree({ dataSetId: item.id });
    const treeData = dataTool.handle_formatDataSetTree(res);

    // 获取目录树子节点
    let params = {
        dataSetId: item.id,
        fileIntId: treeData[0].fileIntId,
        uniqueId: treeData[0].uniqueId,
    };
    const res2 = await uni.$service.getProjectTreeSubNodes(params);

    uni.showModal({
        title: '获取结果',
        content: JSON.stringify(res2),
    });
};
const getTreeNode_lazy = async (item: any) => {
    file_store.fileName = item.fileName;

    // 获取模型目录树
    const res = await uni.$service.getModelTree({ dataSetId: item.id });
    const treeData = dataTool.handle_formatDataSetTree(res);

    // 获取目录树子节点-懒加载
    let params = {
        dataSetId: item.id,
        parentNodeIntId: 10545,
        // parentNodeIntId: treeData[0].nodeIntId ? Number(treeData[0].nodeIntId) : Number(treeData[0].fileIntId),
        hostFileId: Number(treeData[0].fileIntId),
    };
    const res2 = await uni.$service.getProjectTreeSubNodesByLazy(params);

    uni.showModal({
        title: '获取结果',
        content: JSON.stringify(res2),
    });
};
const getElemIdList = async (item: any) => {
    file_store.fileName = item.fileName;

    const params = {
        dataSets: [
            {
                dataSetId: '3a1e60e5-00f9-3f4d-a9f4-a7a4e497a7ee',
                childNodeId: '164',
            },
            {
                dataSetId: '3a1e60e5-00f9-3f4d-a9f4-a7a4e497a7ee',
                childNodeId: '165',
            },
            {
                dataSetId: '3a1e60e5-00f9-3f4d-a9f4-a7a4e497a7ee',
                childNodeId: '166',
            },
            {
                dataSetId: '3a1e60e5-00f9-3f4d-a9f4-a7a4e497a7ee',
                childNodeId: '167',
            },
            {
                dataSetId: '3a1e60e5-00f9-3f4d-a9f4-a7a4e497a7ee',
                childNodeId: '168',
            },
            {
                dataSetId: '3a1e60e5-00f9-3f4d-a9f4-a7a4e497a7ee',
                childNodeId: '169',
            },
            {
                dataSetId: '3a1e60e5-00f9-3f4d-a9f4-a7a4e497a7ee',
                childNodeId: '170',
            },
            {
                dataSetId: '3a1e60e5-00f9-3f4d-a9f4-a7a4e497a7ee',
                childNodeId: '171',
            },
            {
                dataSetId: '3a1e60e5-00f9-3f4d-a9f4-a7a4e497a7ee',
                childNodeId: '172',
            },
            {
                dataSetId: '3a1e60e5-00f9-3f4d-a9f4-a7a4e497a7ee',
                childNodeId: '173',
            },
            {
                dataSetId: '3a1e60e5-00f9-3f4d-a9f4-a7a4e497a7ee',
                childNodeId: '174',
            },
            {
                dataSetId: '3a1e60e5-00f9-3f4d-a9f4-a7a4e497a7ee',
                childNodeId: '175',
            },
            {
                dataSetId: '3a1e60e5-00f9-3f4d-a9f4-a7a4e497a7ee',
                childNodeId: '176',
            },
        ],
    };
    const res = await uni.$service.getProjectTreeChildren(params);

    uni.showModal({
        title: '获取结果',
        content: JSON.stringify(res),
    });
};
const getElemIdList_lazy = async (item: any) => {
    file_store.fileName = item.fileName;

    const params = {
        dataSetId: '3a1dac58-810a-6b00-995a-472456285d3d',
        hostFileId: -1,
        levelCode: '1-7017-10391-10545-9499-6790',
    };
    const res = await uni.$service.getProjectTreeChildrenByLazy(params);

    uni.showModal({
        title: '获取结果',
        content: JSON.stringify(res),
    });
};
const getRoomList = async (item: any) => {
    file_store.fileName = item.fileName;

    // 获取模型目录树
    const res = await uni.$service.getModelTree({ dataSetId: item.id });
    const treeData = dataTool.handle_formatDataSetTree(res);

    const fileNames = handle_getRoomName(treeData);
    let params = {
        dataSetId: item.id,
        fileNames: fileNames,
    };
    let data = await uni.$service.getRoomList(params);
    data = data.filter((item: any) => {
        let rooms = item.rooms;
        if (rooms[0] && item.elementIntIds) {
            return true;
        } else {
            return false;
        }
    });
    let roomTreeData = data.map((item: any) => {
        item['nodeName'] = item.hostFileName;
        item['nodeId'] = item.hostFileId;
        item['nodes'] = item.rooms;
        return item;
    });

    uni.$re.unipluginLog(JSON.stringify(roomTreeData));
};
const getRoomInfo = async (item: any) => {
    file_store.fileName = item.fileName;

    const params = {
        dataSetId: item.id,
        childNodeId: '602',
    };
    const res = await uni.$service.getRoomElement(params);

    let params2 = {
        dataSetId: item.id,
        elementIntId: '',
    };
    if (res.elemIntIds.length) {
        params2['elementIntId'] = res.elemIntIds[0] + '';
    }
    const attributeData = await uni.$service.getRoomInfo(params2);

    uni.showModal({
        title: 'attributeData',
        content: JSON.stringify(attributeData),
    });
};

const getAttr_model = async (item: any) => {
    file_store.fileName = item.fileName;

    let params = {
        dataSetId: item.id,
        elementIntId: 25,
        isQueryExtend: true,
    };
    const res = await uni.$service.getProjectParam(params);

    uni.showModal({
        title: 'getAttr_model',
        content: JSON.stringify(res),
    });
};
const getAttr_shp = async (item: any) => {
    file_store.fileName = item.fileName;

    let params = { dataSetId: '3a1d16de-f277-f6a3-c1b3-cdec88c8e7fc', elemId: 'GlobalPageShp_3a1d16def277f6a3c1b3cdec88c8e7fc_260331170939_2' };
    const res = await uni.$service.getVectorParam(params);

    uni.showModal({
        title: 'getAttr_shp',
        content: JSON.stringify(res),
    });
};
const getAttr_shp_scene = async (item: any) => {
    file_store.fileName = item.fileName;

    let params = { dataSetId: '3a2036c2-0b9a-d7c2-789a-b96b53d62e4d', elemId: 'GlobalPageShp_3a2036c20b9ad7c2789ab96b53d62e4d_260325184540_2' };
    const res = await uni.$service.getVectorParam(params);

    uni.showModal({
        title: 'getAttr_shp',
        content: JSON.stringify(res),
    });
};
const getAttr_entity_default = async (item: any) => {
    file_store.fileName = item.fileName;

    // 获取属性类型
    let params_type = { dataSetId: '3a2097d5-549b-c06c-606b-8d94af753612', hostFileId: 1 };
    const res_type = await uni.$service.getElemParamTypeService(params_type);

    let paramType;
    if (res_type.length) {
        paramType = res_type[0].paramsType;
    } else {
        paramType = 'default';
    }
    let params_info = {
        dataSetId: '3a2097d5-549b-c06c-606b-8d94af753612',
        dataSetType: 19,
        hostFileId: 1,
        id: '3a202af8-a037-5f8e-4eba-78d9c91ae47e',
        paramType: paramType,
    };
    const res = await uni.$service.getElemParamService(params_info);

    uni.showModal({
        title: 'getAttr_entity',
        content: JSON.stringify(res),
    });
};
const getAttr_entity = async (item: any) => {
    file_store.fileName = item.fileName;

    // 获取属性类型
    let params_type = { dataSetId: '3a2097d5-549b-c06c-606b-8d94af753612', hostFileId: 2 };
    const res_type = await uni.$service.getElemParamTypeService(params_type);

    let paramType;
    if (res_type.length) {
        paramType = res_type[0].paramsType;
    } else {
        paramType = 'default';
    }
    let params_info = {
        dataSetId: '3a2097d5-549b-c06c-606b-8d94af753612',
        dataSetType: 19,
        hostFileId: 2,
        id: '3a2097d4-e167-5aab-805f-4bada2319dfa',
        paramType: paramType,
    };
    const res = await uni.$service.getElemParamService(params_info);

    uni.showModal({
        title: 'getAttr_entity',
        content: JSON.stringify(res),
    });
};
</script>

<style lang="scss" scoped>
.content {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;

    .btn-area {
        position: relative;
        margin-top: 50px;
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    .btn-line {
        position: relative;
        width: 100%;
        height: 40px;
        margin-top: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

.progress-area {
    position: relative;
    margin-top: 30px;
    width: 100%;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;

    progress {
        position: relative;
        width: 80%;
    }
}

.file-area {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;
    box-sizing: border-box;

    .file-item {
        position: relative;
        margin-top: 30px;
        width: 100%;
        height: 100px;
        display: flex;
        border-radius: 8px;
        border: 1px solid #dddddd;
        padding: 0 15px;
        box-sizing: border-box;
        overflow: hidden;

        .file-item-left {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 100%;
            flex: 1;
            overflow: hidden;

            .item-text {
                position: relative;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: 15px;
            }
        }

        .file-item-right {
            position: relative;
            display: flex;
            width: 100px;
            height: 100%;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
    }
}

.info-area {
    position: relative;
    margin-top: 30px;
    display: flex;
    width: 100%;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-all;
    overflow-wrap: break-word;
    box-sizing: border-box;
    padding: 0 20px;
    font-size: 14px;
}
</style>
