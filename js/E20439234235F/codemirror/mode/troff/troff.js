// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    mod(require("../../lib/eronelit_editorv3"));
  else if (typeof define == "function" && define.amd)
    define(["../../lib/eronelit_editorv3"], mod);
  else
    mod(eronelit_editorv3);
})(function(eronelit_editorv3) {
"use strict";

eronelit_editorv3.defineMode('troff', function() {

  var words = {};

  function tokenBase(stream) {
    if (stream.eatSpace()) return null;

    var sol = stream.sol();
    var ch = stream.next();

    if (ch === '\\') {
      if (stream.match('fB') || stream.match('fR') || stream.match('fI') ||
          stream.match('u')  || stream.match('d')  ||
          stream.match('%')  || stream.match('&')) {
        return 'string';
      }
      if (stream.match('m[')) {
        stream.skipTo(']');
        stream.next();
        return 'string';
      }
      if (stream.match('s+') || stream.match('s-')) {
        stream.eatWhile(/[\d-]/);
        return 'string';
      }
      if (stream.match('\(') || stream.match('*\(')) {
        stream.eatWhile(/[\w-]/);
        return 'string';
      }
      return 'string';
    }
    if (sol && (ch === '.' || ch === '\'')) {
      if (stream.eat('\\') && stream.eat('\"')) {
        stream.skipToEnd();
        return 'comment';
      }
    }
    if (sol && ch === '.') {
      if (stream.match('B ') || stream.match('I ') || stream.match('R ')) {
        return 'attribute';
      }
      if (stream.match('TH ') || stream.match('SH ') || stream.match('SS ') || stream.match('HP ')) {
        stream.skipToEnd();
        return 'quote';
      }
      if ((stream.match(/[A-Z]/) && stream.match(/[A-Z]/)) || (stream.match(/[a-z]/) && stream.match(/[a-z]/))) {
        return 'attribute';
      }
    }
    stream.eatWhile(/[\w-]/);
    var cur = stream.current();
    return words.hasOwnProperty(cur) ? words[cur] : null;
  }

  function tokenize(stream, state) {
    return (state.tokens[0] || tokenBase) (stream, state);
  };

  return {
    startState: function() {return {tokens:[]};},
    token: function(stream, state) {
      return tokenize(stream, state);
    }
  };
});

eronelit_editorv3.defineMIME('text/troff', 'troff');
eronelit_editorv3.defineMIME('text/x-troff', 'troff');
eronelit_editorv3.defineMIME('application/x-troff', 'troff');

});
