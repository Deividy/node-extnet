
xn.NodeOperations = Ext.extend(Object, {
	constructor: function (config) {
		Ext.apply(this, config);
	},

	tweakNodeConfig: function (config) {
		config.iconCls = this.icon;
		config.op = this.name;
	}
});

ops = xn.NodeOperations;

ops.nop = new xn.NodeOperations({ name: 'nop', icon: 'no-icon' });

ops.catalog = [
	new xn.NodeOperations({
		name: 'insert',
		icon: 'silk-add',
		newValueLabel: 'Insert',

		handler: function (parent, newChildName) {
			var n = new xn.Node(newChildName, parent.level + 1, 0, [], 0, 'insert');
			parent.addChild(n);
			return n;
		}
	}),

	new xn.NodeOperations({
		name: 'rename',
		icon: 'silk-pencil',
		newValueLabel: 'Rename to',

		handler: function (n, newName) {
			n.op = n.op || ops.rename.name;
			n.rename(newName);
		}
	}),

	new xn.NodeOperations({
		name: 'clone',
		icon: 'silk-table-multiple',
		newValueLabel: 'Clone as',
		doShallowSearch: true,
		cloneDescendents: true,

		handler: function (n, cloneName, p) {
			p = p || n.parent;
			var c = n.cloneSelf(true);
			c.name = cloneName;
			c.cascade(function (c) { c.op = ops.clone.name; c.id = xn.Node.NextId++; });
			p.addChild(c);
		}
	}),

	new xn.NodeOperations({
		name: 'delete',
		icon: 'silk-delete',
		newValueLabel: '(ignored)',
		doShallowSearch: true,

		handler: function (n) {
			// If a node was going to be cloned, and now is being deleted, we can simply remove it from the tree
			if (n.op == ops.clone.name) {
				n.remove();
				return;
			}

			n.cascade(function (n) { n.op = 'delete'; n.getAdapter().refresh(n); });
		}
	})
];

	Ext.each(ops.catalog, function (op) {
		op.text = op.text || Ext.util.Format.capitalize(op.name);
		op.qtip = op.qtip || op.name + 'd';
		ops[op.name] = op;
	});

	xn.Node = function () {
		return Ext.extend(Object, {
			constructor: function (nameOrJson, level, databaseId, children, id, op) {
				if (1 == arguments.length) {
					Ext.apply(this, nameOrJson);
					for (var i = 0; i < this.children.length; i++) {
						this.children[i] = new xn.Node(this.children[i]);
						this.children[i].parent = this;
					}
					return;
				}

				this.name = nameOrJson;
				this.level = level;
				this.databaseId = databaseId;
				this.children = children;
				this.id = id || xn.Node.NextId++;

				for (var i = 0; i < this.children.length; i++) {
					this.children[i].parent = this;
				}

				op && (this.op = op);
			},

			getNextId: function () {
				return this.nextId++;
			},

			cloneAllPaths: function () {
				return this.doClone(true, true).getRoot();
			},

			cloneWithAncestors: function () {
				return this.doClone(true);
			},

			doClone: function (cloneAncestors, cloneDescendents) {
				var self = this.cloneSelf(cloneDescendents);
				if (!cloneAncestors) {
					return self;
				}

				var path = this.getPath().transform(xn.Node.prototype.cloneSelf);
				path[path.length - 1] = self;

				self = path.shift();
				while (path.length > 0) {
					var next = path.shift();
					self.addChild(next);
					self = next;
				}

				return self;
			},

			cloneSelf: function (cloneDescendents) {
				var o = new xn.Node(this.name, this.level, this.databaseId, [], this.id, this.op);

				if (cloneDescendents === true) {
					for (var i = 0; i < this.children.length; i++) {
						o.addChild(this.children[i].cloneSelf(true), true);
					}
				}

				return o;
			},

			withEachChild: function (f) {
				for (var i = 0; i < this.children.length; i++) {
					f.call(this, this.children[i]);
				}
			},

			cascade: function (f) {
				f(this);
				this.withEachChild(function (c) { c.cascade(f) });
			},

			getPath: function () {
				var p = [];
				var node = this;
				while (node != null) {
					p.push(node);
					node = node.parent;
				}

				p.reverse();
				return p;
			},

			loadTreeData: function (nodeId, processDirectResponse) {
				var result = this.getById(nodeId).children.select(function (c) { return c.buildConfigObject(); });
				response = { status: true };
				processDirectResponse(result, response);
			},

			attach: function (branch) {
				this.doMerge(branch, true, false, this.getAdapter(), this.getComparer());
			},

			refresh: function (branch) {
				this.doMerge(branch, false, true, this.getAdapter(), this.getComparer());
			},

			merge: function (branch) {
				this.doMerge(branch, true, true, this.getAdapter(), this.getComparer());
			},

			doMerge: function (branch, add, refresh, adapter, comparer) {
				if (refresh && this.level > 0) {
					this.name = branch.name;
					this.databaseId = branch.databaseId;
					this.op = branch.op;
					this.errorMessage = branch.errorMessage;

					adapter.refresh(this);
				}

				var mayAppend = (0 === this.children.length);

				for (var i = 0; i < branch.children.length; i++) {
					var target = null;
					for (var j = 0; j < this.children.length; j++) {
						if (branch.children[i].id === this.children[j].id) {
							target = this.children[j];
							break;
						}
					}

					if (target) {
						target.doMerge(branch.children[i], add, refresh, adapter, comparer);
					} else if (add) {
						this.addChild(branch.children[i], mayAppend, adapter, comparer);
					}
				}
			},

			getById: function (id) {
				id = Number(id);

				if (this.id === id) {
					return this;
				}

				for (var i = 0; i < this.children.length; i++) {
					var result = this.children[i].getById(id);
					if (result) {
						return result;
					}
				}

				return null;
			},

			removeById: function (id) {
				var node = this.getById(id);
				node && node.remove();
			},

			remove: function () {
				var parent = this.parent;
				if (!parent) {
					return;
				}

				var idx = parent.children.indexOf(this);
				parent.children.splice(idx, 1);

				this.getAdapter().remove(this);
			},

			getAdapter: function () {
				return this.getRoot().adapter || xn.NodeAdapter.nullAdapter;
			},

			getComparer: function () {
				return this.getRoot().comparer || xn.Node.comparer;
			},

			mergeChangeSet: function (changeSet) {
				for (var i = 0; i < changeSet.children.length; i++) {
					this.merge(changeSet.children[i]);
				}
			},

			addChild: function (child, mayAppend, adapter, comparer) {
				var index;

				if (mayAppend) {
					index = this.children.length;
					this.children.push(child);
				} else {
					index = this.children.binarySearch(child, (comparer || this.getComparer()));
					if (index >= 0) {
						return;
					}

					index = ~index;
					this.children.splice(index, 0, child);
				}

				child.parent = this;
				(adapter || this.getAdapter()).add(this, child, index);
			},

			rename: function (newName) {
				this.name = newName;
				this.parent && this.parent.children.sort(this.getComparer());
				this.getAdapter().refresh(this);
			},

			getRoot: function () {
				var root = this;
				while (root.parent) {
					root = root.parent;
				}

				return root;
			},

			getOp: function () {
				if (!this.op) {
					return null;
				}

				return ops[this.op];
			},

			getName: function () { return this.name },

			getChildById: function (id) {
				return this.children.first(function (c) { return c.id == id });
			},

			getChildByName: function (name) {
				return this.children.first(function (c) { return c.name == name });
			},

			buildConfigObject: function (includeChildren) {
				return this.getAdapter().buildConfigObject(this, includeChildren);
			},

			getDistinctNamesForLevel: function (level) {
				var names = {};
				this.withNodesAtLevel(level, function (n) { names[n.name] = true; });
				return xn.getOwnProperties(names);
			},

			withNodesAtLevel: function (level, act) {
				if (this.level == level) {
					act(this);
				}

				if (this.level >= level) {
					return;
				}

				for (var i = 0; i < this.children.length; i++) {
					this.children[i].withNodesAtLevel(level, act);
				}
			},

			getNodesAtLevel: function (level) {
				var matches = [];
				this.withNodesAtLevel(level, function (n) { matches.push(n) });
				return matches;
			},

			findFirst: function (test) {
				var found = false;
				var matches = [];
				this.doFind(function (n) { return found ? false : (found = test(n)) }, matches, function (n) { return found; });
				return matches.length == 0 ? null : matches[0];
			},

			findShallow: function (test) {
				var matches = [];
				return this.doFind(test, matches, test);
			},

			find: function (test, skipBranch) {
				var matches = [];
				return this.doFind(test, matches, skipBranch);
			},

			doFind: function (test, matches, skipBranch) {
				if (test(this)) {
					matches.push(this);
				}

				if (skipBranch && skipBranch(this)) {
					return matches;
				}

				for (var i = 0; i < this.children.length; i++) {
					this.children[i].doFind(test, matches, skipBranch);
				}

				return matches;
			},

			findMatchingPaths: function (test) {
				var matches = [];
				this.findPaths(test, [this], matches);
				return matches;
			},

			findPaths: function (test, currentPath, matches) {
				if (this.level > currentPath[0].level) {
					if (!test(this)) {
						return;
					}

					currentPath.push(this);
				}

				if (0 == this.children.length) {
					matches.push(currentPath.slice(0));
				} else {
					for (var i = 0; i < this.children.length; i++) {
						this.children[i].findPaths(test, currentPath, matches);
					}
				}

				currentPath.pop();
			},

			fillNamesByLevel: function (n, parents) {
				if (parents) {
					var p = this.parent;
					while (p != null) {
						n[p.level][p.name] = true;
						p = p.parent;
					}
				}

				n[this.level][this.name] = true;

				for (var i = 0; i < this.children.length; i++) {
					this.children[i].fillNamesByLevel(n);
				}
			},

			getDescendent: function (path) {
				var names = path.select(xn.Node.prototype.getName);
				var c = this;
				while (names.length > 0) {
					c = c.getChildByName(names.shift());
					if (!c) {
						return null;
					}
				}

				return c;
			}
		});
	} ();

xn.Node.comparer = function (a, b) {
	var c = a.name.localeCompare(b.name);
	return 0 == c ? a.id - b.id : c;
}

xn.Node.NextId = 1;