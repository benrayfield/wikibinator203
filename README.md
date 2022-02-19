# wikibinator203
If you want the universal lambda that works, go to <a href=https://github.com/benrayfield/wikibinator106>wikibinator106</a>, for now. This different universal lambda function will hopefully be working soon with some simple games and demos people can play together, as actual javascript lambdas that implement the universal lambda math.

First app running on this will maybe be musical instruments similar to https://en.wikipedia.org/wiki/Pure_Data that can be shared in realtime to build more musical instruments with and so on, and this "proof of concept" will be able to scale to millions of simultaneous instruments being played and generated and evolved, and every bit, every tiny part of a sound vibration, is a lambda. Float64 roundoff in javascript Math.sin Math.exp etc is allowed in nondeterministic roundoff lambda calls but those parts are not normally shared, just a transform from one clean lambda to another, or less efficiently there will be derived https://en.wikipedia.org/wiki/IEEE_754 multiply, plus, etc (and I can match the value of Math.exp to the last digit in javascript, java, and some GPU calculations, experimentally already though needs more testing). In a clean lambda call which uses the tanh op on 64 bits (a complete binary tree of 64 lambdas each 0 or 1, which are each derived from the universal lambda), for example, it must return the float64 closest to the actual value of infinite precision tanh (breaking ties by TODO some standard way of sorting 64 bits, just sort them like a uint64? half-even rounding? or what? take it as a param?... a universal lambda has to be deterministic for the merkle forest of ids to work) even if it has to be computed in pure interpreted mode (if theres no faster way available). In a looser way of calling (which there are 16 kinds of strict vs loose, powerset of 4 kinds) it would just return javascript Math.tanh(param) or GPU.js tanh of float32 (if in an op to allow float32 loss of precision higher on stack), for example. (some strictfp vs loose details to work out) You'll be able to plug an electric guitar into computer's microphone hole(s) (which I have done hundreds of times, though I'm not very good at it) like this https://youtu.be/DJCoOr4uHD4?t=208 (puredata). For those not very good at it, GPU optimized neuralnets andOr code evolution andOr call in experts on a variety of subjects for just a few seconds or as long as you want, might be useful things to try.

Doesnt work yet, see wikibinator106. (TODO custom opensource license) For making massively-multiplayer browser or desktop apps, games, science tools, number crunching, security research, etc, a universal lambda function (combinator), GPU optimizable, javascript eval optimizable, 256 bit ids of merkle forest, each lambda has 2 lambda childs and all paths lead to the universal lambda.

TODO start storing lambdas ONLY as concat of 3 ids: parent left right, in base58, something like this:
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
And start playing the instruments something like http://dinahmoelabs.com/plink/ andOr puredata. (FIXME if the evil_bit is in the 256 bits it would have to be changed there too, unless the g or e overlapped that somehow)

Also, these are valid javascript var names (though they shouldnt have a value other than a javascript lambda)...

x = {}

x.λeDY8pvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHjλeaaaavwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHjλebbbbvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj = 5

5

x.λeDY8pvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHjλeaaaavwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHjλebbbbvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj

5

with(x) console.log(λeDY8pvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHjλeaaaavwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHjλebbbbvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj)

5

But you'd be more likely to use it like this

freakyDrum = λimport('λeDY8pvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHjλeaaaavwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHjλebbbbvwNhj5DtiJBdyzN5H5kS1Hrc3286zZ8mKKnmkPHj');

someOtherFunc = λimport('λ...stuff...');

freakierDrum = someOtherFunc(freakyDrum);

...code to play freakierDrum on speakers using webAudioAPI...

