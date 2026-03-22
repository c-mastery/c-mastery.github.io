const ModuleIntermediate = {
    description: "Bridging the gap: Advanced operator logic, multi-dimensional data structures, recursion, and understanding how variables live in memory. Plus C23 essentials: constexpr, nullptr, binary literals, _BitInt, and typed enumerations.",
    
    lessons: [
        {
            id: "advanced-operators",
            title: "Advanced Operators",
            explanation: "Beyond basic arithmetic, C exposes operators that work at the bit level, an operator that compresses a conditional into a single expression, and an operator that queries the machine-level size of any type. These are not exotic edge cases — they are daily tools in systems programming. Bit operations are the standard way to pack multiple boolean flags into a single integer, manipulate hardware registers, and write fast low-level code. The <code>sizeof</code> operator is essential for writing code that works correctly on different hardware. And the ternary operator appears in virtually every non-trivial C program. This lesson builds the vocabulary you need to read real C source code.",
            sections: [
                {
                    title: "The Ternary Operator",
                    content: "The ternary operator is a compressed <code>if-else</code> that fits inside an expression. Instead of a full block just to decide what value to assign, you write the whole thing in one line. It evaluates a condition, and produces one of two values depending on the result. The name 'ternary' just means it takes three operands — condition, true-value, false-value.",
                    points: [
                        "<strong>Syntax</strong>: <code>condition ? value_if_true : value_if_false</code> — read it as 'if condition, give me the left value, otherwise give me the right value'.",
                        "<strong>Why use it?</strong> For simple one-liner decisions, it's genuinely more readable than a five-line if-else block. Assigning a variable based on a condition is the sweet spot.",
                        "<strong>When to avoid it?</strong> The moment you start nesting ternary operators inside other ternary operators, stop. The result is technically valid C and completely unreadable to any human, including future you."
                    ],
                    code: `#include <stdio.h>

int main() {
    int age = 20;
    // Pass the ternary result directly — no pointer variable needed at this stage
    printf("Status: %s\\n", (age >= 18) ? "Adult" : "Minor");

    // Ternary in an integer assignment — the most common use
    int discount = (age >= 65) ? 20 : 0;
    printf("Senior discount: %d%%\\n", discount);

    // Nesting is legal but quickly unreadable — use if-else instead
    int score = 75;
    printf("Grade: %s\\n", (score >= 90) ? "A" : (score >= 70) ? "B" : "C");
    return 0;
}`,
                    output: "Status: Adult\\nSenior discount: 0%\\nGrade: B"
                },
                {
                    title: "Bitwise Operators",
                    content: "Every value in your program is ultimately a sequence of bits. Bitwise operators act directly on those bits, one bit at a time. This is not an abstraction — it is the lowest level of manipulation available in C without writing assembly. Real uses: hardware registers where each bit controls a feature (read-only bit 0, write-enable bit 1, interrupt-enable bit 2), permission flags packed into a single integer, network packet headers, colour channels packed into a 32-bit RGBA value, and any situation where you need to pack multiple small values into one integer to save memory.",
                    points: [
                        "<code>&</code> (AND) — mask: result bit is 1 only when BOTH input bits are 1. Used to isolate specific bits: <code>flags & 0x04</code> tests whether bit 2 is set, leaving all other bits as 0. Like a stencil — only lets through what you specify.",
                        "<code>|</code> (OR) — set: result bit is 1 when AT LEAST ONE input bit is 1. Used to turn on specific bits without disturbing others: <code>flags | 0x04</code> sets bit 2 and leaves everything else unchanged.",
                        "<code>^</code> (XOR) — toggle: result bit is 1 when the input bits DIFFER. Used to flip specific bits: <code>flags ^ 0x04</code> toggles bit 2 — if it was 0 it becomes 1, if it was 1 it becomes 0.",
                        "<code>~</code> (NOT) — invert: flips every bit. <code>~5</code> on a 32-bit int gives -6, because of two's complement representation. Use with care on signed types.",
                        "<code>&lt;&lt;</code> (left shift) — multiply by powers of 2: <code>x &lt;&lt; n</code> shifts bits left by n positions, filling with zeros. Each position is a multiplication by 2. <code>1 &lt;&lt; 3 = 8</code>. This is how you create single-bit masks: <code>1 &lt;&lt; bit_position</code>.",
                        "<code>&gt;&gt;</code> (right shift) — divide by powers of 2: <code>x &gt;&gt; n</code> shifts bits right. For unsigned types, fills with zeros. For signed types, behaviour on negative values is implementation-defined — always right-shift unsigned values."
                    ],
                    code: `#include <stdio.h>

int main() {
    // Hardware register simulation: 8 flags packed into one byte
    unsigned char reg = 0b00000000;

    // Set bit 0 (read enable) and bit 2 (interrupt enable)
    reg |= (1 << 0);   // reg = 0b00000001
    reg |= (1 << 2);   // reg = 0b00000101

    printf("After setting bits 0 and 2: 0x%02X\\n", reg);  // 0x05

    // Test if bit 2 is set
    if (reg & (1 << 2))
        printf("Interrupt enabled\\n");

    // Clear bit 0 (AND with inverted mask)
    reg &= ~(1 << 0);  // reg = 0b00000100
    printf("After clearing bit 0: 0x%02X\\n", reg);  // 0x04

    // Toggle bit 2
    reg ^= (1 << 2);   // reg = 0b00000000
    printf("After toggling bit 2: 0x%02X\\n", reg);  // 0x00

    // Shifts as fast multiplication/division
    int x = 1;
    printf("1 << 0 = %d\\n", x << 0);  // 1
    printf("1 << 3 = %d\\n", x << 3);  // 8
    printf("1 << 8 = %d\\n", x << 8);  // 256

    return 0;
}`,
                    output: "After setting bits 0 and 2: 0x05\nInterrupt enabled\nAfter clearing bit 0: 0x04\nAfter toggling bit 2: 0x00\n1 << 0 = 1\n1 << 3 = 8\n1 << 8 = 256"
                },
                {
                    title: "sizeof Operator",
                    content: "The <code>sizeof</code> operator tells you how many bytes a type or variable occupies in memory. It's evaluated entirely at compile time — it costs nothing at runtime. This is one of the most practically useful things in C because C makes no guarantees about the exact size of types across different platforms.",
                    points: [
                        "<strong>Why use it?</strong> On a typical 64-bit desktop, <code>int</code> is 4 bytes. On some embedded microcontrollers, it might be 2. If you hardcode sizes, your code silently breaks when compiled for a different target. <code>sizeof</code> makes your code adapt automatically.",
                        "<strong>Format Specifier</strong>: <code>sizeof</code> returns a value of type <code>size_t</code>, which is unsigned. Use <code>%zu</code> to print it correctly. Using <code>%d</code> technically causes undefined behavior on some platforms."
                    ],
                    code: `#include <stdio.h>

int main() {
    int i = 10;
    double d = 10.5;
    
    printf("Size of int: %zu bytes\\n", sizeof(i));
    printf("Size of double: %zu bytes\\n", sizeof(d));
    printf("Size of char: %zu bytes\\n", sizeof(char));
    
    int arr[] = {1, 2, 3, 4, 5};
    int numElements = sizeof(arr) / sizeof(arr[0]);
    printf("Array has %d elements.\\n", numElements);
    
    return 0;
}`,
                    output: "Size of int: 4 bytes\nSize of double: 8 bytes\nSize of char: 1 byte\nArray has 5 elements."
                },
                {
                    title: "Numeric Limits with limits.h",
                    content: "Every integer type has a minimum and maximum value determined by how many bits it uses. <code>&lt;limits.h&gt;</code> provides named constants for these limits — the most important being <code>INT_MAX</code>, <code>INT_MIN</code>, and their counterparts for other types. You've already seen <code>INT_MAX</code> in undefined behavior examples. Now here's where it actually comes from and why it matters.",
                    points: [
                        "<code>INT_MAX</code>: Maximum value of a signed <code>int</code> — 2,147,483,647 on 32-bit systems.",
                        "<code>INT_MIN</code>: Minimum value of a signed <code>int</code> — -2,147,483,648.",
                        "<code>UINT_MAX</code>: Maximum value of <code>unsigned int</code> — 4,294,967,295.",
                        "<code>LONG_MAX</code> / <code>LONG_MIN</code>: Limits for <code>long</code>.",
                        "<code>LLONG_MAX</code> / <code>LLONG_MIN</code>: Limits for <code>long long</code> — 9,223,372,036,854,775,807.",
                        "<code>CHAR_MAX</code> / <code>CHAR_MIN</code>: Limits for <code>char</code>. Whether <code>CHAR_MIN</code> is 0 or -128 reveals whether <code>char</code> is signed or unsigned on your platform."
                    ],
                    code: `#include <stdio.h>
#include <limits.h>

int main() {
    printf("INT_MAX:   %d\\n",  INT_MAX);   // 2147483647
    printf("INT_MIN:   %d\\n",  INT_MIN);   // -2147483648
    printf("UINT_MAX:  %u\\n",  UINT_MAX);  // 4294967295
    printf("LLONG_MAX: %lld\\n", LLONG_MAX); // 9223372036854775807
    printf("CHAR_MAX:  %d\\n",  CHAR_MAX);  // 127 (signed) or 255 (unsigned)
    
    // Practical use: check before adding to avoid overflow
    int x = INT_MAX;
    if (x < INT_MAX) {  // Safe to add 1
        x++;
    } else {
        printf("Cannot add: would overflow\\n");
    }
    
    return 0;
}`,
                    output: "INT_MAX:   2147483647\nINT_MIN:   -2147483648\nUINT_MAX:  4294967295\nLLONG_MAX: 9223372036854775807\nCHAR_MAX:  127\nCannot add: would overflow",
                    tip: "The <code>&lt;float.h&gt;</code> header provides the equivalent for floating-point types: <code>FLT_MAX</code>, <code>DBL_MAX</code>, <code>FLT_EPSILON</code> (the smallest float difference from 1.0), and <code>DBL_EPSILON</code>. <code>DBL_EPSILON</code> is especially useful for float comparisons: instead of <code>a == b</code> (unreliable), use <code>fabs(a - b) < DBL_EPSILON</code>."
                },
                {
                    title: "Two's Complement: How Signed Integers Actually Work",
                    content: "You know that signed integers can hold negative values. But how does the CPU physically store -1 in the same 32 bits it uses for positive numbers? The answer is two's complement — the encoding scheme used by virtually every modern CPU. Understanding it explains overflow behavior, bitwise operations on negative numbers, and why mixing signed and unsigned types is dangerous.",
                    points: [
                        "<strong>The encoding rule:</strong> For a positive number, two's complement is just normal binary. For a negative number, flip every bit (bitwise NOT) and add 1. That's it. <code>-1</code> in 8-bit two's complement: start with 00000001, flip to 11111110, add 1 → 11111111. So <code>-1</code> is stored as all 1-bits.",
                        "<strong>Why this is clever:</strong> Addition works identically for both positive and negative numbers with no special cases in hardware. <code>5 + (-3)</code> in binary just works out to <code>2</code> using normal binary addition rules. The CPU needs only one adder circuit for both cases.",
                        "<strong>The sign bit:</strong> The most significant bit is the sign bit. If it's 1, the value is negative. If 0, positive. This is why signed types have asymmetric ranges — <code>int8_t</code> goes from -128 to 127, not -127 to 127.",
                        "<strong>The asymmetry trap:</strong> <code>INT_MIN</code> has no positive equivalent. On a 32-bit int, <code>-(-2147483648)</code> is undefined behavior — there is no positive 2147483648 in a 32-bit signed integer. The negation overflows."
                    ],
                    code: `#include <stdio.h>
#include <stdint.h>
 
int main() {
    int8_t pos =  5;   // Binary: 00000101
    int8_t neg = -5;   // Binary: 11111011  (flip 00000101 → 11111010, +1 → 11111011)
 
    printf("pos = %d,  bits: ", pos);
    for (int i = 7; i >= 0; i--) printf("%d", (pos >> i) & 1);
    printf("\\n");
 
    printf("neg = %d, bits: ", neg);
    for (int i = 7; i >= 0; i--) printf("%d", ((uint8_t)neg >> i) & 1);
    printf("\\n");
 
    // -1 is all 1-bits in two's complement
    int8_t minus_one = -1;
    printf("-1 as hex:  0x%02X\\n", (uint8_t)minus_one); // 0xFF
 
    // Adding wraps correctly: 127 + 1 overflows to -128 (UB for signed, defined for unsigned)
    uint8_t u = 255;
    u++;
    printf("255u + 1 = %u\\n", u); // 0 — wraps around
 
    // Why ~5 == -6: flip all bits of 00000101 → 11111010 = -6 in two's complement
    int x = 5;
    printf("~5 = %d\\n", ~x); // -6
 
    return 0;
}`,
                    output: "pos =  5,  bits: 00000101\nneg = -5, bits: 11111011\n-1 as hex:  0xFF\n255u + 1 = 0\n~5 = -6"
                },
                {
                    title: "IEEE 754: How Floating-Point Numbers Are Stored",
                    content: "Floats don't work like integers. They can't represent every decimal value exactly, they have a limited precision range, and operations that look mathematically identical can produce different results. These aren't bugs in your code or the compiler — they follow directly from the IEEE 754 standard, which defines how every float and double is physically stored. Understanding the format explains every surprising float behavior you will ever encounter.",
                    points: [
                        "<strong>The format:</strong> A 32-bit <code>float</code> has three fields packed into its 32 bits: 1 sign bit, 8 exponent bits, and 23 mantissa (fraction) bits. A 64-bit <code>double</code> has 1 sign bit, 11 exponent bits, and 52 mantissa bits. The value is computed as: <code>(-1)^sign × 2^(exponent-127) × 1.mantissa</code>",
                        "<strong>Why 0.1 + 0.2 ≠ 0.3:</strong> 0.1 in binary is a repeating fraction — like 1/3 in decimal. It cannot be stored exactly in a finite number of bits. The stored value is the closest representable approximation. Add two approximations and the rounding errors accumulate, giving you 0.30000000000000004 instead of 0.3.",
                        "<strong>Special values:</strong> IEEE 754 reserves bit patterns for <code>Infinity</code> (exponent all 1s, mantissa 0) and <code>NaN</code> — Not a Number (exponent all 1s, non-zero mantissa). <code>NaN</code> is produced by operations like <code>0.0/0.0</code> or <code>sqrt(-1.0)</code>. Any comparison with <code>NaN</code> returns false — even <code>nan == nan</code> is false.",
                        "<strong>Never compare floats with ==:</strong> Due to rounding, two calculations that should produce the same result often differ by a tiny amount. Use <code>fabs(a - b) < epsilon</code> with a suitably small epsilon instead. <code>DBL_EPSILON</code> from <code>&lt;float.h&gt;</code> is the smallest difference between 1.0 and the next representable double."
                    ],
                    code: `#include <stdio.h>
#include <math.h>
#include <float.h>
#include <stdint.h>
 
int main() {
    // 0.1 + 0.2 is NOT 0.3 in floating point
    double a = 0.1, b = 0.2;
    printf("0.1 + 0.2 = %.17f\\n", a + b);   // Not exactly 0.3
    printf("== 0.3?   %s\\n", (a + b == 0.3) ? "yes" : "no"); // no
 
    // Correct float comparison using epsilon
    printf("approx ==? %s\\n", fabs((a+b) - 0.3) < DBL_EPSILON ? "yes" : "no");
 
    // Special values
    double inf  =  1.0 / 0.0;
    double ninf = -1.0 / 0.0;
    double nan  =  0.0 / 0.0;
    printf("1/0   = %f\\n",  inf);   // inf
    printf("-1/0  = %f\\n",  ninf);  // -inf
    printf("0/0   = %f\\n",  nan);   // nan
    printf("nan==nan: %s\\n", nan == nan ? "true" : "false"); // false!
 
    // The raw bit pattern of 1.0f is 0x3F800000:
    // sign=0, exponent bits=01111111 (127), mantissa=0
    // → value = 1.0 × 2^(127-127) = 1.0 × 1 = 1.0
    // (Inspecting raw float bits with a union is covered in the Advanced module)
 
    // Precision limit: doubles have ~15-16 significant decimal digits
    printf("%.20f\\n", 0.1); // Shows the approximation
 
    return 0;
}`,
                    output: "0.1 + 0.2 = 0.30000000000000004441\n== 0.3?   no\napprox ==? yes\n1/0   = inf\n-1/0  = -inf\n0/0   = nan\nnan==nan: false\n0.10000000000000000555",
                    tip: "Use <code>double</code> over <code>float</code> for general-purpose decimal arithmetic — it has 15-16 significant digits vs 6-7 for float. Neither is suitable for money or financial calculations where exact decimal representation matters. For those, use integer arithmetic scaled by a power of 10 (store dollars as cents) or a dedicated decimal library."
                }
            ]
        },
        {
            id: "multi-arrays",
            title: "Multi-Dimensional Arrays",
            explanation: "A 2D array is the natural way to represent anything inherently grid-shaped: a game board, a matrix of numbers, a pixel image, a spreadsheet, a table of data. C stores a 2D array as a flat, contiguous block of memory in row-major order — all elements of row 0 come first, immediately followed by row 1, and so on. This storage layout has a direct performance consequence: iterating across a row is fast (sequential memory access, cache-friendly) while iterating down a column is slow (jumps of row-width bytes on every step, causing cache misses). Understanding the memory layout is not just trivia — on large arrays the difference between row-major and column-major traversal is measurable and sometimes dramatic.",
            sections: [
                {
                    title: "Declaring 2D Arrays",
                    content: "The declaration <code>int matrix[3][4]</code> means 3 rows and 4 columns — 12 integers total. Both dimensions are zero-indexed, so rows go from 0 to 2 and columns from 0 to 3. You access any element by specifying its row first, then column: <code>matrix[row][col]</code>. Think of it like navigating a table — you pick the row first, then move across to the column.",
                    code: `#include <stdio.h>

int main() {
    // 3 Rows, 4 Columns
    int matrix[3][4] = {
        {1, 2, 3, 4},    // Row 0
        {5, 6, 7, 8},    // Row 1
        {9, 10, 11, 12}  // Row 2
    };
    
    printf("Element at [1][2]: %d\\n", matrix[1][2]); // 7
    
    return 0;
}`,
                    output: "Element at [1][2]: 7"
                },
                {
                    title: "Memory Layout",
                    content: "RAM is a single, linear sequence of bytes — no actual 2D structure. C stores 2D arrays in <strong>row-major order</strong>: Row 0 completely, then Row 1 immediately after, then Row 2, all in one contiguous block.",
                    tip: "This has real performance implications. Iterating row-by-row accesses memory sequentially — cache-friendly and fast. Iterating column-by-column jumps around in memory, causing cache misses and measurable slowdowns on large arrays. Always iterate in the order the data is laid out."
                },
                {
                    title: "Iterating Through 2D Arrays",
                    content: "The natural tool for 2D arrays is nested loops — outer loop over rows, inner loop over columns. The loop structure directly mirrors the conceptual grid.",
                    code: `#include <stdio.h>

int main() {
    int grid[2][3] = {
        {1, 2, 3},
        {4, 5, 6}
    };
    
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 3; j++) {
            printf("%d ", grid[i][j]);
        }
        printf("\\n");
    }
    return 0;
}`,
                    output: "1 2 3 \n4 5 6 "
                }
            ]
        },
        {
            id: "recursion",
            title: "Recursion",
            explanation: "Recursion is a function that calls itself. This statement sounds like it should be illegal — surely a function that calls itself would just loop infinitely? The reason it works is that each call creates a completely fresh, independent stack frame with its own local variables and its own return address. Active calls don't share state — they are as separate as calls to completely different functions. The power of recursion is that certain problems have naturally self-similar structure that maps cleanly to this pattern. A filesystem tree is a directory containing files and other directories — each of which is itself a tree. A JSON document can contain JSON objects — each of which is itself a document. Sorting algorithms like mergesort work by sorting two halves — each of which is sorted by the same algorithm. For these problems, the recursive solution is shorter, clearer, and more obviously correct than any iterative alternative. The cost is memory: every active call holds a stack frame, and C's stack is finite — typically 1–8MB. Deep recursion (tens of thousands of levels) exhausts it.",
            sections: [
                {
                    title: "The Concept",
                    content: "Every recursive function needs exactly two things. If either one is missing, the function is broken — it either gives wrong answers or runs until it crashes the program.",
                    points: [
                        "<strong>Base Case</strong>: The stopping condition — the situation simple enough to answer directly without calling yourself again. This is the exit door. Without it, calls stack up infinitely until the program runs out of stack memory and crashes with a stack overflow. The base case is not optional.",
                        "<strong>Recursive Step</strong>: The call to yourself with a modified argument that is measurably closer to the base case. 'Closer' means the argument must converge toward the base case on every call — if you call with <code>n-1</code>, then n must decrease, and eventually reach the base case. If it doesn't converge, you have an infinite recursion.",
                        "<strong>Mental model</strong>: Think of it like Russian nesting dolls. To open the outermost doll, you open it, find a smaller doll, and open that one too — repeating until you find the smallest doll that doesn't open (the base case). Then you've found your answer."
                    ]
                },
                {
                    title: "Example: Countdown",
                    code: `#include <stdio.h>

void countdown(int n) {
    if (n <= 0) {
        printf("Blastoff!\\n");
        return;
    }
    
    printf("%d...\\n", n);
    countdown(n - 1); // Recursive step
}

int main() {
    countdown(5);
    return 0;
}`,
                    output: "5...\n4...\n3...\n2...\n1...\nBlastoff!"
                },
                {
                    title: "The Call Stack",
                    content: "Every function call — recursive or not — allocates a stack frame: a block of memory on the call stack that holds the function's local variables, parameters, and the return address. In recursion, each nested call adds a new frame on top of the previous one. For <code>countdown(5)</code>, you get 6 frames stacked on top of each other before any start unwinding. When the base case finally returns, the frames peel off one by one in reverse order — last called, first returned. You can observe this with a debugger: set a breakpoint inside the recursive function and look at the 'call stack' view. You'll see every active call listed in order.",
                    tip: "Recursion is elegant for problems with self-similar structure, but it's not free. Each stack frame consumes memory, and function call overhead adds up. For very deep recursion — tens of thousands of levels — you'll overflow the stack. Some languages mitigate this with tail-call optimization, but C does not guarantee it. Know your data size before choosing recursion over an iterative approach."
                }
            ]
        },
        {
            id: "storage-classes",
            title: "Storage Classes",
            explanation: "Every variable in C has a storage class — a property that determines two things: where in memory the variable lives, and how long it survives. Most of the time the compiler infers this automatically from where you declare the variable. But understanding those defaults, and knowing how to override them, explains a whole class of behavior that otherwise looks mysterious: why a local variable disappears after its function returns, why a <code>static</code> local remembers its value between calls, why a global in one file should be hidden from other files, and why <code>errno</code> works safely in multithreaded code. Storage classes are not a niche topic — they are the rules that govern every variable you ever declare.",
            sections: [
                {
                    title: "Automatic (auto)",
                    content: "This is the default for any variable declared inside a function or block. You almost never write the <code>auto</code> keyword explicitly — it's just what local variables are. They're created the moment execution enters the block they're declared in, and they're destroyed the moment execution leaves it. They live on the Stack — fast to allocate and deallocate. They're completely gone after the function returns — returning a pointer to a local variable is a classic and devastating mistake.",
                    code: `void func() {
    int x = 10; // auto int x = 10; is the same
    // x is created here
} // x is destroyed here`
                },
                {
                    title: "Static",
                    content: "<code>static</code> local variables are the exception to the 'destroyed when the function exits' rule. A <code>static</code> variable inside a function is initialized only once — the very first time the function runs — and then it persists for the entire lifetime of the program. Every subsequent call finds the variable exactly where it was left last time. This lets a function remember state between calls without using a global variable.",
                    code: `#include <stdio.h>

void counter() {
    static int count = 0;
    count++;
    printf("Count: %d\\n", count);
}

int main() {
    counter(); // prints 1
    counter(); // prints 2
    counter(); // prints 3
    return 0;
}`,
                    output: "Count: 1\nCount: 2\nCount: 3",
                    tip: "Without <code>static</code>, <code>count</code> would be re-created as 0 every time <code>counter()</code> is called, printing '1, 1, 1'. <code>static</code> on a global variable or function restricts visibility to the current file only — a useful encapsulation tool in multi-file projects."
                },
                {
                    title: "Extern",
                    content: "When a project spans multiple <code>.c</code> files, you sometimes need to access a global variable defined in a different file. <code>extern</code> says 'this variable exists and is defined somewhere else — don't allocate new memory for it, just let me use it'. It's a promise to the compiler that the linker will resolve later. Without <code>extern</code>, each file creates its own separate copy of the variable, which is almost never what you want.",
                    tip: "The full workflow for extern, header files, and multi-file compilation is covered in the 'Multi-File Programs and Header Files' lesson in this same module."
                },
                {
                    title: "Register",
                    content: "A hint asking the compiler to store a variable in a CPU register rather than RAM. CPU registers are the fastest possible storage — built into the processor itself, single clock cycle access. In practice, modern compilers are far better at register allocation than any human, so they largely ignore the keyword. You'll rarely see it in new code, but you'll encounter it in older codebases."
                },
                {
                    title: "_Thread_local",
                    content: "<code>_Thread_local</code> (or <code>thread_local</code> in C11 with <code>&lt;threads.h&gt;</code>) is a storage class for multithreaded programs. A <code>_Thread_local</code> variable looks like a global — it has file scope and persists for the program's lifetime — but each thread gets its own independent copy. Writing to a thread-local variable from one thread has no effect on the same variable as seen from other threads.",
                    points: [
                        "<strong>Why it exists</strong>: Some global state is inherently per-thread. The classic example is <code>errno</code> — the error code set by system calls. If it were a true global, one thread's error would overwrite another thread's. <code>errno</code> is implemented as a thread-local variable in every modern C runtime.",
                        "<strong>Initialization</strong>: Thread-local variables are initialized once per thread, not once per program. Each new thread starts with the variable at its declared initial value.",
                        "<strong>Scope restriction</strong>: <code>_Thread_local</code> can only be applied to variables with static storage duration — globals and <code>static</code> locals. You can't apply it to regular local variables."
                    ],
                    code: `// Concept illustration (full threading with thrd_create/thrd_join
// is covered in the Expert module — <threads.h>)
//
// Each thread has its OWN independent copy of a _Thread_local variable.
// The real-world example you use every day:
//
//   extern _Thread_local int errno;   // declared in <errno.h>
//
// Thread A calls fopen("missing.txt", "r") → errno set to ENOENT in Thread A
// Thread B calls malloc() at the same instant → errno set to ENOMEM in Thread B
// Thread A reads errno — it sees ENOENT, not ENOMEM, because each thread
// has its own copy.

#include <stdio.h>

// A module-level call counter: each thread counts its own calls
// independently without needing a mutex
_Thread_local int call_count = 0;

void do_work(void) {
    call_count++;    // Only increments THIS thread's counter
    printf("This thread has called do_work %d time(s)\\n", call_count);
}

int main(void) {
    // In single-threaded code, _Thread_local behaves like static
    do_work();   // 1
    do_work();   // 2
    do_work();   // 3
    return 0;
}`,
                    output: "This thread has called do_work 1 time(s)\nThis thread has called do_work 2 time(s)\nThis thread has called do_work 3 time(s)",
                    tip: "You won't need <code>_Thread_local</code> until you write multithreaded programs. It is introduced here as a storage class so the list is complete. Revisit it once you reach the Expert module on <code>&lt;threads.h&gt;</code>, where you'll create actual threads and observe the independence of thread-local copies in action."
                }
            ]
        },
        {
            id: "volatile",
            title: "The volatile Keyword",
            explanation: "The compiler's optimizer is extremely aggressive. One of its favorite tricks is caching a variable's value in a CPU register after its first read, then using that cached value for subsequent reads rather than going back to memory. For normal variables this is a huge win — memory access is hundreds of times slower than register access. But some variables can change outside the program's normal flow: a hardware peripheral writes to a memory-mapped register, a signal handler updates a flag, another CPU core modifies a shared variable. In these cases the optimizer's caching is catastrophically wrong — the program is checking a stale cached value while the real value in memory has changed. <code>volatile</code> is the way you tell the compiler: 'this variable lives in the real world — do not cache it, do not optimize reads or writes, go to memory every single time it is accessed.'",
            sections: [
                {
                    title: "The Problem volatile Solves",
                    content: "Without <code>volatile</code>, the compiler sees a variable that your code only ever reads without writing, and it thinks: 'this never changes, I'll just read it once and reuse the value from the register'. For normal variables this is a valid optimization. For variables that can change behind the compiler's back, this optimization produces a program that never sees the updated value — it sits in an infinite loop checking a stale cached copy.",
                    code: `// WITHOUT volatile — the compiler may optimize this into
// an infinite loop that never re-reads the flag from memory
int done = 0;  // Set to 1 by a signal handler or hardware
 
while (!done) {   // Compiler caches done=0, loops forever
    // ... wait ...
}
 
// WITH volatile — the compiler must re-read from memory on every iteration
volatile int done = 0;
 
while (!done) {   // Re-reads from memory every iteration — correct
    // ... wait ...
}`
                },
                {
                    title: "When to Use volatile",
                    content: "The situations where <code>volatile</code> is required are specific and important. Using it everywhere 'just to be safe' is wrong — it disables optimizations for no reason. Use it only in these four scenarios.",
                    points: [
                        "<strong>Memory-mapped hardware registers:</strong> In embedded programming, hardware devices are controlled by writing to specific memory addresses. Those addresses can change state independently of your program. Every read and write must go to actual hardware, not a cached copy.",
                        "<strong>Signal handlers:</strong> A variable shared between <code>main()</code> and a signal handler must be <code>volatile sig_atomic_t</code>. The signal can fire between any two instructions, and the handler modifies the variable — <code>volatile</code> ensures the change is visible. (Signal handling is covered in the Expert module.)",
                        "<strong>setjmp / longjmp:</strong> Local variables modified after a <code>setjmp</code> call must be <code>volatile</code> or they may revert to their pre-setjmp values after a <code>longjmp</code>. (Covered in the Expert module.)",
                        "<strong>Polling flags across threads:</strong> Technically, <code>_Atomic</code> (C11) is the correct tool for this. But in older code, <code>volatile</code> was used to prevent the compiler from caching a flag that another thread sets."
                    ],
                    code: `#include <stdio.h>

// --- Embedded / hardware-register example ---
// A hardware STATUS register at a fixed memory address.
// The hardware device updates it independently of the CPU.
#define STATUS_REG_ADDR  0x40001000
#define STATUS_READY     0x01

// Without volatile, the compiler might read the register once,
// cache it in a register, and loop forever on the stale value.
// With volatile, every loop iteration re-reads from the actual address.
void wait_for_device(void) {
    volatile unsigned int *status =
        (volatile unsigned int *)STATUS_REG_ADDR;

    // Re-reads from hardware on every iteration — correct
    while ((*status & STATUS_READY) == 0) {
        // spin until device signals ready
    }
}

// --- The same pattern with a plain variable to make it runnable ---
// Simulates a flag that is "set externally" (by hardware, an OS callback,
// or a signal handler — mechanisms covered in later modules).
int main(void) {
    volatile int sensor_updated = 0;

    // In a real program something outside this loop would set sensor_updated.
    // With volatile the compiler cannot hoist the read out of the loop.
    // Here we just show the structure:
    int iterations = 0;
    while (!sensor_updated) {
        iterations++;
        if (iterations == 5) sensor_updated = 1; // simulate external write
    }
    printf("Sensor update detected after %d checks.\\n", iterations);
    return 0;
}`,
                    output: "Sensor update detected after 5 checks.",
                    tip: "The canonical real-world use you will encounter is <code>volatile sig_atomic_t flag = 0;</code> — a flag that <code>main()</code> polls and a signal handler (Ctrl+C, SIGTERM) sets to 1. You'll write this exact pattern in the Expert module on signal handling. Until then, remember the rule: if a variable can change behind the compiler's back (hardware, OS, another thread), declare it <code>volatile</code>."
                },
                {
                    title: "What volatile Does NOT Do",
                    content: "It's critical to know what <code>volatile</code> doesn't guarantee, because it's commonly misunderstood.",
                    points: [
                        "<strong>It does NOT make operations atomic.</strong> <code>volatile int x = 0; x++;</code> is not thread-safe. The read-modify-write of <code>x++</code> can still be interrupted between the read and the write. Use <code>_Atomic</code> for thread safety.",
                        "<strong>It does NOT prevent reordering between volatile and non-volatile accesses.</strong> The compiler guarantees the sequence of volatile accesses relative to each other, but not relative to non-volatile reads and writes.",
                        "<strong>It does NOT replace mutexes.</strong> For proper multi-threaded synchronization, use <code>&lt;stdatomic.h&gt;</code> or <code>&lt;threads.h&gt;</code> mutexes."
                    ],
                    warning: "A very common mistake is using <code>volatile</code> for inter-thread communication in new code. C11's <code>_Atomic</code> keyword is the correct modern solution — it provides both the visibility guarantee AND atomicity. Use <code>volatile</code> only for the specific scenarios listed above (hardware registers, signal handlers, setjmp)."
                }
            ]
        },
        {
            id: "scope",
            title: "Scope, Lifetime, and assert()",
            explanation: "Scope and lifetime are two distinct properties that every variable has, and they are often confused because they typically move together. Scope is a compile-time property: which lines of source code can legally refer to this variable by name? Lifetime is a runtime property: for how long does the actual memory holding this variable's value actually exist? A local variable has block scope (only visible within its braces) and automatic lifetime (the memory is allocated when execution enters the block and released when execution leaves it). A global has program scope and static lifetime — visible from the point of declaration to the end of the file, and existing for the entire run of the program. Getting these two concepts clearly separated is what makes you understand why returning a pointer to a local variable is catastrophic, why static locals work the way they do, and why shadowing produces silent, hard-to-find bugs.",
            sections: [
                {
                    title: "Local vs Global",
                    content: "A local variable is declared inside a function or block and is only visible within that function or block. A global variable is declared outside all functions, at the top level of the file, and is visible to every function in the file after the point of declaration. Global variables live for the entire duration of the program.",
                    code: `#include <stdio.h>

int globalVar = 100; // Global: visible everywhere after declaration

void myFunc() {
    printf("Global inside func: %d\\n", globalVar);
}

int main() {
    int localVar = 50; // Local: only visible inside main
    
    printf("Global: %d\\n", globalVar);
    printf("Local: %d\\n", localVar);
    
    myFunc();
    return 0;
}`
                },
                {
                    title: "Variable Shadowing",
                    content: "If you declare a local variable with the same name as a global variable, the local one takes over within its scope. The global still exists — it's just invisible from that inner scope, hidden behind the local variable. This is called shadowing, and it compiles perfectly while running silently wrong.",
                    code: `#include <stdio.h>

int x = 10; // Global

int main() {
    int x = 20; // Local 'x' shadows global 'x'
    
    printf("Local x: %d\\n", x); // Prints 20
    
    return 0;
}`,
                    warning: "Shadowing is legal C, but it's almost never intentional. When you read <code>x</code> and half the function is using the global while the other half is using the local, bugs become extremely hard to track down. Don't name local variables the same as globals."
                },
                {
                    title: "assert() — Catching Bugs Early",
                    content: "<code>assert()</code> from <code>&lt;assert.h&gt;</code> is a debugging macro that checks whether a condition is true. If the condition is true, nothing happens and execution continues normally. If the condition is false, the program immediately aborts and prints a message telling you exactly which assertion failed, in which file, and on which line. It's designed to catch programming errors — places where your assumptions about the program's state turned out to be wrong.",
                    points: [
                        "<strong>Syntax</strong>: <code>assert(condition)</code>. If <code>condition</code> evaluates to zero (false), the program aborts with an error message.",
                        "<strong>What it prints</strong>: Something like <code>Assertion failed: x > 0, file main.c, line 8</code> — the exact condition, file, and line number. This is invaluable for debugging.",
                        "<strong>Disabling assertions</strong>: In production builds, you can disable all assertions at once by defining <code>NDEBUG</code> before including <code>&lt;assert.h&gt;</code>. Every <code>assert()</code> call then compiles to nothing — zero overhead. This is the intended workflow: use assertions liberally during development, disable them for release.",
                        "<strong>What to assert</strong>: Preconditions (things that must be true when a function is called), postconditions (things that must be true when it returns), and invariants (things that must always be true at specific points). Classic examples: a divisor is non-zero, an index is within a valid range, a value is within an expected bound."
                    ],
                    code: `#include <stdio.h>
#include <assert.h>

// Divides a by b. b must NOT be zero — assert enforces this.
double safeDivide(double a, double b) {
    assert(b != 0.0); // Aborts with a clear message if b is zero
    return a / b;
}

// Clamps a value to [lo, hi]. Caller must pass a valid range.
int clamp(int val, int lo, int hi) {
    assert(lo <= hi); // Precondition: range must make sense
    if (val < lo) return lo;
    if (val > hi) return hi;
    return val;
}

// Returns the element at index in a fixed-size array.
// Index must be 0..4 — assert catches out-of-range bugs.
int getElement(int arr[5], int index) {
    assert(index >= 0);   // Non-negative
    assert(index < 5);    // Within bounds
    return arr[index];
}

int main() {
    printf("10 / 2 = %.1f\\n", safeDivide(10.0, 2.0)); // 5.0
    printf("clamp(15, 0, 10) = %d\\n", clamp(15, 0, 10)); // 10
    printf("clamp(-3, 0, 10) = %d\\n", clamp(-3, 0, 10)); // 0

    int data[5] = {10, 20, 30, 40, 50};
    printf("Element 2: %d\\n", getElement(data, 2)); // 30

    // These would abort with a clear assertion failure message:
    // safeDivide(10.0, 0.0);    — "b != 0.0" fails
    // clamp(5, 10, 0);          — "lo <= hi" fails
    // getElement(data, 7);      — "index < 5" fails

    return 0;
}`,
                    output: "10 / 2 = 5.0\nclamp(15, 0, 10) = 10\nclamp(-3, 0, 10) = 0\nElement 2: 30",
                    tip: "Use <code>assert()</code> freely during development to document and enforce your assumptions. The crash it produces — with the exact failed condition, file name, and line number — points you straight to the bug. In release builds, define <code>NDEBUG</code> to compile all assertions away to zero overhead. Note: once you learn pointers in the next module, you'll add <code>assert(ptr != NULL)</code> as another extremely common precondition check."
                }
            ]
        },
        {
            id: "multi-file",
            title: "Multi-File Programs and Header Files",
            explanation: "Every program we've written so far lives in a single <code>.c</code> file. That's fine for learning, but falls apart fast when a program grows. Past a few hundred lines, a single-file program becomes impossible to navigate and reason about. Real software splits code across dozens or hundreds of files — each file handles one coherent area of responsibility: all the math functions, all the string processing, all the network code. The C compiler processes one <code>.c</code> file at a time, producing one <code>.o</code> object file per source file, and the linker combines them. This model is simple and fast — only changed files need recompiling — but it has strict rules: the compiler must see at least a declaration of every function before you call it. Header files are the mechanism for sharing those declarations.",
            sections: [
                {
                    title: "Translation Units",
                    content: "The C compiler processes one <code>.c</code> file at a time. Each file it processes is called a <strong>translation unit</strong>. The compiler has no idea what's in your other <code>.c</code> files while it's compiling any particular one. It only knows about functions and variables you've declared visible to it. This is why you get 'implicit declaration of function' warnings — the compiler hit a function call before seeing any declaration of that function.",
                    points: [
                        "Each <code>.c</code> file compiles independently into an object file (<code>.o</code>).",
                        "The linker then stitches all the object files together into the final executable.",
                        "A function defined in <code>math_utils.c</code> is invisible to <code>main.c</code> unless you tell <code>main.c</code> it exists."
                    ]
                },
                {
                    title: "extern: Sharing Variables Across Files",
                    content: "A global variable defined in one <code>.c</code> file is not automatically visible in another. The <code>extern</code> keyword says 'this variable exists and is defined somewhere else — don't allocate storage for it here, just let me use it'. The linker resolves the reference at link time.",
                    code: `// --- config.c ---
// This DEFINES the variable (allocates storage)
int max_connections = 100;
 
 
// --- server.c ---
// This DECLARES it with extern (no storage, just a reference)
extern int max_connections;
 
void start_server() {
    // Now we can use it
    printf("Max connections: %d\\n", max_connections);
}`,
                    warning: "A common mistake is defining a variable in a header file without <code>extern</code>. Every <code>.c</code> file that includes the header will define its own separate copy of the variable. The linker will throw a 'multiple definition' error — or worse, on some compilers it silently picks one and discards the others."
                },
                {
                    title: "Header Files (.h): The Interface Contract",
                    content: "A header file is just a text file with a <code>.h</code> extension that you <code>#include</code> into your <code>.c</code> files. The preprocessor literally pastes its contents in. Convention is to put into headers: function prototypes, struct definitions, typedefs, constants, and <code>extern</code> declarations — anything that needs to be visible to multiple files. The actual function bodies go in the corresponding <code>.c</code> file.",
                    code: `// --- math_utils.h ---
#ifndef MATH_UTILS_H   // Include guard (explained below)
#define MATH_UTILS_H
 
// Function prototypes — just the signature, no body
int  add(int a, int b);
int  multiply(int a, int b);
void print_result(int result);
 
// Shared constant
#define MAX_VALUE 1000
 
#endif // MATH_UTILS_H
 
 
// --- math_utils.c ---
#include <stdio.h>
#include "math_utils.h"  // Include own header (catches mismatches)
 
int add(int a, int b) {
    return a + b;
}
 
int multiply(int a, int b) {
    return a * b;
}
 
void print_result(int result) {
    printf("Result: %d\\n", result);
}
 
 
// --- main.c ---
#include "math_utils.h"  // Get the prototypes
 
int main() {
    int sum = add(10, 20);
    int product = multiply(5, 6);
    print_result(sum);
    print_result(product);
    return 0;
}
 
 
// --- Compile both .c files together ---
// gcc main.c math_utils.c -o program`,
                    output: "Result: 30\nResult: 30"
                },
                {
                    title: "Include Guards: Preventing Double-Inclusion",
                    content: "If <code>main.c</code> includes both <code>a.h</code> and <code>b.h</code>, and both of those include <code>types.h</code>, then <code>types.h</code> gets pasted into <code>main.c</code> twice. This causes 'redefinition' errors for every struct and typedef in it. Include guards solve this with a simple pattern: a preprocessor macro that's defined on first inclusion and checked on every subsequent one.",
                    code: `// Every header file you write should start and end with this pattern.
// The macro name MUST be unique — convention is FILENAME_H in all caps.
 
#ifndef MY_HEADER_H   // "If MY_HEADER_H is not yet defined..."
#define MY_HEADER_H   // "...define it now (marking this header as included)..."
 
// ... all your declarations go here ...
 
#endif               // "End of the guarded block."
 
// The second time this header is #include'd, MY_HEADER_H is already
// defined, so the preprocessor skips everything between #ifndef and #endif.`,
                    tip: "Modern compilers also support <code>#pragma once</code> at the top of a header as a simpler alternative to the ifndef/define/endif guard pattern. It's not part of the C standard, but it works on every major compiler (GCC, Clang, MSVC). For maximum portability, stick to the traditional guard pattern. For personal projects, <code>#pragma once</code> is fine and less boilerplate."
                },
                {
                    title: "static for File-Scope Encapsulation",
                    content: "A global variable or function declared <code>static</code> at file scope is invisible outside that translation unit. The linker cannot see it, and other <code>.c</code> files cannot reference it. This is how you 'hide' internal implementation details — anything that's an internal helper and shouldn't be part of the public interface should be <code>static</code>.",
                    code: `// --- counter.c ---
 
// Private: only visible inside counter.c
static int count = 0;
 
// Private helper function
static void log_change(int old, int new) {
    printf("Count changed: %d -> %d\\n", old, new);
}
 
// Public: visible to other files (no static)
void increment() {
    int old = count;
    count++;
    log_change(old, count);
}
 
int get_count() {
    return count;
}
 
// --- main.c ---
// extern int count;    // LINKER ERROR: 'count' is static, invisible
// log_change(1, 2);    // LINKER ERROR: 'log_change' is static, invisible
// increment();         // Fine: increment() is public
// get_count();         // Fine: get_count() is public`
                }
            ]
        },
        {
            id: "goto",
            title: "goto and Labels",
            explanation: "<code>goto</code> is C's unconditional jump — it transfers execution to a labelled statement anywhere in the same function. Dijkstra's 1968 paper 'Go To Statement Considered Harmful' condemned it, and in most contexts that condemnation holds: using <code>goto</code> to implement loops or mimic conditionals produces spaghetti code that is impossible to reason about. But C has exactly one legitimate, widely-used <code>goto</code> pattern that has survived all attempts to replace it with cleaner alternatives. That pattern is centralised cleanup on error: when a function acquires multiple resources in sequence and any acquisition can fail, <code>goto cleanup</code> jumps to a single cleanup block at the bottom of the function. This avoids deeply nested if-else chains or duplicated cleanup code. The Linux kernel uses this pattern thousands of times. You need to recognise it.",
            sections: [
                {
                    title: "The Syntax",
                    content: "A label is just an identifier followed by a colon. You can put a label before any statement in a function. <code>goto label_name;</code> immediately transfers execution to that label. The label and the <code>goto</code> must be in the same function — you cannot jump between functions.",
                    code: `#include <stdio.h>
 
int main() {
    int i = 0;
 
top:               // This is a label
    if (i < 5) {
        printf("%d\\n", i);
        i++;
        goto top;  // Jump back to the label
    }
 
    return 0;
}`,
                    output: "0\n1\n2\n3\n4",
                    warning: "The example above uses goto to implement a loop. This is the wrong use of goto — just write a while loop. It exists only to illustrate the syntax. The legitimate use of goto is below."
                },
                {
                    title: "The One Legitimate Pattern: Error Cleanup",
                    content: "In C, functions that acquire multiple resources (open files, allocate memory, lock mutexes) in sequence need to release them all on any error path. Without goto, this leads to deeply nested if-else chains or copy-pasted cleanup code. The <code>goto cleanup</code> pattern is the idiomatic C solution: one cleanup block at the bottom, jumped to from any error point. This pattern is used throughout the Linux kernel.",
                    code: `#include <stdio.h>
#include <stdlib.h>
 
int process_files(const char *file1, const char *file2) {
    FILE *f1 = NULL;
    FILE *f2 = NULL;
    int  *buf = NULL;
    int   result = -1;  // Assume failure
 
    f1 = fopen(file1, "r");
    if (!f1) {
        perror("fopen file1");
        goto cleanup;      // Jump straight to cleanup
    }
 
    f2 = fopen(file2, "w");
    if (!f2) {
        perror("fopen file2");
        goto cleanup;      // f1 is open, cleanup will close it
    }
 
    buf = malloc(1024);
    if (!buf) {
        perror("malloc");
        goto cleanup;      // f1 and f2 are open, cleanup handles both
    }
 
    // ... actual work here ...
    result = 0;  // Success
 
cleanup:
    // Safe to call free/fclose on NULL — they do nothing
    free(buf);
    if (f2) fclose(f2);
    if (f1) fclose(f1);
    return result;
}`,
                    tip: "The goto cleanup pattern has these properties that make it acceptable: the jump is always forward (downward in the file), never backward; there is exactly one cleanup block; and it eliminates the deeply nested if-else pyramid that the alternative produces. If you see this pattern in production C code, this is why it's there — not because the author didn't know how to write a loop."
                },
                {
                    title: "The Rules and Restrictions",
                    content: "C places strict limits on where you can jump with goto.",
                    points: [
                        "<strong>Same function only.</strong> You cannot goto a label in a different function.",
                        "<strong>You cannot jump over a variable initialization into its scope.</strong> Jumping to a label after a variable declaration but before its initializer would leave the variable uninitialized. The compiler prevents this.",
                        "<strong>You cannot jump into a block.</strong> You can jump out of blocks (common in nested loop breaking), but jumping into the middle of a block from outside is not allowed."
                    ]
                }
            ]
        },
        {
            id: "vla-compound",
            title: "Variable Length Arrays and Compound Literals",
            explanation: "Two C99 features that address genuine ergonomic problems but come with important trade-offs. Variable Length Arrays (VLAs) solve the 'I need a stack array whose size depends on runtime input' problem without the overhead of <code>malloc</code>/<code>free</code>. They were made optional in C11 — many embedded toolchains do not support them — and they carry a real risk of stack overflow for large inputs. Compound literals solve a different problem: passing a struct or array literal directly to a function call, without declaring a named throwaway variable just to hold the value for one call site. Both features appear in real code and are worth recognising, even if you use them selectively.",
            sections: [
                {
                    title: "Variable Length Arrays (VLAs)",
                    content: "Before C99, every array's size had to be a compile-time constant. If the user inputs a number N and you want an array of N integers, you had to either malloc it or declare an array large enough for the worst case and waste memory. C99 introduced VLAs: arrays whose size is an integer expression evaluated at runtime. The array still lives on the stack, is still destroyed when the function returns, and is still not bounds-checked — it just has a runtime-determined size.",
                    code: `#include <stdio.h>
 
// Traditional: fixed size, always wastes memory if n is small
// int buffer[1024];  
 
// With VLA: allocate exactly what's needed, on the stack
void process(int n) {
    int data[n];   // Size is n, determined at runtime
 
    for (int i = 0; i < n; i++) {
        data[i] = i * i;
    }
    for (int i = 0; i < n; i++) {
        printf("%d ", data[i]);
    }
    printf("\\n");
}
 
int main() {
    int size;
    printf("How many squares? ");
    scanf("%d", &size);
    process(size);
    return 0;
}`,
                    output: "How many squares? 6\n0 1 4 9 16 25",
                    warning: "VLAs have serious caveats. First: stack space is limited (typically 1-8 MB). A large VLA can cause a stack overflow with no warning whatsoever — just a crash. For anything larger than a few kilobytes, malloc instead. Second: VLAs are optional in C11 and later (the standard made them optional for embedded targets). Check <code>__STDC_NO_VLA__</code> if portability matters. Third: you cannot use <code>sizeof</code> on a VLA at compile time — sizeof on a VLA is evaluated at runtime."
                },
                {
                    title: "Compound Literals",
                    content: "A compound literal creates a nameless, temporary object of a specified type. The syntax looks like a cast followed by a brace-enclosed initializer: <code>(Type){initializer list}</code>. The result is an lvalue — you can take its address. Compound literals work for any type, but at this point in the curriculum the most immediately useful form is for arrays: pass an array directly to a function without declaring a named variable first.",
                    code: `#include <stdio.h>
 
// A function that receives an int array and its length
void print_array(int *arr, int n) {
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
}

// A function that sums three specific values
int sum3(int a, int b, int c) { return a + b + c; }
 
int main() {
    // Without a compound literal: need a named throwaway variable
    int tmp[] = {10, 20, 30, 40};
    print_array(tmp, 4);

    // With a compound literal: pass directly, no named variable needed
    print_array((int[]){1, 2, 3, 4, 5}, 5);

    // Compound literal as a sub-expression
    // (int[]){5, 10, 15}[1]  →  element at index 1  →  10
    printf("Middle element: %d\\n", ((int[]){5, 10, 15})[1]);

    // Lifetime: a compound literal lives for the enclosing block
    int *p = (int[]){100, 200, 300};
    printf("Via pointer: %d %d %d\\n", p[0], p[1], p[2]);

    return 0;
}`,
                    output: "10 20 30 40 \n1 2 3 4 5 \nMiddle element: 10\nVia pointer: 100 200 300",
                    tip: "Compound literals also work with structs — for example <code>(Point){3, 4}</code> — but structs and <code>typedef</code> are introduced in the next module (Advanced). Come back to this feature once you've learned those: compound literals combined with designated initializers like <code>(Point){.x = 3, .y = 4}</code> are the cleanest way to pass temporary struct values to functions."
                }
            ]
        },
        {
            id: "makefile",
            title: "Build Automation with Make",
            explanation: "Once a project spans more than one or two files, manually typing the full compile command becomes painful and error-prone. Worse, it recompiles every file every time — even files you haven't touched since the last build. For a large project, a full rebuild might take minutes. <code>make</code> solves both problems: you write a <code>Makefile</code> that describes what each output file depends on and how to build it, and <code>make</code> compares file timestamps to determine the minimum set of files that actually need recompiling. Only changed files and their dependents are rebuilt. <code>make</code> is the standard C build tool on Unix systems and has been since the 1970s — understanding it is a professional requirement for C development.",
            sections: [
                {
                    title: "The Core Concept: Rules",
                    content: "A Makefile consists of rules. Each rule says: to produce this <em>target</em> file, these <em>prerequisites</em> must be up to date, and here is the <em>recipe</em> to build it. <code>make</code> checks whether the target exists and is newer than all its prerequisites. If not, it runs the recipe. If yes, it skips the rule entirely — that's the incremental build. The recipe lines MUST start with a real tab character, not spaces. This is the most famous gotcha in all of Make.",
                    code: `# Makefile — basic structure
# target: prerequisites
#[TAB] recipe
 
# Build the final program from two object files
program: main.o math_utils.o
	gcc main.o math_utils.o -o program
 
# Build main.o from main.c (recompile if main.c or math_utils.h changes)
main.o: main.c math_utils.h
	gcc -c main.c -o main.o
 
# Build math_utils.o from math_utils.c
math_utils.o: math_utils.c math_utils.h
	gcc -c math_utils.c -o math_utils.o
 
# Phony target: 'make clean' deletes all build artifacts
# .PHONY tells make 'clean' is not a real file
.PHONY: clean
clean:
	rm -f program main.o math_utils.o`,
                    warning: "Recipe lines must begin with a TAB character — not 4 spaces, not 2 spaces, a literal tab. Make was written in 1976 and this design decision was locked in before anyone realized it was a mistake. Every text editor that auto-converts tabs to spaces will silently break your Makefile. If you get a 'missing separator' error, check your tabs."
                },
                {
                    title: "Variables and Automatic Variables",
                    content: "Makefiles have variables to avoid repetition, and automatic variables that are set automatically by Make for each rule. The most important automatic variables: <code>$@</code> is the target name, <code>$<</code> is the first prerequisite, <code>$^</code> is all prerequisites.",
                    code: `# Variables
CC      = gcc
CFLAGS  = -Wall -Wextra -g
TARGET  = program
SRCS    = main.c math_utils.c utils.c
OBJS    = $(SRCS:.c=.o)   # Replace .c with .o in SRCS list
 
# Default rule (first rule is the default target)
$(TARGET): $(OBJS)
	$(CC) $(OBJS) -o $(TARGET)
 
# Pattern rule: how to build ANY .o from its .c
# $< = the .c file, $@ = the .o file
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@
 
.PHONY: clean
clean:
	rm -f $(TARGET) $(OBJS)
 
# Usage:
#   make          — builds program (only recompiles changed files)
#   make clean    — deletes all build output
#   make -j4      — builds using 4 parallel jobs (faster on multi-core)`
                },
                {
                    title: "A Practical Makefile Template",
                    content: "This template handles the common case of a C project in a single directory. It automatically discovers all <code>.c</code> files, compiles them to <code>.o</code> files, links them, and tracks header dependencies so that changing a <code>.h</code> file triggers recompilation of every <code>.c</code> that includes it.",
                    code: `CC      = gcc
CFLAGS  = -Wall -Wextra -Wpedantic -std=c11 -g
TARGET  = myprogram
 
# Automatically find all .c files in the current directory
SRCS    = $(wildcard *.c)
OBJS    = $(SRCS:.c=.o)
DEPS    = $(OBJS:.o=.d)   # Dependency files generated by gcc
 
.PHONY: all clean
 
all: $(TARGET)
 
$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) $^ -o $@
 
# -MMD generates a .d file listing all headers this .c includes
# The .d files are included at the bottom so make knows about
# header dependencies automatically
%.o: %.c
	$(CC) $(CFLAGS) -MMD -MP -c $< -o $@
 
-include $(DEPS)
 
clean:
	rm -f $(TARGET) $(OBJS) $(DEPS)`,
                    tip: "The <code>-MMD -MP</code> flags tell GCC to generate <code>.d</code> dependency files alongside the object files. Each <code>.d</code> file lists every header the corresponding <code>.c</code> file includes. The <code>-include $(DEPS)</code> line feeds those back into Make. Result: if you change any header, Make automatically recompiles every source file that includes it — without you having to manually track those relationships."
                }
            ]
        },
        {
            id: "c23-core",
            title: "C23: constexpr, nullptr, Binary Literals, _BitInt",
            explanation: "C23 is the most significant update to C in over a decade. It introduces proper compile-time constants with <code>constexpr</code>, a typed null pointer constant <code>nullptr</code>, binary integer literals, digit separators for readability, and bit-precise integer types with <code>_BitInt</code>. These aren't cosmetic changes — they fix longstanding design weaknesses in the language.",
            sections: [
                {
                    title: "constexpr: True Compile-Time Constants",
                    content: "Before C23, the only way to create a named integer constant usable in array sizes, <code>case</code> labels, and <code>_Static_assert</code> was via <code>#define</code> (no type) or <code>enum</code> (integers only, awkward for other types). C23 adds <code>constexpr</code>, giving you a typed, scoped, debuggable compile-time constant. It can be used everywhere an integer constant expression is required.",
                    code: `#include <stdio.h>

// C23: typed, scoped constants — unlike #define, these have a type
// and show up properly in debuggers
constexpr int    BUFFER_SIZE = 1024;
constexpr double PI          = 3.14159265358979;
constexpr int    MAX_USERS   = 100;

// Can be used in array sizes (compile-time constant):
char buffer[BUFFER_SIZE];

// Can be used in case labels:
int classify_buffer(int size) {
    switch (size) {
        case BUFFER_SIZE: return 1;   // Valid — constexpr is an ICE
        default:          return 0;
    }
}

// Can be used in _Static_assert:
_Static_assert(BUFFER_SIZE > 0, "Buffer must be positive");
_Static_assert(MAX_USERS  <= 1000, "Too many users");

int main(void) {
    printf("Buffer size: %d\\n", BUFFER_SIZE);
    printf("Pi:          %.5f\\n", PI);
    printf("Max users:   %d\\n", MAX_USERS);

    // constexpr in a function — block scope
    constexpr int LOCAL_MAX = 50;
    int arr[LOCAL_MAX];
    printf("Local array size: %d\\n", LOCAL_MAX);
    (void)arr;
    return 0;
}`,
                    output: `Buffer size: 1024
Pi:          3.14159
Max users:   100
Local array size: 50`,
                    tip: "Prefer <code>constexpr</code> over <code>#define</code> for constants in new C23 code. A <code>#define</code> is a text substitution with no type, no scope, and no visibility in the debugger. <code>constexpr</code> is a real typed variable that happens to be evaluated at compile time."
                },
                {
                    title: "nullptr and nullptr_t (C23)",
                    content: "Before C23, C had no typed null pointer constant. <code>NULL</code> was typically defined as <code>((void*)0)</code> or just <code>0</code>, which is an integer — causing subtle problems in overloaded contexts and <code>_Generic</code> expressions. C23 introduces <code>nullptr</code>, a keyword with its own type <code>nullptr_t</code>, which converts to any pointer type but is distinct from integer zero. Pointers are covered in depth in the next module (Low-Level Core); this section explains <em>what</em> <code>nullptr</code> is so you recognise it in C23 code.",
                    code: `#include <stdio.h>
#include <stddef.h>   // nullptr_t

// nullptr is the new C23 null pointer constant.
// It replaces NULL everywhere a null pointer is needed.
// Its type is nullptr_t — distinct from int, unlike the old NULL macro.

int main(void) {
    // Old C: NULL is typically ((void*)0) — integer 0 in disguise
    int *old_style = NULL;

    // C23: nullptr has its own type and is unambiguously a pointer constant
    int *new_style = nullptr;

    // Both compare equal to 0 and to each other — same meaning, cleaner type
    printf("old == nullptr: %d\\n", old_style == nullptr);  // 1
    printf("new == NULL:    %d\\n", new_style == NULL);      // 1

    // The key advantage: _Generic can distinguish nullptr_t from int*
    // (Full pointer use — dereferencing, address-of, pointer arithmetic —
    //  is all in the Low-Level Core module.)
#define what_is(P) _Generic((P),             \\
    nullptr_t: "nullptr_t (null constant)",  \\
    int*:      "int pointer",                \\
    default:   "something else"              \\
)
    printf("nullptr is: %s\\n", what_is(nullptr));
    printf("int* is:    %s\\n", what_is((int*)nullptr));
    return 0;
}`,
                    output: "old == nullptr: 1\nnew == NULL:    1\nnullptr is: nullptr_t (null constant)\nint* is:    int pointer",
                    tip: "In new C23 code, write <code>nullptr</code> instead of <code>NULL</code> or <code>0</code> whenever you mean a null pointer. The meaning is identical but the intent is explicit and the type is unambiguous. You will see <code>nullptr</code> used constantly in the Low-Level Core module when checking whether a pointer is valid before using it."
                },
                {
                    title: "Binary Literals and Digit Separators (C23)",
                    content: "C23 adds two readability features for numeric literals. Binary literals use the <code>0b</code> or <code>0B</code> prefix (like most modern languages). Digit separators allow single quotes (<code>'</code>) between digits in any numeric literal — ignored by the compiler, purely for human readability.",
                    code: `#include <stdio.h>

int main(void) {
    // Binary literals (C23) — much clearer than hex for bit patterns
    unsigned char flags      = 0b10110100;
    unsigned int  permission = 0b111101101;  // rwxr-xr--
    unsigned int  mask       = 0b11110000;

    printf("flags:      0x%02X (%d)\\n", flags, flags);
    printf("permission: 0%o (octal)\\n", permission);
    printf("mask:       0b%08b (%d)\\n", mask, mask);

    // Digit separators (C23) — ' is ignored, just for readability
    long long  population  = 8'100'000'000LL;   // 8.1 billion
    double     speed_c     = 299'792'458.0;      // speed of light m/s
    unsigned   hex_color   = 0xFF'A5'00;         // orange in RGB
    unsigned   binary_byte = 0b1010'0101;        // nibble groups

    printf("Population:  %lld\\n", population);
    printf("Speed of c:  %.0f m/s\\n", speed_c);
    printf("Orange:      #%06X\\n", hex_color);
    printf("Binary byte: %u\\n", binary_byte);
    return 0;
}`,
                    output: `flags:      0xB4 (180)
permission: 0765 (octal)
mask:       0b11110000 (240)
Population:  8100000000
Speed of c:  299792458 m/s
Orange:      #FFA500
Binary byte: 165`,
                    tip: "Use digit separators whenever a large number would otherwise require counting digits. <code>8'100'000'000</code> is instantly readable as eight billion; <code>8100000000</code> requires counting. In binary literals, grouping by nibbles (<code>0b1010'0101</code>) makes bit patterns dramatically clearer."
                },
                {
                    title: "_BitInt: Bit-Precise Integer Types (C23)",
                    content: "Standard integer types (int, long, etc.) come in fixed sizes dictated by the platform. C23 introduces <code>_BitInt(N)</code> for integers of exactly N bits. This is essential for cryptography, hardware simulation, network protocol fields, and any domain where you need a specific bit width that doesn't happen to be 8, 16, 32, or 64.",
                    code: `#include <stdio.h>
#include <stdint.h>

int main(void) {
    // Exact bit widths — not available with standard types
    unsigned _BitInt(3) u3 = 7;   // 3 bits: values 0-7
    signed   _BitInt(3) s3 = -4;  // 3 bits: values -4 to 3
             _BitInt(3) s3b = 3;  // signed by default

    printf("u3 = %u (3-bit unsigned max = 7)\\n", (unsigned)u3);
    printf("s3 = %d (3-bit signed min = -4)\\n", (int)s3);

    // Useful for packing protocol fields
    unsigned _BitInt(4) nibble = 0b1010;
    unsigned _BitInt(6) six_bit = 63;  // max for 6-bit unsigned
    unsigned _BitInt(7) seven_bit = 100;

    printf("nibble (4-bit): %u\\n",  (unsigned)nibble);
    printf("6-bit max:      %u\\n",  (unsigned)six_bit);
    printf("7-bit value:    %u\\n",  (unsigned)seven_bit);

    // Overflow wraps within the bit width
    unsigned _BitInt(4) overflow = 15 + 1;  // Wraps to 0
    printf("4-bit 15+1:     %u\\n",  (unsigned)overflow);

    // wb suffix for _BitInt literals (C23)
    unsigned _BitInt(8) byte_val = 255wb;
    printf("255wb:          %u\\n",  (unsigned)byte_val);
    return 0;
}`,
                    output: `u3 = 7 (3-bit unsigned max = 7)
s3 = -4 (3-bit signed min = -4)
nibble (4-bit): 10
6-bit max:      63
7-bit value:    100
4-bit 15+1:     0
255wb:          255`,
                    warning: "<code>_BitInt</code> types do not use standard format specifiers in <code>printf</code> — you must cast to a standard integer type first (<code>(unsigned)my_bitint</code>). Also, arithmetic on <code>_BitInt</code> types wraps at the specified bit width, not at the standard integer width."
                },
                {
                    title: "Enhanced Enumerations (C23)",
                    content: "An <strong>enumeration</strong> (<code>enum</code>) is a way of assigning human-readable names to a set of integer constants. For example, <code>enum Color { RED, GREEN, BLUE };</code> makes <code>RED</code> equal to 0, <code>GREEN</code> equal to 1, and <code>BLUE</code> equal to 2. Enums are covered in full in the Advanced module — this section focuses purely on what C23 adds to them. C23 allows enumerations to have an explicit underlying integer type, and allows enumeration constants whose value exceeds the range of <code>signed int</code>. Before C23, all enum constants had to fit in a <code>signed int</code>, which was a crippling limitation for bit masks and large constant sets.",
                    code: `#include <stdio.h>
#include <stdint.h>

// Quick recap: a plain enum assigns integer names starting at 0
enum Day { MON, TUE, WED };   // MON=0, TUE=1, WED=2

// C23: explicit underlying type for enum
// Underlying type is uint32_t — can hold values up to 4 billion
enum Permission : uint32_t {
    PERM_NONE    = 0,
    PERM_READ    = 0x00000001,
    PERM_WRITE   = 0x00000002,
    PERM_EXEC    = 0x00000004,
    PERM_DELETE  = 0x00000008,
    PERM_ADMIN   = 0x80000000,   // Would fail pre-C23! Exceeds signed int
    PERM_ALL     = 0xFFFFFFFF    // Same — now valid
};

// C23: enum constants larger than INT_MAX
enum BigFlags : unsigned long long {
    FLAG_LOW  = 1ULL,
    FLAG_HIGH = 0x8000000000000000ULL   // 2^63 — impossible pre-C23
};

int main(void) {
    // Plain enum still works exactly as before
    enum Day today = WED;
    printf("Day value: %d\\n", today);  // 2

    // C23 typed enum: bit-flag permissions
    enum Permission user_perms = PERM_READ | PERM_WRITE;

    if (user_perms & PERM_READ)  printf("Can read\\n");
    if (user_perms & PERM_WRITE) printf("Can write\\n");
    if (!(user_perms & PERM_EXEC)) printf("Cannot execute\\n");

    printf("PERM_ADMIN  = 0x%08X\\n", (uint32_t)PERM_ADMIN);
    printf("PERM_ALL    = 0x%08X\\n", (uint32_t)PERM_ALL);
    printf("FLAG_HIGH   = 0x%llX\\n", (unsigned long long)FLAG_HIGH);
    return 0;
}`,
                    output: `Day value: 2
Can read
Can write
Cannot execute
PERM_ADMIN  = 0x80000000
PERM_ALL    = 0xFFFFFFFF
FLAG_HIGH   = 0x8000000000000000`,
                    tip: "The C23 typed enum feature is most valuable for permission/flag systems where you need bit values beyond <code>INT_MAX</code>. For everyday enums that fit in a normal integer — days of the week, state machine states, error codes — the plain C89 enum is perfectly fine. The full enum syntax including <code>typedef enum</code> and using enums inside structs is in the Advanced module."
                }
            ]
        }
    ],
    
    quiz: [
        {
            question: "What does the ternary operator return?",
            options: ["Boolean only", "One of two values", "Nothing", "A pointer"],
            answer: 1,
            explanation: "The ternary operator (condition ? a : b) is an expression that evaluates to one of two values. It returns a value, unlike an if statement."
        },
        {
            question: "What is 5 << 1 in bitwise operations?",
            options: ["5", "10", "2", "1"],
            answer: 1,
            explanation: "Left-shift by 1 multiplies by 2 (each bit moves one position toward more-significant). 5 in binary is 101; shifted left: 1010 = 10."
        },
        {
            question: "In a 2D array `arr[3][4]`, how many columns does it have?",
            options: ["3", "4", "7", "12"],
            answer: 1,
            explanation: "arr[3][4] declares 3 rows and 4 columns. The first dimension is rows, the second is columns."
        },
        {
            question: "What happens if a recursive function has no base case?",
            options: ["Returns 0", "Stack Overflow", "Syntax Error", "Infinite Loop"],
            answer: 1,
            explanation: "Without a base case, recursion never stops — the function keeps calling itself until it exhausts the call stack (stack overflow)."
        },
        {
            question: "What keyword preserves a variable's value between function calls?",
            options: ["auto", "extern", "static", "const"],
            answer: 2,
            explanation: "static preserves a variable's value between function calls. The variable is initialized only once and retains its value across calls."
        },
        {
            question: "Global variables are stored in which memory segment?",
            options: ["Stack", "Heap", "Data/BSS", "Register"],
            answer: 2,
            explanation: "Global variables and static local variables are stored in the data segment (initialized) or BSS segment (zero-initialized). Local variables go on the stack."
        },
        {
            question: "What does 'variable shadowing' mean?",
            options: ["Variable is deleted", "Local variable hides global variable", "Variable is constant", "Variable is optimized"],
            answer: 1,
            explanation: "Variable shadowing means a local variable with the same name as an outer-scope variable hides (shadows) it within the inner scope."
        },
        {
            question: "Which operator returns the size in bytes?",
            options: ["size()", "sizeof", "length", "bytes"],
            answer: 1,
            explanation: "sizeof returns the size in bytes of a type or variable at compile time. It's an operator, not a function, so it works on types too."
        },
        {
            question: "What header provides INT_MAX and CHAR_MIN?",
            options: ["<stdint.h>", "<stdlib.h>", "<limits.h>", "<values.h>"],
            answer: 2,
            explanation: "<limits.h> defines INT_MAX, INT_MIN, CHAR_MAX, CHAR_MIN, and similar constants for all standard integer types."
        },
        {
            question: "What happens when an assert() condition is false?",
            options: ["Returns 0", "Prints a warning and continues", "Program aborts with error message", "Compiler error"],
            answer: 2,
            explanation: "When assert(condition) evaluates to false (0), it prints a diagnostic message and calls abort(), terminating the program immediately."
        },
        {
            question: "What does _Thread_local do?",
            options: ["Makes a variable const", "Gives each thread its own copy of the variable", "Locks the variable for thread safety", "Moves the variable to the heap"],
            answer: 1,
            explanation: "_Thread_local gives each thread its own independent copy of the variable. Changes in one thread are invisible to others."
        }
    ],
    
    practice: [
        {
            title: "Matrix Diagonal Sum",
            difficulty: "medium",
            problem: "Write a program to find the sum of the main diagonal elements of a 3x3 matrix. (Indices where row index == column index).",
            solution: `#include <stdio.h>

int main() {
    int matrix[3][3] = {{1,2,3},{4,5,6},{7,8,9}};
    int sum = 0;
    
    for(int i=0; i<3; i++) {
        sum += matrix[i][i];
    }
    printf("Diagonal Sum: %d\\n", sum);
    return 0;
}`
        },
        {
            title: "Recursive Factorial",
            difficulty: "medium",
            problem: "Rewrite the factorial function using recursion instead of a loop. factorial(n) = n * factorial(n-1).",
            solution: `#include <stdio.h>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n-1);
}

int main() {
    printf("5! = %d\\n", factorial(5));
    return 0;
}`
        },
        {
            title: "Call Counter",
            difficulty: "easy",
            problem: "Create a function that tracks how many times it has been called using a static variable.",
            solution: `#include <stdio.h>

void tracker() {
    static int calls = 0;
    calls++;
    printf("Called %d times.\\n", calls);
}

int main() {
    tracker();
    tracker();
    tracker();
    return 0;
}`
        },
        {
            title: "Safe Array Access",
            difficulty: "medium",
            problem: "Write a function getElement(int *arr, int size, int index) that uses assert() to validate the pointer is not NULL and the index is within bounds, then returns the element.",
            solution: `#include <stdio.h>
#include <assert.h>

int getElement(int *arr, int size, int index) {
    assert(arr != NULL);
    assert(index >= 0);
    assert(index < size);
    return arr[index];
}

int main() {
    int data[] = {10, 20, 30, 40, 50};
    printf("Element 0: %d\\n", getElement(data, 5, 0));
    printf("Element 4: %d\\n", getElement(data, 5, 4));
    // getElement(data, 5, 10); // Would abort with assertion failure
    return 0;
}`
        }
    ],
    
    exam: [
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    int a = 12, b = 10;
    printf("%d\\n", a & b);
    printf("%d\\n", a | b);
    printf("%d\\n", a ^ b);
    return 0;
}`,
            options: ["8 then 14 then 6", "8 then 14 then 4", "4 then 14 then 6", "8 then 12 then 6"],
            answer: 0,
            explanation: "12=1100, 10=1010. AND: 1000=8. OR: 1110=14. XOR: 0110=6. Each operator works bit by bit."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int counter(void) {
    static int count = 0;
    count++;
    return count;
}
int main(void) {
    printf("%d\\n", counter());
    printf("%d\\n", counter());
    printf("%d\\n", counter());
    return 0;
}`,
            options: ["1 then 1 then 1", "0 then 1 then 2", "1 then 2 then 3", "1 then 0 then 0"],
            answer: 2,
            explanation: "A static local variable persists between calls, initialized once to 0. Each call increments it: 1, 2, 3."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    int arr[2][3] = {{1,2,3},{4,5,6}};
    printf("%d\\n", arr[1][2]);
    printf("%d\\n", arr[0][1] + arr[1][0]);
    return 0;
}`,
            options: ["6 then 6", "5 then 5", "6 then 7", "5 then 6"],
            answer: 0,
            explanation: "arr[1][2] is row 1, column 2 = 6. arr[0][1] = 2, arr[1][0] = 4. Sum = 6."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int fib(int n) {
    if (n <= 1) return n;
    return fib(n-1) + fib(n-2);
}
int main(void) {
    printf("%d\\n", fib(6));
    return 0;
}`,
            options: ["8", "13", "5", "21"],
            answer: 0,
            explanation: "Fibonacci: fib(0)=0, fib(1)=1, fib(2)=1, fib(3)=2, fib(4)=3, fib(5)=5, fib(6)=8."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    int x = 5;
    {
        int x = 10;
        printf("%d\\n", x);
    }
    printf("%d\\n", x);
    return 0;
}`,
            options: ["10 then 10", "5 then 5", "10 then 5", "5 then 10"],
            answer: 2,
            explanation: "Variable shadowing: the inner block declares its own x=10 which shadows the outer x=5. Inside the block, x=10 is printed. Outside, the original x=5 is visible again."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    int x = 0xFF;
    printf("%d\\n", x >> 4);
    printf("%d\\n", x << 1);
    return 0;
}`,
            options: ["15 then 510", "16 then 510", "15 then 255", "16 then 255"],
            answer: 0,
            explanation: "0xFF = 255. Right shift by 4: 255>>4 = 15 (divides by 16). Left shift by 1: 255<<1 = 510 (multiplies by 2)."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    int age = 20;
    const char *label = (age >= 18) ? "adult" : "minor";
    printf("%s\\n", label);
    age = 15;
    label = (age >= 18) ? "adult" : "minor";
    printf("%s\\n", label);
    return 0;
}`,
            options: ["adult then adult", "minor then minor", "adult then minor", "minor then adult"],
            answer: 2,
            explanation: "First ternary: 20 >= 18 is true → 'adult'. Second: 15 >= 18 is false → 'minor'."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            if (i == j) printf("%d ", i);
        }
    }
    printf("\\n");
    return 0;
}`,
            options: ["0 1 2", "0 0 1 1 2 2", "1 2 3", "0 1 2 0 1 2"],
            answer: 0,
            explanation: "Prints i only when i==j (the diagonal of a matrix). i=0,j=0: print 0. i=1,j=1: print 1. i=2,j=2: print 2."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#include <assert.h>
