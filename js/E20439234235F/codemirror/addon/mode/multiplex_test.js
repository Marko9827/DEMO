// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

(function() {
  eronelit_editorv3.defineMode("markdown_with_stex", function(){
    var inner = eronelit_editorv3.getMode({}, "stex");
    var outer = eronelit_editorv3.getMode({}, "markdown");

    var innerOptions = {
      open: '$',
      close: '$',
      mode: inner,
      delimStyle: 'delim',
      innerStyle: 'inner'
    };

    return eronelit_editorv3.multiplexingMode(outer, innerOptions);
  });

  var mode = eronelit_editorv3.getMode({}, "markdown_with_stex");

  function MT(name) {
    test.mode(
      name,
      mode,
      Array.prototype.slice.call(arguments, 1),
      'multiplexing');
  }

  MT(
    "stexInsideMarkdown",
    "[strong **Equation:**] [delim&delim-open $][inner&tag \\pi][delim&delim-close $]");
})();
