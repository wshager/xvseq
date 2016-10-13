const assert = require('assert');
const xvseq = require("../lib/xvseq");

let s = xvseq.seq(1,2,3);

function assertEq(a,b){
	assert.deepStrictEqual(a.toJS(),b.toJS(),`${a} is not equal to ${b}`);
}
/*
assertEq(xvseq.head(s), xvseq.seq(1));
assertEq(xvseq.tail(s), xvseq.seq(2,3));
assertEq(xvseq.insertBefore(s,2,5), xvseq.seq(1,5,2,3));
assertEq(xvseq.reverse(s), xvseq.seq(3,2,1));
assertEq(xvseq.filter(s,_ => _.first()>1),xvseq.seq(2,3));
assertEq(xvseq.forEach(s,_ => _.first()+1),xvseq.seq(2,3,4));
assertEq(xvseq.foldLeft(s,1,(a,_) => a.first()+_.first()),xvseq.seq(7));
*/
assert.throws($ => assert.ifError(xvseq.exactlyOne(s)));
assert.throws($ => assert.ifError(xvseq.zeroOrOne(s)));

console.log("All tests passed");
