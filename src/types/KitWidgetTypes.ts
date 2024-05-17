import { MessagePayload } from '@/types/MessageTypes';

export interface StoreMessage {
  message_id: string;
  text: string;
  sender_id: number;
  sender_username: string;
  sender_display_name: string;
  sender_avatar: string;
  sender_email: string;
  timestamp: number;
  is_agent: boolean;
  is_bot: boolean;
  payload?: (WidgetFile | MessagePayload)[];
}

export interface WidgetMessageType {
  text: string;
  date: string;
  time: string;
  avatar?: string;
  shouldShowAvatar: boolean;
  isBot: boolean;
}

export interface WidgetMessage extends WidgetMessageType {
  side: 'left' | 'right';
  payload?: MessagePayload[];
}

export interface AgentInfo {
  avatar?: string;
  name: string;
  fullName: string;
}

export interface ClientInfo {
  client_display_name: string;
  client_email: string;
  client_phone: string;
  client_avatar: string;
}

export interface WidgetSettings {
  align_right: boolean;
  margin_bottom: number;
  margin_horizontal: number;
  accent_color: string;
  api_user_id: number;
  company_logo: string;
  header_text: string;
  message_color: string;
  message_text_color: string;
  secondary_color: string;
  security_salt: string;
  start_conversation_message: string[];
}

export interface MessageStyleSettings {
  bgColor: string;
  messageColor: string;
}

interface ClientData {
  client_id: string;
  client_phone?: string; // Номер телефона клиента
  client_avatar?: string; // Ссылка на аватар клиента
  client_display_name?: string; // Имя клиента
  client_email?: string; // Email телефона клиента
  client_language?: 'ru' | 'en' | 'es'; // Язык интерфейса чата клиента
}

export interface WidgetParams {
  host: string;
  channel_uuid: string;
  token: string;
  client_data?: ClientData;
}
export interface WidgetDataMessageType {
  files: File[] | null;
  text: string;
}

export type FileType = 'application' | 'audio' | 'example' | 'font' | 'image' | 'model' | 'video';
export type LoadStateType = 'uploading' | 'error' | 'completed' | 'processing' | 'toManyFiles' | 'none';

export type WidgetFile = {
  id: string | number;
  name: string;
  size: number;
  type: FileType;
  url: string;
  objectFile: File;
};

export type ChatSettings = WidgetParams & { client_data: ClientData };
