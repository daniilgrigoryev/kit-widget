<template lang="pug">
.kit-widget-modal
  .kit-widget-modal__header(:style="{backgroundColor: settings.headerBg}")
    AgentAvatar.kit-widget-modal__icon(v-if="settings.avatar" :src="settings.avatar")
    .kit-widget-modal__title.pointer(
      v-tooltip="{content: settings.title, overflow: true}"
      :style="{color: settings.headerColor}"
    ) {{settings.title}}
    .kit-widget-modal__close-btn(@click="WidgetController.toggle")
      include ../../assets/icons/close_28px_smaller.svg
  .kit-widget-modal__body(v-if="isAuthorized")
    KitWidgetLoading.kit-widget-modal__loading(v-if="uploadState.loadState !== 'none'" :loadState="uploadState.loadState" :filesCount="uploadState.filesCount" :filesTotal="totalFiles")
    KitWidgetMessages.kit-widget-modal__messages
    KitWidgetActions.kit-widget-modal__actions
  KitWidgetAuth(v-else)
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import KitWidgetLoading from '@/components/KitWidget/KitWidgetLoading.vue';
  import KitWidgetMessages from '@/components/KitWidget/KitWidgetMessages.vue';
  import { useState } from '@/composables/useStore';
  import AgentAvatar from '@/components/AgentAvatar.vue';
  import KitWidgetAuth from '@/components/KitWidget/KitWidgetAuth.vue';
  import { WidgetController } from '@/libs/WidgetController/WidgetController';
  import KitWidgetAttach from '@/components/KitWidget/KitWidgetAttach.vue';
  import KitWidgetActions from '@/components/KitWidget/KitWidgetActions.vue';
  import { useI18n } from 'vue-i18n';
  import { uploadState, totalFiles } from '@/composables/widget_settings/useSendMessageService';

  export default defineComponent({
    name: 'KitWidgetModal',
    components: { KitWidgetAuth, AgentAvatar, KitWidgetMessages, KitWidgetAttach, KitWidgetActions, KitWidgetLoading },
    setup() {
      const { t } = useI18n();
      const { agentInfo, widgetSettings, chatSettings } = useState(['agentInfo', 'widgetSettings', 'chatSettings']);

      const settings = computed(() => ({
        headerColor: widgetSettings.value?.secondary_color || '',
        headerBg: widgetSettings.value?.accent_color || '',
        title: agentInfo.value ? agentInfo.value.fullName || agentInfo.value.name : widgetSettings.value?.header_text,
        avatar: agentInfo.value ? agentInfo.value.avatar : widgetSettings.value?.company_logo,
      }));

      const isAuthorized = computed<boolean>(() => {
        if (chatSettings.value?.client_data) {
          const hasClientId = chatSettings.value.client_data.client_id;
          const hasEmailOrName =
            chatSettings.value.client_data.client_display_name || chatSettings.value.client_data.client_email;
          return !!hasClientId && !!hasEmailOrName;
        }
        return false;
      });

      return {
        t,
        settings,
        agentInfo,
        isAuthorized,
        WidgetController,
        uploadState,
        totalFiles,
      };
    },
  });
</script>

<style lang="postcss">
  .kit-widget-modal {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
    border-radius: 12px;
    box-shadow: var(--shadow-dark-12dp);
  }

  .kit-widget-modal__header {
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
    height: 64px;
    padding: 16px;
    background-color: var(--primary-default);
    color: var(--white-base);
  }

  .kit-widget-modal__icon {
    width: 32px;
    height: 32px;
    margin-right: 14px;
  }

  .kit-widget-modal__body {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    flex-grow: 1;
    width: 100%;
    height: calc(100% - 64px);
    background-color: var(--white-base);
  }

  .kit-widget-modal__title {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .kit-widget-modal__close-btn {
    display: none;
    width: 28px;
    height: 28px;
    cursor: pointer;
  }
</style>
