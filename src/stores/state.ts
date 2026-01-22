/*
 * @Author: Lemon C
 * @Date: 2024-11-09 10:46:29
 * @LastEditTime: 2025-12-15 11:27:23
 */
import { defineStore } from 'pinia'

const RE_ServerURl_HD = "https://engine3.bjblackhole.com";
const RE_ServerSource = "App3D";
const RE_DownloadUrl = "/files";
const RE_AuthorTxtId = "RealEngineInitAuthorPath";
const RE_AuthorTxt = "author/author_path02.txt";
const RE_AuthorIndexId = "RealEngineInitPathIndex";
const RE_AuthorIndex = "pathindex/res/index.xml";

/**
    0 BIM模型
    13 遥感影像
    10 WMTS地图服务
    11 倾斜摄影
    14 360全景图
    15 点云
    16 二维图纸
    17 公共构件
    18 我的构件
    19 发布后的构件(场景发布)
    20 矢量
    21 场景CAD
    22 场景矢量
    23 水面
    24 挤出
    25 单体化
*/

interface StateMold {
    noExternalNetwork: boolean,
    baseUrl: string,
    downloadUrl: string,
    token: string,
    source: number,
    sourceRoute: string,
    authorTxtId: string,
    authorTxt: string,
    authorIndexId: string,
    authorIndex: string,
    allDataSetType: Array<Number>,
    entityDataSetType: Array<Number>,
    sceneDataSetType: Array<Number>,
    appSupportDataSetType: Array<Number>,
    appSupportEntityType: Number,
    appSupportWaterType: Number,
    appSupportExtrudeType: Number,
    appSupportMonomerType: Number,
    launchOnce: Boolean,
    agreePolicy: Boolean,
}


export const useStateStore = defineStore('state', {
    state: (): StateMold => ({
        noExternalNetwork: JSON.parse(uni.getStorageSync('RE_noExternalNetwork') || "false") || false,// app无外部网络
        baseUrl: "",// app当前服务配置
        downloadUrl: "",// app当前资源下载服务配置
        token: "",// app当前token
        source: 0,// 判断分享链接来源 0: 私有化 1：黑洞 2：星河 3: 星云
        sourceRoute: RE_ServerSource,// 来源路由
        authorTxtId: RE_AuthorTxtId,// 授权文件标识
        authorTxt: RE_AuthorTxt,// 授权文件
        authorIndexId: RE_AuthorIndexId,// 授权文件索引标识
        authorIndex: RE_AuthorIndex,// 授权文件索引
        allDataSetType: [0, 13, 10, 11, 14, 15, 16, 17, 18, 19, 20, 21, 22],
        entityDataSetType: [17, 18, 19],
        sceneDataSetType: [0, 13, 10, 11, 14, 15, 17, 18, 19, 21, 22],
        appSupportDataSetType: [0, 13, 10, 11, 14, 15, 16, 20, 21, 22],
        appSupportEntityType: 19,
        appSupportWaterType: 23,
        appSupportExtrudeType: 24,
        appSupportMonomerType: 25,
        launchOnce: JSON.parse(uni.getStorageSync('RE_launchOnce') || "false") || false, // 首次启动标记，避免多次创建store
        agreePolicy: JSON.parse(uni.getStorageSync('RE_agreePolicy') || "false") || false,
    }),
    actions: {
        appLaunchOnceUpdate() {
            this.launchOnce = true;
            uni.setStorageSync('RE_launchOnce', JSON.stringify(true));
        },

        agreePolicyUpdate(agree: boolean) {
            this.agreePolicy = agree;
            uni.setStorageSync('RE_agreePolicy', JSON.stringify(agree));
        },
        clearAgree() {
            this.agreePolicy = false;
            uni.setStorageSync('RE_agreePolicy', JSON.stringify(false));
        },

        updateNoExternalNetwork(noExternalNetwork: boolean) {
            this.noExternalNetwork = noExternalNetwork;
            uni.setStorageSync('RE_noExternalNetwork', JSON.stringify(noExternalNetwork));
        },

        // MARK 更新当前的服务配置
        updateCurrBaseUrl(baseUrl: string) {
            this.baseUrl = baseUrl;
            this.downloadUrl = `${baseUrl}${RE_DownloadUrl}`;
        },

        // MARK 更新当前的token
        updateCurrToken(token: string) {
            this.token = token;
        },

        // MARK 更新当前服务来源
        updateCurSource(source: number = 0) {
            this.source = source;
            this.sourceRoute = RE_ServerSource;
        },
    }
});