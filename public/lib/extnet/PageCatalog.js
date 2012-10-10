
xn.PageCatalog = Ext.extend(Object, {
	constructor: function (pageDescriptors) {
		this.pages = pageDescriptors.where(function (p) { return p.isAvailable(); });
	},

	getNext: function (currentUrl) {
		return this.getPages(currentUrl)[2];
	},

	getPrevious: function (currentUrl) {
		return this.getPages(currentUrl)[0];
	},

	getPages: function (currentUrl) {
		for (var i = 0; i < this.pages.length; i++) {
			if (currentUrl == this.pages[i].url) {
				current = this.pages[i];
				break;
			}
		}

		next = i < this.pages.length - 1 ? this.pages[i + 1] : this.pages[0];
		previous = i == 0 ? this.pages[this.pages.length - 1] : this.pages[i - 1];

		return [previous, current, next];
	}
});