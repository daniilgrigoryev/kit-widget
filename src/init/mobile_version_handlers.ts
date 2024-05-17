if ('virtualKeyboard' in navigator) {
  // @ts-expect-error Some error
  navigator.virtualKeyboard.overlaysContent = true;
}

//хак для сафари https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
//в будущем возможно решение: https://www.bram.us/2021/07/08/the-large-small-and-dynamic-viewports/
export const vhUnits = (): number => {
  const vh = window.innerHeight * 0.01; // Equal to 1% of the height of the initial containing block
  document.documentElement.style.setProperty('--vhw', `${vh}px`);
  return vh;
};

export const disableScrollPageOnMobile = (isOpen: boolean): void => {
  isOpen && currentDevice === 'mobile'
    ? document.body.classList.add('disable-scroll')
    : document.body.classList.remove('disable-scroll');
};
type PlatformType = 'ios' | 'android' | 'blackberry' | 'opera' | 'windows' | 'undefined';
const identifyPlatform = (): PlatformType => {
  let currentPlatform: PlatformType;

  const isIOS = !!navigator.userAgent.match(/iPhone|iPod|iPad/i);
  const isAndroid = !!navigator.userAgent.match(/Android/i);
  const isBlackBerry = !!navigator.userAgent.match(/BlackBerry/i);
  const isOpera = !!navigator.userAgent.match(/Opera Mini/i);
  const isWindows = !!navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);

  if (isIOS) currentPlatform = 'ios';
  else if (isAndroid) currentPlatform = 'android';
  else if (isBlackBerry) currentPlatform = 'blackberry';
  else if (isOpera) currentPlatform = 'opera';
  else if (isWindows) currentPlatform = 'windows';
  else currentPlatform = 'undefined';

  document.body.classList.add(`${currentPlatform}`);
  return currentPlatform;
};
type DeviceType = 'tablet' | 'mobile' | 'desktop';
export const identifyDevice = (): DeviceType => {
  let currentDevice: DeviceType;
  const ua = navigator.userAgent;
  const regExMobile =
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/;

  const regExTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i;

  if (regExTablet.test(ua)) currentDevice = 'tablet';
  else if (regExMobile.test(ua)) currentDevice = 'mobile';
  else currentDevice = 'desktop';

  return currentDevice;
};

type SystemType = 'chrome' | 'safari' | 'firefox' | 'opera' | 'edge' | 'undefined';
const identifySystem = (): SystemType => {
  let currentSystem: SystemType;

  const userAgent = navigator.userAgent.toLowerCase();
  const isChrome = userAgent.match(/chrome|chromium|crios/i);
  const isFirefox = userAgent.match(/firefox|fxios/i);
  const isSafari = userAgent.match(/safari/i);
  const isOpera = userAgent.match(/opr\//i);
  const isEdge = userAgent.match(/edg/i);

  if (isChrome) currentSystem = 'chrome';
  else if (isFirefox) currentSystem = 'firefox';
  else if (isSafari) currentSystem = 'safari';
  else if (isOpera) currentSystem = 'opera';
  else if (isEdge) currentSystem = 'edge';
  else currentSystem = 'undefined';

  document.body.classList.add(`${currentSystem}`);
  return currentSystem;
};

export let currentVhUnits = vhUnits();
export let currentDevice = identifyDevice();
export let currentSystem = identifySystem();
export let currentPlatform = identifyPlatform();

const preventDefault = (e: Event): void => {
  e.preventDefault();
};

export const disableScroll = (): void => {
  document.body.addEventListener('touchmove', preventDefault);
};
export const enableScroll = (): void => {
  document.body.removeEventListener('touchmove', preventDefault);
};

export const isAppropriateDevices = (): boolean => {
  return (
    currentDevice === 'mobile' &&
    currentPlatform === 'ios' &&
    (currentSystem === 'safari' || currentSystem === 'firefox' || currentSystem === 'chrome')
  );
};

// добавляет класс keyboard и запрещает скрол страницы если открыта клавиатура
const handleFocus = (): void => {
  document.body.classList.add('keyboard');
  document.body.classList.remove('no-keyboard');
  const isAppropriate = isAppropriateDevices();
  if (isAppropriate) {
    disableScroll();
    setTimeout(() => {
      window.scrollTo(0, 0); // скролл к низу страницы фиксирует содержимое чата до конца его просматриваемой области
    }, 200);
  }
};

// разрешает скролл станицы при закрытой клавиатуре
export const handleBlur = (): void => {
  const isAppropriate = isAppropriateDevices();
  if (isAppropriate) enableScroll();
  document.body.classList.remove('keyboard');
  document.body.classList.add('no-keyboard');
};
export const initBlurInput = (): void => {
  const editable = document.querySelector('#editable') as HTMLDivElement | null;
  editable?.blur();
};

export const fixVirtualKeyboard = (): void => {
  const editable = document.querySelector('#editable') as HTMLDivElement | null;
  if (editable) {
    editable.addEventListener('focus', handleFocus);
    editable.addEventListener('blur', handleBlur);
  }
};

const preventHideKeyboard = (e: Event): void => {
  const target = e.target as HTMLInputElement;
  const dontDiscardKeyboard = target.closest('.prevent-hide-keyboard');
  dontDiscardKeyboard && e.preventDefault();
};

const preventScale = (e: TouchEvent & { scale: number }): void => {
  currentSystem === 'safari' && currentDevice === 'mobile' && currentPlatform === 'ios' && e.scale !== 1
    ? e.preventDefault()
    : undefined;
};

export const updateDevicesIdentify = (): void => {
  currentVhUnits = vhUnits();
  currentDevice = identifyDevice();
  currentSystem = identifySystem();
  currentPlatform = identifyPlatform();
};

export const touchHandlers = {
  init: () => {
    updateDevicesIdentify();
    window.addEventListener('resize', updateDevicesIdentify);
    window.addEventListener('touchmove', preventScale);
    window.addEventListener('touchend', preventHideKeyboard);
  },
  destroy: () => {
    window.removeEventListener('resize', updateDevicesIdentify);
    window.removeEventListener('touchmove', preventScale);
    window.removeEventListener('touchend', preventHideKeyboard);
  },
};

window.addEventListener('load', touchHandlers.init, { once: true });
