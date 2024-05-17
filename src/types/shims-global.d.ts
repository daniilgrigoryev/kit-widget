import { WidgetParams } from '@/types/KitWidgetTypes';

declare global {
  // Тип для разработки. После завершения работы над задачей этот тип не должен присутствовать в коде
  // eslint-disable-next-line
  type TODO_ANY = any;
  interface Window {
    VoxKitWidget: {
      init(params: WidgetParams): void;
      destroy(): void;
    };
  }
}
