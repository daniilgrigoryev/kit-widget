import { GetterTree } from 'vuex';
import { StoreMessage } from '@/types/KitWidgetTypes';
import { RootState } from '@/store/modules/root/state';

export interface RootGetters {
  unreadMessagesCount: (state: RootState) => number;
  lastUnreadMessage: (state: RootState) => StoreMessage | null;
}

export const getters: GetterTree<RootState, RootState> & RootGetters = {
  unreadMessagesCount: (state) => {
    return state.unreadMessages.length;
  },
  lastUnreadMessage: (state) => {
    const [lastUnreadMessage] = state.unreadMessages.slice(-1);

    return lastUnreadMessage || null;
  },
};
