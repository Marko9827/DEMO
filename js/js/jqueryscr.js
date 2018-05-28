(function (document, window) {

    var body = document.body;
    var parent = window.parent;

    if (parent && ("createEvent" in document)) {

        var isoldie = ("documentMode" in document);  // 11-
        var ismsedge = ("msCredentials" in window);  // MS Edge 14+

        function onwheel(e) {

            var evt = document.createEvent("MouseEvents");
            evt.initEvent('wheel', true, true);
            evt.deltaMode = e.deltaMode;
            evt.deltaX = e.deltaX;
            evt.deltaY = e.deltaY;
            evt.deltaZ = e.deltaZ;
            evt.wheelDelta = e.wheelDelta;
            evt.wheelDeltaX = e.wheelDeltaX;
            evt.wheelDeltaY = e.wheelDeltaY;

            parent.dispatchEvent(evt);
        }

        body.addEventListener("wheel", onwheel);

    }

    if (window.addEventListener) {

        // https://davidwalsh.name/add-rules-stylesheets
        var sheet = (function () {
            var style = document.createElement("style");
            style.appendChild(document.createTextNode(""));
            document.head.appendChild(style);
            return style.sheet;
        })();

        var tmrscroll = false;
        var lastiframe = null;
        var lastiframeviewport = null;
        var lastscroll = [];

        window.addEventListener("scroll", function (e) {
            if (lastiframeviewport) {
                //            var df = [ window.scrollX - lastscroll[0], window.scrollY - lastscroll[1] ];
                window.scrollTo(lastscroll[0], lastscroll[1]);
                //            lastiframeviewport.scrollBy(df[0],df[1]);
                //            console.log(df);
            }
        });

        function findNiceParent(t) {
            do {
                if ($.data(t, '__nicescroll') !== undefined) return t;
                t = t.parentNode || false;
            } while (t);
            return false;
        }

        window.addEventListener("load", function () {

            var hasstyle = false;

            $.nicescroll.each(function () {
                var nice = this;
                nice.scrollstart(function () {
                    if (!hasstyle) sheet.insertRule("iframe { pointer-events: none !important; }", 0);
                    hasstyle = true;
                });
                nice.scrollend(function () {
                    if (hasstyle) sheet.deleteRule(0);
                    hasstyle = false;
                });
            });

            $("iframe").each(function () {
                this.addEventListener("mouseenter", function (e) {
                    lastiframe = e.target;
                    var chk = findNiceParent(lastiframe);
                    lastiframeviewport = chk;
                    //if (chk) lastiframeviewport = $(chk).getNiceScroll();                
                    lastscroll = [window.scrollX, window.scrollY];
                });
                this.addEventListener("mouseleave", function (e) {
                    lastiframe = lastiframeviewport = null;
                });
            });

        });

    }

})(document, window);


!function (e, t) { function n(t) { var n = e.createEvent("MouseEvents"); n.initEvent("wheel", !0, !0), n.deltaMode = t.deltaMode, n.deltaX = t.deltaX, n.deltaY = t.deltaY, n.deltaZ = t.deltaZ, n.wheelDelta = t.wheelDelta, n.wheelDeltaX = t.wheelDeltaX, n.wheelDeltaY = t.wheelDeltaY, r.dispatchEvent(n) } function l(e) { do { if (void 0 !== $.data(e, "__nicescroll")) return e; e = e.parentNode || !1 } while (e); return !1 } var a = e.body, r = t.parent; if (r && "createEvent" in e) { a.addEventListener("wheel", n) } if (t.addEventListener) { var i = function () { var t = e.createElement("style"); return t.appendChild(e.createTextNode("")), e.head.appendChild(t), t.sheet }(), d = null, o = null, c = []; t.addEventListener("scroll", function (e) { o && t.scrollTo(c[0], c[1]) }), t.addEventListener("load", function () { var e = !1; $.nicescroll.each(function () { var t = this; t.scrollstart(function () { e || i.insertRule("iframe { pointer-events: none !important; }", 0), e = !0 }), t.scrollend(function () { e && i.deleteRule(0), e = !1 }) }), $("iframe").each(function () { this.addEventListener("mouseenter", function (e) { var n = l(d = e.target); o = n, c = [t.scrollX, t.scrollY] }), this.addEventListener("mouseleave", function (e) { d = o = null }) }) }) } }(document, window);

/* jquery.nicescroll
-- version 3.7.6
-- copyright 2017-07-19 InuYaksa*2017
-- licensed under the MIT
--
-- https://nicescroll.areaaperta.com/
-- https://github.com/inuyaksa/jquery.nicescroll
--
*/

