import { createStore } from 'vuex';

import root, { RootModule } from './modules/root';
import { RootState } from '@/store/modules/root/state';

const vuexStore = createStore<RootState>(root);

export type Store = RootModule;
export const store = vuexStore as unknown as Store;
