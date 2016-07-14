/* Copyright (c) 2011 David Walsh
 * http://davidwalsh.name/detect-scrollbar-width
 */
export function getScrollbarWidth() {
  const e = document.createElement('div');
  let scrollbar_width = 0;

  e.style.position = 'absolute';
  e.style.top = '-9999px';
  e.style.width = '100px';
  e.style.height = '100px';
  e.style.overflow = 'scroll';
  e.style.msOverflowStyle = 'scrollbar';
  document.body.appendChild(e);
  scrollbar_width = (e.offsetWidth - e.clientWidth);
  document.body.removeChild(e);

  return scrollbar_width;
}

/* Copyright (c) 2015 Lucas Wiener
 * https://github.com/wnr/element-resize-detector
 */
export function isIE() {
  const agent = navigator.userAgent.toLowerCase();
  return agent.indexOf('msie') !== -1 || agent.indexOf('trident') !== -1 || agent.indexOf(' edge/') !== -1;
}

export function addClass(el, classNames) {
  if (el.classList) {
    return classNames.forEach(cl => {
      el.classList.add(cl);
    });
  }
  el.className += ` ${classNames.join(' ')}`;
}

export function removeClass(el, classNames) {
  if (el.classList) {
    return classNames.forEach(cl => {
      el.classList.remove(cl);
    });
  }
  el.className = el.className.replace(new RegExp(`(^|\\b)${classNames.join('|')}(\\b|$)`, 'gi'), ' ');
}

export function transformX(element, x) {
  // element.style.msTransform = `translateX(${x}%)`;
  // element.style.webkitTransform = `translateX(${x}%)`;
  // element.style.transform = `translateX(${x}%)`;
  element.style.transform = `translate3d(${x}%,0,0)`;
}

export function transformY(element, y) {
  // element.style.msTransform = `translateY(${y}%)`;
  // element.style.webkitTransform = `translateY(${y}%)`;
  // element.style.transform = `translateY(${y}%)`;
  element.style.transform = `translateY(0,${y}%,0)`;
}
