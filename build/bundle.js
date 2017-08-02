(function () {
function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var index = createCommonjsModule(function (module, exports) {
/**
 * gemini-scrollbar
 * @version 1.5.2
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
    var this$1 = this;

    if (DONT_CREATE_GEMINI) {
      addClass(this.element, [CLASSNAMES.prevented]);

      if (this.onResize) {
        // still need a resize trigger if we have an onResize callback, which
        // also means we need a separate _viewElement to do the scrolling.
        if (this.createElements === true) {
          this._viewElement = document.createElement('div');
          while(this.element.childNodes.length > 0) {
            this$1._viewElement.appendChild(this$1.element.childNodes[0]);
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
        this$1._viewElement.appendChild(this$1.element.childNodes[0]);
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
    var this$1 = this;

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
        this$1.element.appendChild(this$1._viewElement.childNodes[0]);
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
    var offset = e.offsetY - this._naturalThumbSizeY * .5
      , thumbPositionPercentage = offset * 100 / this._scrollbarVerticalElement.clientHeight;

    this._viewElement.scrollTop = thumbPositionPercentage * this._viewElement.scrollHeight / 100;
  };

  GeminiScrollbar.prototype._clickHorizontalTrackHandler = function _clickHorizontalTrackHandler(e) {
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
    e.stopImmediatePropagation();
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

  {
    module.exports = GeminiScrollbar;
  }
})();
});

new index({
  element: document.body,
  createElements: false
}).create();

new index({
  element: document.querySelector('.ex1 .list-container')
}).create();

new index({
  element: document.querySelector('.ex2 .code')
}).create();

new index({
  element: document.querySelector('.ex3 .box')
}).create();

new index({
  element: document.querySelector('.ex4 .manilla')
}).create();

new index({
  element: document.querySelector('.ex5 .sample')
}).create();

new index({
  element: document.querySelector('.ex6 .sample')
}).create();

}());

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9Vc2Vycy9ub2VsL1Byb2plY3RzL3BlcnNvbmFsL2dpdGh1Yi9nZW1pbmktc2Nyb2xsYmFyL25vZGVfbW9kdWxlcy9nZW1pbmktc2Nyb2xsYmFyL2luZGV4LmpzIiwiL1VzZXJzL25vZWwvUHJvamVjdHMvcGVyc29uYWwvZ2l0aHViL2dlbWluaS1zY3JvbGxiYXIvc3JjL2pzL2FwcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIGdlbWluaS1zY3JvbGxiYXJcbiAqIEB2ZXJzaW9uIDEuNS4yXG4gKiBAbGluayBodHRwOi8vbm9lbGRlbGdhZG8uZ2l0aHViLmlvL2dlbWluaS1zY3JvbGxiYXIvXG4gKiBAbGljZW5zZSBNSVRcbiAqL1xuKGZ1bmN0aW9uKCkge1xuICB2YXIgU0NST0xMQkFSX1dJRFRILCBET05UX0NSRUFURV9HRU1JTkksIENMQVNTTkFNRVM7XG5cbiAgQ0xBU1NOQU1FUyA9IHtcbiAgICBlbGVtZW50OiAnZ20tc2Nyb2xsYmFyLWNvbnRhaW5lcicsXG4gICAgdmVydGljYWxTY3JvbGxiYXI6ICdnbS1zY3JvbGxiYXIgLXZlcnRpY2FsJyxcbiAgICBob3Jpem9udGFsU2Nyb2xsYmFyOiAnZ20tc2Nyb2xsYmFyIC1ob3Jpem9udGFsJyxcbiAgICB0aHVtYjogJ3RodW1iJyxcbiAgICB2aWV3OiAnZ20tc2Nyb2xsLXZpZXcnLFxuICAgIGF1dG9zaG93OiAnZ20tYXV0b3Nob3cnLFxuICAgIGRpc2FibGU6ICdnbS1zY3JvbGxiYXItZGlzYWJsZS1zZWxlY3Rpb24nLFxuICAgIHByZXZlbnRlZDogJ2dtLXByZXZlbnRlZCcsXG4gICAgcmVzaXplVHJpZ2dlcjogJ2dtLXJlc2l6ZS10cmlnZ2VyJyxcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRTY3JvbGxiYXJXaWR0aCgpIHtcbiAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLCBzdztcbiAgICBlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICBlLnN0eWxlLnRvcCA9ICctOTk5OXB4JztcbiAgICBlLnN0eWxlLndpZHRoID0gJzEwMHB4JztcbiAgICBlLnN0eWxlLmhlaWdodCA9ICcxMDBweCc7XG4gICAgZS5zdHlsZS5vdmVyZmxvdyA9ICdzY3JvbGwnO1xuICAgIGUuc3R5bGUubXNPdmVyZmxvd1N0eWxlID0gJ3Njcm9sbGJhcic7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChlKTtcbiAgICBzdyA9IChlLm9mZnNldFdpZHRoIC0gZS5jbGllbnRXaWR0aCk7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChlKTtcbiAgICByZXR1cm4gc3c7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRDbGFzcyhlbCwgY2xhc3NOYW1lcykge1xuICAgIGlmIChlbC5jbGFzc0xpc3QpIHtcbiAgICAgIHJldHVybiBjbGFzc05hbWVzLmZvckVhY2goZnVuY3Rpb24oY2wpIHtcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZChjbCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWwuY2xhc3NOYW1lICs9ICcgJyArIGNsYXNzTmFtZXMuam9pbignICcpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoZWwsIGNsYXNzTmFtZXMpIHtcbiAgICBpZiAoZWwuY2xhc3NMaXN0KSB7XG4gICAgICByZXR1cm4gY2xhc3NOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKGNsKSB7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoY2wpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKG5ldyBSZWdFeHAoJyhefFxcXFxiKScgKyBjbGFzc05hbWVzLmpvaW4oJ3wnKSArICcoXFxcXGJ8JCknLCAnZ2knKSwgJyAnKTtcbiAgfVxuXG4gIC8qIENvcHlyaWdodCAoYykgMjAxNSBMdWNhcyBXaWVuZXJcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3duci9lbGVtZW50LXJlc2l6ZS1kZXRlY3RvclxuICAgKi9cbiAgZnVuY3Rpb24gaXNJRSgpIHtcbiAgICB2YXIgYWdlbnQgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIGFnZW50LmluZGV4T2YoXCJtc2llXCIpICE9PSAtMSB8fCBhZ2VudC5pbmRleE9mKFwidHJpZGVudFwiKSAhPT0gLTEgfHwgYWdlbnQuaW5kZXhPZihcIiBlZGdlL1wiKSAhPT0gLTE7XG4gIH1cblxuICBmdW5jdGlvbiBHZW1pbmlTY3JvbGxiYXIoY29uZmlnKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gbnVsbDtcbiAgICB0aGlzLmF1dG9zaG93ID0gZmFsc2U7XG4gICAgdGhpcy5jcmVhdGVFbGVtZW50cyA9IHRydWU7XG4gICAgdGhpcy5mb3JjZUdlbWluaSA9IGZhbHNlO1xuICAgIHRoaXMub25SZXNpemUgPSBudWxsO1xuICAgIHRoaXMubWluVGh1bWJTaXplID0gMjA7XG5cbiAgICBPYmplY3Qua2V5cyhjb25maWcgfHwge30pLmZvckVhY2goZnVuY3Rpb24gKHByb3BlcnR5TmFtZSkge1xuICAgICAgdGhpc1twcm9wZXJ0eU5hbWVdID0gY29uZmlnW3Byb3BlcnR5TmFtZV07XG4gICAgfSwgdGhpcyk7XG5cbiAgICBTQ1JPTExCQVJfV0lEVEggPSBnZXRTY3JvbGxiYXJXaWR0aCgpO1xuICAgIERPTlRfQ1JFQVRFX0dFTUlOSSA9ICgoU0NST0xMQkFSX1dJRFRIID09PSAwKSAmJiAodGhpcy5mb3JjZUdlbWluaSA9PT0gZmFsc2UpKTtcblxuICAgIHRoaXMuX2NhY2hlID0ge2V2ZW50czoge319O1xuICAgIHRoaXMuX2NyZWF0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9jdXJzb3JEb3duID0gZmFsc2U7XG4gICAgdGhpcy5fcHJldlBhZ2VYID0gMDtcbiAgICB0aGlzLl9wcmV2UGFnZVkgPSAwO1xuXG4gICAgdGhpcy5fZG9jdW1lbnQgPSBudWxsO1xuICAgIHRoaXMuX3ZpZXdFbGVtZW50ID0gdGhpcy5lbGVtZW50O1xuICAgIHRoaXMuX3Njcm9sbGJhclZlcnRpY2FsRWxlbWVudCA9IG51bGw7XG4gICAgdGhpcy5fdGh1bWJWZXJ0aWNhbEVsZW1lbnQgPSBudWxsO1xuICAgIHRoaXMuX3Njcm9sbGJhckhvcml6b250YWxFbGVtZW50ID0gbnVsbDtcbiAgICB0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudCA9IG51bGw7XG4gIH1cblxuICBHZW1pbmlTY3JvbGxiYXIucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICBpZiAoRE9OVF9DUkVBVEVfR0VNSU5JKSB7XG4gICAgICBhZGRDbGFzcyh0aGlzLmVsZW1lbnQsIFtDTEFTU05BTUVTLnByZXZlbnRlZF0pO1xuXG4gICAgICBpZiAodGhpcy5vblJlc2l6ZSkge1xuICAgICAgICAvLyBzdGlsbCBuZWVkIGEgcmVzaXplIHRyaWdnZXIgaWYgd2UgaGF2ZSBhbiBvblJlc2l6ZSBjYWxsYmFjaywgd2hpY2hcbiAgICAgICAgLy8gYWxzbyBtZWFucyB3ZSBuZWVkIGEgc2VwYXJhdGUgX3ZpZXdFbGVtZW50IHRvIGRvIHRoZSBzY3JvbGxpbmcuXG4gICAgICAgIGlmICh0aGlzLmNyZWF0ZUVsZW1lbnRzID09PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy5fdmlld0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICB3aGlsZSh0aGlzLmVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLl92aWV3RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQuY2hpbGROb2Rlc1swXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl92aWV3RWxlbWVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fdmlld0VsZW1lbnQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBDTEFTU05BTUVTLnZpZXcpO1xuICAgICAgICB9XG4gICAgICAgIGFkZENsYXNzKHRoaXMuZWxlbWVudCwgW0NMQVNTTkFNRVMuZWxlbWVudF0pO1xuICAgICAgICBhZGRDbGFzcyh0aGlzLl92aWV3RWxlbWVudCwgW0NMQVNTTkFNRVMudmlld10pO1xuICAgICAgICB0aGlzLl9jcmVhdGVSZXNpemVUcmlnZ2VyKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9jcmVhdGVkID09PSB0cnVlKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ2NhbGxpbmcgb24gYSBhbHJlYWR5LWNyZWF0ZWQgb2JqZWN0Jyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5hdXRvc2hvdykge1xuICAgICAgYWRkQ2xhc3ModGhpcy5lbGVtZW50LCBbQ0xBU1NOQU1FUy5hdXRvc2hvd10pO1xuICAgIH1cblxuICAgIHRoaXMuX2RvY3VtZW50ID0gZG9jdW1lbnQ7XG5cbiAgICBpZiAodGhpcy5jcmVhdGVFbGVtZW50cyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5fdmlld0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHRoaXMuX3Njcm9sbGJhclZlcnRpY2FsRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdGhpcy5fdGh1bWJWZXJ0aWNhbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHRoaXMuX3Njcm9sbGJhckhvcml6b250YWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICB0aGlzLl90aHVtYkhvcml6b250YWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICB3aGlsZSh0aGlzLmVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuX3ZpZXdFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudC5jaGlsZE5vZGVzWzBdKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX3RodW1iVmVydGljYWxFbGVtZW50KTtcbiAgICAgIHRoaXMuX3Njcm9sbGJhckhvcml6b250YWxFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX3RodW1iSG9yaXpvbnRhbEVsZW1lbnQpO1xuICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX3Njcm9sbGJhclZlcnRpY2FsRWxlbWVudCk7XG4gICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fc2Nyb2xsYmFySG9yaXpvbnRhbEVsZW1lbnQpO1xuICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX3ZpZXdFbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdmlld0VsZW1lbnQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBDTEFTU05BTUVTLnZpZXcpO1xuICAgICAgdGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50ID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy4nICsgQ0xBU1NOQU1FUy52ZXJ0aWNhbFNjcm9sbGJhci5zcGxpdCgnICcpLmpvaW4oJy4nKSk7XG4gICAgICB0aGlzLl90aHVtYlZlcnRpY2FsRWxlbWVudCA9IHRoaXMuX3Njcm9sbGJhclZlcnRpY2FsRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIENMQVNTTkFNRVMudGh1bWIpO1xuICAgICAgdGhpcy5fc2Nyb2xsYmFySG9yaXpvbnRhbEVsZW1lbnQgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcignLicgKyBDTEFTU05BTUVTLmhvcml6b250YWxTY3JvbGxiYXIuc3BsaXQoJyAnKS5qb2luKCcuJykpO1xuICAgICAgdGhpcy5fdGh1bWJIb3Jpem9udGFsRWxlbWVudCA9IHRoaXMuX3Njcm9sbGJhckhvcml6b250YWxFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy4nICsgQ0xBU1NOQU1FUy50aHVtYik7XG4gICAgfVxuXG4gICAgYWRkQ2xhc3ModGhpcy5lbGVtZW50LCBbQ0xBU1NOQU1FUy5lbGVtZW50XSk7XG4gICAgYWRkQ2xhc3ModGhpcy5fdmlld0VsZW1lbnQsIFtDTEFTU05BTUVTLnZpZXddKTtcbiAgICBhZGRDbGFzcyh0aGlzLl9zY3JvbGxiYXJWZXJ0aWNhbEVsZW1lbnQsIENMQVNTTkFNRVMudmVydGljYWxTY3JvbGxiYXIuc3BsaXQoL1xccy8pKTtcbiAgICBhZGRDbGFzcyh0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudCwgQ0xBU1NOQU1FUy5ob3Jpem9udGFsU2Nyb2xsYmFyLnNwbGl0KC9cXHMvKSk7XG4gICAgYWRkQ2xhc3ModGhpcy5fdGh1bWJWZXJ0aWNhbEVsZW1lbnQsIFtDTEFTU05BTUVTLnRodW1iXSk7XG4gICAgYWRkQ2xhc3ModGhpcy5fdGh1bWJIb3Jpem9udGFsRWxlbWVudCwgW0NMQVNTTkFNRVMudGh1bWJdKTtcblxuICAgIHRoaXMuX3Njcm9sbGJhclZlcnRpY2FsRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgdGhpcy5fc2Nyb2xsYmFySG9yaXpvbnRhbEVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICcnO1xuXG4gICAgdGhpcy5fY3JlYXRlUmVzaXplVHJpZ2dlcigpO1xuXG4gICAgdGhpcy5fY3JlYXRlZCA9IHRydWU7XG5cbiAgICByZXR1cm4gdGhpcy5fYmluZEV2ZW50cygpLnVwZGF0ZSgpO1xuICB9O1xuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUuX2NyZWF0ZVJlc2l6ZVRyaWdnZXIgPSBmdW5jdGlvbiBjcmVhdGVSZXNpemVUcmlnZ2VyKCkge1xuICAgIC8vIFdlIG5lZWQgdG8gYXJyYW5nZSBmb3Igc2VsZi5zY3JvbGxiYXIudXBkYXRlIHRvIGJlIGNhbGxlZCB3aGVuZXZlclxuICAgIC8vIHRoZSBET00gaXMgY2hhbmdlZCByZXN1bHRpbmcgaW4gYSBzaXplLWNoYW5nZSBmb3Igb3VyIGRpdi4gVG8gbWFrZVxuICAgIC8vIHRoaXMgaGFwcGVuLCB3ZSB1c2UgYSB0ZWNobmlxdWUgZGVzY3JpYmVkIGhlcmU6XG4gICAgLy8gaHR0cDovL3d3dy5iYWNrYWxsZXljb2Rlci5jb20vMjAxMy8wMy8xOC9jcm9zcy1icm93c2VyLWV2ZW50LWJhc2VkLWVsZW1lbnQtcmVzaXplLWRldGVjdGlvbi8uXG4gICAgLy9cbiAgICAvLyBUaGUgaWRlYSBpcyB0aGF0IHdlIGNyZWF0ZSBhbiA8b2JqZWN0PiBlbGVtZW50IGluIG91ciBkaXYsIHdoaWNoIHdlXG4gICAgLy8gYXJyYW5nZSB0byBoYXZlIHRoZSBzYW1lIHNpemUgYXMgdGhhdCBkaXYuIFRoZSA8b2JqZWN0PiBlbGVtZW50XG4gICAgLy8gY29udGFpbnMgYSBXaW5kb3cgb2JqZWN0LCB0byB3aGljaCB3ZSBjYW4gYXR0YWNoIGFuIG9ucmVzaXplXG4gICAgLy8gaGFuZGxlci5cbiAgICAvL1xuICAgIC8vIChSZWFjdCBhcHBlYXJzIHRvIGdldCB2ZXJ5IGNvbmZ1c2VkIGJ5IHRoZSBvYmplY3QgKHdlIGVuZCB1cCB3aXRoXG4gICAgLy8gQ2hyb21lIHdpbmRvd3Mgd2hpY2ggb25seSBzaG93IGhhbGYgb2YgdGhlIHRleHQgdGhleSBhcmUgc3VwcG9zZWRcbiAgICAvLyB0byksIHNvIHdlIGFsd2F5cyBkbyB0aGlzIG1hbnVhbGx5LilcblxuICAgIHZhciBvYmogPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvYmplY3QnKTtcbiAgICBhZGRDbGFzcyhvYmosIFtDTEFTU05BTUVTLnJlc2l6ZVRyaWdnZXJdKTtcbiAgICBvYmoudHlwZSA9ICd0ZXh0L2h0bWwnO1xuICAgIG9iai5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgdmFyIHJlc2l6ZUhhbmRsZXIgPSB0aGlzLl9yZXNpemVIYW5kbGVyLmJpbmQodGhpcyk7XG4gICAgb2JqLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB3aW4gPSBvYmouY29udGVudERvY3VtZW50LmRlZmF1bHRWaWV3O1xuICAgICAgd2luLmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlc2l6ZUhhbmRsZXIpO1xuICAgIH07XG5cbiAgICAvL0lFOiBEb2VzIG5vdCBsaWtlIHRoYXQgdGhpcyBoYXBwZW5zIGJlZm9yZSwgZXZlbiBpZiBpdCBpcyBhbHNvIGFkZGVkIGFmdGVyLlxuICAgIGlmICghaXNJRSgpKSB7XG4gICAgICBvYmouZGF0YSA9ICdhYm91dDpibGFuayc7XG4gICAgfVxuXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKG9iaik7XG5cbiAgICAvL0lFOiBUaGlzIG11c3Qgb2NjdXIgYWZ0ZXIgYWRkaW5nIHRoZSBvYmplY3QgdG8gdGhlIERPTS5cbiAgICBpZiAoaXNJRSgpKSB7XG4gICAgICBvYmouZGF0YSA9ICdhYm91dDpibGFuayc7XG4gICAgfVxuXG4gICAgdGhpcy5fcmVzaXplVHJpZ2dlckVsZW1lbnQgPSBvYmo7XG4gIH07XG5cbiAgR2VtaW5pU2Nyb2xsYmFyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgaWYgKERPTlRfQ1JFQVRFX0dFTUlOSSkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2NyZWF0ZWQgPT09IGZhbHNlKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ2NhbGxpbmcgb24gYSBub3QteWV0LWNyZWF0ZWQgb2JqZWN0Jyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLl92aWV3RWxlbWVudC5zdHlsZS53aWR0aCA9ICgodGhpcy5lbGVtZW50Lm9mZnNldFdpZHRoICsgU0NST0xMQkFSX1dJRFRIKS50b1N0cmluZygpICsgJ3B4Jyk7XG4gICAgdGhpcy5fdmlld0VsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gKCh0aGlzLmVsZW1lbnQub2Zmc2V0SGVpZ2h0ICsgU0NST0xMQkFSX1dJRFRIKS50b1N0cmluZygpICsgJ3B4Jyk7XG5cbiAgICB0aGlzLl9uYXR1cmFsVGh1bWJTaXplWCA9IHRoaXMuX3Njcm9sbGJhckhvcml6b250YWxFbGVtZW50LmNsaWVudFdpZHRoIC8gdGhpcy5fdmlld0VsZW1lbnQuc2Nyb2xsV2lkdGggKiB0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICB0aGlzLl9uYXR1cmFsVGh1bWJTaXplWSA9IHRoaXMuX3Njcm9sbGJhclZlcnRpY2FsRWxlbWVudC5jbGllbnRIZWlnaHQgLyB0aGlzLl92aWV3RWxlbWVudC5zY3JvbGxIZWlnaHQgKiB0aGlzLl9zY3JvbGxiYXJWZXJ0aWNhbEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuXG4gICAgdGhpcy5fc2Nyb2xsVG9wTWF4ID0gdGhpcy5fdmlld0VsZW1lbnQuc2Nyb2xsSGVpZ2h0IC0gdGhpcy5fdmlld0VsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgIHRoaXMuX3Njcm9sbExlZnRNYXggPSB0aGlzLl92aWV3RWxlbWVudC5zY3JvbGxXaWR0aCAtIHRoaXMuX3ZpZXdFbGVtZW50LmNsaWVudFdpZHRoO1xuXG4gICAgaWYgKHRoaXMuX25hdHVyYWxUaHVtYlNpemVZIDwgdGhpcy5taW5UaHVtYlNpemUpIHtcbiAgICAgIHRoaXMuX3RodW1iVmVydGljYWxFbGVtZW50LnN0eWxlLmhlaWdodCA9IHRoaXMubWluVGh1bWJTaXplICsgJ3B4JztcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3Njcm9sbFRvcE1heCkge1xuICAgICAgdGhpcy5fdGh1bWJWZXJ0aWNhbEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gdGhpcy5fbmF0dXJhbFRodW1iU2l6ZVkgKyAncHgnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl90aHVtYlZlcnRpY2FsRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnMHB4JztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbmF0dXJhbFRodW1iU2l6ZVggPCB0aGlzLm1pblRodW1iU2l6ZSkge1xuICAgICAgdGhpcy5fdGh1bWJIb3Jpem9udGFsRWxlbWVudC5zdHlsZS53aWR0aCA9IHRoaXMubWluVGh1bWJTaXplICsgJ3B4JztcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3Njcm9sbExlZnRNYXgpIHtcbiAgICAgIHRoaXMuX3RodW1iSG9yaXpvbnRhbEVsZW1lbnQuc3R5bGUud2lkdGggPSB0aGlzLl9uYXR1cmFsVGh1bWJTaXplWCArICdweCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3RodW1iSG9yaXpvbnRhbEVsZW1lbnQuc3R5bGUud2lkdGggPSAnMHB4JztcbiAgICB9XG5cbiAgICB0aGlzLl90aHVtYlNpemVZID0gdGhpcy5fdGh1bWJWZXJ0aWNhbEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgIHRoaXMuX3RodW1iU2l6ZVggPSB0aGlzLl90aHVtYkhvcml6b250YWxFbGVtZW50LmNsaWVudFdpZHRoO1xuXG4gICAgdGhpcy5fdHJhY2tUb3BNYXggPSB0aGlzLl9zY3JvbGxiYXJWZXJ0aWNhbEVsZW1lbnQuY2xpZW50SGVpZ2h0IC0gdGhpcy5fdGh1bWJTaXplWTtcbiAgICB0aGlzLl90cmFja0xlZnRNYXggPSB0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudC5jbGllbnRXaWR0aCAtIHRoaXMuX3RodW1iU2l6ZVg7XG5cbiAgICB0aGlzLl9zY3JvbGxIYW5kbGVyKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBHZW1pbmlTY3JvbGxiYXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl9yZXNpemVUcmlnZ2VyRWxlbWVudCkge1xuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuX3Jlc2l6ZVRyaWdnZXJFbGVtZW50KTtcbiAgICAgIHRoaXMuX3Jlc2l6ZVRyaWdnZXJFbGVtZW50ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoRE9OVF9DUkVBVEVfR0VNSU5JKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fY3JlYXRlZCA9PT0gZmFsc2UpIHtcbiAgICAgIGNvbnNvbGUud2FybignY2FsbGluZyBvbiBhIG5vdC15ZXQtY3JlYXRlZCBvYmplY3QnKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuX3VuYmluRXZlbnRzKCk7XG5cbiAgICByZW1vdmVDbGFzcyh0aGlzLmVsZW1lbnQsIFtDTEFTU05BTUVTLmVsZW1lbnQsIENMQVNTTkFNRVMuYXV0b3Nob3ddKTtcblxuICAgIGlmICh0aGlzLmNyZWF0ZUVsZW1lbnRzID09PSB0cnVlKSB7XG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50KTtcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudCk7XG4gICAgICB3aGlsZSh0aGlzLl92aWV3RWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX3ZpZXdFbGVtZW50LmNoaWxkTm9kZXNbMF0pO1xuICAgICAgfVxuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuX3ZpZXdFbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdmlld0VsZW1lbnQuc3R5bGUud2lkdGggPSAnJztcbiAgICAgIHRoaXMuX3ZpZXdFbGVtZW50LnN0eWxlLmhlaWdodCA9ICcnO1xuICAgICAgdGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICB0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cblxuICAgIHRoaXMuX2NyZWF0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9kb2N1bWVudCA9IG51bGw7XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBHZW1pbmlTY3JvbGxiYXIucHJvdG90eXBlLmdldFZpZXdFbGVtZW50ID0gZnVuY3Rpb24gZ2V0Vmlld0VsZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ZpZXdFbGVtZW50O1xuICB9O1xuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUuX2JpbmRFdmVudHMgPSBmdW5jdGlvbiBfYmluZEV2ZW50cygpIHtcbiAgICB0aGlzLl9jYWNoZS5ldmVudHMuc2Nyb2xsSGFuZGxlciA9IHRoaXMuX3Njcm9sbEhhbmRsZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9jYWNoZS5ldmVudHMuY2xpY2tWZXJ0aWNhbFRyYWNrSGFuZGxlciA9IHRoaXMuX2NsaWNrVmVydGljYWxUcmFja0hhbmRsZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9jYWNoZS5ldmVudHMuY2xpY2tIb3Jpem9udGFsVHJhY2tIYW5kbGVyID0gdGhpcy5fY2xpY2tIb3Jpem9udGFsVHJhY2tIYW5kbGVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fY2FjaGUuZXZlbnRzLmNsaWNrVmVydGljYWxUaHVtYkhhbmRsZXIgPSB0aGlzLl9jbGlja1ZlcnRpY2FsVGh1bWJIYW5kbGVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fY2FjaGUuZXZlbnRzLmNsaWNrSG9yaXpvbnRhbFRodW1iSGFuZGxlciA9IHRoaXMuX2NsaWNrSG9yaXpvbnRhbFRodW1iSGFuZGxlci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2NhY2hlLmV2ZW50cy5tb3VzZVVwRG9jdW1lbnRIYW5kbGVyID0gdGhpcy5fbW91c2VVcERvY3VtZW50SGFuZGxlci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2NhY2hlLmV2ZW50cy5tb3VzZU1vdmVEb2N1bWVudEhhbmRsZXIgPSB0aGlzLl9tb3VzZU1vdmVEb2N1bWVudEhhbmRsZXIuYmluZCh0aGlzKTtcblxuICAgIHRoaXMuX3ZpZXdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMuX2NhY2hlLmV2ZW50cy5zY3JvbGxIYW5kbGVyKTtcbiAgICB0aGlzLl9zY3JvbGxiYXJWZXJ0aWNhbEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fY2FjaGUuZXZlbnRzLmNsaWNrVmVydGljYWxUcmFja0hhbmRsZXIpO1xuICAgIHRoaXMuX3Njcm9sbGJhckhvcml6b250YWxFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX2NhY2hlLmV2ZW50cy5jbGlja0hvcml6b250YWxUcmFja0hhbmRsZXIpO1xuICAgIHRoaXMuX3RodW1iVmVydGljYWxFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX2NhY2hlLmV2ZW50cy5jbGlja1ZlcnRpY2FsVGh1bWJIYW5kbGVyKTtcbiAgICB0aGlzLl90aHVtYkhvcml6b250YWxFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX2NhY2hlLmV2ZW50cy5jbGlja0hvcml6b250YWxUaHVtYkhhbmRsZXIpO1xuICAgIHRoaXMuX2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9jYWNoZS5ldmVudHMubW91c2VVcERvY3VtZW50SGFuZGxlcik7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBHZW1pbmlTY3JvbGxiYXIucHJvdG90eXBlLl91bmJpbkV2ZW50cyA9IGZ1bmN0aW9uIF91bmJpbkV2ZW50cygpIHtcbiAgICB0aGlzLl92aWV3RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLl9jYWNoZS5ldmVudHMuc2Nyb2xsSGFuZGxlcik7XG4gICAgdGhpcy5fc2Nyb2xsYmFyVmVydGljYWxFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX2NhY2hlLmV2ZW50cy5jbGlja1ZlcnRpY2FsVHJhY2tIYW5kbGVyKTtcbiAgICB0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9jYWNoZS5ldmVudHMuY2xpY2tIb3Jpem9udGFsVHJhY2tIYW5kbGVyKTtcbiAgICB0aGlzLl90aHVtYlZlcnRpY2FsRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9jYWNoZS5ldmVudHMuY2xpY2tWZXJ0aWNhbFRodW1iSGFuZGxlcik7XG4gICAgdGhpcy5fdGh1bWJIb3Jpem9udGFsRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9jYWNoZS5ldmVudHMuY2xpY2tIb3Jpem9udGFsVGh1bWJIYW5kbGVyKTtcbiAgICB0aGlzLl9kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fY2FjaGUuZXZlbnRzLm1vdXNlVXBEb2N1bWVudEhhbmRsZXIpO1xuICAgIHRoaXMuX2RvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2NhY2hlLmV2ZW50cy5tb3VzZU1vdmVEb2N1bWVudEhhbmRsZXIpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgR2VtaW5pU2Nyb2xsYmFyLnByb3RvdHlwZS5fc2Nyb2xsSGFuZGxlciA9IGZ1bmN0aW9uIF9zY3JvbGxIYW5kbGVyKCkge1xuICAgIHZhciB4ID0gKHRoaXMuX3ZpZXdFbGVtZW50LnNjcm9sbExlZnQgKiB0aGlzLl90cmFja0xlZnRNYXggLyB0aGlzLl9zY3JvbGxMZWZ0TWF4KSB8fCAwO1xuICAgIHZhciB5ID0gKHRoaXMuX3ZpZXdFbGVtZW50LnNjcm9sbFRvcCAqIHRoaXMuX3RyYWNrVG9wTWF4IC8gdGhpcy5fc2Nyb2xsVG9wTWF4KSB8fCAwO1xuXG4gICAgdGhpcy5fdGh1bWJIb3Jpem9udGFsRWxlbWVudC5zdHlsZS5tc1RyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyB4ICsgJ3B4KSc7XG4gICAgdGhpcy5fdGh1bWJIb3Jpem9udGFsRWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoJyArIHggKyAncHgsIDAsIDApJztcbiAgICB0aGlzLl90aHVtYkhvcml6b250YWxFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnICsgeCArICdweCwgMCwgMCknO1xuXG4gICAgdGhpcy5fdGh1bWJWZXJ0aWNhbEVsZW1lbnQuc3R5bGUubXNUcmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgnICsgeSArICdweCknO1xuICAgIHRoaXMuX3RodW1iVmVydGljYWxFbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgwLCAnICsgeSArICdweCwgMCknO1xuICAgIHRoaXMuX3RodW1iVmVydGljYWxFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgwLCAnICsgeSArICdweCwgMCknO1xuICB9O1xuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUuX3Jlc2l6ZUhhbmRsZXIgPSBmdW5jdGlvbiBfcmVzaXplSGFuZGxlcigpIHtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIGlmICh0aGlzLm9uUmVzaXplKSB7XG4gICAgICB0aGlzLm9uUmVzaXplKCk7XG4gICAgfVxuICB9O1xuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUuX2NsaWNrVmVydGljYWxUcmFja0hhbmRsZXIgPSBmdW5jdGlvbiBfY2xpY2tWZXJ0aWNhbFRyYWNrSGFuZGxlcihlKSB7XG4gICAgdmFyIG9mZnNldCA9IGUub2Zmc2V0WSAtIHRoaXMuX25hdHVyYWxUaHVtYlNpemVZICogLjVcbiAgICAgICwgdGh1bWJQb3NpdGlvblBlcmNlbnRhZ2UgPSBvZmZzZXQgKiAxMDAgLyB0aGlzLl9zY3JvbGxiYXJWZXJ0aWNhbEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuXG4gICAgdGhpcy5fdmlld0VsZW1lbnQuc2Nyb2xsVG9wID0gdGh1bWJQb3NpdGlvblBlcmNlbnRhZ2UgKiB0aGlzLl92aWV3RWxlbWVudC5zY3JvbGxIZWlnaHQgLyAxMDA7XG4gIH07XG5cbiAgR2VtaW5pU2Nyb2xsYmFyLnByb3RvdHlwZS5fY2xpY2tIb3Jpem9udGFsVHJhY2tIYW5kbGVyID0gZnVuY3Rpb24gX2NsaWNrSG9yaXpvbnRhbFRyYWNrSGFuZGxlcihlKSB7XG4gICAgdmFyIG9mZnNldCA9IGUub2Zmc2V0WCAtIHRoaXMuX25hdHVyYWxUaHVtYlNpemVYICogLjVcbiAgICAgICwgdGh1bWJQb3NpdGlvblBlcmNlbnRhZ2UgPSBvZmZzZXQgKiAxMDAgLyB0aGlzLl9zY3JvbGxiYXJIb3Jpem9udGFsRWxlbWVudC5jbGllbnRXaWR0aDtcblxuICAgIHRoaXMuX3ZpZXdFbGVtZW50LnNjcm9sbExlZnQgPSB0aHVtYlBvc2l0aW9uUGVyY2VudGFnZSAqIHRoaXMuX3ZpZXdFbGVtZW50LnNjcm9sbFdpZHRoIC8gMTAwO1xuICB9O1xuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUuX2NsaWNrVmVydGljYWxUaHVtYkhhbmRsZXIgPSBmdW5jdGlvbiBfY2xpY2tWZXJ0aWNhbFRodW1iSGFuZGxlcihlKSB7XG4gICAgdGhpcy5fc3RhcnREcmFnKGUpO1xuICAgIHRoaXMuX3ByZXZQYWdlWSA9IHRoaXMuX3RodW1iU2l6ZVkgLSBlLm9mZnNldFk7XG4gIH07XG5cbiAgR2VtaW5pU2Nyb2xsYmFyLnByb3RvdHlwZS5fY2xpY2tIb3Jpem9udGFsVGh1bWJIYW5kbGVyID0gZnVuY3Rpb24gX2NsaWNrSG9yaXpvbnRhbFRodW1iSGFuZGxlcihlKSB7XG4gICAgdGhpcy5fc3RhcnREcmFnKGUpO1xuICAgIHRoaXMuX3ByZXZQYWdlWCA9IHRoaXMuX3RodW1iU2l6ZVggLSBlLm9mZnNldFg7XG4gIH07XG5cbiAgR2VtaW5pU2Nyb2xsYmFyLnByb3RvdHlwZS5fc3RhcnREcmFnID0gZnVuY3Rpb24gX3N0YXJ0RHJhZyhlKSB7XG4gICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICB0aGlzLl9jdXJzb3JEb3duID0gdHJ1ZTtcbiAgICBhZGRDbGFzcyhkb2N1bWVudC5ib2R5LCBbQ0xBU1NOQU1FUy5kaXNhYmxlXSk7XG4gICAgdGhpcy5fZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fY2FjaGUuZXZlbnRzLm1vdXNlTW92ZURvY3VtZW50SGFuZGxlcik7XG4gICAgdGhpcy5fZG9jdW1lbnQub25zZWxlY3RzdGFydCA9IGZ1bmN0aW9uKCkge3JldHVybiBmYWxzZTt9O1xuICB9O1xuXG4gIEdlbWluaVNjcm9sbGJhci5wcm90b3R5cGUuX21vdXNlVXBEb2N1bWVudEhhbmRsZXIgPSBmdW5jdGlvbiBfbW91c2VVcERvY3VtZW50SGFuZGxlcigpIHtcbiAgICB0aGlzLl9jdXJzb3JEb3duID0gZmFsc2U7XG4gICAgdGhpcy5fcHJldlBhZ2VYID0gdGhpcy5fcHJldlBhZ2VZID0gMDtcbiAgICByZW1vdmVDbGFzcyhkb2N1bWVudC5ib2R5LCBbQ0xBU1NOQU1FUy5kaXNhYmxlXSk7XG4gICAgdGhpcy5fZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fY2FjaGUuZXZlbnRzLm1vdXNlTW92ZURvY3VtZW50SGFuZGxlcik7XG4gICAgdGhpcy5fZG9jdW1lbnQub25zZWxlY3RzdGFydCA9IG51bGw7XG4gIH07XG5cbiAgR2VtaW5pU2Nyb2xsYmFyLnByb3RvdHlwZS5fbW91c2VNb3ZlRG9jdW1lbnRIYW5kbGVyID0gZnVuY3Rpb24gX21vdXNlTW92ZURvY3VtZW50SGFuZGxlcihlKSB7XG4gICAgaWYgKHRoaXMuX2N1cnNvckRvd24gPT09IGZhbHNlKSB7cmV0dXJuO31cblxuICAgIHZhciBvZmZzZXQsIHRodW1iQ2xpY2tQb3NpdGlvbjtcblxuICAgIGlmICh0aGlzLl9wcmV2UGFnZVkpIHtcbiAgICAgIG9mZnNldCA9IGUuY2xpZW50WSAtIHRoaXMuX3Njcm9sbGJhclZlcnRpY2FsRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XG4gICAgICB0aHVtYkNsaWNrUG9zaXRpb24gPSB0aGlzLl90aHVtYlNpemVZIC0gdGhpcy5fcHJldlBhZ2VZO1xuXG4gICAgICB0aGlzLl92aWV3RWxlbWVudC5zY3JvbGxUb3AgPSB0aGlzLl9zY3JvbGxUb3BNYXggKiAob2Zmc2V0IC0gdGh1bWJDbGlja1Bvc2l0aW9uKSAvIHRoaXMuX3RyYWNrVG9wTWF4O1xuXG4gICAgICByZXR1cm4gdm9pZCAwO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wcmV2UGFnZVgpIHtcbiAgICAgIG9mZnNldCA9IGUuY2xpZW50WCAtIHRoaXMuX3Njcm9sbGJhckhvcml6b250YWxFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XG4gICAgICB0aHVtYkNsaWNrUG9zaXRpb24gPSB0aGlzLl90aHVtYlNpemVYIC0gdGhpcy5fcHJldlBhZ2VYO1xuXG4gICAgICB0aGlzLl92aWV3RWxlbWVudC5zY3JvbGxMZWZ0ID0gdGhpcy5fc2Nyb2xsTGVmdE1heCAqIChvZmZzZXQgLSB0aHVtYkNsaWNrUG9zaXRpb24pIC8gdGhpcy5fdHJhY2tMZWZ0TWF4O1xuICAgIH1cbiAgfTtcblxuICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBHZW1pbmlTY3JvbGxiYXI7XG4gIH0gZWxzZSB7XG4gICAgd2luZG93LkdlbWluaVNjcm9sbGJhciA9IEdlbWluaVNjcm9sbGJhcjtcbiAgfVxufSkoKTtcbiIsImltcG9ydCBHZW1pbmlTY3JvbGxsYmFyIGZyb20gJ2dlbWluaS1zY3JvbGxiYXInO1xuXG5uZXcgR2VtaW5pU2Nyb2xsbGJhcih7XG4gIGVsZW1lbnQ6IGRvY3VtZW50LmJvZHksXG4gIGNyZWF0ZUVsZW1lbnRzOiBmYWxzZVxufSkuY3JlYXRlKCk7XG5cbm5ldyBHZW1pbmlTY3JvbGxsYmFyKHtcbiAgZWxlbWVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmV4MSAubGlzdC1jb250YWluZXInKVxufSkuY3JlYXRlKCk7XG5cbm5ldyBHZW1pbmlTY3JvbGxsYmFyKHtcbiAgZWxlbWVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmV4MiAuY29kZScpXG59KS5jcmVhdGUoKTtcblxubmV3IEdlbWluaVNjcm9sbGxiYXIoe1xuICBlbGVtZW50OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZXgzIC5ib3gnKVxufSkuY3JlYXRlKCk7XG5cbm5ldyBHZW1pbmlTY3JvbGxsYmFyKHtcbiAgZWxlbWVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmV4NCAubWFuaWxsYScpXG59KS5jcmVhdGUoKTtcblxubmV3IEdlbWluaVNjcm9sbGxiYXIoe1xuICBlbGVtZW50OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZXg1IC5zYW1wbGUnKVxufSkuY3JlYXRlKCk7XG5cbm5ldyBHZW1pbmlTY3JvbGxsYmFyKHtcbiAgZWxlbWVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmV4NiAuc2FtcGxlJylcbn0pLmNyZWF0ZSgpO1xuIl0sIm5hbWVzIjpbInRoaXMiLCJHZW1pbmlTY3JvbGxsYmFyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFNQSxDQUFDLFdBQVc7RUFDVixJQUFJLGVBQWUsRUFBRSxrQkFBa0IsRUFBRSxVQUFVLENBQUM7O0VBRXBELFVBQVUsR0FBRztJQUNYLE9BQU8sRUFBRSx3QkFBd0I7SUFDakMsaUJBQWlCLEVBQUUsd0JBQXdCO0lBQzNDLG1CQUFtQixFQUFFLDBCQUEwQjtJQUMvQyxLQUFLLEVBQUUsT0FBTztJQUNkLElBQUksRUFBRSxnQkFBZ0I7SUFDdEIsUUFBUSxFQUFFLGFBQWE7SUFDdkIsT0FBTyxFQUFFLGdDQUFnQztJQUN6QyxTQUFTLEVBQUUsY0FBYztJQUN6QixhQUFhLEVBQUUsbUJBQW1CO0dBQ25DLENBQUM7O0VBRUYsU0FBUyxpQkFBaUIsR0FBRztJ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