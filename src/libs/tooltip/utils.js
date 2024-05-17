// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
let SVGAnimatedString = function () {
  console.log('SVGAnimatedString');
};

if (typeof window !== 'undefined') {
  SVGAnimatedString = window.SVGAnimatedString;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function convertToArray(value) {
  if (typeof value === 'string') {
    value = value.split(' ');
  }
  return value || [];
}

/**
 * Add classes to an element.
 * This method checks to ensure that the classes don't already exist before adding them.
 * It uses el.className rather than classList in order to be IE friendly.
 * @param {object} el - The element to add the classes to.
 * @param {classes} string - List of space separated classes to be added to the element.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function addClasses(el, classes) {
  const newClasses = convertToArray(classes);
  let classList;

  if (el.className instanceof SVGAnimatedString) {
    classList = convertToArray(el.className.baseVal);
  } else {
    classList = convertToArray(el.className);
  }
  newClasses.forEach((newClass) => {
    if (classList.indexOf(newClass) === -1) {
      classList.push(newClass);
    }
  });
  if (el instanceof SVGElement) {
    el.setAttribute('class', classList.join(' '));
  } else {
    el.className = classList.join(' ');
  }
}

/**
 * Remove classes from an element.
 * It uses el.className rather than classList in order to be IE friendly.
 * @export
 * @param {any} el The element to remove the classes from.
 * @param {any} classes List of space separated classes to be removed from the element.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function removeClasses(el, classes) {
  const newClasses = convertToArray(classes);
  let classList;
  if (el.className instanceof SVGAnimatedString) {
    classList = convertToArray(el.className.baseVal);
  } else {
    classList = convertToArray(el.className);
  }
  newClasses.forEach((newClass) => {
    const index = classList.indexOf(newClass);
    if (index !== -1) {
      classList.splice(index, 1);
    }
  });
  if (el instanceof SVGElement) {
    el.setAttribute('class', classList.join(' '));
  } else {
    el.className = classList.join(' ');
  }
}

export let supportsPassive = false;

if (typeof window !== 'undefined') {
  supportsPassive = false;
  try {
    // eslint-disable-next-line no-var
    var opts = Object.defineProperty({}, 'passive', {
      // eslint-disable-next-line getter-return
      get() {
        supportsPassive = true;
      },
    });
    window.addEventListener('test', null, opts);
  } catch (e) {
    console.warn(e);
  }
}
