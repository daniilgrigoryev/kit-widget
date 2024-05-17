import { ref } from 'vue';
import { Ref } from '@vue/reactivity';

type UseFocusReturnParams<T> = { elementRef: Ref<T | undefined>; focus: () => void };

export default function useFocus<T extends { focus: () => void }>(
  hook?: (...args: unknown[]) => void
): UseFocusReturnParams<T> {
  const elementRef = ref<T>();

  const focus = (): void => {
    elementRef.value?.focus();
    hook && hook();
  };

  return { elementRef, focus };
}
