const ModuleBeginner = {
    description: "The absolute foundation — and we take that word seriously. This module covers how C programs are structured, how to store data, how to display output, how to read input, and how to make decisions and repeat actions. By the end, you'll be writing programs that do real things. Every concept here is something you will use in every single C program you ever write, so read carefully. No shortcuts — comfort here pays dividends for the rest of the course.",
    
    lessons: [
        {
            id: "structure",
            title: "Anatomy of a C Program",
            explanation: "Every C program, regardless of whether it's a 5-line toy or a 5-million-line operating system, follows the same fundamental structure. This is not ceremonial boilerplate invented to annoy beginners — every single piece exists because something in the compilation process or the operating system requires it. The reason C programs have a <code>main()</code> function is that the OS's program loader needs one fixed, agreed-upon entry point to jump to when starting your program. The reason you <code>#include</code> headers is that the compiler processes one file at a time and needs to see the 'signature' of any function before you can call it. Understanding the 'why' behind each piece is what separates programmers who can debug new situations from those who can only cargo-cult copy examples they don't understand. Let's dissect every line.",
            sections: [
                {
                    title: "The Hello World Breakdown",
                    content: "Every programming tutorial starts with 'Hello, World!' — not because printing text to a screen is exciting, but because it is the smallest possible complete C program where every single line is load-bearing. Remove any one of them and the program either fails to compile or behaves incorrectly. That makes it the perfect specimen for understanding how the pieces fit together. Think of this as an autopsy: we're going to take apart a working program and explain exactly why every organ exists.",
                    code: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
                    output: "Hello, World!",
                    warning: "Never read stdio.h as 'studio.h'. It's 'standard input/output', not 'studio'. Read that again. S T D I O. (std for standard, io for input/output). Even humans may understand why you would read that as studio, but compiler will not. Better be careful."
                },
                {
                    title: "Line-by-Line Explanation",
                    points: [
                        "<strong>#include &lt;stdio.h&gt;</strong>: This is a preprocessor directive — a command to the preprocessor that runs <em>before</em> the compiler sees your code. It says: 'paste the entire contents of the file <code>stdio.h</code> here'. That header file contains the declaration of <code>printf</code> — specifically, it tells the compiler that <code>printf</code> exists, what arguments it takes, and what it returns. Without this line, the compiler sees the name <code>printf</code> and has absolutely no idea what it is. Think of it like referencing a word in a document without including the dictionary definition — the reader (compiler) has no way to verify you used it correctly.",
                        "<strong>int main()</strong>: This defines the function that the operating system calls when your program starts. There must be exactly one <code>main</code> in any C program that produces an executable. The <code>int</code> means this function returns an integer — that integer is your program's exit code, which the OS uses to determine whether your program succeeded or failed. Without <code>main</code>, the linker has no entry point to connect to and will refuse to produce an executable, emitting an error like 'undefined reference to main'.",
                        "<strong>{ }</strong>: Curly braces define a block — a group of statements that belong together and are treated as a single unit. The opening brace starts the block; the closing brace ends it. Every function body is a block. Every <code>if</code> and <code>while</code> body is a block. Mismatched braces cause the compiler to completely misunderstand your code's structure, often resulting in a cascade of errors that have nothing to do with the actual missing brace. When you get 20 errors on a file that should have zero, check your braces first.",
                        "<strong>printf(...)</strong>: A function call — you're instructing the CPU to execute the pre-compiled code of a function named <code>printf</code> (short for 'print formatted'), passing it the string <code>\"Hello, World!\\n\"</code> as its argument. The semicolon at the end is the statement terminator in C — every statement ends with one, just as every English sentence ends with a period. Forget a semicolon and the compiler reports an error on the <em>next</em> line (because it's waiting for the semicolon to decide where the current statement ends), which is genuinely confusing until you know why.",
                        "<strong>\\n</strong>: Inside a string, the backslash <code>\\</code> is an escape character — it signals 'the next character has a special meaning'. <code>\\n</code> is the newline escape sequence: it represents the newline character (the thing that happens when you press Enter). Without it, after printing 'Hello, World!' the cursor stays on the same line, and your terminal prompt will appear crammed right after your output on the same line. Always end printed lines with <code>\\n</code>.",
                        "<strong>return 0</strong>: Exits <code>main</code> and hands the integer 0 back to the operating system. By universal convention, 0 means 'the program finished successfully'. Any non-zero value signals an error. Shell scripts check this with <code>$?</code> in Bash. Build systems check it to decide whether to abort. CI/CD pipelines check it to mark a build as failed. Returning 0 is not just cleanup — it's communication with the ecosystem that ran your program."
                    ]
                },
                {
                    title: "Comments",
                    content: "Comments are text in your source code that the preprocessor strips out completely before the compiler ever sees it. They exist purely for human readers — to explain intent, document assumptions, leave notes about tricky logic, or temporarily disable code during debugging. Here's the thing about comments that beginners underestimate: the hardest thing about reading code six months later isn't the syntax — it's reconstructing <em>why</em> a decision was made. Good comments answer 'why', not 'what'. The code already says what it does. You need to explain why it does it that way.",
                    points: [
                        "<strong>Single-line comment</strong>: Start with <code>//</code>. Everything from those two slashes to the end of the line is ignored by the compiler. Use these for brief explanations on the same line as code, or for a quick note above a block. This is the comment style you'll use 90% of the time — quick, low-friction, targeted.",
                        "<strong>Multi-line comment</strong>: Start with <code>/*</code> and end with <code>*/</code>. Everything between them is ignored, spanning as many lines as needed. Useful for writing longer explanations, documenting function parameters and return values, or temporarily blocking out a large section of code while you test something else.",
                        "<strong>You cannot nest multi-line comments</strong>: Writing <code>/* outer /* inner */ still outer? */</code> doesn't work — the first <code>*/</code> closes the entire comment, leaving 'still outer? */' as live (and probably invalid) C code. This bites people trying to comment out a block that already contains a multi-line comment. The fix: use <code>//</code> to comment out each line instead, or use <code>#if 0 ... #endif</code> (covered in the Preprocessor lesson)."
                    ],
                    code: `#include <stdio.h>

int main() {
    // This is a single-line comment. The compiler skips this entire line.
    
    printf("Hello\\n"); // Comments can also go at the end of a line of code.
    
    /*
        This is a multi-line comment.
        It can span as many lines as you want.
        Useful for detailed explanations or temporarily
        disabling a block of code during debugging.
    */
    
    // printf("This line is commented out and won't run.");
    
    return 0;
}`,
                    output: "Hello",
                    tip: "A common debugging trick: instead of deleting code you're not sure about, comment it out with <code>//</code>. You can uncomment it just as easily if you need it back. This is faster and safer than deletion — especially before you have version control set up."
                },
                {
                    title: "The Compilation Process (Simplified)",
                    content: "There is a journey your code takes from the text you type to the program your CPU executes, and understanding that journey will save you enormous confusion when things go wrong. Here is the short version of a process that the Module Zero lesson covers in depth. The reason it matters here is practical: when you get an error, knowing which stage produced it tells you exactly what went wrong.",
                    points: [
                        "<strong>Source Code</strong>: You write <code>program.c</code> in a text editor. It is literally just a text file — no different from a .txt. The .c extension is a convention that tells the compiler what language to expect.",
                        "<strong>Preprocessor</strong>: Before compilation starts, the preprocessor handles all <code>#</code> directives. <code>#include &lt;stdio.h&gt;</code> is replaced by the literal contents of that file. <code>#define</code> substitutions are performed. By the time the preprocessor finishes, your file is much larger than what you wrote — often hundreds of times larger after all the standard library headers are included.",
                        "<strong>Compiler</strong>: The actual translator. It reads preprocessed C and converts it into machine code instructions for your CPU. This is where syntax errors are caught — misspelled keywords, missing semicolons, wrong types, calling functions that weren't declared. If the compiler is happy, it produces an object file: binary machine code with unresolved references.",
                        "<strong>Linker</strong>: Your code calls <code>printf</code>, but where's the actual implementation of <code>printf</code>? In a pre-compiled library. The linker's job is to stitch your object file together with those library files and produce one complete, self-contained executable that can be loaded and run.",
                        "<strong>Execution</strong>: You run the executable. The OS loads it into memory, locates <code>main</code>, and transfers control to it. Your code runs."
                    ],
                    tip: "Think of the compiler as an extremely precise translator who refuses to work if you make even a single grammatical mistake — no context, no inference, no charity. A human reader would understand 'I goed to the store' but the compiler throws your entire document back in your face over a missing semicolon on line 7. This is frustrating at first and invaluable later — it means if your program compiles cleanly, an entire class of mistakes has been ruled out before a single line ever runs."
                }
            ]
        },
        {
            id: "printf",
            title: "Printing to the Screen",
            explanation: "A program that only prints things it already knows at compile time is not much more useful than a text file. To be useful, programs need to compute things and display results — values that aren't known until the program actually runs. <code>printf</code> (print formatted) is the primary tool for this in C, and the 'formatted' part is the key. Unlike a simple print statement that just outputs a string, <code>printf</code> can compose complex output by embedding variable values directly into text, controlling how numbers are displayed, setting decimal precision, aligning columns, and switching between number bases. The format string mini-language you learn here is one of the most important things to internalize early, because you will use it constantly — and the exact same syntax appears in <code>fprintf</code> (writing to files), <code>sprintf</code> (writing to strings), <code>scanf</code> (reading input), and dozens of other standard library functions.",
            sections: [
                {
                    title: "Basic Printing",
                    content: "The simplest use of <code>printf</code> is passing a string literal — text in double quotes. The text is printed exactly as written, with one critical non-obvious behavior: <code>printf</code> does NOT add a newline automatically. If you call it twice without a <code>\\n</code>, the two outputs appear on the same line with no gap. This is intentional — it lets you build up a line of output across multiple calls — but it surprises almost every beginner the first time they see it.",
                    code: `#include <stdio.h>

int main() {
    // Each printf picks up where the last one left off
    printf("C is ");
    printf("powerful ");
    printf("and fast.\\n");  // Only this one adds a newline

    // With newlines, each message gets its own line
    printf("Line one.\\n");
    printf("Line two.\\n");
    return 0;
}`,
                    output: "C is powerful and fast.\nLine one.\nLine two."
                },
                {
                    title: "Escape Sequences",
                    content: "Some characters can't appear literally inside a string. You can't press Enter mid-string and have it produce a newline in output — pressing Enter would just move your cursor to the next line in the editor. You can't type a backslash and expect it to appear as-is, because the backslash is the escape character. Escape sequences solve these problems: the backslash <code>\\</code> acts as a signal that says 'the next character is special — treat this two-character combination as one special character'.",
                    points: [
                        "<code>\\n</code> — Newline: Moves the cursor to the start of the next line. You will type this thousands of times. Every line of output that should stand alone needs one at the end. Think of it as pressing Enter in the output.",
                        "<code>\\t</code> — Tab: Inserts a horizontal tab character. Invaluable for aligning text into columns without counting spaces by hand — the tab stop snaps output into alignment.",
                        "<code>\\\\</code> — Backslash: Since <code>\\</code> is the escape character, to print a literal backslash you must escape the escape itself. So <code>\\\\</code> in your string produces a single <code>\\</code> in output. Yes, this feels recursive. Welcome to C.",
                        "<code>\\\"</code> — Double Quote: Double quotes start and end a string. To print a quote character inside a string, you must escape it — otherwise the compiler thinks the string ends there. <code>\\\"Hello\\\"</code> prints as <code>\"Hello\"</code>."
                    ],
                    code: `#include <stdio.h>

int main() {
    printf("Column 1\\tColumn 2\\n");
    printf("He said, \\"Hello!\\"\\n");
    printf("Path: C:\\\\Programs\\\\n");
    return 0;
}`,
                    output: "Column 1    Column 2\nHe said, \"Hello!\"\nPath: C:\\Programs\\"
                },
                {
                    title: "Format Specifiers (Printing Variables)",
                    content: "This is where <code>printf</code> earns the 'Formatted' in its name. Format specifiers are placeholder codes embedded inside the format string — they tell <code>printf</code> 'there's a value coming that should be inserted here, and here's how to display it'. Every specifier starts with <code>%</code>. After the format string, you list the values to substitute, in order — the first specifier consumes the first value, the second specifier consumes the second, and so on. If the types don't match — say, you use <code>%d</code> (integer format) on a <code>float</code> — <code>printf</code> will read the raw bytes of your float and interpret them as an integer, producing bizarre-looking numbers. The compiler may warn you, but C won't stop you. Type discipline here is your responsibility.",
                    points: [
                        "<code>%d</code> or <code>%i</code> — Integer (whole numbers, positive or negative). This is the one you'll use most.",
                        "<code>%f</code> — Float or Double (decimal numbers). Prints 6 decimal places by default, which is usually too many.",
                        "<code>%c</code> — Character (a single character, like 'A' or '7').",
                        "<code>%s</code> — String (a sequence of characters, i.e., text).",
                        "<code>%x</code> or <code>%X</code> — Integer printed in hexadecimal (lowercase/uppercase). Useful for memory addresses and bit patterns.",
                        "<code>%%</code> — Prints a literal percent sign. Because <code>%</code> is special, you have to escape it too, just like the backslash."
                    ],
                    code: `#include <stdio.h>

int main() {
    int quantity = 5;
    float price = 19.99;
    int flags = 255; // 0xFF in hex
    
    printf("I want to buy %d items.\\n", quantity);
    printf("The price is $%.2f each.\\n", price);
    printf("Flags in hex: 0x%X\\n", flags); // 0xFF
    
    return 0;
}`,
                    output: "I want to buy 5 items.\nThe price is $19.99 each.\nFlags in hex: 0xFF",
                    tip: "The <code>%.2f</code> means 'print this float with exactly 2 decimal places'. If you use plain <code>%f</code>, you'll get something like <code>19.990000</code>, which is technically correct but looks awful. The format is <code>%[width].[precision]f</code> — you can control how many digits appear on each side of the decimal point."
                }
            ]
        },
        {
            id: "variables",
            title: "Variables and Data Types",
            explanation: "A variable is a named location in RAM where your program stores a value it needs to remember. That's it. The name is for you — the compiler translates it to a memory address that the CPU uses. Every variable you declare causes the compiler to reserve a specific number of bytes in memory (determined by the type) and associate your chosen name with that address. When you read or write the variable in your code, the compiler generates load and store instructions targeting that address. Here's the thing C makes explicit that other languages hide: when you declare <code>int age</code>, you are telling the compiler two specific things — 'reserve 4 bytes' and 'when I read or write those bytes, interpret them as a signed integer'. The same 4 bytes with a different type declaration could mean something completely different. Type declarations are not optional annotations — they determine exactly how the CPU treats those bytes.",
            sections: [
                {
                    title: "The 'Box' Analogy",
                    content: "The 'box' analogy is common but incomplete — a better mental model is a numbered slot in a long row of slots. RAM is exactly that: a long sequence of bytes, each at a unique numbered address. When you declare a variable, the compiler picks an unused address, reserves the right number of consecutive bytes for that type, and from that point forward treats your chosen name as an alias for that address. A key consequence: a variable is not just a value, it's a location. You can take the address of a variable, pass that address to a function, and have the function modify the original. This is how pointers work — and it flows directly from this model. Every variable has a lifecycle with three distinct phases:",
                    points: [
                        "<strong>Declaration</strong>: <code>int age;</code> — tells the compiler 'reserve 4 bytes and call that location <code>age</code>'. At this moment, those 4 bytes contain whatever bit pattern was left there by whoever previously used that memory — garbage. In C, reading an uninitialized variable is undefined behavior: the standard gives the compiler permission to produce any result, including returning garbage, returning zero, crashing, or — most dangerously — doing something that appears to work correctly most of the time and fails only in production.",
                        "<strong>Initialization</strong>: <code>age = 25;</code> — writes a specific value into those reserved bytes. Only after initialization is the variable safe to read. The assignment stores the two's complement binary representation of 25 into those 4 bytes.",
                        "<strong>Declaration + Initialization in one step</strong>: <code>int age = 25;</code> — this is the preferred form and what you should write almost always. Declaring a variable and not immediately initializing it is inviting bugs. Every uninitialized variable is a landmine waiting for the conditions that trigger the undefined behavior.",
                        "There is also a technical distinction between a <em>declaration</em> (announcing that something exists) and a <em>definition</em> (actually creating it with storage). For local variables these are always the same thing. The distinction becomes important in multi-file programs — a topic covered in the Intermediate module."
                    ]
                },
                {
                    title: "Primary Data Types",
                    content: "C's built-in types represent the categories of data the CPU can natively process in hardware. Each type specifies two things: how many bytes to reserve, and how to interpret those bytes. This distinction is crucial — the same 4 bytes in memory could mean a 32-bit signed integer (possibly negative), an unsigned 32-bit integer (only positive), or a 32-bit IEEE 754 float. The type declaration is the only thing that determines which interpretation applies. Here are the primary types you will use constantly:",
                    code: `#include <stdio.h>

int main() {
    // int: whole numbers, positive or negative
    // Typically 4 bytes; range roughly -2.1 billion to +2.1 billion
    int age = 25;
    int temperature_c = -15;    // negative values work fine

    // float: decimal numbers, ~6-7 significant digits of precision
    float price = 19.99f;       // note the 'f' suffix — without it, it's a double
    
    // double: decimal numbers, ~15-16 significant digits
    // Default for decimal literals; prefer double over float in most code
    double pi = 3.14159265358979;
    
    // char: a single character, stored as its ASCII code (1 byte)
    // 'A' is stored as the integer 65 — they are literally the same thing
    char grade = 'A';
    char newline_char = '\\n';   // escape sequences work in char literals too

    printf("Age: %d, Temperature: %d\\n", age, temperature_c);
    printf("Price: %.2f\\n", price);
    printf("Pi to 14 places: %.14f\\n", pi);
    printf("Grade: %c (ASCII %d)\\n", grade, grade); // same value, two formats
    
    return 0;
}`,
                    output: "Age: 25, Temperature: -15\nPrice: 19.99\nPi to 14 places: 3.14159265358979\nGrade: A (ASCII 65)"
                },
                {
                    title: "Type Sizes and Why They Matter",
                    content: "Every type has a fixed size, and that size determines the range of values it can hold. This is not just trivia — exceeding a type's maximum value in C does not produce an error or exception. For unsigned types, the value silently wraps around to zero, like an odometer rolling over. For signed types, it invokes undefined behavior (and in practice, usually wraps to a large negative number). Real, expensive bugs in real software have been caused by this: a counter that worked perfectly for months until one day the value exceeded the type's maximum and wrapped to zero, corrupting data structures. Know your limits — literally.",
                    points: [
                        "<code>char</code>: 1 byte, guaranteed by the C standard (the only guarantee). Stores a small integer (-128 to 127 for signed, 0 to 255 for unsigned) or an ASCII character code. The character 'A' and the integer 65 are literally identical in memory — <code>char</code> is just an integer with character-printing convention layered on top.",
                        "<code>short</code>: Typically 2 bytes. Range -32,768 to 32,767. Rarely used for general computation — mostly appears in data structures where memory is genuinely tight (embedded systems, packed binary formats).",
                        "<code>int</code>: Typically 4 bytes on modern systems. Range approximately -2.1 billion to +2.1 billion. The default integer type for general computation — what you reach for unless you have a specific reason to do otherwise.",
                        "<code>long</code>: At least 4 bytes, often 8 bytes on 64-bit Linux/macOS, but only 4 on Windows 64-bit. If you need a guaranteed 8 bytes, use <code>long long</code> or the <code>stdint.h</code> types covered later.",
                        "<code>float</code>: 4 bytes, IEEE 754 single precision. Approximately 6–7 significant decimal digits. The precision limitation is real and bites people: <code>0.1f + 0.2f</code> does not equal <code>0.3f</code> exactly. Never use float for money or accumulated calculations.",
                        "<code>double</code>: 8 bytes, IEEE 754 double precision. Approximately 15–16 significant decimal digits. The default floating-point type — use this unless you have a specific memory constraint. Still imprecise, just much less so.",
                        "<strong>The overflow trap</strong>: An <code>int</code> holding 2,147,483,647 (its maximum) that you add 1 to does not become 2,147,483,648 — it invokes undefined behavior and typically wraps to -2,147,483,648. This has caused real security vulnerabilities in widely-deployed software."
                    ],
                    warning: "Using the wrong format specifier (e.g., <code>%d</code> for a float) produces garbage output and is technically undefined behavior. The computer reads the raw bytes of your float and interprets them as an integer — the result is some random-looking number. Always match your format specifiers to your variable types."
                },
                {
                    title: "Numeric Literals: Decimal, Hex, Octal, and Binary",
                    content: "When you write a number directly in your code, it's called a numeric literal. By default C interprets it as decimal (base 10), which is what you'd expect. But C also supports other number bases using special prefixes — and one of them has a trap you absolutely need to know about.",
                    points: [
                        "<strong>Decimal (base 10)</strong>: Normal numbers. <code>int x = 42;</code>. No prefix. This is the default.",
                        "<strong>Hexadecimal (base 16)</strong>: Prefix <code>0x</code> or <code>0X</code>. Digits are 0–9 and A–F. <code>int x = 0xFF;</code> is 255 in decimal. Used constantly for bit masks, memory addresses, and color values. Print with <code>%x</code> or <code>%X</code>.",
                        "<strong>Octal (base 8)</strong>: Prefix <code>0</code> (just a leading zero). <code>int x = 017;</code> is 15 in decimal. This is the trap. If you try to pad a decimal number with leading zeros to make it line up visually — like <code>int x = 0099;</code> — you'll get a compiler error because 9 isn't a valid octal digit. And <code>int x = 0077;</code> compiles fine but gives you 63, not 77.",
                        "<strong>Binary (base 2)</strong>: Prefix <code>0b</code> or <code>0B</code>. <code>int x = 0b1010;</code> is 10 in decimal. This was added in C23 and is supported as an extension by GCC and Clang even for older standards."
                    ],
                    code: `#include <stdio.h>

int main() {
    int dec = 255;    // Decimal
    int hex = 0xFF;   // Hexadecimal: same value
    int oct = 0377;   // Octal: same value
    int bin = 0b11111111; // Binary: same value (C23/GCC extension)
    
    printf("Decimal:     %d\\n", dec); // 255
    printf("Hex:         %d\\n", hex); // 255
    printf("Octal:       %d\\n", oct); // 255
    printf("Binary:      %d\\n", bin); // 255
    
    // Print in different bases
    printf("\\n255 in hex:  0x%X\\n", 255); // 0xFF
    printf("255 in octal: 0%o\\n",  255); // 0377
    
    // THE OCTAL TRAP
    int year  = 2024;  // Fine: decimal 2024
    int wrong = 0144;  // Looks like 144 but it's OCTAL: = 100 decimal!
    printf("\\nOctal trap: 0144 = %d in decimal\\n", wrong); // 100
    
    return 0;
}`,
                    output: "Decimal:     255\nHex:         255\nOctal:       255\nBinary:      255\n\n255 in hex:  0xFF\n255 in octal: 0377\n\nOctal trap: 0144 = 100 in decimal",
                    warning: "The octal trap is real and subtle. Any integer literal with a leading zero is octal, not decimal. <code>int pin = 0123;</code> looks like the number 123 but is actually 83. This has caused bugs in real software — particularly in Unix file permission masks like <code>chmod(path, 0755)</code>, where the leading zero is intentional. Never pad decimal numbers with leading zeros."
                },
                {
                    title: "Naming Rules",
                    content: "Variable names in C follow strict rules. Break them and the compiler won't budge. Follow them but name things poorly and future-you will be confused in two weeks.",
                    points: [
                        "Must start with a letter (A–Z, a–z) or an underscore. Numbers cannot be first.",
                        "After the first character, letters, digits (0–9), and underscores are all fair game.",
                        "Case-sensitive: <code>Score</code>, <code>score</code>, and <code>SCORE</code> are three completely separate variables. This has caused real production bugs.",
                        "Cannot use C's reserved keywords as names. You can't name a variable <code>int</code>, <code>return</code>, <code>if</code>, etc. The compiler will be very upset.",
                        "Best Practice: Use descriptive names. <code>user_age</code> is infinitely better than <code>x</code>. You may think you'll remember what <code>x</code> means tomorrow. You won't."
                    ]
                }
            ]
        },
        {
            id: "booleans",
            title: "Boolean Types",
            explanation: "A boolean is a value that is either true or false. In C's earliest days there was no dedicated boolean type — programmers used plain integers, where 0 meant false and any non-zero value meant true. C99 fixed this by adding <code>_Bool</code> as a built-in type and the <code>&lt;stdbool.h&gt;</code> header which gives you the much more readable names <code>bool</code>, <code>true</code>, and <code>false</code>. Every modern C program should use these.",
            sections: [
                {
                    title: "The Old Way vs The Right Way",
                    content: "Before C99, C programmers wrote boolean logic using plain integers. This works because C's <code>if</code>, <code>while</code>, and other control flow constructs test for zero vs non-zero — they never required a dedicated boolean type. But it means your code is littered with <code>int</code> variables named things like <code>found</code> or <code>done</code>, with no way for the compiler to enforce that you only store 0 or 1 in them.",
                    code: `#include <stdio.h>
#include <stdbool.h>  // Gives us: bool, true, false

int main() {
    // OLD WAY: int used as a boolean
    int is_raining_old = 1;  // 1 for true
    int has_umbrella_old = 0; // 0 for false
    
    // MODERN WAY: actual bool type
    bool is_raining = true;
    bool has_umbrella = false;
    
    if (is_raining && !has_umbrella) {
        printf("You're going to get wet.\\n");
    }
    
    // bool stores 1 for true, 0 for false
    printf("is_raining = %d\\n", is_raining);   // 1
    printf("has_umbrella = %d\\n", has_umbrella); // 0
    
    // Comparison operators return bool values (1 or 0)
    bool is_adult = (18 >= 18);
    printf("is_adult = %d\\n", is_adult); // 1
    
    return 0;
}`,
                    output: "You're going to get wet.\nis_raining = 1\nhas_umbrella = 0\nis_adult = 1"
                },
                {
                    title: "_Bool Without the Header",
                    content: "The actual built-in type is <code>_Bool</code>, which is available without any header. <code>bool</code>, <code>true</code>, and <code>false</code> are macros defined in <code>&lt;stdbool.h&gt;</code> that expand to <code>_Bool</code>, <code>1</code>, and <code>0</code> respectively. In C23, <code>bool</code>, <code>true</code>, and <code>false</code> became actual keywords so you no longer need the header — but for compatibility with older standards, always include it.",
                    points: [
                        "<strong><code>_Bool</code></strong>: The raw C99 boolean type. Can only hold 0 or 1. If you assign any non-zero value to it, it automatically stores 1.",
                        "<strong><code>bool</code></strong>: A macro for <code>_Bool</code> provided by <code>&lt;stdbool.h&gt;</code>. Use this name in your code — it's cleaner and universally understood.",
                        "<strong><code>true</code></strong>: A macro for <code>1</code>.",
                        "<strong><code>false</code></strong>: A macro for <code>0</code>.",
                        "<strong>Printing booleans</strong>: Use <code>%d</code> — there's no <code>%b</code> format specifier for booleans. It prints 1 or 0."
                    ],
                    code: `#include <stdio.h>
#include <stdbool.h>

// Functions can return bool
bool isEven(int n) {
    return n % 2 == 0;
}

bool isPassing(int score) {
    return score >= 60;
}

int main() {
    printf("isEven(4):       %d\\n", isEven(4));       // 1
    printf("isEven(7):       %d\\n", isEven(7));       // 0
    printf("isPassing(75):   %d\\n", isPassing(75));   // 1
    printf("isPassing(55):   %d\\n", isPassing(55));   // 0
    
    // _Bool truncates any non-zero to 1
    _Bool x = 42;   // Stored as 1, not 42
    _Bool y = -99;  // Stored as 1
    _Bool z = 0;    // Stored as 0
    printf("_Bool of 42:  %d\\n", x); // 1
    printf("_Bool of -99: %d\\n", y); // 1
    printf("_Bool of 0:   %d\\n", z); // 0
    
    return 0;
}`,
                    output: "isEven(4):       1\nisEven(7):       0\nisPassing(75):   1\nisPassing(55):   0\n_Bool of 42:  1\n_Bool of -99: 1\n_Bool of 0:   0",
                    tip: "Use <code>bool</code> for any variable that represents a yes/no, on/off, true/false state. It makes your intent immediately obvious and costs nothing — <code>bool</code> is typically 1 byte, same as <code>char</code>. Return <code>bool</code> from functions that answer yes/no questions: <code>bool isValid(...)</code>, <code>bool contains(...)</code>, <code>bool isEmpty(...)</code>."
                }
            ]
        },
        {
            id: "scanf",
            title: "Getting User Input",
            explanation: "A program that only ever prints things it already knew at the time you compiled it is a script, not a program. Real programs change their behavior based on input — from the user, from files, from the network. <code>scanf</code> (Scan Formatted) is C's standard way of reading formatted input from the keyboard. It's powerful and its format string works symmetrically with <code>printf</code> — but it has a deeply confusing requirement (<code>&</code> before every variable) and notorious pitfalls that have tripped up beginners for fifty years. Master it here and those pitfalls will never surprise you again.",
            sections: [
                {
                    title: "Basic Usage",
                    content: "The syntax mirrors <code>printf</code>: you provide a format string with type specifiers, followed by the variables to store the read values into. The confusing difference — the one that has caused infinite beginner confusion — is that you need the <code>&</code> (address-of) operator in front of each variable name. We'll explain why immediately after.",
                    code: `#include <stdio.h>

int main() {
    int number;
    
    printf("Enter a number: ");
    // &number means "the memory address of the variable 'number'"
    scanf("%d", &number);
    
    printf("You entered: %d\\n", number);
    return 0;
}`,
                    output: "Enter a number: [user types 42]\nYou entered: 42"
                },
                {
                    title: "Why the & ?",
                    tip: "Here is the explanation that makes it click: In C, when you call a function and pass a variable like <code>scanf(\"%d\", number)</code>, the function receives a <em>copy</em> of the value in <code>number</code>. If <code>scanf</code> only had a copy, it could write the user's input into the copy all it wants — your actual variable would remain unchanged. By passing <code>&number</code> — the memory address of <code>number</code> — you're handing <code>scanf</code> a GPS coordinate: 'the variable lives at address 0x7ffd1234 — go write directly into that location'. <code>scanf</code> then uses that address to bypass the copy and modify the original. This is the core pattern behind pass-by-pointer in C, and you'll encounter it constantly."
                },
                {
                    title: "Reading Different Types",
                    content: "You can read multiple values in a single <code>scanf</code> call by chaining specifiers. The user can separate values with spaces, tabs, or newlines — <code>scanf</code> treats all whitespace identically as separators. There is one notorious trap when reading characters after a previous <code>scanf</code>: when the user presses Enter, a <code>\\n</code> newline character gets left in the input buffer. The next <code>scanf(\"%c\", ...)</code> immediately reads that leftover newline instead of waiting for the user to type something. The fix is simple: put a space before <code>%c</code> in the format string — a space in a <code>scanf</code> format string means 'skip any whitespace, including newlines'.",
                    code: `#include <stdio.h>

int main() {
    char initial;
    int age;
    
    printf("Enter your initial and age (e.g. J 25): ");
    // Note the space before %c to skip any leftover newlines
    scanf(" %c %d", &initial, &age);
    
    printf("Initial: %c, Age: %d\\n", initial, age);
    return 0;
}`,
                    output: "Enter your initial and age (e.g. J 25): [user types J 25]\nInitial: J, Age: 25"
                },
                {
                    title: "Common Pitfall: Strings",
                    content: "Reading strings with <code>scanf</code> and <code>%s</code> has a critical limitation: it stops reading at the first whitespace character. So if the user types 'Mahmud Hasan', you only receive 'Mahmud'. To read a whole line including spaces, use <code>fgets(buffer, size, stdin)</code> instead — it reads up to <code>size-1</code> characters or until a newline, whichever comes first. Also note: for character arrays (strings), you do NOT use <code>&</code> — the array name already decays to a pointer to its first element, which is exactly what <code>scanf</code> needs.",
                    warning: "Never use <code>scanf(\"%s\", buffer)</code> without a width limit. If the user types more characters than your array can hold, <code>scanf</code> will write past the end of it into whatever memory comes next — overwriting other variables, return addresses, anything. This is a buffer overflow. It is one of the most historically exploited security vulnerabilities in software, and C gives you zero protection against it by default. Always specify a width: <code>scanf(\"%49s\", buffer)</code> if your array is 50 bytes (one byte reserved for the null terminator). This one habit has prevented countless security disasters."
                }
            ]
        },
        {
            id: "operators",
            title: "Operators",
            explanation: "Operators are the action verbs of C — they instruct the CPU to perform computations on values. You already know the arithmetic ones from mathematics, but C's operator set goes well beyond math. Some familiar-looking operators behave in ways that will surprise you (integer division quietly discards the decimal). Some operators are genuinely new (modulus, bitwise operators). One operator that looks like it does one thing actually does something completely different (<code>=</code> vs <code>==</code> is responsible for more bugs than almost anything else in C). Understanding each one precisely — not approximately — is the foundation of writing expressions that behave the way you intend.",
            sections: [
                {
                    title: "Arithmetic Operators",
                    content: "Addition, subtraction, multiplication — these work exactly as you expect. Division and modulus, however, have behaviors that catch almost every beginner off guard the first time they encounter them in a real program.",
                    code: `#include <stdio.h>

int main() {
    int a = 10, b = 3;
    
    printf("Addition: %d\\n", a + b);       // 13
    printf("Subtraction: %d\\n", a - b);    // 7
    printf("Multiplication: %d\\n", a * b); // 30
    printf("Division: %d\\n", a / b);       // 3 (Integer division truncates decimal)
    printf("Modulus: %d\\n", a % b);        // 1 (Remainder of 10 / 3)
    
    return 0;
}`,
                    output: "Addition: 13\nSubtraction: 7\nMultiplication: 30\nDivision: 3\nModulus: 1",
                    tip: "Integer division truncates — it does not round, it does not approximate, it just drops the decimal part entirely. <code>10 / 3</code> is <code>3</code>, not <code>3.33</code>, not <code>4</code>. Just <code>3</code>. The decimal vanishes. To get real division, at least one operand must be a floating-point number: <code>10.0 / 3</code> gives <code>3.333...</code>. The modulus operator <code>%</code> gives the remainder after integer division: <code>10 % 3</code> is <code>1</code> because 10 = (3 × 3) + 1. It is enormously useful in practice: checking if a number is even (<code>n % 2 == 0</code>), wrapping a counter back to zero (<code>counter % limit</code>), extracting digits from a number, cycling through colors in a pattern — once you internalize modulus, you'll find yourself reaching for it constantly."
                },
                {
                    title: "Assignment Operators",
                    content: "The shorthand assignment operators let you modify a variable without writing its name twice. They're common in real code and worth knowing by reflex.",
                    points: [
                        "<code>x += 5</code> means <code>x = x + 5</code>. Read it as 'add 5 to x'. This is extremely common in loops.",
                        "<code>x -= 5</code> means <code>x = x - 5</code>. 'Subtract 5 from x'.",
                        "<code>x *= 5</code> means <code>x = x * 5</code>. 'Multiply x by 5'.",
                        "<code>x /= 5</code> means <code>x = x / 5</code>. Same integer-division rules apply here — if x is an int, you still lose the decimal.",
                        "<code>x %= 5</code> means <code>x = x % 5</code>. 'Replace x with the remainder of x divided by 5'."
                    ]
                },
                {
                    title: "Integer Literal Suffixes",
                    content: "When you write a number like <code>42</code> or <code>1000000</code> in your code, the compiler gives it a type automatically — usually <code>int</code>. But sometimes you need the literal to be a specific type: an <code>unsigned int</code>, a <code>long</code>, or a <code>long long</code>. Suffixes let you specify this. They appear at the end of the number and tell the compiler exactly which type to use.",
                    points: [
                        "<code>U</code> or <code>u</code> — Unsigned: <code>42U</code> is an <code>unsigned int</code>. Use this when mixing with unsigned variables to prevent signed/unsigned comparison warnings.",
                        "<code>L</code> or <code>l</code> — Long: <code>42L</code> is a <code>long</code>. Always use uppercase <code>L</code> — lowercase <code>l</code> looks too much like the digit <code>1</code>.",
                        "<code>LL</code> or <code>ll</code> — Long Long: <code>42LL</code> is a <code>long long</code>. Needed when you want a constant that doesn't fit in a regular <code>int</code>.",
                        "<code>UL</code> — Unsigned Long: Combinations work. <code>42UL</code>, <code>42ULL</code>, etc.",
                        "<code>f</code> or <code>F</code> — Float: <code>3.14f</code> is a <code>float</code>. Without the <code>f</code>, <code>3.14</code> is a <code>double</code>. This matters for performance on embedded systems and when calling float-specific math functions."
                    ],
                    code: `#include <stdio.h>

int main() {
    // Without suffix: int (can overflow for large values!)
    // 2147483648 is INT_MAX + 1 -- overflow on 32-bit int
    // long int x = 2147483648;  // WARNING: integer overflow
    
    // With suffix: long long (guaranteed to hold large values)
    long long big = 2147483648LL;
    printf("big = %lld\\n", big); // 2147483648
    
    // Float vs double literal
    float  f1 = 3.14f;  // float literal
    double d1 = 3.14;   // double literal (default)
    printf("float:  %.10f\\n", f1); // ~3.1400001049 (float precision)
    printf("double: %.10f\\n", d1); // 3.1400000000
    
    // Left shift with suffix to avoid overflow
    // 1 << 31 is UB if 1 is int (32-bit) -- bit shifts past the sign bit
    unsigned int mask = 1U << 31; // OK: 1U is unsigned
    printf("mask = 0x%X\\n", mask); // 0x80000000
    
    return 0;
}`,
                    output: "big = 2147483648\nfloat:  3.1400001049\ndouble: 3.1400000000\nmask = 0x80000000",
                    tip: "The most practically important suffix is <code>LL</code> for large integer constants and <code>f</code> for float literals. You'll run into the <code>1U << 31</code> pattern constantly in bitwise code — always use <code>U</code> when shifting into or past the sign bit to avoid undefined behavior."
                },
                {
                    title: "Increment and Decrement",
                    content: "Adding or subtracting 1 from a counter is so common in loops that C has dedicated operators for it. The prefix and postfix forms both change the variable by 1 — the difference is only visible when you use the expression's result value inside a larger expression. On a standalone line like <code>i++;</code> or <code>++i;</code>, there is zero difference. The distinction only matters when you write something like <code>arr[i++]</code>.",
                    code: `#include <stdio.h>

int main() {
    int counter = 0;
    
    counter++; // Adds 1. Counter is now 1.
    ++counter; // Adds 1. Counter is now 2.
    
    printf("Counter: %d\\n", counter);
    
    // Difference comes when used in expressions
    int a = 5;
    int b;
    
    b = a++; // Post-increment: b gets a (5), THEN a increases to 6.
    printf("a: %d, b: %d\\n", a, b);
    
    a = 5; // Reset
    b = ++a; // Pre-increment: a increases to 6, THEN b gets a (6).
    printf("a: %d, b: %d\\n", a, b);
    
    return 0;
}`,
                    output: "Counter: 2\na: 6, b: 5\na: 6, b: 6"
                },
                {
                    title: "Operator Precedence",
                    content: "When multiple operators appear in one expression, C evaluates them in a specific order determined by their precedence (which operators bind tighter) and associativity (which direction ties are broken). This is exactly like the order of operations in math: multiplication before addition, parentheses override everything. C has far more operators than math, so the hierarchy is longer — but the same principle applies. The single most important rule: when in doubt, use parentheses. They cost nothing in performance, make your intent unambiguous, and eliminate an entire class of subtle bugs.",
                    points: [
                        "<strong>Highest: <code>++</code> <code>--</code> (postfix), <code>()</code>, <code>[]</code></strong> — Function calls, array access, and postfix increment/decrement bind first.",
                        "<strong>High: <code>++</code> <code>--</code> (prefix), <code>!</code>, unary <code>-</code>, <code>*</code> (dereference), <code>&</code>, <code>sizeof</code></strong> — Unary operators applied to a single operand.",
                        "<strong>Medium-high: <code>*</code> <code>/</code> <code>%</code></strong> — Multiplication, division, modulus.",
                        "<strong>Medium: <code>+</code> <code>-</code></strong> — Addition and subtraction.",
                        "<strong>Medium-low: <code>&lt;</code> <code>&lt;=</code> <code>&gt;</code> <code>&gt;=</code></strong> — Comparison operators.",
                        "<strong>Lower: <code>==</code> <code>!=</code></strong> — Equality checks (lower than comparisons — this surprises people).",
                        "<strong>Low: <code>&&</code></strong> — Logical AND.",
                        "<strong>Lower: <code>||</code></strong> — Logical OR.",
                        "<strong>Lowest: <code>=</code> <code>+=</code> <code>-=</code> etc.</strong> — Assignment operators evaluate last, after everything on the right is resolved."
                    ],
                    code: `#include <stdio.h>

int main() {
    // Precedence example 1: * before +
    int a = 2 + 3 * 4;   // Evaluates as 2 + (3 * 4) = 14
    
    // Precedence example 2: comparison before equality
    int b = 5 > 3 == 1;  // Evaluates as (5 > 3) == 1 -> 1 == 1 -> 1 (true)
    
    // Precedence example 3: use parentheses to override
    int c = (2 + 3) * 4; // Parentheses force addition first -> 20
    
    printf("a = %d\\n", a); // 14
    printf("b = %d\\n", b); // 1
    printf("c = %d\\n", c); // 20
    
    return 0;
}`,
                    output: "a = 14\nb = 1\nc = 20",
                    tip: "You do not need to memorize the full C precedence table — even experienced C programmers look it up occasionally. What you need to know by reflex: multiplication/division before addition/subtraction, comparisons before equality checks (<code>&lt;</code> before <code>==</code>), <code>&&</code> before <code>||</code>. For everything else — parentheses. A stray <code>()</code> costs you nothing and could save you an hour of debugging a precedence bug that produces plausible-looking wrong output."
                }
            ]
        },
        {
            id: "conditionals",
            title: "Conditional Statements",
            explanation: "A program that always executes the same instructions regardless of its inputs is barely more useful than a fixed calculation. The power of a computer comes from its ability to make decisions at runtime — to take different paths through code based on conditions that are only known when the program is actually running. Conditional statements are that decision mechanism. In C, there is no separate 'boolean' type at the hardware level — every condition evaluates to an integer: zero means false, and any non-zero value means true. This isn't a quirk or a shortcut; it's a direct reflection of how CPUs work. Comparison instructions set bits in a status register, and branch instructions read those bits. Understanding that booleans are integers in C explains a lot of things that otherwise look like bizarre language decisions.",
            sections: [
                {
                    title: "The 'if' Statement",
                    content: "The <code>if</code> statement evaluates an expression and runs the body block only if the result is non-zero. This is literally how it works: the condition expression is evaluated, producing an integer, and if that integer is not zero, execution enters the block. This means <code>if (count)</code> is valid and means 'if count is not zero'. You'll see this idiom constantly in real C code — checking if a pointer is non-NULL, if a return value signals success, if a counter is still running.",
                    code: `#include <stdio.h>

int main() {
    int temperature = 38;

    // Basic if: runs the block only when condition is true
    if (temperature > 37) {
        printf("Fever detected: %.0d degrees.\\n", temperature);
    }

    // The condition is just an integer expression — zero = false, non-zero = true
    int x = 5;
    if (x)          printf("x is non-zero (true)\\n");   // 5 is non-zero
    if (!x)         printf("x is zero (false)\\n");       // !5 = 0, skipped
    if (x - 5)      printf("x minus 5 is non-zero\\n");  // 0, skipped
    if (!(x - 5))   printf("x is exactly 5\\n");          // !0 = 1, runs

    return 0;
}`,
                    output: "Fever detected: 38 degrees.\nx is non-zero (true)\nx is exactly 5"
                },
                {
                    title: "Comparison Operators",
                    content: "Comparison operators evaluate two values and produce either 1 (true) or 0 (false) as a plain integer. That integer result is what <code>if</code>, <code>while</code>, and the ternary operator all work with. You can even store comparison results in a variable — <code>int is_valid = (score >= 0 && score <= 100);</code> is perfectly legal C. The single most important fact to commit to memory: <code>=</code> and <code>==</code> are completely different operators. One assigns, one compares. Confusing them is one of the most common bugs in C, and the compiler may only warn about it rather than refusing to compile.",
                    points: [
                        "<code>==</code> Equal to. Checks if two values are identical. <strong>Double equals</strong> — it is a question.",
                        "<code>!=</code> Not equal to. True when the values differ.",
                        "<code>&gt;</code> Greater than. <code>a &gt; b</code> is true only if a is strictly larger than b.",
                        "<code>&lt;</code> Less than. <code>a &lt; b</code> is true only if a is strictly smaller than b.",
                        "<code>&gt;=</code> Greater than or equal to. True if a is larger or the same.",
                        "<code>&lt;=</code> Less than or equal to. True if a is smaller or the same."
                    ],
                    code: `#include <stdio.h>

int main() {
    int a = 10, b = 20;

    printf("a == b : %d\\n", a == b);  // 0 (false)
    printf("a != b : %d\\n", a != b);  // 1 (true)
    printf("a <  b : %d\\n", a <  b);  // 1 (true)
    printf("a >  b : %d\\n", a >  b);  // 0 (false)
    printf("a <= 10: %d\\n", a <= 10); // 1 (true — equal counts)
    printf("a >= 10: %d\\n", a >= 10); // 1 (true — equal counts)

    // Comparison results are just integers — you can store them
    int is_adult = (a >= 18);
    printf("is_adult: %d\\n", is_adult); // 0 (a=10, not adult)

    return 0;
}`,
                    output: "a == b : 0\na != b : 1\na <  b : 1\na >  b : 0\na <= 10: 1\na >= 10: 1\nis_adult: 0",
                    warning: "<code>=</code> is assignment — it changes a variable. <code>==</code> is comparison — it asks a question. Writing <code>if (x = 5)</code> does not compare x to 5 — it assigns 5 to x, then tests whether 5 is non-zero (always true). Your if-block runs unconditionally and x has been silently changed. The compiler may warn about this with <code>-Wall</code>, but it will compile. Always enable compiler warnings when developing."
                },
                {
                    title: "if-else and else-if chains",
                    content: "The <code>else</code> clause handles the case where the condition is false — only one branch ever runs. Chaining <code>else if</code> lets you test multiple conditions in sequence, stopping at the first one that matches. This is how you express multi-way decisions. The order matters: the conditions are tested top to bottom and only the first matching branch runs — the rest are skipped entirely.",
                    code: `#include <stdio.h>

int main() {
    int score = 74;

    // else-if chain: exactly ONE branch runs
    if (score >= 90) {
        printf("Grade: A\\n");
    } else if (score >= 80) {
        printf("Grade: B\\n");
    } else if (score >= 70) {
        printf("Grade: C\\n");  // This runs — 74 >= 70 is true
    } else if (score >= 60) {
        printf("Grade: D\\n");  // Skipped — already matched above
    } else {
        printf("Grade: F\\n");  // Skipped
    }

    // if-else for binary decisions
    int balance = -50;
    if (balance >= 0) {
        printf("Account is in credit: $%d\\n", balance);
    } else {
        printf("Account is overdrawn by $%d\\n", -balance);
    }

    return 0;
}`,
                    output: "Grade: C\nAccount is overdrawn by $50",
                    tip: "A classic mistake: writing multiple separate <code>if</code> statements when you mean <code>else if</code>. Separate <code>if</code>s each get tested independently — all of them. An <code>else if</code> chain stops at the first match. For grade classification with separate <code>if</code>s, a score of 74 would match <code>score >= 70</code>, then also continue and check <code>score >= 60</code>, printing both 'Grade: C' and 'Grade: D'. With an <code>else if</code> chain it correctly stops at 'Grade: C'. The rule: if your conditions are mutually exclusive and you only want one path to execute, use <code>else if</code>."
                },
                {
                    title: "Logical Operators",
                    content: "Real conditions are combinations of multiple tests. 'The user can drive if they are at least 18 AND have a valid license AND are not impaired' — three conditions, all of which must be true simultaneously. Logical operators let you compose conditions. C's logical operators also implement a performance optimization called short-circuit evaluation: the CPU stops evaluating as soon as the final result is determined, which is not just an optimization — it's a correctness mechanism that lets you safely write idioms like checking a pointer for NULL before dereferencing it.",
                    points: [
                        "<code>&&</code> (AND): The entire expression is true only if BOTH sides are true. Crucially, if the left side is false, the right side is <strong>never evaluated</strong> — the result is already known to be false. This is the idiom that makes <code>if (ptr != NULL && ptr->value > 0)</code> safe: if <code>ptr</code> is NULL, the <code>ptr->value</code> dereference on the right side is skipped entirely, preventing a crash.",
                        "<code>||</code> (OR): The expression is true if EITHER side is true. If the left side is true, the right side is <strong>never evaluated</strong>. This lets you write fallback logic: 'use the cached value OR compute the expensive thing if there's no cache'.",
                        "<code>!</code> (NOT): Flips the truth value. <code>!0</code> is 1. <code>!1</code> is 0. <code>!42</code> is also 0 (any non-zero flips to 0). Use it for readable negative conditions: <code>if (!isConnected())</code> reads like English and is clearer than <code>if (isConnected() == 0)</code>."
                    ],
                    code: `#include <stdio.h>

int main() {
    int age = 25;
    int has_license = 1;   // 1 = true
    int is_drunk = 0;      // 0 = false

    // AND: all conditions must hold
    if (age >= 18 && has_license && !is_drunk) {
        printf("You may drive.\\n");
    }

    // Short-circuit: the second condition is ONLY evaluated if first is true
    int x = 0;
    // If x were NULL (pointer context), the second part would be skipped safely
    if (x != 0 && (100 / x) > 2) {
        printf("This is safe because short-circuit prevents division by zero.\\n");
    } else {
        printf("x is zero — short-circuit skipped the division.\\n");
    }

    // OR: any condition being true is enough
    int is_weekend = 0;
    int is_holiday = 1;
    if (is_weekend || is_holiday) {
        printf("Day off!\\n");
    }

    return 0;
}`,
                    output: "You may drive.\nx is zero — short-circuit skipped the division.\nDay off!"
                },
                {
                    title: "The switch Statement",
                    content: "When you need to dispatch to one of many branches based on the exact integer value of a single expression, <code>switch</code> is often cleaner than a long chain of <code>else if</code>. Conceptually, the compiler can implement a <code>switch</code> as a jump table — an array of code addresses indexed directly by the switch value — making it O(1) regardless of how many cases there are. A long <code>else if</code> chain tests conditions sequentially, which is O(n). For tight loops with many branches, this difference can be measurable. The critical thing to understand about <code>switch</code> is its fall-through behavior — it is the source of both intentional tricks and catastrophic bugs.",
                    code: `#include <stdio.h>

int main() {
    int day = 3;

    switch (day) {
        case 1: printf("Monday\\n");    break;
        case 2: printf("Tuesday\\n");   break;
        case 3: printf("Wednesday\\n"); break;  // This runs
        case 4: printf("Thursday\\n");  break;
        case 5: printf("Friday\\n");    break;
        case 6:
        case 7: printf("Weekend!\\n");  break;  // Cases 6 and 7 share a body
        default: printf("Invalid day\\n");      // No break needed on default
    }

    // Demonstrating intentional fall-through (rare but legitimate)
    int http_status = 404;
    printf("HTTP %d: ", http_status);
    switch (http_status / 100) {  // Switch on the hundreds digit
        case 2: printf("Success\\n");      break;
        case 3: printf("Redirect\\n");     break;
        case 4: printf("Client error\\n"); break;
        case 5: printf("Server error\\n"); break;
        default: printf("Unknown\\n");
    }

    return 0;
}`,
                    output: "Wednesday\nHTTP 404: Client error",
                    warning: "The <code>break</code> at the end of each case is not decoration — it is mandatory. Without it, after the matched case's code runs, execution literally continues into the next case and keeps going, even though that case's value didn't match. This is called fall-through, and forgetting a <code>break</code> is one of the most common bugs in C programs. Always add a <code>default</code> case to handle unexpected values explicitly — silently ignoring out-of-range inputs produces bugs that are extremely difficult to trace. In C23, you can use <code>[[fallthrough]]</code> to mark intentional fall-through and silence compiler warnings."
                }
            ]
        }
    ],
    
    quiz: [
        {
            question: "Which symbol is used for single-line comments?",
            options: ["##", "//", "/* */", "<!--"],
            answer: 1,
            explanation: "'//' starts a single-line comment. Everything from '//' to line end is ignored by the compiler. '/*' opens a multi-line comment. '#' starts preprocessor directives, not comments."
        },
        {
            question: "What does #include <stdio.h> do?",
            options: ["Defines a variable", "Links the standard I/O library", "Starts the program", "Prints text"],
            answer: 1,
            explanation: "#include tells the preprocessor to copy the contents of that header file into your source. stdio.h contains declarations for printf, scanf, and other I/O functions — without it, the compiler has no idea what printf is."
        },
        {
            question: "Which format specifier is used for an integer?",
            options: ["%f", "%s", "%d", "%c"],
            answer: 2,
            explanation: "%d is the format specifier for a signed decimal integer. %f is for float/double, %c for char, %s for strings."
        },
        {
            question: "What is the output of 7 / 2 in C (integers)?",
            options: ["3.5", "3", "4", "Error"],
            answer: 1,
            explanation: "Both operands are integers, so C performs integer division — the fractional part is truncated, not rounded. 7/2 = 3, not 3.5."
        },
        {
            question: "Why do we use & in scanf?",
            options: ["It looks nice", "To pass the address of the variable", "To declare a pointer", "It is optional"],
            answer: 1,
            explanation: "scanf needs the address of the variable to write into, not its value. & gives the address. Without &, you'd pass the current (garbage) value of the variable as the destination address — undefined behavior."
        },
        {
            question: "What does 'return 0' mean in main?",
            options: ["Program crashed", "Program ended successfully", "Program returned a value to be printed", "Infinite loop"],
            answer: 1,
            explanation: "return 0 from main signals successful program termination to the OS. Non-zero conventionally means an error occurred. This is how shell scripts check if a program succeeded."
        },
        {
            question: "Which operator checks for equality?",
            options: ["=", "==", "!=", "==="],
            answer: 1,
            explanation: "== is the equality comparison operator. = is assignment. This is one of the most common beginner bugs: writing if (x = 5) assigns 5 to x instead of comparing."
        },
        {
            question: "What is the value of 15 % 4?",
            options: ["3", "3.75", "0", "4"],
            answer: 0,
            explanation: "% is the modulo (remainder) operator. 15 / 4 = 3 remainder 3, so 15 % 4 = 3."
        },
        {
            question: "What header file provides the bool, true, and false keywords?",
            options: ["<stdlib.h>", "<stdbool.h>", "<types.h>", "<bool.h>"],
            answer: 1,
            explanation: "stdbool.h provides the bool type, and the true/false macros in C99-C17. In C23, bool/true/false are built-in keywords and no header is needed."
        },
        {
            question: "What is the decimal value of 0x1F in C?",
            options: ["10", "16", "31", "1F"],
            answer: 2,
            explanation: "0x means hexadecimal. 0x1F = 1*16 + 15 = 31 in decimal."
        }
    ],
    
    practice: [
        {
            title: "Personal Greeting",
            difficulty: "easy",
            problem: "Write a program that declares a character for your initial and an integer for your age, then prints them like: 'Initial: X, Age: Y'.",
            hint: "Use %c for char and %d for int.",
            solution: `#include <stdio.h>

int main() {
    char initial = 'J';
    int age = 28;
    
    printf("Initial: %c, Age: %d\\n", initial, age);
    return 0;
}`
        },
        {
            title: "Simple Calculator",
            difficulty: "easy",
            problem: "Ask the user for two integers. Print their sum, difference, and product.",
            solution: `#include <stdio.h>

int main() {
    int a, b;
    printf("Enter two numbers: ");
    scanf("%d %d", &a, &b);
    
    printf("Sum: %d\\n", a + b);
    printf("Diff: %d\\n", a - b);
    printf("Product: %d\\n", a * b);
    
    return 0;
}`
        },
        {
            title: "Even or Odd",
            difficulty: "easy",
            problem: "Ask the user for a number. Tell them if it is Even or Odd. Use a bool variable to store the result. (Hint: use the modulus operator %).",
            hint: "Include <stdbool.h> and declare: bool isEven = (n % 2 == 0);",
            solution: `#include <stdio.h>
#include <stdbool.h>

int main() {
    int n;
    printf("Enter a number: ");
    scanf("%d", &n);
    
    bool isEven = (n % 2 == 0);
    
    if (isEven) {
        printf("Even\\n");
    } else {
        printf("Odd\\n");
    }
    return 0;
}`
        },
        {
            title: "Grade System",
            difficulty: "medium",
            problem: "Ask for a score (0-100). Print 'A' if >= 90, 'B' if >= 80, 'C' if >= 70, 'D' if >= 60, else 'F'.",
            solution: `#include <stdio.h>

int main() {
    int score;
    printf("Enter score: ");
    scanf("%d", &score);
    
    if (score >= 90) printf("A\\n");
    else if (score >= 80) printf("B\\n");
    else if (score >= 70) printf("C\\n");
    else if (score >= 60) printf("D\\n");
    else printf("F\\n");
    
    return 0;
}`
        },
        {
            title: "Hex Converter",
            difficulty: "medium",
            problem: "Ask the user for a decimal integer. Print it in hexadecimal and octal using the correct format specifiers.",
            solution: `#include <stdio.h>

int main() {
    int n;
    printf("Enter a decimal integer: ");
    scanf("%d", &n);
    
    printf("Decimal: %d\\n", n);
    printf("Hex:     0x%X\\n", n);
    printf("Octal:   0%o\\n", n);
    
    return 0;
}`
        }
    ],
    
    exam: [
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    printf("A");
    printf("B\\n");
    printf("C");
    return 0;
}`,
            options: ["A\\nBC", "AB\\nC", "ABC\\n", "A B C"],
            answer: 1,
            explanation: "printf does not add a newline automatically. Only \\n in the second call creates a newline, so output is AB on one line, then C on the next with no trailing newline."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    int x = 10;
    int y = 3;
    printf("%d %d\\n", x / y, x % y);
    return 0;
}`,
            options: ["3 1", "3.33 1", "3 3", "4 1"],
            answer: 0,
            explanation: "Integer division 10/3 truncates to 3. The remainder 10%3 is 1."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    int a = 5;
    int b = a++;
    printf("%d %d\\n", a, b);
    return 0;
}`,
            options: ["5 5", "6 5", "6 6", "5 6"],
            answer: 1,
            explanation: "Post-increment: b captures a's value (5) before a increments. After the line, a=6 and b=5."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    int x = 7;
    if (x > 5)
        printf("A\\n");
        printf("B\\n");
    return 0;
}`,
            options: ["A", "B", "A\\nB", "Nothing"],
            answer: 2,
            explanation: "Without braces, only the first printf belongs to the if. The second printf(B) is outside the if and always runs. Both print."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    int x = 1;
    switch (x) {
        case 1: printf("one ");
        case 2: printf("two ");
        default: printf("def");
    }
    return 0;
}`,
            options: ["one", "one two", "one two def", "def"],
            answer: 2,
            explanation: "No break statements — switch falls through every case once it matches. Starting at case 1, execution falls through case 2 and default."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    float f = 1 / 2;
    printf("%.1f\\n", f);
    return 0;
}`,
            options: ["0.5", "0.0", "1.0", "Compile error"],
            answer: 1,
            explanation: "1 and 2 are both integer literals, so 1/2 is integer division = 0. That 0 is then stored in f as 0.0. The cast must happen before division: (float)1/2 or 1.0/2."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    int i = 0;
    while (i < 3) {
        printf("%d ", i);
        i++;
    }
    printf("%d\\n", i);
    return 0;
}`,
            options: ["0 1 2 2", "0 1 2 3", "1 2 3 3", "0 1 2"],
            answer: 1,
            explanation: "Loop runs for i=0,1,2, printing each. After the loop exits (when i=3), printf prints 3."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    char c = 'A';
    printf("%c %d\\n", c, c);
    return 0;
}`,
            options: ["A A", "A 65", "65 A", "65 65"],
            answer: 1,
            explanation: "%c prints the character 'A'. %d prints its ASCII integer value, which is 65. A char is just a small integer — both formats are valid."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    int x = 5;
    int y = 10;
    int z = x > 3 && y < 5;
    printf("%d\\n", z);
    return 0;
}`,
            options: ["1", "0", "5", "10"],
            answer: 1,
            explanation: "x > 3 is true (1). y < 5 is false (0). true && false = 0. z is assigned 0."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    int x = 0xFF;
    printf("%d\\n", x);
    return 0;
}`,
            options: ["FF", "255", "256", "0xFF"],
            answer: 1,
            explanation: "0xFF is a hexadecimal literal. F=15, so 0xFF = 15*16 + 15 = 255. %d prints it as a decimal integer."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    printf("%d\\n", 2 + 3 * 4);
    printf("%d\\n", (2 + 3) * 4);
    return 0;
}`,
            options: ["14 then 14", "20 then 20", "14 then 20", "20 then 14"],
            answer: 2,
            explanation: "Operator precedence: * before +. 2 + 3*4 = 2+12 = 14. With parentheses: (2+3)*4 = 5*4 = 20."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main() {
    int a = 5, b = 10;
    if (a = b) {
        printf("equal\\n");
    } else {
        printf("not equal\\n");
    }
    return 0;
}`,
            options: ["equal", "not equal", "Compile error", "Nothing"],
            answer: 0,
            explanation: "a = b is ASSIGNMENT, not comparison. It assigns 10 to a, then the if tests whether 10 is truthy — it is (non-zero), so 'equal' prints. This is a classic bug; == was intended."
        }
    ],
};

window.ModuleBeginner = ModuleBeginner;