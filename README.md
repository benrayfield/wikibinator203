# wikibinator203

Some basic parts work, or use earlier wikibinator106. (TODO custom opensource license) For making massively-multiplayer browser or desktop apps, games, musical instruments, science tools, number crunching, security research, etc, a universal lambda function (combinator), GPU optimizable, javascript eval optimizable, 256 bit ids of merkle forest, each lambda has 2 lambda childs and all paths lead to the universal lambda.

This just worked in browser console:
<code>
''+u(u)
wikibinator203.js:1404 Evaling l=u r=u
'op10'
t(u)
wikibinator203.js:1404 Evaling l=t r=u
ƒ (param){
			
			//TODO test the code NODE.evaler(NODE.lam,param) which should do this.
			//TODO evaler, so can put various optimizations per node. chain of evalers with evaler.on defining which i…
''+t(u)
wikibinator203.js:1404 Evaling l=t r=u
't(u)'
''+pair
'pair'
''+pair(s)(t)
wikibinator203.js:1404 Evaling l=pair r=s
wikibinator203.js:1404 Evaling l=pair(s) r=t
'pair(s)(t)'
''+pair(s)(l)
wikibinator203.js:1404 Evaling l=pair r=s
wikibinator203.js:1404 Evaling l=pair(s) r=l
'pair(s)(l)'
''+pair(s)(l)(t)
wikibinator203.js:1404 Evaling l=pair r=s
wikibinator203.js:1404 Evaling l=pair(s) r=l
wikibinator203.js:1404 Evaling l=pair(s)(l) r=t
wikibinator203.js:1404 Evaling l=t r=l
wikibinator203.js:1404 Evaling l=t(l) r=s
'l'
''+pair(s)(l)(f)
wikibinator203.js:1404 Evaling l=pair r=s
wikibinator203.js:1404 Evaling l=pair(s) r=l
wikibinator203.js:1404 Evaling l=pair(s)(l) r=f
wikibinator203.js:1404 Evaling l=f r=l
wikibinator203.js:1404 Evaling l=f(l) r=s
's'
</code>

If you want the universal lambda that works, go to <a href=https://github.com/benrayfield/wikibinator106>wikibinator106</a>, for now. This different universal lambda function will hopefully be working soon with some simple games and demos people can play together, as actual javascript lambdas that implement the universal lambda math.

Planned features
* everything can work by drag-and-drop of lambda onto lambda to find/create lambda or writing code, and all that can be shared online instantly at gaming-low-lag or local only.
* use lambdas instead of bits, as the tiny pieces the internet is made of. Using any 2 lambdas together (call one on the other) finds or creates a lambda. Lambdas can be anything such as a word, picture, sound, game, tool, or something that draws a mustache on any picture you drag it to. Anything.
* Its not dumbed down. In theory, can build real science tools that change the world, or games, musical instruments, or anything, by drag-and-drop of lambdas you can send and receive in realtime. They're a kind of number, so nothing anyone does with a lambda changes that lambda, just finds or builds more lambdas with it.
* AI (artificial intelligence), that is made of lambdas, writes code for new AIs, using lambdas for both code and data, sometimes from scratch and sometimes using given parts of AIs such as learning algorithms that other AIs or parts of them (or recursive use of itsself) may combine, making use of the recursive time and memory limits to avoid infinite loops etc.
* median forking latency of 1 microsecond.
* some parts GPU optimizable. Memory mapping.
* no central control. In theory there will be a variety of realtime interoperable wikibinator203 VMs that all run the same universal lambda math and may sometimes choose to turing-complete-challenge-response eachother for lambda called on lambda returns what lambda. Accusations against specific lambdas (for just existing, since they dont do anything except find/create lambdas and are a kind of number) can in theory be responded to by "did put it in antivirus quarantine", since there is a whole area of the system that runs in an antivirus quarantine so thats a no-op, but the other "normal" area, which works by the same math, is the part such accusations may be directed at.
* exactly repeatable calculations in strictest mode.
* can run evil code (virus, ransomware, some AI generated code, etc) safely in a sandbox. All code is sandboxed. You are warned not to give execute permission, believe, or obey anything in the evil_bit=true area unless you can verify it on your own such as by a trusted network of digital signatures or math proofs or other evidence etc.
* does not need execute permission.
* Sandbox can be private or shared across many computers.
* every lambda call returns a lambda or gives up after recursive limits of time and memory.
* zero-knowledge-proof allows global sync from everywhere to everywhere near lightspeed.
* turing-complete load-balancing, and turing-complete-challenge-response of lambda called on lambda finds/creates what lambda.
* unique 256 bit number (or 512 bit for extra security) for each lambda, other than if there was a secureHash-collision.
* optimization to throw sound processing code faster than the speed of sound from one computer to a nearby computer which formal-verifies, compiles, and runs that code in time to hear the sound arrive and think about and respond.

First app running on this will maybe be musical instruments similar to https://en.wikipedia.org/wiki/Pure_Data that can be shared in realtime to build more musical instruments with and so on, and this "proof of concept" will be able to scale to millions of simultaneous instruments being played and generated and evolved, and every bit, every tiny part of a sound vibration, is a lambda.

Custom opensource copyleft license to be written, basically similar to the MIT license except that nobody owns the lambdas (which are all (like?) derivative-works of the universal lambda, which all paths along 2 child edges lead to, and every such lambda is a fact of math) and that the evil_bit being on or off in each 256 bit id means 1 of 2 namespaces, one where things work as normal and the other where "anything goes" as its an "antivirus quarantine" and uncensored area, but be warned that in the "normal" area people might tend to remove lambdas while incoming pointers exist which could break things in the normal area while the evil_bit=true area will not remove anything while incoming pointers exist (and even then might still not), because of merkle garbage collection as a technical reason, and because of free speech. There is no central control of this, as its just a data format and way people might share lambdas with eachother in realtime, so I'm just another user, like you, of lambdas. Even though where "anything goes" there will be viruses and worse, if someone sneaks that in, since its easy to enter the "antivirus quarantine" but not to leave, one way safe border, where people choose not to [copy outside and execute, obey, or believe] whats inside it which would be their own fault since they were told its an antivirus quarantine so have no reasonable expectation to believe thats safe, but it is safe inside the wikibinator203 VM used thru canvas webAudioAPI textareas checkboxes gamepads etc, since all lambdas only generate more lambdas and dont need execute permission. Both namespaces exist across many computers at once.

Code will be like this, or see wikibinator106 log output for real example of earlier version.

You start with 1 javascript variable, which can build all possible things...

const wikibinator203 = (function(){ ...this software goes here... })();

let u = wikibinator203; //shorter name

let uu = u(u);

let opcode2 = uu;

let opcode3 = u(uu);

let opcode4 = u(u)(u);

let opcode5 = u(u)(uu);

...

let opcode128 = u(u)(u)(u)(u)(u)(u)(u);

...

let opcode254 = u(uu)(uu)(uu)(uu)(uu)(uu)(u);

let opcode255 = u(uu)(uu)(uu)(uu)(uu)(uu)(uu);

These opcodes are various common lambdas such as s, church-true church-false church-pair, ways of using GPU, if/else, loops, etc.
All opcodes are known at 7 params. Further params use the opcode, such as the s lambda takes 3 more params.

...or you might skip some stuff by using lambdas other people give you...

Most control-flow is done using the s lambda aka Lx.Ly.Lz.xz(yz) and the church-true aka t lambda aka Lx.Ly.x, as in SKI-Calculus.

Syntax:

{a b} means (s a b)

{a b c} means {{a b} c} aka (s (s a b) c), aka in javascript this code will actually work: s(s(a)(b))(c).

,a means (t a), often used like ({,+ getX getY} treemapZ) which evals to (+ (getX treemapZ) (getY treemapZ)).

Syntax: abc.def[ghi<5>]

[] gets from something like what {} means in javascript, a map of string to thing.

<> gets from a Float64Array. These 2 things are used in small blocks of javascript-like code
  that compiles to javascript but blocks access to Float64Array.buffer etc so it can guarantee
  that all lambda calls halt within chosen limits of memory and time that can be tightened recursively on stack.
  
All lambdas have 2 child lambdas, even the u/universalLambda has the 2 childs of identityFunction and itself.
The left child called on the right child evals to the parent so its like a quine that way, if its halted,
else it might eval to something else whose left child called on its right child its itself cuz it is halted.

Everything can work by drag-and-drop or typing code. Everything is a lambda and can be shared in realtime or choose not to copy things into public,
but once something gets into public, as nobody owns the generated lambdas, it may be copied freely by many, so dont go looking to take it back.

This does not normally do proof-of-work, and instead uses hashing only for making unique ids of lambdas. This is not a blockchain even though it has the merkle forest data structure in common with them, and only lazyevals that.


The rest of this readme got too long and disorganized, will rewrite soon.
