<template lang="pug">
.kit-widget-messages__wrapper(
  v-scrollbar
  ref="messagesRef"
)
  .kit-widget-messages
    .kit-widget-messages__date-group(
      v-for="(messages, date) in kitWidgetMessages"
      :key="date"
    )
      .kit-widget-messages__date {{date}}
      KitWidgetMessage.kit-widget-messages__message(
        v-for="(message, ind) in messages"
        :key="ind"
        :message="message"
        :messageStyleSettings="getMessageStyleSettings(message)"
        :class="getClass(message)"
        @view-image="handleViewImage"
      )
      Teleport(to="body")
        KitWidgetGallery.kit-widget-messages__gallery(v-if="selectedImage" v-model="selectedImage" :images="kitWidgetImages")
</template>

<script lang="ts">
  import { computed, defineComponent, onMounted, watch, ref } from 'vue';
  import KitWidgetMessage from '@/components/KitWidget/KitWidgetMessage.vue';
  import useScrollToBottom from '@/composables/ui/useScrollToBottom';
  import { MessageStyleSettings, StoreMessage, WidgetMessage } from '@/types/KitWidgetTypes';
  import { MessagePayload } from '@/types/MessageTypes';
  import { GROUP_MSG_MINS_INTERVAL } from '@/libs/consts/kit_widget_consts';
  import { renderHumanFullDateTime } from '@/utils/translateDate';
  import { useI18n } from 'vue-i18n';
  import { groupBy } from '@/utils/groupBy';
  import { useState } from '@/composables/useStore';
  import { initBlurInput } from '@/init/mobile_version_handlers';
  import KitWidgetGallery from '@/components/KitWidget/KitWidgetGallery.vue';

  const calculateDiffInMinutes = (dt2: Date, dt1: Date): number => {
    const diff = (dt2.getTime() - dt1.getTime()) / 1000 / 60;
    return Math.abs(Math.round(diff));
  };

  // группа - это сообщения от одного юзера, написанные во временном пределе равному: GROUP_MSG_MINS_INTERVAL
  // в группе только первое сообщение должно отображаться с аватаром, остальные - без
  const isOneGroupMessage = (message: StoreMessage, prevMessage: StoreMessage | undefined): boolean => {
    if (message.is_agent && prevMessage?.is_agent) {
      const dateDiff = message.timestamp - prevMessage.timestamp;
      const messageSentMinutesDifference = calculateDiffInMinutes(
        new Date(prevMessage.timestamp),
        new Date(message.timestamp)
      );

      const messageSentDaysDifference = Math.abs(Math.ceil(dateDiff / (1000 * 60 * 60 * 24)));

      return messageSentDaysDifference <= 1 && messageSentMinutesDifference <= GROUP_MSG_MINS_INTERVAL;
    }

    return false;
  };

  const { date: today } = renderHumanFullDateTime(new Date().toJSON());

  export default defineComponent({
    name: 'KitWidgetMessages',
    components: { KitWidgetGallery, KitWidgetMessage },

    setup() {
      const { t } = useI18n();
      const { messages, widgetSettings } = useState(['messages', 'widgetSettings']);
      const { scrollToBottomRef: messagesRef, scrollToBottom } = useScrollToBottom();
      const selectedImage = ref<MessagePayload | null>(null);
      const kitWidgetMessages = computed<Record<string, WidgetMessage[]>>(() => {
        const parsedMessages = messages.value.reduce((widgetMessages, message, ind, sourceMessages) => {
          const prevMessage = sourceMessages[ind - 1];

          const shouldShowAvatar =
            message.is_bot || (message.sender_id !== 0 && message.is_agent && !isOneGroupMessage(message, prevMessage));
          const { date, time } = renderHumanFullDateTime(new Date(message.timestamp).toJSON());

          return [
            ...widgetMessages,
            {
              ...message,
              avatar: message.sender_avatar,
              isBot: message.is_bot,
              date: date === today ? t('today') : date,
              time,
              shouldShowAvatar,
              side: message.is_agent || message.is_bot ? 'left' : 'right',
            } as WidgetMessage,
          ];
        }, [] as WidgetMessage[]);

        return groupBy(parsedMessages, 'date' as TODO_ANY);
      });

      const kitWidgetImages = computed(() => {
        const allWidgetMessages = Object.values(kitWidgetMessages.value).flat();
        return allWidgetMessages.reduce<MessagePayload[]>((acc, message) => {
          if (message.payload) acc.push(...message.payload);
          return acc;
        }, []);
      });

      watch(messages, scrollToBottom, { flush: 'post' });

      onMounted(() => {
        scrollToBottom();
        messagesRef.value?.addEventListener('touchmove', initBlurInput);
      });

      const getClass = (message: WidgetMessage): string => {
        return message.side === 'left' ? 'kit-widget-messages__message--left' : 'kit-widget-messages__message--right';
      };
      const handleViewImage = (file: MessagePayload): void => {
        selectedImage.value = file;
      };

      const getMessageStyleSettings = (message: WidgetMessage): MessageStyleSettings => {
        const isClientMessage = message.side === 'right';
        return {
          bgColor: isClientMessage ? widgetSettings.value?.message_color || '#ffffff' : '',
          messageColor: isClientMessage ? widgetSettings.value?.message_text_color || '#3e4345' : '',
        };
      };

      return {
        kitWidgetMessages,
        getClass,
        messagesRef,
        getMessageStyleSettings,
        handleViewImage,
        selectedImage,
        kitWidgetImages,
      };
    },
  });
</script>

<style lang="postcss">
  .kit-widget-messages {
    display: flex;
    flex-direction: column;
  }

  .kit-widget-messages__wrapper {
    padding: 0 16px;
  }

  .ui-scrollbar::-webkit-scrollbar-thumb {
    border-top: 8px solid var(--white-base);
    border-bottom: 8px solid var(--white-base);
  }

  .kit-widget-messages__date {
    align-self: center;
    margin: 16px 0;
    color: var(--secondary-default);
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.4px;
  }

  .kit-widget-messages__message--right {
    justify-content: flex-end;
    align-self: flex-end;
  }

  .kit-widget-messages__message--left + .kit-widget-messages__message--left,
  .kit-widget-messages__message--right + .kit-widget-messages__message--right {
    margin-top: 8px;
  }

  .kit-widget-messages__message--right + .kit-widget-messages__message--left,
  .kit-widget-messages__message--left + .kit-widget-messages__message--right {
    margin-top: 16px;
  }

  .kit-widget-messages__message--right .kit-widget-message__text {
    background-color: var(--white-base);
  }
  .kit-widget-message:last-child {
    margin-bottom: 8px;
  }
  .kit-widget-messages__date-group {
    display: flex;
    flex-direction: column;
  }
</style>
