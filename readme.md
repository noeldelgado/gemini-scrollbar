<h1> 
gemini-scrollbar 
<sup style="font-size: .45em">
<code>1.0.2</code>
</sup>
</h1>

Custom overlay scrollbars with native scrolling mechanism.


## Demo
[http://noeldelgado.github.io/gemini-scrollbar/](http://noeldelgado.github.io/gemini-scrollbar/)

## Dependencies
None

## Installation

**NPM**

```sh
npm i gemini-scrollbar --save
```

**Bower**

```sh
bower install gemini-scrollbar --save
```

## Usage

**JS**

```js
var GeminiScrollbar = require('gemini-scrollbar')

var myScrollbar = new GeminiScrollbar({
    element: document.querySelector('.my-scrollbar')
}).create();
```

**LESS**

```less
@import (css) "<path-to-gemini-scrollbar>/gemini-scrollbar.css";
```

**CSS**

```css
@import url(<path-to-gemini-scrollbar>/gemini-scrollbar.css);
```

Or, you can add the relevant files in your document.

```html
<link href="<path-to-gemini-scrollbar>/gemini-scrollbar.css" rel="stylesheet">
<script src="<path-to-gemini-scrollbar>/index.js"></script>
```

## Options

name | type | default | description
:--- | :--- | :--- | :---
* **element** | HTMLElement | `null` | The element to apply scrollbars
autoshow | Boolean | `false` | Show scrollbars upon hovering
createElements | Boolean | `true` | Create and append the require HTMLElements at runtime.

\* `required`

## Methods

name | description
:--- | :---
create | Bind the events, create the required elements and display the scrollbars.
update | Recalculate the viewbox and scrollbar dimensions.
destroy | Unbind the events and remove the custom scrollbar elements.

## Customization

You can change the styles of the scrollbars using CSS. e.g:

```css
/* override gemini-scrollbar default styles */

/* vertical scrollbar track */
.gm-scrollbar.-vertical {
  background-color: #f0f0f0
}

/* horizontal scrollbar track */
.gm-scrollbar.-horizontal {
  background-color: transparent;
}

/* scrollbar thumb */
.gm-scrollbar .thumb {
  background-color: rebeccapurple;
}
.gm-scrollbar .thumb:hover {
  background-color: fuchsia;
}
```

## Notes

- **native overlay-scrollbar:** We check the scrollbar size before doing anything else [using this approach](http://davidwalsh.name/detect-scrollbar-width) by David Walsh. If the scrollbar width is equal to zero (which means the scrollbars are “over the content”) then we do nothing but add the `gm-prevented` class selector to the element, which adds the `-webkit-overflow-scrolling: touch;` declaration to it and also `display: none;` for the gemini-scrollbar's elements. No event binding, element creation... nothing, in this case we leave the OS do its job. Why? you already have nice looking scrollbars for free.
- **create method:** The custom scrollbars will **not** render until you call the `create` method on the instance. i.e: `myScrollbar.create();`
- **required height:** To avoid unexpected results, it is recommended that you specify the `height` property with a value to the element you applying the custom scrollbars.
- **body tag:** If you want to apply custom scrollbars to `body`, make sure to declare a `height` value either to the `:root` pseudo-class or to the `html` element. e.g:

	```css
	html {
		height: 100%;
		/* or */
		height: 100vh;
	}
	```
- **createElements option:** The `createElements` option specify wheater or not gemini-scrollbar should create and append the require HTMLElements at runtime. Its default value is `true`. Passing this option as `false` will assume that you to have added the required markup with the specific CSS class selectors on them for it to work. i.e:

	```html
	<-- (createElements: false) example markup -->

	<div class="something-scrollable">
	  <div class="gm-scrollbar -vertical">
	    <div class="thumb"></div>
	  </div>
	  <div class="gm-scrollbar -horizontal">
	    <div class="thumb"></div>
	  </div>
	  <div class="gm-scroll-view">
	    All your content goes here.
	  </div>
	</div>
	```
This way you can be sure the library will not touch/modify your nodes structure. You can read more about the reason of this option [on this commit](https://github.com/noeldelgado/gemini-scrollbar/commit/2bb73c82f9d1588fb267fba08518adfe1170885c).

## License
MIT © [Noel Delgado](http://pixelia.me/)