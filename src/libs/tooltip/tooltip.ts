/* Forked from https://github.com/Akryum/v-tooltip */

import Popper from 'popper.js';
import i18n from '@/i18n';
// @ts-expect-error хз почему
import { directive, getOptions } from '@/directives/tooltip';
// @ts-expect-error хз почему
import { addClasses, removeClasses, supportsPassive } from './utils';
import { copyToClipboard } from '@/utils/clipboard';

const DEFAULT_OPTIONS = {
  container: false,
  delay: 0,
  html: false,
  placement: 'top',
  title: '',
  template:
    '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
  trigger: 'hover focus',
  offset: 0,
};

const openTooltips: Tooltip[] = [];
// Опции могут быть пипец каким огромным набором всякой херни и делать его не ANY - можно охренеть
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TooltipOptionsAny = any;

export default class Tooltip {
  /**
   * Create a new Tooltip.js instance
   * @class Tooltip
   * @param {HTMLElement} reference - The DOM node used as reference of the tooltip (it can be a jQuery element).
   * @param {Object} options
   * @param {String} options.placement=bottom
   *      Placement of the popper accepted values: `top(-start, -end), right(-start, -end), bottom(-start, -end),
   *      left(-start, -end)`
   * @param {HTMLElement|String|false} options.container=false - Append the tooltip to a specific element.
   * @param {Number|Object} options.delay=0
   *      Delay showing and hiding the tooltip (ms) - does not apply to manual trigger type.
   *      If a number is supplied, delay is applied to both hide/show.
   *      Object structure is: `{ show: 500, hide: 100 }`
   * @param {Boolean} options.html=false - Insert HTML into the tooltip. If false, the content will inserted with `innerText`.
   * @param {String|PlacementFunction} options.placement='top' - One of the allowed placements, or a function returning one of them.
   * @param {String} [options.template='<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>']
   *      Base HTML to used when creating the tooltip.
   *      The tooltip's `title` will be injected into the `.tooltip-inner` or `.tooltip__inner`.
   *      `.tooltip-arrow` or `.tooltip__arrow` will become the tooltip's arrow.
   *      The outermost wrapper element should have the `.tooltip` class.
   * @param {String|HTMLElement|TitleFunction} options.title='' - Default title value if `title` attribute isn't present.
   * @param {String} [options.trigger='hover focus']
   *      How tooltip is triggered - click, hover, focus, manual.
   *      You may pass multiple triggers; separate them with a space. `manual` cannot be combined with any other trigger.
   * @param {HTMLElement} options.boundariesElement
   *      The element used as boundaries for the tooltip. For more information refer to Popper.js'
   *      [boundariesElement docs](https://popper.js.org/popper-documentation.html)
   * @param {Number|String} options.offset=0 - Offset of the tooltip relative to its reference. For more information refer to Popper.js'
   *      [offset docs](https://popper.js.org/popper-documentation.html)
   * @param {Object} options.popperOptions={} - Popper options, will be passed directly to popper instance. For more information refer to Popper.js'
   *      [options docs](https://popper.js.org/popper-documentation.html)
   * @return {Object} instance - The generated tooltip instance
   */
  reference: HTMLElement;
  options: Record<string, TooltipOptionsAny>;
  popperInstance!: Popper;
  _isOpen: boolean;
  _classes!: string;
  _tooltipNode!: HTMLElement | null;
  _isDisposed!: boolean;
  _enableDocumentTouch!: boolean;
  $_originalTitle!: string;
  asyncContent!: boolean;
  _disposeTimer!: number;
  _scheduleTimer!: number;
  // @ts-expect-error хз почему
  _events: { func; event }[] = [];
  _copyBtnNode!: HTMLElement | null;

  //
  // Public methods
  //

  // @ts-expect-error хз почему
  constructor(reference, options) {
    // apply user options over default ones
    options = { ...DEFAULT_OPTIONS, ...options };

    reference.jquery && (reference = reference[0]);

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);

    // cache reference and options
    this.reference = reference;
    this.options = options;

    // set initial state
    this._isOpen = false;

