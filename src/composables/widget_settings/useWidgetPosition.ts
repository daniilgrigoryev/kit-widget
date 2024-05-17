import { computed, ref } from 'vue';
import { useState } from '@/composables/useStore';
import { ComputedRef } from '@vue/reactivity';

interface WidgetPosition {
  left: string;
  bottom: string;
  right: string;
  alignItems: string;
}

export default function useWidgetPosition(): ComputedRef<WidgetPosition> {
  const { widgetSettings } = useState(['widgetSettings']);

  return computed(() => {
    const { align_right = true, margin_bottom = 20, margin_horizontal = 20 } = widgetSettings.value || {};
    return {
      left: align_right ? 'unset' : margin_horizontal + 'px',
      bottom: margin_bottom ? margin_bottom + 'px' : 20 + 'px',
      right: align_right ? margin_horizontal + 'px' : 'unset',
      alignItems: align_right ? 'flex-end' : 'flex-start',
    };
  });
}
