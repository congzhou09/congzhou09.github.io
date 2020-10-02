function Observer() {
  this.callbacks = [];
}
Observer.prototype.addCallback = function(oneCallback) {
  this.callbacks.push(oneCallback);
};

Observer.prototype.update = function() {
  this.callbacks.forEach(function(oneCallback) {
    oneCallback();
  });
};

function defineObserveVar(dstObj, varName) {
  var observer = new Observer();
  dstObj["_" + varName] = "";
  Object.defineProperty(dstObj, varName, {
    set: function(newValue) {
      dstObj["_" + varName] = newValue;
      observer.update();
    },
    get: function() {
      Observer.callback && observer.addCallback(Observer.callback);
      return dstObj["_" + varName];
    }
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
