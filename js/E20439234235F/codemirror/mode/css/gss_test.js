// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

(function() {
  "use strict";

  var mode = eronelit_editorv3.getMode({indentUnit: 2}, "text/x-gss");
  function MT(name) { test.mode(name, mode, Array.prototype.slice.call(arguments, 1), "gss"); }

  MT("atComponent",
     "[def @component] {",
     "[tag foo] {",
     "  [property color]: [keyword black];",
     "}",
     "}");

})();
