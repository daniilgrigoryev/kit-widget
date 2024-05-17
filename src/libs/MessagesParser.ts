import { ChatSettings, StoreMessage } from '@/types/KitWidgetTypes';
import { store } from '@/store';
import { RootMutationsTypes } from '@/store/modules/root/mutations';
import { RootActionTypes } from '@/store/modules/root/actions';
import {
  AssignConversationResponse,
  CommandResultResponse,
  ConnectedResponse,
  MessageEventResponse,
  SendMessageResponse,
} from '@/types/MessageTypes';

export class MessagesParser {
  public static parseMessage(event: MessageEvent): void {
    try {
      const parsedMessage: MessageEventResponse = JSON.parse(event.data);
      switch (parsedMessage.event_type) {
        case 'send_message':
          MessagesParser.addNewMessage(parsedMessage);
          break;
        case 'command_result':
          MessagesParser.setInfo(parsedMessage);
          break;
        case 'assign_conversation':
          MessagesParser.setAgentInfo(parsedMessage);
          break;
        case 'unassign_conversation':
          MessagesParser.setAgentInfo(null);
          break;
        case 'connected':
          MessagesParser.setWidgetSettings(parsedMessage);
          break;
        default: {
          console.warn(`Some types of event weren't parsed. Message: ${parsedMessage}`);
        }
      }
    } catch (err) {
      console.warn(`An error occurred while trying to parse message: ${err}`);
    }
  }

  public static setInfo(messageData: CommandResultResponse): void {
    const messages = (messageData.event_data.result.messages || [])
      .filter(({ event_data }) => event_data.message.text || event_data.message.payload.length > 0)
      .map(this.getStoreMessage);
    store.commit(RootMutationsTypes.SET_MESSAGES, messages);

    if (messageData.event_data.result.conversation.agent_data) {
      const agentInfo = messageData.event_data.result.conversation.agent_data;
      store.commit(RootMutationsTypes.SET_AGENT_INFO, {
        avatar: agentInfo.agent_avatar || '',
        fullName: agentInfo.agent_display_name || '',
        name: agentInfo.agent_username,
      });
    }

    const chatSettings = store.state.chatSettings as ChatSettings;
    const hasNameOrEmail = chatSettings.client_data.client_display_name && chatSettings.client_data.client_email;
    if (messageData.client_data.client_display_name && !hasNameOrEmail) {
      store.commit(RootMutationsTypes.SET_CHAT_SETTINGS, {
        ...chatSettings,
        client_data: {
          client_id: messageData.client_data.client_id,
          client_display_name: messageData.client_data.client_display_name || '',
          client_email: messageData.client_data.client_email || '',
          client_avatar: messageData.client_data.client_avatar || '',
          client_phone: messageData.client_data.client_phone || '',
        },
      });
    }
  }

  private static getStoreMessage(messageData: SendMessageResponse): StoreMessage {
    return {
      ...messageData.event_data.sender_data,
      ...messageData.event_data.message,
      timestamp: new Date().valueOf(),
      is_agent: messageData.event_data.sender_data.sender_type === 'agent',
    };
  }

  private static addNewMessage(messageData: SendMessageResponse): void {
    try {
      store.dispatch(RootActionTypes.ADD_MESSAGE, MessagesParser.getStoreMessage(messageData));
    } catch (err) {
      console.warn(err);
    }
  }

  private static setAgentInfo(messageData: AssignConversationResponse | null): void {
    if (!messageData) {
      store.commit(RootMutationsTypes.SET_AGENT_INFO, null);
      return;
    }
    const agentInfo = messageData.event_data.agent_data;
    store.commit(RootMutationsTypes.SET_AGENT_INFO, {
      avatar: agentInfo.agent_avatar || '',
      fullName: agentInfo.agent_display_name || '',
      name: agentInfo.agent_username,
    });
  }

  private static setWidgetSettings(messageData: ConnectedResponse): void {
    const { settings } = messageData.event_data;
    settings && store.commit(RootMutationsTypes.SET_WIDGET_SETTINGS, settings);
  }
}
