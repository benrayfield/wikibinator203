// https://github.com/benrayfield/wikibinator203

//alert('TODO for vm.eval, make another layer, of vararg tree, for [] {} () <> a:b:c:d syntaxs, before evaling anything, which means it wont merge duplicate fns in code string at this level (and at lazyDedup level it will mostly except for some blobs, and at globalId256 level everything is deduped). Make that tree so can look at it in browser debugger to make sure it parsed right before evaling its parts, since thats unnecessary extra work to do at once when tracking down bugs. Eventually the eval func will be derived from combos of U/TheUniversalLambda, so you can make new syntaxes at the same level as the default syntax. Do that in vm.ParseTree. ParseTree comment, add a fifth kind of list, \':\' where literal \':\' or \'\' (as in \'a(b c)d\' or \'M[...]\') is the fifth kind, < [ { (. It evals a:b:c:d as (a (b (c d))), unlike (a b c d) means (((a b) c) d).');

/*TODOS...

TODO todoWrite30VariedUsecases.wikibinator203 first.

implement op (getLocalId128 x) gives the 4 ints (in js) x().idA x().idB x().blobFrom and x().blobTo.
blobFrom and blobTo are both 0 in any node thats not a cbt so you only need half the id then.
Use it in a treemap (Lambda [...] ...) of #SomeName to fn, for use as a code editor.
Strings that fit in an id256 dont need to be hashed (which is slow, .0001 to .0000001 per second per hash id).
Using an idmaker that uses literalinid (or (typeval "text/plain;charset=utf8" TheBits)) or hashidofanyfn,
together as just whatever (AnIdMaker SomeFn) returns, could view code being made and deleted,
much faster without having to hash it, but can only be
run in vm.stackAllow* mode, some dirty mode (not purely deterministic)
depending on salt of course for nondeterministic recursion and caching.
The localid of a fn may differ from other times that fn is observed,
but for the same localid in the same VM run (til wikibinator203 VM is restarted),
there is at most 1 val, so [localid128 many-to-1 dedupedFn (within same run of VM)].
For each localid128 there is at most 1 dedupedFn, until restart VM then those may change.
Each VM running simultaneously can be running a different "VM run",
so the nondeterministic localid128s should be limited to when vm.mask_stackAllowReadLocalIds (now 1 of 5 kinds of clean/dirty).
..
also see "TODO use this to, with StackAllowReadLocalIds true, make a fast evallable textarea" comment in code far below.
..
see mask_stackAllowReadLocalIds

/*TODO WRITE 30 VARIED USECASES, THEN FIND HOW TO OPTIMIZE FOR THEM...
30 varied usecases, optimize for. Find efficient way to do all of these, relevant to opmutinner opmutouter Float64Array Int32Array Node lambdize gpujs mutableWrapperLambda etc... Find an efficient-enough way to make things i find fun and useful, focusing on memory and compute bandwidth at first.
Moving that to todoWrite30VariedUsecases.wikibinator203, so this wikibinator203VM.js file can work again.
*

TODO for vararg syntax use A[B C D] meaning (A [B C D]), where A B C and D are #Names.
In general if you dont put a space before ( { [ or < then it means a call.
This simplifies _ , ? and maybe the first . like in .abc.def .
(?2 (?2 (? z) y) length) is written as something like <z y length>,
but you could also write that as A[z y length] if A is the #Name of a fn that does (?2 (?2 (? z) y) length) with [z y length],
as it would be (A [z y length] [...stream...]).
I'm willing to sacrifice the code being a little longer, having to write (W (X (Y Z))) with spaces before the (s, instead of (W(X(Y Z))),
but the new syntax also allows W(X (Y Z)) or W(X(Y Z)) since lack of a prefix space implies calling.
You cant have 2 names touching eachother, except if its a builtin name like _ , ?.
W(X(Y Z))   //smaller, but more complex to parse. maybe more confusing to read?
(W(X(Y Z))) //bigger
Maybe also allow : between #Names, to mean the same thing as lacking a space between them, but you cant write WX to mean (W X), so you write W:X.
/*But what about direction? What does W:X:Y mean, (W (X Y)) or ((W X) Y)? Would having 2 symbols fix that, like W<X<Y vs W>X<Y vs W<X>Y ?
W<Anything means W before Anything. W>Anything means W after Anything??? So what would W<X<Y mean? W first, so (W X<Y).
What would W>X<Y mean? W after X<Y, but what does that mean? X<Y and X>Y both mean (X Y), so W>(X Y). Its (W (X Y)).
What would W>X>Y mean? W after X>Y. so (W (X Y)).
What would W<X<Y<Z mean? (W X<Y<Z). (W (X Y<Z)). (W (X (Y Z))).
Wait... which one means (((W X) Y) Z) ?
Forget that < > stuff above. Do it this way instead....
*/
/*
> means ) and implies the ( happened before it.
< means ( and implies the ) happens after it.
W<X<Y<Z means W(X(Y(Z with some )s implied, which means (W (X (Y Z))).
W>X<Y<Z means W)X(Y(Z, which means (W X (Y Z)) ???? that doesnt seem right. might be right. try few more examples...
W>X>Y<Z  W)X)Y(Z  ((W)X)Y(Z)  ((((W)X)Y)(Z))  (W X Y Z). Its just (W X Y Z). The last < vs > never matters, since theres only 2 things. W>X>Y:Z .
But if the last < vs > doesnt matter, how would i write (W X (Y Z)) ?
Maybe this syntax doesnt work either. Or maybe W>X>Y>Z means (W X Y Z), and W>X>Y<Z means (W X (Y Z)) ? What parsing rule could detect that?
How many possible trees are there of W X Y Z that have each of those once and occur in that order? Write them all...
(((W X) Y) Z)
((W X) (Y Z))
((W (X Y)) Z)  W<X<Y>Z  problem, these 2 seem to need the same syntax
(W (X (Y Z)))  W<X<Y>Z  problem, these 2 seem to need the same syntax
*
Figure out more syntaxes later. For now just use W:X:Y:Z to mean (W X:Y:Z) aka (W (X Y:Z)) aka (W (X (Y Z))).
That will make it easier to read and small enuf that can make custom syntaxes by prefixing by a fn that does parsing (and can Evaler optimize some of them).
Example: (Y[A B C] D) could do the same as ({A B C} D) if Y is a fn that takes a [...] of any size and does what {...} does.
Similarly Y{A B C} or Y(A B C), but [...] is the most useful for vararg.
Keep <...> for the ?2 and ? syntax, as in "(?2 (?2 (? z) y) length) is written as something like <z y length>" but I'm not completely sure of that part
as I'm still figuring out how these parts of syntax fit together.
..
(=d .z.abc .i .z.y?i) //z.abc[i] = z.y[i];
...could be written as...
ED[.z.abc .i .z.y?i]   where ED is a #Name of a fn that does with [...] that same thing when it gets 1 more param., 







lambda
ja code generator for mutlam. test it on a Fo loop with hypot3 (a derived mutlam of 3 params) and the js code should inline it as Math.sqrt(Square?x...codegen y.. z..) without heap alloc in loop, by detecting its all doubles. add optimization to often detect if something always returns doubles.
Mut.m is js {}.
Mut.d is Float64Array overlapping buffer with Int32Array and Float32Array. Mut.e is a double. Mut.k is dedupedfn and Mut.o is whichopmutspacenum which together are the primarykey. Mut.j is dup fn. i might add more fields later such as jj being js [] of dup fn. (ObKeyVal ob key val) (ObCbt ob acbt) etc. cache mutevaler of Mut.k andor mutevaler of Mut.j?
..
For MutLam params, use a js {} (either pooled and emptied after used or new {} each mutlam call) of varnameorstringid to val. val is Mut or double. use ?x for mutlam var x, and.x for rootstate Mut.m.x. i could, but dont use {}.prototype being lower {} on mutlamcallstackwhichisjystjsstack, cuz namespaces are only supposed to see their own vars. can still share Muts as params of mutlam, in Mut.m.varnameorstringid.
...
(;[a b c] d) means (a ;[a b c] d), or maybe (a [a b c] d), as a way of defining vararg and custom syntaxes. or maybe <a b c d> means (a [b c d]) if a is (some certain op with FuncBody param).
The problem this is meant to solve is <.xy .zz {...} ...>, as way to getvar ? and ?2, is not general enuf cuz theres =dd =d =j and getters of those etc. need general vararg syntax and im willing to pay an extra char for it. maybe A<b c d> instead of writing it as <A b c d>, and A is a #Name, and if you dont give a fn before the < then its ? and ?2 default syntax. will optimize for that.
..
yes, do that, but as []... A[B C D] is (A [B C D]). more generally if you dont put a space before ( or { or < or [ then its automatically a call. that simplifies , and _ and maybe the first . but im unsure if i want to ((...) (...) (...))
*/






















/*
(
	Lambda
	[arrayAB arrayBC aSize bSize cSize]
	{
		,Opmut
		,_[
			(Push ,x ,10)
			(Push ,x ,hello)
			(Push ,x ,20)
			(=3 ,z ,y ?x)
			(=3 ,z ,abc FixmeHowToDefineAJsListOrIsItViewedAsMapB)
			(For (= ,i ,0) (Lt .i .z.y.length) (++ ,i) _[ //TODO this syntax is too long: (?2 (?2 (? z) y) length)
				(=d .z.abc .i .z.y?i) //z.abc[i] = z.y[i];
			])
		]
		LambdaParamsStream
	}
)#MatmulInCpu







/*

Mut has to compile to using string keys in js {} map, since otherwise i'd have to make my own stack which would be slow.
The strings can be: anything that starts with a lowercase letter, such as varABC or x hello etc,
or a text form of a 256 bit global id, or a deduped localId.
Otherwise it should be a double used as an int for Float64Array (or maybe Int32Array in some cases).
FIXME if dedup a localId, then its garbcoled, how could i know to use the same id again if its made again? I wouldnt,
	THEREFORE deduped ids only verify that at most 1 deduped id exists at a time for a certain forest shape,
	but it does not guarantee its the same 64 bits if its garbcoled and allocated again as a deduped id,
	so during opmut, if using deduped id64 that way, dont allow garbcol during opmut,
	and dont reuse compiled evalers that depend on a string for of deduped localid such as 'n'+node.idA+'_'+node.idB.
	Could use a global id256, such as around 46 chars (is that base64 or base58?), in js {} map key,
	but that would be slow. Mostly it would be small var names like abc and x and double indexs.
	
	
This depends on ability to make var names like [ballA x] which is (infcur ballA x), var names that are fns in general,
and I'm unsure how to compile it to js code, so needs redesign...
(
	Lambda
	[arrayAB arrayBC aSize bSize cSize]
	{
		,{
			,Opmut //,{OptimizationHint opmut}//,Opmut
			_[
				(= ?arrayAC {,NewDoubles {,* ?aSize ?cSize}})
				(For (= ?a ,0) (lt ?a ?aSize) (++ ?a) [
					(For (= ?c ,0) (< ?c ?cSize) (++ ?c) _[
						(= ?sum ,0)
						(For (= ?c ,0) (< ?c ?cSize) (++ ?c)
							(+=D ?sum {,*
								{,D ?arrayAB {,+ {,* ?a ?bSize} ?b}}
								{,D ?arrayBC {,+ {,* ?b ?cSize} ?c}}
							})
						)
						(=D ?arrayAC {,+ {,* ?a ?cSize} ?c} ?sum)
					])
				])
				?arrayAC
			]
		}
		(...This gets [arrayAB someVal arrayBC anotherVal ...]...)#LambdaParams
	}
)#Matmul

Instead of each mut in [...muts...] being a key and around 4 vals (of type double, double[], fn, mut[], etc),
each mut is a map, so things come in threes: ob key val, like mutA mutB mutC means mutA[mutB] = mutC,
and similar for Float64Array except thats stored in pairs of: mutA cbt.
LambdaParamsStream op would give its own params as keys of some given ob,
such as (LambdaParamsStream (pair s "hello") (Lambda [a b c] 10 15))
-> [... (ObKeyVal (pair s "hello")#psh a 10) (ObKeyVal psh b 15) (ObCbt psh aCbtOfFloat64Array) ...],
or something like that.

Old: (= ?arrayAC {,NewDoubles {,* ?aSize ?cSize}})
New: (= ,psh ,arrayAC {,NewDoubles {,* ?aSize ?cSize}}) but could save space by naming (= ,psh) and reusing that.
	WAIT, i might have mixed up ? aka GetVar, and , aka t.

How would I write code that does the same as this javascript[
	let x = [10,'hello',20];
	let z = {y: x, abc: []};
	for(let i=0; i<z.y.length; i++){
		z.abc[i] = z.y[i];
	}
	//do this outside the Opmut: return z;
]?
Trying to write that as wikibinator203 syntax (which you can derive whatever syntaxes you want, but this is what comes in the prototype):
(
	Opmut
	_[
		(=2 ,x FixmeHowToDefineAJsListOrIsItViewedAsMapA)
		(=3 ,z ,y ?x)
		(=3 ,z ,abc FixmeHowToDefineAJsListOrIsItViewedAsMapB)
		(For (= ,i ,0) (Lt ?i (?2 (?2 (? z) y) length)) (++ ,i) _[ //TODO this syntax is too long: (?2 (?2 (? z) y) length)
			//(=3 (?2 (? z) abc) ?i (?2 z (?2 y ?i)))
			(=d (?2 (? z) abc) ?i (?2 z (?2 y ?i)))
		])
	]
	[] //muts go in here, if it starts with any
)
PROBLEM: cant use =3 for double indexs or double vals. Use =d instead.



_[
	(push ,x ,10)
	(push ,x ,hello)
	(push ,x ,20)
	(=3 ,z ,y ?x)
	(=3 ,z ,abc FixmeHowToDefineAJsListOrIsItViewedAsMapB)
	(For (= ,i ,0) (Lt ?i (?2 (?2 (? z) y) length)) (++ ,i) _[ //TODO this syntax is too long: (?2 (?2 (? z) y) length)
		(=d (?2 (? z) abc) ?i (?2 z (?2 y ?i)))
	])
]




//z.y.length
TODO this syntax is too long, but consider that var names could be lambdas such as (Pair S hello) or huge lambdas:
(?2 (?2 (? z) y) length)
(?2 (?2 ?z y) length)
?z.y.length

What about z.abc[i] ...
?z.abc<?i>
?z.abc<i>
?z,abc<i>
Im mixing things up here. Its not consistent.
Use a<b> to mean the same as a.b but <> gives you a place to write more stuff.
a<b<c>> means the same as a.b.c.
,a means (T a) aka (T 'a').
?a means (GetVar a).
?a<?b<?c>> ???
?a<,b<?c>> ???
?a<{..some stuff..}<?c>> ???

Put <> as the outer thing, cuz this syntax is getting confusing.

<,a ,b ,c ,b> means js: root.a.b.c.b .
<,a ,b c ,b> means js: root.a.b[c].b aka root['a']['b'][c]['b'].
<,a ,b {...any code...} ,b> means js: root.a.b[c].b aka root['a']['b'][whateverThatCodeReturnsWhenCalledOnStream]['b'].
	Its the same for ,b being whatever (,b theStream) returns, aka (T 'b' theStream) which returns 'b' aka b.
(<w x y z> aStream) evals (w aStream) and (x aStream) and (y aStream) and (z aStream) and calls ?2 for the first 3 and ? for the last.


_[
	(push ,x ,10)
	(push ,x ,hello)
	(push ,x ,20)
	(=3 ,z ,y ?x)
	(=3 ,z ,abc FixmeHowToDefineAJsListOrIsItViewedAsMapB)
	(For (= ,i ,0) (Lt ?i <,z ,y ,length>) (++ ,i) _[ //TODO this syntax is too long: (?2 (?2 (? z) y) length)
		(=d <,z ,abc> ?i <,z ,y ?i>)
	])
]

Syntax .abc.def.ghi means <,abc ,def ,ghi>

_[
	(push ,x ,10)
	(push ,x ,hello)
	(push ,x ,20)
	(=3 ,z ,y ?x)
	(=3 ,z ,abc FixmeHowToDefineAJsListOrIsItViewedAsMapB)
	(For (= ,i ,0) (Lt .i .z.y.length) (++ ,i) _[ //TODO this syntax is too long: (?2 (?2 (? z) y) length)
		(=d .z.abc .i .z.y?i) //z.abc[i] = z.y[i];
	])
]












/*TODO consider using fn directly as mut, such as (anyDoubleAsWhichopmutspace anyFn)
or as (MutId whichOpmutSpace anyFn), so (MutId whichOpmutSpace) would be used for a call of Opmut.
There would be mutable fields in fn in general, that would get erased after Opmut call,
and fn wouldnt be able to read or write them (only Opmut could read and write them as mutable optimization
of immutable/stateless calculation). A vm.OpmutState would just need to somehow remember which fns
have mutable state, so when that specific Opmut call ends, their mutable contents can be cleared.
Example fn: (MutId whichOpmutSpace (MutId whichOpmutSpaceB anyFnB)), since its all fns.
Only dedupedFns would be allowed as mut keys, but their fields dont have to be deduped.
So all objects visible to fns would be either fn or double,
and double is a cbt64 or (todo? wrapper of it to say its a double of those 64 bits).
fn.e would be a double.
fn.ee would be a Float64Array.
fn.ii would be an Int32Array that shares same ArrayBuffer as fn.ee, unless they're both frozen and empty.
fn.j would be a dup fn.
fn.jj would be an Array of dup fn.
fn.m would be a deduped fn.
fn.mm would be an Array of deduped fn.
FIXME in what lambdize returns (a function), its prototype cant be changed.
	BUT I might could put something in the prototype of functions in general.
Maybe its best to just put 1 mutable field in fn, the Mut, since function prototypes dont work like {} prototypes.
At least that way theres at most 1 Mut per fn. Also, a dup fn could still have a Mut,
but it would be shared among all the dups (and the 1 deduped of it).
..
(MutId whichOpmutSpace anyFn) could automatically force instant dedup of
MutId, (MutId whichOpmutSpace), and (MutId whichOpmutSpace anyFn), and (MutId whichOpmutSpace anyFn)
be at 7th param (where op is known) and 8th param infloops, so you could know by o8 that it is a (MutId whichOpmutSpace anyFn).
..
Theres 2 ways Opmut can call itself:
(1) OpmutOuter uses a new whichOpmutSpace (VM chooses one not used yet in by this run of the VM) and
	an empty namespace or given namespace of [...muts...] snapsshot.
(2) OpmutInner is called on an existing mutable state and returns a fn or double.
	This allows you to make new funcs that work in a mutable state instead of having to inline their parts.
..
Garbcol of mutable contents of a (MutId whichOpmutSpace anyFn), which lets call that a fnmut,...
A fnmut is any fn thats a (MutId whichOpmutSpace anyFn), known by its o8 can be any of 4 values since MutId is at param 5.
At any specific time and specific VM (mutable parts arent shared across VMs but snapshots of them are),
	a fnmut either has mutable parts or not.
For each unique (MutId whichOpmutSpace), I need a set of fnmuts that have mutable state.
That set could be stored in mutable vars in (MutId whichOpmutSpace), which is created at start of an OpmutOuter call.
I could easily put a bit field in each fn to say it has such mutable state, but I need the ability to find them fast,
and during Opmut I MIGHT want the ability to remove their mutable state?
OR, is it ok to not garbcol any of it until the Opmut call ends (which is likely a small fraction of a second)?
If garbcol only at end of (small fraction of a second) whole outermost OpmutOuter call,
then I only need 1 set of fnmuts.
THEREFORE, vm.fnmutsWithState = anyFnmut, a linkedlist using someFnmut.prevFnmut ptrs, only between deduped fns.
At end of the outermost Opmut call, just loop over vm.fnmutsWithState and free the memory in their mutable parts,
but dont free those fns since thats still controlled by FuncallCache.
PROBLEM: This kind of opmut garbcol could prevent FuncallCache from doing its normal garbcol during opmut,
which aFuncallCache.touch (TODO) does it by leastRecentlyUsed.
A basic way to limit that is a kind of gas* for putting state in opmut nodes,
or maybe just reuse the stackTime and stackMem kinds of gas*.
..
THEREFORE, add a prevFnmut field to Node or maybe to fn (which lambdize returns), TODO which???.
..
TODO I was going to have aFn(aMut) vs aFn(anotherFn) know the difference between mut/stateful and fn/stateless,
and still use them as javascript lambdas (call with parens).
How would that work if (MutId whichOpmutSpace anyFn) is both a mut and a fn?
It would have to be a fn in OpmutInner and OpmutOuter are those fns???
But theres still the [...muts...] immutable/stream/snapshot of it, vs the mutable datastructs themselves.
..
Should there be a few kinds of Mut, one for mutable Float64Array
(such as (MutDoubles anyDedupedFn) would be key, and its value is mutable),
one for mutable array of nondeduped fns, one for mutable double, etc?
I could have a different o8 (or at most a few o8s) for each kind.
But could it be done efficiently?
They could all have the same fields but some of those fields could be frozen as empty arrays etc,
which could be detectable by the o8.
..
OR... just use a [] of such fnmuts, and have a bit in each fnmut to say if its in the [] or not.
Maybe fn would have an int to say which index in the [] (vm.fnmuts = [], just 1 of them per VM) its in,
and could have a Float64Array parallel to it.
If a fn loses its mutable state during opmut, since it knows its index, it could be replaced by the highest index fnmut.
There might also be an Array() parallel to that, with various other mutable things in it, instead of in a Mut.
There might be advantage to this way, since an int could be used instead of a Mut.
Such ints could be allocated using (MutId whichOpmutSpace anyFn), so you could have things like (MutId whichOpmutSpace [ball5 x]).
Fns wouldnt get to know what those ints are since they're reference not pointer,
but basically as internal vm optimization you could say give me the int for (MutId whichOpmutSpace [ball5 x]),
and it would check if that fn has such an int field else would allocate one.
Careful not to change such ints during a primitive optimization that uses them.
Maybe just the infcurCallPairs would make good keys, since I can actually allocate ints for those really fast in an Int32Array.
But do I want fns as keys, or just the combos of var names like [you can even write a sentence here [ball5 x] abc 22] could be a key?
Remember, any token that starts with a lowercase letter and has no whitespace (might be few other excluded chars)
is a utf8 (or is it utf16?) string literal of itself.
If I want the ability to optimize mutable maps of fn to fn, then I must support fns as keys, not just combos of infcur.
..
..
..
OR...
consider using just the hash ids of nodes as mut keys, such as 192 bits of hash and 32 bits of array index (of maybe up to 4 kinds of arrays) in it?
concat(192bitsHash,32bitsOfMakingATempIdOfThose192Bits,2BitsWhichArrayType,30BitsArrayIndex) is 256 bit key. could loop over 30BitsArrayIndex.
could look up the 192 bits in an Int32Array, using 32bitsOfMakingATempIdOfThose192Bits.
Or maybe I want an immutable 256 bit space including arrays, thats all possible immutable states,
so you could for example have a certain 192bitsHash..30BitsArrayIndex point at 5000 of 192bitsHash..30BitsArrayIndex ???
An advantage over 256 bit keys is garbcol is alot easier. but you cant have 32bitsOfMakingATempIdOfThose192Bits in the hashes,
just as an optimization, so that part would have to be set to 32 0s before hashing.
What if Mut has 2 such 192 bit ids, one as you just make it up randomly (whichOpmutSpace) and the other can be the id of a fn.
fn's bizeInt field could be used as "2BitsWhichArrayType,30BitsArrayIndex" in some cases?



/*
Add 2 more int fields, for size of val_dupDoubles and val_dupMuts,
and include wikibinator203 ops (which can have a max of 128 ops) to,
given a Mut, pop 2 doubles off its stack then push a multiply, UNLESS the Float64Array in the Mut is not big enough and in that case
use something like objectThatReturns0ForAllFieldValues for all doubles outside its range etc is constant 0,
and let stackSize wrap as twosComplement of int32, or something like that. i dont want to auto enlarge the array
cuz that might slow it down when doing a sequence of such ops.
Similar, some ops for copying between the double or Mut stacks in multiple Muts.
Could use a Mut as an array of such "multiple Muts" such as having 3 stacks which is a simple way to do permutations.
TODO figure out details of that while using it to derive (from these up to 128 ops) the y10x10rgb12 voxel system,
or y10x10bright4 or y9x9rgb6 etc would fit in a float32 which GPU.js is limited to but CPU can do ints such as y10x10rgb12.




TODO use 1 char long field names, but other than that, I like this design,
and it will go in vm.ops.Mut which has these 5 things (excluding whichOpmutSpace cuz fns cant see that),
and TODO make a hashtable in it, as a proofofconcept, combining val_dupMuts and val_dupDoubles (or maybe Int32Array view of it?).
FIXME would it cause a problem to have to allocate dedupedFn for each potentially nondedupedFn?
You could, in the worst case, dedup that same fn and use it as its own key,
or simpler would be to just count doubles up from 0 to use as keys since every double can be viewed as a dedupedFn.
TODO allocate range of idA_idB for dedupedFns, and that range will be a subset of nonnormedNaNs
	(or maybe the nonnormed negative infinities) where idA is high 32 bits idB is low 32.
Mut = function(dedupedFn, whichOpmutSpace){
	this.key_dedupedFn = dedupedFn;
	this.key_whichOpmutSpace = whichOpmutSpace;
	
	//this.val_dedupedNum = 0;
	//this.val_dupFn = u;
	//this.val_dupDoubles = emptyFrozenDoublesArray; //can replace with new Float64Array(someNumber) and Object.setPrototypeOf null of it.
	//this.val_dupMuts = emptyFrozenMutsArray; //can replace with new Array() and Object.setPrototypeOf null of it.
	
	//TODO objectThatReturns0ForAllFieldValues andOr Object.setPrototypeOf(this.m,null); etc, for sandboxing.
};
Mut.prototype.val_dedupedNum = 0;
Mut.prototype.val_dupFn = u;
Mut.prototype.val_dupDoubles = emptyFrozenDoublesArray; //can replace with new Float64Array(someNumber) and Object.setPrototypeOf null of it.
Mut.prototype.val_dupMuts = emptyFrozenMutsArray; //can replace with new Array() and Object.setPrototypeOf null of it.
freeze the above few default vals somehow.
..
[
	(Mut [...theMutsAsInfcurList...] cbt num fn fnAsKeyA)
	(Mut [...theMutsAsInfcurList...] cbt num fn fnAsKeyB)
	(Mut [...theMutsAsInfcurList...] cbt num fn fnAsKeyA)
	...
]




It appears that if the first 13 bits are 1 (UPDATE: 14?), then thats never used (a subrange of nonnormed negative infinity), leaving me 51 bits for ids.
Anything that doesnt start with 13 1s is viewed as a double.
Use the first 3 of those 51 bits to choose between 8 kinds of things, of up to 2^48 possible ids each?
Those 8 things: split on deduped/dup, so 4 things left: literalBitsThatFitInId64, fn, other(prefixByteOfOther_*), reservedForFutureExpansion.
I might want more than the first 3 bits to do that.

https://en.wikipedia.org/wiki/Double-precision_floating-point_format
0 00000000000 0000000000000000000000000000000000000000000000000000 2 ??? 0000 0000 0000 000016 ??? +0
1 00000000000 0000000000000000000000000000000000000000000000000000 2 ??? 8000 0000 0000 000016 ??? ???0
0 11111111111 0000000000000000000000000000000000000000000000000000 2 ??? 7FF0 0000 0000 000016 ??? +??? (positive infinity)
1 11111111111 0000000000000000000000000000000000000000000000000000 2 ??? FFF0 0000 0000 000016 ??? ?????? (negative infinity)
0 11111111111 0000000000000000000000000000000000000000000000000001 2 ??? 7FF0 0000 0000 000116 ??? NaN (sNaN on most processors, such as x86 and ARM)
0 11111111111 1000000000000000000000000000000000000000000000000001 2 ??? 7FF8 0000 0000 000116 ??? NaN (qNaN on most processors, such as x86 and ARM)
0 11111111111 1111111111111111111111111111111111111111111111111111 2 ??? 7FFF FFFF FFFF FFFF16 ??? NaN (an alternative encoding of NaN)









/*
Which fields should Mut have?...
..
Outerjoin these:
deduped or dup.
fn or bits.
list or one.

Write them out...
key: deduped fn.
key: deduped whichOpmutSpace, but fns cant see this, is only to separate the Muts per Opmut call.
val: deduped fn, actually a Mut, (can put any of the dup parts here, since the only way to dedup something in this system is as a fn)
val: dup fn
val: dup fn[], could implement a hashtable in this. The Array() and fn are both dup.
val: dup Mut[], could implement a hashtable in this. the Array() is dup, but the Mut is not.
val: deduped double, deduped by Node.idA and .idB, if they are anything except the high and low bits of a nonnormed NaN, are a double.
val: dup Float64Array, dup ArrayBuffer (and views of it like Float64Array Int32Array Float32Array Uint8Array)
//val: dupFnSize?
//val: arrayBufferSize?
cache: Int32Array, sharing the Float64Array.buffer.

Or maybe each Mut should have only 1 kind of val, except a second kind of val tells which kind that is,
	and Mut.prototype puts empty stuff in for the rest, such as fn[0].
	
	
vm.Mut = function(dedupedFn, whichOpmutSpace){
	just have 1 of the fields different.
};
vm.Mut.prototype.fieldA = TODO
vm.Mut.prototype.fieldB = TODO
vm.Mut.prototype.fieldC = TODO



VALS...
fn[]
bit[]
???


const objectThatReturns0ForAllFieldValues = new Proxy({}, { get(obj, prop){  return 0; } });
	Object.freeze(objectThatReturns0ForAllFieldValues);
	vm.objectThatReturns0ForAllFieldValues = objectThatReturns0ForAllFieldValues;


Mut = function(dedupedFn, whichOpmutSpace){
	keys: dedupedFn, whichOpmutSpace.
	
	key?: Maybe another key thats a double thats only ever (in the run of a VM) used in 1 Mut, and let that be the id of the Mut instead of the dedupedFn, so can put nondedupedFns in its vals? So could merge fn[] with Mut[] vals?
	Maybe make that be part of whichOpmutSpace? Probably not enuf space there.
	
	val: Mut[]
	val: bit[]
	Remember, I have code (objectThatReturns0ForAllFieldValues) to
		make a Float64Array (and probably similarly Array()/[]) return any chosen object for keys it doesnt have,
		so can do that instead of & or min/max memory fencing, by putting it as prototype
		
	Dont forget to set prototype to null (Object.setPrototypeOf) so cant access __proto__ etc
		which would allow things to escape into the outer browser tab sandbox.
	
	
	val: double
	this probably helps js compiler/eval optimize loops, as aMut.val instead of aMut.doubleArray[0]
	
}


Mut = function(n,aFn,whichOpmutSpace){
	this.dedupedFn = aFn;
	this.whichOpmutSpace = whichOpmutSpace;
	
	//this.w = whichOpmutSpace
	//FIXME how can Mut.j be a non-deduped fn? Its id would have to be something else.
	//this.j = aFn; //fn, TODO is this always deduped?
	//this.w = whichOpmutSpace
	//FIXME how can Mut.j be a non-deduped fn? Its id would have to be something else.
	
	this.j = u; //dup (not necessarily deduped) fn, so it must be part of the value. To have an array of these, use the array of Mut, and these be its vals.
	this.e = 0;
	this.m = Array(); //array of Muts which have same whichOpmutSpace
	//this.i = new Int32Array(n<<1); //.d and .i overlap the same memory
	//this.d = new Float64Array(this.i.buffer);
	this.d = new Float64Array(n); //array of doubles
	Object.setPrototypeOf(this.m,null);
	Object.setPrototypeOf(this.d,null);
	//Object.setPrototypeOf(this.i,null);
};

Mut = function(dedupedFn, whichOpmutSpace){
	this.key_dedupedFn = dedupedFn;
	this.key_whichOpmutSpace = whichOpmutSpace;
	
	//this.val_dedupedNum = 0;
	//this.val_dupFn = u;
	//this.val_dupDoubles = emptyFrozenDoublesArray; //can replace with new Float64Array(someNumber) and Object.setPrototypeOf null of it.
	//this.val_dupMuts = emptyFrozenMutsArray; //can replace with new Array() and Object.setPrototypeOf null of it.
	
	//TODO objectThatReturns0ForAllFieldValues andOr Object.setPrototypeOf(this.m,null); etc, for sandboxing.
};
Mut.prototype.val_dedupedNum = 0;
Mut.prototype.val_dupFn = u;
Mut.prototype.val_dupDoubles = emptyFrozenDoublesArray; //can replace with new Float64Array(someNumber) and Object.setPrototypeOf null of it.
Mut.prototype.val_dupMuts = emptyFrozenMutsArray; //can replace with new Array() and Object.setPrototypeOf null of it.
freeze the above few default vals somehow.


	




//TODO add to readme andor this js file comments, https://en.wikipedia.org/wiki/Explainable_artificial_intelligence , probably is relevant enough to include.

/*stream snapshot is [...] of
[cbtNotNecessarilyDeduped doubleThatIsOrWillBeDeduped fnThatIsOrWillBeDeduped fnNotNecessarilyDeduped fnAsKeyThatIsOrWillBeDeduped],
though I might change the order of those 5 things. The last has to be fnAsKeyThatIsOrWillBeDeduped.
Its basically 4 maps in 1, of fnAsKeyThatIsOrWillBeDeduped to the other 4 things.
If you want to dedup something else, you can make it into a key in another Mut.
Mut key is fnAsKeyThatIsOrWillBeDeduped_and_intordoubleOfWhichMutSpace.
intordoubleOfWhichMutSpace is only created in Opmut and lambdas dont see it.
fnThatIsOrWillBeDeduped is, in Opmut, a Mut(fnThatIsOrWillBeDeduped,same intordoubleOfWhichMutSpace).
Mut = function(fnAsKeyThatIsOrWillBeDeduped, intordoubleOfWhichMutSpace){
	fn key; //fnAsKeyThatIsOrWillBeDeduped
	number whichMutSpace; //intordoubleOfWhichMutSpace. lambda cant see this. its just for dedup of Mut, since you can do more than 1 Opmut at a time by recursion.
	FIELDS:
	Float64Array (or sharing buffer with Int32Array Uint8Array etc? those might also be fields?) cbtNotNecessarilyDeduped;
	number doubleThatIsOrWillBeDeduped;
	Mut fnThatIsOrWillBeDeduped;
	fn fnNotNecessarilyDeduped;
	
	
	//MAYBE THESE FIELDS:
	//Int32Array sharing buffer with the cbtNotNecessarilyDeduped;
	//Float32Array sharing buffer with the cbtNotNecessarilyDeduped;
	//Int16Array sharing buffer with the cbtNotNecessarilyDeduped;
	//Uint8Array sharing buffer with the cbtNotNecessarilyDeduped;
};
Getting Lambda params this way can reuse some constant [cbtNotNecessarilyDeduped doubleThatIsOrWillBeDeduped fnThatIsOrWillBeDeduped],
maybe this one: [0 0 u], where number literals such as 0 mean a raw cbt64 of those double/float64 bits,
or maybe [(0 0) 0 u] since that makes it clear which is the array ((0 0) is a cbt128 and actually wouldnt be displayed that way since its just raw bits),
or maybe [(pi e) 0 u].
and just append (since its an infcur) fnNotNecessarilyDeduped fnAsKeyThatIsOrWillBeDeduped to it.
In Lambda params, fnAsKeyThatIsOrWillBeDeduped is key and fnNotNecessarilyDeduped is val.
The not necessarily deduped part of val is important so it can efficiently wrap large arrays made by GPU.js or compiled javascript code etc.
The logic of the universal lambda function (combinator), while clean at least, works exactly the same if things are deduped or not, except for efficiency.

Should "number whichMutSpace" just be an idA_idB like in Node? No, cuz its not going in the same dedup map as fns.
There will be 3 dedup maps, for: fn, FuncallCache, Mut. Or maybe 1 dedup map per whichMutSpace.
fn is deduped by: idA idB blobFrom blobTo, so 4 ints.
FuncallCache is deduped by: 2 fns and a StackStuff, so 4+4+5=13 ints.
Mut is deduped by: fn and a whichMutSpace, so 4+1or2=5or6 ints
(UPDATE: change that 4 to 2 cuz blobFrom and blobTo will always be 0 in a perfectDeduped fn, so ...=3or4),
not sure if I need 1 or 2 ints (or a double) for number of Mut spaces during 1 run of the VM
(so could go on for up to a month or might even be able to run for years without restarting if you're not creating alot of objects often, as the bottleneck on that is theres only around 2^52 possible blobs+nonblobFns (idA_idB that fit in nonnormed NaN bits, else are a double), or the VM boots runs and ends in a tiny fraction of a second as its very lightweight). And even if you do restart the VM, you can save state and continue from where it left off. Alternatively to feeling the effects of restarting a server, you may snapshot the state of a server at runtime and boot another server using that state and, in theory, get them in sync, then drop either of them and continue from that, normally dropping the older one since it uses bigger values of idA_idB which are in danger of running out of approx 2^52 number of ids. Or, you could in theory run 5 VMs at once in sync, even if all 5 are written in a 5 different programming languages, though if they are 5 different OS processes you're likely to get much higher latency (less latency in linux for things like that, I'd guess, but still OS processes are slow).
You'll be able to sync, verify, redundantly mirror, load-balance, etc, the same ways inside 1 computer as you can across the Internet.
..
Since Opmut might be called on many small things, I want at least another 52 bit id space (or 64, but keep in mind it has to be hashable if multiple OpmutSpaces are in the same hashtable, which I'm undecided if they will be or not in this VM).

Theres 4 kinds of vals in Mut, so I need 4 chars for reading and writing them...
These buttons are easy to push: / ;

Example stream:
[
	[0 5 u u [ballA x]]
	[0 10 u u [ballA y]]
	[0 6 u u [ballB x]]
	[0 5.1 u u [ballA x]]
]


TODO syntax to only display [a b c] once in [[a b c d e] [a b c x y]].
[([a b c]#Ab d e) (Ab x y)] does that, BUT how would it automatically know to display it that way instead of: [[a b c d e] [a b c x y]]?

Maybe I should use...
[
	(Mut 0 5 u u [ballA x])
	(Mut 0 10 u u [ballA y])
	(Mut 0 6 u u [ballB x])
	(Mut 0 5.1 u u [ballA x])
]
and (Mut 0 0 u)#Mu so (Mu val key) is (Mut 0 0 u val key), and those last 2 params are what Lambda params become, the way it gives them to Opmut.
Its not a complete Mut, cuz it still needs whichMutSpace. Its a snapshot of a Mut. Fns correctly cant see whichMutSpace.




OLD:
TODO change stream/[] [keyA valA keyB valB...] to [keyALambda valALambda valADoubleRaw valADoubleArrayRaw keyBLambda ...] which will mirror Mut having intOrDouble_whichMutSpace and keyALambda as primaryKey and the 3 vals as val. And make there be 3 char prefixs of the 3 vals instead of just ?{...keyALambda...}, and keep using the Syntax described below.








/*
Maybe start with the approx (2^(1.5^height)) space of sparse keys (of binforest shapes), and double values from -1 to 1??? I could easily alloc ints to a set of keys from (2^(1.5^height)) in realtime and use a double[] of that expanding size. But that seems to make it harder to reuse "musical instrument parts" cuz its too low level.



...................
...................

TODO start with (using "key valLambda valDouble valDoubleArray") making simple small musical instrument parts that interact with eachother thru double[] in double[] out fn otherState, CUZ the density of interestingToHumans patterns of that is much higher than the density for games. If you take part of one game and put it in an other game, its likely to unbalance the gameplay and make it not fun, except some rare times it would make it more fun, but if you take part of one musical instrument and combine it with other instruments, it far more often sounds interesting. Do this with opmut. I have some existing instruments in my code from years ago in various opensource, that I can rebuild as a basic start. I still plan to do games, science tools, number crunching in GPU, etc, but I need a fun proofofconcept first. Theres alot of strange sound effects that most people done know how to make, that they could make and share and combine into new lambdas as musical instrument parts and so on... so the demand is there (as in supply and demand) and supply very very low, for alot of instrument parts. Theres high supply of some few experts using them in recordings, but very low supply of just anyone's ability to make these sounds based on realtime input. That niche appears to be the strongest place for wikibinator203 to start. TODO maybe reproduce the first 18 seconds of "the who - who are you" like in https://www.youtube.com/watch?v=LYb_nqU_43w as lambdas (before the voice, just the electronic instruments), as a basic demo? If I could make lambdas that do (especially with a few params to vary in each to make it sound different), approximations of a few hundred small pieces of existing music like that, might be interesting enough to motivate people to build more things with it. Its all equations to me. Realtime input only, so only things simple enough to move the hands etc on computer/etc controls to change the sound in realtime. Focus on sound effects of a small fraction of a second, a "kind of sound" instead of something that varies based on a sequence of notes. Optimize for a powOf2 number of sound samples per second, such as 256. 256 is the smallest that WebAudioAPI allows??? [[["The bufferSize parameter determines the buffer size in units of sample-frames. If it???s not passed in, or if the value is 0, then the implementation will choose the best buffer size for the given environment, which will be constant power of 2 throughout the lifetime of the node. Otherwise if the author explicitly specifies the bufferSize, it MUST be one of the following values: 256, 512, 1024, 2048, 4096, 8192, 16384." -- https://www.w3.org/TR/webaudio/ 2022-3-18]]]. Optimize to do a fast-varying set of musical instrument parts (made of lambdas) in CPU L1 cache. Linux is usually lower lag for sound than windows.
..
DETAILS...
..DETAILS........
..
Consider using unit (length 1) vectors, or vectors where all dimensions/dims range -1 to 1 (like i did in audivolv), of approx a googolplex number of sparse dims, which means lambdas from height 0 to approx height a few thousand (even though they could easily go into the millions of height) as key and double/float64 as value. Could define lots of musical instruments in that, as a space of dims big enuf that they would rarely accidentally overlap and interfere with eachother. Maybe do it like audivolv did with a double[30] or double[100] etc, except in that bigger sparse dimensional space. I could, very soon if I wanted to (so many details to think about...) have such a music system working at around, I estimate, 100 million flops in CPU. Since sound only needs about 20k samples per second for 1 channel sound, to sound "good enough" for music etc, that leaves 5k flop per sample. More generally, this could be a kind of sparse dimensional vector. I could make 5k javascript objects or 5k int pointers into a Float64Array, though sparseness might have it jumping around alot more than th at. So the combined state of a set of musical instruments being played would, very very very sparsely, be, in abstract math, a number from 1 to a googolplexplex ( https://en.wiktionary.org/wiki/googolplexian ).
Each musical instrument part might read and write a few specific dims, similar to how audivolv does it but not limited to those specific sound transforms, and have a sort value to say what order it happens in the sequence of musical instrument transforms that are turned on or off.
...
...
Some useful sound transforms I've made over the years...
.......
decaymax, as in jsoundcard example code.
the audivolv transforms of a few doubles to the same number of doubles, where all those doubles range -1 to 1.
...
The most efficient connection between sim musical instruments I know of, is a state space of double[] with 4 ranges: inputs, state, tempVars, outputs. [inputs,state]->[nextState,outputs]. This could be generated many possible ways, such as in theory by lambdas.
...
PROBLEM... how to reset dim_as_key/double_as_val to some random double or to 0 as val??? cuz dont want it to get stuck.




TODO start with simple 2d games that fit on 1 screen with no scrolling.

TODO??? make stream/[] datastruct be blocks of 4 things instead of 2???: key valLambda valDouble valDoubleArray,
	so it aligns with Mut datastruct. (=D ?arrayAC ?D?_something {...}), or something like that.
Or maybe an op that infloops unless its params are those 4 types (checks for nonnormed doubles etc), and [...] of that?
[(thatOp keyLambda valLambda valDouble valDoubleArray) (thatOp keyAnotherLambda.... ].
Could do it as 3 of [key val key val]..., but 1 of [key vala valb valc] would be more efficient on average.
Have 3 prefix chars for reading, and maybe 3 other prefix chars for writing, those 3 vals of each keyLambda,
instead of just ? in ?x etc. writing into valDoubleArray takes an extra param during opmut.
Opmut verifies incoming stream/[] is that datastruct before running the For/DoWhile/etc.
Could instead do it by varargAx, but that makes it potentially infinitely expensive to verify.

{,Fork ?aSize ,?a ,ForkBody} ???

yes (=D ?sum ,0) no (= ?sum ,0)

3 types: fn (the most general), double_asRawCbt64, double[]_asRawCbtOfPowOf2Size ???
	These types are used in opmut.
	
TODO??? replace Math.sin Math.exp * etc, by 2 ops, one of (double,double)->double and one of double->double, with an extra param of deriving those bits? Problem is, theres alot of fast hardware out there, that people are using already, which has nondeterministic roundoff, some uses float32, some approximates ops using combos of other ops, etc.


(
	Lambda
	[arrayAB arrayBC aSize bSize cSize]
	{
		,{
			,Opmut //,{OptimizationHint opmut}//,Opmut
			_[
				(= ?arrayAC {,NewDoubles {,* ?aSize ?cSize}})
				(For (= ?a ,0) (lt ?a ?aSize) (++ ?a) [
					(For (= ?c ,0) (< ?c ?cSize) (++ ?c) _[
						(= ?sum ,0)
						(For (= ?c ,0) (< ?c ?cSize) (++ ?c)
							(+=D ?sum {,*
								{,D ?arrayAB {,+ {,* ?a ?bSize} ?b}}
								{,D ?arrayBC {,+ {,* ?b ?cSize} ?c}}
							})
						)
						(=D ?arrayAC {,+ {,* ?a ?cSize} ?c} ?sum)
					])
				])
				?arrayAC
			]
		}
		(...This gets [arrayAB someVal arrayBC anotherVal ...]...)#LambdaParams
	}
)#Matmul



Syntax:
(_[a b c] x) means ((Seq [a b c]) x) which does (c (b (a x))), for any vararg in the [].
Xyz means the (...)#Xyz constant lambda, since it starts with a capital letter (or things like =D or =).
abc means 'abc' since it starts with a lowercase letter.
{a b} means (s a b)
{a b c} means {{a b} c} aka (s (s a b) c), aka in javascript this code will actually work: s(s(a)(b))(c).
,a means (t a), often used like ({,+ getX getY} treemapZ) which evals to (+ (getX treemapZ) (getY treemapZ)).
abc.def<<ghi<5>>> FIXME i might not need this syntax anymore and would write ?[abc def] or something like that?
<<>> gets from something like what {} means in javascript, a map of string to thing.
<> gets from a Float64Array. These 2 things are used in small blocks of javascript-like code that compiles to javascript but blocks access to Float64Array.buffer etc so it can guarantee that all lambda calls halt within chosen limits of memory and time that can be tightened recursively on stack.

[a b c] means (infcur a b c). Infcur takes infinity params aka never evals, so its a kind of list.


/*
(
	Lambda
	[arrayAB arrayBC aSize bSize cSize]
	{
		...TODO make sure to use (For ...) instead of {,For ...} cuz opmut-like stuff doesnt use funcallcaching...
		...and use the Mut datastruct which has [[int(ordouble?) whichMutspace] and dedupedFn] as primaryKey
			and has Float64Array and Mut as vals. and uses [keyA valA keyB valA...] as state when copying
			between that (immutable by forkedit) and Muts.
		{
			,Opmut
			(For...)
			...TODO copy the lambda params in somehow...
		}
	}
)#matmul
*/

/*TODO very important, write some example code where opLambda and [...] as stream, pass params between eachother.
Make a conwayLife or chuasCircuit or paint or something, where loops and ifelse and lambdas use eachother.
fibonacci is ok test of lambda but still need test of stream/[]/For/While/etc.

TODO verify this works by reading about the opcodes used, then make it work by filling in those opcodes in rootEvaler (cuz this VM is incomplete), then work on syntax such as lambdaGet and streamGet and lambdaGetOrStreamGet each have 1 char prefix (? $ _ maybe), and lets just call (lambdaGetOrStreamGet x) ?x for now, and [a b c] is (infcur a b c), and lambda is opLambda, and it automaticly uses funcParamRet caching (TODO make it cache doubles by Node.idA and node.idB, if they hold double bits (a certain prefix that leaves around 2^50 ids for nondoubles in the nonnormedNans) that is automatically deduped) so costs linear instead of exponential (the lambda does that, but For/While/opStream/etc does not and is more for number crunching kind of things...
..
(
	Lambda
	[x]
	{
		,IfElse
		{,Lt ?x ,3}
		,1
		{,+ {Recur1 ?x} {Recur1 {,- ?x ,1}}}
	}
)#Fibonacci
..
TODO test
(Fibonacci 1) -> 1
(Fibonacci 2) -> 1
(Fibonacci 3) -> 2
(Fibonacci 4) -> 3
(Fibonacci 5) -> 5
(Fibonacci 6) -> 8


SOLUTION:
(opLambda FuncBody [x y z] valX valY valZ) -> (FuncBody (LazyEval (opLambda FuncBody [x y z] valX valY) valZ)),
where (LazyEval a b c) -> (a b c).
FuncBody can contain {,Recur1 makeOtherValZ} or {,Recur2 makeOtherValY makeOtherValZ} etc, to call itself recursively.
(While SomeCondition SomeLoopBody [varNameABC valABC x valX]) -> forkEdited [varNameABC valABC x valX]
?x and $x are (or choose different prefix byte) (lambdaGet x) and (streamGet x). Theres no lambdaPut. There is streamPut.
..
TODO very important, write some example code where opLambda and [...] as stream, pass params between eachother.
Write a matmul func (in cpu, not well optimized yet) thats a lambda but uses a stream/[] with For loops, but uses opLambda to do plus multiply lessThan etc, and the outer lambda will have an extra lambda param that the loops call for some reason.
Or make a lambda that calls a stream/[] of double for loop to call each in a list of lambdas on each other lambda in the list, in all pairs, or call them on the loop counter squared, or something. Whatever the example code is, it has to have stream/[] and opLambda call eachother, both directions, passing params to eachother, and maybe reading eachothers params during the middle of a calculation or getting the state of loop as stream/[]. Something like that.
..
(While SomeCondition SomeLoopBody [varNameABC valABC x valX]) -> forkEdited [varNameABC valABC x valX]
(opLambda FuncBody [x y z] valX valY valZ) -> (FuncBody (LazyEval (opLambda FuncBody [x y z] valX valY) valZ))
FuncBody can contain {,Recur1 makeOtherValZ} or {,Recur2 makeOtherValY makeOtherValZ} etc, to call itself recursively.
?x and $x are (or choose different prefix byte) (lambdaGet x) and (streamGet x). Theres no lambdaPut. There is streamPut.
TODO very important, write some example code where opLambda and [...] as stream, pass params between eachother.
Make a conwayLife or chuasCircuit or paint or something, where loops and ifelse and lambdas use eachother.



/*
SOLUTION???
(opLambda FuncBody [] [z y x varNameABC])
(opLambda FuncBody [] [z y x varNameABC] valABC) -> (opLambda FuncBody [varNameABC valABC] [z y x]).
opStream would just be infcur as [keyA valA keyB valB ...], and one of those is in opLambda.
(opGetRecur (opLambda FuncBody [varNameABC valABC x valX] [z y])) -> (opLambda FuncBody [varNameABC valABC] [z y x]).
(opGetRecur (opLambda FuncBody [varNameABC valABC x valX] [z y]) otherValForX)
-> (opLambda FuncBody [varNameABC valABC x otherValForX] [z y]).
(While SomeCondition SomeLoopBody [varNameABC valABC x valX]) -> forkEdited [varNameABC valABC x valX].
streamGet and lambdaGet should be different ops, and have different prefix such as ?x and $x ? Theres no lambdaPut. Maybe also some prefix for streamPut. If its done that way, thats areOplambdaAndOpstreamMerged being false. lambdas and streams must be able to interact with eachother. I could make a lambdaOrStreamGet op, thats less efficient cuz it checks for 2 different o8s.
The datastruct FuncBody is called on is WHAT??
WHAT??
(opLambda FuncBody [varNameABC valABC x xVal y yVal z zVal] []) ? Its halted since it doesnt have a nextParam.
But it interferes with getting evaler from l child, and it creates too many nodes.
FIXME
FIXME
FIXME



/*
Designing these ops: opStream streamGet streamPut (and possibly a separate opLambda if cant merge it with stream op efficiently).
Start by defining some designVars, such as areOplambdaAndOpstreamMerged.

areOplambdaAndOpstreamMerged - If true, opLambda is a way of using opStream. If false, opLambda takes an opStream as one of its params and forkAppends it as new params come in, that opLambda has a list of param names to forkPop from. If true, then streamGet and streamPut are simpler and maybe faster, cuz they just use opStream like a linkedlist of key_and_val and (depending on the design I choose) in some cases u may be in that list and is ignored by streamGet and only slightly interacted with by streamPut. I strongly prefer this be true but its hard to make it efficient.

whatAreTheKeysOfTheFewConstants - (only if areOplambdaAndOpstreamMerged). such as p for nextParam, b for funcBody, q for popParams, like (streamGet p) means (streamGet 'p'), and p means 'p' cuz lowercase, and names that start with capital letter are #Names. Or maybe it should be as small as possible such as u and (u u) etc. If false, then there are no such standard constants used in opStream. This and areOplambdaAndOpstreamMerged will probably be true. Also, this might be merged all into 1 key as in isThereOnly1ConstantKeyThatTheFewConstantKeysAreMergedInto.

doesOpstreamHaveFuncbodyKey - (only if areOplambdaAndOpstreamMerged). This is probably going to be true if areOplambdaAndOpstreamMerged, since the alternative is to make streamGet and streamPut check for some structure other than the normal key/vals that opStream is made of.

doesOpstreamHaveNextparamKey - (only if areOplambdaAndOpstreamMerged). If true, then funcBody val reads ?nextParam (but something smaller as in whatAreTheKeysOfTheFewConstants) to get the param that just came in to the opStream (such as when u is the second last param, and when u is the last param its waiting for such a param then puts it before the u).

doesOpstreamHavePopparamsKey - (only if areOplambdaAndOpstreamMerged). If true, the funcBody val does not have turingComplete control of the vararg while there are still params in the Popparams val, but after that runs out (putting in key/vals), the funcBody val could (if I choose a flexible enuf design) forkEdit the streamOp in turingComplete ways such as to remove all keys matching a certain pattern or to return a completely different thing than a streamOp or to put more params in popparamsKey such as just 1 more param so funcBody val runs each next param or waits for n more params etc. If false, then either NOT areOplambdaAndOpstreamMerged OR funcBody val must contain the param names to put in, as it handles its own currying before it has enuf params, which would make it more complex and maybe slower.

howManyCurriesDoesOpstreamWaitOn - max curries anything can wait on is 254 (since 255 means never evals, like in infcur). But in some designs (that I will probably do one or some of) it always waits on only 1 more curry and forkEdits itself or verifies it is halted, such as by evaling (using b/funcbody val) when second last param is u, and not allowing third last or earlier params (except the first 7 params before opcode is known) to be u except if its the last param (or if its second last then that evals). For example, it could be waiting on 300 params (which is more than 254), each with a name, by that being in some kind of list (infcur?) in q/popParams val.

isThereOnly1ConstantKeyThatTheFewConstantKeysAreMergedInto - If true then whatAreTheKeysOfTheFewConstants has only 1 built in key. If there were going to be 3 built in keys, for example, of p/nextParam, q/popParams, and b/funcBody (or whatever those keys are), then that would be put in some datastruct in the val of the one built in key (which may be u as in (streamGet u) or may be _ or empty string or something). This would slow down evaling funcBody but would not slow down other uses of opStream such as opmut-style for if/else * + etc and would make those simpler cuz of simpler streamGet and streamPut. The p/nextParam would only be set if second last param is u (or however thats marked, such as maybe second last param's key is u). If true then, in some possible designs, in (opStream [keyA valA] [keyB valB] [u Stuff]), Stuff would be such a datastruct, maybe an infcur of 3 things, or maybe another opStream with 3 keys but it just doesnt eval cuz is just a few key/vals none of which are the built in constants (or just 1 constant if its merged as in isThereOnly1ConstantKeyThatTheFewConstantKeysAreMergedInto).

howIsOpstreamMarkedToEvalWhenGets1MoreParam - The simplest way is it evals when the second last param is u. Another way is to eval when the second last param is a key/val whose key is u, such as (opStream [keyA valA] [keyB valB] [u Stuff]) is waiting on 1 more param, and (opStream [keyA valA] [keyB valB] [u Stuff] x) would forkEdit Stuff to say nextParam is x, andOr maybe append a key/val of [someParamNameFromThePopparamsList x], then get FuncBody out of Stuff and call it on all that together.

whatsTheKeyValDatastructThatOpstreamIsAListOf - Since (infcur key val) is written as [key val] in the default syntax, infcur seems the most intuitive. Else it would be an op I design just for that such as (opKeyVal key val), just a semantic to mean its a key and val, and maybe it would allow 1 more param such as (opKeyVal whatKindOfOpstreamListItemIsThis key val) and whatKindOfOpstreamListItemIsThis might tell if its a "built in" whatAreTheKeysOfTheFewConstants kind of thing or a normal key/val. Probably I'll just use [key val].

howIsEmptyOpstreamDetected - Op is known at 7 params (of u), and after that o8/opcode is copied from left child. An optimization can be to define an op at param 6 and just let the 7th param be its first param, and if that 7th param is u vs anything_except_u thats 2 kinds of the op (that both do the same thing), but when using that optimization it must always be halted at its first (7th of u) param since thats required in the first 7 params of u. Similarly I was considering opOneMoreParam (which isnt going to be any op anymore since opLambda is merging into opStream) was going to be known at 5 params of u and have its next 2 params that way, so that the number of params the lambda is waiting on is known at 7 params as it would have been a vararg (up to around 240-something max params) thats measured at that 7th param. I might just put a mask bit in to say it has more than 7 params or not or that it has exactly 7 params, or count the number of params up to 14 and 15 means more than that but i'd have to find room for those 4 bits if so. Probably best to just check l.l.o8 or something like that.


Maybe streamGet and streamPut should have a fast way to check for a (opLambda ...) vs [[keyA valA] [keyB valB] [keyA anotherVal]], and for streamGet to find the [[keyA valA]...] in the opLambda and recurse into that. But what about streamPut on opLambda, is that even allowed?
(opLambda FuncBody [z y x varNameABC] [[keyA valA]...])
(opLambda FuncBody cBody [z y x varNameABC] [[keyA valA]...] NextParam) -> (opLambda FuncBody [z y x] [[keyA valA]... [varNameABC NextParam]]).
(opLambda FuncBody [z] [[keyA valA]... [varNameABC NextParam] [x valX] [y valY]]) is halted,
but (opLambda FuncBody [] [[keyA valA]... [varNameABC NextParam] [x valX] [y valY] [z valZ]]) is not halted so cant be the datastruct that funcBody is called on.
It also causes a problem of how does opLambda get a copy of itself to call itself recursively.
If its like the old versions of this system, it would be (FuncBody [(opLambda ...allParamsExceptLast...) lastParam]),
so just calling l then r on the param of FuncBody would get (opLambda ...allParamsExceptLast...) which includes FuncBody.
It could just make up more param names such as call (opLambda FuncBody [z y x varNameABC]) on whatever [[keyA valA]...] it got,
[but that would tend to make [[keyA valA]...] get ever bigger (unless streamPack it, which can be slow so shouldnt use every recursion).
It could forkPop the top n key/vals from [[keyA valA]...] and put them back into [z y x varNameABC] but they are not necessarily in the same order and not necessarily only occur once each since the same could have been written multiple times, if it was made by something other than that opLambda called on stuff (something could have forkEdited the contents of the opLambda).
Maybe the [z y x varNameABC] should be another [[keyA valA]...] in reverse order that can just pop from one and push on the other, replacing vals in some cases (else might view it as a default val)?

isThereOpOneMoreParam - ???

howDoesAFnCallItselfRecursively - ??? The FuncBody must take just 1 param so {...} can define it easily, and whatever opLambda andOr opStream does is how thats used as more params. Theres a few ways I'm considering: opOneMoreParam, (opLambda FuncBody [z y x varNameABC] [[keyA valA]...]), and doesOpstreamHaveFuncbodyKey_or_etc. opOneMoreParam complicates streamGet and streamPut but makes it easy to copy Node.evaler from left child. (opLambda [...param names...] ...those param values...) being a completely separate structure as opStream (which would then just be an infcur/[...]) ??? Maybe streamGet and lambdaGet should be different ops, and have different prefix such as ?x and $x ? Theres no lambdaPut. Maybe also some prefix for streamPut. If its done that way, thats areOplambdaAndOpstreamMerged being false. lambdas and streams must be able to interact with eachother. I could make a lambdaOrStreamGet op, thats less efficient cuz it checks for 2 different o8s. I could make (?? x (?? y (...))), and it could be written as ??x??y(...), which would basically be opOneMoreParam written as ??.


(opLambda FuncBody [] [z y x varNameABC])
(opLambda FuncBody [] [z y x varNameABC] valABC) -> (opLambda FuncBody [varNameABC valABC] [z y x]).
opStream would just be infcur as [keyA valA keyB valB ...], and one of those is in opLambda.
(opGetRecur (opLambda FuncBody [varNameABC valABC x valX] [z y])) -> (opLambda FuncBody [varNameABC valABC] [z y x]).
(opGetRecur (opLambda FuncBody [varNameABC valABC x valX] [z y]) otherValForX)
-> (opLambda FuncBody [varNameABC valABC x otherValForX] [z y]).
(While SomeCondition SomeLoopBody [varNameABC valABC x valX]) -> forkEdited [varNameABC valABC x valX].











-------------

/*
(stream [someVar 6] [keyA valA] [keyB valB] [x anotherVal] [funcBody (Params [?y ?x] {,Sqrt {,Square ?x} {,Square ?y}})] u)
..
(stream [funcBody (Params [?y ?x] {,Sqrt {,Square ?x} {,Square ?y}})] u)
where Params is an op that uses ?funcBody and ?nextParam (except todo choose much shorter var names for those).
..
(stream [funcBody (Params [?y ?x] {,Sqrt {,Square ?x} {,Square ?y}})] u 6)
-> (stream [x 6] [funcBody (Params [?y] {,Sqrt {,Square ?x} {,Square ?y}})] u)
..
(stream [x 6] [funcBody (Params [?y] {,Sqrt {,Square ?x} {,Square ?y}})] u 8)
-> ({,Sqrt {,Square ?x} {,Square ?y}} (stream [x 6] [y 8] [funcBody (Params [] {,Sqrt {,Square ?x} {,Square ?y}})]))
-> 6*6 8*8
FIXME forgot to put in the + in the Sqrt
..
(stream [funcBody (?? x (?? y {,Sqrt {,Square ?x} {,Square ?y}}))] u)
(stream [funcBody (?? x (?? y {,Sqrt {,Square ?x} {,Square ?y}}))] u 6)
-> (stream [x 6] [funcBody (?? y {,Sqrt {,Square ?x} {,Square ?y}})] u)


/*
(stream [x 6] [keyA valA] [keyB valB] [x anotherVal] [funcBody {,Sqrt {,Square ?x} {,Square ?y}}_fixme] u)
..
a funcbody could be... (opParamsList [?y ?x] {,Sqrt {,Square ?x} {,Square ?y}})
..
(stream [x 6] [keyA valA] [keyB valB] [x anotherVal] [funcBody (opParamsList [?y ?x] {,Sqrt {,Square ?x} {,Square ?y}})] u)
(stream [someVar 6] [keyA valA] [keyB valB] [x anotherVal] [funcBody (params [?y ?x] {,Sqrt {,Square ?x} {,Square ?y}})] u)



//(stream [?x 6] [?keyA valA] [?keyB valB] [?x anotherVal] [?funcBody {,sqrt {,square ?x} {,square ?y}}_fixmeMustMakeKeval[]ForX] u)


/*
(thisWhateverNewOp (kv ?keyA valA) (kv ?keyB valB) (kv ?keyA anotherVal) (kv ?funcBody FuncBody) u) is halted.
(thisWhateverNewOp (kv ?keyA valA) (kv ?keyB valB) (kv ?keyA anotherVal) (kv ?funcBody FuncBody) u NextParam) evals.
Evals to what? Include a (kv ?nextParam NextParam)? Whatever it is, FuncBody gets called on a (thisWhateverNewOp (kv ?keyA valA) (kv ?keyB valB) ...). Or, like the older versions of this system, lambda/curry* ops could use a (lazyEval_or_pair allParamsExceptLast lastParam) as param of funcBody.
..
(?keyA (thisWhateverNewOp (kv ?keyA valA) (kv ?keyB valB)) -> valA .
(?keyA (thisWhateverNewOp (kv ?keyA valA) (kv ?keyB valB) (kv ?keyA anotherVal) (kv ?funcBody FuncBody))) -> anotherVal.
(?funcBody (thisWhateverNewOp (kv ?keyA valA) (kv ?keyB valB) (kv ?keyA anotherVal) (kv ?funcBody FuncBody))) -> FuncBody.
thisWhateverNewOp would need to have an opcode whose last 2 opbits are (u u) instead of u, like in "vm.test('o8/opcode of u(uu)(uu)(uu)(uu)(uu)(uu)', u(uu)(uu)(uu)(uu)(uu)(uu)().o8(), 127);".
This takes slightly longer to verify than ops like s and t, but you just need to verify that there are no u params after param 7, unless its the last param.
TODO choose var name for ?funcBody and ?nextParam OR a different op than kv for it, such as...
(thisWhateverNewOp (kv ?keyA valA) (kv ?keyB valB) (kv ?keyA anotherVal) (theFuncBody FuncBody) (theNextParam NextParam))
or similar datastruct...
Or maybe if second last thing is a theFuncBody (thisWhateverNewOp (kv ?keyA valA) ... (theFuncBody FuncBody) NextParam) then eval.
I like (kv ?funcBody FuncBody) and (kv ?nextParam NextParam) so far, but want shorter var names for them.
...
TODO define func like js Math.hypot(x,y) using this...
(thisWhateverNewOp (kv ?funcBody {,sqrt {,square ?x} {,square ?y}) u) BUT thats not enuf since FuncBody must create (kv ?x whateverTheNextParam) and similar for ?y.
(thisWhateverNewOp (kv ?x 6) (kv ?funcBody {,sqrt {,square ?x} {,square ?y}) u) must result from calling the former on 6.
..
(thisWhateverNewOp [?x 6] [?keyA valA] [?keyB valB] [?x anotherVal] [?funcBody {,sqrt {,square ?x} {,square ?y}}] u)
..






/*
Could put all ?keyX valX in (kv ?keyX valX) so thats never u.
(thisWhateverNewOp (kv ?keyA valA) (kv keyB? valB) (kv ?keyA anotherVal) (opThatSaysItsFuncbody funcBody) u nextParam)
So if second last param is u, eval, else is halted.
(thisWhateverNewOp (kv ?keyA valA) (kv keyB? valB) (kv ?keyA anotherVal) (opThatSaysItsFuncbody funcBody) u) is halted.
(thisWhateverNewOp (kv ?keyA valA) (kv keyB? valB) (kv ?keyA anotherVal) (opThatSaysItsFuncbody funcBody)) is halted.
(thisWhateverNewOp (kv ?keyA valA) (kv keyB? valB) (kv ?keyA anotherVal)) is halted.
(thisWhateverNewOp (kv ?keyA valA) (kv keyB? valB)) is halted.
Seems like too much stuff to compute efficiently, including copying of Node.evaler, not just "from l child" but in this structure.
But it has the big advantage of it has unlimited vararg and funcBody is always within constant depth of the end, and you only need the o8/opcodeByte to know it is this kind of thing.
..
(thisWhateverNewOp (kv ?keyA valA) (kv keyB? valB) (kv ?keyA anotherVal) (kv ?funcBody funcBody) u) is halted.
(thisWhateverNewOp (kv ?keyA valA) (kv keyB? valB) (kv ?keyA anotherVal) (kv ?funcBody funcBody) u nextParam) evals.


















/*
NO THIS DOESNT WORK CUZ the l of it isnt halted. FIXME FIXME FIXME.. maybe just need to use [...] as infcur in something like (lambdaStream [?z ?y ?x] [key val key val...] valX) ???
DO THIS, as it merges op lambda and the streamGet streamPut streamPack For While DoWhile If IfElse etc ops,
and maybe use the [] syntax for it, or maybe keep [] for infcur...
(thisWhateverNewOp ?keyA valA keyB? valB ?keyA anotherVal ... funcBody) is halted if its lDepth is even,
else is (thisWhateverNewOp ?keyA valA keyB? valB ?keyA anotherVal ... funcBody nextParam) and evals to (funcBody (lazyEval (thisWhateverNewOp ?keyA valA keyB? valB ?keyA anotherVal ... funcBody) nextParam)),
which may for example put another ?whateverTheNextVarNameIs nextParam just before a (modified to not have ?whateverTheNextVarNameIs varName) funcBody, or may do anything as its a turingComplete vararg. Its about as close to varargAx as you can get without having constraints that are hard to verify.
..
What if, its halted or not only depending on if the second last param is u?
(thisWhateverNewOp ?keyA valA keyB? valB ?keyA anotherVal (u funcBody) u) //second last param is not u
(thisWhateverNewOp ?keyA valA keyB? valB ?keyA anotherVal (u funcBody) u nextParam) //second last param is u
but still would need to redesign it so thats true of (thisWhateverNewOp ?keyA valA keyB? valB ?keyA) and (thisWhateverNewOp ?keyA valA keyB?) etc.
Could put all ?keyX valX in (kv ?keyX valX) so thats never u.
(thisWhateverNewOp (kv ?keyA valA) (kv keyB? valB) (kv ?keyA anotherVal) (opThatSaysItsFuncbody funcBody) u nextParam)
So if second last param is u, eval, else is halted.
(thisWhateverNewOp (kv ?keyA valA) (kv keyB? valB) (kv ?keyA anotherVal) (opThatSaysItsFuncbody funcBody) u) is halted.
(thisWhateverNewOp (kv ?keyA valA) (kv keyB? valB) (kv ?keyA anotherVal) (opThatSaysItsFuncbody funcBody)) is halted.
(thisWhateverNewOp (kv ?keyA valA) (kv keyB? valB) (kv ?keyA anotherVal)) is halted.
(thisWhateverNewOp (kv ?keyA valA) (kv keyB? valB)) is halted.
Seems like too much stuff to compute efficiently, including copying of Node.evaler, not just "from l child" but in this structure.
But it has the big advantage of it has unlimited vararg and funcBody is always within constant depth of the end, and you only need the o8/opcodeByte to know it is this kind of thing.












/*
(thisWhateverNewOp ?keyA valA ?keyB valB oneOfAFewPossibleStates nextParam) -> (thisWhateverNewOp ...)
I'm not sure what I want on the right end of it but I want it to stream whatevers on the right end to choose what to append or eval to something very different etc. Must handle all possible nextParam, even if nextParam is a oneOfAFewPossibleStates etc.
What if it depends if theres an even vs odd num of params, which ?keyA valA ?keyB valB etc would fit well in???
Could make .l.l.l.l... depth a bit in the masks in headerInt.
..
(thisWhateverNewOp ?keyA valA keyB? valB ?keyA anotherVal ... funcBody) is halted if its lDepth is even,
else is (thisWhateverNewOp ?keyA valA keyB? valB ?keyA anotherVal ... funcBody nextParam) and evals to (funcBody (lazyEval (thisWhateverNewOp ?keyA valA keyB? valB ?keyA anotherVal ... funcBody) nextParam)),
which may for example put another ?whateverTheNextVarNameIs nextParam just before a (modified to not have ?whateverTheNextVarNameIs varName) funcBody, or may do anything as its a turingComplete vararg. Its about as close to varargAx as you can get without having constraints that are hard to verify.








/*
I want to merge the stream/[key val key val...] datastruct with lambda op, so both can use the same (streamGet varXYZ) aka ?varXYZ.
(NextVar keyB valB (NextVar (lambda FuncBody [...paramNames...]) keyA valA))#Asdfa34345
(Asdfa34345 valC) -> (NextVar Asdfa34345 keyC valC) OR (FuncBody (...something...)) depending if quantity of params in [...paramNames...] are filled.
Something like that, but its not a consistent design yet.
FIXME NextVar must take same number of params every time, and same order, so put recursive path to FuncBody and key and val in consistent place in it.
(NextVar (lambda FuncBody [...paramNames...]) keyA valA)
(NextVar (NextVar (lambda FuncBody [...paramNames...]) keyA valA) keyB valB)
..
or...
what if theres 2 standard varnames, maybe ?varargChooser and ?funcBody (TODO find 2 smaller var names or maybe u and (u u)???),
that go in a standard stream/[?key val ?varargChooser {...someFunc...} ?funcBody {...aFunc...} ?key val...], 
so (lambda [?key val ?varargChooser {...someFunc...} ?funcBody {...aFunc...} ?key val...]) would be "a lambda"
and (lambda [?key val ?varargChooser {...someFunc...} ?funcBody {...aFunc...} ?key val...] nextParam)
would get the {...someFunc...} from "?varargChooser {...someFunc...}", and call {...someFunc...} on something
to choose too keep it that way (dont eval yet) vs choose for funcBody to eval,
or like varargAx (but without being a constraint, so its verified trivially by forest shape having the right number of params)
could merge varargChooser and funcBody into 1 thing that returns (u returnVal) vs returns u to mean dont eval yet,
but I'm not sure if thats consistent since the lambda op cant be both halted and evaling at the same time without being a varargAx etc.
...
What if there was an op like infcur and like lambda, except funcBody is the "last thing in the infcur"...
(thingLikeInfcurLikeLambda a b c d funcBody) is halted.
(thingLikeInfcurLikeLambda a b c d funcBody nextParam) calls funcBody
on (thingLikeInfcurLikeLambda a b c d ...something including nextParam...) ???
..
(lambdaStream [?z ?y ?x] [key val key val...])
(lambdaStream [?z ?y ?x] [key val key val...] valX) -> (lambdaStream [?z ?y] [key val key val... ?x valX])
(lambdaStream [?z] [key val key val... x? valX y? valY] valZ) -> eval it.
????
...
(haltedStreamIfOneParamEvalsIfTwo [...stream...])
(haltedStreamIfOneParamEvalsIfTwo [...stream...] nextParam)
(evalingStream [...stream... ?nextParam nextParam]) -> some (haltedStreamIfOneParamEvalsIfTwo [...stream...]) or evals to anything else.
..
(evalingStream [...stream... ?funcBody {...} ?nextParam nextParam]) -> some (haltedStreamIfOneParamEvalsIfTwo [...stream...]) or evals to anything else.
..
Syntax for (haltedStreamIfOneParamEvalsIfTwo [...stream...]) is: [...stream...]_
???
....
...
Or...
What if theres no built in syntax for infcur, and instead theres a built in syntax for something similar to infcur but its like a stack, where a fn can be the last thing in it, but if its u (or some constant) then it just leaves whatevers there so far as it is, including itself (the u). ?x ?y ?varABC would still work on it. As an op, it always has either 0 or 1 more params. Example: (thisWhateverNewOp 11 2 3 +) -> (thisWhateverNewOp 11 5). Needs self reference / recursion ability. Needs ?varABC and opLambda ability. But as an opLambda, how can it be sure to take all possible params and give it to the thing just before that? Maybe second last thing is always the funcBody?
...
(thisWhateverNewOp (kv ?keyA valA) (kv ?keyB valB) oneOfAFewPossibleStates nextParam) -> (thisWhateverNewOp ...)
I'm not sure what I want on the right end of it but I want it to stream whatevers on the right end to choose what to append or eval to something very different etc. Must handle all possible nextParam, even if nextParam is a oneOfAFewPossibleStates etc.
What if it depends if theres an even vs odd num of params, which ?keyA valA ?keyB valB etc would fit well in???











/*






---------------------



TODO make some simple games and musical instruments with this asap...

Lambda form:
//(infcur (kvv keyDedupedFn valDedupedFn valDoublesRawCbt) (kvv keyDedupedFn valDedupedFn valDoublesRawCbt) (kvv keyDedupedFn valDedupedFn valDoublesRawCbt) ...) would be the lambda state.
Or maybe (infcur (keyval keyDedupedFn keyDedupedFn_or_valDoublesRawCbt) (keyval keyDedupedFn keyDedupedFn_or_valDoublesRawCbt) ...) would be the lambda state.

Opmut form:
vm.Mut = function(whichOpmutSpace,dedupedFn){
	this.whichOpmutSpace = whichOpmutSpace; //primaryKey is <int_or_maybe_double whichOpmutSpace, fn dedupedFn>
	this.dedupedFn = dedupedFn; //primaryKey is <int_or_maybe_double whichOpmutSpace, fn dedupedFn>
	//this.hashInt = ...
	//FIXME have 2 dedupedFns here, one you're allowed to see and one you're not, to allow for isolating musical instrument parts etc?
	this.valMut = todo same whichOpmutSpace as this, of u; //same as this.valFn implies, TODO merge this disorganized code.
	//this.valFn = u; //FIXME TODO. This merges Mut.j with Mut.m as in findOrCreateMut(this.whichOpmutSpace,anyDedupedFn).valFn or .valDoubles
	//this.valDouble = 0;
	this.valDoubles = emptyDoubleArray; //FIXME TODO
};

TODO write some example objects...

Write (infcur a b c) as [a b c].

["gameObject443"]#gob443
["gameObject200"]#gob200
["redBall300"]#redBall300
["blueBall250"]#blueBall250
["xp"]#xp
["yp"]#yp
["xv"]#xv
["yv"]#yv
(..definition of keyval..)#kv

And instead of kv/keyval just use another infcur???


[
	[gob443 x 42.3] //[gob443 x] is key. 42.3 is val.
	[gob443 y -500] //[gob443 y] is key. -500 is val.
	[gob443 "a" "longer" "than" "usual" "key" "has this value"] //[gob443 "a" "longer" "than" "usual" "key"] is key. "has this value" is val.
	[redBall300 "red" .7]
	[redBall300 "green" .1]
	[redBall300 "blue" .15]
	[redBall300 "argb" someInt32CbtMaybeStillAsADouble]
	[blueBall250 "argb" anotherInt32CbtMaybeStillAsADouble]
]#example324324OfLambdaFormOfAGameState

Ok, so game state as lambdas is basically a simple subset of sexpr defining a map,
and real lambdas are allowed in it, not just strings and infcurs and doubles and doublearrays etc.
For example, you could put an AI algorithm as a key or part of a key or value or part of a value.
Keys have to be perfectDeduped. Vals have to be perfectDeduped unless they are a rawCbt which is viewed as a double array.
Thats cuz vm.Mut.dedupedFn and vm.Mut.valMut must be perfectDeduped.
That doesnt mean you need an id256 for those perfectDeduped. Thats one way to do it,
but it can be just any fn that doesnt contain any blob is automatically perfect deduped already.

Syntax:
(x y z) is calling x on y, and what that returns calling that on z, aka ((x y) z).
{x y z} is {{x y} z} aka (s (s x y) z).
[x y z] is (infcur x y z).
,x is (t x)
<...> is a syntax of lambdas that eval during opmut, like abc.def<abc.hello.xyz>.mm is similar to abc.def[abc.hello.xyz].mm in js code, but theres details to work out. Use abc<<def>> vs abc<def> or some syntax inside <>, if need more kinds of syntax.
(...)#aName or {...}#aName or [...]#aName defines that aName refers to the same constant if aName is written anywhere else in that same local namespace, but it doesnt affect any kind of ids cuz ids only refer to forest shape and in some cases different duplicates of the same forest shape.
TODO syntax for small string literals with no whitespace, vs #names of constants, and is it utf8 or utf16. For example, maybe NamesThatStartWithCapitalLetter are #Constants and namesThatDont are literals, and if you want 'NamesThatStartWithCapitalLetter' as a literal, or 'NamesThatStartWithCapitalLetter with whitespace', then quote it. ?x would be a lambda param, as the lambda op will take up to around 250 params (or is it up to around 125?) that are named, or maybe in an infcur list of them, and maybe (lambda [?x ?y ?varABC] {funcBody that uses x? y? ?varABC} ...params...). Remember that calls (funcBody (lazyEval (lambda [?x ?y ?varABC] {funcBody that uses x? y? ?varABC} ...paramsExceptLast...) lastParam)) when it gets enuf params, and (x? (lazyEval (lambda [?x ?y ?varABC] {funcBody that uses x? y? ?varABC} ...paramsExceptLast...) lastParam)) returns whatever nth param the order of ?x is in that.











/*
(infcur "gameObject443")#gob443
(infcur "gameObject200")#gob200
(infcur "redBall300")#redBall300
(infcur "blueBall250")#blueBall250
(infcur "xp")#xp
(infcur "yp")#yp
(infcur "xv")#xv
(infcur "yv")#yv
(..definition of keyval..)#kv

(infcur (kv 
*/



/*
---------


vm.Mut is normally only used in a fraction of a second to transform a lambda to another lambda, as a mutable optimization.
As a lambda, it would maybe be 2 maps, of fn to fn, and of fn to cbtAsDoubleArray or as (typeval "double[]" bitstring) or (typeval "int[]" bitstring) etc.
The fns that are keys and vals in that map, other than the double[] int[] etc, would be deduped
(but doesnt necessarily require hashing them, since they could just be deduped by id64 if they dont wrap any blobs).
How would I use that to make a worldofgoo-like node (circle with poles between some of them sparsely), or musical instrument parts like in puredata?
I could use (infcur "x")#fieldX as "the x field", and (infcur "gameObject443")#gob443, and map (gob443 fieldX) to 29.3 [(typeval "double" cbtWithThoseBitsOf_29.3) maybe].
Or simpler, (gob443 fieldX 29.3) as a call of infcur (thats of course instantly halted). It could also have (gob443 fieldX 11) but it could be used like
only 1 of those should occur in any one "state" (in immutable/stateless lambdas) even though it could technically occur.
Maybe view it like a "file system" "/gob443/fieldX -> 29.3". but has to be lambdas somehow.
However its organized, it seems that translating between the 2 data formats, of lambda and mutspace, is going to be some kind of map of lambda to lambda.
Deduped lambda has 64 bit local id, and any nondeduped cbt thats at the top of its blob wrapper, can just imply its blobFrom is 0 and blobTo is that blob size,
so both of these together, mapping dedupedLambda to [dedupedLambda or topmostInItsBlobNondedupedCbt], fits in 128 bits,
and a double could also fit in 64 bits if we only use idA_concat_idB in the nonnormedNaNs (so around 2^52 of them) as id64s and those that are normed doubles are those doubles.
User level code (in opmut or interpreted lambdas) is not allowed to know which 64 bits (2*64=128) that is since it would make VM behaviors nonstandard (reference, not pointer),
but can check them for equality and call them as lambda (after dedup if not already deduped, which vals may not be).
So can put those in a hashtable (maybe just pairs of lambda and lambdaOrDouble) or simpler a list or tree sorted by such id64s.
User level code wouldnt get to know the order of them in that datastruct, so I'm not sure how to make that a lambda.
User level code can sort lambdas by any chosen comparator, as long as the last comparator guarantees to give an order to everything that doesnt equal,
such as the comparator of first sort by height then to break ties sort recursively by left child then to break ties sort recursively by right child.
I might be making this harder than it is. Basically its just a bunch of pairs of lambda as key and lambda as value, in lambda form, and Mut objects during opmut,
and a pair of lambda as key and lambda as value is a simple well defined lambda, but "a bunch of" is the hard part. It has to be 1 lambda.
I could use an infcur alternating key val key val, and if I wanted to translate it to a more efficient datastruct (such as a treemap) just loop over it doing that,
or infcur of (pair key val) or something like that. Maybe have an op just for this semantic: (keyval key val)
as in (infcur (keyval key val) (keyval key val) (keyval key val) (keyval key val) (keyval key val) ...) would be the lambda state,
and a bunch of Muts, whose .dedupedFn is key, and whose valMut, valDouble, andOr valDoubles are the val (might need 2 or 3 vals like a keyValfnValdoubleValdoublesValints op or something?).

//primaryKey is <int_or_maybe_double whichOpmutSpace, fn dedupedFn>. primaryKey of a dedupedFn is 64 bits. primaryKey of a non-deduped-fn is 128 bits.
vm.Mut = function(whichOpmutSpace,dedupedFn){
	this.whichOpmutSpace = whichOpmutSpace; //primaryKey is <int_or_maybe_double whichOpmutSpace, fn dedupedFn>
	this.dedupedFn = dedupedFn; //primaryKey is <int_or_maybe_double whichOpmutSpace, fn dedupedFn>
	//this.hashInt = ...
	//FIXME have 2 dedupedFns here, one you're allowed to see and one you're not, to allow for isolating musical instrument parts etc?
	this.valMut = todo same whichOpmutSpace as this, of u; //same as this.valFn implies, TODO merge this disorganized code.
	//this.valFn = u; //FIXME TODO. This merges Mut.j with Mut.m as in findOrCreateMut(this.whichOpmutSpace,anyDedupedFn).valFn or .valDoubles
	this.valDouble = 0;
	this.valDoubles = emptyDoubleArray; //FIXME TODO
};
//vm.stack_whichOpmutSpace;
//as in "primaryKey is <int_or_maybe_double whichOpmutSpace, fn dedupedFn>". Up to a few thousand of these might exist at once
//in one computer, but normally 1 or just a few at a time. Multiple exist when opmut calls opmut. After all that returns, all of them become garbcolable.



see "TODO merge the opmut state space with the lambda state(less) space, maybe by adding a fifth int to the 4 ints of key of (localname of) lambdas (whichOpmutSpace idA id" in mm, todo copy relevant parts from there, about...
...
...
...
TODO merge the opmut state space with the lambda state(less) space, maybe by adding a fifth int to the 4 ints of key of (localname of) lambdas (whichOpmutSpace idA idB blobFrom blobTo). In a deduped lambda, blobFrom and blobTo are both 0. Or maybe that fifth/whichOpmutSpace int is 1 of the 4 salt ints (salt128 in StackStuff)?
,,
Instead of merging with FuncallCache, make FuncState parallel to FuncallCache, and key is FuncState<int,fn> which is a js object that has 1 mutable ptr to fn and 1 mutable ptr to Float64Array and maybe 1 mutable double. The int in <int,fn> is whichOpmutSpace.
..
FuncState<int,fn> will mostly be for fns that are made only of combos of infcur but can in general be any fn as long as its perfectDeduped (which can be done by int for short times).









/*
Consider cp(Mut,Mut)->Mut (and maybe with a whichOpmutSpace) as a third part of cp, just a number so they dont overlap mutable values,
and the ints are used the same way for hashing to dedup Muts. Or could use fns as muts but only the subset of fns that are made completely of infcurs,
and key of a Mut would be that fn, but that would be expensive cuz of the other fields fns have, so just do ints Muts.
vm.Mut = function(whichOpmutSpace,leftMut,rightMut){
	this.whichOpmutSpace = whichOpmutSpace;
	this.id; //int id/bucket, without deletions, so once its created it stays there until the whole hashtable is garbcoled.
	this.valMut; //mutable pointer at a Mut. unlike the 2 immutable perfect deduped pointers at its left and right childs (not stored, since you only look up by those).
	this.valFn = u;
	this.valNum = 0;
	this.valNums = emptyDoubleArray;
};
vm.Mut.prototype.p(mut){ return mutCp(whichOpmutSpace,this,mut); } //cp(Mut,Mut)
This would be slower for some things than just using OpmutState.ints[ptr to ptr+7] and having separate fn and optional Float64Array for each,
but its easier to use.
TODO stack of pairs of Mut, one being like a ptr and one representing a var name (utf8 bits in its forest shape)?


/*TODO use this to do the 32 bit voxels and some music tools asap...
Dont worry about the abc.def.xyz, just do (mput ob key val) etc, at least for now, since that will avoid needing to recompute the hash every time,
but get it more optimized to figure out abc.def.xyz etc later.
..
TODO use binforest shape (without heap) as keys, and heap for Float64Array and fn vals, but in the no-garbcol-cuz-justduringfractionofasecondmutcallsonoremovingfromhashtableetc blocks of 4 doubles or 3 ints and a float or 4 ints etc. More generally, of 4 doubles and a fn[] and a Float64Array[] aligned to it, as (int,int)->int hashtable. see "DO THIS: Could have blocks of double_double_double_double, aligned to Float64Array[] and fn[], and the 4 doubles ar" in mm (not to self, TODO copy relevant parts). Remember, can overlap the buffer object between Float32Array Float64Array Int32Array etc.
..
vm.mutHashtable = new Float64Array(TODOWhatSize); //1d array of doubles, used in blocks of 4 doubles. Each block is: ptr at left child, ptr at right child, mutable ptr, mutable double.q 
vm.mutFn = new Array(same size as mutHashtable.length>>2); //lambda[] aka array of lambdas
vm.mutDoubles = new Array(same size as mutHashtable.length>>2); //Float64Array[] aka array of Float64Arrays.
//returns int 0 or int 1, for if that binforest shape has been allocated in hashtable or not.
vm.mutCpExists = function(intA, intB){
	throw 'TODO';
};
//returns an int, index into vm.mutHashtable.
vm.mutCp = function(intA, intB){
	throw 'TODO hash 2 ints in a loop, looking into buckets in mutHashtable (each bucket is 4 doubles (or int view of them), and find some index in that which has the given 2 ints at offsets 0 and 1 from it (offset 2 is ptr, offset 3 is double val)';
};
//the ptr (at a mut, aka an int into mutHashtable) val of that binforest node. the other kind of val is a double. and in a separate 2 arrays are fn or Float64Array.
vm.mutCpPtr = function(intA, intB){
	return vm.mutHashtable[vm.mutCp(intA,intB)+2];
};
//the double val part of "//the ptr (at a mut, aka an int into mutHashtable) val of that binforest node. the other kind of val is a double. and in a separate 2 arrays are fn or Float64Array.".
vm.mutCpNum = function(intA, intB){
	return vm.mutHashtable[vm.mutCp(intA,intB)+3];
};
vm.mutCpFn = function(intA, intB){
	return vm.mutFn[vm.mutCp(intA,intB)>>2];
};
vm.mutCpFloat64Array = function(intA, intB){
	return vm.mutDoubles[vm.mutCp(intA,intB)>>2];
};
This removes the need for Mut.m (js map of string to MutOrDouble) and for strings. Consider that binforest shape is superexponential.



















Consider making a variant of opmut, to be used with the existing kind of opmut, thats specialized in lower level primitive ops, especially ints (and maybe doubles etc), and is more like acyclicFlow and especially the form of it that reads from 2 indexs and writes to 1, all 3 being chosen by the 32 bit opcode, instead of the write to address being derived from it being the nth opcode in the sequence. If could call that, in a flexible way, from opmut, then it would be like 3 levels of slow/flexible .. midSpeed/midFlexible/opmut .. fast/inflexible/lowLevel/<this new op>.
DO IT.
And "eat my own dogfood", use it to derive the 32 bit voxel graphics, and generate int[1024x1024] from it 60 times per second.
Optimize as far as it takes. Put it on screen and play with it.




?????
Consider putting .i field (for Int32Array) instead of just .d (Float64Array), in Mut, so can do graphics ints faster, considering CPU cache of few levels. Size matters.


??? use the following in opmut, and store graphics in Float64Array(512*512).buffer which is just 2mB for 1 megapixel. This can be translated to/from the "32 bit voxels" mentioned below, which could be a detail of one of many possible ways to generate the double[1<<18] graphics.
...
"eat your own dogfood". use opmut, and not extra code in VM, to do whatever voxel system want to implement. take just a cbt for pixels 60+ times per second (and similar but utc time needed for sound)...
Since opmut normally uses Float64Array and {}jsmaps (in compiled form), consider a double/float64 being a 2x2x3x4 grid of bits aka a 2x2 grid of 12bitcolor pixels. double has 53 bits of integer precision. thats only 48. and it can do 1024x1024x12bitcolor in a double[512*512], which can be copied 4 times faster if its aligned on 512x512.


















If using opmut to derive graphics lambdas that return whole Byterect blob all at once, requires using lower resolution such as 512x512 or 256x256 etc (no lower than old game consoles graphics), then maybe thats an ok way to start, considering that so far it doesnt do any graphics at all, and that would at least be a way to build fun things quickly. Or maybe the opmut optimizations will be (using cpu) fast enough that it can do higher resolution. (not to mention GPU, which I'll do later, but it has sequential limits such as .001 to .01 seconds per GPU call (and sometimes 20 gpu calls in 1 in opencl, can be nearly as fast, but gpujs I'm not sure if their combineKernels works as well).... get cpu doing fun things first.


If it doesnt slow down too much to generate a whole other megapixel blob each video frame, then maybe should just do graphics as generate such a 4mB blob (ARGB 32 bit pixels),
and whatever way of doing that in middle steps, is ok, such as y10x10rgb12 voxels. also consider that Float64Array would be used in opmut (so 8mB) to make the 4mB blob.
make drag and droppable sound/graphics/game/gamepad/quickload/quicksave/etc windows, and make simple games in them. todo.















More generally (than next "xel32 graphics of 512x1024 resolution" paragraph below),
use infcur (or some op) as streaming sequence of graphicsOp, where a graphicsOp is (maybe a mutop or maybe something lambda/immutable)
... is a transform of int[1<<20] to int[1<<20] (as in a ByteRect of 1024x1024 pixels), but 12 bit color optimization in some parts at least.
A kind of graphicsOp is to offset x and y by such a 32 bit voxel (using just 10 bits of y and 10 bits of x for example, but faster just add it as int),
so offset in x and y.
A kind of graphicsOp is a list of 32 bit voxels to paint y10 x10 rgb10.
A kind of graphicsOp is 2 graphicsOps, one to do first, one to do after that (in case of overlap order matters).
There could be other graphicsOps, but consider the benefits of doing as lambdas so those who havent opted in to organizing things that way
will still understand it through the common math of "what does a lambda call return".
If it doesnt slow down too much to generate a whole other megapixel blob each video frame, then maybe should just do graphics as generate such a 4mB blob (ARGB 32 bit pixels),
and whatever way of doing that in middle steps, is ok, such as y10x10rgb12 voxels. also consider that Float64Array would be used in opmut (so 8mB) to make the 4mB blob.












Do this for voxel32 graphics of 512x1024 resolution 12 bit color, infcur-like int[] streaming ignoring internal tree structure...
int[] as infcurAt6Params, only the order of ints matters, for y512_x1024_rgb12Bits voxels, where first bit chooses between add to current 19 bit xy offset vs be a leaf 31 bit voxel. So make an int[] (such as 5 or 2054634 ints) and prefix it with +offset and suffix it with -offset, and use infcur to define such a streaming int[] regardless of internal tree structure of infcurs.
???
TODO make new op, similar to infcurAt6Params, thats ONLY for stream appending int[], and infloops if anything else is put in it. and use 1 of the mask bits (have 2 reserved for future expansion, so 1 left) for that??? no dont need a mask bit, cuz by inflooping if its NOT that recursively, just its existence implies that.
...
make simple graphics with it asap.


/*TODO make infcur be known at param 6 so theres 2 ops for it, so theres an o8 that can detect if its at the end of an infcur efficiently.
	and use it for 32 bit y10x10rgb12 voxels with 32 bit offset (anded into 1<<20 array of ints 4 times more bytes in ByteRect) used in canvas.
	Use it in general as a way to stream int32[] by just calling them on eachother as lazyconcat.
	but where to put the plusoffset32 vs literalvoxel32 if its all just viewed as a big tree of concatted int32s?
	no, dont parse it that way. instead do...
instead do...
infcur (known at 6 params, and next param may be int offset)....
(infcurAt6Params intOffsetA (infcurAt6Params intOffsetB ints ints ints (infcurAt6Params intOffsetC ints) ... ...
but i'd prefer intOffset be parsable in the order it occurs from the top of a fn (binary forest node aka lambda) down, instead of so deep you have to find the infcur first.
(someDerivedSymbolMeaningOffset intOffset thing)
(someDerivedSymbolMeaningPairOfVoxel32GraphicsNodes graphicsNodeA graphicsNodeB) //similar to pair
where graphicsNode* may be either of those 2 kind of things OR an int[] (as cbt).
..
If it was an append-only-intarray, maybe this datastruct, starting at a given int ptr: *ptr is local size of this node in units of ints. Downward, it has these: addToValuesOfChildA ptrToChildA addToValuesOfChildB ptrToChildB <*ptr-5 (or is it -4?) number of literal voxel32s>. At ptr==4 (+1 -1 etc? is that right number?) is an "empty node" of no childs and no voxels. The first 4 ints in the "append-only-intarray: are: 0 4 0 4 5, aka offset childPtr offset childPtr sizeOfThisNode, and childPtr is pointing at itself, as the basecase. Its basically the NullObject.
That defines a stream-appendable image format, but I'll probably use lambdas/fns forest with int[]s in it, instead of purely appendable blob.
The main advantage of this image format is it can share branches, reuse multiple existing sets of voxels at x y offsets (but not scaling or rotating) to define another such set, without storing the duplicates that are just recursive offsets. For example, to have a 12x12 pixel set of 144 int voxels for a certain char of a certain font and for many of them to occur various places. the ints could be derived at runtime for advanced graphics, but the ability to make a literal copy at a 2d offset would save alot of compute power.
..
as lambda....
(someSymbol int[]LiteralVoxels childAOffsetInt childAOrU childBOffsetInt childBOrU), where childA and childB are similar someSymbol calls, and "orU" means u is viewed like null.
...
consider stream appendable int[] as infcurAt6Params, only the order of ints matters, for y512_x1024_rgb12Bits voxels, where first bit chooses between add to current 19 bit xy offset vs be a leaf 31 bit voxel. So make an int[] (such as 5 or 2054634 ints) and prefix it with +offset and suffix it with -offset, and use infcur to define such a streaming int[] regardless of internal tree structure of infcurs.
???
TODO make new op, similar to infcurAt6Params, thats ONLY for stream appending int[], and infloops if anything else is put in it. and use 1 of the mask bits (have 2 reserved for future expansion, so 1 left) for that??? no dont need a mask bit, cuz by inflooping if its NOT that recursively, just its existence implies that.

/*TODO asap make the lambdas of variable number of (lambda funcBody ?varA ?varb ?varc u ...paramsOfThatManyParamsUpTo240Something), AND make the Mut as described below, and do some basics graphics, sound, or something just start playing with it.



FIXED design keeps Mut mostly as it is, adds .j->fn and .g->string and has weaker merged gasTime/gasMem and only runs for a tiny fraction of a second so it wont run out of mem.
"Mut.m -> {} where key is string and val is [Mut or double or undefined], with null prototype?." prevents accidentally getting string when you expected double.
..
TODO asap, but confirm this solves the problem...
Have ops for string length, concat, substring, etc.
Have try/catch op for undefined[anything] where some things may return undefined.
Have just 1 var in opmut that counts down with each thing done next, sometimes counts by variable amount like when string concat it will check their lengths.
I'm guessing (TODO verify) that putting a big string as a map key doesnt cost the size of that string as its deduped or hashed or something... but im not sure.
Opmut only happens, normally, for a small fraction of a second. Its unlikely to run out of memory at all.
So if just use 1 gas* var, gasTimeAndOrMem, and subtract from it for heap allocation and for every write in a {}, then it cant infinite loop and must halt within some approximatable (though might vary by 10 times faster or slower) limit.
..
Mut.n size of Float64Array if need to have null prototype.
Mut.m -> {} where key is string (may be made from double or undefined or concat of mutA.g with mutB.g etc) and val is [Mut or double or undefined], with null prototype?.
Mut.d -> Float64Array, with null prototype. can use this for canvas pixel graphics (copy between them, but lambdas are still immutable, etc).
Mut.g -> string
Mut.j -> fn (u by default).
...
{hi:'hello'}+2
2
{hi:'hello'}+33
33
{hi:'hello'}*5
VM176:1 Uncaught SyntaxError: Unexpected token '*'
({hi:'hello'})*5
NaN
OK.
..
Can aMut.m.someStringABC cuz know 'someStringABC' is a string (dont need to wrap in a Mut in Mut.g),
but otherwise the only keys accepted in it are from Mut.g.


/*
----------



OLD, cuz DO ALLOW CONCAT ETC DYNAMIC STUFF...
Optimize Mut by not (UPDATE yes) allowing direct access to strings, except as symbols, keys in Mut.m. No concat. No length. No listing them.
If you ask for one that doesnt exist, it gives undefined.
so its like the structs mentioned below except theres only 1 type and it has int keys of doubles and string keys of double_or_mut_or_undefined. mut also has 1 lambda/fn field thats often not deduped.
but how to limit mem use in {}?
????
+ of string vs double, and in {} keys, seems hard to limit the memory of, since + can cause string concat or expand mem of {}.
but without strings as {} keys (or maybe some kind of number), browser js wont optimize it well.
If could just limit memory recursively on stack, of strings, then Mut as usual would work.
???
What if Mut.m[anyKey] -> always a mut OR double, but never a string or fn cuz if so those would go in field of Mut?
Mut.n size of Float64Array if need to have null prototype.
Mut.m -> {} where key is string and val is [Mut or double or undefined]. (with null prototype?).
Mut.d -> Float64Array (with null prototype)?.
Mut.g -> string
Mut.j -> fn (u by default).
..
Can aMut.m.someStringABC cuz know 'someStringABC' is a string (dont need to wrap in a Mut in Mut.g),
but otherwise the only keys accepted in it are from Mut.g.
..
I think I fixed it, TODO verify.
Still need to track memory in Mut.m since dont know if it has a key or not, but if check if it has such a key that might make it too slow??? Basically just need to know the {} size of Mut.m. Its too slow to make Mut.prototype.putM(key,val) func, that would count it, since it needs to use loop optimizations that already exist in browser js VMs.
Mostly this 1 thing left... Count the number of key/val pairs in Mut.m... But how???
How??
..
Opmut only happens, normally, for a small fraction of a second. Its unlikely to run out of memory at all.
So if just use 1 gas* var, gasTimeAndOrMem, and subtract from it for heap allocation and for every write in a {}, then it cant infinite loop and must halt within some approximatable (though might vary by 10 times faster or slower) limit.







------old comments...


opmut struct optimization...
Root types: emptyType, lambdaWrapperType, doubleType (and maybe other primitive types).
There are 4 kinds of derived types:
-- placeholder for the type the placeholder is a direct child of, which is replaced by hashname of its parent after hashing,
	and if hashing again, is replaced by the one "placeholder constant" then hash again which generates the same hash,
	so it can do trees where parent is same type as any constant n of its childs (FIXME what if (int,thatPlaceholder)?).
-- (int,type)->that many of type, basically an array of ptrs, though i'm unsure if some things will be inlined (especially doubleType will be inlined in Float64Array).
-- (nameA,typeA,nameB,typeB,nameC,typeC... for any number of name/type pairs.
..
TODO build this asap in opmut wikibinator203 opcode.
(((TODO after that build a different opcode for GPUjs-like/lazycl-like calculations since they cant handle dynamic memory efficiently, though gpujs does it more than opencl (which lazy uses) cuz gpujs is built on webgl which has pointers into "opengl textures" etc. They're both similar enough that they would be optimizations of the same wikibinator203 opcode.
)))
For example, if you want a loop for(let j=0; j<... then j would be the name of a double or int in a struct and is a mutable double or int etc.
Maybe similar for "a line of code" that does a few * + - Math.sin, pointer jumping of specific type.fieldname etc.
..
FIXME want ability to copy between var size double[] and fn/cbt, without having to use a different type per size.
What if a "(int,type)->that many of type" defines a minimum number of those instead of a specific number? But how does that help in copying the whole thing? It would be better to just be variable size of it, but once an instance is created its that constant size, which can differ from other instances of same type*nNumberOfThem.
..
Throwing together various puredatalike musical instrument parts, those parts could have a certain type in common that has n input doubles m output doubles etc... BUT how could the parent opmut call (which has a struct type) get a ptr to those if they're INSIDE different types than that? it seems to need inheritance, but that could slow things. Find an efficient solution...





for optimized cpu evalers in opmut (lambdas other than opmut can still do what they normally do)...
Consider using struct-like inheritance-like stuff, where every fieldName has a class so classABC.fieldXYZ is a different int than classDEF.fieldXYZ int. To read the field at a class* just add the int to it. can be ptr or double. not sure where the doubles go.
a class is a merkle-like linkedlist of triples of class, name, and val. if classABC has 20 fields, then there are 21 classes in its inheritance chain. its superclass has 19 fields, and so on to the root class which has 0 fields. a subclass instance of a field type can be pointed at by that field. but where do the doubles go? but wouldnt this slow things down by instanceof in deep inheritance andOr casting?
What if theres no inheritance and theres just final structs as classlike things, where each of n fields in a struct type is a struct which may be a different struct or its own type. and put the doubles in there.
Could name struct types by hash of their definition, and after hashing, any part of their definition that means "self type" is replaced by that hash.
double could be such a type. (and Float64Array (size(s)?) somehow typelike or related how????)???.
Wrapper of fn is also such a type.
i dont want to limit it to such simple datastructs, with no dynamic lookup of string keys, no inheritance, etc, but its hard to optimize things in opmut.
This seems very optimizable in (opmut [...tree of code...] mut),
BUT is it flexible enough?


Try to do the whole cpu optimized opmut (not the gpu optimized kind) in 1 big Float64Array of powOf2 size where doubles are used as both pointers (mask them) so can use them both as doubles and as objects. Use doubles in some cases as [viewed as up to 11 base26 chars such as 'helloworldx' or 'i'] and use a simple linkedlist (may be bringToFrontList?) for key/value maps of SMALL NUMBERS OF KEY/VALS PER OBJECT. It will implement map of map to map where each map is a double value, including that each double maps to a fn |} u.

Consider using datastruct of [leftPtr rightPtr Float64Array], and the 2 ptrs and contents of the array are mutable, and to implement abc.def.ghi = abc.xyz+2 etc, could make small such maps in the left/right cons-like shape. each such node would have a toString that returns a certain double, and double could be viewed as up to 11 base26 chars such as 'helloworldx' or 'i'. Basically you use it as a list of key/val pairs that are each doubles. and could use bringtofrontlist in some cases.
???
could it be fast enough?



TODO replace Mut with prototypeless Float64Array and prototypeless {},
with instance var of toString, and only use keys of double or undefined,
and toString returns a double.
put fns in an Array() used as a map of double to fn, allowing duplicate fns so lazyDedup doesnt cause nondeterminism.
Check vm.gas* during this.
Use doubles as base26 number of at most 11 digits, for human readable names, at least in some range of doubles.
so basically its a map of map to map where each map appears as a double and can have a pointer to a fn, and some such maps only allow a subset of doubles, while others are slower and allow all possible doubles.
..
FIXME count memory of string keys in {}?
..
[[[
let start = Date.now(); x = {}; x.d = new Float64Array(555); x.i = 1; for(x.j=0; x.j<10000000; x.j=x.j+1){ x.i = x.i+x.j*x.j; x.d[x.j%555] = x.i; } let end = Date.now(); let duration = (end-start)*.001; console.log('i='+x.i+' duration='+duration);
VM43:1 i=333333283333717100000 duration=0.027
undefined
let start = Date.now(); x = {}; x.d = new Float64Array(555); x.i = 1; for(x.j=0; x.j<100000000; x.j=x.j+1){ x.i = x.i+x.j*x.j; x.d[x.j%555] = x.i; } let end = Date.now(); let duration = (end-start)*.001; console.log('i='+x.i+' duration='+duration);
VM51:1 i=3.333333283334632e+23 duration=0.246
undefined
x.toString = function(){ return 234; }
?? (){ return 234; }
x+1
235
x.d.toString = function(){ return 500; }
?? (){ return 500; }
x+x.d
734
x[x]
undefined
let start = Date.now(); x = {}; x.d = new Float64Array(555); x.i = 1; for(x[100]=0; x[100]<100000000; x[100]=x[100]+1){ x.i = x.i+x[100]*x[100]; x.d[x[100]%555] = x.i; } let end = Date.now(); let duration = (end-start)*.001; console.log('i='+x.i+' duration='+duration);
VM422:1 i=3.333333283334632e+23 duration=0.264
undefined
]]]




--




Syntax change: [a b c] means (infcur a b c). Replace a[b] with a<<b>> aka mutA.m[b]. a<b> still means mutA.d[b].
() still means currylist. {} still means sCurryList.
opmut mutable (temporarily during an immutable call as optimization) vars start with . like .abc.def means rootMut.m.abc.m.def .
opmut only uses [], such as (opmut [while [lt .i .j] [...loopBody...]] someParam). while and lt would be 2 #names of lambdas. while is opcode. lt doesnt have to be, but could be any lambda that takes 2 doubles and returns a double, or something like that. or maybe has to be opcode at least in early versions its easier to optimize.
It can call opmut recursively, with (opmut [...]) having a cached mutEvaler and taking a param of Mut, string, double, fn, or undefined.
Careful to verify something is a string vs double, such as by multiplying by 1 before doing double ops, so vm.stackMem counts the allocation of strings such as by + concat. '55'*1+1 is 56 in js, so thats a problem. might have to use .length to check the difference, or typeof would probably be slower. Or wrap in Number(55)+1. This could be a problem for optimizing?
..
Or maybe just write it like rootMut.m.abc.m.def and allow rootMut.m<'abc'>.m.def.d<42> etc.
..
It seems to make it a few times slower (100 megaflops vs 300 megaflops) to use Number(j) like this...
let i = 1; for(let j=Number(0); j<Number(100000000); j=Number(j)+1) i = Number(i)+Number(j)*Number(j); console.log('i='+Number(i));
VM606:1 i=3.333333283334632e+23
undefined
let i = 1; for(let j=0; j<100000000; j=j+1) i = i+j*j; console.log('i='+Number(i));
VM766:1 i=3.333333283334632e+23
..
I was planning to just use js + and not worry about if its string vs number, just let it do the same thing it does in js,
but the problem is need to count the memory if it creates a string.
..
SOLUTION: for numbers use -0 since a string minus 0 is NaN and doesnt create a new string. In js code generated from the [...].
Its the same speed as you see here:
..
let start = Date.now(); let i = 1; for(let j=0; j<100000000; j=j+1) i = i+j*j; let end = Date.now(); let duration = (end-start)*.001; console.log('i='+i+' duration='+duration);
VM759:1 i=3.333333283334632e+23 duration=0.639
undefined
let start = Date.now(); let i = 1; for(let j=0; j<100000000; j=(j-0)+1) i = (i-0)+(j-0)*(j-0); let end = Date.now(); let duration = (end-start)*.001; console.log('i='+(i-0)+' duration='+duration);
VM767:1 i=3.333333283334632e+23 duration=0.64
..
Surprisingly its even faster in a Mut-like map...
let start = Date.now(); let i = 1; for(let j=0; j<100000000; j=(j-0)+1) i = (i-0)+(j-0)*(j-0); let end = Date.now(); let duration = (end-start)*.001; console.log('i='+(i-0)+' duration='+duration);
VM9111:1 i=3.333333283334632e+23 duration=0.621
undefined
let start = Date.now(); let x={}; x.i = 1; for(x.j=0; x.j<100000000; x.j=(x.j-0)+1) x.i = (x.i-0)+(x.j-0)*(x.j-0); let end = Date.now(); let duration = (end-start)*.001; console.log('i='+(x.i-0)+' duration='+duration);
VM12025:1 i=3.333333283334632e+23 duration=0.196
undefined
let start = Date.now(); let x={}; x.m={}; x.m.i = 1; for(x.m.j=0; x.m.j<100000000; x.m.j=(x.m.j-0)+1) x.m.i = (x.m.i-0)+(x.m.j-0)*(x.m.j-0); let end = Date.now(); let duration = (end-start)*.001; console.log('i='+(x.m.i-0)+' duration='+duration);
VM15809:1 i=3.333333283334632e+23 duration=0.197



TODO I might want more than 4 kinds of paired chars () {} [] <>, but thats all there is on common keyboards.
Consider using just () and prefixing it with a letter so theres 26 kinds: a(...) to z(...).
Problem is, in things like rootMut.m<'abc'>.m.def.d<42> or abc[def].ghi<abc<44>>, the syntax doesnt have a plce to put a char before the (...) without it appearing strange, like instead of abc[def], abcm(def) which is 2 things: abc and m(...). maybe abc.m(def) ?
Or, keep 2 of those char pairs, such as [] and <>, for that syntax, and keep {} for sCurryList, and have up to 26 (or 23? so alloc a letter for those other kinds too?) kinds of a(...) to z(...).
...
{...}
[...]
a(...) to z(...)
<...>
abc.m(...).d(...)
s(...)
t(...) is like s except its what st does in earlier versions, its s with t of the first thing in the (...). ??? or use t(...) for something else?
.abc the . prefix means rootMut.abc. Like in i(< .a .b).
Maybe should use a[...] to z[...] so you dont have to push shift to get to ( ) so often.
,x means c(t x), and by c(...) i mean normal currylist but might change the letter to something other than c.
...
can .abc.def[abc.ghi]<(+ 2 3)> be written a simpler way?
...
Should every char define a syntax of what follows, like n5.3 is the number 5.3 cuz it starts with n, and ghello is the string 'hello' cuz it starts with g?
Maybe, but how would the end be detected? Theres only 4 char pairs  (){}[]<> that auto end eachother, and only (){}[] 3 pairs of them are recognized in common texteditors.
..
Let use p[a b c] to mean curryList(infcur a b c), since p[] are 3 adjacent chars on keyboard so is fast to type.
..
..
In forest, abc.def means p[...something involving gabc and gdef except it calls to get rootMut.m.def...]
..
Could I get rid of Mut and just use Float64Array, {}, string, double, fn, and undefined directly? In Float64Array and {} can set prototype to null. but in string, double, and fn, need to know the type, or do something to make sure to generate code that returns the expected type...
..
(anything-0) is always a number.
String(anything) is always a string, or throws.
Whether something is a Float64Array or {}, with null prototype, those are both kinds of mutable map. How to check if it is? typeof, etc... are probably too slow.
I could put fn in some kind of wrapper with no prototype.
Some stuff to figure out still...
...
Consider adding a fn/lambda field to Mut, in j (field name for example), and only have lambda inside Mut when in opmut.
vm.Mut = function(n,optionalLambda){
	this.n = n&0x7fffffff;
	this.d = new Float64Array(this.n);
	this.m = {};
	this.j = optionalLambda || u;
	Object.setPrototypeOf(this.d,null);
	Object.setPrototypeOf(this.m,null);
};
That way, everything in opmut is 1 of: mut, string, number, undefined.
Could webasm optimize this better? Its got strongly typed stuff.
Theres a WebAssembly var in some browsers.



In Mut I dont need map of string to thing. I just need at most pow(2,30) symbols, and can load them from strings such as "varXYZ" might become symbol 600111234. As long as the doubles in Float64Array have index less than the other symbols its ok. I dont need string concat string. i dont need strings at all. can just put stringlike data in the Float64Array if i want to do that kind of thing.
Mut = function(sym, n, optionalLambda){
	this.sym = sym; //int
	this.n = n;
	this.d = new Float64Array(n);
	this.j = optionalLambda || u;
	this.m = {}; //map of sym to thing. thing is any of Mut, double, undefined.
	//Maybe... this.e is 1 double, like this.d[0] except in a var by itself???
	remove prototypes of this.d and this.m;
	could make Mut.prototype.toString return sym which is a double/int, so when used in {} it acts as sym.
	could have an array somewhere of [sym]->Mut.
	This seems it would fix the + optimization problem, since there are no strings.
};
Think of it like nodes that each have 2 outgoing edges, and each chooses which such edge based on a shared boolean var that if/else while for etc changes. those 2 edges often go the same place if it doesnt branch, is just the next thing to do. Each next "thing to do" is to read 3 things, and write, like []= or <>=, in recursive namespace of syms. a sym is an int (with mappings to human readable names, but the mut vm doesnt use those names often). you could have i=0; i.hello=j[abc.def[ghi<i>]] or soemthing like that.
..
getting rid of strings is the right thing to do, replace with sym int that maps 1 to 1 with a string outside the Mut system but some opcodes in mut can create more or access it etc.
..
If all doubles are at known places in mut (in .d[index] or maybe .e) then the types are known, so i dont have to deal with js problems of does + mean concat string to double or add 2 doubles or convert '45'+1 to 46, etc.
I'd still need a 2-way forest (in some branches 1-way like negate is unary or a constant is 0-way) of basically get 3 things using 3 exprs, then do a[b]=c, and each of those 3 things may be mut or double.
also what about undefined? like if you try to GET a symbol from a mut.m but its not there? or if you GET from outside the range of .d?
Since fns wont always be deduped (its lazyEval of dedup), they cant have a sym but can be a fn value inside a mut as aMut.j. Deduped fns could have a sym, but its too slow to dedup everything instantly.
..
consider this as implementation of opmut (not the fastest, but its a start)...
..
aMutFn(a_mut_or_double_or_undefined)->another_mut_or_double_or_undefined.
Example: x=>(x.d[600111234]*x.m[243435456].d[3334]), is a js lambda. 600111234 and 243435456 are the sym ints for some human readable name such as 'varXYZ' or 'i', or some may just be numbers.
Example: x=>x.d[600111234].
..
Example: x=>x.d[x.m[243435456]].
..
Can strings be used directly as syms for possibly more efficient code x.m.varXYZ ? Without concat or + on them etc, could avoid overlapping the fields of Mut like Mut.d Mut.m etc???
Problem is {} will convert int to base ten string??? Unless its an Array() which may be optimized for sparse int keys?
..
what if  Mut.toString gives a sym as string that was put in during Mut constructor?
No, toString needs to return a double if the js + optimization is to avoid unexpectedly creating strings.
So aMut.m[anotherMut] would use anotherMut.toString which would give a number.
..
Instead of allocating syms for varnames, maybe just sha256 (or faster hash) the varname to get an int in some high range 2pow30 to 2pow31minus1, and there can be collisions and thats viewed as the same var. its more of a comment on the int. if it will have a collision or not could be scanned for before running things, where it matters. or, could just view 30 bits as up to 6 chars of var name a..z0..5 such as hello or myxyk or i or j. but longer strings are probably needed for ppl to understand it. could have up to 53 bits if its a double, and in that could have up to 11 chars that are made of a-z. such as 'tostring' or 'helloworldx' or 'i' or 'j'. just viewing it as a base26 number. no collisions.
Example: x=>(x.helloworldx*x.jjii[3334]);
toString always returns a double, unless its tostring of undefined.
..
but if muts are {} and Float64Arrays (no prototype, set to null) directly, then how to protect its tostring function?
























(opmut
	(for
		(.i 0)
		(``lt .i 10)
		(`` ...i++ something write it...)
		(...body todo loop in loop, if/else in loop, a.b=c [] <> call fn on fn (at 2 .a.b varnames) and write it at another opmut varname ...)
	)
)
.a.b [] <> etc are opmut syntax, but are fns. opmut syntax is still fn forest.
?x or maybe _x is var name syntax. can use the same syntax in opLambda defining params and in funcBody to read it,
and somehow in opmut.
I dont plan to optimize opLambda, and instead will just optimize combos of opmut and the call pair forest and some of the {...}/sCurryList.


TODO (opLambda {...funcBody that uses x? z? z? x? y? ...} ?x ?y ?z u valOfX valOfY valOfZ), and start using it asap.
Get rid of vararg opLambda and opOneMoreParam, but keep varargAx and infcur.[[[
The following big quote from other file led to this one line conclusion:
	TODO Something like (opLambda (x z y) (* 2 (+ x y z))) but thats lisp syntax of a similar thing.
	... maybe (opLambda anInfcurOfVarNames) has as many more params (curriesLeft), up to 240something, as params in anInfcurOfVarNames after the infcur???
	... maybe (opLambda {...funcBody that uses x? z? z? x? y? ...} ?x ?y ?z u valOfX valOfY valOfZ). the u (or choose some other constant) marks the end of the params list. it still can only have at most 240something params. ?x is a replacement of opOneMoreParam and is instead something like (opDefineLambdaParamName 'x'), and x? is something like (opGetValueOfLambdaParamName 'x'). In {...} syntax, since theres no strange flipping of left/right order, should work as usual.
	Put a bit in headerInt mask, that tells if it has reached the u param yet, marking that it has as many params as its going to, so even if a further param is ?varNameMNOP, that will be just another param and not defining to look for varNameMNOP?.
	...and TODO make the {...} syntax and opmut etc work with that. Start using it in interpreted mode.
	Only optimize combos of opmut and s/{...}, dont need to optimize opLambda.
..
TODO verify this is done by writing a lambda that does the same as s, but using opLambda of 3 params, and make sure its readable in {...} syntax.
..	
QUOTE:
	maybe (lambdaOrVarargax funcBody uIfIsLambdaElseIsAx)
	or (lambdaOrVarargax funcBody comment)...
	both of those at param7, so all you need to do to find funcBody is check for a certain o8 then get r.
	o8 of (lambdaOrVarargax funcBody).

	what about opOneMoreParam?
	(opOneMoreParam varName aLambda) is param7? or (opOneMoreParam varName aLambda comment) so o8 is simpler? but thats wasteful.
	How to efficiently know when you've reached (opOneMoreParam varName aLambda)? o8 doesnt tell that but an o8 of (opOneMoreParam varName) does. it complicates the loop to find funcBody (in aLambda).

	Maybe should be a bit in headerInt masks that says it is the 7th param? o9 could also do that, but i prefer o8 to fit in a byte.

	(opOneMoreParam varName aLambda x) is always halted since aLambda is waiting for at least 1 more param, so (opOneMoreParam varName aLambda) is waiting for at least 2 more params.
	so could put (opOneMoreParam varName aLambda) at param 6. But would that interfere with u().curriesLeft() is 7, therefore (opOneMoreParam varName aLambda) curriesLeft would be 1 if its at param 6?

	(varargAx funcBodyAndConstraint comment) is at param 7.
	(lambda funcBody comment) is at param 7. //the vararg lambda
	(opOneMoreParam varName aLambda nextParamValueOfVarargLambda) is at param7.

	Also, since max finite curriesLeft is 254, should there be a lambda-like op that takes a byte param to take a byte that becomes curriesLeft? (lambdaByteCurriesleft cbt8 comment) has thatCbt8Of curriesLeft.
	???
	Or could just make 16 ops like in earlier versions of wikibinator, that take 1-16 params.
	The vararg lambda is the main way funcs will be made but might be less efficient in some cases.

	Evaler should be copied, not just from l().evaler but from the aLambda in (opOneMoreParam varName aLambda).

	How to cache the varnames/values in (opOneMoreParam varName) if it gets big?

	Could make an evaler (aLambda ?a ?b ?c) pushEvaler of it, as that takes 3 more params (or is it 4?).
	No problem optimizing that, but (aLambda ?a ?b valOfA valOfB ?c) is harder to optimize.
	Similarly (aLambda ?a valOfA ?b valOfB ?c).
	The ?a ?b ?c are each a (opOneMoreParam somethingLike_"a" aLambda)...
	(opOneMoreParam "c" (opOneMoreParam "b" (opOneMoreParam "a" aLambda) valOfA valOfB)) is a func waiting for val of c and calls funcBody on (lazyeval_or_pair (opOneMoreParam "c" (opOneMoreParam "a" (opOneMoreParam "b" aLambda) valOfA valOfB)) c).
	But its displayed as (aLambda ?a ?b valOfA valOfB ?c).
	..
	FIXME what about {...} syntax of that? How do the 2 syntaxes (of vararg lambdas and sCurryLists) mix?

	(opOneMoreParam "c") should be displayed as ?c.
	(?c (?b (?a aLambda) valOfA valOfB) valOfC)
	If write it that way, {...} syntax is straightforward...
	({,?c {{,?b {,?a getALambda}} getValOfA ,literalValOfB} getValOfC} thing)
	//might have got {{{{}}{{}}... mixed up.
	But its longer than
	(aLambda ?a ?b valOfA valOfB ?c valOfC)

	({,?c {{,?b {,?a getALambda}} gvalOfA gvalOfB} gvalOfC} thing)
	(aLambda ?a ?b lvalOfA lvalOfB ?c lvalOfC)


	This isnt seeming to fit together into an intuitive syntax. It will work technically, but being intuitive is for sure needed for this system to be useful. Simplify...

	What if every lambda has 3 childs instead of 2, and 1 of those childs is the curriesLeft byte? Or linkedlist-like way (more similar to opOneMoreParam)? There would need to be a syntax for it.
	Maybe the char ` (or use ? maybe) means add 1 more param.
	```(aLambda funcBody) means wait for 3 more params, so (```(aLambda funcBody) a b) is halted and (```(aLambda funcBody) a b c) evals. ???
	But I want to write it with ` after the params, so (aLambda funcBody ` ` ` a b) is halted, and  (aLambda funcBody ` ` ` a b c) evals. Similar to (aLambda funcBody ` ` a ` b) is halted and (aLambda funcBody ` ` a ` b c) evals.
	So (aLambda `) means basically (opOneMoreParam aLambda).
	Except, (opOneMoreParam aLambda) wouldnt be halted. It would return a form of aLambda that has curriesLeft 1 higher (and if curriesLeft reaches 255 then its infcur (never evals, stays 255).
	opOneMoreParam and opOneLessParam would both take 1 param and return such a variant of a lambda.
	At each point in the "param list", it can add a param, so it has to remember where it was added. But if it ever gets down to 0 params, it has to eval right then.
	That would maybe need a minCurriesLeft to be stored in headerInt, along with curriesLeft, since for example s takes 3 params but what does it mean if (s a b) is supposed to eval? (opOneLessParam s) would return (s`). Maybe it should ONLY work for the lambda op.
	Also, if you want var names like ?a ?b ?varXYZ to wait for param and a? and b? and ?varXYZ to read param value.... If want that, then would have to use 2 ` and the extra ` is for param name.


	The number of ` displayed (or display as ????) is curriesLeft-minCurriesLeft, or something like that.

	(lambda funcBody) at param 7, has curriesLeft of 1.
	(lambda funcBody ???) at param 7, has curriesLeft of 4. (would prefer it be the same number of ?s but dont know how).
	(lambda varargPlusFuncBody ?? 10 10 5)->25
	(lambda varargPlusFuncBody ? 10 ? 10 5)->25
	(lambda varargPlusFuncBody 12)->12

	(lambda varargPlusFuncBody ?) is a variant of (lambda varargPlusFuncBody).

	opOneLessParam maybe should not be able to reduce curriesLeft below 1 aka should not bea ble to cause an eval.
	opOneMoreParam and opOneLessParam should only work on op lambda. Maybe it should infloop if called on anything else and if try to set curriesLeft to less than 1 or more than 254.

	rename lambda to opLambda, and call lambdas in general fns (functions). fn opLambda.

	? is not a fn. Its a syntax that describes curriesLeft, that can be incremented and decremented by opOneMoreParam and opOneLessParam.



	Maybe vararg, other than in varargAx, costs more than its worth. But I still need a way to make a syntax work where ?abc means waiting on the abc? param to read its value, in an opLambda, while in {...} since most code is in {...} cuz its the simplest way to pass params in turingComplete ways. Also (...)#nameXYZ or {...}#nameXYZ means the localName of that fn/constant is nameXYZ. It has no effect on ids since its not part of the callpair forest.
	({,opLambda {,* ,2 {,varargPlus x? y? z?}}#theFuncBody) ?x ?z ?y 10 30 2)->84 ??? The order of ?x ?y ?z vs ?x ?z ?y is allowed to differ. You can even use x? multiple times such as {,* x? x?}.
	I want the syntax to look something like that, but it seems to need the text to often swap direction of reading "left to right" vs "right to left" and use combos of both of those in the same code string.

	In lisp it would just be written as something like (opLambda (x z y) (* 2 (+ x y z))).

	But I want the ability to put the param definition (?x) in the param list like (something... ?x valOfX ?y valOfY ?z valOfZ)
	or also works as (something... ?x ?y valOfX valOfY ?z valOfZ).

	I dont want to go back to naming params just by their index in the lambda, cuz its confusing to read that code.


	Get rid of vararg opLambda and just define the var names within a constant number of lambda params. and have 240something max params of a lambda. If you want vararg use varargAx, but make sure it returns something other than a partial call of varargAx if you want others across network to accept such a return value since otherwise it might cost them infinite time and memory to disprove a false claim.
	Something like (opLambda (x z y) (* 2 (+ x y z))) but thats lisp syntax of a similar thing.
	..
	Also, I'm not planning to do much optimizing of opLambda, just let it run in interpreted mode, and mostly what will get optimized is opmut and lines of code inside it are small trees of s, and the [] []= <> <>= etc.
	..
	TODO write it with {...}

	({,opLambda {,* ,2 {,varargPlus x? y? z?}}#theFuncBody) ?x ?z ?y 10 30 2)->84 ???
	No, thats still vararg. Move the ?x ?z ?y etc to right after opLambda...

	({,opLambda ,{... use x? y? and z? in here...}#funcBody ,'x' ,'y' ,'z' ,u 10 {,+ get15 ,25} 2} thing)

	or could put all the var names as a string but likely would be slower...
	({,opLambda ,{... use x? y? and z? in here...}#funcBody 'x y z' 10 {,+ get15 ,25} 2} thing)
]]]



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
	
	//this.?? = null; //lambda (output of lambdize of Node) or null. or should lambda be value in Mut.m?
	
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
?? __lookupGetter__() { [native code] }
..
Object.getPrototypeOf({})
{constructor: ??, __defineGetter__: ??, __defineSetter__: ??, hasOwnProperty: ??, __lookupGetter__: ??,?????}constructor: ?? Object()hasOwnProperty: ?? hasOwnProperty()isPrototypeOf: ?? isPrototypeOf()propertyIsEnumerable: ?? propertyIsEnumerable()toLocaleString: ?? toLocaleString()toString: ?? toString()valueOf: ?? valueOf()__defineGetter__: ?? __defineGetter__()__defineSetter__: ?? __defineSetter__()__lookupGetter__: ?? __lookupGetter__()__lookupSetter__: ?? __lookupSetter__()__proto__: (...)get __proto__: ?? __proto__()set __proto__: ?? __proto__()
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
?? toString() { [native code] }
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
?? isPrototypeOf() { [native code] }
x.prototype
undefined
for(let i in x) console.log(i)
undefined
x = Float32Array.of(3,4,5)
Float32Array(3)??[3, 4, 5, buffer: ArrayBuffer(12), byteLength: 12, byteOffset: 0, length: 3, Symbol(Symbol.toStringTag): 'Float32Array']
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
Float32Array(3)??[3, 4, 5]
x
Float32Array(3)??[3, 4, 5]
x.buffer
undefined
x.abc = 'def';
'def'
x
Float32Array(3)??[3, 4, 5, abc: 'def']
x.buffer
undefined
x.length
undefined
x
Float32Array(3)??[3, 4, 5, abc: 'def']0: 31: 42: 5abc: "def"[[Prototype]]: Objectconstructor: ?? Object()hasOwnProperty: ?? hasOwnProperty()isPrototypeOf: ?? isPrototypeOf()propertyIsEnumerable: ?? propertyIsEnumerable()toLocaleString: ?? toLocaleString()toString: ?? toString()valueOf: ?? valueOf()__defineGetter__: ?? __defineGetter__()__defineSetter__: ?? __defineSetter__()__lookupGetter__: ?? __lookupGetter__()__lookupSetter__: ?? __lookupSetter__()__proto__: (...)get __proto__: ?? __proto__()set __proto__: ?? __proto__()
x.valueOf('abc')
Float32Array(3)??[3, 4, 5, abc: 'def']
x.valueOf
?? valueOf() { [native code] }
Object.setPrototypeOf(x, undefined)
VM1210:1 Uncaught TypeError: Object prototype may only be an Object or null: undefined
    at Function.setPrototypeOf (<anonymous>)
    at <anonymous>:1:8
(anonymous) @ VM1210:1
Object.setPrototypeOf(x, null)
Float32Array(3)??[3, 4, 5, abc: 'def']
x.valueOf
undefined
x.valueOf = 'abc'
'abc'
x
Float32Array(3)??[3, 4, 5, abc: 'def', valueOf: 'abc']
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
Float64Array(33)??[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
z.hello = 'world';
'world'
z.me = z;
Float64Array(33)??[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, hello: 'world', me: Float64Array(33)]0: 01: 02: 03: 04: 05: 06: 07: 08: 09: 010: 011: 012: 013: 014: 015: 016: 017: 018: 019: 020: 021: 022: 023: 024: 025: 026: 027: 028: 029: 030: 031: 032: 0hello: "world"me: Float64Array(33)??[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, hello: 'world', me: Float64Array(33), test: 'atest']test: "atest"
z
Float64Array(33)??[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, hello: 'world', me: Float64Array(33)]
z.me.me.me.test = 'atest';
'atest'
z
Float64Array(33)??[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, hello: 'world', me: Float64Array(33), test: 'atest']
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
??eDY8pvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj??eaaaavwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj??ebbbbvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj (a made up id)
where ??e is evil/notNecessarilyGood lambda and ??g is good lambda,
AND make lambdize/Node toString return
 '??eDY8pvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj??eaaaavwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj??ebbbbvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj' etc.
 That way, anyone who has all the toString outputs of the relevant lambdas has all those lambdas without having to try all pairs of them to
 know which is the left/right child of which other, and it needs no database etc, can exist entirely in sentences written online. You can
 still write ??eDY8pvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj by itself which implies whatever its left and right childs are, that hash
 (512 bits to 256 bits) to that.
TODO choose 3*(16+8) int32s as extra constants for doing 3 sha256_without_padding of 512 bits, to add the ints to the input and add the
 ints to the output,
and get 3 such (preprocessed and postprocessed) sha256 outputs of the same pair of id256, and minorityBit ~(a&b)^(b&c)^(c&a) them
 together to get a more secure hash, then take the last 192 bits of it, and prefix that with header64 as the id256 of any 2 id256s
 as its left and right childs.
TODO make musical instruments stored only like a bunch of
??eDY8pvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj??eaaaavwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj??ebbbbvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj
but as ??g... the good form since if I make the instruments myself out of only things I've made (nobody having given me lambdas to use)
then I know theres no evil in it (evilbit) but just change ??g to ??e later if combining it with things you cant easily verify are good.
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
??import //(??import anIdMaker id) -> x where (anIdMaker x)->id, and id may be a cbt256 or concat of 3 of those, and may be some text form such as base64 but if so then idMaker returns such a string as id, and idMaker contains the binary idMaker as one of its params to transform to string. This is similar to solveRecog (and solveFloat64) except its easier to optimize and is expected to look wherever lambdas may be stored such as in browser cache, harddrive, a website, or wherever vm.??import is hooked in to look. Or, it might load a lazyEval of the lambda like a stub that looks for it if you look deeper into it.
stackIsAllowstackTimestackMem //the 2x2 kinds of clean/dirty/etc. exists only on stack. only with both isClean and isAllowSinTanhSqrtRoundoffEtc at once, is it deterministic. todo reverse order aka call it !isDirty instead of isClean?
stackIsAllowNondetRoundoff //isAllowSinTanhSqrtRoundoffEtc //the 2x2 kinds of clean/dirty/etc. exists only on stack. only with both isClean and isAllowSinTanhSqrtRoundoffEtc at once, is it deterministic. todo reverse order?
stackIsAllowMutableWrapperLambda
stackIsAllowAx (fixme, is it varargAxCall or just axa (and maybe axb?))
varargAxCall //(varargAxCall constraint ...params...) ... (varargAxCall constraint a) is halted if (constraint [(varargAxCall constraint ...paramsExceptLast...) lastParamSoFar])->u, and evals to v if that -> (u v), so varargAxCall chooses at each next param that it has enough params or not (vararg) and if not then what the return val is. These ax (axiom-like) constraints are a turing-complete-type-system that could for example make a list that can only contain prime numbers, or a tree that can only have a certain type of nodes in it. It takes finite time to compute, just normal forward computing, but cuz of haltingProblem, it takes on average infinity time and memory to verify, so theres a containsAxConstraint bit in header int and a stackIsAllowAx bit on stack thats also in that header int for nonhalted calls/nodes. varargAxCall tightens cleanvsdirty (higher on stack) to be deterministic (ax is deterministic, but so is not allowing ax), so you cant for example have an ax constraint about nondeterministic roundoff or about mutableWrapperLambda.
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

/*
//voxel32 -> int32 with red as lowest 4 bits.
{,& (>> 8) ,15}##VoxRed4

//voxel32 -> int32 with green as lowest 4 bits.
{,& (>> 4) ,15}##VoxGreen4

//voxel32 -> int32 with blue as lowest 4 bits.
(& 15)##VoxBlue4

/*
//FIXME this is too general, cant name it VoxRGB12 cuz others will use it for other things.
//could put a comment param in Lambda op, but makes it harder to optimize.
//(& 4095)#VoxRGB12
OpCommentedFuncOfOneParam#Cf //This would be easier to optimize.
(Cf voxRGB12 (& 4095))#VoxRGB12 //name would default to the first param of OpCommentedFuncOfOneParam, except first char of it made capital, if name is not given, though there can be duplicates.
Could abbrev it this way: (& 4095)##VoxRGB12
*
(& 4095)##VoxRGB12

//voxel32 -> int32 with x as lowest 10 bits.
{,& (>> 12) ,1023}##VoxX10

//voxel32 -> int32 with y as lowest 10 bits.
{,& (>> 22) ,1023}##VoxY10

//voxel32 -> int32 with yx as lowest 20 bits.
{,& (>> 12) ,1048575}##VoxYX20
*
OpCommentedFuncOfOneParam

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


const Wikibinator203 = (()=>{
	
	let vm = new function(){};
		
	vm.ops = {}; //map of opName to lambda
	vm.opAbbrevs = {}; //similar to vm.ops except its , instead of T, and _ instead of Seq
	let ops = vm.ops; //Example: ops.S(ops.T)(ops.T)
	let opAbbrevs = vm.opAbbrevs;

	//vm.ops.Bit0 and vm.ops.Bit1 are at 7 params. Max cbt size happens at 254 params, since 255 means unlimited params like in vm.ops.Infcur.
	//7+vm.log2OfMaxBits==254. Cbt size ranges 1 to 2 pow 247 bits.
	//Bitstring size ranges 0 to (2 pow 247)-1 bits cuz the last 1 bit (then 0s until next powOf2 size) is padding.
	//Normally only 31 bits of bitstring size is stored in a 256 bit id (maybe more in a 512 bit id),
	//but thats just a cache of the bitstring size (if it is a bitstring), and either way it can have bigger bitstrings than that.
	//2 pow 31 bits is 256mB. 2 pow 247 bits is enough to store every particle's position in a galaxy.
	//It can be used sparsely. If you need more storage or sparse size, you can use [...] or other data structures containing many bitstrings.
	vm.log2OfMaxBits = 247;
	vm.maxBits = 2**vm.log2OfMaxBits;
	if(Math.log2(vm.maxBits) != vm.log2OfMaxBits) throw 'Theres roundoff in the max bits per cbt, stored in a double.';

	//with(ops){ //so vm can call its own ops by name, such as (Pair, L, R, S) to implement other ops
		
		vm.lastIdA = -1; //high 32 bits
		vm.lastIdB = -1; //low 32 bits
		//first lambda is u/theUniversalFunc and has idA and idB of 0.
		//
		//FIXME TODO ids of fns that are not doubles or literals that fit in 1 2 4 8 16 or 32 bits,
		//should have idA whose first 13 bits are 1 (a subrange of nonnormed negative infinities as double),
		//and all normed doubles are themself as idA_idB. So change "first lambda is u/theUniversalFunc and has idA and idB of 0".
		
		
		vm.incIdAB = function(){
			this.lastIdB = (this.lastIdB+1)|0; //wrap int32
			if(!this.lastIdB) this.lastIdA++; //carry
		};
		
		//WARNING: opNames are not part of the wikibinator203 spec and may vary across different VMs
		//or change in later versions of the same VM.
		//You should instead get them like u(u)(u)(u)(u)(u)(u)(u)(u) is identityFunc,
		//but since I'm still building this first VM, many of those opcodes 128 to 255) arent known yet,
		//and I'm using this vm.op function to make sure vm.ops.someOpName exists before using it.
		//TODO optimize, once the ops are final (or at least the first n of them that the VM uses to implement other ops),
		//optimize by just using those ops directly (let identityFunc = u(u)(u)(u)(u)(u)(u)(u)(u); in VM code,
		//and use that identityFunc again multiple times.
		//vm.op = function(opName){
		//	return vm.ops[opName] || (throw 'No opName='+opName);
		//};
		let OP = opName=>{
			let ret = vm.ops[opName];
			if(ret) return ret;
			throw 'No opName='+opName;
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
		

		/*implement op (getLocalId128 x) gives the 4 ints (in js) x().idA x().idB x().blobFrom and x().blobTo.
		blobFrom and blobTo are both 0 in any node thats not a cbt so you only need half the id then.
		Use it in a treemap (Lambda [...] ...) of #SomeName to fn, for use as a code editor.
		Strings that fit in an id256 dont need to be hashed (which is slow, .0001 to .0000001 per second per hash id).
		Using an idmaker that uses literalinid (or (typeval "text/plain;charset=utf8" TheBits)) or hashidofanyfn,
		together as just whatever (AnIdMaker SomeFn) returns, could view code being made and deleted,
		much faster without having to hash it, but can only be
		run in vm.stackAllow* mode, some dirty mode (not purely deterministic)
		depending on salt of course for nondeterministic recursion and caching.
		The localid of a fn may differ from other times that fn is observed,
		but for the same localid in the same VM run (til wikibinator203 VM is restarted),
		there is at most 1 val, so [localid128 many-to-1 dedupedFn (within same run of VM)].
		For each localid128 there is at most 1 dedupedFn, until restart VM then those may change.
		Each VM running simultaneously can be running a different "VM run",
		so the nondeterministic localid128s should be limited to when vm.mask_stackAllowReadLocalIds (now 1 of 5 kinds of clean/dirty).
		*/
		vm.mask_stackAllowReadLocalIds = 1<<4;
		//vm.mask_reservedForFutureExpansion4 = 1<<4;
		
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
		//TODO? should it have containsBit1 for bize and sparse matrix optimization? would have to scan blobs before wrapping them, log number of scans each.
		
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
		//NEVERMIND ABOUT COULDNT MAKE THIS PART CONSISTENT[[[ UPDATE: I'm adding another bit on the stack to limit the use of the import op to "any lambda" vs "only good lambdas": vm.mask_stackIsAllowImportEvilIds. ]]]
		vm.evilBit = true;
		
		
		
		
		
		
		
		
		
		
		
		
		vm.utf8TextEncoder = new TextEncoder('utf-8');
	
		vm.utf8TextDecoder = new TextDecoder('utf-8');
		
		vm.stringToUtf8AsUint8Array = function(s){
			//log('unicode.utf8TextEncoder='+unicode.utf8TextEncoder+' '+mapToString(unicode.utf8TextEncoder));
			//log('param of encode: '+s);
			var u = vm.utf8TextEncoder.encode(s);
			//var t = typeof u;
			//if(t != 'Uint8Array') throw 'Expected TextEncoder.encode(string) to return Uint8Array but got a '+t+': '+u+': '+mapToString(u);
			return u;
		};
	
		vm.utf8AsUint8ArrayToString = function(bytes){
			return vm.utf8TextDecoder.decode(bytes);
		};
		
		//from and to are byte ranges
		vm.utf8AsUint8ArrayRangeToString = function(bytes, from, to){
			return vm.utf8AsUint8ArrayToString(bytes.subarray(this.blobFrom, this.blobTo));
		};
	
		
		
		vm.overlappingBufferInts = new Int32Array(2);
		vm.overlappingBufferDouble = new Float64Array(vm.overlappingBufferInts.buffer);
		//FIXME do they overlap as bigEndian or littleEndian, and is it per int or per byte or what? Make it consistent across all systems,
		//and I would prefer bigEndian unless most or all systems already do littleEndian in browser.
		
		//is it a wikibinator203 lambda (which is also a javascript lambda, in this VM, but may be implemented other ways in other wikibinator203 VM's)?
		vm.isLambda = function(thing){
			return thing.isWikibinator203Lambda && typeof(thing)=='function';
		};
		
		//1 (or a few?) types dont need a typeval, such as maybe 64 bits by itself would be displayed as a double/float64? Or should it be 0xffff343f24352211? what about 32 bits? would that display as an int? or float?
		vm.wrapInTypeval = function(thing){
			if(vm.isLambda(thing)) return thing;
			let ty = typeof(thing);
			if(ty === 'string'){
				//(Typeval U Utf8Bytes) is the first typeval, used to display strings that can be used as types in other typevals
				//such as (Typeval (Typeval U Utf8Bytes) SomeBytes) aka (Typeval "doubleAsCbt" SomeBytes),
				//so (Typeval "double") would be the prefix of a cbt64 of double/float64 bits. If as bitstring instead of cbt, it needs padding (1 000000....).
				console.log('Wrapping string of '+thing.length+' chars');
				//TODO cache ops.Typeval(U) and other common typevals instead of rebuilding it here (funcallcaching is slower than getting it from vm.something).
				return vm.ops.Typeval(U)(vm.wrapUtf8Raw(thing));
			}else{
				throw 'TODO use (ops.Typeval contentType thing)';
			}
		};
		
		vm.wrapUtf8Raw = function(string){
			let ty = typeof(string);
			if(ty == 'string'){
				let bytes = vm.stringToUtf8AsUint8Array(string);
				
				//adds at least 1 byte, then up to next powOf2.
				//TODO optimize using prototype and something like vm.expandBytesToPowOf2 if can ever get that to work,
				//but for now just copy it to a new byte array if need to expand it.
				bytes = vm.padBytes(bytes);
				
				//let bytes = vm.utf8AsUint8ArrayToString(string);
				return vm.CbtOfBytes(bytes);
			}else{
				throw 'TODO';
			}
			//throw 'FIXME if it fits in an id256 then need perfect dedup of var names, but not necessarily of every such node. maybe just preallocate every node up to cbt16 and make callpairs? but not every small cbt needs dedup (leave it to be lazy deduped later if ever). double/float64 will go in node.idA and node.idB (32 bits each). so in that way could perfect dedup everything up to 32 bits. Maybe could put some of the data in node.blobFrom and node.blobTo (32 bits each) but only if make sure not to use them as blob indexs if so, maybe by leaving blob as null? Id maybe like to use all 128 bits of node localId (idA idB blobFrom blobTo) to store up to 128 bits of literal data, but would need an extra bit to say if it is doing that or not, so at least 129 bits and that makes it not fit in some places. I could expand localIds to 256 bits but it would be slower. The main problem is, its far too slow to dedup all small blobs (cuz for example theyre used to copy between CPU and GPU) but cbts used as var names (like in (Lambda [varXYZ abc defg] ...) and in the code which reads their values in a Mut) must be deduped. I could add a Dedup op and have those automatically call it, or maybe just use Equals op? Or maybe just in the first param of Typeval auto dedup?';
			//stringToUtf8AsUint8Array
			//throw 'FIXME verify this does utf8 instead of utf16'
		};
		
		vm.wrapRaw = function(thing){
			if(vm.isLambda(thing)) return thing;
			switch(typeof(thing)){
			case 'number':
				throw 'TODO, since changed to Uint8Array, instead of Int32Array, as node.blob, these numbers are wrong';
				/*
				//FIXME prefix it with (typeval 'application/x-ieee754-double'). No, do that in wrapInTypeval.
				vm.overlappingBufferDouble[0] = thing;
				let ints = Int32Array.of(vm.overlappingBufferInts[0], vm.overlappingBufferInts[1]); //FIXME bigendian vs littleendian and of ints vs bytes??
				let node = new vm.Node(this, null, null, ints, 0, 2);
				console.log('FIXME put in dedup map'); //FIXME FIXME FIXME!!!!
				return vm.lambdize(node);
				*/
			break; case 'string':
				return vm.wrapUtf8Raw(thing);
				//throw 'TODO prefix it with (typeval "text/plain;charset=utf-8") ?';
			break;default:
				throw 'TODO';
			}
		};
		
		//must be either vm.wrapRaw or vm.wrapInTypeval.
		//TODO choose which is default, aka which happens when you call a fn on a non-fn
		//such as U(3.45)('hello')
		vm.wrap = vm.wrapInTypeval;
		

		//the datastruct of forest of lambdas, each with 2 childs (Node.l and Node.r, which are the lambdize wrappers of Node) where all paths lead to the universal lambda.
		//lambdize means to wrap a Node in a lambda. Node is the internal workings of a lambda.
		//
		vm.Node = function(vm,l,r,optionalBlob,optionalBlobFrom,optionalBlobTo){ //TODO rename these params to myL and myR cuz l and r are opcode names. its ok to keep this.l and this.r.
			
			//TODO "header64: 6+2+8+16+1+31", see comment about it.
			
			this.l = l;
			this.r = r;
			this.cacheFuncBody = null;
			
			let isLeaf = r==null;
			
			
			//allow isEvaling as a datastruct, but in this implementation of wikibinator203 that wont happen since
			//evalers take 3 params: vm func param, instead of making a node of func and param together.
			//In case other implementations want to have nodes that are evaling (maybe to display them on screen as a directedgraph
			//with green arrow pointing at left child, blue arrow pointing at right child, and red arrow pointing at what it evals to (itself if is halted, or another lambda,
			//or to (s i i (s i i)) if its known that it doesnt halt, for example.
			//if(isEvaling) throw 'Dont eval here, use aLambda().getEvaler() aka aNode.getEvaler()';
			
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
					/*opOneMoreParam has been removed, and will use Lambda [...up to around 250 var names...] instead
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
							//UPDATE: theres no opOneMoreParam, and use Lambda or MutLam for vararg (up to around 250 params) instead.
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
					}*/
					curriesLeft = vm.opInfo[op].curriesLeft;

					if(vm.o8IsOfCbt(op)){
						//is Bit0 or Bit1
						upTo8BitsOfMasks |= vm.mask_isCbt;
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

					if(lNode.isCbt() && rNode.isCbt() && (lcur==rNode.curriesLeft())){
						//is a complete binary tree of Bit0 andOr Bit1
						upTo8BitsOfMasks |= vm.mask_isCbt;
					}
					//Its not the max cbt size yet, cuz !isEvaling.
					/*
					That design choice is, not every call of Bit0 or Bit1 is a cbt.
					DONE: choose if cbt called on cbt of different size (much smaller than max cbt size) should infloop
					to prevent [o8 being Bit0 or Bit1] from happening in a non-cbt,
					BUT maybe its ok for that to happen since the mask_isCbt bit will still know if its cbt.
					Since curriesLeft is used to store cbt height (with a little math, not directly),
					then its not allowed to eval before curriesLeft is 1 and its called on 1 more param.
					*/
				}

			}
			//DONE but todo test: set curriesLeft and o8 and make header from it. the above code doesnt always set those. header also contains 6+2 bits for literal cbt256.
			
			
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
			this.idA = vm.lastIdA|0; //|0 might make it easier for javascript JIT compiler to know its an int, even though vm.lastIdA always will be unless you make more than 2 pow 64 ids (or is it, more than 2 pow 53 or 2 pow 48, cuz some of that range is double values and i want an idA concat idB to contain every possible double.
			this.idB = vm.lastIdB|0;
			this.blobFrom = optionalBlobFrom | 0; //int, a byte index in this.blob (inclusive).
			this.blobTo = optionalBlobTo | 0; //int, a byte index in this.blob (exclusive).
			
			
			//UPDATE: this will be a Uint8Array. You can still use it as a Float32Array, Float64Array, Int32Array, etc, like new Float32Array(this.blob.buffer)
			//OLD: this.blob = TODO null or Int32Array.
			//The id of the blob is this.idA with this.idB. Every node with that id64 has the same blob and may differ in blobFrom and blobTo.
			this.blob = optionalBlob; //TODO null or Int32Array.
			
			//this.idString;
			
			//u/theUniversalFunction's evaler is vm.rootEvaler, but everything else copies its evaler from its l child, which may be optimized evalers added later.
			//
			//quote from farther below...
			//
			/*//This optimization makes it fast enough to use l(lambda) and r(lambda) instead of lambda().l and lambda().r.
			//dont FuncallCache things that instantly return and cant make an infinite loop.
			l().pushEvaler((vm,func,param)=>(param().l));
			r().pushEvaler((vm,func,param)=>(param().r));
			vm.identityFunc().pushEvaler((vm,func,param)=>param);
			//TODO change to someFunc.n.stuff, instead of someFunc().stuff .
			//vm.identityFunc().pushEvaler((vm,func,param)=>{ console.log('optimizedIdentityFunc'); return param; });
			//TODO pushEvaler for isleaf etc
			*/
			this.evaler = l ? l().evaler : vm.rootEvaler;
			
			//this.prototype.prototype = vm;

		};
		
		//does it, anywhere inside it, contain a Bit1 (even if its not a cbt, such as if its a linkedlist that contains cbts etc)?
		//In wikibinator203, a bitstring is a cbt that contains any Bit1, and its all the bits before the last Bit1. If its all Bit0, not a bitstring.
		vm.Node.prototype.containsBit1 = function(){
			if(this.cache_containsBit1 !== undefined){
				return this.cache_containsBit1;
			}else if(this.r){ //may have blob or not
				//End recursion at Bit1 or Bit0 (where cbtHeight is 0, or if it starts with less params (of U, ops are at param 7) then not contain Bit1.
				
				if(this.hasMoreThan7Params()){
					return this.cache_containsBit1 = (this.l.n.containsBit1() || this.r.n.containsBit1()); //recurse into childs
				}else if(this.hasLessThan7Params()){
					return this.cache_containsBit1 = false;
				}else{
					return this.cache_containsBit1 = (this.lam==vm.ops.Bit1);
				}
				/*
				let h = this.cbtHeight();
				if(h > 0) return this.cache_containsBit1 = (this.l.n.containsBit1() || this.r.n.containsBit1()); //recurse into childs
				if(h < 0 || this.lam==vm.ops.Bit0) return this.cache_containsBit1 = false; //is Bit0 or too few params of U to be a bit.
				return this.cache_containsBit1 = this.lam==vm.ops.Bit1;
				//return this.cache_containsBit1 = ((this.lam==vm.ops.Bit1) || (this.cbtHeight()>=0 && this.l.n.containsBit1() && this.r.n.containsBit1()));
				*/
			}else{ //lacking childs means has blob (though might redesign that to allow sparse loading of parent across network before childs)
				//TODO optimize by reusing the blob loop in node.Bize and node.containsBit1.
				for(let i=this.blobFrom; i<this.blobTo; i++){
					if(this.blob[i]) return this.cache_containsBit1 = true;
				}
				return this.cache_containsBit1 = false;
			}
		};
		
		//returns a Uint8Array that is backed by this.blob if it exists (dont modify, cuz immutable)
		//or is a copy of the data if its stored as call pairs (that may contain smaller blobs or go all the way down to Bit0 and Bit1.
		//If theres a fraction of a byte at the end, does not include it. Does not include padding. If its not a cbt, returns empty Uint8Array.
		//blobFrom and blobTo must always be powOf2 aligned, so no need to check if it starts in the middle of a byte.
		vm.Node.prototype.bytes = function(){
			//TODO cache this, similar to cache_containsBit1 but it would be cache_bytes? Might make it harder to garbcol.
			let byteLen = this.Bize()>>3;
			if(this.blob){
				return this.blob.subarray(this.blobFrom, this.blobTo);
			}else{
				let ret = new Uint8Array(byteLen);
				for(let i=0; i<byteLen; i++){
					ret[i] = this.byteAt(i);
				}
				return ret;
			}
		};
		
		//updates this.bize if its -2. -2 means has not computed it yet. -1 means is not a cbt. 0 means is either all 0s or is a 1 then 0s,
		//since a bitstring is padded by a 1 then 0s until a powOf2 size.
		//low 31 bits of bize (bitstring size), aka the index of the last 1 bit if its a cbt.
		vm.Node.prototype.Bize = function(){
			if(this.bize == -2){
				if(this.isCbt()){
					//is cbt so set bize to index of first Bit1 (0 to this.cbtSize()-1) or 0 if this is all Bit0.
					//Since it is cbt, both childs have same cbtSize (half of mine), unless cbtSize is 1.
					let h = this.cbtHeight();
					if(h == 0){
						this.bize = 0; //this is Bit1 or Bit0.
					}else if(h < 32){ //fits in the low 31 bits of this.bize.
						if(this.r){ //may have blob or not
							if(this.r.n.containsBit1()){ //add l cbtSize to r bize cuz the last Bit1 exists and is in r
								let rHeight = h-1;
								this.bize = (2**rHeight)+this.r.n.Bize();
							}else{ //use l bize cuz the last Bit1 (if any) is in l
								this.bize = this.l.n.Bize();
							}
						}else{ //lacking childs means has blob (though might redesign that to allow sparse loading of parent across network before childs)
							//TODO optimize by reusing the blob loop in node.Bize and node.containsBit1.
							for(let i=this.blobTo-1; i>=this.blobFrom; i--){
								if(this.blob[i]){
									//0..32 zeros if it was int. 24..32 zeros since its a byte. But actually 24..31 zeros since its not byte 0.
									let leadingZeros = Math.clz32(this.blob[i]);
									this.bize = (i<<3)|(leadingZeros-24); //i bytes then 0-7 bits before the last Bit1.
								}
							}
							this.bize = 0; //no Bit1 in this.blob. Bize of 0 also would happen (in some other code) if the first bit is 1 and all other bits are 0.
						}
					}else{ //between cbt2**32 and cbt2**247
						throw 'fixmefixme';
					}
				}else{ //node.bize of -1 means not cbt
					this.bize = -1;
				}
			}
			return this.bize;
		};
		
		//returns 0 (vm.ops.Bit0 or any non-cbt or is outside this cbt range) or 1 (vm.ops.Bit1).
		//This is very slow compared to using Node.blob, .blobFrom, and .blobTo directly.
		vm.Node.prototype.bitAt = function(bitIndex){
			if(this.blob){ //a Uint8Array.
				let byteIndex = bitIndex>>3;
				if(byteIndex < this.blobFrom || this.blobTo <= byteIndex) return 0; //outside cbt range
				let byt = this.blob[this.blobFrom+byteIndex];
				return (byt>>(7-bitIndex))&1;
			}else{
				if(!this.isCbt()) return 0;
				let siz = this.cbtSize(); //is a powOf2
				if(bitIndex < 0 || siz <= bitIndex) return 0; //outside cbt range
				if(siz == 1) return (this == vm.ops.Bit1) ? 1 : 0; //is Bit0 or Bit1
				if(bitIndex < siz/2){
					return this.l.bitAt(bitIndex);
				}else{
					return this.r.bitAt(bitIndex-siz/2);
				}
			}
		};
		
		//If this is not a cbt, returns 0. Else recurses into childs to find the cbt8 at that byteIndex (such as 5 is bitIndexs 40 to 47).
		//If goes past the borders of the cbt, returns 0.
		vm.Node.prototype.byteAt = function(byteIndex){
			if(this.blob){ //a Uint8Array.
				if(byteIndex < this.blobFrom || this.blobTo <= byteIndex) return 0; //outside cbt range
				return this.blob[this.blobFrom+byteIndex];
			}else{
				if(!this.isCbt()) return 0;
				let siz = this.cbtSize(); //is a powOf2
				if(siz < 8){
					throw 'TODO fill with 0s where its outside range. part might be inside range.';
				}else{
					if(byteIndex < 0 || siz/8 <= byteIndex) return 0; //outside cbt range
					if(siz == 8){
						let one = vm.ops.Bit1;
						//this.l()==this.n. TODO switch to .n everywhere for efficiency.
						return(
							 ((this.l.n.l.n.l==one)?128:0)
							|((this.l.n.l.n.r==one)?64:0)
							|((this.l.n.r.n.l==one)?32:0)
							|((this.l.n.r.n.r==one)?16:0)
							|((this.r.n.l.n.l==one)?8:0)
							|((this.r.n.l.n.r==one)?4:0)
							|((this.r.n.r.n.l==one)?2:0)
							|((this.r.n.r.n.r==one)?1:0)
						);
					}else{
						if(byteIndex*8 < siz/2){
							return this.l.n.byteAt(byteIndex);
						}else{
							return this.r.n.byteAt(byteIndex-siz/16); //siz/8 is size in bytes. half that.
						}
					}
				}
			}
		};
		
		vm.Node.prototype.intAt = function(intIndex){
			return (this.byteAt(intIndex*4)<<24)|(this.byteAt(intIndex*4+1)<<16)|(this.byteAt(intIndex*4+2)<<8)|this.byteAt(intIndex*4+3);
		};
		
		vm.Node.prototype.doubleAt = function(doubleIndex){
			return vm.twoIntsToDouble(this.intAt(doubleIndex*2),this.intAt(doubleIndex*2+1));
		};
		
		//in op lambda or opOneMoreParam
		//(UPDATE: opOneMoreParam was removed from the design, and instead (Lambda [1 to 250-something paramNames] ...params)
		//or op varargAx, theres a funcBody. FIXME choose a design, of where funcBody goes,
		//cuz could simplify this. curriesLeft and op must be known at param 7, so lambda 
		vm.Node.prototype.funcBody = function(){
			if(!this.cacheFuncBody){
				throw 'FIXME';
				switch(this.o8()){
					/*FIXME optimize by putting in header or some way... to efficiently know if its the 8th param. ???
					Or change these 3 ops (varargAx opOneMoreParam lambda) so that funcBody is the 7th param?
					Would need to have 2 or 4 of each of those ops if so, cuz up to the 7th param,
					every next param being u vs anything_except_u branches to twice as many ops.
					By design the op and curriesLeft are known at param 7 (or less),
					so the design of using the 8th param as funcBody and maybe 9th for something related,
					is complicating that. Write out the design below, and try to make it consistent,
					and look for all other ops that have strange curriesLeft
					andOr evalingVsHalted params, such as op.evaling has o8 of 0)...
					Thats in vm.opInfo[o8].isStrange.
					Or should they be 1 deeper than that, so can find funcBody just by o8? A few specific o8s have funcBody as their r child.
					The problem with waiting until param7 is every later param has the same o8 as param7 as it copies from l child after that.
					...
					*/
					
					
					case vm.o8OfVarargAx:case o8OfLambda:
						let find = this.lam; //starts as (varargAx funcBodyAndVarargChooser a b c d) or (opOneMoreParam aVarName aLambda ...params...)
						let prevFind = find;
						//FIXME redesign this so the loop is smaller?
						while(find.n.curriesLeft() != 2) find = find.n.l; //lambda.n is the same as lambda()
						//while(find.n.l.n.curriesLeft() != 2) find = find.n.l; //lambda.n is the same as lambda()
						throw 'TODO';
						//this.cacheFuncBody = TODO;
					break;case vm.o8OfOpOneMoreParam:
						//this.cacheFuncBody = TODO;
						throw 'TODO find aLambda in (opOneMoreParam aVarName aLambda ...params...) and call node.funcBody() on it recursively.';
					break;default:
						this.cacheFuncBody = vm.u;
				}
			}
			return this.cacheFuncBody;
		};
		
		
		/* See other intAt doubleAt etc funcs, near the bitAt and byteAt funcs.
		
		//index is in units of ints, not bits. Node.blob is always a Int32Array. always 0s outside range.
		//If blobFrom<blobTo then blob exists.
		vm.Node.prototype.intAt = function(index){
			//if(index < this.blobFrom || this.blobTo <= index) return 0;
			//return this.blob[index];
			//in case its undefined cuz outside valid range.
			//index|0 might help js compiler optimize since it cant be a string index etc.
			//FIXME if this.blob is not a powOf2 number of bits,
			//then it must be viewed as padded by a 1 bit then 0s until the next powOf2 IF VIEWED AS BITSTRING,
			//ELSE PAD WITH ALL 0S AS JUST A SPARSE REPRESENTATION OF A CBT.
			//Every bitstring is a cbt, but not every cbt is a bitstring.
			//The only cbts that are not bitstrings, are all 0s.
			//The easiest way is just to keep all blobs as powOf2 number
			//of ints and preallocate pow(2,0)..+..pow(2,16) number of cbts for all possible
			//bitstrings up to 16 bits, so calling 2 of those together makes 32 bits. calling 2
			//of those together makes 64 bits. and so on.
			return this.blob[index|0]|0;
		};
		
		//TODO choose to swap the names doubleAt vs doubleAtt (which both should exist). which way is more intuitive?
		
		//index is in units of doubles
		vm.Node.prototype.doubleAtt = function(index){
			return this.doubleAt(index<<1);
		};
		
		//index is in units of ints
		vm.Node.prototype.doubleAt = function(index){
			//FIXME bigEndian or littleEndian and of ints or bytes etc?
			return vm.twoIntsToDouble(this.intAt(index), this.intAt(index+1));
			//TODO optionalPerNode optimization of this func (just replace it, or inherit using .prototype?)
			//that overlaps a new Float64Array(this.blob.buffer) with this.blob which is an Int32Array,
			//and cache that in a this.blobD, similar to also do this.blobF for Float32Array etc,
			//but since many nodes wont use that, dont make these type specific optimizations by default,
			//just where its likely to help. To be explored later.
		};
		
		//as double
		vm.Node.prototype.d = function(){
			return this.doubleAt(0);
		};
		*/
		
		
		vm.twoIntsToDouble = function(high32, low32){
			//FIXME bigEndian or littleEndian and of ints or bytes etc?
			vm.overlappingBufferInts[0] = high32;
			vm.overlappingBufferInts[1] = low32;
			return vm.overlappingBufferDouble[0];
		};
		
		//can say duplicate forest shapes are not equal, but if forest shape differs then they certainly dont equal.
		//For perfect dedup, use 256 bit or 512 bit global ids which are lazyEvaled and most nodes never need one.
		vm.Node.prototype.equalsByLazyDedup = function(otherNode){
			//TODO optimize by using === between 2 nodes, since only 1 node in memory should ever have the same localId128?
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
		
		vm.nodeToStringPrefix = '??';
		
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
			if(vm.nodeToStringIncludesChilds) return vm.nodeToStringOne(node);
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
			//FIXME theres multiple prefixes that have evilBit. Look around vm.callPairPrefixByte_evilBitOn for similar named things,
			//Basically theres a 5 bit prefix (0b11110) that if it matches then the next bit is an evilBit,
			//and if it doesnt match those first 5 bits
			//then its neutral (doesnt have a header so doesnt have an evilBit being true or false)
			//and is small enough its a literal that fits in an id.
			
			let x = (headerInt>>24)&0xff;
			return x==prefixByteOfOther_evilBitOn || x==callPairPrefixByte_evilBitOn; //FIXME theres faster way to do that, without 2 of ==, but might need to swap some of the constants in first byte.
			//return (headerInt>>24)&0xff == vm.callPairPrefixByte_evilBitOn; //a certain value of first byte. literal256thatfitinid or callPairPrefixByte_evilBitOff return false.
			
			
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
		
		//vm.stackTime = 100000000; //fill these back up before starting another call at bottom of stack, to avoid running out, but not until the stack becomes empty.
		//vm.stackMem = 100000000;
		//vm.stackDeep = 200; //TODO should probably be higher, but might need to not use js stack if too deep.
		//vm.refill(); //set vm.stackTime vm.stackMem etc.

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
		
		//You can turn an evaler (which is used by 0-infinity nodes, on or off using aNode.n.evaler.prev.prev.on = trueOrFalse.
		//and to find whichever is the nearest Evaler thats on, use aNode.n.getEvaler(),
		//and vm.lambdize(aNode)(vm.lambdize(bNode)) does that lambda call.
		//You normally use the lambdized form so you dont need to call lambdize directly or even know that Nodes exist.
		//Its stuff inside the wikibiantor203 VM.
		vm.Node.prototype.getEvaler = function(){
			let evaler = this.evaler;
			//if(!evaler) throw 'No evaler in thisNode='+this; //TODO optimize by removing this line since all Nodes will have evalers
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

		//number of bits in the cbt, range 1 to [2 pow 247], if vm.log2OfMaxBits==247, as a double.
		//If not a cbt, TODO what should this return, or let it give nonsense answer since you shouldnt call it for that?
		vm.Node.prototype.cbtSize = function(){
			return 2**this.cbtHeight();
		};

		//If this is a cbt, then it is 2 pow cbtHeight bits. That ranges 1 bit to approx 2 pow 248 bits (FIXME thats not the exact right exponent?).
		//If not cbt, then I'm not sure what this will return, TODO. For efficiency, does not check if its a cbt, but TODO maybe it should?
		vm.Node.prototype.cbtHeight = function(){
			return vm.log2OfMaxBits-this.curriesLeft();
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
			return thi.curriesLeftOf(this.header);
		};*/

		vm.Node.prototype.toString = function(){
			return this.vm.nodeToString(this);
			//return this.slowLocalId();
			//TODO 1 char prefix concat base58 form of 256 bit default kind of id, recursively.
		};
		
		vm.emptyFrozenArray = new Array();
		Object.setPrototypeOf(vm.emptyFrozenArray,null);
		Object.freeze(vm.emptyFrozenArray); //FIXME can you both set prototype to null and freeze, and is this the right order to do that?
		
		vm.emptyFrozenDoubleArray = new Float64Array(0); //would normally share a buffer between int array and double array, but if its size 0, that might do strange things?
		Object.setPrototypeOf(vm.emptyFrozenDoubleArray,null);
		Object.freeze(vm.emptyFrozenDoubleArray);
		
		vm.emptyFrozenIntArray = new Int32Array(0); //would normally share a buffer between int array and double array, but if its size 0, that might do strange things?
		Object.setPrototypeOf(vm.emptyFrozenIntArray,null);
		Object.freeze(vm.emptyFrozenIntArray);
		
		
		
		
		
		
		/*
		vm.OpmutState = function(whichOpmutSpace){
			this.o = whichOpmutSpace;
			
			throw 'TODO';
			
		};
		
		//Returns a Mut, at most 1 Mut per deduped fn.
		//wrap the fn in a Mut. If the fn is not deduped (check idA and maybe also idB) then wraps the deduped form instead.
		//A deduped fn always has blobFrom==0 and blobTo==0, so you only need id64 of the fn, combined with whichOpmutSpace,
		//to uniqely identify a Mut.
		vm.OpmutState.prototype.fnToMut = function(fn){
			throw 'TODO';
		};
		*/
		
		
		
		
		

		/*vm.Mut = function(n){
			this.m = {};
			this.d = new Float64Array(n);
		};*/
		
		/*
		See from above something like this[[[
			FIXED design keeps Mut mostly as it is, adds .j->fn and .g->string and has weaker merged gasTime/gasMem and only runs for a tiny fraction of a second so it wont run out of mem.
			..
			TODO asap, but confirm this solves the problem...
			Have ops for string length, concat, substring, etc.
			Have try/catch op for undefined[anything] where some things may return undefined.
			Have just 1 var in opmut that counts down with each thing done next, sometimes counts by variable amount like when string concat it will check their lengths.
			I'm guessing (TODO verify) that putting a big string as a map key doesnt cost the size of that string as its deduped or hashed or something... but im not sure.
			Opmut only happens, normally, for a small fraction of a second. Its unlikely to run out of memory at all.
			So if just use 1 gas* var, gasTimeAndOrMem, and subtract from it for heap allocation and for every write in a {}, then it cant infinite loop and must halt within some approximatable (though might vary by 10 times faster or slower) limit.
			..
			Mut.n size of Float64Array if need to have null prototype.
			Mut.m -> {} where key is string and val is [Mut or double or undefined]. (with null prototype?).
			Mut.d -> Float64Array, with null prototype. can use this for canvas pixel graphics (copy between them, but lambdas are still immutable, etc).
			Mut.g -> string
			Mut.j -> fn (u by default).
			...
			{hi:'hello'}+2
			2
			{hi:'hello'}+33
			33
			{hi:'hello'}*5
			VM176:1 Uncaught SyntaxError: Unexpected token '*'
			({hi:'hello'})*5
			NaN
			OK.

		]]];*/
		
		
		
		const objectThatReturns0ForAllFieldValues = new Proxy({}, { get(obj, prop){  return 0; } });
		Object.freeze(objectThatReturns0ForAllFieldValues);
		vm.objectThatReturns0ForAllFieldValues = objectThatReturns0ForAllFieldValues;
		
		//1 <= i <= 2**30.
		vm.roundUpToPowOf2 = i=>{
			if(i<=1) return 1;
			let leadingZeros = Math.clz32(i-1);
			return 2**(32-leadingZeros);
		};
		
		//adds at least 1 byte of padding, and pads a 1 bit then 0s until next powOf2. Returns byte array of powOf2 size.
		vm.padBytes = bytes=>{
			//FIXME some callers of this, if they give an empty byte array, should get back vm.ops.Bit1 (a cbt of 1 bit, the padding bit), instead of 0b10000000 ???
			
			//TODO optimize using prototype and something like vm.expandBytesToPowOf2 if can ever get that to work,
			//but for now just copy it to a new byte array if need to expand it.
			let newByteSize = vm.roundUpToPowOf2(bytes.length+1);
			let ret = new Uint8Array(newByteSize);
			for(let i=0; i<bytes.length; i++) ret[i] = bytes[i]; //TODO optimize by using a Uint8Array func (or in TypedArray) to copy a range.
			ret[bytes.length] = 0x80; //pad 1 bit and the rest up to the next powOf2 are 0s, but only put 7 of those 0s here
			for(let i=bytes.length+1; i<newByteSize; i++) ret[i] = 0; //TODO optimize, would it already be 0s?
			return ret;
		};
		
		/** this isnt working. pad to next powOf2 size (using vm.padBytes), at least for now....
		
		//Modifies its param (which can be Uint8Array (or maybe later also allow Int32Array etc). Keeps same length but adds cbt padding if any is needed.
		//Example: if its a Uint8Array size 19, pads a (byte)0 at index 19 (by setting key 19 to that,
		//and pads 0s after that up to size 32 by setting its prototype to vm.objectThatReturns0ForAllFieldValues.
		vm.expandBytesToPowOf2 = blob=>{
			let newByteSize = vm.roundUpToPowOf2(blob.length);
			let len = blob.length;
			if(newByteSize != len){
				Object.setPrototypeOf(blob, vm.objectThatReturns0ForAllFieldValues);
				blob[len] = 0b10000000; //pad 1 bit and the rest up to the next powOf2 are 0s, but only put 7 of those 0s here
			}
		};
		*/
		
		
		
		/*
		//TODO start all fields as undefined, since vals of [Mut, double, or undefined] (but not lambda or string, cuz those are wrapped in Mut) are allowed?
		
		UPDATE 2022-3-9 todo implement this...
		
		TODO asap make the lambdas of variable number of (lambda funcBody ?varA ?varb ?varc u ...paramsOfThatManyParamsUpTo240Something), AND make the Mut as described below, and do some basics graphics, sound, or something just start playing with it.



		FIXED design keeps Mut mostly as it is, adds .j->fn and .g->string and has weaker merged gasTime/gasMem and only runs for a tiny fraction of a second so it wont run out of mem.
		"Mut.m -> {} where key is string and val is [Mut or double or undefined], with null prototype?." prevents accidentally getting string when you expected double.
		..
		TODO asap, but confirm this solves the problem...
		Have ops for string length, concat, substring, etc.
		Have try/catch op for undefined[anything] where some things may return undefined.
		Have just 1 var in opmut that counts down with each thing done next, sometimes counts by variable amount like when string concat it will check their lengths.
		I'm guessing (TODO verify) that putting a big string as a map key doesnt cost the size of that string as its deduped or hashed or something... but im not sure.
		Opmut only happens, normally, for a small fraction of a second. Its unlikely to run out of memory at all.
		So if just use 1 gas* var, gasTimeAndOrMem, and subtract from it for heap allocation and for every write in a {}, then it cant infinite loop and must halt within some approximatable (though might vary by 10 times faster or slower) limit.
		..
		Mut.n size of Float64Array if need to have null prototype.
		Mut.m -> {} where key is string (may be made from double or undefined or concat of mutA.g with mutB.g etc) and val is [Mut or double or undefined], with null prototype?.
		Mut.d -> Float64Array, with null prototype. can use this for canvas pixel graphics (copy between them, but lambdas are still immutable, etc).
		Mut.g -> string
		Mut.j -> fn (u by default).
		...
		{hi:'hello'}+2
		2
		{hi:'hello'}+33
		33
		{hi:'hello'}*5
		VM176:1 Uncaught SyntaxError: Unexpected token '*'
		({hi:'hello'})*5
		NaN
		OK.
		..
		Can aMut.m.someStringABC cuz know 'someStringABC' is a string (dont need to wrap in a Mut in Mut.g),
		but otherwise the only keys accepted in it are from Mut.g.
		*
		//SOLUTION to 1 of the sandbox problems,
		//though maybe not the fastest, will get musical instruments and flexible recursion in opmut working soon,
		//which sandbox depends on js String and js Number dont have any of these fields (m d n, etc)...:
		vm.Mut = function(n, optionalString, optionalLambda){
			//this was the Mut class 2022-2, that was never done enough to use it, but am about to replace it with one that juses only arrays so will be faster
			//and not have to undo as much of javascript's existing behaviors such as + doing string concat and number plus. There are no strings in the newer design,
			//but you can still do concat of ranges of primitive array and use it like a string.
		
			//truncate to nonnegative int n even if its string or lambda or mut etc (which if they are not a double then becomes 0).
			//in js, int or float or byte are a subset of doubles.
			this.n = n&0x7fffffff;
			
			//view as thisMut<indexOfDouble>.
			//This is normally copied from Node.blob which is an Int32Array. Can get Int32Array.buffer and wrap that same buffer in a Float64Array.
			//In opmut, contents of .d and of .m are mutable, but in lambdas everything (except lazyEval cache of Node.bize etc) is used as immutable,
			//including that Node.blob is used as immutable even though it may technically be mutable but dont write it. ForkEdit only.
			//TODO start all fields as undefined, since vals of [Mut, double, or undefined] (but not lambda or string, cuz those are wrapped in Mut) are allowed?
			this.d = new Float64Array(this.n); //TODO reuse an empty Float64Array if !this.n aka this.n==0
			
			//view as thisMut[abc] or thisMut.xyz where value of abc is 'xyz', and root namespace (in an opmut call) is a Mut (maybe with just 1 key set to the param of opmut??),
			//and a "root namespace" normally only exists for .001 to .03 seconds between one video frame and the next or multiple such calls during one,
			//or for some uses maybe much longer or as fast as a microsecond.
			//Cycles are allowed in Mut.m that lead to that same Mut etc, but only during opmut
			//which is designed to be optimized by compiling to javascript code.
			//Lambdas cant have cycles while halted, but can eval in cycles or forever expanding etc.
			this.m = {};
		
			//string
			this.g = optionalString || '';
			
			//fn/lambda (lambdized wrapper of node)
			this.j = optionalLambda || u;
			
			//this.?? = null; //lambda (output of lambdize of Node) or null. or should lambda be value in Mut.m?
			
			//To make formal-verification easier and efficient, remove js prototype of fields of Mut,
			//except Object.getPrototypeOf(Mut.n) is Number, which cant be changed cuz for example 5.67 in js has no prototype pointer and is just literal bits,
			//similar to Object.getPrototypeOf('xyz') cant be changed and is always String. Number and String, of key n d or m, seem to always be undefined,
			//so will correctly throw if generated js code reads g.h.i where g.h returns a Number or a String or a lambda, but if it returns a Mut then .i is theMut.m.i
			//which may be undefined or have a value of string or double or lambda or Mut, and so on.
			//
			//block access to this.d.buffer and this.d.length etc in generated js code, without needing to do param|0..
			//Object.setPrototypeOf(this.d,null);
			//Object.setPrototypeOf(this.d.prototype, objectThatReturns0ForAllFieldValues); //FIXME dont set prototype here like that. set that once outside Mut constructor
			//block access to this.m.__lookupGetter__ etc in generated js code.
			//Object.setPrototypeOf(this.m,null);
			Object.setPrototypeOf(this.m, objectThatReturns0ForAllFieldValues);
		};
		Object.setPrototypeOf(Float64Array.prototype, objectThatReturns0ForAllFieldValues); //FIXME dont set prototype here like that. set that once outside Mut constructor
		Object.setPrototypeOf(vm.Mut.prototype, objectThatReturns0ForAllFieldValues);
		//FIXME lambdas (lambdize returns it) prototype should be objectThatReturns0ForAllFieldValues?
		//let protoProtoOfNumber = Object.getPrototypeOf(Object.getPrototypeOf(5));
		//Object.setPrototypeOf(vm.Mut.prototype, objectThatReturns0ForAllFieldValues);
		*/
		
		
		/*
		vm.OpmutState = function(hashtableSizeInNodes){
			
			
			
			this.log2OfIntsPerHashtableSlot = 3; //mutableIntVal mutablePtrToNode iummutableLeftPtr immutableRightPtr mutableDoubleA mutableDoubleB.
			//TODO fitting a max of 1<<25 nodes (actually just around half that cuz hashtable needs to be part empty, seems too small for some uses,
			//but consider that each node can have its own primitive array so can reach 64 bit sizes such as using a petabyte of memory, if your browser (or whatever the VM is ported to) supports it,
			//and nodes have (other than their left and right childs) mutable data (mutable pointer at node. mutable int, 2 mutable doubles, mutable pointer to fn/lambda, mutable pointer to Float64Array,
			//and maybe TODO Int32Array, Uint8Array, etc. The array of a node will be a pointer to a shared empty array of that type until its replaced, to avoid allocating unused arrays.
			if(hashtableSizeInNodes&(hashtableSizeInNodes-1)!=0 || hashtableSize < 1 || hashtableSize > (1<<25)) throw 'Invalid hashtableSize='+hashtableSize+' cuz must be a powOf2 in some range.';
			this.ptrMask = (this.ints.length-1)&~((1<<this.log2OfIntsPerHashtableSlot)-1);
			
			//trs are ints but lambdas and opmuts arent allowed to know what they are, just check them for equality. That way, different hash functions, VMs, etc, have the same input/output behaviors.
			
			//a hashtable with no removing, no tombstones. You use it (in this OpmutState) for a fraction of a second, as an optimization of a lambda call, then garbcol/garbageCollect the whole thing.
			//this.ints[ptr] is mutableIntVal
			//this.ints[ptr+1] is mutablePtrToNode
			//this.ints[ptr+2] is iummutableLeftPtr
			//this.ints[ptr+3] is immutableRightPtr
			//this.ints[ptr+4 to ptr+7] is not used here since thats where this.doubles overlaps it.
			this.ints = new Int32Array(hashtableSizeInNodes<<this.log2OfIntsPerHashtableSlot);
			
			//this.doubles[2+ptr>>1] is mutableDoubleA
			//this.doubles[3+ptr>>1] is mutableDoubleB
			this.doubles = new Float64Array(this.ints.buffer);
			
			//index is ptr. size is hashtableSizeInNodes lambdas.
			//FIXME fill with u? None should be null or undefined. Or use prototype for that to save memory?
			this.lambdas = new Array();
			
			//index is ptr. size is hashtableSizeInNodes lambdas.
			//FIXME fill with emptyDoubleArray? None should be null or undefined. Or use prototype for that to save memory?
			this.doubleArrays = new Array();
		};
		//TGDO hash func goes here, of 3 int params, the 2 ptrs to make pair of, and which number of hashing again it is, such as the third time it couldnt put something there it has to jump buckets.
		//a and b are divisible by 8. c is any nonneg int.
		vm.OpmutState.prototype.hash3IntsToBucket = (leftPtr,rightPtr,triedHowManyTimes)=>(vm.hash3Ints(a,b,c)&this.ptrMask);
		//like the lambda cp func except it just creates a pair of int ptrs, that is another int ptr, which is whatever hashtable bucket it ends up in.
		vm.OpmutState.prototype.cp = (leftPtr,rightPtr)=>{
			for(let triedHowManyTimes=0; triedHowManyTimes<256; triedHowManyTimes++){
				let parentPtr = this.hash3IntsToBucket(leftPtr,rightPtr,triedHowManyTimes);
				if(this.ints[2+parentPtr]==leftPtr && this.ints[3+parentPtr]==rightPtr) return parentPtr;
			}
			throw 'couldnt make parent ptr of '+leftPtr+' and '+rightPtr+'. Is hashtable near full? Or is hash3IntsToBucket a bad hash function?';
		};
		vm.OpmutState.prototype.i = ptr=>this.ints[2+ptr]; //mutableIntVal
		vm.OpmutState.prototype.I = (ptr,newIntVal)=>(this.ints[2+ptr]=newIntVal); //mutableIntVal
		vm.OpmutState.prototype.p = ptr=>this.ints[2+ptr]; //mutablePtrToNode
		vm.OpmutState.prototype.P = (ptr,newPtr)=>(this.ints[2+ptr],newPtr); //mutablePtrToNode. Ptrs are ints but lambdas and opmuts arent allowed to know what they are, just check them for equality. That way, different hash functions, VMs, etc, have the same input/output behaviors.
		vm.OpmutState.prototype.l = ptr=>this.ints[2+ptr]; //iummutableLeftPtr
		vm.OpmutState.prototype.r = ptr=>this.ints[3+ptr]; //immutableRightPtr
		vm.OpmutState.prototype.a = ptr=>this.doubles[2+ptr>>1]; //mutableDoubleA
		vm.OpmutState.prototype.A = (ptr,newDoubleVal)=>(this.doubles[2+ptr>>1]=newDoubleVal); //mutableDoubleA
		vm.OpmutState.prototype.b = ptr=>this.doubles[3+ptr>>1]; //mutableDoubleB
		vm.OpmutState.prototype.B = (ptr,newDoubleVal)=>(this.doubles[3+ptr>>1]=newDoubleVal); //mutableDoubleB
		vm.OpmutState.prototype.AB = (ptr,newDoubleValA,newDoubleValB)=>{
			let p = 2+ptr>>1;
			this.doubles[p] = newDoubleValA; //mutableDoubleA
			this.doubles[p+1] = newDoubleValB; //mutableDoubleB
		};
		
		
		//Mut_or_number.e is a number.
		let getZero = ()=>0;
		let getThisPlusZero = function(){ return this+0; };
		let emptyFrozenMap = {};
		Object.setPrototypeOf(emptyFrozenMap,objectThatReturns0ForAllFieldValues);
		Object.freeze(emptyFrozenMap);
		let getEmptyFrozenMap = ()=>emptyFrozenMap;
		//let emptyFloat64Array = {};
		let emptyFloat64Array = new Float64Array(0);
		//Object.setPrototypeOf(emptyFloat64Array,objectThatReturns0ForAllFieldValues);
		//Object.setPrototypeOf(emptyFloat64Array,objectThatReturns0ForAllFieldValues);
		Object.freeze(emptyFloat64Array);
		let getEmptyFloat64Array = ()=>emptyFloat64Array;
		vm.Mut.prototype.e = getZero;
		let protoProtoOfNumber = Object.getPrototypeOf(Object.getPrototypeOf(5));
		Object.defineProperty(protoProtoOfNumber, 'e', { get: getThisPlusZero });
		Object.defineProperty(protoProtoOfNumber, 'n', { get: getZero });
		Object.defineProperty(protoProtoOfNumber, 'm', { get: getEmptyFrozenMap }); //FIXME use objectThatReturns0ForAllFieldValues instead of freezing?
		Object.defineProperty(protoProtoOfNumber, 'd', { get: getEmptyFloat64Array }); //FIXME use objectThatReturns0ForAllFieldValues instead of freezing?
		Object.defineProperty(protoProtoOfNumber, 'j', { get: ()=>u });
		//Now (in theory todo test) every number, as long as its in parens, acts like a Mut, but values of Mut_or_number_or_undefined are still a problem when thats undefined since undefined.anything throws.
		if((10+20).e != 30) throw 'Number proto proto didnt work';
		if((10+21).n != 0) throw 'Number proto proto didnt work';
		if((10+21).d.length != 0) throw 'Number proto proto didnt work';
		//
		//TODO try this to get rid of undefined in {}...
		//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
		/*Using a computed property name
		const expr = 'foo';
		const obj = {
		  get [expr]() { return 'bar'; }
		};
		console.log(obj.foo); // "bar"
		*/
		//or this https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
		/*it works, todo get rid of the undefined in {} and replace it with 0.
		Proxy
		?? Proxy() { [native code] }
		x = {};
		{}
		z = {
		  get(bb){
			  return 'abc';
		  }
		}
		{get: ??}
		z.hi
		undefined
		cc = new Proxy({}, {
		  get(obj, prop) {
			return 'hello';
		  }
		});
		Proxy??{}
		cc.yo
		'hello'
		cc[undefined]
		'hello'
		x.hello
		undefined
		Object.setPrototypeOf(x,cc);
		{}
		x.a = 'b'
		'b'
		x.c
			constructor(params) {
				
			}
		}
		VM722:2 Uncaught SyntaxError: Unexpected token '{'
		x.c
		'hello'
		*/
		/*
		2022-3-9
		valing l=s(t)(t) r=s(pair)(l)
		wikibinator203.js:2371 Evaling l=f r=u
		wikibinator203.js:2371 Evaling l=s r=f(u)
		wikibinator203.js:2371 Evaling l=f r=u
		wikibinator203.js:2371 Evaling l=s(f(u)) r=f(u)
		wikibinator203.js:2371 Evaling l=s(f(u))(f(u)) r=pair
		(5).d
		Float64Array??[]
		(5).e
		5
		(5).n
		0
		(5).j
		?? (param){
					
					//TODO test the code NODE.evaler(NODE.lam,param) which should do this.
					//TODO evaler, so can put various optimizations per node. chain of evalers with evaler.on defining which i???
		''+(5).j
		'u'
		''+(5).m.hello
		'0'
		(5).m.hello
		0
		(5).m.helloasdf
		0
		(5).m[undefined]
		0
		(22*33).m.testab
		0
		*/
		
		//These mut* funcs take Mut or double as param, which all have the fields n m d g j e. n is array size. m is {}/map. d is Float64Array. g is string. j is fn/lambda. e is double value.
		//the prototype of prototype of Number has been modified to have all those fields, such as (10+7).m is a {}, and (10+7).j==u, and (10+7).e==17.
		//undefined is not allowed as a value. In theory these things have been modified to never return undefined when used certain ways that js code can be generated for.
		//mut* primitive math...
		const mutPlus = (a,b)=>(a+b);
		const mutMult = (a,b)=>(a*b);
		const mutSin = a=>Math.sin(a);
		
		//mut* controlflow such as loops, if/else, and sequence of code...
		
		//condition and loopBody are function(mut)->mut.
		//mutableState is a Mut
		const mutWhile = (condition,loopBody,mutableState)=>{
			while(condition(mutableState)){
				//TODO check gas* when? todo rename gas* to stack* like vm.stackTime vm.stackMem
				loopBody(mutableState);
			}
			return mutableState; //also mutableState may have been modified
		};
		
		const mutDoWhile = (loopBody,condition,mutableState)=>{
			do{
				//TODO check gas* when? todo rename gas* to stack* like vm.stackTime vm.stackMem
				loopBody(mutableState);
			}while(condition(mutableState));
			return mutableState; //also mutableState may have been modified
		};
		
		const mutFor = (start, condition, afterLoopBody, loopBody, mutableState)=>{
			for(start(mutableState); condition(mutableState); afterLoopBody(mutableState)){
				//TODO check gas* when? todo rename gas* to stack* like vm.stackTime vm.stackMem
				loopBody(mutableState);
			}
			return mutableState; //also mutableState may have been modified
		};
		
		const mutIfElse = (condition,ifTrue,ifFalse,mutableState)=>{
			//TODO check gas* when? todo rename gas* to stack* like vm.stackTime vm.stackMem
			return (condition(mutableState) ? ifTrue : ifFalse)(mutableState);
		};
		
		const mutIf = (condition,ifTrue,mutableState)=>{
			//TODO check gas* when? todo rename gas* to stack* like vm.stackTime vm.stackMem
			return condition(mutableState) ? ifTrue(mutableState) : mutableState;
		};
		
		//a sequence of mut* funcs to call on a mutableState
		const mutProgn = (listOfMutFuncs,mutableState)=>{
			//TODO check gas* when? todo rename gas* to stack* like vm.stackTime vm.stackMem
			for(let mutFunc of listOfMutFuncs){
				//or should it just be: mutFunc(mutableState); without setting mutableState? might be more optimizable. but dont call it progn if so.
				mutableState = mutFunc(mutableState);
			}
			return mutableState;
		};
		
		const mutMapPut = (getMap,getKey,getVal,mutableState)=>{
			//TODO check gas* when? todo rename gas* to stack* like vm.stackTime vm.stackMem
			return getMap(mutableState).m[getKey(mutableState).g] = getVal(mutableState);
		};
		
		const mutMapGet = (getMap,getKey,mutableState)=>{
			//TODO check gas* when? todo rename gas* to stack* like vm.stackTime vm.stackMem
			return getMap(mutableState).m[getKey(mutableState).g];
		};
		
		const mutDoubleArrayPut = (getDoubleArray,getKey,getVal,mutableState)=>{
			//TODO check gas* when? todo rename gas* to stack* like vm.stackTime vm.stackMem
			//return getDoubleArray(mutableState).d[getKey(mutableState).e] = getVal(mutableState).e;
			return getDoubleArray(mutableState).d[getKey(mutableState)] = getVal(mutableState);
		};
		
		const mutDoubleArrayGet = (getDoubleArray,getKey,mutableState)=>{
			//TODO check gas* when?
			return getDoubleArray(mutableState).d[getKey(mutableState)];
		};
		
		const mutStringConcat = (getStringA,getStringB,mutableState)=>{
			//TODO check gas* when? and pay for length of new string in stackMem. todo rename gas* to stack* like vm.stackTime vm.stackMem
			let stringA = getStringA(mutableState).g;
			let stringB = getStringB(mutableState).g;
			vm.prepay(1,(stringA.length+stringB.length));
			return vm.wrapInMut(stringA+stringB); //FIXME create vm.wrapInMut func
		};
		
		//returns a new empty Mut
		const mutNewEmpty = ()=>{
			throw 'TODO';
		};
		
		//You can use Mut without this, but you might want to call opmut from inside funcBody of a lambda, and have easy access to the var names of that lambda.
		//lambdaCallingDatastruct is (pair_or_lazyeval (lambda funcBody ?a ?b ?varCDE u ...paramsExceptLast) lastParam).
		const mutPutLambdaParamsInMut = (lambdaCallingDatastruct, getMut)=>{
			throw 'TODO';
		};
		
		//a lambda that can be used as a mut* func. all of them can be but most just ignore it and return some constant (TODO). default way to compile to cpu is to generate js code string.
		const mutCompileForCpu = getLambda=>{
			throw 'TODO';
		};
		
		//a lambda that can be used as a mut* func. all of them can be but most just ignore it and return some constant (TODO). default way to compile to gpu is to generate GPU.js code string,
		//which will use float32 math, and have nondeterministic roundoff, instead of float64, but it can reach over a teraflop in a browser if not IO bottlenecked such as a 3d fractal,
		//else maybe around 30 gflops for matmul etc.
		const mutCompileForGpu = (lambdaCallingDatastruct, getMut)=>{
			throw 'TODO';
		};
		
		//TODO mut* func (or something that returns one)... wrap string, fn/lambda, double, (and maybe Int32Array andOr Float64Array etc) in Mut.
		//Use Object.freeze(theMut) to make a string constant so aLambda(rootMutGivenByOpmut) can generate efficient js code.
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
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
		//const hashIntSalts = new Int32Array(13);
		const hashIntSalts = new Int32Array(30);
		const hashingInts = new Int32Array(9); //put 8 ints in here (5 from each of 2 Nodes) starting at index 0 to hash, and get the hash from index 8.
		for(let i=0; i<hashIntSalts.length; i++) hashIntSalts[i] = randInt();
		
		//random int from pow(2,30) to pow(2,31)-1, to mod hash ints by so bigger digits hash into all digits not just the small digitis.
		//Max hashtable size is pow(2,30) cuz of this, and cuz it has to be a powOf2 size so can efficiently mask lambda.hashInt to get bucket.
		//But since each node can potentially contain an Int32Array of up to (todo somewhere around, whats the exact max) pow(2,31) bits,
		//including that some nodes share the same array, it can still reach 64 bit sizes
		//such as if the browser supports using a terabyte or petabyte of RAM, or if this VM is ported to other systems that can.
		//Its normally a very low memory system, but depends how you use it.
		for(let i=8; i<hashIntSalts.length; i++) hashIntSalts[i] = (hashIntSalts[i]&0x7fffffff)|(1<<30); //make it range 1<<30 to 1<<31-1.
		//hashIntSalts[8] = (hashIntSalts[8]&0x7fffffff)|(1<<30);
		//hashIntSalts[12] = (hashIntSalts[12]&0x7fffffff)|(1<<30);
		
		
		vm.hash3Ints = (a,b,c)=>{
		//vm.hash3Ints = (p,q,r)=>{
			//let a = p^q;
			//let b = q^r;
			//let c = r^p;'
			
			let C = c+a+b; //cuz c is so often 0, and second most common is 1, then 2, 3, and so on, up to max number of buckets searched in hashtable per key is 256 (should average around 2).
			
			let B = a+b;
			
			let d = (hashIntSalts[21]+(a*hashIntSalts[9])%hashIntSalts[10]);
			let e = (hashIntSalts[22]+(B*hashIntSalts[13])%hashIntSalts[14]);		
			let f = (hashIntSalts[23]+(C*hashIntSalts[17])%hashIntSalts[18]);
			
			let g = ((hashIntSalts[24]+a*hashIntSalts[11])%hashIntSalts[12]);
			let h = ((hashIntSalts[25]+B*hashIntSalts[15])%hashIntSalts[16]);
			let i = ((hashIntSalts[26]+C*hashIntSalts[19])%hashIntSalts[20]);
			
			//minorityBit(d,e,f)*minorityBit(g,h,i), where minorityBit(a,b,c)==~(maj(a,b,c)) like in sha256 "maj",
			//an NP math op  of 3 bits -> 1 bit, but in this case 32 times at once.
			//return hashIntSalts[27]+(~(d&e)^(e&f)^(f&d))*(~(g&h)^(h&i)^(i&g));
			return hashIntSalts[27]+(hashIntSalts[28] + ~(d&e)^(e&f)^(f&d))*(hashIntSalts[29] + ~(g&h)^(h&i)^(i&g));
			
			//this hash function might be overkill of number of salts used. i dont want to waste alot of space in hashtables of int mut ids,
			//but i dont want to make mutCp(int,int)->int too slow. its sparse, and thats necessarily going to be slower than sequential memory access, of course.
		};
		//FIXME this is too weak a hash function. needs miniorityBit ((a&b) ^ (b&c) ^ (c&a)), and maybe some extra % and *,
		//but keep in mind that % and * are expensive compared to + & ^ etc, but since the bottleneck in CPU is usually memory bandwidth thats ok.
		//vm.hash3Ints = (a,b,c)=>((
		//	(Math.imul(a,hashIntSalts[9]) +  Math.imul(b,hashIntSalts[10]) + Math.imul(c,hashIntSalts[11]))%hashIntSalts[12]
		//)|0);
		
		vm.hash2Nodes = (a,b)=>{
			//TODO find some way to not check this IF just for u. its slowing down all the hashing.
			
			//FIXME verify a is identityfunc and b is u.
			
			
			if(!a || (!b.idA && !b.idB)) return 1; //overly complex???... u doesnt have l and r childs when its created. those are added soon after, but hashtable is used first. TODO optimize by just setting u.hashInt andOr u().hashInt. the 2 childs of u will be identityFunc and u.
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

		//TODO use Node.lazyReturn (UPDATE: 2022-6 I dont remember what that is? did i remove it? TODO),
		//as a different way of funcall caching, but this way with the touch uses less memory and is a little faster.
		//but as a demo of the math, make both ways work. it can be done without this kind of FuncallCache at all.
		vm.FuncallCache = function(func,param,optionalStackStuff){
			this.func = func;
			this.param = param;
			this.stackStuff = optionalStackStuff || vm.defaultStackStuff;
			this.ret = null; //func, param, and ret, are all what lambdize returns.
			//should it be this? //this.touch = ++vm.touchCounter;
			this.touch = ++this.touchCounter; //for garbcol of old funcallcaches. FIXME this.touchCounter? or vm.touchCounter? why was i thinking that vm==this? doesnt seem like that would be true.
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
		
		//vm.o8OfIdentityFunc = 5000; //FIXME thats the wrong number

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
					if(param().o8()==1 && func().o8() == this.o8OfIdentityFunc){ //"tie the quine knot" (see test cases about that)
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
		
		
		//to use the same localNames etc, across multiple tostring calls of fn, lambdaToString fills this in if its null.
		vm.viewer = null;
		
		vm.getViewer = function(){
			if(!vm.viewer) vm.viewer = new vm.Viewer();
			return vm.viewer;
		};

		//vm.lambdaToString is used as toString field in every [function(fn){...} that lambdize makes (which is a fn)].
		//Example, in js, ''+S(T)(T) returns '(S T T)' or something like that (TODO finish the default syntax).
		vm.lambdaToString = function(){
			if(vm.booted){
				return vm.getViewer().fnToString(this); //recursive code string
			}else{
				//display simpler way
				if(this.localName) return this.localName; //starts as the op names, and can name other lambdas (which are all constants), but it doesnt affect ids since its contentAddressable.
				if(this().isLeaf()) return 'U'; //TODO remove this line since .localName will find 'U', but verify that while its working better.
				
				//what is this()? In vm.lambdaToString, this is a fn (output of lambdize). anyFn()==anyFn.n==theNodeOfThatFn.
				//lambdize puts it there, since Object.setPrototypeOf((new function(x){...}), ...) doesnt work for
				//functions BEFORE they're called. You can only use prototype after a js function is called,
				//especially when called by the new keyword.
				//Thats why every fn has 2 main objects, the js function (of 1 param) form, and as a vm.Node instance.
				//aNode.lam.n.lam.n.lam.n===aNode. aFn.n.lam===aFn. aFn()==aFn.n,
				//but might replace aFn() with just aFn.n depending on speed tests.
				//
				//TODO replace all fn() with fn.n for speed, but make sure to test which is faster.
				else return this().l+'('+this().r+')'; //as js code. but a similar syntax (used after vm.booted) is '(myL myR)' etc.
				//TODO? return this().slowLocalId(); //FIXME return a 45 char 256 bit globalId similar to (this one is made up) ??DY8pvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj
			}
		};

		//wraps a vm.Node in a javascript lambda of 1 param.
		//The output of lambdize is a fn (a wikibinator203 lambda). fnA(fnB)->fnC.
		//This allows using .prototype for object-oriented implementation of the lambdas
		//while they're still javascript lambdas.
		//vm.lambdize(nodeA).n===nodeA.
		//vm.lambdize(nodeA)()===nodeA.
		//vm.lambdize(nodeA)().idA or .otherFieldsOfNode .
		//vm.lambdize(nodeA).n.idA or .otherFieldsOfNode .
		//vm.lambdize(nodeA).n.lam===vm.lambdize(nodeA).
		//vm.lambdize(nodeA)===vm.lambdize(nodeA)
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
				try{
					if(--VM.stackDeep <= 0){
						console.log('stackDeep ran out. TODO remove this message since its not an error exactly, is something that opSpend should try/else.');
						throw VM.gasErr;
					}
					return NODE.getEvaler()(VM,NODE.lam,param); //eval lambda call, else throw if not enuf stackTime or stackMem aka
					//FIXME what is this here for?: prepay(number,number)
				}finally{
					++VM.stackDeep;
				}
			};
			lambda.n = NODE; //so you can get node by aLambda.n or by aLambda(). TODO optimize by removing the aLambda() way cuz its slower.
			//causes vm.isLambda(lambda)->true but vm.isLambda({isWikibinator203Lambda:true})->false
			lambda.isWikibinator203Lambda = true;
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
		//prefix is like _ for Seq, as in _[...], a 1 char prefix that doesnt need a space between it and its param, or null to not have one. TODO rename prefix to opAbbrev.
		vm.addOp = (name,prefix,isStrange,curriesLeft,description)=>{
			let o8 = vm.opInfo.length;
			if(o8 >= 256) throw 'Max 128 opcodes, whose o8 is 128 to 255. 0 is evaling. 1 to 127 is the first 0-6 params, before the op is known at 7 params. If you want to redesign this to use different ops, you could replace the last half of vm.opInfo, but you must keep the first half. You could change it to have a different number of ops, such as 1024 ops, using a bigger array twice as big as the number of ops, but then youd need to take some bits from the header int such as only having 13 bits of curriesLeft so up to 8191 curries instead of 2^16-1 curries. But its a universal lambda and that shouldnt be needed. Everyone can use the same opcodes and make all possible programs with that. You might want to use a different universalLambda/opcodes if its easier to optimize for certain kinds of things, but I think this one will be GPU.js optimizable, javascript eval optimizable, etc. Or maybe make a separate kind of object called Blob thats simpler and faster than lambdize of Node, and have Node wrap Blob, and Blob will still have localId but that might overlap part or all of the blob content? Also, a double/float64 maybe should count as a Blob? TODO: auto dedup every lambdize/Node thats a cbt thats at most 256 bits or 512 bits if using 512 bit ids, so have a vm option for cbt height to dedup, and since big blobs that copy between cpu and gpu etc will be wrappers of Int32Array etc that are usually bigger than 256 bits, it will auto not dedup those (just wrap as it is), and wont need to create lambdize/Node for those in most cases (use them as js arrays).';
			//TODO vm.o8ToLambda[vm.nextOpO8] = 
			//vm.opcodeToO8[name] = vm.nextOpO8;
			//vm.opcodesDescription[name] = (description || 'TODO write description of opcode '+name);
			//vm.nextOpO8++;
			vm.opInfo.push({name:name, prefix:prefix, isStrange:isStrange, curriesLeft:curriesLeft, description:description});
			vm.opNameToO8[name] = o8;
			console.log('Add op '+name+' o8='+o8+' curriesLeft='+curriesLeft+' description: '+description);
			return o8;
		};
		vm.addOp('Evaling',null,true,0,' opcode 0 (of 0-255). This is either never used or only in some implementations. Lambdas cant see it since its not halted. If you want a lazyeval that lambdas can see, thats one of the opcodes (TODO) or derive a lambda of 3 params that calls the first on the second when it gets and ignores the third param which would normally be u, and returns what (thefirst thesecond) returns.');
		vm.addOp('U',null,true,7,'the universal lambda aka wikibinator203. opcode 1 (of 0-255). There are an infinite number of other possible universal lambdas but that would be a different system. They can all emulate eachother, if they are within the turingComplete cardinality (below hypercomputing etc), aka all calculations of finite time and memory, but sometimes an emulator in an emulator... is slow, even with evaler optimizations.');
		for(let o8=2; o8<128; o8++){
			//TODO 'op' + 2 hex digits?
			let numLeadingZeros = Math.clz32(o8);
			let curriesSoFar = 31-numLeadingZeros;
			let curriesLeft = 7-curriesSoFar;
			let name = 'Op'+o8.toString(2);
			vm.addOp(name, null, curriesLeft, name+' has '+curriesSoFar+' params. Op is known at 7 params, and is copied from left child after that.');
		}
		vm.addOp('F',null,false,2,'the church-false lambda aka ??y.??z.z. (f u) is identityFunc. To keep closing the quine loop simple, identityFunc is (u u u u u u u u u) aka (f u), but technically (u u u u u u u u anything) is also an identityFunc since (f anything x)->x. (l u)->(u u u u u u u u u). (r u)->u. (l u (r u))->u, the same way (l anythingX (r anythingX))->anythingX forall halted lambda anythingX.');
		vm.addOp('T',',',false,2,'the church-true lambda and the k lambda of SKI-Calculus, aka ??y.??z.y');
		vm.o8OfBit0 = vm.addOp('Bit0',null,false,vm.log2OfMaxBits,'complete binary tree is made of pow(2,cbtHeight) number of bit0 and bit1, evals at each curry, and counts rawCurriesLeft down to store (log2 of) cbt size'); //FIXME is it 247 or 248 or what? or 4077 or what?
		vm.o8OfBit1 = vm.addOp('Bit1',null,false,vm.log2OfMaxBits,'see bit0');
		if((vm.o8OfBit1 & 0b11111110) != vm.o8OfBit0) throw 'o8 of Bit0 must be even (for an optimization to check if its a bit) but is '+vm.o8OfBit0+' and o8 of Bit1 is '+vm.o8OfBit1;
		vm.o8IsOfCbt = o8=>((o8 & 0b11111110) == vm.o8OfBit0);
		vm.o8OfL = vm.addOp('L',null,false,1,'get left/func child. Forall x, (l x (r x)) equals x, including that (l u) is identityFunc and (r u) is u.');
		vm.o8OfR = vm.addOp('R',null,1,'get right/param child. Forall x, (l x (r x)) equals x, including that (l u) is identityFunc and (r u) is u.');
		vm.addOp('Isleaf',null,false,1,'returns t or f of is its param u aka the universal lambda');
		vm.addOp('IsClean',null,false,1,'the 2x2 kinds of clean/dirty/etc. exists only on stack. only with both isClean and isAllowSinTanhSqrtRoundoffEtc at once, is it deterministic. todo reverse order aka call it !isDirty instead of isClean? FIXME theres about 5 isclean bits on stack, see mask_ .');
		vm.addOp('IsAllowSinTanhSqrtRoundoffEtc',null,false,1,'the 2x2 kinds of clean/dirty/etc. exists only on stack. only with both isClean and isAllowSinTanhSqrtRoundoffEtc at once, is it deterministic. todo reverse order?');
		vm.o8OfLambda = vm.addOp('Lambda',null,true,2,'FIXME this must have an odd o8 cuz the [...] is 7th param which is not U. If it was U it would have to be an even o8. FIXME this will take varsize list??? [(streamGet varName) (streamGet otherVar) ...] and a funcBody (or is funcBody before that param) then that varsize list (up to max around 250-something params (or is it 120-something params?) then call funcBody similaar to described below (except maybe use [allParamsExceptLast lastParam] instead of (pair allParamsExceptLast lastParam)) FIXME TODO the streamGet op should work on that datastruct that funcBody gets as param, so (streamGet otherVar [allParamsExceptLast lastParam])-> val of otherVar in the param list of lambda op. OLD... Takes just funcBody and 1 more param, but using opOneMoreParam (the only vararg op) with a (lambda...) as its param, can have up to (around, TODO) '+vm.maxCurries+' params including that funcBody is 8th param of u. (lambda funcBody ?? a b ??? c d e) -> (funcBody (pair (lambda funcBody ?? a b ??? c d) e)). It might be, Im trying to make it consistent, that funcBody is always param 8 in lambda and varargAx. (opOneMoreParam aVarName aLambda ...moreParams...).');
		if(!(vm.o8OfLambda&1)) throw 'o8 of Lambda must be odd.';
		vm.addOp('GetVarFn',null,false,2,'OLD, see ObKeyVal ObVal ObCbt etc. theres 4 things in stream [x valXLambda valXDoubleRaw valXDoubleArrayRaw y val val val z val val val ...], 3 of which are vals. FIXME choose 3 prefix chars such as ?x _x /x. Rewrite this comment... so, ddee? would be a syntax for (getnamedparam "ddee").');
		vm.addOp('GetVarDouble',null,false,2,'OLD, see ObKeyVal ObVal ObCbt etc.theres 4 things in stream [x valXLambda valXDoubleRaw valXDoubleArrayRaw y val val val z val val val ...], 3 of which are vals. FIXME choose 3 prefix chars such as ?x _x /x. Rewrite this comment... so, ddee? would be a syntax for (getnamedparam "ddee").');
		vm.addOp('GetVarDoubles',null,false,2,'OLD, see ObKeyVal ObVal ObCbt etc.theres 4 things in stream [x valXLambda valXDoubleRaw valXDoubleArrayRaw y val val val z val val val ...], 3 of which are vals. FIXME choose 3 prefix chars such as ?x _x /x. Rewrite this comment... so, ddee? would be a syntax for (getnamedparam "ddee").');
		//vm.o8OfOpOneMoreParam = vm.addOp('OpOneMoreParam',true,0,'Ignore See the lambda op. This is how to make it vararg. Ignore (in vm.opInfo[thisOp].curriesLeft cuz vm.opInfo[thisOp].isVararg, or TODO have 2 numbers, a minCurriesLeft and maxCurriesLeft. (lambda funcBody ?? a b ??? c d e) -> (funcBody (pair (lambda funcBody ?? a b ??? c d) e))');
		vm.o8OfVarargAx = vm.addOp('VarargAx',null,true,1,'For defining turing-complete-types. Similar to op Lambda in cleanest mode (no nondeterminism allowed at all, cuz its a proof) except that at each next param, its funcBody is called on the params so far [allParamsExceptLast lastParam] and returns U if thats halted else returns anything except U and takes the R of that to mean returns that. Costs up to infinity time and memory to verify a false claim, but always costs finite time and memory to verify a true claim, since a true claim is just that it returns U when all of those are called. Since its so expensive to verify, anything which needs such verifying has a vm.mask_* bit set in its id as an optimization to detect if it does or does not need such verifying (has made such a claim that things return U). FIXME varargAx has strange behaviors about curriesLeft and verifying it and halted vs evaling. Its 2 params at first but after that it keeps extending it by 1 more param, after verifying the last param and choosing to be halted or eval at each next param. That design might change the number of params to simplify things, so careful in building on this op yet. I set it to 2 params so that after the first 7 params it waits until 9 params to eval, and after that it evals on every next param.');
		vm.addOp('S',null,false,3,'For control-flow. the S lambda of SKI-Calculus, aka ??x.??y.??z.xz(yz)');
		vm.addOp('Pair',null,false,3,'the church-pair lambda aka ??x.??y.??z.zxy which is the same param/return mapping as Typeval, but use this if you dont necessarily mean a contentType and want to avoid it being displayed as contentType.');
		vm.o8OfTypeval = vm.addOp('Typeval',null,false,3,'the church-pair lambda aka ??x.??y.??z.zxy but means for example (Typeval U BytesOfUtf8String) or (Typeval (Typeval U BytesOfUtf8String) BytesOfWhateverThatIs), as in https://en.wikipedia.org/wiki/Media_type aka contentType such as "image/jpeg" or (nonstandard contentType) "double[]" etc. Depending on what lambdas are viewing this, might be displayed specific to a contentType, but make sure to keep it sandboxed such as loading a html file in an iframe could crash the browser tab so the best way would be to make the viewer using lambdas.');
		vm.addOp('Infcur',null,true,vm.maxCurriesLeft,'Infcur aka []. (Infcur x) is [x]. (Infcur x y z) is [x y z]. Like a linkedlist but not made of pairs, so costs half as much nodes. just keep calling it on more params and it will be instantly halted.');
		vm.addOp('ObVal',null,false,2,'used with opmut and _[...] etc.');
		vm.addOp('ObCbt',null,false,2,'used with opmut and _[...] etc.');
		vm.addOp('ObKeyVal',null,false,3,'used with opmut and _[...] etc.');
		//vm.addOp('Mut',null,false,6,'Used with opmut* and lambdaParams*. This is a snapshot of a key/fourVals, normally used in a [...] stream/Infcur. (Mut cbtNotNecessarilyDeduped doubleThatIsOrWillBeDeduped fnThatIsOrWillBeDeduped fnNotNecessarilyDeduped fnAsKeyThatIsOrWillBeDeduped) is halted, and add 1 more param and it infloops). FIXME should Mut be a little varargAx-like as it could verify its params are those types (but unlike varargAx, guarantees it verifies fast)?');
		vm.addOp('OpmutOuter',null,false,2,'FIXME get rid of Opmut* opcodes, since StreamWhile StreamIfElse etc is fn to fn and is just optimized by evaler. (opmutOuter treeOfJavascriptlikeCode param), and treeOfJavascriptlikeCode can call opmutInner which is like opmutOuter except it doesnt restart the mutable state, and each opmutInner may be compiled (to evaler) separately so you can reuse different combos of them without recompiling each, just recompiling (or not) the opmutOuter andOr multiple levels of opmutInner in opmutInner. A usecase for this is puredata-like pieces of musical instruments that can be combined and shared in realtime across internet.');
		vm.addOp('OpmutInner',null,false,2,'FIXME get rid of Opmut* opcodes, since StreamWhile StreamIfElse etc is fn to fn and is just optimized by evaler.  See opmutOuter. Starts at a Mut inside the one opmutOuter can reach, so its up to the outer opmuts if that Mut contains pointers to Muts it otherwise wouldnt be able to access.');
		
		
		vm.addOp('StackIsAllowstackTimestackMem',null,false,1,'reads a certain bit (stackIsAllowstackTimestackMem) from top of stack, part of the recursively-tightenable-higher-on-stack permissions system');
		vm.addOp('StackIsAllowNondetRoundoff',null,false,1,'reads a certain bit (stackIsAllowNondetRoundoff) from top of stack, part of the recursively-tightenable-higher-on-stack permissions system');
		vm.addOp('StackIsAllowMutableWrapperLambdaAndSolve',null,false,1,'reads a certain bit (stackIsAllowMutableWrapperLambdaAndSolve) from top of stack, part of the recursively-tightenable-higher-on-stack permissions system');
		vm.addOp('StackIsAllowAx',null,false,1,'reads a certain bit (stackIsAllowAx) from top of stack, part of the recursively-tightenable-higher-on-stack permissions system');
		vm.addOp('stackAllowReadLocalIds ',null,false,1,'reads a certain bit (stackAllowReadLocalIds) from top of stack, part of the recursively-tightenable-higher-on-stack permissions system. This is a kind of nondeterminism where multiple cbts (such as always cbt128 or always cbt256 etc... not sure how much can standardize the size this early in design of the ops)... can be used as localId... multiple localIds for same binaryForestShape (of fn calls) but for each localId within same run of VM, theres at most 1 binaryForestShape. For example, localId128 in the prototype VM, would be Node.idA .idB .blobFrom and .blobTo, 4 ints.');
		vm.addOp('IsCbt',null,false,1,'returns T or F, is the param a cbt aka complete binary tree of bit0 and bit1');
		vm.addOp('ContainsAxConstraint',null,false,1,'returns t or f, does the param contain anything that implies any lambda call has halted aka may require infinite time and memory (the simplest way, though sometimes it can be done as finite) to verify');
		vm.addOp('Dplusraw',null,false,2,'raw means just the bits, not wrapped in a typeval. add to doubles/float64s to get a float64, or if in that op that allows reduced precision to float32 (such as in gpu.js) then that, but the result is still abstractly a double, just has less precision, and in gpujs would still be float32s during middle calculations.');
		vm.addOp('StreamGet',null,false,2,'FIXME theres 3 vals per key, not just 1. Merge this with GetVarFn GetVarDouble and GetVarDoubles. OLD... Reads a streaming map. Uses an infcur/[...] as a map, thats a stream-appendable (by forkEdit, still immutable) list of key val key val. It does linear search in the simplest implementation but opmut is being replaced by streamGet and streamPut etc which will have a Node.evaler optimization to compile combos of streamGet and streamPut and For While + * / Math.sin Math.exp etc... compile that to javascript code (still cant escape sandbox or cause infinite loops outside the stackTime stackMem etd (gas*) system, and in some cases compile it to GPU (such as using GPU.js or Lazycl). (streamGet keyB [keyB otherVal keyA valA keyB valB keyC valC])->valB, or ->u if there is no valB. [...] means (infcur ...). From the right end, looks left until finds the given key, and returns the val for it, or if reaches infcur before finding the key, then returns u. [...] is variable size. ([...] x)->[... x], so do that twice to append a key and val. Same key can be updated multiple times, statelessly. Equality of keys is by content/forestShape (see equals op). Vals arent checked for equality so you can use lazyDedup such as wrapping a large Float64Array or Float32Array or Int32Array (maybe only of powOf2 size or maybe bize and blobFrom and blobTo var can handle non-powOf2?) in a Node.');
		vm.addOp('StreamPut',null,false,2,'Writes a streaming map. See streamGet. (streamPut keyB someVal [keyA valA keyB valB keyA anotherVal])->[keyA valA keyB valB keyA anotherVal keyB someVal]');
		vm.addOp('StreamPack',null,false,1,'ForkEdits a [...] to only have the last val for each key. You would do this after writing a bunch of key/vals to it, each key written 1 to many times. For example, just a simple loop of a var from 0 to a million would create a [] of size 2 million, but streamPack it during that or at the end and its just size 2. When Evaler optimized it wont even create the [...] in the middle steps. (streamPack [keyA valA keyB valB keyA anotherVal])->[keyB valB keyA anotherVal].');
		vm.addOp('Get32BitsInCbt',null,false,2,'(get32BitsInCbt cbtOf32BitBlocks cbt32Index)->cbt32Val');
		vm.addOp('Put32BitsInCbt',null,false,3,'(put32BitsInCbt cbtOf32BitBlocks cbt32Index cbt32Val)->forkEdited_cbtOf32BitBlocks');
		//vm.addOp('put32BitsInBitstring',false,3,'(put32BitsInBitstring cbt32Index cbt32Val bitstringOf32BitBlocks)->forkEdited_bitstringOf32BitBlocks');
		vm.addOp('Equals',null,false,2,'By content/forestShape of 2 params. This op could be derived using s, t, l, r, and isLeaf. implementationDetailOfThePrototypeVM(((If a node doesnt contain a blob such as Int32Array (which is just an optimization of bit0 and bit1 ops) then its id64 (Node.idA and Node.idB, together are id64, and blobFrom and blobTo would both be 0 in that case, which is normally id128) is its unique id in that VM. Maybe there will be a range in that id64 to mean blobFrom and blobTo are both 0 aka does not contain a blob.))).');
		vm.addOp('StreamWhile',null,false,3,'(streamWhile condition loopBody stream) is like, if you wrote it in javascript: while(condition(stream)) stream = loopBody(stream); return stream;');
		vm.addOp('StreamDoWhile',null,false,3,'(streamDoWhile loopBody condition stream) is like, if you wrote it in javascript: do{ stream = loopBody(stream); }while(condition(stream)); return stream; ');
		vm.addOp('StreamFor',null,false,5,'(streamFor start condition afterLoopBody loopBody stream) is like, if you wrote it in javascript: for(stream = start(stream); condition(stream); stream = afterLoopBody(stream)) stream = loopBody(stream); return stream;');
		vm.addOp('IfElse',null,false,4,'(ifElse condition ifTrue ifFalse state) is like, if you wrote it in javascript: ((condition(state) ? ifTrue : ifFalse)(state)).');
		vm.addOp('If',null,false,3,'(if condition ifTrue state) is like, if you wrote it in javascript: (condition(state) ? ifTrue(state) : state).');
		vm.addOp('GetSalt128',null,false,1,'(getSalt128 ignore)->the cbt128 of salt thats at top of stack aka 3-way-lambda-call of salt128 func and param.');
		vm.addOp('WithSalt128',null,false,3,'(withSalt128 cbt128 func param)-> (func param) except with that cbt128 pushed onto the salt stack. During that, getSalt128 will get that cbt128.');
		vm.addOp('WithSalt128TransformedBy',null,false,1,'(withSalt128TransformedBy funcOf128BitsTo128Bits func param)-> same as (withSalt128 (funcOf128BitsTo128Bits (getSalt128 u)) func param).');
		vm.addOp('SolveRecog',null,false,1,'(solveRecog x) -> any y where (x y) halts, preferring those that use less compute resources (stackTime stackMem etc) but THIS IS NONDETERMINISTIC so can only be used while stackIsAllowMutableWrapperLambdaAndSolve is true on stack. This is for bit what solveFloat64 is for double/float64.');
		vm.addOp('SolveFloat64',null,false,1,'(solveFloat64 x) -> any y where (x y)->float64 (todo is the float64 the raw 64 bits or is it wrapped in a typeval or a typevalDouble etc?), where the float64 is positive, and the higher the better. Requiring positive makes it able to emulate solveRecog. The higher the better, makes it a goal function. Like solveRecog, THIS IS NONDETERMINISTIC so can only be used while stackIsAllowMutableWrapperLambdaAndSolve is true on stack.');
		vm.addOp('Bize31',null,false,1,'(bize31 x) -> cbt32, the low 31 bits of the index of the last (op) bit1, if its a cbt, else 0 if its not a cbt or does not contain any bit1. Bize means bitstring size (in bits). Max bitstring size is around 2^247-1 bits (todo find exact number).');
		vm.addOp('Bize53',null,false,1,'(bize53 x) -> cbt64, the low 53 (so it can be stored in a double) bits of bize. See bize32 comment for what is bize in general.');
		vm.addOp('Bize256',null,false,1,'(bize256 x) -> cbt256. See bize31 comment for what is bize in general. This always fits in a 256 bit literal that is its own id.');
		vm.addOp('LambdaParamsList',null,false,1,'From any number of curries (such as waiting on 3 more params in this: (Lambda FuncBody [w x y z] 100), or from the (LazyEval (Lambda... allParamsExceptLast) lastParam) if it has all its params which FuncBody is called on), gets the whole [w x y z], or gets [] if its not 1 of those datastructs. [...] is infcur syntax.');
		vm.addOp('LambdaParamsStream',null,false,1,'FIXME this should return a [(Mut...) (Mut...) (Mut...)]. FIXME see comments at top of this js file, about [...] of "[cbtNotNecessarilyDeduped doubleThatIsOrWillBeDeduped fnThatIsOrWillBeDeduped fnNotNecessarilyDeduped fnAsKeyThatIsOrWillBeDeduped]" as snapshot of Mut. Used with (Lambda FuncBody [x y z] valX valY valZ) -> (FuncBody (LazyEval (opLambda FuncBody [x y z] valX valY) valZ)). Returns [x valXLambda valXDoubleRaw valXDoubleArrayRaw y val val val z val val val], in blocks of those 4 things, which is used with Opmut/For/While/etc.');
		/*vm.addOp('lambdaParams',null,false,1,'Same as LambdaParamsReverse except is the same order they occur in the Lambda call, and is less efficient cuz has to reverse it. This is normally implemented by calling LambdaParamsReverse then reversing that []/stream.');
		vm.addOp('lambdaParamsReverse',null,false,1,'Used with (opLambda FuncBody [x y z] valX valY valZ) -> (FuncBody (LazyEval (opLambda FuncBody [x y z] valX valY) valZ)). (LambdaParamsReverse (LazyEval (opLambda FuncBody [x y z] valX valY) valZ)) -> [x valX y valY z valZ], but it can be a different number of params. Lambda takes up to (TODO find exact number) around 240-something or 250-something params.');
		*/
		vm.addOp('Seq','_',false,2,'The _ in (_[a b c] x) means ((Seq [a b c]) x) which does (c (b (a x))), for any vararg in the [].');
		vm.addOp('HasMoreThan7Params',null,false,1,'op is known at 7 params, so thats sometimes used as end of a list, especially in an infcur list.');
		vm.addOp('OpCommentedFuncOfOneParam',false,3,'(OpCommentedFuncOfOneParam commentXYZ FuncOfOneParam Param)->(FuncOfOneParam Param), and it can (but is not required, as with any syntax) be used like FuncOfOneParam##CommentXYZ, which means commentXYZ (notice lowercase c/C) is the first param aka \'commentXYZ\' AND happens to be the #LocalName (capital), as a way to display it, but if the comment differs from that then it would be displayed as expanded (...). #LocalNames might default to that name unless its already in use or if its too big a name. Its only for display either way, so doesnt affect ids. This will be optimized for, to ignore it when generating javascript or gpu.js code etc (neither of which are part of the Wikibinator203 spec) IF it can be proven that the (...) itself is not used and just the (FuncOfOneParam Param) is used. Example: {,& (>> 4) ,15}##VoxGreen4 means(OpCommentedFuncOfOneParam voxGreen4 {,& (>> 4) ,15})#VoxGreen4. Or, FIXME, maybe swap the first 2 params? UPDATE: that syntax puts the #Name on the left instead of the right, but no syntax is part of the spec, and all possible syntaxes can be made from the universal lambda.');
		//(name,prefix,isStrange,curriesLeft,description)
		//vm.addOp('AvlTree',null,false,?,'(AvlTree KeyComparator)');
		//TODO just use [ [a b c d e] f [g h] i] (Infcur is []) instead? Or maybe a max branching factor of 2 (or some small constant) is better? vm.addOp('Sortree',null,false,?,'A sortable tree, that can be ordered a variety of ways. (Sortree Comparator ) (((A sortable tree, though it doesnt (like ax could) enforce being sorted. Ax could enforce being sorted, but ax constraints may take infinite time and memory to disprove a false claim, while taking finite time to prove a true claim.)))');
		//vm.addOp('DDToD',null,false,?,'any (double,double)->double op, such as * + / pow etc.');
		//vm.addOp('Cbt128To64',null,false,?,'(Cbt128To64 Func ) . Any 128 bits to 64 bits, such as (double,double)->double op or (double,long)->long etc, such as * + / pow etc. It takes an extra param that defines the logic, and this is more of a casting wrapper, that truncates its inputs and outputs to that, to make proofs easier, though nonhalting or allocation of memory might be a problem, in which case it might just call that func directly and wrap it literally, if it halts at all. Its meant to be a place to put an Evaler aka fn().pushEvaler((vm,func,param)->ret) or maybe another kind of evaler-like-thing thats specialized in (double,double)->double etc.');
		
		
		/* todo these ops too...
		TODO...
		bit0
		bit1
		getSalt128 ignore
		withSalt128 cbt128 func param
		withSalt128TransformedBy funcOf128BitsTo128Bits func param
		//no, just use opmut* instead of: mutableSLike
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
		
		while(vm.opInfo.length < 256) vm.addOp('Op'+vm.opInfo.length+'ReservedForFutureExpansionAndInfloopsForNow', 1, 'Given 1 param, evals to (S I I (S I I)) aka the simplest infinite loop, so later if its replaced by another op (is reserved for future expansion) then the old and new code will never have 2 different return values for the same lambda call (except if on the stack the 4 kinds of clean/dirty (stackIsAllowstackTimestackMem stackIsAllowNondetRoundoff stackIsAllowMutableWrapperLambdaAndSolve stackIsAllowAx) allow nondeterminism which if theyre all clean then its completely deterministic and theres never more than 1 unique return value for the same lambda call done again.');
		
		//In abstract math, evals to (S I I (S I I)) aka the simplest infinite loop. Infinite loops etc will be caught by the nearest spend call
		//(limiting time and memory higher on stack than such call, recursively can tighten), so actually just throws instantly.
		//TODO in abstract math there should be an "outer spend call" just below the stack, to catch anything when theres not any spend call??
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
		vm.StackStuff.prototype.stackIsAllowNondetRoundoff = function(){
			return this.mask&vm.mask_stackIsAllowNondetRoundoff;
		};
		vm.StackStuff.prototype.stackAllowReadLocalIds = function(){
			return this.mask&vm.mask_stackAllowReadLocalIds;
		};
		vm.StackStuff.prototype.stackIsAllowMutableWrapperLambdaAndSolve = function(){
			return this.mask&vm.mask_stackIsAllowMutableWrapperLambdaAndSolve;
		};
		vm.StackStuff.prototype.stackIsAllowAx = function(){
			return this.mask&vm.mask_stackIsAllowAx;
		};
		vm.StackStuff.prototype.stackIsAllowstackTimestackMem = function(){
			return this.mask&vm.mask_stackIsAllowstackTimestackMem;
		};

		
		//pure deterministic, no ax (which is deterministic but can have infinite cost to verify), and 128 0s for salt.
		//Use this as immutable.
		//When forkEditing, salt can change to anything by unitary transform or replacing it with its hash,
		//but the 4 iscleanvsdirty bits can only change from 1 to 0, similar to stackTime and stackMem can only decrease (or stay same) but not increase,
		//until the first call returns, then can start with any StackStuff you and stackTime stackMem etc you want.
		vm.defaultStackStuff = new vm.StackStuff(0,0,0,0,0); //FIXME start as what? FIXMe reset this before each next call while stack is empty.
		
		//FIXME these amounts to refill it to should very, depending on stats and amount of compute resources of caller,
		//but its just a small amount of compute resources to get started with,
		//or maybe its too much for small tests. Will need to play with these numbers to find what works.
		vm.refill = function(){
			//vm.stack* (stackTime stackMem stackStuff) are "top of the stack", used during calling lambda on lambda to find/create lambda.
			vm.stackTime = 10000000; //fill these back up before starting another call at bottom of stack, to avoid running out, but not until the stack becomes empty.
			vm.stackMem = 10000000;
			
			//In theory this prevents js stack from running out, by failing earlier, in a way opSpend can try/else.
			//This counts down per fn call (in a js function made by lambdize that does NODE.getEvaler()) deeper,
			//throws vm.gasErr if it runs out, then is incremented back to where it was.
			//
			//FIXME this is a way to prevent stackoverflowerrors in the outer system the VM is built in, such as on javascript python java or c++ stack, BUT FIXME what units to measure it in, stackframes? no, cuz they are variable size. ints or bytes or sizeof(pointer)? seems better but might be hard to count those. Figure it out.
			vm.stackDeep = 100;
			
			//QPUs, like any analog hardware, would need to come in as snapshot in param or using mutableWrapperLambda: vm.stackQpuCompile = 1000000; //TODO
			vm.stackGpuCompile = 1000000; //TODO. includes GPU, TPU, or any kind of parallel chip or stream processor that can do digital logic.
			vm.stackCpuCompile = 1000000; //TODO
			vm.stackNetworkUpload = 1000000; //TODO
			vm.stackNetworkDownload = 1000000; //TODO
			vm.stackDriveRead = 1000000; //TODO. this may be window.localStorage or in other VMs they might support harddrive/SSD but only for storage of nodes and blobs not executing.
			vm.stackDriveWrite = 1000000; //TODO. see stackDriveRead.
			vm.stackStuff = vm.defaultStackStuff;
		};
		
		vm.refill();
		
		
		/*
		NEW:
		//primaryKey is <int_or_maybe_double whichOpmutSpace, fn dedupedFn>. primaryKey of a dedupedFn is 64 bits. primaryKey of a non-deduped-fn is 128 bits.
		vm.Mut = function(whichOpmutSpace,dedupedFn){
			this.whichOpmutSpace = whichOpmutSpace; //primaryKey is <int_or_maybe_double whichOpmutSpace, fn dedupedFn>
			this.dedupedFn = dedupedFn; //primaryKey is <int_or_maybe_double whichOpmutSpace, fn dedupedFn>
			//this.hashInt = ...
			//FIXME have 2 dedupedFns here, one you're allowed to see and one you're not, to allow for isolating musical instrument parts etc?
			this.valMut = todo same whichOpmutSpace as this, of u; //same as this.valFn implies, TODO merge this disorganized code.
			//this.valFn = u; //FIXME TODO. This merges Mut.j with Mut.m as in findOrCreateMut(this.whichOpmutSpace,anyDedupedFn).valFn or .valDoubles
			this.valDouble = 0;
			this.valDoubles = emptyDoubleArray; //FIXME TODO
		};
		----------------
		OLD:
		//linkedlist of vm.OpmutState. vm.stackMut is the top OpmutState. vm.stackMut.prev.prev.prev... is the linkedlist.
		//The prev ptr is only for what happens when pop an OpmutState, when a call of opmut* (some opmut-related op) ends, that an opmut* had called an opmut* to create a new OpmutState.
		//Its not a recursive namespace.
		vm.stackMut = null;
		//vm.stackMutPtr = 0 or should this go in vm.stackMut.ptr or in compiled code with for loops if/else etc that uses vm.stackMutPtr.ints[ptr]?
		//The purpose of stackMutPtr is like a "this" or a "namespace" that opmut code runs relative to. If its for(let i=0; i<abc; i++){...} then 'i' and 'j' are
		//(another ptr is this int from cp) vm.stackMut.cp(vm.stackMutPtr,someNodeWhoseBitsAreUtf8OfIOrJChars), but in some faster way than that, caching things along the way, etc.
		//OpmutState/stackMut doesnt have the ability to list what fields have been set (such as cp(ptr,intOf_'i') or cp(ptr,intOf_'j'). It can read or write it if you know the key.
		//If you want to remember keys, you can make a linkedlist using cp(cp(somePtrRepresentingLinkedListType,leftPtr),rightPtr)->parentPtr or something like that.
		//All such int ptrs are interchangible with calling infcur on itself. The opmut leaf key (int 0) is infcur. (infcur infcur) is cp(0,0), and so on,
		//so state of an opmut call can be copied from and to lambdas, as its a map of (various combos of infcur) to some few things including int val, 2 double vals, Float64Array val, fn val.
		*/
		vm.stack_whichOpmutSpace;
		//as in "primaryKey is <int_or_maybe_double whichOpmutSpace, fn dedupedFn>". Up to a few thousand of these might exist at once
		//in one computer, but normally 1 or just a few at a time. Multiple exist when opmut calls opmut. After all that returns, all of them become garbcolable.
		
		vm.saveLoadStack = [];
		
		
		
		/*
		//save vm.stackTime, vm.stackStuff, etc, to be loaded after do something such as a call of ax.
		vm.saveStackTop = function(){
			this.saveLoadStack.push(
				this.stackTime,
				this.stackMem,
				this.stackGpuCompile,
				this.stackCpuCompile,
				this.stackNetworkUpload,
				this.stackNetworkDownload,
				this.stackDriveRead,
				this.stackDriveWrite,
				this.stackStuff
			);
		};
		
		//see vm.saveStackTop. Call this in a finally after saveStackTop in the try.
		vm.loadStackTop = function(){
			//FIXME verify this shouldnt be in reverse order
			this.stackStuff = this.saveLoadStack.pop();
			this.stackDriveWrite = this.saveLoadStack.pop();
			this.stackDriveRead = this.saveLoadStack.pop();
			this.stackNetworkDownload = this.saveLoadStack.pop();
			this.stackNetworkUpload = this.saveLoadStack.pop();
			this.stackCpuCompile = this.saveLoadStack.pop();
			this.stackGpuCompile = this.saveLoadStack.pop();
			this.stackMem = this.saveLoadStack.pop();
			this.stackTime = this.saveLoadStack.pop();
		};*/
	
		//vm.loglev is 0 for no logging, and higher numbers for more logging.
		vm.loglev = 1;
		
		/* very slow interpreted mode. add optimizations, as a linked list of evalers of whatever lambda,
		as recursive (of whatever evaler is in relevant fns/lambdas called on eachother) evalers,
		whose .prev is this or eachother leading to this, that when !evaler.on then evaler.prev is used instead.
		U().evaler is this rootEvaler. All other evalers are hooked in by aLambda().pushEvaler((vm,l,r)=>{...}), which sets its evaler.prev to aLambda().evaler before setting aLambda().evaler to the new one,
		and if the evaler doesnt have an evaler.on field, creates it as true.
		*/
		vm.rootEvaler = (vm,l,r)=>{
			//"use strict" is good, but not strict enough since some implementations of Math.sqrt, Math.pow, Math.sin, etc might differ
			//in the low few bits, and for that it only calls Math.sqrt (for example) if vm.stackIsAllowNondetRoundoff. Its counted as nonstrict mode in wikibinator203,
			//which it has 2^4=16 (update: 5^ see vm.mask_*) kinds of strict vs nonstrict that can be tightened in any of 4 ways on stack so stays tight higher on stack until pop back from there.
			//The strictest is pure determinism and will compute the exact same bits in every wikibinator203 VM. All halted lambdas are that strictest way,
			//and only during evaling 2 strictest lambdas to return at most 1 strictest lambda, between that you can use any of the 16 kinds of strict vs loose, and recursively tighten,
			//similar to vm.stackTime and vm.gasFastMem can be tightened to have less compute cycles and memory available higher on stack, but cant be increased after a call starts.
			"use strict";
			
			//TODO rename l to myL and r to myR, cuz l and r are ops.
			
			//TODO vm.wrapInTypeval (and just rename that to wrap) of l and r, such as doubles or strings.
			
			if(3<=vm.loglev)console.log('vm.rootEvaler l='+l+' r='+r);
			
			//if(3<=vm.loglev)console.log('opNameToO8='+JSON.stringify(vm.opNameToO8));
			vm.prepay(1,0);

			//If param of the lambda is a string, for example, this converts it to utf8 bits in a cbt (which is a lambda), wrapped in a typeval saying its a string.
			l = vm.wrap(l); //If is already a fn (vm.isWikibinator203Lambda and its type is 'function'), leaves it as it is
			r = vm.wrap(r);
			
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
					case o.StackIsAllowstackTimestackMem: //!isClean. allow stackMem and stackTime etc more than 1 level deep (clean lambdas cant see it, but can still run out of it, throws to just past the cleans)
						ret = vm.bit(stackMask & vm.mask_stackIsAllowstackTimestackMem);
					break;case o.StackIsAllowNondetRoundoff:
						ret = vm.bit(stackMask & vm.mask_stackIsAllowNondetRoundoff);
					break;case o.StackIsAllowMutableWrapperLambdaAndSolve:
						ret = vm.bit(stackMask & vm.mask_stackIsAllowMutableWrapperLambdaAndSolve);
					break;case o.StackIsAllowAx:
						ret = vm.bit(stackMask & vm.mask_stackIsAllowAx);
					break;case o.StackAllowReadLocalIds:
						ret = vm.bit(stackMask & vm.mask_stackAllowReadLocalIds);
						
						/*TODO use this to, with StackAllowReadLocalIds true, make a fast evallable textarea of wikibinator203 code,
							in a tree of voxel32s to make windows and subwindows recursively, and in some of those
							there will be localids (128 bits in this case, might allow different sizes in other VMs?)
							read by the user level code to choose what text to paint (as cbt of int32 voxels relative to a voxel y x)
								anywhere on screen, so use wikibinator203 code make a code editor of wikibinator203 code,
								using the optimization of can get localids instead of having to hash,
								so trading determinism for speed. Both ways will be supported by just swapping out an idMaker func.
						*/
							
						
					//StackAllowReadLocalIds used 1 more reserved index.
					//OLD: ignoring 2 reserved bits in mask vm.mask_reservedForFutureExpansion4 and vm.mask_reservedForFutureExpansion5
					break;case o.Bit0:case o.Bit1:
						ret = vm.ops.Infcur(l)(r); //cbt that exceeds max size
						//vm.infloop(); //cbt that exceeds max size
					break;case o.IsCbt:
						ret = vm.bit(z().isCbt());
					break;case o.ContainsAxConstraint:
						ret = vm.bit(z().containsAxConstraint());
					break;case o.Dplusraw:
						ret = vm.wrapRaw(y().d()+z().d());
					//break;
					
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
					
					/*break; case TODO a few opmut* ops that create/push, use, and call recursively, and cp(int,int)->int, and read and write doubleA doubleB intVal fn and Float64Array[up to 1 array per node] in OpmutState
						TODO
					*/
					break;case o.OpmutOuter:
						//FIXME todo remove opmut* and have it automatically start whenever the optimization would likely make things faster?
						//TODO merge opmutOuter and opmutInner?
						let mut = new Mut(0);
						mut.m.func = l; //(... opmut treeOfJavascriptlikeCode). it can use this to call itself recursively.
						mut.m.param = r; //param as in (... opmut treeOfJavascriptlikeCode param)
						ret = vm.opmut(m);
					break;case o.OpmutInner:
						//FIXME todo remove opmut* and have it automatically start whenever the optimization would likely make things faster?
						//TODO merge opmutOuter and opmutInner?
						vm.infloop();
						//throw 'TODO this is not normally called outside opmutOuter. What should it do? just act like an opmutOuter? Or infloop?';
					
						//UPDATE its down to 255 as in 1<<vm.maxCurriesLeft. FIXME go down to max 4095 params so an evaling can store the 4 bits that go on stack? cuz need those 4 bits. Halted lambdas are always clean (those 4 bits are 0).
						
						/*
						FIXME its 4x2: stackIsAllowstackTimestackMem, stackIsAllowNondetRoundoff, stackIsAllowMutableWrapperLambda, stackIsAllowMutableWrapperLambda.
						opcodes:
						stackIsAllowstackTimestackMem //the 2x2 kinds of clean/dirty/etc. exists only on stack. only with both isClean and isAllowSinTanhSqrtRoundoffEtc at once, is it deterministic. todo reverse order aka call it !isDirty instead of isClean?
						stackIsAllowNondetRoundoff //isAllowSinTanhSqrtRoundoffEtc //the 2x2 kinds of clean/dirty/etc. exists only on stack. only with both isClean and isAllowSinTanhSqrtRoundoffEtc at once, is it deterministic. todo reverse order?
						stackIsAllowMutableWrapperLambda
						stackIsAllowAx (fixme, is it varargAxCall or just axa (and maybe axb?))
						*/

					break;case o.S:
						ret = x(z)(y(z)); //the S lambda of SKI-Calculus
					break;case o.T:
						ret = y; //the K lambda of SKI-Calculus, but here we call it T (all namespaces are optional and TODO all should be derived at runtime, see the "localName" field etc).
					break;case o.F:
						ret = z;
					break;case o.L:
						ret = z().l;
					break;case o.R:
						ret = z().r;
					break;case o.IsLeaf:
						ret = Bit(z().o8()==1); //TODO optimize as: ret = Bit(z==u); ??? check that code
					break;case o.Pair:case o.Typeval:
						ret = z(x)(y); //the church-pair lambda
					break;case o.VarargAx:
						if(vm.stackIsAllowAx){
							//throw 'TODO ax';
							
							//FIXME this isnt right cuz thats just what happens when funcBodyAndVarargChooser gets it, but havent found funcBodyAndVarargChooser yet.
							//For now this is an evaler calling (varargAx funcBodyAndVarargChooser a b c d) on e, a b c d... nextParam/e.
							//
							//This wont happen until theres at least 9 params.
							//z is (pair_or_lazyeval_todochooseone (varargAx funcBodyAndVarargChooser a b c d) e).
							//let find = z().l.r; //starts as (varargAx funcBodyAndVarargChooser a b c d)
							//let funcBodyAndVarargChooser = TODO get eighth param;
							
							//
							//let find = y; //starts as (varargAx funcBodyAndVarargChooser a b c d)
							//while(find.n.l.n.curriesLeft() != 2) find = find.n.l; //lambda.n is the same as lambda()
							//FIXME can this be redesigned so that loop is faster? Maybe cache funcBody for use in op lambda and op varargAx?
							//let funcBodyAndVarargChooser = find.n.r;
							let funcBodyAndVarargChooser = y.n.funcBody();
							
							
							//FIXME prevent opOneMoreParam from interacting with ax constraints in some ways, since ax has to be verified
							//at every param starting at 9th param. At 8 params, the last param is funcBodyAndVarargChooser and hasnt evaled yet.
							//(ax funcBodyAndVarargChooser) is always halted.
							//(ax funcBodyAndVarargChooser a) is halted if (funcBodyAndVarargChooser (pair (ax funcBodyAndVarargChooser) a))->u.
							//(ax funcBodyAndVarargChooser a b) is halted if (funcBodyAndVarargChooser (pair (ax funcBodyAndVarargChooser a) b))->u.
							//and so on, for unlimited params. curriesLeft of ax is 2.
							//curriesLeft of everything after that is 1 meaning to verify constraint at each next param.
							//FIXME should it be lazyeval (Lx.Ly.Lz.xy) instead of pair?
							
							
							
							//FIXME??? varargAx should always have curriesLeft of 1 even after it gets its next curry, and next after that...
							//It can have unlimited curries since funcBodyAndVarargChooser chooses to be halted or to eval, at each next curry.
							
							//let nextParam = z;
							//vm.stackIsAllowAx
							
							throw 'FIXME use vm.stackStuff.stackIsAllow* etc, since vm.stackIsAllow* were moved to that.';
							/*vm.StackStuff.prototype.stackIsAllowNondetRoundoff = function(){
								return this.mask&vm.mask_stackIsAllowNondetRoundoff;
							};
							vm.StackStuff.prototype.stackAllowReadLocalIds = function(){
								return this.mask&vm.mask_stackAllowReadLocalIds;
							};
							vm.StackStuff.prototype.stackIsAllowMutableWrapperLambdaAndSolve = function(){
								return this.mask&vm.mask_stackIsAllowMutableWrapperLambdaAndSolve;
							};
							vm.StackStuff.prototype.stackIsAllowAx = function(){
								return this.mask&vm.mask_stackIsAllowAx;
							};
							vm.StackStuff.prototype.stackIsAllowstackTimestackMem = function(){
								return this.mask&vm.mask_stackIsAllowstackTimestackMem;
							};
							*/
							
							//tighten clean/dirty higher in stack during verifying ax constraint so its deterministic.
							let prev_stackIsAllowstackTimestackMem = vm.stackIsAllowstackTimestackMem;
							let prev_stackIsAllowMutableWrapperLambda = vm.stackIsAllowMutableWrapperLambda;
							let prev_stackIsAllowNondetRoundoff = vm.stackIsAllowNondetRoundoff;
							//vm.saveStackTop(); no cuz only want some of the cleanVsDirtyBits.
							
							let axEval;
							try{
								//cuz ax must be deterministic
								vm.stackIsAllowstackTimestackMem = false;
								vm.stackIsAllowMutableWrapperLambda = false;
								vm.stackIsAllowNondetRoundoff = false;
								
								axEval = funcBodyAndVarargChooser(ops.Infcur(l)(r)); //evals to u/theUniversalFunction to define l(r) as halted, else evals to u(theReturnVal)
							}finally{ //in case throws vm.gasErr
								//put clean/dirty back on stack the way it was
								vm.stackIsAllowstackTimestackMem = prev_stackIsAllowstackTimestackMem;
								vm.stackIsAllowMutableWrapperLambda = prev_stackIsAllowMutableWrapperLambda;
								vm.stackIsAllowNondetRoundoff = prev_stackIsAllowNondetRoundoff;
							}
							
							if(axEval === u){
								ret = vm.cp(l,r); //l(r) is halted. l(r) is whats evaling right now, which is what makes varargAx a strange op.
							}else{
								ret = axEval().r; //L(axEval). TODO optimize by L and R and isLeaf ops dont cache, just return instantly by getting those fields
							}
							//FIXME, if any lambda contains a call of varargAx with more than 8 params, since that means a constraint has been verified, //then stackIsAllowAx bit must be 1 when halted.
						}else{
							//prevent ax constraints from existing that werent verified.
							//They wont be verified while !vm.stackIsAllowAx, so during that, verify says fail.
							vm.infloop();
						}
						//OLD, cuz opOneMoreParam is replaced by op Lambda and op MutLam: FIXME it said somewhere said that opOneMoreParam is the only vararg, but actually theres 3: infcur, varargAx, and opOneMoreParam.
						//so update comments and maybe code depends on that?
					break; case o.OpCommentedFuncOfOneParam:
						//(OpCommentedFuncOfOneParam commentXYZ FuncOfOneParam Param)->(FuncOfOneParam Param)
						ret = y(z);
					break;case o.Sqrt: //of a cbt64 viewed as float64
						if(vm.stackIsAllowNondetRoundoff){
							let float64 = TODO;
							throw 'ret = TODO wrap Math.sqrt(float64) in cbt64;';
							throw 'TODO';
						}else{
							throw 'TODO either compute the exact closest float64 (and what if 2 are equally close, and should it allow subnormals?) (try to do that, choose a design) or infloop (try not to)';
						}
					break; case o.LambdaParams:
						ret = vm.lambdaParamsInfcurInReverseOrder(z);
						//z is (LazyEval (Lambda FuncBody [x y z] valX valY) valZ) or (Lambda FuncBody [x y z] valX ...).
						//Returns an infcurStream, in those 2 cases, [y valY x valX] or [y valY x valX],
						//since the reverse order is faster and order of the key/vals only matters if theres duplicate keys.
						//There could be duplicate keys like (Lambda FuncBody [y x y y z] ...)
						//but thats only allowed since its faster than checking for duplicates,
						//and I dont expect people to want to do that.
						//If they do, the first y in [y x y y z] becomes the last y in [z val y val y val x val y val].
						
					
						//throw 'TODO';
						//vm.addOp('lambdaParams',false,1,'Used with (Lambda FuncBody [x y z] valX valY valZ) -> (FuncBody (LazyEval (Lambda FuncBody [x y z] valX valY) valZ)). (LambdaParams (LazyEval (Lambda FuncBody [x y z] valX valY) valZ)) -> [x valX y valY z valZ], but it can be a different number of params. Lambda takes up to (TODO find exact number) around 240-something or 250-something params.');
					
					break; case o.Qes:
						{
							//TODO merge duplicate code between qes and seq
							let reverseSeq = y;
							//qes is like the seq op except in reverse order cuz its more efficient, but less intuitive.
							let state = z; //x in (_[a b c] x)
							while(reverseSeq().hasMoreThan7Params()){
								let func = reverseSeq().r;
								state = func(state);
								reverseSeq = reverseSeq().l;
							}
							ret = state;
						}
					break; case o.Seq:
						{
							//TODO merge duplicate code between qes and seq
							//vm.addOp('seq',false,2,'The _ in (_[a b c] x) means ((Seq [a b c]) x) which does (c (b (a x))), for any 	vararg in the [].');
							
							let reverseSeq = vm.reverseInfcurlikeList(y); //might be faster this way (than the commentedout code below) by using funcallCache cuz can look it up instead of looping over the list.
							let state = z; //x in (_[a b c] x)
							while(reverseSeq().hasMoreThan7Params()){
								let func = reverseSeq().r;
								state = func(state);
								reverseSeq = reverseSeq().l;
							}
							ret = state;
						}
						
						
						/* above comment says "the commentedout code below".
						vm.prepay(1,1);
						let infcurList = y;
						let reverseSeq = [];
						while(infcurList().hasMoreThan7Params()){
							vm.prepay(1,1);
							reverseSeq.push(infcurList().r);
							infcurList = infcurList().l;
						}
						let param = z;
						for(let funcInSeq of reverseSeq){
							param = funcInSeq(param);
						}
						ret = param;
						*/
					break; case o.HasMoreThan7Params:
						return vm.Bit(z().hasMoreThan7Params());
					break;default:
						throw 'o8='+o8+' TODO theres nearly 128 opcodes. find the others in "todo these ops too..." Comment.';
				}
				return cache.ret = ret;
			}
		};
		vm.rootEvaler.on = true; //vm.rootEvaler.on must always be true, and vm.rootEvaler.prev must always be null, cuz its deepest in linkedlists of evalers.
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
		let U = u;

		//u.evaler = vm.rootEvaler();
		//this happens in Node constructor: u.evaler = rootEvaler; //all other evalers, use theLambda.pushEvaler((vm,l,r)=>{...});
		//let op0000001 = u;
		//this breaks thingsu.func = u(u)(u)(u)(u)(u)(u)(u); //identityFunc.
		u().l = vm.identityFunc = vm.cp(u,u,u,u,u,u,u,u,u); //aka (f u).
		u().r = u;
		
		vm.uu = vm.u(vm.u);
		
		vm.o8ToLambda = function(o8){
			//if(3<=vm.loglev)console.log('vm.o8ToLambda '+o8);
			if(o8 > 255) throw 'o8='+o8;
			if(o8 == 1) return vm.u;
			let exceptLastParam = vm.o8ToLambda(o8>>1);
			//return exceptLastParam((o8&1) ? uu : u);
			return vm.cp(exceptLastParam, ((o8&1) ? vm.uu : vm.u));
		};
		
		vm.Node.prototype.vm = vm; //can get this like u().vm or u(u)(u(u))(u).vm for example.
		
		//op is known at 7 params.
		//TODO optimize this by storing a hasMoreThan7Params bit in headerInt mask?
		vm.Node.prototype.hasMoreThan7Params = function(){
			return this.o8()==this.l().o8();
		};
		
		vm.Node.prototype.hasLessThan7Params = function(){
			return this.o8() < 128;
		};
		
		vm.lambdasAreSameOp = function(a,b){
			return a().o8()==b().o8();
		};
		
		
		
		
		//see vm.eval(string)->fn and ''+fn aka fn.toString() which is defined in lambdize function.
		
		
		//Start here for parse and tostring of combos of fns. View and Viewing are used inside it.
		//
		//new Viewer().fnToString(anyFn) -> code string. TODO hook that into toString of fn (aka of what lambdize returns).
		//
		//Start here for parse and tostring of combos of fns. View and Viewing are used inside it.
		//A parser and tostringer, for using wikibinator203 as a programming language.
		//You dont have to use this syntax, since its turingComplete and can make its own syntaxes.
		//Its just an example syntax you could use, something to get started with.
		//This makes View objects, 1 per fn (output of lambdize).
		//You can open and close branches, view as a name or literal bits or literal double, or expanded,
		//view as {} or [] or () or <> , ? . _ etc.
		//Start with new vm.Viewer(), then call its funcs on fns.
		vm.Viewer = function(){
			this.views = new Map();
			
			this.localNameToView = {}; //FIXME it appears 2022-7-10 this is not being used or not every time it should be. is only this.views being used?
			
			//FIXME those seem old design. see syty and < [ { ( : etc.
			this.syntaxTypeIsLeaf = {'U':true, '0':true, '_':true, ',':true};
		};
		
		//internal datastruct of Viewer.
		//
		//wrapper of a fn, in context of a Viewer that remembers which branches are open/closed
		//and maybe the #Names of fns for where they occur more than once.
		vm.View = function(viewer, fn){
			this.viewer = viewer; //what makes these View objects
			this.fn = fn; //the fn its a View of		
			this.localName = null; //FIXME ive been using view.fn.localName instead.
			this.hasDefinedBeforeUsingName = false;
			//Example: '_' for Seq, 'U' for theUniversalLambda, and maybe ',' for T but I tend to write T when its by itself.
			this.builtInName = fn.builtInName || null; //replace undefined with null
			//Examples: '(', '{', '[', '<', '0', '_', ',', '.'.
			//I might just do ( { [ < and maybe U, and just use builtInName and localName etc to know where to end recursion.
			//Also, stringliterals can have any chars in it and they start with ' (or is it "?).
			this.syntaxType = null;
		};
		
		//internal datastruct of Viewer.
		//
		//during a tostring from a fn recursively into its childs, accumulate strings in this.tokens.
		//A Viewing is a param of fnToStringRecurse.
		//You normally use 2 Viewing per fnToStringRecurse,
		//the first time to count the number of incoming ptrs per fn (if 2 or more, then it needs a #LocalName,
		//and the second time to use those counts, to choose to make up a #LocalName or not per fn.
		vm.Viewing = function(){
			this.tokens = []; //strings
			this.stack = []; //stack of View.
			//map of View to number, only counting refs (incoming pointer) that are displayed, not counting those inside double literals etc.
			this.refCount = new Map();
			this.indentString = '\t';
			this.pt = null; //a vm.ParseTree. TODO use this?
		};
		
		vm.Viewer.prototype.newViewing = function(){
			return new vm.Viewing();
		};
		
		vm.Viewing.prototype.incRefs = function(view){
			this.refCount[view] = (this.refCount[view]|0)+1; //the |0 makes it 0 if its undefined
		};
		
		vm.Viewing.prototype.refs = function(view){
			return this.refCount[view]|0;
		};
		
		//I'm about to put space in as a token where needed, but not after _ or , etc.
		//OLD...
		//
		//TODO should this handle indenting (this.indentString)? Or should that go in tokens?
		//
		//FIXME For now I'm just joining tokens with 1 space between each, which will look terrible, but I need to get it working first.
		vm.Viewing.prototype.makeString = function(){
			//let code = this.tokens.join(' ');
			//return code;
			return this.tokens.join('');
		};
		
		//FIXME dont include any names by default. But for now, including all the op names (in vm.ops),
		//cuz the Name# system isnt working yet.
		vm.newDefaultNamespace = function(){
			let ret = {};
			for(let opName in vm.ops) ret[opName] = vm.ops[opName];
			return ret;
		};
		
		vm.bit = bit=>(bit?vm.ops.T:vm.ops.F);

		//vm.getViewer().tokenize('[(Pair L R (T T)) ]') -> ['[', '(', 'Pair', ' ', 'L', ' ', 'R', ' ', '(', 'T', ' ', 'T', ')', ')', ' ', ']'].
		//Problem is, that last ' ' (before the ']') makes it parse wrong, so this removes it, so to fix it this returns
		//['[', '(', 'Pair', ' ', 'L', ' ', 'R', ' ', '(', 'T', ' ', 'T', ')', ')', ']'].
		vm.filterTokens = tokens=>{
			let ret = [];
			let i = 0;
			while(i < tokens.length-1){
				if(!(vm.strIsAllWhitespace(tokens[i]) && (vm.strIsAllWhitespace(tokens[i+1]) || vm.isPopToken(tokens[i+1])))){
					ret.push(tokens[i]);
				}//else skip that whitespace since its before [whitespace or pop token].
				i++;
			}
			ret.push(tokens[tokens.length-1]);
			if(vm.strIsAllWhitespace(ret[0])) throw 'First token is all whitespace in '+JSON.stringify(ret);
			if(vm.strIsAllWhitespace(ret[ret.length-1])) throw 'Last token is all whitespace in '+JSON.stringify(ret);
			return ret;
		};
		
		//returns a vm.ParseTree
		vm.parse = function(wikibinator203CodeString){
			wikibinator203CodeString = wikibinator203CodeString.trim();
			//return vm.getViewer().eval(wikibinator203CodeString);
			let v = vm.getViewer();
			let rawTokens = v.tokenize(wikibinator203CodeString);
			let tokens = vm.filterTokens(rawTokens); //remove whitespace before ], for example, which would make it parse wrong.
			let parsing = new vm.Parsing(tokens); //doesnt do much yet. just wrap the tokens.
			return v.tokensToParseTree(parsing);
		};
		
		//vm.afterParse(vm.parse(wikibinator203CodeString,optionalNamespace)) is same as 
		//vm.afterParse = function(wikibinator203CodeString){
		
		//string -> fn
		//
		//Normally implemented in vm.Viewer.prototype.eval
		vm.eval = function(wikibinator203CodeString,optionalNamespace){
			wikibinator203CodeString = wikibinator203CodeString.trim();
			if(!wikibinator203CodeString) return vm.identityFunc;
			let parseTree = vm.parse(wikibinator203CodeString);
			let namespace = optionalNamespace || vm.newDefaultNamespace(); //is modified by parseTree.eval if that defines names, and is read.
			return parseTree.eval(namespace);
		};
		
		vm.Viewer.prototype.fnToString = function(fn){
			let viewing = this.newViewing();
			
			//FIXME, this sets view.fn.hasDefinedBeforeUsingName to false, instead of view.hasDefinedBeforeUsingName to false.
			this.setAllToFalse_hasDefinedBeforeUsingName();
			
			//FIXME should this call viewing.setAllToFalse_hasDefinedBeforeUsingName() ? I was about to do that, but then saw its making a new viewing.
			//Should that be in viewer instead of viewing? The viewer is reused (as of 2022-7-10).
			
			//this.viewToStringRecurse(this.view(fn), viewing, false);
			this.viewToStringRecurse(this.view(fn), viewing, 'C', true);
			if(2<=vm.loglev)console.log('tokens: '+JSON.stringify(viewing.tokens));
			return viewing.makeString();
		};
		
		vm.Viewer.prototype.setAllToFalse_hasDefinedBeforeUsingName = function(){
			//FIXME what if some arent included cuz they dont have a localName?
			//for(let view in this.localNameToView){
			//	view.hasDefinedBeforeUsingName = false;
			//}
			this.views.forEach((view,fn)=>{ //value,key
				view.hasDefinedBeforeUsingName = false;
			});
		};

		//a cbt is a fn/lambda, a powOf2 number of bits (Bit0 or Bit1).
		vm.cbtToHex = cbt=>{
			if(!cbt().isCbt()) throw 'Not a cbt';
			let h = cbt().cbtHeight();
			let Bit1 = vm.ops.Bit1;
			if(h < 2) throw 'Too few cbt bits for a hex digit, h='+h;
			if(h == 2){
				let a = cbt().l().l;
				let b = cbt().l().r;
				let c = cbt().r().l;
				let d = cbt().r().r;
				let hexInt4 = ((a==Bit1)?8:0)|((b==Bit1)?4:0)|((c==Bit1)?2:0)|((d==Bit1)?1:0);
				return '0123456789abcdef'[hexInt4];
			}else{
				return vm.cbtToHex(cbt().l)+vm.cbtToHex(cbt().r);
			}
		};
		
		
		//If true displays vm.eval('h') as h. If false displays it as (Typeval U 0b01101000).
		//vm.isDisplayStringLiterals = false;
		vm.isDisplayStringLiterals = true;
		
		//TODO syntax ## (see OpCommentedFuncOfOneParam)
		vm.Viewer.prototype.viewToStringRecurse = function(view, viewing, callerSyty, isRightRecursion){
			//FIXME this is way too simple, just having U and ( and ) and builtInName, but its somewhere to start.
			
			let doName = false;
			//if(view.builtInName && view.fn != ops.Infcur){ //FIXME
			//if(view.builtInName && view.fn != ops.Infcur){ //FIXME
			//if(view.fn.localName && view.fn != ops.Infcur){ //FIXME

			let FN = view.fn();
			let isCbt = FN.isCbt();
			let isSmallCbt = isCbt;//TODO && (FN.cbtSize()<=256); //or what should the max cbt size (in bits) be to display as literal?
			
			//let isTypevalOf2Params = FN.o8()==vm.o8OfTypeval && FN.curriesLeft()==1;
			
			//WARNING: this only works if deduped and is not a lazy blob,
			//which is true in this prototype VM. Using o8() is the more general way.
			let isUtf8String = FN.l==vm.utf8Prefix;
			//FN.r() would normally be a cbt, but does not technically have to be. Its only useful if its a cbt.
			let isSmallUtf8String = isUtf8String && FN.r().cbtSize() <= 256;
			

			//TODO also small string literals, with a few syntaxes for that,
			//one syntax if its small and no whitespace and starts with lowercase letter then its a string literal,
			//and one syntax for if its longer but within some size limit (dont make people read pages of text in a literal),
			//and there will be literals for various number types such as float64 and int32 etc but I havent decided which types yet,
			//and for raw cbts as 0b1110001101111100 or maybe hex 0x.
			let isLiteral = isSmallCbt || (vm.isDisplayStringLiterals && isSmallUtf8String);
			//let isLiteral = isSmallCbt;

			if(view.fn.localName){ //FIXME
				if(view.fn != ops.Infcur){
			
					/*FIXME this is making it tostring the code wrong the second time its tostringed
					since the first time, it defines_and_uses view.fn.localName,
					but second and later times it only uses that so it doesnt get defined and all you see is the name in that part of code.
					To fix that, need to track which fns (or views of them?) have been displayed so far.
					I created view.hasDefinedBeforeUsingName to try to fix that, TODO...
					*/
				
				
					//includes U (or FIXME is it still lowercase u? cuz Names cant start with lowercase
					//cuz thats automatic string literal if it has no spaces.)
					//viewing.tokens.push(view.builtInName);
					viewing.tokens.push(view.fn.localName);
					if(view.fn().isLeaf()) view.hasDefinedBeforeUsingName = true; //dont define inside leaf, even though it wraps around ("tie the quine knot")
					doName = true;
					//console.log('viewing.tokens.push builtInName '+view.builtInName);
					if(2<=vm.loglev)console.log('viewing.tokens.push localName (not part of View, FIXME): '+view.fn.localName);
				}else{
					//viewing.tokens.push('[');
					//viewing.tokens.push(']');
					viewing.tokens.push('[]');
					if(2<=vm.loglev)console.log('viewing.tokens.push Infcur as []');
				}
			}else if(isLiteral){ //this is after checking for localName, so you can name a literal if you want.
				if(FN.isCbt()){ //FN is view.fn()
					/*let cbtHeight = FN.cbtHeight();
					if(cbtHeight <= 3) throw 'cbt1 to cbt8 should already have localName like 0b10011111';
					*/
					viewing.tokens.push('0x'+vm.cbtToHex(view.fn));
				}else if(isSmallUtf8String){
					//utf8 bytes in a cbt. It may have content.blob or not, since thats just an optimization
					//of a complete binary tree (cbt) of vm.ops.Bit0 and vm.ops.Bit1. If it has blob, the utf8 bytes,
					//padded with a 1 bit then 0s to the next powOf2 number of bits,
					//are in content.blob in byte range content.blobFrom (inclusive) to content.blobTo (exclusive).
					//If thats at most pow(2,31)-1 bits then that bitstring size (of utf8 bytes) is in content.bize
					//unless content.bize is negative
					//in which case it hasnt computed the bize yet (bize==-2) or is not a cbt (bize==-1).
					//As of 2022-7-23 this is the first time in wikibinator203 that I'm using blob and bize
					//so there are probably some more functions that should be added to vm.Node.prototype to make this easier.
					let content = FN.r;
					let utf8Bytes = content.n.bytes();
					//FIXME quote it if it contains whitespace or ( ) { } [ ] < > , or certain other chars or depending on size.
					//If it starts with a lowercase letter or most of the other unicode chars then it can be a string literal without quotes.
					//If it starts with a capital A-Z then its a #Name. If you want other unicode chars in a #Name then just prefix with 1 of A-Z.
					let smallString = vm.utf8AsUint8ArrayToString(utf8Bytes); //TODO optimize by caching this?
					console.log(utf8Bytes.length+' bytes ('+utf8Bytes.join(',')+') became '+smallString.length+' chars: '+smallString);
					//viewing.tokens.push('SMALLSTRING_'+smallString);
					viewing.tokens.push(smallString); //FIXME quote it if it starts with capital A-Z or if it contains whitespace or certain other chars
					
					//throw 'TODO use node.bytes';
				}else{
					throw 'TODO some other kind of literal, to code string';
				}
			}
			//Would do both, name and define what is named that, if it was given a view.fn.localName from an earlier tostring.
			//if((!doName || !view.fn.hasDefinedBeforeUsingName) && !view.builtInName){ //!view.builtInName (such as 'S') cuz dont define below that.




			let displayChilds = !view.hasDefinedBeforeUsingName && !view.builtInName && !isLiteral;
			//if(!view.hasDefinedBeforeUsingName && !view.builtInName){ //!view.builtInName (such as 'S') cuz dont define below that.
			if(displayChilds){ //!view.builtInName (such as 'S') cuz dont define below that.
				view.hasDefinedBeforeUsingName = true;
				if(doName){
					//# like in... [(Pair Pair) (F F) CallParamOnItself#{I#(F U) I}]
					viewing.tokens.push('#');
				}
				
				//FIXME where to put the info that something is a (S Thing)? cuz (S (S A B) C) is {A B C} aka {{A B} C}.
				//Should that be syntaxtype 'S' or '(S' etc?
				
				let syty = view.syty();
				switch(syty){
					case 'GV': //<...>
						throw 'TODO';
					//break; case 'start[':
					break; case 'IC0':
					
						viewing.tokens.push('[]'); //empty Infcur list aka Infcur itself
					
						/*if(isRightRecursion){
							viewing.tokens.push('[]'); //empty Infcur list aka Infcur itself
						}else{
							let callerSytyIsSimilar = callerSyty=='IC0' || callerSyty=='IC+';
							if(!callerSytyIsSimilar) viewing.tokens.push('[');
							this.viewToStringRecurse(view.l(), viewing, syty, false);
							viewing.tokens.push(' ');
							console.log('start[ pushed space');
							this.viewToStringRecurse(view.r(), viewing, syty, true);
							if(!callerSytyIsSimilar) viewing.tokens.push(']');
						}*/
					
						/*
						viewing.tokens.push('['); //FIXME
						if(view.fn != ops.Infcur){
							this.viewToStringRecurse(view.l(), viewing, syty, false); //FIXME
							viewing.tokens.push(' ');
							console.log('start[ pushed space');
							this.viewToStringRecurse(view.r(), viewing, syty, true); //FIXME
						}
						viewing.tokens.push(']'); //FIXME
						*/
						
					break; case 'IC+':
					
						if(isRightRecursion) viewing.tokens.push('[');
						if(view.lsyty() != 'IC0'){
							this.viewToStringRecurse(view.l(), viewing, syty, false);
							viewing.tokens.push(' ');
							if(2<=vm.loglev)console.log('[ pushed space');
						}
						this.viewToStringRecurse(view.r(), viewing, syty, true);
						if(isRightRecursion) viewing.tokens.push(']');
					
						/*
						//if(!inVararg) viewing.tokens.push('['); //FIXME
						//if(view.fn != ops.Infcur){
							this.viewToStringRecurse(view.l(), viewing, syty, false); //FIXME
							viewing.tokens.push(' ');
							console.log('[ pushed space');
							this.viewToStringRecurse(view.r(), viewing, syty, true); //FIXME
						//}
						//if(!inVararg) viewing.tokens.push(']'); //FIXME
						
						/*
						if(!inVararg) viewing.tokens.push('['); //FIXME
						if(view.fn != ops.Infcur){
							this.viewToStringRecurse(view.l(), viewing, true); //FIXME
							viewing.tokens.push(' ');
							console.log('[ pushed space');
							this.viewToStringRecurse(view.r(), viewing, true); //FIXME
						}
						if(!inVararg) viewing.tokens.push(']'); //FIXME
						*/
						/*if(!inVararg){
							viewing.tokens.push('['); //FIXME
							this.viewToStringRecurse(view.l(), viewing, true);
							viewing.tokens.push(' ');
							this.viewToStringRecurse(view.r(), viewing, true); //FIXME
							//FIXME? viewToStringRecurse will do this: viewing.tokens.push(']');
							viewing.tokens.push(']'); //FIXME
						}else{
							
						}*/
					//break; case '{':
					break; case 'S2':
						if(isRightRecursion || callerSyty != 'S2') viewing.tokens.push('{'); //FIXME
						//this.viewToStringRecurse(view.l(), viewing);
						this.viewToStringRecurse(view.l().r(), viewing, syty, false);
						viewing.tokens.push(' ');
						if(2<=vm.loglev)console.log('{ pushed space');
						this.viewToStringRecurse(view.r(), viewing, syty, true); //FIXME
						if(isRightRecursion || callerSyty != 'S2') viewing.tokens.push('}'); //FIXME
					/*break; case '{':
						if(!inVararg) viewing.tokens.push('{'); //FIXME
						//this.viewToStringRecurse(view.l(), viewing);
						this.viewToStringRecurse(view.l().r(), viewing, true);
						viewing.tokens.push(' ');
						console.log('{ pushed space');
						this.viewToStringRecurse(view.r(), viewing, true); //FIXME
						if(!inVararg) viewing.tokens.push('}'); //FIXME
					*/
					break; case '_1':
						viewing.tokens.push('_');
						this.viewToStringRecurse(view.r(), viewing, syty, true);
					break; case 'T1':
						viewing.tokens.push(',');
						this.viewToStringRecurse(view.r(), viewing, syty, );
					break; case 'C': case 'S1': //C is normal call (a b c d e) aka ((((a b) c) d) e)
						if(view.builtInName){
							viewing.tokens.push(view.builtInName);
						}else{
							let callerSytyIsSimilar = callerSyty=='C' || callerSyty=='S1';
							if(isRightRecursion || !callerSytyIsSimilar) viewing.tokens.push('(');
							this.viewToStringRecurse(view.l(), viewing, syty, false);
							viewing.tokens.push(' ');
							if(2<=vm.loglev)console.log('( pushed space');
							this.viewToStringRecurse(view.r(), viewing, syty, true);
							if(isRightRecursion || !callerSytyIsSimilar) viewing.tokens.push(')');
						}
					break; default:
						throw 'Unknown syntaxtype: '+syty;
				}
				//so dont define it again, just use name, until the next tostring which should set
				//all relevant hasDefinedBeforeUsingName to false so they get defined again.
				//view.hasDefinedBeforeUsingName = true;
			}
			
		};
		
		//syntax type
		//Fills in this.syntaxType recursively, down to whatever is the smallest displayable part,
		//like U/theUniversalLambda or 3.45 a double literal, etc. Stops where this.syntaxType exists.
		//vm.view.fillInSyntaxTypeRecursively = function(){
		vm.View.prototype.syty = function(){
			if(this.syntaxType) return this.syntaxType;
			let fn = this.fn;
			
			if(fn().isLeaf()){
				this.syntaxType = 'U';
				//dont call lsyty rsyty or lrsyty past U cuz might infloop
				
			//TODO GV aka getvar syntax, displayed as < ... >	
			
			}else if(fn == ops.S){
				this.syntaxType = 'S0';
			}else if(fn == ops.Infcur){
				this.syntaxType = 'IC0';
			}else if(fn == ops.Seq){
				this.syntaxType = '_0'; //FIXME remove isUnaryToken syntax and make a lack of space between things, or : between things if they cant have a space, mean (a (b (c d))) such as a(b c)d  or a(b)(c)d or (a b)c:d all mean the same thing.
			}else if(fn == ops.T){
				this.syntaxType = 'T0'; //FIXME remove isUnaryToken syntax and make a lack of space between things, or : between things if they cant have a space, mean (a (b (c d))) such as a(b c)d  or a(b)(c)d or (a b)c:d all mean the same thing.
			}else{
				let lsyty = this.lsyty();
				let rsyty = this.rsyty();
				//let lrsyty = this.lrsyty();
				if(lsyty == 'S0'){
					this.syntaxType = 'S1';
				}else if(lsyty == 'S1'){
					this.syntaxType = 'S2';
				}else if(lsyty == 'IC0' || lsyty == 'IC+'){
					this.syntaxType = 'IC+';
				}else if(lsyty == '_0'){ //FIXME remove isUnaryToken syntax and make a lack of space between things, or : between things if they cant have a space, mean (a (b (c d))) such as a(b c)d  or a(b)(c)d or (a b)c:d all mean the same thing.
					this.syntaxType = '_1';
				}else if(lsyty == 'T0'){ //FIXME remove isUnaryToken syntax and make a lack of space between things, or : between things if they cant have a space, mean (a (b (c d))) such as a(b c)d  or a(b)(c)d or (a b)c:d all mean the same thing.
					this.syntaxType = 'T1';
				}else{
					this.syntaxType = 'C'; //normal call (a b c d e) aka ((((a b) c) d) e)
				}
			}
			
			/*
			let fnL = this.fn().l;
			if(fn().isLeaf()){
				this.syntaxType = 'U';
			//}else if(node.l == ops.S){
				//this.syntaxType = 'S';
			}else if(fnL().l == ops.S){
				this.syntaxType = '{';
			//}else if(fn == ops.Infcur || this.l().SyntaxType()=='['){
			//	this.syntaxType = '[';
			}else if(fnL == ops.Infcur){
				this.syntaxType = 'start[';
			}else if(this.l().SyntaxType()=='[' || this.l().SyntaxType()=='start['){
				this.syntaxType = '[';
			}else if(fnL == ops.Seq){
				this.syntaxType = '_'; //FIXME use ops.Seq.builtInName which is '_'?
			}else if(fnL == ops.T){
				this.syntaxType = ','; //FIXME use ops.T.builtInName which is ','?
			//TODO < > for ? and ?2 aka the variants of GetVar etc.
			}else{
				this.syntaxType = '('; //FIXME could be { [ <, which are all views of a larger number of (.
			}
			*/
				
			/*}else if(node.IsCbt() && cbtheight is at most 6 (size of double/long)){
				TODO
			}else{
				need to know to reuse its localName vs if this is the first display of it.
				TODO should there be a ToStringing/Stringer/Viewing class that remembers those things?
				TODO should View.syntaxType have to care if its the first or later tostring? could do that separately.
				
				
			}
			Fills in this.syntaxType recursively, down to whatever is the smallest displayable part, like U/theUniversalLambda or 3.45 a double literal, etc.
			*/
			
			return this.syntaxType;
		};
		
		
	
		
		
		
		
		//left child syntax type
		vm.View.prototype.lsyty = function(){
			return this.l().syty();
		};
		
		//right child syntax type
		vm.View.prototype.rsyty = function(){
			return this.r().syty();
		};
		
		//right child of left child syntax type, like the syty of X in ((S X) Y) aka (S X Y) aka {X Y}.
		vm.View.prototype.lrsyty = function(){
			return this.l().r().syty();
		};
		
		//get View of fn's left child
		vm.View.prototype.l = function(){
			return this.viewer.view(this.fn().l);
		};
		
		//get View of fn's right child
		vm.View.prototype.r = function(){
			return this.viewer.view(this.fn().r);
		};
		
		//creates or reuses the same vm.View of the same (by ===) fn,
		//which means the fn can be duplicate forest shape as long as it has different idA idB blobFrom blobTo.
		vm.Viewer.prototype.view = function(fn){
			let ret = this.views.get(fn);
			if(!ret) this.views.set(fn, ret = new vm.View(this,fn));
			return ret;
		};
		
		vm.View.prototype.setLocalName = function(localName){
			if(!localName) throw 'localName='+localName;
			let v = this.viewer.localNameToView[localName];
			if(v == null){
				this.localName = localName;
			}else{
				if(v == this){
					if(this.localName != localName){
						delete this.viewer[this.localName];
						this.viewer[localName] = this;
						this.localName = localName;
					}
				}else{
					throw 'Name already used (by a different View): '+localName;
				}
			}
		};
		
		//returns a string without comments
		vm.Viewer.prototype.removeComments = function(wikibinator203CodeString){
			if(wikibinator203CodeString.includes('//') || wikibinator203CodeString.includes('/*')) throw 'TODO';
			return wikibinator203CodeString;
		};
		
		//called by tokenize, to get the string literals out to avoid tokenizing inside them.
		vm.Viewer.prototype.tokenizeStringLiterals = function(wikibinator203CodeString){
			if(wikibinator203CodeString.includes("'")) throw 'TODO';
			return [wikibinator203CodeString];
		}
		
		//key is char. val is true. these are not for splitting in string literals, just for the parts of code between them.
		vm.Viewer.prototype.simpleSplitCharsSet = {};
		for(let ch of '#:_,()[]{}<>? \t\r\n') vm.Viewer.prototype.simpleSplitCharsSet[ch] = true;
		//FIXME maybe . shouldnt be a splitChar like in .varA.b.cde if its also going to be used in number literals like 3.4 .
		
		//code thats before, between, or after string literals -> list of tokens.
		vm.Viewer.prototype.tokenizeBetweenStringLiterals = function(partOfWikibinator203CodeString){
			let tokens = [];
			let s = ' '+partOfWikibinator203CodeString+' ';
			let from = 0, toExcl = 0;
			let splitSet = this.simpleSplitCharsSet;
			while(from < s.length){
				do{
					toExcl++
				}while(toExcl < s.length-1 && !splitSet[s[toExcl-1]] && !splitSet[s[toExcl]]);
				//let token = s.substring(from,to).trim();
				let token = s.substring(from,toExcl);
				//if(token.length) tokens.push(token); //dont include whitespace
				tokens.push(token);
				from = toExcl;
			}
			let startIndex = tokens[0]==' ' ? 1 : 0;
			let endIndexExcl = tokens[tokens.length-1]==' ' ? tokens.length-1 : tokens.length;
			let tokensButSomeNeedMerge = tokens.slice(startIndex,endIndexExcl);
			//next, merge # onto the end of whatever token came just before it, like AName#(...) or A#a:B#b:C#c
			tokens = [];
			for(let token of tokensButSomeNeedMerge){
				if(token == '#'){
					if(!tokens.length) throw 'cant start with #. It goes after a Name# or for CommentedFunc (or what was that op called) its Name##(...).';
					tokens[tokens.length-1] += token;
				}else{
					tokens.push(token);
				}
			}
			return tokens;
		}
		
		//returns list of strings. string literals start with ' such as returns js list ["(", "Concat", "'hello wor'", "'ld'"].
		vm.Viewer.prototype.tokenize = function(wikibinator203CodeString){
			let code = wikibinator203CodeString;
			code = this.removeComments(code);
			let bigTokens = this.tokenizeStringLiterals(code);
			let tokens = [];
			for(let i=0; i<bigTokens.length; i++){
				let bigToken = bigTokens[i];
				if(bigToken.startsWith("'")){ //is string literal. include it as it is.
					tokens.push(bigToken);
				}else{
					tokens.push(...this.tokenizeBetweenStringLiterals(bigToken));
				}
			}
			return tokens;
		};
		
		vm.strIsAllWhitespace = s=>(s==0);
		//unlike FnIsAllWhitespace which would better be made of combos of U (and maybe optimized using an Evaler) than part of vm.
		
		//used by Viewer.eval and Viewer.parse
		vm.Parsing = function(tokens){
			//tokens[from] is first token to eval. returns when that opening token (or it might be just 1 token by itself) is closed
			this.tokens = tokens;
			this.from = 0;
			this.toExcl = 0;
			
			//this needs to be set (in vm.eval normally) before parsing, since it counts down.
			//FIXME this isnt used? It was but i probably commentedout that code when it started working. Bring it back,
			//cuz likely something could infinite loop in parsing if theres some possible input?
			this.maxParseSteps = 0;
			
			//empty string evals to identityFunc. Whatever is parsing.fn gets called on the next thing parsed, and replace it with that.
			//this.fn = vm.identityFunc;
			this.stack = [vm.identityFunc]; //of fns. When parsing finishes, there is 1 thing on the stack, the fn the wikibinator203 code evaled to.
		};
		
		
		//FIXME remove isUnaryToken syntax and make a lack of space between things, or : between things if they cant have a space, mean (a (b (c d))) such as a(b c)d  or a(b)(c)d or (a b)c:d all mean the same thing.
		vm.Parsing.prototype.isUnaryToken = function(token){
			return token=='_' || token=='?' || token==',';
		};

		vm.Parsing.prototype.toString = function(token){
			return '[Parsing from='+this.from+' toExcl='+this.toExcl+' toklen='+this.tokens.length+' stacklen='+this.stack.length+' tokens='+JSON.stringify(this.tokens)+' maxParseSteps='+this.maxParseSteps+']';
		};
		
		vm.Parsing.prototype.stackToString = function(){
			let st = '';
			let count = 0;
			for(let fn of this.stack){
				if(st) st += ' .... ';
				st += fn+'@'+(count++);
			}
			//fromTok+'@'+parsing.from+toTok+'@'+(parsing.toExcl-1)
			return st;
		};
		
		vm.Parsing.prototype.onParsedFn = function(fn){
			if(!this.stack.length) this.stack.push(fn);
			else this.stack.push(this.stack.pop()(fn));
		};
		
		//a lone token is push and pop of itself, so is 1 less params after it than isUnaryToken.
		//FIXME remove isUnaryToken syntax and make a lack of space between things, or : between things if they cant have a space, mean (a (b (c d))) such as a(b c)d  or a(b)(c)d or (a b)c:d all mean the same thing.
		//The unaryTokens include '_' (aka Seq) and ',' (aka T)
		//and maybe '?' but that might be more similar to # syntax and related to <...>.
		//See vm.opInfo for those strings.
		//
		vm.Parsing.prototype.isLoneToken = function(token){
			//include whitespace (FIXME theres lots of kinds of unicode whitespace, but those 4 '\t\r\n ' are usually enough. Default: \n instead of \r or \r\n.
			
			//Example: vm.ops.S and vm.opAbbrevs._->ops.Seq and vm.opAbbrevs[',']->ops.T
			//return token.length != 1 || '\t\r\n _?,'.includes(token) || vm.ops[token] || vm.opAbbrevs[token] || token.endsWith('#'); //TODO get these from vm.opInfo.prefix
			//return token.length != 1 || '\t\r\n _?,'.includes(token) || vm.ops[token] || vm.opAbbrevs[token] || token.endsWith('#'); //TODO get these from vm.opInfo.prefix
			return !vm.strIsAllWhitespace(token) && !vm.isListBorderToken[token];
			//return token.length != 1 || '_?,(){}[]<>'.includes(token);
		};
		
		vm.Parsing.prototype.isPushToken = function(token){
			//return this.isUnaryToken(token) || token=='(' || token=='{' || token=='[' || token == '<';
			//FIXME remove isUnaryToken syntax and make a lack of space between things, or : between things if they cant have a space, mean (a (b (c d))) such as a(b c)d  or a(b)(c)d or (a b)c:d all mean the same thing.
			return token=='(' || token=='{' || token=='[' || token == '<';
		};

		//TODO this shouldnt be needed in vm, instead just in vm.Parsing, but 2022-7-30 added vm.filterTokens func that needed to call this. Its getting tangled. Organize it.
		vm.isPopToken = token=>(token==')' || token=='}' || token==']' || token == '>');
		
		vm.Parsing.prototype.isPopToken = function(token){
			return vm.isPopToken(token);
			//return token==')' || token=='}' || token==']' || token == '>';
		};
		
		//Examples: 'S', 'Pair' (which are builtInName), or TODO if its a localName.
		//TODO make all builtInName be localName, and just derive those names instead of hardcoding them.
		vm.Parsing.prototype.loneTokenToFn = function(loneToken){
			if(loneToken == 'U') return vm.u;
			//FIXME TODO also localNames, and use the names in Viewer not in vm.ops,
			//and dont have builtInNames and instead derive all builtInNames as localNames.
			//builtInNames and localNames dont change ids. globalIds are computed deterministicly from forest shape only.
			//local ids (such as idA idB blobFrom blobTo (128 bits)) are computed nondeterministicly from forest shape as optimization.
			if(ops[loneToken]) return ops[loneToken]; //Example: T Seq
			if(opAbbrevs[loneToken]) return opAbbrevs[loneToken]; //Example: , instead of T, _ instead of Seq
			if(loneToken == 0){ //is all whitespace
				throw 'Dont call loneTokenToFn if its all whitespace cuz theres no fn for it. Its part of syntax between fns etc. loneToken=['+loneToken+'] inside the [...]'
			}
			
			//FIXME For now just do builtInName
			//let ret = ops[loneToken];
			//TODO theres some field in ops that gets the '_' '?' ',' etc. Which field? For now just hardcode those few here:
			//FIXME no these are unary tokens _ ? ,: if(loneToken == '_') return ops.Seq;
			//FIXME no these are unary tokens _ ? ,: //TODO if(loneToken == '?') return ops.GetVar; //FIXME theres a few kinds of getvar, such as get as double, ? vs ?2 etc.
			//FIXME no these are unary tokens _ ? ,: if(loneToken == ',') return ops.T;
			//if(!ret) throw 'FIXME do localNames too, loneToken='+loneToken;
			//return ret;
			
			//TODO if loneToken starts with a lowercase letter and has no whitespace, then its a string literal (utf8? utf16? TODO CHOOSE).
			
			throw 'TODO, loneToken='+loneToken;
		};
		

		
		vm.Parsing.prototype.pay1ParseStep = function(){
			if(this.maxParseSteps <= 0) throw 'Parser is broken. Ran out of parsing.maxParseSteps. If this isnt a call of vm.eval/vm.viewer.eval then caller should set maxParseSteps to vm.viewer.maxParseStepsForNumTokens(yourTokens.length). parsing='+this;
			this.maxParseSteps--;
		};
		
		vm.pushTokenToPopToken = {
			'(': ')',
			'{': '}',
			'[': ']',
			'<': '>',
		};
		
		vm.isListBorderToken = {};
		for(let token in vm.pushTokenToPopToken){
			vm.isListBorderToken[token] = true;
			vm.isListBorderToken[vm.pushTokenToPopToken[token]] = true;
		}
		
		vm.syntaxNeedsColorBetween2Chars = (charA,charB)=>(!isListBorderToken[charA]&&!isListBorderToken[charB]);
		
		vm.Parsing.prototype.isMatchingPushAndPopTokens = function(pushToken, popToken){
			switch(pushToken){
				case '(':
					return popToken == ')';
				case '{':
					return popToken == '}';
				case '[':
					return popToken == ']';
				case '<':
					return popToken == '>';
				default:
					return false;
			}
		};
		
		vm.Parsing.prototype.pushFn = function(fn){
			if(2<=vm.loglev)console.log('pushFnSTART stackSize='+this.stack.length);
			this.stack.push(fn);
			if(2<=vm.loglev)console.log('pushFnEND stackSize='+this.stack.length);
			return undefined;
		};
		
		vm.Parsing.prototype.popFn = function(){
			if(this.stack.length < 2) throw 'About to popFn, and parsing.stack.length=='+this.stack.length+' but must always be at least 1.';
			return this.stack.pop();
		};
		
		//pops 2 fns. pushes 1 fn, by func(param)->ret, 3 fns.
		vm.Parsing.prototype.popPopPushFnByCall = function(){
			if(2<=vm.loglev)console.log('popPopPushFnByCallSTART stackSize='+this.stack.length);
			if(this.stack.length < 2) throw 'stack.length='+stack.length+' and cant pop last thing on stack';
			let param = this.stack.pop();
			let func = this.stack.pop();
			//console.log('parsing, about to call (look for ENDCALL) '+func+' on '+param);
			if(2<=vm.loglev)console.log('parsing, about to call (look for ENDCALL) func(param)');
			this.stack.push(func(param));
			if(2<=vm.loglev)console.log('ENDCALL');
			if(2<=vm.loglev)console.log('popPopPushFnByCallEND stackSize='+this.stack.length);
			return undefined;
		};
		
		//vm.Parsing.prototype.logStackSizeEtc = function(){
		//	console.log('STACKSIZE '+parsing.stack.length+' maxParseStepsLeft='+parsing.maxParseSteps);
		//};
		
		//string -> fn.
		vm.Viewer.prototype.eval = function(wikibinator203CodeString){
			let code = wikibinator203CodeString;
			let tokensStartAs = this.tokenize(code);
			if(!tokensStartAs.length) return Ident; //this should happen automatically? can this line be commentedout?
			tokens = ['(']; //Parser.parse needs this
			tokens.push(...tokensStartAs);
			tokens.push(')'); //Parser.parse needs this
			
			if(2<=vm.loglev)console.log('TOKENS: '+tokens.join(' .. '));
			let parsing = new vm.Parsing(tokens);
			//maxParseSteps is for things that dont parse at runtime in user code,
			//or bugs in the parser while I'm still designing the parser.
			parsing.maxParseSteps = this.maxParseStepsForNumTokens(tokens.length);
			if(2<=vm.loglev)console.log('eval starting, maxParseSteps='+parsing.maxParseSteps);
			this.parse(parsing);
			if(parsing.stack.length != 1) throw 'parsing.stack.length should be 1 but is '+parsing.stack.length;
			//this part of stack started as vm.identityFunc (F U) but should have replaced it,
			//unless the code is empty in which case its identityFunc aka vm.eval('')->vm.identityFunc.
			//Otherwise, identityFunc is called on whatever it does first/last on stack, so returns that.
			//TODO make an Evaler for identityFunc.
			
			//Remember, identityFunc is optimized by this, so its fast enough to use it and L R etc as lambdas.
			//This is code from near the end of this file.
			//l().pushEvaler((vm,func,param)=>(param().l));
			//r().pushEvaler((vm,func,param)=>(param().r));
			//vm.identityFunc().pushEvaler((vm,func,param)=>param);
			//TODO change to someFunc.n.stuff, instead of someFunc().stuff .
			
			return parsing.stack[0];
		};
		
		//TODO move this func to Parsing class?
		vm.Viewer.prototype.maxParseStepsForNumTokens = function(numTokens){ return 5+3*numTokens; };
		
		//FIXME what about ?? (lowercase lambda) vs ?? (capital lambda) and other codepoints?
		vm.isCapitalLetter = x=>/^([A-Z]|??)$/.test(x);
		//vm.isCapitalLetter = x=>/^[A-Z]$/.test(x);
		
		/*
		//such as 'Aname#' in 'AName#(S T T)'. It used to be #Aname, but cuz of the order of parsing in : syntax,
		//I'm putting name first, so can A#a:B#b:C#c, and in that case A means (a:b:c) and B means (b:c) and C means c.
		vm.numberOf
		vm.isDefineNameToken
		*/
		
		//returns a vm.Parsing or null. Returns null if its all whitespace from current position, so dont add that to childs list.
		//This is a redesign of parse function, to split it into 2 steps, parsing into tree, then evaling.
		//This is thue "parsing into tree" step. Param is list of string such as:
		//'{' or '[' or '(' or '<' or [loneTok where isLoneToken(loneTok) such as 'S' or '#AName' or '3.2'
		//or "'hello world'" or hello or world since starting with lowercase without whitespace means string literal.
		//
		//TODO??? Takes vm.Parsing as param.
		//OLD: 0 <= from && from < tokens.length.
		//returns a vm.ParseTree. Calls itself recursively.
		vm.Viewer.prototype.tokensToParseTree = function(parsing){
			//FIXME handle ':'/'' syntax.
			
			let firstToken = parsing.tokens[parsing.from];
			try{
				while(vm.strIsAllWhitespace(firstToken)){
					firstToken  = parsing.tokens[++parsing.from]; //skip whitespace
				}
				if(parsing.from >= parsing.tokens.length){
					//throw 'cant parse all whitespace at end. shouldnt have called tokensToParseTree that last time.';
					return null;
				}
				console.log('tokensToParseTree firstToken='+firstToken);
				let ret = new vm.ParseTree();
				if(firstToken.endsWith('#')){ //AName#
					if(firstToken.endsWith('##')){ //OpCommentedFuncOfOneParam and AName#
						//FIXME update comments in vm.Parsing cuz not including ## at end
						ret.defineCommentAndNameToken = firstToken.substring(0,firstToken.length-2);
					}else{
						//FIXME update comments in vm.Parsing cuz not including # at end
						ret.defineNameToken = firstToken.substring(0,firstToken.length-1);
					}
					firstToken = parsing.tokens[++parsing.from]; //after the AName# or AName## is whatever its the name of.
				}
				if(parsing.isLoneToken(firstToken)){ //FIXME isLoneToken, should it match whitespace? if so, its only matching ' ' but not '\n' or '\t' etc.
					if(vm.isCapitalLetter(firstToken[0])){
						ret.useExistingNameToken = firstToken;
					}else{
						ret.literalToken = firstToken;
					}
				}else if(parsing.isPushToken(firstToken)){ //One of '{', '[', '(', '<', but doesnt handle ':'/'' here despite its also a listType.
					//pushToken. but ':' is not a push or pop token, despite its still a listType, so not doing that here.
					let observePushToken = firstToken;
					let observePushToken_tokenIndex = parsing.from;
					console.log('Start observePushToken='+observePushToken+' at observePushToken_tokenIndex='+observePushToken_tokenIndex);
					ret.listType = observePushToken;
					let expectPopToken = vm.pushTokenToPopToken[observePushToken]; //FIXME move pushTokenToPopToken into vm.Viewing or vm.Parsing etc, but consider what uses it might not be able to reach that.
					parsing.from++; //dont need parsing.toExcl in tokensToParseTree but may have needed it in the old design.
					//while(parsing.from < parsing.tokens.length && parsing.tokens[parsing.from] != popToken){
					let observedPopToken = null;
					//while(parsing.from < parsing.tokens.length && !parsing.isPopToken(observedPopToken=parsing.tokens[parsing.from])){
					while(true){
						
						//TODO? rename observedPopToken to popToken? cuz its every token until and including the popToken,
						//other than recursing in (...) [...] etc whic is handled by tokensToParseTree.
						observedPopToken = parsing.tokens[parsing.from];

						console.log('possible (looking for a) observedPopToken='+observedPopToken+' parsing='+parsing);
						if(observedPopToken === undefined){
							throw 'observedPopToken is undefined, parsing='+parsing;
						}
						if(parsing.from == parsing.tokens.length){
							console.log('break while cuz, parsing.from == parsing.tokens.length and observePushToken='+observePushToken+' ('+observePushToken_tokenIndex+') expectPopToken='+expectPopToken);
							break;
						}
						if(parsing.isPopToken(observedPopToken)){
							console.log('break while cuz, observedPopToken is a pop token: '+observedPopToken+' ('+parsing.from+') and observePushToken='+observePushToken+' ('+observePushToken_tokenIndex+') expectPopToken='+expectPopToken+' parsing='+parsing);
							break;
						}

						if(vm.strIsAllWhitespace(observedPopToken)){
							console.log('skipping whitespace at index '+parsing.from);
							parsing.from++;
						}else{
							let childParseTree = this.tokensToParseTree(parsing); //does parsing.from++ at end, so is just past what it parsed
							if(childParseTree){ //would be null if its all whitespace at end
								ret.childs.push(childParseTree);
							}else{
								throw 'No childParseTree';
							}
						}

					}
					console.log('end loop, observePushToken='+observePushToken+' observedPopToken='+observedPopToken+' expectPopToken='+expectPopToken+' parsing='+parsing);
					if(parsing.isPopToken(observedPopToken) && expectPopToken != observedPopToken){
						throw observePushToken+' doesnt match '+observedPopToken+', expected '+expectPopToken+', parsedSoFar='+ret+', parsing='+parsing;
					}
					//parsing.from++;
					//console.log('increment parsing.from to '+parsing.from+' and setting observedPopToken to '+parsing.tokens[parsing.from]);
					//observedPopToken = parsing.tokens[parsing.from];
				}
				parsing.from++; //does parsing.from++ at end, so is just past what it parsed
				if(!ret.defineCommentAndNameToken && !ret.defineNameToken && !ret.listType && !ret.literalToken && !ret.useExistingNameToken){
					throw 'Didnt set any of the fields, retParsing=['+ret+']';
				}
				return ret;
			}catch(e){
				console.log('tokensToParseTree error '+e);
				throw e;
			}
		};
		
		//internal datastruct of Viewer.
		//
		//alert('TODO for vm.eval, make another layer, of vararg tree, for [] {} () <> a:b:c:d syntaxs,
		//before evaling anything, which means it wont merge duplicate fns in code string at this level
		//(and at lazyDedup level it will mostly except for some blobs, and at globalId256 level
		//everything is deduped). Make that tree so can look at it in browser debugger to make sure
		//it parsed right before evaling its parts, since thats unnecessary extra work to do at
		//once when tracking down bugs. Eventually the eval func will be derived from combos of
		//U/TheUniversalLambda, so you can make new syntaxes at the same level as the default
		//syntax. Do that in vm.ParseTree. ParseTree comment, add a fifth kind of list, \':\'
		//where literal \':\' or \'\' (as in \'a(b c)d\' or \'M[...]\') is the fifth kind,
		//< [ { (. It evals a:b:c:d as (a (b (c d))), unlike (a b c d) means (((a b) c) d).');
		vm.ParseTree = function(){
			//todo from and toExcl?
			//is '{' or '[' or '(' or '<' or [loneTok where isLoneToken(loneTok) such as 'S' or '#AName' or '3.2'
			//or "'hello world'" or hello or world since starting with lowercase without whitespace means string literal]
			//this.defineNameToken = null; //like 'AName#' or 'AName##', or null.
			this.defineNameToken = null; //like 'AName' of 'AName#', or null. null if defineCommentAndNameToken is not null, etc.
			this.defineCommentAndNameToken = null; //'AName' of 'AName##', or null. OpCommentedFuncOfOneParam.
			this.useExistingNameToken = null; //like 'AName', or null.
			//like '2.34e-5' or '12' or '\'hello world\'' or '\'hello\'' or 'hello', since if it doesnt start with capital letter
			//and has no whitespace and is small enough, you dont need the quotes.
			//If its like that but starts with capital letter, its a useExistingNameToken.
			this.literalToken = null;
			this.listType = null; //One of '{', '[', '(', '<', ':', or null.
			this.childs = [];
		};
		//vm.Tree.prototype.parseToMakeChilds = function(){

			
		vm.ParseTree.prototype.toString = function(){
			let s = '';
			if(this.defineNameToken){
				s += this.defineNameToken+'#';
			}else if(this.defineCommentAndNameToken){
				s += this.defineNameToken+'##';
			}
			//if it defines a name, the (...) etc comes after it.
			if(this.useExistingNameToken){
				s += this.useExistingNameToken;
			}else if(this.literalToken){
				s += this.literalToken;
			}else if(this.listType){
				if(this.listType == ':'){
					for(let i=0; i<this.childs.length; i++){
						let nextChildStr = this.childs[i].toString(); //aka child+'', but avoid extra concat
						if(i && vm.syntaxNeedsColorBetween2Chars(s[s.length-1],nextChildStr[0])){
							//Example that needs colon: a:b
							//Example that doesnt need colon: (S T T)b(hello world)
							//Example that doesnt need colon: {T T}b(hello world)
							//Example that doesnt need colon: M[hello world]
							s += ':';
						}
						s += nextChildStr;
					}
				}else{
					s += this.listType; //{ [ ( <
					for(let i=0; i<this.childs.length; i++){
						if(i) s += ' ';
						s += this.childs[i];
					}
					s += vm.pushTokenToPopToken[this.listType]; //} ] ) >
				}
			}
			return s;
		};

		//vm.length
		//vm.regexForLiteralTypeWord = FIXME allow unicode but also 

		//lang means programming language strings.
		//for the default syntax (or you could derive any syntax using lambdas,
		//but have to start somewhere for it to be Human readable in early experiments).
		//
		//TODO If it starts with a lowercase letter, does not contain whitespace or other certain symbols, and is small enough,
		//then its a string literal of those utf8 bytes.
		//TODO If it starts with ' (or maybe " or allow both?) then its a string literal,
		//but there should be a size limit on those too, else display it as callpairs the normal way, and it would still be a string.
		//TODO If it starts with 0b then its a cbt literal written as bits.
		//TODO If it starts with 0x then its a cbt literal written as hex digits.
		//TODO also literal for float64 andOr int32 etc.
		//FIXME which of these does a raw cbt, of a certain size mean. For example, should a cbt32 display as int32 or 32 bits or float32 or what?
		/*vm.langLiteralType = str=>{
			fixmefixme
			if(!str.length) throw 'Empty string';
			
			throw 'TODO';
		};*/

		/*
		//which chars can be in a langLiteralType of 'word', such as helloworld234 means 'helloworld234'
		vm.isLangLiteralWordChar = char=>{
			TODO
		};*/

		vm.maxCharsInWordLiteral = 50; //FIXME how much?
		
		//TODO hook into Viewer or Viewing or parsing.loneTokenToFn, for AName#/AName##.
		//Skip names for now. FIXME
		//TODO using Name# Fills optionalMapOfStringToFn as mutable {}. Creates optionalMapOfStringToFn if one isnt given.
		//If you want names like 'S' and 'U' and 'Pair' to work, put them in that param.
		vm.ParseTree.prototype.eval = function(optionalMapOfStringToFn){
			//FIXME use vm.stackTime and vm.stackMem etc, in case parsing costs too much compute resources (such as infinite loop cuz of parser bug, or if it looks things up that somehow (maybe in future version)
			//causes looking them up on harddrive or internet (constants only by merkle hash id, not something that changes,
			//except MutableWrapperLambda isnt strongly enforced that it doesnt change and is an incomplete design as of 2022-4.
			if(!this.fn){
				let map = optionalMapOfStringToFn || {};
				let ret;
				if(this.useExistingNameToken){
					ret = map[this.useExistingNameToken];
					if(!ret) throw 'Name not found: '+this.useExistingNameToken;
				}else if(this.literalToken){
					if(
						(this.literalToken.length <= vm.maxCharsInWordLiteral) //max word literal length
						&& /^\S*$/.test(this.literalToken) //no whitespace allowed in word literal
						&& !/\(\)\{\}\[\]\<\>\'\"\#\\\:\,/.test(this.literalToken) //FIXME find the other syntax chars not allowed in a word literal
					){
						console.log('Found word literal: '+this.literalToken);
						ret = vm.wrap(this.literalToken);
					}else{
						throw 'TODO other kinds of literal. Also, if its too long or not a literal, then shouldnt have entered this if(this.literalToken). literalToken['+this.literalToken+']';
					}

					//else display it normally as call pairs etc.

					/*FIXME check literal length, but is it allowed to have longer length if its quoted than if its word?
					let lity = vm.langLiteralType(this.literalToken);
					switch(lity){
						case 'word':
							throw 'TODO word';
						break;case 'quote':
							throw 'TODO quote';
						break;case '0b':
							throw 'TODO 0b';
						break;case '0x':
							throw 'TODO 0x';
						default: 
							throw 'TODO literalToken='+this.literalToken;
					}*/
				}else if(this.listType){
					if(this.listType == '('){ //curryList, just call them left to right. (a b c d) means (((a b) c) d).
						ret = Ident;
						for(let childParseTree of this.childs){
							ret = ret(childParseTree.eval(map));
						}
					}else if(this.listType == ':'){ //a:b:c:d means (a (b (c d)))
						if(this.childs.length < 2) throw 'The : syntax (which also occurs when theres no space between some things) requires at least 2 childs but found '+this.childs.length;
						ret = this.childs[this.childs.length-1].eval(map);
						for(let c=this.childs.length-2; c>=0; c--){ //eval in reverse order than (...).
							ret = childParseTree.eval(map)(ret);
						}
					}else if(this.listType == '{'){ //sCurryList. {a b c d} means (S (S (S a b) c) d)
						if(!this.childs.length) return Ident; //FIXME is that what empty {} means?
						ret = this.childs[0].eval(map);
						for(let c=1; c<this.childs.length; c++){
							ret = S(ret)(this.childs[c].eval(map));
						}
					}else if(this.listType == '['){ //incur list. [a b c d] means (Infcur a b c d).
						ret = ops.Infcur;
						for(let childParseTree of this.childs){
							ret = ret(childParseTree.eval(map));
						}
					}else if(this.listType == '<'){ //TODO to find comments about this search for ?2
						throw 'TODO <...>/?GetVarDeep syntax, this='+this;
					}else{
						throw 'Unknown listType='+this.listType;
					}
				}
				if(this.defineNameToken){
					map[this.defineNameToken] = ret;
				}else if(this.defineCommentAndNameToken){
					throw 'TODO defineCommentAndNameToken OpCommentedFuncOfOneParam, must get strings (use Node.blob) working first, this='+this;
					//let defineCommentAndNameToken_asFn = TODO
					//ret = ops.OpCommentedFuncOfOneParam(defineCommentAndNameToken_asFn)(ret);
					//map[this.defineCommentAndNameToken] = ret;
				}
				if(!ret){
					throw 'No ret. I saw ret===undefined here 2022-4-30. What caused it?';
				}
				this.fn = ret;
				
				
				//FIXME should Node.localName be modified? Or keep it in ParseTree andOr View Viewing Viewer etc?
				//ignore this.useExistingNameToken cuz that would have been defined earlier
				let name = this.defineNameToken || this.defineCommentAndNameToken || null;
				if(name) this.fn.localName = name;
				
				
				//loneTokenToFn
			}
			return this.fn;
		};

		//reads a list of js strings (parse.tokens) and evals the combo of lambdas it means,
		//and returns it (whatevers at top parsing.stack[parsing.stack.length-1] at end of this parse call,
		//including calling itself recursively while modifying fields in the Parsing.
		//
		//FIXME??? Might need to have '(' and ')' as first and last tokens, in this.tok for the outermost call,
		//so if its a lone token such as 'S' or 'Pair', theres a parent parse call to popPopPushFnByCall it at the end?
		//All parse calls other than an outermost call are a smaller range in this.tok.
		//
		//If all those lambdas dont have enough params yet then evaling them halts instantly
		//by creating a halted call pair (see Node.evaler such as vm.rootEvaler) so just normal evaling.
		//Reads parse.tokens and parse.from. Writes parse.to when whatever parse.tokens[parse.from] opens is closed, such as ( and ) or { and },
		//or a lone token may be its own open and close such as hello or 'hello'.
		vm.Viewer.prototype.parse = function(parsing){
			//FIXME replace this with 2 steps, as explained in tokensToParseTree which is the first of 2 steps.
			
			
			let tok = parsing.tokens;
			/*let fromTok = tok[parsing.from]; //Examples: ( { [ < hello 'hello world' 3.45 , _
			if(fromTok === undefined) throw 'parsing, frokTok===undefined. This might happen if parser is broken (are you changing the syntax by modifying a parser? If so, you should do that at user level, lambdas that make lambdas, but just needed 1 syntax to boot that process.). Or maybe the code isnt valid wikibinator203 code.';
			console.log('PARSING====fromTok='+fromTok);
			*/
			parsing.toExcl = parsing.from+1;
			let nextFn = null;
			let toTok;
			do{
				if(2<=vm.loglev)console.log('parse top of loop, stack: '+parsing.stackToString());
				let fromTok = tok[parsing.from]; //Examples: ( { [ < hello 'hello world' 3.45 , _
				if(fromTok === undefined) throw 'MOVEDTOINWHILE: parsing, frokTok===undefined. This might happen if parser is broken (are you changing the syntax by modifying a parser? If so, you should do that at user level, lambdas that make lambdas, but just needed 1 syntax to boot that process.). Or maybe the code isnt valid wikibinator203 code.';
				if(2<=vm.loglev)console.log('MOVEDTOINWHILE: PARSING====fromTok='+fromTok);
				toTok = tok[parsing.toExcl-1]; //-1 makes it inclusive, unless a range of 0 tokens (or less) is selected
				if(toTok === undefined){
					throw 'toTok is undefined. maybe reached the end of parsing the wrong way?';
				}
			
				parsing.pay1ParseStep();
				if(vm.strIsAllWhitespace(fromTok)){
					//TODO Any 2 fns with no whitespace or { [ ( < between eachother,
					//like a[b c], means (a [b c]). means call one on another left to right.
					//
					//FIXME, is this code (push then popPopPush) at end of loop(s),
					//doing that "call one on aother left to right"?
					//Or where should that be done instead?
					//parsing.pushFn(nextFn);
					//parsing.popPopPushFnByCall();
					if(2<=vm.loglev)console.log('parsing, all whitespace, fromTok['+fromTok+'] from['+parsing.from+'] toExcl['+parsing.toExcl+'] typeof(fromTok)['+typeof(fromTok)+']');
					parsing.from++;
					if(2<=vm.loglev)console.log('increased from['+parsing.from+'], toExcl['+parsing.toExcl+']');
					
					//FIXME more code to write
				}else if(parsing.isLoneToken(toTok)){ //this token alone
					//lone token might be #SomeName or ( or ) or { etc.
					if(2<=vm.loglev)console.log('    parsingA, is lone token, toTok='+toTok);
					//FIXME also handle stringliterals, #Names, numberliterals, etc here.
					nextFn = parsing.loneTokenToFn(toTok);	
					if(2<=vm.loglev)console.log('parsing.pushFn of fn, loneToken, toTok='+toTok);
					parsing.pushFn(nextFn);
				/*}else if(parsing.isLoneToken(fromTok)){ //this token alone
					//lone token might be #SomeName or ( or ) or { etc.
					console.log('    parsingA, is lone token: '+fromTok);
					//FIXME also handle stringliterals, #Names, numberliterals, etc here.
					nextFn = parsing.loneTokenToFn(fromTok);	
					console.log('parsing.pushFn of fn, loneToken='+fromTok);
					parsing.pushFn(nextFn);
				/*}else if(parsing.isUnaryToken(fromTok)){ //this token and recurse on next objects
					//FIXME remove isUnaryToken syntax and make a lack of space between things, or : between things if they cant have a space, mean (a (b (c d))) such as a(b c)d  or a(b)(c)d or (a b)c:d all mean the same thing.
					//unaryToken parses like __x is (_ (_ x)).
					console.log('parsing, isUnaryToken fromTok='+fromTok);
					//throw 'TODO';
					nextFn = parsing.loneTokenToFn(fromTok);
					let rememberFrom = parsing.from;
					parsing.from = parsing.toExcl; //start at the next token
					this.parse(parsing);
					parsing.from = rememberFrom;
					//leave parsing.toExcl as the recursion left it, possibly higher than it started but cant be lower.
					//parsing.toExcl++; //FIXME remove this line?
				*/
				}else{ //this token and recurse on variable number of next objects: {...}, [...], (...), or <...>.
					//while(parsing.toExcl < tok.length && !parsing.isMatchingPushAndPopTokens(fromTok,tok[parsing.toExcl-1])){
					let isPop;
					let listOfFns = []; //whats between { and }, [ and ], ( and ), or < and >, similar to sexp/s-expression.
					while(
						parsing.toExcl < tok.length
						&& !(isPop=parsing.isMatchingPushAndPopTokens(fromTok,toTok=tok[parsing.toExcl-1]))
					){
						parsing.pay1ParseStep();
						//let tk = tok[parsing.toExcl-1];
						toTok = tok[parsing.toExcl-1]; //-1 makes it inclusive, unless a range of 0 tokens (or less) is selected
						if(parsing.isPushToken(toTok)){
							if(2<=vm.loglev)console.log('parsingB, is push token, toTok='+toTok);
							//Example: tok[fromTok] is '(' and toExcl has found another '(' or a '{' etc, so recurse.
							let rememberFrom = parsing.from;
							parsing.from = parsing.toExcl;
							this.parse(parsing);
							parsing.from = rememberFrom;
							//leave parsing.toExcl as the recursion left it, possibly higher than it started but cant be lower.
							parsing.toExcl++; //FIXME remove this line?
						}else if(isPop){
							if(2<=vm.loglev)console.log('parse, about to pop, fromTok='+fromTok+' toTok='+toTok);
							break;
						}else{
							if(2<=vm.loglev)console.log('parsing, its not push or pop. is literal or look up by #Name or .abc.def etc. tk='+tk);
							let rememberFrom = parsing.from;
							parsing.from = parsing.toExcl;
							//let fn = this.parse(parsing); //like U in [U U U] or (U U U) or for <> or {}
							this.parse(parsing); //like U in [U U U] or (U U U) or for <> or {}
							let fn = this.popFn(); //this.parse(parsing) also returns it, but popFn removes it from this.stack
							listOfFns.push(fn);
							//FIXME also pop here (from parsing.stack)?
							parsing.from = rememberFrom;
							//throw 'TODO its not push or pop. is literal or look up by #Name or .abc.def etc.';
						}
					}
					toTok = tok[parsing.toExcl-1]; //-1 makes it inclusive, unless a range of 0 tokens (or less) is selected
					if(toTok === undefined){
						//throw 'toTok===undefined';
						if(2<=vm.loglev)console.log('toTok===undefined so past the end (todo use from and toExcl and tok.length instead');
						break;
					}
					if(2<=vm.loglev)console.log('fromTok switch [](){}<>, fromTok='+fromTok+' toTok='+toTok);
					switch(toTok){
						case ']': //Infcur list
							if(2<=vm.loglev)console.log('parse [...] aka infcur-list, size '+listOfFns.length);
							nextFn = ops.Infcur;
							for(let fn of listOfFns)  nextFn = nextFn(fn);
						break;case ')': //curry list
							if(2<=vm.loglev)console.log('parse (...) aka curry-list');
							nextFn = vm.identityFunc; //(F U) aka I
							for(let fn of listOfFns)  nextFn = nextFn(fn);
						break;case '}': //sCurry list
							if(2<=vm.loglev)console.log('parse {...} aka s-curry-list, size '+listOfFns.length);
							//syntax {} means S. {x} means S(x). {x y} means s(x)(y). {x y z} means s(s(x)(y))(z). and so on.
							if(!listOfFns.length) return ops.S;
							nextFn = listOfFn[0];
							for(let i=0; i<listOfFns.length; i++)  nextFn = ops.S(nextFn)(fn);
						break;case '>': //opmut getter list
							if(2<=vm.loglev)console.log('parse <...> aka opmut-getter-list, size '+listOfFns.length);
							//nextFn = TODO
							throw 'TODO what exactly does the < syntax do? look up that ?2 ?1 syntax (where did i put that?) - aka opmut getter list syntax. Normally only used to get from a [...] in an opmut.';
						break;default:
							throw 'Unknown pop token: '+toTok;
					}
					
					//nextFn = some interpretation of the range tok[parsing.from .. parsing.toExcl-1]
					parsing.pushFn(nextFn);
					parsing.popPopPushFnByCall();
					//TODO parsing.pushFn(nextFn); parsing.popPopPushFnByCall(); depending on if is push, pop, or loneToken etc above.
				}
				
				//FIXME pop parsing.from and parsing.toExcl to pop. FIXME thats confusing. did i mean pop 2 and push calling one on the other?
				
				//Do these depending on if is push, pop, or loneToken etc above.
				//parsing.pushFn(nextFn);
				//parsing.popPopPushFnByCall();
				
				parsing.toExcl++;
			}while(parsing.stack.length > 1); //when theres 1 thing on stack left, return it.
			//console.log('parsing, about to call '+parsing.fn+' on '+nextFn);
			//parsing.fn = parsing.fn(nextFn);
			if(!parsing.stack.length) throw 'parsing.stack is empty but should never have less than 1 fn in it';
			if(2<=vm.loglev)console.log('PARSEEND');
			return parsing.stack[parsing.stack.length-1]; //Parsing.parse returns return whatever on top of Parsing.stack at end
		};
		
		
		
		
		//TODO use vm.viewer.eval
		
		
		/*let testViewer = ()=>{
			TODO names like S and Pair in vm.ops.S and vm.ops.Pair, where to store those?
			in param of some instance func in Viewer, or in the fns? Or in View.localName?
			
			let code = '{}';
			
			throw 'TODO';
		};*/
		
		/*
		Add 2 more int fields, for size of val_dupDoubles and val_dupMuts,
		and include wikibinator203 ops (which can have a max of 128 ops) to,
		given a Mut, pop 2 doubles off its stack then push a multiply, UNLESS the Float64Array in the Mut is not big enough and in that case
		use something like objectThatReturns0ForAllFieldValues for all doubles outside its range etc is constant 0,
		and let stackSize wrap as twosComplement of int32, or something like that. i dont want to auto enlarge the array
		cuz that might slow it down when doing a sequence of such ops.
		Similar, some ops for copying between the double or Mut stacks in multiple Muts.
		Could use a Mut as an array of such "multiple Muts" such as having 3 stacks which is a simple way to do permutations.
		TODO figure out details of that while using it to derive (from these up to 128 ops) the y10x10rgb12 voxel system,
		or y10x10bright4 or y9x9rgb6 etc would fit in a float32 which GPU.js is limited to but CPU can do ints such as y10x10rgb12.




		TODO use 1 char long field names, but other than that, I like this design,
		and it will go in vm.ops.Mut which has these 5 things (excluding whichOpmutSpace cuz fns cant see that),
		and TODO make a hashtable in it, as a proofofconcept, combining val_dupMuts and val_dupDoubles (or maybe Int32Array view of it?).
		FIXME would it cause a problem to have to allocate dedupedFn for each potentially nondedupedFn?
		You could, in the worst case, dedup that same fn and use it as its own key,
		or simpler would be to just count doubles up from 0 to use as keys since every double can be viewed as a dedupedFn.
		TODO allocate range of idA_idB for dedupedFns, and that range will be a subset of nonnormedNaNs
			(or maybe the nonnormed negative infinities) where idA is high 32 bits idB is low 32.
		Mut = function(dedupedFn, whichOpmutSpace){
			this.key_dedupedFn = dedupedFn;
			this.key_whichOpmutSpace = whichOpmutSpace;
			
			//this.val_dedupedNum = 0;
			//this.val_dupFn = u;
			//this.val_dupDoubles = emptyFrozenDoublesArray; //can replace with new Float64Array(someNumber) and Object.setPrototypeOf null of it.
			//this.val_dupMuts = emptyFrozenMutsArray; //can replace with new Array() and Object.setPrototypeOf null of it.
			
			//TODO objectThatReturns0ForAllFieldValues andOr Object.setPrototypeOf(this.m,null); etc, for sandboxing.
		};
		Mut.prototype.val_dedupedNum = 0;
		Mut.prototype.val_dupFn = u;
		Mut.prototype.val_dupDoubles = emptyFrozenDoublesArray; //can replace with new Float64Array(someNumber) and Object.setPrototypeOf null of it.
		Mut.prototype.val_dupMuts = emptyFrozenMutsArray; //can replace with new Array() and Object.setPrototypeOf null of it.
		freeze the above few default vals somehow.
		..
		[
			(Mut [...theMutsAsInfcurList...] cbt num fn fnAsKeyA)
			(Mut [...theMutsAsInfcurList...] cbt num fn fnAsKeyB)
			(Mut [...theMutsAsInfcurList...] cbt num fn fnAsKeyA)
			...
		]
		*/
		vm.Mut = function(dedupedFn, whichOpmutSpace){
			this.k = dedupedFn; 
			this.o = whichOpmutSpace;
			//this.keyFn = dedupedFn; 
			//this.keyNum = whichOpmutSpace;
			//can have instance fields of e (double), j (dup fn), m (dup Array of Mut), i (dup Int32Array that shares buffer with field d).
		};
		
		
		//FIXME make sure these prototype field vals get frozen so forexample, aMut.e = 5, doesnt change aMut.prototype.e to 5.
		//Test that.
		//Also test that cant get to things like __proto__ etc by generated code, so can prove its sandboxed.
		
		vm.Mut.prototype.e = 0; //a double (which implies its normed form is Node.idA and Node.idB in fn form).
		
		vm.Mut.prototype.j = u; //a dup (not necessarily deduped) fn. can replace with any fn in Mut instance //Mut.prototype.j = u; //a dup (not necessarily deduped) fn. can replace with any fn in Mut instance
		//vm.Mut.prototype.jj = vm.emptyFrozenArray; //Mut.prototype.j = u; //a dup (not necessarily deduped) fn. can replace with any fn in Mut instance //Mut.prototype.j = u; //a dup (not necessarily deduped) fn. can replace with any fn in Mut instance
		
		vm.Mut.prototype.mm = vm.emptyFrozenArray; //list of Mut. can replace with new Array(someNumber) in Mut instance
		
		vm.Mut.prototype.ii = vm.emptyFrozenIntArray; //can replace with new Int32Array(someNumber) in Mut instance. must be even size cuz shares buffer with Float64Array.
		vm.Mut.prototype.dd = vm.emptyFrozenDoublesArray; //can replace with new Float64Array(someNumber) in Mut instance
		
		
		
		//FIXME use variants of objectThatReturns0ForAllFieldValues?
		/*//returns a number (this.e) in case you do aMut+someNumber you get a number instead of it throwing.
		vm.Mut.toString = function(){
			return this.e;
		};*/
		vm.Mut.prototype.E = function(){
			this.e = 0;
		};
		
		vm.Mut.prototype.J = function(){
			this.j = [];
		};
		
		vm.Mut.prototype.M = function(){
			this.m = [];
		};
		
		//this.i and this.d overlap same memory
		vm.Mut.prototype.D = function(numDoubles){
			this.i = new Int32Array(numDoubles<<1);
			this.d = new Float64Array(this.i.buffer);
		};
		
		
		
		//snapshot of this Mut as a fn, to be put in a [...] as stream.
		vm.Mut.prototype.toFn = function(){
			return ops.Mut(this.mm)(this.ii)(this.e)(this.j)(this.k);
		};
		
		//FIXME use [(ObKeyVal keyA valA) (ObKeyVal keyB valB) ...] instead of [keyA valA keyB valB ...],
		//cuz thats what 
		//
		//z is (LazyEval (Lambda FuncBody [x y z] valX valY) valZ) or (Lambda FuncBody [x y z] valX ...).
		//Returns an infcurStream, in those 2 cases, [y valY x valX] or [y valY x valX],
		//since the reverse order is faster and order of the key/vals only matters if theres duplicate keys.
		//There could be duplicate keys like (Lambda FuncBody [y x y y z] ...)
		//but thats only allowed since its faster than checking for duplicates,
		//and I dont expect people to want to do that.
		//If they do, the first y in [y x y y z] becomes the last y in [z val y val y val x val y val].	
		//throw 'TODO';
		//vm.addOp('lambdaParams',false,1,'Used with (Lambda FuncBody [x y z] valX valY valZ) -> (FuncBody (LazyEval (Lambda FuncBody [x y z] valX valY) valZ)). (LambdaParams (LazyEval (Lambda FuncBody [x y z] valX valY) valZ)) -> [x valX y valY z valZ], but it can be a different number of params. Lambda takes up to (TODO find exact number) around 240-something or 250-something params.');
		vm.lambdaParamsInfcurInReverseOrder = function(z){
			//let Infcur = OP('infcur');
			
			//FIXME...
			//(Lambda FuncBody [x y z]) is 7 params of u. Lambda is 5 params of u.
			/*let Infcur = OP('infcur'), Lambda = OP('lambda'), LazyEval = OP('lazyEval');
			FIXME since Lambda is 5 params of u, there are 4 Lambda ops, not just 1,
			so the above Lambda = OP('Lambda') wont work. Also, fix that in addOp, needs to be 4 calls of addOp.
			Can check if o8 has a certain 5 bits in it and is in the right range.
			if(vm.lambdasAreSameOp(z,Lambda)){
				FIXME
				Also need to check z().curriesLeft() and compare that to the size of the [x y z] that is 7th param.
				Also what if that 7th param is not a [...] or is a [...] but with more params than lambda allows (250-somethign)? At 7th param, it must always be halted and curriesLeft known.
			}else if(vm.lambdasAreSameOp(z,LazyEval)){
			*/
				let ret = ops.Infcur;
				//let exceptLastParam = z().l().r; //(Lambda FuncBody [x y z] valX valY) without the LazyEval and valZ
				let keys = exceptLastParam;
				let vals = z;
				//FIXME if keys already has less than 7 params (so is not a Lambda call)???
				while(keys().hasMoreThan7Params()) keys = keys().l;
				//except a few edge cases (TODO), keys is [x y z] for example.
				//FIXME if its a LazyEval that was not created by Lambda reaching its last param.
				
				//FIXME is either of these right?
				//ret = ret(keys().r, vals().r); //z and valZ. get past the LazyEval, so can loop over the rest.
				ret = ret(keys().r)(vals().r); //z and valZ. get past the LazyEval, so can loop over the rest.
				
				
				keys = keys().l;
				vals = vals().l().r; //get past the LazyEval, so can loop over the rest.
				while(vals().hasMoreThan7Params()){
					ret = ret(keys().r)(vals().r);
					keys = keys().l;
					vals = vals().l;
				}
				return ret;
			/*else{
				return ops.Infcur; //empty
			}*/
		};
		
		//UPDATE: this is the old [key val key val...] way, which instead would be [(ObVal keyA valA) (ObVal keyB valB)] etc. Also see ObKeyVal and ObCbt etc.
		//reverses an infcur-like thing (normally just an infcur), 2 curries at a time,
		//like [x xval y yval z zval] vs [z zval y yval x xval].
		//FIXME what if it has even/odd the wrong number of params for key/val pairs?
		//or what if its not an infcur?
		vm.reverseStream = function(z){
			//let ret = OP('Infcur');
			let ret = ops.Infcur
			while(z().hasMoreThan7Params()){
				let key = z().r;
				z = z().l;
				let val = z().r;
				z = z().l;
				ret = ret(key)(val);
			}
			return ret;
		};
		
		vm.lambdaParamsInfcur = function(z){
			return vm.reverseStream(vm.lambdaParamsInfcurInReverseOrder());
		};
		
		vm.reverseInfcurlikeList = function(infcurlikeList){
			vm.prepay(1,1);
			//TODO optimize by using funcall caching (which an op would automatically do). Call an op that reverses an infcurlikelist. TODO make such an op.
			//let ret = OP('infcur');
			let ret = ops.Infcur;
			//let ret = vm.ops.infcur;
			//if(!ret) throw 'FIXME theres no infcur op, Im probably still building the VM';
			while(infcurlikeList().hasMoreThan7Params()){
				ret = ret(infcurlikeList().r); //does vm.prepay
				infcurlikeList = infcurlikeList().l;
			}
			return ret;
		};
		
		
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
		
		for(let o8=1; o8<256; o8++){ //excluses o8 of 0 aka evaling.
			let lambda = vm.o8ToLambda(o8);
			//The difference between a builtInName and a localName is the builtInName can be used the first time it occurs,
			//but the localName has to be displayed as expanded once, then #ItsLocalName, before the next time just append 'ItsLocalName'.
			lambda.builtInName = lambda.localName = vm.opInfo[o8].name;
			lambda.opAbbrev = vm.opInfo[o8].prefix; //TODO rename prefix to opAbbrev
			vm.ops[lambda.localName] = lambda; // -> fn
			vm.opAbbrevs[lambda.opAbbrev] = lambda; //Example: T is , and Seq is _. -> fn
		}
		
		//prefix of normal (utf8) text
		vm.utf8Prefix = vm.ops.Typeval(U);
		
		//cuz vm.bit func needs these. todo opcode order.
		//vm.t = TODO;
		//vm.f = TODO;
		
		vm.isPowOfTwo = i=>!(i&(i-1));

		vm.verifyPowOf2BytesElseThrowTodo = num=>{
			if(!vm.isPowOfTwo(num)) throw 'TODO allow non-power-of-two number of bytes (by setting its prototype to something like objectThatReturns0ForAllFieldValues but that pads a 1 bit first then all 0s): '+num;
		};
		
		/* FIXME theres only sizes cbt1 cbt2 cbt4 cbt8 cbt16 in this, not for example cbt15. So I'm splitting those into separate vars,
		and to keep it loading fast (as the VM is not well optimized yet 2022-7) I'm just doing up to cbt8.
		
		//Flyweight design pattern for all possible cbt1 to cbt16.
		//Each of these cbt1 to cbt16 can be half of an int, 1/4 of a double, etc.
		//TODO in more optimized code it will wrap Float64Array, Int32Array, etc, without deduping it down to 16 bits, can handle bigdata.
		//vm.cacheSmallCbt[(1<<16)+any16Bits] is a fn of those bits.
		//It has all possible cbt1 cbt2 ... cbt16 values. That includes every utf16 char and uint16 or int16 etc.
		//Its binheap indexing but does not use index 1 cuz ops.Bit0 and ops.Bit1 are its 2 roots, at indexs 2 and 3.
		//How many fns per binheaplike layer?: 2 4 8 16 32 ... 65536, so dont use index 1 (and as usual in binheap dont use index 0).
		//FIXME if this doesnt let it load fast, then lazy eval those, leaving most of the size (1<<17) list as nulls until used,
		//but probably it will be fast enough to always preload 1<<17 fns when the VM loads,
		//which should in theory only delay page load by a small fraction of a second when the VM is well optimized (TODO).
		vm.cacheSmallCbt = [null, null, ops.Bit0, ops.Bit1];
		if(!ops.Bit0) throw 'No ops.Bit0 to make cacheSmallCbt';
		for(let i=4; i<(1<<17); i++){
			let j = Math.floor(i/2);
			let parent = vm.cacheSmallCbt[j];
			if(!parent){
				throw 'cacheSmallCbt error i='+i+' j='+j+' parent='+parent;
			}
			vm.cacheSmallCbt[i] = parent(vm.bit(i&1)); //call parent on ops.Bit0 or ops.bit1
		}
		*/
		vm.cbt1 = [ops.Bit0, ops.Bit1]; //the 2 bits
		for(let i=0; i<vm.cbt1.length; i++) vm.cbt1[i].localName = '0b'+i;
		vm.cbt2 = [ vm.cbt1[0](vm.cbt1[0]), vm.cbt1[0](vm.cbt1[1]), vm.cbt1[1](vm.cbt1[0]), vm.cbt1[1](vm.cbt1[1]) ]; //all possible 2 bits
		for(let i=0; i<4; i++) vm.cbt2[i].localName = '0b'+(''+(4+i).toString(2)).substring(1); //0b00 0b01 0b10 0b11
		vm.cbt4 = []; //all possible 4 bits
		for(let high=0; high<4; high++) for(let low=0; low<4; low++) vm.cbt4.push(vm.cbt2[high](vm.cbt2[low]));
		for(let i=0; i<16; i++) vm.cbt4[i].localName = '0b'+(''+(16+i).toString(2)).substring(1); //0b0000 to 0b1111
		vm.cbt8 = []; //all possible bytes
		for(let high=0; high<16; high++) for(let low=0; low<16; low++) vm.cbt8.push(vm.cbt4[high](vm.cbt4[low]));
		for(let i=0; i<256; i++) vm.cbt8[i].localName = '0b'+(''+(256+i).toString(2)).substring(1); //0b00000000 to 0b11111111
		vm.cbt16 = []; //all possible 16 bits. starts null. created when observed.
		vm.Cbt16 = i=>(vm.cbt16[i] || (vm.cbt16[i] = vm.cbt8[(i>>8)&255](vm.cbt8[i&255])));
		vm.Cbt32 = i=>(vm.Cbt16((i>>16)&0xffff)(vm.Cbt16(i&0xffff))); //uses funcall caching as usual, which is slower than the caching in vm.cbt1 .. vm.cbt16.
		vm.mustDedupIfAtMostThisManyBytes = 32; //Any wrapper of a Uint8Array this size or smaller must be deduped. Others can be lazy-deduped (which may happen later or never).
		
		//from and to are optional
		vm.CbtOfBytesDedup = (bytes,from,to)=>{
			if(from>=to){
				throw from+' == from >= to == '+to;
			}
			if(from === undefined) from = 0;
			if(to === undefined) to = bytes.length;
			vm.verifyPowOf2BytesElseThrowTodo(to-from);
			switch(to-from){
				case 1: return vm.cbt8[bytes[from]];
				case 2: return vm.Cbt16((bytes[from]<<8)|bytes[from+1]);
				case 4: return vm.Cbt32((bytes[from]<<24)|(bytes[from+1]<<16)|(bytes[from+2]<<8)|bytes[from+3]);
				default:
					let mid = (from+to)>>1; //FIXME this should always be an integer. is it?
					let left = vm.CbtOfBytesDedup(bytes,from,mid);
					let right = vm.CbtOfBytesDedup(bytes,mid,to);
					return left(right);
			}
		};
		
		//from and to are optional
		vm.CbtOfBytes = (bytes,from,to)=>{
			if(from === undefined) from = 0;
			if(to === undefined) to = bytes.length;
			if(bytes.length <= vm.mustDedupIfAtMostThisManyBytes){
				//does verifyPowOf2BytesElseThrowTodo
				return vm.CbtOfBytesDedup(bytes,from,to);
			}else{
				vm.verifyPowOf2BytesElseThrowTodo(to-from);
				//not deduped:
				return new vm.Node(this,null,null,blob,from,to); //can lazy-eval create its l and r childs pointing into subranges of from and to, if observed (FIXME todo).
				//FIXME if theres a null l or l in node and that fails (such as "null is not a function" thrown maybe) then its cuz of the above line,
				//which is correct but code that calls .l or .r should change, OR maybe define the .l and .r fields using javascript getters and setters if its not slow.
			}
		};
		
		
		
		
		//if(l != L) throw 'with(ops) isnt working for L';
		//console.log('testing with(ops): L='+L+' l='+l);	
		
		//FIXME rename s to S, r to R, t to T, etc, in vm "let" vars, since in the default wikibinator203 syntax
		//starting with a capital letter means #Name of a fn,
		//and starting with lowercase (if no whitespace) means string literal.
		//but it will take time to find single letter like that, or a good regex.
		//For now I'm making both vars, s and S, t and T, so I can at least stop using the lowercase one in new code.
		let s = ops.S;
		let S = ops.S;
		let l = ops.L;
		let L = ops.L;
		let r = ops.R;
		let R = ops.R;
		let t = ops.T;
		let T = ops.T;
		let f = ops.F;
		let F = ops.F;
		let pair = ops.Pair;
		let Pair = ops.Pair;
		let ident = F(U);
		let Ident = ident;
		
		//let E = vm.eval; //lambda eval, string->fn
		
		vm.test = (testName, a, b)=>{
			if(a === b) if(1<=vm.loglev)console.log('Test pass: '+testName+', both equal '+a);
			else throw ('Test '+testName+' failed cuz '+a+' !== '+b);
		};
		
		vm.testEval = (wikibinator203Code, shouldReturnThis)=>{
			vm.test('testEval '+wikibinator203Code, vm.eval(wikibinator203Code), shouldReturnThis);
		};
		
		vm.temp = {};
		vm.temp.breakpointOn = false; //used in some browser debugger conditional breakpoints
		vm.temp.skipTestEval = true; //FIXME
		
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
		
		if(1<=vm.loglev)console.log('Starting very basic vm.eval tests');
		
		vm.temp.breakpointOn = true;

		if(!vm.temp.skipTestEval){		
			vm.testEval('U',U);
			vm.testEval('S',S);
			vm.testEval('T',T);
			vm.testEval('L',L);
			vm.testEval('R',R);
			vm.testEval('Pair',Pair);
			
			vm.testEval('(S T)',S(T));
		}
		
		//vm.temp is just stuff you might find useful while testing the vm in browser debugger (push f12 in most browsers). its not part of the spec.
		vm.temp.breakpointOn = false;
		
		if(1<=vm.loglev)console.log('Passed very basic vm.eval tests');
		
		
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
		vm.identityFunc().pushEvaler((vm,func,param)=>param);
		//TODO change to someFunc.n.stuff, instead of someFunc().stuff .
		//vm.identityFunc().pushEvaler((vm,func,param)=>{ console.log('optimizedIdentityFunc'); return param; });
		//TODO pushEvaler for isleaf etc
		
		
		
		//'TODO TDD for Names# etc, but get the basics of parsing, eval, (Lambda [x y z] ...) MutLam, etc, working first.'()
		
		if(1<=vm.loglev)console.log('TODO run a few more tests after these pushEvaler optimizations since in some fns (aNode.evaler) they replace vm.rootEvaler (which becomes aNode.evaler.prev, but you can still use rootEvaler there by setting aNode.evaler.on=false; and would still use whichever evaler, per node, has evaler.on==true, which is designed that way to make testing of combos of evalers easy at runtime.');
		

		//vm.stack* (stackTime stackMem stackStuff) are "top of the stack", used during calling lambda on lambda to find/create lambda.
		//vm.stackTime = 1000000; //fill these back up before starting another call at bottom of stack, to avoid running out, but not until the stack becomes empty.
		//vm.stackMem = 1000000;
		//vm.stackStuff = vm.defaultStackStuff;
		vm.refill();
		
		vm.booted = true;
		
		
		
		let prevStackTime = vm.stackTime;
		let prevStackMem = vm.stackMem;
		vm.prepay(1,2);
		if(vm.stackTime != prevStackTime-1) throw 'stackTime is broken';
		if(vm.stackMem != prevStackMem-2) throw 'stackMem is broken';
		
		if(1<=vm.loglev)console.log('this='+this);
		
		return u; //the universal function
	//} //end with(ops)	//dont do this cuz with(...) makes things very slow.
})();
console.log('Script ended. Wikibinator203 = '+Wikibinator203+' which is the universal combinator/lambda you can build anything with. Nobody owns the lambdas made of combos of calling the universal lambda on itself (such as Wikibinator203(Wikibinator203)(Wikibinator203(Wikibinator203)))='+Wikibinator203(Wikibinator203)(Wikibinator203(Wikibinator203))+' aka opcode 5 (0 to 255) aka Op101 in base2, and see license for details about that. By design, there are an infinite number of possible variants of https://en.wikipedia.org/wiki/Technological_singularity which Wikibinator203 may generate (or it may do other simpler things) but only as, kind of, lazy-evals. It is by design neutral. It does not tend to do that on its own (but even a broken clock is right 1, 2, or 3 times a day depending on daylight savings, so whatever may already have execute permission on your computer (including unknown hackers, or some generated lambda may, if you view it as a conversation or as text etc, ask you to give it more permissions, so like they say about email, dont run any files received)...) - may not execute anything ever for any reason, as it has "recursively-tightenable-higher-on-stack permissions system" (search comments in this file or earlier versions of it) whose max level is sandbox (though an opensource fork of it could give execute or higher permissions similarly as long as its stateless, thats probably not a good idea). If a "singularity" is to happen, then it should support https://en.wikipedia.org/wiki/Breakpoint and, as motivation to it or to more generally any user(s), this system should (TODO verify) in practice be able to EFFICIENTLY run a debugger of a debugger of a debugger of a debugger (like a Hypervisor/VMWare/etc inside a Hypervisor/VMWare/etc inside... except those kinds of VMs are far to complex to do efficiently in this system, as this is more of a nanokernel or smaller/simpler), just a few levels deep, as compute is the bottleneck there, but in abstract math can do that to any finite depth, even in the middle of a "optimization to throw sound processing code faster than the speed of sound from one computer to a nearby computer which formal-verifies, compiles, and runs that code in time to hear the sound arrive and think about and respond.".');     













































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

