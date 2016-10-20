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
exports.toStrictSeq = toStrictSeq;
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
exports._partialRight = _partialRight;
exports.filter = filter;
exports._wrapReduce = _wrapReduce;
exports.foldLeft = foldLeft;
exports.foldRight = foldRight;
exports.zeroOrOne = zeroOrOne;
exports.oneOrMore = oneOrMore;
exports.exactlyOne = exactlyOne;

var _immutable = require("immutable");

var _xverr2 = require("xverr");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LazySeq = _immutable.Seq.Indexed;

LazySeq.prototype._isSeq = true;

var StrictSeq = function () {
    function StrictSeq(array) {
        _classCallCheck(this, StrictSeq);

        this._isSeq = true;
        this._isStrict = true;
        this._array = array === undefined ? [] : _isSeq(array) ? array._array : array instanceof Array ? array : [array];
        this.size = this._array.length;
    }

    _createClass(StrictSeq, [{
        key: "concat",
        value: function concat(other) {
            var ret = new StrictSeq(this._array.slice(0));
            if (!_isSeq(other)) {
                ret._array.push(other);
            } else {
                ret._array = ret._array.concat(other._array);
            }
            ret.size = ret._array.length;
            return ret;
        }
    }, {
        key: "forEach",
        value: function forEach(fn, cx) {
            var arr = this._array,
                len = arr.length;
            for (var i = 0; i < len; i++) {
                fn.call(cx, arr[i], i, arr);
            }
        }
    }, {
        key: "map",
        value: function map(fn) {
            var cx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this;

            var ret = new StrictSeq();
            var mapDeep = function mapDeep(val) {
                val.forEach(function (v, k, c) {
                    ret._array.push(v);
                });
            };
            this.forEach(function (v, k, c) {
                var val = fn.call(cx, v, k, c);
                if (_isSeq(val)) {
                    mapDeep(val);
                } else {
                    ret._array.push(val);
                }
            });
            ret.size = ret._array.length;
            return ret;
        }
    }, {
        key: "filter",
        value: function filter(fn) {
            var cx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this;

            var i = 0;
            var ret = new StrictSeq();
            this.forEach(function (v, k, c) {
                if (!!fn.call(cx, v, k, c)) {
                    i++;
                    ret._array.push(v);
                }
            });
            ret.size = i;
            return ret;
        }
    }, {
        key: "reduce",
        value: function reduce(fn, init, cx) {
            return this._array.reduce(function (acc, v, k, c) {
                if (v._isSeq) {
                    console.log(acc, v);
                }
                return fn.call(cx, acc, v, k, c);
            }, init);
        }
    }, {
        key: "join",
        value: function join(str) {
            return new StrictSeq(this.flatten()._array.join(str));
        }
    }, {
        key: "reverse",
        value: function reverse() {
            return new StrictSeq(this._array.slice(0).reverse());
        }
    }, {
        key: "sort",
        value: function sort(fn) {
            return new StrictSeq(this._array.sort(fn));
        }
    }, {
        key: "toArray",
        value: function toArray() {
            return this._array;
        }
    }, {
        key: "toString",
        value: function toString() {
            //return this._array.map(_ => _.toString()).join("");
            return this.__toString("[", "]");
        }
    }, {
        key: "__toString",
        value: function __toString(pre, post) {
            return pre + this._array.map(function (_) {
                return _.toString();
            }).join(",") + post;
        }
    }, {
        key: "slice",
        value: function slice(s, l) {
            return new StrictSeq(this._array.slice(s, l));
        }
    }, {
        key: "isEmpty",
        value: function isEmpty() {
            return !(this._array && this._array.length > 0);
        }
    }, {
        key: "findKey",
        value: function findKey(find) {
            for (var i = 0; i < this._array.length; i++) {
                if (find(this._array[i])) {
                    return i;
                }
            }
        }
    }, {
        key: "flatten",
        value: function flatten() {
            var ret = new StrictSeq();
            var flatDeep = function flatDeep(val) {
                val.forEach(function (v, k, c) {
                    ret._array.push(v);
                });
            };
            this.forEach(function (v, k) {
                if (v && v._isSeq && !v._isNode) {
                    flatDeep(v);
                } else {
                    ret._array.push(v);
                }
            });
            ret.size = ret._array.length;
            return ret;
        }
    }, {
        key: "first",
        value: function first() {
            return this.get(0);
        }
    }, {
        key: "get",
        value: function get(i) {
            return this._array[i];
        }
    }, {
        key: "has",
        value: function has(i) {
            return i in this._array;
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
    }, {
        key: "cacheResult",
        value: function cacheResult() {
            // no-op compat
            return this;
        }
    }, {
        key: "toJS",
        value: function toJS() {
            return this.flatten().toArray();
        }
    }]);

    return StrictSeq;
}();

// the default Seq


var Seq = exports.Seq = StrictSeq;

// TODO move check + flatten to xvtype
function seq() {
    for (var _len = arguments.length, a = Array(_len), _key = 0; _key < _len; _key++) {
        a[_key] = arguments[_key];
    }

    var len = a.length;
    if (len == 1 && _isSeq(a[0])) return a[0];
    var s = new Seq(a);
    return len > 1 && !a[0]._isNode ? s.flatten(true) : s;
}

function toSeq($a) {
    return new Seq($a).flatten(true);
}

function _isSeq(a) {
    return !!(a && a._isSeq);
}

function _first($a) {
    return _isSeq($a) ? $a.first() : $a;
}

function toStrictSeq(seq) {
    seq = _isSeq(seq) ? seq : seq(seq);
    seq._isStrict = true;
    return seq;
}

function flattenFactory(iterable) {
    var flatSequence = Object.create(LazySeq.prototype);
    flatSequence.__iterateUncached = function (fn, reverse) {
        var this$0 = this;
        var iterations = 0;
        function flattenNext(v) {
            return v.__iterate(function (v, k, c) {
                return fn(v, iterations++, this$0) !== false;
            });
        }
        iterable.__iterate(function (v, k) {
            if (v && v._isSeq && !v._isNode) {
                return flattenNext(v);
            }
            return fn(v, iterations++, this$0) !== false;
        }, reverse);
        return iterations;
    };
    return flatSequence;
}

function subsequence($a, $s, $e) {
    var s = _first($s),
        e = _first($e);
    if (s === undefined) return _xverr.error("err:XPTY0004", "Argument 2 of function subsequence evaluates to an empty sequence, but expected numeric value.");
    s = s.valueOf() - 1;
    return e === undefined ? $a.slice(s) : $a.slice(s, e.valueOf());
}

function remove($a, $i) {
    var i = _first($i);
    return $a.slice(0, i - 1).concat($a.slice(i));
}

function head($a) {
    return $a.slice(0, 1);
}

function tail($a) {
    return $a.slice(1);
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
        v = seq(v);
        return fn(v);
    };
}