This is something that years ago started as I was looking for how to make an https://en.wikipedia.org/wiki/Artificial_general_intelligence algorithm as some kind of binary-forest (tree with 2 childs each and shared branches). It seems a nearer goal to make musical instruments and lambdas in a peer to peer network, and wherever that leads, gradually add smarter code (in the form of calling a universal lambda on itself in various combos, formal-verified, me not above or below anyone else in the peer to peer network, and anyone who might do that could cause the same, and I am telling all my most advanced knowledge about it so all players are in fair play), leading to AGI hopefully, or think of it as testing the basics of a math system and how people react to it and use it together before doing that kind of thing in more advanced ways. The math works, for sure (see wikibinator106 log output example file https://raw.githubusercontent.com/benrayfield/wikibinator106/main/data/wikibinator106/testOutputs/marklar106TestOutput.txt for example). This is just a variant of it to scale and tune for practical uses. Its a question of what variety of it to pursue.

About the, commonly believed "low security" of only using 192 bits of hash. If you store 2^96 lambdas (256 bits each), and search it 2^96 times, you will find about 1 duplicate, or maybe 10. Even 1 duplicate is a problem. There is nearly (if not already there) enough compute power in the world to do that, and it keeps doubling every 2 years or so. BUT thats just the compute speed, not the IO (reads and writes in RAM or harddrive or SSD etc) speed. Random-access reads and writes in RAM are thousands of times slower than GPU compute which cant handle random access fast. GPU handles a grid of very similar calculations fast. So if you're looking for a hash collision by brute-force of 192 bits, you're going to melt your equipment long before that and still barely have scratched the surface. In theory. So the other issue to be careful of is quantum computers might be able to brute force 2^192 calculations and just give 1 answer, without needing to store anything. A few bits of nonunitary calculations here and there should in theory throw a wrench into that, such as is found in common hash functions, but I feel safer doing 3 sha256_withoutPaddingCuzKnownInputSizeIs512 in parallel, from 3 different unitary transforms of the same 512 bit input, then merging them with a toffoli-gate-like ~(a&b)^(b&c)^(c&a) (aka ~maj aka minorityBit) since ~(a&b)^(b&c)^(c&a)is a https://en.wikipedia.org/wiki/NP_(complexity) op of 3 bits to 1 bit, that generates 0 and 1 equally often and is similar to https://en.wikipedia.org/wiki/Toffoli_gate which tends to extremely slow quantum computers down. Even if you can crack 192 bits of sha256_withoutPaddingCuzKnownInputSizeIs512, you'd have to crack it 3 times at once, which couldnt give it any more than 192 bits of security but if it happened to be less than 192 (some security researchers were worried about it which motivated sha3_256) that should fix it. I would use sha3 but it seems slower to compute on cpus. I'm not compltely decided what hash function to use for the prototype, but the lambdas will be able to derive new hash functions to use as id makers without changing the universal lambda. Plus, even if it could be done, who in their right mind would spend over a trillion dollars just to prove a flaw that could be squared in strength for just twice the compute and memory etc cost (upgrading to some kind of 512 bit ids instead of 256). It is by design that anyone, even a homeless person whose only internet access is through a library, or in the event of complete internet shutdown longterm, can offer the seeds of turing completeness to willing participants. (((also earlier versions ("occamsfuncer" or what waere they called?) available in "The Arctic Code Vault is a snapshot of every active public repository on GitHub. These millions of repos were written to the same 1,000-year hardened film as the Greatest Hits and stored in the Arctic World Archive, a very-long-term storage facility in a decommissioned coal mine in Svalbard, Norway." -- https://archiveprogram.github.com/faq/ 2021-1-15.)))

