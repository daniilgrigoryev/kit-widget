<template lang="pug">
.kit-widget-chat-input__wrapper(:class="{'is-border': isBorder}")
  .kit-widget-chat-input__container(v-scrollbar)
    .kit-widget-chat-input
      ContentEditable(
        :placeholder="t('enter_message')"
        :modelValue="modelValue.text"
        @update:modelValue="updateText"
        @keyup="onKeyDownHandler"
        :maxLength="4000"
        ref="editableRef"
      )
  .kit-widget-chat-input__send
    .kit-widget-chat-input__attach-btn.pointer(
      :class="{disabled: shouldDisableAttach}"
      v-tooltip="{delay: 600, content: t('attach_file')}"
      role="button"
    )
      label(for="attachInput")
        include ../../assets/icons/attach_14.svg
        input#attachInput(
          ref="attachInputRef"
          tabindex="-1"
          type='file'
          multiple
          @change="onAttachChange"
          accept=".png,.jpg,.svg"
        )
    .kit-widget-chat-input__line
    .kit-widget-chat-input__send-btn.prevent-hide-keyboard(
      @touchstart="sendMessage"
      @click="sendMessage"
      role="button"
      :class="{disabled: !isUploadingNone || shouldDisableSend}"
      :style="{fill: mainColor}"
    )
      include ../../assets/icons/send_28px.svg
</template>

<script lang="ts">
  import { computed, defineComponent, nextTick, onMounted, PropType, ref } from 'vue';
  import ContentEditable from '@/components/UI/ContentEditable.vue';
  import { useState } from '@/composables/useStore';
  import { useI18n } from 'vue-i18n';
  import {
    currentDevice,
    currentSystem,
    currentPlatform,
    isAppropriateDevices,
    fixVirtualKeyboard,
  } from '@/init/mobile_version_handlers';
  import { WidgetDataMessageType } from '@/types/KitWidgetTypes';
  import { widgetFiles, uploadState } from '@/composables/widget_settings/useSendMessageService';

  export default defineComponent({
    name: 'KitWidgetChatInput',
    components: { ContentEditable },
    props: {
      modelValue: {
        type: Object as PropType<WidgetDataMessageType>,
        required: true,
      },
      isBorder: {
        type: Boolean as PropType<boolean>,
        default: true,
      },
    },
    emits: {
      'update:modelValue': (msgData: WidgetDataMessageType) => !!msgData,
      'send-message': () => true,
    },
    setup(props, context) {
      const { t } = useI18n();
      const { widgetSettings } = useState(['widgetSettings']);
      const editableRef = ref<InstanceType<typeof ContentEditable> | null>(null);
      const attachInputRef = ref<HTMLInputElement | null>(null);
      const mainColor = computed(() => widgetSettings.value?.accent_color);

      // const viewContainerMobileFix = (): void => {
      //   if (
      //     currentDevice === 'mobile' &&
      //     currentPlatform === 'ios' &&
      //     (currentSystem === 'safari' || currentSystem === 'firefox')
      //   ) {
      //     window.scrollTo(0, 0); // скролл к низу страницы фиксирует содержимое чата до конца его просматриваемой области
      //   }
      // };

      const updateText = (value: string): void => {
        context.emit('update:modelValue', { files: props.modelValue.files, text: value });
      };
      const resetAttach = (): void => {
        if (attachInputRef.value) attachInputRef.value.value = '';
      };
      const attachInputValue = computed(() => {
        return attachInputRef?.value?.value;
      });
      const amountFiles = computed(() => {
        return widgetFiles.value.length;
      });
      const amountText = computed(() => {
        return props.modelValue.text.trim().length;
      });
      const isUploadingNone = computed(() => {
        return uploadState.value.loadState === 'none';
      });
      const shouldDisableSend = computed(() => {
        const isInputRefClear = attachInputValue.value === '';
        const isAttachFilesEmpty = !amountFiles.value;
        const isTextClear = amountText.value === 0;
        return isInputRefClear && isAttachFilesEmpty && isTextClear;
      });
      const shouldDisableAttach = computed(() => {
        return amountFiles.value === 10 && !isUploadingNone.value;
      });
      const sendMessage = (): void => {
        if (shouldDisableSend.value) return;
        context.emit('send-message'); // отправляет сообщение из родительского компонента
        editableRef?.value?.editor.commands.clearContent(true);
        isAppropriateDevices() && window.scrollTo(0, 0); // скролл к низу страницы фиксирует содержимое чата до конца его просматриваемой области
      };

      const onAttachChange = (e: Event): void => {
        const newFiles = ((e.target as HTMLInputElement).files || []) as File[];
        const oldFiles = (props.modelValue.files || []) as File[];
        const merged = [...Array.from(oldFiles), ...Array.from(newFiles)];
        context.emit('update:modelValue', { files: merged, text: props.modelValue.text });
      };

      const onKeyDownHandler = (e: KeyboardEvent): void => {
        if (e.key === 'Backspace' || e.key === 'Backspace' || e.key === 'Enter') {
          if (e.key === 'Enter' && currentDevice === 'desktop') sendMessage();
          isAppropriateDevices() && window.scrollTo(0, 0); // скролл к низу страницы фиксирует содержимое чата до конца его просматриваемой области
        } else {
          e.preventDefault();
        }
      };

      onMounted(async () => {
        await nextTick();
        if (currentDevice === 'mobile') await fixVirtualKeyboard();
      });

      return {
        shouldDisableSend,
        shouldDisableAttach,
        editableRef,
        attachInputRef,
        sendMessage,
        updateText,
        onKeyDownHandler,
        t,
        mainColor,
        onAttachChange,
        resetAttach,
        isUploadingNone,
      };
    },
  });
</script>

<style lang="postcss">
  .kit-widget-chat-input__wrapper {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px;

    &.is-border {
      border-top: 1px solid var(--gray-30);
    }
  }

  .kit-widget-chat-input__container {
    flex: 1;
    width: calc(100% - 58px);
    max-height: 180px;
    padding-top: 4px;
  }

  .kit-widget-chat-input__send {
    display: flex;
    align-items: center;
    margin-top: auto;
  }

  .kit-widget-chat-input__line {
    width: 1px;
    height: 28px;
    margin-right: 8px;
    background-color: var(--gray-30);
  }

  .kit-widget-chat-input__attach-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 28px;
    height: 28px;
    margin-right: 9px;
    padding-top: 3px;
    cursor: pointer;
    fill: var(--secondary-default);

    label {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }

    input[type='file'] {
      display: none;
    }

    svg {
      fill: inherit;
    }

    &:focus svg {
      fill: var(--primary-default);
    }
  }

  .kit-widget-chat-input__send-btn {
    width: 28px;
    height: 28px;
    cursor: pointer;
    fill: var(--primary-default);

    svg {
      fill: inherit;
    }
  }

  .kit-widget-chat-input__send-btn path {
    transition: var(--transition-02s-linear);
    fill: inherit;
  }

  .kit-widget-chat-input__attach-btn.disabled,
  .kit-widget-chat-input__send-btn.disabled {
    pointer-events: none;
    path {
      fill: var(--gray-40);
    }
  }
</style>
