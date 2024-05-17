type SettingsKeys = 'kit_chat_open' | 'kit_client_id';
import Storage from '@/utils/Storage';

export interface SettingsStorageInterface {
  setClientId(clientId: string): void;

  getClientId(): string | null;

  setChatOpen(isOpen: boolean): void;

  getChatOpen(): boolean;
}

class SettingsStorageImplementation extends Storage<SettingsKeys> {
  constructor() {
    super();
  }

  setClientId(clientId: string): void {
    this.set('kit_client_id', clientId);
  }

  getClientId(): string | null {
    return this.get('kit_client_id');
  }

  setChatOpen(isOpen: boolean): void {
    this.set('kit_chat_open', `${isOpen}`);
  }

  getChatOpen(): boolean {
    return this.get('kit_chat_open') === 'true';
  }
}

export const SettingsStorage = new SettingsStorageImplementation();
