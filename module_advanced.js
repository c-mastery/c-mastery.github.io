const ModuleAdvanced = {
    description: "Organizing complex data with structures and unions, persisting data with file I/O, controlling the compiler with the preprocessor, and using C23's modern attributes. This module covers the tools that separate toy programs from real software: custom data types that mirror real-world entities, file handling for data that survives the program's lifetime, macros for compile-time metaprogramming, and attributes that make the compiler enforce your API contracts at the call site.",
    
    lessons: [
        {
            id: "structs",
            title: "Structures (Grouping Data)",
            explanation: "The keyword <code>struct</code> is short for <em>structure</em> — not as in 'skyscraper', but as in 'structured record': a bunch of related fields packaged under one type name. Once programs move beyond simple calculations, they deal with entities that have multiple related attributes: a student has a name, an ID, and a GPA. A network packet has source and destination addresses, a sequence number, flags, and a payload. A 3D game object has a position, velocity, rotation, health, and a mesh reference. Managing these with separate variables — <code>name1</code>, <code>age1</code>, <code>gpa1</code>, <code>name2</code>, <code>age2</code>, <code>gpa2</code> — collapses immediately when you have more than two instances. A <code>struct</code> bundles related data of different types into one named unit. This changes how you think about the problem: instead of managing 30 separate variables, you manage 10 students. You pass one <code>struct Student</code> to a function instead of three arguments. You make an array of structs to get an array of objects. Structs are the foundation of every serious data structure in C — linked lists, trees, hash tables, and every custom type that represents a real-world entity are all built on structs.",
            sections: [
                {
                    title: "Concept: The Blueprint",
                    content: "Defining a struct doesn't create any data or allocate any memory — it just tells the compiler what the layout looks like. It's a blueprint. The blueprint for an apartment describes the room layout, but the blueprint itself isn't an apartment and has no furniture. You build actual apartments (variables) from it — each is a completely independent instance with its own contents, even though they all share the same layout. The struct definition just says 'any variable of this type will have these named fields, laid out in this order, with this total size'.",
                    code: `#include <stdio.h>
#include <string.h>

struct Student {
    char name[50];
    int age;
    float gpa;
};

int main() {
    struct Student student1;
    
    strcpy(student1.name, "Alice");
    student1.age = 20;
    student1.gpa = 3.8;
    
    printf("Student Name: %s\\n", student1.name);
    printf("Student Age: %d\\n", student1.age);
    printf("Student GPA: %.2f\\n", student1.gpa);
    
    return 0;
}`,
                    output: "Student Name: Alice\nStudent Age: 20\nStudent GPA: 3.80"
                },
                {
                    title: "Designated Initializers",
                    content: "C99 introduced designated initializers — a cleaner syntax for initializing structs where you name each field explicitly. Instead of relying on order (and having to count which position corresponds to which field), you write <code>.fieldname = value</code>. This makes initialization self-documenting and immune to bugs caused by adding or reordering fields later.",
                    points: [
                        "<strong>Syntax</strong>: <code>struct Student s = {.name = \"Alice\", .age = 20, .gpa = 3.8};</code>",
                        "<strong>Order doesn't matter</strong>: With designated initializers, you can specify fields in any order. Unspecified fields are zero-initialized.",
                        "<strong>Partial initialization</strong>: You can initialize only some fields — the rest default to zero/NULL.",
                        "<strong>Works for arrays too</strong>: <code>int arr[5] = {[2] = 10, [4] = 20};</code> sets indices 2 and 4 explicitly, leaving the rest as zero."
                    ],
                    code: `#include <stdio.h>

// Plain struct — no typedef needed yet
// (typedef is introduced later in this module)
struct Student {
    char name[50];
    int age;
    float gpa;
};

int main() {
    // Old way: order-dependent, fragile
    struct Student s1 = {"Bob", 21, 3.5};
    
    // Designated initializers: clear and order-independent
    struct Student s2 = {
        .name = "Alice",
        .gpa  = 3.8,   // Order doesn't matter
        .age  = 20
    };
    
    // Partial init: unspecified fields are zero
    struct Student s3 = {.name = "Charlie"}; // age=0, gpa=0.0
    
    printf("%s: age=%d, gpa=%.1f\\n", s1.name, s1.age, s1.gpa);
    printf("%s: age=%d, gpa=%.1f\\n", s2.name, s2.age, s2.gpa);
    printf("%s: age=%d, gpa=%.1f\\n", s3.name, s3.age, s3.gpa);
    
    return 0;
}`,
                    output: "Bob: age=21, gpa=3.5\nAlice: age=20, gpa=3.8\nCharlie: age=0, gpa=0.0"
                },
                {
                    title: "The Dot Operator (.)",
                    content: "The dot operator is how you reach inside a struct variable and access a specific member. <code>student1.age</code> means exactly what it looks like: 'the age field belonging to student1'. You can read it, write to it, pass it to functions, take its address — everything you'd do with a normal variable. The members of different struct variables are completely independent: <code>student1.age</code> and <code>student2.age</code> occupy different bytes in memory and have nothing to do with each other."
                },
                {
                    title: "Copying and Comparing Structs",
                    content: "Structs behave differently from arrays when used with the assignment operator and comparison operators. Arrays cannot be directly assigned or compared — you must loop or use functions. Structs, on the other hand, can be directly assigned with <code>=</code>, which performs a complete shallow copy of all members.",
                    points: [
                        "<strong>Assignment copies</strong>: <code>s2 = s1</code> copies all fields from <code>s1</code> into <code>s2</code>. After this, they are independent — modifying <code>s2</code> does not affect <code>s1</code>. This is a <em>shallow</em> copy — if a field is a pointer, the pointer value is copied, not the data it points to.",
                        "<strong>Can be passed to and returned from functions</strong>: C copies the entire struct on function call and return. For large structs this can be slow — passing a pointer instead is common for performance.",
                        "<strong>== does NOT work on structs</strong>: You cannot compare two structs with <code>s1 == s2</code>. The compiler will reject it. To compare structs, you must compare their fields individually, or use <code>memcmp()</code> (with caution — padding bytes may differ even when fields are equal)."
                    ],
                    code: `#include <stdio.h>
#include <string.h>

struct Point {
    int x;
    int y;
};

int pointsEqual(struct Point a, struct Point b) {
    return a.x == b.x && a.y == b.y;
}

int main() {
    struct Point p1 = {.x = 3, .y = 4};
    
    // Direct assignment: full copy
    struct Point p2 = p1;
    
    printf("p1: (%d, %d)\\n", p1.x, p1.y);
    printf("p2: (%d, %d)\\n", p2.x, p2.y);
    
    p2.x = 99; // Modifying p2 does NOT affect p1
    printf("After p2.x = 99:\\n");
    printf("p1.x = %d\\n", p1.x); // Still 3
    printf("p2.x = %d\\n", p2.x); // 99
    
    // Comparison: must compare field by field
    struct Point p3 = {.x = 3, .y = 4};
    printf("p1 == p3: %d\\n", pointsEqual(p1, p3)); // 1 (true)
    // p1 == p3;  // ERROR: can't use == on structs
    
    return 0;
}`,
                    output: "p1: (3, 4)\np2: (3, 4)\nAfter p2.x = 99:\np1.x = 3\np2.x = 99\np1 == p3: 1",
                    warning: "The shallow copy behavior of struct assignment is a common source of bugs. If your struct contains a <code>char*</code> pointer (not a char array), the assignment copies the pointer — both structs now point to the same string. Modifying or freeing the string through one struct affects the other. When structs contain pointers to heap memory, you need a custom deep-copy function."
                },
                {
                    title: "Returning structs from functions (by value)",
                    content: "You already pass structs into functions by value — the compiler copies the whole thing into the callee's stack frame. You can also <em>return</em> a struct by value: the function builds a complete struct and hands a copy back to the caller through the return mechanism. That matters for small POD (plain old data) structs like points, rectangles, timestamps, and result bundles. For huge structs, copying both ways can hurt performance — then you pass and return pointers instead — but for modest sizes, return-by-value is clear and correct. The compiler may even avoid real copies (return value optimization), but you write it as if a copy happened.",
                    code: `#include <stdio.h>

struct Point {
    int x;
    int y;
};

struct Point make_point(int x, int y) {
    struct Point p;
    p.x = x;
    p.y = y;
    return p;   /* caller receives a copy of p */
}

struct Point add_points(struct Point a, struct Point b) {
    struct Point r = { a.x + b.x, a.y + b.y };
    return r;
}

int main(void) {
    struct Point origin = make_point(0, 0);
    struct Point a = make_point(3, 4);
    struct Point b = add_points(origin, a);

    printf("origin: (%d, %d)\\n", origin.x, origin.y);
    printf("a:      (%d, %d)\\n", a.x, a.y);
    printf("sum:    (%d, %d)\\n", b.x, b.y);
    return 0;
}`,
                    output: "origin: (0, 0)\na:      (3, 4)\nsum:    (3, 4)",
                    tip: "If you need to signal failure, a common pattern is a struct plus a separate status code, or wrap the payload in a struct with a <code>bool ok</code> field — C has no exceptions, so 'return an error struct' is idiomatic."
                },
                {
                    title: "Structures and Pointers",
                    content: "When you have a pointer to a struct rather than the struct itself, you can't use the dot operator directly — you'd need to dereference the pointer first and then access the member: <code>(*ptr).age</code>. The parentheses are mandatory because the dot operator has higher precedence than <code>*</code>. This is clunky enough that C provides a shorthand: the arrow operator <code>-></code>, which combines the dereference and the member access into a single clean step.",
                    code: `#include <stdio.h>
#include <string.h>

struct Student {
    char name[20];
    int age;
};

int main() {
    struct Student s1;
    struct Student *ptr = &s1;
    
    ptr->age = 20;
    strcpy(ptr->name, "Alice");
    
    printf("Age: %d\\n", s1.age);
    printf("Age via pointer: %d\\n", ptr->age);
    
    return 0;
}`,
                    output: "Age: 20\nAge via pointer: 20",
                    tip: "The rule is simple and worth memorizing: if you have the actual struct variable, use dot (<code>.</code>). If you have a pointer to a struct, use arrow (<code>-></code>). You will make this choice hundreds of times in any non-trivial C program."
                },
                {
                    title: "Self-Referential Structs (Linked Lists)",
                    content: "A struct can contain a pointer to another struct of the same type. This is how you build linked data structures — lists, trees, graphs — where each node holds data and a pointer to the next node. You can't have a struct that directly contains itself (infinite size), but a pointer to itself is fine since pointers always have the same size regardless of what they point to.",
                    code: `#include <stdio.h>
#include <stdlib.h>

// A linked list node: holds a value and a pointer to the next node
struct Node {
    int value;
    struct Node *next; // Pointer to another Node of the same type
};

// Build a linked list from an array
struct Node *createList(int *arr, int size) {
    struct Node *head = NULL;
    struct Node *tail = NULL;
    
    for (int i = 0; i < size; i++) {
        struct Node *new = (struct Node*)malloc(sizeof(struct Node));
        new->value = arr[i];
        new->next  = NULL;
        
        if (head == NULL) {
            head = new;
            tail = new;
        } else {
            tail->next = new;
            tail = new;
        }
    }
    return head;
}

// Print and free the list
void printAndFree(struct Node *head) {
    struct Node *curr = head;
    while (curr != NULL) {
        printf("%d ", curr->value);
        struct Node *next = curr->next;
        free(curr);
        curr = next;
    }
    printf("\\n");
}

int main() {
    int data[] = {10, 20, 30, 40, 50};
    struct Node *list = createList(data, 5);
    printAndFree(list);
    return 0;
}`,
                    output: "10 20 30 40 50 ",
                    tip: "Notice that inside the struct definition, we use <code>struct Node *next</code> — not <code>Node *next</code>. This is because the <code>typedef</code> alias isn't available yet when the struct body is being defined. To use <code>Node *next</code> directly, you can give the struct a tag name: <code>typedef struct Node { int value; struct Node *next; } Node;</code> — the tag (<code>struct Node</code>) is available immediately, even inside its own definition."
                },
                {
                    title: "Bit Fields: Packing Data at the Bit Level",
                    content: "A bit field is a struct member declared with a colon and a bit width. Instead of allocating a full byte (or more) for a small value that only needs a few bits, the compiler packs multiple bit fields into a single integer. This is essential in embedded programming, network protocol headers, and anywhere memory density matters more than access speed.",
                    code: `#include <stdio.h>
 
// A hardware register layout: 16 bits total
// packed into fields without wasting a byte
struct StatusRegister {
    unsigned int error    : 1;  // 1 bit:  0 or 1
    unsigned int ready    : 1;  // 1 bit:  0 or 1
    unsigned int mode     : 2;  // 2 bits: 0-3
    unsigned int priority : 4;  // 4 bits: 0-15
    unsigned int reserved : 8;  // 8 bits: padding to fill 16 bits
};
 
// A practical example: IPv4 header fields
struct IPv4Flags {
    unsigned int reserved : 1;   // always 0
    unsigned int df       : 1;   // Don't Fragment
    unsigned int mf       : 1;   // More Fragments
};
 
int main() {
    struct StatusRegister reg = {0};
    reg.error    = 1;
    reg.ready    = 1;
    reg.mode     = 2;
    reg.priority = 7;
 
    printf("error:    %u\\n", reg.error);
    printf("ready:    %u\\n", reg.ready);
    printf("mode:     %u\\n", reg.mode);
    printf("priority: %u\\n", reg.priority);
    printf("total size: %zu bytes\\n", sizeof(reg));
 
    return 0;
}`,
                    output: "error:    1\nready:    1\nmode:     2\npriority: 7\ntotal size: 4 bytes",
                    warning: "Bit field layout (order, padding, alignment) is implementation-defined — the C standard deliberately leaves these details up to the compiler. Two compilers can produce different layouts for the same bit field struct. For this reason, do NOT use bit field structs to directly map to raw hardware register bytes or network packets if you need portability — use explicit masking and shifting instead (<code>reg |= (1 << 3)</code>). Bit fields are safe for internal data packing where you control both the definition and the compiler."
                },
                {
                    title: "Struct Padding and Memory Layout",
                    content: "A struct is not just its fields packed end-to-end. The compiler inserts invisible padding bytes between fields to ensure each field starts at an address that is a multiple of its alignment requirement. An <code>int</code> (4 bytes) must start at a 4-byte-aligned address. A <code>double</code> (8 bytes) at an 8-byte-aligned address. The result: a struct's size is almost always larger than the sum of its fields, and the layout depends on field order.",
                    points: [
                        "<strong>Checking size with sizeof</strong>: Always use <code>sizeof(struct Foo)</code> rather than manually summing field sizes. The padding bytes are real and must be accounted for in <code>malloc</code>, <code>fread</code>, and <code>fwrite</code> calls.",
                        "<strong>offsetof(type, member)</strong>: From <code>&lt;stddef.h&gt;</code>, gives the byte offset of a field within a struct. Essential for protocol parsers, binary file formats, and hardware register maps.",
                        "<strong>Reorder fields to minimize padding</strong>: Declare fields from largest to smallest alignment requirement. This eliminates most padding without changing field values.",
                        "<strong>__attribute__((packed))</strong>: GCC/Clang extension that removes all padding. Results in minimum size but potentially slow unaligned accesses — on ARM, unaligned access can be a hardware fault. Use only for binary wire formats where layout is mandated externally."
                    ],
                    code: `#include <stdio.h>
#include <stddef.h>   // for offsetof

// Wasteful layout — gaps inserted by compiler
struct Wasteful {
    char   a;    // 1 byte  + 3 bytes padding
    int    b;    // 4 bytes
    char   c;    // 1 byte  + 7 bytes padding
    double d;    // 8 bytes
};               // Total: 24 bytes (not 14!)

// Efficient layout — largest fields first
struct Efficient {
    double d;    // 8 bytes (offset 0)
    int    b;    // 4 bytes (offset 8)
    char   a;    // 1 byte  (offset 12)
    char   c;    // 1 byte  (offset 13)
                 // 2 bytes padding at end for struct alignment
};               // Total: 16 bytes

int main(void) {
    printf("Wasteful:  %zu bytes\\n", sizeof(struct Wasteful));   // 24
    printf("Efficient: %zu bytes\\n", sizeof(struct Efficient));  // 16

    printf("offsetof Wasteful.b: %zu\\n", offsetof(struct Wasteful, b)); // 4
    printf("offsetof Wasteful.d: %zu\\n", offsetof(struct Wasteful, d)); // 16

    // Critical: when writing structs to binary files, padding bytes
    // contain garbage. Two structs with the same field values may have
    // different bytes in their padding — memcmp() will say they differ.
    // Always serialize field by field, never fwrite() an entire struct
    // if portability matters.
    return 0;
}`,
                    output: "Wasteful:  24 bytes\nEfficient: 16 bytes\noffsetof Wasteful.b: 4\noffsetof Wasteful.d: 16",
                    warning: "Never use <code>fwrite(&myStruct, sizeof(myStruct), 1, file)</code> for a binary format you intend to read on another machine or compiler. The padding bytes, field sizes, and byte order (endianness) may all differ. Serialize each field explicitly with known-width types from <code>&lt;stdint.h&gt;</code>."
                },
                {
                    title: "Flexible Array Members",
                    content: "C99 introduced flexible array members: the last member of a struct can be an array with no specified size (<code>type name[];</code>). The struct itself doesn't allocate space for the array — you do, by allocating extra bytes when you malloc the struct. This lets you create variable-length structs with a single allocation instead of a struct plus a separate heap allocation for the data.",
                    code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
 
// Plain struct tag — typedef for this is shown in the typedef lesson below
struct Message {
    int  length;    // How many chars of data follow
    char data[];    // Flexible array member — no size specified
                    // sizeof(struct Message) does NOT include data[]
};
 
struct Message *create_message(const char *text) {
    int len = strlen(text);
    // Allocate struct + enough extra bytes for the text + null terminator
    struct Message *msg = malloc(sizeof(struct Message) + len + 1);
    msg->length = len;
    memcpy(msg->data, text, len + 1);
    return msg;
}
 
int main() {
    struct Message *m1 = create_message("Hello");
    struct Message *m2 = create_message("A much longer message here");
 
    printf("m1: length=%d, data='%s'\\n", m1->length, m1->data);
    printf("m2: length=%d, data='%s'\\n", m2->length, m2->data);
 
    printf("sizeof(struct Message) = %zu (header only)\\n", sizeof(struct Message));
 
    free(m1);
    free(m2);
    return 0;
}`,
                    output: "m1: length=5, data='Hello'\nm2: length=26, data='A much longer message here'\nsizeof(struct Message) = 4 (header only)",
                    tip: "The key advantage over a pointer member is the single allocation. A struct with <code>char *data</code> requires two mallocs and two frees. A struct with a flexible array member requires one malloc and one free — less overhead and better cache locality since the data is contiguous with the header. This pattern is used in the Linux kernel for variable-length network packets and inode structures."
                }
            ]
        },
        {
            id: "unions-enums",
            title: "Unions and Enums",
            explanation: "Unions and enums solve two different but common problems. A <code>union</code> is a memory-efficiency tool: when you have a variable that could be one of several types but only ever one at a time, a union allocates only as much memory as the largest member and all members share that space. This is essential in protocol parsers, interpreters, and anywhere you need a container that can hold values of different types. An <code>enum</code> is a readability and safety tool: instead of scattering integer literals with implicit meanings throughout your code — 0 for red, 1 for green, 2 for blue — you give those integers descriptive names that the compiler can check. Together, a <code>union</code> wrapped in a <code>struct</code> with an <code>enum</code> tag gives you a safe, self-describing variant type — the pattern underlying every JSON parser and AST node ever written in C.",
            sections: [
                {
                    title: "Unions: Shared Space",
                    content: "A union looks like a struct — same syntax, same member declarations — but with one fundamental difference: all members share the same block of memory. A struct allocates separate space for each member. A union allocates space for only the largest member, and all members overlap in that same space. At any given moment, only the last value written is valid.",
                    points: [
                        "<strong>Size of Union</strong>: Equal to the size of its largest member, not the sum. A union with an <code>int</code> (4 bytes) and a <code>double</code> (8 bytes) is 8 bytes total — not 12.",
                        "<strong>Behavior</strong>: Writing to one member reinterprets the shared bytes for all other members. The bytes don't disappear — they're just interpreted as a different type, which produces garbage unless you know exactly what you're doing."
                    ],
                    code: `#include <stdio.h>

union Data {
    int i;
    float f;
    char c;
};

int main() {
    union Data d;
    
    d.i = 10;
    printf("Integer: %d\\n", d.i);
    
    d.f = 3.14; // This overwrites the integer bits!
    printf("Float: %.2f\\n", d.f);
    printf("Integer now: %d (Garbage!)\\n", d.i);
    
    return 0;
}`,
                    output: "Integer: 10\nFloat: 3.14\nInteger now: 1078523331 (Garbage!)"
                },
                {
                    title: "Enums: Named Numbers",
                    content: "An enumeration assigns human-readable names to a sequence of integer constants. Under the hood it's just integers — the compiler assigns 0 to the first name, 1 to the second, and so on, unless you override the values manually. <code>if (today == WED)</code> is immediately understandable. <code>if (today == 3)</code> requires looking up what 3 means.",
                    code: `#include <stdio.h>

enum Weekday { SUN, MON, TUE, WED, THU, FRI, SAT };

int main() {
    enum Weekday today = WED;
    
    printf("Day number: %d\\n", today); // WED is 3
    
    if (today == WED) {
        printf("It is Wednesday!\\n");
    }
    
    return 0;
}`,
                    output: "Day number: 3\nIt is Wednesday!"
                },
                {
                    title: "Tagged Unions: The Safe Way to Use Unions",
                    content: "A union alone is dangerous because nothing stops you from writing an <code>int</code> and reading back a <code>float</code>. The standard idiom to solve this is a tagged union (also called a discriminated union): wrap the union in a struct with an enum field that records which member is currently active. The enum is the 'tag'. Any code that reads from the union checks the tag first. This gives you a type-safe variant type in plain C.",
                    code: `#include <stdio.h>
#include <string.h>
 
// The tag: which field in the union is currently valid
// (plain enum — no typedef yet; that cleanup comes in the next lesson)
enum ValueType {
    TYPE_INT,
    TYPE_FLOAT,
    TYPE_STRING
};
 
// The tagged union: struct holds the tag + the union
struct Value {
    enum ValueType type;
    union {
        int    i;
        float  f;
        char   s[64];
    } as;
};
 
// Constructor helpers keep the tag and data in sync
struct Value make_int(int i) {
    struct Value v;
    v.type = TYPE_INT;
    v.as.i = i;
    return v;
}
struct Value make_float(float f) {
    struct Value v;
    v.type = TYPE_FLOAT;
    v.as.f = f;
    return v;
}
struct Value make_string(const char *s) {
    struct Value v;
    v.type = TYPE_STRING;
    strncpy(v.as.s, s, 63);
    v.as.s[63] = '\\0';
    return v;
}
 
// Safe printer: checks tag before accessing the union
void print_value(const struct Value *v) {
    switch (v->type) {
        case TYPE_INT:    printf("int(%d)",    v->as.i); break;
        case TYPE_FLOAT:  printf("float(%g)",  v->as.f); break;
        case TYPE_STRING: printf("str(\\"%s\\")", v->as.s); break;
    }
    printf("\\n");
}
 
int main() {
    struct Value vals[3];
    vals[0] = make_int(42);
    vals[1] = make_float(3.14f);
    vals[2] = make_string("hello");
 
    for (int i = 0; i < 3; i++) {
        print_value(&vals[i]);
    }
 
    // Safe: check the tag before accessing
    struct Value v = make_int(100);
    if (v.type == TYPE_INT) {
        printf("It's an int: %d\\n", v.as.i);
    }
 
    return 0;
}`,
                    output: "int(42)\nfloat(3.14)\nstr(\"hello\")\nIt's an int: 100",
                    tip: "This pattern is how you build heterogeneous lists in C — arrays or linked lists where each node can hold a value of any type. It is also the foundation of every parser, interpreter, and scripting language runtime written in C. Note: after reading the <code>typedef</code> lesson below, you would write <code>ValueType</code> and <code>Value</code> directly instead of <code>enum ValueType</code> and <code>struct Value</code>. The logic is identical; typedef just removes the repetitive prefix."
                }
            ]
        },
        {
            id: "typedef",
            title: "Typedef (Renaming Types)",
            explanation: "<code>typedef</code> creates an alias — a new name for an existing type. The underlying type doesn't change at all; you're just giving it a shorter or more descriptive label. It produces no code at runtime and has zero performance implications. It's purely a convenience and clarity tool.",
            sections: [
                {
                    title: "Basic Syntax",
                    content: "The syntax is <code>typedef existing_type new_name;</code>. After that declaration, <code>new_name</code> can be used anywhere the original type would be used. They are interchangeable from the compiler's perspective.",
                    code: `#include <stdio.h>

typedef unsigned char byte;
typedef char* STRING;

int main() {
    byte b = 255;
    STRING name = "John";
    
    printf("Byte: %d\\n", b);
    printf("Name: %s\\n", name);
    
    return 0;
}`,
                    output: "Byte: 255\nName: John"
                },
                {
                    title: "Typedef with Structs",
                    content: "This is by far the most common use of <code>typedef</code> in real C code. Throughout the Structures lesson above you wrote <code>struct Student s1</code>, <code>struct Point p1</code>, <code>struct Message *m</code> — the <code>struct</code> keyword is mandatory every time you name the type in plain C. With <code>typedef</code>, you give the struct a single alias and can drop the <code>struct</code> keyword entirely from that point on. The two forms are completely equivalent at the machine level.",
                    code: `#include <stdio.h>

// Without typedef — what you saw in the Structures lesson:
struct PointRaw {
    int x;
    int y;
};

// With typedef — gives the type a clean single-word alias
typedef struct {
    int x;
    int y;
} Point;

// Self-referential struct: needs both tag AND typedef
// because the alias isn't available inside its own body
typedef struct Node {
    int value;
    struct Node *next;   // Must use 'struct Node' here — alias not ready yet
} Node;

int main() {
    // Without typedef: must write 'struct' every time
    struct PointRaw raw = {.x = 1, .y = 2};
    printf("Raw:  struct PointRaw — (%d, %d)\\n", raw.x, raw.y);

    // With typedef: clean, no 'struct' keyword needed
    Point p = {.x = 10, .y = 5};
    printf("Clean: Point — (%d, %d)\\n", p.x, p.y);

    // Node is now usable without 'struct' prefix
    Node n1 = {42, NULL};
    Node n2 = {99, &n1};
    printf("List: %d -> %d\\n", n2.value, n2.next->value);

    return 0;
}`,
                    output: "Raw:  struct PointRaw — (1, 2)\nClean: Point — (10, 5)\nList: 99 -> 42",
                    tip: "The convention in nearly all real C codebases is to use <code>typedef struct { ... } TypeName;</code> for every struct — you will almost never see bare <code>struct Tag</code> declarations in production headers. The reason the Structures lesson used bare <code>struct</code> syntax was specifically so you would understand what <code>typedef</code> is eliminating. Now that you have both, always prefer the <code>typedef</code> form."
                }
            ]
        },
        {
            id: "file-io",
            title: "File Input/Output",
            explanation: "Every variable, array, and struct you've worked with so far exists in RAM — memory that evaporates the instant the program exits or the machine powers off. File I/O is how programs create data that outlasts them: configuration that persists between runs, user documents, logs that tell you what happened yesterday, binary assets for a game, database records. In C, file I/O follows a stream model: you call <code>fopen</code> to open a file and get a <code>FILE*</code> handle, you use that handle to read or write (sequentially or at random positions with seeking), and you call <code>fclose</code> when done. The standard library buffers reads and writes internally for efficiency — your writes may sit in an in-memory buffer for a while before being physically written to the disk. Calling <code>fclose</code> flushes that buffer and ensures everything makes it to storage. Forgetting <code>fclose</code> is one of the most common causes of truncated or empty output files in C programs.",
            sections: [
                {
                    title: "The File Pointer",
                    content: "In C, every open file is represented by a <code>FILE*</code> — a pointer to a struct managed by the C standard library that tracks the file's current state. The workflow is always the same three steps — and skipping the third one is one of the most common file I/O bugs.",
                    points: [
                        "1. <strong>Open</strong>: Call <code>fopen</code> to get a <code>FILE*</code>. Always check that the returned pointer is not NULL.",
                        "2. <strong>Read or Write</strong>: Use <code>fprintf</code>, <code>fgets</code>, <code>fscanf</code>, <code>fread</code>, <code>fwrite</code>, or other file functions.",
                        "3. <strong>Close</strong>: Call <code>fclose</code> when done. This flushes any buffered writes to disk. If you skip this, writes may be silently lost."
                    ]
                },
                {
                    title: "Writing to a File (w mode)",
                    content: "Mode <code>\"w\"</code> opens a file for writing. If the file doesn't exist, it's created. If it does exist, it is immediately truncated to zero bytes — all previous content is gone before you write a single character. For appending to an existing file without destroying its contents, use mode <code>\"a\"</code> instead.",
                    code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    FILE *fptr;
    
    fptr = fopen("diary.txt", "w");
    
    if (fptr == NULL) {
        perror("fopen");
        return 1;
    }
    
    fprintf(fptr, "Today I learned C.\\n");
    fprintf(fptr, "It was fun!\\n");
    
    fclose(fptr);
    
    printf("File written successfully.\\n");
    return 0;
}`,
                    output: "File written successfully.",
                    tip: "The output on screen is just the success message. The actual content went into 'diary.txt' in the same directory as your executable."
                },
                {
                    title: "Reading from a File (r mode)",
                    content: "Mode <code>\"r\"</code> opens an existing file for reading. If the file doesn't exist, <code>fopen</code> returns NULL — unlike write mode, it won't create the file for you. The standard pattern for reading line by line uses <code>fgets</code> in a loop.",
                    code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    FILE *fptr;
    char buffer[255];
    
    fptr = fopen("diary.txt", "r");
    
    if (fptr == NULL) {
        perror("fopen");
        return 1;
    }
    
    while (fgets(buffer, 255, fptr) != NULL) {
        printf("%s", buffer);
    }
    
    fclose(fptr);
    return 0;
}`,
                    output: "Reading file contents:\nToday I learned C.\nIt was fun!"
                },
                {
                    title: "Binary File I/O (fread / fwrite)",
                    content: "Text mode reads and writes human-readable characters — newlines may be translated, and special bytes may be interpreted. Binary mode treats the file as a raw sequence of bytes — no translation, no interpretation. This is what you need for reading and writing non-text data: images, audio, struct records, compiled data. Open in binary mode by appending <code>b</code> to the mode string: <code>\"rb\"</code>, <code>\"wb\"</code>, <code>\"ab\"</code>.",
                    points: [
                        "<code>fwrite(ptr, size, count, stream)</code>: Writes <code>count</code> elements of <code>size</code> bytes each from the memory at <code>ptr</code> to the file. Returns the number of elements successfully written.",
                        "<code>fread(ptr, size, count, stream)</code>: Reads <code>count</code> elements of <code>size</code> bytes each from the file into the memory at <code>ptr</code>. Returns the number of elements successfully read. A return value less than <code>count</code> means end of file or an error — check with <code>feof()</code> or <code>ferror()</code>.",
                        "<strong>Writing structs directly</strong>: <code>fwrite(&mystruct, sizeof(mystruct), 1, fptr)</code> writes the raw bytes of the struct to the file. You can read it back with <code>fread</code>. This is fast and simple, but the file format is platform-specific — padding bytes, endianness, and field sizes may differ between machines."
                    ],
                    code: `#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int id;
    float score;
    char name[20];
} Record;

int main() {
    // Write binary data
    FILE *out = fopen("records.bin", "wb");
    if (!out) { perror("fopen"); return 1; }
    
    Record records[] = {
        {1, 95.5f, "Alice"},
        {2, 87.3f, "Bob"},
        {3, 91.0f, "Charlie"}
    };
    
    int n = sizeof(records) / sizeof(records[0]);
    size_t written = fwrite(records, sizeof(Record), n, out);
    printf("Wrote %zu records\\n", written);
    fclose(out);
    
    // Read binary data back
    FILE *in = fopen("records.bin", "rb");
    if (!in) { perror("fopen"); return 1; }
    
    Record r;
    printf("\\nRecords from file:\\n");
    while (fread(&r, sizeof(Record), 1, in) == 1) {
        printf("ID:%d  Score:%.1f  Name:%s\\n", r.id, r.score, r.name);
    }
    fclose(in);
    
    return 0;
}`,
                    output: "Wrote 3 records\n\nRecords from file:\nID:1  Score:95.5  Name:Alice\nID:2  Score:87.3  Name:Bob\nID:3  Score:91.0  Name:Charlie"
                },
                {
                    title: "Endianness: The Portability Trap in Binary I/O",
                    content: "When you <code>fwrite</code> a multi-byte integer, the bytes are written in the order the CPU stores them in memory. x86 and ARM (in their default mode) are <em>little-endian</em>: the least significant byte comes first. Network protocols and many file formats use <em>big-endian</em>: the most significant byte first. A binary file written on one architecture may produce garbage when read on another.",
                    points: [
                        "<strong>Little-endian (x86, ARM default)</strong>: The integer 0x01020304 is stored in memory as bytes <code>04 03 02 01</code> — least significant byte at the lowest address.",
                        "<strong>Big-endian (network byte order)</strong>: The same integer is stored as <code>01 02 03 04</code> — most significant byte first. JPEG, PNG, and network packets use this.",
                        "<strong>Detecting endianness at runtime</strong>: Write the integer 1 and check whether the first byte is 1 (little-endian) or 0 (big-endian).",
                        "<strong>The fix: serialize field by field with known byte order</strong>: Write each field using bit shifts, not <code>fwrite(&value)</code>. This produces the same bytes on every architecture."
                    ],
                    code: `#include <stdio.h>
#include <stdint.h>

// Portable little-endian write for uint32_t — works on any CPU
void writeU32LE(FILE *f, uint32_t val) {
    uint8_t bytes[4] = {
        (uint8_t)(val),        // least significant byte first
        (uint8_t)(val >> 8),
        (uint8_t)(val >> 16),
        (uint8_t)(val >> 24),
    };
    fwrite(bytes, 1, 4, f);
}

// Portable little-endian read for uint32_t
uint32_t readU32LE(FILE *f) {
    uint8_t bytes[4];
    fread(bytes, 1, 4, f);
    return (uint32_t)bytes[0]
         | (uint32_t)bytes[1] << 8
         | (uint32_t)bytes[2] << 16
         | (uint32_t)bytes[3] << 24;
}

int main(void) {
    // Detect host endianness
    uint32_t test = 1;
    uint8_t *p = (uint8_t *)&test;
    printf("This machine is %s-endian\\n", p[0] == 1 ? "little" : "big");

    // Write a portable binary file
    FILE *f = fopen("data.bin", "wb");
    writeU32LE(f, 0xDEADBEEF);
    writeU32LE(f, 12345678);
    fclose(f);

    // Read it back correctly on any machine
    f = fopen("data.bin", "rb");
    printf("Read: 0x%08X\\n", readU32LE(f));  // Always 0xDEADBEEF
    printf("Read: %u\\n",     readU32LE(f));   // Always 12345678
    fclose(f);
    return 0;
}`,
                    output: "This machine is little-endian\nRead: 0xDEADBEEF\nRead: 12345678"
                },
                {
                    title: "Random File Access (fseek / ftell / rewind)",
                    content: "Sequential reading with <code>fgets</code> or <code>fread</code> is fine when you want to process a file from start to finish. But sometimes you need to jump to a specific position — read a record in the middle of a file, go back and re-read something. Every open file has an internal position indicator — a cursor that tracks where the next read or write will happen.",
                    points: [
                        "<code>fseek(fptr, offset, origin)</code>: Moves the cursor. Origins: <code>SEEK_SET</code> (from start), <code>SEEK_CUR</code> (from current position), <code>SEEK_END</code> (from end).",
                        "<code>ftell(fptr)</code>: Returns the current cursor position as a <code>long</code> — bytes from the start of the file.",
                        "<code>rewind(fptr)</code>: Shorthand for <code>fseek(fptr, 0, SEEK_SET)</code>. Moves the cursor back to the beginning and clears error flags."
                    ],
                    code: `#include <stdio.h>

int main() {
    FILE *f = fopen("data.txt", "w+"); // Open for read and write
    if (!f) { perror("fopen"); return 1; }
    
    fprintf(f, "ABCDEFGHIJ");
    
    // Jump to position 5 from start
    fseek(f, 5, SEEK_SET);
    char ch;
    fread(&ch, 1, 1, f);
    printf("Char at pos 5: %c\\n", ch); // F
    printf("Position now: %ld\\n", ftell(f)); // 6
    
    // Go back to start
    rewind(f);
    fread(&ch, 1, 1, f);
    printf("After rewind: %c\\n", ch); // A
    
    fclose(f);
    return 0;
}`,
                    output: "Char at pos 5: F\nPosition now: 6\nAfter rewind: A",
                    tip: "A common use of <code>ftell</code> + <code>fseek</code> is measuring file size: <code>fseek(fptr, 0, SEEK_END)</code> then <code>ftell(fptr)</code> gives the total byte count. Then <code>rewind(fptr)</code> to read from the beginning."
                }
            ]
        },
        {
            id: "exit-handling",
            title: "Exiting Programs",
            explanation: "A program exits when <code>main()</code> returns — but that is not the only way, and for complex programs it is often not the best way. Code running deep inside a call stack may detect a fatal error and need to exit immediately without unwinding through every caller. Resources acquired throughout a program's lifetime — open files, network connections, allocated memory — need to be released cleanly on exit regardless of where the exit occurs. C provides <code>exit()</code> for clean shutdown from anywhere, <code>atexit()</code> to register cleanup handlers that run automatically at exit, and <code>abort()</code> for truly unrecoverable failures where cleanup itself might be unsafe. Understanding the cleanup guarantees of each is essential for writing programs that do not corrupt files or leak resources when something goes wrong.",
            sections: [
                {
                    title: "exit() and Return Status",
                    content: "<code>exit()</code> from <code>&lt;stdlib.h&gt;</code> terminates the program from anywhere — not just from <code>main()</code>. It takes a status code: <code>EXIT_SUCCESS</code> (0) for success, <code>EXIT_FAILURE</code> (1) for failure. These are macros defined in <code>&lt;stdlib.h&gt;</code>. Before exiting, <code>exit()</code> flushes and closes all open file streams and runs any functions registered with <code>atexit()</code>.",
                    points: [
                        "<code>exit(EXIT_SUCCESS)</code>: Clean exit. All open files are flushed and closed. <code>atexit</code> handlers run.",
                        "<code>exit(EXIT_FAILURE)</code>: Exit signaling an error. Same cleanup as above, just a different return code to the OS.",
                        "<strong>Difference from <code>return</code> in main()</strong>: Both trigger cleanup and exit. <code>exit()</code> can be called from any function, not just <code>main()</code>. <code>return 0</code> in <code>main()</code> behaves identically to <code>exit(0)</code>."
                    ],
                    code: `#include <stdio.h>
#include <stdlib.h>

FILE *logFile = NULL;

void openLog(const char *filename) {
    logFile = fopen(filename, "w");
    if (logFile == NULL) {
        perror("Cannot open log file");
        exit(EXIT_FAILURE); // Exit from a non-main function
    }
    fprintf(logFile, "Log started.\\n");
}

int main() {
    openLog("app.log");
    
    fprintf(logFile, "Doing work...\\n");
    printf("Program running.\\n");
    
    fclose(logFile);
    return EXIT_SUCCESS;
}`,
                    output: "Program running."
                },
                {
                    title: "atexit() — Exit Handlers",
                    content: "<code>atexit()</code> registers a function to be called automatically when the program exits via <code>exit()</code> or by returning from <code>main()</code>. You can register up to 32 functions (guaranteed by the standard; implementations often allow more). They're called in reverse order of registration — last registered, first called. This is extremely useful for cleanup code: closing files, freeing resources, saving state.",
                    points: [
                        "<strong>Registration</strong>: <code>atexit(my_cleanup_func)</code>. The function must take no arguments and return void.",
                        "<strong>Order</strong>: Multiple handlers are called in LIFO (Last In, First Out) order.",
                        "<strong>When it runs</strong>: On <code>exit()</code>, on return from <code>main()</code>. NOT on <code>abort()</code> or abnormal termination.",
                        "<strong>Practical use</strong>: Register cleanup handlers at the point where you acquire resources — open a file, register its closer; allocate memory, register its freer. This keeps resource management close to resource acquisition."
                    ],
                    code: `#include <stdio.h>
#include <stdlib.h>

void cleanup1(void) {
    printf("cleanup1: closing files\\n");
}

void cleanup2(void) {
    printf("cleanup2: freeing resources\\n");
}

void cleanup3(void) {
    printf("cleanup3: saving state\\n");
}

int main() {
    // Register handlers - called in REVERSE order at exit
    atexit(cleanup1);
    atexit(cleanup2);
    atexit(cleanup3);
    
    printf("Program running...\\n");
    
    return 0; // Triggers all atexit handlers
}`,
                    output: "Program running...\ncleanup3: saving state\ncleanup2: freeing resources\ncleanup1: closing files"
                },
                {
                    title: "abort() — Abnormal Termination",
                    content: "<code>abort()</code> terminates the program immediately and abnormally. It generates a <code>SIGABRT</code> signal, which by default causes the program to exit with a non-zero status and — on most systems — produces a core dump (a snapshot of the process memory for debugging). Unlike <code>exit()</code>, <code>abort()</code> does NOT flush open file streams, close files, or run <code>atexit()</code> handlers. It's the nuclear option: use it for truly unrecoverable errors where the program is in a state so bad that any attempt at cleanup might make things worse.",
                    code: `#include <stdio.h>
#include <stdlib.h>

void critical_operation(int *data, int size) {
    if (data == NULL || size <= 0) {
        fprintf(stderr, "FATAL: critical_operation called with invalid args\\n");
        abort(); // Immediate abnormal exit
    }
    // ... do work ...
}

int main() {
    // This would abort:
    // critical_operation(NULL, 0);
    
    int arr[] = {1, 2, 3};
    critical_operation(arr, 3);
    printf("Completed normally.\\n");
    return 0;
}`,
                    output: "Completed normally.",
                    tip: "The practical hierarchy: use <code>assert()</code> for programming errors during development (disabled in release builds), <code>exit(EXIT_FAILURE)</code> for runtime errors your program detects and can report cleanly, and <code>abort()</code> only for truly catastrophic, unrecoverable failures where the program state is corrupted."
                }
            ]
        },
        {
            id: "preprocessor",
            title: "The Preprocessor",
            explanation: "The C preprocessor is a text transformation engine that runs on your source file before the compiler ever sees it. Every line beginning with <code>#</code> is a directive to the preprocessor — not to the compiler. <code>#include</code> pastes the entire contents of a file into your source. <code>#define</code> performs find-and-replace across your code. <code>#ifdef</code> conditionally includes or excludes entire blocks based on whether a name has been defined. The compiler receives the result of all these transformations and has no idea they happened. Understanding the preprocessor explains many things that otherwise look like mysterious language features: <code>NULL</code>, <code>assert()</code>, <code>UINT32_MAX</code>, <code>INT_MIN</code>, and most of the constants you've used from standard headers are macros. It also explains the failure modes unique to macros — since they are pure text substitution with zero understanding of C syntax, types, or operator precedence, they can produce subtly wrong expansions that compile without warnings and run incorrectly.",
            sections: [
                {
                    title: "Concept: Text Replacement",
                    content: "Every preprocessor directive is resolved before a single line of C is compiled. <code>#include</code> literally copies the contents of the specified file into your source. <code>#define</code> performs find-and-replace across your entire file. The compiler then receives the result — it has no idea any of this happened.",
                    warning: "The preprocessor is deliberately simple. It finds and replaces text with zero understanding of what that text means in context. It doesn't evaluate expressions, respect types, or follow operator precedence. Every unexpected behavior of macros ultimately traces back to this: you are doing text substitution, not calling a function."
                },
                {
                    title: "#define (Macros)",
                    content: "The <code>#define</code> directive creates a macro — a name that gets replaced with a value or expression everywhere it appears before compilation. Object-like macros are simple constants. Function-like macros take parameters and expand into expressions.",
                    code: `#include <stdio.h>

#define PI 3.14159
#define SQUARE(x) ((x) * (x))

int main() {
    printf("PI is: %f\\n", PI);
    printf("Square of 5: %d\\n", SQUARE(5));
    
    return 0;
}`,
                    output: "PI is: 3.14159\nSquare of 5: 25"
                },
                {
                    title: "The Parentheses Danger",
                    content: "Because macros are text substitution, if you write <code>SQUARE(2+3)</code>, the macro doesn't receive the value 5 — it receives the text <code>2+3</code>, and the expansion becomes <code>2+3 * 2+3</code>. Without parentheses around the parameter, operator precedence kicks in giving you 13 instead of 25.",
                    code: `#include <stdio.h>

#define BAD_SQUARE(x) x * x

int main() {
    // BAD_SQUARE(2+3) expands to: 2 + 3 * 3 + 2 = 13
    printf("Bad Square result: %d\\n", BAD_SQUARE(2+3));
    
    return 0;
}`,
                    output: "Bad Square result: 13",
                    tip: "There's a second macro trap: side effects in arguments. <code>SQUARE(x++)</code> expands to <code>((x++) * (x++))</code> — the increment happens twice. A real function would only evaluate <code>x++</code> once. Prefer <code>const</code> variables for constants and <code>static inline</code> functions for simple operations — they get the same zero-overhead benefit without the text-substitution footguns."
                },
                {
                    title: "Variadic Macros (__VA_ARGS__)",
                    content: "Just like variadic functions, macros can accept a variable number of arguments. The ellipsis <code>...</code> in the parameter list captures the extra arguments, and <code>__VA_ARGS__</code> in the expansion inserts them. This is how you write macros that wrap functions like <code>printf</code>.",
                    points: [
                        "<strong>Syntax</strong>: <code>#define MACRO(fmt, ...) something(__VA_ARGS__)</code>",
                        "<strong>Common use</strong>: Wrapping <code>printf</code> to add a prefix, logging with file and line info, or adding conditional behavior.",
                        "<strong>GCC extension</strong>: <code>##__VA_ARGS__</code> removes the preceding comma when <code>__VA_ARGS__</code> is empty — useful for macros that take zero or more extra args."
                    ],
                    code: `#include <stdio.h>

// Debug print macro: prints file, line, and the message
#define DEBUG_PRINT(fmt, ...) \\
    printf("[%s:%d] " fmt "\\n", __FILE__, __LINE__, ##__VA_ARGS__)

// Log macro with severity
#define LOG(level, fmt, ...) \\
    printf("[%s] " fmt "\\n", level, ##__VA_ARGS__)

int main() {
    int x = 42;
    DEBUG_PRINT("Starting program");
    DEBUG_PRINT("x = %d", x);
    LOG("INFO", "User logged in: %s", "Alice");
    LOG("WARN", "Memory usage at %d%%", 85);
    return 0;
}`,
                    output: "[main.c:12] Starting program\n[main.c:13] x = 42\n[INFO] User logged in: Alice\n[WARN] Memory usage at 85%"
                },
                {
                    title: "Built-in Preprocessor Macros",
                    content: "The C preprocessor defines several macros automatically — you don't have to define them yourself. These are invaluable for debugging and logging because they let you embed the file name, line number, and function name directly into your messages at compile time.",
                    points: [
                        "<code>__FILE__</code>: A string literal containing the name of the current source file (e.g., <code>\"main.c\"</code>).",
                        "<code>__LINE__</code>: An integer constant containing the current line number in the source file.",
                        "<code>__DATE__</code>: A string literal of the form <code>\"Jan  1 2024\"</code> — the date when the file was compiled.",
                        "<code>__TIME__</code>: A string literal of the form <code>\"12:34:56\"</code> — the time when the file was compiled.",
                        "<code>__func__</code>: A string containing the name of the current function. Technically not a preprocessor macro — it's a predefined identifier in C99 — but works the same way."
                    ],
                    code: `#include <stdio.h>

void exampleFunction(void) {
    printf("In function: %s\\n", __func__);
    printf("At line: %d\\n", __LINE__);
}

int main() {
    printf("File: %s\\n", __FILE__);
    printf("Compiled: %s at %s\\n", __DATE__, __TIME__);
    printf("Line: %d\\n", __LINE__);
    
    exampleFunction();
    
    return 0;
}`,
                    output: "File: main.c\nCompiled: Jan  1 2024 at 12:00:00\nLine: 11\nIn function: exampleFunction\nAt line: 5",
                    tip: "The killer combo is <code>__FILE__</code>, <code>__LINE__</code>, and <code>__func__</code> together in a debug print macro. When a bug triggers, you know exactly where in the code it happened — file, function, and line number — without a debugger. This is the poor man's stack trace and it works everywhere."
                },
                {
                    title: "Conditional Compilation",
                    content: "The preprocessor can include or exclude entire blocks of code based on conditions. <code>#if</code>, <code>#ifdef</code>, <code>#ifndef</code>, and <code>#endif</code> act as compile-time switches. The excluded code doesn't just get skipped at runtime — it literally doesn't exist in the compiled binary at all.",
                    code: `#include <stdio.h>

#define DEBUG 1

int main() {
    int x = 100;
    
#if DEBUG
    printf("Debug Info: x is %d\\n", x);
#endif

    printf("Program running...\\n");
    return 0;
}`,
                    output: "Debug Info: x is 100\nProgram running..."
                },
                {
                    title: "Include Guards",
                    content: "When a project spans multiple files, the same header may be included more than once, causing 'redefinition' compiler errors. Include guards solve this by making a header file include itself only once, no matter how many times it's referenced.",
                    points: [
                        "<strong>The pattern</strong>: Wrap the entire header file in an <code>#ifndef</code> / <code>#define</code> / <code>#endif</code> block. The first time the header is included, the guard macro isn't defined, so the contents are processed and the macro gets defined. Every subsequent include finds the macro already defined and skips the contents.",
                        "<strong>Name the guard uniquely</strong>: The convention is to use the filename in uppercase with dots and slashes replaced by underscores: <code>student.h</code> → <code>STUDENT_H</code>.",
                        "<strong><code>#pragma once</code></strong>: A non-standard but universally supported alternative. One line at the top of the header file. Same effect, less typing. Use it for new code unless you need strict standards conformance."
                    ],
                    code: `// === student.h ===

#ifndef STUDENT_H
#define STUDENT_H

// Plain struct declaration — typedef comes in the next lesson,
// but the include guard mechanism is the same regardless
struct Student {
    char name[50];
    int age;
    float gpa;
};

void printStudent(struct Student s); // Prototype

#endif // STUDENT_H


// === Alternative (simpler) ===
// #pragma once
//
// struct Student { char name[50]; int age; float gpa; };`
                }
            ]
        },
        {
            id: "c23-attributes",
            title: "C23 Standard Attributes: [[nodiscard]], [[deprecated]], [[fallthrough]], [[maybe_unused]]",
            explanation: "C23 introduces standard double-bracket attributes — <code>[[nodiscard]]</code>, <code>[[deprecated]]</code>, <code>[[fallthrough]]</code>, <code>[[maybe_unused]]</code> — as a portable way to communicate intent to the compiler and trigger specific warnings. Before C23, this kind of annotation required GCC-specific <code>__attribute__((...))</code> syntax that was both non-portable and syntactically ugly. Standard attributes let you express four of the most important API contracts: 'ignoring my return value is almost certainly a bug' (<code>[[nodiscard]]</code>), 'this function still works but you should stop using it' (<code>[[deprecated]]</code>), 'this fallthrough between switch cases is intentional, not a forgotten break' (<code>[[fallthrough]]</code>), and 'this variable might legitimately be unused in some build configurations' (<code>[[maybe_unused]]</code>). Each of these prevents a real category of bugs with zero runtime cost.",
            sections: [
                {
                    title: "[[nodiscard]]: Enforce Return Value Checking",
                    content: "<code>[[nodiscard]]</code> tells the compiler to warn whenever the return value of a function is discarded (ignored). This is essential for functions whose return value indicates success/failure or carries the allocated resource — silently ignoring these is a classic source of bugs.",
                    code: `#include <stdio.h>
#include <stdlib.h>

// C23: compiler warns if return value is ignored
[[nodiscard]]
int connect_to_server(const char *host, int port) {
    printf("Connecting to %s:%d...\\n", host, port);
    return -1;  // -1 = error in this example
}

[[nodiscard("allocated memory must be freed")]]  // C23: with message
void* create_buffer(size_t size) {
    return malloc(size);
}

int main(void) {
    // connect_to_server("localhost", 8080);  // WARN: discarded [[nodiscard]]

    int status = connect_to_server("localhost", 8080);
    if (status < 0) {
        printf("Connection failed: %d\\n", status);
    }

    void *buf = create_buffer(1024);
    if (!buf) {
        printf("Allocation failed\\n");
        return 1;
    }
    printf("Buffer allocated\\n");
    free(buf);
    return 0;
}`,
                    output: `Connecting to localhost:8080...
Connection failed: -1
Buffer allocated`,
                    tip: "Apply <code>[[nodiscard]]</code> to any function where ignoring the return value is almost certainly a bug: memory allocators, file openers, error codes, handles, and locks. This turns a silent bug into a compiler warning — the best possible time to catch it."
                },
                {
                    title: "[[deprecated]]: Mark Obsolete APIs",
                    content: "<code>[[deprecated]]</code> marks a function, type, or variable as obsolete. Any use of it triggers a compiler warning, optionally with a message explaining what to use instead. This is how you evolve an API without breaking existing code while guiding users to the new version.",
                    code: `#include <stdio.h>

// Old API — deprecated, use new_process() instead
[[deprecated("use new_process() with explicit flags instead")]]
int old_process(int data) {
    return data * 2;
}

// New API
int new_process(int data, int flags) {
    (void)flags;
    return data * 2;
}

// Deprecated struct — compiler warns on use
[[deprecated]]
typedef struct { int x, y; } OldPoint;

typedef struct { double x, y; } Point;  // New version

int main(void) {
    // Using deprecated functions triggers a warning at compile time:
    // int r = old_process(10);  // warning: 'old_process' is deprecated

    int result = new_process(10, 0);   // No warning
    printf("Result: %d\\n", result);

    Point p = {1.0, 2.0};
    printf("Point: (%.1f, %.1f)\\n", p.x, p.y);
    return 0;
}`,
                    output: `Result: 20
Point: (1.0, 2.0)`
                },
                {
                    title: "[[fallthrough]]: Explicit Switch Fallthrough",
                    content: "Falling through a <code>switch</code> <code>case</code> without a <code>break</code> is almost always a bug — which is why modern compilers warn about it. But sometimes fallthrough is intentional. <code>[[fallthrough]]</code> is an explicit annotation that tells the compiler: 'yes, I meant to fall through here, this is not a mistake.'",
                    code: `#include <stdio.h>

// HTTP status code classifier
void classify_status(int code) {
    switch (code / 100) {
        case 1:
            printf("1xx: Informational\\n");
            break;
        case 2:
            printf("2xx: Success\\n");
            break;
        case 3:
            printf("3xx: Redirection\\n");
            break;
        case 4:
            [[fallthrough]];   // C23: intentional fallthrough — no warning
        case 5:
            printf("%dxx: Error (%s)\\n", code / 100,
                   code / 100 == 4 ? "client" : "server");
            break;
        default:
            printf("Unknown status\\n");
    }
}

int main(void) {
    classify_status(200);
    classify_status(301);
    classify_status(404);  // Falls through to 5xx handler
    classify_status(500);
    return 0;
}`,
                    output: `2xx: Success
3xx: Redirection
4xx: Error (client)
5xx: Error (server)`
                },
                {
                    title: "[[maybe_unused]]: Suppress Unused Warnings",
                    content: "<code>[[maybe_unused]]</code> suppresses warnings about unused variables, parameters, or functions. This is common in debug-only parameters, platform-specific code, and callback functions where the signature is fixed but not all parameters are always needed.",
                    code: `#include <stdio.h>

// Callback with a fixed signature — 'userdata' not always needed
void on_click([[maybe_unused]] int x,
              [[maybe_unused]] int y,
              [[maybe_unused]] void *userdata) {
    printf("Click event received\\n");
    // x, y, userdata not used — no warning with [[maybe_unused]]
}

// Debug-only parameter
void process(int value, [[maybe_unused]] const char *debug_label) {
#ifdef DEBUG
    printf("[%s] processing %d\\n", debug_label, value);
#endif
    // In release builds, debug_label is unused — no warning
    printf("Processed: %d\\n", value * 2);
}

// Function used only in debug builds
[[maybe_unused]]
static void dump_state(int *arr, int n) {
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
}

int main(void) {
    on_click(100, 200, NULL);
    process(21, "test-label");
    return 0;
}`,
                    output: `Click event received
Processed: 42`,
                    tip: "The four standard attributes — <code>[[nodiscard]]</code>, <code>[[deprecated]]</code>, <code>[[fallthrough]]</code>, and <code>[[maybe_unused]]</code> — should be the first attributes you reach for in any new C23 codebase. They communicate intent to both the compiler and the reader without any runtime cost."
                },
                {
                    title: "#embed: Embedding Binary Resources (C23)",
                    content: "C23 introduces <code>#embed</code>, which lets you include the raw bytes of a file directly into your source code at compile time. Previously this required external tools (like <code>xxd</code> or custom scripts) to convert files into C arrays. Now you can embed fonts, images, shaders, certificates, or any binary data directly.",
                    code: `#include <stdio.h>
#include <stddef.h>

// C23: embed a file's bytes as a byte array at compile time
// This embeds the literal bytes of "logo.png" into the binary
// const unsigned char logo_data[] = {
//     #embed "logo.png"
// };
// const size_t logo_size = sizeof(logo_data);

// For this example, we simulate what #embed does:
const unsigned char icon_data[] = {
    #embed "icon.bin"   // Real C23 — compiler includes file bytes
    // Simulated equivalent (what the compiler would produce):
    // 0x89, 0x50, 0x4E, 0x47, ...
};

// #embed with limits — take only first 64 bytes:
// const unsigned char header[] = { #embed "file.bin" limit(64) };

// #embed with a fallback if file doesn't exist:
// #if __has_embed("cert.pem")
//     const char cert[] = { #embed "cert.pem", 0 };  // null-terminate
// #else
//     #error "Certificate file required"
// #endif

int main(void) {
    printf("Resource embedding with #embed (C23)\\n");
    printf("Before #embed, developers used tools like xxd:\\n");
    printf("  xxd -i logo.png > logo_data.h\\n");
    printf("Now: just write  #embed \\"logo.png\\"  in an initializer.\\n");
    return 0;
}`,
                    output: `Resource embedding with #embed (C23)
Before #embed, developers used tools like xxd:
  xxd -i logo.png > logo_data.h
Now: just write  #embed "logo.png"  in an initializer.`,
                    warning: "<code>#embed</code> requires C23 compiler support. Check with <code>__has_embed(\"file\")</code> before using it if portability matters. The file path is relative to the source file unless the compiler's include path overrides this. The embedded data is raw bytes — for text files, remember to add a null terminator if you need a C string."
                }
            ]
        }
    ],
    
    quiz: [
        {
            question: "What is the main difference between a struct and a union?",
            options: ["Syntax", "Struct members share memory, Union members don't", "Union members share memory, Struct members don't", "No difference"],
            answer: 2,
            explanation: "In a union, all members share the same memory — writing one member overwrites the others. In a struct, each member has its own memory location."
        },
        {
            question: "What operator is used to access a member via a struct pointer?",
            options: [".", "->", "::", "*"],
            answer: 1,
            explanation: "The arrow operator (->) is shorthand for (*ptr).member — dereference the pointer, then access the member. The dot operator (.) is for direct struct access."
        },
        {
            question: "What does 'w' mode do in fopen?",
            options: ["Reads file", "Writes to file (erases existing)", "Appends to file", "Writes to file (keeps existing)"],
            answer: 1,
            explanation: "'w' mode opens a file for writing. If it exists, all existing content is erased. If it doesn't exist, it's created."
        },
        {
            question: "When does the preprocessor run?",
            options: ["After compilation", "During runtime", "Before compilation", "During linking"],
            answer: 2,
            explanation: "The preprocessor runs before compilation — it handles #include, #define, and #ifdef before the compiler sees the code."
        },
        {
            question: "What is an enum?",
            options: ["A new variable type", "A list of named integer constants", "A type of struct", "A macro"],
            answer: 1,
            explanation: "An enum defines a set of named integer constants. The values default to 0, 1, 2... unless you assign them explicitly."
        },
        {
            question: "Why do we use fclose?",
            options: ["To delete the file", "To save changes and free memory", "To pause reading", "It is optional"],
            answer: 1,
            explanation: "fclose flushes any buffered output to disk and releases the file descriptor. Without it, the last bytes of a file may never be written."
        },
        {
            question: "What does typedef do?",
            options: ["Defines a new type", "Creates an alias for a type", "Deletes a type", "Checks type size"],
            answer: 1,
            explanation: "typedef creates an alias for an existing type. typedef struct Node Node; lets you write Node instead of struct Node throughout the code."
        },
        {
            question: "What does a struct designated initializer look like?",
            options: ["{name, age, gpa}", "{.name = val, .age = val}", "(name=val)", "[name: val]"],
            answer: 1,
            explanation: "Designated initializers use .field = value syntax. They initialize specific members by name, making the intent clear and order-independent."
        },
        {
            question: "Can you use == to compare two structs?",
            options: ["Yes, always", "Only if they are the same type", "No, you must compare fields individually", "Only with memcmp"],
            answer: 2,
            explanation: "No. == compares pointers (addresses), not struct contents. To compare structs, compare each field individually, or use memcmp if there's no padding."
        },
        {
            question: "What does __LINE__ contain?",
            options: ["The function name", "The current line number", "The file name", "The compile date"],
            answer: 1,
            explanation: "__LINE__ is a predefined macro that expands to the current source line number as an integer. Useful for debugging messages and assertions."
        }
    ],
    
    practice: [
        {
            title: "Bank Account Struct",
            difficulty: "medium",
            problem: "Define a struct 'Account' with account number (int), name (string), and balance (float). Create one instance using a designated initializer, populate it, and print the details.",
            solution: `#include <stdio.h>
#include <string.h>

typedef struct {
    int accNum;
    char name[50];
    float balance;
} Account;

int main() {
    Account myAcc = {
        .accNum  = 101,
        .balance = 5000.50f
    };
    strcpy(myAcc.name, "John Doe");
    
    printf("Account: %d\\nName: %s\\nBalance: $%.2f\\n", 
           myAcc.accNum, myAcc.name, myAcc.balance);
           
    return 0;
}`
        },
        {
            title: "File Writer",
            difficulty: "medium",
            problem: "Write a program that asks the user for 3 lines of text and saves them to 'notes.txt'. Use perror() for error handling.",
            solution: `#include <stdio.h>
#include <stdlib.h>

int main() {
    char text[100];
    FILE *fptr = fopen("notes.txt", "w");
    
    if (!fptr) {
        perror("fopen");
        return EXIT_FAILURE;
    }
    
    printf("Enter 3 lines:\\n");
    for (int i = 0; i < 3; i++) {
        fgets(text, 100, stdin);
        fprintf(fptr, "%s", text);
    }
    
    fclose(fptr);
    printf("Saved!\\n");
    return EXIT_SUCCESS;
}`
        },
        {
            title: "Safe Macro",
            difficulty: "hard",
            problem: "Write a safe macro MAX(a, b) that returns the larger of two numbers. Ensure it is wrapped in parentheses to avoid precedence issues.",
            solution: `#include <stdio.h>

#define MAX(a, b) ((a) > (b) ? (a) : (b))

int main() {
    int x = 10, y = 20;
    printf("Max: %d\\n", MAX(x, y));
    printf("Max expression: %d\\n", MAX(5+5, 10+10));
    return 0;
}`
        },
        {
            title: "Cleanup with atexit",
            difficulty: "hard",
            problem: "Write a program that opens a log file, registers an atexit handler to close and report on it, does some work, and exits normally. Observe that the handler runs automatically.",
            solution: `#include <stdio.h>
#include <stdlib.h>

FILE *logFile = NULL;
int logLines = 0;

void closeLog(void) {
    if (logFile) {
        fprintf(logFile, "--- Log closed, %d lines written ---\\n", logLines);
        fclose(logFile);
        printf("atexit: log file closed (%d lines)\\n", logLines);
    }
}

void logMessage(const char *msg) {
    if (logFile) {
        fprintf(logFile, "%s\\n", msg);
        logLines++;
    }
}

int main() {
    logFile = fopen("app.log", "w");
    if (!logFile) { perror("fopen"); return EXIT_FAILURE; }
    
    atexit(closeLog); // Registered - runs when main() returns
    
    logMessage("Program started");
    logMessage("Doing work...");
    logMessage("Work complete");
    
    printf("Main done, returning...\\n");
    return EXIT_SUCCESS; // closeLog() runs automatically here
}`
        }
    ],
    
    exam: [
        {
            question: "What is the output?",
            code: `#include <stdio.h>
typedef struct {
    char name[8];
    int  age;
} Person;
int main(void) {
    Person p = {"Alice", 30};
    printf("%s is %d\\n", p.name, p.age);
    p.age++;
    printf("%d\\n", p.age);
    return 0;
}`,
            options: ["Alice is 30 then 31", "Alice is 30 then 30", "Alice is 31 then 31", "Compile error"],
            answer: 0,
            explanation: "Struct members are accessed with the dot operator. p.age starts at 30, p.age++ increments it to 31."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
typedef union {
    int   i;
    float f;
} Num;
int main(void) {
    Num n;
    n.i = 0;
    printf("%zu\\n", sizeof(n));
    return 0;
}`,
            options: ["4", "8", "12", "2"],
            answer: 1,
            explanation: "A union's size equals its largest member's size. Both int and float are typically 4 bytes, so sizeof(Num) = 4. All members share the same memory."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#define DOUBLE(x) ((x) * 2)
#define SQUARE(x) ((x) * (x))
int main(void) {
    printf("%d\\n", DOUBLE(3 + 1));
    printf("%d\\n", SQUARE(3));
    return 0;
}`,
            options: ["7 then 9", "8 then 9", "7 then 6", "8 then 6"],
            answer: 1,
            explanation: "DOUBLE(3+1) expands to ((3+1)*2) = 8. SQUARE(3) expands to ((3)*(3)) = 9. Parentheses in the macro prevent precedence bugs."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
typedef struct Node {
    int val;
    struct Node *next;
} Node;
int main(void) {
    Node a = {1, NULL};
    Node b = {2, NULL};
    a.next = &b;
    printf("%d\\n", a.next->val);
    printf("%d\\n", a.next->next == NULL);
    return 0;
}`,
            options: ["2 then 1", "1 then 1", "2 then 0", "1 then 0"],
            answer: 0,
            explanation: "a.next points to b. a.next->val is b.val = 2. a.next->next is b.next which is NULL, so == NULL is true (1)."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
typedef enum { RED=0, GREEN, BLUE } Color;
int main(void) {
    Color c = GREEN;
    printf("%d\\n", c);
    printf("%d\\n", BLUE);
    switch (c) {
        case RED:   printf("red\\n");   break;
        case GREEN: printf("green\\n"); break;
        case BLUE:  printf("blue\\n");  break;
    }
    return 0;
}`,
            options: ["1 then 2 then green", "0 then 2 then green", "1 then 2 then blue", "1 then 3 then green"],
            answer: 0,
            explanation: "RED=0, GREEN=1 (auto-incremented), BLUE=2. c=GREEN prints as 1. BLUE prints as 2. The switch matches GREEN and prints 'green'."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
typedef struct { int x; int y; double z; } T;
int main(void) {
    printf("%zu\\n", sizeof(T));
    return 0;
}`,
            options: ["12", "16", "24", "10"],
            answer: 1,
            explanation: "Two ints (4+4=8 bytes) followed by a double (8 bytes, 8-byte aligned). The ints already reach a multiple-of-8 boundary, so no padding needed. Total: 16 bytes."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#define MAX(a, b) ((a) > (b) ? (a) : (b))
int main(void) {
    int x = 3, y = 7;
    printf("%d\\n", MAX(x, y));
    printf("%d\\n", MAX(x + 1, y - 2));
    return 0;
}`,
            options: ["7 then 5", "7 then 7", "3 then 5", "7 then 4"],
            answer: 0,
            explanation: "MAX(3,7): 3>7 is false → 7. MAX(4, 5): x+1=4, y-2=5, 4>5 is false → 5."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
void cleanup(void) {
    printf("bye\\n");
}
int main(void) {
    atexit(cleanup);
    printf("hello\\n");
    return 0;
}`,
            options: ["hello", "bye", "hello then bye", "bye then hello"],
            answer: 2,
            explanation: "atexit registers a function to run when the program exits. main prints 'hello' first, then normal exit triggers cleanup() which prints 'bye'."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
int main(void) {
    int x = 10;
    switch (x) {
        case 10: printf("ten\\n");
        case 20: printf("twenty\\n"); break;
        case 30: printf("thirty\\n"); break;
    }
    return 0;
}`,
            options: ["ten", "twenty", "ten then twenty", "ten then twenty then thirty"],
            answer: 2,
            explanation: "Case 10 matches and prints 'ten'. There is NO break after it, so execution falls through to case 20 and prints 'twenty'. The break there exits. This is fallthrough."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
#ifdef DEBUG
#define LOG(x) printf("DEBUG: %d\\n", x)
#else
#define LOG(x)
#endif
int main(void) {
    int val = 42;
    LOG(val);
    printf("done\\n");
    return 0;
}`,
            options: ["DEBUG: 42 then done", "done", "42 then done", "DEBUG: val then done"],
            answer: 1,
            explanation: "DEBUG is not defined, so LOG(x) expands to nothing. Only 'done' prints. If DEBUG were defined (e.g. -DDEBUG flag), 'DEBUG: 42' would also appear."
        },
        {
            question: "What is the output?",
            code: `#include <stdio.h>
typedef struct { int a; int b; } Pair;
Pair make_pair(int x, int y) {
    return (Pair){x, y};
}
int main(void) {
    Pair p = make_pair(5, 10);
    printf("%d %d\\n", p.a, p.b);
    return 0;
}`,
            options: ["5 10", "10 5", "0 0", "Compile error"],
            answer: 0,
            explanation: "Structs can be returned by value and assigned. The compound literal (Pair){x, y} creates a Pair and returns it. p.a=5, p.b=10."
        },
        {
            question: "What does the [[nodiscard]] attribute cause here?",
            code: `#include <stdio.h>
#include <stdlib.h>
[[nodiscard]]
void* safe_malloc(size_t n) {
    void *p = malloc(n);
    if (!p) { fprintf(stderr, "OOM\\n"); exit(1); }
    return p;
}
int main(void) {
    safe_malloc(100);   // return value discarded
    printf("ok\\n");
    return 0;
}`,
            options: ["Compile error: cannot discard", "A compiler WARNING at the safe_malloc(100) call line", "Runs fine, no warning", "Crashes at runtime"],
            answer: 1,
            explanation: "[[nodiscard]] causes a compiler WARNING (not an error by default) when the return value is discarded. The program still compiles and runs — but the warning flags the likely memory leak."
        }
    ]
};

window.ModuleAdvanced = ModuleAdvanced;