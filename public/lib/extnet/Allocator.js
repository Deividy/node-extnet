
xn.Allocator = Ext.extend(Object, {
	cntInitialInstances: 3,
	maxAvailableObjects: 10,	

	create: Ext.emptyFn,
	destroy: Ext.emptyFn,

	initialCfg: {},
	availableInstances: [],
	allocatedInstances: [],
		
	constructor: function(config, scope) {
		Ext.apply(this,config);

		for (var i = 0; i < this.cntInitialInstances; i++){
			this.availableInstances.push(this.create.call(scope || this,this.initialCfg));
		};
	},
	
	allocate: function(config, scope) {
		Ext.applyIf(config, this.initialCfg);
		var o = null;	

		if (this.availableInstances.length == 0) {
			o = this.create.call(scope || this,config);
		} else {
			o = this.availableInstances.shift();
		}
		
		this.allocatedInstances.push(o);
		return o;
	},
	
	free: function(o,scope) {
		var i = this.allocatedInstances.indexOf(o);
		if (i < 0) {
			throw new Error("object not found");
		}
		
		this.allocatedInstances.splice(i, 1);
		this.availableInstances.push(o);
		while(this.availableInstances.length >= this.maxAvailableObjects) {
			var o = this.availableInstances.shift();
			this.destroy.call(scope || this,o);
		}
	}
});