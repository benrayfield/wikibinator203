
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
stackIsAllowGastimeGasmem //the 2x2 kinds of clean/dirty/etc. exists only on stack. only with both isClean and isAllowSinTanhSqrtRoundoffEtc at once, is it deterministic. todo reverse order aka call it !isDirty instead of isClean?
stackIsAllowNondetRoundoff //isAllowSinTanhSqrtRoundoffEtc //the 2x2 kinds of clean/dirty/etc. exists only on stack. only with both isClean and isAllowSinTanhSqrtRoundoffEtc at once, is it deterministic. todo reverse order?
stackIsAllowMutableWrapperLambda
stackIsAllowAx (fixme, is it varargAxCall or just axa (and maybe axb?))
lambda //(lambda funcBody ? ?ddee a b ??? c d e) -> (funcBody (pair (lambda funcBody ? ?ddee a b ??? c d) e))
getnamedparam //ddee? would be a syntax for '(getnamedparam "ddee")', and appears like 'ddee?' .
opOneMoreParam //(lambda funcBody ? ?ddee a b ??? c d e) -> (funcBody (pair (lambda funcBody ? ?ddee a b ??? c d) e))
s
t
f
l
r
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
spendTimeMemFuncParam maxGasTime maxGasMem func param
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
Each musical instrument part will have 3 fields in its state, numbers in, numbers out, and the state it uses for whatever it wants. and maybe a gasTime counter?
These numbers in and numbers out are hooked together by the outer mut, similar to how it happens in puredata.
The musical instrument calculation, of chosen t time cycles (such as WebAudioAPI can do 256 cycles, 512 cycles, etc at once, but lambdas dont send to external sound or video, instead
external stuff would only read lambdas returned after calling lambdas on lambdas) will come in 3 parts:
* verify each musical instrument piece does not allocate anything in last part, and that each is limited to a chosen amount of gasTime in the outer mut call.
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
	
	vm.lastIdA = 0;
	vm.lastIdB = 0;
	vm.incIdAB = function(){
		this.lastIdA = (this.lastIdA+1)|0; //wrap int32
		if(this.lastIdA) this.lastIdB++;
	};
	
	//https://en.wikipedia.org/wiki/Evil_bit
	//For wikibinator203, evilBit off means "the normal internet", and on means "antivirus quarantine, spread across many computers which apps may run inside".
	//Anyone who gives execute permission to, or obeys or believes, something in an antivirus quarantine is at fault/negligence if something goes wrong,
	//since they were told its evil and chose to do that anyways.
	//To avoid breaking the merkle garbage collector, "evil" content that has incoming pointers will not be removed,
	//and the same should be true for "good" content but things might get removed anyways cuz people demand things of eachother, and things might break in the "good" area.
	vm.callPairPrefixByte_evilBitOn =  0b11110100; //FIXME might need to rearrange these bits so its easier to write as text in base64 or base58
	vm.callPairPrefixByte_evilBitOff = 0b11110000; //FIXME
	
	//only for the kind of callpairs whose id starts with 11111000. If it starts with 11111001 or 11111010 or 11111011 then its a literal 256 bits but is not its own id.
	//If it does not start with 111110 then it is literal 256 bits that is its own id.
	//Starting with 11111000 means its either a callpair including 192 bits of hash or is a literal 128 bits, or 64 or 32 or 16 or 8 or 4 or 2 or 1.
	//vm.headerOfNonliteralCallPair = function(o8, curLeftOr, upTo8BitsOfMasks){
	//	return (0b11111000<<24)|((o8&255)<<16)|((curLeftOr&255))|(upTo8BitsOfMasks&255);
	//};
	//vm.headerOfNonliteralCallPair = function(o8, curriesLeft12, cleanMask4){
	vm.headerOfNonliteralCallPair = function(o8, curriesLeft12, stackIsAllowGastimeGasmem, stackIsAllowNondetRoundoff, stackIsAllowMutableWrapperLambdaAndSolve, stackIsAllowAx){
		return (vm.callPairPrefixByte<<24)|(curriesLeft12&0xfff)|(stackIsAllowGastimeGasmem?8:0)|(stackIsAllowNondetRoundoff?4:0)|(stackIsAllowMutableWrapperLambdaAndSolve?2:0)|(stackIsAllowAx?1:0);
	};
	//FIXME UPDATE: 6+2+8+12+4+1+31 cuz: FIXME go down to max 4095 params so an evaling can store the 4 bits that go on stack? cuz need those 4 bits. Halted lambdas are always clean (those 4 bits are 0).
	//FIXME its 6+2+8+16+1+31 bits. the only mask bit is in the bize int, not the header int.
	//not "teralCallPair = function(o8, curLeftOr, upTo8BitsOf". fix those params.
	
	
	vm.headerOfLiteral256BitsThatIsItOwnId = function(firstInt){
		let first6Bits = (firstInt>>26)&0b111111;
		if(first6Bits == 0b111110) throw 'Is not its own id cuz starts with 0b111110';
		
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
	vm.maxCurriesLeft = 0xfff;
	
	//DONE: rename to vm.maxCurriesLeft? or is it maxCurries in total? See "(opOneMoreParam varNameOrComment (lambda...)) but cant add another param cuz is already at max params" comment.
	
	vm.opInfo = []; //size 256
	
	vm.λimport = function(globalIdString){
		throw 'TODO instantly return a Node that it tries to load async, especially if Node.L() or Node.R() etc are called on it? So can run this in a loop for efficient batch loading of nodes/lambdas?';
	};
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

	//the datastruct of forest of lambdas, each with 2 childs (Node.l and Node.r, which are the lambdize wrappers of Node) where all paths lead to the universal lambda.
	//lambdize means to wrap a Node in a lambda. Node is the internal workings of a lambda.
	//
	vm.Node = function(vm,l,r){
		
		//TODO "header64: 6+2+8+16+1+31", see comment about it.
		
		this.l = l;
		this.r = r;
		
		let isLeaf = r==null;
		let lNode = l();
		let rNode = r();
		let leftOp = lNode.o8();
		let rightOp = rNode.o8();
		let lcur = lNode.curriesLeft;
		let isLessThan7Params = leftOp < 64; //including (l r)
		let leftOpLessThan128 = leftOp < 128;
		let chooseOpNowOrEval = lcur==1;
		let isNowGettingIts7thParam = leftOpLessThan128 && chooseOpNowOrEval;
		let rightIsCbt = (rightOp == vm.o8OfBit0 || rightOp == vm.opOfBit1);
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
		}
		
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
		
		//int. 6 bits are 111110 for is literal self or not. then 2 bits (00 is callpair, else is literal 256 bits).
		//then o8. then curriesLeftOr255ToMeanMoreThan254. then up to 8 mask bits (containsBit1, etc).
		this.header = vm.headerOfNonliteralCallPair(o8, curLeftOr, upTo8BitsOfMasks); //FIXME check if it is a literal (globalId256 does not start with 11111000).
		//this.header = 0; //FIXME need to compute header as int
		
		//int. bize is max 31 bits. past that it will make linkedlist or something (todo) of cbts.
		this.bize = -2; //-2 means dont know bize yet (lazyEval). -1 means its all 0s or is not a cbt. nonnegative means its the low 31 bits of the index of the last 1 bit. FIXME TODO write code to deal with that in blob and normal callpairs
		//FIXME set bize
		
		vm.incIdAB(); //change vm.lastIdA and vm.lastIdB.
		//The 4 ints of localId, used in hashtable (TODO that would be more efficient than {} with string keys for https://en.wikipedia.org/wiki/Hash_consing
		this.idA = vm.lastIdA
		this.idB = vm.lastIdB;
		this.blobFrom = 0; //int. TODO
		this.blobTo = 0; //int. TODO
		
		//this.blob = TODO null or Int32Array.
		this.blob = null; //TODO null or Int32Array.
		
		//this.idString;
		
		this.evaler = l ? l().evaler : vm.rootEvaler; //u/theUniversalFunction's evaler is vm.rootEvaler, but everything else copies its evaler from its l child, which may be optimized evalers added later.
		

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
			return vm.nodeToStringPrefix+evilbitStr+this.slowLocalId();
		}
	};
	
	vm.nodeToString = function(node){
		if(vm.nodeToStringIncludesChilds === undefined) throw 'FIXME bind or what? this is getting disorganized for some funcs to be in vm and some in vm.Node.prototype';
		if(nodeToStringIncludesChilds) return vm.nodeToStringOne(node);
		else return vm.nodeToStringOne(node)+vm.nodeToStringOne(node.L())+vm.nodeToStringOne(node.R());
	};
	
	//vm.base58Digits = 
	
	//of first int
	vm.evilBitMask = TODO;
	
	//true/false. TODO always store it as evil (since thats the most general, allowing (probably accidental) evil, good, and neutral), and just view it as good if requested.
	vm.evilBitOf = function(headerInt){
		return (this.evilBitMask&headerInt)?true:false;
	};
	
	//true/false. TODO always store it as evil (since thats the most general, allowing (probably accidental) evil, good, and neutral), and just view it as good if requested.
	vm.Node.prototype.evilBit = function(){
		return vm.evilBitOf(this.header);
	};
	
	vm.gasTime = 1000000; //fill these back up before starting another call at bottom of stack, to avoid running out, but not until the stack becomes empty.
	vm.gasMem = 1000000;

	vm.gasErr = 'gasErr';

	vm.prepay = function(time,mem){
		let newTime = this.gasTime-time;
		let newMem = this.gasMem-mem;
		if(newTime <= 0 || newMem <= 0) throw this.gasErr;
		this.gasTime = newTime;
		this.gasMem = newMem;
		return undefined; //so you can || it with things for shorter lines of code
	};
	
	vm.Node.prototype.getEvaler = function(){
		let evaler = this.evaler;
		if(!evaler) throw 'No evaler in thisNode='+this; //TODO optimize by removing this line since all Nodes will have evalers
		while(!evaler.on) evaler = evaler.prev;
		return evaler;
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
		return (headerInt&0x00fe0000)==vm.o8OfBit0;
	};
	
	vm.Node.prototype.isCbt = function(){
		return this.isCbtOf(this.header);
	};
	
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
		return this.header&0xfff;
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
	};

	vm.Node.prototype.toString = function(){
		return this.vm.nodeToString(this);
		//return this.slowLocalId();
		//TODO 1 char prefix concat base58 form of 256 bit default kind of id, recursively.
	};

	vm.Mut = function(n){
		this.m = {};
		this.d = new Float64Array(n);
	};
	
	
	
	//TODO faster localIds instead of strings in map. use an Int32Array and a [], or something like that, for faster hashtable specialized in Nodes.
	vm.dedupMap = {};
	//FIXME put u in dedupMap

	//TODO faster localIds instead of strings in map. use an Int32Array and a [], or something like that, for faster hashtable specialized in nodes.
	vm.funcallCacheMap = {};

	vm.dedupKeyOfNode = function(isLeaf,func,param){
		//TODO see comment "dont concat strings to create key" in similar code.
		this.prepay(1,2); //FIXME?
		return isLeaf+"_"+func().slowLocalId()+"_"+param().slowLocalId();
	};
	
	//TODO use faster hashtable specialized in things having 4 ints.
	vm.Node.prototype.slowLocalId = function(){
		//TODO see comment "dont concat strings to create key" in similar code.
		//FIXME need to pay this somewhere but dont have vm param here: vm.prepay(1,2);
		return this.idA.toString(16)+"_"+this.idB.toString(16)+"_"+this.blobFrom.toString(16)+"_"+this.blobTo.toString(16);
	};

	//FIXME must have 4 ints of salt and 3 bits of kinds of clean, on stack, for funcall cache.
	vm.dedupKeyOfFuncallCache = function(func,param,func,param,optionalStackStuff){
		//TODO dont concat strings to create key. just look it up without creating heap mem, in a hashtable specialized in 128+128 bit keys (128 bits of localId per lambda).
		//But until then, dedupKeyOfFuncallCache will prepay to include gasMem, instead of just gasTime.
		this.prepay(1,4); //FIXME?
		return "cache_"+func().slowLocalId()+"_"+param().slowLocalId()+"_"+(optionalStackStuff || vm.defaultStackStuff);
	};


	//increases every time any FuncallCache is used, so can garbcol old funcallcaches.
	vm.touchCounter = 0;
	
	vm.StackStuff = function(fourIscleanvsdirtyBits, saltA, saltB, saltC, saltD){
		this.fourIscleanvsdirtyBits = fourIscleanvsdirtyBits;
		this.saltA = saltA;
		this.saltB = saltB;
		this.saltC = saltC;
		this.saltD = saltD;
	};
	
	//pure deterministic, no ax (which is deterministic but can have infinite cost to verify), and 128 0s for salt.
	//Use this as immutable.
	//When forkEditing, salt can change to anything by unitary transform or replacing it with its hash,
	//but the 4 iscleanvsdirty bits can only change from 1 to 0, similar to gasTime and gasMem can only decrease (or stay same) but not increase,
	//until the first call returns, then can start with any StackStuff you and gasTime gasMem etc you want.
	vm.defaultStackStuff = new vm.StackStuff(0,0,0,0,0);

	//TODO use Node.lazyReturn, as a different way of funcall caching, but this way with the touch uses less memory and is a little faster.
	//but as a demo of the math, make both ways work. it can be done without this kind of FuncallCache at all.
	vm.FuncallCache = function(func,param,optionalStackStuff){
		this.func = func;
		this.param = param;
		this.stackStuff = optionalStackStuff || vm.defaultStackStuff;
		this.ret = null; //func, param, and ret, are all what lambdize returns.
		this.touch = ++this.touchCounter; //for garbcol of old funcallcaches
	};
	
	

	//returns a vm.FuncallCache, not its ret, so you can read or write its ret. Sets its FuncallCache.touch to newest of any FuncallCache.
	//salt isnt needed in pure clean mode, but if you want gasTime gasMem etc, to repeat the same call without getting the same return value from earlier cache, use salt.
	//salt is any 4 ints. Normally the first lambda call uses a random salt, and unitary transforms it by 2 different transforms as it takes different paths on stack,
	//but only changes salt when it wants to fork a different run of the same lambda call.
	//Whena all 4 iscleanvsdirty bits are 0, the same run of the same lambda call always returns the same lambda, but its useful to limit compute cycles and memory
	//and for some lambda calls to take different paths depending on if other lambda calls run out of compute resources or not, recursively.
	//Since there are many possible optimizations and that may vary across wikibinator203 VMs, the amounts of compute resources are nondeterministic,
	//and so are what digital signatures mutableWrapperLambda may find or not find, or find a newer one if theres multiple.
	//The 4 bits are to allow or not allow various kinds of nondeterminism, recursively on stack can tighten but not loosen.
	vm.funcallCache = function(func, param, optionalStackStuff){
		
		
		//TODO dont concat strings to create key. just look it up without creating heap mem, in a hashtable specialized in 128+128 bit keys (128 bits of localId per lambda).
		//But until then, dedupKeyOfFuncallCache will prepay to include gasMem, instead of just gasTime.
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
		switch(arguments.length){
			case 0: return this.identityFunc;
			case 1: return arguments[0];
			case 2:
				let func = arguments[0];
				let param = arguments[1];
				if(param().o8()==1 && func().o8() == this.o8OfIdentityFunc){
					this.prepay(1,0);
					return this.u; //the only node whose o8 is 1, but I'm making a point by implementing it without using == on nodes, just on bytes.
				}else{
					//TODO use faster kind of localIds and dedup than string. but for now i just want to get it working asap. GPU optimize, js code eval optimize, webasm optimize, etc later.
					let key = this.dedupKeyOfNode(false,func,param);
					return this.dedupMap[key] || (this.prepay(0,1) || (this.dedupMap[key] = vm.lambdize(new this.Node(this,func,param))));
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
		return this().slowLocalId(); //FIXME return a 45 char 256 bit globalId similar to (this one is made up) λDY8pvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj
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
			
			if(param === undefined) return NODE; //aLambda() returns the node it wraps. Example: aLambda().func or aLambda().param or aLambda().Node or aLambda().FuncallCache
			return NODE.getEvaler()(VM,NODE.lam,param); //eval lambda call, else throw if not enuf gasTime or gasMem aka prepay(number,number)
		};
		//lambda = lambda.bind(this);
		lambda.toString = vm.lambdaToString;
		return (node.lam = lambda);
	};
	
	//TODO pushEvaler with .on and .prev and (prepay,func,param) or maybe (vm,func,param)
	
	//vm.opcodeToO8 = {}; //string to o8
	//vm.opcodesDescription = {};
	//vm.nextOpO8 = 128; //128..255
	//vm.o8ToLambda = []; //o8 of 0 is either evaling or doesnt exist. o8 of 1 to 255 exists. Past that, they copy o8 from l child.
	//vm.o8ToLambda[0] = (x=>{throw 'o8 of 0 does nothing or is evaling';});
	vm.opInfo = [];
	vm.addOp = (name,curriesLeft,description)=>{
		let o8 = vm.opInfo.length;
		if(o8 >= 256) throw 'Max 128 opcodes, whose o8 is 128 to 255. 0 is evaling. 1 to 127 is the first 0-6 params, before the op is known at 7 params. If you want to redesign this to use different ops, you could replace the last half of vm.opInfo, but you must keep the first half. You could change it to have a different number of ops, such as 1024 ops, using a bigger array twice as big as the number of ops, but then youd need to take some bits from the header int such as only having 13 bits of curriesLeft so up to 8191 curries instead of 2^16-1 curries. But its a universal lambda and that shouldnt be needed. Everyone can use the same opcodes and make all possible programs with that. You might want to use a different universalLambda/opcodes if its easier to optimize for certain kinds of things, but I think this one will be GPU.js optimizable, javascript eval optimizable, etc.';
		//TODO vm.o8ToLambda[vm.nextOpO8] = 
		//vm.opcodeToO8[name] = vm.nextOpO8;
		//vm.opcodesDescription[name] = (description || 'TODO write description of opcode '+name);
		//vm.nextOpO8++;
		vm.opInfo.push({name:name, curriesLeft:curriesLeft, description:description});
		return o8;
	};
	vm.addOp('evaling',0,'This is either never used or only in some implementations. Lambdas cant see it since its not halted. If you want a lazyeval that lambdas can see, thats one of the opcodes (TODO) or derive a lambda of 3 params that calls the first on the second when it gets and ignores the third param which would normally be u, and returns what (thefirst thesecond) returns.'});
	for(let o8=1; o8<128; o8++}{
		//TODO 'op' + 2 hex digits?
		let numLeadingZeros = Math.clz32(o8);
		let curriesSoFar = 31-numLeadingZeros;
		let curriesLeft = 7-curriesSoFar;
		let name = 'op'+o8.toString(2);
		vm.addOp(name, curriesLeft, name+' has '+curriesSoFar+' params. Op is known at 7 params, and is copied from left child after that.');
	}
	vm.o8OfBit0 = vm.addOp('bit0',4088,'complete binary tree is made of pow(2,cbtHeight) number of bit0 and bit1, evals at each curry, and counts rawCurriesLeft down to store (log2 of) cbt size'); //FIXME is it 4088 or 4077 or what?
	vm.o8OfBit1 = vm.addOp('bit1',4088,'see bit0');
	vm.o8OfL = vm.addOp('l',1,'get left/func child. Forall x, (l x (r x)) equals x, including that (l u) is identityFunc and (r u) is u.');
	vm.o8OfR = vm.addOp('r',1,'get right/param child. Forall x, (l x (r x)) equals x, including that (l u) is identityFunc and (r u) is u.');
	vm.addOp('t',2,'the church-true lambda and the k lambda of SKI-Calculus, aka λy.λz.y');
	vm.addOp('f',2,'the church-false lambda aka λy.λz.z. (f u) is identityFunc.');
	vm.addOp('isClean',1,'the 2x2 kinds of clean/dirty/etc. exists only on stack. only with both isClean and isAllowSinTanhSqrtRoundoffEtc at once, is it deterministic. todo reverse order aka call it !isDirty instead of isClean?');
	vm.addOp('sAllowSinTanhSqrtRoundoffEtc',1,'the 2x2 kinds of clean/dirty/etc. exists only on stack. only with both isClean and isAllowSinTanhSqrtRoundoffEtc at once, is it deterministic. todo reverse order?');
	vm.addOp('lambda',2,'Takes just funcBody and 1 more param, but using opOneMoreParam (the only vararg op) with a (lambda...) as its param, can have up to '+vm.maxCurries+' params including that funcBody is 8th param of u. (lambda funcBody ?? a b ??? c d e) -> (funcBody (pair (lambda funcBody ?? a b ??? c d) e))');
	vm.addOp('getNamedParam',2,'ddee? would be a syntax for (getnamedparam "ddee").');
	vm.addOp('opOneMoreParam',0,'Ignore See the lambda op. This is how to make it vararg. Ignore (in vm.opInfo[thisOp].curriesLeft cuz vm.opInfo[thisOp].isVararg, or TODO have 2 numbers, a minCurriesLeft and maxCurriesLeft. (lambda funcBody ?? a b ??? c d e) -> (funcBody (pair (lambda funcBody ?? a b ??? c d) e))');
	vm.addOp('s',3,'For control-flow. the s lambda of SKI-Calculus, aka λx.λy.λz.xz(yz)');
	vm.addOp('isleaf'1,'returns t or f of is its param u aka the universal lambda');
	vm.addOp('pair',3,'the church-pair lambda aka λx.λy.λz.zxy');
	vm.addOp('infcur',vm.maxCurriesLeft,'like a linkedlist but not made of pairs. just keep calling it on more params and it will be instantly halted.');
	
	
	
	
	
	
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
	spendTimeMemFuncParam maxGasTime maxGasMem func param
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
	
	while(vm.opInfo.length < 256) vm.addOp('op'+vm.opInfo.length+'ReservedForFutureExpansionAndInfloopsForNow', 1, 'Given 1 param, evals to (s i i (s i i)) aka the simplest infinite loop, so later if its replaced by another op (is reserved for future expansion) then the old and new code will never have 2 different return values for the same lambda call (except if on the stack the 3 kinds of clean/dirty (roundoff, mutableWrapperLambda, allowGas) allow nondeterminism which if theyre all clean then its completely deterministic and theres never more than 1 unique return value for the same lambda call done again.';
	
	vm.bit = function(bit){ return bit ? this.t : this.f };
	
	//runs an infinite loop, which can be caught by the nearest spend call (limiting time and memory higher on stack than such call, recursively can tighten),
	//so actually just throws.
	vm.infloop = ()=>{ throw this.gasErr; }
	
	vm.pair = TODO; //similar to vm.t and vm.f and few other ops
	
	
	/* very slow interpreted mode. add optimizations as recursive evalers whose .prev is this or eachother leading to this, that when !evaler.on then evaler.prev is used instead.
	u.evaler is this rootEvaler. All other evalers are hooked in by aLambda.pushEvaler((vm,l,r)=>{...}), which sets its evaler.prev to aLambda.evaler before setting aLambda.evaler to the new one,
	and if the evaler doesnt have an evaler.on field, creates it as true.
	*/
	vm.rootEvaler = (vm,l,r)=>{
		//"use strict" is good, but not strict enough since some implementations of Math.sqrt, Math.pow, Math.sin, etc might differ
		//in the low few bits, and for that it only calls Math.sqrt (for example) if vm.stackIsAllowNondetRoundoff. Its counted as nonstrict mode in wikibinator203,
		//which it has 2^4=16 kinds of strict vs nonstrict that can be tightened in any of 4 ways on stack so stays tight higher on stack until pop back from there.
		//The strictest is pure determinism and will compute the exact same bits in every wikibinator203 VM. All halted lambdas are that strictest way,
		//and only during evaling 2 strictest lambdas to return at most 1 strictest lambda, between that you can use any of the 16 kinds of strict vs loose, and recursively tighten,
		//similar to vm.gasTime and vm.gasFastMem can be tightened to have less compute cycles and memory available higher on stack, but cant be increased after a call starts.
		"use strict";
		console.log('opcodeToO8='+JSON.stringify(vm.opcodeToO8));
		vm.prepay(1,0);
		let cache = vm.funcallCache(l,r);
		if(cache.ret) return cache.ret;
		if(l().curriesLeft > 1){
			//(l.o8() < 64) implies (l.curriesLeft) but it could also be cuz theres more params such as s takes 3 params so the first 2 curries are halted, and 1 op (lambda) has vararg.
			return vm.cp(l,r);
		}else{
			//last 3 params
			let x = l().l().r; //TODO use L and R opcodes as lambdas and dont funcall cache that cuz it returns so fast the heap memory costs more
			let y = l().r;
			let z = r;
			let ret = null;
			let o = vm.opcodeToO8;
			let o8 = l().o8();
			switch(o8){
				case o.stackIsAllowGastimeGasmem: //!isClean. allow gasMem and gasTime etc more than 1 level deep (clean lambdas cant see it, but can still run out of it, throws to just past the cleans)
					ret = vm.bit(vm.stackIsAllowGastimeGasmem);
				break;case o.stackIsAllowNondetRoundoff:
					ret = vm.bit(vm.stackIsAllowNondetRoundoff);
				break;case o.stackIsAllowMutableWrapperLambdaAndSolve:
					ret = vm.bit(vm.stackIsAllowMutableWrapperLambdaAndSolve);
				break;case o.stackIsAllowAx:
					ret = vm.bit(vm.stackIsAllowAx);
				
				FIXME go down to max 4095 params so an evaling can store the 4 bits that go on stack? cuz need those 4 bits. Halted lambdas are always clean (those 4 bits are 0).
				
				/*
				FIXME its 4x2: stackIsAllowGastimeGasmem, stackIsAllowNondetRoundoff, stackIsAllowMutableWrapperLambda, stackIsAllowMutableWrapperLambda.
				opcodes:
				stackIsAllowGastimeGasmem //the 2x2 kinds of clean/dirty/etc. exists only on stack. only with both isClean and isAllowSinTanhSqrtRoundoffEtc at once, is it deterministic. todo reverse order aka call it !isDirty instead of isClean?
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
					z.l;
				break;case o.r:
					z.r;
				break;case o.isLeaf:
					ret = Bit(z.o8==1);
				break;case o.pair:case o.typeval:
					ret = z(y)(x);
				break;case o.varargAx:
					if(vm.stackIsAllowAx){
						let funcBodyAndVarargChooser = TODO get eighth param;
						FIXME varargAx should always have curriesLeft of 1 even after it gets its next curry, and next after that...
						It can have unlimited curries since funcBodyAndVarargChooser chooses to be halted or to eval, at each next curry.
						let nextParam = z;
						//vm.stackIsAllowAx
						
						//tighten clean/dirty higher in stack during verifying ax constraint so its deterministic.
						let prev_stackIsAllowGastimeGasmem = vm.stackIsAllowGastimeGasmem;
						let prev_stackIsAllowMutableWrapperLambda = vm.stackIsAllowMutableWrapperLambda;
						let prev_stackIsAllowNondetRoundoff = vm.stackIsAllowNondetRoundoff;
						
						let axEval;
						try{
							axEval = funcBodyAndVarargChooser((vm.pair)(l)(r)); //evals to u/theUniversalFunction to define l(r) as halted, else evals to u(theReturnVal)
						}finally{ //in case throws vm.gasErr
							//put clean/dirty back on stack the way it was
							vm.stackIsAllowGastimeGasmem = prev_stackIsAllowGastimeGasmem;
							vm.stackIsAllowMutableWrapperLambda = prev_stackIsAllowMutableWrapperLambda;
							vm.stackIsAllowNondetRoundoff = prev_stackIsAllowNondetRoundoff;
						}
						
						
						if(axEval == u){
							ret vm.cp(l,r); //l(r) is halted. l(r) is whats evaling right now, which is what makes varargAx a strange op.
						}else{
							ret = axEval().r; //L(axEval). TODO optimize by L and R and isLeaf ops dont cache, just return instantly by getting those fields
						}
						FIXME, if any lambda contains a call of varargAx with more than 8 params, since that means a constraint has been verified, then stackIsAllowAx bit must be 1 when halted.
					}else{
						vm.infloop();
					}
					//FIXME it said somewhere said that opOneMoreParam is the only vararg, but actually theres 3: infcur, varargAx, and opOneMoreParam.
					//so update comments and maybe code depends on that?
				break;case o.sqrt: //of a cbt64 viewed as float64
					if(vm.stackIsAllowNondetRoundoff){
						let float64 = TODO;
						ret = TODO wrap Math.sqrt(float64) in cbt64;
						throw 'TODO';
					}else{
						TODO either compute the exact closest float64 (and what if 2 are equally close, and should it allow subnormals?) (try to do that, choose a design) or infloop (try not to)
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
	u().l = vm.identityFunc = vm.cp(u,u,u,u,u,u,u,u);
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
	
	
	//map of op name (such as 's' or 'pair' to lambda
	vm.ops = {};
	for(let opName in vm.opcodeToO8){
		let o8 = vm.opcodeToO8[opName];
		let lambda = vm.o8ToLambda(o8);
		vm.ops[opName] = lambda;
	}
	
	for(let o8=1; o8<256; o8++){
		vm.o8ToLambda[o8] = vm.o8ToLambda(o8);
	}
	
	//cuz vm.bit func needs these. todo opcode order.
	//vm.t = TODO;
	//vm.f = TODO;
	
	vm.gasTime = 1000000; //fill these back up before starting another call at bottom of stack, to avoid running out, but not until the stack becomes empty.
	vm.gasMem = 1000000;
	vm.prepay(1,2);
	if(vm.gasTime != 999999) throw 'gasTime is broken';
	if(vm.gasMem != 999998) throw 'gasMem is broken';
	
	return u; //the universal function
})();

console.log('Script ended. wikibinator203 = '+wikibinator203);

let u = wikibinator203;


let vm = u().vm;


console.log('wikibinator203...');

console.log('wikibinator203 = '+wikibinator203);

let uu = u(u);

console.log('uu = '+uu);

if(u().o8() != 1) throw 'Wrong o8: '+u().o8();
if(u(u)().o8() != 2) throw 'Wrong o8: '+u(u)().o8();
if(u(u) != u(u)) throw 'dedup is broken';
if(u(uu)().o8() != 3) throw 'Wrong o8: '+u(uu)().o8();
if(u(uu)(uu)(uu)(uu)(u)(uu)().o8() != 125) throw 'Wrong o8: '+u(uu)(uu)(uu)(uu)(u)(uu)().o8();
if(u(uu)(uu)(uu)(uu)(uu)(uu)().o8() != 127) throw 'Wrong o8: '+u(uu)(uu)(uu)(uu)(uu)(uu)().o8();

let ops = u().vm.ops;
for(name in ops){ console.log('Creating var: '+name); eval(name+' = ops.'+name); };

console.log('t().o8() == '+t().o8());
t(uu)(u);

















































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
	isDirtyGas //limit compute resources recursively by gasTime, gasMem, etc, but that prevents it from being deterministic so can limit to just 1 level of that deep on stack.
	isDirtyRoundoff //allow Math.sin(double) Math.tanh(double) etc, vs those funcs always infloop and you only get 
	//(opMutableWrapperLambda derivedFuncOfEd25519OrWhateverDigsigAlgorithm passwordOrU pubkeyOrU message) -> some signed form,
	//maybe with a minTime maxTime and time (utcFloat64) or maybe just a pubkey func return, or maybe pubkey func time return.
	isDirtyMutableWrapperLambdaOrSolve
	//dont need this cuz inside hyperquasirystal op it will already do that: isAllowAnythingExceptHyperquasicrystal




FIXME its 4x2: stackIsAllowGastimeGasmem, stackIsAllowNondetRoundoff, stackIsAllowMutableWrapperLambdaAndSolve, stackIsAllowAx.
FIXME should be 3x2 levels of clean/dirty, instead of 2x2. mutableWrapperLambda and solve* are above the level of just allowing spend/gasTime/gasMem.



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


FIXME its 4x2: stackIsAllowGastimeGasmem, stackIsAllowNondetRoundoff, stackIsAllowMutableWrapperLambdaAndSolve, stackIsAllowAx.









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
* has onethirdclean and twothirdsclean levels, instead of clean and dirty, and these levels only allow access to the 4 ints of salt on stack and (spend maxgastime maxgasmem func param) and getgastime and getgasmem and getestimatedeconacycmemcost(...by some combo of fulleconacyc zapeconacyc andor recent use of gasmem...).
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