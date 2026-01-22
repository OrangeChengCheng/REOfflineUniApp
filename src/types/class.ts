/*
 * @Author: Lemon C
 * @Date: 2024-09-23 16:54:42
 * @LastEditTime: 2026-01-21 10:40:52
 */


export interface Card {
    shareUrl: string,
    shareId: string,
    source: number;//判断分享链接来源 0: 私有化 1：黑洞 2：星河 3: 星云
    projName: string;
    lastTime: Date;
    endTime: string;
    shareFormUserExpirationTime: string;
    collect: boolean;
}

export const newCard = (overrides?: Partial<Card>): Card => {
    return {
        shareUrl: "",
        shareId: "",
        projName: "",
        source: 0,
        lastTime: new Date(),
        endTime: "",
        shareFormUserExpirationTime: "",
        collect: false,
        ...overrides
    };
};



