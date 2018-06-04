// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/eronelit_editorv3"), require("../../addon/mode/simple"), require("../../addon/mode/multiplex"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/eronelit_editorv3", "../../addon/mode/simple", "../../addon/mode/multiplex"], mod);
  else // Plain browser env
    mod(eronelit_editorv3);
})(function(eronelit_editorv3) {
  "use strict";

  eronelit_editorv3.defineSimpleMode("handlebars-tags", {
    start: [
      { regex: /\{\{!--/, push: "dash_comment", token: "comment" },
      { regex: /\{\{!/,   push: "comment", token: "comment" },
      { regex: /\{\{/,    push: "handlebars", token: "tag" }
    ],
    handlebars: [
      { regex: /\}\}/, pop: true, token: "tag" },

      // Double and single quotes
      { regex: /"(?:[^\\"]|\\.)*"?/, token: "string" },
      { regex: /'(?:[^\\']|\\.)*'?/, token: "string" },

      // Handlebars keywords
      { regex: />|[#\/]([A-Za-z_]\w*)/, token: "keyword" },
      { regex: /(?:else|this)\b/, token: "keyword" },

      // Numeral
      { regex: /\d+/i, token: "number" },

      // Atoms like = and .
      { regex: /=|~|@|true|false/, token: "atom" },

      // Paths
      { regex: /(?:\.\.\/)*(?:[A-Za-z_][\w\.]*)+/, token: "variable-2" }
    ],
    dash_comment: [
      { regex: /--\}\}/, pop: true, token: "comment" },

      // Commented code
      { regex: /./, token: "comment"}
    ],
    comment: [
      { regex: /\}\}/, pop: true, token: "comment" },
      { regex: /./, token: "comment" }
    ]
  });

  eronelit_editorv3.defineMode("handlebars", function(config, parserConfig) {
    var handlebars = eronelit_editorv3.getMode(config, "handlebars-tags");
    if (!parserConfig || !parserConfig.base) return handlebars;
    return eronelit_editorv3.multiplexingMode(
      eronelit_editorv3.getMode(config, parserConfig.base),
      {open: "{{", close: "}}", mode: handlebars, parseDelimiters: true}
    );
  });

  eronelit_editorv3.defineMIME("text/x-handlebars-template", "handlebars");
});
