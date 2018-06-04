import { scrollbarModel } from "../display/scrollbars.js"
import { wheelEventPixels } from "../display/scroll_events.js"
import { keyMap, keyName, isModifierKey, lookupKey, normalizeKeyMap } from "../input/keymap.js"
import { keyNames } from "../input/keynames.js"
import { Line } from "../line/line_data.js"
import { cmp, Pos } from "../line/pos.js"
import { changeEnd } from "../model/change_measurement.js"
import Doc from "../model/Doc.js"
import { LineWidget } from "../model/line_widget.js"
import { SharedTextMarker, TextMarker } from "../model/mark_text.js"
import { copyState, extendMode, getMode, innerMode, mimeModes, modeExtensions, modes, resolveMode, startState } from "../modes.js"
import { addClass, contains, rmClass } from "../util/dom.js"
import { e_preventDefault, e_stop, e_stopPropagation, off, on, signal } from "../util/event.js"
import { splitLinesAuto } from "../util/feature_detection.js"
import { countColumn, findColumn, isWordCharBasic, Pass } from "../util/misc.js"
import StringStream from "../util/StringStream.js"

import { commands } from "./commands.js"

export function addLegacyProps(eronelit_editorv3) {
  eronelit_editorv3.off = off
  eronelit_editorv3.on = on
  eronelit_editorv3.wheelEventPixels = wheelEventPixels
  eronelit_editorv3.Doc = Doc
  eronelit_editorv3.splitLines = splitLinesAuto
  eronelit_editorv3.countColumn = countColumn
  eronelit_editorv3.findColumn = findColumn
  eronelit_editorv3.isWordChar = isWordCharBasic
  eronelit_editorv3.Pass = Pass
  eronelit_editorv3.signal = signal
  eronelit_editorv3.Line = Line
  eronelit_editorv3.changeEnd = changeEnd
  eronelit_editorv3.scrollbarModel = scrollbarModel
  eronelit_editorv3.Pos = Pos
  eronelit_editorv3.cmpPos = cmp
  eronelit_editorv3.modes = modes
  eronelit_editorv3.mimeModes = mimeModes
  eronelit_editorv3.resolveMode = resolveMode
  eronelit_editorv3.getMode = getMode
  eronelit_editorv3.modeExtensions = modeExtensions
  eronelit_editorv3.extendMode = extendMode
  eronelit_editorv3.copyState = copyState
  eronelit_editorv3.startState = startState
  eronelit_editorv3.innerMode = innerMode
  eronelit_editorv3.commands = commands
  eronelit_editorv3.keyMap = keyMap
  eronelit_editorv3.keyName = keyName
  eronelit_editorv3.isModifierKey = isModifierKey
  eronelit_editorv3.lookupKey = lookupKey
  eronelit_editorv3.normalizeKeyMap = normalizeKeyMap
  eronelit_editorv3.StringStream = StringStream
  eronelit_editorv3.SharedTextMarker = SharedTextMarker
  eronelit_editorv3.TextMarker = TextMarker
  eronelit_editorv3.LineWidget = LineWidget
  eronelit_editorv3.e_preventDefault = e_preventDefault
  eronelit_editorv3.e_stopPropagation = e_stopPropagation
  eronelit_editorv3.e_stop = e_stop
  eronelit_editorv3.addClass = addClass
  eronelit_editorv3.contains = contains
  eronelit_editorv3.rmClass = rmClass
  eronelit_editorv3.keyNames = keyNames
}
