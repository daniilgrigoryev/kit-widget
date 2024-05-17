import { App } from 'vue';
import scrollbar from '@/directives/scrollbar';
// @ts-expect-error нет тайпингов
import { VTooltip } from '@/libs/tooltip';

const registerDirectives = (app: App): void => {
  app.directive('scrollbar', scrollbar).directive('tooltip', VTooltip);
};

export default registerDirectives;