function forEach() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
    }

    if (args.length == 1) return _partialRight(forEach, args);
    var fn = _first(args[1]);
    if (typeof fn != "function") {
        return args[0].map(function () {
            return fn;
        });
    }
    var iter = args[0];
    return strictMap(iter, fn);
}

function strictMap(iterable, mapper, context) {
    var ret = [];
    iterable._array.forEach(function (v, k, c) {
        // non-native call from forEach
        var val = mapper.call(null, seq(v)); //context===undefined ? mapper.call(null, v) : mapper.call(context, v, k, c);
        if (_isSeq(val)) {
            val.forEach(function (v, k, c) {
                ret.push(v);
            });
        } else {
            ret.push(val);
        }
    });
    return new StrictSeq(ret);
}

function iteratorValue(type, k, v, iteratorResult) {
    var value = type === 0 ? k : type === 1 ? v : [k, v];
    if (iteratorResult) {
        iteratorResult.value = value;
    } else {
        iteratorResult = { value: value, done: false };
    }
    return iteratorResult;
}

var NOT_SET = {};
function mapFactory(iterable, mapper, context) {
    var mappedSequence = Object.create(LazySeq.prototype);
    mappedSequence.size = iterable.size;
    mappedSequence.has = function (key) {
        return iterable.has(key);
    };
    mappedSequence.get = function (key, notSetValue) {
        var v = iterable.get(key, NOT_SET);
        return v === NOT_SET ? notSetValue : context === undefined ? mapper.call(null, v) : mapper.call(context, v, key, iterable);
    };
    mappedSequence.__iterateUncached = function (fn, reverse) {
        var iterations = 0;
        iterable.__iterate(function (v, k, c) {
            var this$0 = this;
            // non-native call from forEach
            var ret = context === undefined ? mapper.call(null, v) : mapper.call(context, v, k, c);
            if (_isSeq(ret)) {
                return ret.__iterate(function (v, k, c) {
                    return fn(v, iterations++, this$0) !== false;
                });
            }
            return fn(ret, iterations++, this$0) !== false;
        }, reverse);
        return iterations;
    };
    mappedSequence.__iteratorUncached = function (type, reverse) {
        var iterator = iterable.__iterator(1, reverse);
        return new iterator.constructor(function () {
            var step = iterator.next();
            if (step.done) {
                return step;
            }
            var entry = step.value;
            var key = entry[0];
            return iteratorValue(type, key, mapper.call(context, entry[1], key, iterable), step);
        });
    };
    return mappedSequence;
}

