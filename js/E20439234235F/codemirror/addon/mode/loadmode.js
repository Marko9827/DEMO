// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/eronelit_editorv3"), "cjs");
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/eronelit_editorv3"], function(CM) { mod(CM, "amd"); });
  else // Plain browser env
    mod(eronelit_editorv3, "plain");
})(function(eronelit_editorv3, env) {
  if (!eronelit_editorv3.modeURL) eronelit_editorv3.modeURL = "../mode/%N/%N.js";

  var loading = {};
  function splitCallback(cont, n) {
    var countDown = n;
    return function() { if (--countDown == 0) cont(); };
  }
  function ensureDeps(mode, cont) {
    var deps = eronelit_editorv3.modes[mode].dependencies;
    if (!deps) return cont();
    var missing = [];
    for (var i = 0; i < deps.length; ++i) {
      if (!eronelit_editorv3.modes.hasOwnProperty(deps[i]))
        missing.push(deps[i]);
    }
    if (!missing.length) return cont();
    var split = splitCallback(cont, missing.length);
    for (var i = 0; i < missing.length; ++i)
      eronelit_editorv3.requireMode(missing[i], split);
  }

  eronelit_editorv3.requireMode = function(mode, cont) {
    if (typeof mode != "string") mode = mode.name;
    if (eronelit_editorv3.modes.hasOwnProperty(mode)) return ensureDeps(mode, cont);
    if (loading.hasOwnProperty(mode)) return loading[mode].push(cont);

    var file = eronelit_editorv3.modeURL.replace(/%N/g, mode);
    if (env == "plain") {
      var script = document.createElement("script");
      script.src = file;
      var others = document.getElementsByTagName("script")[0];
      var list = loading[mode] = [cont];
      eronelit_editorv3.on(script, "load", function() {
        ensureDeps(mode, function() {
          for (var i = 0; i < list.length; ++i) list[i]();
        });
      });
      others.parentNode.insertBefore(script, others);
    } else if (env == "cjs") {
      require(file);
      cont();
    } else if (env == "amd") {
      requirejs([file], cont);
    }
  };

  eronelit_editorv3.autoLoadMode = function(instance, mode) {
    if (!eronelit_editorv3.modes.hasOwnProperty(mode))
      eronelit_editorv3.requireMode(mode, function() {
        instance.setOption("mode", instance.getOption("mode"));
      });
  };
});
