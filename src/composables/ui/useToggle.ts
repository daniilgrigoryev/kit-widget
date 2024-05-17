import { ref } from 'vue';

import { Ref } from '@vue/reactivity';

type UseToggleReturnParams = { toggleValue: Ref<boolean>; toggle: () => void };

export default function useToggle(): UseToggleReturnParams {
  const toggleValue = ref(false);
  const toggle = (): void => {
    toggleValue.value = !toggleValue.value;
  };

  return {
    toggleValue,
    toggle,
  };
}
