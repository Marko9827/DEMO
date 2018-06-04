// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

// Depends on jsonlint.js from https://github.com/zaach/jsonlint

// declare global: jsonlint

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/eronelit_editorv3"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/eronelit_editorv3"], mod);
  else // Plain browser env
    mod(eronelit_editorv3);
})(function(eronelit_editorv3) {
"use strict";

eronelit_editorv3.registerHelper("lint", "json", function(text) {
  var found = [];
  if (!window.jsonlint) {
    if (window.console) {
      window.console.error("Error: window.jsonlint not defined, eronelit_editorv3 JSON linting cannot run.");
    }
    return found;
  }
  // for jsonlint's web dist jsonlint is exported as an object with a single property parser, of which parseError
  // is a subproperty
  var jsonlint = window.jsonlint.parser || window.jsonlint
  jsonlint.parseError = function(str, hash) {
    var loc = hash.loc;
    found.push({from: eronelit_editorv3.Pos(loc.first_line - 1, loc.first_column),
                to: eronelit_editorv3.Pos(loc.last_line - 1, loc.last_column),
                message: str});
  };
  try { jsonlint.parse(text); }
  catch(e) {}
  return found;
});

});
