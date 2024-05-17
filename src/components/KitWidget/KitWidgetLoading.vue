<template lang="pug">
.kit-widget-loading
  .kit-widget-loading__icon(v-if="loadVisibility" :class="{'rotate': loadVisibility}")
    include ../../assets/icons/load_28.svg
  .kit-widget-loading__icon(v-if="loadState === 'completed'")
    include ../../assets/icons/succes_28.svg
  .kit-widget-loading__icon(v-if="errorVisibility")
    include ../../assets/icons/error_28.svg
  .kit-widget-loading__info(:class="loadState")
    .kit-widget-loading__info--title
      span {{loadingTitle}}
    .kit-widget-loading__info--line
      span(:style="{width: `${progressWidth}%`}")
</template>

<script lang="ts">
  import { computed, defineComponent, PropType } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { LoadStateType } from '@/types/KitWidgetTypes';

  export default defineComponent({
    name: 'KitWidgetLoading',
    props: {
      loadState: {
        type: String as PropType<LoadStateType>,
        default: null,
      },
      filesCount: {
        type: Number as PropType<number>,
        default: 0,
      },
      filesTotal: {
        type: Number as PropType<number>,
        default: 0,
      },
    },
    setup(props) {
      const { t } = useI18n();
      const progress = computed(() => Math.round((props.filesCount * 100) / props.filesTotal));

      const loadingTitle = computed(() => {
        const selectedState = props.loadState;
        const selectTitle = {
          uploading: t('loading.title.uploading', { n: props.filesCount, a: props.filesTotal }),
          completed: t('loading.title.completed', { n: props.filesTotal }),
          error: t('loading.title.error'),
          processing: t('loading.title.processing'),
          toManyFiles: t('loading.title.toManyFiles'),
        };
        return selectedState != 'none' ? selectTitle[selectedState] : '';
      });

      const loadVisibility = computed(() => {
        return props.loadState === 'uploading' || props.loadState === 'processing';
      });

      const errorVisibility = computed(() => {
        return props.loadState === 'error' || props.loadState === 'toManyFiles';
      });

      const progressWidth = computed(() => {
        return progress.value > 0 ? progress.value : 100;
      });

      return {
        t,
        loadingTitle,
        loadVisibility,
        errorVisibility,
        progressWidth,
      };
    },
  });
</script>

<style lang="postcss" scoped>
  .rotate {
    animation: rotate 1.5s linear infinite;
  }

  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
  }

  .kit-widget-loading {
    display: flex;
    align-items: center;
    position: absolute;
    z-index: 2;
    width: 100%;
    padding: 7px 22px;
    background: #fff;

    &__icon {
      width: 16px;
      height: 16px;
      margin-right: 10px;
      overflow: hidden;
    }
    &__info {
      &--title span {
        color: var(--gray-60);
        font-size: 14px;
        font-weight: 500;
        line-height: 22px;
        letter-spacing: 0.1px;
      }
      &--line span {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        transition: width 1s linear;
      }

      &.uploading {
        .kit-widget-loading__info--line span {
          background: var(--blue-base);
        }
      }
      &.completed {
        .kit-widget-loading__info--line span {
          background: var(--green-base-50);
        }
        .kit-widget-loading__info--title span {
          color: var(--green-base-50);
        }
      }
      &.error,
      &.toManyFiles {
        .kit-widget-loading__info--line span {
          background: var(--red-base-50);
        }
        .kit-widget-loading__info--title span {
          color: var(--red-base-50);
        }
      }
    }
  }
</style>
