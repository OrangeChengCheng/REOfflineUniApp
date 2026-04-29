<!--
 * @Author: Lemon C
 * @Date: 2026-01-22 10:16:05
 * @LastEditTime: 2026-04-29 17:57:35
-->
<template>
    <view class="content">
        <view class="btn-area">
            <view class="btn-line">
                <el-button type="primary" @click.stop="downloadAndUnzipFile">下载文件</el-button>
                <el-button type="primary" @click.stop="delAllFile">删除所有文件</el-button>
            </view>
            <view class="btn-line">
                <el-button type="primary" @click.stop="getDoc">获取文件对象</el-button>
                <el-button type="primary" @click.stop="selFile">选择文件</el-button>
            </view>
        </view>
        <view class="progress-area">
            <progress :percent="percentage" show-info stroke-width="3" />
        </view>
        <view class="file-area">
            <view class="file-item" v-for="item in fileLocList">
                <view class="file-item-left">
                    <text class="item-text">文件名：{{ item.fileName }}</text>
                    <text class="item-text">模型类型：{{ item.typeStr }}</text>
                    <text class="item-text">类型：{{ item.fileType }}</text>
                    <text class="item-text">文件大小：{{ item.fileSizeDesc }}</text>
                </view>
                <view class="file-item-right">
                    <el-button type="primary" @click.stop="showFileEngine(item)">查看资源</el-button>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import dataTool from '@/utils/dataTool';
import { useFileStore } from '@/stores/file';

const file_store = useFileStore();

const percentage = ref(0);
const fileLocList = ref<any[]>([]);

onMounted(async () => {
    // 获取文件列表
    const res_folder: any = await uni.$tool.toPromise((cb: any) => uni.$re.fileGetAllChild({ filePath: file_store.resRootPath }, cb));
    const fileList: any[] = [];
    for (const el of res_folder.data) {
        if (el.directory) {
            uni.$re.unipluginLog(JSON.stringify(el));
            const typeStr: string = el.fileName.match(/\[(.*?)\]/) ? el.fileName.match(/\[(.*?)\]/)[1] : '';
            typeStr.includes('scene') ? (el.type = 2) : typeStr.includes('cad') ? (el.type = 3) : (el.type = 1);
            el.dataSetTypeStr = typeStr;
            el.typeStr = el.type ? (el.type == 2 ? '场景' : '单模型') : '非模型文件';

            // 获取数据库文件
            const res_dbFile: any = await uni.$tool.toPromise((cb: any) =>
                uni.$re.fileGetChildBySuffix({ filePath: `${el.filePath}/data`, suffix: '.db' }, cb)
            );
            el.id = res_dbFile.data[0].fileName.replace('.db', '');
        }
        fileList.push(el);
    }
    fileLocList.value = fileList;
});

const getDoc = () => {
    const docObj = uni.getFileSystemManager();
    uni.showModal({
        title: '文件对象',
        content: JSON.stringify(docObj),
    });
};

const delAllFile = () => {};

const selFile = () => {
    uni.$re.selFile({}, (res: any) => {
        uni.showModal({
            title: '获取结果',
            content: JSON.stringify(res),
        });
    });
};

const FILE_META = {
    fileId: '666',
    // 自定义文件名称（用于你识别，和保存后的沙盒文件名无关）
    customName: '[model]药店-BIM案例模型.rvt.zip',
    // 下载URL（唯一标识，确保和其他文件区分）
    downloadUrl: 'https://demo.bjblackhole.com/BlackHole3.0/app/AppRes/[model]药店-BIM案例模型.rvt.zip',
};
const downloadAndUnzipFile = async () => {
    // 重置进度和路径
    percentage.value = 0;

    // 下载文件
    const resPath = await uni.$downloadTool.downloadFile(FILE_META.downloadUrl, (progress: number) => {
        percentage.value = progress;
    });
    uni.showModal({
        title: '下载成功',
        content: JSON.stringify(resPath),
    });
};

const showFileEngine = (item: any) => {
    if (!item.directory) {
        uni.showToast({ title: '该文件不可操作', icon: 'none' });
        return;
    }

    // 场景
    if (item.type == 2) {
        getScene(item);
    }
    // CAD
    else if (item.type == 3) {
        getCAD(item);
    }
    // 单模型
    else {
        getModels(item);
    }
};

const getScene = async (item: any) => {
    file_store.fileName = item.fileName;
    file_store.filePath = item.filePath;

    // 获取场景信息
    const res_1 = await uni.$service.getSceneInfo(item.id);
    // 获取场景树
    const res_2 = await uni.$service.getSceneTree({ sceneId: item.id, isPublished: true }, res_1);
    // 处理数据集ID列表
    const dataSetIdList = dataTool.handle_dataSetIdList(res_2, res_1);
    // 获取挤出纹理信息
    const extrudeTexList = await uni.$service.getExtrudeTexList();
    // 并行处理各种数据
    const [terrainList, entityList, waterList, extrudeList, monomerList] = await Promise.all([
        dataTool.handle_terrainDataSetList(res_2, 2),
        dataTool.handle_entityData(res_2, res_1.componentPosition),
        dataTool.handle_waterData(res_2),
        dataTool.handle_extrudeData(res_2, extrudeTexList),
        dataTool.handle_monomerData(res_2),
    ]);
    // 获取数据集信息
    const res_3 = await uni.$service.getDataSetList({ dataSetIds: dataSetIdList });
    // 处理数据
    const dataSetList_temp1: any[] = dataTool.handle_dataSetTrans(res_3, res_1.dataSetPosition);
    const dataSetList_temp2 = dataTool.handle_terrainLayerLev(dataSetList_temp1, terrainList);
    const dataSetList = dataTool.handle_dataSetId(dataSetList_temp2);

    const engineData = {
        filePath: item.filePath,
        sceneId: item.id,
        projName: item.fileName,
        dataSetList: dataSetList,
        worldCRS: res_1.coordinates,
        shareType: 2,
        shareViewMode: res_1.displayMode,
        entityList: entityList,
        waterList: waterList,
        extrudeList: extrudeList,
        extrudeTexList: extrudeTexList,
        monomerList: monomerList,
    };

    uni.$re.showOfflineEngine(engineData, (res: any) => {});
};

const getModels = async (item: any) => {
    file_store.fileName = item.fileName;
    file_store.filePath = item.filePath;

    // 获取资源数据
    const dataSetList = await uni.$service.getDataSetList({ dataSetIds: [item.id] });

    const engineData = {
        filePath: item.filePath,
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
    file_store.filePath = item.filePath;

    // 获取资源数据
    const cadDataSetList = await uni.$service.getCadDataSetList({ dataSetId: item.id });

    const engineData = {
        filePath: item.filePath,
        sceneId: item.id,
        projName: item.fileName,
        dataSetList: cadDataSetList,
        shareType: 1,
        shareDataType: item.dataSetTypeStr,
    };

    uni.$re.showOfflineEngine(engineData, (res: any) => {});
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
        // height: 100px;
        display: flex;
        border-radius: 8px;
        border: 1px solid #dddddd;
        padding: 15px 15px;
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
                margin-top: 5px;
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