/* jshint expr: true */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS.
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals.
        factory(jQuery);
    }
}(function (jQuery) {

    "use strict";

    // globals
    var domfocus = false,
        mousefocus = false,
        tabindexcounter = 0,
        ascrailcounter = 2000,
        globalmaxzindex = 0;

    var $ = jQuery,       // sandbox
        _doc = document,
        _win = window,
        $window = $(_win);

    var delegatevents = [];

    // http://stackoverflow.com/questions/2161159/get-script-path
    function getScriptPath() {
        var scripts = _doc.currentScript || (function () { var s = _doc.getElementsByTagName('script'); return (s.length) ? s[s.length - 1] : false; })();
        var path = scripts ? scripts.src.split('?')[0] : '';
        return (path.split('/').length > 0) ? path.split('/').slice(0, -1).join('/') + '/' : '';
    }

    // based on code by Paul Irish https://www.paulirish.com/2011/requestanimationframe-for-smart-animating/  
    var setAnimationFrame = _win.requestAnimationFrame || _win.webkitRequestAnimationFrame || _win.mozRequestAnimationFrame || false;
    var clearAnimationFrame = _win.cancelAnimationFrame || _win.webkitCancelAnimationFrame || _win.mozCancelAnimationFrame || false;

    if (!setAnimationFrame) {
        var anilasttime = 0;
        setAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - anilasttime));
            var id = _win.setTimeout(function () { callback(currTime + timeToCall); },
                timeToCall);
            anilasttime = currTime + timeToCall;
            return id;
        };
        clearAnimationFrame = function (id) {
            _win.clearTimeout(id);
        };
    } else {
        if (!_win.cancelAnimationFrame) clearAnimationFrame = function (id) { };
    }

    var ClsMutationObserver = _win.MutationObserver || _win.WebKitMutationObserver || false;

    var now = Date.now || function () { return new Date().getTime(); };

    var _globaloptions = {
        zindex: "auto",
        cursoropacitymin: 0,
        cursoropacitymax: 1,
        cursorcolor: "#424242",
        cursorwidth: "6px",
        cursorborder: "1px solid #fff",
        cursorborderradius: "5px",
        scrollspeed: 40,
        mousescrollstep: 9 * 3,
        touchbehavior: false,   // deprecated
        emulatetouch: false,    // replacing touchbehavior
        hwacceleration: true,
        usetransition: true,
        boxzoom: false,
        dblclickzoom: true,
        gesturezoom: true,
        grabcursorenabled: true,
        autohidemode: true,
        background: "",
        iframeautoresize: true,
        cursorminheight: 32,
        preservenativescrolling: true,
        railoffset: false,
        railhoffset: false,
        bouncescroll: true,
        spacebarenabled: true,
        railpadding: {
            top: 0,
            right: 0,
            left: 0,
            bottom: 0
        },
        disableoutline: true,
        horizrailenabled: true,
        railalign: "right",
        railvalign: "bottom",
        enabletranslate3d: true,
        enablemousewheel: true,
        enablekeyboard: true,
        smoothscroll: true,
        sensitiverail: true,
        enablemouselockapi: true,
        //      cursormaxheight:false,
        cursorfixedheight: false,
        directionlockdeadzone: 6,
        hidecursordelay: 400,
        nativeparentscrolling: true,
        enablescrollonselection: true,
        overflowx: true,
        overflowy: true,
        cursordragspeed: 0.3,
        rtlmode: "auto",
        cursordragontouch: false,
        oneaxismousemode: "auto",
        scriptpath: getScriptPath(),
        preventmultitouchscrolling: true,
        disablemutationobserver: false,
        enableobserver: true,
        scrollbarid: false,
        scrollCLass: false
    };

    var browserdetected = false;

    var getBrowserDetection = function () {

        if (browserdetected) return browserdetected;

        var _el = _doc.createElement('DIV'),
            _style = _el.style,
            _agent = navigator.userAgent,
            _platform = navigator.platform,
            d = {};

        d.haspointerlock = "pointerLockElement" in _doc || "webkitPointerLockElement" in _doc || "mozPointerLockElement" in _doc;

        d.isopera = ("opera" in _win); // 12-
        d.isopera12 = (d.isopera && ("getUserMedia" in navigator));
        d.isoperamini = (Object.prototype.toString.call(_win.operamini) === "[object OperaMini]");

        d.isie = (("all" in _doc) && ("attachEvent" in _el) && !d.isopera); //IE10-
        d.isieold = (d.isie && !("msInterpolationMode" in _style)); // IE6 and older
        d.isie7 = d.isie && !d.isieold && (!("documentMode" in _doc) || (_doc.documentMode === 7));
        d.isie8 = d.isie && ("documentMode" in _doc) && (_doc.documentMode === 8);
        d.isie9 = d.isie && ("performance" in _win) && (_doc.documentMode === 9);
        d.isie10 = d.isie && ("performance" in _win) && (_doc.documentMode === 10);
        d.isie11 = ("msRequestFullscreen" in _el) && (_doc.documentMode >= 11); // IE11+

        d.ismsedge = ("msCredentials" in _win);  // MS Edge 14+

        d.ismozilla = ("MozAppearance" in _style);

        d.iswebkit = !d.ismsedge && ("WebkitAppearance" in _style);

        d.ischrome = d.iswebkit && ("chrome" in _win);
        d.ischrome38 = (d.ischrome && ("touchAction" in _style)); // behavior changed in touch emulation    
        d.ischrome22 = (!d.ischrome38) && (d.ischrome && d.haspointerlock);
        d.ischrome26 = (!d.ischrome38) && (d.ischrome && ("transition" in _style)); // issue with transform detection (maintain prefix)

        d.cantouch = ("ontouchstart" in _doc.documentElement) || ("ontouchstart" in _win); // with detection for Chrome Touch Emulation    
        d.hasw3ctouch = (_win.PointerEvent || false) && ((navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)); //IE11 pointer events, following W3C Pointer Events spec
        d.hasmstouch = (!d.hasw3ctouch) && (_win.MSPointerEvent || false); // IE10 pointer events

        d.ismac = /^mac$/i.test(_platform);

        d.isios = d.cantouch && /iphone|ipad|ipod/i.test(_platform);
        d.isios4 = d.isios && !("seal" in Object);
        d.isios7 = d.isios && ("webkitHidden" in _doc);  //iOS 7+
        d.isios8 = d.isios && ("hidden" in _doc);  //iOS 8+
        d.isios10 = d.isios && _win.Proxy;  //iOS 10+

        d.isandroid = (/android/i.test(_agent));

        d.haseventlistener = ("addEventListener" in _el);

        d.trstyle = false;
        d.hastransform = false;
        d.hastranslate3d = false;
        d.transitionstyle = false;
        d.hastransition = false;
        d.transitionend = false;

        d.trstyle = "transform";
        d.hastransform = ("transform" in _style) || (function () {
            var check = ['msTransform', 'webkitTransform', 'MozTransform', 'OTransform'];
            for (var a = 0, c = check.length; a < c; a++) {
                if (_style[check[a]] !== undefined) {
                    d.trstyle = check[a];
                    break;
                }
            }
            d.hastransform = (!!d.trstyle);
        })();

        if (d.hastransform) {
            _style[d.trstyle] = "translate3d(1px,2px,3px)";
            d.hastranslate3d = /translate3d/.test(_style[d.trstyle]);
        }

        d.transitionstyle = "transition";
        d.prefixstyle = '';
        d.transitionend = "transitionend";

        d.hastransition = ("transition" in _style) || (function () {

            d.transitionend = false;
            var check = ['webkitTransition', 'msTransition', 'MozTransition', 'OTransition', 'OTransition', 'KhtmlTransition'];
            var prefix = ['-webkit-', '-ms-', '-moz-', '-o-', '-o', '-khtml-'];
            var evs = ['webkitTransitionEnd', 'msTransitionEnd', 'transitionend', 'otransitionend', 'oTransitionEnd', 'KhtmlTransitionEnd'];
            for (var a = 0, c = check.length; a < c; a++) {
                if (check[a] in _style) {
                    d.transitionstyle = check[a];
                    d.prefixstyle = prefix[a];
                    d.transitionend = evs[a];
                    break;
                }
            }
            if (d.ischrome26) d.prefixstyle = prefix[1];  // always use prefix

            d.hastransition = (d.transitionstyle);

        })();

        function detectCursorGrab() {
            var lst = ['grab', '-webkit-grab', '-moz-grab'];
            if ((d.ischrome && !d.ischrome38) || d.isie) lst = []; // force setting for IE returns false positive and chrome cursor bug
            for (var a = 0, l = lst.length; a < l; a++) {
                var p = lst[a];
                _style.cursor = p;
                if (_style.cursor == p) return p;
            }
            return 'url(https://cdnjs.cloudflare.com/ajax/libs/slider-pro/1.3.0/css/images/openhand.cur),n-resize'; // thanks to https://cdnjs.com/ for the openhand cursor!
        }
        d.cursorgrabvalue = detectCursorGrab();

        d.hasmousecapture = ("setCapture" in _el);

        d.hasMutationObserver = (ClsMutationObserver !== false);

        _el = null; //memory released

        browserdetected = d;

        return d;
    };

    var NiceScrollClass = function (myopt, me) {

        var self = this;

        this.version = '3.7.6';
        this.name = 'nicescroll';

        this.me = me;

        var $body = $("body");

        var opt = this.opt = {
            doc: $body,
            win: false
        };

        $.extend(opt, _globaloptions);  // clone opts

        // Options for internal use
        opt.snapbackspeed = 80;

        if (myopt || false) {
            for (var a in opt) {
                if (myopt[a] !== undefined) opt[a] = myopt[a];
            }
        }

        if (opt.disablemutationobserver) ClsMutationObserver = false;

        this.doc = opt.doc;
        this.iddoc = (this.doc && this.doc[0]) ? this.doc[0].id || '' : '';
        this.ispage = /^BODY|HTML/.test((opt.win) ? opt.win[0].nodeName : this.doc[0].nodeName);
        this.haswrapper = (opt.win !== false);
        this.win = opt.win || (this.ispage ? $window : this.doc);
        this.docscroll = (this.ispage && !this.haswrapper) ? $window : this.win;
        this.body = $body;
        this.viewport = false;

        this.isfixed = false;

        this.iframe = false;
        this.isiframe = ((this.doc[0].nodeName == 'IFRAME') && (this.win[0].nodeName == 'IFRAME'));

        this.istextarea = (this.win[0].nodeName == 'TEXTAREA');

        this.forcescreen = false; //force to use screen position on events

        this.canshowonmouseevent = (opt.autohidemode != "scroll");

        // Events jump table    
        this.onmousedown = false;
        this.onmouseup = false;
        this.onmousemove = false;
        this.onmousewheel = false;
        this.onkeypress = false;
        this.ongesturezoom = false;
        this.onclick = false;

        // Nicescroll custom events
        this.onscrollstart = false;
        this.onscrollend = false;
        this.onscrollcancel = false;

        this.onzoomin = false;
        this.onzoomout = false;

        // Let's start!  
        this.view = false;
        this.page = false;

        this.scroll = {
            x: 0,
            y: 0
        };
        this.scrollratio = {
            x: 0,
            y: 0
        };
        this.cursorheight = 20;
        this.scrollvaluemax = 0;

        // http://dev.w3.org/csswg/css-writing-modes-3/#logical-to-physical
        // http://dev.w3.org/csswg/css-writing-modes-3/#svg-writing-mode
        if (opt.rtlmode == "auto") {
            var target = this.win[0] == _win ? this.body : this.win;
            var writingMode = target.css("writing-mode") || target.css("-webkit-writing-mode") || target.css("-ms-writing-mode") || target.css("-moz-writing-mode");

            if (writingMode == "horizontal-tb" || writingMode == "lr-tb" || writingMode === "") {
                this.isrtlmode = (target.css("direction") == "rtl");
                this.isvertical = false;
            } else {
                this.isrtlmode = (writingMode == "vertical-rl" || writingMode == "tb" || writingMode == "tb-rl" || writingMode == "rl-tb");
                this.isvertical = (writingMode == "vertical-rl" || writingMode == "tb" || writingMode == "tb-rl");
            }
        } else {
            this.isrtlmode = (opt.rtlmode === true);
            this.isvertical = false;
        }
        //    this.checkrtlmode = false;

        this.scrollrunning = false;

        this.scrollmom = false;

        this.observer = false;  // observer div changes
        this.observerremover = false;  // observer on parent for remove detection
        this.observerbody = false;  // observer on body for position change

        if (opt.scrollbarid !== false) {
            this.id = opt.scrollbarid;
        } else {
            do {
                this.id = "ascrail" + (ascrailcounter++);
            } while (_doc.getElementById(this.id));
        }

        this.rail = false;
        this.cursor = false;
        this.cursorfreezed = false;
        this.selectiondrag = false;

        this.zoom = false;
        this.zoomactive = false;

        this.hasfocus = false;
        this.hasmousefocus = false;

        //this.visibility = true;
        this.railslocked = false;  // locked by resize
        this.locked = false;  // prevent lost of locked status sets by user
        this.hidden = false; // rails always hidden
        this.cursoractive = true; // user can interact with cursors

        this.wheelprevented = false; //prevent mousewheel event

        this.overflowx = opt.overflowx;
        this.overflowy = opt.overflowy;

        this.nativescrollingarea = false;
        this.checkarea = 0;

        this.events = []; // event list for unbind

        this.saved = {};  // style saved

        this.delaylist = {};
        this.synclist = {};

        this.lastdeltax = 0;
        this.lastdeltay = 0;

        this.detected = getBrowserDetection();

        var cap = $.extend({}, this.detected);

        this.canhwscroll = (cap.hastransform && opt.hwacceleration);
        this.ishwscroll = (this.canhwscroll && self.haswrapper);

        if (!this.isrtlmode) {
            this.hasreversehr = false;
        } else if (this.isvertical) { // RTL mode with reverse horizontal axis
            this.hasreversehr = !(cap.iswebkit || cap.isie || cap.isie11);
        } else {
            this.hasreversehr = !(cap.iswebkit || (cap.isie && !cap.isie10 && !cap.isie11));
        }

        this.istouchcapable = false; // desktop devices with touch screen support

        //## Check WebKit-based desktop with touch support
        //## + Firefox 18 nightly build (desktop) false positive (or desktop with touch support)

        if (!cap.cantouch && (cap.hasw3ctouch || cap.hasmstouch)) {  // desktop device with multiple input
            this.istouchcapable = true;
        } else if (cap.cantouch && !cap.isios && !cap.isandroid && (cap.iswebkit || cap.ismozilla)) {
            this.istouchcapable = true;
        }

        //## disable MouseLock API on user request
        if (!opt.enablemouselockapi) {
            cap.hasmousecapture = false;
            cap.haspointerlock = false;
        }

        this.debounced = function (name, fn, tm) {
            if (!self) return;
            var dd = self.delaylist[name] || false;
            if (!dd) {
                self.delaylist[name] = {
                    h: setAnimationFrame(function () {
                        self.delaylist[name].fn.call(self);
                        self.delaylist[name] = false;
                    }, tm)
                };
                fn.call(self);
            }
            self.delaylist[name].fn = fn;
        };


        this.synched = function (name, fn) {
            if (self.synclist[name]) self.synclist[name] = fn;
            else {
                self.synclist[name] = fn;
                setAnimationFrame(function () {
                    if (!self) return;
                    self.synclist[name] && self.synclist[name].call(self);
                    self.synclist[name] = null;
                });
            }
        };

        this.unsynched = function (name) {
            if (self.synclist[name]) self.synclist[name] = false;
        };

        this.css = function (el, pars) { // save & set
            for (var n in pars) {
                self.saved.css.push([el, n, el.css(n)]);
                el.css(n, pars[n]);
            }
        };

        this.scrollTop = function (val) {
            return (val === undefined) ? self.getScrollTop() : self.setScrollTop(val);
        };

        this.scrollLeft = function (val) {
            return (val === undefined) ? self.getScrollLeft() : self.setScrollLeft(val);
        };

        // derived by by Dan Pupius www.pupius.net
        var BezierClass = function (st, ed, spd, p1, p2, p3, p4) {

            this.st = st;
            this.ed = ed;
            this.spd = spd;

            this.p1 = p1 || 0;
            this.p2 = p2 || 1;
            this.p3 = p3 || 0;
            this.p4 = p4 || 1;

            this.ts = now();
            this.df = ed - st;
        };
        BezierClass.prototype = {
            B2: function (t) {
                return 3 * (1 - t) * (1 - t) * t;
            },
            B3: function (t) {
                return 3 * (1 - t) * t * t;
            },
            B4: function (t) {
                return t * t * t;
            },
            getPos: function () {
                return (now() - this.ts) / this.spd;
            },
            getNow: function () {
                var pc = (now() - this.ts) / this.spd;
                var bz = this.B2(pc) + this.B3(pc) + this.B4(pc);
                return (pc >= 1) ? this.ed : this.st + (this.df * bz) | 0;
            },
            update: function (ed, spd) {
                this.st = this.getNow();
                this.ed = ed;
                this.spd = spd;
                this.ts = now();
                this.df = this.ed - this.st;
                return this;
            }
        };

        //derived from http://stackoverflow.com/questions/11236090/
        function getMatrixValues() {
            var tr = self.doc.css(cap.trstyle);
            if (tr && (tr.substr(0, 6) == "matrix")) {
                return tr.replace(/^.*\((.*)\)$/g, "$1").replace(/px/g, '').split(/, +/);
            }
            return false;
        }

        if (this.ishwscroll) {    // hw accelerated scroll

            this.doc.translate = {
                x: 0,
                y: 0,
                tx: "0px",
                ty: "0px"
            };

            //this one can help to enable hw accel on ios6 http://indiegamr.com/ios6-html-hardware-acceleration-changes-and-how-to-fix-them/
            if (cap.hastranslate3d && cap.isios) this.doc.css("-webkit-backface-visibility", "hidden"); // prevent flickering http://stackoverflow.com/questions/3461441/      

            this.getScrollTop = function (last) {
                if (!last) {
                    var mtx = getMatrixValues();
                    if (mtx) return (mtx.length == 16) ? -mtx[13] : -mtx[5]; //matrix3d 16 on IE10
                    if (self.timerscroll && self.timerscroll.bz) return self.timerscroll.bz.getNow();
                }
                return self.doc.translate.y;
            };

            this.getScrollLeft = function (last) {
                if (!last) {
                    var mtx = getMatrixValues();
                    if (mtx) return (mtx.length == 16) ? -mtx[12] : -mtx[4]; //matrix3d 16 on IE10
                    if (self.timerscroll && self.timerscroll.bh) return self.timerscroll.bh.getNow();
                }
                return self.doc.translate.x;
            };

            this.notifyScrollEvent = function (el) {
                var e = _doc.createEvent("UIEvents");
                e.initUIEvent("scroll", false, false, _win, 1);
                e.niceevent = true;
                el.dispatchEvent(e);
            };

            var cxscrollleft = (this.isrtlmode) ? 1 : -1;

            if (cap.hastranslate3d && opt.enabletranslate3d) {
                this.setScrollTop = function (val, silent) {
                    self.doc.translate.y = val;
                    self.doc.translate.ty = (val * -1) + "px";
                    self.doc.css(cap.trstyle, "translate3d(" + self.doc.translate.tx + "," + self.doc.translate.ty + ",0)");
                    if (!silent) self.notifyScrollEvent(self.win[0]);
                };
                this.setScrollLeft = function (val, silent) {
                    self.doc.translate.x = val;
                    self.doc.translate.tx = (val * cxscrollleft) + "px";
                    self.doc.css(cap.trstyle, "translate3d(" + self.doc.translate.tx + "," + self.doc.translate.ty + ",0)");
                    if (!silent) self.notifyScrollEvent(self.win[0]);
                };
            } else {
                this.setScrollTop = function (val, silent) {
                    self.doc.translate.y = val;
                    self.doc.translate.ty = (val * -1) + "px";
                    self.doc.css(cap.trstyle, "translate(" + self.doc.translate.tx + "," + self.doc.translate.ty + ")");
                    if (!silent) self.notifyScrollEvent(self.win[0]);
                };
                this.setScrollLeft = function (val, silent) {
                    self.doc.translate.x = val;
                    self.doc.translate.tx = (val * cxscrollleft) + "px";
                    self.doc.css(cap.trstyle, "translate(" + self.doc.translate.tx + "," + self.doc.translate.ty + ")");
                    if (!silent) self.notifyScrollEvent(self.win[0]);
                };
            }
        } else {    // native scroll

            this.getScrollTop = function () {
                return self.docscroll.scrollTop();
            };
            this.setScrollTop = function (val) {
                self.docscroll.scrollTop(val);
            };

            this.getScrollLeft = function () {
                var val;
                if (!self.hasreversehr) {
                    val = self.docscroll.scrollLeft();
                } else if (self.detected.ismozilla) {
                    val = self.page.maxw - Math.abs(self.docscroll.scrollLeft());
                } else {
                    val = self.page.maxw - self.docscroll.scrollLeft();
                }
                return val;
            };
            this.setScrollLeft = function (val) {
                return setTimeout(function () {
                    if (!self) return;
                    if (self.hasreversehr) {
                        if (self.detected.ismozilla) {
                            val = -(self.page.maxw - val);
                        } else {
                            val = self.page.maxw - val;
                        }
                    }
                    return self.docscroll.scrollLeft(val);
                }, 1);
            };
        }

        this.getTarget = function (e) {
            if (!e) return false;
            if (e.target) return e.target;
            if (e.srcElement) return e.srcElement;
            return false;
        };

        this.hasParent = function (e, id) {
            if (!e) return false;
            var el = e.target || e.srcElement || e || false;
            while (el && el.id != id) {
                el = el.parentNode || false;
            }
            return (el !== false);
        };

        function getZIndex() {
            var dom = self.win;
            if ("zIndex" in dom) return dom.zIndex(); // use jQuery UI method when available
            while (dom.length > 0) {
                if (dom[0].nodeType == 9) return false;
                var zi = dom.css('zIndex');
                if (!isNaN(zi) && zi !== 0) return parseInt(zi);
                dom = dom.parent();
            }
            return false;
        }

        //inspired by http://forum.jquery.com/topic/width-includes-border-width-when-set-to-thin-medium-thick-in-ie
        var _convertBorderWidth = {
            "thin": 1,
            "medium": 3,
            "thick": 5
        };

        function getWidthToPixel(dom, prop, chkheight) {
            var wd = dom.css(prop);
            var px = parseFloat(wd);
            if (isNaN(px)) {
                px = _convertBorderWidth[wd] || 0;
                var brd = (px == 3) ? ((chkheight) ? (self.win.outerHeight() - self.win.innerHeight()) : (self.win.outerWidth() - self.win.innerWidth())) : 1; //DON'T TRUST CSS
                if (self.isie8 && px) px += 1;
                return (brd) ? px : 0;
            }
            return px;
        }

        this.getDocumentScrollOffset = function () {
            return {
                top: _win.pageYOffset || _doc.documentElement.scrollTop,
                left: _win.pageXOffset || _doc.documentElement.scrollLeft
            };
        };

        this.getOffset = function () {
            if (self.isfixed) {
                var ofs = self.win.offset();  // fix Chrome auto issue (when right/bottom props only)
                var scrl = self.getDocumentScrollOffset();
                ofs.top -= scrl.top;
                ofs.left -= scrl.left;
                return ofs;
            }
            var ww = self.win.offset();
            if (!self.viewport) return ww;
            var vp = self.viewport.offset();
            return {
                top: ww.top - vp.top,
                left: ww.left - vp.left
            };
        };

        this.updateScrollBar = function (len) {
            var pos, off;
            if (self.ishwscroll) {
                self.rail.css({
                    height: self.win.innerHeight() - (opt.railpadding.top + opt.railpadding.bottom)
                });
                if (self.railh) self.railh.css({
                    width: self.win.innerWidth() - (opt.railpadding.left + opt.railpadding.right)
                });
            } else {
                var wpos = self.getOffset();
                pos = {
                    top: wpos.top,
                    left: wpos.left - (opt.railpadding.left + opt.railpadding.right)
                };
                pos.top += getWidthToPixel(self.win, 'border-top-width', true);
                pos.left += (self.rail.align) ? self.win.outerWidth() - getWidthToPixel(self.win, 'border-right-width') - self.rail.width : getWidthToPixel(self.win, 'border-left-width');

                off = opt.railoffset;
                if (off) {
                    if (off.top) pos.top += off.top;
                    if (off.left) pos.left += off.left;
                }

                if (!self.railslocked) self.rail.css({
                    top: pos.top,
                    left: pos.left,
                    height: ((len) ? len.h : self.win.innerHeight()) - (opt.railpadding.top + opt.railpadding.bottom)
                });

                if (self.zoom) {
                    self.zoom.css({
                        top: pos.top + 1,
                        left: (self.rail.align == 1) ? pos.left - 20 : pos.left + self.rail.width + 4
                    });
                }

                if (self.railh && !self.railslocked) {
                    pos = {
                        top: wpos.top,
                        left: wpos.left
                    };
                    off = opt.railhoffset;
                    if (off) {
                        if (off.top) pos.top += off.top;
                        if (off.left) pos.left += off.left;
                    }
                    var y = (self.railh.align) ? pos.top + getWidthToPixel(self.win, 'border-top-width', true) + self.win.innerHeight() - self.railh.height : pos.top + getWidthToPixel(self.win, 'border-top-width', true);
                    var x = pos.left + getWidthToPixel(self.win, 'border-left-width');
                    self.railh.css({
                        top: y - (opt.railpadding.top + opt.railpadding.bottom),
                        left: x,
                        width: self.railh.width
                    });
                }

            }
        };

        this.doRailClick = function (e, dbl, hr) {
            var fn, pg, cur, pos;

            if (self.railslocked) return;

            self.cancelEvent(e);

            if (!("pageY" in e)) {
                e.pageX = e.clientX + _doc.documentElement.scrollLeft;
                e.pageY = e.clientY + _doc.documentElement.scrollTop;
            }

            if (dbl) {
                fn = (hr) ? self.doScrollLeft : self.doScrollTop;
                cur = (hr) ? ((e.pageX - self.railh.offset().left - (self.cursorwidth / 2)) * self.scrollratio.x) : ((e.pageY - self.rail.offset().top - (self.cursorheight / 2)) * self.scrollratio.y);
                self.unsynched("relativexy");
                fn(cur | 0);
            } else {
                fn = (hr) ? self.doScrollLeftBy : self.doScrollBy;
                cur = (hr) ? self.scroll.x : self.scroll.y;
                pos = (hr) ? e.pageX - self.railh.offset().left : e.pageY - self.rail.offset().top;
                pg = (hr) ? self.view.w : self.view.h;
                fn((cur >= pos) ? pg : -pg);
            }

        };

        self.newscrolly = self.newscrollx = 0;

        self.hasanimationframe = ("requestAnimationFrame" in _win);
        self.hascancelanimationframe = ("cancelAnimationFrame" in _win);

        self.hasborderbox = false;

        this.init = function () {

            self.saved.css = [];

            if (cap.isoperamini) return true; // SORRY, DO NOT WORK!
            if (cap.isandroid && !("hidden" in _doc)) return true; // Android 3- SORRY, DO NOT WORK!

            opt.emulatetouch = opt.emulatetouch || opt.touchbehavior;  // mantain compatibility with "touchbehavior"      

            self.hasborderbox = _win.getComputedStyle && (_win.getComputedStyle(_doc.body)['box-sizing'] === "border-box");

            var _scrollyhidden = { 'overflow-y': 'hidden' };
            if (cap.isie11 || cap.isie10) _scrollyhidden['-ms-overflow-style'] = 'none';  // IE 10 & 11 is always a world apart!

            if (self.ishwscroll) {
                this.doc.css(cap.transitionstyle, cap.prefixstyle + 'transform 0ms ease-out');
                if (cap.transitionend) self.bind(self.doc, cap.transitionend, self.onScrollTransitionEnd, false); //I have got to do something usefull!!
            }

            self.zindex = "auto";
            if (!self.ispage && opt.zindex == "auto") {
                self.zindex = getZIndex() || "auto";
            } else {
                self.zindex = opt.zindex;
            }

            if (!self.ispage && self.zindex != "auto" && self.zindex > globalmaxzindex) {
                globalmaxzindex = self.zindex;
            }

            if (self.isie && self.zindex === 0 && opt.zindex == "auto") { // fix IE auto == 0
                self.zindex = "auto";
            }

            if (!self.ispage || !cap.isieold) {

                var cont = self.docscroll;
                if (self.ispage) cont = (self.haswrapper) ? self.win : self.doc;

                self.css(cont, _scrollyhidden);

                if (self.ispage && (cap.isie11 || cap.isie)) { // IE 7-11
                    self.css($("html"), _scrollyhidden);
                }

                if (cap.isios && !self.ispage && !self.haswrapper) self.css($body, {
                    "-webkit-overflow-scrolling": "touch"
                }); //force hw acceleration

                var cursor = $(_doc.createElement('div'));
                cursor.css({
                    position: "relative",
                    top: 0,
                    "float": "right",
                    width: opt.cursorwidth,
                    height: 0,
                    'background-color': opt.cursorcolor,
                    border: opt.cursorborder,
                    'background-clip': 'padding-box',
                    '-webkit-border-radius': opt.cursorborderradius,
                    '-moz-border-radius': opt.cursorborderradius,
                    'border-radius': opt.cursorborderradius
                });

                cursor.addClass('nicescroll-cursors');

                self.cursor = cursor;

                var rail = $(_doc.createElement('div'));
                rail.attr('id', self.id);
                rail.addClass('nicescroll-rails nicescroll-rails-vr');

                if (opt.scrollCLass) {
                    rail.addClass(opt.scrollCLass);
                }

                var v, a, kp = ["left", "right", "top", "bottom"];  //**
                for (var n in kp) {
                    a = kp[n];
                    v = opt.railpadding[a] || 0;
                    v && rail.css("padding-" + a, v + "px");
                }

                rail.append(cursor);

                rail.width = Math.max(parseFloat(opt.cursorwidth), cursor.outerWidth());
                rail.css({
                    width: rail.width + "px",
                    zIndex: self.zindex,
                    background: opt.background,
                    cursor: "default"
                });

                rail.visibility = true;
                rail.scrollable = true;

                rail.align = (opt.railalign == "left") ? 0 : 1;

                self.rail = rail;

                self.rail.drag = false;

                var zoom = false;
                if (opt.boxzoom && !self.ispage && !cap.isieold) {
                    zoom = _doc.createElement('div');

                    self.bind(zoom, "click", self.doZoom);
                    self.bind(zoom, "mouseenter", function () {
                        self.zoom.css('opacity', opt.cursoropacitymax);
                    });
                    self.bind(zoom, "mouseleave", function () {
                        self.zoom.css('opacity', opt.cursoropacitymin);
                    });

                    self.zoom = $(zoom);
                    self.zoom.css({
                        cursor: "pointer",
                        zIndex: self.zindex,
                        backgroundImage: 'url(' + opt.scriptpath + 'zoomico.png)',
                        height: 18,
                        width: 18,
                        backgroundPosition: '0 0'
                    });
                    if (opt.dblclickzoom) self.bind(self.win, "dblclick", self.doZoom);
                    if (cap.cantouch && opt.gesturezoom) {
                        self.ongesturezoom = function (e) {
                            if (e.scale > 1.5) self.doZoomIn(e);
                            if (e.scale < 0.8) self.doZoomOut(e);
                            return self.cancelEvent(e);
                        };
                        self.bind(self.win, "gestureend", self.ongesturezoom);
                    }
                }

                // init HORIZ

                self.railh = false;
                var railh;

                if (opt.horizrailenabled) {

                    self.css(cont, {
                        overflowX: 'hidden'
                    });

                    cursor = $(_doc.createElement('div'));
                    cursor.css({
                        position: "absolute",
                        top: 0,
                        height: opt.cursorwidth,
                        width: 0,
                        backgroundColor: opt.cursorcolor,
                        border: opt.cursorborder,
                        backgroundClip: 'padding-box',
                        '-webkit-border-radius': opt.cursorborderradius,
                        '-moz-border-radius': opt.cursorborderradius,
                        'border-radius': opt.cursorborderradius
                    });

                    if (cap.isieold) cursor.css('overflow', 'hidden');  //IE6 horiz scrollbar issue

                    cursor.addClass('nicescroll-cursors');

                    self.cursorh = cursor;

                    railh = $(_doc.createElement('div'));
                    railh.attr('id', self.id + '-hr');
                    railh.addClass('nicescroll-rails nicescroll-rails-hr');
                    if (opt.scrollCLass) {
                        railh.addClass(opt.scrollCLass);
                    }

                    railh.height = Math.max(parseFloat(opt.cursorwidth), cursor.outerHeight());
                    railh.css({
                        height: railh.height + "px",
                        'zIndex': self.zindex,
                        "background": opt.background
                    });

                    railh.append(cursor);

                    railh.visibility = true;
                    railh.scrollable = true;

                    railh.align = (opt.railvalign == "top") ? 0 : 1;

                    self.railh = railh;

                    self.railh.drag = false;

                }

                if (self.ispage) {

                    rail.css({
                        position: "fixed",
                        top: 0,
                        height: "100%"
                    });

                    rail.css((rail.align) ? { right: 0 } : { left: 0 });

                    self.body.append(rail);
                    if (self.railh) {
                        railh.css({
                            position: "fixed",
                            left: 0,
                            width: "100%"
                        });

                        railh.css((railh.align) ? { bottom: 0 } : { top: 0 });

                        self.body.append(railh);
                    }
                } else {
                    if (self.ishwscroll) {
                        if (self.win.css('position') == 'static') self.css(self.win, { 'position': 'relative' });
                        var bd = (self.win[0].nodeName == 'HTML') ? self.body : self.win;
                        $(bd).scrollTop(0).scrollLeft(0);  // fix rail position if content already scrolled
                        if (self.zoom) {
                            self.zoom.css({
                                position: "absolute",
                                top: 1,
                                right: 0,
                                "margin-right": rail.width + 4
                            });
                            bd.append(self.zoom);
                        }
                        rail.css({
                            position: "absolute",
                            top: 0
                        });
                        rail.css((rail.align) ? { right: 0 } : { left: 0 });
                        bd.append(rail);
                        if (railh) {
                            railh.css({
                                position: "absolute",
                                left: 0,
                                bottom: 0
                            });
                            railh.css((railh.align) ? { bottom: 0 } : { top: 0 });
                            bd.append(railh);
                        }
                    } else {
                        self.isfixed = (self.win.css("position") == "fixed");
                        var rlpos = (self.isfixed) ? "fixed" : "absolute";

                        if (!self.isfixed) self.viewport = self.getViewport(self.win[0]);
                        if (self.viewport) {
                            self.body = self.viewport;
                            if (!(/fixed|absolute/.test(self.viewport.css("position")))) self.css(self.viewport, {
                                "position": "relative"
                            });
                        }

                        rail.css({
                            position: rlpos
                        });
                        if (self.zoom) self.zoom.css({
                            position: rlpos
                        });
                        self.updateScrollBar();
                        self.body.append(rail);
                        if (self.zoom) self.body.append(self.zoom);
                        if (self.railh) {
                            railh.css({
                                position: rlpos
                            });
                            self.body.append(railh);
                        }
                    }

                    if (cap.isios) self.css(self.win, {
                        '-webkit-tap-highlight-color': 'rgba(0,0,0,0)',
                        '-webkit-touch-callout': 'none'
                    }); // prevent grey layer on click

                    if (opt.disableoutline) {
                        if (cap.isie) self.win.attr("hideFocus", "true"); // IE, prevent dotted rectangle on focused div
                        if (cap.iswebkit) self.win.css('outline', 'none');  // Webkit outline
                    }

                }

                if (opt.autohidemode === false) {
                    self.autohidedom = false;
                    self.rail.css({
                        opacity: opt.cursoropacitymax
                    });
                    if (self.railh) self.railh.css({
                        opacity: opt.cursoropacitymax
                    });
                } else if ((opt.autohidemode === true) || (opt.autohidemode === "leave")) {
                    self.autohidedom = $().add(self.rail);
                    if (cap.isie8) self.autohidedom = self.autohidedom.add(self.cursor);
                    if (self.railh) self.autohidedom = self.autohidedom.add(self.railh);
                    if (self.railh && cap.isie8) self.autohidedom = self.autohidedom.add(self.cursorh);
                } else if (opt.autohidemode == "scroll") {
                    self.autohidedom = $().add(self.rail);
                    if (self.railh) self.autohidedom = self.autohidedom.add(self.railh);
                } else if (opt.autohidemode == "cursor") {
                    self.autohidedom = $().add(self.cursor);
                    if (self.railh) self.autohidedom = self.autohidedom.add(self.cursorh);
                } else if (opt.autohidemode == "hidden") {
                    self.autohidedom = false;
                    self.hide();
                    self.railslocked = false;
                }

                if (cap.cantouch || self.istouchcapable || opt.emulatetouch || cap.hasmstouch) {

                    self.scrollmom = new ScrollMomentumClass2D(self);

                    var delayedclick = null;

                    self.ontouchstart = function (e) {

                        if (self.locked) return false;

                        //if (e.pointerType && e.pointerType != 2 && e.pointerType != "touch") return false;
                        if (e.pointerType && (e.pointerType === 'mouse' || e.pointerType === e.MSPOINTER_TYPE_MOUSE)) return false;  // need test on surface!!

                        self.hasmoving = false;

                        if (self.scrollmom.timer) {
                            self.triggerScrollEnd();
                            self.scrollmom.stop();
                        }

                        if (!self.railslocked) {
                            var tg = self.getTarget(e);

                            if (tg) {
                                var skp = (/INPUT/i.test(tg.nodeName)) && (/range/i.test(tg.type));
                                if (skp) return self.stopPropagation(e);
                            }

                            var ismouse = (e.type === "mousedown");

                            if (!("clientX" in e) && ("changedTouches" in e)) {
                                e.clientX = e.changedTouches[0].clientX;
                                e.clientY = e.changedTouches[0].clientY;
                            }

                            if (self.forcescreen) {
                                var le = e;
                                e = {
                                    "original": (e.original) ? e.original : e
                                };
                                e.clientX = le.screenX;
                                e.clientY = le.screenY;
                            }

                            self.rail.drag = {
                                x: e.clientX,
                                y: e.clientY,
                                sx: self.scroll.x,
                                sy: self.scroll.y,
                                st: self.getScrollTop(),
                                sl: self.getScrollLeft(),
                                pt: 2,
                                dl: false,
                                tg: tg
                            };

                            if (self.ispage || !opt.directionlockdeadzone) {

                                self.rail.drag.dl = "f";

                            } else {

                                var view = {
                                    w: $window.width(),
                                    h: $window.height()
                                };

                                var page = self.getContentSize();

                                var maxh = page.h - view.h;
                                var maxw = page.w - view.w;

                                if (self.rail.scrollable && !self.railh.scrollable) self.rail.drag.ck = (maxh > 0) ? "v" : false;
                                else if (!self.rail.scrollable && self.railh.scrollable) self.rail.drag.ck = (maxw > 0) ? "h" : false;
                                else self.rail.drag.ck = false;

                            }

                            if (opt.emulatetouch && self.isiframe && cap.isie) {
                                var wp = self.win.position();
                                self.rail.drag.x += wp.left;
                                self.rail.drag.y += wp.top;
                            }

                            self.hasmoving = false;
                            self.lastmouseup = false;
                            self.scrollmom.reset(e.clientX, e.clientY);

                            if (tg && ismouse) {

                                var ip = /INPUT|SELECT|BUTTON|TEXTAREA/i.test(tg.nodeName);
                                if (!ip) {
                                    if (cap.hasmousecapture) tg.setCapture();
                                    if (opt.emulatetouch) {
                                        if (tg.onclick && !(tg._onclick || false)) { // intercept DOM0 onclick event
                                            tg._onclick = tg.onclick;
                                            tg.onclick = function (e) {
                                                if (self.hasmoving) return false;
                                                tg._onclick.call(this, e);
                                            };
                                        }
                                        return self.cancelEvent(e);
                                    }
                                    return self.stopPropagation(e);
                                }

                                if (/SUBMIT|CANCEL|BUTTON/i.test($(tg).attr('type'))) {
                                    self.preventclick = {
                                        "tg": tg,
                                        "click": false
                                    };
                                }

                            }
                        }

                    };

                    self.ontouchend = function (e) {

                        if (!self.rail.drag) return true;

                        if (self.rail.drag.pt == 2) {
                            //if (e.pointerType && e.pointerType != 2 && e.pointerType != "touch") return false;
                            if (e.pointerType && (e.pointerType === 'mouse' || e.pointerType === e.MSPOINTER_TYPE_MOUSE)) return false;

                            self.rail.drag = false;

                            var ismouse = (e.type === "mouseup");

                            if (self.hasmoving) {
                                self.scrollmom.doMomentum();
                                self.lastmouseup = true;
                                self.hideCursor();
                                if (cap.hasmousecapture) _doc.releaseCapture();
                                if (ismouse) return self.cancelEvent(e);
                            }

                        }
                        else if (self.rail.drag.pt == 1) {
                            return self.onmouseup(e);
                        }

                    };

                    var moveneedoffset = (opt.emulatetouch && self.isiframe && !cap.hasmousecapture);

                    var locktollerance = opt.directionlockdeadzone * 0.3 | 0;

                    self.ontouchmove = function (e, byiframe) {

                        if (!self.rail.drag) return true;

                        if (e.targetTouches && opt.preventmultitouchscrolling) {
                            if (e.targetTouches.length > 1) return true; // multitouch
                        }

                        //if (e.pointerType && e.pointerType != 2 && e.pointerType != "touch") return false;
                        if (e.pointerType && (e.pointerType === 'mouse' || e.pointerType === e.MSPOINTER_TYPE_MOUSE)) return true;

                        if (self.rail.drag.pt == 2) {

                            if (("changedTouches" in e)) {
                                e.clientX = e.changedTouches[0].clientX;
                                e.clientY = e.changedTouches[0].clientY;
                            }

                            var ofy, ofx;
                            ofx = ofy = 0;

                            if (moveneedoffset && !byiframe) {
                                var wp = self.win.position();
                                ofx = -wp.left;
                                ofy = -wp.top;
                            }

                            var fy = e.clientY + ofy;
                            var my = (fy - self.rail.drag.y);
                            var fx = e.clientX + ofx;
                            var mx = (fx - self.rail.drag.x);

                            var ny = self.rail.drag.st - my;

                            if (self.ishwscroll && opt.bouncescroll) {
                                if (ny < 0) {
                                    ny = Math.round(ny / 2);
                                } else if (ny > self.page.maxh) {
                                    ny = self.page.maxh + Math.round((ny - self.page.maxh) / 2);
                                }
                            } else {
                                if (ny < 0) {
                                    ny = 0;
                                    fy = 0;
                                }
                                else if (ny > self.page.maxh) {
                                    ny = self.page.maxh;
                                    fy = 0;
                                }
                                if (fy === 0 && !self.hasmoving) {
                                    if (!self.ispage) self.rail.drag = false;
                                    return true;
                                }
                            }

                            var nx = self.getScrollLeft();

                            if (self.railh && self.railh.scrollable) {
                                nx = (self.isrtlmode) ? mx - self.rail.drag.sl : self.rail.drag.sl - mx;

                                if (self.ishwscroll && opt.bouncescroll) {
                                    if (nx < 0) {
                                        nx = Math.round(nx / 2);
                                    } else if (nx > self.page.maxw) {
                                        nx = self.page.maxw + Math.round((nx - self.page.maxw) / 2);
                                    }
                                } else {
                                    if (nx < 0) {
                                        nx = 0;
                                        fx = 0;
                                    }
                                    if (nx > self.page.maxw) {
                                        nx = self.page.maxw;
                                        fx = 0;
                                    }
                                }

                            }


                            if (!self.hasmoving) {

                                if (self.rail.drag.y === e.clientY && self.rail.drag.x === e.clientX) return self.cancelEvent(e);  // prevent first useless move event 

                                var ay = Math.abs(my);
                                var ax = Math.abs(mx);
                                var dz = opt.directionlockdeadzone;

                                if (!self.rail.drag.ck) {
                                    if (ay > dz && ax > dz) self.rail.drag.dl = "f";
                                    else if (ay > dz) self.rail.drag.dl = (ax > locktollerance) ? "f" : "v";
                                    else if (ax > dz) self.rail.drag.dl = (ay > locktollerance) ? "f" : "h";
                                }
                                else if (self.rail.drag.ck == "v") {
                                    if (ax > dz && ay <= locktollerance) {
                                        self.rail.drag = false;
                                    }
                                    else if (ay > dz) self.rail.drag.dl = "v";

                                }
                                else if (self.rail.drag.ck == "h") {

                                    if (ay > dz && ax <= locktollerance) {
                                        self.rail.drag = false;
                                    }
                                    else if (ax > dz) self.rail.drag.dl = "h";

                                }

                                if (!self.rail.drag.dl) return self.cancelEvent(e);

                                self.triggerScrollStart(e.clientX, e.clientY, 0, 0, 0);
                                self.hasmoving = true;
                            }

                            if (self.preventclick && !self.preventclick.click) {
                                self.preventclick.click = self.preventclick.tg.onclick || false;
                                self.preventclick.tg.onclick = self.onpreventclick;
                            }

                            if (self.rail.drag.dl) {
                                if (self.rail.drag.dl == "v") nx = self.rail.drag.sl;
                                else if (self.rail.drag.dl == "h") ny = self.rail.drag.st;
                            }

                            self.synched("touchmove", function () {
                                if (self.rail.drag && (self.rail.drag.pt == 2)) {
                                    if (self.prepareTransition) self.resetTransition();
                                    if (self.rail.scrollable) self.setScrollTop(ny);
                                    self.scrollmom.update(fx, fy);
                                    if (self.railh && self.railh.scrollable) {
                                        self.setScrollLeft(nx);
                                        self.showCursor(ny, nx);
                                    } else {
                                        self.showCursor(ny);
                                    }
                                    if (cap.isie10) _doc.selection.clear();
                                }
                            });

                            return self.cancelEvent(e);

                        }
                        else if (self.rail.drag.pt == 1) { // drag on cursor
                            return self.onmousemove(e);
                        }

                    };

                    self.ontouchstartCursor = function (e, hronly) {
                        if (self.rail.drag && self.rail.drag.pt != 3) return;
                        if (self.locked) return self.cancelEvent(e);
                        self.cancelScroll();
                        self.rail.drag = {
                            x: e.touches[0].clientX,
                            y: e.touches[0].clientY,
                            sx: self.scroll.x,
                            sy: self.scroll.y,
                            pt: 3,
                            hr: (!!hronly)
                        };
                        var tg = self.getTarget(e);
                        if (!self.ispage && cap.hasmousecapture) tg.setCapture();
                        if (self.isiframe && !cap.hasmousecapture) {
                            self.saved.csspointerevents = self.doc.css("pointer-events");
                            self.css(self.doc, { "pointer-events": "none" });
                        }
                        return self.cancelEvent(e);
                    };

                    self.ontouchendCursor = function (e) {
                        if (self.rail.drag) {
                            if (cap.hasmousecapture) _doc.releaseCapture();
                            if (self.isiframe && !cap.hasmousecapture) self.doc.css("pointer-events", self.saved.csspointerevents);
                            if (self.rail.drag.pt != 3) return;
                            self.rail.drag = false;
                            return self.cancelEvent(e);
                        }
                    };

                    self.ontouchmoveCursor = function (e) {
                        if (self.rail.drag) {
                            if (self.rail.drag.pt != 3) return;

                            self.cursorfreezed = true;

                            if (self.rail.drag.hr) {
                                self.scroll.x = self.rail.drag.sx + (e.touches[0].clientX - self.rail.drag.x);
                                if (self.scroll.x < 0) self.scroll.x = 0;
                                var mw = self.scrollvaluemaxw;
                                if (self.scroll.x > mw) self.scroll.x = mw;
                            } else {
                                self.scroll.y = self.rail.drag.sy + (e.touches[0].clientY - self.rail.drag.y);
                                if (self.scroll.y < 0) self.scroll.y = 0;
                                var my = self.scrollvaluemax;
                                if (self.scroll.y > my) self.scroll.y = my;
                            }

                            self.synched('touchmove', function () {
                                if (self.rail.drag && (self.rail.drag.pt == 3)) {
                                    self.showCursor();
                                    if (self.rail.drag.hr) self.doScrollLeft(Math.round(self.scroll.x * self.scrollratio.x), opt.cursordragspeed);
                                    else self.doScrollTop(Math.round(self.scroll.y * self.scrollratio.y), opt.cursordragspeed);
                                }
                            });

                            return self.cancelEvent(e);
                        }

                    };

                }

                self.onmousedown = function (e, hronly) {
                    if (self.rail.drag && self.rail.drag.pt != 1) return;
                    if (self.railslocked) return self.cancelEvent(e);
                    self.cancelScroll();
                    self.rail.drag = {
                        x: e.clientX,
                        y: e.clientY,
                        sx: self.scroll.x,
                        sy: self.scroll.y,
                        pt: 1,
                        hr: hronly || false
                    };
                    var tg = self.getTarget(e);

                    if (cap.hasmousecapture) tg.setCapture();
                    if (self.isiframe && !cap.hasmousecapture) {
                        self.saved.csspointerevents = self.doc.css("pointer-events");
                        self.css(self.doc, {
                            "pointer-events": "none"
                        });
                    }
                    self.hasmoving = false;
                    return self.cancelEvent(e);
                };

                self.onmouseup = function (e) {
                    if (self.rail.drag) {
                        if (self.rail.drag.pt != 1) return true;

                        if (cap.hasmousecapture) _doc.releaseCapture();
                        if (self.isiframe && !cap.hasmousecapture) self.doc.css("pointer-events", self.saved.csspointerevents);
                        self.rail.drag = false;
                        self.cursorfreezed = false;
                        if (self.hasmoving) self.triggerScrollEnd();
                        return self.cancelEvent(e);
                    }
                };

                self.onmousemove = function (e) {
                    if (self.rail.drag) {
                        if (self.rail.drag.pt !== 1) return;

                        if (cap.ischrome && e.which === 0) return self.onmouseup(e);

                        self.cursorfreezed = true;

                        if (!self.hasmoving) self.triggerScrollStart(e.clientX, e.clientY, 0, 0, 0);

                        self.hasmoving = true;

                        if (self.rail.drag.hr) {
                            self.scroll.x = self.rail.drag.sx + (e.clientX - self.rail.drag.x);
                            if (self.scroll.x < 0) self.scroll.x = 0;
                            var mw = self.scrollvaluemaxw;
                            if (self.scroll.x > mw) self.scroll.x = mw;
                        } else {
                            self.scroll.y = self.rail.drag.sy + (e.clientY - self.rail.drag.y);
                            if (self.scroll.y < 0) self.scroll.y = 0;
                            var my = self.scrollvaluemax;
                            if (self.scroll.y > my) self.scroll.y = my;
                        }

                        self.synched('mousemove', function () {

                            if (self.cursorfreezed) {
                                self.showCursor();

                                if (self.rail.drag.hr) {
                                    self.scrollLeft(Math.round(self.scroll.x * self.scrollratio.x));
                                } else {
                                    self.scrollTop(Math.round(self.scroll.y * self.scrollratio.y));
                                }

                            }
                        });

                        return self.cancelEvent(e);
                    }
                    else {
                        self.checkarea = 0;
                    }
                };

                if (cap.cantouch || opt.emulatetouch) {

                    self.onpreventclick = function (e) {
                        if (self.preventclick) {
                            self.preventclick.tg.onclick = self.preventclick.click;
                            self.preventclick = false;
                            return self.cancelEvent(e);
                        }
                    };

                    self.onclick = (cap.isios) ? false : function (e) {  // it needs to check IE11 ???
                        if (self.lastmouseup) {
                            self.lastmouseup = false;
                            return self.cancelEvent(e);
                        } else {
                            return true;
                        }
                    };

                    if (opt.grabcursorenabled && cap.cursorgrabvalue) {
                        self.css((self.ispage) ? self.doc : self.win, {
                            'cursor': cap.cursorgrabvalue
                        });
                        self.css(self.rail, {
                            'cursor': cap.cursorgrabvalue
                        });
                    }

                } else {

                    var checkSelectionScroll = function (e) {
                        if (!self.selectiondrag) return;

                        if (e) {
                            var ww = self.win.outerHeight();
                            var df = (e.pageY - self.selectiondrag.top);
                            if (df > 0 && df < ww) df = 0;
                            if (df >= ww) df -= ww;
                            self.selectiondrag.df = df;
                        }
                        if (self.selectiondrag.df === 0) return;

                        var rt = -(self.selectiondrag.df * 2 / 6) | 0;
                        self.doScrollBy(rt);

                        self.debounced("doselectionscroll", function () {
                            checkSelectionScroll();
                        }, 50);
                    };

                    if ("getSelection" in _doc) { // A grade - Major browsers
                        self.hasTextSelected = function () {
                            return (_doc.getSelection().rangeCount > 0);
                        };
                    } else if ("selection" in _doc) { //IE9-
                        self.hasTextSelected = function () {
                            return (_doc.selection.type != "None");
                        };
                    } else {
                        self.hasTextSelected = function () { // no support
                            return false;
                        };
                    }

                    self.onselectionstart = function (e) {
                        //  More testing - severe chrome issues           
                        /* 
                                      if (!self.haswrapper&&(e.which&&e.which==2)) {  // fool browser to manage middle button scrolling
                                        self.win.css({'overflow':'auto'});
                                        setTimeout(function(){
                                          self.win.css({'overflow':'hidden'});
                                        },10);                
                                        return true;
                                      }            
                        */
                        if (self.ispage) return;
                        self.selectiondrag = self.win.offset();
                    };

                    self.onselectionend = function (e) {
                        self.selectiondrag = false;
                    };
                    self.onselectiondrag = function (e) {
                        if (!self.selectiondrag) return;
                        if (self.hasTextSelected()) self.debounced("selectionscroll", function () {
                            checkSelectionScroll(e);
                        }, 250);
                    };
                }

                if (cap.hasw3ctouch) { //IE11+
                    self.css((self.ispage) ? $("html") : self.win, { 'touch-action': 'none' });
                    self.css(self.rail, {
                        'touch-action': 'none'
                    });
                    self.css(self.cursor, {
                        'touch-action': 'none'
                    });
                    self.bind(self.win, "pointerdown", self.ontouchstart);
                    self.bind(_doc, "pointerup", self.ontouchend);
                    self.delegate(_doc, "pointermove", self.ontouchmove);
                } else if (cap.hasmstouch) { //IE10
                    self.css((self.ispage) ? $("html") : self.win, { '-ms-touch-action': 'none' });
                    self.css(self.rail, {
                        '-ms-touch-action': 'none'
                    });
                    self.css(self.cursor, {
                        '-ms-touch-action': 'none'
                    });
                    self.bind(self.win, "MSPointerDown", self.ontouchstart);
                    self.bind(_doc, "MSPointerUp", self.ontouchend);
                    self.delegate(_doc, "MSPointerMove", self.ontouchmove);
                    self.bind(self.cursor, "MSGestureHold", function (e) {
                        e.preventDefault();
                    });
                    self.bind(self.cursor, "contextmenu", function (e) {
                        e.preventDefault();
                    });
                } else if (cap.cantouch) { // smartphones/touch devices
                    self.bind(self.win, "touchstart", self.ontouchstart, false, true);
                    self.bind(_doc, "touchend", self.ontouchend, false, true);
                    self.bind(_doc, "touchcancel", self.ontouchend, false, true);
                    self.delegate(_doc, "touchmove", self.ontouchmove, false, true);
                }

                if (opt.emulatetouch) {
                    self.bind(self.win, "mousedown", self.ontouchstart, false, true);
                    self.bind(_doc, "mouseup", self.ontouchend, false, true);
                    self.bind(_doc, "mousemove", self.ontouchmove, false, true);
                }

                if (opt.cursordragontouch || (!cap.cantouch && !opt.emulatetouch)) {

                    self.rail.css({
                        cursor: "default"
                    });
                    self.railh && self.railh.css({
                        cursor: "default"
                    });

                    self.jqbind(self.rail, "mouseenter", function () {
                        if (!self.ispage && !self.win.is(":visible")) return false;
                        if (self.canshowonmouseevent) self.showCursor();
                        self.rail.active = true;
                    });
                    self.jqbind(self.rail, "mouseleave", function () {
                        self.rail.active = false;
                        if (!self.rail.drag) self.hideCursor();
                    });

                    if (opt.sensitiverail) {
                        self.bind(self.rail, "click", function (e) {
                            self.doRailClick(e, false, false);
                        });
                        self.bind(self.rail, "dblclick", function (e) {
                            self.doRailClick(e, true, false);
                        });
                        self.bind(self.cursor, "click", function (e) {
                            self.cancelEvent(e);
                        });
                        self.bind(self.cursor, "dblclick", function (e) {
                            self.cancelEvent(e);
                        });
                    }

                    if (self.railh) {
                        self.jqbind(self.railh, "mouseenter", function () {
                            if (!self.ispage && !self.win.is(":visible")) return false;
                            if (self.canshowonmouseevent) self.showCursor();
                            self.rail.active = true;
                        });
                        self.jqbind(self.railh, "mouseleave", function () {
                            self.rail.active = false;
                            if (!self.rail.drag) self.hideCursor();
                        });

                        if (opt.sensitiverail) {
                            self.bind(self.railh, "click", function (e) {
                                self.doRailClick(e, false, true);
                            });
                            self.bind(self.railh, "dblclick", function (e) {
                                self.doRailClick(e, true, true);
                            });
                            self.bind(self.cursorh, "click", function (e) {
                                self.cancelEvent(e);
                            });
                            self.bind(self.cursorh, "dblclick", function (e) {
                                self.cancelEvent(e);
                            });
                        }

                    }

                }

                if (opt.cursordragontouch && (this.istouchcapable || cap.cantouch)) {
                    self.bind(self.cursor, "touchstart", self.ontouchstartCursor);
                    self.bind(self.cursor, "touchmove", self.ontouchmoveCursor);
                    self.bind(self.cursor, "touchend", self.ontouchendCursor);
                    self.cursorh && self.bind(self.cursorh, "touchstart", function (e) {
                        self.ontouchstartCursor(e, true);
                    });
                    self.cursorh && self.bind(self.cursorh, "touchmove", self.ontouchmoveCursor);
                    self.cursorh && self.bind(self.cursorh, "touchend", self.ontouchendCursor);
                }

                //        if (!cap.cantouch && !opt.emulatetouch) {
                if (!opt.emulatetouch && !cap.isandroid && !cap.isios) {

                    self.bind((cap.hasmousecapture) ? self.win : _doc, "mouseup", self.onmouseup);
                    self.bind(_doc, "mousemove", self.onmousemove);
                    if (self.onclick) self.bind(_doc, "click", self.onclick);

                    self.bind(self.cursor, "mousedown", self.onmousedown);
                    self.bind(self.cursor, "mouseup", self.onmouseup);

                    if (self.railh) {
                        self.bind(self.cursorh, "mousedown", function (e) {
                            self.onmousedown(e, true);
                        });
                        self.bind(self.cursorh, "mouseup", self.onmouseup);
                    }

                    if (!self.ispage && opt.enablescrollonselection) {
                        self.bind(self.win[0], "mousedown", self.onselectionstart);
                        self.bind(_doc, "mouseup", self.onselectionend);
                        self.bind(self.cursor, "mouseup", self.onselectionend);
                        if (self.cursorh) self.bind(self.cursorh, "mouseup", self.onselectionend);
                        self.bind(_doc, "mousemove", self.onselectiondrag);
                    }

                    if (self.zoom) {
                        self.jqbind(self.zoom, "mouseenter", function () {
                            if (self.canshowonmouseevent) self.showCursor();
                            self.rail.active = true;
                        });
                        self.jqbind(self.zoom, "mouseleave", function () {
                            self.rail.active = false;
                            if (!self.rail.drag) self.hideCursor();
                        });
                    }

                } else {

                    self.bind((cap.hasmousecapture) ? self.win : _doc, "mouseup", self.ontouchend);
                    if (self.onclick) self.bind(_doc, "click", self.onclick);

                    if (opt.cursordragontouch) {
                        self.bind(self.cursor, "mousedown", self.onmousedown);
                        self.bind(self.cursor, "mouseup", self.onmouseup);
                        self.cursorh && self.bind(self.cursorh, "mousedown", function (e) {
                            self.onmousedown(e, true);
                        });
                        self.cursorh && self.bind(self.cursorh, "mouseup", self.onmouseup);
                    } else {
                        self.bind(self.rail, "mousedown", function (e) { e.preventDefault(); });  // prevent text selection             
                        self.railh && self.bind(self.railh, "mousedown", function (e) { e.preventDefault(); });
                    }

                }


                if (opt.enablemousewheel) {
                    if (!self.isiframe) self.mousewheel((cap.isie && self.ispage) ? _doc : self.win, self.onmousewheel);
                    self.mousewheel(self.rail, self.onmousewheel);
                    if (self.railh) self.mousewheel(self.railh, self.onmousewheelhr);
                }

                if (!self.ispage && !cap.cantouch && !(/HTML|^BODY/.test(self.win[0].nodeName))) {
                    if (!self.win.attr("tabindex")) self.win.attr({
                        "tabindex": ++tabindexcounter
                    });

                    self.bind(self.win, "focus", function (e) {  // better using native events
                        domfocus = (self.getTarget(e)).id || self.getTarget(e) || false;
                        self.hasfocus = true;
                        if (self.canshowonmouseevent) self.noticeCursor();
                    });
                    self.bind(self.win, "blur", function (e) {  // *
                        domfocus = false;
                        self.hasfocus = false;
                    });

                    self.bind(self.win, "mouseenter", function (e) {   // *
                        mousefocus = (self.getTarget(e)).id || self.getTarget(e) || false;
                        self.hasmousefocus = true;
                        if (self.canshowonmouseevent) self.noticeCursor();
                    });
                    self.bind(self.win, "mouseleave", function (e) {   // *       
                        mousefocus = false;
                        self.hasmousefocus = false;
                        if (!self.rail.drag) self.hideCursor();
                    });

                }


                //Thanks to http://www.quirksmode.org !!
                self.onkeypress = function (e) {
                    if (self.railslocked && self.page.maxh === 0) return true;

                    e = e || _win.event;
                    var tg = self.getTarget(e);
                    if (tg && /INPUT|TEXTAREA|SELECT|OPTION/.test(tg.nodeName)) {
                        var tp = tg.getAttribute('type') || tg.type || false;
                        if ((!tp) || !(/submit|button|cancel/i.tp)) return true;
                    }

                    if ($(tg).attr('contenteditable')) return true;

                    if (self.hasfocus || (self.hasmousefocus && !domfocus) || (self.ispage && !domfocus && !mousefocus)) {
                        var key = e.keyCode;

                        if (self.railslocked && key != 27) return self.cancelEvent(e);

                        var ctrl = e.ctrlKey || false;
                        var shift = e.shiftKey || false;

                        var ret = false;
                        switch (key) {
                            case 38:
                            case 63233: //safari
                                self.doScrollBy(24 * 3);
                                ret = true;
                                break;
                            case 40:
                            case 63235: //safari
                                self.doScrollBy(-24 * 3);
                                ret = true;
                                break;
                            case 37:
                            case 63232: //safari
                                if (self.railh) {
                                    (ctrl) ? self.doScrollLeft(0) : self.doScrollLeftBy(24 * 3);
                                    ret = true;
                                }
                                break;
                            case 39:
                            case 63234: //safari
                                if (self.railh) {
                                    (ctrl) ? self.doScrollLeft(self.page.maxw) : self.doScrollLeftBy(-24 * 3);
                                    ret = true;
                                }
                                break;
                            case 33:
                            case 63276: // safari
                                self.doScrollBy(self.view.h);
                                ret = true;
                                break;
                            case 34:
                            case 63277: // safari
                                self.doScrollBy(-self.view.h);
                                ret = true;
                                break;
                            case 36:
                            case 63273: // safari                
                                (self.railh && ctrl) ? self.doScrollPos(0, 0) : self.doScrollTo(0);
                                ret = true;
                                break;
                            case 35:
                            case 63275: // safari
                                (self.railh && ctrl) ? self.doScrollPos(self.page.maxw, self.page.maxh) : self.doScrollTo(self.page.maxh);
                                ret = true;
                                break;
                            case 32:
                                if (opt.spacebarenabled) {
                                    (shift) ? self.doScrollBy(self.view.h) : self.doScrollBy(-self.view.h);
                                    ret = true;
                                }
                                break;
                            case 27: // ESC
                                if (self.zoomactive) {
                                    self.doZoom();
                                    ret = true;
                                }
                                break;
                        }
                        if (ret) return self.cancelEvent(e);
                    }
                };

                if (opt.enablekeyboard) self.bind(_doc, (cap.isopera && !cap.isopera12) ? "keypress" : "keydown", self.onkeypress);

                self.bind(_doc, "keydown", function (e) {
                    var ctrl = e.ctrlKey || false;
                    if (ctrl) self.wheelprevented = true;
                });
                self.bind(_doc, "keyup", function (e) {
                    var ctrl = e.ctrlKey || false;
                    if (!ctrl) self.wheelprevented = false;
                });
                self.bind(_win, "blur", function (e) {
                    self.wheelprevented = false;
                });

                self.bind(_win, 'resize', self.onscreenresize);
                self.bind(_win, 'orientationchange', self.onscreenresize);

                self.bind(_win, "load", self.lazyResize);

                if (cap.ischrome && !self.ispage && !self.haswrapper) { //chrome void scrollbar bug - it persists in version 26
                    var tmp = self.win.attr("style");
                    var ww = parseFloat(self.win.css("width")) + 1;
                    self.win.css('width', ww);
                    self.synched("chromefix", function () {
                        self.win.attr("style", tmp);
                    });
                }


                // Trying a cross-browser implementation - good luck!

                self.onAttributeChange = function (e) {
                    self.lazyResize(self.isieold ? 250 : 30);
                };

                if (opt.enableobserver) {

                    if ((!self.isie11) && (ClsMutationObserver !== false)) {  // IE11 crashes  #568
                        self.observerbody = new ClsMutationObserver(function (mutations) {
                            mutations.forEach(function (mut) {
                                if (mut.type == "attributes") {
                                    return ($body.hasClass("modal-open") && $body.hasClass("modal-dialog") && !$.contains($('.modal-dialog')[0], self.doc[0])) ? self.hide() : self.show();  // Support for Bootstrap modal; Added check if the nice scroll element is inside a modal
                                }
                            });
                            if (self.me.clientWidth != self.page.width || self.me.clientHeight != self.page.height) return self.lazyResize(30);
                        });
                        self.observerbody.observe(_doc.body, {
                            childList: true,
                            subtree: true,
                            characterData: false,
                            attributes: true,
                            attributeFilter: ['class']
                        });
                    }

                    if (!self.ispage && !self.haswrapper) {

                        var _dom = self.win[0];

                        // redesigned MutationObserver for Chrome18+/Firefox14+/iOS6+ with support for: remove div, add/remove content
                        if (ClsMutationObserver !== false) {
                            self.observer = new ClsMutationObserver(function (mutations) {
                                mutations.forEach(self.onAttributeChange);
                            });
                            self.observer.observe(_dom, {
                                childList: true,
                                characterData: false,
                                attributes: true,
                                subtree: false
                            });
                            self.observerremover = new ClsMutationObserver(function (mutations) {
                                mutations.forEach(function (mo) {
                                    if (mo.removedNodes.length > 0) {
                                        for (var dd in mo.removedNodes) {
                                            if (!!self && (mo.removedNodes[dd] === _dom)) return self.remove();
                                        }
                                    }
                                });
                            });
                            self.observerremover.observe(_dom.parentNode, {
                                childList: true,
                                characterData: false,
                                attributes: false,
                                subtree: false
                            });
                        } else {
                            self.bind(_dom, (cap.isie && !cap.isie9) ? "propertychange" : "DOMAttrModified", self.onAttributeChange);
                            if (cap.isie9) _dom.attachEvent("onpropertychange", self.onAttributeChange); //IE9 DOMAttrModified bug
                            self.bind(_dom, "DOMNodeRemoved", function (e) {
                                if (e.target === _dom) self.remove();
                            });
                        }
                    }

                }

                //

                if (!self.ispage && opt.boxzoom) self.bind(_win, "resize", self.resizeZoom);
                if (self.istextarea) {
                    self.bind(self.win, "keydown", self.lazyResize);
                    self.bind(self.win, "mouseup", self.lazyResize);
                }

                self.lazyResize(30);

            }

            if (this.doc[0].nodeName == 'IFRAME') {
                var oniframeload = function () {
                    self.iframexd = false;
                    var doc;
                    try {
                        doc = 'contentDocument' in this ? this.contentDocument : this.contentWindow._doc;
                        var a = doc.domain;
                    } catch (e) {
                        self.iframexd = true;
                        doc = false;
                    }

                    if (self.iframexd) {
                        if ("console" in _win) console.log('NiceScroll error: policy restriced iframe');
                        return true; //cross-domain - I can't manage this        
                    }

                    self.forcescreen = true;

                    if (self.isiframe) {
                        self.iframe = {
                            "doc": $(doc),
                            "html": self.doc.contents().find('html')[0],
                            "body": self.doc.contents().find('body')[0]
                        };
                        self.getContentSize = function () {
                            return {
                                w: Math.max(self.iframe.html.scrollWidth, self.iframe.body.scrollWidth),
                                h: Math.max(self.iframe.html.scrollHeight, self.iframe.body.scrollHeight)
                            };
                        };
                        self.docscroll = $(self.iframe.body);
                    }

                    if (!cap.isios && opt.iframeautoresize && !self.isiframe) {
                        self.win.scrollTop(0); // reset position
                        self.doc.height(""); //reset height to fix browser bug
                        var hh = Math.max(doc.getElementsByTagName('html')[0].scrollHeight, doc.body.scrollHeight);
                        self.doc.height(hh);
                    }
                    self.lazyResize(30);

                    self.css($(self.iframe.body), _scrollyhidden);

                    if (cap.isios && self.haswrapper) {
                        self.css($(doc.body), {
                            '-webkit-transform': 'translate3d(0,0,0)'
                        }); // avoid iFrame content clipping - thanks to http://blog.derraab.com/2012/04/02/avoid-iframe-content-clipping-with-css-transform-on-ios/
                    }

                    if ('contentWindow' in this) {
                        self.bind(this.contentWindow, "scroll", self.onscroll); //IE8 & minor
                    } else {
                        self.bind(doc, "scroll", self.onscroll);
                    }

                    if (opt.enablemousewheel) {
                        self.mousewheel(doc, self.onmousewheel);
                    }

                    if (opt.enablekeyboard) self.bind(doc, (cap.isopera) ? "keypress" : "keydown", self.onkeypress);

                    if (cap.cantouch) {
                        self.bind(doc, "touchstart", self.ontouchstart);
                        self.bind(doc, "touchmove", self.ontouchmove);
                    }
                    else if (opt.emulatetouch) {
                        self.bind(doc, "mousedown", self.ontouchstart);
                        self.bind(doc, "mousemove", function (e) {
                            return self.ontouchmove(e, true);
                        });
                        if (opt.grabcursorenabled && cap.cursorgrabvalue) self.css($(doc.body), {
                            'cursor': cap.cursorgrabvalue
                        });
                    }

                    self.bind(doc, "mouseup", self.ontouchend);

                    if (self.zoom) {
                        if (opt.dblclickzoom) self.bind(doc, 'dblclick', self.doZoom);
                        if (self.ongesturezoom) self.bind(doc, "gestureend", self.ongesturezoom);
                    }
                };

                if (this.doc[0].readyState && this.doc[0].readyState === "complete") {
                    setTimeout(function () {
                        oniframeload.call(self.doc[0], false);
                    }, 500);
                }
                self.bind(this.doc, "load", oniframeload);

            }

        };

        this.showCursor = function (py, px) {
            if (self.cursortimeout) {
                clearTimeout(self.cursortimeout);
                self.cursortimeout = 0;
            }
            if (!self.rail) return;
            if (self.autohidedom) {
                self.autohidedom.stop().css({
                    opacity: opt.cursoropacitymax
                });
                self.cursoractive = true;
            }

            if (!self.rail.drag || self.rail.drag.pt != 1) {
                if (py !== undefined && py !== false) {
                    self.scroll.y = (py / self.scrollratio.y) | 0;
                }
                if (px !== undefined) {
                    self.scroll.x = (px / self.scrollratio.x) | 0;
                }
            }

            self.cursor.css({
                height: self.cursorheight,
                top: self.scroll.y
            });
            if (self.cursorh) {
                var lx = (self.hasreversehr) ? self.scrollvaluemaxw - self.scroll.x : self.scroll.x;
                self.cursorh.css({
                    width: self.cursorwidth,
                    left: (!self.rail.align && self.rail.visibility) ? lx + self.rail.width : lx
                });
                self.cursoractive = true;
            }

            if (self.zoom) self.zoom.stop().css({
                opacity: opt.cursoropacitymax
            });
        };

        this.hideCursor = function (tm) {
            if (self.cursortimeout) return;
            if (!self.rail) return;
            if (!self.autohidedom) return;

            if (self.hasmousefocus && opt.autohidemode === "leave") return;
            self.cursortimeout = setTimeout(function () {
                if (!self.rail.active || !self.showonmouseevent) {
                    self.autohidedom.stop().animate({
                        opacity: opt.cursoropacitymin
                    });
                    if (self.zoom) self.zoom.stop().animate({
                        opacity: opt.cursoropacitymin
                    });
                    self.cursoractive = false;
                }
                self.cursortimeout = 0;
            }, tm || opt.hidecursordelay);
        };

        this.noticeCursor = function (tm, py, px) {
            self.showCursor(py, px);
            if (!self.rail.active) self.hideCursor(tm);
        };

        this.getContentSize =
            (self.ispage) ?
                function () {
                    return {
                        w: Math.max(_doc.body.scrollWidth, _doc.documentElement.scrollWidth),
                        h: Math.max(_doc.body.scrollHeight, _doc.documentElement.scrollHeight)
                    };
                } : (self.haswrapper) ?
                    function () {
                        return {
                            w: self.doc[0].offsetWidth,
                            h: self.doc[0].offsetHeight
                        };
                    } : function () {
                        return {
                            w: self.docscroll[0].scrollWidth,
                            h: self.docscroll[0].scrollHeight
                        };
                    };

        this.onResize = function (e, page) {

            if (!self || !self.win) return false;

            var premaxh = self.page.maxh,
                premaxw = self.page.maxw,
                previewh = self.view.h,
                previeww = self.view.w;

            self.view = {
                w: (self.ispage) ? self.win.width() : self.win[0].clientWidth,
                h: (self.ispage) ? self.win.height() : self.win[0].clientHeight
            };

            self.page = (page) ? page : self.getContentSize();

            self.page.maxh = Math.max(0, self.page.h - self.view.h);
            self.page.maxw = Math.max(0, self.page.w - self.view.w);

            if ((self.page.maxh == premaxh) && (self.page.maxw == premaxw) && (self.view.w == previeww) && (self.view.h == previewh)) {
                // test position        
                if (!self.ispage) {
                    var pos = self.win.offset();
                    if (self.lastposition) {
                        var lst = self.lastposition;
                        if ((lst.top == pos.top) && (lst.left == pos.left)) return self; //nothing to do            
                    }
                    self.lastposition = pos;
                } else {
                    return self; //nothing to do
                }
            }

            if (self.page.maxh === 0) {
                self.hideRail();
                self.scrollvaluemax = 0;
                self.scroll.y = 0;
                self.scrollratio.y = 0;
                self.cursorheight = 0;
                self.setScrollTop(0);
                if (self.rail) self.rail.scrollable = false;
            } else {
                self.page.maxh -= (opt.railpadding.top + opt.railpadding.bottom);
                self.rail.scrollable = true;
            }

            if (self.page.maxw === 0) {
                self.hideRailHr();
                self.scrollvaluemaxw = 0;
                self.scroll.x = 0;
                self.scrollratio.x = 0;
                self.cursorwidth = 0;
                self.setScrollLeft(0);
                if (self.railh) {
                    self.railh.scrollable = false;
                }
            } else {
                self.page.maxw -= (opt.railpadding.left + opt.railpadding.right);
                if (self.railh) self.railh.scrollable = (opt.horizrailenabled);
            }

            self.railslocked = (self.locked) || ((self.page.maxh === 0) && (self.page.maxw === 0));
            if (self.railslocked) {
                if (!self.ispage) self.updateScrollBar(self.view);
                return false;
            }

            if (!self.hidden) {
                if (!self.rail.visibility) self.showRail();
                if (self.railh && !self.railh.visibility) self.showRailHr();
            }

            if (self.istextarea && self.win.css('resize') && self.win.css('resize') != 'none') self.view.h -= 20;

            self.cursorheight = Math.min(self.view.h, Math.round(self.view.h * (self.view.h / self.page.h)));
            self.cursorheight = (opt.cursorfixedheight) ? opt.cursorfixedheight : Math.max(opt.cursorminheight, self.cursorheight);

            self.cursorwidth = Math.min(self.view.w, Math.round(self.view.w * (self.view.w / self.page.w)));
            self.cursorwidth = (opt.cursorfixedheight) ? opt.cursorfixedheight : Math.max(opt.cursorminheight, self.cursorwidth);

            self.scrollvaluemax = self.view.h - self.cursorheight - (opt.railpadding.top + opt.railpadding.bottom);
            if (!self.hasborderbox) self.scrollvaluemax -= self.cursor[0].offsetHeight - self.cursor[0].clientHeight;

            if (self.railh) {
                self.railh.width = (self.page.maxh > 0) ? (self.view.w - self.rail.width) : self.view.w;
                self.scrollvaluemaxw = self.railh.width - self.cursorwidth - (opt.railpadding.left + opt.railpadding.right);
            }

            if (!self.ispage) self.updateScrollBar(self.view);

            self.scrollratio = {
                x: (self.page.maxw / self.scrollvaluemaxw),
                y: (self.page.maxh / self.scrollvaluemax)
            };

            var sy = self.getScrollTop();
            if (sy > self.page.maxh) {
                self.doScrollTop(self.page.maxh);
            } else {
                self.scroll.y = (self.getScrollTop() / self.scrollratio.y) | 0;
                self.scroll.x = (self.getScrollLeft() / self.scrollratio.x) | 0;
                if (self.cursoractive) self.noticeCursor();
            }

            if (self.scroll.y && (self.getScrollTop() === 0)) self.doScrollTo((self.scroll.y * self.scrollratio.y) | 0);

            return self;
        };

        this.resize = self.onResize;

        var hlazyresize = 0;

        this.onscreenresize = function (e) {
            clearTimeout(hlazyresize);

            var hiderails = (!self.ispage && !self.haswrapper);
            if (hiderails) self.hideRails();

            hlazyresize = setTimeout(function () {
                if (self) {
                    if (hiderails) self.showRails();
                    self.resize();
                }
                hlazyresize = 0;
            }, 120);
        };

        this.lazyResize = function (tm) { // event debounce

            clearTimeout(hlazyresize);

            tm = isNaN(tm) ? 240 : tm;

            hlazyresize = setTimeout(function () {
                self && self.resize();
                hlazyresize = 0;
            }, tm);

            return self;

        };

        // derived by MDN https://developer.mozilla.org/en-US/docs/DOM/Mozilla_event_reference/wheel
        function _modernWheelEvent(dom, name, fn, bubble) {
            self._bind(dom, name, function (e) {
                e = e || _win.event;
                var event = {
                    original: e,
                    target: e.target || e.srcElement,
                    type: "wheel",
                    deltaMode: e.type == "MozMousePixelScroll" ? 0 : 1,
                    deltaX: 0,
                    deltaZ: 0,
                    preventDefault: function () {
                        e.preventDefault ? e.preventDefault() : e.returnValue = false;
                        return false;
                    },
                    stopImmediatePropagation: function () {
                        (e.stopImmediatePropagation) ? e.stopImmediatePropagation() : e.cancelBubble = true;
                    }
                };

                if (name == "mousewheel") {
                    e.wheelDeltaX && (event.deltaX = -1 / 40 * e.wheelDeltaX);
                    e.wheelDeltaY && (event.deltaY = -1 / 40 * e.wheelDeltaY);
                    !event.deltaY && !event.deltaX && (event.deltaY = -1 / 40 * e.wheelDelta);
                } else {
                    event.deltaY = e.detail;
                }

                return fn.call(dom, event);
            }, bubble);
        }



        this.jqbind = function (dom, name, fn) { // use jquery bind for non-native events (mouseenter/mouseleave)
            self.events.push({
                e: dom,
                n: name,
                f: fn,
                q: true
            });
            $(dom).on(name, fn);
        };

        this.mousewheel = function (dom, fn, bubble) { // bind mousewheel
            var el = ("jquery" in dom) ? dom[0] : dom;
            if ("onwheel" in _doc.createElement("div")) { // Modern browsers support "wheel"
                self._bind(el, "wheel", fn, bubble || false);
            } else {
                var wname = (_doc.onmousewheel !== undefined) ? "mousewheel" : "DOMMouseScroll"; // older Webkit+IE support or older Firefox          
                _modernWheelEvent(el, wname, fn, bubble || false);
                if (wname == "DOMMouseScroll") _modernWheelEvent(el, "MozMousePixelScroll", fn, bubble || false); // Firefox legacy
            }
        };

        var passiveSupported = false;

        if (cap.haseventlistener) {  // W3C standard event model

            // thanks to https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
            try { var options = Object.defineProperty({}, "passive", { get: function () { passiveSupported = !0; } }); _win.addEventListener("test", null, options); } catch (err) { }

            this.stopPropagation = function (e) {
                if (!e) return false;
                e = (e.original) ? e.original : e;
                e.stopPropagation();
                return false;
            };

            this.cancelEvent = function (e) {
                if (e.cancelable) e.preventDefault();
                e.stopImmediatePropagation();
                if (e.preventManipulation) e.preventManipulation();  // IE10+
                return false;
            };

        } else {

            // inspired from https://gist.github.com/jonathantneal/2415137      

            Event.prototype.preventDefault = function () {
                this.returnValue = false;
            };

            Event.prototype.stopPropagation = function () {
                this.cancelBubble = true;
            };

            _win.constructor.prototype.addEventListener = _doc.constructor.prototype.addEventListener = Element.prototype.addEventListener = function (type, listener, useCapture) {
                this.attachEvent("on" + type, listener);
            };
            _win.constructor.prototype.removeEventListener = _doc.constructor.prototype.removeEventListener = Element.prototype.removeEventListener = function (type, listener, useCapture) {
                this.detachEvent("on" + type, listener);
            };

            // Thanks to http://www.switchonthecode.com !!
            this.cancelEvent = function (e) {
                e = e || _win.event;
                if (e) {
                    e.cancelBubble = true;
                    e.cancel = true;
                    e.returnValue = false;
                }
                return false;
            };

            this.stopPropagation = function (e) {
                e = e || _win.event;
                if (e) e.cancelBubble = true;
                return false;
            };

        }

        this.delegate = function (dom, name, fn, bubble, active) {

            var de = delegatevents[name] || false;

            if (!de) {

                de = {
                    a: [],
                    l: [],
                    f: function (e) {
                        var lst = de.l, l = lst.length - 1;
                        var r = false;
                        for (var a = l; a >= 0; a--) {
                            r = lst[a].call(e.target, e);
                            if (r === false) return false;
                        }
                        return r;
                    }
                };

                self.bind(dom, name, de.f, bubble, active);

                delegatevents[name] = de;

            }

            if (self.ispage) {
                de.a = [self.id].concat(de.a);
                de.l = [fn].concat(de.l);
            } else {
                de.a.push(self.id);
                de.l.push(fn);
            }

        };

        this.undelegate = function (dom, name, fn, bubble, active) {
            var de = delegatevents[name] || false;
            if (de && de.l) {  // quick fix #683
                for (var a = 0, l = de.l.length; a < l; a++) {
                    if (de.a[a] === self.id) {
                        de.a.splice(a);
                        de.l.splice(a);
                        if (de.a.length === 0) {
                            self._unbind(dom, name, de.l.f);
                            delegatevents[name] = null;
                        }
                    }
                }
            }
        };

        this.bind = function (dom, name, fn, bubble, active) {
            var el = ("jquery" in dom) ? dom[0] : dom;
            self._bind(el, name, fn, bubble || false, active || false);
        };

        this._bind = function (el, name, fn, bubble, active) { // primitive bind

            self.events.push({
                e: el,
                n: name,
                f: fn,
                b: bubble,
                q: false
            });

            (passiveSupported && active) ? el.addEventListener(name, fn, { passive: false, capture: bubble }) : el.addEventListener(name, fn, bubble || false);
        };

        this._unbind = function (el, name, fn, bub) { // primitive unbind
            if (delegatevents[name]) self.undelegate(el, name, fn, bub);
            else el.removeEventListener(name, fn, bub);
        };

        this.unbindAll = function () {
            for (var a = 0; a < self.events.length; a++) {
                var r = self.events[a];
                (r.q) ? r.e.unbind(r.n, r.f) : self._unbind(r.e, r.n, r.f, r.b);
            }
        };

        this.showRails = function () {
            return self.showRail().showRailHr();
        };

        this.showRail = function () {
            if ((self.page.maxh !== 0) && (self.ispage || self.win.css('display') != 'none')) {
                //self.visibility = true;
                self.rail.visibility = true;
                self.rail.css('display', 'block');
            }
            return self;
        };

        this.showRailHr = function () {
            if (self.railh) {
                if ((self.page.maxw !== 0) && (self.ispage || self.win.css('display') != 'none')) {
                    self.railh.visibility = true;
                    self.railh.css('display', 'block');
                }
            }
            return self;
        };

        this.hideRails = function () {
            return self.hideRail().hideRailHr();
        };

        this.hideRail = function () {
            //self.visibility = false;
            self.rail.visibility = false;
            self.rail.css('display', 'none');
            return self;
        };

        this.hideRailHr = function () {
            if (self.railh) {
                self.railh.visibility = false;
                self.railh.css('display', 'none');
            }
            return self;
        };

        this.show = function () {
            self.hidden = false;
            self.railslocked = false;
            return self.showRails();
        };

        this.hide = function () {
            self.hidden = true;
            self.railslocked = true;
            return self.hideRails();
        };

        this.toggle = function () {
            return (self.hidden) ? self.show() : self.hide();
        };

        this.remove = function () {
            self.stop();
            if (self.cursortimeout) clearTimeout(self.cursortimeout);
            for (var n in self.delaylist) if (self.delaylist[n]) clearAnimationFrame(self.delaylist[n].h);
            self.doZoomOut();
            self.unbindAll();

            if (cap.isie9) self.win[0].detachEvent("onpropertychange", self.onAttributeChange); //IE9 DOMAttrModified bug

            if (self.observer !== false) self.observer.disconnect();
            if (self.observerremover !== false) self.observerremover.disconnect();
            if (self.observerbody !== false) self.observerbody.disconnect();

            self.events = null;

            if (self.cursor) {
                self.cursor.remove();
            }
            if (self.cursorh) {
                self.cursorh.remove();
            }
            if (self.rail) {
                self.rail.remove();
            }
            if (self.railh) {
                self.railh.remove();
            }
            if (self.zoom) {
                self.zoom.remove();
            }
            for (var a = 0; a < self.saved.css.length; a++) {
                var d = self.saved.css[a];
                d[0].css(d[1], (d[2] === undefined) ? '' : d[2]);
            }
            self.saved = false;
            self.me.data('__nicescroll', ''); //erase all traces

            // memory leak fixed by GianlucaGuarini - thanks a lot!
            // remove the current nicescroll from the $.nicescroll array & normalize array
            var lst = $.nicescroll;
            lst.each(function (i) {
                if (!this) return;
                if (this.id === self.id) {
                    delete lst[i];
                    for (var b = ++i; b < lst.length; b++ , i++) lst[i] = lst[b];
                    lst.length--;
                    if (lst.length) delete lst[lst.length];
                }
            });

            for (var i in self) {
                self[i] = null;
                delete self[i];
            }

            self = null;

        };

        this.scrollstart = function (fn) {
            this.onscrollstart = fn;
            return self;
        };
        this.scrollend = function (fn) {
            this.onscrollend = fn;
            return self;
        };
        this.scrollcancel = function (fn) {
            this.onscrollcancel = fn;
            return self;
        };

        this.zoomin = function (fn) {
            this.onzoomin = fn;
            return self;
        };
        this.zoomout = function (fn) {
            this.onzoomout = fn;
            return self;
        };

        this.isScrollable = function (e) {
            var dom = (e.target) ? e.target : e;
            if (dom.nodeName == 'OPTION') return true;
            while (dom && (dom.nodeType == 1) && (dom !== this.me[0]) && !(/^BODY|HTML/.test(dom.nodeName))) {
                var dd = $(dom);
                var ov = dd.css('overflowY') || dd.css('overflowX') || dd.css('overflow') || '';
                if (/scroll|auto/.test(ov)) return (dom.clientHeight != dom.scrollHeight);
                dom = (dom.parentNode) ? dom.parentNode : false;
            }
            return false;
        };

        this.getViewport = function (me) {
            var dom = (me && me.parentNode) ? me.parentNode : false;
            while (dom && (dom.nodeType == 1) && !(/^BODY|HTML/.test(dom.nodeName))) {
                var dd = $(dom);
                if (/fixed|absolute/.test(dd.css("position"))) return dd;
                var ov = dd.css('overflowY') || dd.css('overflowX') || dd.css('overflow') || '';
                if ((/scroll|auto/.test(ov)) && (dom.clientHeight != dom.scrollHeight)) return dd;
                if (dd.getNiceScroll().length > 0) return dd;
                dom = (dom.parentNode) ? dom.parentNode : false;
            }
            return false;
        };

        this.triggerScrollStart = function (cx, cy, rx, ry, ms) {

            if (self.onscrollstart) {
                var info = {
                    type: "scrollstart",
                    current: {
                        x: cx,
                        y: cy
                    },
                    request: {
                        x: rx,
                        y: ry
                    },
                    end: {
                        x: self.newscrollx,
                        y: self.newscrolly
                    },
                    speed: ms
                };
                self.onscrollstart.call(self, info);
            }

        };

        this.triggerScrollEnd = function () {
            if (self.onscrollend) {

                var px = self.getScrollLeft();
                var py = self.getScrollTop();

                var info = {
                    type: "scrollend",
                    current: {
                        x: px,
                        y: py
                    },
                    end: {
                        x: px,
                        y: py
                    }
                };

                self.onscrollend.call(self, info);

            }

        };

        var scrolldiry = 0, scrolldirx = 0, scrolltmr = 0, scrollspd = 1;

        function doScrollRelative(px, py, chkscroll, iswheel) {

            if (!self.scrollrunning) {
                self.newscrolly = self.getScrollTop();
                self.newscrollx = self.getScrollLeft();
                scrolltmr = now();
            }

            var gap = (now() - scrolltmr);
            scrolltmr = now();

            if (gap > 350) {
                scrollspd = 1;
            } else {
                scrollspd += (2 - scrollspd) / 10;
            }

            px = px * scrollspd | 0;
            py = py * scrollspd | 0;

            if (px) {

                if (iswheel) { // mouse-only
                    if (px < 0) {  // fix apple magic mouse swipe back/forward
                        if (self.getScrollLeft() >= self.page.maxw) return true;
                    } else {
                        if (self.getScrollLeft() <= 0) return true;
                    }
                }

                var dx = px > 0 ? 1 : -1;

                if (scrolldirx !== dx) {
                    if (self.scrollmom) self.scrollmom.stop();
                    self.newscrollx = self.getScrollLeft();
                    scrolldirx = dx;
                }

                self.lastdeltax -= px;

            }

            if (py) {

                var chk = (function () {
                    var top = self.getScrollTop();
                    if (py < 0) {
                        if (top >= self.page.maxh) return true;
                    } else {
                        if (top <= 0) return true;
                    }
                })();

                if (chk) {
                    if (opt.nativeparentscrolling && chkscroll && !self.ispage && !self.zoomactive) return true;
                    var ny = self.view.h >> 1;
                    if (self.newscrolly < -ny) { self.newscrolly = -ny; py = -1; }
                    else if (self.newscrolly > self.page.maxh + ny) { self.newscrolly = self.page.maxh + ny; py = 1; }
                    else py = 0;
                }

                var dy = py > 0 ? 1 : -1;

                if (scrolldiry !== dy) {
                    if (self.scrollmom) self.scrollmom.stop();
                    self.newscrolly = self.getScrollTop();
                    scrolldiry = dy;
                }

                self.lastdeltay -= py;

            }

            if (py || px) {
                self.synched("relativexy", function () {

                    var dty = self.lastdeltay + self.newscrolly;
                    self.lastdeltay = 0;

                    var dtx = self.lastdeltax + self.newscrollx;
                    self.lastdeltax = 0;

                    if (!self.rail.drag) self.doScrollPos(dtx, dty);

                });
            }

        }

        var hasparentscrollingphase = false;

        function execScrollWheel(e, hr, chkscroll) {
            var px, py;

            if (!chkscroll && hasparentscrollingphase) return true;

            if (e.deltaMode === 0) { // PIXEL
                px = -(e.deltaX * (opt.mousescrollstep / (18 * 3))) | 0;
                py = -(e.deltaY * (opt.mousescrollstep / (18 * 3))) | 0;
            } else if (e.deltaMode === 1) { // LINE
                px = -(e.deltaX * opt.mousescrollstep * 50 / 80) | 0;
                py = -(e.deltaY * opt.mousescrollstep * 50 / 80) | 0;
            }

            if (hr && opt.oneaxismousemode && (px === 0) && py) { // classic vertical-only mousewheel + browser with x/y support 
                px = py;
                py = 0;

                if (chkscroll) {
                    var hrend = (px < 0) ? (self.getScrollLeft() >= self.page.maxw) : (self.getScrollLeft() <= 0);
                    if (hrend) {  // preserve vertical scrolling
                        py = px;
                        px = 0;
                    }
                }

            }

            // invert horizontal direction for rtl mode
            if (self.isrtlmode) px = -px;

            var chk = doScrollRelative(px, py, chkscroll, true);

            if (chk) {
                if (chkscroll) hasparentscrollingphase = true;
            } else {
                hasparentscrollingphase = false;
                e.stopImmediatePropagation();
                return e.preventDefault();
            }

        }

        this.onmousewheel = function (e) {
            if (self.wheelprevented || self.locked) return false;
            if (self.railslocked) {
                self.debounced("checkunlock", self.resize, 250);
                return false;
            }
            if (self.rail.drag) return self.cancelEvent(e);

            if (opt.oneaxismousemode === "auto" && e.deltaX !== 0) opt.oneaxismousemode = false; // check two-axis mouse support (not very elegant)

            if (opt.oneaxismousemode && e.deltaX === 0) {
                if (!self.rail.scrollable) {
                    if (self.railh && self.railh.scrollable) {
                        return self.onmousewheelhr(e);
                    } else {
                        return true;
                    }
                }
            }

            var nw = now();
            var chk = false;
            if (opt.preservenativescrolling && ((self.checkarea + 600) < nw)) {
                self.nativescrollingarea = self.isScrollable(e);
                chk = true;
            }
            self.checkarea = nw;
            if (self.nativescrollingarea) return true; // this isn't my business
            var ret = execScrollWheel(e, false, chk);
            if (ret) self.checkarea = 0;
            return ret;
        };

        this.onmousewheelhr = function (e) {
            if (self.wheelprevented) return;
            if (self.railslocked || !self.railh.scrollable) return true;
            if (self.rail.drag) return self.cancelEvent(e);

            var nw = now();
            var chk = false;
            if (opt.preservenativescrolling && ((self.checkarea + 600) < nw)) {
                self.nativescrollingarea = self.isScrollable(e);
                chk = true;
            }
            self.checkarea = nw;
            if (self.nativescrollingarea) return true; // this is not my business
            if (self.railslocked) return self.cancelEvent(e);

            return execScrollWheel(e, true, chk);
        };

        this.stop = function () {
            self.cancelScroll();
            if (self.scrollmon) self.scrollmon.stop();
            self.cursorfreezed = false;
            self.scroll.y = Math.round(self.getScrollTop() * (1 / self.scrollratio.y));
            self.noticeCursor();
            return self;
        };

        this.getTransitionSpeed = function (dif) {

            return 80 + (dif / 72) * opt.scrollspeed | 0;

        };

        if (!opt.smoothscroll) {
            this.doScrollLeft = function (x, spd) { //direct
                var y = self.getScrollTop();
                self.doScrollPos(x, y, spd);
            };
            this.doScrollTop = function (y, spd) { //direct
                var x = self.getScrollLeft();
                self.doScrollPos(x, y, spd);
            };
            this.doScrollPos = function (x, y, spd) { //direct
                var nx = (x > self.page.maxw) ? self.page.maxw : x;
                if (nx < 0) nx = 0;
                var ny = (y > self.page.maxh) ? self.page.maxh : y;
                if (ny < 0) ny = 0;
                self.synched('scroll', function () {
                    self.setScrollTop(ny);
                    self.setScrollLeft(nx);
                });
            };
            this.cancelScroll = function () { }; // direct

        } else if (self.ishwscroll && cap.hastransition && opt.usetransition && !!opt.smoothscroll) {

            var lasttransitionstyle = '';

            this.resetTransition = function () {
                lasttransitionstyle = '';
                self.doc.css(cap.prefixstyle + 'transition-duration', '0ms');
            };

            this.prepareTransition = function (dif, istime) {
                var ex = (istime) ? dif : self.getTransitionSpeed(dif);
                var trans = ex + 'ms';
                if (lasttransitionstyle !== trans) {
                    lasttransitionstyle = trans;
                    self.doc.css(cap.prefixstyle + 'transition-duration', trans);
                }
                return ex;
            };

            this.doScrollLeft = function (x, spd) { //trans
                var y = (self.scrollrunning) ? self.newscrolly : self.getScrollTop();
                self.doScrollPos(x, y, spd);
            };

            this.doScrollTop = function (y, spd) { //trans
                var x = (self.scrollrunning) ? self.newscrollx : self.getScrollLeft();
                self.doScrollPos(x, y, spd);
            };

            this.cursorupdate = {
                running: false,
                start: function () {
                    var m = this;

                    if (m.running) return;
                    m.running = true;

                    var loop = function () {
                        if (m.running) setAnimationFrame(loop);
                        self.showCursor(self.getScrollTop(), self.getScrollLeft());
                        self.notifyScrollEvent(self.win[0]);
                    };

                    setAnimationFrame(loop);
                },
                stop: function () {
                    this.running = false;
                }
            };

            this.doScrollPos = function (x, y, spd) { //trans

                var py = self.getScrollTop();
                var px = self.getScrollLeft();

                if (((self.newscrolly - py) * (y - py) < 0) || ((self.newscrollx - px) * (x - px) < 0)) self.cancelScroll(); //inverted movement detection      

                if (!opt.bouncescroll) {
                    if (y < 0) y = 0;
                    else if (y > self.page.maxh) y = self.page.maxh;
                    if (x < 0) x = 0;
                    else if (x > self.page.maxw) x = self.page.maxw;
                } else {
                    if (y < 0) y = y / 2 | 0;
                    else if (y > self.page.maxh) y = self.page.maxh + (y - self.page.maxh) / 2 | 0;
                    if (x < 0) x = x / 2 | 0;
                    else if (x > self.page.maxw) x = self.page.maxw + (x - self.page.maxw) / 2 | 0;
                }

                if (self.scrollrunning && x == self.newscrollx && y == self.newscrolly) return false;

                self.newscrolly = y;
                self.newscrollx = x;

                var top = self.getScrollTop();
                var lft = self.getScrollLeft();

                var dst = {};
                dst.x = x - lft;
                dst.y = y - top;

                var dd = Math.sqrt((dst.x * dst.x) + (dst.y * dst.y)) | 0;

                var ms = self.prepareTransition(dd);

                if (!self.scrollrunning) {
                    self.scrollrunning = true;
                    self.triggerScrollStart(lft, top, x, y, ms);
                    self.cursorupdate.start();
                }

                self.scrollendtrapped = true;

                if (!cap.transitionend) {
                    if (self.scrollendtrapped) clearTimeout(self.scrollendtrapped);
                    self.scrollendtrapped = setTimeout(self.onScrollTransitionEnd, ms); // simulate transitionend event
                }

                self.setScrollTop(self.newscrolly);
                self.setScrollLeft(self.newscrollx);

            };

            this.cancelScroll = function () {
                if (!self.scrollendtrapped) return true;
                var py = self.getScrollTop();
                var px = self.getScrollLeft();
                self.scrollrunning = false;
                if (!cap.transitionend) clearTimeout(cap.transitionend);
                self.scrollendtrapped = false;
                self.resetTransition();
                self.setScrollTop(py); // fire event onscroll
                if (self.railh) self.setScrollLeft(px);
                if (self.timerscroll && self.timerscroll.tm) clearInterval(self.timerscroll.tm);
                self.timerscroll = false;

                self.cursorfreezed = false;

                self.cursorupdate.stop();
                self.showCursor(py, px);
                return self;
            };

            this.onScrollTransitionEnd = function () {

                if (!self.scrollendtrapped) return;

                var py = self.getScrollTop();
                var px = self.getScrollLeft();

                if (py < 0) py = 0;
                else if (py > self.page.maxh) py = self.page.maxh;
                if (px < 0) px = 0;
                else if (px > self.page.maxw) px = self.page.maxw;
                if ((py != self.newscrolly) || (px != self.newscrollx)) return self.doScrollPos(px, py, opt.snapbackspeed);

                if (self.scrollrunning) self.triggerScrollEnd();
                self.scrollrunning = false;

                self.scrollendtrapped = false;
                self.resetTransition();
                self.timerscroll = false;
                self.setScrollTop(py); // fire event onscroll        
                if (self.railh) self.setScrollLeft(px); // fire event onscroll left

                self.cursorupdate.stop();
                self.noticeCursor(false, py, px);

                self.cursorfreezed = false;

            };

        } else {

            this.doScrollLeft = function (x, spd) { //no-trans
                var y = (self.scrollrunning) ? self.newscrolly : self.getScrollTop();
                self.doScrollPos(x, y, spd);
            };

            this.doScrollTop = function (y, spd) { //no-trans
                var x = (self.scrollrunning) ? self.newscrollx : self.getScrollLeft();
                self.doScrollPos(x, y, spd);
            };

            this.doScrollPos = function (x, y, spd) { //no-trans

                var py = self.getScrollTop();
                var px = self.getScrollLeft();

                if (((self.newscrolly - py) * (y - py) < 0) || ((self.newscrollx - px) * (x - px) < 0)) self.cancelScroll(); //inverted movement detection

                var clipped = false;

                if (!self.bouncescroll || !self.rail.visibility) {
                    if (y < 0) {
                        y = 0;
                        clipped = true;
                    } else if (y > self.page.maxh) {
                        y = self.page.maxh;
                        clipped = true;
                    }
                }
                if (!self.bouncescroll || !self.railh.visibility) {
                    if (x < 0) {
                        x = 0;
                        clipped = true;
                    } else if (x > self.page.maxw) {
                        x = self.page.maxw;
                        clipped = true;
                    }
                }

                if (self.scrollrunning && (self.newscrolly === y) && (self.newscrollx === x)) return true;

                self.newscrolly = y;
                self.newscrollx = x;

                self.dst = {};
                self.dst.x = x - px;
                self.dst.y = y - py;
                self.dst.px = px;
                self.dst.py = py;

                var dd = Math.sqrt((self.dst.x * self.dst.x) + (self.dst.y * self.dst.y)) | 0;
                var ms = self.getTransitionSpeed(dd);

                self.bzscroll = {};

                var p3 = (clipped) ? 1 : 0.58;
                self.bzscroll.x = new BezierClass(px, self.newscrollx, ms, 0, 0, p3, 1);
                self.bzscroll.y = new BezierClass(py, self.newscrolly, ms, 0, 0, p3, 1);

                var loopid = now();

                var loop = function () {

                    if (!self.scrollrunning) return;
                    var x = self.bzscroll.y.getPos();

                    self.setScrollLeft(self.bzscroll.x.getNow());
                    self.setScrollTop(self.bzscroll.y.getNow());

                    if (x <= 1) {
                        self.timer = setAnimationFrame(loop);
                    } else {
                        self.scrollrunning = false;
                        self.timer = 0;
                        self.triggerScrollEnd();
                    }

                };

                if (!self.scrollrunning) {
                    self.triggerScrollStart(px, py, x, y, ms);
                    self.scrollrunning = true;
                    self.timer = setAnimationFrame(loop);
                }

            };

            this.cancelScroll = function () {
                if (self.timer) clearAnimationFrame(self.timer);
                self.timer = 0;
                self.bzscroll = false;
                self.scrollrunning = false;
                return self;
            };

        }

        this.doScrollBy = function (stp, relative) {
            doScrollRelative(0, stp);
        };

        this.doScrollLeftBy = function (stp, relative) {
            doScrollRelative(stp, 0);
        };

        this.doScrollTo = function (pos, relative) {
            var ny = (relative) ? Math.round(pos * self.scrollratio.y) : pos;
            if (ny < 0) ny = 0;
            else if (ny > self.page.maxh) ny = self.page.maxh;
            self.cursorfreezed = false;
            self.doScrollTop(pos);
        };

        this.checkContentSize = function () {
            var pg = self.getContentSize();
            if ((pg.h != self.page.h) || (pg.w != self.page.w)) self.resize(false, pg);
        };

        self.onscroll = function (e) {
            if (self.rail.drag) return;
            if (!self.cursorfreezed) {
                self.synched('scroll', function () {
                    self.scroll.y = Math.round(self.getScrollTop() / self.scrollratio.y);
                    if (self.railh) self.scroll.x = Math.round(self.getScrollLeft() / self.scrollratio.x);
                    self.noticeCursor();
                });
            }
        };
        self.bind(self.docscroll, "scroll", self.onscroll);

        this.doZoomIn = function (e) {
            if (self.zoomactive) return;
            self.zoomactive = true;

            self.zoomrestore = {
                style: {}
            };
            var lst = ['position', 'top', 'left', 'zIndex', 'backgroundColor', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight'];
            var win = self.win[0].style;
            for (var a in lst) {
                var pp = lst[a];
                self.zoomrestore.style[pp] = (win[pp] !== undefined) ? win[pp] : '';
            }

            self.zoomrestore.style.width = self.win.css('width');
            self.zoomrestore.style.height = self.win.css('height');

            self.zoomrestore.padding = {
                w: self.win.outerWidth() - self.win.width(),
                h: self.win.outerHeight() - self.win.height()
            };

            if (cap.isios4) {
                self.zoomrestore.scrollTop = $window.scrollTop();
                $window.scrollTop(0);
            }

            self.win.css({
                position: (cap.isios4) ? "absolute" : "fixed",
                top: 0,
                left: 0,
                zIndex: globalmaxzindex + 100,
                margin: 0
            });
            var bkg = self.win.css("backgroundColor");
            if ("" === bkg || /transparent|rgba\(0, 0, 0, 0\)|rgba\(0,0,0,0\)/.test(bkg)) self.win.css("backgroundColor", "#fff");
            self.rail.css({
                zIndex: globalmaxzindex + 101
            });
            self.zoom.css({
                zIndex: globalmaxzindex + 102
            });
            self.zoom.css('backgroundPosition', '0 -18px');
            self.resizeZoom();

            if (self.onzoomin) self.onzoomin.call(self);

            return self.cancelEvent(e);
        };

        this.doZoomOut = function (e) {
            if (!self.zoomactive) return;
            self.zoomactive = false;

            self.win.css("margin", "");
            self.win.css(self.zoomrestore.style);

            if (cap.isios4) {
                $window.scrollTop(self.zoomrestore.scrollTop);
            }

            self.rail.css({
                "z-index": self.zindex
            });
            self.zoom.css({
                "z-index": self.zindex
            });
            self.zoomrestore = false;
            self.zoom.css('backgroundPosition', '0 0');
            self.onResize();

            if (self.onzoomout) self.onzoomout.call(self);

            return self.cancelEvent(e);
        };

        this.doZoom = function (e) {
            return (self.zoomactive) ? self.doZoomOut(e) : self.doZoomIn(e);
        };

        this.resizeZoom = function () {
            if (!self.zoomactive) return;

            var py = self.getScrollTop(); //preserve scrolling position
            self.win.css({
                width: $window.width() - self.zoomrestore.padding.w + "px",
                height: $window.height() - self.zoomrestore.padding.h + "px"
            });
            self.onResize();

            self.setScrollTop(Math.min(self.page.maxh, py));
        };

        this.init();

        $.nicescroll.push(this);

    };

    // Inspired by the work of Kin Blas
    // http://webpro.host.adobe.com/people/jblas/momentum/includes/jquery.momentum.0.7.js  
    var ScrollMomentumClass2D = function (nc) {
        var self = this;
        this.nc = nc;

        this.lastx = 0;
        this.lasty = 0;
        this.speedx = 0;
        this.speedy = 0;
        this.lasttime = 0;
        this.steptime = 0;
        this.snapx = false;
        this.snapy = false;
        this.demulx = 0;
        this.demuly = 0;

        this.lastscrollx = -1;
        this.lastscrolly = -1;

        this.chkx = 0;
        this.chky = 0;

        this.timer = 0;

        this.reset = function (px, py) {
            self.stop();
            self.steptime = 0;
            self.lasttime = now();
            self.speedx = 0;
            self.speedy = 0;
            self.lastx = px;
            self.lasty = py;
            self.lastscrollx = -1;
            self.lastscrolly = -1;
        };

        this.update = function (px, py) {
            var tm = now();
            self.steptime = tm - self.lasttime;
            self.lasttime = tm;
            var dy = py - self.lasty;
            var dx = px - self.lastx;
            var sy = self.nc.getScrollTop();
            var sx = self.nc.getScrollLeft();
            var newy = sy + dy;
            var newx = sx + dx;
            self.snapx = (newx < 0) || (newx > self.nc.page.maxw);
            self.snapy = (newy < 0) || (newy > self.nc.page.maxh);
            self.speedx = dx;
            self.speedy = dy;
            self.lastx = px;
            self.lasty = py;
        };

        this.stop = function () {
            self.nc.unsynched("domomentum2d");
            if (self.timer) clearTimeout(self.timer);
            self.timer = 0;
            self.lastscrollx = -1;
            self.lastscrolly = -1;
        };

        this.doSnapy = function (nx, ny) {
            var snap = false;

            if (ny < 0) {
                ny = 0;
                snap = true;
            } else if (ny > self.nc.page.maxh) {
                ny = self.nc.page.maxh;
                snap = true;
            }

            if (nx < 0) {
                nx = 0;
                snap = true;
            } else if (nx > self.nc.page.maxw) {
                nx = self.nc.page.maxw;
                snap = true;
            }

            (snap) ? self.nc.doScrollPos(nx, ny, self.nc.opt.snapbackspeed) : self.nc.triggerScrollEnd();
        };

        this.doMomentum = function (gp) {
            var t = now();
            var l = (gp) ? t + gp : self.lasttime;

            var sl = self.nc.getScrollLeft();
            var st = self.nc.getScrollTop();

            var pageh = self.nc.page.maxh;
            var pagew = self.nc.page.maxw;

            self.speedx = (pagew > 0) ? Math.min(60, self.speedx) : 0;
            self.speedy = (pageh > 0) ? Math.min(60, self.speedy) : 0;

            var chk = l && (t - l) <= 60;

            if ((st < 0) || (st > pageh) || (sl < 0) || (sl > pagew)) chk = false;

            var sy = (self.speedy && chk) ? self.speedy : false;
            var sx = (self.speedx && chk) ? self.speedx : false;

            if (sy || sx) {
                var tm = Math.max(16, self.steptime); //timeout granularity

                if (tm > 50) { // do smooth
                    var xm = tm / 50;
                    self.speedx *= xm;
                    self.speedy *= xm;
                    tm = 50;
                }

                self.demulxy = 0;

                self.lastscrollx = self.nc.getScrollLeft();
                self.chkx = self.lastscrollx;
                self.lastscrolly = self.nc.getScrollTop();
                self.chky = self.lastscrolly;

                var nx = self.lastscrollx;
                var ny = self.lastscrolly;

                var onscroll = function () {
                    var df = ((now() - t) > 600) ? 0.04 : 0.02;

                    if (self.speedx) {
                        nx = Math.floor(self.lastscrollx - (self.speedx * (1 - self.demulxy)));
                        self.lastscrollx = nx;
                        if ((nx < 0) || (nx > pagew)) df = 0.10;
                    }

                    if (self.speedy) {
                        ny = Math.floor(self.lastscrolly - (self.speedy * (1 - self.demulxy)));
                        self.lastscrolly = ny;
                        if ((ny < 0) || (ny > pageh)) df = 0.10;
                    }

                    self.demulxy = Math.min(1, self.demulxy + df);

                    self.nc.synched("domomentum2d", function () {

                        if (self.speedx) {
                            var scx = self.nc.getScrollLeft();
                            //              if (scx != self.chkx) self.stop();
                            self.chkx = nx;
                            self.nc.setScrollLeft(nx);
                        }

                        if (self.speedy) {
                            var scy = self.nc.getScrollTop();
                            //              if (scy != self.chky) self.stop();
                            self.chky = ny;
                            self.nc.setScrollTop(ny);
                        }

                        if (!self.timer) {
                            self.nc.hideCursor();
                            self.doSnapy(nx, ny);
                        }

                    });

                    if (self.demulxy < 1) {
                        self.timer = setTimeout(onscroll, tm);
                    } else {
                        self.stop();
                        self.nc.hideCursor();
                        self.doSnapy(nx, ny);
                    }
                };

                onscroll();

            } else {
                self.doSnapy(self.nc.getScrollLeft(), self.nc.getScrollTop());
            }

        };

    };


    // override jQuery scrollTop
    var _scrollTop = jQuery.fn.scrollTop; // preserve original function

    jQuery.cssHooks.pageYOffset = {
        get: function (elem, computed, extra) {
            var nice = $.data(elem, '__nicescroll') || false;
            return (nice && nice.ishwscroll) ? nice.getScrollTop() : _scrollTop.call(elem);
        },
        set: function (elem, value) {
            var nice = $.data(elem, '__nicescroll') || false;
            (nice && nice.ishwscroll) ? nice.setScrollTop(parseInt(value)) : _scrollTop.call(elem, value);
            return this;
        }
    };

    jQuery.fn.scrollTop = function (value) {
        if (value === undefined) {
            var nice = (this[0]) ? $.data(this[0], '__nicescroll') || false : false;
            return (nice && nice.ishwscroll) ? nice.getScrollTop() : _scrollTop.call(this);
        } else {
            return this.each(function () {
                var nice = $.data(this, '__nicescroll') || false;
                (nice && nice.ishwscroll) ? nice.setScrollTop(parseInt(value)) : _scrollTop.call($(this), value);
            });
        }
    };

    // override jQuery scrollLeft
    var _scrollLeft = jQuery.fn.scrollLeft; // preserve original function

    $.cssHooks.pageXOffset = {
        get: function (elem, computed, extra) {
            var nice = $.data(elem, '__nicescroll') || false;
            return (nice && nice.ishwscroll) ? nice.getScrollLeft() : _scrollLeft.call(elem);
        },
        set: function (elem, value) {
            var nice = $.data(elem, '__nicescroll') || false;
            (nice && nice.ishwscroll) ? nice.setScrollLeft(parseInt(value)) : _scrollLeft.call(elem, value);
            return this;
        }
    };

    jQuery.fn.scrollLeft = function (value) {
        if (value === undefined) {
            var nice = (this[0]) ? $.data(this[0], '__nicescroll') || false : false;
            return (nice && nice.ishwscroll) ? nice.getScrollLeft() : _scrollLeft.call(this);
        } else {
            return this.each(function () {
                var nice = $.data(this, '__nicescroll') || false;
                (nice && nice.ishwscroll) ? nice.setScrollLeft(parseInt(value)) : _scrollLeft.call($(this), value);
            });
        }
    };

    var NiceScrollArray = function (doms) {
        var self = this;
        this.length = 0;
        this.name = "nicescrollarray";

        this.each = function (fn) {
            $.each(self, fn);
            return self;
        };

        this.push = function (nice) {
            self[self.length] = nice;
            self.length++;
        };

        this.eq = function (idx) {
            return self[idx];
        };

        if (doms) {
            for (var a = 0; a < doms.length; a++) {
                var nice = $.data(doms[a], '__nicescroll') || false;
                if (nice) {
                    this[this.length] = nice;
                    this.length++;
                }
            }
        }

        return this;
    };

    function mplex(el, lst, fn) {
        for (var a = 0, l = lst.length; a < l; a++) fn(el, lst[a]);
    }
    mplex(
        NiceScrollArray.prototype, ['show', 'hide', 'toggle', 'onResize', 'resize', 'remove', 'stop', 'doScrollPos'],
        function (e, n) {
            e[n] = function () {
                var args = arguments;
                return this.each(function () {
                    this[n].apply(this, args);
                });
            };
        }
    );

    jQuery.fn.getNiceScroll = function (index) {
        if (index === undefined) {
            return new NiceScrollArray(this);
        } else {
            return this[index] && $.data(this[index], '__nicescroll') || false;
        }
    };

    var pseudos = jQuery.expr.pseudos || jQuery.expr[':'];  // jQuery 3 migration
    pseudos.nicescroll = function (a) {
        return $.data(a, '__nicescroll') !== undefined;
    };

    $.fn.niceScroll = function (wrapper, _opt) {
        if (_opt === undefined && typeof wrapper == "object" && !("jquery" in wrapper)) {
            _opt = wrapper;
            wrapper = false;
        }

        var ret = new NiceScrollArray();

        this.each(function () {
            var $this = $(this);

            var opt = $.extend({}, _opt); // cloning

            if (wrapper || false) {
                var wrp = $(wrapper);
                opt.doc = (wrp.length > 1) ? $(wrapper, $this) : wrp;
                opt.win = $this;
            }
            var docundef = !("doc" in opt);
            if (!docundef && !("win" in opt)) opt.win = $this;

            var nice = $this.data('__nicescroll') || false;
            if (!nice) {
                opt.doc = opt.doc || $this;
                nice = new NiceScrollClass(opt, $this);
                $this.data('__nicescroll', nice);
            }
            ret.push(nice);
        });

        return (ret.length === 1) ? ret[0] : ret;
    };

    _win.NiceScroll = {
        getjQuery: function () {
            return jQuery;
        }
    };

    if (!$.nicescroll) {
        $.nicescroll = new NiceScrollArray();
        $.nicescroll.options = _globaloptions;
    }

}));

