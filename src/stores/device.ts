import { defineStore } from 'pinia'


interface Device {
    deviceType: string;
    deviceBrand: string;
    deviceModel: string;
    osName: string;
    osVersion: string;
    browserName: string;
    romName: string;
    romVersion: string;
}

interface DeviceMold {
    deviceInfo: Device,
    isConnected: boolean,
    networkType: string,
    appVersion: string,
}


export const useDeviceStore = defineStore('device', {
    state: (): DeviceMold => ({
        deviceInfo: JSON.parse(uni.getStorageSync('RE_device') || '{}') || {} as Device,
        isConnected: true,
        networkType: "",
        appVersion: uni.getStorageSync('RE_appVersion') || "",
    }),
    actions: {
        // MARK uni-app  更新设备信息
        update_deviceInfo(e: any) {
            this.deviceInfo = {} as Device;

            let device_tamp: Device = {} as Device;
            device_tamp.deviceType = e.deviceType || "";
            device_tamp.deviceBrand = e.deviceBrand || "";
            device_tamp.deviceModel = e.deviceModel || "";
            device_tamp.osName = e.osName || "";
            device_tamp.osVersion = e.osVersion || "";
            device_tamp.browserName = e.browserName || "";
            device_tamp.romName = e.romName || "";
            device_tamp.romVersion = e.romVersion || "";

            this.deviceInfo = device_tamp;
            uni.setStorageSync('RE_device', JSON.stringify(this.deviceInfo));
        },

        // MARK uni-app  更新网络信息
        update_networkInfo(e: any) {
            if (!e.hasOwnProperty('isConnected') || e.isConnected === null || e.isConnected === undefined) {
                if (e.networkType !== "none") {
                    this.isConnected = true;
                } else {
                    this.isConnected = false;
                }
            } else {
                this.isConnected = e.isConnected;
                if (e.networkType === "2g") {
                    this.isConnected = false;
                }
            }
            this.networkType = e.networkType;
            console.log(e);
            console.log(this.isConnected);

        },

        // MARK device  更新版本信息
        update_appVersion(appVersion: string) {
            this.appVersion = appVersion;
            uni.setStorageSync('RE_appVersion', this.appVersion);
        },
    },
});