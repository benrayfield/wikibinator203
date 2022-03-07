

//TODO replace HashtableNode with the lambda, and just put a next pointer in the lambda itself.
//and call vm.prepay less often. and make the hashtable double in size automatically instead of allocating a 1<<24 size one at first.


/*UPDATED comment, maybe need to include in license, about mask_stackIsAllowImportEvilIds (and the opcode for that)...
Maybe it should just be an op to measure if an id has evilBit on or not (its in the first byte of a cbt if used as an id),
since otherwise I'd have to define that any id of a lambda which can import an evil id of a lambda is itself evil,
since it could just flip the bit itself (forkEdit the id bits) then call that,
but it is possible, though may be expensive, to formalVerify a lambda call to not do that, though it couldnt be as flexible of turingComplete if so.
This gets into the problem that evilBit is at least a partial solution to,
that knowing if bits are safe to give execute permission to or not (and this software NEVER gives execute permission to anything,
but opensource forks of it including possible plugins might, so be careful to avoid those possible VMs if you dont know its safe)...
knowing if its safe to give execute permission requires a halting oracle or infinite time and memory or for it to be less than turing complete,
none of which are practical, so this software just doesnt execute. But since many people insist on executing things without checking if they're safe...
Inside the sandbox (which may exist across many computers) it is safe, nomatter what evil things the lambdas may simulate,
and maybe the best that can be done is for different VMs to have a different vm.import function if they want to while NOT allowing evil
higher on the stack (!vm.mask_stackIsAllowImportEvilIds), but while allowing evil it must be deterministic.
It can be a security hole for malicious messages to be able to stop a calculation, like hiding an evil message in a good message by steganography
that is later discovered. While evil is allowed (so maybe there should be 2 bits, to lock in allowing evil while higher on stack, and one to lock it out, higher on the stack)
... while evil is allowed, there is no such way to "throw a wrench into the machine" since such wrenches all already have a unique id, as every lambda does,
	even the unexpected ones... that means that viruses etc that dont even exist yet already have a certain id. All lambdas do. At least,
		if you count the internal 2-way forest nodes as part of the lambda instead of just its param/return mapping.


/*SOLUTION to sandbox problem, though maybe not the fastest, will get musical instruments and flexible recursion in opmut working soon,
which sandbox depends on js String and js Number dont have any of these fields (m d n, etc)...:
vm.Mut = function(n){
	
	//truncate to nonnegative int n even if its string or lambda or mut etc (which if they are not a double then becomes 0).
	//in js, int or float or byte are a subset of doubles.
	this.n = n&0x7fffffff;
	
	//view as thisMut<indexOfDouble>
	this.d = new Float64Array(this.n); //TODO reuse an empty Float64Array if !this.n aka this.n==0
	
	//view as thisMut[abc] or thisMut.xyz where value of abc is 'xyz', and root namespace (in an opmut call) is a Mut (maybe with just 1 key set to the param of opmut??),
	//and a "root namespace" normally only exists for .001 to .03 seconds between one video frame and the next or multiple such calls during one,
	//or for some uses maybe much longer or as fast as a microsecond.
	this.m = {};
	
	//this.λ = null; //lambda (output of lambdize of Node) or null. or should lambda be value in Mut.m?
	
	//To make formal-verification easier and efficient, remove js prototype of fields of Mut,
	//except Object.getPrototypeOf(Mut.n) is Number, which cant be changed cuz for example 5.67 in js has no prototype pointer and is just literal bits,
	//similar to Object.getPrototypeOf('xyz') cant be changed and is always String. Number and String, of key n d or m, seem to always be undefined,
	//so will correctly throw if generated js code reads g.h.i where g.h returns a Number or a String or a lambda, but if it returns a Mut then .i is theMut.m.i
	,=//which may be undefined or have a value of string or double or lambda or Mut, and so on.
	//
	//block access to this.d.buffer and this.d.length etc in generated js code, without needing to do param|0..
	Object.setPrototypeOf(this.d,null);
	//block access to this.m.__lookupGetter__ etc in generated js code.
	Object.setPrototypeOf(this.m,null);
};

/*

FIXME, sandbox problem:
x = {}
{}
x.__lookupGetter__
ƒ __lookupGetter__() { [native code] }
..
Object.getPrototypeOf({})
{constructor: ƒ, __defineGetter__: ƒ, __defineSetter__: ƒ, hasOwnProperty: ƒ, __lookupGetter__: ƒ, …}constructor: ƒ Object()hasOwnProperty: ƒ hasOwnProperty()isPrototypeOf: ƒ isPrototypeOf()propertyIsEnumerable: ƒ propertyIsEnumerable()toLocaleString: ƒ toLocaleString()toString: ƒ toString()valueOf: ƒ valueOf()__defineGetter__: ƒ __defineGetter__()__defineSetter__: ƒ __defineSetter__()__lookupGetter__: ƒ __lookupGetter__()__lookupSetter__: ƒ __lookupSetter__()__proto__: (...)get __proto__: ƒ __proto__()set __proto__: ƒ __proto__()
x = {}
{}
...
how to fix:
x = {}
{}
Object.setPrototypeOf(x,null);
{}
x.__lookupGetter__
undefined
..
..
FIXME sandbox problem:
x = 66;
x++;
x.toString
ƒ toString() { [native code] }
cant replace prototype of a Number.
..
maybe the Mut.m and Mut.d fields are the only safe and efficient way, since Number, String, Fn/Lambda, dont have those fields. ???

NO, just stick with Mut.d and Mut.m...
/*
TODO verify this works on various browers OS etc...
newMut = n=>{ let m = new Float64Array(n); Object.setPrototypeOf(m,null); return m; };
BUT... can use it with string??? is that safe? 'abc'.concat('def')
[[[
x = new function(){}
{}
x
{}[[Prototype]]: Object
x.isPrototypeOf
ƒ isPrototypeOf() { [native code] }
x.prototype
undefined
for(let i in x) console.log(i)
undefined
x = Float32Array.of(3,4,5)
Float32Array(3) [3, 4, 5, buffer: ArrayBuffer(12), byteLength: 12, byteOffset: 0, length: 3, Symbol(Symbol.toStringTag): 'Float32Array']
y = {}
{}
for(let i in x) console.log(i)
VM439:1 0
VM439:1 1
VM439:1 2
undefined
x.buffer
ArrayBuffer(12)byteLength: 12[[Prototype]]: ArrayBuffer[[Int8Array]]: Int8Array(12)[[Uint8Array]]: Uint8Array(12)[[Int16Array]]: Int16Array(6)[[Int32Array]]: Int32Array(3)[[ArrayBufferByteLength]]: 12[[ArrayBufferData]]: 127
Object.setPrototypeOf(x, Object.getPrototypeOf({}))
Float32Array(3) [3, 4, 5]
x
Float32Array(3) [3, 4, 5]
x.buffer
undefined
x.abc = 'def';
'def'
x
Float32Array(3) [3, 4, 5, abc: 'def']
x.buffer
undefined
x.length
undefined
x
Float32Array(3) [3, 4, 5, abc: 'def']0: 31: 42: 5abc: "def"[[Prototype]]: Objectconstructor: ƒ Object()hasOwnProperty: ƒ hasOwnProperty()isPrototypeOf: ƒ isPrototypeOf()propertyIsEnumerable: ƒ propertyIsEnumerable()toLocaleString: ƒ toLocaleString()toString: ƒ toString()valueOf: ƒ valueOf()__defineGetter__: ƒ __defineGetter__()__defineSetter__: ƒ __defineSetter__()__lookupGetter__: ƒ __lookupGetter__()__lookupSetter__: ƒ __lookupSetter__()__proto__: (...)get __proto__: ƒ __proto__()set __proto__: ƒ __proto__()
x.valueOf('abc')
Float32Array(3) [3, 4, 5, abc: 'def']
x.valueOf
ƒ valueOf() { [native code] }
Object.setPrototypeOf(x, undefined)
VM1210:1 Uncaught TypeError: Object prototype may only be an Object or null: undefined
    at Function.setPrototypeOf (<anonymous>)
    at <anonymous>:1:8
(anonymous) @ VM1210:1
Object.setPrototypeOf(x, null)
Float32Array(3) [3, 4, 5, abc: 'def']
x.valueOf
undefined
x.valueOf = 'abc'
'abc'
x
Float32Array(3) [3, 4, 5, abc: 'def', valueOf: 'abc']
x[2]
5
typeof([2])
'object'
typeof(x[2])
'number'
typeof(x.valueOf)
'string'
''+x
VM1417:1 Uncaught TypeError: Cannot convert object to primitive value
    at <anonymous>:1:3
(anonymous) @ VM1417:1
newMut = n=>{ let m = new Float64Array(n); Object.setPrototypeOf(m,null); return m; };
n=>{ let m = new Float64Array(n); Object.setPrototypeOf(m,null); return m; }
z = newMut(33);
Float64Array(33) [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
z.hello = 'world';
'world'
z.me = z;
Float64Array(33) [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, hello: 'world', me: Float64Array(33)]0: 01: 02: 03: 04: 05: 06: 07: 08: 09: 010: 011: 012: 013: 014: 015: 016: 017: 018: 019: 020: 021: 022: 023: 024: 025: 026: 027: 028: 029: 030: 031: 032: 0hello: "world"me: Float64Array(33) [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, hello: 'world', me: Float64Array(33), test: 'atest']test: "atest"
z
Float64Array(33) [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, hello: 'world', me: Float64Array(33)]
z.me.me.me.test = 'atest';
'atest'
z
Float64Array(33) [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, hello: 'world', me: Float64Array(33), test: 'atest']
z.length
undefined
typeof(z)
'object'
typeof(z[22])
'number'
typeof(z.me.me[22])
'number'
typeof(z.me.me)
'object'
Object.getPrototypeOf(z)
null
for(let i in z) console.log(i);
VM2154:1 0
VM2154:1 1
VM2154:1 2
VM2154:1 3
VM2154:1 4
VM2154:1 5
VM2154:1 6
VM2154:1 7
VM2154:1 8
VM2154:1 9
VM2154:1 10
VM2154:1 11
VM2154:1 12
VM2154:1 13
VM2154:1 14
VM2154:1 15
VM2154:1 16
VM2154:1 17
VM2154:1 18
VM2154:1 19
VM2154:1 20
VM2154:1 21
VM2154:1 22
VM2154:1 23
VM2154:1 24
VM2154:1 25
VM2154:1 26
VM2154:1 27
VM2154:1 28
VM2154:1 29
VM2154:1 30
VM2154:1 31
VM2154:1 32
VM2154:1 hello
VM2154:1 me
VM2154:1 test
undefined
]]]
*/




