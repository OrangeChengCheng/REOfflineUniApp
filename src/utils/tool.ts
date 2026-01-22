/*
 * @Author: Lemon C
 * @Date: 2024-09-23 14:42:45
 * @LastEditTime: 2026-01-22 15:44:10
 */

const RE_AppVersion = "2.0.1";
const RE_NeedUpdate = true;

import { useCardStore } from '@/stores/card';
import { useDeviceStore } from '@/stores/device';
import uniApi from '@/utils/uniApi';

interface ApiMethods {
    url_base(url: string): string;
    time_compare(frontTime: Date, backTime: Date): string;
    time_To_IOSDate(timeStr: string): string;
    time_format(utcTime: Date): string;
    time_pad2(n: any): any;
    update_data(): void;
    del_data(): void;
    compareVersions(version1: string, version2: string): number;
    getAppVersion(): string;
    initializeData(): void;
}

const api: ApiMethods = {
    url_base: (url: string): string => {
        if (url.length <= 0) return "";
        url = url.trim();

        // 定义需要忽略的路径关键词数组
        // const ignorePathKeywords = ["BlackHole", "StarRiver"];
        const ignorePathKeywords: Array<string> = [];

        // 步骤1：截断 # 及之后的hash部分（如#/dataSetShare/...）
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
            url = url.substring(0, hashIndex);
        }

        // 步骤2：截断 index.html 及之后的内容
        const indexHtmlStr = "index.html";
        const indexHtmlIndex = url.indexOf(indexHtmlStr);
        if (indexHtmlIndex !== -1) {
            url = url.substring(0, indexHtmlIndex);
        }

        // 步骤3：提取协议（http:///https://）
        const protocolEndIndex = url.indexOf('://');
        if (protocolEndIndex === -1) return ""; // 无合法协议，返回空
        const protocol = url.substring(0, protocolEndIndex + 3); // 如 "https://"

        // 步骤4：提取协议后的部分（域名/端口+路径）
        const afterProtocol = url.substring(protocolEndIndex + 3);
        // 找到协议后第一个 "/" 的位置（区分域名/端口和路径）
        const firstSlashAfterProtocol = afterProtocol.indexOf('/');

        let baseUrl = "";
        if (firstSlashAfterProtocol === -1) {
            // 无路径，直接返回 协议+域名/端口
            baseUrl = protocol + afterProtocol;
        } else {
            // 拆分 域名/端口 和 后续路径
            const domainAndPort = afterProtocol.substring(0, firstSlashAfterProtocol); // 如 "test.com" 或 "192.168.31.7:9012"
            const pathPart = afterProtocol.substring(firstSlashAfterProtocol); // 如 "/StarRiver/sub" 或 "/bimhlw"

            // 步骤5：判断路径中是否包含需要忽略的关键词（任意层级都匹配）
            const isIgnorePath = ignorePathKeywords.some(keyword =>
                pathPart.includes(keyword)
            );

            if (isIgnorePath) {
                // 包含忽略关键词，仅保留 协议+域名/端口
                baseUrl = protocol + domainAndPort;
            } else {
                // 不包含忽略关键词，保留 协议+域名/端口+路径（清理末尾/）
                const cleanPath = pathPart.endsWith('/') ? pathPart.slice(0, -1) : pathPart;
                baseUrl = protocol + domainAndPort + cleanPath;
            }
        }

        // 步骤6：最终清理末尾多余的 /（保证格式统一）
        if (baseUrl.endsWith('/')) {
            baseUrl = baseUrl.slice(0, -1);
        }

        return baseUrl;
    },

    // MARK tool 时间对比
    time_compare: (frontTime: Date, backTime: Date): string => {
        let diff = Math.abs(backTime.getTime() - frontTime.getTime());
        let days = Math.floor(diff / (1000 * 60 * 60 * 24));
        let hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        let minutes = Math.floor((diff / (1000 * 60)) % 60);

        if (days > 0) {
            return `${days}天`;
        } else if (hours > 0) {
            return `${hours}小时`;
        } else {
            return `${minutes}分钟`;
        }
    },

    //  MARK tool 处理时间对象，iOS 原生只兼容 yyyy/MM/dd HH:mm:ss 或 ISO 标准格式（yyyy-MM-dd'T'HH:mm:ss）
    time_To_IOSDate: (timeStr: string): string => {
        if (!timeStr || !timeStr.length) return '';
        return timeStr.replace(/-/g, '/');
    },

    // MARK tool 时间格式化
    time_format: (utcTime: any): string => {
        // 空值直接返回空
        if (!utcTime || utcTime === 'null' || utcTime === 'undefined') return "";

        let date = new Date(Date.parse(utcTime));

        let year = date.getFullYear();
        let month = api.time_pad2(date.getMonth() + 1);
        let day = api.time_pad2(date.getDate());
        let hour = api.time_pad2(date.getHours());
        let minute = api.time_pad2(date.getMinutes());
        let second = api.time_pad2(date.getSeconds());
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    },

    time_pad2: (n: any): any => {
        return n < 10 ? "0" + n : n;
    },

    // MARK tool 提示更新数据
    update_data: (): void => {
        const device_store = useDeviceStore();
        if (RE_NeedUpdate) {
            const card_store = useCardStore();

            if (!card_store.cardList || card_store.cardList.length <= 0) return;
            let needUpdata = false;
            const appVersion = device_store.appVersion;
            if (appVersion.length) {
                if (api.compareVersions(RE_AppVersion, appVersion) > 0) {
                    needUpdata = true;
                }
            } else {
                needUpdata = true;
            }
            device_store.update_appVersion(RE_AppVersion);
            if (needUpdata) {
                uni.showModal({
                    title: '更新提示',
                    content: '版本更新后旧分享数据无法使用，请删除后重新扫码获取（取消后可以在设置中重新删除）',
                    success: function (res) {
                        if (res.confirm) {
                            api.initializeData();
                        }
                    }
                });
            }
        } else {
            device_store.update_appVersion(RE_AppVersion);
        }
    },

    compareVersions: (version1: string, version2: string): number => {
        // 拆分版本号为数字数组
        const v1 = version1.split('.').map(Number);
        const v2 = version2.split('.').map(Number);

        // 取最长的数组长度进行比较
        const maxLength = Math.max(v1.length, v2.length);

        for (let i = 0; i < maxLength; i++) {
            // 若某一版本号长度不足，用 0 补位
            const num1 = v1[i] || 0;
            const num2 = v2[i] || 0;

            if (num1 > num2) return 1; // version1 更大
            if (num1 < num2) return -1; // version2 更大
        }

        return 0; // 版本号相等
    },

    // MARK tool 提示删除数据
    del_data: (): void => {
        uni.showModal({
            title: '提示',
            content: '是否清除所有的存储数据（卡片列表和配置信息）',
            success: function (res) {
                if (res.confirm) {
                    api.initializeData();
                }
            }
        });
    },

    // MARK config 获取AppVersion
    getAppVersion: (): string => {
        const info = uniApi.get_SystemInfo();
        return info.appVersion || RE_AppVersion;
    },

    // MARK config 初始化数据
    initializeData: (): void => {
        const card_store = useCardStore();
        card_store.clearCardList();//清空卡片列表
    },
}


export default api;