function reify(iter, seq) {
    return LazySeq.isSeq(iter) ? seq : iter.constructor(seq);
}

LazySeq.prototype.map = function (mapper, context) {
    return reify(this, mapFactory(this, mapper, context));
};

LazySeq.prototype.flatten = function () {
    return reify(this, flattenFactory(this));
};

LazySeq.prototype.toStrict = function () {
    return new StrictSeq(this.flatten(true).toArray());
};

StrictSeq.prototype.last = LazySeq.prototype.last = function () {
    if ("_cx" in this) return this._cx.size || this._cx.count();
    return _xverr.error("err:XPDY0002");
};

StrictSeq.prototype.position = LazySeq.prototype.position = function () {
    if ("_cx" in this && "_position" in this) return this._position;
    return _xverr.error("err:XPDY0002");
};

function filterFactory(iterable, predicate, context) {
    var filterSequence = Object.create(LazySeq.prototype);
    filterSequence.__iterateUncached = function (fn, reverse) {
        var this$0 = this;
        var iterations = 0;
        iterable.__iterate(function (v, k, c) {
            var v2 = seq(v);
            v2._position = k + 1;
            v2._cx = iterable;
            if (!!_first(predicate(v2))) {
                iterations++;
                var ret = fn(v, iterations - 1, this$0);
                return ret;
            }
        }, reverse);
        return iterations;
    };
    filterSequence.__iteratorUncached = function (type, reverse) {
        var iterator = iterable.__iterator(1, reverse);
        var iterations = 0;
        return new iterator.constructor(function () {
            while (true) {
                var step = iterator.next();
                if (step.done) {
                    return step;
                }
                if (!!_first(predicate(seq(step.value)))) {
                    return iteratorValue(1, iterations++, step.value, step);
                }
            }
        });
    };
    return filterSequence;
}

function strictFilter(iterable, predicate, context) {
    var ret = [];
    iterable.forEach(function (v, k, c) {
        var v2 = seq(v);
        v2._position = k + 1;
        v2._cx = iterable;
        if (!!_first(predicate(v2))) {
            ret.push(v);
        }
    });
    return new StrictSeq(ret);
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
    var iter = args[0],
        fn = _first(args[1]);
    return iter._isStrict ? strictFilter(iter, fn) : filterFactory(iter, fn);
}

function _wrapReduce(fn) {
    return function (pre, cur, i) {
        cur = seq(cur);
        return fn(seq(pre), cur);
    };
}

function foldLeft() {
    for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
    }

    if (args.length == 1) return (0, _xverr2.error)("XPTY0004");
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

    if (args.length == 1) return (0, _xverr2.error)("XPTY0004");
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
    if ($arg === undefined) return seq();
    if (!_isSeq($arg)) return seq($arg);
    if ($arg.size > 1) return (0, _xverr2.error)("FORG0003");
    return $arg;
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function oneOrMore($arg) {
    if ($arg === undefined) return (0, _xverr2.error)("FORG0004");
    if (!_isSeq($arg)) return seq($arg);
    if ($arg.size === 0) return (0, _xverr2.error)("FORG0004");
    return $arg;
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function exactlyOne($arg) {
    if ($arg === undefined) return (0, _xverr2.error)("FORG0005");
    if (!_isSeq($arg)) return seq($arg);
    var s = $arg.size;
    if (s === undefined) s = $arg.count();
    if (s != 1) return (0, _xverr2.error)("FORG0005");
    return $arg;
}