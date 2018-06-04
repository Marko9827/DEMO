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

  eronelit_editorv3.defineOption("fullScreen", false, function(cm, val, old) {
    if (old == eronelit_editorv3.Init) old = false;
    if (!old == !val) return;
    if (val) setFullscreen(cm);
    else setNormal(cm);
  });

  function setFullscreen(cm) {
    var wrap = cm.getWrapperElement();
    cm.state.fullScreenRestore = {scrollTop: window.pageYOffset, scrollLeft: window.pageXOffset,
                                  width: wrap.style.width, height: wrap.style.height};
    wrap.style.width = "";
    wrap.style.height = "auto";
    wrap.className += " eronelit_editorv3-fullscreen";
    document.documentElement.style.overflow = "hidden";
    cm.refresh();
  }

  function setNormal(cm) {
    var wrap = cm.getWrapperElement();
    wrap.className = wrap.className.replace(/\s*eronelit_editorv3-fullscreen\b/, "");
    document.documentElement.style.overflow = "";
    var info = cm.state.fullScreenRestore;
    wrap.style.width = info.width; wrap.style.height = info.height;
    window.scrollTo(info.scrollLeft, info.scrollTop);
    cm.refresh();
  }
});