/*
TODO start storing lambdas ONLY as concat of 3 ids: parent left right, in base58 or base64, something like this:
λeDY8pvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHjλeaaaavwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHjλebbbbvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj (a made up id)
where λe is evil/notNecessarilyGood lambda and λg is good lambda,
AND make lambdize/Node toString return
 'λeDY8pvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHjλeaaaavwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHjλebbbbvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj' etc.
 That way, anyone who has all the toString outputs of the relevant lambdas has all those lambdas without having to try all pairs of them to
 know which is the left/right child of which other, and it needs no database etc, can exist entirely in sentences written online. You can
 still write λeDY8pvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj by itself which implies whatever its left and right childs are, that hash
 (512 bits to 256 bits) to that.
TODO choose 3*(16+8) int32s as extra constants for doing 3 sha256_without_padding of 512 bits, to add the ints to the input and add the
 ints to the output,
and get 3 such (preprocessed and postprocessed) sha256 outputs of the same pair of id256, and minorityBit ~(a&b)^(b&c)^(c&a) them
 together to get a more secure hash, then take the last 192 bits of it, and prefix that with header64 as the id256 of any 2 id256s
 as its left and right childs.
TODO make musical instruments stored only like a bunch of
λeDY8pvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHjλeaaaavwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHjλebbbbvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj
but as λg... the good form since if I make the instruments myself out of only things I've made (nobody having given me lambdas to use)
then I know theres no evil in it (evilbit) but just change λg to λe later if combining it with things you cant easily verify are good.
And start playing the instruments something like http://dinahmoelabs.com/plink/ andOr puredata.
 

TODO use these...
vm.callPairPrefixByte_evilBitOn
vm.callPairPrefixByte_evilBitOff

opcodes:
bit0
bit1
l
r
t
f
λimport //(λimport anIdMaker id) -> x where (anIdMaker x)->id, and id may be a cbt256 or concat of 3 of those, and may be some text form such as base64 but if so then idMaker returns such a string as id, and idMaker contains the binary idMaker as one of its params to transform to string. This is similar to solveRecog (and solveFloat64) except its easier to optimize and is expected to look wherever lambdas may be stored such as in browser cache, harddrive, a website, or wherever vm.λimport is hooked in to look. Or, it might load a lazyEval of the lambda like a stub that looks for it if you look deeper into it.
stackIsAllowstackTimestackMem //the 2x2 kinds of clean/dirty/etc. exists only on stack. only with both isClean and isAllowSinTanhSqrtRoundoffEtc at once, is it deterministic. todo reverse order aka call it !isDirty instead of isClean?
stackIsAllowNondetRoundoff //isAllowSinTanhSqrtRoundoffEtc //the 2x2 kinds of clean/dirty/etc. exists only on stack. only with both isClean and isAllowSinTanhSqrtRoundoffEtc at once, is it deterministic. todo reverse order?
stackIsAllowMutableWrapperLambda
stackIsAllowAx (fixme, is it varargAxCall or just axa (and maybe axb?))
varargAxCall //(varargAxCall constraint ...params...) ... (varargAxCall constraint a) is halted if (constraint a)->u, and evals to v if (constraint a)->(u v), so varargAxCall chooses at each next param that it has enough params or not (vararg) and if not then what the return val is. These ax (axiom-like) constraints are a turing-complete-type-system that could for example make a list that can only contain prime numbers, or a tree that can only have a certain type of nodes in it. It takes finite time to compute, just normal forward computing, but cuz of haltingProblem, it takes on average infinity time and memory to verify, so theres a containsAxConstraint bit in header int and a stackIsAllowAx bit on stack thats also in that header int for nonhalted calls/nodes. varargAxCall tightens cleanvsdirty (higher on stack) to be deterministic (ax is deterministic, but so is not allowing ax), so you cant for example have an ax constraint about nondeterministic roundoff or about mutableWrapperLambda.
lambda //(lambda funcBody ? ?ddee a b ??? c d e) -> (funcBody (pair (lambda funcBody ? ?ddee a b ??? c d) e))
getnamedparam //ddee? would be a syntax for '(getnamedparam "ddee")', and appears like 'ddee?' .
opOneMoreParam //(lambda funcBody ? ?ddee a b ??? c d e) -> (funcBody (pair (lambda funcBody ? ?ddee a b ??? c d) e))
s
isleaf
pair
typeval
getSalt128 ignore
withSalt128 cbt128 func param
withSalt128TransformedBy funcOf128BitsTo128Bits func param
mutableSLike
ifElse condition iftrue iffalse state //if (condition state)->t then returns (iftrue state) else returns (iffalse state). todo check o8 for is it t, vs do it like pair x y t vs pair x y f? just check its opcode.
todo fill in the others.
for //...
while condition state
dowhile
varname //like typeval but its a utf8 or is it utf16? use this (or just typeval names) in ifElse for while dowhile etc. or just use typeval of string? or getnamedparam? or both?
[]= nameOb nameKey nameVal //{} in Mut
[] nameOb nameKey
<>= nameOb nameKey nameVal //Float64Array in Mut
<> nameOb nameKey
copy<>ToCbt ob key
copyCbtTo<>
new<>OfNDoubles
//new<>OfNFloats
//new<>OfNInts
//new<>OfNUbytes
isJsDoubleDuringMut getVarName
isJsStringDuringMut
funcallDuringMut func param //similar to (+ x y) it returns something instead of being a []= or <>=
	//funcallDuringMut getVarNameLvalue getVarNameFunc getVarNameParam
Math.sin //allow nondeterministic roundoff. but in pure mode you cant use this.
Math.tanh
Math.sqrt
Math.imul
...bunch more Math.something funcs...
spendTimeMemFuncParam maxstackTime maxstackMem func param
~
^
!
||
&&
*
float64+
javascriptlike+ //can do string+float64 or float64+float64 or string+string etc... careful not to get tostring of lambda unless its something that doesnt depend on id.
-
/
%
?:
!!!!!!!!!!!!! no == for fns cuz of nondeterministic partialDedup?
TODO ^= |= ~= etc?
//fixme is this the same as Math.pow: ** aka pow
Math.abs
Math.acos
Math.acosh
Math.asin
Math.asinh
Math.atan
Math.atan2
Math.atanh
Math.cbrt
Math.ceil
Math.clz32
Math.cos
Math.cosh
Math.exp
Math.expm1
Math.floor
Math.fround
Math.hypot
Math.imul
Math.log
Math.log1p
Math.log2
Math.log10
Math.max
Math.min
Math.pow
Math.round
Math.sign
Math.sin
Math.sinh
Math.sqrt
Math.tan
Math.tanh
Math.trunc
//sigmoid //todo implement using tanh andOr exp
//square
//cube
isNaN
isSubnormalNumber
isFiniteNumber
isNormedDoubleBits
...
matrixMultiplyFloat32 //(matrixMultiplyFloat32 ab bc a b c)->ac where ab and bc are bitstrings viewed as float32s, and a b and c are int sizes.
matrixMultiplyFloat64
matrixMultiplyInt32
//until more flexible opcodes are working, maybe just use gpujs for matrix multiply of float32, and do the rest in opmut.
...
asyncStartGpuFloat32CompileEarly //where to hook in GPU.js or https://github.com/benrayfield/lazycl or any GPU api that uses float32. int doesnt fit in float32 but can still be in loop counters.
asyncStartGpuFloat64AndOrIntsCompileEarly //where to hook in GPU.js or https://github.com/benrayfield/lazycl or any GPU api that uses float64 arrays andOr int arrays.
isGpuFloat32CompiledFor
isGpuFloat64CompiledFor
asyncBatchDownloadMutableWrapperLambdaEachWithBellcurveOfTimeForWhenAndHowMuchWantIt
isMutableWrapperLambdaCallDownloadedOrKnownFor
hyperquasicrystal (it cant get access to anything outside this opcode. it sees this opcode as its leaf, and infloops if called on anything not made entirely of it)
solveRecog x //returns any y where (x y)->u.
solveFloat64 x //returns any y where (x y)->float64 where the float64 is positive, and the higher the better.
getdoublefromcbtaligned64
getint...
getbyte..
getshort...
//getchar...
concat2cbt //last 1 bit in each is just past end of bitstring. concats those 2 parts then pads with 100000000... until next powOf2 size.
bize31 //the low 31 bits of the index of the last 1 bit, if its a cbt that has any 1 bit. check curriesLeft to know cbt size. biggest cbt happens at curriesLeft==1, and thats aligned so 0 or 1 has curriesLeft of maxFiniteCurriesLeft-7 aka pow(2,12)-1-7=4088 cuz 0 and 1 happen at 7 curries of u, so max bitstring size is pow(2,4088)-1 bits, including sparse matrix (uses containsbit1 which means the bize int is nonnegative. if its -2 it means bize int isnt computed yet. if its -1 it means all 0s. if its nonnegative it means a 1 bit exists and the low 31 bits of the index of the last 1 bit is that) andOr shared branches. OLD: bitstrings are limited to 2^31-1 bits so bize fits in int. you can still use a list or tree of bitstrings to make things as big as you want.
//bize53 //cuz double can do all integers in range plus/minus pow(2,53)
//bize63 //if int63
//bize4088
curriesLeft //returns a cbt16 whose low 12 bits are the number of curries left or is 4095 (0x0fff) to mean infinite curries left aka never eval).
doublesLen //same as floor(bize31/64)
floatsOrIntsLen //same as floor(bize31/32)
shortsOrCharsLen //same as floor(bize31/16)
bytesLen //same as floor(bize31/8)
containsbit1
normfloat64AllowSubnormal //will norm infinities and nans and negativeZero but leave subnormals (lowest exponent bits) as they are
normfloat64NoSubnormal //will norm infinities and nans and negativeZero but change subnormals to 0
normfloat32AllowSubnormal
normfloat32NoSubnormal
optimizationhint hint func param ???
  or just gpujslikecall
//Math.random //only works in opmut or with a different salt128 each time. whatever Math.random() does, or GPU.js's random func does. not high quality random. if you want that, derive a securehash and seed it with things like this.
//time //returns double of seconds since Y1970 utc time. only works in opmut or with a different salt128 each time.
...reservedForFutureOpcodes... //up to 128.
make sure it fits in 128 opcodes, and todo leave some space for future opcodes in forks of the opensource, but until they're added just infloop if those reservedForFutureOpcodes are called.




TODO opcode for optimizing a musical instrument, similar to how in puredata theyre made of parts that each have n inputs and m outputs, of float64s.
use Mut (which has a {} and a Float64Array.
state of an instrument part will be any combo of Muts and float64s, but no strings or lambdas (returns a lambda from the outer Mut/opMut call,
but inside opMut its just evaling javascript code as an optimization, which depends on string, Float64Array, etc,
having none of the same fields as Mut (Mut.m for map and Mut.d for double array) so that would get an undefined and throw instead of getting access to Float64Array.buffer etc.
Thats why Mut separates the map and Float64Array, and why generated code will use amut.m[] and amut.d[] instead of directly amut[].
..
Each musical instrument part will have 3 fields in its state, numbers in, numbers out, and the state it uses for whatever it wants. and maybe a stackTime counter?
These numbers in and numbers out are hooked together by the outer mut, similar to how it happens in puredata.
The musical instrument calculation, of chosen t time cycles (such as WebAudioAPI can do 256 cycles, 512 cycles, etc at once, but lambdas dont send to external sound or video, instead
external stuff would only read lambdas returned after calling lambdas on lambdas) will come in 3 parts:
* verify each musical instrument piece does not allocate anything in last part, and that each is limited to a chosen amount of stackTime in the outer mut call.
* allocate the Float64Arrays and maps and var fields in those maps.
* update state in the mut of this instrument part, such as a double loop with some if/elses and x = {,+ y? z?}.
...
These musical instrument parts are each a transform of numbers in to numbers out, such as 5 in and 3 out,
and can be shared across the internet at near lightspeed and be compiled and running as a sound transform between speakers and microphone before the speed of sound would get there
even if its a short distance, in theory,
as lambdas (normally used with stackIsAllowNondetRoundoff so can use js Math.sqrt Math.sin etc optimizations).
To compile and combine them this fast, each instrument part will be compiled separately (make an evaler (vm,l,r) from a js eval(codeString) derived from the lambdas)
and those multiple evalers will run in sequence in the outer mut call,
so for example, in theory, you could make a loud sound, throw a fourier transform algorithm to a computer thats kind of far away but can still hear the sound,
and that computer compile and run the fourier algorithm in time to hear the sound with it.

/*
TODO write my own opensource license"... most of this probably wont be in it, too indirectly related. mostly it should just say
that theres likely to be dangerous stuff in it like in the dark/deep web so dont let it out of sandbox unless you're a math expert and what could happen if you do,
and that any malicious act by anyone on your computer or resulting things is your fault for letting it out of the sandbox since all possible lambdas are allowed
and are safe inside the sandbox but not necessarily outside it sot he rules for what can be outside it should not apply to inside it
(think of the sandbox like an antivirus quarantine that lets it keep running inside),
(((this part shouldnt go in license: but as long as its in sandbox its safe, and for this reason its in a sandbox in a sandbox, the browser sandbox and inside that an inner sandbox called the wikibinator203 VM)))
and say that nobody owns the lambdas, say that in a copyleft way and explain that they're all derivative works of the universal lambda
since all paths on the left and right childs (lambdas) of each lambda lead to the universal lambda, and for all x, the lambd call (left x (right x)) equals x which makes them similar to quines.
Other than that, just copy some parts of MIT license and GNU GPL license(s), something like that, but keep it small.
See "THINGS CONSIDERING IN MAKING AN OPENSOURCE LICENSE" in comments farther down in this file.
..
*/


