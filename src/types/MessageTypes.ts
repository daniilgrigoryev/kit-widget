import { WidgetSettings } from '@/types/KitWidgetTypes';

interface EventResponse {
  event_id: string;
  event_type: string;
  timestamp: string;
  event_data: Record<string, unknown>;
}

interface EventResponseWithClientData extends EventResponse {
  client_data: {
    client_id: string;
    client_display_name?: string;
    client_email?: string;
    client_avatar?: string;
    client_phone?: string;
  };
}

export interface ConnectedResponse extends EventResponse {
  event_type: 'connected';
  event_data: {
    settings?: WidgetSettings;
  };
}

export interface MessagePayload {
  file_id: number;
  file_name: string;
  file_url?: string;
  file_size: number;
  type: string;
}
export interface SendMessageResponse extends EventResponseWithClientData {
  event_type: 'send_message';
  event_data: {
    message: {
      message_id: string;
      text: string;
      payload: MessagePayload[];
    };
    sender_data: {
      sender_id: number;
      sender_username: string;
      sender_display_name: string;
      sender_avatar: string;
      sender_email: string;
      is_bot: boolean;
      sender_type: 'client' | 'agent';
    };
  };
}

export interface AssignConversationResponse extends EventResponseWithClientData {
  event_type: 'assign_conversation';
  event_data: {
    agent_data: {
      agent_avatar?: string;
      agent_display_name?: string;
      agent_email: string;
      agent_id: number;
      agent_username: string;
    };
  };
}

export interface UnassignConversationResponse extends EventResponseWithClientData {
  event_type: 'unassign_conversation';
}

export interface CommandResultResponse extends EventResponseWithClientData {
  event_type: 'command_result';
  event_data: {
    command_type: 'get_history';
    result: {
      messages: SendMessageResponse[];
      conversation: {
        status: 'processed_by_agent' | 'unassigned';
        agent_data?: AssignConversationResponse['event_data']['agent_data'];
      };
    };
  };
}

export type MessageEventResponse =
  | ConnectedResponse
  | SendMessageResponse
  | AssignConversationResponse
  | UnassignConversationResponse
  | CommandResultResponse;
