import { ref } from 'vue';
import { Ref } from '@vue/reactivity';

type UseScrollToBottomReturnParams = { scrollToBottom: () => void; scrollToBottomRef: Ref<HTMLElement | null> };

export default function useScrollToBottom(): UseScrollToBottomReturnParams {
  const scrollToBottomRef = ref<HTMLElement | null>(null);
  const scrollToBottom = (): void => {
    if (scrollToBottomRef.value) {
      scrollToBottomRef.value.scrollTop = scrollToBottomRef.value.scrollHeight;
    }
  };

  return {
    scrollToBottom,
    scrollToBottomRef,
  };
}