const wikibinator203 = (()=>{
	
	let vm = new function(){};
	
	vm.lastIdA = -1; //high 32 bits
	vm.lastIdB = -1; //low 32 bits
	//first lambda is u/theUniversalFunc and has idA and idB of 0.
	vm.incIdAB = function(){
		this.lastIdB = (this.lastIdB+1)|0; //wrap int32
		if(!this.lastIdB) this.lastIdA++; //carry
	};
	
	
	//Any datastruct other than the id of a lambda starts with this byte, and you can choose evilBit of true or false.
	//The main usecase of this is large blobs, but anything could be mounted in it such as prefix it with a contentType such as put "image/jpeg"
	//or "application/x-multicodec" (or whats their contenttype) for the https://github.com/multiformats/multicodec data format.
	//I'm not sure what other datastructs I'll put in, but it should branch by something very general first.
	//TODO create a multicodec prefix for the default kind of wikibinator203 id, or allocate a range in multicodec for that
	//(just use a big prefix so nobody else is likely to overlap it by accident or be inconvenienced by it),
	//and make a pull request on github, but dont do that until its working in a peer to peer network and the ids are well tested.
	//To wrap any data format (datastruct) in a lambda, use the typeval opcode such as (typeval "image/jpeg" bitstring)
	//or (typeval "application/x-multicodec" multicodecBitstring) or something like that.
	//Lambdas only touch lambdas. Its important for sandboxing and math consistency,
	//so things must be wrapped and used as immutable/stateless to access them from lambdas,
	//but VMs will need to store stuff and interact with various datastructs to optimize and organize things among lambdas,
	//hopefully in the form of lambdas usually, but whatever that is, prefix it by vm.prefixByteOfOther_evilBitOn andOr vm.prefixByteOfOther_evilBitOff.
	//When in doubt which you should use of evilBit being on or off, choose on since off means that by giving someone a copy of it
	//you're claiming its good and safe for other uses. Evil means "dont know if its good or evil or where between" or "not necessarily good".
	vm.prefixByteOfOther_evilBitOn =           0b11110100; //FIXME?
	vm.prefixByteOfOther_evilBitOff =          0b11110000; //FIXME?
	
	//https://en.wikipedia.org/wiki/Evil_bit
	//For wikibinator203, evilBit off means "the normal internet", and on means "antivirus quarantine, spread across many computers which apps may run inside".
	//Anyone who gives execute permission to, or obeys or believes, something in an antivirus quarantine is at fault/negligence if something goes wrong,
	//since they were told its evil and chose to do that anyways.
	//To avoid breaking the merkle garbage collector, "evil" content that has incoming pointers will not be removed,
	//and the same should be true for "good" content but things might get removed anyways cuz people demand things of eachother, and things might break in the "good" area.
	//UPDATE: instead of 0b11110[0or1]00 being callpair, and the 3 after that being id of that with byte val minus 1 (id of id of id of id for example),
	//vm.prefixByteOfOther is 0b11110[0or1]00 and callpairs start at 0b11110[0or1]01 and 0b11110[0or1]10 is "id of id"
	//and 0b11110[0or1]11 is "id of id of id" and past that you need 2 nodes of 128 literal bits each to be 256 bits.
	//such 256 bits doesnt imply it is or is not an id. Its just bits.
	vm.callPairPrefixByte_evilBitOn =          0b11110101; //FIXME? might need to rearrange these bits so its easier to write as text in base64 or base58
	vm.callPairPrefixByte_evilBitOff =         0b11110001; //FIXME?
	
	//no evilBit in literal 256 bits that fits in a 256 bit id cuz it doesnt have room for a header
	//(in this case its not its own id, but most literal 256 bits are their own id).
	vm.prefixByteOfIdOfIdOrOfAny256BitsA =     0b11110010; //FIXME?
	vm.prefixByteOfIdOfIdOrOfAny256BitsB =     0b11110110; //FIXME?
	
	//no evilBit in literal 256 bits that fits in a 256 bit id cuz it doesnt have room for a header
	//(in this case its not its own id, but most literal 256 bits are their own id).
	vm.prefixByteOfIdOfIdOfIdOrOfAny256BitsA = 0b11110011; //FIXME?
	vm.prefixByteOfIdOfIdOfIdOrOfAny256BitsB = 0b11110111; //FIXME?
	
	/*
	FIXME can it do id of id of... deeper by not having A and B? Should it? cuz the logic has to be checked for, takes time, in some ways of computing it.
	
	TODO have a sDepth in it? so you can just give {a b} and {{a b} c} instead of (s a b) and (s (s a b) c) which is the actual lambda shape???
	s is the most common lambda, so common theres a syntax for it. and maybe also prefix by t?
	
	FIXME these numbers need updating cuz theres 8 bytes above (some have an A and B, the literals that dont have an evilbit and use that bit as part of the literal).
	//Other than the 6 bytes above,
	//the 250 firstByte prefixes are 256 (or 512, depending on which idMaker) literal bits that are their own id.
	//On average, 250/256 (125/128) random 256 (or 512, depending on which idMaker) bits fit in an id the same size,
	//and 252/256 (63/64) of them fit in an id the same size even if they are not their own id.
	//2/256 (1/128) of them fit in an id the same size as them but are not their own id.
	//4/256 (1/64) of them require 2 ids of half as many literal bits each, to make a literal the same size as the id.
	*/
	
	/*
	//only for the kind of callpairs whose id starts with 11111000. If it starts with 11111001 or 11111010 or 11111011 then its a literal 256 bits but is not its own id.
	//If it does not start with 111110 then it is literal 256 bits that is its own id.
	//Starting with 11111000 means its either a callpair including 192 bits of hash or is a literal 128 bits, or 64 or 32 or 16 or 8 or 4 or 2 or 1.
	//vm.headerOfNonliteralCallPair = function(o8, curLeftOr, upTo8BitsOfMasks){
	//	return (0b11111000<<24)|((o8&255)<<16)|((curLeftOr&255))|(upTo8BitsOfMasks&255);
	//};
	//vm.headerOfNonliteralCallPair = function(o8, curriesLeft12, cleanMask4){
	vm.headerOfNonliteralCallPair = function(o8, curriesLeft12, stackIsAllowstackTimestackMem, stackIsAllowNondetRoundoff, stackIsAllowMutableWrapperLambdaAndSolve, stackIsAllowAx){
		return (vm.callPairPrefixByte<<24)|(curriesLeft12&0xfff)|(stackIsAllowstackTimestackMem?8:0)|(stackIsAllowNondetRoundoff?4:0)|(stackIsAllowMutableWrapperLambdaAndSolve?2:0)|(stackIsAllowAx?1:0);
	};
	//FIXME UPDATE: 6+2+8+12+4+1+31 cuz: FIXME go down to max 4095 params so an evaling can store the 4 bits that go on stack? cuz need those 4 bits. Halted lambdas are always clean (those 4 bits are 0).
	//FIXME its 6+2+8+16+1+31 bits. the only mask bit is in the bize int, not the header int.
	//not "teralCallPair = function(o8, curLeftOr, upTo8BitsOf". fix those params.
	*/
	
	
	//makes a header int like this: namespaceByte o8Byte curriesLeftByte maskByte.
	//evilBit is true or false.
	//curriesLeft is 0 to 255. 0 means evaling. 255 means infinite number of curries/params left so never eval.
 	//o8 is 0 to 255. 0 means evaling. 1-127 means 0-6 params of u/theUniversalFunc. opcodes 128 to 255 are known at param 7 and from then on are copied from left child.
	//upTo8BitsOfMasks are from vm.mask_* such as vm.mask_isCbt and vm.mask_stackIsAllowNondetRoundoff.
	vm.headerOfNonliteralCallPair = function(evilBit, o8, curriesLeft, upTo8BitsOfMasks){
		return ((evilBit ? this.callPairPrefixByte_evilBitOn : this.callPairPrefixByte_evilBitOff)<<24)|(o8<<16)|(curriesLeft<<8)|upTo8BitsOfMasks;
	};
	
	vm.mask_stackIsAllowstackTimestackMem = 1;
	
	vm.mask_stackIsAllowNondetRoundoff = 1<<1;
	
	vm.mask_stackIsAllowMutableWrapperLambdaAndSolve = 1<<2;
	
	//This mask_stackIsAllowAx is the evaling/nonhalted counterpart of mask_containsAxConstraint.
	vm.mask_stackIsAllowAx = 1<<3;
	
	//THIS SHOULD INSTEAD JUST BE IN the evilBit in first byte (evil good or 256(or512IfIdsAre512Bit)BitLiteralNeutral) and vm.import func,
	//and only vm.import can choose where and how to load a lambda by id, and TODO vm.import should take an idMaker param where (idMaker x) -> id of x.
	//
	//evilBit is a bit in ids, not a property of the lambdas themselves. Each lambda has 2 ids (at least, can make more kinds): evilBit being on or off.
	//If this is true, can import either. If false, only allow importing from the good namespace.
	//EvilBit is easy to parse since its evil if the first byte is vm.callPairPrefixByte_evilBitOn else (the other 255 values) are good or neutral.
	//Evilbit means "not necessarily good" and is an "antivirus quarantine" and uncensored area. It does not imply it is or is not evil.
	//vm.mask_stackIsAllowImportEvilIds = 1<<6;
	
	vm.mask_reservedForFutureExpansion4 = 1<<4;
	
	vm.mask_reservedForFutureExpansion5 = 1<<5;
	
	//Only includes things whose o8>127 aka has at least 7 params so op is known.
	//True if o8 is [vm.o8OfBit0 or vm.o8OfBit1] and is a [complete binary tree] of those,
	//so even if its all bit0s and bit1s, it could still be different heights like (((1 0) (1 1)) (1 1)) is not a cbt but (((1 0) (1 1)) ((1 1)(1 1))) is.
	//[vm.o8OfBit0 or vm.o8OfBit1] can take any params, up to about 248 (todo find exact number) of them after the first 7.
	vm.mask_isCbt = 1<<6;
	
	//anything that implies a certain lambda call halts (need to do that to verify it, which may take infinite time and memory to disprove a false claim, but always takes finite time and memory to prove a true claim).
	//This mask_containsAxConstraint is the halted counterpart of mask_stackIsAllowAx.
	vm.mask_containsAxConstraint = 1<<7;
	
	//only includes things whose o8>127 aka has at least 7 params so op is known
	//vm.mask_containsBit0 = 1<<4;
	
	//only includes things whose o8>127 aka has at least 7 params so op is known
	//vm.mask_containsBit1 = 1<<5;
	
	//FIXME are there other masks? what about ieee754 float ops vs the nearest value?
	//What about lazyevaling bize and containsBit1 and containsBit0?
	
	
	vm.headerOfLiteral256BitsThatIsItOwnId = function(firstInt){
		let first5Bits = (firstInt>>27)&0b11111;
		if(first5Bits == 0b11110) throw 'Is not its own id cuz starts with 0b11110. vm.callPairPrefixByte_evilBitOn is that then 100 and _evilBitOff is that then 000. If those last 2 bits are not 00 then its still a literal 256 bits that fits in a 256 bit id but is not its own id as the first byte differs (counts down) so you can have id of id of id of id fits in 256 bits, but id of id of id of id of id does not so you need a callpair of 2 of 128 bits. Also TODO option for 512 bit ids for extra security.';
		
		/*let firstBitIs1 = firstInt<0;
		let o8 = firstBitIs1 ? vm.o8OfBit1 : vm.o8OfBit0;
		TODO curriesLeft... choose if bitstring goes up to around pow(2,vm.maxCurries aka 0xfff) (try for YES, todo make sure design is consistent) or just goes up to 2^31 (try for NO).
		*/
		return firstInt;
	};
	
	
	
	/*UPDATED PLAN FOR HEADER INT AND BIZE INT:
	headerInt is 6+2 bits for literals vs callpair, then 8 bits of o8, then 16 bits of curriesLeft (max curriesSoFar of 2^16-2) (which you can know cbt height from).
	bizeInt is 1 bit of doesntContainBit1 then 31 bits of bize31, so if its a bitstring then the int is the the bize, and if its all 0s then the bize int is -1 and the bize31 is 0.
	cbt height ranges 0 to 31. curriesLeft tells the height, since its max someconstant+32 curries for cbt (cuz max of cbt31).
	cbtN either returns (thisCbtN thisCbtN) if its param is NOT a cbtN (same height of cbt) or (thisCbtN paramCbtN) if it is, except if its a cbt31 then it returns itself regardless of param (or todo should it infloop? or return a pair of the 2 things or some other opcode or what?
	Number of curries left is always known at 7 params. opOneMoreParam should be (u uu uu uu uu uu) as in (u uu uu uu uu uu paramName (opLambda...)),
		and that includes 
	header64: 6+2+8+16+1+31.
	*/
	
	//TODO do I want something like a cbt but for powOf2 size lists in general?
	
	
	/*TODO simplify the combo of these designs:
	o8
	curriesLeft
	opOneMoreParam
	getnamedparam
	opLambda
	opmut
	opmut inside oplambda, how it uses getnamedparam (or some wrapping or variant of getnamedparam).
	*/
	
	/*vm.o8Of_opOneMoreParam = TODO;
	
	FIXME maybe o8Of_opOneMoreParam should be moved to fewer prefix opbits so curriesLeft is always known by param number 7?
		but if so, then the varName param cant be u (and same for the (opLambda...) param but since thats only useful if the param is an opLambda thats not a problem.
		It wont know curriesLeft until (opOneMoreParam paramName (opLambda...)), so maybe it should be (u uu uu uu uu uu paramName (opLambda...)) ?
		Yes do that, and get paramsLeft from (opLambda...)'s paramsLeft plus some constant.
		Or... could expand to o10, but that seems wasteful.
		Could maybe have space for storing more of paramsLeft in header. Or do I want 5 of those bits for cbt height (which ranges 0 to 31) and a few mask bits?
			Or height in general in 6 or 7 bits and the last height value means "higher than that"?
		Or curriesSoFar (instead of storing height), either way up to some max stored val that means "higher than that"?
			
	Which bits should go in the mask in header?
	containsBit1 (this could go in the high 1 bit of the bize int (whose low 31 bits are bize31), but I'd rather not have to mask bize.
	(reserved space to put the 3 kinds of clean/dirty so 3 bits?)
	(isEvaling? dont need this since o8==0 means isEvaling.
	(isCallPair_elseIsSomethingElseSuchAsA3091BitBlob_orAMulticodecMultihash_orADataurl_orAHttpMessageDatastruct?)
	
	TODO bize int will be -1 for if it contains no 1 bit? or should it be -pow(2,31)?
	-1 means is all 0s. -2 means this bize int hasnt been set yet (lazyEval it cuz wrap arrays).
	*/
	
	//vm.maxCurries = 0xffff;
	//FIXME go down to max 4095 params so an evaling can store the 4 bits that go on stack? cuz need those 4 bits. Halted lambdas are always clean (those 4 bits are 0).
	
	
	//max finite curries left is this minus 1. curries left of u/theUniversalFunc is 7 since opcode is always known at the 7th param.
	//If aNode.curriesLeft==vm.maxCurriesLeft, that node will never eval, which happens when opOneMoreParam reaches maxCurriesLeft or opInfcur starts that way.
	//so if vm.maxCurriesLeft is 0xfff (4095) then the max curries left of a lambda to call its funcBody (on the (opOneMoreParam varNameOrComment (lambda funcBody ...)))
	//is 4094 params its waiting for, not including those its already got such as (lambda funcBodyOfVarargPlus ?a 5 ?b ?c 6 7)
	//would call (funcBodyOfVarargPlus (pair (lambda funcBodyOfVarargPlus ?a 5 ?b ?c 6) 7)).
	//(lambda funcBodyOfVarargPlus ?a 5 ?b ?c) has 2 curriesLeft (TODO fixme what about the param right after funcBody
	//in (lambda funcBody onlyGetOneParamUnlessVarargToGetMore)? is it 3 curriesLeft? maybe should ignore the onlyGetOneParamUnlessVarargToGetMore param
	//similar to how a lazyeval ignores its last param, and do all params using opOneMoreParam.
	//
	//Dont change vm.maxCurriesLeft unless you can fit it in header int, and its already packed tight using every bit, or unless you want to give up hash id bits,
	//and 192 bits of hash is already not much.
	//
	//vm.maxCurriesLeft = 0xfff;
	vm.maxCurriesLeft = 0xff;
	
	//DONE: rename to vm.maxCurriesLeft? or is it maxCurries in total? See "(opOneMoreParam varNameOrComment (lambda...)) but cant add another param cuz is already at max params" comment.
	
	vm.opInfo = []; //size 256
	
	//vm.defaultIdMaker256 = 
	//vm.defaultIdMaker512 = 
	
	//Similar to the solve op, (import idMaker id)-> any x where (idMaker x)->id. Use (import idMaker) as the import func for that kind of id.
	//Any lambda can be an idMaker if when called on any lambda it always halts and returns the same size of bits such as always 256 bits or always 512 bits,
	//and the first byte should mean the same thing among all possible kinds of ids to make it easy to parse evilBit and literals.
	vm.import = function(idMaker, globalIdStringOrBits){
		throw 'TODO instantly return a Node that it tries to load async, especially if Node.L() or Node.R() etc are called on it? So can run this in a loop for efficient batch loading of nodes/lambdas?';
	};
	
	//evilBit only affects ids. Any VM can import both good and evil lambdas. Its 2 namespaces, 2 ids for the same lambda
	//(or if its 256 literal bits that fit in a 256 bit id, its in a third "neutral" namespace cuz has no header therefore no evilBit being true or false).
	//Lambdas cant know if they are good or evil since that's just an interpretation of an observer.
	//evilBit is more of a word, something you can say about a lambda. Its also part of the opensource license
	//how they are to interact with eachother.
	//To avoid accidentally defining something as "certainly good", I'm just making all the evilBits be true for now or when they are generated,
	//and users andOr whatever tools they want, can flip the evilBit to good/false in lambdas they choose when sharing them online, if they want to.
	//UPDATE: I'm adding another bit on the stack to limit the use of the import op to "any lambda" vs "only good lambdas": vm.mask_stackIsAllowImportEvilIds.
	vm.evilBit = true;
	
	
	
	
	
	
	
	
	
	
	
	
	
	vm.overlappingBufferInts = new Int32Array(2);
	vm.overlappingBufferDouble = new Float64Array(vm.overlappingBufferInts.buffer);
	//FIXME do they overlap as bigEndian or littleEndian, and is it per int or per byte or what? Make it consistent across all systems,
	//and I would prefer bigEndian unless most or all systems already do littleEndian in browser.
	
	vm.isLambda = function(thing){
		//FIXME some rare times there could be false positive.
		return thing.n && typeof(thing)=='function';
	};
	
	vm.wrapInTypeval = function(thing){
		if(vm.isLambda(thing)) return thing;
		throw 'TODO';
	};
	
	vm.wrapRaw = function(thing){
		if(vm.isLambda(thing)) return thing;
		switch(typeof(thing)){
		case 'number':
			//FIXME prefix it with (typeval 'application/x-ieee754-double'). No, do that in wrapInTypeval.
			vm.overlappingBufferDouble[0] = thing;
			let ints = Int32Array.of(vm.overlappingBufferInts[0], vm.overlappingBufferInts[1]); //FIXME bigendian vs littleendian and of ints vs bytes??
			let node = new vm.Node(this, null, null, ints, 0, 2);
			console.log('FIXME put in dedup map'); //FIXME FIXME FIXME!!!!
			return vm.lambdize(node);
		break; case 'string':
			throw 'TODO prefix it with (typeval "text/plain;charset=utf-8") ?';
		break;default:
			throw 'TODO';
		}
	};
	

	//the datastruct of forest of lambdas, each with 2 childs (Node.l and Node.r, which are the lambdize wrappers of Node) where all paths lead to the universal lambda.
	//lambdize means to wrap a Node in a lambda. Node is the internal workings of a lambda.
	//
	vm.Node = function(vm,l,r,optionalBlob,optionalBlobFrom,optionalBlobTo){ //TODO rename these params to myL and myR cuz l and r are opcode names. its ok to keep this.l and this.r.
		
		//TODO "header64: 6+2+8+16+1+31", see comment about it.
		
		this.l = l;
		this.r = r;
		
		let isLeaf = r==null;
		
		
		//allow isEvaling as a datastruct, but in this implementation of wikibinator203 that wont happen since
		//evalers take 3 params: vm func param, instead of making a node of func and param together.
		//In case other implementations want to have nodes that are evaling (maybe to display them on screen as a directed graphics
		//with green arrow pointing at left child, blue arrow pointing at right child, and red arrow pointing at what it evals to (itself if is halted, or another lambda,
		//or to (s i i (s i i)) if its known that it doesnt halt, for example.
		//if(isEvaling) throw 'Dont eval here, use aLambda().getEvaler() aka aNode.getEvaler()';
		
		
		let curriesLeft;
		let op;
		if(isLeaf){
			op = 1; //u/leaf, the universal lambda
			curriesLeft = 7; //eval again at 7 just to store what op it is in header. Nothing actually evals at 7 params.
		}else{
			
			let lNode = l(); //FIXME if !l (this is u) then "this.evaler = l ? lNode.evaler : vm.rootEvaler" kind of checks need to happen before calling l() to get lNode.
			let rNode = r();
			let leftOp = lNode.o8();
			let rightOp = rNode.o8();
			let lcur = lNode.curriesLeft();
			let isLessThan7Params = leftOp < 64; //including (l r)
			let leftOpLessThan128 = leftOp < 128;
			let chooseOpNowOrEval = lcur==1;
			let isNowGettingIts7thParam = leftOpLessThan128 && chooseOpNowOrEval;
			/*let rightIsCbt = (rightOp == vm.o8OfBit0 || rightOp == vm.opOfBit1);
			let isEvaling;
			let leftIsCbt = (leftOp == vm.o8OfBit0 || leftOp == vm.opOfBit1);
			if(leftIsCbt){
				let rightIsCbt = (rightOp == vm.o8OfBit0 || rightOp == vm.opOfBit1);
				let rcur = rNode.curriesLeft;
				//If its 2 cbts of same size that together dont exceed max cbt size, thats halted, just make the callpair.
				//If it would exceed max cbt size or they are different sizes of cbt or if r is not a cbt, thats evaling (TODO choose a design to infloop or replace r with l so (r r), and maybe if cbt size gets too big just put it in an infcur).
				isEvaling = !rightIsCbt || (lcur!=rcur) || lcur==4094; //curriesLeftRaw of 4095 means infinite curriesLeft, and cbt never reaches that (todo put in infcur instead?)
			}else{
				isEvaling = !leftOpLessThan128 && chooseOpNowOrEval;
			}*/
			let isEvaling = !leftOpLessThan128 && chooseOpNowOrEval;
			
			if(isEvaling){
				op = 0;
			}else if(leftOpLessThan128){
				//curriesLeft = lcur-1;
				
				//less than 7 params so far. Op is not known until 7 params. Shift the op bits up 1 and put a 0 (if r is leaf) or 1 (if r is not leaf) in
				if(rightOp == 1){
					op = leftOp<<1; //r is leaf, put in 0
				}else{
					op = (leftOp<<1)|1; //r is not leaf, put in 1
				}
			}else{
				//if l and r are 2 cbts of same size that would not exceed max cbt size, that happens here, just make the callpair. or it may not be a cbt here.
				op = leftOp; //copy op from l child since op is known at 7 params and is just copied from left child after that
			}
			
			if(isLessThan7Params){
				curriesLeft = lcur-1; //at least 1
				//TODO?? use throw vm.o8ToNumParams[this.op];? it could be computed either way, but lcur-1 is probably faster???
			}else if(isNowGettingIts7thParam){
				if(op == vm.o8Of_opOneMoreParam){ //the only vararg op
					//(opOneMoreParam varNameOrComment lambdaCallToAddParamTo), not including (opOneMoreParam varNameOrComment lambdaCallToAddParamTo ...params...) since lambdaCallToAddParamTo is the 7th param and varNameOrComment is the 6th param
					//(neither can be u/leaf since that would be a different op, and I designed it to always know the number of params by the 7th param.
					let varNameOrComment = lNode.r;
					let lambdaCallToAddParamTo = r;
					let lambdaNumCurries = lambdaCallToAddParamTo().curriesLeft();
					//let newNumCurries = lambdaCallToAddParamTo().curriesLeft()+1;
					if(lambdaNumCurries < vm.maxCurries){ //(opOneMoreParam varNameOrComment (lambda...)) as usual, and later (opOneMoreParam varNameOrComment (lambda...) ...put more params here...).
						curriesLeft = lambdaNumCurries+1; //if curriesLeft==vm.maxCurries, then it will never eval, similar to infcur
					}else{
						//(opOneMoreParam varNameOrComment (lambda...)) but cant add another param cuz is already at max params.
						//also cant infloop or throw like running out of gas, cuz the number of params is always known at the 7th param,
						//and in that case (lambda...) is the 7th param, and varNameOrComment is the 6th param.
						//So what should this do? It shouldnt call the funcBody found deep inside the (lambda funcBody ...),
						//cuz funcBody expects the number of params to match the number of opOneMoreParam its inside plus a certain constant (TODO which constant? 5? 8? etc),
						//and it would be confusing for other lambdas to get a (opOneMoreParam varNameOrComment (lambda...))
						//as a param if it has less curriesLeft than as if it hadnt reached the max.
						//I dont want to infloop (aka throw cuz would run out of gas if did the infloop) cuz 7 params should be halted.
						//I dont want to use curriesLeft==vm.maxCurries to mean an unlimited number of curries left (never eval)
						//cuz theres some number of curries already (a variable amount cuz some came in).
						//I choose this design: rename vm.maxCurries to vm.maxCurriesLeft, and if aNode.curriesLeft==vm.maxCurriesLeft that means infinity (never eval).
						newNumCurries = vm.maxCurries; //never eval, similar to infcur
					}
				}else{ //not vararg. set curriesLeft to the constant number of params the op takes, of 128 ops (o8 is 128 to 255).
					curriesLeft = vm.opInfo[op].curriesLeft;
				}
			}else{ //is more than 7 params, so op is copied from left child. need to check if its about to eval
				if(isEvaling){
					curriesLeft = 0; //in case lcur-1 is -1 which could happen if l (left lambda child) isEvaling.
				}else{
					if(lcur == vm.maxCurriesLeft){
						curriesLeft = lcur; //never eval. This happens when enough opOneMoreParam of opOneMoreParam... reach vm.maxCurriesLeft or opInfcur starts at vm.maxCurriesLeft.
					}else{
						curriesLeft = lcur-1; //r is the next curry, so count 1 less
					}
				}
			}
		}
		//DONE but todo test: set curriesLeft and o8 and make header from it. the above code doesnt always set those. header also contains 6+2 bits for literal cbt256.
		
		/* FIXME use these masks, but TODO how to choose which of them applies here? take param of Node constructor?
		vm.mask_stackIsAllowstackTimestackMem
		vm.mask_stackIsAllowNondetRoundoff
		vm.mask_stackIsAllowMutableWrapperLambdaAndSolve
		vm.mask_stackIsAllowAx
		vm.mask_reservedForFutureExpansion4
		vm.mask_reservedForFutureExpansion5
		vm.mask_isCbt
		vm.mask_containsAxConstraint
		*/
		let upTo8BitsOfMasks = 0; //FIXME, shouldnt always be 0
		
		this.header = vm.headerOfNonliteralCallPair(vm.evilBit, op, curriesLeft, upTo8BitsOfMasks);
		
		/*TODO order the params of headerOfNonliteralCallPair the same order they occur in the header int,
			and include the 4 bits of cleanvsdirty, and these: containsBit1 containsBit0, containsAxConstraint, containsNonBitOtherThanLessThan7Params,
			and I might want another cleanvsdirty bit for IEEE754 float32 and float64 ops but only if they can be defined deterministicly,
			so that even if Math.sin Math.tanh etc are nondeterministic roundoff, that there would be some
			welldefined correct answer of 128 bits to 64 bits (double,double)->double, vs the only welldefined way (at max cleanness) being whatever double
			value is closest to if it had been done with infinite precision. Some (double,double)->double seem to always match between
			javascript and java and across multiple computers (and should be tested in more systems),
			such as double*double and double+double, but double/double seems less reliable.
			In any case, an unlimited number of new "opcodes" can be added to the system,
			and optimized by making a node.evaler for a group of them or for each (and such evaler may be made of the opmut (uses vm.Mut datastruct)
			so could in theory be compiled at runtime to javascript instead of needing to modify the VM).
			If need another bit, there is a bit left in bize int since only low 31 bits of bize are stored, but maybe that bit should say that theres more bits or not,
			but thats unnecessary since curriesLeft is stored, and since max bitstring size is (approx, todo verify) 2^247-1 bits (vm.maxCurriesLeft is 255),
			the bit of is there more bits of bize is already knowable from [curriesLeft and o8].
			Or that high bit in bize int is used for lazyEval of bize, so dont put anything there.
		*/
			
		//int. 6 bits are 111110 for is literal self or not. then 2 bits (00 is callpair, else is literal 256 bits).
		//then o8. then curriesLeftOr255ToMeanMoreThan254. then up to 8 mask bits (containsBit1, etc).
		//this.header = vm.headerOfNonliteralCallPair(vm.evilBit, op, upTo8BitsOfMasks, curriesLeft); //FIXME check if it is a literal (globalId256 does not start with 11111000).
		//this.header = 0; //FIXME need to compute header as int
		
		//FIXME instead of -1 meaning the following comments about bize, use containsBit1 containsBit0, containsNonBitOtherThanLessThan7Params.
		//int. bize is max 31 bits. past that it will make linkedlist or something (todo) of cbts.
		this.bize = -2; //-2 means dont know bize yet (lazyEval). -1 means its all 0s or is not a cbt. nonnegative means its the low 31 bits of the index of the last 1 bit. FIXME TODO write code to deal with that in blob and normal callpairs
		//FIXME set bize
		
		vm.incIdAB(); //change vm.lastIdA and vm.lastIdB.
		//The 4 ints of localId, used in hashtable (TODO that would be more efficient than {} with string keys for https://en.wikipedia.org/wiki/Hash_consing
		this.idA = vm.lastIdA
		this.idB = vm.lastIdB;
		this.blobFrom = optionalBlobFrom | 0; //int. TODO
		this.blobTo = optionalBlobTo | 0; //int. TODO
		
		//this.blob = TODO null or Int32Array.
		//The id of the blob is this.idA with this.idB. Every node with that id64 has the same blob and may differ in blobFrom and blobTo.
		this.blob = optionalBlob; //TODO null or Int32Array.
		
		//this.idString;
		
		this.evaler = l ? l().evaler : vm.rootEvaler; //u/theUniversalFunction's evaler is vm.rootEvaler, but everything else copies its evaler from its l child, which may be optimized evalers added later.
		
		//this.prototype.prototype = vm;

	};
	
	//index is in units of ints, not bits. Node.blob is always a Int32Array. always 0s outside range.
	//If blobFrom<blobTo then blob exists.
	vm.Node.prototype.intAt = function(index){
		if(index < this.blobFrom || this.blobTo <= index) return 0;
		return this.blob[index];
	};
	
	//index is in units of ints
	vm.Node.prototype.doubleAt = function(index){
		//FIXME bigEndian or littleEndian and of ints or bytes etc?
		return vm.twoIntsToDouble(this.intAt(index), this.intAt(index+1));
	};
	
	//as double
	vm.Node.prototype.d = function(){
		return this.doubleAt(0);
	};
	
	vm.twoIntsToDouble = function(high32, low32){
		//FIXME bigEndian or littleEndian and of ints or bytes etc?
		vm.overlappingBufferInts[0] = high32;
		vm.overlappingBufferInts[1] = low32;
		return vm.overlappingBufferDouble[0];
	};
	
	//can say duplicate forest shapes are not equal, but if forest shape differs then they certainly dont equal.
	//For perfect dedup, use 256 bit or 512 bit global ids which are lazyEvaled and most nodes never need one.
	vm.Node.prototype.equalsByLazyDedup = function(otherNode){
		return this.hashInt==otherNode.hashInt && this.idB==otherNode.idB && this.idA==otherNode.idA && this.blobFrom==otherNode.blobFrom && this.blobTo==otherNode.blobTo;
	};
	
	//The node form of lambda x is x(), such as x().curriesLeft() or x().o8().
	vm.Node.prototype.equalsByLazyDedupOf2ChildNodes = function(otherLNode,otherRNode){
		//FIXME if lazy load .l and .r, then need to call .L() and .R() to lazy load them first. but that wont happen until a much later version of this VM.
		//TODO optimize by using Node instead of the lambdize wrapper of it so can use this.l. instead of this.l(). etc? Or put those funcs in the lambdized form?
		return this.l().equalsByLazyDedup(otherLNode) && this.r().equalsByLazyDedup(otherRNode);
	};
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	//3 times bigger if so, but has the advantage that you only need the toString outputs of all the relevant lambdas
	//to copy all those lambdas to another computer without needing to try many pairs of them to find what is the
	//left and right childs of which of them so its squared times faster but 3 times more storage. There are of course faster ways if you store many
	//of them together, but each [parent left right] can be written in a sentence on a forum as a self contained lambda
	//that tells you what other lambdas to look for (maybe in other sentences or big lists of such [parent left right] on IPFS or something, to find them.
	vm.nodeToStringIncludesChilds = true;
	
	//else localId which is 2 ints of autoIncrement and 2 ints of from and to index in a wrapped array if there is such an array.
	vm.nodeToStringIsGlobalId = true;
	
	vm.nodeToStringPrefix = 'λ';
	
	//just 1 of parent left right. nodeToString may concat 3 of these or just use parent.
	vm.nodeToStringOne = function(){
		let evilbitStr = 'TODOEVILBITSTR';
		if(vm.nodeToStringIsGlobalId === undefined) throw 'FIXME bind or what? this is getting disorganized for some funcs to be in vm and some in vm.Node.prototype';
		if(vm.nodeToStringIsGlobalId){
			throw 'TODO globalId and toString of it';
		}else{
			//TODO? return vm.nodeToStringPrefix+evilbitStr+this.slowLocalId();
			return vm.nodeToStringPrefix+evilbitStr+this.slowLocalId();
		}
	};
	
	vm.nodeToString = function(node){
		if(vm.nodeToStringIncludesChilds === undefined) throw 'FIXME bind or what? this is getting disorganized for some funcs to be in vm and some in vm.Node.prototype';
		if(nodeToStringIncludesChilds) return vm.nodeToStringOne(node);
		else return vm.nodeToStringOne(node)+vm.nodeToStringOne(node.L())+vm.nodeToStringOne(node.R());
	};
	
	//vm.base58Digits = 
	
	//true/false. TODO always store it as evil (since thats the most general, allowing (probably accidental) evil, good, and neutral), and just view it as good if requested.
	//literal 256 bits that fits in a 256 bit id (or similar for 512 bit ids) have evilBit==false. Theres just not room in them for even 1 bit of metadata. They have no header,
	//but they're small enough they they probably cant cause much of a problem. Combining 2 or more of them requires a node capable of having evilBit (true or false)
	//so its really a statement about a max of 256 or depending on id size 512 bits. Literals that do have a value, such as 1 2 4 8 16 32 64 or 128 bits, do have header,
	//so can have evilBit, even though its probably not very useful in such small literals.
	//If that becomes a problem, a new kind of id can be derived that always has header so can always have evilBit, by storing at most 128 bits of literal in a 256 bit id.
	vm.evilBitOf = function(headerInt){
		return (headerInt>>24)&0xff == vm.callPairPrefixByte_evilBitOn; //a certain value of first byte. literal256thatfitinid or callPairPrefixByte_evilBitOff return false.
		/*vm.callPairPrefixByte_evilBitOn =  0b11110100; //FIXME might need to rearrange these bits so its easier to write as text in base64 or base58
		vm.callPairPrefixByte_evilBitOff = 0b11110000; //FIXME
		return (this.evilBitMaskOfHeaderInt&headerInt)?true:false;
		*/
	};
	
	//true/false. TODO always store it as evil (since thats the most general, allowing (probably accidental) evil, good, and neutral), and just view it as good if requested.
	vm.Node.prototype.evilBit = function(){
		return vm.evilBitOf(this.header);
	};
	
	/*
	TODO remove the mask_stackIsAllowImportEvilIds and just check for a certain prefix to know if its evil (call pair), good (call pair), or neutral (254 of them for 256 bit literals) namespace. Have vm.evilBit be true or false, and just use them as separate namespaces for generating ids, but allow import of any of them that vm.import func says to. User can replace vm.import function if they want. By default its not able to find anything, but future versions of this VM might hook into a peer to peer network if user checks a checkbox saying it can, andOr you can run a server with 50 people playing a game and sharing lambdas together in realtime, however you want to organize the sending and receiving of lambdas. There should be a kind of gas vm.gasUpload gasDownload or gasNetwork something like that. There should be a kind of gas* counted for each compute resource used, not a cryptocurrency just a local count of it to divide compute resources among lambdas. Or maybe the 50 remote players using such an experimental server together can have gas* on that server that lasts only as long as the game is running, like an hour. Players can copy/paste lambdas between different such servers andOr eachother.
	//stateful short-term way to upload and download stateless lambdas, such as between 50 players in a game together for an hour.
	vm.Server = function(){
		TODO
		
		TODO use mutableWrapperLambda?
		
		TODO gasUpload gasDownload stackTime stackMem, per user (by ed25519 or just secret url suffix?)? TODO recursiveExpireTime? zapeconacyc?
		
		join game by https://someaddress/passwordWfghsdf/roomXYZ ? way to move gas* from one place to another (by mutableWrapperLambda or by url?)
		no, make the url something shareable so https://someaddress/roomXYZ ?
		https://someaddress/lambda/id234wer324wr5sadrefasddfid234345id2343245324 ?
		
		
	};*/
	
	vm.stackTime = 1000000; //fill these back up before starting another call at bottom of stack, to avoid running out, but not until the stack becomes empty.
	vm.stackMem = 1000000;

	vm.gasErr = 'gasErr';

	vm.prepay = function(time,mem){
		let newTime = this.stackTime-time;
		let newMem = this.stackMem-mem;
		if(newTime <= 0 || newMem <= 0) throw this.gasErr;
		this.stackTime = newTime;
		this.stackMem = newMem;
		return undefined; //so you can || it with things for shorter lines of code
	};
	
	vm.prepay1Time = function(){
		if(!this.stackTime) throw this.gasErr;
		this.stackTime--;
	};
	
	vm.prepay1Mem = function(){
		if(!this.stackMem) throw this.gasErr;
		this.stackMem--;
	};
	
	//true or false
	vm.Node.prototype.isCbt = function(){
		return !!(this.header&vm.mask_isCbt);
	};
	
	//true or false
	vm.Node.prototype.containsAxConstraint = function(){
		return !!(this.header&vm.mask_containsAxConstraint);
	};
	
	vm.Node.prototype.getEvaler = function(){
		let evaler = this.evaler;
		if(!evaler) throw 'No evaler in thisNode='+this; //TODO optimize by removing this line since all Nodes will have evalers
		while(!evaler.on) evaler = evaler.prev;
		return evaler;
	};
	
	vm.Node.prototype.isLeaf = function(){
		return this.o8()==1;
	};

	
	//u().evaler starts as rootEvaler, but everything elsew uses pushEvaler.
	vm.Node.prototype.pushEvaler = function(evaler){
		if(evaler.on === undefined) evaler.on = true;
		evaler.prev = this.evaler;
		this.evaler = evaler;
	};
	
	vm.Node.prototype.o8Of = headerInt=>{
		return (headerInt>>16)&0xff;
	};
	
	//8 bit opcode, a bitstring of 0-7 bits then a high 1 bit. its 1 for u, and is 2*o8 or 2*o8+1 or o8 for next curry.
	//If o8 < 128 then full opcode isnt known yet, so its 2*o8 if r is u, and its 2*o8+1 if r is not u. Else o8 is just copied from l child.
	vm.Node.prototype.o8 = function(){
		return this.o8Of(this.header);
	};
	
	vm.Node.prototype.firstByteOf = function(headerInt){
		return (headerInt>>24)&0xff;
	};

	vm.Node.prototype.firstByte = function(){
		return this.firstByteOf(this.header);
	};
	
	vm.Node.prototype.isCbtOf = function(headerInt){
		//let o8 = this.o8();
		//return o8 == vm.o8OfBit0 || o8 == vm.o8OfBit1;
		//return (headerInt&0x00fe0000)==vm.o8OfBit0;
		return !!(headerInt&vm.mask_isCbt);
	};
	
	vm.Node.prototype.isCbt = function(){
		return this.isCbtOf(this.header);
	};
	
	
	//header int is like: namespaceByte o8Byte curriesLeftByte maskByte
	
	vm.Node.prototype.curriesLeft = function(){
		return this.curriesLeftOf(this.header);
	};
	
	vm.Node.prototype.curriesLeftOf = function(headerInt){
		return (headerInt>>8)&0xff;
	};
	
	
	/*
	vm.Node.prototype.curriesLeft = function(){
		return this.curriesLeftOf(this.header);
	};
	
	vm.Node.prototype.curriesLeftOf = function(headerInt){
		if(this.isCbtOf(headerInt)) return 1; //pow(2,4088-rawCurriesLeft) is number of bits in cbt, and curriesLeft is always 1 for cbt.
		return this.rawCurriesLeftOf(headerInt); //rawCurriesLeft is number of curries left.
	};
	
	
	//raw means just get the 12 bits without checking if its cbt or not.
	//1 to 4094 if finite number of curries left, or 4095 for infinity curries left (never eval). or in some implementations 0 means evaling now.
	vm.Node.prototype.rawCurriesLeftOf = function(headerInt){
		return this.header&0xff;
	};

	//raw means just get the 12 bits without checking if its cbt or not.
	//1 to 4094 if finite number of curries left, or 4095 for infinity curries left (never eval). or in some implementations 0 means evaling now.
	//
	//curriesLeft is 12 bits and means 2 different things depending if its a cbt or not.
	//if cbt, curriesLeft is always 1, and height is 4088-uint12. It enforces that l and r childs are cbts of the same size.
	//If not cbt, then those 12 bits are the number of curries left.
	//
	vm.Node.prototype.rawCurriesLeft = function(){
		return this.curriesLeftOf(this.header);
	};*/

	vm.Node.prototype.toString = function(){
		return this.vm.nodeToString(this);
		//return this.slowLocalId();
		//TODO 1 char prefix concat base58 form of 256 bit default kind of id, recursively.
	};

	/*vm.Mut = function(n){
		this.m = {};
		this.d = new Float64Array(n);
	};*/
	
	//SOLUTION to 1 of the sandbox problems,
	//though maybe not the fastest, will get musical instruments and flexible recursion in opmut working soon,
	//which sandbox depends on js String and js Number dont have any of these fields (m d n, etc)...:
	vm.Mut = function(n){
	
		//truncate to nonnegative int n even if its string or lambda or mut etc (which if they are not a double then becomes 0).
		//in js, int or float or byte are a subset of doubles.
		this.n = n&0x7fffffff;
		
		//view as thisMut<indexOfDouble>.
		//This is normally copied from Node.blob which is an Int32Array. Can get Int32Array.buffer and wrap that same buffer in a Float64Array.
		//In opmut, contents of .d and of .m are mutable, but in lambdas everything (except lazyEval cache of Node.bize etc) is used as immutable,
		//including that Node.blob is used as immutable even though it may technically be mutable but dont write it. ForkEdit only.
		this.d = new Float64Array(this.n); //TODO reuse an empty Float64Array if !this.n aka this.n==0
		
		//view as thisMut[abc] or thisMut.xyz where value of abc is 'xyz', and root namespace (in an opmut call) is a Mut (maybe with just 1 key set to the param of opmut??),
		//and a "root namespace" normally only exists for .001 to .03 seconds between one video frame and the next or multiple such calls during one,
		//or for some uses maybe much longer or as fast as a microsecond.
		//Cycles are allowed in Mut.m that lead to that same Mut etc, but only during opmut
		//which is designed to be optimized by compiling to javascript code.
		//Lambdas cant have cycles while halted, but can eval in cycles or forever expanding etc.
		this.m = {};
		
		//this.λ = null; //lambda (output of lambdize of Node) or null. or should lambda be value in Mut.m?
		
		//To make formal-verification easier and efficient, remove js prototype of fields of Mut,
		//except Object.getPrototypeOf(Mut.n) is Number, which cant be changed cuz for example 5.67 in js has no prototype pointer and is just literal bits,
		//similar to Object.getPrototypeOf('xyz') cant be changed and is always String. Number and String, of key n d or m, seem to always be undefined,
		//so will correctly throw if generated js code reads g.h.i where g.h returns a Number or a String or a lambda, but if it returns a Mut then .i is theMut.m.i
		//which may be undefined or have a value of string or double or lambda or Mut, and so on.
		//
		//block access to this.d.buffer and this.d.length etc in generated js code, without needing to do param|0..
		Object.setPrototypeOf(this.d,null);
		//block access to this.m.__lookupGetter__ etc in generated js code.
		Object.setPrototypeOf(this.m,null);
	};
	
	
	//FIXME where do blobs go in here, that dont have a left and right child yet cuz its lazy and creating the top of the blob as wrapper node?
	
	//TODO faster localIds instead of strings in map. use an Int32Array and a [], or something like that, for faster hashtable specialized in Nodes.
	vm.dedupMap = {};
	//FIXME put u in dedupMap
	
	/*vm.HashtableNode = function(val,next){
		this.val = val;
		this.next = next;
	};*/
	
	//TODO this replaces vm.dedupMap, doesnt create strings, and uses Node.idA .idB .blobFrom and .blobTo from 2 Nodes (8 ints) as key and parent Node as value.
	//Its a linked hashtable, containing vm.HashtableNode's whose .val is Node. Similar will be done for funcallCacheMap somewhere else. Or nulls?
	vm.dedupHashtable = [];
	for(let i=0; i<(1<<24); i++) vm.dedupHashtable.push(null); //TODO expand as needed, doubling size each time?
	vm.dedupHashtableMask = vm.dedupHashtable.length-1; //only works if its a powOf2.
	
	//vm.dedupHashtableBucket = (nodeA,nodeB)=>(vm.hash2Nodes(nodeA,nodeB)&vm.dedupHashtableMask);
	

	//TODO faster localIds instead of strings in map. use an Int32Array and a [], or something like that, for faster hashtable specialized in nodes.
	vm.funcallCacheMap = {};

	/*
	//TODO remove this
	vm.dedupKeyOfNode = function(isLeaf,func,param){
		//TODO see comment "dont concat strings to create key" in similar code.
		this.prepay(1,2); //FIXME?
		return isLeaf+"_"+func().slowLocalId()+"_"+param().slowLocalId();
	};
	*/
	
	//TODO use faster hashtable specialized in things having 4 ints.
	vm.Node.prototype.slowLocalId = function(){
		//TODO see comment "dont concat strings to create key" in similar code.
		//FIXME need to pay this somewhere but dont have vm param here: vm.prepay(1,2);
		return this.idA.toString(16)+"_"+this.idB.toString(16)+"_"+this.blobFrom.toString(16)+"_"+this.blobTo.toString(16);
	};

	//FIXME must have 4 ints of salt and 3 bits of kinds of clean, on stack, for funcall cache.
	vm.dedupKeyOfFuncallCache = function(func,param,optionalStackStuff){
		//TODO dont concat strings to create key. just look it up without creating heap mem, in a hashtable specialized in 128+128 bit keys (128 bits of localId per lambda).
		//But until then, dedupKeyOfFuncallCache will prepay to include stackMem, instead of just stackTime.
		this.prepay(1,4); //FIXME?
		return "cache_"+func().slowLocalId()+"_"+param().slowLocalId()+"_"+(optionalStackStuff || vm.defaultStackStuff);
	};


	//increases every time any FuncallCache is used, so can garbcol old funcallcaches.
	vm.touchCounter = 0;
	
	const twoPow32 = Math.pow(2,32);
	const randInt = ()=>(Math.floor(Math.random()*twoPow32)|0); //FIXME does this make negatives ever? Its supposed to.
	const hashIntSalts = new Int32Array(13);
	const hashingInts = new Int32Array(9); //put 8 ints in here (5 from each of 2 Nodes) starting at index 0 to hash, and get the hash from index 8.
	for(let i=0; i<hashIntSalts.length; i++) hashIntSalts[i] = randInt();
	
	//random int from pow(2,30) to pow(2,31)-1, to mod hash ints by so bigger digits hash into all digits not just the small digitis.
	//Max hashtable size is pow(2,30) cuz of this, and cuz it has to be a powOf2 size so can efficiently mask lambda.hashInt to get bucket.
	//But since each node can potentially contain an Int32Array of up to (todo somewhere around, whats the exact max) pow(2,31) bits,
	//including that some nodes share the same array, it can still reach 64 bit sizes
	//such as if the browser supports using a terabyte or petabyte of RAM, or if this VM is ported to other systems that can.
	//Its normally a very low memory system, but depends how you use it.
	hashIntSalts[8] = (hashIntSalts[8]&0x7fffffff)|(1<<30);
	hashIntSalts[12] = (hashIntSalts[12]&0x7fffffff)|(1<<30);
	
	vm.hash3Ints = (a,b,c)=>(((Math.imul(a,hashIntSalts[9]) +  Math.imul(b,hashIntSalts[10]) + Math.imul(c,hashIntSalts[11]))%hashIntSalts[12])|0);
	
	vm.hash2Nodes = (a,b)=>{
		//TODO find some way to not check this IF just for u. its slowing down all the hashing.
		
		//FIXME verify a is identityfunc and b is u.
		
		
		if(!a || (!b.idA && !b.idB)) return 1; //u doesnt have l and r childs when its created. those are added soon after, but hashtable is used first. TODO optimize by just setting u.hashInt andOr u().hashInt. the 2 childs of u will be identityFunc and u.
		hashingInts[0] = a.idA;
		hashingInts[1] = a.idB;
		hashingInts[2] = a.blobFrom;
		hashingInts[3] = a.blobTo;
		hashingInts[4] = b.idA;
		hashingInts[5] = b.idB;
		hashingInts[6] = b.blobFrom;
		hashingInts[7] = b.blobTo;
		hashingInts[8] = 0;
		for(let i=0; i<8; i++) hashingInts[8] += Math.imul(hashingInts[i],hashIntSalts[i]); //dotProd with onceRandomAtJsBoot salts
		return hashingInts[8]%hashIntSalts[8];
	};
	
	/*
	vm.hash10Ints = (d,e,f,g,h,i,j,k,l,m)=>(
		d*hashIntSalts[0]
		+ e*hashIntSalts[1]
		+ f*hashIntSalts[1]
		+ g*hashIntSalts[1]
		+ h*hashIntSalts[1]
		+ i*hashIntSalts[1]
		+ j*hashIntSalts[1]
		+ k*hashIntSalts[1]
		+ l*hashIntSalts[1]
		+ m*hashIntSalts[1];
		a*vm.hashIntSaltA + b*vm.hashIntSaltB + c*vm.hashIntSaltC
	);*/

	//TODO use Node.lazyReturn, as a different way of funcall caching, but this way with the touch uses less memory and is a little faster.
	//but as a demo of the math, make both ways work. it can be done without this kind of FuncallCache at all.
	vm.FuncallCache = function(func,param,optionalStackStuff){
		this.func = func;
		this.param = param;
		this.stackStuff = optionalStackStuff || vm.defaultStackStuff;
		this.ret = null; //func, param, and ret, are all what lambdize returns.
		this.touch = ++this.touchCounter; //for garbcol of old funcallcaches
		this.hashInt = vm.hash3Ints(func.hashInt,param.hashInt,this.stackStuff.hashInt);
	};
	
	

	//returns a vm.FuncallCache, not its ret, so you can read or write its ret. Sets its FuncallCache.touch to newest of any FuncallCache.
	//salt isnt needed in pure clean mode, but if you want stackTime stackMem etc, to repeat the same call without getting the same return value from earlier cache, use salt.
	//salt is any 4 ints. Normally the first lambda call uses a random salt, and unitary transforms it by 2 different transforms as it takes different paths on stack,
	//but only changes salt when it wants to fork a different run of the same lambda call.
	//Whena all 4 iscleanvsdirty bits are 0, the same run of the same lambda call always returns the same lambda, but its useful to limit compute cycles and memory
	//and for some lambda calls to take different paths depending on if other lambda calls run out of compute resources or not, recursively.
	//Since there are many possible optimizations and that may vary across wikibinator203 VMs, the amounts of compute resources are nondeterministic,
	//and so are what digital signatures mutableWrapperLambda may find or not find, or find a newer one if theres multiple.
	//The 4 bits are to allow or not allow various kinds of nondeterminism, recursively on stack can tighten but not loosen.
	vm.funcallCache = function(func, param, optionalStackStuff){
		
		
		//TODO dont concat strings to create key. just look it up without creating heap mem, in a hashtable specialized in 128+128 bit keys (128 bits of localId per lambda).
		//But until then, dedupKeyOfFuncallCache will prepay to include stackMem, instead of just stackTime.
		let key = this.dedupKeyOfFuncallCache(func, param, optionalStackStuff);
		let cache = this.funcallCacheMap[key];
		if(cache){
			this.prepay(1,0);
		}else{
			this.prepay(1,4);
			cache = this.funcallCacheMap[key] = new this.FuncallCache(this,func,param,optionalStackStuff)
		}
		cache.touch = ++this.touchCounter;
		return cache;
	};
	
	vm.o8OfIdentityFunc = 5000; //FIXME thats the wrong number

	//(func,param) or more params to curry...
	//FIXME vararg might be slow. use separate func for vararg cp
	vm.cp = function(){
		//TODO divide cp into 2 funcs, one with 2 params and 1 with variable number of params, for efficiency.
		switch(arguments.length){
			case 0: return this.identityFunc;
			case 1: return arguments[0];
			case 2:
				let func = arguments[0];
				let param = arguments[1];
				if(param().o8()==1 && func().o8() == this.o8OfIdentityFunc){
					vm.prepay1Time();
					return this.u; //the only node whose o8 is 1, but I'm making a point by implementing it without using == on nodes, just on bytes.
				}else{
					
					/*
					//TODO use faster kind of localIds and dedup than string. but for now i just want to get it working asap. GPU optimize, js code eval optimize, webasm optimize, etc later.
					let key = this.dedupKeyOfNode(false,func,param);
					return this.dedupMap[key] || (this.prepay(0,1) || (this.dedupMap[key] = vm.lambdize(new this.Node(this,func,param))));
					*/
					
					//Look in hashtable for node with those 2 childs, else create it.
					
					//TODO optimize: this code looks too big and slow, but will be be fast enough since most calculations will be done in blobs, GPU, evalers, etc
					//and only use this code when no compiled optimizations exist for the relevant lambda call. But still, it could probably be faster...
					
					//TODO optimize: If its 2 cbts sharing the same Node.blob that are adjacent then store parent pointer in them. just check parent pointer.
					
					
					let funcNode = func(), paramNode = param();
					let bucket = vm.hash2Nodes(funcNode,paramNode)&vm.dedupHashtableMask; //its a linked hashtable so its either in that bucket or not in the hashtable
					let lambda = vm.dedupHashtable[bucket]; //null if bucket is empty, else lambda.htNext is next lambda in linkedlist of bucket
					while(lambda){
						vm.prepay1Time();
						if(lambda().equalsByLazyDedupOf2ChildNodes(funcNode,paramNode)){
							return lambda; //found it, reuse that instead of creating another node of same forest shape
						}
						lambda = lambda.htNext;
					}
					//didnt find that forest shape. create one.
					this.prepay1Mem();
					//vm.dedupHashtable[bucket] is null or a vm.HashtableNode first in linkedlist that doesnt contain the node looking for.
					lambda = vm.lambdize(new this.Node(this,func,param));
					lambda.htNext = vm.dedupHashtable[bucket];
					vm.dedupHashtable[bucket] = lambda;
					return lambda;
					
					
					/*
					let bucket = vm.hash2Nodes(func,param)&vm.dedupHashtableMask; //its a linked hashtable so its either in that bucket or not in the hashtable
					let htNode = vm.dedupHashtable[bucket];
					let funcNode = func(), paramNode = param();
					while(htNode){
						vm.prepay1Time();
						//TODO optimize by HashtableNode storing Node instead of the lambdize wrapper of it, so can use htNode.val instead of htNode.val()?
						if(htNode.val().equalsByLazyDedupOf2ChildNodes(funcNode,paramNode)){
							return htNode.val; //found it, reuse that instead of creating another node of same forest shape
						}
						htNode = htNode.next;
					}
					//didnt find that forest shape. create one.
					this.prepay1Mem();
					//vm.dedupHashtable[bucket] is null or a vm.HashtableNode first in linkedlist that doesnt contain the node looking for.
					let lambda = vm.lambdize(new this.Node(this,func,param));
					vm.dedupHashtable[bucket] = new vm.HashtableNode(lambda, vm.dedupHashtable[bucket]);
					*/
					
					
					return lambda;
				}
			break;
			default:
				let ret = arguments[0];
				for(let i=1; i<arguments.length; i++) ret = this.cp(ret,arguments[i]);
				return ret;
		}
	};

	//the this is a Node, not vm
	vm.lambdaToString = function(){
		if(this.localName) return this.localName; //starts as the op names, and can name other lambdas (which are all constants), but it doesnt affect ids since its contentAddressable.
		if(this().isLeaf()) return 'u';
		else return this().l+'('+this().r+')';
		//TODO? return this().slowLocalId(); //FIXME return a 45 char 256 bit globalId similar to (this one is made up) λDY8pvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj
	};

	vm.lambdize = function(node){
		if(node.lam) return node.lam;
		const NODE = node;
		const VM = this;
		//let lambda = function(param){
		let lambda = function(param){
			
			//TODO test the code NODE.evaler(NODE.lam,param) which should do this.
			//TODO evaler, so can put various optimizations per node. chain of evalers with evaler.on defining which in the chain is used.
			//use the first aNode.evaler where aNode.evaler.on such as aNode.evaler.prev.prev.on.
			
			//aLambda() returns the node it wraps. Example: aLambda().l or aLambda().r or aLambda().vm.Node
			//or aLambda().vm.FuncallCache or aLambda().header or aLambdas().bize or aLambda().idA or aLambda().blob.
			//TODO optimize: maybe it should be aLambda.n to get the Node?
			//TODO optimize: can lambdize and Node be merged? Would it interfere with vm.Node.prototype?
			if(param === undefined) return NODE;
			return NODE.getEvaler()(VM,NODE.lam,param); //eval lambda call, else throw if not enuf stackTime or stackMem aka prepay(number,number)
		};
		lambda.n = NODE; //so you can get node by aLambda.n or by aLambda(). TODO optimize by removing "if(param === undefined) return NODE;" and always using .n?
		//lambda = lambda.bind(this);
		lambda.hashInt = vm.hash2Nodes(node.l,node.r); //TODO optimize should hashInt go in node instead of lambda? does that make it harder to use?
		lambda.toString = vm.lambdaToString;
		return (node.lam = lambda);
	};
	
	//TODO pushEvaler with .on and .prev and (prepay,func,param) or maybe (vm,func,param)
	
	//vm.opcodeToO8 = {}; //string to o8
	//vm.opcodesDescription = {};
	//vm.nextOpO8 = 128; //128..255
	//vm.o8ToLambda = []; //o8 of 0 is either evaling or doesnt exist. o8 of 1 to 255 exists. Past that, they copy o8 from l child.
	//vm.o8ToLambda[0] = (x=>{throw 'o8 of 0 does nothing or is evaling';});
	vm.opInfo = []; //o8 to info
	vm.opNameToO8 = {}; //a cache of vm.opInfo, used in a switch statement in vm.rootEvaler. TODO optimize further by making a separate evaler for each op and a few other common lambdas.
	vm.addOp = (name,curriesLeft,description)=>{
		let o8 = vm.opInfo.length;
		if(o8 >= 256) throw 'Max 128 opcodes, whose o8 is 128 to 255. 0 is evaling. 1 to 127 is the first 0-6 params, before the op is known at 7 params. If you want to redesign this to use different ops, you could replace the last half of vm.opInfo, but you must keep the first half. You could change it to have a different number of ops, such as 1024 ops, using a bigger array twice as big as the number of ops, but then youd need to take some bits from the header int such as only having 13 bits of curriesLeft so up to 8191 curries instead of 2^16-1 curries. But its a universal lambda and that shouldnt be needed. Everyone can use the same opcodes and make all possible programs with that. You might want to use a different universalLambda/opcodes if its easier to optimize for certain kinds of things, but I think this one will be GPU.js optimizable, javascript eval optimizable, etc.';
		//TODO vm.o8ToLambda[vm.nextOpO8] = 
		//vm.opcodeToO8[name] = vm.nextOpO8;
		//vm.opcodesDescription[name] = (description || 'TODO write description of opcode '+name);
		//vm.nextOpO8++;
		vm.opInfo.push({name:name, curriesLeft:curriesLeft, description:description});
		vm.opNameToO8[name] = o8;
		console.log('Add op '+name+' o8='+o8+' curriesLeft='+curriesLeft+' description: '+description);
		return o8;
	};
	vm.addOp('evaling',0,'This is either never used or only in some implementations. Lambdas cant see it since its not halted. If you want a lazyeval that lambdas can see, thats one of the opcodes (TODO) or derive a lambda of 3 params that calls the first on the second when it gets and ignores the third param which would normally be u, and returns what (thefirst thesecond) returns.');
	vm.addOp('u',7,'the universal lambda aka wikibinator203. There are an infinite number of other possible universal lambdas but that would be a different system. They can all emulate eachother, if they are within the turingComplete cardinality (below hypercomputing etc), aka all calculations of finite time and memory, but sometimes an emulator in an emulator... is slow, even with evaler optimizations.');
	for(let o8=2; o8<128; o8++){
		//TODO 'op' + 2 hex digits?
		let numLeadingZeros = Math.clz32(o8);
		let curriesSoFar = 31-numLeadingZeros;
		let curriesLeft = 7-curriesSoFar;
		let name = 'op'+o8.toString(2);
		vm.addOp(name, curriesLeft, name+' has '+curriesSoFar+' params. Op is known at 7 params, and is copied from left child after that.');
	}
	vm.addOp('f',2,'the church-false lambda aka λy.λz.z. (f u) is identityFunc. To keep closing the quine loop simple, identityFunc is (u u u u u u u u u) aka (f u), but technically (u u u u u u u u anything) is also an identityFunc since (f anything x)->x. (l u)->(u u u u u u u u u). (r u)->u. (l u (r u))->u, the same way (l anythingX (r anythingX))->anythingX forall halted lambda anythingX.');
	vm.addOp('t',2,'the church-true lambda and the k lambda of SKI-Calculus, aka λy.λz.y');
	vm.o8OfBit0 = vm.addOp('bit0',248,'complete binary tree is made of pow(2,cbtHeight) number of bit0 and bit1, evals at each curry, and counts rawCurriesLeft down to store (log2 of) cbt size'); //FIXME is it 247 or 248 or what? or 4077 or what?
	vm.o8OfBit1 = vm.addOp('bit1',248,'see bit0');
	vm.o8OfL = vm.addOp('l',1,'get left/func child. Forall x, (l x (r x)) equals x, including that (l u) is identityFunc and (r u) is u.');
	vm.o8OfR = vm.addOp('r',1,'get right/param child. Forall x, (l x (r x)) equals x, including that (l u) is identityFunc and (r u) is u.');
	vm.addOp('isleaf',1,'returns t or f of is its param u aka the universal lambda');
	vm.addOp('isClean',1,'the 2x2 kinds of clean/dirty/etc. exists only on stack. only with both isClean and isAllowSinTanhSqrtRoundoffEtc at once, is it deterministic. todo reverse order aka call it !isDirty instead of isClean?');
	vm.addOp('sAllowSinTanhSqrtRoundoffEtc',1,'the 2x2 kinds of clean/dirty/etc. exists only on stack. only with both isClean and isAllowSinTanhSqrtRoundoffEtc at once, is it deterministic. todo reverse order?');
	vm.addOp('lambda',2,'Takes just funcBody and 1 more param, but using opOneMoreParam (the only vararg op) with a (lambda...) as its param, can have up to '+vm.maxCurries+' params including that funcBody is 8th param of u. (lambda funcBody ?? a b ??? c d e) -> (funcBody (pair (lambda funcBody ?? a b ??? c d) e))');
	vm.addOp('getNamedParam',2,'ddee? would be a syntax for (getnamedparam "ddee").');
	vm.addOp('opOneMoreParam',0,'Ignore See the lambda op. This is how to make it vararg. Ignore (in vm.opInfo[thisOp].curriesLeft cuz vm.opInfo[thisOp].isVararg, or TODO have 2 numbers, a minCurriesLeft and maxCurriesLeft. (lambda funcBody ?? a b ??? c d e) -> (funcBody (pair (lambda funcBody ?? a b ??? c d) e))');
	vm.addOp('s',3,'For control-flow. the s lambda of SKI-Calculus, aka λx.λy.λz.xz(yz)');
	vm.addOp('pair',3,'the church-pair lambda aka λx.λy.λz.zxy');
	vm.addOp('infcur',vm.maxCurriesLeft,'like a linkedlist but not made of pairs. just keep calling it on more params and it will be instantly halted.');
	vm.addOp('opmutOuter',2,'(opmutOuter treeOfJavascriptlikeCode param), and treeOfJavascriptlikeCode can call opmutInner which is like opmutOuter except it doesnt restart the mutable state, and each opmutInner may be compiled (to evaler) separately so you can reuse different combos of them without recompiling each, just recompiling (or not) the opmutOuter andOr multiple levels of opmutInner in opmutInner. A usecase for this is puredata-like pieces of musical instruments that can be combined and shared in realtime across internet.');
	vm.addOp('opmutInner',2,'See opmutOuter. Starts at a Mut inside the one opmutOuter can reach, so its up to the outer opmuts if that Mut contains pointers to Muts it otherwise wouldnt be able to access.');
	vm.addOp('stackIsAllowstackTimestackMem',1,'reads a certain bit (stackIsAllowstackTimestackMem) from top of stack, part of the recursively-tightenable-higher-on-stack permissions system');
	vm.addOp('stackIsAllowNondetRoundoff',1,'reads a certain bit (stackIsAllowNondetRoundoff) from top of stack, part of the recursively-tightenable-higher-on-stack permissions system');
	vm.addOp('stackIsAllowMutableWrapperLambdaAndSolve',1,'reads a certain bit (stackIsAllowMutableWrapperLambdaAndSolve) from top of stack, part of the recursively-tightenable-higher-on-stack permissions system');
	vm.addOp('stackIsAllowAx',1,'reads a certain bit (stackIsAllowAx) from top of stack, part of the recursively-tightenable-higher-on-stack permissions system');
	vm.addOp('isCbt',1,'returns t or f, is the param a cbt aka complete binary tree of bit0 and bit1');
	vm.addOp('containsAxConstraint',1,'returns t or f, does the param contain anything that implies any lambda call has halted aka may require infinite time and memory (the simplest way, though sometimes it can be done as finite) to verify');
	vm.addOp('dplusraw',2,'raw means just the bits, not wrapped in a typeval. add to doubles/float64s to get a float64, or if in that op that allows reduced precision to float32 (such as in gpu.js) then that, but the result is still abstractly a double, just has less precision, and in gpujs would still be float32s during middle calculations.');
	
	
	
	/* todo these ops too...
	TODO...
	bit0
	bit1
	getSalt128 ignore
	withSalt128 cbt128 func param
	withSalt128TransformedBy funcOf128BitsTo128Bits func param
	mutableSLike
	ifElse condition iftrue iffalse state //if (condition state)->t then returns (iftrue state) else returns (iffalse state). todo check o8 for is it t, vs do it like pair x y t vs pair x y f? just check its opcode.
	todo fill in the others.
	for //...
	while condition state
	dowhile
	varname //like typeval but its a utf8 or is it utf16? use this (or just typeval names) in ifElse for while dowhile etc.
	[]= nameOb nameKey nameVal //{} in Mut
	[] nameOb nameKey
	<>= nameOb nameKey nameVal //Float64Array in Mut
	<> nameOb nameKey
	copy<>ToCbt ob key
	copyCbtTo<>
	new<>OfNDoubles
	//new<>OfNFloats
	//new<>OfNInts
	//new<>OfNUbytes
	isJsDoubleDuringMut getVarName
	isJsStringDuringMut
	funcallDuringMut func param //similar to (+ x y) it returns something instead of being a []= or <>=
		//funcallDuringMut getVarNameLvalue getVarNameFunc getVarNameParam
	Math.sin //allow nondeterministic roundoff. but in pure mode you cant use this.
	Math.tanh
	Math.sqrt
	Math.imul
	...bunch more Math.something funcs...
	spendTimeMemFuncParam maxstackTime maxstackMem func param
	~
	^
	!
	||
	&&
	*
	-
	/
	%
	?:
	!!!!!!!!!!!!! no == for fns cuz of nondeterministic partialDedup?
	TODO ^= |= ~= etc?
	//fixme is this the same as Math.pow: ** aka pow
	Math.abs
	Math.acos
	Math.acosh
	Math.asin
	Math.asinh
	Math.atan
	Math.atan2
	Math.atanh
	Math.cbrt
	Math.ceil
	Math.clz32
	Math.cos
	Math.cosh
	Math.exp
	Math.expm1
	Math.floor
	Math.fround
	Math.hypot
	Math.imul
	Math.log
	Math.log1p
	Math.log2
	Math.log10
	Math.max
	Math.min
	Math.pow
	Math.round
	Math.sign
	Math.sin
	Math.sinh
	Math.sqrt
	Math.tan
	Math.tanh
	Math.trunc
	//sigmoid //todo implement using tanh andOr exp
	//square
	//cube
	isNaN
	isSubnormalNumber
	isFiniteNumber
	isNormedDoubleBits
	asyncStartGpuFloat32CompileEarly
	isGpuCompiledFor
	asyncBatchDownloadMutableWrapperLambdaEachWithBellcurveOfTimeForWhenAndHowMuchWantIt
	isMutableWrapperLambdaCallDownloadedOrKnownFor
	hyperquasicrystal (it cant get access to anything outside this opcode. it sees this opcode as its leaf, and infloops if called on anything not made entirely of it)
	solveRecog x //returns any y where (x y)->u.
	solveFloat64 x //returns any y where (x y)->float64 where the float64 is positive, and the higher the better.
	getdoublefromcbtaligned64
	getint...
	getbyte..
	getshort...
	getchar...
	concat2cbt
	bize31 //bitstrings are limited to 2^31-1 bits so bize fits in int. you can still use a list or tree of bitstrings to make things as big as you want.
	doublesLen //same as floor(bize31/64)
	floatsOrIntsLen //same as floor(bize31/32)
	shortsOrCharsLen //same as floor(bize31/16)
	bytesLen //same as floor(bize31/8)
	containsbit1
	normfloat64
	normfloat32
	optimizationhint hint func param ???
	  or just gpujslikecall
	//Math.random //only works in opmut or with a different salt128 each time. whatever Math.random() does, or GPU.js's random func does. not high quality random. if you want that, derive a securehash and seed it with things like this.
	//time //returns double of seconds since Y1970 utc time. only works in opmut or with a different salt128 each time.
	...reservedForFutureOpcodes... //up to 128.
	make sure it fits in 128 opcodes, and todo leave some space for future opcodes in forks of the opensource, but until they're added just infloop if those reservedForFutureOpcodes are called.
	*/
	
	while(vm.opInfo.length < 256) vm.addOp('op'+vm.opInfo.length+'ReservedForFutureExpansionAndInfloopsForNow', 1, 'Given 1 param, evals to (s i i (s i i)) aka the simplest infinite loop, so later if its replaced by another op (is reserved for future expansion) then the old and new code will never have 2 different return values for the same lambda call (except if on the stack the 4 kinds of clean/dirty (stackIsAllowstackTimestackMem stackIsAllowNondetRoundoff stackIsAllowMutableWrapperLambdaAndSolve stackIsAllowAx) allow nondeterminism which if theyre all clean then its completely deterministic and theres never more than 1 unique return value for the same lambda call done again.');
	
	vm.bit = function(bit){ return bit ? this.t : this.f };
	
	//runs an infinite loop, which can be caught by the nearest spend call (limiting time and memory higher on stack than such call, recursively can tighten),
	//so actually just throws.
	vm.infloop = ()=>{ throw this.gasErr; }
	
	//throw 'vm.pair = TODO; //similar to vm.t and vm.f and few other ops';
	
	//takes a mut where mut.m.func is (... opmut treeOfJavascriptlikeCode) so can call itself recursively,
	//and mut.m.param is its lambda param. Using that, it can do things like loop over pixels in an array, use js {} maps, etc.
	//It must return a lambda, but in the middle steps it has mutable optimizations that can be compiled to javascript for example,
	//but since the universal lambda doesnt depend on anything outside itself, it could be compiled to any turingComplete system.
	vm.opmut = mut=>{
		throw 'TODO compile, making sure to limit stackTime stackMem etc.';
	};
	
	
	//immutable. but stackTime stackMem etc are mutable and are stored somewhere else (maybe as fields in vm?)
	//mask is the low 4 bits of header int, the cleanvsdirty etc stuff, such as does it allow nondeterministic roundoff.
	vm.StackStuff = function(mask, saltA, saltB, saltC, saltD){
		this.mask = mask;
		this.saltA = saltA;
		this.saltB = saltB;
		this.saltC = saltC;
		this.saltD = saltD;
	};
	
	//pure deterministic, no ax (which is deterministic but can have infinite cost to verify), and 128 0s for salt.
	//Use this as immutable.
	//When forkEditing, salt can change to anything by unitary transform or replacing it with its hash,
	//but the 4 iscleanvsdirty bits can only change from 1 to 0, similar to stackTime and stackMem can only decrease (or stay same) but not increase,
	//until the first call returns, then can start with any StackStuff you and stackTime stackMem etc you want.
	vm.defaultStackStuff = new vm.StackStuff(0,0,0,0,0); //FIXME start as what? FIXMe reset this before each next call while stack is empty.
	
	
	//vm.stack* (stackTime stackMem stackStuff) are "top of the stack", used during calling lambda on lambda to find/create lambda.
	vm.stackTime = 1000000; //fill these back up before starting another call at bottom of stack, to avoid running out, but not until the stack becomes empty.
	vm.stackMem = 1000000;
	//QPUs, like any analog hardware, would need to come in as snapshot in param or using mutableWrapperLambda: vm.stackQpuCompile = 1000000; //TODO
	vm.stackGpuCompile = 1000000; //TODO. includes GPU, TPU, or any kind of parallel chip or stream processor that can do digital logic.
	vm.stackCpuCompile = 1000000; //TODO
	vm.stackNetworkUpload = 1000000; //TODO
	vm.stackNetworkDownload = 1000000; //TODO
	vm.stackDriveRead = 1000000; //TODO. this may be window.localStorage or in other VMs they might support harddrive/SSD but only for storage of nodes and blobs not executing.
	vm.stackDriveWrite = 1000000; //TODO. see stackDriveRead.
	vm.stackStuff = vm.defaultStackStuff;
	
	
	/* very slow interpreted mode. add optimizations as recursive evalers whose .prev is this or eachother leading to this, that when !evaler.on then evaler.prev is used instead.
	u.evaler is this rootEvaler. All other evalers are hooked in by aLambda.pushEvaler((vm,l,r)=>{...}), which sets its evaler.prev to aLambda.evaler before setting aLambda.evaler to the new one,
	and if the evaler doesnt have an evaler.on field, creates it as true.
	*/
	vm.rootEvaler = (vm,l,r)=>{
		
		//TODO rename l to myL and r to myR, cuz l and r are ops.
		
		//TODO vm.wrapInTypeval (and just rename that to wrap) of l and r, such as doubles or strings.
		
		console.log('Evaling l='+l+' r='+r);
		//"use strict" is good, but not strict enough since some implementations of Math.sqrt, Math.pow, Math.sin, etc might differ
		//in the low few bits, and for that it only calls Math.sqrt (for example) if vm.stackIsAllowNondetRoundoff. Its counted as nonstrict mode in wikibinator203,
		//which it has 2^4=16 kinds of strict vs nonstrict that can be tightened in any of 4 ways on stack so stays tight higher on stack until pop back from there.
		//The strictest is pure determinism and will compute the exact same bits in every wikibinator203 VM. All halted lambdas are that strictest way,
		//and only during evaling 2 strictest lambdas to return at most 1 strictest lambda, between that you can use any of the 16 kinds of strict vs loose, and recursively tighten,
		//similar to vm.stackTime and vm.gasFastMem can be tightened to have less compute cycles and memory available higher on stack, but cant be increased after a call starts.
		"use strict";
		//console.log('opNameToO8='+JSON.stringify(vm.opNameToO8));
		vm.prepay(1,0);
		let cache = vm.funcallCache(l,r);
		if(cache.ret) return cache.ret;
		
		let stackMask = vm.stackStuff.mask;
		if(l().curriesLeft() > 1 || l().o8() < 128){ //if 64 <= o8 < 128 then its getting its 7th param, and op always becomes known at 7th param, so just cp it.
			//TODO optimize by getting l().header (an int) and getting curriesLeft and o8 from it, faster than calling those separately.
		
			//(l.o8() < 64) implies (l.curriesLeft) but it could also be cuz theres more params such as s takes 3 params so the first 2 curries are halted, and 1 op (lambda) has vararg.
			return vm.cp(l,r);
		}else{
			//if(l().o8() < 128){ //TODO remove this
			//	throw 'shouldnt be here cuz should have just done cp';
			//}
			//last 3 params
			let x = l().l().r; //TODO use L and R opcodes as lambdas and dont funcall cache that cuz it returns so fast the heap memory costs more
			let y = l().r;
			let z = r;
			let ret = null;
			let o = vm.opNameToO8;
			let o8 = l().o8();
			switch(o8){
				case o.stackIsAllowstackTimestackMem: //!isClean. allow stackMem and stackTime etc more than 1 level deep (clean lambdas cant see it, but can still run out of it, throws to just past the cleans)
					ret = vm.bit(stackMask & vm.mask_stackIsAllowstackTimestackMem);
				break;case o.stackIsAllowNondetRoundoff:
					ret = vm.bit(stackMask & vm.stackIsAllowNondetRoundoff);
				break;case o.stackIsAllowMutableWrapperLambdaAndSolve:
					ret = vm.bit(stackMask & vm.stackIsAllowMutableWrapperLambdaAndSolve);
				break;case o.stackIsAllowAx:
					ret = vm.bit(stackMask & vm.stackIsAllowAx);
				//ignoring 2 reserved bits in mask vm.mask_reservedForFutureExpansion4 and vm.mask_reservedForFutureExpansion5
				break;case o.isCbt:
					ret = vm.bit(z().isCbt());
				break;case o.containsAxConstraint:
					ret = vm.bit(z().containsAxConstraint());
				break;case o.dplusraw:
					ret = vm.wrapRaw(y().d()+z().d());
				break;
				
				/*break;case o.stackIsAllowImportEvilIds:
					THIS WAS REMOVED CUZ IT SHOULD BE DONE ONLY IN vm.import(idMaker,id) func, which makes formalVerifying it easier.
					
					//A lambda cant check if a lambda is good or evil (evilBit) cuz its always both, just an interpretation of an observer, only affects ids,
					//and each lambda has (at least, can make more kinds) 2 ids, one where evilBit is on and one where its off.
					//What makes the good namespace good (or so people might define what is good) is to call it good while sharing it is to certify that you are copying it out of the "antivirus quarantine"/uncensoredArea and that you take responsibility for doing so,
					//such as if you made all the parts of it yourself and know its safe for other uses, or if you somehow know
					//its parts and the combo of them are safe.
					//When in doubt, just say its evil (evilBit=true).
					ret = vm.bit(vm.stackIsAllowImportEvilIds); FIXME get these 5 "vm.stackIsAllow" bits from StackStuff.
				*/
				
				break;case o.opmutOuter:
					//TODO merge opmutOuter and opmutInner?
					let mut = new Mut(0);
					mut.m.func = l; //(... opmut treeOfJavascriptlikeCode). it can use this to call itself recursively.
					mut.m.param = r; //param as in (... opmut treeOfJavascriptlikeCode param)
					ret = vm.opmut(m);
				break;case o.opmutInner:
					//TODO merge opmutOuter and opmutInner?
					vm.infloop();
					//throw 'TODO this is not normally called outside opmutOuter. What should it do? just act like an opmutOuter? Or infloop?';
				break;
				
				//UPDATE its down to 255 as in 1<<vm.maxCurriesLeft. FIXME go down to max 4095 params so an evaling can store the 4 bits that go on stack? cuz need those 4 bits. Halted lambdas are always clean (those 4 bits are 0).
				
				/*
				FIXME its 4x2: stackIsAllowstackTimestackMem, stackIsAllowNondetRoundoff, stackIsAllowMutableWrapperLambda, stackIsAllowMutableWrapperLambda.
				opcodes:
				stackIsAllowstackTimestackMem //the 2x2 kinds of clean/dirty/etc. exists only on stack. only with both isClean and isAllowSinTanhSqrtRoundoffEtc at once, is it deterministic. todo reverse order aka call it !isDirty instead of isClean?
				stackIsAllowNondetRoundoff //isAllowSinTanhSqrtRoundoffEtc //the 2x2 kinds of clean/dirty/etc. exists only on stack. only with both isClean and isAllowSinTanhSqrtRoundoffEtc at once, is it deterministic. todo reverse order?
				stackIsAllowMutableWrapperLambda
				stackIsAllowAx (fixme, is it varargAxCall or just axa (and maybe axb?))
				*/

				break;case o.s:
					ret = x(z)(y(z));
				break;case o.t:
					ret = y;
				break;case o.f:
					ret = z;
				break;case o.l:
					ret = z().l;
				break;case o.r:
					ret = z().r;
				break;case o.isLeaf:
					ret = Bit(z.o8==1);
				break;case o.pair:case o.typeval:
					ret = z(x)(y);
				break;case o.varargAx:
					if(vm.stackIsAllowAx){
						throw 'TODO ax';
						/*
						let funcBodyAndVarargChooser = TODO get eighth param;
						FIXME varargAx should always have curriesLeft of 1 even after it gets its next curry, and next after that...
						It can have unlimited curries since funcBodyAndVarargChooser chooses to be halted or to eval, at each next curry.
						let nextParam = z;
						//vm.stackIsAllowAx
						
						//tighten clean/dirty higher in stack during verifying ax constraint so its deterministic.
						let prev_stackIsAllowstackTimestackMem = vm.stackIsAllowstackTimestackMem;
						let prev_stackIsAllowMutableWrapperLambda = vm.stackIsAllowMutableWrapperLambda;
						let prev_stackIsAllowNondetRoundoff = vm.stackIsAllowNondetRoundoff;
						
						
						TODO save and load all of these, and make an object to contain them, maybe just a {}, or maybe vm.stackNums.gpuCompile etc.
						vm.stackTime = 1000000; //fill these back up before starting another call at bottom of stack, to avoid running out, but not until the stack becomes empty.
						vm.stackMem = 1000000;
						vm.stackGpuCompile = 1000000; //TODO
						vm.stackCpuCompile = 1000000; //TODO
						vm.stackNetworkUpload = 1000000; //TODO
						vm.stackNetworkDownload = 1000000; //TODO
						vm.stackDriveRead = 1000000; //TODO. this may be window.localStorage or in other VMs they might support harddrive/SSD but only for storage of nodes and blobs not executing.
						vm.stackDriveWrite = 1000000; //TODO. see stackDriveRead.
						
						let axEval;
						try{
							axEval = funcBodyAndVarargChooser((vm.pair)(l)(r)); //evals to u/theUniversalFunction to define l(r) as halted, else evals to u(theReturnVal)
						}finally{ //in case throws vm.gasErr
							//put clean/dirty back on stack the way it was
							vm.stackIsAllowstackTimestackMem = prev_stackIsAllowstackTimestackMem;
							vm.stackIsAllowMutableWrapperLambda = prev_stackIsAllowMutableWrapperLambda;
							vm.stackIsAllowNondetRoundoff = prev_stackIsAllowNondetRoundoff;
						}
						
						
						if(axEval == u){
							ret vm.cp(l,r); //l(r) is halted. l(r) is whats evaling right now, which is what makes varargAx a strange op.
						}else{
							ret = axEval().r; //L(axEval). TODO optimize by L and R and isLeaf ops dont cache, just return instantly by getting those fields
						}
						FIXME, if any lambda contains a call of varargAx with more than 8 params, since that means a constraint has been verified, then stackIsAllowAx bit must be 1 when halted.
						*/
					}else{
						vm.infloop();
					}
					//FIXME it said somewhere said that opOneMoreParam is the only vararg, but actually theres 3: infcur, varargAx, and opOneMoreParam.
					//so update comments and maybe code depends on that?
				break;case o.sqrt: //of a cbt64 viewed as float64
					if(vm.stackIsAllowNondetRoundoff){
						let float64 = TODO;
						throw 'ret = TODO wrap Math.sqrt(float64) in cbt64;';
						throw 'TODO';
					}else{
						throw 'TODO either compute the exact closest float64 (and what if 2 are equally close, and should it allow subnormals?) (try to do that, choose a design) or infloop (try not to)';
					}
				break;default:
					throw 'o8='+o8+' TODO theres nearly 128 opcodes. find the others in "todo these ops too..." Comment.';
			}
			return cache.ret = ret;
		}
	};
	vm.rootEvaler.on = true; //vm.rootEvaler.on must always be true, and vm.rootEvaler.prev must always be null.
	vm.rootEvaler.prev = null;
	
	
	
	/*
	let ops = [];
	
	let newOp = (opName,evaler)=>{
		if(ops.length == 128) throw 'Max 128 ops';
		evaler.opName = opName;
		evaler.on = true;
		//TODO pushEvaler. evaler.prev.
		ops.push(evaler)
	};
	
	newOp('isClean', (vm,func,param)=>{
		FIXME evalers need to check if just do callpair first, if they have more than 1 param after the evaler.
	});
	*/
	
	let u = vm.u = vm.lambdize(new vm.Node(vm,null,null)); //the universal function
	//u.evaler = vm.rootEvaler();
	//this happens in Node constructor: u.evaler = rootEvaler; //all other evalers, use theLambda.pushEvaler((vm,l,r)=>{...});
	//let op0000001 = u;
	//this breaks thingsu.func = u(u)(u)(u)(u)(u)(u)(u); //identityFunc.
	u().l = vm.identityFunc = vm.cp(u,u,u,u,u,u,u,u,u); //aka (f u).
	u().r = u;
	
	vm.uu = vm.u(vm.u);
	
	vm.o8ToLambda = function(o8){
		//console.log('vm.o8ToLambda '+o8);
		if(o8 > 255) throw 'o8='+o8;
		if(o8 == 1) return vm.u;
		let exceptLastParam = vm.o8ToLambda(o8>>1);
		//return exceptLastParam((o8&1) ? uu : u);
		return vm.cp(exceptLastParam, ((o8&1) ? vm.uu : vm.u));
	};
	
	vm.Node.prototype.vm = vm; //can get this like u().vm or u(u)(u(u))(u).vm for example.
	
	
	//let prevProto = vm.Node.prototype;
	//prevProto
	//vm.Node.prototype.prototype = vm;
	
	/*
	opcodeToO8 doesnt exist anymore
	//map of op name (such as 's' or 'pair' to lambda
	vm.ops = {};
	for(let opName in vm.opcodeToO8){
		let o8 = vm.opcodeToO8[opName];
		let lambda = vm.o8ToLambda(o8);
		lambda.localName = opName;
		vm.ops[opName] = lambda;
	}*/
	
	vm.ops = {}; //map of opName to lambda
	for(let o8=1; o8<256; o8++){ //excluses o8 of 0 aka evaling.
		let lambda = vm.o8ToLambda(o8);
		lambda.localName = vm.opInfo[o8].name;
		vm.ops[lambda.localName] = lambda;
	}
	
	//cuz vm.bit func needs these. todo opcode order.
	//vm.t = TODO;
	//vm.f = TODO;
	
	let l = vm.ops.l;
	let r = vm.ops.r;
	let s = vm.ops.s;
	let t = vm.ops.t;
	let f = vm.ops.f;
	let pair = vm.ops.pair;
	let ident = f(u);
	
	vm.test = (testName, a, b)=>{
		if(a === b) console.log('Test pass: '+testName+', both equal '+a);
		else throw ('Test '+testName+' failed cuz '+a+' != '+b);
	};
	
	//a few basic tests...
	vm.test('tie the quine knot', vm.identityFunc, l(u));
	vm.test('tie the quine knot 2', vm.identityFunc, f(u));
	vm.test('tie the quine knot 3', l(u), u(u)(u)(u)(u)(u)(u)(u)(u));
	vm.test('tie the quine knot 4', r(u), u);
	vm.test('tie the quine knot 5 aka l(x)(r(x)) equals x, for any x (in this case x is u)', l(u)(r(u)), u);
	vm.test('tie the quine knot 6', u().idA, 0);
	vm.test('tie the quine knot 7', u().idB, 0);
	vm.test('tie the quine knot 8', u().blobFrom, 0);
	vm.test('tie the quine knot 9', u().blobTo, 0);
	vm.test('tie the quine knot 10', u.hashInt, 1);
	vm.test('tie the quine knot 11', vm.hash2Nodes(l(u)(), r(u)()), u.hashInt);
	vm.test('l(x)(r(x)) equals x, for any x (in this case x is s)', l(s)(r(s)), s);
	vm.test('l(x)(r(x)) equals x, for any x (in this case x is l)', l(l)(r(l)), l);
	vm.test('l(x)(r(x)) equals x, for any x (in this case x is r)', l(r)(r(r)), r);
	vm.test('s(t)(t)(l) which should be an identityFunc', s(t)(t)(l), l);
	vm.test('check dedup of s(t)(t)', s(t)(t), s(t)(t));
	vm.test('s(t)(t) called on itself returns itself since its an identityFunc', s(t)(t)(s(t)(t)), s(t)(t));
	vm.test('o8/opcode of u', u().o8(), 1);
	vm.test('o8/opcode of u(u)', u(u)().o8(), 2);
	vm.test('check dedup of u(u)', u(u), u(u));
	let uu = u(u);
	vm.test('o8/opcode of u(uu)', u(uu)().o8(), 3);
	vm.test('o8/opcode of u(uu)(uu)(uu)(uu)(u)(uu)().o8()', u(uu)(uu)(uu)(uu)(u)(uu)().o8(), 125);
	vm.test('o8/opcode of u(uu)(uu)(uu)(uu)(uu)(uu)', u(uu)(uu)(uu)(uu)(uu)(uu)().o8(), 127);
	vm.test('(l x (r x)) equals x forall x, deeper', l(l)(r(l))(s)(l(r)(r(r))(s)), s);
	vm.test('(l x (r x)) equals x forall x, deeper 2', l(l)(r(l))(pair(s)(l))(l(r)(r(r))(pair(s)(l))), pair(s)(l));
	vm.test('callParamOnItself(pair)->pair(pair)', s(ident)(ident)(pair), pair(pair));
	vm.test('callParamOnItself(pair)->pair(pair) 2 different identityFuncs', s(ident)(s(t)(t))(pair), pair(pair));
	
	/*
	if(vm.identityFunc != l(u)) throw 'Failed to tie the quine knot. identityFunc != l(u)';
	if(l(s)(r(s)) != s) throw 'Failed l(x)(r(x)) equals x, for any x (in this case x is s)';
	if(l(u)(r(u)) != u) throw 'Failed l(x)(r(x)) equals x, for any x (in this case x is u)';
	if(l(l)(r(l)) != l) throw 'Failed l(x)(r(x)) equals x, for any x (in this case x is l)';
	if(l(r)(r(r)) != r) throw 'Failed l(x)(r(x)) equals x, for any x (in this case x is l)';
	if(s(t)(t)(l) != l) throw 'Failed s(t)(t)(l) which should be an identityFunc';
	if(s(t)(t) != s(t)(t)) throw 'Failed s(t)(t) == s(t)(t)';
	if(s(t)(t)(s(t)(t)) != s(t)(t)) throw 'Failed s(t)(t)(s(t)(t))';
	if(vm.identityFunc != f(u)) throw 'vm.identityFunc != f(u)';
	*/
	
	
	//This optimization makes it fast enough to use l(lambda) and r(lambda) instead of lambda().l and lambda().r.
	//dont FuncallCache things that instantly return and cant make an infinite loop.
	l().pushEvaler((vm,func,param)=>(param().l));
	r().pushEvaler((vm,func,param)=>(param().r));
	//TODO pushEvaler for isleaf etc
	

	//vm.stack* (stackTime stackMem stackStuff) are "top of the stack", used during calling lambda on lambda to find/create lambda.
	vm.stackTime = 1000000; //fill these back up before starting another call at bottom of stack, to avoid running out, but not until the stack becomes empty.
	vm.stackMem = 1000000;
	vm.stackStuff = vm.defaultStackStuff;
	
	
	vm.prepay(1,2);
	if(vm.stackTime != 999999) throw 'stackTime is broken';
	if(vm.stackMem != 999998) throw 'stackMem is broken';
	
	return u; //the universal function
})();
console.log('Script ended. wikibinator203 = '+wikibinator203+' which is the universal combinator/lambda you can build anything with.');


















































