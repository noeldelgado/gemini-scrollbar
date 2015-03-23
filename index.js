/**
 * gemini-scrollbar
 * @version v0.0.1
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
        disable: 'gm-scrollbar-disable-selection'
    };

    function GeminiScrollbar(config) {
        this.autoshow = false;

        Object.keys(config || {}).forEach(function (propertyName) {
            this[propertyName] = config[propertyName];
        }, this);

        this._cache = {
            events: {}
        };
        this.cursorDown = false;
        this.prevPageX = 0;
        this.prevPageY = 0;
    }

    GeminiScrollbar.prototype.create = function create() {
        if (SCROLLBAR_WIDTH === 0) return this;

        if (this.autoshow) {
            this.element.classList.add(CLASSNAMES.autoshow);
        }

        this.element.classList.add(CLASSNAMES.element);
        this.document = document;
        this.window = window;

        this.viewElement = document.createElement('div');
        this.viewElement.className = CLASSNAMES.view;

        this.scrollbarVerticalElement = document.createElement('div');
        this.scrollbarVerticalElement.className = CLASSNAMES.verticalScrollbar;
        this.thumbVerticalElement = document.createElement('div');
        this.thumbVerticalElement.className = CLASSNAMES.thumb;

        this.scrollbarHorizontalElement = document.createElement('div');
        this.scrollbarHorizontalElement.className = CLASSNAMES.horizontalScrollbar;
        this.thumbHorizontalElement = document.createElement('div');
        this.thumbHorizontalElement.className = CLASSNAMES.thumb;

        while(this.element.childNodes.length > 0) {
            this.viewElement.appendChild(this.element.childNodes[0]);
        }
        this.scrollbarVerticalElement.appendChild(this.thumbVerticalElement);
        this.scrollbarHorizontalElement.appendChild(this.thumbHorizontalElement);
        this.element.appendChild(this.scrollbarVerticalElement);
        this.element.appendChild(this.scrollbarHorizontalElement);
        this.element.appendChild(this.viewElement);

        return this._bindEvents().update();
    };

    GeminiScrollbar.prototype.update = function update() {
        if (SCROLLBAR_WIDTH === 0) return this;

        var heightPercentage, widthPercentage;

        this.viewElement.style.width = this.element.offsetWidth + SCROLLBAR_WIDTH + 'px';
        this.viewElement.style.height = this.element.offsetHeight + SCROLLBAR_WIDTH + 'px';

        heightPercentage = (this.viewElement.clientHeight * 100 / this.viewElement.scrollHeight);
        widthPercentage = (this.viewElement.clientWidth * 100 / this.viewElement.scrollWidth);

        this.thumbVerticalElement.style.height = (heightPercentage < 100) ? (heightPercentage + '%') : '0%';
        this.thumbHorizontalElement.style.width = (widthPercentage < 100) ? (widthPercentage + '%') : '0%';

        heightPercentage = widthPercentage = null;

        return this;
    };

    GeminiScrollbar.prototype.destroy = function destroy() {
        if (SCROLLBAR_WIDTH === 0) {
            return this;
        }

        this._unbinEvents();

        this.element.classList.remove(CLASSNAMES.element, CLASSNAMES.autoshow);
        this.element.removeChild(this.scrollbarVerticalElement);
        this.element.removeChild(this.scrollbarHorizontalElement);
        while(this.viewElement.childNodes.length > 0) {
            this.element.appendChild(this.viewElement.childNodes[0]);
        }
        this.element.removeChild(this.viewElement);

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

        this.viewElement.addEventListener('scroll', this._cache.events.scrollHandler);
        this.scrollbarVerticalElement.addEventListener('mousedown', this._cache.events.clickVerticalTrackHandler);
        this.scrollbarHorizontalElement.addEventListener('mousedown', this._cache.events.clickHorizontalTrackHandler);
        this.thumbVerticalElement.addEventListener('mousedown', this._cache.events.clickVerticalThumbHandler);
        this.thumbHorizontalElement.addEventListener('mousedown', this._cache.events.clickHorizontalThumbHandler);
        this.document.addEventListener('mouseup', this._cache.events.mouseUpDocumentHandler);
        this.document.addEventListener('mousemove', this._cache.events.mouseMoveDocumentHandler);
        this.window.addEventListener('resize', this._cache.events.resizeWindowHandler);

        return this;
    };

    GeminiScrollbar.prototype._unbinEvents = function() {
        this.viewElement.removeEventListener('scroll', this._cache.events.scrollHandler);
        this.scrollbarVerticalElement.removeEventListener('mousedown', this._cache.events.clickVerticalTrackHandler);
        this.scrollbarHorizontalElement.removeEventListener('mousedown', this._cache.events.clickHorizontalTrackHandler);
        this.thumbVerticalElement.removeEventListener('mousedown', this._cache.events.clickVerticalThumbHandler);
        this.thumbHorizontalElement.removeEventListener('mousedown', this._cache.events.clickHorizontalThumbHandler);
        this.document.removeEventListener('mouseup', this._cache.events.mouseUpDocumentHandler);
        this.document.removeEventListener('mousemove', this._cache.events.mouseMoveDocumentHandler);
        this.window.removeEventListener('resize', this._cache.events.resizeWindowHandler);

        return this;
    };

    GeminiScrollbar.prototype._scrollHandler = function(e) {
        var y = (e.target.scrollTop * 100 / this.viewElement.clientHeight);
        var x = (e.target.scrollLeft * 100 / this.viewElement.clientWidth);

        this.thumbVerticalElement.style.transform = 'translateY(' + y + '%)';
        this.thumbHorizontalElement.style.transform = 'translateX(' + x + '%)';
    };

    GeminiScrollbar.prototype._clickVerticalTrackHandler = function(e) {
        var offset = Math.abs(e.target.getBoundingClientRect().top - e.clientY);
        var thumbHalf = this.thumbVerticalElement.getBoundingClientRect().height / 2;
        var thumbPositionPercentage = (offset - thumbHalf) * 100 / this.viewElement.clientHeight;

        this.viewElement.scrollTop = (thumbPositionPercentage * this.viewElement.scrollHeight / 100);
    };

    GeminiScrollbar.prototype._clickHorizontalTrackHandler = function(e) {
        var offset = Math.abs(e.target.getBoundingClientRect().left - e.clientX);
        var thumbHalf = this.thumbHorizontalElement.getBoundingClientRect().width / 2;
        var thumbPositionPercentage = (offset - thumbHalf) * 100 / this.viewElement.clientWidth;

        this.viewElement.scrollLeft = (thumbPositionPercentage * this.viewElement.scrollWidth / 100);
    };

    GeminiScrollbar.prototype._clickVerticalThumbHandler = function(e) {
        e.stopImmediatePropagation();
        this.cursorDown = true;
        this.prevPageY = e.currentTarget.getBoundingClientRect().height - (e.clientY - e.currentTarget.getBoundingClientRect().top);

        document.body.classList.add(CLASSNAMES.disable);
    };

    GeminiScrollbar.prototype._clickHorizontalThumbHandler = function(e) {
        e.stopImmediatePropagation();
        this.cursorDown = true;
        this.prevPageX = e.currentTarget.getBoundingClientRect().width - (e.clientX - e.currentTarget.getBoundingClientRect().left);

        document.body.classList.add(CLASSNAMES.disable);
    };

    GeminiScrollbar.prototype._mouseUpDocumentHandler = function(e) {
        this.cursorDown = false;
        this.prevPageX = 0;
        this.prevPageY = 0;
        document.body.classList.remove(CLASSNAMES.disable);
    };

    GeminiScrollbar.prototype._mouseMoveDocumentHandler = function(e) {
        if (this.cursorDown) {
            var offset, thumbClickPosition, thumbPositionPercentage;

            if (this.prevPageY) {
                offset = (this.scrollbarVerticalElement.getBoundingClientRect().top - e.clientY) * -1;
                thumbClickPosition = this.thumbVerticalElement.getBoundingClientRect().height - this.prevPageY;
                thumbPositionPercentage = ((offset - thumbClickPosition)) * 100 / this.viewElement.clientHeight;

                this.viewElement.scrollTop = (thumbPositionPercentage * this.viewElement.scrollHeight / 100);
            }

            if (this.prevPageX) {
                offset = (this.scrollbarHorizontalElement.getBoundingClientRect().left - e.clientX) * -1;
                thumbClickPosition = this.thumbHorizontalElement.getBoundingClientRect().width - this.prevPageX;
                thumbPositionPercentage = ((offset - thumbClickPosition)) * 100 / this.viewElement.clientWidth;

                this.viewElement.scrollLeft = (thumbPositionPercentage * this.viewElement.scrollWidth / 100);
            }

            offset = thumbClickPosition = thumbPositionPercentage = null;
        }
    };

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = GeminiScrollbar;
    } else window.GeminiScrollbar = GeminiScrollbar;
})();
