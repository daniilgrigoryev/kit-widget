const KIT_META_VIEWPORT_ID = 'kit-meta-viewport';
const metaViewportTags: Node[] = [];

const saveAndDeleteMetaViewportTags = (): void => {
  Array.from(document.getElementsByTagName('meta')).forEach((element) => {
    if (element.name === 'viewport') {
      metaViewportTags.push(element.cloneNode());
      element.parentNode?.removeChild(element);
    }
  });
};

const addMetaViewportForMobile = (): void => {
  const metaViewportTag = document.createElement('meta');
  metaViewportTag.id = KIT_META_VIEWPORT_ID;
  metaViewportTag.name = 'viewport';
  metaViewportTag.content = 'width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0';
  document.getElementsByTagName('head')[0].appendChild(metaViewportTag);
};

const restoreOriginalMetaViewportTagsIfNeeded = (): void => {
  for (let i = 0; i < metaViewportTags.length; i++) {
    const metaElement = metaViewportTags.pop();
    if (metaElement) {
      document.getElementsByTagName('head')[0].appendChild(metaElement);
    }
  }
};

export const handleMetaviewportForMobileWidget = (isWidgetOpen: boolean): void => {
  if (window.innerWidth <= 450) {
    if (isWidgetOpen) {
      //ставим метатег для мобильной верстки и сохраняем оригинальные метатеги сайта
      saveAndDeleteMetaViewportTags();
      addMetaViewportForMobile();
    }
  }

  if (!isWidgetOpen) {
    //удаляем наш метатег и восстанавливаем метатеги сайта
    const kitMetaTag = document.querySelector(`#${KIT_META_VIEWPORT_ID}`);
    kitMetaTag?.parentNode?.removeChild(kitMetaTag);
    restoreOriginalMetaViewportTagsIfNeeded();
  }
};
