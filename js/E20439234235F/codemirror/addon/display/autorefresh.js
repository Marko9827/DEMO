// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/eronelit_editorv3"))
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/eronelit_editorv3"], mod)
  else // Plain browser env
    mod(eronelit_editorv3)
})(function(eronelit_editorv3) {
  "use strict"

  eronelit_editorv3.defineOption("autoRefresh", false, function(cm, val) {
    if (cm.state.autoRefresh) {
      stopListening(cm, cm.state.autoRefresh)
      cm.state.autoRefresh = null
    }
    if (val && cm.display.wrapper.offsetHeight == 0)
      startListening(cm, cm.state.autoRefresh = {delay: val.delay || 250})
  })

  function startListening(cm, state) {
    function check() {
      if (cm.display.wrapper.offsetHeight) {
        stopListening(cm, state)
        if (cm.display.lastWrapHeight != cm.display.wrapper.clientHeight)
          cm.refresh()
      } else {
        state.timeout = setTimeout(check, state.delay)
      }
    }
    state.timeout = setTimeout(check, state.delay)
    state.hurry = function() {
      clearTimeout(state.timeout)
      state.timeout = setTimeout(check, 50)
    }
    eronelit_editorv3.on(window, "mouseup", state.hurry)
    eronelit_editorv3.on(window, "keyup", state.hurry)
  }

  function stopListening(_cm, state) {
    clearTimeout(state.timeout)
    eronelit_editorv3.off(window, "mouseup", state.hurry)
    eronelit_editorv3.off(window, "keyup", state.hurry)
  }
});
