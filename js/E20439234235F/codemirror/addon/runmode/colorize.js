// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/eronelit_editorv3"), require("./runmode"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/eronelit_editorv3", "./runmode"], mod);
  else // Plain browser env
    mod(eronelit_editorv3);
})(function(eronelit_editorv3) {
  "use strict";

  var isBlock = /^(p|li|div|h\\d|pre|blockquote|td)$/;

  function textContent(node, out) {
    if (node.nodeType == 3) return out.push(node.nodeValue);
    for (var ch = node.firstChild; ch; ch = ch.nextSibling) {
      textContent(ch, out);
      if (isBlock.test(node.nodeType)) out.push("\n");
    }
  }

  eronelit_editorv3.colorize = function(collection, defaultMode) {
    if (!collection) collection = document.body.getElementsByTagName("pre");

    for (var i = 0; i < collection.length; ++i) {
      var node = collection[i];
      var mode = node.getAttribute("data-lang") || defaultMode;
      if (!mode) continue;

      var text = [];
      textContent(node, text);
      node.innerHTML = "";
      eronelit_editorv3.runMode(text.join(""), mode, node);

      node.className += " cm-s-default";
    }
  };
});
