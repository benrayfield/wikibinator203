

const MutableWrapperLambdaEvaler = (()=>{
	
	TODO use VarargAx for ed25519 digitalSignatures, and add an opcode for finding any next param that halts,
	like (SolveAx (VarargAx .... parts of publickey and search params...)) -> (VarargAx .... parts of publickey... [Sig Message])
	or something like that?
	(ThingX NextStateOfThingX) is halted or not depending on ThingX.
	(ThingY [here is some stuff (ThingX NextStateOfThingX)]) is halted or not depending on ThingY
	and if [here is some stuff (ThingX NextStateOfThingX)] is halted which if it wasnt then
	ThingY wouldnt have got it as a param in the first place.
	I want to use pubkeys, with limits on vm.stackTime and vm.stackMem etc
	(in case its not found, and to do them in batches for efficiency as it may have to search network for them),
	like (Bob [hi Bob this is Alice]) -> (Alice [hi Alice this is Bob]). Notice the sender/sayer is not part of the lambda call
	except anonymously that anyone could make up the message [hi Bob this is Alice] whether the sender/sayer is Alice or not,
	but the ed25519 sig should prove that part. So (Bob [hi Bob this is Alice]) is hiding the sig for convenience
	compared to the VarargAx way which makes sig 1 of the params. So this more convenient way should be defined as opcode
	to call the VarargAx way? Problem is, ed25519 and normal digital signature algorithms are on average infinitely faster than verifying VarargAx
	aka they always halt, so I dont want to bring in VarargAx for something that always halts cuz its expensive to verify and is overkill.
	But im not sure if theres a better way. Also consider vm.mask_* has a bit for allowing VarargAx calls or not (else they infloop),
	and a bit for caching if a VarargAx call exists.
	And, 
	
	throw 'TODO';
})();
console.log('MutableWrapperLambdaEvaler = '+MutableWrapperLambdaEvaler+' TODO hook it in like vm.ops.MutableWrapperLambdaEvaler.n.pushEvaler(MutableWrapperLambdaEvaler) or something like that, TODO... FIXME...');