!function (e) { "function" == typeof define && define.amd ? define(["jquery"], e) : "object" == typeof exports ? module.exports = e(require("jquery")) : e(jQuery) }(function (e) { "use strict"; var o = !1, t = !1, r = 0, i = 2e3, s = 0, n = e, l = document, a = window, c = n(a), d = [], u = a.requestAnimationFrame || a.webkitRequestAnimationFrame || a.mozRequestAnimationFrame || !1, h = a.cancelAnimationFrame || a.webkitCancelAnimationFrame || a.mozCancelAnimationFrame || !1; if (u) a.cancelAnimationFrame || (h = function (e) { }); else { var p = 0; u = function (e, o) { var t = (new Date).getTime(), r = Math.max(0, 16 - (t - p)), i = a.setTimeout(function () { e(t + r) }, r); return p = t + r, i }, h = function (e) { a.clearTimeout(e) } } var m = a.MutationObserver || a.WebKitMutationObserver || !1, f = Date.now || function () { return (new Date).getTime() }, g = { zindex: "auto", cursoropacitymin: 0, cursoropacitymax: 1, cursorcolor: "#424242", cursorwidth: "6px", cursorborder: "1px solid #fff", cursorborderradius: "5px", scrollspeed: 40, mousescrollstep: 27, touchbehavior: !1, emulatetouch: !1, hwacceleration: !0, usetransition: !0, boxzoom: !1, dblclickzoom: !0, gesturezoom: !0, grabcursorenabled: !0, autohidemode: !0, background: "", iframeautoresize: !0, cursorminheight: 32, preservenativescrolling: !0, railoffset: !1, railhoffset: !1, bouncescroll: !0, spacebarenabled: !0, railpadding: { top: 0, right: 0, left: 0, bottom: 0 }, disableoutline: !0, horizrailenabled: !0, railalign: "right", railvalign: "bottom", enabletranslate3d: !0, enablemousewheel: !0, enablekeyboard: !0, smoothscroll: !0, sensitiverail: !0, enablemouselockapi: !0, cursorfixedheight: !1, directionlockdeadzone: 6, hidecursordelay: 400, nativeparentscrolling: !0, enablescrollonselection: !0, overflowx: !0, overflowy: !0, cursordragspeed: .3, rtlmode: "auto", cursordragontouch: !1, oneaxismousemode: "auto", scriptpath: function () { var e = l.currentScript || function () { var e = l.getElementsByTagName("script"); return !!e.length && e[e.length - 1] }(), o = e ? e.src.split("?")[0] : ""; return o.split("/").length > 0 ? o.split("/").slice(0, -1).join("/") + "/" : "" }(), preventmultitouchscrolling: !0, disablemutationobserver: !1, enableobserver: !0, scrollbarid: !1 }, v = !1, w = function () { if (v) return v; var e = l.createElement("DIV"), o = e.style, t = navigator.userAgent, r = navigator.platform, i = {}; return i.haspointerlock = "pointerLockElement" in l || "webkitPointerLockElement" in l || "mozPointerLockElement" in l, i.isopera = "opera" in a, i.isopera12 = i.isopera && "getUserMedia" in navigator, i.isoperamini = "[object OperaMini]" === Object.prototype.toString.call(a.operamini), i.isie = "all" in l && "attachEvent" in e && !i.isopera, i.isieold = i.isie && !("msInterpolationMode" in o), i.isie7 = i.isie && !i.isieold && (!("documentMode" in l) || 7 === l.documentMode), i.isie8 = i.isie && "documentMode" in l && 8 === l.documentMode, i.isie9 = i.isie && "performance" in a && 9 === l.documentMode, i.isie10 = i.isie && "performance" in a && 10 === l.documentMode, i.isie11 = "msRequestFullscreen" in e && l.documentMode >= 11, i.ismsedge = "msCredentials" in a, i.ismozilla = "MozAppearance" in o, i.iswebkit = !i.ismsedge && "WebkitAppearance" in o, i.ischrome = i.iswebkit && "chrome" in a, i.ischrome38 = i.ischrome && "touchAction" in o, i.ischrome22 = !i.ischrome38 && i.ischrome && i.haspointerlock, i.ischrome26 = !i.ischrome38 && i.ischrome && "transition" in o, i.cantouch = "ontouchstart" in l.documentElement || "ontouchstart" in a, i.hasw3ctouch = (a.PointerEvent || !1) && (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0), i.hasmstouch = !i.hasw3ctouch && (a.MSPointerEvent || !1), i.ismac = /^mac$/i.test(r), i.isios = i.cantouch && /iphone|ipad|ipod/i.test(r), i.isios4 = i.isios && !("seal" in Object), i.isios7 = i.isios && "webkitHidden" in l, i.isios8 = i.isios && "hidden" in l, i.isios10 = i.isios && a.Proxy, i.isandroid = /android/i.test(t), i.haseventlistener = "addEventListener" in e, i.trstyle = !1, i.hastransform = !1, i.hastranslate3d = !1, i.transitionstyle = !1, i.hastransition = !1, i.transitionend = !1, i.trstyle = "transform", i.hastransform = "transform" in o || function () { for (var e = ["msTransform", "webkitTransform", "MozTransform", "OTransform"], t = 0, r = e.length; t < r; t++)if (void 0 !== o[e[t]]) { i.trstyle = e[t]; break } i.hastransform = !!i.trstyle }(), i.hastransform && (o[i.trstyle] = "translate3d(1px,2px,3px)", i.hastranslate3d = /translate3d/.test(o[i.trstyle])), i.transitionstyle = "transition", i.prefixstyle = "", i.transitionend = "transitionend", i.hastransition = "transition" in o || function () { i.transitionend = !1; for (var e = ["webkitTransition", "msTransition", "MozTransition", "OTransition", "OTransition", "KhtmlTransition"], t = ["-webkit-", "-ms-", "-moz-", "-o-", "-o", "-khtml-"], r = ["webkitTransitionEnd", "msTransitionEnd", "transitionend", "otransitionend", "oTransitionEnd", "KhtmlTransitionEnd"], s = 0, n = e.length; s < n; s++)if (e[s] in o) { i.transitionstyle = e[s], i.prefixstyle = t[s], i.transitionend = r[s]; break } i.ischrome26 && (i.prefixstyle = t[1]), i.hastransition = i.transitionstyle }(), i.cursorgrabvalue = function () { var e = ["grab", "-webkit-grab", "-moz-grab"]; (i.ischrome && !i.ischrome38 || i.isie) && (e = []); for (var t = 0, r = e.length; t < r; t++) { var s = e[t]; if (o.cursor = s, o.cursor == s) return s } return "url(https://cdnjs.cloudflare.com/ajax/libs/slider-pro/1.3.0/css/images/openhand.cur),n-resize" }(), i.hasmousecapture = "setCapture" in e, i.hasMutationObserver = !1 !== m, e = null, v = i, i }, b = function (e, p) { function v() { var e = T.doc.css(P.trstyle); return !(!e || "matrix" != e.substr(0, 6)) && e.replace(/^.*\((.*)\)$/g, "$1").replace(/px/g, "").split(/, +/) } function b() { var e = T.win; if ("zIndex" in e) return e.zIndex(); for (; e.length > 0;) { if (9 == e[0].nodeType) return !1; var o = e.css("zIndex"); if (!isNaN(o) && 0 !== o) return parseInt(o); e = e.parent() } return !1 } function x(e, o, t) { var r = e.css(o), i = parseFloat(r); if (isNaN(i)) { var s = 3 == (i = I[r] || 0) ? t ? T.win.outerHeight() - T.win.innerHeight() : T.win.outerWidth() - T.win.innerWidth() : 1; return T.isie8 && i && (i += 1), s ? i : 0 } return i } function S(e, o, t, r) { T._bind(e, o, function (r) { var i = { original: r = r || a.event, target: r.target || r.srcElement, type: "wheel", deltaMode: "MozMousePixelScroll" == r.type ? 0 : 1, deltaX: 0, deltaZ: 0, preventDefault: function () { return r.preventDefault ? r.preventDefault() : r.returnValue = !1, !1 }, stopImmediatePropagation: function () { r.stopImmediatePropagation ? r.stopImmediatePropagation() : r.cancelBubble = !0 } }; return "mousewheel" == o ? (r.wheelDeltaX && (i.deltaX = -.025 * r.wheelDeltaX), r.wheelDeltaY && (i.deltaY = -.025 * r.wheelDeltaY), !i.deltaY && !i.deltaX && (i.deltaY = -.025 * r.wheelDelta)) : i.deltaY = r.detail, t.call(e, i) }, r) } function z(e, o, t, r) { T.scrollrunning || (T.newscrolly = T.getScrollTop(), T.newscrollx = T.getScrollLeft(), D = f()); var i = f() - D; if (D = f(), i > 350 ? A = 1 : A += (2 - A) / 10, e = e * A | 0, o = o * A | 0, e) { if (r) if (e < 0) { if (T.getScrollLeft() >= T.page.maxw) return !0 } else if (T.getScrollLeft() <= 0) return !0; var s = e > 0 ? 1 : -1; X !== s && (T.scrollmom && T.scrollmom.stop(), T.newscrollx = T.getScrollLeft(), X = s), T.lastdeltax -= e } if (o) { if (function () { var e = T.getScrollTop(); if (o < 0) { if (e >= T.page.maxh) return !0 } else if (e <= 0) return !0 }()) { if (M.nativeparentscrolling && t && !T.ispage && !T.zoomactive) return !0; var n = T.view.h >> 1; T.newscrolly < -n ? (T.newscrolly = -n, o = -1) : T.newscrolly > T.page.maxh + n ? (T.newscrolly = T.page.maxh + n, o = 1) : o = 0 } var l = o > 0 ? 1 : -1; B !== l && (T.scrollmom && T.scrollmom.stop(), T.newscrolly = T.getScrollTop(), B = l), T.lastdeltay -= o } (o || e) && T.synched("relativexy", function () { var e = T.lastdeltay + T.newscrolly; T.lastdeltay = 0; var o = T.lastdeltax + T.newscrollx; T.lastdeltax = 0, T.rail.drag || T.doScrollPos(o, e) }) } function k(e, o, t) { var r, i; return !(t || !q) || (0 === e.deltaMode ? (r = -e.deltaX * (M.mousescrollstep / 54) | 0, i = -e.deltaY * (M.mousescrollstep / 54) | 0) : 1 === e.deltaMode && (r = -e.deltaX * M.mousescrollstep * 50 / 80 | 0, i = -e.deltaY * M.mousescrollstep * 50 / 80 | 0), o && M.oneaxismousemode && 0 === r && i && (r = i, i = 0, t && (r < 0 ? T.getScrollLeft() >= T.page.maxw : T.getScrollLeft() <= 0) && (i = r, r = 0)), T.isrtlmode && (r = -r), z(r, i, t, !0) ? void (t && (q = !0)) : (q = !1, e.stopImmediatePropagation(), e.preventDefault())) } var T = this; this.version = "3.7.6", this.name = "nicescroll", this.me = p; var E = n("body"), M = this.opt = { doc: E, win: !1 }; if (n.extend(M, g), M.snapbackspeed = 80, e) for (var L in M) void 0 !== e[L] && (M[L] = e[L]); if (M.disablemutationobserver && (m = !1), this.doc = M.doc, this.iddoc = this.doc && this.doc[0] ? this.doc[0].id || "" : "", this.ispage = /^BODY|HTML/.test(M.win ? M.win[0].nodeName : this.doc[0].nodeName), this.haswrapper = !1 !== M.win, this.win = M.win || (this.ispage ? c : this.doc), this.docscroll = this.ispage && !this.haswrapper ? c : this.win, this.body = E, this.viewport = !1, this.isfixed = !1, this.iframe = !1, this.isiframe = "IFRAME" == this.doc[0].nodeName && "IFRAME" == this.win[0].nodeName, this.istextarea = "TEXTAREA" == this.win[0].nodeName, this.forcescreen = !1, this.canshowonmouseevent = "scroll" != M.autohidemode, this.onmousedown = !1, this.onmouseup = !1, this.onmousemove = !1, this.onmousewheel = !1, this.onkeypress = !1, this.ongesturezoom = !1, this.onclick = !1, this.onscrollstart = !1, this.onscrollend = !1, this.onscrollcancel = !1, this.onzoomin = !1, this.onzoomout = !1, this.view = !1, this.page = !1, this.scroll = { x: 0, y: 0 }, this.scrollratio = { x: 0, y: 0 }, this.cursorheight = 20, this.scrollvaluemax = 0, "auto" == M.rtlmode) { var C = this.win[0] == a ? this.body : this.win, N = C.css("writing-mode") || C.css("-webkit-writing-mode") || C.css("-ms-writing-mode") || C.css("-moz-writing-mode"); "horizontal-tb" == N || "lr-tb" == N || "" === N ? (this.isrtlmode = "rtl" == C.css("direction"), this.isvertical = !1) : (this.isrtlmode = "vertical-rl" == N || "tb" == N || "tb-rl" == N || "rl-tb" == N, this.isvertical = "vertical-rl" == N || "tb" == N || "tb-rl" == N) } else this.isrtlmode = !0 === M.rtlmode, this.isvertical = !1; if (this.scrollrunning = !1, this.scrollmom = !1, this.observer = !1, this.observerremover = !1, this.observerbody = !1, !1 !== M.scrollbarid) this.id = M.scrollbarid; else do { this.id = "ascrail" + i++ } while (l.getElementById(this.id)); this.rail = !1, this.cursor = !1, this.cursorfreezed = !1, this.selectiondrag = !1, this.zoom = !1, this.zoomactive = !1, this.hasfocus = !1, this.hasmousefocus = !1, this.railslocked = !1, this.locked = !1, this.hidden = !1, this.cursoractive = !0, this.wheelprevented = !1, this.overflowx = M.overflowx, this.overflowy = M.overflowy, this.nativescrollingarea = !1, this.checkarea = 0, this.events = [], this.saved = {}, this.delaylist = {}, this.synclist = {}, this.lastdeltax = 0, this.lastdeltay = 0, this.detected = w(); var P = n.extend({}, this.detected); this.canhwscroll = P.hastransform && M.hwacceleration, this.ishwscroll = this.canhwscroll && T.haswrapper, this.isrtlmode ? this.isvertical ? this.hasreversehr = !(P.iswebkit || P.isie || P.isie11) : this.hasreversehr = !(P.iswebkit || P.isie && !P.isie10 && !P.isie11) : this.hasreversehr = !1, this.istouchcapable = !1, P.cantouch || !P.hasw3ctouch && !P.hasmstouch ? !P.cantouch || P.isios || P.isandroid || !P.iswebkit && !P.ismozilla || (this.istouchcapable = !0) : this.istouchcapable = !0, M.enablemouselockapi || (P.hasmousecapture = !1, P.haspointerlock = !1), this.debounced = function (e, o, t) { T && (T.delaylist[e] || !1 || (T.delaylist[e] = { h: u(function () { T.delaylist[e].fn.call(T), T.delaylist[e] = !1 }, t) }, o.call(T)), T.delaylist[e].fn = o) }, this.synched = function (e, o) { T.synclist[e] ? T.synclist[e] = o : (T.synclist[e] = o, u(function () { T && (T.synclist[e] && T.synclist[e].call(T), T.synclist[e] = null) })) }, this.unsynched = function (e) { T.synclist[e] && (T.synclist[e] = !1) }, this.css = function (e, o) { for (var t in o) T.saved.css.push([e, t, e.css(t)]), e.css(t, o[t]) }, this.scrollTop = function (e) { return void 0 === e ? T.getScrollTop() : T.setScrollTop(e) }, this.scrollLeft = function (e) { return void 0 === e ? T.getScrollLeft() : T.setScrollLeft(e) }; var R = function (e, o, t, r, i, s, n) { this.st = e, this.ed = o, this.spd = t, this.p1 = r || 0, this.p2 = i || 1, this.p3 = s || 0, this.p4 = n || 1, this.ts = f(), this.df = o - e }; if (R.prototype = { B2: function (e) { return 3 * (1 - e) * (1 - e) * e }, B3: function (e) { return 3 * (1 - e) * e * e }, B4: function (e) { return e * e * e }, getPos: function () { return (f() - this.ts) / this.spd }, getNow: function () { var e = (f() - this.ts) / this.spd, o = this.B2(e) + this.B3(e) + this.B4(e); return e >= 1 ? this.ed : this.st + this.df * o | 0 }, update: function (e, o) { return this.st = this.getNow(), this.ed = e, this.spd = o, this.ts = f(), this.df = this.ed - this.st, this } }, this.ishwscroll) { this.doc.translate = { x: 0, y: 0, tx: "0px", ty: "0px" }, P.hastranslate3d && P.isios && this.doc.css("-webkit-backface-visibility", "hidden"), this.getScrollTop = function (e) { if (!e) { var o = v(); if (o) return 16 == o.length ? -o[13] : -o[5]; if (T.timerscroll && T.timerscroll.bz) return T.timerscroll.bz.getNow() } return T.doc.translate.y }, this.getScrollLeft = function (e) { if (!e) { var o = v(); if (o) return 16 == o.length ? -o[12] : -o[4]; if (T.timerscroll && T.timerscroll.bh) return T.timerscroll.bh.getNow() } return T.doc.translate.x }, this.notifyScrollEvent = function (e) { var o = l.createEvent("UIEvents"); o.initUIEvent("scroll", !1, !1, a, 1), o.niceevent = !0, e.dispatchEvent(o) }; var _ = this.isrtlmode ? 1 : -1; P.hastranslate3d && M.enabletranslate3d ? (this.setScrollTop = function (e, o) { T.doc.translate.y = e, T.doc.translate.ty = -1 * e + "px", T.doc.css(P.trstyle, "translate3d(" + T.doc.translate.tx + "," + T.doc.translate.ty + ",0)"), o || T.notifyScrollEvent(T.win[0]) }, this.setScrollLeft = function (e, o) { T.doc.translate.x = e, T.doc.translate.tx = e * _ + "px", T.doc.css(P.trstyle, "translate3d(" + T.doc.translate.tx + "," + T.doc.translate.ty + ",0)"), o || T.notifyScrollEvent(T.win[0]) }) : (this.setScrollTop = function (e, o) { T.doc.translate.y = e, T.doc.translate.ty = -1 * e + "px", T.doc.css(P.trstyle, "translate(" + T.doc.translate.tx + "," + T.doc.translate.ty + ")"), o || T.notifyScrollEvent(T.win[0]) }, this.setScrollLeft = function (e, o) { T.doc.translate.x = e, T.doc.translate.tx = e * _ + "px", T.doc.css(P.trstyle, "translate(" + T.doc.translate.tx + "," + T.doc.translate.ty + ")"), o || T.notifyScrollEvent(T.win[0]) }) } else this.getScrollTop = function () { return T.docscroll.scrollTop() }, this.setScrollTop = function (e) { T.docscroll.scrollTop(e) }, this.getScrollLeft = function () { return T.hasreversehr ? T.detected.ismozilla ? T.page.maxw - Math.abs(T.docscroll.scrollLeft()) : T.page.maxw - T.docscroll.scrollLeft() : T.docscroll.scrollLeft() }, this.setScrollLeft = function (e) { return setTimeout(function () { if (T) return T.hasreversehr && (e = T.detected.ismozilla ? -(T.page.maxw - e) : T.page.maxw - e), T.docscroll.scrollLeft(e) }, 1) }; this.getTarget = function (e) { return !!e && (e.target ? e.target : !!e.srcElement && e.srcElement) }, this.hasParent = function (e, o) { if (!e) return !1; for (var t = e.target || e.srcElement || e || !1; t && t.id != o;)t = t.parentNode || !1; return !1 !== t }; var I = { thin: 1, medium: 3, thick: 5 }; this.getDocumentScrollOffset = function () { return { top: a.pageYOffset || l.documentElement.scrollTop, left: a.pageXOffset || l.documentElement.scrollLeft } }, this.getOffset = function () { if (T.isfixed) { var e = T.win.offset(), o = T.getDocumentScrollOffset(); return e.top -= o.top, e.left -= o.left, e } var t = T.win.offset(); if (!T.viewport) return t; var r = T.viewport.offset(); return { top: t.top - r.top, left: t.left - r.left } }, this.updateScrollBar = function (e) { var o, t; if (T.ishwscroll) T.rail.css({ height: T.win.innerHeight() - (M.railpadding.top + M.railpadding.bottom) }), T.railh && T.railh.css({ width: T.win.innerWidth() - (M.railpadding.left + M.railpadding.right) }); else { var r = T.getOffset(); if (o = { top: r.top, left: r.left - (M.railpadding.left + M.railpadding.right) }, o.top += x(T.win, "border-top-width", !0), o.left += T.rail.align ? T.win.outerWidth() - x(T.win, "border-right-width") - T.rail.width : x(T.win, "border-left-width"), (t = M.railoffset) && (t.top && (o.top += t.top), t.left && (o.left += t.left)), T.railslocked || T.rail.css({ top: o.top, left: o.left, height: (e ? e.h : T.win.innerHeight()) - (M.railpadding.top + M.railpadding.bottom) }), T.zoom && T.zoom.css({ top: o.top + 1, left: 1 == T.rail.align ? o.left - 20 : o.left + T.rail.width + 4 }), T.railh && !T.railslocked) { o = { top: r.top, left: r.left }, (t = M.railhoffset) && (t.top && (o.top += t.top), t.left && (o.left += t.left)); var i = T.railh.align ? o.top + x(T.win, "border-top-width", !0) + T.win.innerHeight() - T.railh.height : o.top + x(T.win, "border-top-width", !0), s = o.left + x(T.win, "border-left-width"); T.railh.css({ top: i - (M.railpadding.top + M.railpadding.bottom), left: s, width: T.railh.width }) } } }, this.doRailClick = function (e, o, t) { var r, i, s, n; T.railslocked || (T.cancelEvent(e), "pageY" in e || (e.pageX = e.clientX + l.documentElement.scrollLeft, e.pageY = e.clientY + l.documentElement.scrollTop), o ? (r = t ? T.doScrollLeft : T.doScrollTop, s = t ? (e.pageX - T.railh.offset().left - T.cursorwidth / 2) * T.scrollratio.x : (e.pageY - T.rail.offset().top - T.cursorheight / 2) * T.scrollratio.y, T.unsynched("relativexy"), r(0 | s)) : (r = t ? T.doScrollLeftBy : T.doScrollBy, s = t ? T.scroll.x : T.scroll.y, n = t ? e.pageX - T.railh.offset().left : e.pageY - T.rail.offset().top, i = t ? T.view.w : T.view.h, r(s >= n ? i : -i))) }, T.newscrolly = T.newscrollx = 0, T.hasanimationframe = "requestAnimationFrame" in a, T.hascancelanimationframe = "cancelAnimationFrame" in a, T.hasborderbox = !1, this.init = function () { if (T.saved.css = [], P.isoperamini) return !0; if (P.isandroid && !("hidden" in l)) return !0; M.emulatetouch = M.emulatetouch || M.touchbehavior, T.hasborderbox = a.getComputedStyle && "border-box" === a.getComputedStyle(l.body)["box-sizing"]; var e = { "overflow-y": "hidden" }; if ((P.isie11 || P.isie10) && (e["-ms-overflow-style"] = "none"), T.ishwscroll && (this.doc.css(P.transitionstyle, P.prefixstyle + "transform 0ms ease-out"), P.transitionend && T.bind(T.doc, P.transitionend, T.onScrollTransitionEnd, !1)), T.zindex = "auto", T.ispage || "auto" != M.zindex ? T.zindex = M.zindex : T.zindex = b() || "auto", !T.ispage && "auto" != T.zindex && T.zindex > s && (s = T.zindex), T.isie && 0 === T.zindex && "auto" == M.zindex && (T.zindex = "auto"), !T.ispage || !P.isieold) { var i = T.docscroll; T.ispage && (i = T.haswrapper ? T.win : T.doc), T.css(i, e), T.ispage && (P.isie11 || P.isie) && T.css(n("html"), e), !P.isios || T.ispage || T.haswrapper || T.css(E, { "-webkit-overflow-scrolling": "touch" }); var d = n(l.createElement("div")); d.css({ position: "relative", top: 0, float: "right", width: M.cursorwidth, height: 0, "background-color": M.cursorcolor, border: M.cursorborder, "background-clip": "padding-box", "-webkit-border-radius": M.cursorborderradius, "-moz-border-radius": M.cursorborderradius, "border-radius": M.cursorborderradius }), d.addClass("nicescroll-cursors"), T.cursor = d; var u = n(l.createElement("div")); u.attr("id", T.id), u.addClass("nicescroll-rails nicescroll-rails-vr"); var h, p, f = ["left", "right", "top", "bottom"]; for (var g in f) p = f[g], (h = M.railpadding[p] || 0) && u.css("padding-" + p, h + "px"); u.append(d), u.width = Math.max(parseFloat(M.cursorwidth), d.outerWidth()), u.css({ width: u.width + "px", zIndex: T.zindex, background: M.background, cursor: "default" }), u.visibility = !0, u.scrollable = !0, u.align = "left" == M.railalign ? 0 : 1, T.rail = u, T.rail.drag = !1; var v = !1; !M.boxzoom || T.ispage || P.isieold || (v = l.createElement("div"), T.bind(v, "click", T.doZoom), T.bind(v, "mouseenter", function () { T.zoom.css("opacity", M.cursoropacitymax) }), T.bind(v, "mouseleave", function () { T.zoom.css("opacity", M.cursoropacitymin) }), T.zoom = n(v), T.zoom.css({ cursor: "pointer", zIndex: T.zindex, backgroundImage: "url(" + M.scriptpath + "zoomico.png)", height: 18, width: 18, backgroundPosition: "0 0" }), M.dblclickzoom && T.bind(T.win, "dblclick", T.doZoom), P.cantouch && M.gesturezoom && (T.ongesturezoom = function (e) { return e.scale > 1.5 && T.doZoomIn(e), e.scale < .8 && T.doZoomOut(e), T.cancelEvent(e) }, T.bind(T.win, "gestureend", T.ongesturezoom))), T.railh = !1; var w; if (M.horizrailenabled && (T.css(i, { overflowX: "hidden" }), (d = n(l.createElement("div"))).css({ position: "absolute", top: 0, height: M.cursorwidth, width: 0, backgroundColor: M.cursorcolor, border: M.cursorborder, backgroundClip: "padding-box", "-webkit-border-radius": M.cursorborderradius, "-moz-border-radius": M.cursorborderradius, "border-radius": M.cursorborderradius }), P.isieold && d.css("overflow", "hidden"), d.addClass("nicescroll-cursors"), T.cursorh = d, (w = n(l.createElement("div"))).attr("id", T.id + "-hr"), w.addClass("nicescroll-rails nicescroll-rails-hr"), w.height = Math.max(parseFloat(M.cursorwidth), d.outerHeight()), w.css({ height: w.height + "px", zIndex: T.zindex, background: M.background }), w.append(d), w.visibility = !0, w.scrollable = !0, w.align = "top" == M.railvalign ? 0 : 1, T.railh = w, T.railh.drag = !1), T.ispage) u.css({ position: "fixed", top: 0, height: "100%" }), u.css(u.align ? { right: 0 } : { left: 0 }), T.body.append(u), T.railh && (w.css({ position: "fixed", left: 0, width: "100%" }), w.css(w.align ? { bottom: 0 } : { top: 0 }), T.body.append(w)); else { if (T.ishwscroll) { "static" == T.win.css("position") && T.css(T.win, { position: "relative" }); var x = "HTML" == T.win[0].nodeName ? T.body : T.win; n(x).scrollTop(0).scrollLeft(0), T.zoom && (T.zoom.css({ position: "absolute", top: 1, right: 0, "margin-right": u.width + 4 }), x.append(T.zoom)), u.css({ position: "absolute", top: 0 }), u.css(u.align ? { right: 0 } : { left: 0 }), x.append(u), w && (w.css({ position: "absolute", left: 0, bottom: 0 }), w.css(w.align ? { bottom: 0 } : { top: 0 }), x.append(w)) } else { T.isfixed = "fixed" == T.win.css("position"); var S = T.isfixed ? "fixed" : "absolute"; T.isfixed || (T.viewport = T.getViewport(T.win[0])), T.viewport && (T.body = T.viewport, /fixed|absolute/.test(T.viewport.css("position")) || T.css(T.viewport, { position: "relative" })), u.css({ position: S }), T.zoom && T.zoom.css({ position: S }), T.updateScrollBar(), T.body.append(u), T.zoom && T.body.append(T.zoom), T.railh && (w.css({ position: S }), T.body.append(w)) } P.isios && T.css(T.win, { "-webkit-tap-highlight-color": "rgba(0,0,0,0)", "-webkit-touch-callout": "none" }), M.disableoutline && (P.isie && T.win.attr("hideFocus", "true"), P.iswebkit && T.win.css("outline", "none")) } if (!1 === M.autohidemode ? (T.autohidedom = !1, T.rail.css({ opacity: M.cursoropacitymax }), T.railh && T.railh.css({ opacity: M.cursoropacitymax })) : !0 === M.autohidemode || "leave" === M.autohidemode ? (T.autohidedom = n().add(T.rail), P.isie8 && (T.autohidedom = T.autohidedom.add(T.cursor)), T.railh && (T.autohidedom = T.autohidedom.add(T.railh)), T.railh && P.isie8 && (T.autohidedom = T.autohidedom.add(T.cursorh))) : "scroll" == M.autohidemode ? (T.autohidedom = n().add(T.rail), T.railh && (T.autohidedom = T.autohidedom.add(T.railh))) : "cursor" == M.autohidemode ? (T.autohidedom = n().add(T.cursor), T.railh && (T.autohidedom = T.autohidedom.add(T.cursorh))) : "hidden" == M.autohidemode && (T.autohidedom = !1, T.hide(), T.railslocked = !1), P.cantouch || T.istouchcapable || M.emulatetouch || P.hasmstouch) { T.scrollmom = new y(T); T.ontouchstart = function (e) { if (T.locked) return !1; if (e.pointerType && ("mouse" === e.pointerType || e.pointerType === e.MSPOINTER_TYPE_MOUSE)) return !1; if (T.hasmoving = !1, T.scrollmom.timer && (T.triggerScrollEnd(), T.scrollmom.stop()), !T.railslocked) { var o = T.getTarget(e); if (o && /INPUT/i.test(o.nodeName) && /range/i.test(o.type)) return T.stopPropagation(e); var t = "mousedown" === e.type; if (!("clientX" in e) && "changedTouches" in e && (e.clientX = e.changedTouches[0].clientX, e.clientY = e.changedTouches[0].clientY), T.forcescreen) { var r = e; (e = { original: e.original ? e.original : e }).clientX = r.screenX, e.clientY = r.screenY } if (T.rail.drag = { x: e.clientX, y: e.clientY, sx: T.scroll.x, sy: T.scroll.y, st: T.getScrollTop(), sl: T.getScrollLeft(), pt: 2, dl: !1, tg: o }, T.ispage || !M.directionlockdeadzone) T.rail.drag.dl = "f"; else { var i = { w: c.width(), h: c.height() }, s = T.getContentSize(), l = s.h - i.h, a = s.w - i.w; T.rail.scrollable && !T.railh.scrollable ? T.rail.drag.ck = l > 0 && "v" : !T.rail.scrollable && T.railh.scrollable ? T.rail.drag.ck = a > 0 && "h" : T.rail.drag.ck = !1 } if (M.emulatetouch && T.isiframe && P.isie) { var d = T.win.position(); T.rail.drag.x += d.left, T.rail.drag.y += d.top } if (T.hasmoving = !1, T.lastmouseup = !1, T.scrollmom.reset(e.clientX, e.clientY), o && t) { if (!/INPUT|SELECT|BUTTON|TEXTAREA/i.test(o.nodeName)) return P.hasmousecapture && o.setCapture(), M.emulatetouch ? (o.onclick && !o._onclick && (o._onclick = o.onclick, o.onclick = function (e) { if (T.hasmoving) return !1; o._onclick.call(this, e) }), T.cancelEvent(e)) : T.stopPropagation(e); /SUBMIT|CANCEL|BUTTON/i.test(n(o).attr("type")) && (T.preventclick = { tg: o, click: !1 }) } } }, T.ontouchend = function (e) { if (!T.rail.drag) return !0; if (2 == T.rail.drag.pt) { if (e.pointerType && ("mouse" === e.pointerType || e.pointerType === e.MSPOINTER_TYPE_MOUSE)) return !1; T.rail.drag = !1; var o = "mouseup" === e.type; if (T.hasmoving && (T.scrollmom.doMomentum(), T.lastmouseup = !0, T.hideCursor(), P.hasmousecapture && l.releaseCapture(), o)) return T.cancelEvent(e) } else if (1 == T.rail.drag.pt) return T.onmouseup(e) }; var z = M.emulatetouch && T.isiframe && !P.hasmousecapture, k = .3 * M.directionlockdeadzone | 0; T.ontouchmove = function (e, o) { if (!T.rail.drag) return !0; if (e.targetTouches && M.preventmultitouchscrolling && e.targetTouches.length > 1) return !0; if (e.pointerType && ("mouse" === e.pointerType || e.pointerType === e.MSPOINTER_TYPE_MOUSE)) return !0; if (2 == T.rail.drag.pt) { "changedTouches" in e && (e.clientX = e.changedTouches[0].clientX, e.clientY = e.changedTouches[0].clientY); var t, r; if (r = t = 0, z && !o) { var i = T.win.position(); r = -i.left, t = -i.top } var s = e.clientY + t, n = s - T.rail.drag.y, a = e.clientX + r, c = a - T.rail.drag.x, d = T.rail.drag.st - n; if (T.ishwscroll && M.bouncescroll) d < 0 ? d = Math.round(d / 2) : d > T.page.maxh && (d = T.page.maxh + Math.round((d - T.page.maxh) / 2)); else if (d < 0 ? (d = 0, s = 0) : d > T.page.maxh && (d = T.page.maxh, s = 0), 0 === s && !T.hasmoving) return T.ispage || (T.rail.drag = !1), !0; var u = T.getScrollLeft(); if (T.railh && T.railh.scrollable && (u = T.isrtlmode ? c - T.rail.drag.sl : T.rail.drag.sl - c, T.ishwscroll && M.bouncescroll ? u < 0 ? u = Math.round(u / 2) : u > T.page.maxw && (u = T.page.maxw + Math.round((u - T.page.maxw) / 2)) : (u < 0 && (u = 0, a = 0), u > T.page.maxw && (u = T.page.maxw, a = 0))), !T.hasmoving) { if (T.rail.drag.y === e.clientY && T.rail.drag.x === e.clientX) return T.cancelEvent(e); var h = Math.abs(n), p = Math.abs(c), m = M.directionlockdeadzone; if (T.rail.drag.ck ? "v" == T.rail.drag.ck ? p > m && h <= k ? T.rail.drag = !1 : h > m && (T.rail.drag.dl = "v") : "h" == T.rail.drag.ck && (h > m && p <= k ? T.rail.drag = !1 : p > m && (T.rail.drag.dl = "h")) : h > m && p > m ? T.rail.drag.dl = "f" : h > m ? T.rail.drag.dl = p > k ? "f" : "v" : p > m && (T.rail.drag.dl = h > k ? "f" : "h"), !T.rail.drag.dl) return T.cancelEvent(e); T.triggerScrollStart(e.clientX, e.clientY, 0, 0, 0), T.hasmoving = !0 } return T.preventclick && !T.preventclick.click && (T.preventclick.click = T.preventclick.tg.onclick || !1, T.preventclick.tg.onclick = T.onpreventclick), T.rail.drag.dl && ("v" == T.rail.drag.dl ? u = T.rail.drag.sl : "h" == T.rail.drag.dl && (d = T.rail.drag.st)), T.synched("touchmove", function () { T.rail.drag && 2 == T.rail.drag.pt && (T.prepareTransition && T.resetTransition(), T.rail.scrollable && T.setScrollTop(d), T.scrollmom.update(a, s), T.railh && T.railh.scrollable ? (T.setScrollLeft(u), T.showCursor(d, u)) : T.showCursor(d), P.isie10 && l.selection.clear()) }), T.cancelEvent(e) } return 1 == T.rail.drag.pt ? T.onmousemove(e) : void 0 }, T.ontouchstartCursor = function (e, o) { if (!T.rail.drag || 3 == T.rail.drag.pt) { if (T.locked) return T.cancelEvent(e); T.cancelScroll(), T.rail.drag = { x: e.touches[0].clientX, y: e.touches[0].clientY, sx: T.scroll.x, sy: T.scroll.y, pt: 3, hr: !!o }; var t = T.getTarget(e); return !T.ispage && P.hasmousecapture && t.setCapture(), T.isiframe && !P.hasmousecapture && (T.saved.csspointerevents = T.doc.css("pointer-events"), T.css(T.doc, { "pointer-events": "none" })), T.cancelEvent(e) } }, T.ontouchendCursor = function (e) { if (T.rail.drag) { if (P.hasmousecapture && l.releaseCapture(), T.isiframe && !P.hasmousecapture && T.doc.css("pointer-events", T.saved.csspointerevents), 3 != T.rail.drag.pt) return; return T.rail.drag = !1, T.cancelEvent(e) } }, T.ontouchmoveCursor = function (e) { if (T.rail.drag) { if (3 != T.rail.drag.pt) return; if (T.cursorfreezed = !0, T.rail.drag.hr) { T.scroll.x = T.rail.drag.sx + (e.touches[0].clientX - T.rail.drag.x), T.scroll.x < 0 && (T.scroll.x = 0); var o = T.scrollvaluemaxw; T.scroll.x > o && (T.scroll.x = o) } else { T.scroll.y = T.rail.drag.sy + (e.touches[0].clientY - T.rail.drag.y), T.scroll.y < 0 && (T.scroll.y = 0); var t = T.scrollvaluemax; T.scroll.y > t && (T.scroll.y = t) } return T.synched("touchmove", function () { T.rail.drag && 3 == T.rail.drag.pt && (T.showCursor(), T.rail.drag.hr ? T.doScrollLeft(Math.round(T.scroll.x * T.scrollratio.x), M.cursordragspeed) : T.doScrollTop(Math.round(T.scroll.y * T.scrollratio.y), M.cursordragspeed)) }), T.cancelEvent(e) } } } if (T.onmousedown = function (e, o) { if (!T.rail.drag || 1 == T.rail.drag.pt) { if (T.railslocked) return T.cancelEvent(e); T.cancelScroll(), T.rail.drag = { x: e.clientX, y: e.clientY, sx: T.scroll.x, sy: T.scroll.y, pt: 1, hr: o || !1 }; var t = T.getTarget(e); return P.hasmousecapture && t.setCapture(), T.isiframe && !P.hasmousecapture && (T.saved.csspointerevents = T.doc.css("pointer-events"), T.css(T.doc, { "pointer-events": "none" })), T.hasmoving = !1, T.cancelEvent(e) } }, T.onmouseup = function (e) { if (T.rail.drag) return 1 != T.rail.drag.pt || (P.hasmousecapture && l.releaseCapture(), T.isiframe && !P.hasmousecapture && T.doc.css("pointer-events", T.saved.csspointerevents), T.rail.drag = !1, T.cursorfreezed = !1, T.hasmoving && T.triggerScrollEnd(), T.cancelEvent(e)) }, T.onmousemove = function (e) { if (T.rail.drag) { if (1 !== T.rail.drag.pt) return; if (P.ischrome && 0 === e.which) return T.onmouseup(e); if (T.cursorfreezed = !0, T.hasmoving || T.triggerScrollStart(e.clientX, e.clientY, 0, 0, 0), T.hasmoving = !0, T.rail.drag.hr) { T.scroll.x = T.rail.drag.sx + (e.clientX - T.rail.drag.x), T.scroll.x < 0 && (T.scroll.x = 0); var o = T.scrollvaluemaxw; T.scroll.x > o && (T.scroll.x = o) } else { T.scroll.y = T.rail.drag.sy + (e.clientY - T.rail.drag.y), T.scroll.y < 0 && (T.scroll.y = 0); var t = T.scrollvaluemax; T.scroll.y > t && (T.scroll.y = t) } return T.synched("mousemove", function () { T.cursorfreezed && (T.showCursor(), T.rail.drag.hr ? T.scrollLeft(Math.round(T.scroll.x * T.scrollratio.x)) : T.scrollTop(Math.round(T.scroll.y * T.scrollratio.y))) }), T.cancelEvent(e) } T.checkarea = 0 }, P.cantouch || M.emulatetouch) T.onpreventclick = function (e) { if (T.preventclick) return T.preventclick.tg.onclick = T.preventclick.click, T.preventclick = !1, T.cancelEvent(e) }, T.onclick = !P.isios && function (e) { return !T.lastmouseup || (T.lastmouseup = !1, T.cancelEvent(e)) }, M.grabcursorenabled && P.cursorgrabvalue && (T.css(T.ispage ? T.doc : T.win, { cursor: P.cursorgrabvalue }), T.css(T.rail, { cursor: P.cursorgrabvalue })); else { var L = function (e) { if (T.selectiondrag) { if (e) { var o = T.win.outerHeight(), t = e.pageY - T.selectiondrag.top; t > 0 && t < o && (t = 0), t >= o && (t -= o), T.selectiondrag.df = t } if (0 !== T.selectiondrag.df) { var r = -2 * T.selectiondrag.df / 6 | 0; T.doScrollBy(r), T.debounced("doselectionscroll", function () { L() }, 50) } } }; T.hasTextSelected = "getSelection" in l ? function () { return l.getSelection().rangeCount > 0 } : "selection" in l ? function () { return "None" != l.selection.type } : function () { return !1 }, T.onselectionstart = function (e) { T.ispage || (T.selectiondrag = T.win.offset()) }, T.onselectionend = function (e) { T.selectiondrag = !1 }, T.onselectiondrag = function (e) { T.selectiondrag && T.hasTextSelected() && T.debounced("selectionscroll", function () { L(e) }, 250) } } if (P.hasw3ctouch ? (T.css(T.ispage ? n("html") : T.win, { "touch-action": "none" }), T.css(T.rail, { "touch-action": "none" }), T.css(T.cursor, { "touch-action": "none" }), T.bind(T.win, "pointerdown", T.ontouchstart), T.bind(l, "pointerup", T.ontouchend), T.delegate(l, "pointermove", T.ontouchmove)) : P.hasmstouch ? (T.css(T.ispage ? n("html") : T.win, { "-ms-touch-action": "none" }), T.css(T.rail, { "-ms-touch-action": "none" }), T.css(T.cursor, { "-ms-touch-action": "none" }), T.bind(T.win, "MSPointerDown", T.ontouchstart), T.bind(l, "MSPointerUp", T.ontouchend), T.delegate(l, "MSPointerMove", T.ontouchmove), T.bind(T.cursor, "MSGestureHold", function (e) { e.preventDefault() }), T.bind(T.cursor, "contextmenu", function (e) { e.preventDefault() })) : P.cantouch && (T.bind(T.win, "touchstart", T.ontouchstart, !1, !0), T.bind(l, "touchend", T.ontouchend, !1, !0), T.bind(l, "touchcancel", T.ontouchend, !1, !0), T.delegate(l, "touchmove", T.ontouchmove, !1, !0)), M.emulatetouch && (T.bind(T.win, "mousedown", T.ontouchstart, !1, !0), T.bind(l, "mouseup", T.ontouchend, !1, !0), T.bind(l, "mousemove", T.ontouchmove, !1, !0)), (M.cursordragontouch || !P.cantouch && !M.emulatetouch) && (T.rail.css({ cursor: "default" }), T.railh && T.railh.css({ cursor: "default" }), T.jqbind(T.rail, "mouseenter", function () { if (!T.ispage && !T.win.is(":visible")) return !1; T.canshowonmouseevent && T.showCursor(), T.rail.active = !0 }), T.jqbind(T.rail, "mouseleave", function () { T.rail.active = !1, T.rail.drag || T.hideCursor() }), M.sensitiverail && (T.bind(T.rail, "click", function (e) { T.doRailClick(e, !1, !1) }), T.bind(T.rail, "dblclick", function (e) { T.doRailClick(e, !0, !1) }), T.bind(T.cursor, "click", function (e) { T.cancelEvent(e) }), T.bind(T.cursor, "dblclick", function (e) { T.cancelEvent(e) })), T.railh && (T.jqbind(T.railh, "mouseenter", function () { if (!T.ispage && !T.win.is(":visible")) return !1; T.canshowonmouseevent && T.showCursor(), T.rail.active = !0 }), T.jqbind(T.railh, "mouseleave", function () { T.rail.active = !1, T.rail.drag || T.hideCursor() }), M.sensitiverail && (T.bind(T.railh, "click", function (e) { T.doRailClick(e, !1, !0) }), T.bind(T.railh, "dblclick", function (e) { T.doRailClick(e, !0, !0) }), T.bind(T.cursorh, "click", function (e) { T.cancelEvent(e) }), T.bind(T.cursorh, "dblclick", function (e) { T.cancelEvent(e) })))), M.cursordragontouch && (this.istouchcapable || P.cantouch) && (T.bind(T.cursor, "touchstart", T.ontouchstartCursor), T.bind(T.cursor, "touchmove", T.ontouchmoveCursor), T.bind(T.cursor, "touchend", T.ontouchendCursor), T.cursorh && T.bind(T.cursorh, "touchstart", function (e) { T.ontouchstartCursor(e, !0) }), T.cursorh && T.bind(T.cursorh, "touchmove", T.ontouchmoveCursor), T.cursorh && T.bind(T.cursorh, "touchend", T.ontouchendCursor)), M.emulatetouch || P.isandroid || P.isios ? (T.bind(P.hasmousecapture ? T.win : l, "mouseup", T.ontouchend), T.onclick && T.bind(l, "click", T.onclick), M.cursordragontouch ? (T.bind(T.cursor, "mousedown", T.onmousedown), T.bind(T.cursor, "mouseup", T.onmouseup), T.cursorh && T.bind(T.cursorh, "mousedown", function (e) { T.onmousedown(e, !0) }), T.cursorh && T.bind(T.cursorh, "mouseup", T.onmouseup)) : (T.bind(T.rail, "mousedown", function (e) { e.preventDefault() }), T.railh && T.bind(T.railh, "mousedown", function (e) { e.preventDefault() }))) : (T.bind(P.hasmousecapture ? T.win : l, "mouseup", T.onmouseup), T.bind(l, "mousemove", T.onmousemove), T.onclick && T.bind(l, "click", T.onclick), T.bind(T.cursor, "mousedown", T.onmousedown), T.bind(T.cursor, "mouseup", T.onmouseup), T.railh && (T.bind(T.cursorh, "mousedown", function (e) { T.onmousedown(e, !0) }), T.bind(T.cursorh, "mouseup", T.onmouseup)), !T.ispage && M.enablescrollonselection && (T.bind(T.win[0], "mousedown", T.onselectionstart), T.bind(l, "mouseup", T.onselectionend), T.bind(T.cursor, "mouseup", T.onselectionend), T.cursorh && T.bind(T.cursorh, "mouseup", T.onselectionend), T.bind(l, "mousemove", T.onselectiondrag)), T.zoom && (T.jqbind(T.zoom, "mouseenter", function () { T.canshowonmouseevent && T.showCursor(), T.rail.active = !0 }), T.jqbind(T.zoom, "mouseleave", function () { T.rail.active = !1, T.rail.drag || T.hideCursor() }))), M.enablemousewheel && (T.isiframe || T.mousewheel(P.isie && T.ispage ? l : T.win, T.onmousewheel), T.mousewheel(T.rail, T.onmousewheel), T.railh && T.mousewheel(T.railh, T.onmousewheelhr)), T.ispage || P.cantouch || /HTML|^BODY/.test(T.win[0].nodeName) || (T.win.attr("tabindex") || T.win.attr({ tabindex: ++r }), T.bind(T.win, "focus", function (e) { o = T.getTarget(e).id || T.getTarget(e) || !1, T.hasfocus = !0, T.canshowonmouseevent && T.noticeCursor() }), T.bind(T.win, "blur", function (e) { o = !1, T.hasfocus = !1 }), T.bind(T.win, "mouseenter", function (e) { t = T.getTarget(e).id || T.getTarget(e) || !1, T.hasmousefocus = !0, T.canshowonmouseevent && T.noticeCursor() }), T.bind(T.win, "mouseleave", function (e) { t = !1, T.hasmousefocus = !1, T.rail.drag || T.hideCursor() })), T.onkeypress = function (e) { if (T.railslocked && 0 === T.page.maxh) return !0; e = e || a.event; var r = T.getTarget(e); if (r && /INPUT|TEXTAREA|SELECT|OPTION/.test(r.nodeName) && (!(r.getAttribute("type") || r.type || !1) || !/submit|button|cancel/i.tp)) return !0; if (n(r).attr("contenteditable")) return !0; if (T.hasfocus || T.hasmousefocus && !o || T.ispage && !o && !t) { var i = e.keyCode; if (T.railslocked && 27 != i) return T.cancelEvent(e); var s = e.ctrlKey || !1, l = e.shiftKey || !1, c = !1; switch (i) { case 38: case 63233: T.doScrollBy(72), c = !0; break; case 40: case 63235: T.doScrollBy(-72), c = !0; break; case 37: case 63232: T.railh && (s ? T.doScrollLeft(0) : T.doScrollLeftBy(72), c = !0); break; case 39: case 63234: T.railh && (s ? T.doScrollLeft(T.page.maxw) : T.doScrollLeftBy(-72), c = !0); break; case 33: case 63276: T.doScrollBy(T.view.h), c = !0; break; case 34: case 63277: T.doScrollBy(-T.view.h), c = !0; break; case 36: case 63273: T.railh && s ? T.doScrollPos(0, 0) : T.doScrollTo(0), c = !0; break; case 35: case 63275: T.railh && s ? T.doScrollPos(T.page.maxw, T.page.maxh) : T.doScrollTo(T.page.maxh), c = !0; break; case 32: M.spacebarenabled && (l ? T.doScrollBy(T.view.h) : T.doScrollBy(-T.view.h), c = !0); break; case 27: T.zoomactive && (T.doZoom(), c = !0) }if (c) return T.cancelEvent(e) } }, M.enablekeyboard && T.bind(l, P.isopera && !P.isopera12 ? "keypress" : "keydown", T.onkeypress), T.bind(l, "keydown", function (e) { (e.ctrlKey || !1) && (T.wheelprevented = !0) }), T.bind(l, "keyup", function (e) { e.ctrlKey || !1 || (T.wheelprevented = !1) }), T.bind(a, "blur", function (e) { T.wheelprevented = !1 }), T.bind(a, "resize", T.onscreenresize), T.bind(a, "orientationchange", T.onscreenresize), T.bind(a, "load", T.lazyResize), P.ischrome && !T.ispage && !T.haswrapper) { var C = T.win.attr("style"), N = parseFloat(T.win.css("width")) + 1; T.win.css("width", N), T.synched("chromefix", function () { T.win.attr("style", C) }) } if (T.onAttributeChange = function (e) { T.lazyResize(T.isieold ? 250 : 30) }, M.enableobserver && (T.isie11 || !1 === m || (T.observerbody = new m(function (e) { if (e.forEach(function (e) { if ("attributes" == e.type) return E.hasClass("modal-open") && E.hasClass("modal-dialog") && !n.contains(n(".modal-dialog")[0], T.doc[0]) ? T.hide() : T.show() }), T.me.clientWidth != T.page.width || T.me.clientHeight != T.page.height) return T.lazyResize(30) }), T.observerbody.observe(l.body, { childList: !0, subtree: !0, characterData: !1, attributes: !0, attributeFilter: ["class"] })), !T.ispage && !T.haswrapper)) { var R = T.win[0]; !1 !== m ? (T.observer = new m(function (e) { e.forEach(T.onAttributeChange) }), T.observer.observe(R, { childList: !0, characterData: !1, attributes: !0, subtree: !1 }), T.observerremover = new m(function (e) { e.forEach(function (e) { if (e.removedNodes.length > 0) for (var o in e.removedNodes) if (T && e.removedNodes[o] === R) return T.remove() }) }), T.observerremover.observe(R.parentNode, { childList: !0, characterData: !1, attributes: !1, subtree: !1 })) : (T.bind(R, P.isie && !P.isie9 ? "propertychange" : "DOMAttrModified", T.onAttributeChange), P.isie9 && R.attachEvent("onpropertychange", T.onAttributeChange), T.bind(R, "DOMNodeRemoved", function (e) { e.target === R && T.remove() })) } !T.ispage && M.boxzoom && T.bind(a, "resize", T.resizeZoom), T.istextarea && (T.bind(T.win, "keydown", T.lazyResize), T.bind(T.win, "mouseup", T.lazyResize)), T.lazyResize(30) } if ("IFRAME" == this.doc[0].nodeName) { var _ = function () { T.iframexd = !1; var o; try { (o = "contentDocument" in this ? this.contentDocument : this.contentWindow._doc).domain } catch (e) { T.iframexd = !0, o = !1 } if (T.iframexd) return "console" in a && console.log("NiceScroll error: policy restriced iframe"), !0; if (T.forcescreen = !0, T.isiframe && (T.iframe = { doc: n(o), html: T.doc.contents().find("html")[0], body: T.doc.contents().find("body")[0] }, T.getContentSize = function () { return { w: Math.max(T.iframe.html.scrollWidth, T.iframe.body.scrollWidth), h: Math.max(T.iframe.html.scrollHeight, T.iframe.body.scrollHeight) } }, T.docscroll = n(T.iframe.body)), !P.isios && M.iframeautoresize && !T.isiframe) { T.win.scrollTop(0), T.doc.height(""); var t = Math.max(o.getElementsByTagName("html")[0].scrollHeight, o.body.scrollHeight); T.doc.height(t) } T.lazyResize(30), T.css(n(T.iframe.body), e), P.isios && T.haswrapper && T.css(n(o.body), { "-webkit-transform": "translate3d(0,0,0)" }), "contentWindow" in this ? T.bind(this.contentWindow, "scroll", T.onscroll) : T.bind(o, "scroll", T.onscroll), M.enablemousewheel && T.mousewheel(o, T.onmousewheel), M.enablekeyboard && T.bind(o, P.isopera ? "keypress" : "keydown", T.onkeypress), P.cantouch ? (T.bind(o, "touchstart", T.ontouchstart), T.bind(o, "touchmove", T.ontouchmove)) : M.emulatetouch && (T.bind(o, "mousedown", T.ontouchstart), T.bind(o, "mousemove", function (e) { return T.ontouchmove(e, !0) }), M.grabcursorenabled && P.cursorgrabvalue && T.css(n(o.body), { cursor: P.cursorgrabvalue })), T.bind(o, "mouseup", T.ontouchend), T.zoom && (M.dblclickzoom && T.bind(o, "dblclick", T.doZoom), T.ongesturezoom && T.bind(o, "gestureend", T.ongesturezoom)) }; this.doc[0].readyState && "complete" === this.doc[0].readyState && setTimeout(function () { _.call(T.doc[0], !1) }, 500), T.bind(this.doc, "load", _) } }, this.showCursor = function (e, o) { if (T.cursortimeout && (clearTimeout(T.cursortimeout), T.cursortimeout = 0), T.rail) { if (T.autohidedom && (T.autohidedom.stop().css({ opacity: M.cursoropacitymax }), T.cursoractive = !0), T.rail.drag && 1 == T.rail.drag.pt || (void 0 !== e && !1 !== e && (T.scroll.y = e / T.scrollratio.y | 0), void 0 !== o && (T.scroll.x = o / T.scrollratio.x | 0)), T.cursor.css({ height: T.cursorheight, top: T.scroll.y }), T.cursorh) { var t = T.hasreversehr ? T.scrollvaluemaxw - T.scroll.x : T.scroll.x; T.cursorh.css({ width: T.cursorwidth, left: !T.rail.align && T.rail.visibility ? t + T.rail.width : t }), T.cursoractive = !0 } T.zoom && T.zoom.stop().css({ opacity: M.cursoropacitymax }) } }, this.hideCursor = function (e) { T.cursortimeout || T.rail && T.autohidedom && (T.hasmousefocus && "leave" === M.autohidemode || (T.cursortimeout = setTimeout(function () { T.rail.active && T.showonmouseevent || (T.autohidedom.stop().animate({ opacity: M.cursoropacitymin }), T.zoom && T.zoom.stop().animate({ opacity: M.cursoropacitymin }), T.cursoractive = !1), T.cursortimeout = 0 }, e || M.hidecursordelay))) }, this.noticeCursor = function (e, o, t) { T.showCursor(o, t), T.rail.active || T.hideCursor(e) }, this.getContentSize = T.ispage ? function () { return { w: Math.max(l.body.scrollWidth, l.documentElement.scrollWidth), h: Math.max(l.body.scrollHeight, l.documentElement.scrollHeight) } } : T.haswrapper ? function () { return { w: T.doc[0].offsetWidth, h: T.doc[0].offsetHeight } } : function () { return { w: T.docscroll[0].scrollWidth, h: T.docscroll[0].scrollHeight } }, this.onResize = function (e, o) { if (!T || !T.win) return !1; var t = T.page.maxh, r = T.page.maxw, i = T.view.h, s = T.view.w; if (T.view = { w: T.ispage ? T.win.width() : T.win[0].clientWidth, h: T.ispage ? T.win.height() : T.win[0].clientHeight }, T.page = o || T.getContentSize(), T.page.maxh = Math.max(0, T.page.h - T.view.h), T.page.maxw = Math.max(0, T.page.w - T.view.w), T.page.maxh == t && T.page.maxw == r && T.view.w == s && T.view.h == i) { if (T.ispage) return T; var n = T.win.offset(); if (T.lastposition) { var l = T.lastposition; if (l.top == n.top && l.left == n.left) return T } T.lastposition = n } return 0 === T.page.maxh ? (T.hideRail(), T.scrollvaluemax = 0, T.scroll.y = 0, T.scrollratio.y = 0, T.cursorheight = 0, T.setScrollTop(0), T.rail && (T.rail.scrollable = !1)) : (T.page.maxh -= M.railpadding.top + M.railpadding.bottom, T.rail.scrollable = !0), 0 === T.page.maxw ? (T.hideRailHr(), T.scrollvaluemaxw = 0, T.scroll.x = 0, T.scrollratio.x = 0, T.cursorwidth = 0, T.setScrollLeft(0), T.railh && (T.railh.scrollable = !1)) : (T.page.maxw -= M.railpadding.left + M.railpadding.right, T.railh && (T.railh.scrollable = M.horizrailenabled)), T.railslocked = T.locked || 0 === T.page.maxh && 0 === T.page.maxw, T.railslocked ? (T.ispage || T.updateScrollBar(T.view), !1) : (T.hidden || (T.rail.visibility || T.showRail(), T.railh && !T.railh.visibility && T.showRailHr()), T.istextarea && T.win.css("resize") && "none" != T.win.css("resize") && (T.view.h -= 20), T.cursorheight = Math.min(T.view.h, Math.round(T.view.h * (T.view.h / T.page.h))), T.cursorheight = M.cursorfixedheight ? M.cursorfixedheight : Math.max(M.cursorminheight, T.cursorheight), T.cursorwidth = Math.min(T.view.w, Math.round(T.view.w * (T.view.w / T.page.w))), T.cursorwidth = M.cursorfixedheight ? M.cursorfixedheight : Math.max(M.cursorminheight, T.cursorwidth), T.scrollvaluemax = T.view.h - T.cursorheight - (M.railpadding.top + M.railpadding.bottom), T.hasborderbox || (T.scrollvaluemax -= T.cursor[0].offsetHeight - T.cursor[0].clientHeight), T.railh && (T.railh.width = T.page.maxh > 0 ? T.view.w - T.rail.width : T.view.w, T.scrollvaluemaxw = T.railh.width - T.cursorwidth - (M.railpadding.left + M.railpadding.right)), T.ispage || T.updateScrollBar(T.view), T.scrollratio = { x: T.page.maxw / T.scrollvaluemaxw, y: T.page.maxh / T.scrollvaluemax }, T.getScrollTop() > T.page.maxh ? T.doScrollTop(T.page.maxh) : (T.scroll.y = T.getScrollTop() / T.scrollratio.y | 0, T.scroll.x = T.getScrollLeft() / T.scrollratio.x | 0, T.cursoractive && T.noticeCursor()), T.scroll.y && 0 === T.getScrollTop() && T.doScrollTo(T.scroll.y * T.scrollratio.y | 0), T) }, this.resize = T.onResize; var O = 0; this.onscreenresize = function (e) { clearTimeout(O); var o = !T.ispage && !T.haswrapper; o && T.hideRails(), O = setTimeout(function () { T && (o && T.showRails(), T.resize()), O = 0 }, 120) }, this.lazyResize = function (e) { return clearTimeout(O), e = isNaN(e) ? 240 : e, O = setTimeout(function () { T && T.resize(), O = 0 }, e), T }, this.jqbind = function (e, o, t) { T.events.push({ e: e, n: o, f: t, q: !0 }), n(e).on(o, t) }, this.mousewheel = function (e, o, t) { var r = "jquery" in e ? e[0] : e; if ("onwheel" in l.createElement("div")) T._bind(r, "wheel", o, t || !1); else { var i = void 0 !== l.onmousewheel ? "mousewheel" : "DOMMouseScroll"; S(r, i, o, t || !1), "DOMMouseScroll" == i && S(r, "MozMousePixelScroll", o, t || !1) } }; var Y = !1; if (P.haseventlistener) { try { var H = Object.defineProperty({}, "passive", { get: function () { Y = !0 } }); a.addEventListener("test", null, H) } catch (e) { } this.stopPropagation = function (e) { return !!e && ((e = e.original ? e.original : e).stopPropagation(), !1) }, this.cancelEvent = function (e) { return e.cancelable && e.preventDefault(), e.stopImmediatePropagation(), e.preventManipulation && e.preventManipulation(), !1 } } else Event.prototype.preventDefault = function () { this.returnValue = !1 }, Event.prototype.stopPropagation = function () { this.cancelBubble = !0 }, a.constructor.prototype.addEventListener = l.constructor.prototype.addEventListener = Element.prototype.addEventListener = function (e, o, t) { this.attachEvent("on" + e, o) }, a.constructor.prototype.removeEventListener = l.constructor.prototype.removeEventListener = Element.prototype.removeEventListener = function (e, o, t) { this.detachEvent("on" + e, o) }, this.cancelEvent = function (e) { return (e = e || a.event) && (e.cancelBubble = !0, e.cancel = !0, e.returnValue = !1), !1 }, this.stopPropagation = function (e) { return (e = e || a.event) && (e.cancelBubble = !0), !1 }; this.delegate = function (e, o, t, r, i) { var s = d[o] || !1; s || (s = { a: [], l: [], f: function (e) { for (var o = s.l, t = !1, r = o.length - 1; r >= 0; r--)if (!1 === (t = o[r].call(e.target, e))) return !1; return t } }, T.bind(e, o, s.f, r, i), d[o] = s), T.ispage ? (s.a = [T.id].concat(s.a), s.l = [t].concat(s.l)) : (s.a.push(T.id), s.l.push(t)) }, this.undelegate = function (e, o, t, r, i) { var s = d[o] || !1; if (s && s.l) for (var n = 0, l = s.l.length; n < l; n++)s.a[n] === T.id && (s.a.splice(n), s.l.splice(n), 0 === s.a.length && (T._unbind(e, o, s.l.f), d[o] = null)) }, this.bind = function (e, o, t, r, i) { var s = "jquery" in e ? e[0] : e; T._bind(s, o, t, r || !1, i || !1) }, this._bind = function (e, o, t, r, i) { T.events.push({ e: e, n: o, f: t, b: r, q: !1 }), Y && i ? e.addEventListener(o, t, { passive: !1, capture: r }) : e.addEventListener(o, t, r || !1) }, this._unbind = function (e, o, t, r) { d[o] ? T.undelegate(e, o, t, r) : e.removeEventListener(o, t, r) }, this.unbindAll = function () { for (var e = 0; e < T.events.length; e++) { var o = T.events[e]; o.q ? o.e.unbind(o.n, o.f) : T._unbind(o.e, o.n, o.f, o.b) } }, this.showRails = function () { return T.showRail().showRailHr() }, this.showRail = function () { return 0 === T.page.maxh || !T.ispage && "none" == T.win.css("display") || (T.rail.visibility = !0, T.rail.css("display", "block")), T }, this.showRailHr = function () { return T.railh && (0 === T.page.maxw || !T.ispage && "none" == T.win.css("display") || (T.railh.visibility = !0, T.railh.css("display", "block"))), T }, this.hideRails = function () { return T.hideRail().hideRailHr() }, this.hideRail = function () { return T.rail.visibility = !1, T.rail.css("display", "none"), T }, this.hideRailHr = function () { return T.railh && (T.railh.visibility = !1, T.railh.css("display", "none")), T }, this.show = function () { return T.hidden = !1, T.railslocked = !1, T.showRails() }, this.hide = function () { return T.hidden = !0, T.railslocked = !0, T.hideRails() }, this.toggle = function () { return T.hidden ? T.show() : T.hide() }, this.remove = function () { T.stop(), T.cursortimeout && clearTimeout(T.cursortimeout); for (var e in T.delaylist) T.delaylist[e] && h(T.delaylist[e].h); T.doZoomOut(), T.unbindAll(), P.isie9 && T.win[0].detachEvent("onpropertychange", T.onAttributeChange), !1 !== T.observer && T.observer.disconnect(), !1 !== T.observerremover && T.observerremover.disconnect(), !1 !== T.observerbody && T.observerbody.disconnect(), T.events = null, T.cursor && T.cursor.remove(), T.cursorh && T.cursorh.remove(), T.rail && T.rail.remove(), T.railh && T.railh.remove(), T.zoom && T.zoom.remove(); for (var o = 0; o < T.saved.css.length; o++) { var t = T.saved.css[o]; t[0].css(t[1], void 0 === t[2] ? "" : t[2]) } T.saved = !1, T.me.data("__nicescroll", ""); var r = n.nicescroll; r.each(function (e) { if (this && this.id === T.id) { delete r[e]; for (var o = ++e; o < r.length; o++ , e++)r[e] = r[o]; --r.length && delete r[r.length] } }); for (var i in T) T[i] = null, delete T[i]; T = null }, this.scrollstart = function (e) { return this.onscrollstart = e, T }, this.scrollend = function (e) { return this.onscrollend = e, T }, this.scrollcancel = function (e) { return this.onscrollcancel = e, T }, this.zoomin = function (e) { return this.onzoomin = e, T }, this.zoomout = function (e) { return this.onzoomout = e, T }, this.isScrollable = function (e) { var o = e.target ? e.target : e; if ("OPTION" == o.nodeName) return !0; for (; o && 1 == o.nodeType && o !== this.me[0] && !/^BODY|HTML/.test(o.nodeName);) { var t = n(o), r = t.css("overflowY") || t.css("overflowX") || t.css("overflow") || ""; if (/scroll|auto/.test(r)) return o.clientHeight != o.scrollHeight; o = !!o.parentNode && o.parentNode } return !1 }, this.getViewport = function (e) { for (var o = !(!e || !e.parentNode) && e.parentNode; o && 1 == o.nodeType && !/^BODY|HTML/.test(o.nodeName);) { var t = n(o); if (/fixed|absolute/.test(t.css("position"))) return t; var r = t.css("overflowY") || t.css("overflowX") || t.css("overflow") || ""; if (/scroll|auto/.test(r) && o.clientHeight != o.scrollHeight) return t; if (t.getNiceScroll().length > 0) return t; o = !!o.parentNode && o.parentNode } return !1 }, this.triggerScrollStart = function (e, o, t, r, i) { if (T.onscrollstart) { var s = { type: "scrollstart", current: { x: e, y: o }, request: { x: t, y: r }, end: { x: T.newscrollx, y: T.newscrolly }, speed: i }; T.onscrollstart.call(T, s) } }, this.triggerScrollEnd = function () { if (T.onscrollend) { var e = T.getScrollLeft(), o = T.getScrollTop(), t = { type: "scrollend", current: { x: e, y: o }, end: { x: e, y: o } }; T.onscrollend.call(T, t) } }; var B = 0, X = 0, D = 0, A = 1, q = !1; if (this.onmousewheel = function (e) { if (T.wheelprevented || T.locked) return !1; if (T.railslocked) return T.debounced("checkunlock", T.resize, 250), !1; if (T.rail.drag) return T.cancelEvent(e); if ("auto" === M.oneaxismousemode && 0 !== e.deltaX && (M.oneaxismousemode = !1), M.oneaxismousemode && 0 === e.deltaX && !T.rail.scrollable) return !T.railh || !T.railh.scrollable || T.onmousewheelhr(e); var o = f(), t = !1; if (M.preservenativescrolling && T.checkarea + 600 < o && (T.nativescrollingarea = T.isScrollable(e), t = !0), T.checkarea = o, T.nativescrollingarea) return !0; var r = k(e, !1, t); return r && (T.checkarea = 0), r }, this.onmousewheelhr = function (e) { if (!T.wheelprevented) { if (T.railslocked || !T.railh.scrollable) return !0; if (T.rail.drag) return T.cancelEvent(e); var o = f(), t = !1; return M.preservenativescrolling && T.checkarea + 600 < o && (T.nativescrollingarea = T.isScrollable(e), t = !0), T.checkarea = o, !!T.nativescrollingarea || (T.railslocked ? T.cancelEvent(e) : k(e, !0, t)) } }, this.stop = function () { return T.cancelScroll(), T.scrollmon && T.scrollmon.stop(), T.cursorfreezed = !1, T.scroll.y = Math.round(T.getScrollTop() * (1 / T.scrollratio.y)), T.noticeCursor(), T }, this.getTransitionSpeed = function (e) { return 80 + e / 72 * M.scrollspeed | 0 }, M.smoothscroll) if (T.ishwscroll && P.hastransition && M.usetransition && M.smoothscroll) { var j = ""; this.resetTransition = function () { j = "", T.doc.css(P.prefixstyle + "transition-duration", "0ms") }, this.prepareTransition = function (e, o) { var t = o ? e : T.getTransitionSpeed(e), r = t + "ms"; return j !== r && (j = r, T.doc.css(P.prefixstyle + "transition-duration", r)), t }, this.doScrollLeft = function (e, o) { var t = T.scrollrunning ? T.newscrolly : T.getScrollTop(); T.doScrollPos(e, t, o) }, this.doScrollTop = function (e, o) { var t = T.scrollrunning ? T.newscrollx : T.getScrollLeft(); T.doScrollPos(t, e, o) }, this.cursorupdate = { running: !1, start: function () { var e = this; if (!e.running) { e.running = !0; var o = function () { e.running && u(o), T.showCursor(T.getScrollTop(), T.getScrollLeft()), T.notifyScrollEvent(T.win[0]) }; u(o) } }, stop: function () { this.running = !1 } }, this.doScrollPos = function (e, o, t) { var r = T.getScrollTop(), i = T.getScrollLeft(); if (((T.newscrolly - r) * (o - r) < 0 || (T.newscrollx - i) * (e - i) < 0) && T.cancelScroll(), M.bouncescroll ? (o < 0 ? o = o / 2 | 0 : o > T.page.maxh && (o = T.page.maxh + (o - T.page.maxh) / 2 | 0), e < 0 ? e = e / 2 | 0 : e > T.page.maxw && (e = T.page.maxw + (e - T.page.maxw) / 2 | 0)) : (o < 0 ? o = 0 : o > T.page.maxh && (o = T.page.maxh), e < 0 ? e = 0 : e > T.page.maxw && (e = T.page.maxw)), T.scrollrunning && e == T.newscrollx && o == T.newscrolly) return !1; T.newscrolly = o, T.newscrollx = e; var s = T.getScrollTop(), n = T.getScrollLeft(), l = {}; l.x = e - n, l.y = o - s; var a = 0 | Math.sqrt(l.x * l.x + l.y * l.y), c = T.prepareTransition(a); T.scrollrunning || (T.scrollrunning = !0, T.triggerScrollStart(n, s, e, o, c), T.cursorupdate.start()), T.scrollendtrapped = !0, P.transitionend || (T.scrollendtrapped && clearTimeout(T.scrollendtrapped), T.scrollendtrapped = setTimeout(T.onScrollTransitionEnd, c)), T.setScrollTop(T.newscrolly), T.setScrollLeft(T.newscrollx) }, this.cancelScroll = function () { if (!T.scrollendtrapped) return !0; var e = T.getScrollTop(), o = T.getScrollLeft(); return T.scrollrunning = !1, P.transitionend || clearTimeout(P.transitionend), T.scrollendtrapped = !1, T.resetTransition(), T.setScrollTop(e), T.railh && T.setScrollLeft(o), T.timerscroll && T.timerscroll.tm && clearInterval(T.timerscroll.tm), T.timerscroll = !1, T.cursorfreezed = !1, T.cursorupdate.stop(), T.showCursor(e, o), T }, this.onScrollTransitionEnd = function () { if (T.scrollendtrapped) { var e = T.getScrollTop(), o = T.getScrollLeft(); if (e < 0 ? e = 0 : e > T.page.maxh && (e = T.page.maxh), o < 0 ? o = 0 : o > T.page.maxw && (o = T.page.maxw), e != T.newscrolly || o != T.newscrollx) return T.doScrollPos(o, e, M.snapbackspeed); T.scrollrunning && T.triggerScrollEnd(), T.scrollrunning = !1, T.scrollendtrapped = !1, T.resetTransition(), T.timerscroll = !1, T.setScrollTop(e), T.railh && T.setScrollLeft(o), T.cursorupdate.stop(), T.noticeCursor(!1, e, o), T.cursorfreezed = !1 } } } else this.doScrollLeft = function (e, o) { var t = T.scrollrunning ? T.newscrolly : T.getScrollTop(); T.doScrollPos(e, t, o) }, this.doScrollTop = function (e, o) { var t = T.scrollrunning ? T.newscrollx : T.getScrollLeft(); T.doScrollPos(t, e, o) }, this.doScrollPos = function (e, o, t) { var r = T.getScrollTop(), i = T.getScrollLeft(); ((T.newscrolly - r) * (o - r) < 0 || (T.newscrollx - i) * (e - i) < 0) && T.cancelScroll(); var s = !1; if (T.bouncescroll && T.rail.visibility || (o < 0 ? (o = 0, s = !0) : o > T.page.maxh && (o = T.page.maxh, s = !0)), T.bouncescroll && T.railh.visibility || (e < 0 ? (e = 0, s = !0) : e > T.page.maxw && (e = T.page.maxw, s = !0)), T.scrollrunning && T.newscrolly === o && T.newscrollx === e) return !0; T.newscrolly = o, T.newscrollx = e, T.dst = {}, T.dst.x = e - i, T.dst.y = o - r, T.dst.px = i, T.dst.py = r; var n = 0 | Math.sqrt(T.dst.x * T.dst.x + T.dst.y * T.dst.y), l = T.getTransitionSpeed(n); T.bzscroll = {}; var a = s ? 1 : .58; T.bzscroll.x = new R(i, T.newscrollx, l, 0, 0, a, 1), T.bzscroll.y = new R(r, T.newscrolly, l, 0, 0, a, 1); f(); var c = function () { if (T.scrollrunning) { var e = T.bzscroll.y.getPos(); T.setScrollLeft(T.bzscroll.x.getNow()), T.setScrollTop(T.bzscroll.y.getNow()), e <= 1 ? T.timer = u(c) : (T.scrollrunning = !1, T.timer = 0, T.triggerScrollEnd()) } }; T.scrollrunning || (T.triggerScrollStart(i, r, e, o, l), T.scrollrunning = !0, T.timer = u(c)) }, this.cancelScroll = function () { return T.timer && h(T.timer), T.timer = 0, T.bzscroll = !1, T.scrollrunning = !1, T }; else this.doScrollLeft = function (e, o) { var t = T.getScrollTop(); T.doScrollPos(e, t, o) }, this.doScrollTop = function (e, o) { var t = T.getScrollLeft(); T.doScrollPos(t, e, o) }, this.doScrollPos = function (e, o, t) { var r = e > T.page.maxw ? T.page.maxw : e; r < 0 && (r = 0); var i = o > T.page.maxh ? T.page.maxh : o; i < 0 && (i = 0), T.synched("scroll", function () { T.setScrollTop(i), T.setScrollLeft(r) }) }, this.cancelScroll = function () { }; this.doScrollBy = function (e, o) { z(0, e) }, this.doScrollLeftBy = function (e, o) { z(e, 0) }, this.doScrollTo = function (e, o) { var t = o ? Math.round(e * T.scrollratio.y) : e; t < 0 ? t = 0 : t > T.page.maxh && (t = T.page.maxh), T.cursorfreezed = !1, T.doScrollTop(e) }, this.checkContentSize = function () { var e = T.getContentSize(); e.h == T.page.h && e.w == T.page.w || T.resize(!1, e) }, T.onscroll = function (e) { T.rail.drag || T.cursorfreezed || T.synched("scroll", function () { T.scroll.y = Math.round(T.getScrollTop() / T.scrollratio.y), T.railh && (T.scroll.x = Math.round(T.getScrollLeft() / T.scrollratio.x)), T.noticeCursor() }) }, T.bind(T.docscroll, "scroll", T.onscroll), this.doZoomIn = function (e) { if (!T.zoomactive) { T.zoomactive = !0, T.zoomrestore = { style: {} }; var o = ["position", "top", "left", "zIndex", "backgroundColor", "marginTop", "marginBottom", "marginLeft", "marginRight"], t = T.win[0].style; for (var r in o) { var i = o[r]; T.zoomrestore.style[i] = void 0 !== t[i] ? t[i] : "" } T.zoomrestore.style.width = T.win.css("width"), T.zoomrestore.style.height = T.win.css("height"), T.zoomrestore.padding = { w: T.win.outerWidth() - T.win.width(), h: T.win.outerHeight() - T.win.height() }, P.isios4 && (T.zoomrestore.scrollTop = c.scrollTop(), c.scrollTop(0)), T.win.css({ position: P.isios4 ? "absolute" : "fixed", top: 0, left: 0, zIndex: s + 100, margin: 0 }); var n = T.win.css("backgroundColor"); return ("" === n || /transparent|rgba\(0, 0, 0, 0\)|rgba\(0,0,0,0\)/.test(n)) && T.win.css("backgroundColor", "#fff"), T.rail.css({ zIndex: s + 101 }), T.zoom.css({ zIndex: s + 102 }), T.zoom.css("backgroundPosition", "0 -18px"), T.resizeZoom(), T.onzoomin && T.onzoomin.call(T), T.cancelEvent(e) } }, this.doZoomOut = function (e) { if (T.zoomactive) return T.zoomactive = !1, T.win.css("margin", ""), T.win.css(T.zoomrestore.style), P.isios4 && c.scrollTop(T.zoomrestore.scrollTop), T.rail.css({ "z-index": T.zindex }), T.zoom.css({ "z-index": T.zindex }), T.zoomrestore = !1, T.zoom.css("backgroundPosition", "0 0"), T.onResize(), T.onzoomout && T.onzoomout.call(T), T.cancelEvent(e) }, this.doZoom = function (e) { return T.zoomactive ? T.doZoomOut(e) : T.doZoomIn(e) }, this.resizeZoom = function () { if (T.zoomactive) { var e = T.getScrollTop(); T.win.css({ width: c.width() - T.zoomrestore.padding.w + "px", height: c.height() - T.zoomrestore.padding.h + "px" }), T.onResize(), T.setScrollTop(Math.min(T.page.maxh, e)) } }, this.init(), n.nicescroll.push(this) }, y = function (e) { var o = this; this.nc = e, this.lastx = 0, this.lasty = 0, this.speedx = 0, this.speedy = 0, this.lasttime = 0, this.steptime = 0, this.snapx = !1, this.snapy = !1, this.demulx = 0, this.demuly = 0, this.lastscrollx = -1, this.lastscrolly = -1, this.chkx = 0, this.chky = 0, this.timer = 0, this.reset = function (e, t) { o.stop(), o.steptime = 0, o.lasttime = f(), o.speedx = 0, o.speedy = 0, o.lastx = e, o.lasty = t, o.lastscrollx = -1, o.lastscrolly = -1 }, this.update = function (e, t) { var r = f(); o.steptime = r - o.lasttime, o.lasttime = r; var i = t - o.lasty, s = e - o.lastx, n = o.nc.getScrollTop() + i, l = o.nc.getScrollLeft() + s; o.snapx = l < 0 || l > o.nc.page.maxw, o.snapy = n < 0 || n > o.nc.page.maxh, o.speedx = s, o.speedy = i, o.lastx = e, o.lasty = t }, this.stop = function () { o.nc.unsynched("domomentum2d"), o.timer && clearTimeout(o.timer), o.timer = 0, o.lastscrollx = -1, o.lastscrolly = -1 }, this.doSnapy = function (e, t) { var r = !1; t < 0 ? (t = 0, r = !0) : t > o.nc.page.maxh && (t = o.nc.page.maxh, r = !0), e < 0 ? (e = 0, r = !0) : e > o.nc.page.maxw && (e = o.nc.page.maxw, r = !0), r ? o.nc.doScrollPos(e, t, o.nc.opt.snapbackspeed) : o.nc.triggerScrollEnd() }, this.doMomentum = function (e) { var t = f(), r = e ? t + e : o.lasttime, i = o.nc.getScrollLeft(), s = o.nc.getScrollTop(), n = o.nc.page.maxh, l = o.nc.page.maxw; o.speedx = l > 0 ? Math.min(60, o.speedx) : 0, o.speedy = n > 0 ? Math.min(60, o.speedy) : 0; var a = r && t - r <= 60; (s < 0 || s > n || i < 0 || i > l) && (a = !1); var c = !(!o.speedy || !a) && o.speedy, d = !(!o.speedx || !a) && o.speedx; if (c || d) { var u = Math.max(16, o.steptime); if (u > 50) { var h = u / 50; o.speedx *= h, o.speedy *= h, u = 50 } o.demulxy = 0, o.lastscrollx = o.nc.getScrollLeft(), o.chkx = o.lastscrollx, o.lastscrolly = o.nc.getScrollTop(), o.chky = o.lastscrolly; var p = o.lastscrollx, m = o.lastscrolly, g = function () { var e = f() - t > 600 ? .04 : .02; o.speedx && (p = Math.floor(o.lastscrollx - o.speedx * (1 - o.demulxy)), o.lastscrollx = p, (p < 0 || p > l) && (e = .1)), o.speedy && (m = Math.floor(o.lastscrolly - o.speedy * (1 - o.demulxy)), o.lastscrolly = m, (m < 0 || m > n) && (e = .1)), o.demulxy = Math.min(1, o.demulxy + e), o.nc.synched("domomentum2d", function () { if (o.speedx) { o.nc.getScrollLeft(); o.chkx = p, o.nc.setScrollLeft(p) } if (o.speedy) { o.nc.getScrollTop(); o.chky = m, o.nc.setScrollTop(m) } o.timer || (o.nc.hideCursor(), o.doSnapy(p, m)) }), o.demulxy < 1 ? o.timer = setTimeout(g, u) : (o.stop(), o.nc.hideCursor(), o.doSnapy(p, m)) }; g() } else o.doSnapy(o.nc.getScrollLeft(), o.nc.getScrollTop()) } }, x = e.fn.scrollTop; e.cssHooks.pageYOffset = { get: function (e, o, t) { var r = n.data(e, "__nicescroll") || !1; return r && r.ishwscroll ? r.getScrollTop() : x.call(e) }, set: function (e, o) { var t = n.data(e, "__nicescroll") || !1; return t && t.ishwscroll ? t.setScrollTop(parseInt(o)) : x.call(e, o), this } }, e.fn.scrollTop = function (e) { if (void 0 === e) { var o = !!this[0] && (n.data(this[0], "__nicescroll") || !1); return o && o.ishwscroll ? o.getScrollTop() : x.call(this) } return this.each(function () { var o = n.data(this, "__nicescroll") || !1; o && o.ishwscroll ? o.setScrollTop(parseInt(e)) : x.call(n(this), e) }) }; var S = e.fn.scrollLeft; n.cssHooks.pageXOffset = { get: function (e, o, t) { var r = n.data(e, "__nicescroll") || !1; return r && r.ishwscroll ? r.getScrollLeft() : S.call(e) }, set: function (e, o) { var t = n.data(e, "__nicescroll") || !1; return t && t.ishwscroll ? t.setScrollLeft(parseInt(o)) : S.call(e, o), this } }, e.fn.scrollLeft = function (e) { if (void 0 === e) { var o = !!this[0] && (n.data(this[0], "__nicescroll") || !1); return o && o.ishwscroll ? o.getScrollLeft() : S.call(this) } return this.each(function () { var o = n.data(this, "__nicescroll") || !1; o && o.ishwscroll ? o.setScrollLeft(parseInt(e)) : S.call(n(this), e) }) }; var z = function (e) { var o = this; if (this.length = 0, this.name = "nicescrollarray", this.each = function (e) { return n.each(o, e), o }, this.push = function (e) { o[o.length] = e, o.length++ }, this.eq = function (e) { return o[e] }, e) for (var t = 0; t < e.length; t++) { var r = n.data(e[t], "__nicescroll") || !1; r && (this[this.length] = r, this.length++) } return this }; !function (e, o, t) { for (var r = 0, i = o.length; r < i; r++)t(e, o[r]) }(z.prototype, ["show", "hide", "toggle", "onResize", "resize", "remove", "stop", "doScrollPos"], function (e, o) { e[o] = function () { var e = arguments; return this.each(function () { this[o].apply(this, e) }) } }), e.fn.getNiceScroll = function (e) { return void 0 === e ? new z(this) : this[e] && n.data(this[e], "__nicescroll") || !1 }, (e.expr.pseudos || e.expr[":"]).nicescroll = function (e) { return void 0 !== n.data(e, "__nicescroll") }, n.fn.niceScroll = function (e, o) { void 0 !== o || "object" != typeof e || "jquery" in e || (o = e, e = !1); var t = new z; return this.each(function () { var r = n(this), i = n.extend({}, o); if (e) { var s = n(e); i.doc = s.length > 1 ? n(e, r) : s, i.win = r } !("doc" in i) || "win" in i || (i.win = r); var l = r.data("__nicescroll") || !1; l || (i.doc = i.doc || r, l = new b(i, r), r.data("__nicescroll", l)), t.push(l) }), 1 === t.length ? t[0] : t }, a.NiceScroll = { getjQuery: function () { return e } }, n.nicescroll || (n.nicescroll = new z, n.nicescroll.options = g) });