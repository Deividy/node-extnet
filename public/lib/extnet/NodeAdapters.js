
xn.NodeAdapter = Ext.extend(Object, {
	buildConfigObject: function (node) {
		var o = {
			xnNode: node,
			leaf: node.level && node.level == node.getRoot().maxLevel,
			text: node.name,
			expanded: node.children.length == 0,
			id: node.id,
			iconCls: 'no-icon'
		};

		node.op && xn.NodeOperations[node.op].tweakNodeConfig(o);
		return o;
	}
});

var NA = xn.NodeAdapter;

NA.methods = ['mirror', 'add', 'refresh', 'remove'];
NA.methods.each(function() { NA.prototype[this] = function() {} });

NA.nullAdapter = new NA();

xn.CompositeNodeAdapter = Ext.extend(NA, {
	constructor: function(adapters) {
		this.adapters = (adapters || []);
	},
	
	addAdapter: function(adapter) {
		this.adapters.push(adapter);
	}
});

NA.methods.each(function(m) { 
	xn.CompositeNodeAdapter.prototype[this] = function() {
		for(var i = 0; i < this.adapters.length; i++) {
			this.adapters[i][m].apply(this.adapters[i], arguments);
		}
	}
});

xn.ExtTreeNodeAdapter = Ext.extend(NA, {
	constructor: function (extTree) {
		this.extTree = extTree;
		this.cntStops = 0;
	},

	stopEvents: function () {
		this.cntStops++;
		if (1 === this.cntStops) {
			this.extTree.suspendEvents(false);
		}
	},

	resumeEvents: function () {
		this.cntStops--;
		if (0 === this.cntStops) {
			this.extTree.resumeEvents();
		}
	},

	mirror: function (node) { this.actOnExtTree(node, this.doMirror); },
	add: function (parent, child, index) { this.actOnExtTree(parent, this.doAdd, child, index); },
	refresh: function (node) { this.actOnExtTree(node, this.doRefresh); },
	remove: function (node) { this.actOnExtTree(node, this.doRemove); },

	actOnExtTree: function (node, f, a, b) {
		var target = this.extTree.getNodeById(node.id);
		if (!target) {
			return;
		}

		this.stopEvents();
		f.call(this, node, target, a, b);
		this.resumeEvents();
	},

	doRemove: function (node, extTreeNode) {
		extTreeNode.remove();
	},

	doAdd: function (node, extTreeNode, child, index) {
		if (!extTreeNode.loaded) {
			return;
		}

		var extChildren = extTreeNode.childNodes;
		var config = this.buildConfigObject(child);

		if (index == extChildren.length) {
			extTreeNode.appendChild(config);
		} else {
			extTreeNode.insertBefore(config, extChildren[index]);
		}
	},

	doRefresh: function (node, extTreeNode) {
		if (node.name != extTreeNode.text) {
			extTreeNode.setText(node.name);

			var parent = extTreeNode.parentNode;
			if (parent) {
				var comparer = node.getComparer();
				parent.sort(function (a, b) { return comparer(a.attributes.xnNode, b.attributes.xnNode) });
			}
		}

		if (node.op !== extTreeNode.attributes.op) {
			if (!node.op) {
				delete node.op;
				delete extTreeNode.attributes.op;
			} else {
				extTreeNode.attributes.op = node.op;
			}

			var op = node.getOp() || xn.NodeOperations.nop;
			this.setNodeQtip(extTreeNode, op.qtip);
			this.setNodeIcon(extTreeNode, op.icon);
		}
	},

	setNodeQtip: function (B, C, A) {
		var ui = B.getUI();
		if (!ui.rendered) {
			B.attributes.qtip = C;
			return;
		}

		var textNode = ui.textNode;

		if (textNode.setAttributeNS) {
			textNode.setAttributeNS("ext", "qtip", C);

			if (A) {
				textNode.setAttributeNS("ext", "qtitle", A);
			}
		} else {
			textNode.setAttribute("ext:qtip", C);
			if (A) {
				textNode.setAttribute("ext:qtitle", A);
			}
		}
	},

	setNodeIcon: function (node, iconName) {
		var ui = node.getUI();
		if (!ui.rendered) {
			node.attributes.iconCls = iconName;
			return;
		}

		ui.getIconEl().className = 'x-tree-node-icon ' + iconName;
	}
});

xn.CascadingComboAdapter = Ext.extend(NA, {
	constructor: function(cascade) {
		this.cascade = cascade;
	}
});

NA.methods.each(function() { xn.CascadingComboAdapter.prototype[this] = function(node) {
	node = (node.parent || node);
	this.cascade.combos[node.level].store.loadData(node.children);
}, this });

delete NA;