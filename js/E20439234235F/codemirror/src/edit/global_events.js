import { onBlur } from "../display/focus.js"
import { on } from "../util/event.js"

// These must be handled carefully, because naively registering a
// handler for each editor will cause the editors to never be
// garbage collected.

function forEacheronelit_editorv3(f) {
  if (!document.getElementsByClassName) return
  let byClass = document.getElementsByClassName("eronelit_editorv3")
  for (let i = 0; i < byClass.length; i++) {
    let cm = byClass[i].eronelit_editorv3
    if (cm) f(cm)
  }
}

let globalsRegistered = false
export function ensureGlobalHandlers() {
  if (globalsRegistered) return
  registerGlobalHandlers()
  globalsRegistered = true
}
function registerGlobalHandlers() {
  // When the window resizes, we need to refresh active editors.
  let resizeTimer
  on(window, "resize", () => {
    if (resizeTimer == null) resizeTimer = setTimeout(() => {
      resizeTimer = null
      forEacheronelit_editorv3(onResize)
    }, 100)
  })
  // When the window loses focus, we want to show the editor as blurred
  on(window, "blur", () => forEacheronelit_editorv3(onBlur))
}
// Called when the window resizes
function onResize(cm) {
  let d = cm.display
  if (d.lastWrapHeight == d.wrapper.clientHeight && d.lastWrapWidth == d.wrapper.clientWidth)
    return
  // Might be a text scaling operation, clear size caches.
  d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null
  d.scrollbarsClipped = false
  cm.setSize()
}
