/* var GeminiScrollbar = require('../'); */

var ex0 = new GeminiScrollbar({
    element: document.querySelector('#example-0')
}).create()

var ex1 = new GeminiScrollbar({
    element: document.querySelector('#example-1')
}).create()

var ex2 = new GeminiScrollbar({
    element: document.querySelector('#example-2'),
    autoshow: true
}).create()

var ex3 = new GeminiScrollbar({
    element: document.querySelector('#example-3')
}).create()
document.querySelector('#example-3 img').addEventListener('load', function() {
    ex3.update()
})

var ex4 = new GeminiScrollbar({
    element: document.querySelector('#example-4')
}).create()

var ex5 = new GeminiScrollbar({
    element: document.querySelector('#example-5'),
    horizontal : true
}).create()

var ex6 = new GeminiScrollbar({
    element: document.querySelector('#example-6'),
}).create()

var ex7 = new GeminiScrollbar({
    element: document.querySelector('#example-7')
}).create()
