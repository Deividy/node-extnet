

/* Handle multitouch devices */

xn.TouchHandlers = (function () {
	var fireSimulatedEvent = function (type, touch) {
		var simulatedEvent = document.createEvent('MouseEvents');
		simulatedEvent.initMouseEvent(type, true, true, window, 1, touch.screen[0], touch.screen[1], touch.client[0], touch.client[1], false, false, false, false, 0, null);
		touch.target.dispatchEvent(simulatedEvent);
	};

	var log = typeof Ext.logf == 'function' ? Ext.logf : ('console' in window) ? function () { console.log(String.format.apply(String, arguments)); } : Ext.emptyFn;

	return {

		currentEvt: null,
		prevEvt: null,

		extEvent: null,

		startTouches: null,
		currentTouches: null,

		simulatedEvents: [],

		preventSecondTouch: false,

		isDrag: function () {
			var result = false;
			Ext.each(this.currentTouches, function (t) {
				result = (t.delta[0] !== 0 || t.delta[1] !== 0);
				if (result) {
					return;
				}
			});
			return result;
		},

		log: log,

		dump: function (o, maxLevel, level) {
			try {
				maxLevel = maxLevel || 2;
				level = level || 0;

				if (Ext.isPrimitive(o)) {
					return o;
				}

				if (o === null) {
					return 'null';
				}

				if (o === undefined) {
					return 'undefined';
				}

				if (typeof o != "object") {
					return 'Unknown return type';
				}

				if (level >= maxLevel) {
					return "{}";
				}

				if (Ext.isArray(o)) {
					var items = [];
					Ext.each(o, function (item) {
						items.push(dump(item, maxLevel, level + 1));
					});
					return '[' + items.join(',') + ']';
				}

				var b = ["{\n"];

				for (var key in o) {
					var to = typeof o[key];
					if (to != "function") {
						b.push(String.format("  {0}: {1},\n", key, xn.TouchHandlers.dump(o[key], maxLevel, level + 1)));
					}
				}
				var s = b.join("");

				if (s.length > 3) {
					s = s.substr(0, s.length - 2);
				}
				return s + "\n}";
			} catch (e) {
				return "'" + e + "'";
			}
		},

		isMulti: function () {
			return (this.currentTouches.length > 1);
		},

		dumpToLog: function (o, maxLevel) {
			log(xn.TouchHandlers.dump(o, maxLevel));
		},

		logTouches: function () {
			if (this.prevEvt == null || this.currentEvt.type != this.prevEvt.type) {
				var touches = [];
				Ext.each(this.currentTouches, function (t) {
					var o = Ext.apply({}, t);
					o.target = o.toString(); // makes dump go nuts
					touches.push(o);
				});
				var o = {
					isMulti: this.isMulti(),
					isDrag: this.isDrag(),
					touches: touches
				};

				xn.TouchHandlers.log('{0}: {1}', this.currentEvt.type, xn.TouchHandlers.dump(o));
			}
		},

		getTouch: function (i) {
			return (this.currentTouches.length > i) ? this.currentTouches[i] : null;
		},

		getSingleTouch: function () {
			return (this.currentTouches.length == 1) ? this.getTouch(0) : null;
		},

		getFirstTouch: function () {
			return this.getTouch(0);
		},

		getTouches: function () {
			if (!this.currentEvt.changedTouches) {
				return [];
			}
			var result = [];
			var me = this;
			Ext.each(this.currentEvt.changedTouches, function (touch) {
				var o = {
					id: touch.identifier,
					target: touch.target,
					screen: [touch.screenX, touch.screenY],
					client: [touch.clientX, touch.clientY],
					delta: [0, 0]
				};

				Ext.each(me.startTouches, function (t) {
					if (t.id == o.id) {
						o.delta = [o.screen[0] - t.screen[0], o.screen[1] - t.screen[1]];
						return;
					}
				});

				result.push(o);
			});
			return result;
		},

		initEvent: function (evt) {
			this.extEvent = evt;
			this.prevEvt = this.currentEvt;
			this.currentEvt = evt.browserEvent;
			this.currentTouches = this.getTouches();
		},

		onTouchStart: function (evt) {
			if (this.preventSecondTouch) {
				evt.preventDefault();
				return false;
			}
			this.initEvent(evt);
			this.startTouches = this.currentTouches;
			if (!this.isMulti()) {
				var t = this.getSingleTouch();
				if (null == t) {
					return;
				}

				this.fireMouseOver(t);
			}
		},

		onTouchMove: function (evt) {
			this.preventSecondTouch = true;
			this.initEvent(evt);
			if (this.isMulti()) {
				return;
			}

			var t = this.getSingleTouch();

			if (null == t) {
				return;
			}

			this.fireMouseDown(t);
			this.fireMouseMove(t);
		},

		onTouchEnd: function (evt) {
			this.initEvent(evt);
			if (this.isMulti() && !this.isDrag()) {
				this.simulateDoubleClick();
				evt.preventDefault();
			}

			if (!this.isMulti()) {
				var t = this.getSingleTouch();

				if (null != t) {
					evt.preventDefault();
					this.fireMouseDown(t);
					this.fireMouseUp(t);
					this.fireClick(t);
				}

			}

			this.reset();
		},

		onTouchCancel: function (evt) {
			this.initEvent(evt);
			this.reset();
		},

		simulateDoubleClick: function () {
			var t = this.getFirstTouch();

			if (t == null) {
				return;
			}

			this.fireMouseUp(t);
			this.fireClick(t);
			this.fireDoubleClick(t);

		},

		fireMouseOver: function (t) {
			if (this.simulatedEvents.indexOf('mouseover') != -1) {
				return;
			}
			this.simulatedEvents.push('mouseover');
			log('mouseover: {0}', t.id);
			fireSimulatedEvent('mouseover', t);
		},

		fireMouseDown: function (t) {
			if (this.simulatedEvents.indexOf('mousedown') != -1) {
				return;
			}
			this.simulatedEvents.push('mousedown');
			log('mousedown: {0}', t.id);
			fireSimulatedEvent('mousedown', t);
		},

		fireMouseUp: function (t) {
			if (this.simulatedEvents.indexOf('mouseup') != -1) {
				return;
			}
			this.simulatedEvents.push('mouseup');
			log('mouseup: {0}', t.id);
			fireSimulatedEvent('mouseup', t);
		},

		fireMouseMove: function (t) {
			if (this.simulatedEvents.indexOf('mousemove') != -1) {
				this.simulatedEvents.push('mousemove');

			}
			log('mousemove: {0}', t.id);
			fireSimulatedEvent('mousemove', t);
		},

		fireClick: function (t) {
			if (this.simulatedEvents.indexOf('mouseclick') != -1) {
				return;
			}
			this.simulatedEvents.push('click');
			log('click: {0}', t.id);
			fireSimulatedEvent('click', t);
		},

		fireDoubleClick: function (t) {
			if (this.simulatedEvents.indexOf('dblclick') != -1) {
				return;
			}
			this.simulatedEvents.push('dblclick');
			log('dbclick: {0}', t.id);
			fireSimulatedEvent('dblclick', t);
		},

		reset: function () {
			this.startTouches = null;
			this.simulatedEvents = [];
			this.preventSecondTouch = false;
			log('reset');
		},

		hijackEventsInADangerousAndBugProneFashion: function () {
			if (!Ext.isMultiTouchDevice) {
				return;
			}

			Ext.EventManager.on(document, 'touchstart', xn.TouchHandlers.onTouchStart, TouchHandlers);
			Ext.EventManager.on(window, 'touchmove', xn.TouchHandlers.onTouchMove, TouchHandlers);
			Ext.EventManager.on(window, 'touchend', xn.TouchHandlers.onTouchEnd, TouchHandlers);
			Ext.EventManager.on(window, 'touchcancel', xn.TouchHandlers.onTouchCancel, TouchHandlers);
		}
	};
} ())
