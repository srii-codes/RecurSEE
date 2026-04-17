
## RecurSEE - Visualize Algorithms

An interactive web-based learning platform designed to help users understand core divide-and-conquer algorithms through step-by-step visualization, intuitive explanations, and hands-on exploration.

---

## Overview

This project focuses on simplifying complex algorithmic concepts by combining visualization with structured learning. Users can explore how algorithms work internally, observe recursive behavior, and understand the reasoning behind each step.

Currently, the platform supports:

* **Karatsuba Multiplication**
* **Maximum Subarray Problem**
* **Strassen's Matrix Multiplication**
* **Closest Pair of Points**

---

## Features

* Interactive step-by-step visualization of algorithms
* Play, pause, step forward, and step backward controls
* User-defined input for real-time execution
* Visual representation of recursive calls and decision-making
* Hover-based interactions for enhanced exploration
* Clean explanations of algorithm logic and flow
* Pseudocode and implementations in:

  * C
  * C++
  * Java
  * Python
* Time complexity explained in an intuitive manner
* Masters' Theorem Tool

---

## Tech Stack

* HTML
* CSS
* JavaScript
* D3.js (for visualization)
* Highlight.js (for code formatting)

---

## How It Works

The algorithms are implemented using a **trace-first approach**.
Instead of directly producing the final result, each algorithm records its execution as a sequence of structured steps.

These steps include:

* Function calls
* Subproblem divisions
* Intermediate computations
* Final results

This execution trace is then used by the visualization engine to replay the algorithm step-by-step without re-running it.

---

## Project Structure

```
RECURSEE/
│
├── css/
│   └── style.css
│
├── js/
│   ├── closestpair.js
│   ├── content.js
│   ├── karatsuba.js
│   ├── main.js
│   ├── mastercalc.js
│   ├── maxsubarray.js
│   ├── strassen.js
│   └── visualizer.js
│
├── index.html
└── karat.py
```

---

## Goals

* Make divide-and-conquer algorithms easier to understand
* Bridge the gap between theory and implementation
* Provide a beginner-friendly, interactive learning experience
* Enable users to explore algorithms with their own inputs


---

## Getting Started

1. Clone the repository
2. Open `index.html` in your browser
3. Select an algorithm and start exploring

---

## License

This project is created for educational purposes.

---

