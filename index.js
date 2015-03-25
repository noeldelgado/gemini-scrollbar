/**
 * gemini-scrollbar
 * @version v0.0.2
 * @link http://noeldelgado.github.io/gemini-scrollbar/
 * @license MIT
 */
(function() {
    var SCROLLBAR_WIDTH, CLASSNAMES;

    SCROLLBAR_WIDTH = (function() {
        /* http://stackoverflow.com/questions/13382516/getting-scroll-bar-width-using-javascript#answer-13382873 */
        var tmpElement = document.createElement("div");
        tmpElement.style.visibility = "hidden";
        tmpElement.style.width = "100px";
        tmpElement.style.msOverflowStyle = "scrollbar";
        document.body.appendChild(tmpElement);

        var widthNoScroll = tmpElement.offsetWidth;
        var inner = document.createElement("div");
        tmpElement.style.overflow = "scroll";
        inner.style.width = "100%";
        tmpElement.appendChild(inner);
        var widthWithScroll = inner.offsetWidth;
        tmpElement.parentNode.removeChild(tmpElement);

        return (widthNoScroll - widthWithScroll);
    }());

    CLASSNAMES = {
        element: 'gm-scrollbar-container',
        verticalScrollbar: 'gm-scrollbar -vertical',
        horizontalScrollbar: 'gm-scrollbar -horizontal',
        thumb: 'thumb',
        view: 'gm-scroll-view',
        autoshow: 'gm-autoshow',
        disable: 'gm-scrollbar-disable-selection',
        smoothScrolling: 'gm-smooth-scrolling'
    };

    function GeminiScrollbar(config) {
        this.element = null;
        this.autoshow = false;

        Object.keys(config || {}).forEach(function (propertyName) {
            this[propertyName] = config[propertyName];
        }, this);

        this._cache = {events: {}};
        this._created = false;
        this._cursorDown = false;
        this._prevPageX = 0;
        this._prevPageY = 0;

        this._document = null;
        this._window = null;
        this._viewElement = null;
        this._scrollbarVerticalElement = null;
        this._thumbVerticalElement = null;
        this._scrollbarHorizontalElement = null;
        this._scrollbarHorizontalElement = null;
    }

    GeminiScrollbar.prototype.create = function create() {
        if (SCROLLBAR_WIDTH === 0) {
            this.element.classList.add(CLASSNAMES.smoothScrolling);
            return this;
        }

        if (this._created === true) {
            console.warn('calling on a already-created object');
            return this;
        }

        if (this.autoshow) {
            this.element.classList.add(CLASSNAMES.autoshow);
        }

        this._document = document;
        this._window = window;
        this._viewElement = document.createElement('div');
        this._scrollbarVerticalElement = document.createElement('div');
        this._thumbVerticalElement = document.createElement('div');
        this._scrollbarHorizontalElement = document.createElement('div');
        this._thumbHorizontalElement = document.createElement('div');
        while(this.element.childNodes.length > 0) {
            this._viewElement.appendChild(this.element.childNodes[0]);
        }

        this.element.classList.add(CLASSNAMES.element);
        this._viewElement.className = CLASSNAMES.view;
        this._scrollbarVerticalElement.className = CLASSNAMES.verticalScrollbar;
        this._scrollbarHorizontalElement.className = CLASSNAMES.horizontalScrollbar;
        this._thumbVerticalElement.className = CLASSNAMES.thumb;
        this._thumbHorizontalElement.className = CLASSNAMES.thumb;

        this._scrollbarVerticalElement.appendChild(this._thumbVerticalElement);
        this._scrollbarHorizontalElement.appendChild(this._thumbHorizontalElement);
        this.element.appendChild(this._scrollbarVerticalElement);
        this.element.appendChild(this._scrollbarHorizontalElement);
        this.element.appendChild(this._viewElement);

        this._created = true;

        return this._bindEvents().update();
    };

    GeminiScrollbar.prototype.update = function update() {
        if (SCROLLBAR_WIDTH === 0) return this;

        if (this._created === false) {
            console.warn('calling on a not-yet-created object');
            return this;
        }

        var heightPercentage, widthPercentage;

        this._viewElement.style.width = ((this.element.offsetWidth + SCROLLBAR_WIDTH).toString() + 'px');
        this._viewElement.style.height = ((this.element.offsetHeight + SCROLLBAR_WIDTH).toString() + 'px');

        heightPercentage = (this._viewElement.clientHeight * 100 / this._viewElement.scrollHeight);
        widthPercentage = (this._viewElement.clientWidth * 100 / this._viewElement.scrollWidth);

        this._thumbVerticalElement.style.height = (heightPercentage < 100) ? (heightPercentage + '%') : '';
        this._thumbHorizontalElement.style.width = (widthPercentage < 100) ? (widthPercentage + '%') : '';

        this._scrollHandler();

        return this;
    };

    GeminiScrollbar.prototype.destroy = function destroy() {
        if (SCROLLBAR_WIDTH === 0) return this;

        if (this._created === false) {
            console.warn('calling on a not-yet-created object');
            return this;
        }

        this._unbinEvents();

        this.element.classList.remove(CLASSNAMES.element, CLASSNAMES.autoshow);
        this.element.removeChild(this._scrollbarVerticalElement);
        this.element.removeChild(this._scrollbarHorizontalElement);
        while(this._viewElement.childNodes.length > 0) {
            this.element.appendChild(this._viewElement.childNodes[0]);
        }
        this.element.removeChild(this._viewElement);

        this._created = false;

        return null;
    };

    GeminiScrollbar.prototype._bindEvents = function() {
        this._cache.events.scrollHandler = this._scrollHandler.bind(this);
        this._cache.events.clickVerticalTrackHandler = this._clickVerticalTrackHandler.bind(this);
        this._cache.events.clickHorizontalTrackHandler = this._clickHorizontalTrackHandler.bind(this);
        this._cache.events.clickVerticalThumbHandler = this._clickVerticalThumbHandler.bind(this);
        this._cache.events.clickHorizontalThumbHandler = this._clickHorizontalThumbHandler.bind(this);
        this._cache.events.mouseUpDocumentHandler = this._mouseUpDocumentHandler.bind(this);
        this._cache.events.mouseMoveDocumentHandler = this._mouseMoveDocumentHandler.bind(this);
        this._cache.events.resizeWindowHandler = this.update.bind(this);

        this._viewElement.addEventListener('scroll', this._cache.events.scrollHandler);
        this._scrollbarVerticalElement.addEventListener('mousedown', this._cache.events.clickVerticalTrackHandler);
        this._scrollbarHorizontalElement.addEventListener('mousedown', this._cache.events.clickHorizontalTrackHandler);
        this._thumbVerticalElement.addEventListener('mousedown', this._cache.events.clickVerticalThumbHandler);
        this._thumbHorizontalElement.addEventListener('mousedown', this._cache.events.clickHorizontalThumbHandler);
        this._document.addEventListener('mouseup', this._cache.events.mouseUpDocumentHandler);
        this._window.addEventListener('resize', this._cache.events.resizeWindowHandler);

        return this;
    };

    GeminiScrollbar.prototype._unbinEvents = function() {
        this._viewElement.removeEventListener('scroll', this._cache.events.scrollHandler);
        this._scrollbarVerticalElement.removeEventListener('mousedown', this._cache.events.clickVerticalTrackHandler);
        this._scrollbarHorizontalElement.removeEventListener('mousedown', this._cache.events.clickHorizontalTrackHandler);
        this._thumbVerticalElement.removeEventListener('mousedown', this._cache.events.clickVerticalThumbHandler);
        this._thumbHorizontalElement.removeEventListener('mousedown', this._cache.events.clickHorizontalThumbHandler);
        this._document.removeEventListener('mouseup', this._cache.events.mouseUpDocumentHandler);
        this._document.removeEventListener('mousemove', this._cache.events.mouseMoveDocumentHandler);
        this._window.removeEventListener('resize', this._cache.events.resizeWindowHandler);

        return this;
    };

    GeminiScrollbar.prototype._scrollHandler = function() {
        var viewElement, x, y;

        viewElement = this._viewElement;
        y = ((viewElement.scrollTop * 100) / viewElement.clientHeight);
        x = ((viewElement.scrollLeft * 100) / viewElement.clientWidth);

        this._thumbVerticalElement.style.transform = 'translateY(' + y + '%)';
        this._thumbHorizontalElement.style.transform = 'translateX(' + x + '%)';
    };

    GeminiScrollbar.prototype._clickVerticalTrackHandler = function(e) {
        var offset = Math.abs(e.target.getBoundingClientRect().top - e.clientY);
        var thumbHalf = (this._thumbVerticalElement.offsetHeight / 2);
        var thumbPositionPercentage = ((offset - thumbHalf) * 100 / this._viewElement.clientHeight);

        this._viewElement.scrollTop = (thumbPositionPercentage * this._viewElement.scrollHeight / 100);
    };

    GeminiScrollbar.prototype._clickHorizontalTrackHandler = function(e) {
        var offset = Math.abs(e.target.getBoundingClientRect().left - e.clientX);
        var thumbHalf = (this._thumbHorizontalElement.offsetWidth / 2);
        var thumbPositionPercentage = ((offset - thumbHalf) * 100 / this._viewElement.clientWidth);

        this._viewElement.scrollLeft = (thumbPositionPercentage * this._viewElement.scrollWidth / 100);
    };

    GeminiScrollbar.prototype._clickVerticalThumbHandler = function(e) {
        this._startDrag(e);
        this._prevPageY = (e.currentTarget.offsetHeight - (e.clientY - e.currentTarget.getBoundingClientRect().top));
    };

    GeminiScrollbar.prototype._clickHorizontalThumbHandler = function(e) {
        this._startDrag(e);
        this._prevPageX = (e.currentTarget.offsetWidth - (e.clientX - e.currentTarget.getBoundingClientRect().left));
    };

    GeminiScrollbar.prototype._startDrag = function(e) {
        e.stopImmediatePropagation();
        this._cursorDown = true;
        document.body.classList.add(CLASSNAMES.disable);
        this._document.addEventListener('mousemove', this._cache.events.mouseMoveDocumentHandler);
    };

    GeminiScrollbar.prototype._mouseUpDocumentHandler = function() {
        this._cursorDown = false;
        this._prevPageX = 0;
        this._prevPageY = 0;
        document.body.classList.remove(CLASSNAMES.disable);
        this._document.removeEventListener('mousemove', this._cache.events.mouseMoveDocumentHandler);
    };

    GeminiScrollbar.prototype._mouseMoveDocumentHandler = function(e) {
        if (this._cursorDown === false) {
            return;
        }

        var offset, thumbClickPosition, thumbPositionPercentage;

        if (this._prevPageY) {
            offset = ((this._scrollbarVerticalElement.getBoundingClientRect().top - e.clientY) * -1);
            thumbClickPosition = (this._thumbVerticalElement.offsetHeight - this._prevPageY);
            thumbPositionPercentage = ((offset - thumbClickPosition) * 100 / this._viewElement.clientHeight);

            return this._viewElement.scrollTop = (thumbPositionPercentage * this._viewElement.scrollHeight / 100);
        }

        if (this._prevPageX) {
            offset = ((this._scrollbarHorizontalElement.getBoundingClientRect().left - e.clientX) * -1);
            thumbClickPosition = (this._thumbHorizontalElement.offsetWidth - this._prevPageX);
            thumbPositionPercentage = ((offset - thumbClickPosition) * 100 / this._viewElement.clientWidth);

            return this._viewElement.scrollLeft = (thumbPositionPercentage * this._viewElement.scrollWidth / 100);
        }
    };

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = GeminiScrollbar;
    } else window.GeminiScrollbar = GeminiScrollbar;
})();
