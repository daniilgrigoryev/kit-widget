<template lang="pug">
.kit-widget-container#KitWidgetContainer(:style="widgetPosition" :class="[WidgetController.isOpen ? 'is-open' : 'is-closed']")
  transition(name="widget-modal")
    KitWidgetModal(v-if="WidgetController.isOpen")
  transition(name="widget-modal")
    UnreadMessage(
      v-if="shouldShowUnreadMessage && lastUnreadMessage"
      :message="lastUnreadMessage"
      @close="toggleUnreadMessages(false)"
      @read-message="WidgetController.toggle(true)"
    )
  .widget-btn(
    v-if="!isLoading"
    :style="{backgroundColor: btnColors.mainColor }"
    @click="WidgetController.toggle"
  )
    .widget-btn__unread-count(v-if="unreadMessages.length > 0") {{unreadMessages.length}}
    .widget-icon(:class="{'is-open': WidgetController.isOpen}" :style="{fill:btnColors.secondaryBtnColor}")
      .widget-icon__opened
        include ../../assets/icons/close_28px.svg
      .widget-icon__closed
        include ../../assets/icons/message_icon_29x27px.svg
</template>

<script lang="ts">
  import { defineComponent, onMounted, onBeforeMount, onUnmounted, ref, watch } from 'vue';
  import KitWidgetModal from '@/components/KitWidget/KitWidgetModal.vue';
  import Messenger from '@/libs/Messenger';
  import UnreadMessage from '@/components/KitWidget/UnreadMessage.vue';
  import { useGetters, useState } from '@/composables/useStore';
  import { StoreMessage } from '@/types/KitWidgetTypes';
  import useBtnColors from '@/composables/widget_settings/useBtnColors';
  import useWidgetPosition from '@/composables/widget_settings/useWidgetPosition';
  import { WidgetController } from '@/libs/WidgetController/WidgetController';
  import { disableScrollPageOnMobile, touchHandlers } from '@/init/mobile_version_handlers';

  export default defineComponent({
    name: 'KitWidgetContainer',
    components: { UnreadMessage, KitWidgetModal },
    setup() {
      const isLoading = ref(false);
      const shouldShowUnreadMessage = ref(false);

      const { lastUnreadMessage } = useGetters(['lastUnreadMessage']);
      const { unreadMessages, widgetSettings, chatSettings, messages, isConnected } = useState([
        'unreadMessages',
        'widgetSettings',
        'chatSettings',
        'messages',
        'isConnected',
      ]);

      const widgetPosition = useWidgetPosition();
      const btnColors = useBtnColors();

      const sendStartMessageIfNecessary = (): void => {
        if (!messages.value.length && widgetSettings.value) {
          const messages = Array.from(widgetSettings.value.start_conversation_message || []);
          const first = (messages.length && messages[0]) || '';
          first && Messenger.get().sendStartMessage(first);
        }
      };

      const toggleUnreadMessages = (isOpen: boolean): void => {
        shouldShowUnreadMessage.value = isOpen;
        sendStartMessageIfNecessary();
      };

      watch(
        () => WidgetController.isOpen,
        (isOpen: boolean) => {
          disableScrollPageOnMobile(isOpen);
        }
      );

      watch(isConnected, (connected: boolean) => {
        isLoading.value = !connected;
      });

      watch(unreadMessages, (newUnreadMessages: StoreMessage[]) => {
        toggleUnreadMessages(newUnreadMessages.length > 0);
      });

      onBeforeMount(async () => {
        try {
          isLoading.value = true;
          // TODO Messenger - синглтон. При хотрелоаде происходит сначала монтирование нового инстанса vue,
          //  а затем уничтожение старого инстанса. Из-за этого, мы либо ловим ошибку, что пытаемся закрыть еже неподключенный сокет,
          //  либо совсем его закрываем
          if (chatSettings.value !== null && !Messenger.socket) {
            await Messenger.get().connect(chatSettings.value);
          }
        } catch (err) {
          console.warn(err);
        }
      });
      onMounted(() => {
        touchHandlers.init();
      });
      onUnmounted(() => {
        Messenger.get().disconnect();
        touchHandlers.destroy();
      });

      return {
        widgetPosition,
        btnColors,
        isLoading,
        WidgetController,
        shouldShowUnreadMessage,
        unreadMessages,
        lastUnreadMessage,
        toggleUnreadMessages,
      };
    },
  });
