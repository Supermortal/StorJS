var Stor = function() {

	this.Levels = {};
	this.Levels.__root = this;
	
	this.Depth = 0;
	this.__obj = {};
	this.__levels = {};
	this.Levels.Add = function (depthParam, key, parent, value) {
		if (this.__root.__levels["level" + depthParam] == undefined) {
			this.__root.__levels["level" + depthParam] = [];
		}
		
		if (depthParam == 0 || (parent == null || parent == undefined)) {
			var keyFound = false;
			for (p in this.__root.__levels["level0"]) {
				if (this.__root.__levels["level0"][p][0] == key) {
					keyFound = true;
				}
			}	
			if (!keyFound) {
				this.__root.__levels["level0"].push([key]);
			}
			
			if (value != null && value != undefined) {
				this.__root.__obj[key] = value;
			}
			else {
				this.__root.__obj[key] = {};
			}
		}
		else {
			var level = "level" + depthParam;
			var keyFound = false;
			for (p in this.__root.__levels[level]) {
				if (this.__root.__levels[level][p][0] == key) {
					keyFound = true;
				}
			}	
			if (!keyFound) {
				this.__root.__levels[level].push([key, parent]);
			}			
			
			var index = 1;
			var parents = [];
			do {
				for (p in this.__root.__levels["level" + (depthParam - index)]) {
					var level = "level" + (depthParam - index);
				
					if (this.__root.__levels[level][p][0] == parent) {
						parents.unshift(this.__root.__levels[level][p])
						
						if (this.__root.__levels[level][p][1] != undefined) {
							parent = this.__root.__levels[level][p][1];
						}
					}
				}
				
				index++;
			}
			while (!(depthParam - index < 0));
			
			var obj = this.__root.__obj;
			for (var i = 0; i < parents.length; i++) {
				obj = obj[parents[i][0]];
			}
			
			if (typeof obj === "object") {
				if (value != null && value != undefined) {
					obj[key] = value;
				}
				else {
					obj[key] = {};
				}	
			}			
		}
	}
}