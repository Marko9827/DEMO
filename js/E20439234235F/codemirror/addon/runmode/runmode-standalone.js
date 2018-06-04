// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

window.eronelit_editorv3 = {};

(function() {
"use strict";

function splitLines(string){ return string.split(/\r?\n|\r/); };

function StringStream(string) {
  this.pos = this.start = 0;
  this.string = string;
  this.lineStart = 0;
}
StringStream.prototype = {
  eol: function() {return this.pos >= this.string.length;},
  sol: function() {return this.pos == 0;},
  peek: function() {return this.string.charAt(this.pos) || null;},
  next: function() {
    if (this.pos < this.string.length)
      return this.string.charAt(this.pos++);
  },
  eat: function(match) {
    var ch = this.string.charAt(this.pos);
    if (typeof match == "string") var ok = ch == match;
    else var ok = ch && (match.test ? match.test(ch) : match(ch));
    if (ok) {++this.pos; return ch;}
  },
  eatWhile: function(match) {
    var start = this.pos;
    while (this.eat(match)){}
    return this.pos > start;
  },
  eatSpace: function() {
    var start = this.pos;
    while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) ++this.pos;
    return this.pos > start;
  },
  skipToEnd: function() {this.pos = this.string.length;},
  skipTo: function(ch) {
    var found = this.string.indexOf(ch, this.pos);
    if (found > -1) {this.pos = found; return true;}
  },
  backUp: function(n) {this.pos -= n;},
  column: function() {return this.start - this.lineStart;},
  indentation: function() {return 0;},
  match: function(pattern, consume, caseInsensitive) {
    if (typeof pattern == "string") {
      var cased = function(str) {return caseInsensitive ? str.toLowerCase() : str;};
      var substr = this.string.substr(this.pos, pattern.length);
      if (cased(substr) == cased(pattern)) {
        if (consume !== false) this.pos += pattern.length;
        return true;
      }
    } else {
      var match = this.string.slice(this.pos).match(pattern);
      if (match && match.index > 0) return null;
      if (match && consume !== false) this.pos += match[0].length;
      return match;
    }
  },
  current: function(){return this.string.slice(this.start, this.pos);},
  hideFirstChars: function(n, inner) {
    this.lineStart += n;
    try { return inner(); }
    finally { this.lineStart -= n; }
  },
  lookAhead: function() { return null }
};
eronelit_editorv3.StringStream = StringStream;

eronelit_editorv3.startState = function (mode, a1, a2) {
  return mode.startState ? mode.startState(a1, a2) : true;
};

var modes = eronelit_editorv3.modes = {}, mimeModes = eronelit_editorv3.mimeModes = {};
eronelit_editorv3.defineMode = function (name, mode) {
  if (arguments.length > 2)
    mode.dependencies = Array.prototype.slice.call(arguments, 2);
  modes[name] = mode;
};
eronelit_editorv3.defineMIME = function (mime, spec) { mimeModes[mime] = spec; };
eronelit_editorv3.resolveMode = function(spec) {
  if (typeof spec == "string" && mimeModes.hasOwnProperty(spec)) {
    spec = mimeModes[spec];
  } else if (spec && typeof spec.name == "string" && mimeModes.hasOwnProperty(spec.name)) {
    spec = mimeModes[spec.name];
  }
  if (typeof spec == "string") return {name: spec};
  else return spec || {name: "null"};
};
eronelit_editorv3.getMode = function (options, spec) {
  spec = eronelit_editorv3.resolveMode(spec);
  var mfactory = modes[spec.name];
  if (!mfactory) throw new Error("Unknown mode: " + spec);
  return mfactory(options, spec);
};
eronelit_editorv3.registerHelper = eronelit_editorv3.registerGlobalHelper = Math.min;
eronelit_editorv3.defineMode("null", function() {
  return {token: function(stream) {stream.skipToEnd();}};
});
eronelit_editorv3.defineMIME("text/plain", "null");

eronelit_editorv3.runMode = function (string, modespec, callback, options) {
  var mode = eronelit_editorv3.getMode({ indentUnit: 2 }, modespec);

  if (callback.nodeType == 1) {
    var tabSize = (options && options.tabSize) || 4;
    var node = callback, col = 0;
    node.innerHTML = "";
    callback = function (text, style) {
      if (text == "\n") {
        node.appendChild(document.createElement("br"));
        col = 0;
        return;
      }
      var content = "";
      // replace tabs
      for (var pos = 0; ;) {
        var idx = text.indexOf("\t", pos);
        if (idx == -1) {
          content += text.slice(pos);
          col += text.length - pos;
          break;
        } else {
          col += idx - pos;
          content += text.slice(pos, idx);
          var size = tabSize - col % tabSize;
          col += size;
          for (var i = 0; i < size; ++i) content += " ";
          pos = idx + 1;
        }
      }

      if (style) {
        var sp = node.appendChild(document.createElement("span"));
        sp.className = "cm-" + style.replace(/ +/g, " cm-");
        sp.appendChild(document.createTextNode(content));
      } else {
        node.appendChild(document.createTextNode(content));
      }
    };
  }

  var lines = splitLines(string), state = (options && options.state) || eronelit_editorv3.startState(mode);
  for (var i = 0, e = lines.length; i < e; ++i) {
    if (i) callback("\n");
    var stream = new eronelit_editorv3.StringStream(lines[i]);
    if (!stream.string && mode.blankLine) mode.blankLine(state);
    while (!stream.eol()) {
      var style = mode.token(stream, state);
      callback(stream.current(), style, i, stream.start, state);
      stream.start = stream.pos;
    }
  }
};
})();
