

Making an evaler for IfElse/For/etc. Use with vm.Node.pushEvaler



FIXME even though fn (wikibinator203 lambda) will be primaryKey of every object
(as fn.n.id() is a string local to that run of the wikib VM),
that fn has to be deduped. I still want ability to store dup fn (not necessarily deduped).
I could do that by having 1 dup fn val in each object, maybe .λλFn,
or maybe a list andOr map of them. 1 should be ok, at least for now, cuz can use MutMap, MutList, MutFloats,
etc as wrapper of 1 dup fn each, or could make a new MutType for wrapping a fn.
NameOfName vs NameOfPrimaryKeyFn vs NameOfDupFn.
The NameOfPrimaryKeyFn of a double (MutDouble, which is literally just a js number like 3.45) is how fn normally wrapps a double.
FIXME todo the fn.n.id() of a wrapped double should be the same as ''+thatDouble in js.



FIXME what if in generated js code, z is not there in .x.y.z? y is there in .x.y but z is not there.
For all keys NOT there, map everything to 0, or maybe NaN, or maybe a shared mutable {}, etc. Adjust prototype to do that.
(3.45).λabc = 2; Can u do that?
I remember in experimental code I made a js {} that mapped every key to 0, so I could just use that as prototype,
though might interfere with number.prototype or might be solvable that way.

TODO verify no key in js numbers and js strings Float32Array etc, starts with λ,
once in maps, lists, Float32Array, etc in general, before boot this optimization,
cuz that could be a security flaw if so.

//const MapPrototype

//const ListPrototype

const ToStringGetλλName = function(){
	return this.λλName;
};



//TODO 'abc'-0 returns NaN, which is a number (kind of), not a string, so do -0 before every math op that might be an object.
//+0 would return 'abc0', but -0 doesnt do string concat, and intheory it doesnt cause roundoff.

//Name is supposed to be a generated unique (in this run of the local wikib VM) String
//mapped 1 to 1 with fns, so those fns must be fullDeduped.
//Name will normally be either a small string (if its wrapping a small string) or a 32 byte id.

//Example: λabc for the string 'abc'.
//Example: 'λ000388f5ffffffff394bc9acddf97885fe510b2fbc155c3d6745c1ff5e6734a4' (might change idMaker, TODO) for vm.ops.S.
const IdPrefix = 'λ';

//must start with IdPrefix.
const InternalPrefix = 'λλ';

//internal vars/consts
const NameOfName = 'λλName'; //primaryKey name/λλName, mapped 1 to 1 with NameOfPrimaryKeyFn/λλPkFn
const NameOfPrimaryKeyFn = 'λλPkFn';
const NameOfMutType = 'λλMutType';
const NameOfDupFn = 'λλDupFn';
const NameOfLength = 'length';

const VerifyName = name=>{
	FIXME what if its a number like 3.45?
	if(!name.startsWith(Prefix)){
		throw 'Name does not start with Prefix='+Prefix+', name='+name;
	}
};

//mutable state
const State = function(nameComparator){
	
	//after create ob by NewMap, NewList, NewFloats, etc, which each take a string name,
	//look them up by that name here. That name may be key in some maps made by newMap,
	//ome float arrays made by NewFloats (cuz its also a map, just has limits on what can be at certain integer keys etc.
	this.nameToOb = {};
	
	//FIXME this must compare by some wikibinator203 fn as comparator, such as vm.ops.GodelLessThan, for determinism,
	//so this func would be given as a param to the State (TODO).
	this.nameComparator = nameComparator;
	
	this.ids = 0;
	
};

State.prototype.Prepay = function(time,mem){
	throw 'FIXME';
};

State.prototype.NewName = function(){
	return IdPrefix+(this.ids++);
};

//new mutable map. name is optional param. If you dont give a name, it makes one using NewName.
State.prototype.NewMap = function(name){
	if(name === undefined) name = this.NewName();
	VerifyName(name);
	let ret = {λλName: name, toString: ToStringGetλλName};
	FIXME verify name doesnt exist already, or look it up by that?
	...
	return this.nameToOb[name] = ret;
};

