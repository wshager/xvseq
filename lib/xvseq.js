"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Seq = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.seq = seq;
exports.toSeq = toSeq;
exports._isSeq = _isSeq;
exports._first = _first;
exports.subsequence = subsequence;
exports.remove = remove;
exports.head = head;
exports.tail = tail;
exports.count = count;
exports.reverse = reverse;
exports.insertBefore = insertBefore;
exports._isEmpty = _isEmpty;
exports.empty = empty;
exports.exists = exists;
exports._wrap = _wrap;
exports.forEach = forEach;
exports._wrapFilter = _wrapFilter;
exports._partialRight = _partialRight;
exports.filter = filter;
exports._wrapReduce = _wrapReduce;
exports.foldLeft = foldLeft;
exports.foldRight = foldRight;
exports.zeroOrOne = zeroOrOne;
exports.oneOrMore = oneOrMore;
exports.exactlyOne = exactlyOne;

var _immutable = require("immutable");

var _xverr = require("xverr");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StrictSeq = function () {
  function StrictSeq(array) {
    _classCallCheck(this, StrictSeq);

    this._isSeq = true;
    this._array = _isSeq(array) ? array._array : array instanceof Array ? array : [array];
    this.size = array.length;
  }

  _createClass(StrictSeq, [{
    key: "map",
    value: function map(fn) {
      var cx = arguments.length <= 1 || arguments[1] === undefined ? this : arguments[1];

      var ret = new StrictSeq();
      this.forEach(function (c, i, a) {
        ret = ret.concat(fn(c, i, a));
      }, cx);
      return ret;
    }
  }, {
    key: "filter",
    value: function filter(fn) {
      var cx = arguments.length <= 1 || arguments[1] === undefined ? this : arguments[1];

      var ret = new StrictSeq();
      this.forEach(function (c, i, a) {
        if (fn(c, i, a)) ret = ret.concat(c);
      }, cx);
      return ret;
    }
  }, {
    key: "toString",
    value: function toString() {
      return this._array.map(function (_) {
        return _.toString();
      }).join("\n");
    }
  }, {
    key: "slice",
    value: function slice(s, l) {
      return new StrictSeq(this._array.slice(s, l));
    }
  }, {
    key: "first",
    value: function first() {
      return this._array[0];
    }
  }, {
    key: "get",
    value: function get(i) {
      return this._array[i];
    }
  }, {
    key: "isSeq",
    value: function isSeq(seq) {
      return !!(seq && seq._isSeq);
    }
  }, {
    key: "count",
    value: function count() {
      return this.size;
    }
  }]);

  return StrictSeq;
}();

function seq() {
  for (var _len = arguments.length, a = Array(_len), _key = 0; _key < _len; _key++) {
    a[_key] = arguments[_key];
  }

  if (a.length == 1 && _isSeq(a[0])) return a[0];
  return (0, _immutable.Seq)(a);
}

function toSeq($a) {
  return _immutable.Seq.Indexed($a).flatten(true);
}

function _isSeq(a) {
  return _immutable.Seq.isSeq(a);
}

function _first($a) {
  return _isSeq($a) ? $a.first() : $a;
}

function subsequence($a, $s, $e) {
  var s = _first(s),
      e = _first($e);
  return $a.slice(s - 1, e);
}

function remove($a, $i) {
  var i = _first($i);
  return $a.slice(0, i - 1).concat($a.slice(i));
}

function head($a) {
  return $a.slice(0, 1);
}

function tail($a) {
  return $a.rest();
}

function count($a) {
  //console.log($a.toJS().length);
  return seq($a.count());
}

function reverse($a) {
  return $a.reverse();
}

function insertBefore($a, $pos, $ins) {
  var pos = _first($pos);
  pos = pos === 0 ? 1 : pos - 1;
  return $a.slice(0, pos).concat($ins).concat($a.slice(pos));
}

function _isEmpty($i) {
  return _isSeq($i) ? $i.isEmpty() : false;
}

function empty($i) {
  return seq(_isEmpty($i));
}

function exists($i) {
  return seq(!_isEmpty($i));
}

function _wrap(fn) {
  return function (v, i) {
    var $ = fn(seq(v), seq(i));
    //$._position = i;
    return $;
  };
}

function forEach() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  if (args.length == 1) return _partialRight(forEach, args);
  var fn = _first(args[1]);
  if (typeof fn != "function") {
    return $seq.map(function () {
      return fn;
    });
  }
  return args[0].map(_wrap(fn)).flatten(true);
}

function _wrapFilter(fn) {
  return function (v, i) {
    return !!_first(fn(seq(v), seq(i)));
    //$._position = i;
  };
}

function _partialRight(fn, args) {
  return function () {
    for (var _len3 = arguments.length, a = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      a[_key3] = arguments[_key3];
    }

    return fn.apply(this, a.concat(args));
  };
}

function filter() {
  for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    args[_key4] = arguments[_key4];
  }

  if (args.length == 1) return _partialRight(filter, args);
  return args[0].filter(_wrapFilter(_first(args[1])));
}

function _wrapReduce(fn) {
  return function (pre, cur, i) {
    var $ = fn(seq(pre), seq(cur), seq(i));
    //$._position = i;
    return $;
  };
}

function foldLeft() {
  for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    args[_key5] = arguments[_key5];
  }

  if (args.length == 1) return (0, _xverr.error)("XPTY0004");
  if (args.length == 2) return _partialRight(foldRight, args);
  var $init = seq(args[1]);
  var fn = _first(args[2]);
  return seq(args[0].reduce(_wrapReduce(fn), $init));
}

/**
 * [foldRight foldRight function]
 * @param  {Array} args [Rest params array]
 * @return {Seq|Function}      [Returns Seq OR partially applied function if arity of 2]
 */
function foldRight() {
  for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    args[_key6] = arguments[_key6];
  }

  if (args.length == 1) return (0, _xverr.error)("XPTY0004");
  if (args.length == 2) return _partialRight(foldRight, args);
  var $init = seq(args[1]);
  var fn = _first(args[2]);
  return seq(args[0].reduceRight(_wrapReduce(fn), $init));
}

/**
 * [zeroOrOne returns arg OR error if arg not zero or one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}     [Process Error in implementation]
 */
function zeroOrOne($arg) {
  if ($arg.size > 1) return (0, _xverr.error)("FORG0003");
  return $arg;
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function oneOrMore($arg) {
  if ($arg.size === 0) return (0, _xverr.error)("FORG0004");
  return $arg;
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function exactlyOne($arg) {
  if ($arg.size != 1) return (0, _xverr.error)("FORG0005");
  return $arg;
}

exports.Seq = _immutable.Seq;