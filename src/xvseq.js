import { Seq } from "immutable";

import { error } from "xverr";

class StrictSeq {
    constructor(array) {
		this._isSeq = true;
        this._array = _isSeq(array) ? array._array : array instanceof Array ? array : [array];
        this.size = array.length;
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

export function seq(...a){
    if(a.length == 1 && _isSeq(a[0])) return a[0];
	return Seq(a);
}

export function toSeq($a) {
    return Seq.Indexed($a).flatten(true);
}

export function _isSeq(a){
    return Seq.isSeq(a);
}

export function _first($a){
	return _isSeq($a) ? $a.first() : $a;
}

export function subsequence($a,$s,$e) {
	var s = _first(s), e = _first($e);
	return $a.slice(s - 1, e);
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
		var $ = fn(seq(v),seq(i));
        //$._position = i;
		return $;
	};
}

export function forEach(...args){
    if(args.length==1) return _partialRight(forEach,args);
	var fn = _first(args[1]);
	if(typeof fn != "function") {
		return $seq.map(function() {
			return fn;
		});
	}
	return args[0].map(_wrap(fn)).flatten(true);
}

export function _wrapFilter(fn){
	return function (v,i){
		return !!_first(fn(seq(v),seq(i)));
        //$._position = i;
	};
}

export function _partialRight(fn, args){
    return function(...a) {
        return fn.apply(this, a.concat(args));
    };
}

export function filter(... args) {
    if(args.length==1) return _partialRight(filter,args);
	return args[0].filter(_wrapFilter(_first(args[1])));
}

export function _wrapReduce(fn){
	return function (pre,cur,i){
		var $ = fn(seq(pre),seq(cur),seq(i));
        //$._position = i;
		return $;
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
	if($arg.size > 1) return error("FORG0003");
	return $arg;
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
export function oneOrMore($arg) {
	if($arg.size === 0) return error("FORG0004");
	return $arg;
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
export function exactlyOne($arg) {
	if($arg.size != 1) return error("FORG0005");
	return $arg;
}

export { Seq };
