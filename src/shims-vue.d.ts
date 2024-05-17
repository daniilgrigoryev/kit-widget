/* eslint-disable */
import { WidgetParams } from "@/types/KitWidgetTypes";

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

/*
declare var VoxKitWidget: {
  init(): void;
  destroy(): void;
  _setParams(params: WidgetParams): void;
  _getClientId(): string;
}*/
