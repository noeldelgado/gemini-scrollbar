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
        Object.keys(config || {}).forEach(function (propertyName) {
            this[propertyName] = config[propertyName];
        }, this);

        this.viewElement = this.element.querySelector('.gm-scroll-view');
        this.thumbVerticalElement = this.element.querySelector('.gm-scrollbar.-vertical .thumb');
        this.thumbHorizontalElement = this.element.querySelector('.gm-scrollbar.-horizontal .thumb');

        var scrollbarWidth = Helpers.getScrollbarWidth();
        this.viewElement.style.right = scrollbarWidth + 'px';
        this.viewElement.style.bottom = scrollbarWidth + 'px';
        if (scrollbarWidth === 0) {
            /* OS X: show scroll bars automatically option is on */
            return document.body.classList.add('gm-hide-custom-scrollbars');
        }

        this.update();

        this.viewElement.addEventListener('scroll', this.scrollHandler.bind(this));
    }

    GeminiScrollbar.prototype.scrollHandler = function(e) {
        var y = (e.target.scrollTop * 100 / this.viewElement.clientHeight);
        var x = (e.target.scrollLeft * 100 / this.viewElement.clientWidth);

        this.thumbVerticalElement.style.transform = 'translateY(' + y + '%)';
        this.thumbHorizontalElement.style.transform = 'translateX(' + x + '%)';

        return this;
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
    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = GeminiScrollbar;
    } else window.GeminiScrollbar = GeminiScrollbar;
})()
