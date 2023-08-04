const Wikibinator203UI = (()=>{
	
	let wui = {};
	
	wui.comment = 'This is the more advanced UI for Wikibinator203.js made after Wikibinator203DragAndDropTree.html, and there are functions in this map but JSON.stringify doesnt display those.';
	
	//the const Wikibinator203 comes from Wikibinator203VM.js, a universal funciton.
	let U = wui.U = Wikibinator203;
	
	//new dob/domObject
	let Nob = wui.Nob = (tag,optionalParent,optionalInnerHtml)=>{
		let dob = document.createElement(tag);
		if(optionalInnerHtml) dob.innerHTML = optionalInnerHtml;
		if(optionalParent) optionalParent.appendChild(dob);
		return dob;
	};
	
	let defaultFirstState = wui.defaultFirstState = {fn:U};
	
	//Wikibinator203 UI OBject. [[Wob is mutable. TODO? Use this as immutable except for caches such as bigHash_ in Wikibinator203DragAndDropTree.html.]]
	//var Splat = function(parentSplatOrNull, selfDob)
	//The simplest state is {fn:AnyFn} such as {fn:vm.eval('[hello world]')}.
	//Eventually I want all the states to be just a fn, but for now I need 2 kinds of
	//states: Split (like in Wikibinator203DragAndDropTree.html) and fn, so for compatibility,
	//since Split has a .fn field, I'm using {fn:AnyFn} with optionally other things in the {...}.
	//
	let Wob = wui.Wob = function(optionalFirstState, optionalParentWob, optionalSelfDob){
		
		this.state = optionalFirstState || defaultFirstState;
		this.parentWob = optionalParentWob || null;
		this.childs = [];
		this.dobs = {
			self: optionalSelfDob || Nob('div'),
		};
	};
	
	//[[TODO should Wob be immutable, or should that part go in State? Since Wob is used as immutable, this can be cached.]]
	//true if all childs stay inside this.dobs.self as a rectangle.
	//False if, for example, its 3d and 4x4 affine transform matrix could put childs somewhere else.
	//Starts false in Wob in general. Only override to make this true if u know its true in some subclass of Wob.
	//Its ok to say false either way. Its only ok to say true if its certainly boxed.
	//It can help with optimizations of finding what touches a certain point on screen.
	Wob.prototype.isBoxed = function(){
		return false; //only override to make this true if u know its true in some subclass of Wob
	};
	
	//[[TODO should Wob be immutable, or should that part go in State? Since Wob is used as immutable, this can be cached.]]
	//TODO return a [x,y,z,radius] or is it [radius,z,y,x] or what?
	//This is relative to parents coordinate system. TODO should this be a Float32Array(4) or Float64Array(4) or [...4 numbers...]?
	//If 2d, then z coordinate is 0.
	Wob.prototype.boundingSphere = function(){
		throw 'TODO';
	};
	
	/*Wob.prototype.is3d = function(){
		throw 'TODO how to know from this.state if its 3d or not? If its 3d then this.dobs.self as a rectangle doesnt contain it on screen, even though it may still be the dob parent. If !is3d then 
	};*/
	
	//TODO CanvasWob
	
	//TODO TextEditorWob
	
	//TODO LambdaToStringWob
	
	//TODO 1 or a few kinds of Wob for containing other Wobs, with recursive fn in fn for their states.
	
	
	//TODO do i want 3d polygons (dobs with style=transform:matrix3d(...)) which arent contained inside eachother (and maybe css clip?),
	//or do I want everything contained inside eachother?
	
	
	
	
	let Dob = wui.Dob = id=>document.getElementById(id);

	return wui;
	
})(Wikibinator203); //the const Wikibinator203 comes from Wikibinator203VM.js, a universal funciton.
console.log('Wikibinator203UI = '+Wikibinator203UI);