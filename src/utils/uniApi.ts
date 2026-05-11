import { useDeviceStore } from '@/stores/device';
import { useFileStore } from '@/stores/file';


interface ApiMethods {
    scan_code(): Promise<any>;
    scan_checkPermission(): number;
    scan_authorize(): Promise<any>;
    scan_QRCode(): Promise<any>;
    show_loading(): void;
    hide_loading(): void;
    get_deviceInfo(): void;
    get_SystemInfo(): any;
    pop_showModal(title: any, content: any): Promise<any>;
    file_download(title: any, holder: any): Promise<any>;
}

const api: ApiMethods = {
    // MARK uni-api 扫码（二维码）
    scan_code: (): Promise<any> => {
        return new Promise<any>((resolve, reject) => {
            const permissionType: number = api.scan_checkPermission();
            const device_store = useDeviceStore();
            uni.$re.unipluginLog(JSON.stringify(device_store.deviceInfo));
            if (permissionType == 0) {
                if (!device_store.deviceInfo || !device_store.deviceInfo.osName || device_store.deviceInfo.osName === 'ios') {
                    // iOS需要直接启动相机，不然无法找到权限，设置中也找不到权限
                    api.scan_QRCode().then((res) => {
                        resolve(res);
                    }).catch(reject);
                } else {
                    api.scan_authorize().then((e: any) => {
                        api.scan_QRCode().then((res) => {
                            resolve(res);
                        }).catch(reject);
                    }).catch(reject);
                }
            } else if (permissionType == 2) {
                api.scan_QRCode().then((res) => {
                    resolve(res);
                }).catch(reject);
            }
        });
    },

    // MARK uni-api 鉴权
    scan_checkPermission: (): number => {
        if (Object.prototype.hasOwnProperty.call(uni, 'getAppAuthorizeSetting')) {
            const appAuthorizeSetting = uni.getAppAuthorizeSetting();
            if (appAuthorizeSetting.cameraAuthorized && appAuthorizeSetting.cameraAuthorized.length) {
                // 相机权限
                if (appAuthorizeSetting.cameraAuthorized == 'denied') {
                    // 用户拒绝了相机的使用权限，需要自行打开
                    uni.showToast({ title: '您已拒绝了授权，请前往设置进行打开', icon: 'none' });
                    return 1;
                } else if (appAuthorizeSetting.cameraAuthorized == 'not determined') {
                    // 用户未授权相机的使用权限
                    return 0;
                } else if (appAuthorizeSetting.cameraAuthorized == 'authorized') {
                    // 用户已授权相机的使用权限
                    return 2;
                }
            }
        }
        uni.showToast({ title: '相机权限异常', icon: 'none' });
        return -1;
    },

    // MARK uni-api 授权（相机）
    scan_authorize: (): Promise<any> => {
        return new Promise<any>((resolve, reject) => {
            if (!Object.prototype.hasOwnProperty.call(uni, 'authorize')) {
                uni.showToast({ title: '授权获取失败', icon: 'none' });
                reject(new Error('授权获取失败'));
            }
            // 获取相机授权
            uni.authorize({
                scope: 'scope.camera',
                success() {
                    // 用户同意授权
                    resolve(true);
                },
                fail() {
                    // 用户拒绝授权
                    uni.showToast({ title: '您拒绝了授权', icon: 'none' });
                    reject(new Error('您拒绝了授权'));
                },
            });
        });
    },

    // MARK uni-api 扫码调用（二维码）
    scan_QRCode: (): Promise<any> => {
        return new Promise<any>((resolve, reject) => {
            if (!Object.prototype.hasOwnProperty.call(uni, 'scanCode')) {
                uni.showToast({ title: '扫码失败', icon: 'none' });
                reject(new Error('扫码失败'));
            }
            // 扫二维码
            uni.scanCode({
                autoZoom: false,
                success: (res) => {
                    uni.$re.unipluginLog('scan_QRCode: ' + JSON.stringify(res));
                    resolve(res.result);
                },
                fail: (err) => {
                    uni.showToast({ title: "扫码取消", icon: 'none' });
                    uni.$re.unipluginLog(JSON.stringify(err));
                    reject(err);
                },
            });
        });
    },

    // MARK uni-app  展示loading
    show_loading: () => {
        uni.showLoading({
            title: '加载中...',
        });
    },

    // MARK uni-app  隐藏loading
    hide_loading: () => {
        uni.hideLoading();
    },

    // MARK uni-app  获取设备信息
    get_deviceInfo: () => {
        uni.getSystemInfo({
            success: (res) => {
                const device_store = useDeviceStore();
                device_store.update_deviceInfo(res);
                const file_store = useFileStore();
				file_store.update_rootPath(res);
            },
            fail: (err) => {
                console.log(err);
                uni.$re.unipluginLog('uni.getSystemInfo: ' + JSON.stringify(err));
            },
        });
    },

    // MARK uni-app  获取系统信息
    get_SystemInfo: (): any => {
        const info = uni.getSystemInfoSync();
        return info;
    },

    // MARK uni-app  确认弹窗
    pop_showModal: (title: any, content: any): Promise<any> => {
        return new Promise((resolve) => {
            uni.showModal({
                title: title,
                content: content,
                success: (res) => {
                    resolve(res); // 把结果返回出去
                },
            });
        });
    },

    // MARK uni-app  下载文件
    file_download: (url: any, holder: any): any => {
        return new Promise((resolve, reject) => {
            // 外部传入对象，内部给对象的 task 属性赋值，不然无法正确将值传递出去
            holder.task = uni.downloadFile({
                url: url,
                success: (res) => {
                    if (res.statusCode === 200) resolve(res);
                    else reject(res);
                },
                fail: reject,
            });
        });
    },


}

export default api;