This is a low energy system that does not depend on https://en.wikipedia.org/wiki/Proof_of_work . Its use of hashing is just to make unique ids for lambdas. Hashing is done only as needed, and most lambdas never need one, such as wrapping a byte array generated by GPU, transforming it, and copying parts of it to the screen, speakers, streaming, etc. In general a hash of a 2-way-branching forest node represents a positive integer, where the number of possible nodes at-or-below height 0 is 1, at-or-below height 1 is 2, at-or-below height 2 is 5, at-or-below height 3 is 26, and at-or-below height n is 1+at_or_below_height(n-1)^2. I'm expecting in practice these numbers to be approx around 1.5^(2^[0 to a million]) including halted and evaling nodes, which 256 bits is just a practical way to refer to. The number of possible lambdas at height n is approx 1.5^(2^n) (TODO verify... was a while back I checked that) .. such as the question https://www.quora.com/What-is-the-next-3-terms-of-1-2-5-26 I could for example make an at most height cost https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html of such numbers ranging 1 to 1.5^(2^[0 to a million]), comparing first by height then recursively by comparing left child then recursively by comparing right child, which at most 1 of left/right child need be recursed (linear instead of exponential) Not exactly a https://en.wikipedia.org/wiki/G%C3%B6del_numbering but close enough to compile some simplified variant of it to a time-crystal maybe, and I have in wikibinator106 in a long series of testcases (see log output) tested a derived equals function, where even though theres an infinite number of possible equals functions that compare any 2 lambdas (including themselves andOr eachother), no 2 of them ever disagree, and all such calls halt quickly. But thats just the abstract math. For example, a subset of those lambdas are rubiks cube states, or at least could be viewed that way, and the conservation-of-entropy occurs when in that "game tree" multiple lambda calls deterministicly return the same lambda meaning some turn of the rubiks cube, in theory. I'd like to do musical instruments like that.

