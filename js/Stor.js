/*********************************************************************/
/*	Written by Christopher Pink						  				 */
/*	This version released with no license (available for free use)	 */
/*	Version: 0.6																 */
/*********************************************************************/

var Stor = {};

Stor.Error = function (message, module) {
  this.name = "Stor.Error." + module;
  this.message = message || "Default Message";
};
Stor.Error.prototype = new Error();
Stor.Error.prototype.constructor = Stor.Error;

Stor.Tree = {};
Stor.Tree.Modes = {
  StoreValues: { value: 0, name: "StoreValues", code: "SV" },
  CreateAndStoreObjects: { value: 1, name: "CreateAndStoreObjects", code: "CASO" },
  CreateObjects: { value: 2, name: "CreateObjects", code: "CO" },
  CreateArrays: { value: 3, name: "CreateArrays", code: "CA" },
  CartesianStoreValues: { value: 4, name: "CartesianStoreValues", code: "C-SV" },
  CreateAndStoreArrays: { value: 5, name: "CreateAndStoreArrays", code: "CASA" }
};

Stor.StorTree = function (data, mode, countPropName, totalPropName) {
  if (Object.prototype.toString.call(data) === '[object Array]') {
    this.moduleName = "StorTree";
    this.depth = arguments.length - 4;
    this.keys = {};

    this.tree = {};
    if (countPropName && countPropName != null) {
      this.tree[countPropName] = 0;
    }

    this.count = function () {
      var obj = this.tree;

      if (arguments[0] == "root" && arguments.length == 1) {
        if (countPropName && countPropName != null) {
          return this.tree[countPropName];
        }
      }
      for (p in arguments) {
        if (obj[arguments[p]] != undefined) {
          obj = obj[arguments[p]];
        }
        else {
          throw new Stor.Error("The element does not exist.", this.moduleName);
        }
      }

      if (countPropName && countPropName != null) {
        if (obj[countPropName] != undefined) {
          return obj[countPropName];
        }
      }
      else {
        throw new Stor.Error("Size is not defined for the element.", this.moduleName);
      }
    };

    var argLastIndex = arguments.length;

    var lastArgObj = arguments[arguments.length - 1];
    for (p in data) {
      var obj = this.tree;

      var lastObj;
      var item;
      var lastItem;
      for (var i = 4; i < argLastIndex; i++) {
        if (i == (argLastIndex - 1)) {
          if (mode == null || mode == undefined || mode.code == "SV") {
            var value = data[p][arguments[i]];

            if (value == undefined) {
              throw new Stor.Error("Incorrect key value.", this.moduleName);
            }

            lastObj[item] = value;
            if (countPropName && countPropName != null) {
              lastObj[item][countPropName]++;
            }
            if (totalPropName && totalPropName != null && typeof value === "number") {
              if (lastObj[totalPropName] == undefined) {
                lastObj[totalPropName] = 0;
              }

              lastObj[totalPropName] += value;
            }
          }
          else if (mode.code == "C-SV") {
            var value = data[p][lastArgObj.value];

            if (value == undefined) {
              throw new Stor.Error("Incorrect key value.", this.moduleName);
            }

            this.keys[item] = {};

            lastObj[item] = value;
            if (countPropName && countPropName != null) {
              lastObj[item][countPropName]++;
            }
            if (totalPropName && totalPropName != null && typeof value === "number") {
              if (lastObj[totalPropName] == undefined) {
                lastObj[totalPropName] = 0;
              }
              lastObj[totalPropName] += value;
            }
          }
          else if (mode.code == "CASO") {
            lastObj[item] = {};
            var argObj = arguments[i];

            for (prop in argObj) {

              if (data[p][argObj[prop]] == undefined) {
                throw new Stor.Error("Incorrect key value.", this.moduleName);
              }

              lastObj[item][prop] = data[p][argObj[prop]];
            }
          }
          else if (mode.code == "CASA") {
            var value = data[p][arguments[i]];

            if (lastObj[item] == undefined || lastObj[item].length == undefined) {
              lastObj[item] = [];
            }

            lastObj[item].push(value);
          } 
          else {
            item = data[p][arguments[i]];

            if (mode.code == "CO") {
              obj[item] = {};
            }
            if (mode.code == "CA") {
              obj[item] = [];
            }
          }
        }
        else {
          lastItem = item;
          item = data[p][arguments[i]];

          if (item == undefined) {
            throw new Stor.Error("Incorrect key value.", this.moduleName);
          }

          if (obj[item] == undefined) {
            obj[item] = {};
            if (countPropName && countPropName != null) {
              obj[item][countPropName] = 0;
            }

            if (this.keys[i - 3] == undefined) {
              this.keys[i - 3] = {};
            }
            this.keys[i - 3][item] = {};

            if (countPropName && countPropName != null) {
              if (lastObj && lastObj[lastItem][countPropName] != undefined) {
                lastObj[lastItem][countPropName]++;
              }
            }
            if (i == 4) {
              if (countPropName && countPropName != null) {
                this.tree[countPropName]++;
              }
            }
          }
          lastObj = obj;
          obj = obj[item];
        }
      }
    }

    var finalDepth = (this.depth - 1);
    this._traverse = function () {
      var depth = 1;
      var obj = this.tree;
      this._recTraverse(depth, obj, null);
    };

    this._recTraverse = function (depth, obj, lastObj) {
      if (depth != finalDepth) {
        depth++;

        for (p in obj) {
          if (p != countPropName && p != totalPropName) {
            this._recTraverse(depth, obj[p], obj);
          }
        }
      }
      else {
        for (p in this.keys[finalDepth]) {
          if (obj[p] == undefined) {

            if (mode.code == "C-SV") {
              obj[p] = lastArgObj.defaultValue;
            }

            if (countPropName && countPropName != null) {
              obj[countPropName]++;
            }
            if (totalPropName && totalPropName != null && typeof lastArgObj.defaultValue === "number") {
              if (obj[totalPropName] == undefined) {
                obj[totalPropName] = 0;
              }
              obj[totalPropName] += lastArgObj.defaultValue;
            }
          }
        }
      }
    };

    if (mode.code === "C-SV") {
      this._traverse();
    }
  }
  else {
    throw new Stor.Error("First argument in constructor is not an array.", this.moduleName);
  }
}