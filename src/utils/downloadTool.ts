
import { useFileStore } from '@/stores/file';

interface ApiMethods {
	downloadFile(url: any, onProgress?: (progress: number) => void): Promise<any>;
	checkLocalFileExist(url: any): Promise<any>;
}

const api: ApiMethods = {
	// MARK 下载文件
	downloadFile: async (url: any, onProgress?: (progress: number) => void): Promise<any> => {
		const file_store = useFileStore();
		try {
			if (!file_store.appRootPath.length
				|| !file_store.resRootPath.length
				|| !file_store.uniDownloadTempPath.length) {
				return { data: null, isSuccess: false, errMsg: "应用存储空间获取失败", };
			}

			// 前置校验：本地是否有对应文件
			const fileExist = await api.checkLocalFileExist(url);
			if (fileExist) {
				// 如果存在，确认是否删除覆盖
				const popRes = await uni.pop_showModal("提示", "即将覆盖本地已有文件，是否继续下载");
				if (popRes.confirm) {
					const del_res = await uni.$tool.toPromise((cb: any) => uni.$re.fileDelAllSubFile({ filePath: fileExist.filePath, keepDir: true }, cb));
					if (!del_res.data) return { data: null, isSuccess: false, errMsg: "清理旧文件失败", };
				} else if (popRes.cancel) {
					return { data: null, isSuccess: false, errMsg: "下载操作已被取消", };
				}
			}

			// 执行下载（官网 API）
			const downloadHolder: { task?: UniApp.DownloadTask } = {};//定义一个承载对象
			try {
				const downloadPromise = uni.file_download(url, downloadHolder);//返回promise对象
				// 注册事件
				downloadHolder.task?.onProgressUpdate(async (res: any) => {
					onProgress?.(res.progress);
				});
				// 等待downloadHolder对象完成创建在进行下载，否则会阻塞线程
				const res = await downloadPromise;
				const tempFilePath = res.tempFilePath;
				if (!tempFilePath.length) return { data: null, isSuccess: false, errMsg: "下载失败：文件路径获取失败", };

				const info = uni.get_SystemInfo();
				const dowloadFileName = tempFilePath.split("/").pop()!;
				const uniFileTempPath_handle = tempFilePath.replace(/^_doc/, "doc");
				const uniFileTempPath_full = file_store.uniDownloadTempPath + "/" + info.appId + "/" + uniFileTempPath_handle;
				const resRootPath = file_store.resRootPath;
				const dowloadCopyResPath = resRootPath + "/" + dowloadFileName;

				const res_copy = await uni.$tool.toPromise((cb: any) => uni.$re.fileCopyFile({ sourceFilePath: uniFileTempPath_full, targetFilePath: dowloadCopyResPath }, cb));
				if (!res_copy.data) return { data: null, isSuccess: false, errMsg: "资源文件保存失败", };

				// 获取压缩包携带信息
				const res_zipComments = await uni.$tool.toPromise((cb: any) => uni.$re.zipGetComments({ filePath: dowloadCopyResPath, password: file_store.unzipPassword }, cb));
				if (!res_zipComments.data) return { data: null, isSuccess: false, errMsg: "资源压缩包信息获取失败", };

				// 解压文件
				const res_unzip = await uni.$tool.toPromise((cb: any) => uni.$re.unzipFile({ filePath: dowloadCopyResPath, password: file_store.unzipPassword }, cb));
				if (!res_unzip.data) return { data: null, isSuccess: false, errMsg: "资源文件解压失败", };
				const res_fileExist = await uni.$tool.toPromise((cb: any) => uni.$re.fileExist({ filePath: res_unzip.data }, cb));
				if (!res_fileExist.data) return { data: null, isSuccess: false, errMsg: "资源文件解压失败", };

				// 删除原始压缩文件
				const res_delZipFile = await uni.$tool.toPromise((cb: any) => uni.$re.fileDelAllSubFile({ filePath: dowloadCopyResPath, keepDir: true }, cb));
				if (!res_delZipFile.data) return { data: null, isSuccess: false, errMsg: "原始资源文件压缩包清除失败", };

				// 返回信息
				return { data: { resPath: res_unzip.data, zipComments: res_zipComments.data }, isSuccess: true, errMsg: "", }

			} catch (err: any) {
				return { data: null, isSuccess: false, errMsg: "下载失败：", }
			}

		} catch (error: any) {
			uni.$re.unipluginLog(error || '资源下载失败');
			throw error;
		}
	},

	checkLocalFileExist: async (url: any): Promise<any> => {
		const file_store = useFileStore();
		// 获取本地文件列表
		const locFiles = await uni.$tool.toPromise((cb: any) => uni.$re.fileGetAllChild({ filePath: file_store.resRootPath, keepDir: true }, cb));
		// 1. 从URL中截取最后一段（文件名部分）
		const fileName = url.split("/").pop() || "";
		// 2. 去掉末尾的 .zip
		const targetName = fileName.replace(/\.zip$/, "");
		// 3. 判断是否存在数组中
		const fileExist = locFiles.data.find((item: any) => item.directory && item.fileName == targetName);

		return fileExist;
	},
}


export default api;