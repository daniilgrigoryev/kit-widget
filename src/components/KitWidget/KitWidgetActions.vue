<template lang="pug">
.kit-widget-actions__container
  KitWidgetAttach.kit-widget-actions__attach(v-if="totalFiles" :files="widgetFiles" @delete-file="deleteFile")
  KitWidgetChatInput.kit-widget-actions__chat-input(:is-border="!totalFiles" v-model="messageData" @send-message="pushMessage" ref="chatInputRef")
</template>

<script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  import KitWidgetAttach from '@/components/KitWidget/KitWidgetAttach.vue';
  import KitWidgetChatInput from '@/components/KitWidget/KitWidgetChatInput.vue';
  import {
    sendMessage,
    deleteFile,
    widgetFiles,
    messageData,
    totalFiles,
  } from '@/composables/widget_settings/useSendMessageService';
  import { useState } from '@/composables/useStore';

  export default defineComponent({
    name: 'KitWidgetActions',
    components: {
      KitWidgetAttach,
      KitWidgetChatInput,
    },
    setup() {
      const { chatSettings } = useState(['chatSettings']);
      const chatInputRef = ref<InstanceType<typeof KitWidgetChatInput> | null>(null);

      watch(
        () => messageData.value.files,
        (files) => files && chatInputRef.value?.resetAttach()
      );

      const pushMessage = async (): Promise<void> => {
        await sendMessage(messageData.value.text, chatSettings.value);
      };

      return {
        messageData,
        widgetFiles,
        totalFiles,
        pushMessage,
        deleteFile,
        chatInputRef,
      };
    },
  });
</script>
<style lang="postcss" scoped>
  .kit-widget-actions__container {
    position: relative;
    max-height: 376px;
  }
</style>
