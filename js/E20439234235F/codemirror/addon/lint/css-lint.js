// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

// Depends on csslint.js from https://github.com/stubbornella/csslint

// declare global: CSSLint

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/eronelit_editorv3"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/eronelit_editorv3"], mod);
  else // Plain browser env
    mod(eronelit_editorv3);
})(function(eronelit_editorv3) {
"use strict";

eronelit_editorv3.registerHelper("lint", "css", function(text, options) {
  var found = [];
  if (!window.CSSLint) {
    if (window.console) {
        window.console.error("Error: window.CSSLint not defined, eronelit_editorv3 CSS linting cannot run.");
    }
    return found;
  }
  var results = CSSLint.verify(text, options), messages = results.messages, message = null;
  for ( var i = 0; i < messages.length; i++) {
    message = messages[i];
    var startLine = message.line -1, endLine = message.line -1, startCol = message.col -1, endCol = message.col;
    found.push({
      from: eronelit_editorv3.Pos(startLine, startCol),
      to: eronelit_editorv3.Pos(endLine, endCol),
      message: message.message,
      severity : message.type
    });
  }
  return found;
});

});
