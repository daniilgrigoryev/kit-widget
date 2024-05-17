import { MutationTree } from 'vuex';
import { RootState } from '@/store/modules/root/state';
import { AgentInfo, ChatSettings, StoreMessage, WidgetSettings } from '@/types/KitWidgetTypes';

export enum RootMutationsTypes {
  SET_MESSAGES = 'SET_MESSAGES',
  SET_UNREAD_MESSAGES = 'SET_UNREAD_MESSAGES',
  SET_AGENT_INFO = 'SET_AGENT_INFO',
  TOGGLE_CHAT = 'TOGGLE_CHAT',
  SET_WIDGET_SETTINGS = 'SET_WIDGET_SETTINGS',
  SET_CHAT_SETTINGS = 'SET_CHAT_SETTINGS',
  SET_CHAT_CONNECTED = 'SET_CHAT_CONNECTED',
}

export interface Mutations<S = RootState> {
  [RootMutationsTypes.SET_MESSAGES](state: S, payload: StoreMessage[]): void;
  [RootMutationsTypes.SET_UNREAD_MESSAGES](state: S, payload: StoreMessage[]): void;
  [RootMutationsTypes.SET_AGENT_INFO](state: S, payload: AgentInfo | null): void;
  [RootMutationsTypes.TOGGLE_CHAT](state: S, payload: boolean): void;
  [RootMutationsTypes.SET_WIDGET_SETTINGS](state: S, payload: WidgetSettings | null): void;
  [RootMutationsTypes.SET_CHAT_SETTINGS](state: S, payload: ChatSettings | null): void;
  [RootMutationsTypes.SET_CHAT_CONNECTED](state: S, payload: boolean): void;
}

export const mutations: MutationTree<RootState> & Mutations = {
  [RootMutationsTypes.SET_MESSAGES](state, payload) {
    state.messages = payload;
  },
  [RootMutationsTypes.SET_UNREAD_MESSAGES](state, payload) {
    state.unreadMessages = payload;
  },
  [RootMutationsTypes.SET_AGENT_INFO](state, payload) {
    state.agentInfo = payload;
  },
  [RootMutationsTypes.TOGGLE_CHAT](state, payload) {
    state.isChatOpen = payload;
  },
  [RootMutationsTypes.SET_WIDGET_SETTINGS](state, payload) {
    state.widgetSettings = payload;
  },
  [RootMutationsTypes.SET_CHAT_SETTINGS](state, payload) {
    state.chatSettings = payload;
  },
  [RootMutationsTypes.SET_CHAT_CONNECTED](state, payload) {
    state.isConnected = payload;
  },
};
