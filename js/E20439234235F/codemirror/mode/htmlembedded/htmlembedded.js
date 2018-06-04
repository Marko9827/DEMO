// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/eronelit_editorv3"), require("../htmlmixed/htmlmixed"),
        require("../../addon/mode/multiplex"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/eronelit_editorv3", "../htmlmixed/htmlmixed",
            "../../addon/mode/multiplex"], mod);
  else // Plain browser env
    mod(eronelit_editorv3);
})(function(eronelit_editorv3) {
  "use strict";

  eronelit_editorv3.defineMode("htmlembedded", function(config, parserConfig) {
    var closeComment = parserConfig.closeComment || "--%>"
    return eronelit_editorv3.multiplexingMode(eronelit_editorv3.getMode(config, "htmlmixed"), {
      open: parserConfig.openComment || "<%--",
      close: closeComment,
      delimStyle: "comment",
      mode: {token: function(stream) {
        stream.skipTo(closeComment) || stream.skipToEnd()
        return "comment"
      }}
    }, {
      open: parserConfig.open || parserConfig.scriptStartRegex || "<%",
      close: parserConfig.close || parserConfig.scriptEndRegex || "%>",
      mode: eronelit_editorv3.getMode(config, parserConfig.scriptingModeSpec)
    });
  }, "htmlmixed");

  eronelit_editorv3.defineMIME("application/x-ejs", {name: "htmlembedded", scriptingModeSpec:"javascript"});
  eronelit_editorv3.defineMIME("application/x-aspx", {name: "htmlembedded", scriptingModeSpec:"text/x-csharp"});
  eronelit_editorv3.defineMIME("application/x-jsp", {name: "htmlembedded", scriptingModeSpec:"text/x-java"});
  eronelit_editorv3.defineMIME("application/x-erb", {name: "htmlembedded", scriptingModeSpec:"ruby"});
});