int main(void) {
    int x = 5;
    assert(x > 0);
    printf("passed\\n");
    assert(x > 10);
    printf("never\\n");
    return 0;
}`,
            options: ["passed then never", "passed then abort/crash", "abort/crash immediately", "Both asserts pass"],
            answer: 1,
            explanation: "The first assert (x > 0) passes, so 'passed' prints. The second assert (x > 10, which is false) aborts the program — 'never' is never reached."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    unsigned int u = 0;
    u--;
    printf("%u\\n", u);
    return 0;
}`,
            options: ["-1", "0", "4294967295", "Undefined behavior"],
            answer: 2,
            explanation: "Unsigned integers wrap on underflow. 0 - 1 wraps to UINT_MAX = 2^32-1 = 4294967295 on a 32-bit unsigned int. This is well-defined — unlike signed overflow."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    int x = 5, y = 10;
    printf("%d\\n", x > 3 && y < 20);
    printf("%d\\n", x > 7 || y > 5);
    printf("%d\\n", !(x == 5));
    return 0;
}`,
            options: ["1 then 1 then 0", "0 then 1 then 0", "1 then 0 then 1", "1 then 1 then 1"],
            answer: 0,
            explanation: "x>3 && y<20: both true → 1. x>7 || y>5: x>7 false, y>5 true → 1. !(x==5): x==5 is true, NOT true = false → 0."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    constexpr int SIZE = 4;
    int arr[SIZE];
    for (int i = 0; i < SIZE; i++) arr[i] = i * i;
    for (int i = 0; i < SIZE; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}`,
            options: ["0 1 4 9", "1 4 9 16", "0 1 2 3", "0 2 4 6"],
            answer: 0,
            explanation: "C23 constexpr: SIZE=4 is a typed compile-time constant usable as array size. Loop fills arr with squares: 0, 1, 4, 9."
        }
    ]
};

window.ModuleIntermediate = ModuleIntermediate;