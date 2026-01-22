import { defineStore } from 'pinia';

interface MessageHandler {
    handlers: Array<(payload: any) => void>;
}

interface MessageState {
    messageObj: {
        [key: string]: MessageHandler | undefined;
    };
    M_AppToUni: string,
}

export const useMessageStore = defineStore('message', {
    state: (): MessageState => ({
        messageObj: {},
        M_AppToUni: 'msg_appToUni',//app发送消息到uni
    }),
    actions: {
        // MARK 发送消息
        sendMessage(messageName: string, payload: any) {
            const messageHandler = this.messageObj[messageName];
            if (!messageName || !messageHandler || !messageHandler.handlers) {
                return;
            }
            messageHandler.handlers.forEach((handler) => handler(payload));
        },

        // MARK 注册消息
        addMessageHandler(messageName: string, handler: any) {
            if (!messageName || !this.messageObj) return;
            if (!this.messageObj[messageName]) {
                this.messageObj[messageName] = {
                    handlers: [],
                };
            }
            this.messageObj[messageName].handlers.push(handler);
        },

        // MARK 移除消息
        removeMessageHandler(messageName: string, handler: any) {
            if (!messageName || !this.messageObj || !this.messageObj[messageName]) return;
            this.messageObj[messageName].handlers = this.messageObj[messageName].handlers.filter((h) => h !== handler);

        },
    }
});