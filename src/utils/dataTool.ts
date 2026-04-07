import { useStateStore } from '@/stores/state';

const SETCRS_DATA_TYPE = [0, 11, 15]; // 需要设置坐标系和基点的数据类型

interface ApiMethods {
    handle_formatSceneTree(sceneTree: any, sceneInfo: any): any;
    handle_dataSetIdList(sceneTree: any, sceneInfo: any): any;
    handle_dataSetId(dataSetList: any): any;
    handle_dataSetCRS(dataSetInfo: any): any;
    handle_dataSetCRSNorth(dataSetInfo: any): any;
    handle_engineOrigin(dataSetInfo: any): any;
    handle_dataSetTrans(dataSetList: any, dataSetTrans: any): any;
    handle_terrainLayerLev(dataSetList: any, dataSetTerrain: any): any;
    handle_findAllNodeByLevel(nodeData: any, level: number): any;
    handle_formatMonomerInfo(monomerInfo: any): any;
    handle_terrainDataSetList(sceneTree: any, nodeType: number): any;
    handle_entityData(sceneTree: any, entityEditTranList: any): any;
    handle_waterData(sceneTree: any): any;
    handle_extrudeData(sceneTree: any, extrudeTexList: any): any;
    handle_monomerData(sceneTree: any): any;
    handle_monomerByNodes(nodeData: any): any;
}

