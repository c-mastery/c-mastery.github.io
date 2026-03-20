# C Programming Mastery

This repository contains a comprehensive, client-side educational platform designed to teach the C programming language. The project covers the full spectrum of the language, beginning with basic syntax and concluding with advanced features introduced in the C23 standard. It is built as a static website, ensuring high performance and ease of deployment without the need for a dedicated backend server.

# Core Features:

1. Interactive Learning Environment

The platform is organized into distinct modules that guide the user through a logical progression of difficulty. Each module contains detailed explanations, code examples, and structured lessons that target specific core competencies of systems programming.
Integrated Code Execution

To bridge the gap between theory and practice, the site features a built-in code runner.

Professional Editor: The site utilizes the CodeMirror library to provide a full-featured code editor within the browser, supporting syntax highlighting and automatic indentation.

Live Compilation: C code is executed via the Judge0 API. This allows for real-time compilation and execution of standard C code directly from the interface, providing immediate feedback to the learner.

2. Progress Persistence

The application is designed to respect the user's time and effort. Using browser local storage, the site automatically tracks:

   - The last module and lesson visited.

   - Completed lessons and quiz scores.

   - User preferences such as theme settings.

Upon returning to the website, users are automatically routed back to their last active location, allowing for a seamless continuation of their studies.

3. Modern Curriculum

The content includes detailed coverage of the C23 standard, including topics often omitted from traditional courses:

   - Type-generic programming using generic selection.
   - Modern keywords and attributes such as constexpr, nullptr, and nodiscard.
   - Multithreading and memory alignment.
   - Non-local jumps and advanced memory management.

4. Technical Architecture Stack

    - Frontend: HTML5, CSS3, and Vanilla JavaScript.

    - Editor: CodeMirror (C-like mode).

    - Execution: Judge0 Public API.

# File Structure

The project is highly modular. The core logic resides in script.js, while the curriculum is separated into individual module files (e.g., module_beginner.js, module_expert.js). This separation allows for granular updates to the course content without modifying the underlying application framework.

# Usage

Since this is a client-side application, it can be run by opening index.html in any modern web browser. For the code execution feature to function, an active internet connection is required to communicate with the compiler API.