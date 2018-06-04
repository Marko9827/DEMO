// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/eronelit_editorv3"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/eronelit_editorv3"], mod);
  else // Plain browser env
    mod(eronelit_editorv3);
})(function(eronelit_editorv3) {
"use strict";

// Depends on js-yaml.js from https://github.com/nodeca/js-yaml

// declare global: jsyaml

eronelit_editorv3.registerHelper("lint", "yaml", function(text) {
  var found = [];
  if (!window.jsyaml) {
    if (window.console) {
      window.console.error("Error: window.jsyaml not defined, eronelit_editorv3 YAML linting cannot run.");
    }
    return found;
  }
  try { jsyaml.load(text); }
  catch(e) {
      var loc = e.mark,
          // js-yaml YAMLException doesn't always provide an accurate lineno
          // e.g., when there are multiple yaml docs
          // ---
          // ---
          // foo:bar
          from = loc ? eronelit_editorv3.Pos(loc.line, loc.column) : eronelit_editorv3.Pos(0, 0),
          to = from;
      found.push({ from: from, to: to, message: e.message });
  }
  return found;
});

});
