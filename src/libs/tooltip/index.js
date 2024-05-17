/* eslint-disable @typescript-eslint/no-use-before-define */
import vtooltip, { defaultOptions, state } from '@/directives/tooltip';

export { createTooltip, destroyTooltip } from '@/directives/tooltip';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function install(Vue, options = {}) {
  if (install.installed) return;
  install.installed = true;

  const finalOptions = {};
  Object.assign(finalOptions, defaultOptions, options);

  plugin.options = finalOptions;
  vtooltip.options = finalOptions;

  Vue.directive('tooltip', vtooltip);
}

export const VTooltip = vtooltip;

const plugin = {
  install,

  get enabled() {
    return state.enabled;
  },

  set enabled(value) {
    state.enabled = value;
  },
};

// Auto-install
let GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

export default plugin;
