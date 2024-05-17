<template lang="pug">
.kit-widget-gallery
  .kit-widget-gallery__overlay(@click="resetImage")
  .kit-widget-gallery__container
    .kit-widget-gallery__headline
      .kit-widget-gallery__header
        span.kit-widget-gallery__title {{currentImage.name}}
        span.kit-widget-gallery__size {{currentImage.size}} {{currentImage.type.toUpperCase()}}
      .kit-widget-gallery-download.pointer(@click="downloadFileByURL(currentImage.url)")
        include ../../assets/icons/download_28.svg
      .kit-widget-gallery__close.pointer(@click="resetImage")
        include ../../assets/icons/close_40px.svg
    .kit-widget-gallery__inner
      .kit-widget-gallery__body#overview-section(@touchstart="handleTouchStart" @touchmove="handleTouchMove")
        .kit-widget-gallery__actions
          .kit-widget-gallery__scroll.kit-widget-gallery__scroll--right(v-show="shouldShowRightBtn"  @click="changeImage(1)")
            include ../../assets/icons/arrow_28.svg
          .kit-widget-gallery__scroll.kit-widget-gallery__scroll--left(v-show="shouldShowLeftBtn"  @click="changeImage(-1)")
            include ../../assets/icons/arrow_28.svg
        img(:src="currentImage.url")
</template>

<script lang="ts">
  import { computed, defineComponent, PropType, onMounted, onUnmounted, ref, watch } from 'vue';
  import { MessagePayload } from '@/types/MessageTypes';
  import { getFileExt, getFileSize, downloadFileByURL } from '@/composables/widget_settings/useSendMessageService';
  import { WidgetFile } from '@/types/KitWidgetTypes';
  import { currentDevice } from '@/init/mobile_version_handlers';

  let touchStartX: number | null = null;
  let touchStartY: number | null = null;

  type Image = {
    id: string | number;
    name: string;
    url: string | undefined;
    size: string;
    type: string;
  };

  export default defineComponent({
    name: 'KitWidgetGallery',
    components: {},
    props: {
      modelValue: {
        type: Object as PropType<WidgetFile | MessagePayload | null>,
        default: null,
      },
      images: {
        type: Array as PropType<WidgetFile[] | MessagePayload[]>,
        default: null,
      },
    },
    emits: {
      'update:modelValue': (image: MessagePayload | WidgetFile | null) => image,
    },
    setup(props, context) {
      const parseImage = (inputFile: WidgetFile | MessagePayload): Image => {
        const { file_name, file_url, file_size, file_id } = inputFile as MessagePayload;
        const { name, size, url, id } = inputFile as WidgetFile;

        const fileId = id || file_id;
        const fileName = name || file_name;
        const fileUrl = url || file_url;
        const fileSize = getFileSize(size || file_size);
        const typeType = getFileExt(file_name || name);

        return {
          id: fileId,
          name: fileName,
          url: fileUrl,
          size: fileSize,
          type: typeType,
        };
      };
      const currentImage = computed(() => (props.modelValue ? parseImage(props.modelValue) : null));
      const allImages = computed(() => props.images.map(parseImage));
      const currentIndex = computed(() => allImages.value.findIndex(({ id }) => id === currentImage.value?.id));
      const resetImage = (): void => {
        context.emit('update:modelValue', null);
      };
      const changeImage = (offset: number): void => {
        let newIndex = currentIndex.value;
        if (newIndex === 0 && offset < 0) {
          newIndex = props.images?.length - 1;
        } else if (newIndex === props.images?.length - 1 && offset > 0) {
          newIndex = 0;
        } else {
          newIndex += offset;
        }
        context.emit('update:modelValue', props.images[newIndex]);
      };
      const shouldShowRightBtn = computed(() => {
        return currentDevice !== 'mobile' && props.images.length > 1 && currentIndex.value < props.images.length - 1;
      });
      const shouldShowLeftBtn = computed(() => {
        return currentDevice !== 'mobile' && props.images.length > 1 && currentIndex.value > 0;
      });

      const handleTouchStart = (event: TouchEvent): void => {
        const firstTouch = event.touches[0];
        touchStartX = firstTouch.clientX;
        touchStartY = firstTouch.clientY;
      };

      const handleTouchMove = (event: TouchEvent): void => {
        if (!touchStartX || !touchStartY) return;
        const clientX = event.touches[0].clientX;
        const clientY = event.touches[0].clientY;
        const xDiff = touchStartX - clientX;
        const yDiff = touchStartY - clientY;
        const isHorizontalSwipe = Math.abs(xDiff) > Math.abs(yDiff);
        const isVerticalSwipe = yDiff > 0;
        const isSwipeToTheRight = xDiff > 0;

        if (isHorizontalSwipe) {
          isSwipeToTheRight ? changeImage(1) : changeImage(-1);
        } else if (isVerticalSwipe) {
          resetImage();
        }
        touchStartX = null;
        touchStartY = null;
      };

      const onKeydown = (event: KeyboardEvent): void => {
        switch (event.key) {
          case 'ArrowRight':
            changeImage(1);
            break;
          case 'ArrowLeft':
            changeImage(-1);
            break;
          case 'Escape':
            resetImage();
            break;
        }
      };

      onMounted(() => {
        document.addEventListener('keydown', onKeydown);
      });

      onUnmounted(() => {
        document.removeEventListener('keydown', onKeydown);
      });

      return {
        currentImage,
        downloadFileByURL,
        handleTouchStart,
        handleTouchMove,
        changeImage,
        resetImage,
        shouldShowRightBtn,
        shouldShowLeftBtn,
      };
    },
  });
