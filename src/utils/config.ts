/*
 * @Author: Lemon C
 * @Date: 2024-04-19 12:22:21
 * @LastEditTime: 2026-01-22 15:48:54
 */


const RE_ServerURl_HD = "https://engine3.bjblackhole.com";


interface ApiMethods {
    getTimeout(): number;
}


const api: ApiMethods = {

    // MARK config 获取通用请求超时时间
    getTimeout: (): number => {
        return 30000;
    },

}



export default api;