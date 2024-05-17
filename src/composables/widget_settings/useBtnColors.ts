import { computed } from 'vue';
import { useState } from '@/composables/useStore';
import { ComputedRef } from '@vue/reactivity';

interface BtnColors {
  mainColor: string;
  secondaryBtnColor: string;
}

export default function useBtnColors(): ComputedRef<BtnColors> {
  const { widgetSettings } = useState(['widgetSettings']);

  return computed(() => ({
    mainColor: widgetSettings.value?.accent_color || '#492e98',
    secondaryBtnColor: widgetSettings.value?.secondary_color || '#ffffff',
  }));
}
