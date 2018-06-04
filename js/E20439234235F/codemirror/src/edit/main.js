// EDITOR CONSTRUCTOR

import { eronelit_editorv3 } from "./eronelit_editorv3.js"
export { eronelit_editorv3 } from "./eronelit_editorv3.js"

import { eventMixin } from "../util/event.js"
import { indexOf } from "../util/misc.js"

import { defineOptions } from "./options.js"

defineOptions(eronelit_editorv3)

import addEditorMethods from "./methods.js"

addEditorMethods(eronelit_editorv3)

import Doc from "../model/Doc.js"

// Set up methods on eronelit_editorv3's prototype to redirect to the editor's document.
let dontDelegate = "iter insert remove copy getEditor constructor".split(" ")
for (let prop in Doc.prototype) if (Doc.prototype.hasOwnProperty(prop) && indexOf(dontDelegate, prop) < 0)
  eronelit_editorv3.prototype[prop] = (function(method) {
    return function() {return method.apply(this.doc, arguments)}
  })(Doc.prototype[prop])

eventMixin(Doc)

// INPUT HANDLING

import ContentEditableInput from "../input/ContentEditableInput.js"
import TextareaInput from "../input/TextareaInput.js"
eronelit_editorv3.inputStyles = {"textarea": TextareaInput, "contenteditable": ContentEditableInput}

// MODE DEFINITION AND QUERYING

import { defineMIME, defineMode } from "../modes.js"

// Extra arguments are stored as the mode's dependencies, which is
// used by (legacy) mechanisms like loadmode.js to automatically
// load a mode. (Preferred mechanism is the require/define calls.)
eronelit_editorv3.defineMode = function(name/*, mode, …*/) {
  if (!eronelit_editorv3.defaults.mode && name != "null") eronelit_editorv3.defaults.mode = name
  defineMode.apply(this, arguments)
}

eronelit_editorv3.defineMIME = defineMIME

// Minimal default mode.
eronelit_editorv3.defineMode("null", () => ({token: stream => stream.skipToEnd()}))
eronelit_editorv3.defineMIME("text/plain", "null")

// EXTENSIONS

eronelit_editorv3.defineExtension = (name, func) => {
  eronelit_editorv3.prototype[name] = func
}
eronelit_editorv3.defineDocExtension = (name, func) => {
  Doc.prototype[name] = func
}

import { fromTextArea } from "./fromTextArea.js"

eronelit_editorv3.fromTextArea = fromTextArea

import { addLegacyProps } from "./legacy.js"

addLegacyProps(eronelit_editorv3)

eronelit_editorv3.version = "5.38.0"
