/*
 * @Author: Lemon C
 * @Date: 2026-03-20 11:31:20
 * @LastEditTime: 2026-03-24 17:59:53
 */

import { useFileStore } from '@/stores/file';



export interface ResponseData {
    data: any;
    errMsg: string;
    isSuccess: boolean;
}


// ================================
// 内部通用封装
// ================================
function createApiHandler(
    requiredFields: string[],
    handler: (data: any) => Promise<ResponseData>
) {
    return (data: any): Promise<ResponseData> => {
        return new Promise((resolve, reject) => {
            // 1. 自动必填校验
            const fnName = handler.name || "api";
            for (const field of requiredFields) {
                if (!data?.[field]) {
                    const msg = `${fnName}: ${field}不能为空`;
                    reject(new Error(msg));
                    return;
                }
            }

            try {
                // 2. 执行你的逻辑（你自己返回 ResponseData）
                handler(data).then(resolve).catch(reject);
            } catch (err) {
                reject(err instanceof Error ? err : new Error("未知错误"));
            }
        });
    };
}

/**
 * 示例代码
 */
// export const 接口名 = createApiHandler(
//     ["必填字段"],//数组形式
//     async function 接口名(data: any) {
//         // 核心逻辑
//         // 直接 return 你的 ResponseData 即可
//         return {
//             data: {},
//             isSuccess: true,
//             errMsg: "",
//         };
//     }
// );


// MOD-- 目录树 相关

// 是否具有空间信息
export const engine_v3_room_exists = createApiHandler(
    ["dataSetId"],
    async function engine_v3_room_exists(data) {
        const dataSetId_noline = data.dataSetId.replace(/-/g, "");//不能使用replaceAll,app端异常
        const file_store = useFileStore();
        const dbPath = `${file_store.rootPath}/${file_store.fileName}/data/${data.dataSetId}.db`;
        const tableName = `${dataSetId_noline}_room_Info`;
        const sql = `SELECT count(*) FROM sqlite_master WHERE type='table' AND name="${tableName}";`;

        const res: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath, sql }, cb));
        if (!res.data) return { data: null, isSuccess: false, errMsg: "", };

        let exist = false;
        if (res.data && res.data[0] && res.data[0]["count(*)"] == 1) {
            exist = true;
        }

        return { data: { exist }, isSuccess: res.success, errMsg: "", };
    }
);

// MOD-- 数据集 相关
// 获取工程信息模型
export const dataSet_v3_viewDataSetModel = createApiHandler(
    ["dataSetIds"],
    async function dataSet_v3_viewDataSetModel(data) {
        const file_store = useFileStore();
        const filePath = `${file_store.rootPath}/${file_store.fileName}/res`;

        const res: any = uni.$tool.toPromise((cb: any) => uni.$re.useFileUniToApp({ type: "getAllSubFileList", data: { filePath } }, cb));
        if (!res.data) return { data: null, isSuccess: false, errMsg: "", };

        const fileList = res.data;
        // 先找出 res 下所有文件夹
        const allFolders = fileList.filter((item: any) => item.isDirectory);
        // 判断是否存在「文件夹名 = dataSetId」的匹配
        const hasDataSetIdFolder = allFolders.some((folder: any) =>
            data.dataSetIds.includes(folder.fileName)
        );
        // 遍历每个dataSetId进行匹配
        const resultList: any[] = [];
        for (const dataSetId of data.dataSetIds) {
            const matchResult: any = {
                resId: dataSetId.replace(/-/g, ""),
                dataSetId,
                dataSetType: 0,
                coordinatesConfig: {
                    coordinatesType: "None",
                    coordinates: "",
                    coordinatesPoint: null,
                    basePointType: null,
                    basePoint: "0,0,0",
                    northAngle: "0",
                },
                status: 10,
                resourcesAddress: "",
                context: "",
                scale: "1.0 1.0 1.0",
                rotate: "0.0 0.0 0.0 1.0",
                translation: "0.0 0.0 0.0",
                readonlyCoordinate: false,
            };
            // 场景1：res下是散装文件（无自文件夹）→ res目录本身就是dataSetId对应的文件夹
            if (!hasDataSetIdFolder) {
                matchResult.resourcesAddress = filePath;
            }
            // 场景2：res下有子文件夹 → 匹配名称等于dataSetId的文件夹 
            else {
                // 找到名称等于dataSetId的文件夹
                const targetFolder = fileList.find((item: any) =>
                    item.isDirectory && item.fileName === dataSetId
                );
                if (targetFolder) {
                    matchResult.resourcesAddress = targetFolder.filePath;
                }
            }
            resultList.push(matchResult);
        }

        return { data: resultList, isSuccess: res.success, errMsg: "", };
    }
);