</script>

<style lang="postcss">
  .kit-widget-container {
    display: flex;
    justify-content: flex-end;
    flex-direction: column;
    right: 20px;
    bottom: 20px;
    z-index: 777;
    width: 60px;
    height: 60px;
  }
  .kit-widget-container.is-closed {
    position: fixed;
  }
  .kit-widget-container.is-open {
    position: fixed;
    width: 100%;
    max-width: 376px;
    height: calc(100% - 40px);
    max-height: 640px;
  }

  .widget-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 60px;
    height: 60px;
    background-color: var(--primary-default);
    border-radius: 50%;
    cursor: pointer;
  }

  .kit-widget-container.is-open .widget-btn {
    margin-top: 20px;
  }

  .widget-btn__unread-count {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 20px;
    background-color: var(--red-base);
    color: var(--white-base);
    font-size: 10px;
    font-weight: 500;
    line-height: 10px;
    letter-spacing: 0.4px;
    border-radius: 99px;
  }

  .widget-icon {
    position: relative;
    width: 100%;
    height: 100%;
    fill: var(--white-base);
  }

  .widget-icon__closed,
  .widget-icon__opened {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    width: 100%;
    height: 100%;

    svg,
    path {
      fill: inherit;
    }
  }

  .widget-icon .widget-icon__closed {
    opacity: 1;
    transition: transform 0.16s linear 0s, opacity 0.08s linear 0s;
    transform: rotate(0deg) scale(1);
  }

  .widget-icon .widget-icon__opened {
    opacity: 0;
    transition: transform 0.16s linear 0s, opacity 0.08s linear 0s;
    transform: rotate(-30deg);
  }

  .widget-icon.is-open .widget-icon__closed {
    opacity: 0;
    transform: rotate(30deg) scale(0);
  }

  .widget-icon.is-open .widget-icon__opened {
    opacity: 1;
    transform: rotate(0deg);
  }

  .widget-modal-enter-active,
  .widget-modal-leave-active {
    transition: all 0.3s ease-in-out;
    user-select: none;
    pointer-events: none;
  }

  .widget-modal-leave-to,
  .widget-modal-enter-from {
    opacity: 0;
    transform: translateY(2%);
  }

  @media screen and (max-width: 450px) {
    .kit-widget-chat-input__wrapper .editable,
    .kit-widget-chat-input__wrapper .editable * {
      touch-action: none;
    }

    body.safari.keyboard {
      touch-action: none;
      .kit-widget-container.is-open {
        bottom: 270px !important;
        .kit-widget-modal__body {
          height: calc((var(--vhw, 1vh) * 100) - 64px - env(keyboard-inset-height, 0px));
        }
      }
    }
    body.firefox.no-keyboard {
      .kit-widget-modal__body {
        height: calc(100vh - 64px);
      }
    }
    body.chrome.android.keyboard {
      .kit-widget-container.is-open .kit-widget-modal__body {
        //min-height: calc(100vh - env(keyboard-inset-height, 0px) + 120px);
        min-height: fit-content;
      }
    }
    .kit-widget-gallery__container {
      width: 100%;
      min-width: 100%;
      max-height: none;
      border-radius: 0;
    }

    .kit-widget-container.is-open {
      top: 0 !important;
      right: unset !important;
      left: 0 !important;
      max-width: 100%;
      height: calc(var(--vhw, 1vh) * 100);
      max-height: inherit;

      .kit-widget-modal__body {
        position: absolute;
        top: 64px;
        height: calc((var(--vhw, 1vh) * 100) - 64px - env(keyboard-inset-height, 0px));
        min-height: auto;
      }
      .widget-btn {
        display: none;
      }
    }

    .kit-widget-modal__header {
      position: relative;
      top: 0;
      z-index: 1;
    }

    .kit-widget-modal {
      border-radius: 0;
    }

    .kit-widget-modal__close-btn {
      display: block;
    }
  }
</style>
