<template lang="pug">
.kit-widget-attach__image-item
  slot
  .kit-widget-attach__image-body(@click="!isNotAllowFormat && $emit('view-image', file)")
    .kit-widget-attach__image-img
      template(v-if="isNotAllowFormat")
        include ../../assets/icons/any_format_40px.svg
      template(v-else)
        img.pointer(:src="computedFile.url")
    .kit-widget-attach__image-info
      p.kit-widget-attach__image-title.pointer(v-tooltip="{delay: 600, content: computedFile.name}") {{computedFile.name}}
      p.kit-widget-attach__image-size {{computedFile.size}}
</template>

<script lang="ts">
  import { computed, defineComponent, PropType } from 'vue';
  import { WidgetFile } from '@/types/KitWidgetTypes';
  import { MessagePayload } from '@/types/MessageTypes';
  import { getFileExt, getFileSize } from '@/composables/widget_settings/useSendMessageService';

  export default defineComponent({
    name: 'KitWidgetFilePreview',
    props: {
      file: {
        type: Object as PropType<WidgetFile | MessagePayload>,
        required: true,
      },
    },
    emits: {
      'view-image': (args: MessagePayload) => !!args,
    },
    setup(props) {
      const computedFile = computed(() => {
        const { name, size, url } = props.file as WidgetFile;
        const { file_name, file_url, file_size } = props.file as MessagePayload;

        const fileName = name || file_name;
        const fileUrl = url || file_url;
        const fileSize = getFileSize(size || file_size);
        const typeType = getFileExt(file_name || name);

        return {
          name: fileName,
          url: fileUrl,
          size: fileSize,
          type: typeType,
        };
      });

      const isNotAllowFormat = computed(() => {
        const allowFormatExt = ['png', 'jpg'];
        return !allowFormatExt.includes(computedFile.value.type.toLowerCase());
      });
      return {
        computedFile,
        isNotAllowFormat,
      };
    },
  });
</script>

<style lang="postcss" scoped>
  .kit-widget-attach__image-item {
    display: inline-block;
    position: relative;
    width: 180px;
    margin-right: 12px;
    box-sizing: border-box;
    background-color: #fff;
    border: 1px solid var(--gray-30);
    border-radius: 8px;
  }

  .kit-widget-attach__image-body {
    display: flex;
    padding: 8px;
    box-sizing: border-box;
  }
  .kit-widget-attach__image-img {
    width: 40px;
    height: 40px;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      border-radius: 6px;
      object-fit: cover;
    }
  }
  .kit-widget-attach__image-info {
    margin-left: 8px;
  }
  .kit-widget-attach__image-title {
    width: 110px;
    overflow: hidden;
    color: var(--gray-90);
    font-size: 14px;
    line-height: 20px;
    white-space: nowrap;
    text-transform: lowercase;
    text-overflow: ellipsis;
  }
  .kit-widget-attach__image-size {
    width: 110px;
    overflow: hidden;
    color: var(--secondary-default);
    font-size: 12px;
    line-height: 16px;
    text-overflow: ellipsis;
  }
</style>
