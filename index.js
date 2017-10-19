/**
 * gemini-scrollbar
 * @version 1.5.3
 * @link http://noeldelgado.github.io/gemini-scrollbar/
 * @license MIT
 */
(function() {
  var SCROLLBAR_WIDTH, DONT_CREATE_GEMINI, CLASSNAMES;

  CLASSNAMES = {
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

  function getScrollbarWidth() {
    var e = document.createElement('div'), sw;
    e.style.position = 'absolute';
    e.style.top = '-9999px';
    e.style.width = '100px';
    e.style.height = '100px';
    e.style.overflow = 'scroll';
    e.style.msOverflowStyle = 'scrollbar';
    document.body.appendChild(e);
    sw = (e.offsetWidth - e.clientWidth);
    document.body.removeChild(e);
    return sw;
  }

  function addClass(el, classNames) {
    if (el.classList) {
      return classNames.forEach(function(cl) {
        el.classList.add(cl);
      });
    }
    el.className += ' ' + classNames.join(' ');
  }

  function removeClass(el, classNames) {
    if (el.classList) {
      return classNames.forEach(function(cl) {
        el.classList.remove(cl);
      });
    }
    el.className = el.className.replace(new RegExp('(^|\\b)' + classNames.join('|') + '(\\b|$)', 'gi'), ' ');
  }

  /* Copyright (c) 2015 Lucas Wiener
   * https://github.com/wnr/element-resize-detector
   */
  function isIE() {
    var agent = navigator.userAgent.toLowerCase();
    return agent.indexOf("msie") !== -1 || agent.indexOf("trident") !== -1 || agent.indexOf(" edge/") !== -1;
  }

  function GeminiScrollbar(config) {
    this.element = null;
    this.autoshow = false;
    this.createElements = true;
    this.forceGemini = false;
    this.onResize = null;
    this.minThumbSize = 20;

    Object.keys(config || {}).forEach(function (propertyName) {
      this[propertyName] = config[propertyName];
    }, this);

    SCROLLBAR_WIDTH = getScrollbarWidth();
    DONT_CREATE_GEMINI = ((SCROLLBAR_WIDTH === 0) && (this.forceGemini === false));

    this._cache = {events: {}};
    this._created = false;
    this._cursorDown = false;
    this._prevPageX = 0;
    this._prevPageY = 0;

    this._document = null;
    this._viewElement = this.element;
    this._scrollbarVerticalElement = null;
    this._thumbVerticalElement = null;
    this._scrollbarHorizontalElement = null;
    this._scrollbarHorizontalElement = null;
  }

  GeminiScrollbar.prototype.create = function create() {
    if (DONT_CREATE_GEMINI) {
      addClass(this.element, [CLASSNAMES.prevented]);

      if (this.onResize) {
        // still need a resize trigger if we have an onResize callback, which
        // also means we need a separate _viewElement to do the scrolling.
        if (this.createElements === true) {
          this._viewElement = document.createElement('div');
          while(this.element.childNodes.length > 0) {
            this._viewElement.appendChild(this.element.childNodes[0]);
          }
          this.element.appendChild(this._viewElement);
        } else {
          this._viewElement = this.element.querySelector('.' + CLASSNAMES.view);
        }
        addClass(this.element, [CLASSNAMES.element]);
        addClass(this._viewElement, [CLASSNAMES.view]);
        this._createResizeTrigger();
      }

      return this;
    }

    if (this._created === true) {
      console.warn('calling on a already-created object');
      return this;
    }

    if (this.autoshow) {
      addClass(this.element, [CLASSNAMES.autoshow]);
    }

    this._document = document;

    if (this.createElements === true) {
      this._viewElement = document.createElement('div');
      this._scrollbarVerticalElement = document.createElement('div');
      this._thumbVerticalElement = document.createElement('div');
      this._scrollbarHorizontalElement = document.createElement('div');
      this._thumbHorizontalElement = document.createElement('div');
      while(this.element.childNodes.length > 0) {
        this._viewElement.appendChild(this.element.childNodes[0]);
      }

      this._scrollbarVerticalElement.appendChild(this._thumbVerticalElement);
      this._scrollbarHorizontalElement.appendChild(this._thumbHorizontalElement);
      this.element.appendChild(this._scrollbarVerticalElement);
      this.element.appendChild(this._scrollbarHorizontalElement);
      this.element.appendChild(this._viewElement);
    } else {
      this._viewElement = this.element.querySelector('.' + CLASSNAMES.view);
      this._scrollbarVerticalElement = this.element.querySelector('.' + CLASSNAMES.verticalScrollbar.split(' ').join('.'));
      this._thumbVerticalElement = this._scrollbarVerticalElement.querySelector('.' + CLASSNAMES.thumb);
      this._scrollbarHorizontalElement = this.element.querySelector('.' + CLASSNAMES.horizontalScrollbar.split(' ').join('.'));
      this._thumbHorizontalElement = this._scrollbarHorizontalElement.querySelector('.' + CLASSNAMES.thumb);
    }

    addClass(this.element, [CLASSNAMES.element]);
    addClass(this._viewElement, [CLASSNAMES.view]);
    addClass(this._scrollbarVerticalElement, CLASSNAMES.verticalScrollbar.split(/\s/));
    addClass(this._scrollbarHorizontalElement, CLASSNAMES.horizontalScrollbar.split(/\s/));
    addClass(this._thumbVerticalElement, [CLASSNAMES.thumb]);
    addClass(this._thumbHorizontalElement, [CLASSNAMES.thumb]);

    this._scrollbarVerticalElement.style.display = '';
    this._scrollbarHorizontalElement.style.display = '';

    this._createResizeTrigger();

    this._created = true;

    return this._bindEvents().update();
  };

  GeminiScrollbar.prototype._createResizeTrigger = function createResizeTrigger() {
    // We need to arrange for self.scrollbar.update to be called whenever
    // the DOM is changed resulting in a size-change for our div. To make
    // this happen, we use a technique described here:
    // http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/.
    //
    // The idea is that we create an <object> element in our div, which we
    // arrange to have the same size as that div. The <object> element
    // contains a Window object, to which we can attach an onresize
    // handler.
    //
    // (React appears to get very confused by the object (we end up with
    // Chrome windows which only show half of the text they are supposed
    // to), so we always do this manually.)

    var obj = document.createElement('object');
    addClass(obj, [CLASSNAMES.resizeTrigger]);
    obj.type = 'text/html';
    obj.setAttribute('tabindex', '-1');
    var resizeHandler = this._resizeHandler.bind(this);
    obj.onload = function () {
      var win = obj.contentDocument.defaultView;
      win.addEventListener('resize', resizeHandler);
    };

    //IE: Does not like that this happens before, even if it is also added after.
    if (!isIE()) {
      obj.data = 'about:blank';
    }

    this.element.appendChild(obj);

    //IE: This must occur after adding the object to the DOM.
    if (isIE()) {
      obj.data = 'about:blank';
    }

    this._resizeTriggerElement = obj;
  };

  GeminiScrollbar.prototype.update = function update() {
    if (DONT_CREATE_GEMINI) {
      return this;
    }

    if (this._created === false) {
      console.warn('calling on a not-yet-created object');
      return this;
    }

    this._viewElement.style.width = ((this.element.offsetWidth + SCROLLBAR_WIDTH).toString() + 'px');
    this._viewElement.style.height = ((this.element.offsetHeight + SCROLLBAR_WIDTH).toString() + 'px');

    this._naturalThumbSizeX = this._scrollbarHorizontalElement.clientWidth / this._viewElement.scrollWidth * this._scrollbarHorizontalElement.clientWidth;
    this._naturalThumbSizeY = this._scrollbarVerticalElement.clientHeight / this._viewElement.scrollHeight * this._scrollbarVerticalElement.clientHeight;

    this._scrollTopMax = this._viewElement.scrollHeight - this._viewElement.clientHeight;
    this._scrollLeftMax = this._viewElement.scrollWidth - this._viewElement.clientWidth;

    if (this._naturalThumbSizeY < this.minThumbSize) {
      this._thumbVerticalElement.style.height = this.minThumbSize + 'px';
    } else if (this._scrollTopMax) {
      this._thumbVerticalElement.style.height = this._naturalThumbSizeY + 'px';
    } else {
      this._thumbVerticalElement.style.height = '0px';
    }

    if (this._naturalThumbSizeX < this.minThumbSize) {
      this._thumbHorizontalElement.style.width = this.minThumbSize + 'px';
    } else if (this._scrollLeftMax) {
      this._thumbHorizontalElement.style.width = this._naturalThumbSizeX + 'px';
    } else {
      this._thumbHorizontalElement.style.width = '0px';
    }

    this._thumbSizeY = this._thumbVerticalElement.clientHeight;
    this._thumbSizeX = this._thumbHorizontalElement.clientWidth;

    this._trackTopMax = this._scrollbarVerticalElement.clientHeight - this._thumbSizeY;
    this._trackLeftMax = this._scrollbarHorizontalElement.clientWidth - this._thumbSizeX;

    this._scrollHandler();

    return this;
  };

  GeminiScrollbar.prototype.destroy = function destroy() {
    if (this._resizeTriggerElement) {
      this.element.removeChild(this._resizeTriggerElement);
      this._resizeTriggerElement = null;
    }

    if (DONT_CREATE_GEMINI) {
      return this;
    }

    if (this._created === false) {
      console.warn('calling on a not-yet-created object');
      return this;
    }

    this._unbinEvents();

    removeClass(this.element, [CLASSNAMES.element, CLASSNAMES.autoshow]);

    if (this.createElements === true) {
      this.element.removeChild(this._scrollbarVerticalElement);
      this.element.removeChild(this._scrollbarHorizontalElement);
      while(this._viewElement.childNodes.length > 0) {
        this.element.appendChild(this._viewElement.childNodes[0]);
      }
      this.element.removeChild(this._viewElement);
    } else {
      this._viewElement.style.width = '';
      this._viewElement.style.height = '';
      this._scrollbarVerticalElement.style.display = 'none';
      this._scrollbarHorizontalElement.style.display = 'none';
    }

    this._created = false;
    this._document = null;

    return null;
  };

  GeminiScrollbar.prototype.getViewElement = function getViewElement() {
    return this._viewElement;
  };

  GeminiScrollbar.prototype._bindEvents = function _bindEvents() {
    this._cache.events.scrollHandler = this._scrollHandler.bind(this);
    this._cache.events.clickVerticalTrackHandler = this._clickVerticalTrackHandler.bind(this);
    this._cache.events.clickHorizontalTrackHandler = this._clickHorizontalTrackHandler.bind(this);
    this._cache.events.clickVerticalThumbHandler = this._clickVerticalThumbHandler.bind(this);
    this._cache.events.clickHorizontalThumbHandler = this._clickHorizontalThumbHandler.bind(this);
    this._cache.events.mouseUpDocumentHandler = this._mouseUpDocumentHandler.bind(this);
    this._cache.events.mouseMoveDocumentHandler = this._mouseMoveDocumentHandler.bind(this);

    this._viewElement.addEventListener('scroll', this._cache.events.scrollHandler);
    this._scrollbarVerticalElement.addEventListener('mousedown', this._cache.events.clickVerticalTrackHandler);
    this._scrollbarHorizontalElement.addEventListener('mousedown', this._cache.events.clickHorizontalTrackHandler);
    this._thumbVerticalElement.addEventListener('mousedown', this._cache.events.clickVerticalThumbHandler);
    this._thumbHorizontalElement.addEventListener('mousedown', this._cache.events.clickHorizontalThumbHandler);
    this._document.addEventListener('mouseup', this._cache.events.mouseUpDocumentHandler);

    return this;
  };

  GeminiScrollbar.prototype._unbinEvents = function _unbinEvents() {
    this._viewElement.removeEventListener('scroll', this._cache.events.scrollHandler);
    this._scrollbarVerticalElement.removeEventListener('mousedown', this._cache.events.clickVerticalTrackHandler);
    this._scrollbarHorizontalElement.removeEventListener('mousedown', this._cache.events.clickHorizontalTrackHandler);
    this._thumbVerticalElement.removeEventListener('mousedown', this._cache.events.clickVerticalThumbHandler);
    this._thumbHorizontalElement.removeEventListener('mousedown', this._cache.events.clickHorizontalThumbHandler);
    this._document.removeEventListener('mouseup', this._cache.events.mouseUpDocumentHandler);
    this._document.removeEventListener('mousemove', this._cache.events.mouseMoveDocumentHandler);

    return this;
  };

  GeminiScrollbar.prototype._scrollHandler = function _scrollHandler() {
    var x = (this._viewElement.scrollLeft * this._trackLeftMax / this._scrollLeftMax) || 0;
    var y = (this._viewElement.scrollTop * this._trackTopMax / this._scrollTopMax) || 0;

    this._thumbHorizontalElement.style.msTransform = 'translateX(' + x + 'px)';
    this._thumbHorizontalElement.style.webkitTransform = 'translate3d(' + x + 'px, 0, 0)';
    this._thumbHorizontalElement.style.transform = 'translate3d(' + x + 'px, 0, 0)';

    this._thumbVerticalElement.style.msTransform = 'translateY(' + y + 'px)';
    this._thumbVerticalElement.style.webkitTransform = 'translate3d(0, ' + y + 'px, 0)';
    this._thumbVerticalElement.style.transform = 'translate3d(0, ' + y + 'px, 0)';
  };

  GeminiScrollbar.prototype._resizeHandler = function _resizeHandler() {
    this.update();
    if (this.onResize) {
      this.onResize();
    }
  };

  GeminiScrollbar.prototype._clickVerticalTrackHandler = function _clickVerticalTrackHandler(e) {
    if(e.target !== e.currentTarget) {
      return;
    }
    var offset = e.offsetY - this._naturalThumbSizeY * .5
      , thumbPositionPercentage = offset * 100 / this._scrollbarVerticalElement.clientHeight;

    this._viewElement.scrollTop = thumbPositionPercentage * this._viewElement.scrollHeight / 100;
  };

  GeminiScrollbar.prototype._clickHorizontalTrackHandler = function _clickHorizontalTrackHandler(e) {
    if(e.target !== e.currentTarget) {
      return;
    }
    var offset = e.offsetX - this._naturalThumbSizeX * .5
      , thumbPositionPercentage = offset * 100 / this._scrollbarHorizontalElement.clientWidth;

    this._viewElement.scrollLeft = thumbPositionPercentage * this._viewElement.scrollWidth / 100;
  };

  GeminiScrollbar.prototype._clickVerticalThumbHandler = function _clickVerticalThumbHandler(e) {
    this._startDrag(e);
    this._prevPageY = this._thumbSizeY - e.offsetY;
  };

  GeminiScrollbar.prototype._clickHorizontalThumbHandler = function _clickHorizontalThumbHandler(e) {
    this._startDrag(e);
    this._prevPageX = this._thumbSizeX - e.offsetX;
  };

  GeminiScrollbar.prototype._startDrag = function _startDrag(e) {
    this._cursorDown = true;
    addClass(document.body, [CLASSNAMES.disable]);
    this._document.addEventListener('mousemove', this._cache.events.mouseMoveDocumentHandler);
    this._document.onselectstart = function() {return false;};
  };

  GeminiScrollbar.prototype._mouseUpDocumentHandler = function _mouseUpDocumentHandler() {
    this._cursorDown = false;
    this._prevPageX = this._prevPageY = 0;
    removeClass(document.body, [CLASSNAMES.disable]);
    this._document.removeEventListener('mousemove', this._cache.events.mouseMoveDocumentHandler);
    this._document.onselectstart = null;
  };

  GeminiScrollbar.prototype._mouseMoveDocumentHandler = function _mouseMoveDocumentHandler(e) {
    if (this._cursorDown === false) {return;}

    var offset, thumbClickPosition;

    if (this._prevPageY) {
      offset = e.clientY - this._scrollbarVerticalElement.getBoundingClientRect().top;
      thumbClickPosition = this._thumbSizeY - this._prevPageY;

      this._viewElement.scrollTop = this._scrollTopMax * (offset - thumbClickPosition) / this._trackTopMax;

      return void 0;
    }

    if (this._prevPageX) {
      offset = e.clientX - this._scrollbarHorizontalElement.getBoundingClientRect().left;
      thumbClickPosition = this._thumbSizeX - this._prevPageX;

      this._viewElement.scrollLeft = this._scrollLeftMax * (offset - thumbClickPosition) / this._trackLeftMax;
    }
  };

  if (typeof exports === 'object') {
    module.exports = GeminiScrollbar;
  } else {
    window.GeminiScrollbar = GeminiScrollbar;
  }
})();
