import { DirectiveBinding, ObjectDirective } from 'vue';

// Полифил ResizeObserver, используется потому что нужна поддержка Safari 13
// https://caniuse.com/#feat=resizeobserver

const detectOverflow = (): ((el: HTMLElement, binding: DirectiveBinding) => void) => {
  let prevPadding: number | null = null;

  return function (el: HTMLElement, binding: DirectiveBinding) {
    // TODO создать варианты использования директивы.
    // Указать ее особенности. Например если она навешана на контейнер, дети которого через v-for создаются
    // то директива глючит. Скролл появляется (посредством CSS), а вот JS часть считает будто скролла нет
    // Комментарий Димы: Когда у элемента,  к которому привязана директива, первый ребенок с v-for, в момент привязки директивы, еще может не быть детей, отсюда глюки.
    // Поэтому v-for стоит оборачивать в контейнер
    // <ul v-scroll><div><h1 v-for="key in array">{{key}}</h1></div></ul>

    // TODO избавиться от value === false или value.scroll === false
    // Используется в одном месте (в scModal), определение враппера для дефолт слота
    // Может лучше сделать там v-if + v-else на пропс scroll
    // чем в директиве делать return ?
    // Или надо доработать хуки директивы, чтобы она на value === false или value === true срабатывала
    // и убирала ставила скролл, если необходимо
    if (binding.value === false || (binding.value && binding.value.scroll === false)) return;

    const onUpdate: (...args: unknown[]) => void = binding.value && binding.value.onUpdate;
    const child = el.firstElementChild as HTMLElement;
    // Если у элемента с директивой нет детей,
    // например используется путой v-for или v-if, то ничего не делаем
    if (!child) return;

    const elStyle = (el as OldElement).currentStyle || window.getComputedStyle(el);
    const childStyle = (child && (child as OldElement).currentStyle) || (child && window.getComputedStyle(child));
    const childPaddingRight = childStyle && parseFloat(childStyle.paddingRight);
    const elPaddingRight = elStyle && parseFloat(elStyle.paddingRight);
    // При появлении верт.скроллбара. мы уменьшаем правый паддинг,
    // если после этого уменьшения, получилось, что контент вдруг влез и скроллбар исчез,
    // то для правого паддинга возвращаем его нормальное значение (https://zingaya.atlassian.net/browse/SC-3571)
    const checkScroll = (el: HTMLElement, prevPadding: number): void => {
      if (!(el.clientHeight < el.scrollHeight)) el.style.paddingRight = prevPadding + 'px';
    };

    const betaArg = {
      horizontal: false,
      vertical: false,
    };

    if (el.clientWidth < el.scrollWidth) {
      el.classList.add('h-scroll');
      betaArg.horizontal = true;
    } else {
      el.classList.remove('h-scroll');
      betaArg.horizontal = false;
    }

    if (el.clientHeight < el.scrollHeight) {
      el.classList.add('v-scroll');
      betaArg.vertical = true;

      if (elPaddingRight) {
        if (!prevPadding) prevPadding = elPaddingRight;
        el.style.paddingRight = prevPadding - 10 + 'px';
        checkScroll(el, prevPadding);
      } else if (!elPaddingRight && child) {
        if (!prevPadding) prevPadding = childPaddingRight;
        child.style.paddingRight = prevPadding - 10 + 'px';
        checkScroll(child, prevPadding);
      }

      // onUpdate && onUpdate(true);
    } else {
      el.classList.remove('v-scroll');
      betaArg.vertical = false;

      if (elPaddingRight) {
        if (!prevPadding) prevPadding = elPaddingRight;
        el.style.paddingRight = prevPadding + 'px';
      } else if (child && prevPadding) {
        child.style.paddingRight = prevPadding + 'px';
      }

      // onUpdate && onUpdate(false);
    }

    // Если все работает штатно - то надо убрать упоминание модификатора .beta и убрать закомментированный код типа onUpdate && onUpdate(XXX);
    if (binding.modifiers.beta) {
      // onUpdate && onUpdate(betaArg);
    }
    onUpdate && onUpdate(betaArg);
  };
};

// Вероятно код, использующий этот интерфейс был скопипащен, а новые тайпинги говорят что такого свойства нет.
// Поэтому мы его объявляем, но помним что вероятно этот код стоит изменить, дабы избавиться от OldElement
interface OldElement extends HTMLElement {
  currentStyle: CSSStyleDeclaration;
}

// Так как мы впихиваем в элемент доп поля, то их надо описать
interface ExtendedHTMLElement extends HTMLElement {
  ro?: ResizeObserver;
  detector?: ReturnType<typeof detectOverflow>;
  roChild: Element;
}

const directive: ObjectDirective = {
  beforeMount: function (el: ExtendedHTMLElement, binding) {
    if (binding.value === false || (binding.value && binding.value.scroll === false)) return;

    el.detector = detectOverflow();
    el.classList.add('ui-scrollbar');
    el.detector(el, binding);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    el.ro = new ResizeObserver((entries: ResizeObserverEntry[], observer: ResizeObserver) => {
      el.detector?.(el, binding);
    });

    if (el.firstElementChild) {
      el.roChild = el.firstElementChild;
      el.ro.observe(el.firstElementChild);
    }
  },
  updated: function (el: ExtendedHTMLElement) {
    // Когда на firstElementChild установлен v-if, в момент монтирования мы устанавливаем  el.ro.observe
    // на элемент который в последствии может быть уничтожен, чтобы этого избежать, при обновлении компонента, проверяем
    // соотвествует ли firstElementChild элементу, которым был firstElementChild при монтировании
    if (el.ro && el.detector && el.firstElementChild && el.roChild !== el.firstElementChild) {
      el.roChild = el.firstElementChild;
      el.ro.observe(el.firstElementChild);
    }
  },
  unmounted: function (el: ExtendedHTMLElement, binding) {
    if (binding.value === false || (binding.value && binding.value.scroll === false)) return;

    el.ro?.disconnect();
    delete el.detector;
    delete el.ro;
  },
};

export default directive;
