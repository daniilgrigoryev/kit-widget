import { useStore as useVuex } from 'vuex';
import { Store } from '@/store';
import { computed } from 'vue';
import { ComputedRef } from '@vue/reactivity';

export const useStore = (): Store => {
  return useVuex() as Store;
};

type MappedState<K extends keyof Store['state']> = {
  [x in K]: ComputedRef<Store['state'][x]>;
};

export const useState = <K extends keyof Store['state']>(keys: K[]): MappedState<K> => {
  const store = useStore();
  const keyValuePairs = keys.map((key) => [key, computed(() => store.state[key])]);
  return Object.fromEntries(keyValuePairs);
};

export const useGetters = <K extends keyof Store['getters']>(
  keys: K[]
): Record<K, ComputedRef<Store['getters'][K]>> => {
  const store = useStore();
  const keyValuePairs = keys.map((key) => [key, computed(() => store.getters[key])]);

  return Object.fromEntries(keyValuePairs);
};
