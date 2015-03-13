/**
 * gemini-scrollbar
 * @version v0.0.1
 * @link http://noeldelgado.github.io/gemini-scrollbar/
 * @license MIT
 */
(function() {

    var Helpers = {
        getScrollbarWidth : function() {
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

            return (widthWithScroll - widthNoScroll);
        }
    };

    function GeminiScrollbar(config) {
        this.autoshow = false;

        Object.keys(config || {}).forEach(function (propertyName) {
            this[propertyName] = config[propertyName];
        }, this);

        this.viewElement = this.element.querySelector('.gm-scroll-view');
        this.scrollbarVerticalElement = this.element.querySelector('.gm-scrollbar.-vertical');
        this.thumbVerticalElement = this.scrollbarVerticalElement.querySelector('.thumb');
        this.scrollbarHorizontalElement = this.element.querySelector('.gm-scrollbar.-horizontal');
        this.thumbHorizontalElement = this.scrollbarHorizontalElement.querySelector('.thumb');

        var scrollbarWidth = Helpers.getScrollbarWidth();
        this.viewElement.style.right = scrollbarWidth + 'px';
        this.viewElement.style.bottom = scrollbarWidth + 'px';
        if (scrollbarWidth === 0) {
            /* OS X: show scroll bars automatically option is on */
            return document.body.classList.add('gm-hide-custom-scrollbars');
        }

        if (this.autoshow) {
            this.element.classList.add('gm-autoshow');
        }

        this.update();

        /* bindEvents */
        this.viewElement.addEventListener('scroll', this._scrollHandler.bind(this));
        this.scrollbarVerticalElement.addEventListener('mousedown', this._clickVerticalTrackHandler.bind(this));
        this.scrollbarHorizontalElement.addEventListener('mousedown', this._clickHorizontalTrackHandler.bind(this));
        this.thumbVerticalElement.addEventListener('mousedown', this._clickVerticalThumbHandler.bind(this));
        this.thumbHorizontalElement.addEventListener('mousedown', this._clickHorizontalThumbHandler.bind(this));
        document.addEventListener('mouseup', this._mouseupDocumentHandler.bind(this));
        document.addEventListener('mousemove', this._mousemoveDocumentHandler.bind(this));
    }

    GeminiScrollbar.prototype._scrollHandler = function(e) {
        var y = (e.target.scrollTop * 100 / this.viewElement.clientHeight);
        var x = (e.target.scrollLeft * 100 / this.viewElement.clientWidth);

        this.thumbVerticalElement.style.transform = 'translateY(' + y + '%)';
        return this.thumbHorizontalElement.style.transform = 'translateX(' + x + '%)';
    };

    GeminiScrollbar.prototype._clickVerticalTrackHandler = function(e) {
        var offset = Math.abs(e.target.getBoundingClientRect().top - e.clientY);
        var thumbHalf = this.thumbVerticalElement.getBoundingClientRect().height / 2;
        var thumbPositionPercentage = (offset - thumbHalf) * 100 / this.viewElement.clientHeight;

        return this.viewElement.scrollTop = (thumbPositionPercentage * this.viewElement.scrollHeight / 100);
    };

    GeminiScrollbar.prototype._clickHorizontalTrackHandler = function(e) {
        var offset = Math.abs(e.target.getBoundingClientRect().left - e.clientX);
        var thumbHalf = this.thumbHorizontalElement.getBoundingClientRect().width / 2;
        var thumbPositionPercentage = (offset - thumbHalf) * 100 / this.viewElement.clientWidth;

        return this.viewElement.scrollLeft = (thumbPositionPercentage * this.viewElement.scrollWidth / 100);
    };

    GeminiScrollbar.prototype._clickVerticalThumbHandler = function(e) {
        e.stopImmediatePropagation();
        this.cursorDown = true;
        this.prevPageY = e.currentTarget.getBoundingClientRect().height - (e.clientY - e.currentTarget.getBoundingClientRect().top);

        return document.body.classList.add('gm-scrollbar-disable-selection');
    };

    GeminiScrollbar.prototype._clickHorizontalThumbHandler = function(e) {
        e.stopImmediatePropagation();
        this.cursorDown = true;
        this.prevPageX = e.currentTarget.getBoundingClientRect().width - (e.clientX - e.currentTarget.getBoundingClientRect().left);

        return document.body.classList.add('gm-scrollbar-disable-selection');
    };

    GeminiScrollbar.prototype._mouseupDocumentHandler = function(e) {
        this.cursorDown = false;
        return document.body.classList.remove('scrollbar-disable-selection');
    };

    GeminiScrollbar.prototype._mousemoveDocumentHandler = function(e) {
        if (this.cursorDown) {
            var offset = (this.scrollbarVerticalElement.getBoundingClientRect().top - e.clientY) * -1;
            var thumbHalf = this.thumbVerticalElement.getBoundingClientRect().height - this.prevPageY;
            var thumbPercentage = ((offset-thumbHalf)) * 100 / this.viewElement.clientHeight;

            var offseth = (this.scrollbarHorizontalElement.getBoundingClientRect().left - e.clientX) * -1;
            var thumbHalfh = this.thumbHorizontalElement.getBoundingClientRect().width - this.prevPageX;
            var thumbPercentageh = ((offseth-thumbHalfh)) * 100 / this.viewElement.clientWidth;

            this.viewElement.scrollTop = (thumbPercentage * this.viewElement.scrollHeight / 100);
            return this.viewElement.scrollLeft = (thumbPercentageh * this.viewElement.scrollWidth / 100);
        }
    };

    GeminiScrollbar.prototype.update = function() {
        var heightPercentage = (this.viewElement.clientHeight * 100 / this.viewElement.scrollHeight);
        var widthPercentage = (this.viewElement.clientWidth * 100 / this.viewElement.scrollWidth);

        if (heightPercentage < 100) {
            this.thumbVerticalElement.style.height = heightPercentage + '%';
        }

        if (widthPercentage < 100) {
            this.thumbHorizontalElement.style.width = widthPercentage + '%';
        }

        return this;
    };

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = GeminiScrollbar;
    } else window.GeminiScrollbar = GeminiScrollbar;
})()
