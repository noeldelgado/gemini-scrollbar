import DPR from 'dpr-change';

/* Copyright (c) 2011 David Walsh
 * http://davidwalsh.name/detect-scrollbar-width
 */
function getScrollbarWidth() {
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
function isIE$1() {
  const agent = navigator.userAgent.toLowerCase();
  return agent.indexOf('msie') !== -1 || agent.indexOf('trident') !== -1 || agent.indexOf(' edge/') !== -1;
}

function addClass(el, classNames) {
  if (el.classList) {
    return classNames.forEach(cl => {
      el.classList.add(cl);
    });
  }
  el.className += ` ${classNames.join(' ')}`;
}

function removeClass(el, classNames) {
  if (el.classList) {
    return classNames.forEach(cl => {
      el.classList.remove(cl);
    });
  }
  el.className = el.className.replace(new RegExp(`(^|\\b)${classNames.join('|')}(\\b|$)`, 'gi'), ' ');
}

const CLASSNAMES = {
  element: 'gm-scrollbar-container',
  verticalScrollbar: 'gm-scrollbar -vertical',
  horizontalScrollbar: 'gm-scrollbar -horizontal',
  thumb: 'thumb',
  view: 'gm-scroll-view',
  autoshow: 'gm-autoshow',
  disable: 'gm-scrollbar-disable-selection',
  prevented: 'gm-prevented',
  resizeTrigger: 'gm-resize-trigger',
};

const isIE = isIE$1();

let SCROLLBAR_WIDTH = 0;

DPR.addEventListener('change', (r) => console.log(r));

class GeminiScrollbar {
  /* Returns the default options.
   * @private
   */
  get _defaults() {
    return {
      element: null,
      autoshow: false,
      createElements: true,
      forceGemini: false,
      onResize: null,
      _createResizeObject: true
    };
  }

  constructor(config = {}) {
    this.opts = Object.assign(this._defaults, config);

    SCROLLBAR_WIDTH = getScrollbarWidth();
    this.DONT_CREATE_GEMINI = ((SCROLLBAR_WIDTH === 0) && (this.opts.forceGemini === false));

    if (this.DONT_CREATE_GEMINI) {
      addClass(this.opts.element, [CLASSNAMES.prevented]);
      return this;
    }

    this._dom = {};
    this._handlers = {};
    this._cursorDown = false;
    this._prevPageX = 0;
    this._prevPageY = 0;

    this._dom.doc = document;
    this._dom.body = document.body;

    if (this.opts.createElements === true) this._createElements();
    else this._cacheElements();

    this._dom.resizeObject = (this.opts._createResizeObject)
      ? this._createResizeTrigger()
      : this.opts.element.querySelector(`.${CLASSNAMES.resizeTrigger}`);

    if (this.opts.autoshow) addClass(this.opts.element, [CLASSNAMES.autoshow]);
    addClass(this.opts.element, [CLASSNAMES.element]);
    addClass(this._dom.view, [CLASSNAMES.view]);
    addClass(this._dom.vscrollbar, CLASSNAMES.verticalScrollbar.split(/\s/));
    addClass(this._dom.hscrollbar, CLASSNAMES.horizontalScrollbar.split(/\s/));
    addClass(this._dom.vthumb, [CLASSNAMES.thumb]);
    addClass(this._dom.hthumb, [CLASSNAMES.thumb]);

    return this._bindEvents().update();
  }

  /*
   * Recalculates the dimensions of the created DOMElements.
   * @public
   * @return GeminiScrollbar
   */
  update() {
    if (this.DONT_CREATE_GEMINI) return this;

    SCROLLBAR_WIDTH = getScrollbarWidth();

    let heightPercentage, widthPercentage;

    this._dom.view.style.width = `${this.opts.element.offsetWidth + SCROLLBAR_WIDTH}px`;
    this._dom.view.style.height = `${this.opts.element.offsetHeight + SCROLLBAR_WIDTH}px`;

    heightPercentage = (this._dom.view.clientHeight * 100 / this._dom.view.scrollHeight);
    widthPercentage = (this._dom.view.clientWidth * 100 / this._dom.view.scrollWidth);

    this._dom.vthumb.style.height = (heightPercentage < 100) ? `${heightPercentage}%` : '';
    this._dom.hthumb.style.width = (widthPercentage < 100) ? `${widthPercentage}%` : '';

    this._scrollHandler();

    return this;
  }

  destroy() {
    if (this._dom.resizeObject) {
      this._dom.resizeObject.contentDocument.defaultView.removeEventListener('resize', this._handlers._resizeHandler);
      this.opts.element.removeChild(this._dom.resizeObject);
    }

    if (this.DONT_CREATE_GEMINI) return this;

    this._unbinEvents();

    removeClass(this.opts.element, [CLASSNAMES.element, CLASSNAMES.autoshow]);

    if (this.opts.createElements === true) this._destroyElements();
    else this._resetElements();

    this._handlers = null;
    this._dom = null;

    return null;
  }

  /* Returns the cached viewElement reference (the main scrolling-box)
   * @public
   * @return {NodeElement} this._dom.view
   */
  getViewElement() {
    return this._dom.view;
  }

  /* @private */
  _createElements() {
    this._dom.view = document.createElement('div');
    this._dom.vscrollbar = document.createElement('div');
    this._dom.vthumb = document.createElement('div');
    this._dom.hscrollbar = document.createElement('div');
    this._dom.hthumb = document.createElement('div');

    while(this.opts.element.childNodes.length > 0) {
      this._dom.view.appendChild(this.opts.element.childNodes[0]);
    }

    this._dom.vscrollbar.appendChild(this._dom.vthumb);
    this._dom.hscrollbar.appendChild(this._dom.hthumb);

    this.opts.element.appendChild(this._dom.vscrollbar);
    this.opts.element.appendChild(this._dom.hscrollbar);
    this.opts.element.appendChild(this._dom.view);
  }

    /* @private */
  _cacheElements() {
    this._dom.view = this.opts.element.querySelector(`.${CLASSNAMES.view}`);
    this._dom.vscrollbar = this.opts.element.querySelector(`.${CLASSNAMES.verticalScrollbar.split(' ').join('.')}`);
    this._dom.vthumb = this._dom.vscrollbar.querySelector(`.${CLASSNAMES.thumb}`);
    this._dom.hscrollbar = this.opts.element.querySelector(`.${CLASSNAMES.horizontalScrollbar.split(' ').join('.')}`);
    this._dom.hthumb = this._dom.hscrollbar.querySelector(`.${CLASSNAMES.thumb}`);
  }

  _destroyElements() {
    this.opts.element.removeChild(this._dom.vscrollbar);
    this.opts.element.removeChild(this._dom.hscrollbar);
    while(this._dom.view.childNodes.length > 0) {
      this.opts.element.appendChild(this._dom.view.childNodes[0]);
    }
    this.opts.element.removeChild(this._dom.view);
  }

  _resetElements() {
    this._dom.view.style.width = '';
    this._dom.view.style.height = '';
    this._dom.vscrollbar.style.display = 'none';
    this._dom.hscrollbar.style.display = 'none';
   }

  _createResizeTrigger() {
    // const _this = this;
    // this._handlers._resizeHandler = this._resizeHandler.bind(this);

    const obj = document.createElement('object');
    addClass(obj, [CLASSNAMES.resizeTrigger]);
    obj.type = 'text/html';
    // obj.onload = function () {
    //   obj.contentDocument.defaultView.addEventListener('resize', _this._handlers._resizeHandler);
    // };

    //IE: Does not like that this happens before, even if it is also added after.
    if (!isIE) {
      obj.data = 'about:blank';
    }

    this.opts.element.appendChild(obj);

    //IE: This must occur after adding the object to the DOM.
    if (isIE) {
      obj.data = 'about:blank';
    }

    // this._dom.resizeObject = obj;
    return obj;
  }

  // _bindResizeEvent() {
  // }

  /* @private */
  _bindEvents() {
    this._handlers._scrollHandler = this._scrollHandler.bind(this);

    this._handlers._clickVerticalTrackHandler = this._clickVerticalTrackHandler.bind(this);
    this._handlers._clickHorizontalTrackHandler = this._clickHorizontalTrackHandler.bind(this);

    this._handlers._clickVerticalThumbHandler = this._clickVerticalThumbHandler.bind(this);
    this._handlers._clickHorizontalThumbHandler = this._clickHorizontalThumbHandler.bind(this);

    this._handlers._mouseUpDocumentHandler = this._mouseUpDocumentHandler.bind(this);
    this._handlers._mouseMoveDocumentHandler = this._mouseMoveDocumentHandler.bind(this);

    this._handlers._resizeHandler = this._resizeHandler.bind(this);

    this._dom.view.addEventListener('scroll', this._handlers._scrollHandler);

    this._dom.vscrollbar.addEventListener('mousedown', this._handlers._clickVerticalTrackHandler);
    this._dom.hscrollbar.addEventListener('mousedown', this._handlers._clickHorizontalTrackHandler);

    this._dom.vthumb.addEventListener('mousedown', this._handlers._clickVerticalThumbHandler);
    this._dom.hthumb.addEventListener('mousedown', this._handlers._clickHorizontalThumbHandler);

    this._dom.doc.addEventListener('mouseup', this._handlers._mouseUpDocumentHandler);

    // this._dom.resizeObject.onload = function () {
    //   this._dom.resizeObject.contentDocument.defaultView.addEventListener('resize', _this._handlers._resizeHandler);
    // }

    this._dom.resizeObject.contentDocument.defaultView.addEventListener('resize', this._handlers._resizeHandler);

    return this;
  }

  _unbinEvents() {
    this._dom.view.removeEventListener('scroll', this._handlers._scrollHandler);

    this._dom.vscrollbar.removeEventListener('mousedown', this._handlers._clickVerticalTrackHandler);
    this._dom.hscrollbar.removeEventListener('mousedown', this._handlers._clickHorizontalTrackHandler);

    this._dom.vthumb.removeEventListener('mousedown', this._handlers._clickVerticalThumbHandler);
    this._dom.hthumb.removeEventListener('mousedown', this._handlers._clickHorizontalThumbHandler);

    this._dom.doc.removeEventListener('mouseup', this._handlers._mouseUpDocumentHandler);
    this._dom.doc.removeEventListener('mousemove', this._handlers._mouseMoveDocumentHandler);

    return this;
  }

  /* @private */
  _scrollHandler() {
    const viewElement = this._dom.view;
    const y = ((viewElement.scrollTop * 100) / viewElement.clientHeight);
    const x = ((viewElement.scrollLeft * 100) / viewElement.clientWidth);

    // utils.transformX(this._dom.hthumb, x);
    // utils.transformY(this._dom.vthumb, y);
    this._dom.hthumb.style.transform = `translate3d(${x}%,0,0)`;
    this._dom.vthumb.style.transform = `translate3d(0,${y}%,0)`;
  }

  /* @private */
  _resizeHandler() {
    this.update();
    if (typeof this.opts.onResize === 'function') this.opts.onResize();
  }

  /* @private */
  _clickVerticalTrackHandler(e) {
    const offset = Math.abs(e.target.getBoundingClientRect().top - e.clientY);
    const thumbHalf = (this._dom.vthumb.offsetHeight / 2);
    const thumbPositionPercentage = ((offset - thumbHalf) * 100 / this._dom.vscrollbar.offsetHeight);
    this._dom.view.scrollTop = (thumbPositionPercentage * this._dom.view.scrollHeight / 100);
  }

  /* @private */
  _clickHorizontalTrackHandler(e) {
    const offset = Math.abs(e.target.getBoundingClientRect().left - e.clientX);
    const thumbHalf = (this._dom.hthumb.offsetWidth / 2);
    const thumbPositionPercentage = ((offset - thumbHalf) * 100 / this._dom.hscrollbar.offsetWidth);
    this._dom.view.scrollLeft = (thumbPositionPercentage * this._dom.view.scrollWidth / 100);
  }

  /* @private */
  _clickVerticalThumbHandler(e) {
    this._startDrag(e);
    this._prevPageY = (e.currentTarget.offsetHeight - (e.clientY - e.currentTarget.getBoundingClientRect().top));
  }

  /* @private */
  _clickHorizontalThumbHandler(e) {
    this._startDrag(e);
    this._prevPageX = (e.currentTarget.offsetWidth - (e.clientX - e.currentTarget.getBoundingClientRect().left));
  }

  /* @private */
  _startDrag(e) {
    e.stopImmediatePropagation();
    this._cursorDown = true;
    addClass(this._dom.body, [CLASSNAMES.disable]);
    this._dom.doc.addEventListener('mousemove', this._handlers._mouseMoveDocumentHandler);
    this._dom.doc.onselectstart = function() {return false;};
  }

  /* @private */
  _mouseUpDocumentHandler() {
    this._cursorDown = false;
    this._prevPageX = this._prevPageY = 0;
    removeClass(this._dom.body, [CLASSNAMES.disable]);
    this._dom.doc.removeEventListener('mousemove', this._handlers._mouseMoveDocumentHandler);
    this._dom.doc.onselectstart = null;
  }

  /* @private */
  _mouseMoveDocumentHandler(e) {
    if (this._cursorDown === false) return void 0;

    let offset, thumbClickPosition, thumbPositionPercentage;
    if (this._prevPageY) {
      offset = ((this._dom.vscrollbar.getBoundingClientRect().top - e.clientY) * -1);
      thumbClickPosition = (this._dom.vthumb.offsetHeight - this._prevPageY);
      thumbPositionPercentage = ((offset - thumbClickPosition) * 100 / this._dom.vscrollbar.offsetHeight);
      this._dom.view.scrollTop = (thumbPositionPercentage * this._dom.view.scrollHeight / 100);
    } else if (this._prevPageX) {
      offset = ((this._dom.hscrollbar.getBoundingClientRect().left - e.clientX) * -1);
      thumbClickPosition = (this._dom.hthumb.offsetWidth - this._prevPageX);
      thumbPositionPercentage = ((offset - thumbClickPosition) * 100 / this._dom.hscrollbar.offsetWidth);
      this._dom.view.scrollLeft = (thumbPositionPercentage * this._dom.view.scrollWidth / 100);
    }

    offset = thumbClickPosition = thumbPositionPercentage = null;

    return void 0;
  }
}

export default GeminiScrollbar;