    this._init();
  }

  /**
   * Reveals an element's tooltip. This is considered a "manual" triggering of the tooltip.
   * Tooltips with zero-length titles are never displayed.
   * @method Tooltip#show
   * @memberof Tooltip
   */
  show(): void {
    this._show(this.reference, this.options);
  }

  /**
   * Hides an element’s tooltip. This is considered a “manual” triggering of the tooltip.
   * @method Tooltip#hide
   * @memberof Tooltip
   */
  hide(): void {
    this._hide();
  }

  /**
   * Hides and destroys an element’s tooltip.
   * @method Tooltip#dispose
   * @memberof Tooltip
   */
  dispose(): void {
    this._dispose();
  }

  /**
   * Toggles an element’s tooltip. This is considered a “manual” triggering of the tooltip.
   * @method Tooltip#toggle
   * @memberof Tooltip
   */
  toggle(): void {
    if (this._isOpen) {
      return this.hide();
    } else {
      return this.show();
    }
  }

  setClasses(classes: TODO_ANY): void {
    this._classes = classes;
  }

  setContent(content: TODO_ANY): void {
    this.options.title = content;
    if (this._tooltipNode) {
      this._setContent(content, this.options);
    }
  }

  //
  // Private methods
  //

  setOptions(options: TODO_ANY): void {
    let classesUpdated = false;
    const overflowText = options.overflow || false;
    const classes = (options && options.classes) || directive.options.defaultClass;

    if (this._classes !== classes) {
      this.setClasses(classes);
      classesUpdated = true;
    }

    options = getOptions(options);

    let needPopperUpdate = false;
    let needRestart = false;

    if (overflowText) {
      this.options.oveflow = overflowText;
    }

    if (this.options.offset !== options.offset || this.options.placement !== options.placement) {
      needPopperUpdate = true;
    }

    if (
      this.options.template !== options.template ||
      this.options.trigger !== options.trigger ||
      this.options.container !== options.container ||
      classesUpdated
    ) {
      needRestart = true;
    }

    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        this.options[key] = options[key];
      }
    }

    if (this._tooltipNode) {
      if (needRestart) {
        const isOpen = this._isOpen;

        this.dispose();
        this._init();

        if (isOpen) {
          this.show();
        }
      } else if (needPopperUpdate) {
        this.popperInstance.update();
      }
    }
  }

  _init(): void {
    // get events list
    let events = typeof this.options.trigger === 'string' ? this.options.trigger.split(' ') : [];
    this._isDisposed = false;
    this._enableDocumentTouch = events.indexOf('manual') === -1;

    events = events.filter((trigger) => ['click', 'hover', 'focus'].indexOf(trigger) !== -1);

    // set event listeners
    this._setEventListeners(this.reference, events, this.options);

    // title attribute
    // @ts-expect-error хз почему
    this.$_originalTitle = this.reference.getAttribute('title');
    this.reference.removeAttribute('title');
    this.reference.setAttribute('data-original-title', this.$_originalTitle);
  }

  /**
   * Creates a new tooltip node
   * @memberof Tooltip
   * @private
   * @param {HTMLElement} reference
   * @param {String} template
   * @param {String|HTMLElement|TitleFunction} title
   * @param {Boolean} allowHtml
   * @return {HTMLelement} tooltipNode
   */
  _create(reference: TODO_ANY, template: TODO_ANY): HTMLElement {
    // create tooltip element
    const tooltipGenerator = window.document.createElement('div');
    tooltipGenerator.innerHTML = template.trim();
    const tooltipNode = tooltipGenerator.childNodes[0] as HTMLElement;

    // add unique ID to our tooltip (needed for accessibility reasons)
    tooltipNode.id = `tooltip_${Math.random().toString(36).substr(2, 10)}`;

    // Initially hide the tooltip
    // The attribute will be switched in a next frame so
    // CSS transitions can play
    tooltipNode.setAttribute('aria-hidden', 'true');

    if (this.options.autoHide && !this.options.copy && this.options.trigger.indexOf('hover') !== -1) {
      tooltipNode.addEventListener('mouseenter', this.hide);
      tooltipNode.addEventListener('click', this.hide);
    }

    // Если на тултип навели мышь, отменяем заланированное скрытие тултипа
    if (this.options.copy === true && this.options.trigger.indexOf('hover') !== -1) {
      this._cancelHide = this._cancelHide.bind(this);
      tooltipNode.addEventListener('mouseenter', this._cancelHide);
    }

    this._clickOutSide = this._clickOutSide.bind(this);
    document.addEventListener('mousedown', this._clickOutSide);
    // return the generated tooltip node
    return tooltipNode;
  }

  // Отмена заланированного закрытия тултипа
  _cancelHide(): void {
    clearTimeout(this._scheduleTimer);
    this._repeatSheduleHide = this._repeatSheduleHide.bind(this);
    this._tooltipNode?.addEventListener('mouseleave', this._repeatSheduleHide);
  }

  // Повторно вызывает процедуру закрытия тултипа
  _repeatSheduleHide(e: TODO_ANY): void {
    this._scheduleHide(this.reference, this.options.delay, this.options, e);
  }

  // Закрывает тултип, если событие mousedown было не по тултипу и не по целевому эл-ту
  _clickOutSide(e: TODO_ANY): void {
    if (this._tooltipNode?.contains(e.target) === false && this.reference?.contains(e.target) === false) {
      this.hide();
    }
  }

  _copyContent(): void {
    try {
      const isCopied = copyToClipboard(this.options?.copyValue || this._tooltipNode?.innerText || '');
      if (isCopied) {
        const msg: string = this.options.vue.$t('utils.copy_btn.copied_success');
        this.options.vue.$message.success(msg);
      }
    } catch (e) {
      console.warn(e);
    }
  }

  _createCopyBtn(): HTMLElement | null {
    if (this.options.copy) {
      this._copyBtnNode = document.createElement('span');
      this._copyBtnNode.classList.add('tooltip-copy');
      this._copyBtnNode.setAttribute('title', i18n.global.t('utils.copy_btn.copy') as string);

      this._copyContent = this._copyContent.bind(this);
      this._copyBtnNode.addEventListener('click', this._copyContent);
      return this._copyBtnNode;
    }

    return null;
  }

  _setContent(content: TODO_ANY, options: TODO_ANY): void {
    this.asyncContent = false;
    this._applyContent(content, options).then(() => {
      this.popperInstance.update();
    });
  }

  _applyContent(title: TODO_ANY, options: TODO_ANY): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const allowHtml = options.html;
      const rootNode = this._tooltipNode;
      if (!rootNode) return;
      const titleNode = rootNode.querySelector(this.options.innerSelector);
      if (title.nodeType === 1) {
        // if title is a node, append it only if allowHtml is true
        if (allowHtml) {
          while (titleNode.firstChild) {
            titleNode.removeChild(titleNode.firstChild);
          }
          titleNode.appendChild(title);
        }
      } else if (typeof title === 'function') {
        // if title is a function, call it and set innerText or innerHtml depending by `allowHtml` value
        const result = title();
        if (result && typeof result.then === 'function') {
          this.asyncContent = true;
          options.loadingClass && addClasses(rootNode, options.loadingClass);
          if (options.loadingContent) {
            this._applyContent(options.loadingContent, options);
          }
          result
            .then((asyncResult: TODO_ANY) => {
              options.loadingClass && removeClasses(rootNode, options.loadingClass);
              return this._applyContent(asyncResult, options);
            })
            .then(resolve)
            .catch(reject);
        } else {
          this._applyContent(result, options).then(resolve).catch(reject);
        }
        return;
      } else {
        // if it's just a simple text, set innerText or innerHtml depending by `allowHtml` value
        allowHtml ? (titleNode.innerHTML = title) : (titleNode.innerText = title);
      }

      if (options.copy) {
        titleNode.appendChild(this._createCopyBtn());
      }

      resolve(true);
    });
  }

  _show(reference: TODO_ANY, options: TODO_ANY): this | undefined {
    if (this._isOpen) return;
    // Не показывает tooltip, если в опциях директивы или ч/з setOptions передан объект со свойством overflow: true
    const overflowWidth = reference.clientWidth - reference.scrollWidth >= 0;
    const overflowHeight = reference.clientHeight - reference.scrollHeight >= 0;

    if (options.overflow && overflowWidth && overflowHeight) {
      return;
    }

    if (options && typeof options.container === 'string') {
      const container = document.querySelector(options.container);
      if (!container) return;
    }

    clearTimeout(this._disposeTimer);

    options = { ...options };
    delete options.offset;

    let updateClasses = true;
    if (this._tooltipNode) {
      addClasses(this._tooltipNode, this._classes);
      updateClasses = false;
    }

    const result = this._ensureShown(reference, options);

    if (updateClasses && this._tooltipNode) {
      // тут сломалось при использовании в joint
      addClasses(this._tooltipNode, this._classes);
    }

    addClasses(reference, ['v-tooltip-open']);

    return result;
  }

  _ensureShown(reference: TODO_ANY, options: TODO_ANY): this {
    // don't show if it's already visible
    if (this._isOpen) {
      return this;
    }
    this._isOpen = true;

    openTooltips.push(this);

    // if the tooltipNode already exists, just show it
    if (this._tooltipNode) {
      this._tooltipNode.style.display = '';
      this._tooltipNode.setAttribute('aria-hidden', 'false');
      this.popperInstance.enableEventListeners();
      this.popperInstance.update();
      if (this.asyncContent) {
        this._setContent(options.title, options);
      }
      return this;
    }

    // get title
    const title = reference.getAttribute('title') || options.title;

    // don't show tooltip if no title is defined
    if (!title) {
      return this;
    }

    // create tooltip node
    const tooltipNode = this._create(reference, options.template);
    this._tooltipNode = tooltipNode;

    // Add `aria-describedby` to our reference element for accessibility reasons
    reference.setAttribute('aria-describedby', tooltipNode.id);

    // append tooltip to container
    const container = this._findContainer(options.container, reference);

    this._append(tooltipNode, container);

    const popperOptions = {
      ...options.popperOptions,
      placement: options.placement,
    };

    popperOptions.modifiers = {
      ...popperOptions.modifiers,
      arrow: {
        element: this.options.arrowSelector,
      },
    };

    if (options.boundariesElement) {
      popperOptions.modifiers.preventOverflow = {
        boundariesElement: options.boundariesElement,
      };
    }

    this.popperInstance = new Popper(reference, tooltipNode, popperOptions);

    this._setContent(title, options);

    // Fix position
    requestAnimationFrame(() => {
      if (!this._isDisposed && this.popperInstance) {
        this.popperInstance.update();

        // Show the tooltip
        requestAnimationFrame(() => {
          if (!this._isDisposed) {
            this._isOpen && tooltipNode.setAttribute('aria-hidden', 'false');
          } else {
            this.dispose();
          }
        });
      } else {
        this.dispose();
      }
    });

    return this;
  }

  _noLongerOpen(): void {
    const index = openTooltips.indexOf(this);
    if (index !== -1) {
      openTooltips.splice(index, 1);
    }
  }

  _hide(reference?: TODO_ANY, options?: TODO_ANY): this {
    // don't hide if it's already hidden
    if (!this._isOpen) {
      return this;
    }

    this._isOpen = false;
    this._noLongerOpen();

    // hide tooltipNode
    // @ts-expect-error хз почему
    this._tooltipNode.style.display = 'none';
    this._tooltipNode?.setAttribute('aria-hidden', 'true');

    this.popperInstance.disableEventListeners();

    clearTimeout(this._disposeTimer);
    const disposeTime = directive.options.disposeTimeout;
    if (disposeTime !== null) {
      this._disposeTimer = setTimeout(() => {
        if (this._tooltipNode) {
          this._tooltipNode.removeEventListener('mouseenter', this.hide);
          this._tooltipNode.removeEventListener('click', this.hide);

          document.removeEventListener('mousedown', this._clickOutSide);

          if (this._copyBtnNode) {
            this._copyBtnNode.removeEventListener('click', this._copyContent);
            this._copyBtnNode = null;
          }

          if (this._tooltipNode) {
            this._tooltipNode.removeEventListener('mouseenter', this._cancelHide);
            this._tooltipNode.removeEventListener('mouseleave', this._repeatSheduleHide);
          }
          // Don't remove popper instance, just the HTML element
          this._removeTooltipNode();
        }
      }, disposeTime);
    }

    removeClasses(this.reference, ['v-tooltip-open']);

    return this;
  }

  _removeTooltipNode(): void {
    if (!this._tooltipNode) return;
    const parentNode = this._tooltipNode.parentNode;
    if (parentNode) {
      parentNode.removeChild(this._tooltipNode);
      this.reference.removeAttribute('aria-describedby');
    }
    this._tooltipNode = null;
  }

  _dispose(): this {
    this._isDisposed = true;

    this.reference.removeAttribute('data-original-title');
    if (this.$_originalTitle) {
      this.reference.setAttribute('title', this.$_originalTitle);
    }

    // remove event listeners first to prevent any unexpected behaviour
    this._events.forEach(({ func, event }) => {
      this.reference.removeEventListener(event, func);
    });
    this._events = [];

    if (this._tooltipNode) {
      this._hide();

      this._tooltipNode.removeEventListener('mouseenter', this.hide);
      this._tooltipNode.removeEventListener('click', this.hide);

      // destroy instance
      this.popperInstance.destroy();

      // destroy tooltipNode if removeOnDestroy is not set, as popperInstance.destroy() already removes the element
      if (!this.popperInstance.options.removeOnDestroy) {
        this._removeTooltipNode();
      }
    } else {
      this._noLongerOpen();
    }
    return this;
  }

  _findContainer(container: TODO_ANY, reference: TODO_ANY): TODO_ANY {
    // if container is a query, get the relative element
    if (typeof container === 'string') {
      container = window.document.querySelector(container);
    } else if (container === false) {
      // if container is `false`, set it to reference parent
      container = reference.parentNode;
    }
    return container;
  }

  /**
   * Append tooltip to container
   * @memberof Tooltip
   * @private
   * @param {HTMLElement} tooltipNode
   * @param {HTMLElement|String|false} container
   */
  _append(tooltipNode: TODO_ANY, container: TODO_ANY): void {
    container.appendChild(tooltipNode);
  }

  _setEventListeners(reference: TODO_ANY, events: TODO_ANY, options: TODO_ANY): void {
    const directEvents: string[] = [];
    const oppositeEvents: string[] = [];

    events.forEach((event: TODO_ANY) => {
      switch (event) {
        case 'hover':
          directEvents.push('mouseenter');
          oppositeEvents.push('mouseleave');
          if (this.options.hideOnTargetClick) oppositeEvents.push('click');
          break;
        case 'focus':
          directEvents.push('focus');
          oppositeEvents.push('blur');
          if (this.options.hideOnTargetClick) oppositeEvents.push('click');
          break;
        case 'click':
          directEvents.push('click');
          oppositeEvents.push('click');
          break;
      }
    });

    // schedule show tooltip
    directEvents.forEach((event) => {
      const func = (evt: TODO_ANY): void => {
        if (this._isOpen === true) {
          return;
        }
        evt.usedByTooltip = true;
        this._scheduleShow(reference, options.delay, options, evt);
      };
      this._events.push({ event, func });
      reference.addEventListener(event, func);
    });

    // schedule hide tooltip
    oppositeEvents.forEach((event) => {
      const func = (evt: TODO_ANY): void => {
        if (evt.usedByTooltip === true) {
          return;
        }
        this._scheduleHide(reference, options.delay, options, evt);
      };
      this._events.push({ event, func });
      reference.addEventListener(event, func);
    });
  }

  _onDocumentTouch(event: TODO_ANY): void {
    if (this._enableDocumentTouch) {
      this._scheduleHide(this.reference, this.options.delay, this.options, event);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _scheduleShow(reference: TODO_ANY, delay: TODO_ANY, options: TODO_ANY, evt?: TODO_ANY): void {
    // defaults to 0
    const computedDelay = (delay && delay.show) || delay || 0;
    clearTimeout(this._scheduleTimer);
    this._scheduleTimer = window.setTimeout(() => this._show(reference, options), computedDelay);
  }

  _scheduleHide(reference: TODO_ANY, delay: TODO_ANY, options: TODO_ANY, evt: TODO_ANY): void {
    let computedDelay = (delay && delay.hide) || delay || 0;
    // Если включено копирование, то мин. задержка 300 мс
    computedDelay =
      this.options.copy && (typeof computedDelay === 'object' || computedDelay === 0) ? 300 : computedDelay;

    clearTimeout(this._scheduleTimer);
    this._scheduleTimer = window.setTimeout(() => {
      if (this._isOpen === false) {
        return;
      }
      if (!document.body.contains(this._tooltipNode)) {
        return;
      }

      // if we are hiding because of a mouseleave, we must check that the new
      // reference isn't the tooltip, because in this case we don't want to hide it
      if (evt.type === 'mouseleave') {
        const isSet = this._setTooltipNodeEvent(evt, reference, delay, options);

        // if we set the new event, don't hide the tooltip yet
        // the new event will take care to hide it if necessary
        if (isSet) {
          return;
        }
      }

      this._hide(reference, options);
    }, computedDelay);
  }

  _setTooltipNodeEvent = (evt: TODO_ANY, reference: TODO_ANY, delay: TODO_ANY, options: TODO_ANY): boolean => {
    const relatedreference = evt.relatedreference || evt.toElement || evt.relatedTarget;

    const callback = (evt2: TODO_ANY): void => {
      const relatedreference2 = evt2.relatedreference || evt2.toElement || evt2.relatedTarget;

      // Remove event listener after call
      this._tooltipNode?.removeEventListener(evt.type, callback);

      // If the new reference is not the reference element
      if (!reference.contains(relatedreference2)) {
        // Schedule to hide tooltip
        this._scheduleHide(reference, options.delay, options, evt2);
      }
    };

    if (this._tooltipNode?.contains(relatedreference)) {
      // listen to mouseleave on the tooltip element to be able to hide the tooltip
      this._tooltipNode.addEventListener(evt.type, callback);
      return true;
    }

    return false;
  };
}

// Hide tooltips on touch devices
if (typeof document !== 'undefined') {
  document.addEventListener(
    'touchstart',
    (event) => {
      for (let i = 0; i < openTooltips.length; i++) {
        openTooltips[i]._onDocumentTouch(event);
      }
    },
    supportsPassive
      ? {
          passive: true,
          capture: true,
        }
      : true
  );
}
