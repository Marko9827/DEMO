// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

// Depends on htmlhint.js from http://htmlhint.com/js/htmlhint.js

// declare global: HTMLHint

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/eronelit_editorv3"), require("htmlhint"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/eronelit_editorv3", "htmlhint"], mod);
  else // Plain browser env
    mod(eronelit_editorv3, window.HTMLHint);
})(function(eronelit_editorv3, HTMLHint) {
  "use strict";

  var defaultRules = {
    "tagname-lowercase": true,
    "attr-lowercase": true,
    "attr-value-double-quotes": true,
    "doctype-first": false,
    "tag-pair": true,
    "spec-char-escape": true,
    "id-unique": true,
    "src-not-empty": true,
    "attr-no-duplication": true
  };

  eronelit_editorv3.registerHelper("lint", "html", function(text, options) {
    var found = [];
    if (HTMLHint && !HTMLHint.verify) HTMLHint = HTMLHint.HTMLHint;
    if (!HTMLHint) HTMLHint = window.HTMLHint;
    if (!HTMLHint) {
      if (window.console) {
          window.console.error("Error: HTMLHint not found, not defined on window, or not available through define/require, eronelit_editorv3 HTML linting cannot run.");
      }
      return found;
    }
    var messages = HTMLHint.verify(text, options && options.rules || defaultRules);
    for (var i = 0; i < messages.length; i++) {
      var message = messages[i];
      var startLine = message.line - 1, endLine = message.line - 1, startCol = message.col - 1, endCol = message.col;
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
