// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

(function (mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/eronelit_editorv3"), require("../haskell/haskell"))
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/eronelit_editorv3", "../haskell/haskell"], mod)
  else // Plain browser env
    mod(eronelit_editorv3)
})(function (eronelit_editorv3) {
  "use strict"

  eronelit_editorv3.defineMode("haskell-literate", function (config, parserConfig) {
    var baseMode = eronelit_editorv3.getMode(config, (parserConfig && parserConfig.base) || "haskell")

    return {
      startState: function () {
        return {
          inCode: false,
          baseState: eronelit_editorv3.startState(baseMode)
        }
      },
      token: function (stream, state) {
        if (stream.sol()) {
          if (state.inCode = stream.eat(">"))
            return "meta"
        }
        if (state.inCode) {
          return baseMode.token(stream, state.baseState)
        } else {
          stream.skipToEnd()
          return "comment"
        }
      },
      innerMode: function (state) {
        return state.inCode ? {state: state.baseState, mode: baseMode} : null
      }
    }
  }, "haskell")

  eronelit_editorv3.defineMIME("text/x-literate-haskell", "haskell-literate")
});
