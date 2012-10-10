
xn.NodeCascadingCombos = Ext.extend(xn.CascadingCombos, {
	fields: ['databaseId', 'name'],

	getChildNode: function (parentNode, value) {
		return parentNode.children.first(function() { return this.databaseId == value });
	},

	doComboLoad: function (combo, parentNode) {
		combo.store.loadData(parentNode.children);
		return parentNode.children.length == 1 ? parentNode.children[0].databaseId : null;
	}
});