import { Deps, WidgetControllerInterface } from '@/libs/WidgetController/types';
import useToggle from '@/composables/ui/useToggle';
import { RootMutationsTypes } from '@/store/modules/root/mutations';
import { handleMetaviewportForMobileWidget } from '@/utils/handle_meta_viewport';
import { store } from '@/store';
import { SettingsStorage } from '@/libs/SettingsStorage';

class WidgetControllerImplementation implements WidgetControllerInterface {
  private toggleController = useToggle();
  private deps: Deps;

  constructor(deps: Deps) {
    this.deps = deps;
  }

  get isOpen(): boolean {
    return this.toggleController.toggleValue.value;
  }

  init(): void {
    const isOpen = this.deps.settingsLocalStorage.getChatOpen();
    this.toggleController.toggleValue.value = isOpen;
    this.deps.onToggle(isOpen);
  }

  toggle(): void {
    this.toggleController.toggle();
    this.deps.onToggle(this.isOpen);
    this.deps.settingsLocalStorage.setChatOpen(this.isOpen);
  }
}

const onToggle: Deps['onToggle'] = (isOpen) => {
  isOpen && store.commit(RootMutationsTypes.SET_UNREAD_MESSAGES, []);
  store.commit(RootMutationsTypes.TOGGLE_CHAT, isOpen);
  handleMetaviewportForMobileWidget(isOpen);
};

export const WidgetController: WidgetControllerInterface = new WidgetControllerImplementation({
  onToggle,
  settingsLocalStorage: SettingsStorage,
});
