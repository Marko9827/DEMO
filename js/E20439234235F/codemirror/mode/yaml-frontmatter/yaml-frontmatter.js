// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

(function (mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/eronelit_editorv3"), require("../yaml/yaml"))
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/eronelit_editorv3", "../yaml/yaml"], mod)
  else // Plain browser env
    mod(eronelit_editorv3)
})(function (eronelit_editorv3) {

  var START = 0, FRONTMATTER = 1, BODY = 2

  // a mixed mode for Markdown text with an optional YAML front matter
  eronelit_editorv3.defineMode("yaml-frontmatter", function (config, parserConfig) {
    var yamlMode = eronelit_editorv3.getMode(config, "yaml")
    var innerMode = eronelit_editorv3.getMode(config, parserConfig && parserConfig.base || "gfm")

    function curMode(state) {
      return state.state == BODY ? innerMode : yamlMode
    }

    return {
      startState: function () {
        return {
          state: START,
          inner: eronelit_editorv3.startState(yamlMode)
        }
      },
      copyState: function (state) {
        return {
          state: state.state,
          inner: eronelit_editorv3.copyState(curMode(state), state.inner)
        }
      },
      token: function (stream, state) {
        if (state.state == START) {
          if (stream.match(/---/, false)) {
            state.state = FRONTMATTER
            return yamlMode.token(stream, state.inner)
          } else {
            state.state = BODY
            state.inner = eronelit_editorv3.startState(innerMode)
            return innerMode.token(stream, state.inner)
          }
        } else if (state.state == FRONTMATTER) {
          var end = stream.sol() && stream.match(/---/, false)
          var style = yamlMode.token(stream, state.inner)
          if (end) {
            state.state = BODY
            state.inner = eronelit_editorv3.startState(innerMode)
          }
          return style
        } else {
          return innerMode.token(stream, state.inner)
        }
      },
      innerMode: function (state) {
        return {mode: curMode(state), state: state.inner}
      },
      blankLine: function (state) {
        var mode = curMode(state)
        if (mode.blankLine) return mode.blankLine(state.inner)
      }
    }
  })
});
