/*
 * @Author: Lemon C
 * @Date: 2024-09-13 18:01:53
 * @LastEditTime: 2026-01-21 11:47:51
 */


import type { Uni as _Uni } from '@dcloudio/types'

declare global {
    /**
     * 拓展全局变量Uni
    */
    interface Uni extends _Uni {
        $re: {
            unipluginLog(log: string): void;
            realEngineRender(data: any): Promise<any>;
            registerAppMsg(onCallBack: (data: any) => void): Promise<void>;
            sendMsgUniToApp(data: any): void;
        }
        $service: {
            commonTimeout: number,
        };
        $tool: {
            update_data(): void;
            del_data(): void;
            getAppVersion(): string;
            initializeData(): void;
            url_base(url: string): string;
            time_To_IOSDate(timeStr: string): string;
            time_compare(frontTime: Date, backTime: Date): string;
            time_format(utcTime: Date): string;
        };
        scan_code(): Promise<any>;
        show_loading(): void;
        hide_loading(): void;
    }
}