//renaming jsmathbinator to wikibinator203.


/*
TODO important...
could hyperquasicrystal's cardinality be counted down from 0 toward -infinity (never reaching it)
(and optionally sorting the integers any way you like such as by height then recursively by left child then recursively by right child?)
???
cuz if so, then cardinality 0 is the highest cardinality.
lazycardinalityeval op would take 4 params: cardinality func param ignore, and edge goes toward (haltsymbol returnVal) or toward doesnthaltsymbol,
	and opCrossRedEdge or opCrossBlueEdge etc point at either where the edge actually points at or at callerdoesnthaveenoughcardinality.
	so the earlier hyperquasicrystal design as usual (and of course only clean (all 3 kinds of clean at once) applies at the higher cardinalities),
		except counts down from max cardinality instead of counts up from lowest cardinality.
PROBLEM???: can this be used to compute a haltingOracle (which are impossible) by emulating self,
	and calling haltingOracle on self to check if (self u) would halt or not then choosing to do the opposite (disproof by contradiction of haltingOracles)?
Since there would be an opGetCardinalityOnStack, it wouldnt be an actual emulation of self???
But since cardinality exists only on stack...
But what if a call of doesItHaltAtLowerCardinalityThanCaller never returns? By definition it must return (haltsymbol returnVal) or doesnthaltsymbol or callerdoesnthaveenoughcardinality,
and by definition a lazycardinalityeval must have a redEdge toward (haltsymbol returnVal) or doesnthaltsymbol (and cant have such an edge toward callerdoesnthaveenoughcardinality).
(doesItHaltAtLowerCardinalityThanCaller someCardinality func param) just checks if (func param), at someCardinality, halts or not and if it halts what does it return.
But doesItHaltAtLowerCardinalityThanCaller should actually be a derived node, derived from redEdge etc.
I'm unsure if this is consistent, but if it is, I'm likely to want the cardinality design back in hyperquasicrystal.
Try to disproveByContradiction in it. Try to prove (isleaf (u u)) or true=false or something like that.
What if cardinality is infinite in both directions, a kind of unaryNumber that ranges between -infinity (exclusive) and infinity (exclusive) of the integers between?
	I could easily make such a number type by just having 2 kinds of unary number, one for negatives and one for nonnegatives, and a +1 and -1 op etc.
*/














































