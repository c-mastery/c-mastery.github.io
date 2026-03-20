const ModuleExpert = {
    description: "The complete expert track: variadic functions, deep string mastery, time handling, signal handling — plus the C23/C11 frontier: type-generic programming with _Generic, auto and typeof, non-local jumps, unreachable(), threads, and restrict/inline performance.",

    lessons: [
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
                        "<code>va_start(ap, last_fixed)</code>: Initialize the <code>va_list</code>. Pass the name of the last fixed parameter — the macro uses it to find where the variable arguments start. Call this before the first <code>va_arg</code>. In C23, the second argument is optional.",
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

int main(void) {
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

int main(void) {
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

// Concatenate and print strings. Call with a NULL sentinel at the end.
void printAll(const char *first, ...) {
    va_list ap;
    va_start(ap, first);
    
    for (const char *s = first; s != NULL; s = va_arg(ap, const char*)) {
        printf("%s", s);
    }
    printf("\\n");
    
    va_end(ap);
}

int main(void) {
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

int main(void) {
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
        printf("Found 'brown' at offset %td\\n", found - haystack);
    }
    
    // strchr: find first '/'
    const char *slash = strchr(path, '/');
    printf("First slash at offset %td\\n", slash - path);
    
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

int main(void) {
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
    token = strtok(sentence, " \\t\\n");
    while (token != NULL) {
        printf("  '%s'\\n", token);
        token = strtok(NULL, " \\t\\n");
    }
    
    return 0;
}`,
                    output: "Fields:\n  'Alice'\n  '30'\n  'Engineer'\n  'New York'\n\nWords (splitting on space/tab/newline):\n  'one'\n  'two'\n  'three'\n  'four'"
                },
                {
                    title: "Span Functions and Safe String Building: strspn, strcspn, snprintf",
                    content: "Three less-known but highly practical string functions. <code>strspn</code> and <code>strcspn</code> measure how many characters at the start of a string belong (or don't belong) to a set — essential for hand-writing lexers and parsers. <code>snprintf</code> is the safe way to build strings into a buffer, always null-terminating and never overflowing.",
                    points: [
                        "<code>strspn(str, accept)</code>: Returns the length of the initial segment of <code>str</code> that consists entirely of characters in <code>accept</code>. Think of it as 'how many characters match this set'.",
                        "<code>strcspn(str, reject)</code>: Returns the length of the initial segment of <code>str</code> consisting of characters NOT in <code>reject</code>. 'How many characters before hitting one of these?'",
                        "<code>snprintf(buf, size, fmt, ...)</code>: Like <code>sprintf</code> but writes at most <code>size-1</code> characters and always null-terminates. The return value is how many characters would have been written if the buffer were large enough — use this to detect truncation."
                    ],
                    code: `#include <stdio.h>
#include <string.h>

int main(void) {
    // strspn: count leading digits
    const char *str = "12345abc";
    size_t digits = strspn(str, "0123456789");
    printf("Leading digits in '%s': %zu\\n", str, digits);  // 5

    // strcspn: find first whitespace or comma
    const char *token = "hello, world";
    size_t word_len = strcspn(token, " ,");
    printf("First word length: %zu ('%.*s')\\n", word_len, (int)word_len, token);

    // Practical: manual tokenizer using strcspn + strspn
    const char *p = "  one   two  three  ";
    const char *ws = " \\t";
    printf("\\nTokens:\\n");
    while (*p) {
        p += strspn(p, ws);           // skip whitespace
        size_t n = strcspn(p, ws);    // find end of token
        if (n) printf("  '%.*s'\\n", (int)n, p);
        p += n;
    }

    // snprintf: safe string building, detects truncation
    char buf[16];
    int written = snprintf(buf, sizeof(buf), "Hello, %s!", "World");
    printf("\\nResult: '%s'\\n", buf);
    printf("Would need: %d bytes, got: %zu\\n", written, sizeof(buf));
    if (written >= (int)sizeof(buf)) printf("WARNING: output was truncated!\\n");

    return 0;
}`,
                    output: `Leading digits in '12345abc': 5
First word length: 5 ('hello')

Tokens:
  'one'
  'two'
  'three'

Result: 'Hello, World!'
Would need: 13 bytes, got: 16`,
                    tip: "The <code>snprintf</code> truncation check (<code>if (written >= (int)sizeof(buf))</code>) is the canonical safe pattern. Many buffer overflow vulnerabilities in C code come from ignoring this return value. Always check it when the output size is not guaranteed to fit."
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

int main(void) {
    time_t now = time(NULL);
    printf("Unix timestamp: %lld\\n", (long long)now);
    
    struct tm *local = localtime(&now);
    printf("Year:  %d\\n", local->tm_year + 1900); // tm_year is years since 1900
    printf("Month: %d\\n", local->tm_mon + 1);     // tm_mon is 0-indexed
    printf("Day:   %d\\n", local->tm_mday);
    printf("Hour:  %d\\n", local->tm_hour);
    printf("Min:   %d\\n", local->tm_min);
    
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

int main(void) {
    time_t now = time(NULL);
    struct tm *t = localtime(&now);
    char buf[100];
    
    strftime(buf, sizeof(buf), "%A, %B %d, %Y", t);
    printf("%s\\n", buf);    // Wednesday, January 01, 2025
    
    strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", t);
    printf("%s\\n", buf);    // 2025-01-01 12:00:00
    
    strftime(buf, sizeof(buf), "%I:%M %p", t);
    printf("%s\\n", buf);    // 12:00 PM
    
    return 0;
}`,
                    output: "Wednesday, January 01, 2025\n2025-01-01 12:00:00\n12:00 PM",
                    tip: "Common format codes: <code>%Y</code> 4-digit year, <code>%m</code> month (01–12), <code>%d</code> day (01–31), <code>%H</code> hour 24h (00–23), <code>%I</code> hour 12h (01–12), <code>%M</code> minute, <code>%S</code> second, <code>%A</code> full weekday name, <code>%B</code> full month name, <code>%p</code> AM/PM."
                },
                {
                    title: "Measuring Elapsed Time",
                    content: "Two techniques for timing: <code>difftime</code> gives the difference between two <code>time_t</code> values in seconds. <code>clock</code> gives CPU time consumed, with sub-second precision. C11 adds <code>timespec_get</code> for nanosecond-resolution wall-clock time.",
                    code: `#include <stdio.h>
#include <time.h>
#include <math.h>

int main(void) {
    clock_t start = clock();
    
    volatile double result = 0;
    for (int i = 0; i < 10000000; i++) {
        result += sqrt((double)i);
    }
    
    clock_t end = clock();
    double cpu_elapsed = (double)(end - start) / CLOCKS_PER_SEC;
    printf("CPU time: %.3f seconds\\n", cpu_elapsed);
    printf("Result:   %.0f\\n", result);
    
    // C11: nanosecond wall-clock time
    struct timespec ts_start, ts_end;
    timespec_get(&ts_start, TIME_UTC);
    // ... work ...
    timespec_get(&ts_end, TIME_UTC);
    double wall = (ts_end.tv_sec - ts_start.tv_sec) +
                  (ts_end.tv_nsec - ts_start.tv_nsec) * 1e-9;
    printf("Wall time: %.9f seconds\\n", wall);
    
    return 0;
}`,
                    output: "CPU time: 0.087 seconds\nResult:   21081851083\nWall time: 0.000000100 seconds",
                    tip: "<code>clock()</code> measures CPU time, not wall-clock time. If your program sleeps or waits for I/O, CPU time will be less than wall time. For benchmarking code, <code>clock()</code> is usually what you want. For user-visible timing (how long did this download take?), use <code>timespec_get</code> or <code>time()</code>."
                }
            ]
        },
        {
            id: "signal-handling",
            title: "Signal Handling",
            explanation: "Signals are asynchronous notifications sent to a process by the OS, by the hardware, or by another process. Pressing Ctrl+C sends SIGINT to the foreground process. Dividing by zero generates SIGFPE. Dereferencing a NULL pointer generates SIGSEGV. By default, most signals kill the process. You can install a handler function to intercept signals and respond — for example, cleaning up resources before exit when the user presses Ctrl+C.",
            sections: [
                {
                    title: "The signal() Function",
                    content: "The <code>signal()</code> function from <code>&lt;signal.h&gt;</code> installs a handler for a given signal. The handler is a function that takes the signal number as its argument. Two special values can be passed instead of a function: <code>SIG_IGN</code> to ignore the signal, and <code>SIG_DFL</code> to restore the default behavior.",
                    points: [
                        "<code>SIGINT</code>: Interrupt — sent by Ctrl+C. The standard 'user wants to stop this'.",
                        "<code>SIGTERM</code>: Termination request — sent by the <code>kill</code> command. The polite way to ask a process to exit.",
                        "<code>SIGFPE</code>: Floating point exception — arithmetic errors like integer division by zero.",
                        "<code>SIGSEGV</code>: Segmentation violation — invalid memory access (NULL dereference, buffer overflow, etc.).",
                        "<code>SIGABRT</code>: Abort — sent by <code>abort()</code>.",
                        "<code>SIGALRM</code>: Alarm clock — sent after a timeout set with <code>alarm()</code>."
                    ],
                    code: `#include <stdio.h>
#include <signal.h>
#include <stdlib.h>

void handleSigint(int sig) {
    printf("\\nCaught signal %d (SIGINT)\\n", sig);
    printf("Cleaning up and exiting gracefully...\\n");
    exit(0);
}

int main(void) {
    signal(SIGINT, handleSigint);
    
    printf("Running. Press Ctrl+C to stop.\\n");
    
    for (int i = 0; i < 6; i++) {
        printf("Working... %d\\r", i);
        fflush(stdout);
    }
    
    printf("\\nDone normally.\\n");
    return 0;
}`,
                    output: "Running. Press Ctrl+C to stop.\nWorking... 5\nDone normally."
                },
                {
                    title: "What You Can Safely Do in a Signal Handler",
                    content: "Signal handlers are called asynchronously — they can interrupt any point in your program, including the middle of a <code>malloc</code> call or a <code>printf</code>. This means most library functions are unsafe to call from a signal handler. The correct pattern is to set a flag and let the main loop react.",
                    points: [
                        "<strong>Safe</strong>: Setting a global <code>volatile sig_atomic_t</code> flag variable and returning.",
                        "<strong>Unsafe</strong>: Calling <code>printf</code>, <code>malloc</code>, <code>free</code>, or most other library functions from inside the handler.",
                        "<strong>volatile sig_atomic_t</strong>: The correct type for a flag shared between the main program and a signal handler. <code>sig_atomic_t</code> is guaranteed to be read and written atomically. <code>volatile</code> prevents the compiler from caching its value in a register."
                    ],
                    code: `#include <stdio.h>
#include <signal.h>
#include <stdlib.h>

volatile sig_atomic_t running = 1;

void handleSigint(int sig) {
    (void)sig;
    running = 0;  // Just set the flag -- nothing else is safe here
}

int main(void) {
    signal(SIGINT, handleSigint);
    
    printf("Press Ctrl+C to stop.\\n");
    
    int ticks = 0;
    while (running) {
        printf("Tick\\n");
        if (++ticks >= 3) running = 0; // Demo: stop after 3
    }
    
    // Safe to do cleanup outside the handler
    printf("Caught signal -- cleaning up.\\n");
    return 0;
}`,
                    output: "Press Ctrl+C to stop.\nTick\nTick\nTick\nCaught signal -- cleaning up.",
                    warning: "The <code>signal()</code> function is portable but limited. On Unix-like systems, <code>sigaction()</code> is the recommended alternative — it provides more control, more reliable semantics, and the ability to block signals during handler execution. Use <code>signal()</code> for portability; use <code>sigaction()</code> for production Unix code."
                }
            ]
        },
        {
            id: "generic-selection",
            title: "Type-Generic Programming with _Generic",
            explanation: "C11 introduced <code>_Generic</code> — a compile-time construct that selects an expression based on the type of a controlling expression. It's the foundation of type-generic programming in C: the mechanism behind <code>&lt;tgmath.h&gt;</code>, and a tool for writing macros that behave correctly regardless of input type.",
            sections: [
                {
                    title: "The _Generic Expression",
                    content: "A <code>_Generic</code> expression evaluates the type of a controlling expression at compile time — not its value — and selects one branch from a list. The unselected branches are not evaluated. This is purely a compile-time dispatch mechanism.",
                    code: `#include <stdio.h>
#include <math.h>

// Type-generic absolute value — dispatches to the right function
#define myabs(X) _Generic((X),   \\
    int:          abs,           \\
    long:         labs,          \\
    long long:    llabs,         \\
    float:        fabsf,         \\
    double:       fabs,          \\
    long double:  fabsl          \\
)(X)

#define type_name(X) _Generic((X), \\
    int:    "int",                 \\
    double: "double",              \\
    float:  "float",               \\
    long:   "long",                \\
    default:"other"               \\
)

int main(void) {
    printf("myabs(-5)    = %d   (%s)\\n", myabs(-5),    type_name(-5));
    printf("myabs(-3.14) = %f (%s)\\n",  myabs(-3.14), type_name(-3.14));
    printf("myabs(-2.7f) = %f  (%s)\\n", myabs(-2.7f), type_name(-2.7f));
    return 0;
}`,
                    output: `myabs(-5)    = 5   (int)
myabs(-3.14) = 3.140000 (double)
myabs(-2.7f) = 2.700000  (float)`
                },
                {
                    title: "Selecting Function Pointers and <tgmath.h>",
                    content: "The most powerful pattern selects a function pointer and calls it immediately. This is exactly how <code>&lt;tgmath.h&gt;</code> dispatches <code>sqrt</code> to <code>sqrtf</code>, <code>sqrt</code>, or <code>sqrtl</code> based on argument type.",
                    code: `#include <stdio.h>
#include <math.h>

#define SQRT(X) _Generic((X),    \\
    float:       sqrtf,          \\
    long double: sqrtl,          \\
    default:     sqrt            \\
)((X))

static inline int   imin(int a, int b)       { return a < b ? a : b; }
static inline float fminf_g(float a, float b){ return a < b ? a : b; }
static inline double dmin(double a, double b){ return a < b ? a : b; }

#define MIN(a, b) _Generic((a)+(b), \\
    float:   fminf_g,              \\
    double:  dmin,                 \\
    default: imin                  \\
)((a), (b))

int main(void) {
    printf("SQRT(2.0f) = %f (sqrtf)\\n", SQRT(2.0f));
    printf("SQRT(2.0)  = %f (sqrt)\\n",  SQRT(2.0));
    printf("MIN(3, 5)  = %d\\n",          MIN(3, 5));
    printf("MIN(1.5,2.5) = %f\\n",        MIN(1.5, 2.5));
    return 0;
}`,
                    output: `SQRT(2.0f) = 1.414214 (sqrtf)
SQRT(2.0)  = 1.414214 (sqrt)
MIN(3, 5)  = 3
MIN(1.5,2.5) = 1.500000`,
                    tip: "Include <code>&lt;tgmath.h&gt;</code> instead of <code>&lt;math.h&gt;</code> when you want automatic type dispatch on all math functions. You write <code>sqrt</code> everywhere and the compiler picks <code>sqrtf</code>, <code>sqrt</code>, or <code>sqrtl</code> based on argument type — no more forgetting the <code>f</code> suffix."
                }
            ]
        },
        {
            id: "auto-typeof",
            title: "C23 Type Inference: auto and typeof",
            explanation: "C23 introduces two major type-inference features: <code>auto</code> for deducing variable types from their initializers, and <code>typeof</code> / <code>typeof_unqual</code> for querying the type of an expression at compile time without evaluating it. Together they make type-generic macros dramatically safer and more composable.",
            sections: [
                {
                    title: "auto: Type Deduction (C23)",
                    content: "In C23, <code>auto</code> deduces the type of a variable from its initializer. The variable gets the exact type of the initializer — no implicit conversions. Useful for complex types and generic macros.",
                    code: `#include <stdio.h>

int main(void) {
    auto x = 42;       // int
    auto y = 3.14;     // double
    auto z = 3.14f;    // float
    auto p = &x;       // int*

    printf("x=%d, y=%f, z=%f, *p=%d\\n", x, y, z, *p);

    auto factorial = 1ULL;
    for (auto i = 1; i <= 10; i++) {
        factorial *= (unsigned long long)i;
    }
    printf("10! = %llu\\n", factorial);
    return 0;
}`,
                    output: "x=42, y=3.140000, z=3.140000, *p=42\n10! = 3628800",
                    warning: "<code>auto</code> in C23 requires an initializer and cannot be used for function parameters or return types."
                },
                {
                    title: "typeof and typeof_unqual (C23)",
                    content: "<code>typeof(expr)</code> gives the compile-time type of an expression without evaluating it. <code>typeof_unqual</code> gives the same type but strips <code>const</code>/<code>volatile</code>. Invaluable in macros for declaring temporaries of the right type.",
                    code: `#include <stdio.h>

// Safe swap: evaluates each argument exactly once
#define SWAP(A, B)              \\
    do {                        \\
        typeof(A) _tmp = (A);   \\
        (A) = (B);              \\
        (B) = _tmp;             \\
    } while (0)

// Clamp — works for any comparable type
#define CLAMP(val, lo, hi)                       \\
    ({                                           \\
        typeof(val) _v  = (val);                \\
        typeof(val) _lo = (lo);                 \\
        typeof(val) _hi = (hi);                 \\
        _v < _lo ? _lo : (_v > _hi ? _hi : _v); \\
    })

int main(void) {
    int a = 5, b = 10;
    SWAP(a, b);
    printf("After SWAP: a=%d, b=%d\\n", a, b);

    double x = 3.7, y = 2.1;
    SWAP(x, y);
    printf("After SWAP: x=%f, y=%f\\n", x, y);

    printf("CLAMP(15, 0, 10) = %d\\n", CLAMP(15, 0, 10));
    printf("CLAMP(15.5, 0.0, 10.0) = %f\\n", CLAMP(15.5, 0.0, 10.0));

    // typeof_unqual: strip const
    const int ci = 100;
    typeof_unqual(ci) mutable_copy = ci;
    mutable_copy = 200;
    printf("mutable_copy = %d\\n", mutable_copy);
    return 0;
}`,
                    output: "After SWAP: a=10, b=5\nAfter SWAP: x=2.100000, y=3.700000\nCLAMP(15, 0, 10) = 10\nCLAMP(15.5, 0.0, 10.0) = 10.000000\nmutable_copy = 200"
                }
            ]
        },
        {
            id: "setjmp-longjmp",
            title: "Non-Local Jumps: setjmp and longjmp",
            explanation: "C provides a mechanism for jumping out of deeply nested function calls without the normal return path: <code>setjmp</code> saves the current execution state into a <code>jmp_buf</code>, and <code>longjmp</code> restores it from anywhere in the call stack. This is C's closest equivalent to exceptions — and it's both more limited and more dangerous.",
            sections: [
                {
                    title: "How setjmp and longjmp Work",
                    content: "Think of <code>setjmp</code> as placing a bookmark in the execution. <code>longjmp</code> teleports execution back to that bookmark — unwinding the call stack without running any cleanup code. The function that called <code>setjmp</code> must still be active on the stack.",
                    code: `#include <stdio.h>
#include <setjmp.h>

jmp_buf recovery_point;

void risky(int x) {
    if (x < 0) {
        printf("Error: negative input, jumping back\\n");
        longjmp(recovery_point, 1);
    }
    printf("Processed %d successfully\\n", x);
}

void middle(int x) {
    printf("  entering middle(%d)\\n", x);
    risky(x);
    printf("  middle completed normally\\n");
}

int main(void) {
    int result = setjmp(recovery_point);

    if (result == 0) {
        printf("Starting...\\n");
        middle(5);
        middle(-1);   // Will longjmp
        printf("Never reached\\n");
    } else {
        printf("Recovered from error (code %d)\\n", result);
    }
    printf("Continues normally\\n");
    return 0;
}`,
                    output: `Starting...
  entering middle(5)
Processed 5 successfully
  middle completed normally
  entering middle(-1)
Error: negative input, jumping back
Recovered from error (code 1)
Continues normally`
                },
                {
                    title: "Rules and the Volatile Requirement",
                    content: "The C standard imposes strict rules on <code>setjmp</code> usage. The most surprising: local variables modified between <code>setjmp</code> and <code>longjmp</code> may revert to their values at the time of <code>setjmp</code> unless declared <code>volatile</code>.",
                    points: [
                        "<strong>setjmp must appear as a standalone expression</strong> — only as the controlling expression of <code>if</code>, <code>switch</code>, or a loop. Not inside larger expressions.",
                        "<strong>The containing function must still be alive</strong> when <code>longjmp</code> is called. Jumping into a returned function is undefined behavior.",
                        "<strong>Declare volatile</strong>: Any local variable in the <code>setjmp</code> function that changes after the <code>setjmp</code> call must be <code>volatile</code> to have a defined value after the jump.",
                        "<strong>No cleanup</strong>: <code>longjmp</code> does not call any cleanup — open files stay open, allocated memory stays allocated. Plan accordingly.",
                        "<strong>Practical use</strong>: Error handling in recursive parsers and interpreters — one <code>longjmp</code> from any depth aborts the entire parse without threading error codes through every return."
                    ],
                    warning: "If you've acquired resources (malloc, fopen) between <code>setjmp</code> and <code>longjmp</code>, those resources are leaked unless you track them explicitly. This is the primary reason <code>longjmp</code> should be used sparingly and only in well-defined error-recovery patterns."
                }
            ]
        },
        {
            id: "unreachable-c23",
            title: "unreachable(), [[noreturn]], and Program Termination (C23)",
            explanation: "C23 introduces <code>unreachable()</code>, a macro that tells the compiler a code path is impossible. This is a promise — breaking it is undefined behavior — but when kept it enables dead-branch elimination, cleaner switch exhaustion, and tighter code. Paired with <code>[[noreturn]]</code> and the termination functions, it gives you precise control over how and why a program ends.",
            sections: [
                {
                    title: "unreachable() (C23)",
                    content: "<code>unreachable()</code> from <code>&lt;stddef.h&gt;</code> tells the compiler: execution will never reach this point. Common uses: after exhaustive switch statements, after validated precondition checks, and anywhere static analysis needs a hint.",
                    code: `#include <stdio.h>
#include <stddef.h>
#include <stdlib.h>

typedef enum { RED, GREEN, BLUE } Color;

const char* color_name(Color c) {
    switch (c) {
        case RED:   return "red";
        case GREEN: return "green";
        case BLUE:  return "blue";
    }
    unreachable();   // All cases handled — no return warning
}

int safe_divide(int num, int den) {
    if (den == 0) unreachable();  // Caller's precondition
    return num / den;
}

int main(void) {
    printf("%s\\n", color_name(GREEN));
    printf("%d\\n", safe_divide(10, 2));
    return 0;
}`,
                    output: "green\n5",
                    warning: "If <code>unreachable()</code> is actually reached, behavior is undefined — the compiler may have already eliminated surrounding checks. For debug builds, guard it: <code>#ifdef NDEBUG unreachable() #else abort() #endif</code>."
                },
                {
                    title: "[[noreturn]]: Annotating Functions That Never Return",
                    content: "When a function always ends execution — by calling <code>exit()</code>, <code>abort()</code>, or <code>longjmp()</code>ing away — annotate it with <code>[[noreturn]]</code>. This is not just documentation: the compiler uses it to eliminate dead code after such calls, suppress missing-return warnings, and improve analysis. The termination functions themselves (<code>exit</code>, <code>abort</code>, <code>_Exit</code>) are covered in the Advanced module — <code>[[noreturn]]</code> is what lets you write <em>wrappers</em> around them with the same semantics.",
                    code: `#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>

// [[noreturn]]: compiler knows this function never returns.
// No return statement needed after calls to it.
// Compiler will warn if this function CAN return.
[[noreturn]]
void fatal(const char *fmt, ...) {
    va_list args;
    va_start(args);
    fprintf(stderr, "FATAL: ");
    vfprintf(stderr, fmt, args);
    fprintf(stderr, "\\n");
    va_end(args);
    abort();
}

// Compiler knows control never reaches past fatal() calls,
// so it does not warn about missing return paths:
const char *classify(int code) {
    if (code == 0)   return "zero";
    if (code > 0)    return "positive";
    if (code < 0)    return "negative";
    fatal("impossible: code=%d", code);
    // No return needed — compiler trusts [[noreturn]]
}

int main(void) {
    printf("%s\\n", classify(5));
    printf("%s\\n", classify(-3));
    printf("%s\\n", classify(0));
    // fatal("something went wrong: %d", 42);  // would abort
    return 0;
}`,
                    output: "positive\nnegative\nzero",
                    tip: "The compiler will emit a warning if a <code>[[noreturn]]</code> function has a code path that could actually return — that mismatch is a bug and the warning is catching it. Pair <code>[[noreturn]]</code> with <code>unreachable()</code> for the exhaustive coverage of 'this function always ends' vs 'this point in the code is never reached'."
                }
            ]
        },
        {
            id: "threads-c11",
            title: "Threads with <threads.h> (C11)",
            explanation: "C11 standardized multithreading via <code>&lt;threads.h&gt;</code>. It provides threads (<code>thrd_t</code>), mutexes (<code>mtx_t</code>), condition variables (<code>cnd_t</code>), and thread-local storage (<code>thread_local</code>). This is a portable, minimal threading API — simpler than POSIX threads, and available wherever C11 is supported.",
            sections: [
                {
                    title: "Creating and Joining Threads",
                    content: "A thread is created with <code>thrd_create</code>, which takes a function pointer and a <code>void*</code> argument. The thread runs the function and exits when it returns. <code>thrd_join</code> waits for completion.",
                    code: `#include <stdio.h>
#include <threads.h>

typedef struct { int id; int result; } WorkItem;

int worker(void *arg) {
    WorkItem *item = (WorkItem*)arg;
    item->result = item->id * item->id;
    printf("Thread %d: %d^2 = %d\\n", item->id, item->id, item->result);
    return thrd_success;
}

int main(void) {
    thrd_t threads[4];
    WorkItem items[4];

    for (int i = 0; i < 4; i++) {
        items[i] = (WorkItem){ .id = i + 1 };
        thrd_create(&threads[i], worker, &items[i]);
    }
    for (int i = 0; i < 4; i++) {
        thrd_join(threads[i], NULL);
    }
    printf("All done.\\n");
    return 0;
}`,
                    output: "Thread 1: 1^2 = 1\nThread 2: 2^2 = 4\nThread 3: 3^2 = 9\nThread 4: 4^2 = 16\nAll done.",
                    tip: "Thread execution order is non-deterministic. The output may arrive in any order — only the main thread's 'All done.' is guaranteed last because it waits with <code>thrd_join</code>."
                },
                {
                    title: "Mutexes and Condition Variables",
                    content: "Mutexes prevent race conditions by ensuring only one thread executes a protected section at a time. Condition variables let threads sleep until a condition becomes true — far more efficient than busy-polling.",
                    code: `#include <stdio.h>
#include <threads.h>

// --- Mutex example: safe counter ---
int counter = 0;
mtx_t lock;

int increment(void *arg) {
    (void)arg;
    for (int i = 0; i < 1000; i++) {
        mtx_lock(&lock);
        counter++;          // Only one thread here at a time
        mtx_unlock(&lock);
    }
    return thrd_success;
}

int main(void) {
    mtx_init(&lock, mtx_plain);

    thrd_t t[10];
    for (int i = 0; i < 10; i++) thrd_create(&t[i], increment, NULL);
    for (int i = 0; i < 10; i++) thrd_join(t[i], NULL);

    printf("Expected: 10000\\n");
    printf("Got:      %d\\n", counter);  // Always 10000 with the mutex

    mtx_destroy(&lock);
    return 0;
}`,
                    output: "Expected: 10000\nGot:      10000"
                },
                {
                    title: "thread_local: Per-Thread Storage (C11)",
                    content: "The <code>thread_local</code> storage class gives each thread its own independent copy of a variable. Changes in one thread don't affect others.",
                    code: `#include <stdio.h>
#include <threads.h>

thread_local int tl_id = 0;   // Each thread has its own copy

int worker(void *arg) {
    tl_id = *(int*)arg;        // Sets THIS thread's copy only
    printf("Thread %d: tl_id = %d\\n", tl_id, tl_id);
    return thrd_success;
}

int main(void) {
    thrd_t t[3];
    int ids[3] = {1, 2, 3};
    for (int i = 0; i < 3; i++) thrd_create(&t[i], worker, &ids[i]);
    for (int i = 0; i < 3; i++) thrd_join(t[i], NULL);
    printf("Main thread: tl_id = %d\\n", tl_id);  // Still 0
    return 0;
}`,
                    output: "Thread 1: tl_id = 1\nThread 2: tl_id = 2\nThread 3: tl_id = 3\nMain thread: tl_id = 0"
                }
            ]
        },
        {
            id: "restrict-inline",
            title: "Performance: restrict and inline",
            explanation: "Two C features exist almost exclusively to give the compiler more information for faster code: <code>restrict</code> promises that two pointers don't alias each other, and <code>inline</code> hints that a function should be expanded at the call site rather than called through the normal function-call mechanism.",
            sections: [
                {
                    title: "restrict: Promising No Aliasing",
                    content: "When two pointers might point to the same memory (aliasing), the compiler must generate conservative code — re-reading from memory after every write. The <code>restrict</code> qualifier promises that no other pointer not derived from this one accesses the same object, enabling vectorization, loop reordering, and register caching.",
                    code: `#include <stdio.h>

// WITHOUT restrict: compiler must assume dst and src could overlap
void add_slow(double *dst, const double *src, int n) {
    for (int i = 0; i < n; i++) dst[i] += src[i];
}

// WITH restrict: compiler can vectorize, keep values in registers
void add_fast(double *restrict dst, const double *restrict src, int n) {
    for (int i = 0; i < n; i++) dst[i] += src[i];
}

int main(void) {
    double a[] = {1.0, 2.0, 3.0, 4.0};
    double b[] = {10.0, 20.0, 30.0, 40.0};
    add_fast(a, b, 4);
    for (int i = 0; i < 4; i++) printf("a[%d] = %.1f\\n", i, a[i]);
    return 0;
}`,
                    output: "a[0] = 11.0\na[1] = 22.0\na[2] = 33.0\na[3] = 44.0",
                    warning: "If you declare a pointer <code>restrict</code> and pass aliased (overlapping) memory, the behavior is undefined and the compiler will silently generate wrong results. This is why <code>memcpy</code> (declared with <code>restrict</code>) cannot be used for overlapping memory — use <code>memmove</code> for that."
                },
                {
                    title: "inline: Eliminating Call Overhead",
                    content: "A function marked <code>inline</code> hints to the compiler to expand the function body at the call site. This eliminates the overhead of pushing arguments, jumping, and returning. Use <code>static inline</code> for utility functions in headers to avoid multiple-definition linker errors.",
                    code: `#include <stdio.h>

static inline int clamp(int val, int lo, int hi) {
    if (val < lo) return lo;
    if (val > hi) return hi;
    return val;
}

static inline double lerp(double a, double b, double t) {
    return a + t * (b - a);
}

int main(void) {
    int pixels[] = {-5, 0, 128, 255, 300};
    for (int i = 0; i < 5; i++) {
        printf("clamp(%4d) = %d\\n", pixels[i], clamp(pixels[i], 0, 255));
    }
    printf("lerp(0,100,0.25) = %.1f\\n", lerp(0.0, 100.0, 0.25));
    printf("lerp(0,100,0.75) = %.1f\\n", lerp(0.0, 100.0, 0.75));
    return 0;
}`,
                    output: "clamp(  -5) = 0\nclamp(   0) = 0\nclamp( 128) = 128\nclamp( 255) = 255\nclamp( 300) = 255\nlerp(0,100,0.25) = 25.0\nlerp(0,100,0.75) = 75.0",
                    tip: "<code>inline</code> is only a hint — modern compilers often inline without it when optimization is enabled, and may ignore it for large functions. The <code>static</code> in <code>static inline</code> is what prevents linker errors when the header is included from multiple .c files."
                }
            ]
        }
    ],

    practice: [
        {
            title: "Custom Logger with vprintf",
            difficulty: "easy",
            problem: "Write a variadic <code>log_msg(level, fmt, ...)</code> function with three levels: INFO, WARN, ERROR. Each message should be prefixed with <code>[INFO]</code>, <code>[WARN]</code>, or <code>[ERROR]</code>. Use <code>vprintf</code> to forward the format arguments.",
            hint: "Use <code>va_start</code>/<code>va_end</code> around a call to <code>vprintf(fmt, ap)</code>.",
            solution: `#include <stdio.h>
#include <stdarg.h>

typedef enum { LOG_INFO, LOG_WARN, LOG_ERROR } Level;

void log_msg(Level level, const char *fmt, ...) {
    const char *prefix[] = {"INFO", "WARN", "ERROR"};
    printf("[%s] ", prefix[level]);
    va_list ap;
    va_start(ap, fmt);
    vprintf(fmt, ap);
    va_end(ap);
    printf("\\n");
}

int main(void) {
    log_msg(LOG_INFO,  "Server started on port %d", 8080);
    log_msg(LOG_WARN,  "Memory at %d%%", 85);
    log_msg(LOG_ERROR, "File not found: %s", "data.csv");
    return 0;
}`,
            explanation: "<code>vprintf</code> accepts a <code>va_list</code> instead of <code>...</code>, letting you forward variadic arguments without processing them yourself. This is the standard pattern for any wrapper around printf-family functions."
        },
        {
            title: "Type-Safe Print Macro with _Generic",
            difficulty: "medium",
            problem: "Using <code>_Generic</code>, write a macro <code>PRINT(x)</code> that selects the correct format specifier for <code>int</code>, <code>double</code>, <code>float</code>, <code>long</code>, and <code>char*</code>, and prints both the type name and the value. Example output: <code>int: 42</code>.",
            hint: "Select a format string with _Generic, then pass it and the value to printf.",
            solution: `#include <stdio.h>

#define PRINT(X) printf(_Generic((X),       \\
    int:    "int: %d\\n",                   \\
    long:   "long: %ld\\n",                 \\
    float:  "float: %f\\n",                 \\
    double: "double: %f\\n",                \\
    char*:  "char*: %s\\n"                  \\
), (X))

int main(void) {
    PRINT(42);
    PRINT(3.14);
    PRINT(2.7f);
    PRINT(100L);
    PRINT("hello");
    return 0;
}`,
            explanation: "<code>_Generic</code> selects the format string literal at compile time. X is evaluated only once — type selection and value printing are two separate steps in the macro expansion."
        },
        {
            title: "Error Handling with setjmp/longjmp",
            difficulty: "hard",
            problem: "Implement a simple expression evaluator for strings like <code>\"10 / 2\"</code> and <code>\"5 / 0\"</code>. Use <code>setjmp</code>/<code>longjmp</code> to handle division by zero by jumping to a recovery point rather than propagating error codes through every function.",
            hint: "Define ERR_DIV_ZERO = 1. Call <code>setjmp</code> in main and <code>longjmp</code> from the division function when denominator is zero.",
            solution: `#include <stdio.h>
#include <setjmp.h>
#include <stdlib.h>

jmp_buf err_jmp;
#define ERR_DIV_ZERO 1

int safe_div(int a, int b) {
    if (b == 0) longjmp(err_jmp, ERR_DIV_ZERO);
    return a / b;
}

int evaluate(const char *expr) {
    int a, b; char op;
    sscanf(expr, "%d %c %d", &a, &op, &b);
    switch (op) {
        case '/': return safe_div(a, b);
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
    }
    return 0;
}

int main(void) {
    const char *exprs[] = {"10 / 2", "5 / 0", "3 + 4", NULL};
    for (int i = 0; exprs[i]; i++) {
        int code = setjmp(err_jmp);
        if (code == 0)
            printf("%s = %d\\n", exprs[i], evaluate(exprs[i]));
        else
            printf("%s => division by zero\\n", exprs[i]);
    }
    return 0;
}`,
            explanation: "Each iteration re-calls <code>setjmp</code> to establish a fresh recovery point. When <code>longjmp</code> fires, execution resumes at that <code>setjmp</code> with the error code. The idiom <code>if (code == 0) { normal } else { recovery }</code> is the canonical pattern."
        },
        {
            title: "Thread-Safe Counter with Mutex",
            difficulty: "hard",
            problem: "Create a program that launches 5 threads, each incrementing a shared counter 10,000 times. First run it without a mutex and observe the wrong result. Then add a <code>mtx_t</code> mutex and verify the counter always reaches exactly 50,000.",
            hint: "Use <code>thrd_create</code>/<code>thrd_join</code> for threads and <code>mtx_lock</code>/<code>mtx_unlock</code> to protect the increment.",
            solution: `#include <stdio.h>
#include <threads.h>

#define N_THREADS 5
#define N_INC     10000

int counter = 0;
mtx_t lock;

int worker(void *arg) {
    (void)arg;
    for (int i = 0; i < N_INC; i++) {
        mtx_lock(&lock);
        counter++;
        mtx_unlock(&lock);
    }
    return thrd_success;
}

int main(void) {
    mtx_init(&lock, mtx_plain);
    thrd_t t[N_THREADS];
    for (int i = 0; i < N_THREADS; i++) thrd_create(&t[i], worker, NULL);
    for (int i = 0; i < N_THREADS; i++) thrd_join(t[i], NULL);
    printf("Expected: %d\\n", N_THREADS * N_INC);
    printf("Got:      %d\\n", counter);
    mtx_destroy(&lock);
    return 0;
}`,
            explanation: "Without the mutex, multiple threads read-increment-write the same memory location concurrently, each discarding the other's increment. The mutex serializes access so each increment is atomic from the program's perspective."
        },
        {
            title: "Typeof Generic SWAP and CLAMP",
            difficulty: "medium",
            problem: "Using C23 <code>typeof</code>, write two macros: <code>SWAP(a, b)</code> that swaps any two variables of the same type (evaluating each argument exactly once), and <code>CLAMP(val, lo, hi)</code> that clamps a value to a range. Test both with <code>int</code> and <code>double</code>.",
            hint: "Use <code>do { typeof(A) _tmp = (A); ... } while(0)</code> for SWAP. Use a GCC/Clang statement expression <code>({ ... })</code> for CLAMP to return a value.",
            solution: `#include <stdio.h>

#define SWAP(A, B)              \\
    do {                        \\
        typeof(A) _t = (A);     \\
        (A) = (B); (B) = _t;   \\
    } while (0)

#define CLAMP(val, lo, hi)               \\
    ({                                   \\
        typeof(val) _v = (val);          \\
        typeof(val) _l = (lo);           \\
        typeof(val) _h = (hi);           \\
        _v < _l ? _l : (_v > _h ? _h : _v); \\
    })

int main(void) {
    int a = 3, b = 7;
    SWAP(a, b);
    printf("SWAP int: a=%d b=%d\\n", a, b);

    double x = 1.5, y = 9.9;
    SWAP(x, y);
    printf("SWAP double: x=%.1f y=%.1f\\n", x, y);

    printf("CLAMP(15, 0, 10)       = %d\\n",   CLAMP(15, 0, 10));
    printf("CLAMP(5, 0, 10)        = %d\\n",   CLAMP(5,  0, 10));
    printf("CLAMP(-3, 0, 10)       = %d\\n",   CLAMP(-3, 0, 10));
    printf("CLAMP(11.5, 0.0, 10.0) = %.1f\\n", CLAMP(11.5, 0.0, 10.0));
    return 0;
}`
        }
    ],

    quiz: [
        {
            question: "In a variadic function, what does va_arg(ap, type) do?",
            options: ["Returns the count of remaining arguments", "Retrieves the next argument, interpreted as 'type'", "Advances to the next fixed parameter", "Checks whether an argument of 'type' exists"],
            answer: 1
        },
        {
            question: "Why must you call va_end(ap) before returning from a variadic function?",
            options: ["To free the va_list heap allocation", "To restore any stack state the va_list machinery may have modified", "To reset the argument count to zero", "To flush buffered output"],
            answer: 1
        },
        {
            question: "What does _Generic select on?",
            options: ["The runtime value of the controlling expression", "The compile-time type of the controlling expression", "The size of the controlling expression", "The pointer address of the controlling expression"],
            answer: 1
        },
        {
            question: "In C23, what does 'auto x = 3.14;' deduce as the type of x?",
            options: ["float", "long double", "double", "auto (a special type)"],
            answer: 2
        },
        {
            question: "After longjmp() is called, where does execution resume?",
            options: ["At the most recently called setjmp()", "At the beginning of main()", "At the setjmp() call whose jmp_buf was passed to longjmp()", "At a randomly selected setjmp() on the call stack"],
            answer: 2
        },
        {
            question: "What does unreachable() promise to the compiler?",
            options: ["That the function has no return value", "That the next statement is always executed", "That execution will never reach that point in the code", "That the surrounding loop will terminate"],
            answer: 2
        },
        {
            question: "In C11's <threads.h>, which function waits for a thread to finish?",
            options: ["thrd_sleep()", "thrd_wait()", "thrd_join()", "thrd_sync()"],
            answer: 2
        },
        {
            question: "What does the 'restrict' qualifier promise to the compiler?",
            options: ["The pointer is read-only", "The pointer will never be NULL", "No other non-derived pointer accesses the same object during the pointer's lifetime", "The pointer points to heap memory"],
            answer: 2
        },
        {
            question: "What is the key difference between typeof(x) and typeof_unqual(x) when x is 'const int'?",
            options: ["They are identical", "typeof gives 'const int'; typeof_unqual gives 'int'", "typeof_unqual evaluates x at runtime", "typeof removes pointer qualifiers"],
            answer: 1
        },
        {
            question: "What does [[noreturn]] tell the compiler?",
            options: ["The function returns void", "The function never returns to its caller", "The function is always inlined", "The function has no side effects"],
            answer: 1
        }
    ],

    exam: [
        {
            question: "What happens if you call va_arg with the wrong type?",
            options: ["A compile-time error", "A runtime exception is thrown", "Undefined behavior — the bytes are misinterpreted", "The function returns 0"],
            answer: 2
        },
        {
            question: "In a variadic function using the sentinel pattern, what signals 'no more arguments'?",
            options: ["The count reaches zero", "A special sentinel value agreed upon by the caller and callee (e.g. NULL)", "va_arg automatically returns NULL", "The va_list is exhausted and returns 0"],
            answer: 1
        },
        {
            question: "Which statement about setjmp() is FALSE?",
            options: [
                "setjmp() returns 0 when called directly",
                "setjmp() can be placed inside any arithmetic expression",
                "longjmp() must target a function still on the call stack",
                "Variables modified after setjmp() may revert unless declared volatile"
            ],
            answer: 1
        },
        {
            question: "What does thrd_create() return on success?",
            options: ["0", "thrd_success", "1", "The thread ID as a positive integer"],
            answer: 1
        },
        {
            question: "A variable declared with 'thread_local'...",
            options: [
                "Is shared between all threads in the same process",
                "Can only be written from the thread that created it",
                "Has an independent copy in each thread",
                "Is automatically mutex-protected"
            ],
            answer: 2
        },
        {
            question: "What does [[noreturn]] enable the compiler to do that it cannot without it?",
            options: [
                "Inline the function at every call site",
                "Eliminate unreachable code after calls to that function and suppress missing-return warnings in callers",
                "Allocate the function's stack frame statically",
                "Automatically generate an atexit() handler"
            ],
            answer: 1
        },
        {
            question: "strspn(\"123abc\", \"0123456789\") returns:",
            options: ["6", "3", "0", "The pointer to 'a'"],
            answer: 1
        },
        {
            question: "If snprintf(buf, 5, \"%s\", \"Hello, World!\") is called, what is the return value and buf content?",
            options: [
                "Returns 4, buf = \"Hell\"",
                "Returns 13 (full length), buf = \"Hell\" with null terminator",
                "Returns 5, buf = \"Hello\"",
                "Undefined behavior — buffer overflow"
            ],
            answer: 1
        },
        {
            question: "Violating a restrict promise (passing aliased pointers) results in...",
            options: ["A compile-time error", "A runtime exception", "Undefined behavior — potentially silently wrong results", "The aliasing is detected and handled automatically"],
            answer: 2
        },
        {
            question: "Which correctly uses _Generic to select a format string?",
            options: [
                "#define FMT(x) _Generic(x, int: \"%d\", double: \"%f\")",
                "#define FMT(x) _Generic((x), int: \"%d\", double: \"%f\")",
                "#define FMT(x) _Generic<x>(int: \"%d\", double: \"%f\")",
                "#define FMT(x) generic((x), int, \"%d\", double, \"%f\")"
            ],
            answer: 1
        }
    ]
};

window.ModuleExpert = ModuleExpert;