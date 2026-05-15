<template>
    <div class="sup-document">
        <view class="file-area">
            <view class="file-item" v-for="item in fileLocList">
                <view class="file-item-left">
                    <text class="item-text">文件名：{{ item.fileName }}</text>
                    <text v-if="item.directory" class="item-text">模型类型：{{ item.typeStr }}</text>
                    <text class="item-text">类型：{{ item.fileType }}</text>
                    <text class="item-text">文件大小：{{ item.fileSizeDesc }}</text>
                </view>
                <view v-if="item.directory && item.type != 0" class="file-item-right">
                    <el-button type="primary" @click.stop="copySafToLoc(item)">查看资源</el-button>
                </view>
                <view v-if="item.directory && item.type == 0" class="file-item-right">
                    <el-button type="primary" @click.stop="nextFolder(item)">下一级目录</el-button>
                </view>
                <view v-if="!item.directory && item.fileType == 'zip'" class="file-item-right">
                    <el-button type="primary" @click.stop="unzipFile(item)">解压文件</el-button>
                </view>
            </view>
        </view>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useFileStore } from '@/stores/file';

const file_store = useFileStore();
const fileLocList = ref<any[]>([]);
const resRootPath = ref('');
const folderPath = ref('');

onLoad((options) => {
    if (options && options.folderPath && options.folderPath.length) {
        folderPath.value = options.folderPath;
    }
});

onMounted(async () => {
    if (!folderPath.value.length) {
        // 选择授权的文件
        const res_author: any = await uni.$tool.toPromise((cb: any) => uni.$re.safAuthorDocument({}, cb));
        uni.showToast({ title: '授权成功', icon: 'none' });
        resRootPath.value = res_author.data;
        uni.$re.unipluginLog(`resRootPath: ${res_author.data}`);
    } else {
        resRootPath.value = folderPath.value;
    }
    updateList();
});

const updateList = async () => {
    uni.show_loading();
    // 获取文件列表
    const res_folder: any = await uni.$tool.toPromise((cb: any) => uni.$re.fileGetAllChild({ filePath: resRootPath.value }, cb));
    const fileList: any[] = [];
    for (const el of res_folder.data) {
        if (el.directory) {
            const typeStr: string = el.fileName.match(/\[(.*?)\]/) ? el.fileName.match(/\[(.*?)\]/)[1] : '';
            typeStr.includes('scene') ? (el.type = 2) : typeStr.includes('cad') ? (el.type = 3) : typeStr != '' ? (el.type = 1) : (el.type = 0);
            el.dataSetTypeStr = typeStr;
            const res_folder2: any = await uni.$tool.toPromise((cb: any) => uni.$re.fileGetAllChild({ filePath: el.filePath }, cb));
            const res_filter = res_folder2.data.filter((el2: any) => el2.fileName == 'data' || el2.fileName == 'res');
            if (res_filter.length != 2) el.type = 0;
            el.typeStr = el.type ? (el.type == 2 ? '场景' : '单模型') : '非模型文件';
        }
        fileList.push(el);
    }
    fileLocList.value = fileList;
    uni.hide_loading();
};

const unzipFile = async (item: any) => {
    if (item.directory || item.fileType != 'zip') {
        uni.showToast({ title: '该文件不可操作', icon: 'none' });
        return;
    }

    const unzipFunc = async (unzipData: any, delPath: any) => {
        uni.show_loading('解压中...');
        if (delPath?.length) {
            // 删除已有文件，防止重复文件出现
            const del_res = await uni.$tool.toPromise((cb: any) => uni.$re.fileDelAllSubFile({ filePath: delPath, keepDir: true }, cb));
            if (!del_res.data) {
                uni.showToast({ title: '资源文件解压失败', icon: 'none' });
                return;
            }
        }

        //解压文件
        const unzip_progressFunc = (progress: any) => {
            // uni.$re.unipluginLog(`解压进度：${progress.processed}/${progress.totalEntries}`);
        };
        const res_unzip = await uni.$tool.toPromise((cb: any) =>
            uni.$re.unzipFile({ filePath: unzipData.filePath, password: file_store.unzipPassword }, cb, unzip_progressFunc)
        );
        if (!res_unzip.data) {
            uni.hide_loading();
            uni.showToast({ title: '资源文件解压失败', icon: 'none' });
            return;
        }
        const res_fileExist = await uni.$tool.toPromise((cb: any) => uni.$re.fileExist({ filePath: res_unzip.data }, cb));
        if (!res_fileExist.data) {
            uni.hide_loading();
            uni.showToast({ title: '资源文件解压失败', icon: 'none' });
            return;
        }

        uni.hide_loading();
        uni.showToast({ title: '资源文件解压成功', icon: 'none' });
    };

    const targetFolderPath = item.filePath.replace(/\.zip$/, '');
    const res_exist = await uni.$tool.toPromise((cb: any) => uni.$re.fileExist({ filePath: targetFolderPath, keepDir: true }, cb));
    if (res_exist.data) {
        const popRes = await uni.pop_showModal('提示', '即将覆盖已有文件，是否继续解压');
        if (popRes.confirm) {
            unzipFunc(item, targetFolderPath);
        } else if (popRes.cancel) {
            uni.showToast({ title: '解压操作已被取消', icon: 'none' });
            return;
        }
    } else {
        unzipFunc(item, '');
    }
    updateList();
};

const nextFolder = async (item: any) => {
    uni.navigateTo({
        url: `/pages/document/document?folderPath=${item.filePath}`,
    });
};

const copySafToLoc = async (item: any) => {
    const copyFunc = async (sourceFolderPath: any, targetFolderPath: any) => {
        uni.show_loading('复制中...');

        const unzip_progressFunc = (progress: any) => {
            uni.$re.unipluginLog(`复制进度：${progress.processed}/${progress.totalFiles}`);
        };
        const res_copyFolder = await uni.$tool.toPromise((cb: any) =>
            uni.$re.fileCopyFolder({ sourceFolderPath: sourceFolderPath, targetFolderPath: targetFolderPath }, cb, unzip_progressFunc)
        );

        uni.hide_loading();
        uni.pop_showToast(`${res_copyFolder.data ? '复制成功' : '复制失败'}`, () => {
            if (res_copyFolder.data) {
                var pages = getCurrentPages();
                uni.navigateBack({ delta: pages.length });
            }
        });
    };

    const popRes = await uni.pop_showModal('提示', '外部存储设备无法直接读取数据，即将复制资源到本地存储，是否继续');
    if (popRes.confirm) {
        const res_folder: any = await uni.$tool.toPromise((cb: any) => uni.$re.fileGetAllChild({ filePath: file_store.resRootPath }, cb));
        const find = res_folder.data.find((el: any) => el.fileName == item.fileName);
        if (find) {
            const popRes2 = await uni.pop_showModal('提示', '本地已有目标资源，即将覆盖，是否继续');
            if (popRes2.confirm) {
                copyFunc(item.filePath, file_store.resRootPath);
            } else if (popRes2.cancel) {
                uni.showToast({ title: '复制操作已被取消', icon: 'none' });
            }
        } else {
            copyFunc(item.filePath, file_store.resRootPath);
        }
    } else if (popRes.cancel) {
        uni.showToast({ title: '复制操作已被取消', icon: 'none' });
    }
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-document {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;

    .file-area {
        position: relative;
        margin-top: 50px;
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
}
</style>