const api: ApiMethods = {
    // MARK data 格式化-场景树
    handle_formatSceneTree: (sceneTree: any, sceneInfo: any) => {
        if (!sceneTree) return [];
        let sceneData = sceneTree;
        let rootFolders = api.handle_findAllNodeByLevel(sceneData, 3);
        let folders = api.handle_findAllNodeByLevel(sceneData, 1);
        let allFolders = [...rootFolders, ...folders];
        allFolders.forEach((item) => {
            let rootNodeId = item.levelCode.split('/')[0];
            let find = rootFolders.find((el: any) => el.sceneNodeId === rootNodeId);
            item.dataSetType = find.dataSetType;
            item.srcDataSetType = find.srcDataSetType;
            item['nodeName'] = item.sceneNodeName;
            item['nodeId'] = item.sceneNodeId;
        });
        let allDatasets = api.handle_findAllNodeByLevel(sceneData, 2);
        let { componentPosition } = sceneInfo;
        allDatasets.forEach((item: any) => {
            item['customNodeType'] = 'dataSet';
            item['nodeId'] = item.sceneNodeId;
            item['nodeName'] = item.sceneNodeName;
            if (item.viewStatus === 2) {
                item['disabled'] = true;
            }

            if (item.dataSetType === 0 && item.viewStatus !== 2) {
                item.subNodes.push({ nodeName: '' });
            }

            if (item.dataSetType === 19) {
                let componentInfo = item.componentInfo;
                componentInfo.id = componentInfo.treeNodeId;
                let find = componentPosition.find((el: any) => el.id === componentInfo.id);
                if (find) {
                    componentInfo.location = {
                        rotate: find.rotate,
                        scale: find.scale,
                        translation: find.translation,
                    };
                }
                let { hostFileId, instanceIndex, isPublished } = componentInfo;
                if (isPublished) {
                    componentInfo.dataSetId = sceneInfo.componentTreeId;
                    componentInfo.elemId = Number(`${hostFileId}${instanceIndex}`);
                }
            }

            // 水面类型，将waterId提升一级，方便调用
            if (item.dataSetType === 23) {
                let waterInfo = item.waterInfo;
                item.waterId = waterInfo.id;
            }

            // 开挖类型，将extrudeId提升一级，方便调用
            if (item.dataSetType === 24) {
                let extrudeInfo = item.excavateInfo;
                item.extrudeId = extrudeInfo.id;
            }

            if (item.dataSetType === 25) {
                item.customNodeType = 'monomer';
                item.monomerId = item.nodeId;
                item.monomerName = item.nodeName;
                item.monomerizationInfo = api.handle_formatMonomerInfo(item.monomerizationInfo);
                const monomerInfo = item.monomerizationInfo;
                if (monomerInfo.monomerizationType === 2) {
                    // 构建伪节点，用于展开单体化子节点
                    item.subNodes = [{ nodeId: `tempNode-${item.nodeId}`, nodeName: '', viewStatus: item.viewStatus }];
                }
            }
        });
        // 隐藏没有数据的根节点
        sceneData = sceneData.filter((el: any) => el.subNodes.length);
        return sceneData;
    },

    // MARK data 递归获取数据集标识集合
    handle_dataSetIdList: (sceneTree: any, sceneInfo: any) => {
        const state_store = useStateStore();
        const dataSetIdList: string[] = [];

        const traverse = (item: any) => {
            if (
                item.nodeType == 2 &&
                item.viewStatus !== 2 &&
                state_store.sceneDataSetType.includes(item.dataSetType) &&
                state_store.appSupportDataSetType.includes(item.dataSetType)
            ) {
                dataSetIdList.push(item.dataSetId);
            }
            if (item.subNodes && item.subNodes.length > 0) {
                item.subNodes.forEach((subNode: any) => {
                    traverse(subNode);
                });
            }
        };

        if (sceneTree && sceneTree.length > 0) {
            sceneTree.forEach((item: any) => {
                traverse(item);
            });
        }

        if (sceneInfo.componentTreeId && sceneInfo.componentTreeId.length > 0) {
            dataSetIdList.push(sceneInfo.componentTreeId); //单构件需要单独添加，不在模型数据中获取
        }

        return dataSetIdList;
    },

    // MARK data 处理数据集--数据集标识横杠
    handle_dataSetId: (dataSetList: any) => {
        return dataSetList; // 不处理横杠了，不然业务太多使用横杠的接口，去除会导致数据不对
        dataSetList.forEach((dataSet: any) => {
            if (dataSet.dataSetId && dataSet.dataSetId.length) {
                dataSet.dataSetId = dataSet.dataSetId.replace(/-/g, ''); //不能使用replaceAll,app端异常
            }
        });
        return dataSetList;
    },

    // MARK data 处理数据集--坐标系标识符
    handle_dataSetCRS: (dataSetInfo: any) => {
        if (!SETCRS_DATA_TYPE.includes(dataSetInfo.dataSetType)) return '';
        let crsConfig = dataSetInfo.coordinatesConfig;
        if (crsConfig.coordinatesType === 'None') return '';

        if (crsConfig.coordinatesType === 'CalibrationPoint') {
            let crsPoint = crsConfig.coordinatesPoint;
            let crs = `ENU:${crsPoint.latitude},${crsPoint.longitude}`;
            return crs;
        } else {
            return crsConfig.coordinates;
        }
    },

    // MARK data 处理数据集--正北夹角
    handle_dataSetCRSNorth: (dataSetInfo: any) => {
        if (!SETCRS_DATA_TYPE.includes(dataSetInfo.dataSetType)) return 0;
        let crsConfig = dataSetInfo.coordinatesConfig;
        if (crsConfig.northAngle) {
            return Number(crsConfig.northAngle);
        } else {
            return 0;
        }
    },

    // MARK data 处理数据集--基点坐标
    handle_engineOrigin: (dataSetInfo: any) => {
        if (!SETCRS_DATA_TYPE.includes(dataSetInfo.dataSetType)) return [0, 0, 0];

        let engineOrigin = [];
        let crsConfig = dataSetInfo.coordinatesConfig;

        let origin = crsConfig.basePoint;
        let originArray = [];
        if (origin) {
            originArray = origin.split(',').map(Number);
        }

        if (crsConfig.coordinatesType === 'CalibrationPoint') {
            let crsPoint = crsConfig.coordinatesPoint;
            let point = crsPoint.coordinates;
            let pointArray = [];
            if (point) {
                pointArray = point.split(',').map(Number);
            } else {
                pointArray = [0, 0, 0];
            }

            if (originArray.length) {
                originArray.forEach((item: any, index: any) => {
                    let result = item - pointArray[index];
                    engineOrigin.push(result);
                });
            } else {
                engineOrigin = pointArray;
            }
        } else {
            engineOrigin = originArray;
        }

        if (engineOrigin.length) {
            return engineOrigin;
        } else {
            return [0, 0, 0];
        }
    },

    // MARK data 处理数据集偏移信息
    handle_dataSetTrans: (dataSetList: any, dataSetTrans: any): any => {
        dataSetList.forEach((dataSet: any) => {
            let dataSetTranData = dataSetTrans.find((obj: any) => obj.dataSetId == dataSet.dataSetId);
            if (dataSetTranData) {
                dataSet.rotate = dataSetTranData.rotate?.split(' ').map(Number);
                dataSet.scale = dataSetTranData.scale?.split(' ').map(Number);
                dataSet.offset = dataSetTranData.translation?.split(' ').map(Number);
            }
        });
        return dataSetList;
    },

    // MARK data 处理数据集--地形层级
    handle_terrainLayerLev: (dataSetList: any, dataSetTerrain: any) => {
        dataSetList.forEach((dataSet: any) => {
            let dataSetTranData = dataSetTerrain.find((obj: any) => obj.dataSetId == dataSet.dataSetId);
            if (dataSetTranData) {
                dataSet.terrainLayerLev = dataSetTranData.sortNum;
            } else {
                dataSet.terrainLayerLev = 0;
            }
        });
        return dataSetList;
    },

    // MARK data 查找-节点级别数据
    handle_findAllNodeByLevel: (nodeData: any, level: number) => {
        const array: any = [];

        const traverse = (item: any) => {
            if (item.nodeType && item.nodeType === level) {
                array.push(item);
            }
            if (item.subNodes && item.subNodes.length) {
                item.subNodes.forEach((subNode: any) => {
                    traverse(subNode);
                });
            }
        };

        nodeData.forEach((item: any) => {
            traverse(item);
        });

        return array;
    },

    // MARK data 格式化-单体化信息对象
    handle_formatMonomerInfo: (monomerInfo: any) => {
        const units = monomerInfo.levelJson;
        const firstRoom = units[0].floors[0].rooms[0];
        const firstRoomGeoJson = JSON.parse(firstRoom.geoJson);
        if (firstRoomGeoJson.rgnList) return monomerInfo;

        const dataSetId = monomerInfo.dataSetId;
        const rooms = units.flatMap((unit: any) => unit.floors.flatMap((floor: any) => floor.rooms));
        rooms.forEach((room: any) => {
            const roomGeoJson = JSON.parse(room.geoJson);
            const fenceClr = roomGeoJson.fenceClr;
            const { red, green, blue, alpha } = fenceClr;
            const monomerClr = { red, green, blue, alpha: 128 };
            const heightMin = roomGeoJson.potList[0][2];
            const heightMax = roomGeoJson.potList[0][2] + roomGeoJson.potList[0][3];
            const pointList = roomGeoJson.potList.map((el: any) => el.slice(0, 3));

            const groJson = {
                dataSetId,
                rgnList: [pointList],
                heightMin,
                heightMax,
                monomerClr,
            };
            room.geoJson = JSON.stringify(groJson);
        });

        return monomerInfo;
    },

    // MARK data 递归获取地形数据集合
    handle_terrainDataSetList: async (sceneTree: any, nodeType: number) => {
        const array: any[] = [];
        const traverse = (item: any) => {
            if (item.nodeType === nodeType) {
                array.push(item);
            }
            if (item.subNodes && item.subNodes.length) {
                item.subNodes.forEach((subNode: any) => {
                    traverse(subNode);
                });
            }
        };

        sceneTree.forEach((item: any) => {
            traverse(item);
        });

        var allDataSets = array.filter((el) => el.viewStatus !== 2);
        const terrainType = [10, 13, 21, 22];
        let terrainDataSets = allDataSets.filter((el) => terrainType.includes(el.dataSetType));
        return terrainDataSets;
    },

    // MARK data 处理数据集--单构件信息
    handle_entityData: async (sceneTree: any, entityEditTranList: any = []) => {
        const state_store = useStateStore();
        let entityList: any[] = [];
        const entity_server_obj = sceneTree.find((item: any) => item.dataSetType == state_store.appSupportEntityType);
        if (entity_server_obj && entity_server_obj.subNodes.length > 0) {
            const entity_server_list = entity_server_obj.subNodes.filter((item: any) => {
                if (item.componentInfo && item.componentInfo.isPublished && item.nodeType == 2 && item.viewStatus !== 2) {
                    return true;
                } else {
                    return false;
                }
            });
            entity_server_list.forEach((item: any) => {
                let { hostFileId, instanceIndex, location, treeNodeId } = item.componentInfo;
                let scale = JSON.parse(location.scale);
                let rotate = JSON.parse(location.rotate);
                let offset = JSON.parse(location.translation);
                const editTran_obj = entityEditTranList.find((edit_item: any) => item.dataSetId === edit_item.id);
                if (editTran_obj) {
                    scale = JSON.parse(editTran_obj.scale);
                    rotate = JSON.parse(editTran_obj.rotate);
                    offset = JSON.parse(editTran_obj.translation);
                }
                let entity_obj: any = {};
                // entity_obj.dataSetId = item.parentId.replace(/-/g, '');
                entity_obj.dataSetId = item.parentId; // 不处理横杠了，不然业务太多使用横杠的接口，去除会导致数据不对
                entity_obj.entityType = String(hostFileId);
                entity_obj.elemId = Number(`${hostFileId}${instanceIndex}`);
                entity_obj.scale = scale;
                entity_obj.rotate = rotate;
                entity_obj.offset = offset;
                entity_obj.dataSetCRS = location.DataSetCRS;
                entity_obj.entityId = treeNodeId; // 单构件id保存，后期服务接口需要调用
                entityList.push(entity_obj);
            });
        }
        return entityList;
    },

    // MARK data 处理数据集--水面信息
    handle_waterData: async (sceneTree: any) => {
        const state_store = useStateStore();
        const allLeafNodes = api.handle_findAllNodeByLevel(sceneTree, 2);
        const allWaters = allLeafNodes.filter((item: any) => item.dataSetType == state_store.appSupportWaterType);

        let waterList: any[] = [];
        allWaters.forEach((item: any) => {
            const waterGeoJson: any = JSON.parse(item.waterInfo.geoJson);
            const rgnList = waterGeoJson.rgnList;
            const rgnInfo = rgnList[0];
            let cornerRgnInfo: any = {};
            cornerRgnInfo.pointList = rgnInfo.pointList;
            cornerRgnInfo.indexList = rgnInfo.indexList;

            const waterRgnList = [cornerRgnInfo];
            const { red, green, blue, alpha } = waterGeoJson.waterClr;
            const waterClr = [red, green, blue, alpha];

            let waterInfo: any = {};
            waterInfo.waterName = item.waterInfo.id;
            waterInfo.waterClr = waterClr;
            waterInfo.blendDist = waterGeoJson.blendDist;
            waterInfo.visible = waterGeoJson.visible;
            waterInfo.expandDist = waterGeoJson.expandDist;
            waterInfo.depthBias = waterGeoJson.depthBias;
            waterInfo.visDist = waterGeoJson.visDist;
            waterInfo.rgnList = waterRgnList;
            waterList.push(waterInfo);
        });
        return waterList;
    },

    // MARK data 处理数据集--挤出信息
    handle_extrudeData: async (sceneTree: any, extrudeTexList: any) => {
        const state_store = useStateStore();
        const allLeafNodes = api.handle_findAllNodeByLevel(sceneTree, 2);
        const allExtrudes = allLeafNodes.filter((item: any) => item.dataSetType == state_store.appSupportExtrudeType);

        let extrudeList: any[] = [];
        allExtrudes.forEach((item: any) => {
            const extrudeGeoJson = JSON.parse(item.excavateInfo.geoJson);
            const rgnList = extrudeGeoJson.rgnList;
            let extrudeInfo: any = {};
            extrudeInfo.extrudeId = item.excavateInfo.id;
            extrudeInfo.dataSetIdList = extrudeGeoJson.dataSetIdList;
            extrudeInfo.rgnList = rgnList;
            extrudeInfo.depthLimitRange = extrudeGeoJson.depthLimitRange;
            extrudeInfo.type = extrudeGeoJson.type;
            if (extrudeGeoJson.type === 2) {
                const find = extrudeTexList.find((el: any) => el.textureGuid === item.excavateInfo.textureFileDataId);
                extrudeInfo.texSize = find ? JSON.parse(JSON.stringify(find.picSize)) : [0, 0];
                extrudeInfo.texPath = find ? find.picPath : '';
            }
            extrudeList.push(extrudeInfo);
        });
        return extrudeList;
    },

    // MARK data 处理数据集--单体化信息
    handle_monomerData: async (sceneTree: any) => {
        const state_store = useStateStore();
        const allLeafNodes = api.handle_findAllNodeByLevel(sceneTree, 2);
        const allMonomers = allLeafNodes.filter((item: any) => item.dataSetType == state_store.appSupportMonomerType);
        if (!allMonomers.length) return [];

        const monomerList: any[] = api.handle_monomerByNodes(allMonomers);

        let roomMonomerList: any[] = [];
        monomerList.forEach((item: any) => {
            const roomShp = JSON.parse(item.geoJson);
            const { red, green, blue, alpha } = roomShp.monomerClr;
            let monomerClr = [red, green, blue, alpha];
            if (item.displayMode === 3) {
                monomerClr = [255, 255, 255, 10];
            } else {
                monomerClr = [red, green, blue, 128];
            }

            let roomMonomerInfo: any = {};
            roomMonomerInfo.monomerId = item.monomerId;
            roomMonomerInfo.dataSetId = roomShp.dataSetId;
            roomMonomerInfo.rgnList = roomShp.rgnList;
            roomMonomerInfo.heightMin = roomShp.heightMin;
            roomMonomerInfo.heightMax = roomShp.heightMax;
            roomMonomerInfo.faceClr = monomerClr;
            roomMonomerInfo.lineClr = monomerClr;
            roomMonomerInfo.showState = item.displayMode === 1 ? 2 : 1;

            roomMonomerList.push(roomMonomerInfo);
        });
        return roomMonomerList;
    },

    // MARK data 根据节点列表获取单体化对象列表
    handle_monomerByNodes: (nodeData: any) => {
        let monomerList: any[] = [];

        const flattenRooms = (rooms: any, source: any) => rooms.map((room: any) => createMonomerObj(source, room));
        const flattenFloors = (floors: any, source: any) => floors.flatMap((floor: any) => flattenRooms(floor.rooms, source));
        const flattenUnits = (units: any, source: any) => units.flatMap((unit: any) => flattenFloors(unit.floors, source));

        const createMonomerObj = (source: any, room: any) => ({
            displayMode: source.displayMode,
            dataSetId: source.dataSetId,
            monomerId: room.id,
            geoJson: room.geoJson,
        });

        // 主处理逻辑
        nodeData.forEach((item: any) => {
            switch (item.customNodeType) {
                case 'monomer': {
                    const monomers = flattenUnits(item.monomerizationInfo.levelJson, item.monomerizationInfo);
                    monomerList.push(...monomers);
                    break;
                }
                case 'monomerUnit': {
                    const unitMonomers = flattenFloors(item.floors, item);
                    monomerList.push(...unitMonomers);
                    break;
                }
                case 'monomerFloor': {
                    const floorMonomers = flattenRooms(item.rooms, item);
                    monomerList.push(...floorMonomers);
                    break;
                }
                case 'monomerRoom': {
                    monomerList.push(createMonomerObj(item, item));
                    break;
                }
            }
        });

        return monomerList;
    },
}


export default api;