</script>

<style>
  .kit-widget-gallery__overlay {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 666;
    margin: 0;
    overflow: hidden;
    background: var(--blue-base-opacity-10);
  }
  .kit-widget-gallery__container {
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 777;
    min-width: 560px;
    max-width: 1352px;
    height: 100%;
    max-height: calc(100% - 40px);
    overflow: hidden;
    background: var(--white-base);
    border-radius: 12px;
    transform: translate(-50%, -50%);
    box-shadow: var(--shadow-dark-16dp);
  }
  .kit-widget-gallery__headline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 999;
    width: 100%;
    background-color: var(--white-base);
    border-bottom: 1px solid var(--gray-20);
  }
  .kit-widget-gallery__header {
    display: flex;
    flex-direction: column;
    max-width: 75%;
    padding: 24px 24px 16px;
    box-sizing: border-box;
  }
  .kit-widget-gallery__title {
    margin-right: 16px;
    overflow: hidden;
    color: var(--gray-90);
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .kit-widget-gallery__size {
    margin-top: 2px;
    color: var(--secondary-default);
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.4px;
  }
  .kit-widget-gallery__close {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-right: 20px;
    border-radius: 100%;
    &:before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 28px;
      height: 28px;
      margin: auto;
      background-color: transparent;
      border-radius: 100%;
      transition: background-color var(--transition-02s-ease-in-out);
      transform: translate(-50%, -50%);
    }
    &:hover::before {
      background-color: rgb(120 144 156 / 15%);
    }
  }
  .kit-widget-gallery-download {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 28px;
    height: 28px;
    margin-right: auto;
    background-color: var(--white-base);
    border: 1px solid var(--primary-default);
    border-radius: 8px;
    &:hover {
      border-color: var(--primary-active);
      path {
        fill: var(--primary-active);
      }
    }
  }
  .kit-widget-gallery__inner {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 100%;
    height: calc(100% - 88px);
    max-height: 100%;
    overflow: hidden;
    background-color: var(--white-base);
  }
  .kit-widget-gallery__body {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .kit-widget-gallery__actions {
    position: absolute;
    width: calc(100% - 20px);
    height: 58px;
  }
  .kit-widget-gallery__scroll {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 50%;
    z-index: 2;
    width: 28px;
    height: 28px;
    background-color: #ffffff;
    border: 1px solid var(--gray-40);
    border-radius: 8px;
    transition: 300ms ease opacity;
    -ms-transform: translate(0%, -50%);
    transform: translate(0%, -50%);
    cursor: pointer;

    &.kit-widget-gallery__scroll--right {
      right: 5px;
    }
    &.kit-widget-gallery__scroll--left {
      left: 5px;
      svg {
        transform: rotate(180deg);
      }
    }
  }
</style>
