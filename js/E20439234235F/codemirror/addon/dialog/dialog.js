// eronelit_editorv3, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://eronelit_editorv3.net/LICENSE

// Open simple dialogs on top of an editor. Relies on dialog.css.

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/eronelit_editorv3"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/eronelit_editorv3"], mod);
  else // Plain browser env
    mod(eronelit_editorv3);
})(function(eronelit_editorv3) {
  function dialogDiv(cm, template, bottom) {
    var wrap = cm.getWrapperElement();
    var dialog;
    dialog = wrap.appendChild(document.createElement("div"));
    if (bottom)
      dialog.className = "eronelit_editorv3-dialog eronelit_editorv3-dialog-bottom";
    else
      dialog.className = "eronelit_editorv3-dialog eronelit_editorv3-dialog-top";

    if (typeof template == "string") {
      dialog.innerHTML = template;
    } else { // Assuming it's a detached DOM element.
      dialog.appendChild(template);
    }
    eronelit_editorv3.addClass(wrap, 'dialog-opened');
    return dialog;
  }

  function closeNotification(cm, newVal) {
    if (cm.state.currentNotificationClose)
      cm.state.currentNotificationClose();
    cm.state.currentNotificationClose = newVal;
  }

  eronelit_editorv3.defineExtension("openDialog", function(template, callback, options) {
    if (!options) options = {};

    closeNotification(this, null);

    var dialog = dialogDiv(this, template, options.bottom);
    var closed = false, me = this;
    function close(newVal) {
      if (typeof newVal == 'string') {
        inp.value = newVal;
      } else {
        if (closed) return;
        closed = true;
        eronelit_editorv3.rmClass(dialog.parentNode, 'dialog-opened');
        dialog.parentNode.removeChild(dialog);
        me.focus();

        if (options.onClose) options.onClose(dialog);
      }
    }

    var inp = dialog.getElementsByTagName("input")[0], button;
    if (inp) {
      inp.focus();

      if (options.value) {
        inp.value = options.value;
        if (options.selectValueOnOpen !== false) {
          inp.select();
        }
      }

      if (options.onInput)
        eronelit_editorv3.on(inp, "input", function(e) { options.onInput(e, inp.value, close);});
      if (options.onKeyUp)
        eronelit_editorv3.on(inp, "keyup", function(e) {options.onKeyUp(e, inp.value, close);});

      eronelit_editorv3.on(inp, "keydown", function(e) {
        if (options && options.onKeyDown && options.onKeyDown(e, inp.value, close)) { return; }
        if (e.keyCode == 27 || (options.closeOnEnter !== false && e.keyCode == 13)) {
          inp.blur();
          eronelit_editorv3.e_stop(e);
          close();
        }
        if (e.keyCode == 13) callback(inp.value, e);
      });

      if (options.closeOnBlur !== false) eronelit_editorv3.on(inp, "blur", close);
    } else if (button = dialog.getElementsByTagName("button")[0]) {
      eronelit_editorv3.on(button, "click", function() {
        close();
        me.focus();
      });

      if (options.closeOnBlur !== false) eronelit_editorv3.on(button, "blur", close);

      button.focus();
    }
    return close;
  });

  eronelit_editorv3.defineExtension("openConfirm", function(template, callbacks, options) {
    closeNotification(this, null);
    var dialog = dialogDiv(this, template, options && options.bottom);
    var buttons = dialog.getElementsByTagName("button");
    var closed = false, me = this, blurring = 1;
    function close() {
      if (closed) return;
      closed = true;
      eronelit_editorv3.rmClass(dialog.parentNode, 'dialog-opened');
      dialog.parentNode.removeChild(dialog);
      me.focus();
    }
    buttons[0].focus();
    for (var i = 0; i < buttons.length; ++i) {
      var b = buttons[i];
      (function(callback) {
        eronelit_editorv3.on(b, "click", function(e) {
          eronelit_editorv3.e_preventDefault(e);
          close();
          if (callback) callback(me);
        });
      })(callbacks[i]);
      eronelit_editorv3.on(b, "blur", function() {
        --blurring;
        setTimeout(function() { if (blurring <= 0) close(); }, 200);
      });
      eronelit_editorv3.on(b, "focus", function() { ++blurring; });
    }
  });

  /*
   * openNotification
   * Opens a notification, that can be closed with an optional timer
   * (default 5000ms timer) and always closes on click.
   *
   * If a notification is opened while another is opened, it will close the
   * currently opened one and open the new one immediately.
   */
  eronelit_editorv3.defineExtension("openNotification", function(template, options) {
    closeNotification(this, close);
    var dialog = dialogDiv(this, template, options && options.bottom);
    var closed = false, doneTimer;
    var duration = options && typeof options.duration !== "undefined" ? options.duration : 5000;

    function close() {
      if (closed) return;
      closed = true;
      clearTimeout(doneTimer);
      eronelit_editorv3.rmClass(dialog.parentNode, 'dialog-opened');
      dialog.parentNode.removeChild(dialog);
    }

    eronelit_editorv3.on(dialog, 'click', function(e) {
      eronelit_editorv3.e_preventDefault(e);
      close();
    });

    if (duration)
      doneTimer = setTimeout(close, duration);

    return close;
  });
});