// MOD-- 场景 相关
// 获取场景信息
export const scene_v3 = createApiHandler(
    [],
    async function scene_v3(data: any) {
        const file_store = useFileStore();
        const dbPath = `${file_store.rootPath}/${file_store.fileName}/data/${data}.db`;

        //读取场景基本信息
        const sql_scene = `SELECT DisplayName, DisplayMode, Coordinates, CoordinatesType, Proj4Coordinates, ExtraProperties FROM Ac_Scene LIMIT 1`;
        const res_scene: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath, sql: sql_scene }, cb));
        if (!res_scene.data) return { data: null, isSuccess: false, errMsg: "", };

        const ExtraProperties = JSON.parse(res_scene.data[0].ExtraProperties);

        let dataSetPosition: any = [];
        let componentPosition: any = [];
        const SceneEdit = ExtraProperties.SceneEdit || [];
        SceneEdit.forEach((el: any) => {
            dataSetPosition.push({
                dataSetId: el.DataSetId,
                scale: el.Scale,
                rotate: el.Rotate,
                translation: el.Translation,
            });
        });
        const SceneComponentEdit = ExtraProperties.SceneComponentEdit || [];
        SceneComponentEdit.forEach((el: any) => {
            componentPosition.push({
                id: el.Id,
                dataSetCrs: el.DataSetCrs,
                scale: el.Scale,
                rotate: el.Rotate,
                translation: el.Translation,
            });
        });

        //读取场景基本信息
        const sql_componentTreeId = `SELECT Id FROM AC_Scene_TreeNode WHERE NodeType = 3 AND ParentId = '00000000-0000-0000-0000-000000000000' AND MetadataNodeType = 19;`;
        const res_componentTreeId: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath, sql: sql_componentTreeId }, cb));
        if (!res_componentTreeId.data) return { data: null, isSuccess: false, errMsg: "", };

        const respone = {
            "sceneId": data,
            "sceneName": res_scene.data[0].DisplayName,
            "coordinatesType": res_scene.data[0].CoordinatesType,
            "coordinates": res_scene.data[0].Coordinates,
            "componentTreeId": res_componentTreeId.data[0].Id,
            "displayMode": res_scene.data[0].DisplayMode,
            "dataSetPosition": dataSetPosition,
            "componentPosition": componentPosition,
        }

        return { data: respone, isSuccess: true, errMsg: "", };
    }
);

export function getTypeStr(value: any): string {
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}






/**
 * 直接定义 URL → 处理方法的映射对象
 * 无需转换方法名，无需调用注册函数，新增方法直接加key-value即可
 */
const urlToHandler: Record<string, (data: any) => Promise<any>> = {
    "/engine/v3/room/exists": engine_v3_room_exists,
    "/dataSet/v3/viewDataSetModel": dataSet_v3_viewDataSetModel,
    "/scene/v3": scene_v3,
};


/**
 * 统一POST请求入口
 * @param url 请求路径 如 "/engine/v3/room/exists"
 * @param data 请求参数
 * @param toast 是否显示提示
 * @returns Promise<any>
 */
export function requestPost(url: string, data?: object, toast: boolean = true): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        // 1. 参数校验
        if (!url) {
            const errorMsg = "requestPost: URL不能为空";
            console.error(errorMsg);
            toast && uni.showToast({ title: errorMsg, icon: "none" });
            reject(new Error(errorMsg));
            return;
        }

        // 2. 直接从映射对象取处理方法（无需转换方法名）
        const handler = urlToHandler[url];
        if (!handler) {
            const errorMsg = `requestPost: 未找到URL对应的处理方法 - ${url}`;
            console.error(errorMsg);
            toast && uni.showToast({ title: errorMsg, icon: "none" });
            reject(new Error(errorMsg));
            return;
        }

        // 3. 执行方法并处理结果
        handler(data)
            .then((res) => {
                // toast && uni.showToast({ title: "操作成功", icon: "success" });
                resolve(res);
            })
            .catch((err) => {
                const errorMsg = `requestPost执行失败：${err.message}`;
                console.error(errorMsg);
                // toast && uni.showToast({ title: errorMsg, icon: "none" });
                reject(err);
            });
    });
}

/**
 * 统一GET请求入口
 * @param url 请求路径 如 "/engine/v3/room/info"
 * @param params 请求参数
 * @param toast 是否显示提示
 * @returns Promise<any>
 */
export function requestGet(url: string, params?: object, toast: boolean = true): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        // 1. 参数校验
        if (!url) {
            const errorMsg = "requestGet: URL不能为空";
            console.error(errorMsg);
            toast && uni.showToast({ title: errorMsg, icon: "none" });
            reject(new Error(errorMsg));
            return;
        }

        // 2. 直接从映射对象取处理方法
        const handler = urlToHandler[url];
        if (!handler) {
            const errorMsg = `requestGet: 未找到URL对应的处理方法 - ${url}`;
            console.error(errorMsg);
            toast && uni.showToast({ title: errorMsg, icon: "none" });
            reject(new Error(errorMsg));
            return;
        }

        // 3. 执行方法并处理结果
        handler(params)
            .then((res) => {
                // toast && uni.showToast({ title: "操作成功", icon: "success" });
                resolve(res);
            })
            .catch((err) => {
                const errorMsg = `requestGet执行失败：${err.message}`;
                console.error(errorMsg);
                // toast && uni.showToast({ title: errorMsg, icon: "none" });
                reject(err);
            });
    });
}