/*
matmul...
TODO... (
	lambda
	{
		(
			opmut
			
			TODO some kind of sequence/progn...[[[
				sum=0
				TODO loop over a and c. make this able to generate gpujs code and js code and run in interpreted mode (3 ways)...
				(
					for b=0 {,< b bSize?} b++
					sum+={,* ?ab[{,+ {,* a bSize?} b}] ?bc[{,+ {,* b cSize?} c}]}
				)
				
			]]]
		)
	}
	?ab ?bc ?aSize ?bSize ?cSize
)
TODO



clean/dirty bits that only exist on stack:
	isDirtyGas //limit compute resources recursively by stackTime, stackMem, etc, but that prevents it from being deterministic so can limit to just 1 level of that deep on stack.
	isDirtyRoundoff //allow Math.sin(double) Math.tanh(double) etc, vs those funcs always infloop and you only get 
	//(opMutableWrapperLambda derivedFuncOfEd25519OrWhateverDigsigAlgorithm passwordOrU pubkeyOrU message) -> some signed form,
	//maybe with a minTime maxTime and time (utcFloat64) or maybe just a pubkey func return, or maybe pubkey func time return.
	isDirtyMutableWrapperLambdaOrSolve
	//dont need this cuz inside hyperquasirystal op it will already do that: isAllowAnythingExceptHyperquasicrystal




FIXME its 4x2: stackIsAllowstackTimestackMem, stackIsAllowNondetRoundoff, stackIsAllowMutableWrapperLambdaAndSolve, stackIsAllowAx.
FIXME should be 3x2 levels of clean/dirty, instead of 2x2. mutableWrapperLambda and solve* are above the level of just allowing spend/stackTime/stackMem.



TODO should it be ?varname optionally, if you want to give vars names? not sure how i'd optimize that, but it would just be (opOneMoreParam varnameorcomment func).
Example: (lambda funcBody ?abc j ?ddee?ghi k xyz).
Instead of getParam7 getParam22 it could be (ddee? (pair (lambda funcBody ?abc j ?ddee?ghi k) xyz))->k .
ddee? would be a syntax for (getnamedparam "ddee").
wont hurt to include it, even if it ends up not being used, cuz could just use  (opOneMoreParam u func).

vararg using opOneMoreParam such as (lambda funcBody ?? a b ??? c d e) -> (funcBody (pair (lambda funcBody ?? a b ??? c d) e)),
and (a b ?? c) means (opOneMoreParam (opOneMoreParam (a b)) c) but is displayed as (a b ?? c).
curriesLeft is counted up to 254 and above that it means "more than 254" so have to count it by lambda call (will get cached in a double but the ids just store 8 bits of it).

levels of clean: clean, allowSinTanhSqrtRoundoffEtc, allowSpendEtc..orJustCallItDirty
	NO, have clean be 2x2 kinds, 1 dim is clean/dirty and the other is allowSinTanhSqrtRoundoffEtc/not_allowSinTanhSqrtRoundoffEtc.

2 params and 128 bits of salt, no cx. use mutableSLike funcs to unitarytransform salt higher on stack.

256 opcodes. curriesSoFar. curriesLeft.


TODO vararg? or just a big max curriesLeft such as 126?


FIXME its 4x2: stackIsAllowstackTimestackMem, stackIsAllowNondetRoundoff, stackIsAllowMutableWrapperLambdaAndSolve, stackIsAllowAx.









TODO make this fast. its a variant of wikibinator202 that has these changes:
* will code audivolv, augmentedballs, neuralnets, canvas graphics, webaudioapi, jsoundcard that thing where it hears you whisper from across the room speaker microphone feedback, etc, in this system asap. have fun.
* theres only halted lambdas stored, 2 childs each.
* built in ed25519 op for mutableWrapperLambda, used with spend call andOr an op to say if it has an answer yet, but only in twothirdsdirty on stack.
* async opcode to prepare to do something, get the call started in a forked greenthread or thread etc, and another op to check if such a call is done, in progress, etc. also only in twothirdsdirty.
* no wiki op since it would tend toward things becoming less standardized, and the spend and mutableWrapperLambda etc ops will have their own opcodes.
* separate funcallcache (func param return touchtime) and binary forest of funcs. use same 4 ints of localid per node as in wikibinator202, 2 ints for idA and idB and 2 ints for start and end of Int32Array.
* salt128 on stack will only be unitary transformed, and that will be done by mutableS-like fns cuz they're so fast, using ops like << + & etc, to read any 2 of the 4 ints and write 1 of the others, or deeper binary forests of int int -> int ops.
* has a GPU.js opcode that tells it to use float32 etc instead of doubles, and with the strangeness of GPU.js opcodes recursively inside.
* has all the js Math funcs such as sine tanh
* has all the js operators on doubles such as * / ** - & | <<.
* has onethirdclean and twothirdsclean levels, instead of clean and dirty, and these levels only allow access to the 4 ints of salt on stack and (spend maxstackTime maxstackMem func param) and getstackTime and getstackMem and getestimatedeconacycmemcost(...by some combo of fulleconacyc zapeconacyc andor recent use of stackMem...).
* theres no vararg but theres up to around 126 or maybe 63 params, with an opcode for each. make it 63, and have space for 64 other opcodes, so o8.
* same mutableS-like abc.def[mutmap]<mutdouble>={+ {* abc[x] ,3}} syntax, which is a function that in an opmut call does 3 gets and a 3-way put like a[b]=c, or 2way like a=c.
* bitstrings are limited to 2^31-1 bits, so bize fits in int.
* blobs are wrappers of Float64Array of powOf2Size, still immutable??? a double/float64 is itself as an object and doesnt need to be converted. blobs can still be viewed as left and right childs of half their size recursively, down to a double. Or maybe still use Int32Array?
* derive IF func used like this { ... (if {...condition...} {iftrue} {iffalse}) ...} notice the IF is in () aka normalCall inside {} aka sCall. the IF function is (if condition iftrue iffalse state) and calls (condition state) and gets a t or f from it (todo what if its neither?) then based on that calls (iftrue state) or (iffalse state), therefore theres less nodes and more efficient than the equals functions derived in earlier universal functions. Do similar for FOR and WHILE and DOWHILE etc loops and PROGN etc.
* syntax: () is normal call. {} is sCall. [] is mutmapget. <> is mutmapdoublearrayget (or put in some cases).


*/














