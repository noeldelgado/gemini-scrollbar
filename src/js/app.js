var GeminiScrolllbar = require('gemini-scrollbar');

new GeminiScrolllbar({
  element: document.body,
  createElements: false
}).create();

new GeminiScrolllbar({
  element: document.querySelector('.ex1 .list-container')
}).create();

new GeminiScrolllbar({
  element: document.querySelector('.ex2 .code')
}).create();

new GeminiScrolllbar({
  element: document.querySelector('.ex3 .box')
}).create();

new GeminiScrolllbar({
  element: document.querySelector('.ex4 .manilla')
}).create();

new GeminiScrolllbar({
  element: document.querySelector('.ex5 .sample')
}).create();

new GeminiScrolllbar({
  element: document.querySelector('.ex6 .sample')
}).create();
