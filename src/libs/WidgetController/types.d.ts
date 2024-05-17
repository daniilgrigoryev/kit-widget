import { SettingsStorageInterface } from '@/libs/SettingsStorage';

export interface WidgetControllerInterface {
  readonly isOpen: boolean;

  toggle(): void;

  init(): void;
}

export interface Deps {
  onToggle(isOpen: boolean): void;

  settingsLocalStorage: SettingsStorageInterface;
}