Here's an incomplete (havent committed to it) license I'm working on writing (TODO move the ["TODO write my own opensource license" in wikibinator203.js] out of that file and merge any relevant parts into this, get rid of the rest, and keep it as small and simple as possible)...
[[[
Copyleft license starts here.

TODO rewrite this mess smaller.

There are 2 namespaces, with up to 2 ids for each lambda, one with evil_bit on and one with it off. Who is at fault/negligence/etc if something goes wrong, differs between evil_bit being on or off. If off then its how things work in "the normal internet", that the problem is tracked back to a "root cause" and blame occurs there andOr all along that chain. Where evil_bit is on, only the last step in that chain is at fault, because that whole area of the system is an "antivirus quarantine"/sandbox, so anyone who gives execute permission (such as by copying out of it and double clicking an exe file) or obeys or believes something inside an antivirus quarantine is at fault, and since the quarantine only includes lambda functions (in the space of all possible lambdas, which can be derived as pure math, looped over and generated, etc), to a mathematician all lambdas are neutral, and it is only the "last step" of someone chooses to ignore evil_bit being on and give it execute permission or obey it or believe it, possibly leading to some problem outside the quarantine/sandbox, and that person is at fault for taking lambdas (which are all safe there) and using them where they are not safe. So nomatter what "evil" things the lambdas may do, such as someone might sneak in viruses or ransomware (which will not infect anything when used just as quarantined lambdas, even when running as apps across many computers together) and because of halting_problem it cant always be known and because of merkle garbage collection it cant be removed without breaking at least parts of the system while incoming pointers exist, where the evil_bit is on, none of that is a fault/negligence and instead those who use evil where only good is allowed are at fault.

All data that anyone receives may be computed in any way they like and further shared. In the "good" namespace, the common politics and rules and conflicts may apply, but in the "evil"/antivirusQuarantined namespace, anything of pure information may happen, so dont complain when that happens, and if you dont want data to be shared and computed about then dont put it in public. Your privacy will be respected only as far as you (or any other programs running on your computer(s) etc) dont choose to put that data in public, which may translate it to lambda form, and nobody owns lambdas, so dont try to cut holes in the space of all possible lambdas throwing wrenches into this machine. Your privacy can be so strong, that wikibinator203 will cooperate with anyone who wants to operate a darknet (info may come in, but none or only locally approved info goes out, if any, and if not its "dark").



The Evil Bit may save us from censoring

"The evil bit is a fictional IPv4 packet header field proposed in RFC 3514, a humorous April Fools' Day RFC from 2003 authored by Steve Bellovin. The RFC recommended that the last remaining unused bit, the "Reserved Bit"[1] in the IPv4 packet header, be used to indicate whether a packet had been sent with malicious intent, thus making computer security engineering an easy problem – simply ignore any messages with the evil bit set and trust the rest." -- https://en.wikipedia.org/wiki/Evil_bit

I'm going to use it in https://github.com/benrayfield/wikibinator203 where any 256 bit id that starts with 11110100 is good, if starts with 11110000 it may be good or evil or any combo, and if it starts with anything else (the other 254 byte values) its a literal 256 bits and is neutral.

Everything thats good has an evil twin. Everything thats evil has a good twin. A thing is not good or evil by itself but only depending how you interpret it, so every thing has 2 ids, one that means you're using it for good, and one that means not necessarily good ("evil").

The evil_bit so far has just been a joke, but I plan to use it for an important purpose: to reduce or stop censoring in the "antivirus quarantine" areas of wikibinator203, where censoring (or forced removing of any kind) should be avoided, but in the good areas (outside antivirus quarantine) only "good" uses are allowed, so the normal "cancel culture" aka "cancel mob" can play/work with their "good" lambda functions, and those who dont want to be censored/etc an play/work with the more flexible evil_bit lambdas. Which do exactly the same thing as their good/evil twin (just flip a bit to get the id of the twin, unless its neutral then theres only 1 id).

Legally speaking, if you give execute permission to something in an "antivirus sandbox" (aka has the evil_bit on) that is your fault/negligence for getting the virus, and similar if you obey or believe it. We told you its evil. It was clearly marked. You knew what you were getting into.

If you dont want evil on your computer, then just check for the evil_bit and say no thank you. Of course, as usual, someone could claim things are good when they're not, but thats an issue I leave to the cancel mob.

FIXME TODO... Maybe there should be a bit for https://en.wikipedia.org/wiki/Evil_bit in the ids (256 or 512 bits), or call it a isCertainlyGoodBit (vs may be good, neutral, or accidentally evil as anyone can offer lambdas and those who receive and build with them might not know its "evil" until its hard to remove without breaking stuff). There would be a certain bit, somewhere in the first 32 bits of an id, that for call pair ids (any bitstring small enough to fit in an id is automatically good), and if you flip that bit, you have the id of its evil/good twin. So if you have all good ids, or all evil ids, you dont have to store both and can just flip that bit to get the other ids recursively. This way, you can choose to work outside "antivirus quarantine" (good) or inside it (may also contain evil). There is hopefully no censoring (or any kind of forced removing) inside quarantine, but theres not much we can do about it outside. I'm guessing that the good/outside will have technical problems with merkle garbage collection, and inside wont, but I dont need to make that choice for people as they can try both. The 2 kinds of ids cant see eachother, nor can a lambda know if its evil bit is on or off since both id makers are valid lambdas that both isCertainlyGoodBit and NOT_isCertainlyGoodBit can compute. To make room for a few more bits in id, max curriesLeft is reduced to 255 to fit in a byte, or maybe get the space somewhsere else....
..

UPDATE: put the isCertainlyGoodBit in the first byte of each id. Before this change, any id that started with 111110 is a literal 256 or 512 bits that is its own id (depending on which kind of id). Shrink that to 11110 (which doesnt overlap any utf8 of the first 64k codepoints, only overlaps big floats and doubles, and doesnt overlap the most common utf16, and a few other infrequent things will just take more lambdas to represent those bitstrings). So the first byte has 3 more bits. If it starts with 11110100 its isCertainlyGoodBit of callpair. If it starts with 11110000 its NOT_isCertainlyGoodBit of callpair. ******01 and ******10 and ******11 are an optimization of storing 256 (or 512 if thats the id size) literal bits in an id of that same size (id of an id of an id of an id is 256 bits, but id of an id of an id of an id of an id takes 2 nodes of 256 bits each for the 2 128 bit halfs and a parent callpair node of them), as its the id of the first byte minus 1 and the rest are the same. If it does not start with 11110 then it 256 (or 512) bits that are their own id. So for example the 32 utf8 bytes of "this sentence is its own id utf8" is its own 256 bit id, and its isCertainlyGoodBit is 1 since if a small literal bits fits in an id (its probably not big enough to cause anyone problems) it has no space to store anything except itself, and its good. Only nonliteral callpairs can have NOT_isCertainlyGoodBit. So keep the max curriesLeft as 4094 (fits in 12 bits). Evil_bit will be in that standard place in a variety of possible id types.

SMALL SUMMARY: Basically you can do almost anything you want except nobody owns the generated lambdas and nobody is allowed to stop others from sharing lambdas that they have, and the space of all possible lambdas includes (some people and laws might view them as) both good and evil lambdas (but to a mathematician all lambdas are neutral) so dont copy them outside the sandbox/antivirusQuarantine unless you take responsibility for if things go wrong, so inside the sandbox/antivirusQuarantine you may be good or neutral (and evil may also happen that you have a neutral opinion about and have no obligation to prevent evil or to prevent evil from benefitting from your "actions", and there are no actions (in clean lambdas) to change state to another state since 100% of the system is cache and therefore can operate consistently across a wormhole to the past or a grandfather-paradox (or more practically for better branch-prediction across big distances, (TODO https://intelligence.org/files/TDT.pdf Timeless Decision Theory ?))), and outside it only good is allowed, but how to do that legally is more complex, and there will literally be viruses (which are lambdas and will not be removed while there exist incoming pointers for merkle garbage collection) etc inside the sandbox/antivirusQuarantine so it is not a legal trick but an actual way of organizing things safely (its far more efficient to prove math than to prove things in a courtroom), including possible superintelligent AI viruses, in theory so seek advice of peer review before trusting the web of interoperable-in-realtime wikibinator203 VMs that in theory will enforce the rules of the universal lambda on eachother by turing-complete-challenge-response...

BIGGER SUMMARY: All lambdas are stateless, immutable, and fork-editable, so all uses and combos of them are voluntary, and nobody has technical ability to change what anyone else builds or uses, except to build lambdas from lambdas to vary their behaviors, add or remove behaviors, or measure eachother, in a repeatable peer reviewable way in the clean lambdas (unlike where nondeterministic roundoff etc is used optionally). Its safe to link from the "normal web" into the antivirusQuarantine/sandbox by a 256 bit or 512 bit id, used similar to a #hashtag, since that does not give it execute permission. no patents related to lambdas. no trademarks of lambdas, especially a universal lambda. no copyrights of lambdas. yes copyrights of interoperable-in-realtime VMs, but VMs that compute different universal lambdas must not use the same human readable name for those universal lambdas. because of the technical inability to verify trillions of lambdas per second each obey all the rules of the "normal world", such as "virus" seems to be defined as any program that humans strongly dislike, stored and evaling lambdas (including bitstrings) are an antivirus quarantine and sandbox that exists across many computers. As usual anyone who copies out of an antivirus quarantine and obeys, believes, or gives execute permission to it (such as by downloading or generating an exe file and double clicking it) is at fault/negligence if something goes wrong from that (you can digital signature and compute to prove things to eachother depending what axioms you believe), unlike how misinformation and viruses are often blacklisted in "the normal internet" vs "dark web" etc. Since lambdas are made of 2 lambdas each recursively, there is no technical ability to remove "bad" lambdas without damaging potentially trillion or more "good" lambdas that have merkle forest paths to them, so if goodness/badness cant be computed at time of calling a lambda on a lambda to find/create lambda then it us technically not possible to run such a system efficient enough to be useful while pieces of it are randomly removed and not allowed to be added back from redundant storage. Any lambda sent outward to other computers may be cached and turing complete load balanced automatically, so dont ask for it back since cache never expires. If you use the lambdas inside sandbox/antivirusQuarantine many nontechnical people can work and play and build together safely, only putting themself and those who wrongly trusted them at risk if they let it out of sandbox. The borders of sandbox will be clearly marked and may be a private sandbox or global sandbox across many computers but not allowing networking to computers not opted in to this universal lambda and running a VM to avoid botnet and DoSAtrack behaviors etc. There will be actual viruses in quarantine, along with games, science tools, musical instruments, etc, and the world will be protected from such viruses escaping sandbox. all in theory of course. but the viruses wont be removed unless there are no imcoming pointers by merkle garbage collection. This is all in theory, and the programmers of the many interoperable-in-realtime VMs take no responsibility for if the VMs dont obey the spec dont compute the universal lambda as they should are buggy etc, by accident, and if you have any legal claims against any content etc the standard response will be to antivirus quarantine it or disprove such claims but keep your "normal rules" off our antivirus quarantine areas if possible, but such things would affect those who copy from quarantine/sandbox to "the normal internet" etc but not including just into peoples minds (which canvas webaudioapi eyes ears etc may be a path of copying to the mind) etc since thought-police are illegal, so seek advice from peer review before trusting.
DETAILS...

This wikibinator203 VM is copyright Ben F Rayfield,
except that he has no right to stop the copying of it,
as this license grants copyleft rights to everyone recursively.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Other than the recursive copyleft parts mentioned below, Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to this license.

This license shall be included in all copies or substantial portions of the Software.

Nobody owns the facts of math. In a recursive copyleft way, nobody owns the generated output, which are all lambdas that are derivative works of the universal lambda, but other than that you can hook it to whatever you want, at your own risk and the risk of any system which wrongly trusted you. All such lambdas are facts of math.

Its necessary, because so many lambdas will be created and shared, much faster than they can all be verified to obey all the rules of the normal world, to just protect the world from these possible behaviors, but define these behaviors (the math of the universal lambda) as normal inside the sandbox...
..
In theory, wikibinator203 is, among other things, an antivirus so advanced it needs no updates to safely contain and share (with other wikibinator203 VMs) viruses, botnets, ransomware, or any kind of information, because it whitelists by turing-complete formal-verification (verifying the calculation of the universal lambda, which includes that if one thing in the sandbox infects another thing in the sandbox with a specific virus, that the calculation of that virus is done exactly as the math of the universal lambda says to, and that it doesnt escape the sandbox, and since all clean lambdas are immutable and stateless, a program can only be fork-edited like to ask "what would happen if that virus infected it" and can have both forks existing at once, so being infected by a virus is voluntary and so is all other combos of the universal lambda such as musical instruments or games or science tools) instead of blacklisting by observation after failure, but wikibinator only protects inside its its sandboxes, which can be private or a peer to peer network of a variety of interoperable wikibinator203 VMs that each compute the same universal lambda (combinator) and may differ in optimizations and security practices etc. If a user chooses to copy things out of such a sandbox aka antivirus quarantine then it is their own fault/negligence if that lets viruses, "dark web", ransomware, or worse, loose on their computer, so if you are not a math expert you probably should not copy any files out of a wikibinator203 sandbox to run by double clicking them, for example, and insteadany people and artificial intelligences in a global sandbox can work and play together safely, viewing and interacting with the sandbox through safe web standards such as html canvas and WebAudioAPI and gamepad api, textareas, checkboxes, etc. Therefore, even if something would normally be blacklisted in other systems, that thing as pure information in a wikibinator203 sandbox is safe, but peoples or programs reactions to those things are outside such a sandbox, so to be safe, dont obey or believe or give execute permission to anything in the sandboxes unless you take responsibility for that it may have been generated maliciously and is in an antivirus quarantine/sandbox while apps and games and tools run entirely inside such sandbox. Some of those tools, many people and artificial intelligences can build together inside sandbox, can help to organize and filter lambdas, using lambdas, such as a "spam filter" or turing-complete searching for "lambdas that return 42 when called on themself". A person has no reasonable expectation that the contents of an antivirus quarantine (wikibinator203 sandbox, whose borders cross many computers and run apps in realtime) is safe or legal aka may be part of the "dark web", so be careful not to "let a tiger out of its cage" (as a tiger roaming free may be illegal, while a tiger in a zoo is legal). I dont want to make a system that motivates people to jailbreak it, so all the "doors" open freely from the outside but not from the inside, and to cross between VMs both sides must agree, with a strong and well-explained warning to prevent accidents.

A hash collision of ids would, in theory, only break things inside sandbox, and anyone who wrongly trusted it to compute the universal lambda in some VM that actually does not, but hopefully the VMs will be so simple and bug-free that wont happen. If you need high security, 512 bit ids (instead of the default of 256, with 192 bits of hash) are recommended. Multiple id types can be generated at runtime since an id maker is a lambda that when called on a lambda returns a lambda that is the bits of its id. Every id maker can generate the id of itself, for example, as its very self referencing.

It is invited to attempt to use the rules of the univeral lambda to prove true equals false or whatever contradiction, and to use such "hacking" to the hacker's benefit, therefore motivating normal nontechnical users and math experts, to prove that is not possible in whatever set of axioms they believe. For example, you may make up random 256 bit "fake ids" and send them to internet addresses which are known to be requesting ids. If one requests, outside sandbox, only real ids, then it is to be interpreted as requesting any ids real or made up, for example. UPDATE: not sure if that can be invited without also inviting DoSAttacks, which are more of an inconvenience with automatic recursive turing-complete load-balancing, but still seems inefficient to request them in a license, but also what problems could occur??? if dont request it, cuz then someone could try to inject "the worlds normal rules" into network messages, trying to enforce that only certain bit patterns are allowed.

Anything stored as bitstrings (instead of a .exe file waiting for someone to accidentally click it) is, in lambda form, a complete binary tree of 0s and 1s, where 0 and 1 are 2 specific lambdas, and the last 1 bit marks the end of the bitstring. It is sandboxed since all bitstrings/integers are part of math.

Different universal lambdas must not, outside sandbox (cuz inside, all possible calculations of finite time and finite memory are allowed), have the same Human readable name, so if for example you fork wikibinator203.js to change its opcodes or add behaviors to its opcodes in a way that does not break any known existing lambdas (such as if a parameter is a digital signature signed by you (which otherwise nobody except you would know how to make) or returns a lambda when it otherwise would have infinite looped), then that would be called something other than wikibinator203. You cant make an open-standard proprietary by sneaking modified behaviors into existing derived lambdas, that only work in your kind of VMs, and if you do then hopefully it will be detected by the many interoperable VMs can turing-complete-challenge-response eachother in many combos, including verifying that a runtime generated emulator of the univeral lambda (clean lambdas only) gives the same id for a certain lambda call, as the univeral lambda does, if they want to. If you want to modify behaviors of existing lambdas, you can derive a lambda to do that. They're universal for all calculations of finite time and finite memory. Nobody may own a trademark of any such universal lambda's name based on their derivative work of this, instead only by the world's possible convergence toward open-standards.

Similarly, no patents are allowed for this software or derivative works of it or any patent that would apply to it by a variant of this universal lambda (optimizations of wikibinator203 VMs, ways of using lambdas, things to use lambdas for, ways of figuring out things about lambdas, ways of computing lambdas on exotic matter computers, etc), since its opensource and patents are the opposite of opensource and are an attack on it that are a battle opensource loses when it happens (and if you have a patent you are likely to be threatened with other patents until you transfer ownership of it to patent pools which threaten eachother similar to WMDs threaten eachother in Mutually Assured Destruction), except the parts of a system unrelated to lambdas. It should be an open-standard. Money can be made other ways related to it, such as paying people to find solutions to question, where question(answer)->scoreAsFloat64Number, which could be a way to turing-complete search simple things many times per second andOr a way to hire people and artificial intelligences for "contract jobs".

Copyleft license ends here.
]]]
