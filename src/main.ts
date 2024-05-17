import { App, createApp } from 'vue';
import '@/init/mobile_version_handlers';
import { store } from './store';
import registerDirectives from '@/directives';
import i18n from '@/i18n';
import '@/assets/style/style.pcss';
import KitWidgetContainer from '@/components/KitWidget/KitWidgetContainer.vue';
import { RootMutationsTypes } from '@/store/modules/root/mutations';
import { WidgetParams } from '@/types/KitWidgetTypes';
import { getUUID } from '@/utils/getUUID';
import { SettingsStorage } from '@/libs/SettingsStorage';

let app: App | null = null;

const getClientId = (clientData: WidgetParams['client_data']): string => {
  const clientId = SettingsStorage.getClientId();
  if (!clientId) {
    const id = clientData?.client_id || getUUID();
    SettingsStorage.setClientId(id);
    return id;
  }
  return clientId;
};

const checkParams = (params: WidgetParams): void => {
  if (!params) throw new Error('Settings for the widget are required');

  const defaultSettings: WidgetParams = {
    host: '',
    token: '',
    channel_uuid: '',
  };

  Object.keys(defaultSettings).forEach((key: keyof WidgetParams) => {
    if (!(key in params)) {
      throw new Error(`Missing widget settings property "${key}"`);
    }
    if (!params[key]) throw new Error(`Missing value of the ${key} property`);
  });
};

const setParams = (params: WidgetParams): void => {
  checkParams(params);
  const clientData = params.client_data;

  store.commit(RootMutationsTypes.SET_CHAT_SETTINGS, {
    host: params?.host || '',
    token: params?.token || '',
    channel_uuid: params?.channel_uuid || '',
    client_data: {
      ...clientData,
      client_id: getClientId(clientData),
    },
  });

  if (clientData?.client_language) {
    i18n.global.locale = clientData.client_language;
  }
};

window.VoxKitWidget = {
  init(params: WidgetParams) {
    if (app && !!document.querySelector('#vox-kit-widget')) {
      console.warn('Widget is already initialized');
      return;
    }
    // Проверка и установка настроек для чата
    setParams(params);

    app = createApp(KitWidgetContainer);
    registerDirectives(app);

    const wc = document.createElement('div');
    wc.setAttribute('id', 'vox-kit-widget');
    document.body.append(wc);

    app.use(i18n).use(store).mount('#vox-kit-widget');
  },
  destroy() {
    app?.unmount();
    document.querySelector('#vox-kit-widget')?.remove();
  },
};

const VoxKitWidgetSettings = {
  host: 'kit-im-eu.voximplant.xyz',
  channel_uuid: '04c2fd70-43e8-47ba-a901-e2acb7129d56',
  token: '9704c148f318d613605d332e1106cc56',
  client_data: {
    client_id: '', // Уникальный идентификатор клиента
    client_phone: '', // Номер телефона клиента
    client_avatar: '', // Ссылка на аватар клиента
    client_display_name: '', // Имя клиента
    client_email: '', // Email клиента
    client_language: 'en', // Язык интерфейса: 'en' или 'ru'
  },
} as WidgetParams;

window.VoxKitWidget.init(VoxKitWidgetSettings);
