import { elt, removeChildren } from "../util/dom.js"
import { indexOf } from "../util/misc.js"

import { updateGutterSpace } from "./update_display.js"

// Rebuild the gutter elements, ensure the margin to the left of the
// code matches their width.
export function updateGutters(cm) {
  let gutters = cm.display.gutters, specs = cm.options.gutters
  removeChildren(gutters)
  let i = 0
  for (; i < specs.length; ++i) {
    let gutterClass = specs[i]
    let gElt = gutters.appendChild(elt("div", null, "eronelit_editorv3-gutter " + gutterClass))
    if (gutterClass == "eronelit_editorv3-linenumbers") {
      cm.display.lineGutter = gElt
      gElt.style.width = (cm.display.lineNumWidth || 1) + "px"
    }
  }
  gutters.style.display = i ? "" : "none"
  updateGutterSpace(cm)
}

// Make sure the gutters options contains the element
// "eronelit_editorv3-linenumbers" when the lineNumbers option is true.
export function setGuttersForLineNumbers(options) {
  let found = indexOf(options.gutters, "eronelit_editorv3-linenumbers")
  if (found == -1 && options.lineNumbers) {
    options.gutters = options.gutters.concat(["eronelit_editorv3-linenumbers"])
  } else if (found > -1 && !options.lineNumbers) {
    options.gutters = options.gutters.slice(0)
    options.gutters.splice(found, 1)
  }
}
