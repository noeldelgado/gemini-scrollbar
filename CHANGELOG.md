## 1.0.2 (2015-03-29)

Features:

- IE9 support
  - classList || className (add/remove class selectors)
  - style.transform || style.msTransform (update thumb position)
  - document.onstartselection prevented while draggin' the scrollbars

- Minor Bugfixes:

- `:active` state === `:hover` state by default for `.ms-scrollbar .thumb`
- thumb inherit `border-radius` from parent `ms-scrollbar` by default


## 1.0.1 (2015-03-28)

Bugfixes:

- `SCROLLBAR_WIDTH` value when `::-webkit-scrollbar` was present with an explicit `width`
- Force hiding the scrollbar elements when the custom-scrollbars were prevented


## 1.0.0 (2015-03-27)

Updates:

- :after pseudo element is not longer used to style the scrollbars. This
  makes the process of customization much more intuitive