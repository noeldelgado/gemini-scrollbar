
var GeminiScrolllbar = require('gemini-scrollbar');

var ex0 = new GeminiScrolllbar({
    element : document.body,
    createElements : false
}).create();

var ex1 = new GeminiScrolllbar({
    element: document.querySelector('.ex1 .list-container')
}).create();

var ex2 = new GeminiScrolllbar({
    element: document.querySelector('.ex2 .code')
}).create();

var ex3 = new GeminiScrolllbar({
    element: document.querySelector('.ex3 .box')
}).create();

var ex4 = new GeminiScrolllbar({
    element: document.querySelector('.ex4 .manilla')
}).create();

var ex5 = new GeminiScrolllbar({
    element: document.querySelector('.ex5 .sample')
}).create();

var ex6 = new GeminiScrolllbar({
    element: document.querySelector('.ex6 .sample')
}).create();
