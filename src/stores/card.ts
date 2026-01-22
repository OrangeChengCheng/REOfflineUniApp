/*
 * @Author: Lemon C
 * @Date: 2024-09-13 15:14:00
 * @LastEditTime: 2026-01-20 16:48:10
 */
import { defineStore } from 'pinia'
import { type Card } from '@/types/class';



interface CardMold {
    cardList: Array<Card>,
    sample_cardList: Array<any>,
}




export const useCardStore = defineStore('card', {
    state: (): CardMold => ({
        cardList: JSON.parse(uni.getStorageSync('RE_cardList') || '[]') || [],
        sample_cardList: JSON.parse(uni.getStorageSync('RE_sample_cardList') || '[]') || [],
    }),
    actions: {
        addCard(cardData: Card) {
            if (this.checkRepeat(cardData)) {
                console.log("已覆盖原有数据");
                this.updateCard(cardData);
                return;
            }
            this.cardList.push(cardData);
            this.saveToLocalStorage();
        },
        updateCard(cardData: Card) {
            let find = this.cardList.find((e: Card) => e.shareId === cardData.shareId);
            if (find) {
                find.shareUrl = cardData.shareUrl;
                find.shareId = cardData.shareId;
                find.source = cardData.source;
                find.projName = cardData.projName;
                find.lastTime = cardData.lastTime;
                find.endTime = cardData.endTime;
                find.shareFormUserExpirationTime = cardData.shareFormUserExpirationTime;
                this.saveToLocalStorage();
            }
        },
        getCardList(search?: string) {
            let result = this.cardList;

            if (search) {
                result = result.filter((e: Card) => e.projName.includes(search));
            }

            // 按 lastTime 降序排序（最新的在前）
            return result.sort((a, b) => {
                const lastTime_a = new Date(a.lastTime);
                const lastTime_b = new Date(b.lastTime);
                return lastTime_b.getTime() - lastTime_a.getTime();
            });
        },
        addCollect(cardData: Card, coollect: boolean) {
            let find = this.cardList.find((e: Card) => e.shareUrl === cardData.shareUrl || e.shareId === cardData.shareId);
            if (find) {
                find.collect = coollect;
            }
            this.saveToLocalStorage();
        },
        getCollectCardList(search?: string) {
            let result = this.cardList;

            if (search) {
                result = result.filter((e: Card) => e.collect === true && e.projName.includes(search));
            } else {
                result = result.filter((e: Card) => e.collect === true);
            }

            // 按 lastTime 降序排序（最新的在前）
            return result.sort((a, b) => {
                const lastTime_a = new Date(a.lastTime);
                const lastTime_b = new Date(b.lastTime);
                return lastTime_b.getTime() - lastTime_a.getTime();
            });
        },
        saveToLocalStorage() {
            uni.setStorageSync('RE_cardList', JSON.stringify(this.cardList));
        },
        clearCardList() {
            this.cardList = [];
            this.saveToLocalStorage();
        },
        reviseProjName(cardData: Card, projName: string) {
            let find = this.cardList.find((e: Card) => e.shareUrl === cardData.shareUrl || e.shareId === cardData.shareId);
            if (find) {
                find.projName = projName;
            }
            this.saveToLocalStorage();
        },
        removeCard(id: string) {
            let find = this.cardList.find((e: Card) => e.shareId === id);
            if (find) {
                let index = this.cardList.findIndex(obj => obj.shareId === find.shareId);
                this.cardList.splice(index, 1);
                this.saveToLocalStorage();
            }
        },
        getSampleCardList(search?: string) {
            if (search) {
                return this.sample_cardList.filter((e: Card) => e.projName.includes(search));
            } else {
                return this.sample_cardList;
            }
        },
        async updateSample(): Promise<any> {
            try {
                // 封装Promise, 避免地狱回调模式
                const sampleList_res = await new Promise<any>((resolve, reject) => {
                    uni.request({
                        url: 'https://demo.bjblackhole.com/BlackHole3.0/app/json/re_sample_res.json',
                        success: (res: any) => resolve(res),
                        fail: (err: any) => reject(err)
                    });
                });

                console.log("onlineVersion: ", sampleList_res.data.onlineVersion);
                this.sample_cardList = [];
                uni.setStorageSync('RE_sample_cardList', JSON.stringify(this.sample_cardList));
                const sampleCardList_json = JSON.stringify(sampleList_res.data.sampleList);
                const sampleCardList_obj = JSON.parse(sampleCardList_json);

                // 获取有效的分享链接
                const validShareUrlList = sampleCardList_obj.filter((item: any) => item?.shareUrl);
                // 生成获取分享信息Promise数组
                const urlDataPromiseList = validShareUrlList.map(async (item: any) => {
                    try {
                        const urlData_res = await uni.$tool.url_handle(item.shareUrl);
                        return urlData_res;
                    } catch (error) {
                        return null;
                    }
                });
                // 等待并行调用回调
                const allPromise_res = await Promise.all(urlDataPromiseList);
                allPromise_res.forEach((el: any) => {
                    const cardData: any = {
                        shareUrl: el.url,
                        shareId: el.shareId,
                        source: el.shareItem?.source,
                        projName: el.projName,
                    };
                    this.sample_cardList.push(cardData);
                });

                console.log("sample_cardList: ", this.sample_cardList);

                uni.setStorageSync('RE_sample_cardList', JSON.stringify(this.sample_cardList));
                uni.$re.unipluginLog('getSampleList: ' + JSON.stringify(this.sample_cardList));
                return "示例获取成功";
            } catch (error) {
                uni.$re.unipluginLog('getSampleList: ' + JSON.stringify(error));
                throw new Error(`示例获取失败: ${error}`);
            }
        },
        // MARK 重复校验
        checkRepeat(cardData: Card): boolean {
            return this.cardList.find((e: Card) => e.shareUrl === cardData.shareUrl || e.shareId === cardData.shareId) ? true : false;
        },
    },
});