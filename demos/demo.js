/* var GeminiScrollbar = require('../'); */

var ex1 = new GeminiScrollbar({
    element: document.querySelector('#example-1')
})

var ex2 = new GeminiScrollbar({
    element: document.querySelector('#example-2'),
    autoshow: true
})

var ex3 = new GeminiScrollbar({
    element: document.querySelector('#example-3')
})
document.querySelector('#example-3 img').addEventListener('load', function() {
    ex3.update()
})

var ex4 = new GeminiScrollbar({
    element: document.querySelector('#example-4'),
    autoshow: true
})

var ex5 = new GeminiScrollbar({
    element: document.querySelector('#example-5'),
    horizontal : true
})

var ex6 = new GeminiScrollbar({
    element: document.querySelector('#example-6'),
})

var ex7 = new GeminiScrollbar({
    element: document.querySelector('#example-7')
})
window.addEventListener('resize', function() {
    ex7.update();
})
