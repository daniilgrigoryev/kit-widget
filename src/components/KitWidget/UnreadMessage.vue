<template lang="pug">
.unread-message(@click="onClick" :style="unreadMessagesContainerPosition")
  .unread-message__header
    .unread-message__agent-info
      AgentAvatar.unread-message__agent-avatar(:src="message.sender_avatar")
      .unread-message__agent-name {{message.sender_display_name}}
    .unread-message__close-btn#close-preview-btn
      include ../../assets/icons/close_40px.svg
  .unread-message__body
    p.unread-message__text {{message.text}}
</template>

<script lang="ts">
  import { computed, defineComponent, PropType } from 'vue';
  import AgentAvatar from '@/components/AgentAvatar.vue';
  import { StoreMessage } from '@/types/KitWidgetTypes';
  import { useState } from '@/composables/useStore';

  export default defineComponent({
    name: 'UnreadMessage',
    components: { AgentAvatar },
    props: {
      message: Object as PropType<StoreMessage>,
    },
    emits: {
      close: null,
      'read-message': null,
    },
    setup(props, context) {
      const { widgetSettings } = useState(['widgetSettings']);

      const unreadMessagesContainerPosition = computed(() => {
        const { align_right = true } = widgetSettings.value || {};
        return {
          left: align_right ? 'unset' : '0px',
          right: align_right ? '0px' : 'unset',
        };
      });

      const onClick = (e: Event): void => {
        const target = e.target as HTMLElement | undefined;
        if (target?.closest('#close-preview-btn')) {
          context.emit('close');
        } else {
          context.emit('read-message');
        }
      };

      return {
        unreadMessagesContainerPosition,
        onClick,
      };
    },
  });
</script>

<style lang="postcss">
  .unread-message {
    padding: 8px 8px 16px 16px;
    box-shadow: var(--shadow-dark-16dp);
    background: var(--white-base);
    border-radius: 12px;
    position: absolute;
    bottom: 80px;
    width: 376px;
    cursor: default;
  }

  .unread-message__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .unread-message__agent-info {
    display: flex;
    align-items: center;
    width: calc(100% - 40px);
  }

  .unread-message__agent-avatar {
    width: 32px;
    height: 32px;
    margin-right: 14px;
  }

  .unread-message__agent-name {
    font-weight: 500;
    font-size: 14px;
    line-height: 22px;
    letter-spacing: 0.1px;
    color: var(--gray-90);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .unread-message__close-btn {
    display: flex;
    width: 40px;
    user-select: none;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    transition: var(--transition-02s-linear);
  }

  .unread-message__close-btn:hover {
    background-color: var(--bg-grey-hover);
  }

  .unread-message__body {
    margin-top: -5px;
  }

  .unread-message__text {
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: var(--gray-90);
    margin-left: 46px;
  }
</style>
