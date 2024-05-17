import { CommitOptions, DispatchOptions, Module, ModuleTree, Store as VuexStore } from 'vuex';
import { getters, RootGetters } from './getters';
import { mutations, Mutations } from './mutations';
import { RootState, state } from './state';
import { actions, Actions } from '@/store/modules/root/actions';

const modules: ModuleTree<RootState> = {};

const root: Module<RootState, RootState> = {
  state,
  getters,
  mutations,
  actions,
  modules,
};

export type RootModule<S = RootState> = Omit<VuexStore<S>, 'getters' | 'commit' | 'dispatch'> & {
  commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
    key: K,
    payload: P,
    options?: CommitOptions
  ): ReturnType<Mutations[K]>;
} & {
  dispatch<K extends keyof Actions>(
    key: K,
    payload?: Parameters<Actions[K]>[1],
    options?: DispatchOptions
  ): ReturnType<Actions[K]>;
} & {
  getters: {
    [K in keyof RootGetters]: ReturnType<RootGetters[K]>;
  };
};

export default root;
