import { AgentInfo, ChatSettings, StoreMessage, WidgetSettings } from '@/types/KitWidgetTypes';

export interface RootState {
  isConnected: boolean;
  messages: StoreMessage[];
  agentInfo: AgentInfo | null;
  unreadMessages: StoreMessage[];
  isChatOpen: boolean;
  widgetSettings: null | WidgetSettings;
  chatSettings: null | ChatSettings;
}

export const createRootState = (): RootState => ({
  isConnected: false,
  messages: [],
  agentInfo: null,
  unreadMessages: [],
  isChatOpen: false,
  widgetSettings: null,
  chatSettings: null,
});

export const state = createRootState();
