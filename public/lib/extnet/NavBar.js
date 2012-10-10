
Ext.ns('xn.components');

xn.components.NavBar = (function () {
	var getEnabledItems = function (arr, start, finish, direction, returnFirst) {
		var s = start || 0,
		    f = finish || arr.length,
		    dir = direction || 1,
		    res = [],
		    a = arr.slice(s, f);
		if (dir == -1) {
			a = a.reverse();
		}
		for (var i = 0; i < a.length; i++) {
			if (a[i].disabled) {
				continue;
			}

			var index = (dir == -1) ? f - i - 1 : i + s;

			if (returnFirst) {
				return index;
			}
			res.push(index);

		};

		return (returnFirst) ? null : res;
	};


	var NAVBAR = Ext.extend(Ext.util.Observable, {
		// Configuration options
		baseCls: 'x-navbar',

		menuWrapCls: 'x-navbar-menu',

		buttonCfgs: [{
			id: 'back',
			title: 'Back',
			fn: function () {
				this.goBack();
			}
		}, {
			id: 'next',
			title: 'Next',
			fn: function () {
				this.goNext();
			}

		}, {
			id: 'history',
			title: 'Navigate to',
			fn: function () {
				if (this.menuVisible) {
					this.hideMenu();
				} else {
					this.showMenu();
				}
			}
		}],

		items: [],

		currentItem: 0,

		initialItem: 0,

		menuVisible: false,

		constructor: function (element, config) {
			Ext.apply(this, config || {});

			this.disabledCls = this.baseCls + '-disabled';
			this.pressedCls = this.baseCls + '-pressed';
			this.currentCls = this.baseCls + '-current';

			Ext.each(this.buttoCfgs, function (b) {
				this.addEvents(b.id + 'click');
				this.addEvents('before' + b.id + 'click');
			}, this);

			this.addEvents('menuitemclick');

			this.el = Ext.get(element);

			this.container = this.el.createChild({ cls: this.baseCls });

			this.initButtons();
			this.initMenu();

			this.currentItem = this.initialItem;

			this.setCurrentItem();
			this.updateButtonStates();
			NAVBAR.superclass.constructor.call(this);
		},

		initButtons: function () {
			var me = this;

			var ul = this.container.createChild({ tag: 'ul', cls: this.baseCls + '-main' });

			this.buttons = {};

			Ext.each(this.buttonCfgs, function (b) {
				var li = ul.createChild(Ext.apply({}, {
					tag: 'li',
					cls: this.baseCls + '-' + b.id,
					cn: [{
						tag: 'a',
						title: b.title,
						cls: b.disabled ? this.disabledCls : ''
					}]
				}));

				var a = li.down('a');

				a.on('click', function (e, t) {
					e.stopEvent();
					if (!me.isButtonEnabled(a) || !me.fireEvent('before' + b.id + 'click', b, e, t)) {
						return;
					}
					me.fireEvent(b.id + 'click', b, e, t);
					if (Ext.isDefined(b.fn) && Ext.isFunction(b.fn)) {
						b.fn.apply(b.scope || me, [b, e, t]);
					}
				});

				a.on('mousedown', function () {
					if (!me.isButtonEnabled(a)) { return; }
					a.addClass(me.pressedCls);
				});

				a.on('mouseup', function () {
					if (!me.isButtonEnabled(a)) { return; }
					a.removeClass(me.pressedCls);
				});

				this.buttons[b.id] = a;
			}, this);
		},

		initMenu: function () {
			var wrap = Ext.getBody().createChild({ cls: this.menuWrapCls });
			wrap.on('mouseleave', function (e, t) {
				this.hideMenu();
			}, this);
			this.menuEl = wrap.createChild({ tag: 'ul' });
			var itemsCfg = this.items.slice(0);
			this.items = [];
			Ext.each(itemsCfg, function (i) {
				this.items.push(this.createItem(i));
			}, this);
			this.menuWrap = wrap;
		},

		createItem: function (cfg, insertBefore) {
			var me = this;
			var el = me.menuEl.createChild({
				tag: 'li',
				cn: [{
					tag: 'a',
					title: cfg.title,
					html: cfg.text,
					cls: String.format('{0} {1}', cfg.cls, cfg.disabled ? me.disabledCls : ''),
					href: cfg.href || null
				}]
			}, insertBefore);
			var item = {
				el: el.down('a'),
				initialCfg: cfg,
				fn: cfg.fn || Ext.emptyFn,
				scope: cfg.scope || me,
				disabled: cfg.disabled
			};

			el.on('click', function (e, t) {
				e.preventDefault();
				if (!me.fireEvent('menuitemclick', item, e, t)) {
					return;
				}
				me.jumpTo(me.items.indexOf(item));
			}, me);

			return item;
		},

		addMenuItem: function (itemCfg, pos) {
			pos = Ext.isNumber(pos) ? pos : this.items.length;
			var insertBefore = pos < this.items.length ? this.items[pos].el.parent().dom : null;
			var item = this.createItem(itemCfg, insertBefore);
			this.items.splice(pos, 0, item);
			this.updateButtonStates();
			return item;
		},

		clearMenu: function () {
			for (var i = this.items.length - 1; i >= 0; i--) {
				this.items[i].el.parent().remove();
			}
			this.items = [];
			this.currentItem = 0;
			this.updateButtonStates();
		},

		removeMenuItem: function (o) {
			var i = Ext.isObject(o) ? this.items.indexOf(o) : o;
			if (i < 0 || i > this.items.length || i == this.currentItem) {
				return;
			}
			var item = this.items.splice(i, 1)[0];
			item.el.parent().remove();

			if (i < this.currentItem) {
				this.currentItem--;
			}
			this.updateButtonStates();
		},

		toggleMenuItem: function (o, toggle) {
			var i = Ext.isObject(o) ? this.items.indexOf(o) : o;
			if (i < 0 || i > this.items.length || i == this.currentItem) {
				return;
			}
			this.items[i].disabled = !toggle;
			if (toggle) {
				this.items[i].el.removeClass(this.disabledCls);
			} else {
				this.items[i].el.addClass(this.disabledCls);
			}
			this.updateButtonStates();
		},

		isButtonEnabled: function (btn) {
			return !btn.hasClass(this.disabledCls);
		},

		toggleButton: function (btn, enabled) {
			if (enabled) {
				btn.removeClass(this.disabledCls);
			} else {
				btn.addClass(this.disabledCls);
			}
		},

		updateButtonStates: function () {
			var btnStates = [
					this.hasPrevious(),
					this.hasNext(),
					this.items.length > 0
				],
				me = this;

			Ext.each(this.buttonCfgs, function (b, i) {
				var btn = me.buttons[b.id];
				me.toggleButton(btn, btnStates[i]);
			});
		},

		setCurrentItem: function (index) {
			var idx = index || this.currentItem;

			if (idx < 0) {
				return;
			}

			Ext.each(this.items, function (item, i) {
				if (idx == i && !item.disabled) {
					item.el.addClass(this.currentCls);
				} else {
					item.el.removeClass(this.currentCls);
				}
			}, this);
		},

		jumpTo: function (i) {
			if (null === i || i < 0 || i >= this.items.length || this.currentItem == i) {
				return;
			}

			var item = this.items[i];

			if (item.disabled) {
				return;
			}

			if (this.menuVisible) {
				this.hideMenu();
			}

			this.currentItem = i;

			this.setCurrentItem(i);

			this.updateButtonStates();

			if (item.fn.apply(item.scope, [item, i])) {
				window.location = t.href;
			}
		},

		hasPrevious: function () {
			return (this.wrapOnBack) ? (this.getPreviousIndex() !== null) : (this.currentItem > 0 && this.getPreviousIndex() !== null);
		},

		getPreviousIndex: function () {
			return getEnabledItems(this.items, 0, this.currentItem, -1, true);
		},

		goBack: function () {
			this.jumpTo(this.getPreviousIndex());
		},

		hasNext: function () {
			return (this.wrapOnNext) ? (this.getNextIndex() !== null) : (this.currentItem < this.items.length && this.getNextIndex() !== null);
		},

		getNextIndex: function () {
			var nextIndex = getEnabledItems(this.items, this.currentItem + 1, null, null, true);
			if (!this.wrapOnNext || null !== nextIndex) {
				return nextIndex;
			}
			return getEnabledItems(this.items, 0, this.currentItem + 1, null, true);
		},

		goNext: function () {
			this.jumpTo(this.getNextIndex());
		},

		showMenu: function () {
			this.menuVisible = true;
			var trigger = this.buttons[this.buttonCfgs[2].id];
			trigger.addClass(this.pressedCls);
			this.menuWrap.setWidth(this.menuWidth || 'auto');
			this.menuWrap.setHeight(this.menuHeight || 'auto');
			this.menuWrap.setXY([trigger.getRight(), trigger.getTop() + trigger.getHeight() / 2]);
			this.menuWrap.show();

		},

		hideMenu: function () {
			this.menuVisible = false;
			var trigger = this.buttons[this.buttonCfgs[2].id];
			trigger.removeClass(this.pressedCls);
			this.menuWrap.hide();
		},

		destroy: function () {
			this.container.remove();
		}
	});
	return NAVBAR;
} ());


