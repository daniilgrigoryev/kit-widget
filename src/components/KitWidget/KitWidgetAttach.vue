<template lang="pug">
.kit-widget-attach__wrapper(ref="wrapperEl")
  .kit-widget-attach__actions
    .kit-widget-attach__scroll.kit-widget-attach__scroll--right(v-show="arrowState.right" @click="scroll('right')")
      include ../../assets/icons/arrow_28.svg
    .kit-widget-attach__scroll.kit-widget-attach__scroll--left(v-show="arrowState.left" @click="scroll('left')")
      include ../../assets/icons/arrow_28.svg
  KitWidgetFilePreview.kit-widget-attach__image-item(v-for="(file, index) in files" :file="file" :key="file.id")
    .kit-widget-attach__image-delete.kit-widget-attach__image-action(@click="onDeleteFile(index)")
      include ../../assets/icons/close_28px.svg
</template>

<script lang="ts">
  import { defineComponent, PropType, reactive, ref, onMounted, computed, onBeforeUnmount } from 'vue';
  import { WidgetFile } from '@/types/KitWidgetTypes';
  import KitWidgetFilePreview from '@/components/KitWidget/KitWidgetFilePreview.vue';

  const CAROUSEL_OFFSET = 180;

  export default defineComponent({
    name: 'KitWidgetAttach',
    components: { KitWidgetFilePreview },
    props: {
      files: {
        type: Object as PropType<WidgetFile[]>,
        default: [],
      },
    },
    emits: {
      'delete-file': (index: number) => index >= 0,
    },
    setup(props, context) {
      const wrapperEl = ref<HTMLDivElement | null>(null);
      let filesContainerRO: ResizeObserver | null = null;
      const filesAmount = computed(() => props.files.length);
      const clientWidthFiles = computed(() => Math.round(props.files.length * 190));

      const arrowState = reactive({
        left: false,
        right: false,
      });

      const onDeleteFile = (index: number): void => {
        context.emit('delete-file', index);
        handleCarouselButtonsVisibility();
      };

      const scroll = (direction: 'left' | 'right'): void => {
        const offset = direction === 'right' ? CAROUSEL_OFFSET : -CAROUSEL_OFFSET;
        if (wrapperEl.value) wrapperEl.value.scrollBy(offset, 0);
      };

      onMounted(() => {
        filesContainerRO = new ResizeObserver(handleCarouselButtonsVisibility);

        if (wrapperEl?.value) {
          filesContainerRO.observe(wrapperEl.value);
          wrapperEl.value?.addEventListener('scroll', handleCarouselButtonsVisibility.bind(this), false);
        }
      });
      onBeforeUnmount(() => {
        filesContainerRO?.disconnect();
      });

      const handleCarouselButtonsVisibility = (): void => {
        if (wrapperEl?.value) {
          const { clientWidth, scrollWidth, scrollLeft } = wrapperEl.value;
          const isRight = scrollWidth <= clientWidth + scrollLeft;
          const isLeft = scrollLeft === 0;
          const isEnoughFiles = filesAmount.value > 2;
          const widthFiles = clientWidthFiles.value;

          if (widthFiles > clientWidth && isEnoughFiles) {
            arrowState.right = !isRight;
            arrowState.left = !isLeft;
          } else {
            arrowState.right = false;
            arrowState.left = false;
          }
        }
      };

      return {
        wrapperEl,
        arrowState,
        filesAmount,
        scroll,
        onDeleteFile,
      };
    },
  });
</script>
<style lang="postcss" scoped>
  .kit-widget-attach__wrapper {
    width: 100%;
    padding-top: 15px;
    padding-left: 15px;
    overflow-x: auto;
    background-color: #ffffff;
    white-space: nowrap;
    border-top: 1px solid var(--gray-30);

    &::-webkit-scrollbar {
      display: none;
    }
  }
  .kit-widget-attach__actions {
    position: absolute;
    width: calc(100% - 20px);
    height: 58px;
  }
  .kit-widget-attach__scroll {
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
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    cursor: pointer;

    &.kit-widget-attach__scroll--right {
      right: 5px;
    }
    &.kit-widget-attach__scroll--left {
      left: 20px;
      svg {
        transform: rotate(180deg);
      }
    }
  }

  .kit-widget-attach__image-item:hover .kit-widget-attach__image-delete {
    opacity: 1;
    transition: 200ms ease opacity;
  }
  .kit-widget-attach__image-delete {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 11px;
    right: 11px;
    z-index: 1;
    width: 14px;
    height: 14px;
    background-color: #78909c;
    opacity: 0;
    border-radius: 100%;
    box-shadow: 0px 0px 0px 7px rgb(255 255 255);
    &:hover {
      cursor: pointer;
      box-shadow: 0px 0px 0px 7px rgb(242 244 245 / 88%);
    }
  }
</style>
