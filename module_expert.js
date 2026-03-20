const ModuleExtra = {
    description: "The gaps: type casting, command-line arguments, const correctness, how loops work under the hood, atomics, and the standard library functions you'll actually use. Everything the main curriculum didn't have room for.",

    lessons: [
        {
            id: "type-casting",
            title: "Type Casting",
            explanation: "C is a statically typed language, but it will silently convert between types whenever it thinks it knows what you mean. Sometimes it's right. Sometimes it produces subtly wrong results and doesn't tell you. Understanding when C converts automatically and when you need to be explicit is what separates code that works from code that works most of the time.",
            sections: [
                {
                    title: "Implicit Conversion (Type Promotion)",
                    content: "When an expression involves operands of different types, C automatically promotes the smaller type to match the larger one before performing the operation. This is called implicit conversion or arithmetic promotion. The general rule is that smaller types are promoted to larger ones: <code>char</code> → <code>int</code> → <code>long</code> → <code>float</code> → <code>double</code>. The result takes the type of the larger operand.",
                    points: [
                        "<strong>int + float → float</strong>: When you mix an integer and a float in an expression, the integer is promoted to float. The result is float. This is usually what you want, but it means the integer's exact value must be representable as a float — for large integers, this causes silent precision loss.",
                        "<strong>char in arithmetic → int</strong>: Whenever a <code>char</code> participates in arithmetic, it's promoted to <code>int</code> first. Always. This matters when you're checking for overflow or doing bit manipulation on characters.",
                        "<strong>Signed + Unsigned → Unsigned</strong>: This is the dangerous one. If you mix a signed int and an unsigned int in an expression, the signed value is converted to unsigned. If the signed value was negative, it wraps to a huge positive number. Comparisons like <code>if (signed_val < unsigned_val)</code> can silently produce wrong results."
                    ],
                    code: `#include <stdio.h>

int main() {
    // int / int = int (truncated, NOT rounded)
    int a = 7, b = 2;
    printf("int/int:   %d\\n", a / b);       // 3, not 3.5
    
    // int / float = float (int is promoted first)
    printf("int/float: %f\\n", a / 2.0);     // 3.500000
    
    // Dangerous: signed meets unsigned
    int negative = -1;
    unsigned int positive = 1;
    // -1 converted to unsigned becomes 4294967295 on 32-bit
    if (negative < positive) {
        printf("negative < positive (correct)\\n");
    } else {
        printf("WARNING: -1 is not less than 1 here!\\n"); // This runs!
    }
    
    // char arithmetic promotes to int
    char c = 200; // fits in unsigned char, wraps in signed char
    printf("char + 1:  %d\\n", c + 1);       // int result
    
    return 0;
}`,
                    output: "int/int:   3\nint/float: 3.500000\nWARNING: -1 is not less than 1 here!\nchar + 1:  201",
                    warning: "The signed/unsigned comparison trap has caused real security bugs. A common pattern: a function returns <code>-1</code> on error as a signed int, but the caller stores it in an unsigned variable and compares it to a size. The <code>-1</code> becomes a massive number, the comparison is wrong, and the error is silently ignored. Always use consistent signedness in comparisons, or cast explicitly."
                },
                {
                    title: "Explicit Casting",
                    content: "An explicit cast tells the compiler 'I know what I'm doing, convert this value to this type right now'. The syntax is <code>(type)expression</code>. It overrides implicit conversion rules and makes your intent clear both to the compiler and to anyone reading the code. It does not guarantee correctness — you can cast to the wrong type and get garbage — but at least the intention is documented.",
                    points: [
                        "<strong>Forcing float division</strong>: <code>(float)a / b</code> casts <code>a</code> to float before division, forcing float arithmetic. Without the cast, <code>a / b</code> is integer division.",
                        "<strong>Truncating floats</strong>: <code>(int)3.9</code> gives <code>3</code> — it truncates toward zero, it does not round. <code>(int)-3.9</code> gives <code>-3</code>, not <code>-4</code>.",
                        "<strong>Narrowing casts</strong>: Casting a larger type to a smaller one (e.g., <code>int</code> to <code>char</code>) silently discards the upper bytes. If the value doesn't fit in the destination type, you get a truncated, probably meaningless result.",
                        "<strong>Pointer casts</strong>: You can cast between pointer types. This is sometimes necessary (e.g., casting <code>void*</code> from <code>malloc</code>), but casting an <code>int*</code> to a <code>char*</code> and dereferencing it reads individual bytes — which is useful for serialization and type punning, but requires care."
                    ],
                    code: `#include <stdio.h>

int main() {
    int a = 7, b = 2;
    
    // Explicit cast forces float division
    float result = (float)a / b;
    printf("(float)a / b = %.1f\\n", result);   // 3.5
    
    // Truncation, not rounding
    double d = 3.9;
    printf("(int)3.9  = %d\\n", (int)d);         // 3
    printf("(int)-3.9 = %d\\n", (int)-3.9);      // -3, not -4
    
    // Narrowing: value doesn't fit, bits are discarded
    int big = 256;
    char small = (char)big; // 256 = 0x100, only low byte kept = 0x00
    printf("(char)256 = %d\\n", small);           // 0
    
    int big2 = 200;
    char small2 = (char)big2; // 200 = 0xC8, as signed char = -56
    printf("(char)200 = %d\\n", small2);          // -56
    
    // Pointer cast: look at raw bytes of a float
    float f = 1.0f;
    unsigned int *ip = (unsigned int*)&f;
    printf("Float 1.0 as hex: 0x%X\\n", *ip);    // IEEE 754 representation
    
    return 0;
}`,
                    output: "(float)a / b = 3.5\n(int)3.9  = 3\n(int)-3.9 = -3\n(char)256 = 0\n(char)200 = -56\nFloat 1.0 as hex: 0x3F800000",
                    tip: "If you find yourself casting the same expression repeatedly, or casting in ways that feel wrong, that's usually a sign the surrounding variable types should be changed instead. Casts are for the boundaries between systems — where an API returns <code>void*</code>, or where you genuinely need to inspect raw bytes. Using them to paper over type mismatches in your own code is a sign of a design problem."
                }
            ]
        },
        {
            id: "argc-argv",
            title: "Command-Line Arguments",
            explanation: "Every C program we've written starts with <code>int main()</code>. But <code>main</code> can accept arguments — values the user passes on the command line when running the program. This is how tools like <code>gcc</code>, <code>ls</code>, and every command-line utility ever written receive their inputs. The mechanism is two parameters: <code>argc</code> and <code>argv</code>.",
            sections: [
                {
                    title: "argc and argv",
                    content: "<code>main</code> has a second valid signature: <code>int main(int argc, char *argv[])</code>. The OS populates these before calling your <code>main</code>. <code>argc</code> (argument count) is the number of arguments, including the program's own name. <code>argv</code> (argument vector) is an array of strings — one per argument. <code>argv[0]</code> is always the program name or path. The actual user arguments start at <code>argv[1]</code>.",
                    points: [
                        "<code>argc</code> is always at least 1, because <code>argv[0]</code> is always present (the program name).",
                        "<code>argv</code> is of type <code>char *argv[]</code> — an array of pointers to strings. Equivalently written as <code>char **argv</code>. Both declarations mean the same thing here.",
                        "<code>argv[argc]</code> is guaranteed to be <code>NULL</code> — a null pointer marks the end of the array. You can use this as a sentinel to iterate without knowing <code>argc</code>, though using <code>argc</code> is cleaner.",
                        "All arguments arrive as strings, always. If you run <code>./calc 5 3</code>, <code>argv[1]</code> is the string <code>\"5\"</code>, not the integer 5. You must convert manually using <code>atoi</code>, <code>strtol</code>, or <code>sscanf</code>."
                    ],
                    code: `#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    printf("Program name: %s\\n", argv[0]);
    printf("Argument count: %d\\n", argc);
    
    // argc is 1 if no arguments were given (just the program name)
    if (argc < 3) {
        printf("Usage: %s <num1> <num2>\\n", argv[0]);
        return 1; // Non-zero = error
    }
    
    // Arguments are strings - convert to integers
    int a = atoi(argv[1]);
    int b = atoi(argv[2]);
    
    printf("%d + %d = %d\\n", a, b, a + b);
    printf("%d * %d = %d\\n", a, b, a * b);
    
    return 0;
}`,
                    output: "// If run as: ./program 10 5\nProgram name: ./program\nArgument count: 3\n10 + 5 = 15\n10 * 5 = 50"
                },
                {
                    title: "Iterating Over Arguments",
                    content: "When you don't know how many arguments there will be — like a program that accepts a list of filenames — you loop over <code>argv</code> starting from index 1. The loop condition is usually <code>i < argc</code>. You can also check flags (arguments starting with <code>-</code>) to implement simple command-line options.",
                    code: `#include <stdio.h>
#include <string.h>

int main(int argc, char *argv[]) {
    int verbose = 0;
    int count = 0;
    
    // Loop through all arguments, looking for flags and values
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "-v") == 0) {
            verbose = 1; // Flag detected
        } else {
            count++;
            if (verbose) {
                printf("Arg %d: '%s'\\n", count, argv[i]);
            } else {
                printf("%s\\n", argv[i]);
            }
        }
    }
    
    printf("Total non-flag args: %d\\n", count);
    return 0;
}`,
                    output: "// Run as: ./program -v hello world\nArg 1: 'hello'\nArg 2: 'world'\nTotal non-flag args: 2",
                    tip: "For simple tools with a few flags, hand-rolling argument parsing like this is perfectly fine. For anything more complex — optional values, short and long flags like <code>-v</code> / <code>--verbose</code> — use the POSIX <code>getopt</code> function from <code>&lt;unistd.h&gt;</code>. It handles the standard Unix argument conventions automatically and saves you from writing a lot of fragile string-comparison code."
                }
            ]
        },
        {
            id: "const-pointers",
            title: "const and Pointers",
            explanation: "<code>const</code> on its own is straightforward — it marks a variable as read-only. But <code>const</code> combined with pointers has three distinct meanings depending on where the keyword appears, and confusing them is one of the most common sources of compiler warnings and subtle bugs in C. This is worth learning precisely because you will see all three forms constantly in real code and library headers.",
            sections: [
                {
                    title: "Three Forms, Three Meanings",
                    content: "The position of <code>const</code> relative to the <code>*</code> completely determines what is protected. A useful reading rule: start from the variable name and apply the Right-Left Rule. <code>const</code> modifies whatever is immediately to its right.",
                    points: [
                        "<strong><code>const int *p</code></strong> — pointer to const int: The data pointed to is read-only. You cannot write <code>*p = 5</code>. But you can change what <code>p</code> points to: <code>p = &other</code> is fine. The pointer itself is mutable; the value it points to is not. Use this when passing data to a function that should read but not modify it.",
                        "<strong><code>int * const p</code></strong> — const pointer to int: The pointer itself is read-only. You cannot do <code>p = &other</code>. But you can write through it: <code>*p = 5</code> is fine. The pointer is fixed; the value it points to is mutable. Less common, used for fixed-address hardware registers.",
                        "<strong><code>const int * const p</code></strong> — const pointer to const int: Both are read-only. You can neither change what <code>p</code> points to nor modify the value through it. The strictest form, used when you have a pointer that should never change in any way."
                    ],
                    code: `#include <stdio.h>

int main() {
    int x = 10;
    int y = 20;
    
    // 1. Pointer to const: data is read-only, pointer is mutable
    const int *p1 = &x;
    // *p1 = 5;    // ERROR: cannot modify *p1
    p1 = &y;       // OK: can change where p1 points
    printf("p1 -> %d\\n", *p1); // 20
    
    // 2. Const pointer: pointer is read-only, data is mutable
    int * const p2 = &x;
    *p2 = 99;      // OK: can modify the value
    // p2 = &y;    // ERROR: cannot change where p2 points
    printf("x is now: %d\\n", x); // 99
    
    // 3. Const pointer to const: both are read-only
    const int * const p3 = &y;
    // *p3 = 5;    // ERROR: cannot modify *p3
    // p3 = &x;    // ERROR: cannot change where p3 points
    printf("p3 -> %d\\n", *p3); // 20
    
    return 0;
}`,
                    output: "p1 -> 20\nx is now: 99\np3 -> 20"
                },
                {
                    title: "const in Function Parameters",
                    content: "The most important practical use of <code>const</code> with pointers is in function signatures. When a function takes a pointer parameter but doesn't need to modify what it points to, mark it <code>const</code>. This does two things: it prevents the function from accidentally modifying the data (enforced by the compiler), and it communicates intent to the caller — they can safely pass a pointer to data they don't want modified.",
                    code: `#include <stdio.h>
#include <string.h>

// 'const char *str' says: this function will NOT modify the string.
// The caller can pass a string literal, a const variable, or a normal
// string - all are safe. Without const, passing a string literal
// would generate a compiler warning.
int countChar(const char *str, char target) {
    int count = 0;
    while (*str != '\\0') {
        if (*str == target) count++;
        str++; // Moving the pointer is fine - it's not const itself
    }
    return count;
}

// This function DOES modify through the pointer - no const here
void toUppercase(char *str) {
    while (*str != '\\0') {
        if (*str >= 'a' && *str <= 'z') {
            *str -= 32; // ASCII lowercase to uppercase
        }
        str++;
    }
}

int main() {
    char text[] = "hello world";
    
    printf("Count of 'l': %d\\n", countChar(text, 'l'));
    
    toUppercase(text);
    printf("Uppercase: %s\\n", text);
    
    return 0;
}`,
                    output: "Count of 'l': 3\nUppercase: HELLO WORLD",
                    tip: "A quick memory aid: read the declaration backwards. <code>const int *p</code> → 'p is a pointer to int that is const' → the int is const. <code>int * const p</code> → 'p is a const pointer to int' → p is const. When you see these in library headers, applying this rule instantly tells you whether a function will modify your data or not — which is exactly the information you need as a caller."
                }
            ]
        },
        {
            id: "loops-internals",
            title: "How Loops Actually Work",
            explanation: "Loops feel like abstract control flow, but the CPU has no concept of 'loop' — it only knows instructions and jumps. Understanding what the machine actually does when you write a loop explains why certain loop patterns are faster than others, what 'loop unrolling' means, how branch prediction works, and why iterating over a 2D array in the wrong order can be several times slower than doing it right.",
            sections: [
                {
                    title: "Loops as Jumps",
                    content: "At the machine code level, every loop compiles down to a comparison and a conditional jump. A <code>for</code> loop incrementing from 0 to N becomes: check if counter < N, if true run the body and jump back to the check, if false fall through to the next instruction. That's it. The elegance of C's loop syntax is entirely in the source code — the CPU just sees a tight sequence of instructions with a jump at the end.",
                    points: [
                        "<strong>Comparison + Jump</strong>: Every loop iteration costs at least one comparison and one branch (the conditional jump back to the top). For small, fast loop bodies, this overhead can be significant relative to the actual work.",
                        "<strong>Loop Unrolling</strong>: Optimizing compilers often unroll loops — instead of jumping back 100 times, they emit the loop body 4 or 8 times in sequence, then jump back only every 4 or 8 iterations. This reduces branch overhead and lets the CPU pipeline more instructions simultaneously. You can do this manually too, but the compiler is usually better at it.",
                        "<strong>Branch Prediction</strong>: Modern CPUs predict which way a branch will go and start executing speculatively before the comparison resolves. For loops, the CPU quickly learns 'this branch almost always jumps back' and pipelines ahead accordingly. The misprediction penalty (the CPU flushed the wrong speculative work) only happens on the very last iteration. This is why tight loops are faster than you might expect from counting individual instructions."
                    ],
                    code: `#include <stdio.h>

// What you write:
int sumNormal(int *arr, int n) {
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += arr[i];
    }
    return sum;
}

// What a compiler might generate after loop unrolling (manual version):
// Process 4 elements per iteration, reducing branch count by 4x
int sumUnrolled(int *arr, int n) {
    int sum = 0;
    int i = 0;
    
    // Handle groups of 4
    for (; i <= n - 4; i += 4) {
        sum += arr[i];
        sum += arr[i + 1];
        sum += arr[i + 2];
        sum += arr[i + 3];
    }
    
    // Handle leftover elements
    for (; i < n; i++) {
        sum += arr[i];
    }
    
    return sum;
}

int main() {
    int data[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    printf("Normal:   %d\\n", sumNormal(data, 10));
    printf("Unrolled: %d\\n", sumUnrolled(data, 10));
    return 0;
}`,
                    output: "Normal:   55\nUnrolled: 55",
                    tip: "You almost never need to manually unroll loops — modern compilers with <code>-O2</code> optimization do it automatically and better. The value of understanding unrolling is that it explains *why* the compiler's output can look so different from your source, and why benchmarking unoptimized code is usually meaningless."
                },
                {
                    title: "Cache Locality",
                    content: "RAM is slow compared to the CPU. To bridge this gap, CPUs have small, extremely fast cache memories (L1, L2, L3) that store recently accessed data. When you access a memory location, the CPU doesn't just fetch that one value — it fetches an entire cache line (typically 64 bytes) of surrounding data into the cache. If your next access is nearby in memory, it's already in the cache (a cache hit — fast). If it's somewhere else entirely, the cache has to fetch a new line (a cache miss — slow, ~100x slower than a cache hit). Loops that access memory sequentially are therefore dramatically faster than loops that jump around.",
                    code: `#include <stdio.h>
#include <time.h>

#define N 1024

int matrix[N][N];

// Row-major: accesses memory sequentially (cache-friendly)
long long sumRowMajor() {
    long long sum = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            sum += matrix[i][j]; // Next element is adjacent in memory
    return sum;
}

// Column-major: jumps N*sizeof(int) bytes each step (cache-unfriendly)
long long sumColMajor() {
    long long sum = 0;
    for (int j = 0; j < N; j++)
        for (int i = 0; i < N; i++)
            sum += matrix[i][j]; // Next element is N ints away in memory
    return sum;
}

int main() {
    // Initialize matrix
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            matrix[i][j] = i + j;
    
    clock_t start, end;
    
    start = clock();
    long long r = sumRowMajor();
    end = clock();
    printf("Row-major:    %lld ms\\n", (end - start) * 1000 / CLOCKS_PER_SEC);
    
    start = clock();
    long long c = sumColMajor();
    end = clock();
    printf("Column-major: %lld ms\\n", (end - start) * 1000 / CLOCKS_PER_SEC);
    
    return 0;
}`,
                    output: "Row-major:    ~5 ms\nColumn-major: ~40 ms  // (8x slower on typical hardware)",
                    warning: "Cache performance is one of the most impactful and most overlooked optimization factors in C. A naively written algorithm with better cache behavior will frequently outperform a theoretically superior algorithm with poor access patterns. Whenever you write a nested loop over a 2D array, check: are you iterating in the order C stores the data (row-major)? If not, strongly consider restructuring the loop before reaching for any other optimization."
                }
            ]
        },
        {
            id: "atomics",
            title: "Atomics and Concurrency (C11)",
            explanation: "Modern programs often run multiple threads simultaneously. When two threads access the same variable at the same time — one reading, one writing — without any coordination, you have a race condition. The result is undefined behavior: you might read a half-written value, or the compiler might reorder operations in ways that break your assumptions entirely. C11 introduced <code>_Atomic</code> types and the <code>&lt;stdatomic.h&gt;</code> header to give you operations that are guaranteed to complete without interference from other threads.",
            sections: [
                {
                    title: "The Race Condition Problem",
                    content: "A race condition occurs when the correctness of a program depends on the timing of two threads' operations — and the timing isn't guaranteed. The classic example: two threads both incrementing a shared counter. Incrementing looks like one operation in C (<code>counter++</code>), but it compiles to at least three machine instructions: load the value from memory, add 1, store the result back. If two threads interleave these steps, both can load the same value, both increment it, and both write back — resulting in one increment instead of two. No error is reported. The counter is just wrong.",
                    points: [
                        "<strong>Non-atomic read-modify-write</strong>: Any operation that reads a value, modifies it, and writes it back — like <code>++</code>, <code>+=</code>, <code>|=</code> — is non-atomic by default. It's multiple machine instructions that can be interrupted.",
                        "<strong>Compiler reordering</strong>: The compiler is allowed to reorder operations that don't depend on each other. In single-threaded code this is always safe. In multithreaded code, reordering can break programs that rely on operations happening in a specific order across threads.",
                        "<strong>CPU reordering</strong>: Even after the compiler, the CPU itself may reorder memory operations for performance. This is invisible in single-threaded programs but causes real problems in multithreaded ones without memory barriers."
                    ],
                    code: `#include <stdio.h>
#include <threads.h> // C11 threads (requires -lpthread on Linux)

// Shared counter - NOT atomic (demonstrates the problem)
int unsafe_counter = 0;

int increment_thread(void *arg) {
    for (int i = 0; i < 100000; i++) {
        unsafe_counter++; // READ - ADD - WRITE: three steps, not atomic!
        // Another thread can interrupt between any of these steps
    }
    return 0;
}

int main() {
    thrd_t t1, t2;
    
    thrd_create(&t1, increment_thread, NULL);
    thrd_create(&t2, increment_thread, NULL);
    
    thrd_join(t1, NULL);
    thrd_join(t2, NULL);
    
    // Expected: 200000. Actual: something less, varies each run.
    printf("Final counter: %d\\n", unsafe_counter);
    printf("Expected:      200000\\n");
    
    return 0;
}`,
                    output: "Final counter: 143271  // Different every run\nExpected:      200000",
                    warning: "Race conditions are among the hardest bugs to debug because they're non-deterministic. The program may run correctly 999 times out of 1000, then fail once under load. They also disappear under debuggers, which change thread timing. If your program uses multiple threads and shares mutable state, assume you have race conditions until you've proven otherwise with proper synchronization."
                },
                {
                    title: "Atomic Types (_Atomic)",
                    content: "C11's solution is <code>_Atomic</code> — a type qualifier that makes operations on a variable happen as a single, indivisible step. No thread can see a partial operation on an atomic variable. The compiler and CPU are both required to ensure this. The <code>&lt;stdatomic.h&gt;</code> header provides type aliases (<code>atomic_int</code>, <code>atomic_bool</code>, etc.) and explicit atomic operation functions for when you need more control than the basic operators provide.",
                    points: [
                        "<strong><code>_Atomic int</code> or <code>atomic_int</code></strong>: Declares an atomic integer. All reads and writes are guaranteed to be indivisible — no thread sees a half-updated value.",
                        "<strong>Atomic operations on <code>_Atomic</code> variables</strong>: Using <code>++</code>, <code>+=</code>, etc. on an <code>_Atomic</code> variable automatically makes those operations atomic. The compiler generates the appropriate hardware instructions (lock-prefixed instructions on x86, load-linked/store-conditional on ARM).",
                        "<strong><code>atomic_fetch_add</code>, <code>atomic_load</code>, <code>atomic_store</code></strong>: Explicit atomic operation functions from <code>&lt;stdatomic.h&gt;</code>. Use these when you need to perform an operation and get the old value, or when you need to specify a memory ordering.",
                        "<strong>Memory ordering</strong>: Atomic operations can specify how they interact with surrounding non-atomic operations. <code>memory_order_seq_cst</code> (the default) is the strictest and safest. <code>memory_order_relaxed</code> is the fastest but gives the fewest guarantees. For most application code, the default is fine."
                    ],
                    code: `#include <stdio.h>
#include <stdatomic.h>
#include <threads.h>

// Atomic counter - operations are now indivisible
atomic_int safe_counter = 0;

int safe_increment(void *arg) {
    for (int i = 0; i < 100000; i++) {
        atomic_fetch_add(&safe_counter, 1); // Atomic increment
        // Equivalent to safe_counter++ but guaranteed atomic
    }
    return 0;
}

int main() {
    thrd_t t1, t2;
    
    thrd_create(&t1, safe_increment, NULL);
    thrd_create(&t2, safe_increment, NULL);
    
    thrd_join(t1, NULL);
    thrd_join(t2, NULL);
    
    // Always exactly 200000
    printf("Final counter: %d\\n", atomic_load(&safe_counter));
    printf("Expected:      200000\\n");
    
    return 0;
}`,
                    output: "Final counter: 200000\nExpected:      200000",
                    tip: "Atomics solve the race condition problem for single variables. They do not solve the coordination problem for multi-step operations. If you need to read a counter, check its value, and then update it based on that check — all as one unit — you need a mutex, not just an atomic. Atomics are for the simplest cases: counters, flags, single-variable state. For anything more complex, reach for a proper synchronization primitive."
                }
            ]
        },
        {
            id: "stdlib-deep",
            title: "Standard Library Deep Dive",
            explanation: "The C standard library is a collection of pre-compiled, battle-tested functions that come with every C compiler. Learning which functions exist and what they actually do well prevents you from reinventing things badly. This lesson covers the most practically useful functions across four headers you'll reach for constantly: <code>&lt;string.h&gt;</code> for memory operations, <code>&lt;stdlib.h&gt;</code> for sorting, searching, and conversions, and <code>&lt;math.h&gt;</code> for mathematics.",
            sections: [
                {
                    title: "Memory Functions (string.h)",
                    content: "Beyond the string functions covered earlier, <code>&lt;string.h&gt;</code> contains functions that operate on raw memory — bytes, not strings. These are among the fastest ways to copy, move, or fill blocks of memory in C because they're typically implemented in heavily optimized assembly.",
                    points: [
                        "<code>memcpy(dst, src, n)</code>: Copies exactly <code>n</code> bytes from <code>src</code> to <code>dst</code>. The two regions must NOT overlap. It's undefined behavior if they do. This is the fastest general-purpose memory copy — use it whenever you know the regions are separate.",
                        "<code>memmove(dst, src, n)</code>: Copies <code>n</code> bytes, but handles overlapping source and destination correctly. Slightly slower than <code>memcpy</code> because it has to determine the direction of copy to avoid overwriting data before it's read. Use this whenever the regions might overlap.",
                        "<code>memset(ptr, byte, n)</code>: Fills <code>n</code> bytes starting at <code>ptr</code> with the value <code>byte</code>. The byte value is an <code>int</code> but only the low 8 bits are used. The most common uses: <code>memset(arr, 0, sizeof(arr))</code> to zero a buffer, and <code>memset(ptr, 0xFF, n)</code> to fill with 0xFF. Note: <code>memset</code> works on bytes, so <code>memset(arr, 1, sizeof(arr))</code> fills each byte with 1, not each int with 1.",
                        "<code>memcmp(a, b, n)</code>: Compares <code>n</code> bytes of two memory regions. Returns 0 if identical, negative if <code>a</code> < <code>b</code>, positive if <code>a</code> > <code>b</code>. Faster than a manual byte-by-byte loop."
                    ],
                    code: `#include <stdio.h>
#include <string.h>

int main() {
    // memcpy: fast copy, no overlap allowed
    char src[] = "Hello, World!";
    char dst[20];
    memcpy(dst, src, strlen(src) + 1); // +1 for null terminator
    printf("memcpy: %s\\n", dst);
    
    // memmove: safe overlap copy
    char buffer[] = "ABCDE";
    // Shift right by 1 (overlapping regions!)
    memmove(buffer + 1, buffer, 4);
    buffer[0] = 'Z';
    printf("memmove: %s\\n", buffer); // ZABCD
    
    // memset: fill with a value
    int arr[5];
    memset(arr, 0, sizeof(arr)); // Zero all bytes
    printf("memset zero: ");
    for (int i = 0; i < 5; i++) printf("%d ", arr[i]); // 0 0 0 0 0
    printf("\\n");
    
    // memcmp: compare raw bytes
    char a[] = "apple";
    char b[] = "apple";
    char c[] = "mango";
    printf("memcmp same:  %d\\n", memcmp(a, b, 5)); // 0
    printf("memcmp diff:  %d\\n", memcmp(a, c, 5)); // negative
    
    return 0;
}`,
                    output: "memcpy: Hello, World!\nmemmove: ZABCD\nmemset zero: 0 0 0 0 0 \nmemcmp same:  0\nmemcmp diff:  -12"
                },
                {
                    title: "Sorting and Searching (stdlib.h)",
                    content: "<code>qsort</code> and <code>bsearch</code> are the standard library's general-purpose sort and binary search. They use <code>void*</code> parameters to work with any data type, which means they take a comparator function as a parameter — this is function pointers in practical use.",
                    points: [
                        "<code>qsort(base, n, size, cmp)</code>: Sorts an array in place. <code>base</code> is the start of the array, <code>n</code> is the number of elements, <code>size</code> is the byte size of each element (<code>sizeof</code>), and <code>cmp</code> is a comparator function. The comparator receives two <code>const void*</code> pointers, casts them to the actual type, and returns negative/zero/positive.",
                        "<code>bsearch(key, base, n, size, cmp)</code>: Binary searches a sorted array for <code>key</code>. Returns a <code>void*</code> to the found element, or <code>NULL</code> if not found. The array MUST be sorted in the same order as your comparator defines — searching an unsorted array is undefined behavior.",
                        "<strong>The comparator contract</strong>: Must return negative if first < second, 0 if equal, positive if first > second. Returning the wrong sign reverses the sort order. A common trick for integers: <code>return *(int*)a - *(int*)b</code> — but watch out for overflow if the values can be very large or very negative."
                    ],
                    code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Comparator for integers: ascending order
int compareInts(const void *a, const void *b) {
    return (*(int*)a - *(int*)b);
    // Negative if a < b, 0 if equal, positive if a > b
}

// Comparator for strings
int compareStrings(const void *a, const void *b) {
    return strcmp(*(char**)a, *(char**)b);
}

int main() {
    // Sort integers
    int nums[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(nums) / sizeof(nums[0]);
    
    qsort(nums, n, sizeof(int), compareInts);
    
    printf("Sorted: ");
    for (int i = 0; i < n; i++) printf("%d ", nums[i]);
    printf("\\n");
    
    // Binary search (array must be sorted first!)
    int target = 25;
    int *found = bsearch(&target, nums, n, sizeof(int), compareInts);
    
    if (found) {
        printf("Found %d at index %ld\\n", target, found - nums);
    } else {
        printf("%d not found\\n", target);
    }
    
    // Sort strings
    char *words[] = {"banana", "apple", "cherry", "date"};
    int wn = 4;
    qsort(words, wn, sizeof(char*), compareStrings);
    
    printf("Words: ");
    for (int i = 0; i < wn; i++) printf("%s ", words[i]);
    printf("\\n");
    
    return 0;
}`,
                    output: "Sorted: 11 12 22 25 34 64 90 \nFound 25 at index 3\nWords: apple banana cherry date "
                },
                {
                    title: "String-to-Number Conversions (stdlib.h)",
                    content: "Reading numbers from command-line arguments or text files means dealing with strings that need to become actual numeric types. <code>atoi</code> is the simple version; <code>strtol</code> and friends are the correct version for any real code.",
                    points: [
                        "<code>atoi(str)</code>: Converts a string to <code>int</code>. Fast and simple, but has no error detection — if the string isn't a valid number, it returns 0, which is indistinguishable from an actual 0. Avoid in any code that needs to validate input.",
                        "<code>strtol(str, endptr, base)</code>: Converts a string to <code>long</code> with full error detection. <code>endptr</code> is set to point to the first character that wasn't part of the number — if it points to the start of the string, no conversion happened. <code>base</code> is the numeric base (10 for decimal, 16 for hex, 0 to auto-detect from prefix). Check <code>errno</code> for overflow.",
                        "<code>strtod(str, endptr)</code>: Same as <code>strtol</code> but converts to <code>double</code>. Use this instead of <code>atof</code> for the same error-detection reasons.",
                        "<code>sprintf(buf, fmt, ...)</code> / <code>snprintf</code>: Convert numbers back to strings. <code>snprintf</code> is the safe version — it takes a max size and never overflows the buffer. Always use <code>snprintf</code> over <code>sprintf</code>."
                    ],
                    code: `#include <stdio.h>
#include <stdlib.h>
#include <errno.h>

int main() {
    // atoi: simple but blind to errors
    printf("atoi(\\"42\\")    = %d\\n", atoi("42"));
    printf("atoi(\\"abc\\")   = %d\\n", atoi("abc"));   // 0, but was it an error?
    printf("atoi(\\"3x9\\")   = %d\\n", atoi("3x9"));   // 3, silently stops at 'x'
    
    // strtol: proper error handling
    char *endptr;
    errno = 0;
    
    long val = strtol("12345", &endptr, 10);
    if (endptr == "12345" || *endptr != '\\0') {
        printf("Conversion failed\\n");
    } else {
        printf("strtol: %ld\\n", val);
    }
    
    // Detect non-numeric input
    char *input = "42abc";
    val = strtol(input, &endptr, 10);
    printf("strtol(\\"42abc\\"): val=%ld, stopped at '%c'\\n", val, *endptr);
    
    // Number to string with snprintf
    char buf[32];
    int n = snprintf(buf, sizeof(buf), "Value: %d", 9999);
    printf("snprintf produced: \\"%s\\" (%d chars)\\n", buf, n);
    
    return 0;
}`,
                    output: "atoi(\"42\")    = 42\natoi(\"abc\")   = 0\natoi(\"3x9\")   = 3\nstrtol: 12345\nstrtol(\"42abc\"): val=42, stopped at 'a'\nsnprintf produced: \"Value: 9999\" (12 chars)",
                    tip: "The rule of thumb: use <code>strtol</code>/<code>strtod</code> for any input you didn't generate yourself. If you're parsing numbers from user input, a file, or a network packet, you need to know when conversion fails. <code>atoi</code> is fine for quick throwaway code where the input is guaranteed correct — like converting a hardcoded constant."
                },
                {
                    title: "Math Functions (math.h)",
                    content: "The <code>&lt;math.h&gt;</code> header provides the standard mathematical functions. On most systems you need to link the math library explicitly with <code>-lm</code> at compile time (<code>gcc program.c -lm</code>). All functions operate on <code>double</code> by default; <code>float</code> versions have an <code>f</code> suffix (<code>sqrtf</code>, <code>fabsf</code>).",
                    points: [
                        "<code>sqrt(x)</code>: Square root. <code>pow(x, y)</code>: x raised to the power y — slower than manual multiplication for small integer exponents; prefer <code>x * x</code> over <code>pow(x, 2)</code>.",
                        "<code>fabs(x)</code>: Absolute value for doubles. Do NOT use the integer <code>abs()</code> from <code>&lt;stdlib.h&gt;</code> on floating-point numbers — it silently truncates to int first.",
                        "<code>floor(x)</code>: Rounds down to the nearest integer (toward negative infinity). <code>ceil(x)</code>: Rounds up. <code>round(x)</code>: Rounds to nearest, ties away from zero.",
                        "<code>sin(x)</code>, <code>cos(x)</code>, <code>tan(x)</code>: Trigonometric functions. Arguments are in radians, not degrees. To convert: <code>radians = degrees * M_PI / 180.0</code>. <code>M_PI</code> is defined in <code>&lt;math.h&gt;</code> on most platforms (it's a POSIX extension, not strict ISO C).",
                        "<code>log(x)</code>: Natural logarithm (base e). <code>log2(x)</code>: Base-2 log. <code>log10(x)</code>: Base-10 log. <code>exp(x)</code>: e raised to x."
                    ],
                    code: `#include <stdio.h>
#include <math.h>
// Compile with: gcc program.c -lm

int main() {
    printf("sqrt(16)      = %.1f\\n", sqrt(16.0));       // 4.0
    printf("pow(2, 10)    = %.0f\\n", pow(2, 10));       // 1024
    printf("fabs(-3.14)   = %.2f\\n", fabs(-3.14));      // 3.14
    
    printf("floor(3.7)    = %.1f\\n", floor(3.7));       // 3.0
    printf("ceil(3.2)     = %.1f\\n", ceil(3.2));        // 4.0
    printf("round(3.5)    = %.1f\\n", round(3.5));       // 4.0
    printf("round(3.4)    = %.1f\\n", round(3.4));       // 3.0
    
    // Trig: convert 45 degrees to radians
    double angle = 45.0 * M_PI / 180.0;
    printf("sin(45 deg)   = %.4f\\n", sin(angle));       // 0.7071
    printf("cos(45 deg)   = %.4f\\n", cos(angle));       // 0.7071
    
    printf("log(M_E)      = %.1f\\n", log(M_E));         // 1.0 (ln(e) = 1)
    printf("log2(1024)    = %.1f\\n", log2(1024));       // 10.0
    printf("log10(1000)   = %.1f\\n", log10(1000));      // 3.0
    
    return 0;
}`,
                    output: "sqrt(16)      = 4.0\npow(2, 10)    = 1024\nfabs(-3.14)   = 3.14\nfloor(3.7)    = 3.0\nceil(3.2)     = 4.0\nround(3.5)    = 4.0\nround(3.4)    = 3.0\nsin(45 deg)   = 0.7071\ncos(45 deg)   = 0.7071\nlog(M_E)      = 1.0\nlog2(1024)    = 10.0\nlog10(1000)   = 3.0",
                    warning: "Floating-point math is never exact. <code>0.1 + 0.2</code> in double precision is not exactly <code>0.3</code> — it's <code>0.30000000000000004</code>. Never compare floating-point results with <code>==</code>. Instead, check if the absolute difference is smaller than an acceptable tolerance: <code>if (fabs(a - b) < 1e-9)</code>. This also means <code>sqrt(x) * sqrt(x) == x</code> may be false for many values of x."
                }
            ]
        },
        {
            id: "variadic-functions",
            title: "Variadic Functions",
            explanation: "You've called <code>printf</code> with one argument, two arguments, ten arguments — it always works. That's because <code>printf</code> is a <strong>variadic function</strong>: a function that accepts a variable number of arguments. The mechanism that makes this possible is exposed through <code>&lt;stdarg.h&gt;</code>, and you can write your own variadic functions using it. Understanding this unlocks a whole class of utility functions: logging, formatting, dispatchers.",
            sections: [
                {
                    title: "The Ellipsis and va_list",
                    content: "A variadic function is declared with a normal fixed parameter list followed by <code>...</code> (an ellipsis). At least one fixed parameter is required — it's usually the format string or a count that tells the function how many extra arguments to expect. Inside the function, you use four macros from <code>&lt;stdarg.h&gt;</code> to access the variable arguments.",
                    points: [
                        "<code>va_list ap</code>: Declare a variable of type <code>va_list</code> to hold the state of the argument traversal.",
                        "<code>va_start(ap, last_fixed)</code>: Initialize the <code>va_list</code>. Pass the name of the last fixed parameter — the macro uses it to find where the variable arguments start. Call this before the first <code>va_arg</code>.",
                        "<code>va_arg(ap, type)</code>: Retrieve the next argument. You must specify the type you expect — the function has no type information about its extra arguments at runtime. Getting the type wrong is undefined behavior.",
                        "<code>va_end(ap)</code>: Clean up the <code>va_list</code> when you're done. Always call this before returning from the function.",
                        "<code>va_copy(dest, src)</code>: Copy a <code>va_list</code> so you can traverse the arguments twice without restarting."
                    ],
                    code: `#include <stdio.h>
#include <stdarg.h>

// Sum an arbitrary number of ints.
// 'count' tells us how many to expect.
int sumInts(int count, ...) {
    va_list ap;
    va_start(ap, count); // Initialize after 'count'
    
    int total = 0;
    for (int i = 0; i < count; i++) {
        total += va_arg(ap, int); // Fetch next int
    }
    
    va_end(ap);
    return total;
}

int main() {
    printf("sum(1,2,3):          %d\\n", sumInts(3, 1, 2, 3));
    printf("sum(10,20,30,40,50): %d\\n", sumInts(5, 10, 20, 30, 40, 50));
    return 0;
}`,
                    output: "sum(1,2,3):          6\nsum(10,20,30,40,50): 150"
                },
                {
                    title: "A Practical Example: Custom Logger",
                    content: "The most common real-world use of variadic functions is building wrappers around <code>printf</code>-family functions. The <code>vprintf</code>, <code>vfprintf</code>, and <code>vsprintf</code> variants accept a <code>va_list</code> instead of <code>...</code>, so you can forward your variable arguments to them without re-implementing formatting.",
                    code: `#include <stdio.h>
#include <stdarg.h>

typedef enum { LOG_INFO, LOG_WARN, LOG_ERROR } LogLevel;

void logMessage(LogLevel level, const char *fmt, ...) {
    const char *prefix;
    switch (level) {
        case LOG_INFO:  prefix = "INFO";  break;
        case LOG_WARN:  prefix = "WARN";  break;
        case LOG_ERROR: prefix = "ERROR"; break;
        default:        prefix = "???";
    }
    
    printf("[%s] ", prefix);
    
    va_list ap;
    va_start(ap, fmt);
    vprintf(fmt, ap); // Forward to vprintf -- no reformatting needed
    va_end(ap);
    
    printf("\\n");
}

int main() {
    logMessage(LOG_INFO,  "Server started on port %d", 8080);
    logMessage(LOG_WARN,  "Memory usage at %d%%", 85);
    logMessage(LOG_ERROR, "Failed to open file: %s", "config.txt");
    return 0;
}`,
                    output: "[INFO] Server started on port 8080\n[WARN] Memory usage at 85%\n[ERROR] Failed to open file: config.txt",
                    tip: "The <code>v</code>-prefixed functions (<code>vprintf</code>, <code>vfprintf</code>, <code>vsprintf</code>, <code>vsnprintf</code>) exist specifically to enable this pattern. Whenever you write a variadic function that ultimately wants to produce formatted output, use <code>vprintf</code> and friends — don't try to process the format string yourself."
                },
                {
                    title: "The Sentinel Pattern",
                    content: "An alternative to a count parameter is a sentinel value — a special argument value that signals 'no more arguments'. A common example: a function that takes a variable number of strings and uses NULL as the terminator.",
                    code: `#include <stdio.h>
#include <stdarg.h>
#include <string.h>

// Concatenate strings. Call with a NULL sentinel at the end.
void printAll(const char *first, ...) {
    va_list ap;
    va_start(ap, first);
    
    for (const char *s = first; s != NULL; s = va_arg(ap, const char*)) {
        printf("%s", s);
    }
    printf("\\n");
    
    va_end(ap);
}

int main() {
    printAll("Hello", ", ", "World", "!", NULL);
    printAll("One", " two", " three", NULL);
    return 0;
}`,
                    output: "Hello, World!\nOne two three",
                    warning: "There is no way for a variadic function to know how many arguments were passed, or what their types are, without external information. The function is completely dependent on the caller providing accurate information (via the format string, or a count, or a sentinel). If the caller lies or makes a mistake — passing the wrong number, the wrong type, or forgetting the sentinel — the behavior is undefined. This is why printf format string mismatches are real bugs."
                }
            ]
        },
        {
            id: "string-deep",
            title: "Deeper String Functions",
            explanation: "The curriculum covered the basics of <code>&lt;string.h&gt;</code> — <code>strlen</code>, <code>strcpy</code>, <code>strcat</code>, <code>strcmp</code>. But the header contains many more functions for searching, splitting, and duplicating strings. These come up constantly in text processing and input parsing, and not knowing them leads to reimplementing them badly from scratch.",
            sections: [
                {
                    title: "Searching Strings",
                    content: "The search functions return pointers into the original string rather than indices. This means you can use the returned pointer directly for further operations — print from there, copy from there, or use pointer arithmetic to compute the position.",
                    points: [
                        "<code>strchr(str, c)</code>: Find the first occurrence of character <code>c</code> in <code>str</code>. Returns a pointer to that character, or NULL if not found.",
                        "<code>strrchr(str, c)</code>: Find the <em>last</em> occurrence of character <code>c</code>. Useful for finding the file extension or directory separator in a path.",
                        "<code>strstr(haystack, needle)</code>: Find the first occurrence of the substring <code>needle</code> in <code>haystack</code>. Returns a pointer to the start of the match, or NULL. Case-sensitive."
                    ],
                    code: `#include <stdio.h>
#include <string.h>

int main() {
    const char *path = "/home/user/documents/report.pdf";
    
    // Find last '/' to get filename
    const char *filename = strrchr(path, '/');
    if (filename) filename++; // Skip the '/' itself
    printf("Filename: %s\\n", filename); // report.pdf
    
    // Find '.' to get extension
    const char *ext = strrchr(filename, '.');
    if (ext) ext++; // Skip the '.'
    printf("Extension: %s\\n", ext); // pdf
    
    // Search for substring
    const char *haystack = "The quick brown fox jumps";
    const char *found = strstr(haystack, "brown");
    if (found) {
        printf("Found 'brown' at offset %td\\n", found - haystack); // 10
    }
    
    // strchr: find first '/'
    const char *slash = strchr(path, '/');
    printf("First slash at offset %td\\n", slash - path); // 0
    
    return 0;
}`,
                    output: "Filename: report.pdf\nExtension: pdf\nFound 'brown' at offset 10\nFirst slash at offset 0"
                },
                {
                    title: "Splitting Strings: strtok",
                    content: "<code>strtok</code> splits a string into tokens separated by delimiter characters. The first call passes the string; subsequent calls for the same string pass NULL. It works by replacing each delimiter it finds with a null terminator and returning a pointer to the start of the current token. This means it modifies the original string in place — never use it on a string literal.",
                    points: [
                        "<strong>First call</strong>: <code>strtok(str, delimiters)</code> — pass the string to tokenize.",
                        "<strong>Subsequent calls</strong>: <code>strtok(NULL, delimiters)</code> — pass NULL to continue where you left off.",
                        "<strong>Returns NULL when done</strong>: When no more tokens exist, strtok returns NULL.",
                        "<strong>Not reentrant</strong>: <code>strtok</code> uses static internal state, so you can't tokenize two strings simultaneously. For that, use the safer <code>strtok_r</code> (POSIX) or <code>strtok_s</code> (C11)."
                    ],
                    code: `#include <stdio.h>
#include <string.h>

int main() {
    // strtok MODIFIES the string -- copy it first if you need the original
    char csv[] = "Alice,30,Engineer,New York";
    
    printf("Fields:\\n");
    char *token = strtok(csv, ","); // First call: pass the string
    while (token != NULL) {
        printf("  '%s'\\n", token);
        token = strtok(NULL, ","); // Subsequent calls: pass NULL
    }
    
    // Tokenizing with multiple delimiter characters
    char sentence[] = "one  two\\tthree\\nfour";
    printf("\\nWords (splitting on space/tab/newline):\\n");
    token = strtok(sentence, " \\t\\n"); // Any of these chars is a delimiter
    while (token != NULL) {
        printf("  '%s'\\n", token);
        token = strtok(NULL, " \\t\\n");
    }
    
    return 0;
}`,
                    output: "Fields:\n  'Alice'\n  '30'\n  'Engineer'\n  'New York'\n\nWords (splitting on space/tab/newline):\n  'one'\n  'two'\n  'three'\n  'four'"
                },
                {
                    title: "Duplicating Strings: strdup",
                    content: "<code>strdup</code> allocates a new block of heap memory, copies the string into it, and returns the pointer. It's the equivalent of <code>malloc(strlen(s) + 1)</code> followed by <code>strcpy</code>, but in one line. Since it allocates heap memory, you're responsible for calling <code>free</code> on the returned pointer when you're done with it.",
                    points: [
                        "<code>strdup(s)</code>: Duplicate a full string. Returns a heap-allocated copy.",
                        "<code>strndup(s, n)</code>: Duplicate at most <code>n</code> characters of <code>s</code>. A null terminator is always added. Useful for safely copying a substring.",
                        "<strong>Why use it?</strong>: When a function receives a string pointer, it only has a temporary view — the caller may free or modify it. Calling <code>strdup</code> gives the function its own permanent copy it fully owns."
                    ],
                    code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Function that takes ownership: needs its own copy
char *makeTitle(const char *str) {
    char *copy = strdup(str); // Heap-allocate a copy
    if (!copy) return NULL;
    
    // Capitalize first letter
    if (copy[0] >= 'a' && copy[0] <= 'z') {
        copy[0] -= 32;
    }
    return copy; // Caller is responsible for free()
}

int main() {
    const char *original = "hello, world";
    
    char *titled = makeTitle(original);
    printf("Original: %s\\n", original); // Unchanged
    printf("Titled:   %s\\n", titled);   // "Hello, world"
    free(titled); // We own it, we free it
    
    // strndup: copy only first 5 chars
    char *partial = strndup("hello world", 5);
    printf("Partial:  %s\\n", partial); // "hello"
    free(partial);
    
    return 0;
}`,
                    output: "Original: hello, world\nTitled:   Hello, world\nPartial:  hello"
                }
            ]
        },
        {
            id: "time",
            title: "Date and Time with <time.h>",
            explanation: "Programs frequently need to measure elapsed time, timestamp events, display the current date, or calculate time differences. <code>&lt;time.h&gt;</code> provides the core types and functions for all of these. The key is understanding the three representations C uses internally and how to convert between them.",
            sections: [
                {
                    title: "The Three Time Types",
                    content: "C represents time in three ways, each useful in different contexts.",
                    points: [
                        "<code>time_t</code>: A single number — seconds elapsed since January 1, 1970, 00:00:00 UTC (the Unix epoch). Platform-dependent size but usually 64 bits now. Good for timestamps, durations, and comparison.",
                        "<code>struct tm</code>: A human-readable breakdown — separate fields for year, month, day, hour, minute, second, day of week, etc. Good for formatting dates and doing calendar arithmetic.",
                        "<code>clock_t</code>: CPU clock ticks consumed by the current process. Used for measuring execution time of code sections. Divide by <code>CLOCKS_PER_SEC</code> to get seconds."
                    ],
                    code: `#include <stdio.h>
#include <time.h>

int main() {
    // time() returns current Unix timestamp
    time_t now = time(NULL);
    printf("Unix timestamp: %lld\\n", (long long)now);
    
    // Convert to local time (struct tm)
    struct tm *local = localtime(&now);
    printf("Year:  %d\\n", local->tm_year + 1900); // tm_year is years since 1900
    printf("Month: %d\\n", local->tm_mon + 1);     // tm_mon is 0-indexed
    printf("Day:   %d\\n", local->tm_mday);
    printf("Hour:  %d\\n", local->tm_hour);
    printf("Min:   %d\\n", local->tm_min);
    
    // Convert to UTC time
    struct tm *utc = gmtime(&now);
    printf("UTC hour: %d\\n", utc->tm_hour);
    
    return 0;
}`,
                    output: "Unix timestamp: 1735689600\nYear:  2025\nMonth: 1\nDay:   1\nHour:  12\nMin:   0\nUTC hour: 7"
                },
                {
                    title: "Formatting Dates: strftime",
                    content: "<code>strftime</code> formats a <code>struct tm</code> into a string using format codes similar to <code>printf</code>. It writes at most <code>n-1</code> characters into the buffer and always null-terminates.",
                    code: `#include <stdio.h>
#include <time.h>

int main() {
    time_t now = time(NULL);
    struct tm *t = localtime(&now);
    
    char buf[100];
    
    // Format: "Wednesday, January 01, 2025"
    strftime(buf, sizeof(buf), "%A, %B %d, %Y", t);
    printf("%s\\n", buf);
    
    // Format: "2025-01-01 12:00:00"
    strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", t);
    printf("%s\\n", buf);
    
    // Format: "12:00 PM"
    strftime(buf, sizeof(buf), "%I:%M %p", t);
    printf("%s\\n", buf);
    
    return 0;
}`,
                    output: "Wednesday, January 01, 2025\n2025-01-01 12:00:00\n12:00 PM",
                    tip: "Common format codes: <code>%Y</code> 4-digit year, <code>%m</code> month (01–12), <code>%d</code> day (01–31), <code>%H</code> hour 24h (00–23), <code>%I</code> hour 12h (01–12), <code>%M</code> minute, <code>%S</code> second, <code>%A</code> full weekday name, <code>%B</code> full month name, <code>%p</code> AM/PM."
                },
                {
                    title: "Measuring Elapsed Time",
                    content: "Two techniques for timing: <code>difftime</code> gives the difference between two <code>time_t</code> values in seconds (integer granularity). <code>clock</code> gives CPU time consumed, with sub-second precision when the CPU clock is fast enough.",
                    code: `#include <stdio.h>
#include <time.h>
#include <math.h>

int main() {
    // clock(): measure CPU time consumed
    clock_t start = clock();
    
    // Do some work
    volatile double result = 0;
    for (int i = 0; i < 10000000; i++) {
        result += sqrt((double)i);
    }
    
    clock_t end = clock();
    double elapsed = (double)(end - start) / CLOCKS_PER_SEC;
    printf("CPU time: %.3f seconds\\n", elapsed);
    printf("result: %.0f\\n", result); // use result to prevent optimization
    
    // difftime(): difference between two time_t values
    time_t t1 = time(NULL);
    // ... some work that takes calendar time ...
    time_t t2 = time(NULL);
    printf("Wall time: %.0f seconds\\n", difftime(t2, t1));
    
    return 0;
}`,
                    output: "CPU time: 0.087 seconds\nresult: 21081851083\nWall time: 0 seconds",
                    tip: "<code>clock()</code> measures CPU time, not wall-clock time. If your program sleeps, waits for I/O, or shares a CPU with other processes, the CPU time will be less than the wall-clock time. For wall-clock timing, use <code>time()</code> or the higher-resolution <code>timespec_get()</code> from C11."
                }
            ]
        },
        {
            id: "signal-handling",
            title: "Signal Handling",
            explanation: "Signals are asynchronous notifications sent to a process by the OS, by the hardware, or by another process. Pressing Ctrl+C sends SIGINT to the foreground process. Dividing by zero generates SIGFPE. Dereferencing a NULL pointer generates SIGSEGV. By default, most signals kill the process. You can install a handler function to intercept signals and respond to them — for example, cleaning up resources before exit when the user presses Ctrl+C.",
            sections: [
                {
                    title: "The signal() Function",
                    content: "The <code>signal()</code> function from <code>&lt;signal.h&gt;</code> installs a handler for a given signal. The handler is a function that takes the signal number as an argument. Two special values can be passed instead of a function: <code>SIG_IGN</code> to ignore the signal, and <code>SIG_DFL</code> to restore the default behavior.",
                    points: [
                        "<code>SIGINT</code>: Interrupt — sent by Ctrl+C. The standard 'user wants to stop this'.",
                        "<code>SIGTERM</code>: Termination request — sent by <code>kill</code> command. The polite way to ask a process to exit.",
                        "<code>SIGFPE</code>: Floating point exception — arithmetic errors like integer division by zero.",
                        "<code>SIGSEGV</code>: Segmentation violation — invalid memory access (NULL dereference, buffer overflow, etc.).",
                        "<code>SIGALRM</code>: Alarm clock — sent after a timeout set with <code>alarm()</code>.",
                        "<code>SIGABRT</code>: Abort — sent by <code>abort()</code>."
                    ],
                    code: `#include <stdio.h>
#include <signal.h>
#include <stdlib.h>

// Signal handler: runs asynchronously when signal arrives
void handleSigint(int sig) {
    printf("\\nCaught signal %d (SIGINT)\\n", sig);
    printf("Cleaning up and exiting gracefully...\\n");
    exit(0); // or set a flag and let main() exit naturally
}

int main() {
    // Install our handler for Ctrl+C
    signal(SIGINT, handleSigint);
    
    printf("Running. Press Ctrl+C to stop.\\n");
    
    int i = 0;
    while (1) {
        printf("Working... %d\\r", i++);
        fflush(stdout);
        // In real code: sleep(1) or do actual work here
        if (i > 5) break; // Exit the demo loop
    }
    
    printf("\\nDone normally.\\n");
    return 0;
}`,
                    output: "Running. Press Ctrl+C to stop.\nWorking... 5\nDone normally."
                },
                {
                    title: "What You Can Safely Do in a Signal Handler",
                    content: "Signal handlers are called asynchronously — they can interrupt any point in your program, including the middle of a <code>malloc</code> call or a <code>printf</code>. This means most library functions are not safe to call from a signal handler, because they may use global state that's currently in an inconsistent state.",
                    points: [
                        "<strong>Safe</strong>: Setting a global <code>volatile sig_atomic_t</code> flag variable and returning. Let the main loop check the flag and react.",
                        "<strong>Unsafe</strong>: Calling <code>printf</code>, <code>malloc</code>, <code>free</code>, or most other library functions from inside the handler.",
                        "<strong>volatile sig_atomic_t</strong>: The correct type for a flag shared between the main program and a signal handler. <code>sig_atomic_t</code> is guaranteed to be read and written atomically (without being interrupted mid-operation). <code>volatile</code> prevents the compiler from caching its value."
                    ],
                    code: `#include <stdio.h>
#include <signal.h>
#include <stdlib.h>

// CORRECT pattern: set a flag, let main() react
volatile sig_atomic_t running = 1;

void handleSigint(int sig) {
    (void)sig;    // Suppress unused parameter warning
    running = 0;  // Just set the flag -- nothing else
}

int main() {
    signal(SIGINT, handleSigint);
    
    printf("Press Ctrl+C to stop.\\n");
    
    while (running) {
        // Do work...
        printf("Tick\\n");
        // sleep(1) in real code
        static int ticks = 0;
        if (++ticks >= 3) running = 0; // Demo: stop after 3 ticks
    }
    
    // Now it's safe to do cleanup (outside the handler)
    printf("Caught signal -- cleaning up.\\n");
    return 0;
}`,
                    output: "Press Ctrl+C to stop.\nTick\nTick\nTick\nCaught signal -- cleaning up.",
                    warning: "The <code>signal()</code> function is the portable but limited interface. On Unix-like systems, <code>sigaction()</code> is the recommended alternative — it gives you more control, more reliable behavior, and clearer semantics. If you're writing production Unix code, learn <code>sigaction()</code>. For Windows, the signal model is different and limited to a small set of signals. Use <code>signal()</code> for portability; use platform APIs for full control."
                }
            ]
        }
    ],

    quiz: [
        {
            question: "What does `(float)a / b` do when a and b are both int?",
            options: ["Integer division", "Forces float division", "Rounds the result", "Causes a compiler error"],
            answer: 1
        },
        {
            question: "In `int main(int argc, char *argv[])`, what is `argv[0]`?",
            options: ["The first user argument", "The program name", "The argument count", "Always NULL"],
            answer: 1
        },
        {
            question: "What does `const int *p` mean?",
            options: ["p cannot be reassigned", "The value at *p cannot be modified", "Both p and *p are const", "p must be initialized"],
            answer: 1
        },
        {
            question: "What is the key difference between memcpy and memmove?",
            options: ["memcpy is for strings only", "memmove handles overlapping regions", "memcpy zeros memory first", "memmove is always faster"],
            answer: 1
        },
        {
            question: "What does loop unrolling do?",
            options: ["Removes the loop entirely", "Reduces the number of branch instructions", "Makes the loop run backwards", "Increases loop iterations"],
            answer: 1
        },
        {
            question: "What is a race condition?",
            options: ["A performance problem in loops", "A bug caused by two threads accessing shared data without synchronization", "A memory leak in threads", "A type mismatch error"],
            answer: 1
        },
        {
            question: "Which function should you use instead of atoi for reliable error detection?",
            options: ["itoa", "strtol", "scanf", "sscanf"],
            answer: 1
        },
        {
            question: "What does `volatile` prevent the compiler from doing?",
            options: ["Writing to that variable", "Caching or reordering accesses to that variable", "Using that variable in expressions", "Allocating the variable on the stack"],
            answer: 1
        }
    ],

    practice: [
        {
            title: "Safe Number Parser",
            difficulty: "easy",
            problem: "Write a function `parseInteger(const char *str, int *result)` that converts a string to an integer using `strtol`. Return 1 on success, 0 on failure (non-numeric input or empty string). Test it with '42', 'abc', '123xyz', and ''.",
            hint: "Check both that endptr moved from the start AND that it now points to the null terminator.",
            solution: `#include <stdio.h>
#include <stdlib.h>
#include <errno.h>

int parseInteger(const char *str, int *result) {
    if (str == NULL || *str == '\\0') return 0;
    
    char *endptr;
    errno = 0;
    long val = strtol(str, &endptr, 10);
    
    // Failed if: no digits consumed, or leftover non-digit chars
    if (endptr == str || *endptr != '\\0') return 0;
    
    *result = (int)val;
    return 1;
}

int main() {
    int val;
    const char *tests[] = {"42", "abc", "123xyz", "", "-99", "0"};
    int n = sizeof(tests) / sizeof(tests[0]);
    
    for (int i = 0; i < n; i++) {
        if (parseInteger(tests[i], &val)) {
            printf("'%s' -> %d\\n", tests[i], val);
        } else {
            printf("'%s' -> INVALID\\n", tests[i]);
        }
    }
    return 0;
}`
        },
        {
            title: "Generic Array Sorter",
            difficulty: "medium",
            problem: "Use `qsort` to sort an array of `struct Student` (name and GPA) by GPA in descending order. Print the sorted list.",
            hint: "The comparator receives const void* pointers. Cast them to struct Student* and compare the gpa fields. Reverse the sign for descending order.",
            solution: `#include <stdio.h>
#include <stdlib.h>

typedef struct {
    char name[20];
    float gpa;
} Student;

int byGPADesc(const void *a, const void *b) {
    const Student *sa = (const Student*)a;
    const Student *sb = (const Student*)b;
    // Descending: if sa->gpa > sb->gpa, return negative (sa comes first)
    if (sa->gpa > sb->gpa) return -1;
    if (sa->gpa < sb->gpa) return  1;
    return 0;
}

int main() {
    Student students[] = {
        {"Alice",   3.5},
        {"Bob",     3.8},
        {"Charlie", 3.2},
        {"Diana",   3.9},
        {"Eve",     3.6}
    };
    int n = sizeof(students) / sizeof(students[0]);
    
    qsort(students, n, sizeof(Student), byGPADesc);
    
    printf("Rank  Name       GPA\\n");
    printf("----  ---------  ---\\n");
    for (int i = 0; i < n; i++) {
        printf("%2d.   %-10s %.1f\\n", i+1, students[i].name, students[i].gpa);
    }
    return 0;
}`
        },
        {
            title: "Command-Line Calculator",
            difficulty: "medium",
            problem: "Write a program that takes three command-line arguments: two numbers and an operator (+, -, *, /). Print the result. Handle division by zero and invalid operators. Example: `./calc 10 + 3` prints `13`.",
            solution: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char *argv[]) {
    if (argc != 4) {
        printf("Usage: %s <num1> <op> <num2>\\n", argv[0]);
        printf("  Operators: + - * /\\n");
        return 1;
    }
    
    double a = strtod(argv[1], NULL);
    char   op = argv[2][0];
    double b = strtod(argv[3], NULL);
    double result;
    
    switch (op) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/':
            if (b == 0.0) {
                printf("Error: division by zero\\n");
                return 1;
            }
            result = a / b;
            break;
        default:
            printf("Error: unknown operator '%c'\\n", op);
            return 1;
    }
    
    printf("%.6g %c %.6g = %.6g\\n", a, op, b, result);
    return 0;
}`
        },
        {
            title: "Cache-Friendly Matrix Sum",
            difficulty: "hard",
            problem: "Create a 512x512 int matrix filled with sequential values. Write two sum functions: one iterating row-major, one column-major. Use `clock()` to time both and print the results and timings. The row-major version should be noticeably faster.",
            solution: `#include <stdio.h>
#include <time.h>

#define N 512

int matrix[N][N];

long long rowMajorSum() {
    long long sum = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            sum += matrix[i][j];
    return sum;
}

long long colMajorSum() {
    long long sum = 0;
    for (int j = 0; j < N; j++)
        for (int i = 0; i < N; i++)
            sum += matrix[i][j];
    return sum;
}

int main() {
    // Fill matrix
    int val = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            matrix[i][j] = val++;
    
    clock_t start, end;
    long long sum;
    
    start = clock();
    sum = rowMajorSum();
    end = clock();
    printf("Row-major:    sum=%lld, time=%ldms\\n",
           sum, (end - start) * 1000 / CLOCKS_PER_SEC);
    
    start = clock();
    sum = colMajorSum();
    end = clock();
    printf("Column-major: sum=%lld, time=%ldms\\n",
           sum, (end - start) * 1000 / CLOCKS_PER_SEC);
    
    return 0;
}`
        }
    ],

    exam: [
        {
            question: "What happens when you mix a signed int (-1) and unsigned int (1) in a comparison?",
            options: ["Compiler error", "The signed value is converted to unsigned, -1 becomes a huge number", "The unsigned value is converted to signed", "Both are converted to float"],
            answer: 1
        },
        {
            question: "What is argc when you run `./program hello world`?",
            options: ["2", "3", "1", "0"],
            answer: 1
        },
        {
            question: "What does `int * const p` mean?",
            options: ["p points to a constant int", "p itself cannot be reassigned", "Both p and *p are constant", "p must be NULL"],
            answer: 1
        },
        {
            question: "What must be true before calling bsearch?",
            options: ["Array must be allocated with malloc", "Array must be sorted in the same order as the comparator", "Array must contain unique values", "Array size must be a power of 2"],
            answer: 1
        },
        {
            question: "Why is row-major array iteration faster than column-major?",
            options: ["Fewer total iterations", "Better branch prediction", "Sequential access matches CPU cache line loading", "The compiler optimizes row-major automatically"],
            answer: 2
        },
        {
            question: "What is the key limitation of atomic variables for thread synchronization?",
            options: ["They are too slow for production use", "They only solve single-variable operations, not multi-step operations", "They require special hardware support", "They only work on integers"],
            answer: 1
        },
        {
            question: "Why should you use `fabs` instead of `abs` for floating-point numbers?",
            options: ["fabs is faster", "abs truncates to int first, producing wrong results", "abs is deprecated in C11", "fabs handles negative zero correctly"],
            answer: 1
        },
        {
            question: "What does `volatile` NOT guarantee?",
            options: ["Every read goes to actual memory", "Writes are not optimized away", "Atomicity and thread safety", "The variable is not cached in a register"],
            answer: 2
        },
        {
            question: "When is memmove required instead of memcpy?",
            options: ["When copying more than 1024 bytes", "When source and destination might overlap", "When copying struct types", "When the pointer is volatile"],
            answer: 1
        },
        {
            question: "What does atoi return when given the string \"abc\"?",
            options: ["-1", "0 with no error indication", "Undefined behavior", "A compiler warning"],
            answer: 1
        }
    ]
};

window.ModuleExtra = ModuleExtra;