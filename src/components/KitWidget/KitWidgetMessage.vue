<template lang="pug">
.kit-widget-message
  .kit-widget-message__content
    .kit-widget-message__avatar.pointer(
      v-if="message.sender_type !== 'client'"
      v-tooltip="{delay: 300, offset: '0,4', content: message.shouldShowAvatar && message.sender_display_name}")
      template(v-if="message.shouldShowAvatar")
        AgentAvatar(:isLazy="true" :src="message.avatar" :isBot="message.isBot")
    .kit-widget-message__wrapper
      .kit-widget-message__attach-preview(v-if="message.payload" v-for="file in message.payload")
        template(v-if="message.payload.length")
          KitWidgetFilePreview.kit-widget-attach__image-item(:file="file" :key="file.id" @view-image="selectImageForView")
            .kit-widget-attach__image-action.icon-download-btn(@click="downloadFileByURL(file.file_url || file.url)")
              include ../../assets/icons/download_28.svg
        template(v-else)
          .kit-widget-message__attach-image
            .kit-widget-attach__image-action.icon-download-btn(@click="downloadFileByURL(file.file_url || file.url)")
              include ../../assets/icons/download_28.svg
            template(v-if="isNotAllowFormat(file.file_name || file.name)")
              include ../../assets/icons/any_format_40px.svg
            template(v-else)
              img.pointer(:src="file.file_url || file.url" @click="selectImageForView(file)")
      .kit-widget-message__text.pointer(
        v-if="message.text"
        v-tooltip="{delay: 300, content: dateTimeTooltip}"
        :class="{'is-light': isLight}"
        :style="{color: messageStyleSettings.messageColor, backgroundColor: messageStyleSettings.bgColor}"
      ) {{message.text}}
</template>

<script lang="ts">
  import { MessagePayload } from '@/types/MessageTypes';
  import { computed, defineComponent, PropType } from 'vue';
  import { MessageStyleSettings, WidgetMessageType } from '@/types/KitWidgetTypes';
  import AgentAvatar from '@/components/AgentAvatar.vue';
  import { useI18n } from 'vue-i18n';
  import tinycolor from 'tinycolor2';
  import KitWidgetFilePreview from '@/components/KitWidget/KitWidgetFilePreview.vue';
  import { getFileExt, downloadFileByURL } from '@/composables/widget_settings/useSendMessageService';

  export default defineComponent({
    name: 'KitWidgetMessage',
    components: { AgentAvatar, KitWidgetFilePreview },
    props: {
      message: {
        type: Object as PropType<WidgetMessageType>,
        required: true,
      },
      messageStyleSettings: {
        type: Object as PropType<MessageStyleSettings>,
        required: true,
      },
    },
    emits: {
      'view-image': (args: MessagePayload) => !!args,
    },
    setup(props, context) {
      const { t } = useI18n();
      const dateTimeTooltip = computed(() => `${props.message.date} ${t('at')} ${props.message.time}`);
      const isLight = computed<boolean>(() => {
        const { a, l } = tinycolor(props.messageStyleSettings.bgColor).toHsl();
        return l > 0.96 || a < 0.1;
      });
      const selectImageForView = (file: MessagePayload): void => {
        context.emit('view-image', file);
      };
      const isNotAllowFormat = (fileName: string): boolean => {
        const fileExt = getFileExt(fileName).toLowerCase();
        const allowFormatExt = ['png', 'jpg', 'svg'];
        return !allowFormatExt.includes(fileExt);
      };

      return { dateTimeTooltip, isLight, downloadFileByURL, getFileExt, selectImageForView, isNotAllowFormat };
    },
  });
</script>

<style lang="postcss">
  .kit-widget-message__content {
    display: flex;
  }

  .kit-widget-message__avatar {
    flex: 0 0 32px;
    width: 32px;
    margin-right: 8px;
  }
  .kit-widget-message__attach-image {
    position: relative;
    width: 100%;
    &--undefined {
      svg {
        width: 28px;
        height: 28px;
      }
    }
    img {
      width: 100%;
      height: 100%;
      border-radius: 6px;
      -o-object-fit: cover;
      object-fit: contain;
    }
    .icon-download-btn {
      top: 4% !important;
      right: 2% !important;
      transform: none !important;
    }
  }

  .kit-widget-message__text {
    padding: 12px;
    background-color: var(--gray-10);
    color: var(--gray-90);
    font-size: 14px;
    line-height: 20px;
    white-space: break-spaces;
    letter-spacing: 0.25px;
    word-break: break-word;
    border: 1px solid transparent;
    border-radius: 12px;

    &.is-light {
      border: 1px solid var(--gray-30);
    }
  }

  .kit-widget-message__attach-preview {
    margin-bottom: 8px;
    padding: 12px;
    background-color: var(--gray-10);
    border-radius: 12px;
    .kit-widget-attach__image-title {
      width: 200px;
    }
    .kit-widget-attach__image-item {
      width: 280px;
      margin-right: 0;
      margin-bottom: 12px;
      &:last-child {
        margin-bottom: 0;
      }
    }
    .icon-download-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      top: 50%;
      right: 14px;
      z-index: 1;
      width: 28px;
      height: 28px;
      background-color: var(--white-base);
      opacity: 0;
      border: 1px solid var(--primary-default);
      border-radius: 8px;
      transform: translateY(-50%);
      cursor: pointer;
      &:hover {
        border-color: var(--primary-active);
        path {
          fill: var(--primary-active);
        }
      }
    }
    &:hover {
      .icon-download-btn {
        opacity: 1;
        transition: 200ms ease opacity;
      }
      .kit-widget-attach__image-title {
        width: 180px;
      }
    }
  }
  .kit-widget-message.kit-widget-messages__message--left {
  }
  .kit-widget-message.kit-widget-messages__message--right {
    .kit-widget-message__wrapper,
    .kit-widget-message__attach-preview {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .kit-widget-message__attach-preview {
      background-color: #fff;
      border: 1px solid var(--gray-30);
    }
  }
</style>
