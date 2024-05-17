<template lang="pug">
.kit-widget-input(:class="cssClasses")
  input(
    ref="input"
    @focus="focus"
    @blur="toggleFocus(false)"
    @input="onInput"
    v-bind="$attrs"
  )
  .kit-widget-input__label(v-if="label")
    span {{label}}
  transition(name="input-info")
    .kit-widget-input__info(v-if="error")
      span {{error}}
</template>

<script lang="ts">
  import { computed, defineComponent, PropType, reactive } from 'vue';
  import useFocus from '@/composables/ui/useFocus';
  import { InputValidator } from '@/types/UI';

  export default defineComponent({
    inheritAttrs: false,
    name: 'KitWidgetInput',
    components: {},
    props: {
      modelValue: {
        type: String as PropType<string>,
        required: true,
      },
      label: {
        type: String as PropType<string>,
        required: false,
      },
      validator: {
        type: Object as PropType<InputValidator[]>,
        required: false,
      },
    },
    emits: {
      'update:modelValue': (value?: string) => typeof value === 'string',
    },
    setup(props, context) {
      const conditions = reactive({
        isFocused: false,
        hasError: false,
        isDirty: false,
      });

      const cssClasses = computed(() => ({
        'has-focus': conditions.isFocused,
        'has-value': props.modelValue.length > 0,
      }));

      const error = computed(() => {
        const canShowError = conditions.isDirty && !conditions.isFocused;
        if (canShowError && props.validator) {
          return props.validator.find(({ validate }) => !validate(props.modelValue))?.error || '';
        }

        return '';
      });

      const toggleFocus = (isFocused: boolean): void => {
        conditions.isFocused = isFocused;
        if (!conditions.isDirty && !isFocused) {
          conditions.isDirty = true;
        }
      };

      const onInput = (e: InputEvent): void => {
        const value = (e.target as HTMLInputElement).value || '';
        context.emit('update:modelValue', value);
      };

      const { elementRef: input, focus } = useFocus<HTMLInputElement>(() => toggleFocus(true));

      return {
        input,
        focus,
        cssClasses,
        toggleFocus,
        onInput,
        error,
      };
    },
  });
</script>

<style lang="postcss">
  .kit-widget-input {
    position: relative;
    font-size: 14px;

    input {
      width: 100%;
      height: 46px;
      padding-right: 16px;
      padding-left: 12px;
      overflow: hidden;
      background-color: var(--white-base);
      color: var(--gray-90);
      font-size: 16px;
      font-weight: 400;
      line-height: normal;
      white-space: nowrap;
      text-overflow: ellipsis;
      border: 1px solid var(--gray-40);
      border-color: var(--gray-40);
      border-radius: 8px;
      transition: box-shadow 0.2s ease-in-out, border 0.2s ease-in-out;
    }

    span {
      display: inline-block;
      position: relative;
    }

    &__label {
      position: absolute;
      top: 15px;
      bottom: unset;
      left: 8px;
      height: 16px;
      padding: 0 4px;
      color: var(--secondary-default);
      font-size: 16px;
      line-height: 1;
      transition: all 0.2s ease-in-out;
      pointer-events: none;

      &::before {
        content: '';
        position: absolute;
        top: 5px;
        left: 0;
        width: 100%;
        height: 3px;
        background: var(--white-base);
        outline: 1px solid var(--white-base);
      }
    }

    &.has-focus .kit-widget-input__label,
    &.has-value .kit-widget-input__label {
      top: -6px;
      left: 8px;
      font-size: 12px;
      line-height: 1;
    }

    &__info {
      position: absolute;
      bottom: -6px;
      left: 8px;
      height: 12px;
      padding: 0 4px;
      color: var(--red-base);
      font-size: 12px;
      line-height: 1;

      &::before {
        content: '';
        position: absolute;
        top: 4px;
        left: 0;
        width: 100%;
        height: 3px;
        background: var(--white-base);
      }
    }
  }

  .input-info-enter-active,
  .input-info-leave-active {
    opacity: 1;
    transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    transform: scaleY(1);
    transform-origin: center top;
  }

  .input-info-leave-active,
  .input-info-enter-from {
    opacity: 0;
    transform: scaleY(0);
  }
</style>
