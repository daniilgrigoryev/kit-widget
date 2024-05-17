import { ActionContext, ActionTree } from 'vuex';
import { RootState } from '@/store/modules/root/state';
import { StoreMessage } from '@/types/KitWidgetTypes';
import { Mutations, RootMutationsTypes } from '@/store/modules/root/mutations';

export enum RootActionTypes {
  ADD_MESSAGE = 'ADD_MESSAGE',
}

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(key: K, payload: Parameters<Mutations[K]>[1]): ReturnType<Mutations[K]>;
} & Omit<ActionContext<RootState, RootState>, 'commit'>;

export interface Actions {
  [RootActionTypes.ADD_MESSAGE]({ commit }: AugmentedActionContext, payload: StoreMessage): void;
}

export const actions: ActionTree<RootState, RootState> & Actions = {
  [RootActionTypes.ADD_MESSAGE]({ state, commit }, newMessage) {
    commit(RootMutationsTypes.SET_MESSAGES, [...state.messages, newMessage]);
    if (!state.isChatOpen) {
      commit(RootMutationsTypes.SET_UNREAD_MESSAGES, [...state.unreadMessages, newMessage]);
    }
  },
};