//new mutable list. name is optional param. If you dont give a name, it makes one using NewName.
State.prototype.newList = function(name){
	if(name === undefined) name = this.NewName();
	VerifyName(name);
	FIXME verify name doesnt exist already, or look it up by that?
	let ret = [];
	ret.λλName = name;
	ret.toString = ToStringGetλλName;
	...
	return this.nameToOb[name] = ret;
};

//new mutable Float32Array. name is optional param. If you dont give a name, it makes one using NewName.
State.prototype.newFloats = function(name,len){
	if(name === undefined) name = this.NewName();
	VerifyName(name);
	FIXME verify name doesnt exist already, or look it up by that?
	let ret = new Float32Array(len);
	ret.λλName = name;
	ret.toString = ToStringGetλλName;
	...
	return this.nameToOb[name] = ret;
};

//Example: this.MapKeys{hello: 'world', 3:4} returns ['world', 3] or [3,'world'] depending on comparator. And it might be '3' instead of 3. FIXME?
//Returns a new MutList, with a name/id, containing
//If you dont give optionalNameComparator, it uses this.nameComparator.
State.prototype.MapKeys = function(mayBeMap, optionalNameComparator){
	let nameComparator = optionalNameComparator || this.nameComparator;
	let ret = this.NewList(); //FIXME dont do this if its not a MutMap?
	for(let k in mayBeMap){
		if(k.startsWith(IdPrefix) || Number.isNumber(k)){ //FIXME only integers 0 to Len-1, and of course || k.startsWith(IdPrefix).
			ret.push(k);
		}
	}
	ret.sort(nameComparator); //to make it deterministic
	//TODO Object.freeze(ret)?
	return ret;
};

//length of list. FIXME what if its a map or number?
const ListLen = mayBeList=>{
	return mayBeList.length|0;
};

//The name of a number is ''+theNumber
//TODO optimize: change Number.prototype to have a λλName field.
const Name = obOrNumber=>(obOrNumber.λλName || (''+obOrNumber));

const MutTypeMap = 'Map';
const MutTypeList = 'List';
const MutTypeDoubles = 'Doubles';
const MutTypeFloats = 'Floats';
const MutTypeInts = 'Ints';
const MutTypeUint8s = 'Uint8s';
const MutTypeDouble = 'Double'; //1 number, like 2.34

//Returns MutTypeMap, MutTypeFloats, MutTypeDouble, etc.
const MutType = ob=>{
	throw 'FIXME';
};

//can x have y as key? For example CanKey(3.45,newMap('λabc')) -> false, cuz numbers cant have keys. Or will i modify Number.prototype to allow that?
const CanKey (ob,key)=>{
	if(IsMap(ob)) return true;
	if(IsNumber(ob)){
		return false;
	}
	if(IsList(ob)){
		throw 'TODO';
	}
	if(IsArray(ob)){
		throw 'TODO return if its an integer 0 to Len-1 OR if its a non-number';
	}
	//TODO if allow frozen objects, then check Object.isFrozen(ob) here. also, can it only be frozen at time of creating, or after? Probably costs more than its worth.
	throw 'FIXME';
};

const IsNumber = x=>{
	throw 'FIXME';
};

const IsMap = x=>{
	throw 'FIXME';
};

const IsList = x=>{
	throw 'FIXME';
};

const IsArray = x=>{
	throw 'FIXME';
};

const IsFloatArray = x=>{
	throw 'FIXME';
};

var IsDoubleArray = x=>{
	throw 'FIXME';
};

const IsIntArray = x=>{
	throw 'FIXME';
};

const IsUint8Array = x=>{
	throw 'FIXME';
};

//these funcs work for (name,number), (number,name), (number,number), and (name,name). Returns NaN for all except (number,number).
const Plus = (x,y)=>((x-0)+(y-0));
const Minus = (x,y)=>(x-(y-0));
const Neg = x=>(-x);
const Mul = (x,y)=>(x*y);
const Divide = (x,y)=>(x/y);
const Imul = (x,y)=>Math.imul(x|0, y|0); //|0 may be faster than -0 in this case?

const Assert = console.assert;

const DoMutTests = ()=>{
	State s = new State();
	let m1 = s.NewMap();
	let m2 = s.NewMap();
	let m3 = s.NewMap();
	m1[m2] = m3;
	m2[m3] = m1;
	m3[m1] = m2;
	m3.λhello = m2;
	Assert();
};

DoMutTests();











