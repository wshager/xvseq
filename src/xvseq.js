import { Seq } from "immutable";

import { error } from "xverr";

Seq.prototype._isSeq = true;

class StrictSeq {
    constructor(array) {
		this._isSeq = true;
        this._array = _isSeq(array) ? array._array : array instanceof Array ? array : [array];
        this.size = array.length;
    }
    __iterate(fn, cx) {
        if (cx === undefined) cx = this;
        var a = this._array;
        for (var i = 0; i < a.length; i++) {
            fn.call(cx, a[i], i, a);
        }
    }
	map(fn, cx = this) {
        var ret = new StrictSeq();
        this.forEach(function (c,i,a) {
            ret = ret.concat(fn(c, i, a));
        }, cx);
        return ret;
    }
    filter(fn, cx = this) {
        var ret = new StrictSeq();
        this.forEach(function (c, i, a) {
            if(fn(c,i,a)) ret = ret.concat(c);
        }, cx);
        return ret;
    }
    toString() {
        return this._array.map(_ => _.toString()).join("\n");
    }
    slice(s,l){
        return new StrictSeq(this._array.slice(s,l));
    }
    first() {
        return this._array[0];
    }
    get(i) {
        return this._array[i];
    }
	isSeq(seq){
		return !!(seq && seq._isSeq);
	}
	count(){
		return this.size;
	}
}

// TODO move check + flatten to xvtype
export function seq(...a){
    if(a.length == 1 && _isSeq(a[0])) return a[0];
    let s = Seq(a);
    return a.length>1 && !a[0]._isNode ? s.flatten(true) : s;
}

export function toSeq($a) {
    return Seq.Indexed($a).flatten(true);
}

export function _isSeq(a){
    return !!(a && a._isSeq);
}

export function _first($a){
	return _isSeq($a) ? $a.first() : $a;
}

export function subsequence($a,$s,$e) {
    var s = _first($s).valueOf() - 1,
        e = _first($e);
    return e === undefined ? $a.slice(s) : $a.slice(s, e.valueOf());
}

export function remove($a,$i) {
	let i = _first($i);
	return $a.slice(0, i - 1).concat($a.slice(i));
}

export function head($a) {
	return $a.slice(0,1);
}

export function tail($a){
	return $a.rest();
}

export function count($a){
    //console.log($a.toJS().length);
	return seq($a.count());
}

export function reverse($a) {
	return $a.reverse();
}

export function insertBefore($a,$pos,$ins) {
	var pos = _first($pos);
	pos = pos === 0 ? 1 : pos - 1;
	return $a.slice(0,pos).concat($ins).concat($a.slice(pos));
}

export function _isEmpty($i){
	return _isSeq($i) ? $i.isEmpty() : false;
}

export function empty($i){
	return seq(_isEmpty($i));
}

export function exists($i){
	return seq(!_isEmpty($i));
}

export function _wrap(fn){
	return function (v,i){
        v = seq(v);
        return fn(v);
	};
}

export function forEach(...args){
    if(args.length==1) return _partialRight(forEach,args);
	var fn = _first(args[1]);
	if(typeof fn != "function") {
		return args[0].map(function() {
			return fn;
		});
	}
	return args[0].map(_wrap(fn)).flatten(true);
}

function iteratorValue(type, k, v, iteratorResult) {
  var value = type === 0 ? k : type === 1 ? v : [k, v];
  iteratorResult ? (iteratorResult.value = value) : (iteratorResult = {
    value: value, done: false
  });
  return iteratorResult;
}

function filterFactory(iterable, predicate, context) {
    var filterSequence = Object.create(Seq.Indexed.prototype);
    var last = iterable.size;
    filterSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
        var iterator = iterable.__iterator(1, reverse);
        var iterations = 0;
        iterable.__iterate(function(v, k, c)  {
            var v2 = seq(v);
            v2._position = k+1;
            v2._last = last !== undefined ? last : iterable.get(k+1) === undefined ? k+1 : 0;
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
        return new iterator.constructor(function()  {
          while (true) {
            var step = iterator.next();
            if (step.done) {
                last = iterations;
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

export function _partialRight(fn, args){
    return function(...a) {
        return fn.apply(this, a.concat(args));
    };
}

export function filter(... args) {
    if(args.length==1) return _partialRight(filter,args);
	return filterFactory(args[0],_first(args[1]));
}

export function _wrapReduce(fn){
	return function (pre,cur,i){
        cur = seq(cur);
        return fn(seq(pre), cur);
	};
}

export function foldLeft(...args){
    if(args.length==1) return error("XPTY0004");
    if(args.length==2) return _partialRight(foldRight,args);
    var $init = seq(args[1]);
    var fn = _first(args[2]);
	return seq(args[0].reduce(_wrapReduce(fn),$init));
}

/**
 * [foldRight foldRight function]
 * @param  {Array} args [Rest params array]
 * @return {Seq|Function}      [Returns Seq OR partially applied function if arity of 2]
 */
export function foldRight(...args){
    if(args.length==1) return error("XPTY0004");
    if(args.length==2) return _partialRight(foldRight,args);
    var $init = seq(args[1]);
    var fn = _first(args[2]);
	return seq(args[0].reduceRight(_wrapReduce(fn),$init));
}

/**
 * [zeroOrOne returns arg OR error if arg not zero or one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}     [Process Error in implementation]
 */
export function zeroOrOne($arg) {
    if($arg === undefined) return seq();
    if(!_isSeq($arg)) return seq($arg);
	if($arg.size > 1) return error("FORG0003");
	return $arg;
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
export function oneOrMore($arg) {
    if($arg === undefined) return error("FORG0004");
    if(!_isSeq($arg)) return seq($arg);
	if($arg.size === 0) return error("FORG0004");
	return $arg;
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
export function exactlyOne($arg) {
    if($arg === undefined) return error("FORG0005");
    if(!_isSeq($arg)) return seq($arg);
    var s = $arg.size;
    if(s === undefined) s = $arg.count();
    if(s != 1) return error("FORG0005");
	return $arg;
}

export { Seq };
