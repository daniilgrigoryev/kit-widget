<template lang="pug">
.agent-avatar(v-bind="$attrs")
  .agent-avatar__default(v-if="isBot")
    include ../assets/icons/bot_avatar_32px.svg
  img.agent-avatar__image(
    v-else-if="src"
    :loading="isLazy ? 'lazy' : 'auto'"
    :src="src"
  )
  .agent-avatar__default(v-else)
    include ../assets/icons/default_avatar_32px.svg
</template>

<script lang="ts">
  import { defineComponent, PropType, ref, watch } from 'vue';
  import { checkImage } from '@/utils/checkImage';

  export default defineComponent({
    name: 'AgentAvatar',
    inheritAttrs: false,
    props: {
      src: {
        type: String as PropType<string | undefined>,
        required: false,
      },
      isLazy: {
        type: Boolean as PropType<boolean>,
        default: false,
      },
      isBot: {
        type: Boolean as PropType<boolean>,
        default: false,
      },
    },
    setup(props) {
      const isImageValid = ref<boolean>(true);
      watch(
        () => props.src,
        (newSrc: string) =>
          checkImage(newSrc)
            .then(() => {
              isImageValid.value = true;
            })
            .catch(() => {
              isImageValid.value = false;
            }),
        { immediate: true }
      );
    },
  });
</script>

<style lang="postcss">
  .agent-avatar,
  .agent-avatar__default {
    display: flex;
  }

  .agent-avatar {
    height: 32px;
    width: 32px;
    flex: 0 0 32px;
    overflow: hidden;
    border-radius: 50%;
  }

  .agent-avatar__image {
    min-width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
