import { store } from '@/store';
import { ChatSettings, StoreMessage, WidgetFile } from '@/types/KitWidgetTypes';
import { RootActionTypes } from '@/store/modules/root/actions';
import { RootMutationsTypes } from '@/store/modules/root/mutations';
import { MessagesParser } from '@/libs/MessagesParser';
import { MessageEventResponse, MessagePayload } from '@/types/MessageTypes';

export default class Messenger {
  static instance: Messenger | null = null;
  static socket: WebSocket | null = null;
  private client_id = '';

  private constructor() {
    //  Inaccessible
  }

  public static get(): Messenger {
    if (!Messenger.instance) {
      Messenger.instance = new Messenger();
    }

    return Messenger.instance;
  }

  public connect(params: ChatSettings | null): Promise<unknown> | void {
    console.warn('connect');
    if (!params || Messenger.socket) return;
    const { host, client_data, token, channel_uuid } = params;
    this.client_id = client_data?.client_id || '';
    Messenger.socket = new WebSocket(`wss://${host}/ws/${channel_uuid}/${this.client_id}?token=${token}`);
    return this.onConnected();
  }

  sendStartMessage(text: string): void {
    const storeMessage: StoreMessage = {
      text,
      sender_id: 0,
      sender_avatar: '',
      sender_email: '',
      sender_display_name: '',
      sender_username: '',
      message_id: '',
      timestamp: new Date().valueOf(),
      is_agent: true,
      is_bot: true,
      payload: [],
    };
    store.dispatch(RootActionTypes.ADD_MESSAGE, storeMessage);
  }

  // парсим сообщение агента (пришедшее с бэка по сокету) и добавляем его в стор
  parseAndCommitEvent(event: MessageEvent): void {
    MessagesParser.parseMessage(event);
  }

  // собираем сообщение клиента (фронт) и добавляем его в стор
  public sendMessage(text: string, listFiles: MessagePayload[], filesForFront: WidgetFile[]): void {
    const currentDate = new Date().valueOf();

    const message = {
      client_data: {
        client_id: this.client_id,
        client_display_name: 'Unsigned user',
        client_email: '',
        client_avatar: '',
      },
      event_type: 'send_message',
      event_data: {
        message: {
          message_id: currentDate + text,
          text,
          payload: listFiles,
        },
      },
    };

    if (store.state.chatSettings?.client_data) {
      message.client_data = { ...message.client_data, ...store.state.chatSettings.client_data };
    }

    const storeMessage: StoreMessage = {
      text,
      sender_id: 1,
      payload: filesForFront,
      sender_avatar: message.client_data.client_avatar || '',
      sender_email: message.client_data.client_email || 'example@voximplant.com',
      sender_display_name: message.client_data.client_display_name,
      sender_username: 'yan',
      message_id: message.event_data.message.message_id,
      timestamp: currentDate,
      is_agent: false,
      is_bot: false,
    };
    Messenger.socket?.send(JSON.stringify(message));
    store.dispatch(RootActionTypes.ADD_MESSAGE, storeMessage);
  }

  public disconnect(): void {
    console.warn('disconnect');
    store.commit(RootMutationsTypes.SET_CHAT_CONNECTED, false);

    if (Messenger.socket?.readyState === 1) {
      Messenger.socket?.removeEventListener('message', this.parseAndCommitEvent);
      Messenger.socket?.close();
      Messenger.socket = null;
    }
  }

  private async onConnected(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const onFinish = (): void => {
        if (Messenger.socket) {
          Messenger.socket.onmessage = null;
          Messenger.socket.onopen = null;
          Messenger.socket.onerror = null;
          store.commit(RootMutationsTypes.SET_CHAT_CONNECTED, true);
        }
      };
      const tryToGetHistory = (): void => {
        this.getHistory();
        this.listenToMessages();

        if (Messenger.socket) {
          Messenger.socket.onmessage = (event) => {
            try {
              const messageData: MessageEventResponse = JSON.parse(event.data);
              if (messageData.event_type === 'connected') {
                return;
              }

              onFinish();
              resolve(undefined);
            } catch (err) {
              console.warn('An error occurred while trying to get conversation history');
              reject();
            }
          };
        }
      };

      const onError = (): void => {
        onFinish();
        reject();
      };
      if (Messenger.socket) {
        Messenger.socket.onopen = tryToGetHistory;
        Messenger.socket.onerror = onError;
      } else {
        reject();
      }
    });
  }

  private getHistory(): void {
    const clientData = store.state.chatSettings?.client_data as ChatSettings['client_data'];
    const initHistoryParams = {
      client_data: {
        ...clientData,
        client_id: this.client_id,
      },
      event_type: 'command',
      event_data: {
        command_type: 'get_history',
      },
    };
    Messenger.socket?.send(JSON.stringify(initHistoryParams));
  }

  private listenToMessages(): void {
    Messenger.socket?.addEventListener('message', this.parseAndCommitEvent);
  }
}
