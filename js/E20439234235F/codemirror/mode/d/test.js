// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

(function() {
  var mode = eronelit_editorv3.getMode({indentUnit: 2}, "d");
  function MT(name) { test.mode(name, mode, Array.prototype.slice.call(arguments, 1)); }

  MT("nested_comments",
     "[comment /+]","[comment comment]","[comment +/]","[variable void] [variable main](){}");

})();
