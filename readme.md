# gemini-scrollbar

Custom scrollbars with native scrolling.

## Dependencies
None

## Usage
### Browser
```
<link src="<path-to-gemini-scrollbar>/gemini-scrollbar.css">
<script src="<path-to-gemini-scrollbar>/index.js"></script>
<script>
    var myScrollbar = new GeminiScrollbar({
        element: document.querySelector('#my-scrollbar')
    }).create();
</script>
```

### Bower
```bash
bower install gemini-scrollbar --save
```

### CommonJS
```bash
npm install gemini-scrollbar --save
```
```js
var GeminiScrollbar = require('gemini-scrollbar')

var myScrollbar = new GeminiScrollbar({
    element: document.querySelector('.my-scrollbar')
}).create();
```

## Methods
### Create
Bind the events, create the required elements and display the scrollbars.
```js
myScrollbar.create();
```

### Update
Recalculate the viewbox and scrollbar dimensions.
```js
myScrollbar.update();
```

### Destroy
Unbind the events and remove the custom scrollbar elements.
```js
myScrollbar.destroy();
```