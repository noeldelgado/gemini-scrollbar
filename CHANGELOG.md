## 1.5.3 (2017-10-18)
- [#56](../../pull/56) avoid stop propagation

## 1.5.2 (2017-08-01)
- [#53](../../pull/53) prevent losing keyboard focus in object

## 1.5.1 (2017-05-18)
- [#47](../../pull/47) hide thumb when no more scroll needed
- [#49](../../pull/49) hovering parent container reveals child container scrollbars

## 1.5.0 (2017-03-05)

Feature:

- [#41](../../issues/41) add `minThumbSize` option, defaults to `20` (px)

## 1.4.3 (2016-07-26)

Patch:

- [#31](../../pull/31) removed reset of `viewElement.style.{width,height}`, turn off relayouts on update.

## 1.4.2 (2016-06-23)

Bugfixes:

- [comment](../../commit/58c7abced43ae9d0d33654cbe02ef597979f9c67#commitcomment-17987597)
  - Removed `visibility: hidden` from `.gm-resize-trigger` so it works on Firefox.
  - Updated the order in how we add the `type` for the resizer object so it works on IE correctly.

## 1.4.1 (2016-06-8)

Bugfixes:

- [#29](../../issues/29) .gm-resize-trigger causes white block overlaying scrollable content
- [#23](../../pull/23) fix autoshow functionality whilst dragging thumb of a scrollbar

## 1.4.0 (2016-05-28)

Features:

- [#26](../../pull/26) Add a handler to detect resizes of the scrolling element.
- Added `onResize` option hook by which clients can be notified of resize events

## 1.3.2 (2016-02-17)

Bugfixes:

- [3b5674c](../../commit/3b5674ca244ee5d25489ed08dcab4984204796bd) Remove scrollbar width test element.
- Clear viewElement{width,height} before reading them back on the update method.

## 1.3.1 (2016-01-11)

Bugfixes:

- added inline styles to the test element
- removed `.gm-test` css rule from the stylesheet

## 1.3.0 (2015-11-19)

Features:

- [#16](../../issues/16) Allow user to force Gemini

## 1.2.9 (2015-08-17)

Bugfixes:

- [#11](../../issues/11) Classnames don’t get added to the elements

## 1.2.8 (2015-07-18)

Bugfixes:

- do not remove class selectors if the markup is already defined (createElements: false)

## 1.2.7 (2015-06-28)

Bugfixes:

- do not re-append elements on `create` if `createElements` option is `false`
- do not add `gm-prevented` after destroy
- clean document and window references on `destroy` for `reateElements: false`

## 1.2.6 (2015-06-23)

Bugfixes:

- [#9](../../issues/9) better support for scrollbars with offset positions

## 1.2.5 (2015-06-21)

Bugfixes:

- [#7](../../issues/7) do not remove elements when calling the `destroy` method if the `createElements` option was set to `false`

## 1.2.4 (2015-05-13)

Bugfixes:

- getViewElement method returning null if the scroll bars were not created

## 1.2.3 (2015-04-29)

Features:

- Added `getViewElement` method that returns the scrollable element, useful if you want check its properties such as scrollHeight or add/remove content

## 1.1.3 (2015-04-08)

Bugfixes:

- OS X: showing custom scrollbars even when having overlayed ones natively [#1](https://github.com/noeldelgado/gemini-scrollbar/issues/1)
- Prevent error when loading the script on the `head` :/ [#2](https://github.com/noeldelgado/gemini-scrollbar/issues/2)

## 1.1.2 (2015-04-06)

Features:

- Safari support
  - added webkitTranslate for thumb position change

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
