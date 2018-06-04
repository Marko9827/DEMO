// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

// Depends on coffeelint.js from http://www.coffeelint.org/js/coffeelint.js

// declare global: coffeelint

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/eronelit_editorv3"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/eronelit_editorv3"], mod);
  else // Plain browser env
    mod(eronelit_editorv3);
})(function(eronelit_editorv3) {
"use strict";

eronelit_editorv3.registerHelper("lint", "coffeescript", function(text) {
  var found = [];
  if (!window.coffeelint) {
    if (window.console) {
      window.console.error("Error: window.coffeelint not defined, eronelit_editorv3 CoffeeScript linting cannot run.");
    }
    return found;
  }
  var parseError = function(err) {
    var loc = err.lineNumber;
    found.push({from: eronelit_editorv3.Pos(loc-1, 0),
                to: eronelit_editorv3.Pos(loc, 0),
                severity: err.level,
                message: err.message});
  };
  try {
    var res = coffeelint.lint(text);
    for(var i = 0; i < res.length; i++) {
      parseError(res[i]);
    }
  } catch(e) {
    found.push({from: eronelit_editorv3.Pos(e.location.first_line, 0),
                to: eronelit_editorv3.Pos(e.location.last_line, e.location.last_column),
                severity: 'error',
                message: e.message});
  }
  return found;
});

});
