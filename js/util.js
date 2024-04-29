function Observer() {
  this.callbacks = {};
}
Observer.prototype.addCallback = function (key, oneCallback) {
  this.callbacks[key] = oneCallback;
};

Observer.prototype.update = function (key) {
  var oneCallback = this.callbacks[key];
  oneCallback && oneCallback();
};

function defineObserveKey(dstObj, varName) {
  var observer = new Observer();
  dstObj["_" + varName] = "";
  Object.defineProperty(dstObj, varName, {
    set: function (newValue) {
      dstObj["_" + varName] = newValue;
      observer.update(varName);
    },
    get: function () {
      Observer.callback && observer.addCallback(varName, Observer.callback);
      return dstObj["_" + varName];
    },
  });
}

function generateUID() {
  var charArr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-".split(
    ""
  );
  var UIDArr = [];
  for (var i = 0; i < 32; i++) {
    UIDArr.push(charArr[parseInt(Math.random() * charArr.length)]);
  }
  return UIDArr.join("");
}
