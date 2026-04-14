/*
 * @Author: Lemon C
 * @Date: 2026-03-20 11:31:20
 * @LastEditTime: 2026-04-14 10:23:01
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
//     ["必填字段"],
//     async function 接口名(data: any) {
//         return { data: {}, isSuccess: true, errMsg: "", };
//     }
// );



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
        if (!res_scene.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

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
        if (!res_componentTreeId.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        const respone = {
            sceneId: data,
            sceneName: res_scene.data[0].DisplayName,
            coordinatesType: res_scene.data[0].CoordinatesType,
            coordinates: res_scene.data[0].Coordinates,
            componentTreeId: res_componentTreeId.data[0].Id,
            displayMode: res_scene.data[0].DisplayMode,
            dataSetPosition: dataSetPosition,
            componentPosition: componentPosition,
        }

        return { data: respone, isSuccess: true, errMsg: "", };
    }
);



// MOD-- 目录树 相关
// 根据场景ID查询树
export const sceneTree_v3_getTreeById = createApiHandler(
    ["sceneId"],
    async function sceneTree_v3_getTreeById(data: any) {
        const file_store = useFileStore();
        const dbPath_scene = `${file_store.rootPath}/${file_store.fileName}/data/${data.sceneId}.db`;

        //从数据库读取节点信息
        const sql_sceneTreeNode = `SELECT * FROM Ac_Scene_TreeNode`;
        const res_sceneTreeNode: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_scene, sql: sql_sceneTreeNode }, cb));
        if (!res_sceneTreeNode.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        const nodeList: any[] = res_sceneTreeNode.data;

        // --------------------------------------------------------------------
        // 【步骤1】创建所有节点（不处理父子关系，只初始化节点）
        // --------------------------------------------------------------------
        const allNodes: any[] = []; // 所有节点
        for (const node of nodeList) {
            const { Id, MetadataNodeId, DisplayName, MetadataNodeType, NodeType, ParentId, LevelCode, LevelPathName, ViewStatus } = node;
            let displayName = DisplayName;
            if (displayName === '模型文件') displayName = '模型';
            if (displayName === '模型元件') displayName = '构件';

            // === 创建树节点 ===
            const treeNode: any = {
                dataSetType: MetadataNodeType,
                dataSetId: MetadataNodeId,
                sceneNodeId: Id,
                sceneNodeName: DisplayName,
                parentId: ParentId,
                levelCode: LevelCode,
                levelPathName: LevelPathName,
                nodeType: NodeType,
                viewStatus: ViewStatus,
                coordinates: null,
                componentInfo: null,
                waterInfo: null,
                excavateInfo: null,
                monomerizationInfo: null,
                enableLazyLoading: false,
                fileIntId: null,
                uniqueId: null,
                formatType: 0,
                subNodes: [],
            };

            // 处理子节点特殊类型数据
            if (treeNode.nodeType == 2) {
                const dataSetId_noline = treeNode.dataSetId.replace(/-/g, "");//不能使用replaceAll,app端异常
                // BIM模型
                if (treeNode.dataSetType == 0) {
                    const dbPath_bim = `${file_store.rootPath}/${file_store.fileName}/data/${treeNode.dataSetId}/${treeNode.dataSetId}.db`;

                    //从数据库读取模型文件信息
                    const tableName = `${dataSetId_noline}_filename`;
                    const sql_bimFile = `SELECT HostFileId, TreeNode FROM "${tableName}";`;
                    const res_bimFile: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_bim, sql: sql_bimFile }, cb));
                    if (!res_bimFile.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

                    const { HostFileId, TreeNode } = res_bimFile.data[0];
                    treeNode.fileIntId = HostFileId.toString();
                    treeNode.uniqueId = "1";// 这个参数目前没有用，但是后续调用其他接口的时候，会传递这个参数，所以不能删除这个参数，统一传参
                    treeNode.enableLazyLoading = TreeNode ? false : true;

                    //从数据库读取模型树信息
                    const sql_bimTreeNode = `SELECT FormatType FROM AC_Bim_TreeNode;`;
                    const res_bimTreeNode: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_bim, sql: sql_bimTreeNode }, cb));
                    if (!res_bimTreeNode.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

                    const { FormatType } = res_bimTreeNode.data[0];
                    treeNode.formatType = FormatType;
                }
                // 倾斜摄影
                else if (treeNode.dataSetType == 11) {
                    const dbPat_osgb = `${file_store.rootPath}/${file_store.fileName}/data/${treeNode.dataSetId}/${treeNode.dataSetId}.db`;

                    //从数据库读取坐标系信息
                    const sql_osgbTreeNode = `SELECT * FROM AC_Osgb_TreeNode;`;
                    const res_osgbTreeNode: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPat_osgb, sql: sql_osgbTreeNode }, cb));
                    if (!res_osgbTreeNode.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败" };

                    const { FormatType } = res_osgbTreeNode.data[0];
                    treeNode.formatType = FormatType;
                }
                // 点云
                else if (treeNode.dataSetType == 15) {
                    const dbPat_pointCloud = `${file_store.rootPath}/${file_store.fileName}/data/${treeNode.dataSetId}/${treeNode.dataSetId}.db`;

                    // 获取类型
                    const sql_pcTreeNode = `SELECT * FROM AC_PointCloud_TreeNode;`;
                    const res_pcTreeNode: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPat_pointCloud, sql: sql_pcTreeNode }, cb));
                    if (!res_pcTreeNode.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败" };

                    const { FormatType } = res_pcTreeNode.data[0];
                    treeNode.formatType = FormatType;
                }
                // 场景cad矢量
                else if (treeNode.dataSetType == 21) {
                    // 获取配置信息
                    const sql_cadShp = `SELECT * FROM AC_Scene_Cad;`;
                    const res_cadShp: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_scene, sql: sql_cadShp }, cb));
                    if (!res_cadShp.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败" };

                    const { LodConfig, Lod } = res_cadShp.data[0];
                    if (LodConfig) {
                        const LodConfig_json = JSON.parse(LodConfig);
                        const systemLodConfig = {
                            recommendLod: LodConfig_json.CurLOD,
                            currentLod: LodConfig_json.CurLOD,
                            lodNum: LodConfig_json.LODNum,
                            resolution: LodConfig_json.Resolution,
                            tileSize: LodConfig_json.TileSize,
                            visualRange: LodConfig_json.VisualRange
                        }
                        treeNode.systemLodConfig = systemLodConfig;
                    }
                    treeNode.lod = Lod;
                }
                // 场景矢量
                else if (treeNode.dataSetType == 22) {
                    // 获取配置信息
                    const sql_sceneShp = `SELECT * FROM AC_Scene_Vector;`;
                    const res_sceneShp: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_scene, sql: sql_sceneShp }, cb));
                    if (!res_sceneShp.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败" };

                    const { LodConfig, Lod } = res_sceneShp.data[0];
                    if (LodConfig) {
                        const LodConfig_json = JSON.parse(LodConfig);
                        const systemLodConfig = {
                            recommendLod: LodConfig_json.CurLOD,
                            currentLod: LodConfig_json.CurLOD,
                            lodNum: LodConfig_json.LODNum,
                            resolution: LodConfig_json.Resolution,
                            tileSize: LodConfig_json.TileSize,
                            visualRange: LodConfig_json.VisualRange
                        }
                        treeNode.systemLodConfig = systemLodConfig;
                    }
                    treeNode.lod = Lod;
                }
                // 单构件
                else if (treeNode.dataSetType == 19) {
                    //从数据库读取单构件信息
                    const sql_compInfo = `SELECT * FROM AC_Scene_Component_Instance WHERE TreeNodeId = "${treeNode.dataSetId}"`;
                    const res_compInfo: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_scene, sql: sql_compInfo }, cb));
                    if (!res_compInfo.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

                    const { FileId, ElemId, HasAnimation, EnableAnimationPlay, PlayMode, IsPublished, IsRemoved, ExtraProperties } = res_compInfo.data[0];
                    // 获取单构件位置信息
                    const location: any = { DataSetCRS: "", scale: "[1,1,1]", rotate: "[0,0,0,1]", translation: "[0,0,0]" };
                    const ExtraProperties_json = JSON.parse(ExtraProperties);
                    if (ExtraProperties_json && ExtraProperties_json.Location) {
                        location.DataSetCRS = ExtraProperties_json.Location.DataSetCRS;
                        location.scale = ExtraProperties_json.Location.Scale;
                        location.rotate = ExtraProperties_json.Location.Rotate;
                        location.translation = ExtraProperties_json.Location.Translation;
                    }

                    //从数据库读取单构件文件信息
                    const sql_compFile = `SELECT "Index" FROM AC_Scene_Component_Paks WHERE FileId = "${FileId}";`;//Index 是 SQL 的保留关键字，需要用双引号 " 或 **反引号 `** 把 Index 包起来
                    const res_compFile: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_scene, sql: sql_compFile }, cb));
                    if (!res_compFile.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

                    const { Index } = res_compFile.data[0];

                    const componentInfo: any = {
                        instanceIndex: ElemId,
                        playMode: PlayMode,
                        enableAnimationPlay: EnableAnimationPlay ? true : false,
                        location: location,
                        hostFileId: Index,
                        isPublished: IsPublished ? true : false,
                        isRemoved: IsRemoved ? true : false,
                        hasAnimation: HasAnimation ? true : false,
                        treeNodeId: treeNode.dataSetId
                    }
                    treeNode.componentInfo = componentInfo;
                }
                // 水面
                else if (treeNode.dataSetType == 23) {
                    //从数据库读取水面信息
                    const sql_water = `SELECT * FROM AC_Scene_Water WHERE Id = "${treeNode.dataSetId}"`;
                    const res_water: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_scene, sql: sql_water }, cb));
                    if (!res_water.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

                    const { Id, Color, Transparency, GeoJson, BlendDist, ExpandDist, DepthBias, VisDist } = res_water.data[0];
                    const waterInfo: any = {
                        blendDist: BlendDist,
                        color: Color,
                        depthBias: DepthBias,
                        expandDist: ExpandDist,
                        geoJson: GeoJson,
                        id: Id,
                        transparency: Transparency,
                        visDist: VisDist,
                    }
                    treeNode.waterInfo = waterInfo;
                }
                // 挤出（挖洞）
                else if (treeNode.dataSetType == 24) {
                    //从数据库读取挤出（挖洞）信息
                    const sql_extrude = `SELECT * FROM AC_Scene_Excavate WHERE Id = "${treeNode.dataSetId}"`;
                    const res_extrude: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_scene, sql: sql_extrude }, cb));
                    if (!res_extrude.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
                    const { Id, GeoJson, DigType, TextureFileDataId, DepthLimitRange, TreeNodeIds } = res_extrude.data[0];
                    const excavateInfo: any = {
                        id: Id,
                        digType: DigType,
                        textureFileDataId: TextureFileDataId,
                        geoJson: GeoJson,
                        treeNodeIds: TreeNodeIds ? JSON.parse(TreeNodeIds) : null,
                        depthLimitRange: DepthLimitRange
                    }
                    treeNode.excavateInfo = excavateInfo;
                }
                // 单体化
                else if (treeNode.dataSetType == 25) {
                    //从数据库读取单体化信息
                    const sql_monomer = `SELECT * FROM AC_Scene_Monomerization WHERE Id = "${treeNode.dataSetId}"`;
                    const res_monomer: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_scene, sql: sql_monomer }, cb));
                    if (!res_monomer.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

                    const { Id, TopHeight, BottomHeight, Level, Expansion, SpaceNumPerUnit, DisplayMode, MonomerizationType, RegionJson, IsBindModel, DataSetId } = res_monomer.data[0];
                    //单体化分层分户信息（单元）
                    const sql_monomer_unit = `SELECT * FROM AC_Scene_Monomerization_Unit WHERE MonomerizationId = "${Id}"`;
                    const res_monomer_unit: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_scene, sql: sql_monomer_unit }, cb));
                    if (!res_monomer_unit.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

                    const monomer_units = res_monomer_unit.data;
                    const levelJson: any[] = [];
                    //单体化分层分户信息（层）
                    for (const unit of monomer_units) {
                        const sql_monomer_floor = `SELECT * FROM AC_Scene_Monomerization_Floor WHERE UnitId = "${unit.Id}"`;
                        const res_monomer_floor: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_scene, sql: sql_monomer_floor }, cb));
                        if (!res_monomer_floor.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

                        const monomer_floors = res_monomer_floor.data;
                        const floors: any[] = [];
                        //单体化分层分户信息（房间）
                        for (const floor of monomer_floors) {
                            const sql_monomer_room = `SELECT * FROM AC_Scene_Monomerization_Room WHERE FloorId = "${floor.Id}"`;
                            const res_monomer_room: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_scene, sql: sql_monomer_room }, cb));
                            if (!res_monomer_room.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

                            const monomer_rooms = res_monomer_room.data;
                            const rooms: any[] = [];
                            for (const room of monomer_rooms) {
                                rooms.push({
                                    id: room.Id,
                                    name: room.Name,
                                    attrs: room.AttrJson ? JSON.parse(room.AttrJson) : [],
                                    geoJson: room.GeoJson
                                });
                            }
                            floors.push({ id: floor.Id, name: floor.Name, rooms: rooms });
                        }
                        levelJson.push({ id: unit.Id, name: unit.Name, floors: floors });
                    }

                    const monomerizationInfo: any = {
                        topHeight: TopHeight,
                        bottomHeight: BottomHeight,
                        level: Level,
                        expansion: Expansion,
                        spaceNumPerUnit: SpaceNumPerUnit,
                        displayMode: DisplayMode,
                        monomerizationType: MonomerizationType,
                        regionJson: RegionJson,
                        isBindModel: IsBindModel,
                        dataSetId: DataSetId,
                        levelJson: levelJson
                    }
                    treeNode.monomerizationInfo = monomerizationInfo;
                }
            }

            allNodes.push(treeNode);
        }

        // --------------------------------------------------------------------
        // 【步骤2】建立父子映射关系创建目录树结构（核心！）
        // --------------------------------------------------------------------
        const nodeMap = new Map<string, any>();
        const rootNodes: any[] = [];

        allNodes.forEach(n => nodeMap.set(n.sceneNodeId, n));//构件map结构，便于查找
        allNodes.forEach(node => {
            if (node.parentId === '00000000-0000-0000-0000-000000000000') {
                rootNodes.push(node);
            } else {
                const parent = nodeMap.get(node.parentId);// 查找rootNodes里的父节点
                parent && parent.subNodes.push(node);
            }
        });

        return { data: rootNodes, isSuccess: true, errMsg: "", };
    }
);

// 获取模型目录树
export const dataSet_v3_dataSetRootNodes = createApiHandler(
    ["dataSetId"],
    async function dataSet_v3_dataSetRootNodes(data: any) {
        const file_store = useFileStore();
        const dbPath_bim = `${file_store.rootPath}/${file_store.fileName}/data/${data.dataSetId}.db`;
        const dataSetId_noline = data.dataSetId.replace(/-/g, "");//不能使用replaceAll,app端异常

        // 获取项目信息
        const sql_proj = `SELECT * FROM Project`;
        const res_proj: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_bim, sql: sql_proj }, cb));
        if (!res_proj.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
        const { ProjCatalog } = res_proj.data[0];
        const dataSetType = ProjCatalog; // 获取数据集类型

        //获取模型树信息
        const sql_bimTreeNode = `SELECT * FROM AC_Bim_TreeNode WHERE Id = "${data.dataSetId}";`;
        const res_bimTreeNode: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_bim, sql: sql_bimTreeNode }, cb));
        if (!res_bimTreeNode.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
        const { Id, DisplayName, FormatType } = res_bimTreeNode.data[0];

        //获取模型所有文件信息
        const tableName = `${dataSetId_noline}_filename`;
        const sql_bimFile = `SELECT * FROM "${tableName}";`;
        const res_bimFile: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_bim, sql: sql_bimFile }, cb));
        if (!res_bimFile.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        let count = 2;// 用于区分文件不同，且和上一层级区分开，这个参数目前没有用，但是后续调用其他接口的时候，会传递这个参数，所以不能删除这个参数，统一传参
        const fileList: any[] = []; // 所有文件信息
        for (const bimFile of res_bimFile.data) {
            //获取文件名
            const fullFileName = `${bimFile.HostFileName}${bimFile.FileSuffix}`;

            //获取资源信息
            const sql_bimMetaData = `SELECT * FROM AC_Bim_Metadata WHERE Name = "${fullFileName}";`;
            const res_bimMetaData: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_bim, sql: sql_bimMetaData }, cb));
            if (!res_bimMetaData.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
            const { Id } = res_bimMetaData.data[0];

            //获取pak信息
            const sql_bimPakMap = `SELECT * FROM PakMap WHERE "Index" = ${Math.abs(bimFile.HostFileId)};`;
            const res_bimPakMap: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_bim, sql: sql_bimPakMap }, cb));
            if (!res_bimPakMap.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
            const { PakName } = res_bimPakMap.data[0];// 实际目录树中显示的名称是和fileName有区别，使用pakMap表中的数据

            const file = {
                fileIntId: bimFile.HostFileId.toString(),
                fileName: PakName,
                uniqueId: count.toString(),
                enableLazyLoading: bimFile.TreeNode ? false : true,
                hasRvtGroup: bimFile.RvtGroupTreeNode && JSON.parse(bimFile.RvtGroupTreeNode).nodes.length ? true : false,
                fileId: Id,
                srcCatalog: dataSetType,
            }
            fileList.push(file);
            count++;
        }

        const rootNodes: any[] = [];//目录树数据
        // 创建目录树节点
        const treeNode = {
            dataSetId: Id,
            dataSetName: DisplayName,
            uniqueId: "1",// 这个参数目前没有用，但是后续调用其他接口的时候，会传递这个参数，所以不能删除这个参数，统一传参
            dataSetType: dataSetType,
            formatType: FormatType,
            files: fileList
        };
        rootNodes.push(treeNode);
        return { data: rootNodes, isSuccess: true, errMsg: "", };
    }
);


// 请求模型目录树子节点
export const dataSet_v3_dataSetFileTreeNodes = createApiHandler(
    ["dataSetId", "fileIntId", "uniqueId"],
    async function dataSet_v3_dataSetFileTreeNodes(data: any) {
        const file_store = useFileStore();
        const fileRootPath = `${file_store.rootPath}/${file_store.fileName}`;
        const filePath_res = `${fileRootPath}/res`;
        const dataSetId_noline = data.dataSetId.replace(/-/g, "");//不能使用replaceAll,app端异常

        // 获取当前资源是场景还是单数据集
        const res_folder: any = await uni.$tool.toPromise((cb: any) => uni.$re.useFileUniToApp({ type: "getAllSubFileList", data: { filePath: filePath_res } }, cb));
        if (!res_folder.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
        const fileList = res_folder.data;
        const allFolders = fileList.filter((item: any) => item.isDirectory);
        // 判断是否存在「文件夹名 = dataSetId」的匹配, 如果存在和数据集id相同的文件夹，代表文件是场景类型
        const isScene = allFolders.some((folder: any) =>
            [data.dataSetId].includes(folder.fileName)
        );

        // 获取数据库文件路径
        const dbPath = !isScene ? `${fileRootPath}/data/${data.dataSetId}.db` : `${fileRootPath}/data/${data.dataSetId}/${data.dataSetId}.db`;
        const tableName = `${dataSetId_noline}_treenode`;

        // 判断目录树子节点表是否存在
        const sql_treenodeExist = `SELECT count(*) FROM sqlite_master WHERE type='table' AND name="${tableName}";`;
        const res_treenodeExist: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_treenodeExist }, cb));
        if (!res_treenodeExist.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
        if (res_treenodeExist.data[0] && !res_treenodeExist.data[0]["count(*)"]) return { data: [], isSuccess: true, errMsg: "", };

        // 获取子节点数据
        const sql_treenode = `SELECT * FROM "${tableName}" WHERE HostFile_Id = "${data.fileIntId}";`;
        const res_treenode: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_treenode }, cb));
        if (!res_treenode.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        const nodeList: any[] = res_treenode.data;
        // 构件目录树结构
        // --------------------------------------------------------------------
        // 【步骤1】创建所有节点（不处理父子关系，只初始化节点）
        // --------------------------------------------------------------------
        const allNodes: any[] = []; // 所有节点
        for (const node of nodeList) {
            const { TreeNode_int_Id, TreeNode_Name, Parent_Node_Int_Id } = node;

            // === 创建树节点 ===
            const treeNode: any = {
                nodeId: TreeNode_int_Id.toString(),
                name: TreeNode_Name,
                uniqueId: "",
                parentNodeId: Parent_Node_Int_Id.toString(),
                nodes: [],
            };
            allNodes.push(treeNode);
        }

        // --------------------------------------------------------------------
        // 【步骤2】建立父子映射关系创建目录树结构（核心！）
        // --------------------------------------------------------------------
        const nodeMap = new Map<string, any>();
        const rootNodes: any[] = [];

        allNodes.forEach(n => nodeMap.set(n.nodeId, n));//构件map结构，便于查找
        allNodes.forEach(node => {
            if (node.parentNodeId === '-1') {
                rootNodes.push(node);
            } else {
                const parent = nodeMap.get(node.parentNodeId);// 查找父节点
                parent && parent.nodes.push(node);
            }
        });

        // --------------------------------------------------------------------
        // 【步骤3】深度优先递归赋值 uniqueId（子孙全走完再同级）
        // --------------------------------------------------------------------
        let count = 2;//每个节点都需要不同的数据，且顺序唯一
        const setUniqueId = (node: any) => {
            // 先给当前节点赋值
            node.uniqueId = `2_${count}`;
            count++;
            // 递归遍历所有子节点（深度优先：子孙全部走完）
            if (node.nodes && node.nodes.length) {
                node.nodes.forEach((child: any) => setUniqueId(child));
            }
        };
        // 从根节点开始赋值
        rootNodes.forEach(node => setUniqueId(node));

        // --------------------------------------------------------------------
        // 【步骤4】递归删除所有节点不需要的字段
        // --------------------------------------------------------------------
        const deleteParentId = (node: any) => {
            delete node.parentNodeId;
            if (node.nodes && node.nodes.length) {
                node.nodes.forEach((child: any) => deleteParentId(child));
            }
        };
        rootNodes.forEach(node => deleteParentId(node));

        return { data: rootNodes, isSuccess: true, errMsg: "", };
    }
);

// 请求模型目录树子节点-懒加载
export const dataSet_v3_dataSetFileTreeNodes_lazy = createApiHandler(
    ["dataSetId", "parentNodeIntId", "hostFileId"],
    async function dataSet_v3_dataSetFileTreeNodes_lazy(data: any) {
        const file_store = useFileStore();
        const fileRootPath = `${file_store.rootPath}/${file_store.fileName}`;
        const filePath_res = `${fileRootPath}/res`;
        const dataSetId_noline = data.dataSetId.replace(/-/g, "");//不能使用replaceAll,app端异常

        // 获取当前资源是场景还是单数据集
        const res_folder: any = await uni.$tool.toPromise((cb: any) => uni.$re.useFileUniToApp({ type: "getAllSubFileList", data: { filePath: filePath_res } }, cb));
        if (!res_folder.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
        const fileList = res_folder.data;
        const allFolders = fileList.filter((item: any) => item.isDirectory);
        // 判断是否存在「文件夹名 = dataSetId」的匹配, 如果存在和数据集id相同的文件夹，代表文件是场景类型
        const isScene = allFolders.some((folder: any) =>
            [data.dataSetId].includes(folder.fileName)
        );

        // 获取数据库文件路径
        const dbPath = !isScene ? `${fileRootPath}/data/${data.dataSetId}.db` : `${fileRootPath}/data/${data.dataSetId}/${data.dataSetId}.db`;
        const tableName = `${dataSetId_noline}_treenode`;

        // 判断目录树子节点表是否存在
        const sql_treenodeExist = `SELECT count(*) FROM sqlite_master WHERE type='table' AND name="${tableName}";`;
        const res_treenodeExist: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_treenodeExist }, cb));
        if (!res_treenodeExist.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
        if (res_treenodeExist.data[0] && !res_treenodeExist.data[0]["count(*)"]) return { data: [], isSuccess: true, errMsg: "", };

        // 获取子节点数据
        const sql_treenode = `SELECT * FROM "${tableName}" WHERE HostFile_Id = ${data.hostFileId} AND Parent_Node_Int_Id = ${data.parentNodeIntId} ORDER BY TreeNode_int_Id ASC;`;
        const res_treenode: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_treenode }, cb));
        if (!res_treenode.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        const nodeList: any[] = res_treenode.data;
        // 构件目录树结构
        const rootNodes: any[] = []; // 所有节点
        for (const node of nodeList) {
            const { TreeNode_int_Id, TreeNode_Name, LevelCode } = node;

            // === 创建树节点 ===
            const treeNode: any = {
                nodeIntId: TreeNode_int_Id,
                nodeName: TreeNode_Name,
                levelCode: LevelCode,
            };
            rootNodes.push(treeNode);
        }

        return { data: rootNodes, isSuccess: true, errMsg: "", };
    }
);

// 请求模型目录树下的构件ID
export const element_v3_getTreeChildren = createApiHandler(
    ["dataSets"],
    async function element_v3_getTreeChildren(data: any) {
        const file_store = useFileStore();
        const fileRootPath = `${file_store.rootPath}/${file_store.fileName}`;
        const filePath_res = `${fileRootPath}/res`;
        // 获取数据集id
        const dataSetId = data.dataSets[0].dataSetId;
        const dataSetId_noline = dataSetId.replace(/-/g, "");//不能使用replaceAll,app端异常

        // 获取当前资源是场景还是单数据集
        const res_folder: any = await uni.$tool.toPromise((cb: any) => uni.$re.useFileUniToApp({ type: "getAllSubFileList", data: { filePath: filePath_res } }, cb));
        if (!res_folder.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
        const fileList = res_folder.data;
        const allFolders = fileList.filter((item: any) => item.isDirectory);
        // 判断是否存在「文件夹名 = dataSetId」的匹配, 如果存在和数据集id相同的文件夹，代表文件是场景类型
        const isScene = allFolders.some((folder: any) =>
            [dataSetId].includes(folder.fileName)
        );

        // 获取数据库文件路径
        const dbPath = !isScene ? `${fileRootPath}/data/${dataSetId}.db` : `${fileRootPath}/data/${dataSetId}/${dataSetId}.db`;
        const tableName = `${dataSetId_noline}_treenode`;

        // 判断目录树子节点表是否存在
        const sql_treenodeExist = `SELECT count(*) FROM sqlite_master WHERE type='table' AND name="${tableName}";`;
        const res_treenodeExist: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_treenodeExist }, cb));
        if (!res_treenodeExist.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
        if (res_treenodeExist.data[0] && !res_treenodeExist.data[0]["count(*)"]) return { data: [], isSuccess: true, errMsg: "", };

        // 获取子节点数据
        const childNodeIdListStr = data.dataSets.map((item: any) => item.childNodeId).join(",");// 获取所有需要查询的父节点id集合拼接的字符串
        const sql_treenode = `SELECT * FROM "${tableName}" WHERE TreeNode_int_Id IN (${childNodeIdListStr}) AND Child_Elem_Int_Id_Str !="";`;
        const res_treenode: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_treenode }, cb));
        if (!res_treenode.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        // 构造子集合
        const childNodeIds: any[] = res_treenode.data
            .map((item: any) => item.Child_Elem_Int_Id_Str.split(",").map(Number)) // 每个字符串拆成数字数组
            .flat(); // 展平成一维数组

        return { data: [{ dataSetId: dataSetId, childNodeIds: childNodeIds }], isSuccess: true, errMsg: "", };
    }
);

// 请求模型目录树下的构件ID-懒加载
export const element_v3_getTreeChildren_lazy = createApiHandler(
    ["dataSetId", "hostFileId", "levelCode"],
    async function element_v3_getTreeChildren_lazy(data: any) {
        const file_store = useFileStore();
        const fileRootPath = `${file_store.rootPath}/${file_store.fileName}`;
        const filePath_res = `${fileRootPath}/res`;
        const dataSetId_noline = data.dataSetId.replace(/-/g, "");//不能使用replaceAll,app端异常

        // 获取当前资源是场景还是单数据集
        const res_folder: any = await uni.$tool.toPromise((cb: any) => uni.$re.useFileUniToApp({ type: "getAllSubFileList", data: { filePath: filePath_res } }, cb));
        if (!res_folder.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
        const fileList = res_folder.data;
        const allFolders = fileList.filter((item: any) => item.isDirectory);
        // 判断是否存在「文件夹名 = dataSetId」的匹配, 如果存在和数据集id相同的文件夹，代表文件是场景类型
        const isScene = allFolders.some((folder: any) =>
            [data.dataSetId].includes(folder.fileName)
        );

        // 获取数据库文件路径
        const dbPath = !isScene ? `${fileRootPath}/data/${data.dataSetId}.db` : `${fileRootPath}/data/${data.dataSetId}/${data.dataSetId}.db`;
        const tableName = `${dataSetId_noline}_treenode`;

        // 判断目录树子节点表是否存在
        const sql_treenodeExist = `SELECT count(*) FROM sqlite_master WHERE type='table' AND name="${tableName}";`;
        const res_treenodeExist: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_treenodeExist }, cb));
        if (!res_treenodeExist.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
        if (res_treenodeExist.data[0] && !res_treenodeExist.data[0]["count(*)"]) return { data: [], isSuccess: true, errMsg: "", };

        // 获取子节点数据
        const sql_treenode = `
            SELECT *
            FROM "${tableName}"
            WHERE Parent_Node_Int_Id = (
                SELECT TreeNode_int_Id 
                FROM "${tableName}"  
                WHERE LevelCode = "${data.levelCode}"
            );
        `
        const res_treenode: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_treenode }, cb));
        if (!res_treenode.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        // 构造子集合
        const elemIdList: any[] = res_treenode.data.map((item: any) => Number(item.Child_Elem_Int_Id_Str));

        return { data: elemIdList, isSuccess: true, errMsg: "", };
    }
);


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
        if (!res.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        let exist = false;
        if (res.data && res.data[0] && res.data[0]["count(*)"] == 1) {
            exist = true;
        }

        return { data: { exist }, isSuccess: res.success, errMsg: "", };
    }
);

// 获取空间信息
export const engine_v3_room_list = createApiHandler(
    ["dataSetId", "fileNames"],
    async function engine_v3_room_list(data: any) {
        const file_store = useFileStore();
        const dbPath = `${file_store.rootPath}/${file_store.fileName}/data/${data.dataSetId}.db`;
        const dataSetId_noline = data.dataSetId.replace(/-/g, "");//不能使用replaceAll,app端异常

        //获取房间信息
        const tableName = `${dataSetId_noline}_room_Info`;
        const sql_roomInfo = `SELECT * FROM "${tableName}";`;
        const res_roomInfo: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_roomInfo }, cb));
        if (!res_roomInfo.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        // 创建用于递归的子函数
        const traverse = (item: any, supNodes: any[]) => {
            // 构建目标节点
            const newItem = {
                nodeId: item.nodeId,
                nodeName: item.name,
                nodes: []
            };

            // 递归子节点
            if (item.nodes && item.nodes.length) {
                item.nodes.forEach((sub: any) => {
                    traverse(sub, newItem.nodes);
                });
            }

            // 把处理好的节点放进结果
            supNodes.push(newItem);
        };

        // 处理房间数据
        const dataList: any[] = [];
        for (const info of res_roomInfo.data) {
            const rooms: any[] = []; // 所有房间信息
            if (info.TreeNode) {
                const TreeNode_json = JSON.parse(info.TreeNode);
                // 开始遍历
                TreeNode_json.nodes.forEach((item: any) => {
                    traverse(item, rooms);
                });
            }

            //获取pak信息
            const sql_pakMap = `SELECT * FROM PakMap WHERE "Index" = ${Math.abs(info.HostFile_Id)};`;
            const res_pakMap: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_pakMap }, cb));
            if (!res_pakMap.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
            const { PakName } = res_pakMap.data[0];

            const roomInfo = {
                hostFileId: info.HostFile_Id,
                hostFileName: PakName,
                elementIntIds: info.Elem_IntIds ? info.Elem_IntIds.split(',').map((el: any) => Number(el)) : [],
                rooms: rooms
            }
            dataList.push(roomInfo);
        }

        return { data: dataList, isSuccess: true, errMsg: "", };
    }
);



// 获取房间构件
export const element_v3_getRoomTreeChildren = createApiHandler(
    ["dataSetId", "childNodeId"],
    async function element_v3_getRoomTreeChildren(data: any) {
        const file_store = useFileStore();
        const dbPath = `${file_store.rootPath}/${file_store.fileName}/data/${data.dataSetId}.db`;
        const dataSetId_noline = data.dataSetId.replace(/-/g, "");//不能使用replaceAll,app端异常

        //获取房间构件信息
        const tableName = `${dataSetId_noline}_room_elements`;
        const sql_roomElem = `SELECT * FROM "${tableName}" WHERE Parent_Node_Int_Id = ${Number(data.childNodeId)};`;
        const res_roomElem: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_roomElem }, cb));
        if (!res_roomElem.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        const elemIdList = res_roomElem.data.map((item: any) => item.Elem_int_Id);
        const { HostFile_Id } = res_roomElem.data[0];

        return { data: { elemIntIds: elemIdList, hostFileId: HostFile_Id }, isSuccess: true, errMsg: "", };
    }
);

// 获取房间信息
export const engine_v3_room_element_parameter_list = createApiHandler(
    ["dataSetId", "elementIntId"],
    async function engine_v3_room_element_parameter_list(data: any) {
        const file_store = useFileStore();
        const dbPath = `${file_store.rootPath}/${file_store.fileName}/data/${data.dataSetId}.db`;
        const dataSetId_noline = data.dataSetId.replace(/-/g, "");//不能使用replaceAll,app端异常

        //获取房间构件信息
        const sql_roomElem = `SELECT * FROM "${dataSetId_noline}_room_elements" WHERE Elem_int_Id = ${Number(data.elementIntId)};`;
        const res_roomElem: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_roomElem }, cb));
        if (!res_roomElem.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        const { Elem_Id } = res_roomElem.data[0];

        //获取房间构件属性信息
        const sql_roomElemAttr = `SELECT * FROM "${dataSetId_noline}_room_element_parameter" WHERE Elem_Id = "${Elem_Id}";`;
        const res_roomElemAttr: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_roomElemAttr }, cb));
        if (!res_roomElemAttr.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        const nodeList: any[] = res_roomElemAttr.data;

        // 构件树结构
        // --------------------------------------------------------------------
        // 【步骤1】创建所有节点（不处理父子关系，只初始化节点）
        // --------------------------------------------------------------------
        const allNodes: any[] = []; // 所有节点
        for (const node of nodeList) {
            const { Param_Name, Param_Value, Param_Group, Unit_Type } = node;

            // === 创建树节点 ===
            const treeNode: any = {
                roomParamName: Param_Name,
                roomParamValue: Param_Value,
                roomParamGroup: Param_Group,
                roomParamType: Unit_Type,
            };
            allNodes.push(treeNode);
        }

        // --------------------------------------------------------------------
        // 【步骤2】建立父子映射关系创建树结构（核心！）
        // --------------------------------------------------------------------
        const rootNodes: any[] = [];
        allNodes.forEach(node => {
            const group = node.roomParamGroup;
            const find = rootNodes.find((item: any) => item.roomParamGroup === group);
            if (find) {
                find.roomParams.push(node);
            } else {
                rootNodes.push({ roomParamGroup: group, roomParams: [node] });
            }
        });

        return { data: rootNodes, isSuccess: true, errMsg: "", };
    }
);



// MOD-- 数据集 相关
// 获取工程信息模型
export const dataSet_v3_viewDataSetModel = createApiHandler(
    ["dataSetIds"],
    async function dataSet_v3_viewDataSetModel(data) {
        const file_store = useFileStore();
        const fileRootPath = `${file_store.rootPath}/${file_store.fileName}`;
        const filePath_res = `${fileRootPath}/res`;

        const res_folder: any = await uni.$tool.toPromise((cb: any) => uni.$re.useFileUniToApp({ type: "getAllSubFileList", data: { filePath: filePath_res } }, cb));
        if (!res_folder.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        const fileList = res_folder.data;
        // 区分场景资源和单模型资源类型
        // 先找出 res 下所有文件夹
        const allFolders = fileList.filter((item: any) => item.isDirectory);
        // 判断是否存在「文件夹名 = dataSetId」的匹配, 如果存在和数据集id相同的文件夹，代表文件是场景类型
        const isScene = allFolders.some((folder: any) =>
            data.dataSetIds.includes(folder.fileName)
        );
        // 遍历每个dataSetId进行匹配
        const resultList: any[] = [];
        // 单文件数据集类型
        if (!isScene) {
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
                // 获取本地资源链接
                // 场景1：res下是散装文件（无自文件夹）→ res目录本身就是dataSetId对应的文件夹
                matchResult.resourcesAddress = filePath_res;

                // 获取项目信息
                const dbPath = `${fileRootPath}/data/${dataSetId}.db`;
                const sql_proj = `SELECT * FROM Project`;
                const res_proj: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_proj }, cb));
                if (!res_proj.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

                const { ProjCatalog } = res_proj.data[0];
                const dataSetType = ProjCatalog; // 获取数据集类型
                matchResult.dataSetType = dataSetType;

                // bim/倾斜摄影/点云
                if (dataSetType == 0 || dataSetType == 11 || dataSetType == 15) {
                    // 获取坐标信息
                    const tableName = { 0: 'AC_Bim_TreeNode', 11: 'AC_Osgb_TreeNode', 15: 'AC_PointCloud_TreeNode' }[dataSetType as 0 | 11 | 15];
                    const sql_coord = `SELECT * FROM ${tableName} WHERE Id = "${dataSetId}";`;
                    const res_coord: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_coord }, cb));
                    if (!res_coord.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

                    const { CoordinatesConfig, CoordinatesDefault } = res_coord.data[0];
                    if (CoordinatesConfig) {
                        const CoordinatesDefault_json = JSON.parse(CoordinatesDefault);
                        matchResult.coordinatesConfig.coordinates = CoordinatesDefault_json.Coordinates;
                        matchResult.coordinatesConfig.basePoint = CoordinatesDefault_json.BasePoint;
                        matchResult.coordinatesConfig.northAngle = CoordinatesDefault_json.NorthAngle;
                        matchResult.coordinatesConfig.coordinatesType = CoordinatesDefault_json.CoordinatesType;
                        matchResult.coordinatesConfig.coordinatesPoint = CoordinatesDefault_json.CoordinatesPoint;
                        matchResult.coordinatesConfig.basePointType = CoordinatesDefault_json.BasePointType;
                    } else if (!CoordinatesDefault) {
                        matchResult.coordinatesConfig.coordinatesType = "None";
                    } else {
                        const CoordinatesDefault_json = JSON.parse(CoordinatesDefault);
                        matchResult.coordinatesConfig.coordinates = CoordinatesDefault_json.Coordinates;
                        matchResult.coordinatesConfig.basePoint = CoordinatesDefault_json.BasePoint;
                        matchResult.coordinatesConfig.northAngle = CoordinatesDefault_json.NorthAngle;
                        if (!CoordinatesDefault_json.Coordinates.length) {
                            matchResult.coordinatesConfig.coordinatesType = "None";
                        } else if (CoordinatesDefault_json.Coordinates.startsWith("EPSG")) {
                            matchResult.coordinatesConfig.coordinatesType = "EPSG";
                        } else {
                            matchResult.coordinatesConfig.coordinatesType = "WKT";
                        }
                    }
                }
                // wmts地图/遥感影像/单文件矢量
                else if (dataSetType == 10 || dataSetType == 13 || dataSetType == 20) {
                    // 获取坐标信息
                    const tableName = { 10: 'AC_Wmts_TreeNode', 13: 'AC_Rs_TreeNode', 20: 'AC_Vector_TreeNode' }[dataSetType as 10 | 13 | 20];
                    const sql_coord = `SELECT * FROM ${tableName} WHERE Id = "${dataSetId}";`;
                    const res_coord: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_coord }, cb));
                    if (!res_coord.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

                    const { CoordinatesDefault } = res_coord.data[0];
                    if (!CoordinatesDefault) {
                        matchResult.coordinatesConfig.coordinatesType = "None";
                    } else {
                        const CoordinatesDefault_json = JSON.parse(CoordinatesDefault);
                        matchResult.coordinatesConfig.coordinates = CoordinatesDefault_json.Coordinates;
                        if (!CoordinatesDefault_json.Coordinates.length) {
                            matchResult.coordinatesConfig.coordinatesType = "None";
                        } else if (CoordinatesDefault_json.Coordinates.startsWith("EPSG")) {
                            matchResult.coordinatesConfig.coordinatesType = "EPSG";
                        } else {
                            matchResult.coordinatesConfig.coordinatesType = "WKT";
                        }
                    }
                }
                resultList.push(matchResult);
            }
        }
        // 场景类型
        else {
            // 获取场景数据库文件
            const res_sceneDBFile: any = await uni.$tool.toPromise((cb: any) => uni.$re.file_getChildBySuffix({ filePath: `${fileRootPath}/data`, suffix: ".db" }, cb));
            if (!res_sceneDBFile.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

            const { filePath } = res_sceneDBFile.data[0];
            const dbPath_scene = filePath;

            // 获取场景树信息
            const sql_sceneTreeNode = `SELECT * FROM AC_Scene_TreeNode WHERE NodeType = 2`;
            const res_sceneTreeNode: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_scene, sql: sql_sceneTreeNode }, cb));
            if (!res_sceneTreeNode.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
            const sceneTreeNode = res_sceneTreeNode.data;

            // 遍历获取信息
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
                // 获取本地资源链接
                // 场景2：res下有子文件夹 → 匹配名称等于dataSetId的文件夹 
                const targetFolder = fileList.find((item: any) =>
                    item.isDirectory && item.fileName === dataSetId
                );
                if (targetFolder) {
                    matchResult.resourcesAddress = targetFolder.filePath;
                }

                // 获取资源类型
                const treeNodeRes = sceneTreeNode.find((el: any) => el.MetadataNodeId == dataSetId || el.ParentId == dataSetId);
                const dataSetType = treeNodeRes.MetadataNodeType; // 获取数据集类型
                matchResult.dataSetType = dataSetType;

                // bim/倾斜摄影/点云
                if (dataSetType == 0 || dataSetType == 11 || dataSetType == 15) {
                    // 获取坐标信息
                    const dbPath_subFile = `${fileRootPath}/data/${dataSetId}/${dataSetId}.db`;
                    const tableName = { 0: 'AC_Bim_TreeNode', 11: 'AC_Osgb_TreeNode', 15: 'AC_PointCloud_TreeNode' }[dataSetType as 0 | 11 | 15];
                    const sql_coord = `SELECT * FROM ${tableName} WHERE Id = "${dataSetId}";`;
                    const res_coord: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_subFile, sql: sql_coord }, cb));
                    if (!res_coord.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

                    const { CoordinatesConfig, CoordinatesDefault } = res_coord.data[0];
                    if (CoordinatesConfig) {
                        matchResult.coordinatesConfig = JSON.parse(CoordinatesConfig);
                    } else if (!CoordinatesDefault) {
                        matchResult.coordinatesConfig.coordinatesType = "None";
                    } else {
                        const CoordinatesDefault_json = JSON.parse(CoordinatesDefault);
                        matchResult.coordinatesConfig.coordinates = CoordinatesDefault_json.Coordinates;
                        matchResult.coordinatesConfig.basePoint = CoordinatesDefault_json.BasePoint;
                        matchResult.coordinatesConfig.northAngle = CoordinatesDefault_json.NorthAngle;
                        if (!CoordinatesDefault_json.Coordinates.length) {
                            matchResult.coordinatesConfig.coordinatesType = "None";
                        } else if (CoordinatesDefault_json.Coordinates.startsWith("EPSG")) {
                            matchResult.coordinatesConfig.coordinatesType = "EPSG";
                        } else {
                            matchResult.coordinatesConfig.coordinatesType = "WKT";
                        }
                    }
                }
                // wmts地图/遥感影像
                else if (dataSetType == 10 || dataSetType == 13) {
                    // 获取坐标信息
                    const dbPath_subFile = `${fileRootPath}/data/${dataSetId}/${dataSetId}.db`;
                    const tableName = { 10: 'AC_Wmts_TreeNode', 13: 'AC_Rs_TreeNode' }[dataSetType as 10 | 13];
                    const sql_coord = `SELECT * FROM ${tableName} WHERE Id = "${dataSetId}";`;
                    const res_coord: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_subFile, sql: sql_coord }, cb));
                    if (!res_coord.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

                    const { CoordinatesDefault } = res_coord.data[0];
                    if (!CoordinatesDefault) {
                        matchResult.coordinatesConfig.coordinatesType = "None";
                    } else {
                        const CoordinatesDefault_json = JSON.parse(CoordinatesDefault);
                        matchResult.coordinatesConfig.coordinates = CoordinatesDefault_json.Coordinates;
                        if (!CoordinatesDefault_json.Coordinates.length) {
                            matchResult.coordinatesConfig.coordinatesType = "None";
                        } else if (CoordinatesDefault_json.Coordinates.startsWith("EPSG")) {
                            matchResult.coordinatesConfig.coordinatesType = "EPSG";
                        } else {
                            matchResult.coordinatesConfig.coordinatesType = "WKT";
                        }
                    }
                }
                // 场景矢量
                else if (dataSetType == 22) {
                    // 获取场景矢量信息
                    const sql_sceneShp = `SELECT * FROM AC_Scene_Vector WHERE TreeNodeId = "${dataSetId}";`;
                    const res_sceneShp: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_scene, sql: sql_sceneShp }, cb));
                    if (!res_sceneShp.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

                    const { MetaData } = res_sceneShp.data[0];
                    if (MetaData) {
                        const MetaData_json = JSON.parse(MetaData);
                        matchResult.coordinatesConfig.coordinates = MetaData_json.ProjInfo;
                        if (!MetaData_json.ProjInfo) {
                            matchResult.coordinatesConfig.coordinatesType = "None";
                        } else if (MetaData_json.ProjInfo.startsWith("EPSG")) {
                            matchResult.coordinatesConfig.coordinatesType = "EPSG";
                        } else {
                            matchResult.coordinatesConfig.coordinatesType = "WKT";
                        }
                    } else {
                        matchResult.coordinatesConfig.coordinatesType = "None";
                    }

                }
                // 场景CAD
                else if (dataSetType == 21) {
                    // 获取场景CAD信息
                    const sql_sceneCADShp = `SELECT * FROM AC_Scene_Cad WHERE TreeNodeId = "${dataSetId}";`;
                    const res_sceneCADShp: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_scene, sql: sql_sceneCADShp }, cb));
                    if (!res_sceneCADShp.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

                    const { CoordinatesDefault } = res_sceneCADShp.data[0];
                    if (CoordinatesDefault) {
                        const CoordinatesDefault_json = JSON.parse(CoordinatesDefault);
                        matchResult.coordinatesConfig.coordinates = CoordinatesDefault_json.Coordinates;
                        matchResult.coordinatesConfig.basePoint = CoordinatesDefault_json.BasePoint;
                        matchResult.coordinatesConfig.northAngle = CoordinatesDefault_json.NorthAngle;
                        matchResult.coordinatesConfig.coordinatesType = CoordinatesDefault_json.CoordinatesType;
                        matchResult.coordinatesConfig.coordinatesPoint = CoordinatesDefault_json.CoordinatesPoint;
                        matchResult.coordinatesConfig.basePointType = CoordinatesDefault_json.BasePointType;
                    }
                }
                resultList.push(matchResult);
            }
        }
        return { data: resultList, isSuccess: true, errMsg: "", };
    }
);


// MOD-- CAD 相关
// 获取数据集下的文件列表
export const cadTree_v3_file_list = createApiHandler(
    ["dataSetId"],
    async function cadTree_v3_file_list(data: any) {
        const file_store = useFileStore();
        const dbPath_cad = `${file_store.rootPath}/${file_store.fileName}/data/${data.dataSetId}.db`;

        //获取树信息
        const sql_cadTreeNode = `SELECT * FROM AC_Cad_TreeNode WHERE Id = "${data.dataSetId}";`;
        const res_cadTreeNode: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_cad, sql: sql_cadTreeNode }, cb));
        if (!res_cadTreeNode.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
        const { Id, Unit } = res_cadTreeNode.data[0];

        //获取资源信息
        const sql_cadMetaData = `SELECT * FROM AC_Cad_Metadata WHERE NodeId = "${Id}";`;
        const res_cadMetaData: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath_cad, sql: sql_cadMetaData }, cb));
        if (!res_cadMetaData.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        const items: any[] = []; // 所有资源信息
        for (const cadMeta of res_cadMetaData.data) {
            const item = {
                fileId: cadMeta.Id,
                dataSetId: cadMeta.NodeId,
                fileDataId: cadMeta.FileDataId,
                fileResourceId: cadMeta.FileResourceId,
                dir: cadMeta.Dir,
                fileName: cadMeta.Name,
                fileType: cadMeta.FileType,
                formatType: cadMeta.FormatType,
                uploadTime: cadMeta.UploadTime,
                scheme: cadMeta.Scheme,
                length: cadMeta.Length,
                rate: cadMeta.Rate,
                status: cadMeta.Status,
                resourcesAddress: `${file_store.rootPath}/${file_store.fileName}/res/${cadMeta.Dir}/${cadMeta.FileResourceId}`,
                unit: Unit,
                lastModificationTime: cadMeta.LastModificationTime,
                creationTime: cadMeta.CreationTime,
            }
            items.push(item);
        }
        return { data: { totalCount: items.length, items: items }, isSuccess: true, errMsg: "", };
    }
);


// MOD-- 属性 相关
// 查询模型属性
export const element_v3_getElementParam = createApiHandler(
    ["dataSetId", "elementIntId", "isQueryExtend"],
    async function element_v3_getElementParam(data: any) {
        uni.$re.unipluginLog("-----------");
        const file_store = useFileStore();
        const fileRootPath = `${file_store.rootPath}/${file_store.fileName}`;
        const filePath_res = `${fileRootPath}/res`;
        const dataSetId_noline = data.dataSetId.replace(/-/g, "");//不能使用replaceAll,app端异常

        // 获取当前资源是场景还是单数据集
        const res_folder: any = await uni.$tool.toPromise((cb: any) => uni.$re.useFileUniToApp({ type: "getAllSubFileList", data: { filePath: filePath_res } }, cb));
        if (!res_folder.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
        const fileList = res_folder.data;
        const allFolders = fileList.filter((item: any) => item.isDirectory);
        // 判断是否存在「文件夹名 = dataSetId」的匹配, 如果存在和数据集id相同的文件夹，代表文件是场景类型
        const isScene = allFolders.some((folder: any) =>
            [data.dataSetId].includes(folder.fileName)
        );

        // 获取数据库文件路径
        const dbPath = !isScene ? `${fileRootPath}/data/${data.dataSetId}.db` : `${fileRootPath}/data/${data.dataSetId}/${data.dataSetId}.db`;

        // 获取属性信息
        const sql_param = `
            SELECT *
            FROM "${dataSetId_noline}_element_parameter"
            WHERE Params_Id IN (
                SELECT Params_Id 
                FROM "${dataSetId_noline}_elem_elemparam_map"  
                WHERE Elem_int_Id = "${data.elementIntId}"
            );
        `
        const res_param: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_param }, cb));
        if (!res_param.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        const res_paramList = res_param.data;

        // 获取扩展属性信息（只有场景中的模型才有扩展属性）
        let res_paramExtendList: any[] = [];
        let res_paramExtendGroupList: any[] = [];
        if (isScene && data.isQueryExtend) {
            const sql_param_extend = `SELECT * FROM "${dataSetId_noline}_element_parameter_extend" WHERE Elem_int_Id = ${data.elementIntId};`;
            const res_param_extend: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_param_extend }, cb));
            if (!res_param_extend.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

            res_paramExtendList = res_param_extend.data;
            const paramGroupIdList_t = res_paramExtendList.map((el: any) => el.Param_Group);
            const paramGroupIdList = [...new Set(paramGroupIdList_t)]; // 去重

            const sql_param_extend_group = `SELECT * FROM "${dataSetId_noline}_parameter_extend_group" WHERE Id IN (${paramGroupIdList});`;
            const res_param_extend_group: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_param_extend_group }, cb));
            if (!res_param_extend_group.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

            res_paramExtendGroupList = res_param_extend_group.data;
        }


        // 构件树结构
        // --------------------------------------------------------------------
        // 【步骤1】创建所有节点（不处理父子关系，只初始化节点）
        // --------------------------------------------------------------------
        const paramList: any[] = [];
        for (const node of res_paramList) {
            const { Param_Name, Param_Value, Param_Group, Unit_Type } = node;

            // === 创建树节点 ===
            const treeNode: any = {
                paramName: Param_Name,
                paramValue: Param_Value,
                paramGroup: Param_Group,
                paramType: Unit_Type,
                paramsOrder: 0,
            };
            paramList.push(treeNode);
        }

        const extendParams: any[] = [];
        for (const node of res_paramExtendList) {
            const find = res_paramExtendGroupList.find((el: any) => el.Id === node.Param_Group);
            // === 创建树节点 ===
            const treeNode: any = {
                elementGuidId: node.Elem_Id,
                elementIntId: node.Elem_int_Id,
                elementName: node.Elem_Name,
                extendParamGroupId: node.Param_Group,
                extendParamGroupName: find.Param_Group,
                extendParamId: node.Id,
                extendParamName: node.Param_Name,
                extendParamOrder: node.Param_Order,
                extendParamType: node.Unit_Type,
                extendParamValue: node.Param_Value,
                hostFileId: node.HostFile_Id,
            };
            extendParams.push(treeNode);
        }

        // --------------------------------------------------------------------
        // 【步骤2】建立父子映射关系创建树结构（核心！）
        // --------------------------------------------------------------------
        const elementParamGroups: any[] = [];
        paramList.forEach((node: any) => {
            const group = node.paramGroup;
            const find = elementParamGroups.find((item: any) => item.paramGroup === group);
            if (find) {
                find.paramDatas.push(node);
            } else {
                elementParamGroups.push({ paramGroup: group, paramDatas: [node] });
            }
        });

        uni.$re.unipluginLog(JSON.stringify(elementParamGroups));
        uni.$re.unipluginLog(JSON.stringify(extendParams));
        uni.$re.unipluginLog("-----------");


        return { data: { elementParamGroups: elementParamGroups, extendParams: extendParams }, isSuccess: true, errMsg: "", };
    }
);

// 获取矢量属性信息
export const element_v3_getVectorParam = createApiHandler(
    ["dataSetId", "elemId"],
    async function element_v3_getVectorParam(data: any) {
        const file_store = useFileStore();
        const fileRootPath = `${file_store.rootPath}/${file_store.fileName}`;
        const filePath_res = `${fileRootPath}/res`;
        const dataSetId_noline = data.dataSetId.replace(/-/g, "");//不能使用replaceAll,app端异常

        // 获取当前资源是场景还是单数据集
        const res_folder: any = await uni.$tool.toPromise((cb: any) => uni.$re.useFileUniToApp({ type: "getAllSubFileList", data: { filePath: filePath_res } }, cb));
        if (!res_folder.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
        const fileList = res_folder.data;
        const allFolders = fileList.filter((item: any) => item.isDirectory);
        // 判断是否存在「文件夹名 = dataSetId」的匹配, 如果存在和数据集id相同的文件夹，代表文件是场景类型
        const isScene = allFolders.some((folder: any) =>
            [data.dataSetId].includes(folder.fileName)
        );

        const paramList: any[] = [];
        if (!isScene) {
            // 获取数据库文件路径
            const dbPath = `${fileRootPath}/data/${data.dataSetId}.db`;

            // 获取属性信息
            const sql_param = `SELECT * FROM "${dataSetId_noline}_vector_params" WHERE Elem_Id = "${data.elemId}";`;
            const res_param: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_param }, cb));
            if (!res_param.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
            uni.$re.unipluginLog(JSON.stringify(res_param.data));
            for (const item of res_param.data) {
                const param: any = {
                    key: item.Vector_Key,
                    value: item.Vector_Value,
                };
                paramList.push(param);
            }
        } else {
            // TODO 数据库中缺少了场景中矢量的属性表
        }
        return { data: paramList, isSuccess: true, errMsg: "", };
    }
);

// 查询构件属性类型
export const componentLibrary_v3_getComponentParamTypes = createApiHandler(
    ["dataSetId", "hostFileId"],
    async function componentLibrary_v3_getComponentParamTypes(data: any) {
        uni.$re.unipluginLog("-----------");
        const file_store = useFileStore();
        const fileRootPath = `${file_store.rootPath}/${file_store.fileName}`;
        const dataSetId_noline = data.dataSetId.replace(/-/g, "");//不能使用replaceAll,app端异常

        // 获取场景数据库文件
        const res_sceneDBFile: any = await uni.$tool.toPromise((cb: any) => uni.$re.file_getChildBySuffix({ filePath: `${fileRootPath}/data`, suffix: ".db" }, cb));
        if (!res_sceneDBFile.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        const { filePath } = res_sceneDBFile.data[0];
        const dbPath = filePath;// 获取数据库文件路径（单构件只存在场景中）

        // 判断表是否存在
        const sql_comp_param_map = `SELECT count(*) FROM sqlite_master WHERE type='table' AND name="${dataSetId_noline}_component_params_map";`;
        const res_comp_param_map: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_comp_param_map }, cb));
        if (!res_comp_param_map.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };
        if (res_comp_param_map.data[0] && !res_comp_param_map.data[0]["count(*)"]) return { data: [], isSuccess: true, errMsg: "", };

        //获取属性类型信息
        const sql_param_type = `SELECT * FROM "${dataSetId_noline}_component_params_map" WHERE HostFile_Id = ${data.hostFileId * -1};`;
        const res_param_type: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_param_type }, cb));
        if (!res_param_type.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        const paramTypeList: any[] = [];
        for (const item of res_param_type.data) {
            const param: any = {
                paramsId: item.Params_Id,
                paramsType: item.Params_Type,
            };
            paramTypeList.push(param);
        }

        uni.$re.unipluginLog(JSON.stringify(paramTypeList));
        uni.$re.unipluginLog("-----------");
        return { data: paramTypeList, isSuccess: true, errMsg: "", };
    }
);

// 查询构件属性
export const componentLibrary_v3_getComponentProperty = createApiHandler(
    ["dataSetId", "dataSetType", "hostFileId", "id", "paramType"],
    async function componentLibrary_v3_getComponentProperty(data: any) {
        const file_store = useFileStore();
        const fileRootPath = `${file_store.rootPath}/${file_store.fileName}`;
        const dataSetId_noline = data.dataSetId.replace(/-/g, "");//不能使用replaceAll,app端异常

        // 获取场景数据库文件
        const res_sceneDBFile: any = await uni.$tool.toPromise((cb: any) => uni.$re.file_getChildBySuffix({ filePath: `${fileRootPath}/data`, suffix: ".db" }, cb));
        if (!res_sceneDBFile.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        const { filePath } = res_sceneDBFile.data[0];
        const dbPath = filePath;// 获取数据库文件路径（单构件只存在场景中）

        // 构建默认的属性
        if (data.paramType === "default") {
            //获取节点信息
            const sql_sceneTreeNode = `SELECT * FROM Ac_Scene_TreeNode WHERE Id = "${data.dataSetId}"`;
            const res_sceneTreeNode: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_sceneTreeNode }, cb));
            if (!res_sceneTreeNode.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

            //获取单构件信息
            const sql_compInfo = `SELECT * FROM AC_Scene_Component_Instance WHERE TreeNodeId = "${data.id}"`;
            const res_compInfo: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_compInfo }, cb));
            if (!res_compInfo.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

            const paramList: any[] = [];
            paramList.push({ paramName: "数据名称", paramValue: res_sceneTreeNode.data[0].DisplayName, paramType: "" });
            paramList.push({ paramName: "源文件", paramValue: res_compInfo.data[0].Name, paramType: "" });
            paramList.push({ paramName: "大小", paramValue: (Number(res_compInfo.data[0].FileSize) / 1024 / 1024).toFixed(2), paramType: "MB" });
            paramList.push({ paramName: "格式", paramValue: res_compInfo.data[0].FileExtension, paramType: "" });

            return { data: [{ group: "文件信息", data: paramList }], isSuccess: true, errMsg: "", };
        }

        //获取属性信息
        const sql_param = `
            SELECT *
            FROM "${dataSetId_noline}_component_params"
            WHERE Params_Id IN (
                SELECT Params_Id 
                FROM "${dataSetId_noline}_component_params_map"  
                WHERE Params_Type = "${data.paramType}"
            );
        `
        const res_param: any = await uni.$tool.toPromise((cb: any) => uni.$re.dbQuery({ dbPath: dbPath, sql: sql_param }, cb));
        if (!res_param.data) return { data: null, isSuccess: false, errMsg: "数据库信息获取失败", };

        // 构件树结构
        // --------------------------------------------------------------------
        // 【步骤1】创建所有节点（不处理父子关系，只初始化节点）
        // --------------------------------------------------------------------
        const paramList: any[] = [];
        for (const item of res_param.data) {
            const param: any = {
                paramName: item.Param_Name,
                paramValue: item.Param_Value,
                paramType: item.Unit_Type,
                paramId: item.Param_Id,
                paramGuid: item.Param_Guid,
                paramDisplayUnit: item.Param_Display_Unit,
                paramStorageType: item.Param_Storage_Type,
                paramBuildIn: item.Param_Build_In,
                paramGroup: item.Param_Group,
            }
            paramList.push(param);
        }

        // --------------------------------------------------------------------
        // 【步骤2】建立父子映射关系创建树结构（核心！）
        // --------------------------------------------------------------------
        const paramsGroups: any[] = [];
        paramList.forEach((node: any) => {
            const group = node.paramGroup;
            const find = paramsGroups.find((item: any) => item.group === group);
            if (find) {
                find.data.push(node);
            } else {
                paramsGroups.push({ group: group, data: [node] });
            }
        });

        return { data: paramsGroups, isSuccess: true, errMsg: "", };
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
    "/scene/v3": scene_v3,
    "/sceneTree/v3/getTreeById": sceneTree_v3_getTreeById,
    "/dataSet/v3/dataSetRootNodes": dataSet_v3_dataSetRootNodes,
    "/dataSet/v3/dataSetFileTreeNodes": dataSet_v3_dataSetFileTreeNodes,
    "/dataSet/v3/dataSetFileTreeNodes/lazy": dataSet_v3_dataSetFileTreeNodes_lazy,
    "/element/v3/getTreeChildren": element_v3_getTreeChildren,
    "/element/v3/getTreeChildren/lazy": element_v3_getTreeChildren_lazy,
    "/engine/v3/room/exists": engine_v3_room_exists,
    "/engine/v3/room/list": engine_v3_room_list,
    "/element/v3/getRoomTreeChildren": element_v3_getRoomTreeChildren,
    "/engine/v3/room/element/parameter/list": engine_v3_room_element_parameter_list,
    "/dataSet/v3/viewDataSetModel": dataSet_v3_viewDataSetModel,
    "/cadTree/v3/file/list": cadTree_v3_file_list,
    "/element/v3/getElementParam": element_v3_getElementParam,
    "/element/v3/getVectorParam": element_v3_getVectorParam,
    "/componentLibrary/v3/getComponentParamTypes": componentLibrary_v3_getComponentParamTypes,
    "/componentLibrary/v3/getComponentProperty": componentLibrary_v3_getComponentProperty,
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