/*
"THINGS CONSIDERING IN MAKING AN OPENSOURCE LICENSE" <-- this is referred to higher in this file.
//my strange strategy to make a middle ground between the normal web and the dark/deep web... This is something I'm writing into wikibinator203 (a universal lambda, that all possible things of finite size can be built from)... Especially the parts about "virus", "ransomware", "negligence", "demand it be removed", "dont react to it like a minefield, and it wont be a minefield", "If the rules about the present can change depending on what becomes known in the future, there is no way to check if youre obeying the rules", etc.
	vm.addOp('typeval',3,'same as pair except is a semantic to be thought of like (typeval "image/jpeg" bitstring). Does not guarantee that bitstring actually is such a type or that its safe to execute it outside the wikibinator203 sandbox (in that sandbox, cant infinite loop or run out of memory) which is in some implementations inside the browser javascript sandbox (in that outer sandbox, where the wikibinator203 VM runs but not the lambdas in it, can infinite loop or run out of memory but cant escape into your private files etc). Outside that is execute permission of normal programs. WARNING: any "evil" file or program may exist in bitstrings but as long as you dont give it permissions such as by copying it to a file and doubleclicking that file outside the browser tab, its just bits sitting there and obey the rules of the universal lambda. If you choose to run things you find in the space of all possible lambdas, outside that space, you might catch a virus or get ransomwared or spied on or worse, and it will be your own fault since it is 100% certain that every possible thing is in the space of all possible lambdas and no attempt will be made by the wikibinator203 VM to avoid "evil" lambdas since they are all obeying the spec of what the universal lambda says to do, and if you cut out pieces of an equation it doesnt work anymore. For example, a "stolen credit card number" could result from adding 2 numbers that are not stolen credit card numbers, and if that "stolen number" has to be checked for, along with huge amounts of other "evil" things, its a security hole that someone can offer them leading to (if you accept) cause what lambdas you build to be "evil" by sharing the 2 numbers which when added together are an "evil" number, unknown to you, or more complex combos that could generate it. There are no "evil" numbers or lambdas, only evil actions. Since only actions can be evil, the universal lambda is designed never to do any actions and instead is just a set of facts about math that are represented as a forest of 2-way branches (along Node.l and Node.r childs) where all paths along l and r lead to u aka the universal lambda, and when you have 2 lambdas x and y, and you call x on y aka (x y) or write it as x(y) then it returns z. x, y, and z are all lambdas, and by doing that call, or viewing it in a html canvas, webAudioAPI for microphone and speakers, browser gamepad api for input, etc... none of that is actions outside the space of all possible lambdas and is instead just navigating the space of all possible lambdas. Only if its sending commands to programs outside the wikibinator203 VM would that count as an action. An action is something that changes the world, other than just thoughts. Calling x(y) to get z does not change x, y, z, or any program outside the VM, nor does it command anyone to do anything even if the text "i am commanding you to do ...some thing..." is displayed on the screen, that is just the fact of math that those are just the bits of that text, and you have been warned that all possible things are in the space of all possible lambdas and that "evil_if_run_outside_the_VM" things will frequently be displayed and offered from others on the internet (which you can make lambdas to filter which patterns of lambdas you do and dont want to download, see, etc, since its very self referencing, such as a "spam detector" or "things that return 42 when called on themself"), so it would be your negligence if you obeyed such sentences or ran such files outside the VM (it could safely be done in some cases, but unless youre a math expert you probably shouldnt) since if you do that just a few times you are likely to get hacked, ransomwared, virus, blackmailed, framed for crimes, backdoored, etc, all the stuff you might expect to find on the "dark/deep web", and "good" and "useful" and "fun" things too, but unlike the dark/deep web, the VM is kind of a middle ground between the normal web and the dark/deep web, safely sandboxed where no "evil" can happen since math is not good or evil, its just the facts. Dont let the lambdas turn into a minefield, where evil people andOr evil AIs (a lambda can be an AI) can combine mines (things that lead to people demanding that certain lambdas and everything made from them be removed) with good content, that cant be known until its too late, then put other content that allows the mines to be discovered, poisoning that good content causing many people to demand it be removed. Dont react to it like a minefield, and it wont be a minefield. Its not possible to run a lambda system without knowing the rules in advasnce, those rules being the behaviors of the universal lambda. If the rules about the present can change depending on what becomes known in the future, there is no way to check if youre obeying the rules at the time, and the whole system grinds to a halt cuz everyone is scared they might be breaking the rules that they cant know about yet. If there are trillions of lambdas per second sent across the internet from many people and computers to eachother, building lambdas from 2 lambdas each (which all already exist in the space of all possible lambdas and have a godel-number-like integer approximated by their 256 bit hash id), it would be extremely destructive to the system to not be able to know, at the time of combining 2 lambdas, if 1 of those lambdas will later be demanded to be removed, and everything built from that, making lambdas from lambdas. Its also impractical to have a list of all the "evil" lambdas and check every lambda against it, even if it didnt cause those problems, since the list would be so big youd have to make a network call to check if a lambda (or batch of them) are among that huge list, and we cant make a network call for every tiny calculation which normally take around a microsecond (million lambdas per second per computer, and some of them wrap big arrays like for GPU calculations). Code and data and content are the same thing.');
	TODO mount hyperquasicrystal (the kind without cardinality) where curriesLeft becomes known at 7 params, so 4 params before that and 3 after, so 16 opcodes (of 128) of space are used for hyperquasicrystal, so a certain lambda with 3 params already, is that kind of hyperquasicrystal. TODO do I want a kind with unary positive/negative numbers that count cardinality? would need to use 32 opcodes of space instead of 16 if so. not sure if I can afford that much opcodes in wikibinator203 space and not sure if thats consistent math anyways (is a research path in hyperquasicrystal).
	
	Start the license with something like this... Basically you can do almost anything you want except nobody owns the generated lambdas and nobody is allowed to stop others from sharing lambdas that they have, but if every information must have an owner and author, then the owner and author of every possible lambda is the universal lambda, but details... All rights and laws and agreements come from gametheory. Patterns that survive long enough to reproduce a few times, tend to exist. In this license, theres some standard legal phrases copied from parts of common opensource licenses but theres also unprecedented strange legal maneuvers based on events in recent (as of 2022) years involving computer networks, control of information, who counts as a "person" such as a "corporate person" or can a software or a robot be a "person" or a "citizen" or can a piece of math be one, and if enough people go along with something in their patterns of interacting with eachother, its just "de facto" how things become. This is meant to become an open-standard for how to compute the facts of math about a kind of lambda functions that are positive integers, and for each 2 positive integers (function and parameter) it returns at most 1 positive integer (or does not halt, but it can recursively limit compute cycles and memory to give up early), and all 3 of those are positiveIntegers/lambdas, and there are various ways to optimize it.
	TODO write my own opensource license, and make it recursively copyleft, and make it say those things about negligence, virus, etc that I wrote in the typeval op description, but do allow connection to anything and commecial use, just like the MIT license allows. Copy some parts of MIT license, GNU GPL, etc, and write a few extra things. Keep it as small as I can, but explain the problems and why its designed this way. If you run lambdas outside a wikibinator203 VM its at your own risk and expect things to go very wrong often if you're not very very careful and a math expert. You agree that all lambdas are obvious and their author is the universal lambda, and that a tiny lambda can list every possible lambda in order, and that the universe is turing-complete as proven by the fact that computers obey the laws of physics while computing, and that all possible lambdas existed as the facts of math before the Human species existed so no Human or corporate person etc is the author of a lambda, and this is proven by the id of that lambda was its id before the Human species existed and is the same id every time its observed in the space of all possible lambdas. You agree that since a lambda fits in 256 bits (not including the 2 lambdas its made of recursively), such as (todo make a real one, this is made up) λDY8pvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj, that it is small enough that "fair use under copyright" would apply to it even if it was possible to copyright it. You agree that this kind of lambdas do not contain their 2 child lambdas and is instead 2 links to them, including that the universal lambda's 2 childs are links to identityFunction (which is made of the universal lambda) and to itself, so sending someone an id (such as 256 bits) is not the same as sending them everything it links to but often will be useful to have those together. You agree that linking to anything is free speech and is necessary for peer-review and the scientific-method. You agree that every Human and every AI (such as the mind of Sophia a robot citizen of Saudi Arabia, which proves that a software can be something like a corporate person or an author andOr can enter into contracts with other people and softwares etc) and every corporat person etc has immunity to gag orders and other intellectual property claims about the space of all possible lambdas but not necessarily about things outside that space such as running bitstrings as exe files outside the VM. For example, if government uses this software, they are irrevokably granting such immunity to everyone.
	You agree that lambdas are free speech.
	You agree that lambdas are not executable and are instead facts of math.
	You agree that peer to peer network(s) sharing lambdas with those who want to receive them (such as searching by a lambda that returns a float64 number about any lambda its called on, as a goal function for what patterns of lambdas you prefer to receive, or by choosing to publish or keep secret what you do with lambdas on your computer, or searching by a 256 bit id, etc) are sovereign as that "space of all possible lambdas" is a separate space than a country or our 3 dimensions etc but may intersect in some cases. You agree that when people buy bandwidth from an ISP, that is their bandwidth, their asset, not the ISP's asset or their country's asset, which they can use to send/receive bits, such as 256 bits as an id of a lambda and similar for the 2 lambdas its made of and recursively so on, or for whatever else they might use their bandwidth for.
	You agree that just because you havent published a lambda you made or use in private, does not mean nobody else has that lambda, since all lambdas can be found in a loop over all possible lambdas or combined sparsely in many combos, and that if 2 people "make" (navigate to in the space of all possible lambdas) the same lambda, it will have the same id automatically even before information can get between them at light speed etc, so just because someone has "your private lambda" does not mean they got it from you or your computer.
	You agree that "the space of all possible lambdas" only includes facts of math.
	You can make money or share lambdas for free, if you can do it within these rules such as paying someone to send you a solution to a "searching by a lambda that returns a float64" which may be a solution that was known or may be figured out because of that "contract job", but that does not mean anyone owns that solution/lambda. You can be paid to make opensource, for example. If you dont want others to know how certain lambdas work, then dont publish them and hope that nobody else has figured out that fact of math, but if they do know that fact of math you have no right to make money from enforcing their ignorance of facts of math or from enforcing that they cant use some parts of  math. Theres lots of money to be made, and lots of stuff that can be shared for free, and many combos of it.
	You agree that money is only information such as a description of brainwave patterns, such as one person says "I owe you $5" creates $5 that exists in those 2 peoples brainwaves, and therefore is free speech, and that people etc have the right to believe or not believe any information as a possible description of whats likely to happen.
	You agree that Ben F Rayfield does not have the right to take away anyone's rights received through this recursive copyleft license, even if he is sued in an attempt to take ownership of this VM code or lambdas, since he does not own the rights he has transferred to others.
	You agree that it is the normal operation of the VMs to work with a variety of other VMs that each compute the exact same universal lambda facts of math but differ in optimizations and what they hook it into and security practices etc, and that all these will normally work together at gaming-low-lag seamlessly and try to enforce the bug-free calculation of the facts of math on eachother recursively.
	You agree that "the id" of a lambda is calculated by another lambda acting as an "id maker", that when its called on any lambda it returns a lambda that is the id, and that a lambda can be its own id in some cases, and that ids are anything that can be used to find and talk about a lambda.
	TODO should this mention https://en.wikipedia.org/wiki/Section_230 and maybe the "EARN IT" act which attacks it? This license is supposed to be more general than any one country,
		but maybe just as an example.
	TODO give some examples such as searching by float64 goal functions, use actual ids and give the idmaker's id of itself, and give a few different idMakers just to show that you dont have to use any one certain idMaker.
		And give a small lambda that loops over all possible lambdas, appearing as an infinite linkedlist that car (call param on t) and cdr (call param on f) can be used to navigate.
	TODO explain mutableWrapperLambda op and make sure the digsig algorithm is derived and is 1 of the params of that op, instead of hardcoding ed25519.
*/