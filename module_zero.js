const ModuleZero = {
    //
    description: "The absolute beginning — and we mean it. Before you write a single line of C, you need to understand what a computer actually is, why binary exists, what a compiler does to your text file, and why a language invented in 1972 still runs the world. Start here if you've never coded before, if you think HTML is a programming language (it isn't), or if you just want to understand the 'why' before the 'how'. This module is the foundation everything else is built on — skip it at your peril.",
    
    lessons: [
        {
            id: "what-is-programming", //
            title: "What is a Programming Language?", //
            explanation: "Imagine trying to give instructions to someone who speaks no human language — not English, not Bengali, nothing. They only understand a list of exactly 200 specific commands, each a number. You can't say 'make me a sandwich'. You have to say '047 (pick up bread), 112 (open refrigerator), 031 (locate ham)...' and so on, for every single action. That's what programming a computer was like before programming languages existed. A programming language is a deal between humans and machines: you write something readable, a tool called a compiler translates it down to those numbered machine commands. The closer a language sits to human thought, the easier it is to write but the less control you have. The closer it sits to the machine, the faster and more powerful it is but the more you have to think like hardware. C sits deliberately in the middle — readable enough that humans can reason about complex programs, low-level enough that the generated machine code is nearly as fast as writing those numbered commands by hand. That sweet spot is why C has been the language of choice for operating systems, databases, and firmware for over 50 years.",
            sections: [
                {
                    title: "The Translation Chain", //
                    content: "The CPU in your computer executes machine code — sequences of numbers that represent primitive operations like 'load this value into register 3' or 'jump to address 0x4020 if the zero flag is set'. Nobody writes software that way anymore because it is impossibly tedious and completely tied to one specific processor design. Think of it like this: machine code is the raw electrical dialect of one particular chip. Writing a program in machine code for an Intel CPU means that program is incomprehensible to an ARM chip — you'd have to rewrite it from scratch for every new piece of hardware. Programming languages exist to free you from that. You write in a human-readable form, then a tool automatically translates that into whatever machine code the target hardware speaks. The translation approach determines a language's character: translating the whole program at once before running it (compilation) produces fast programs; translating and executing line-by-line while running (interpretation) produces flexible, more portable, but slower ones.",
                    points: [
                        "<strong>High-level languages (Python, JavaScript, Ruby)</strong>: Prioritize developer speed and safety. The language runtime handles memory, types, and most error conditions for you — you can build a web server in 20 lines of Python. The cost is performance overhead and reduced control. You can't directly specify which CPU register holds a value, because the runtime is making those decisions for you.",
                        "<strong>Mid-level languages (C, C++, Rust)</strong>: Give you direct control over memory layout, hardware registers, and execution speed, while still letting you write readable code with named functions and structured control flow. The cost is responsibility — when something goes wrong, no runtime is going to catch it for you. You own the bugs.",
                        "<strong>Low-level (Assembly, machine code)</strong>: You write instructions the CPU executes directly. Every register allocation, every memory address is your decision. Maximum control; minimum sanity. Operating systems and compilers are partly written in it, but almost nothing else is. Writing a 'hello world' in assembly is a humbling experience.",
                        "<strong>The translation layer (compilers and interpreters)</strong>: The compiler reads your entire source file, checks it for correctness, optimizes it, and produces a standalone executable. Run that executable and no compiler is needed — the CPU runs it directly. The interpreter reads and executes one instruction at a time at runtime — your source file must be present every time the program runs. C uses a compiler, and the result is a binary that runs at full hardware speed with no runtime overhead whatsoever."
                    ]
                },
                {
                    title: "Why Have Programming Languages At All?", //
                    content: "The earliest computers were programmed by physically rewiring them — you didn't write code, you rebuilt the machine. Then came machine code: numeric opcodes entered by hand on toggle switches, row by row. Then assembly — symbolic names for those opcodes, still one-to-one with hardware instructions. To get a feel for how painful this was: writing something as simple as 'multiply two numbers and store the result' in assembly takes five to ten instructions. You must manually decide which CPU register holds each value, track which flag bits are set, and handle edge cases the hardware exposes at that level — and you do this for every single operation in your program. The entire motivation for high-level languages was to let programmers express intent — 'compute the area of a circle' — without specifying every machine-level step required to achieve it. They trade some performance for an enormous increase in human productivity.",
                    points: [
                        "<strong>Abstraction</strong>: You write <code>result = a + b</code>. The compiler figures out which registers to use, whether to use an ADD or ADDI instruction, and how to handle the result. Without abstraction, you specify every one of those decisions yourself — and then redo the whole thing from scratch for every CPU architecture your code needs to run on.",
                        "<strong>Readability and maintainability</strong>: Code is read far more often than it is written. After six months away from a project, named variables, descriptive functions, and structured control flow (<code>if</code>, <code>while</code>) let you reconstruct your intent in minutes. Assembly code from six months ago requires archaeological excavation — and there's no guarantee you'll find what you buried.",
                        "<strong>Portability</strong>: Assembly code written for an x86 CPU will not run on an ARM chip — it's not even close; they use entirely different instructions. C source code written in 1985 compiles and runs on x86, ARM, RISC-V, MIPS, and dozens of other architectures. The compiler is the translator; you write once.",
                        "<strong>Correctness</strong>: The compiler can catch a large class of errors — type mismatches, misspelled names, unreachable code, wrong number of arguments — before the program ever runs. A machine code programmer has no such safety net. Every mistake is a runtime catastrophe waiting to happen."
                    ]
                },
                {
                    title: "Where Does C Fit?", //
                    content: "C occupies a unique position in the spectrum. It is high-level enough that you write readable, structured code — named functions, loops, conditionals, complex data structures. It is low-level enough that you directly control memory layout, manually allocate and free heap memory, read and write individual bytes, and interact with hardware at the register level. No other widely-used language sits exactly at this point. This is why C became the language of operating systems, compilers, databases, embedded firmware, network stacks, and virtual machines. Consider what these domains have in common: they all need both human-expressible logic AND direct hardware control. A database needs to sort a billion rows — you need algorithms (human logic) that operate directly on memory (hardware control). A network driver needs to respond to packets in microseconds — you need structured code that manipulates exact byte sequences. C provides both without compromise, which is why it has been the default answer to 'what language do I use for this?' in systems programming for five decades.",
                    points: [
                        "<strong>Portability without abstraction cost</strong>: C compiles to native machine code on every platform. Unlike Java (which runs on a virtual machine with its own garbage collector and runtime overhead) or Python (which is interpreted line by line), there is no runtime layer consuming CPU cycles between your code and the metal. A well-written C program is typically within a few percent of the theoretical maximum speed for the hardware — meaning you're leaving almost nothing on the table.",
                        "<strong>Predictable memory model</strong>: C gives you direct visibility into exactly how your data is laid out in memory — struct member offsets, pointer sizes, alignment requirements, padding bytes. This is not just academic. If you're writing a device driver, you need to know that a particular register is at byte offset 12 in a struct. If you're parsing a network packet, you need to know exactly which bytes represent the source port. C makes these things explicit rather than hiding them behind abstractions.",
                        "<strong>Longevity</strong>: C code written in the 1980s compiles and runs today, unchanged. The language is standardized (C89, C99, C11, C17, C23) and the core has never broken backwards compatibility. When you invest time learning C, you are learning something that will still be valid and useful in 30 years. Python 2 code can't even run on Python 3.",
                        "<strong>The price of control</strong>: C trusts you completely and unconditionally. It will not stop you when you read past the end of an array, write through a dangling pointer, or overflow an integer. These are not language failures — they are the deliberate absence of checking overhead. Every check you don't pay for in C is a few nanoseconds saved, multiplied across billions of operations. Understanding precisely when and why these things happen — and how to avoid them — is the entire curriculum."
                    ]
                }
            ]
        },
        {
            id: "binary-and-base2", //
            title: "Why Do Computers Use Base 2?", //
            explanation: "Before you can understand what C does to memory, you need to understand what memory actually is. Here's the uncomfortable truth that most programming courses gloss over: your computer stores everything — your code, your variables, your photos, your music, the operating system itself — as patterns of 0s and 1s. Not as abstractions of 0s and 1s. Literally, physically, as billions of tiny switches that are either on or off. When you declare an <code>int x = 42</code> in C, you need to understand that somewhere in your RAM, a group of 32 physical switches are set to the pattern 00000000 00000000 00000000 00101010, and the CPU reads that pattern and interprets it as the number 42. This is not optional knowledge. C operates one level above this reality — and to write correct C, you must have a mental model of that reality.",
            sections: [
                {
                    title: "Base 10 vs Base 2: The Counting System", //
                    content: "A number base is an agreement about how many distinct digit symbols you use before you run out and start combining them. Base 10 uses ten symbols (0–9) because humans have ten fingers — a biological accident that became mathematical convention. When you count in base 10 and reach 9, you're out of single digits, so you write 10: a 1 in the 'tens place' and a 0 in the 'ones place'. Computers use base 2 for a physical reason that has nothing to do with fingers: the components that store information inside a computer are transistors, and a transistor has exactly two stable states — conducting current or not conducting current. That physical binary reality maps perfectly to mathematical binary. There's no choice involved; the physics mandates it. Every number, every character, every instruction in your computer is stored as a pattern of these on/off states.",
                    points: [
                        "<strong>Base 10 (decimal)</strong>: Uses digits 0–9. The number 247 means (2 × 100) + (4 × 10) + (7 × 1). Each position is a power of 10.",
                        "<strong>Base 2 (binary)</strong>: Uses digits 0 and 1 only. The number 247 in binary is 11110111, meaning (1×128) + (1×64) + (1×32) + (1×16) + (0×8) + (1×4) + (1×2) + (1×1) = 247. Same value, different notation.",
                        "<strong>Why binary takes more digits</strong>: With only two symbols, you need more digits to represent the same number. 247 takes 3 decimal digits but 8 binary digits. This is fine — the hardware compensates with billions of transistors switching at billions of times per second."
                    ]
                },
                {
                    title: "Why Base 2? It's All About Hardware", //
                    content: "Imagine trying to build a storage device that reliably distinguishes ten voltage levels — 0V, 0.5V, 1.0V, 1.5V... up to 4.5V. Any electrical noise on the wire, any temperature variation, any manufacturing imperfection, and you might misread 1.5V as 1.0V. That is a data corruption — your file just silently changed. Now imagine only two states: below 2.5V means 0, above 2.5V means 1. You have an enormous margin of error. A signal has to be very wrong indeed to be misclassified. This is why digital electronics converged on binary. It is not the most information-dense possible encoding — base 10 would store more information per wire — but it is the most reliable encoding possible given the physical realities of electrical noise, temperature drift, and mass manufacturing. The reliability advantage so dramatically outweighs the density disadvantage that every reliable digital system in history has used binary.",
                    points: [
                        "<strong>Physical mapping</strong>: A transistor either conducts current (1) or does not (0). The digital logic built from transistors reads this as a high or low voltage. This is binary by nature, not by choice.",
                        "<strong>Error resistance</strong>: With two states separated by a large voltage margin, you can tolerate significant noise, temperature drift, and manufacturing variation before a bit is misread. This is why modern CPUs can reliably execute billions of operations per second without constant data corruption.",
                        "<strong>Speed</strong>: Testing 'is the voltage above or below a threshold' is an extremely fast operation at the transistor level. Testing 'which of ten exact voltage levels is this?' is vastly slower and prone to error.",
                        "<strong>Logical operations map perfectly</strong>: AND, OR, NOT, XOR — the entire basis of Boolean logic — map directly to simple transistor circuits. Adding two binary numbers, comparing them, shifting them — all of these become simple gate arrangements. The maths of binary and the physics of transistors are a perfect fit."
                    ]
                },
                {
                    title: "Bits, Bytes, and Practical Binary", //
                    content: "A single binary digit — a 0 or a 1 — is called a <strong>bit</strong>. One bit can represent two states. Two bits can represent four (00, 01, 10, 11). Each additional bit doubles the number of possible patterns. Eight bits (called a <strong>byte</strong>) can represent 2⁸ = 256 different values (0 to 255) — enough for every printable ASCII character, a pixel colour component, or a small integer. The byte became the standard unit because 8 bits was enough for a character encoding AND happened to map cleanly to powers-of-two groupings that work efficiently in hardware. Here's the profound insight that C forces you to confront: everything in your computer is just bytes. The same 4 bytes in memory can be a 32-bit integer, a float, a colour value, or four ASCII characters — depending purely on how you tell C to interpret them. There is no label, no tag, no inherent meaning. The type you declare is everything.",
                    points: [
                        "<strong>1 bit</strong>: Two possible values. Either 0 or 1. The single smallest unit of information.",
                        "<strong>1 byte (8 bits)</strong>: 256 possible values (2^8). The smallest addressable unit of memory — every byte in RAM has a unique address. The C type <code>char</code> is exactly one byte wide by definition — you will later meet the <code>sizeof</code> operator, which can measure that in code; for now, just remember: one <code>char</code>, one byte.",
                        "<strong>Kilobyte, megabyte, gigabyte</strong>: These follow powers of 2, not powers of 10. 1 KB = 1,024 bytes (2^10). 1 MB = 1,048,576 bytes (2^20). 1 GB = 1,073,741,824 bytes (2^30). Hard drive manufacturers use powers of 10 in advertising, which is why your 1TB drive shows up as 931GB in your OS.",
                        "<strong>Hexadecimal as binary shorthand</strong>: Base 16 uses digits 0–9 and A–F. One hex digit represents exactly 4 binary bits — this is why hex is useful. Writing <code>0xFF</code> is cleaner than <code>0b11111111</code> but carries the same information. You will constantly see hex in C for memory addresses, bit masks, and colour values.",
                        "Try editing the code below — change the numbers, add your own, and observe that C treats decimal, hex, and binary as the same underlying integer value. The notation is for human convenience; the machine only sees bits."
                    ],
                    code: `#include <stdio.h>\n\n// In C, you can write binary, decimal, and hexadecimal literals:\nint main() {\nint decimal = 247;      // Base-10\nint hex = 0xF7;         // Hexadecimal (base 16)\nint binary = 0b11110111; // Binary (base 2)\n\nprintf("They are all exactly the same: %d, %d, %d\\n", decimal, hex, binary);\n// Output: They are all exactly the same: 247, 247, 247\n}`
                }
            ]
        },
        {
            id: "compilers-interpreters", //
            title: "Compilers vs Interpreters", //
            explanation: "You write C code in a text editor. It's just text — no different from a .txt file as far as the operating system is concerned. The CPU you want to run that code on cannot read English, cannot read C, cannot interpret human intent in any form. It only understands its own specific instruction set — binary encodings of operations like 'add these two registers' or 'branch to this address if the result was zero'. Compiling is the process of bridging that gap: taking your structured, human-readable C text and mechanically translating it into the exact sequence of binary machine instructions that realises your intent on a specific CPU. Understanding what the compiler does at each stage is not optional knowledge. It is the difference between looking at an error message and understanding immediately what went wrong, versus staring at cryptic output in confusion. It explains why the same C source code produces different binaries on different operating systems, why certain bugs appear at runtime but not compile time, and why a 1972 programming language still compiles and runs perfectly in 2026.",
            sections: [
                {
                    title: "What Does a Compiler Do?", //
                    content: "A compiler is a translator that reads your entire program before translating any of it. This is the key difference from an interpreter, and it has profound consequences. Because the compiler sees the whole program at once, it can detect errors that span multiple locations: 'you declared this function to take two arguments, but you called it with three — on line 47'. It can also optimize aggressively: 'you compute this same value in four different places in this loop — compute it once and reuse the result'. The output is a complete, standalone binary. Once compiled, the binary runs without the compiler being present — the CPU executes pre-translated machine instructions directly, with no overhead for translation.",
                    points: [
                        "<strong>Compile time vs runtime</strong>: Compilation is the translation phase — it happens once, before the program runs, and is relatively slow (the compiler is doing significant analysis and optimization work). Runtime is when the translated binary actually executes — it is fast precisely because translation is already done. A C program that takes 3 seconds to compile might run in 0.001 seconds, and you run it a thousand times. The upfront compilation cost is almost always worth it.",
                        "<strong>Early error detection</strong>: The compiler sees your whole program before any of it executes. Type mismatches, undeclared variables, missing semicolons, wrong number of function arguments — all caught before the program touches any real data. In an interpreted language, a typo in a rarely-executed branch might survive in production for months before someone triggers that code path.",
                        "<strong>Optimization</strong>: A compiler compiling with <code>-O2</code> will routinely produce code that is 2–5× faster than a naive translation. It understands the target CPU's pipeline, cache behavior, and register file far better than a human writing by hand. Functions can be inlined, loops unrolled, common subexpressions eliminated, and dead code removed — all automatically.",
                        "<strong>Distribution</strong>: You ship the compiled binary, not your source code. The end user does not need a compiler, a runtime, or any development tools. This is also why software used to come on CDs — you compiled it once for Windows x86 and shipped that binary to everyone."
                    ]
                },
                {
                    title: "What Does an Interpreter Do?", //
                    content: "An interpreter reads and executes your source code one statement at a time, at runtime. There is no separate compilation step — you run the source file directly, and the interpreter does the translation and execution simultaneously. Think of it like a human translator working in a live meeting: they listen to one sentence, translate it, speak it, then listen to the next. This makes iteration fast: write a line, run it immediately. The cost is performance — the interpreter adds overhead on every statement, every time, and it can never see the whole picture to do cross-statement optimization. Also: because the interpreter only sees the current statement, a bug on line 200 is completely invisible until execution actually reaches line 200.",
                    points: [
                        "<strong>Startup speed</strong>: No compilation phase means programs start immediately. For scripts and interactive tools this is valuable.",
                        "<strong>Runtime errors appear late</strong>: The interpreter only sees a line when execution reaches it. A typo in a rarely-executed error handler might go undetected for months — until the error condition actually triggers.",
                        "<strong>Portability through the interpreter</strong>: The same Python script runs on any machine with a Python interpreter. But the interpreter itself must be installed and maintained.",
                        "<strong>Examples</strong>: Python, Ruby, early JavaScript, Bash. These all read and execute source code at runtime."
                    ]
                },
                {
                    title: "The Battle of Trade-offs", //
                    content: "Neither approach is universally better — the choice depends on what you are optimizing for, and different problems genuinely have different right answers. A video game rendering engine needs to process 60 frames per second, each involving millions of math operations. A few nanoseconds of overhead per operation adds up to missed frame deadlines. It must be compiled. A data scientist writing a script to process one CSV file doesn't care whether the script takes 0.1 seconds or 0.3 seconds — they care about writing it in 10 minutes instead of 2 hours. It should be interpreted. The genius of C's design is that it never charges you for overhead you didn't request. Its philosophy: give me performance, and I'll be responsible for the consequences.",
                    points: [
                        "<strong>Compiled (C, C++, Rust, Go)</strong>: Maximum performance, minimum runtime overhead, standalone executables. Suitable for operating systems, embedded systems, real-time applications, databases, and any domain where execution speed or memory footprint is a hard constraint.",
                        "<strong>Interpreted (Python, Ruby, Bash)</strong>: Fast development iteration, easy portability through the interpreter, built-in high-level data structures. Suitable for scripting, glue code, data analysis, and applications where developer time is more expensive than CPU time.",
                        "<strong>JIT-compiled (Java, JavaScript V8, PyPy)</strong>: The runtime compiles hot code paths to machine code while the program runs. Attempts to get both fast iteration and fast execution. Often achieves near-compiled performance on long-running code but has high memory usage and unpredictable latency spikes during JIT compilation."
                    ]
                },
                {
                    title: "The C Compilation Process", //
                    content: "C compilation is not a single step — it is a pipeline of four distinct stages, each with a specific job and specific kinds of errors it can catch. Most of the time you trigger all four stages with a single <code>gcc myfile.c -o myfile</code> command, and they run invisibly. But when something goes wrong, knowing which stage produced the error tells you exactly where to look. A 'syntax error on line 12' comes from stage 2. An 'undefined reference to printf' comes from stage 4. Without understanding the pipeline, error messages are cryptic noise. With it, they're precise diagnostics.",
                    points: [
                        "<strong>1. Preprocessing</strong>: The preprocessor runs before any C code is compiled. It handles lines starting with <code>#</code> — these are not C statements, they're directives to the preprocessor itself. <code>#include &lt;stdio.h&gt;</code> causes it to literally copy-paste the entire contents of that header file into your source. <code>#define PI 3.14159</code> causes it to find every occurrence of the text <code>PI</code> in your code and replace it with <code>3.14159</code>, like a find-and-replace operation. The output is one big, expanded C file with no <code>#</code> lines remaining. You can see this output with <code>gcc -E yourfile.c</code> — prepare for a shock at how large it becomes.",
                        "<strong>2. Compilation</strong>: The compiler reads the preprocessed C code and converts it to assembly language — human-readable representations of the CPU's instruction set. This is the stage that checks your syntax and types, and where most error messages originate. Forgot a semicolon? Called a function with wrong types? Used a variable before declaring it? All caught here. The output is an assembly file (<code>.s</code>) which you can inspect with <code>gcc -S yourfile.c</code>.",
                        "<strong>3. Assembly</strong>: The assembler converts the assembly code to object code — actual binary machine instructions, but not yet a complete program. References to external functions (like <code>printf</code>) are left as unresolved placeholders. The output is an object file (<code>.o</code>) — a binary file, but with holes where the linker needs to fill in addresses.",
                        "<strong>4. Linking</strong>: The linker's job is to fill in all those holes. It combines your object file with pre-compiled library object files (which contain the binary implementations of <code>printf</code>, <code>malloc</code>, and every other standard library function you called). It resolves all unresolved references and produces a complete, self-contained executable. 'Undefined reference to X' errors come from here — you called a function that the linker cannot find in any of the object files it was given."
                    ],
                    code: `// Terminal command to compile (all four stages in one):
gcc myprogram.c -o myprogram

// Run the result:
./myprogram

// You can inspect individual stages:
gcc -E myprogram.c -o myprogram.i    // Stop after preprocessing
gcc -S myprogram.c -o myprogram.s    // Stop after compilation (assembly output)
gcc -c myprogram.c -o myprogram.o    // Stop after assembly (object file)
gcc myprogram.o -o myprogram         // Linking only`
                }
            ]
        },
        {
            id: "history-of-c", //
            title: "A Brief History of C", //
            explanation: "Languages don't appear in a vacuum. C was invented to solve a specific, pressing, expensive problem that was bleeding real engineering time from real organizations. Understanding that context is not just historical trivia — it explains every design decision C makes. Why does C have pointers? Because OS kernels need them. Why is C so unforgiving? Because checking takes time, and time was the scarce resource. Why can C be compiled for any hardware? Because the original goal was specifically to escape hardware lock-in. Every feature of C is a deliberate answer to a real problem the developers of Unix were actively suffering from. Knowing that makes the language make sense.",
            sections: [
                {
                    title: "Before C: The Era of Assembly", //
                    content: "In the late 1960s, if you wanted to write an operating system or any serious systems software, you wrote it in assembly language — a thin symbolic layer over the raw machine instructions of a specific CPU. Assembly gave you full control and maximum speed, but it had two crippling problems that made software development an expensive nightmare. First, it was extraordinarily tedious. Expressing even simple logic required dozens of low-level instructions, each manually specifying register assignments, memory addresses, and flag conditions. You spent more mental energy managing CPU state than thinking about the actual problem you were solving. Second — and this was the killer — assembly code was completely non-portable. Code written for a PDP-7 was garbage on a PDP-11. They didn't share a single instruction. If your organization upgraded to new hardware, every single line of software had to be rewritten, from scratch, for the new machine. This wasn't a hypothetical risk; it happened routinely, consuming months of senior engineering time every few years.",
                    points: [
                        "<strong>The portability problem</strong>: Every hardware family had its own instruction set, its own register names, its own calling conventions. Writing an operating system meant committing to a single hardware vendor — forever, or until you rewrote everything.",
                        "<strong>The productivity problem</strong>: Complex algorithms that a human would express in two lines of mathematical notation might require 20–50 assembly instructions to implement, with the programmer manually tracking every register and memory location."
                    ]
                },
                {
                    title: "C is Born (1969–1973)", //
                    content: "Why is it called C and not something dignified like 'Systems Language Four'? Because it was the letter after B. Ken Thompson's language B (itself derived from BCPL) was too minimal for rewriting Unix; Ritchie's successor needed a new name, and the Latin alphabet supplied one. Yes, really — the name is sequential trivia, not an acronym. Dennis Ritchie at Bell Labs developed C between 1969 and 1973, building on that earlier language called B. The design goals were specific and unambiguous: produce a language expressive enough to write a complete operating system in, but that compiled to code efficient enough that hand-written assembly would offer no meaningful advantage. The result was a language with a deliberately small, orthogonal core — a handful of types, structured control flow, functions, and most crucially, direct memory manipulation through pointers. C's innovation was demonstrating that 'high-level' and 'high-performance' were not mutually exclusive — you could have structured, readable code that compiled to the same machine code a skilled assembly programmer would have written. That proof of concept changed everything.",
                    points: [
                        "<strong>Designed for operating system implementation</strong>: The primary goal was to rewrite Unix in C. This determined the language's priorities: efficiency, direct hardware access, minimal runtime overhead, and predictable memory layout.",
                        "<strong>Pointers as a first-class feature</strong>: The ability to hold and manipulate memory addresses is not incidental to C — it is central. An OS kernel must be able to point to hardware registers, manage memory maps, and pass data structures by reference efficiently. Pointers make all of this natural.",
                        "<strong>Small, composable core</strong>: C has relatively few built-in abstractions. The power comes from combining simple primitives — structs, arrays, functions, pointers — into arbitrarily complex structures. This minimalism is also why C remains portable and compilable on almost any hardware."
                    ]
                },
                {
                    title: "The Unix Revolution", //
                    content: "C's killer application was rewriting the Unix operating system. Before C, Unix ran only on the PDP-7. When Bell Labs needed to move to a PDP-11, Ritchie and Thompson rewrote the kernel in C. The result was revolutionary: not just a faster development process, but the world's first portable operating system — one that could be compiled for a new hardware target by writing a new C compiler, rather than rewriting the entire OS. This was the key insight that changed the software industry. Unix spread through universities and research institutions, distributed on tape at near-zero cost, and C spread with it. An entire generation of computer scientists learned to program in C. When those people went on to build compilers, databases, languages, and operating systems, they built them in C. That's why C is everywhere today — not because it's perfect, but because it was right at exactly the right moment.",
                    points: [
                        "<strong>1978: The C Programming Language</strong>: Kernighan and Ritchie published the book that defined the language for a generation. Dense, precise, and still worth reading today.",
                        "<strong>1989: ANSI C (C89)</strong>: The American National Standards Institute standardised the language, ending the era of incompatible compiler dialects. For the first time, 'C' meant one specific, documented language.",
                        "<strong>C99, C11, C17, C23</strong>: Subsequent standards added practical improvements — <code>inline</code>, variable-length arrays, fixed-width integer types, atomic operations, <code>constexpr</code>, and more — while maintaining backward compatibility with code from 1989."
                    ]
                },
                {
                    title: "Why Learn It Today?", //
                    content: "The honest, unsentimental answer to 'why learn C in 2026?' is that C changes the way you think about every other language, and that changed thinking is worth more than any specific framework or library you'll ever learn. When you manually manage memory in C, you stop thinking of a Python list as 'a list of things' and start understanding it as a heap-allocated array with a reference count, a capacity, a length, and a pointer to data — and you understand exactly why appending to it is O(1) amortized but occasionally O(n). When you work with C pointers, you understand what a Java 'object reference' actually is at the hardware level and why 'pass by reference' in Java is actually 'pass by value of a reference'. When you write a struct and understand its memory layout, you understand why certain database schemas cache better than others, why Protocol Buffers are designed the way they are, and why cache-friendly data structures matter. C is the layer below everything else. Understanding it is understanding the actual machine.",
                    points: [
                        "<strong>Everything runs on C</strong>: The Linux kernel, the Windows NT kernel, the macOS kernel (XNU), iOS, Android's Bionic libc, Python's CPython interpreter, the Ruby MRI interpreter, PHP's Zend engine, SQLite, PostgreSQL, Redis, nginx, every major game engine — the foundational layer of essentially all modern software is C.",
                        "<strong>Embedded and real-time systems</strong>: Microcontrollers in cars, medical devices, industrial controllers, aircraft flight management systems — these environments have no room for garbage collectors, virtual machines, or runtime overhead. C is the standard.",
                        "<strong>Performance-critical code</strong>: When a database needs to sort a billion rows, when a game engine needs to simulate physics for a thousand objects at 60fps, when a video codec needs to compress 4K video in real time — that code is C or C++.",
                        "<strong>Understanding, not just using</strong>: Every memory leak you debug in a C program teaches you something about heap allocation that no garbage-collected language ever will. Every segfault teaches you about pointer validity. Every buffer overflow teaches you about bounds checking. These lessons transfer to every other language and make you a significantly better programmer across the board."
                    ]
                }
            ]
        }
    ],

    quiz: [
        {
            question: "What is the primary job of a compiler?",
            options: ["Run your code line by line", "Translate your source code into machine code all at once", "Check your grammar and spelling", "Manage your computer's memory"],
            answer: 1
        },
        {
            question: "Why do computers use binary (base 2) instead of base 10?",
            options: ["Base 10 is too slow for math", "Binary was invented first", "Transistors are physical on/off switches with only two stable states", "It uses less storage space"],
            answer: 2
        },
        {
            question: "How many values can a single byte represent?",
            options: ["8", "16", "128", "256"],
            answer: 3
        },
        {
            question: "Which statement best describes an interpreter?",
            options: ["Translates all code before running it", "Translates and executes code line-by-line at runtime", "Compresses code to make it smaller", "Links library code into your program"],
            answer: 1
        },
        {
            question: "Who created the C programming language?",
            options: ["Linus Torvalds", "Brian Kernighan", "Dennis Ritchie", "Ken Thompson"],
            answer: 2
        },
        {
            question: "What does the C preprocessor do with #include directives?",
            options: ["Imports a module at runtime", "Links a compiled library", "Literally copy-pastes the header file content into your source file", "Downloads the library from the internet"],
            answer: 2
        },
        {
            question: "What is a 'bit'?",
            options: ["8 bytes of data", "A single 0 or 1 value", "A unit of processor speed", "A type of memory address"],
            answer: 1
        },
        {
            question: "What was C's 'killer application' that made it spread globally?",
            options: ["Microsoft Windows", "The original web browser", "Rewriting the Unix operating system in C", "The first video game console"],
            answer: 2
        },
        {
            question: "Which is a key advantage of compiled languages over interpreted ones?",
            options: ["Faster to write", "Errors are only caught at runtime", "Resulting programs run much faster", "No need for a build step"],
            answer: 2
        },
        {
            question: "Where does C sit in the spectrum of programming languages?",
            options: ["It is a high-level language like Python", "It is a low-level language like Assembly", "It is a mid-level language between Assembly and modern high-level languages", "It is a scripting language"],
            answer: 2
        },
        {
            question: "Historically, why was the language named 'C'?",
            options: ["It was the third attempt after A and B failed", "It followed the earlier B language at Bell Labs — the name is literally the next letter in the alphabet", "It stands for 'Compiled'", "It stands for 'Central processing language'"],
            answer: 1,
            explanation: "C was developed after Ken Thompson's B language (which came from BCPL). The name is sequential — useful trivia for interviews, not deep philosophy."
        },
        {
            question: "You are choosing a language for firmware on a microcontroller with 32 KB of RAM and no operating system. Which fit is most plausible?",
            options: ["A garbage-collected language that needs a multi-megabyte runtime", "C or a similarly low-overhead systems language", "A browser-only language that expects a DOM", "SQL"],
            answer: 1,
            explanation: "Tiny embedded targets need predictable memory use and no hidden runtime. C (and sometimes a subset of C++) is the default for that world."
        }
    ],

    exam: [
        {
            question: "What are the only two physical states a transistor can reliably represent?",
            options: ["High voltage and low voltage", "On and Off (0 and 1)", "Positive and negative charge", "Signal and noise"],
            answer: 1
        },
        {
            question: "In what year was the C language created?",
            options: ["1965", "1972", "1978", "1983"],
            answer: 1
        },
        {
            question: "What is hexadecimal primarily used for in C programming?",
            options: ["Faster arithmetic calculations", "Storing floating point numbers", "Representing binary patterns and memory addresses compactly", "Encrypting data"],
            answer: 2
        },
        {
            question: "Which of these is a defining property of a compiled language?",
            options: ["Code is translated and run one line at a time", "Errors are only found when that line executes", "All code is translated to machine code before execution begins", "Requires an interpreter installed on the target machine"],
            answer: 2
        },
        {
            question: "1 kilobyte is equal to how many bytes?",
            options: ["1,000", "1,024", "1,048", "2,048"],
            answer: 1
        },
        {
            question: "What is the linking step in C compilation responsible for?",
            options: ["Converting C source code to assembly", "Resolving #include directives", "Stitching your machine code together with external library code to form a complete executable", "Optimizing for processor speed"],
            answer: 2
        },
        {
            question: "Which property of C made Unix the first portable operating system?",
            options: ["C code compiles to the same binary on every machine", "C source code could be recompiled for different hardware architectures", "C has a built-in virtual machine", "C programs run inside an interpreter"],
            answer: 1
        },
        {
            question: "What is 'abstraction' in the context of programming languages?",
            options: ["Making code more complex and verbose", "Hiding low-level hardware details so programmers can express intent at a higher level", "Compressing source code to reduce file size", "Using comments to explain code"],
            answer: 1
        },
        {
            question: "What is the key trade-off of JIT (Just-In-Time) compilation?",
            options: ["Very fast startup but slow peak performance", "It attempts to combine compiled speed with interpreted flexibility, but typically consumes large amounts of RAM", "It produces the smallest possible executables", "It eliminates all runtime errors"],
            answer: 1
        },
        {
            question: "Why is C described as 'unforgiving'?",
            options: ["It has no standard library", "Its syntax is impossible to learn", "It does not protect you from your own mistakes — it assumes you know exactly what you are doing", "It only runs on Unix systems"],
            answer: 2
        },
        {
            question: "What does the preprocessor do before actual C compilation starts?",
            options: ["Optimizes your code for speed", "Processes # directives — e.g., copy-pasting header file contents in place of #include lines", "Converts C code to assembly", "Checks for memory leaks"],
            answer: 1
        },
        {
            question: "The landmark book 'The C Programming Language' by Kernighan and Ritchie was published in which year?",
            options: ["1972", "1975", "1978", "1989"],
            answer: 2
        },
        {
            question: "Which statement about error detection is TRUE?",
            options: ["Compilers catch errors at runtime", "Interpreters catch all errors before execution", "Compiled languages catch most errors at compile time; interpreted languages may only surface errors when the bad line actually runs", "Both compilers and interpreters catch errors identically"],
            answer: 2
        },
        {
            question: "How many bits are in one byte?",
            options: ["4", "8", "16", "32"],
            answer: 1
        }
    ]
};

// BUG FIX: Actually assigning it to the window object so it renders. 
window.ModuleZero = ModuleZero;