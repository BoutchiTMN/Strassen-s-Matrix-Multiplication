# Strassen vs Naive Matrix Multiplication Visualizer

Interactive educational visualization tool for understanding **Strassen’s Matrix Multiplication** and the **Naive Matrix Multiplication algorithm**.

This project was developed for **BCS 309 – Algorithms I** as part of an individual assignment requiring a web-based teaching tool that clearly demonstrates algorithm concepts and complexity.

The tool allows students to explore how both algorithms work step-by-step, compare their behavior, and understand why Strassen’s Divide & Conquer approach can improve performance for large matrices.

---

# Project Objective

The goal of this project is to create an interactive learning environment that helps students:

• understand how matrix multiplication works  
• visualize each step of the algorithms  
• observe how intermediate values are computed  
• explore algorithm complexity and growth  
• compare Divide & Conquer vs straightforward computation  

The tool is designed so that a student can learn the algorithm without needing additional explanation.

---

# Algorithms Included

## 1. Naive Matrix Multiplication
The standard method taught in mathematics.

Uses three nested loops to compute each element:

C[i][j] = Σ A[i][k] × B[k][j]

Time Complexity:
O(n³)

Characteristics:
• simple and easy to understand  
• computes each result cell independently  
• efficient for small matrices  
• commonly used as the baseline method  

---

## 2. Strassen's Matrix Multiplication
A Divide and Conquer algorithm discovered in 1969.

Instead of performing 8 recursive multiplications, Strassen reduces the number to 7 by cleverly combining matrix quadrants.

Recurrence:
T(n) = 7T(n/2) + O(n²)

Time Complexity:
O(n^log₂7) ≈ O(n^2.807)

Characteristics:
• reduces multiplication count  
• improves asymptotic complexity  
• useful for large matrices  
• demonstrates Divide & Conquer paradigm  

---

# Features

## Interactive Visualization
• step-by-step animation of both algorithms  
• matrix cell highlighting  
• smooth transitions  
• clear visual representation of calculations  

## Playback Controls
• Build Steps  
• Step  
• Play  
• Pause  
• Reset  
• speed control slider  

## Educational Panels
• pseudocode with line highlighting  
• explanation box describing each step  
• algorithm overview  
• worked examples  
• key concept summaries  

## Comparison Tools
• side-by-side algorithm comparison  
• complexity comparison  
• growth rate visualization  
• explanation of algorithm differences  

## Statistics
Live counters for:
• multiplications  
• additions  
• recursive calls (Strassen)  
• total steps  

## History Tracking
• step history table  
• clickable rows to jump between steps  

## Responsive Layout
• two-column layout on desktop  
• single-column layout on small screens  

---

# How Strassen Handles Non-Power-of-Two Matrices

Strassen’s algorithm requires matrices to be divisible into equal quadrants.

Because of this, matrices such as 3×3 cannot be used directly.

The solution is padding:

Example:

3×3 matrix → padded to 4×4 by adding zeros

After computation, the extra rows and columns are removed.

---

# Technologies Used

The entire project is implemented inside a single HTML file using:

• HTML5  
• CSS3  
• Vanilla JavaScript (ES6)  
• SVG for visualization  

No external libraries or frameworks were used.

---

# How to Run the Project

Option 1 – Open locally

1. Download the project file
2. Open the file named:

index.html

3. The tool will run immediately in your browser

No installation required.

---

Option 2 – Open online (GitHub Pages)

Visit the deployed version:

[Insert GitHub Pages link here]

---

# How to Use the Tool

1. Choose an algorithm tab:
   • Naive Method
   • Strassen Method
   • Comparison

2. Enter matrix values or choose a preset example

3. Press "Build Steps"

4. Use playback controls to observe the algorithm

5. Read the explanations and pseudocode highlighting

6. Compare algorithm behavior in the comparison tab

---

# Learning Outcomes Covered

CLO-1  
Analyze time complexity and growth behavior of algorithms.

CLO-2  
Understand how algorithms access and process data.

CLO-3  
Apply Divide & Conquer paradigm to solve problems.

---

# Author

Student Name: Bouchina, Othmane  
Course: BCS 309 – Algorithms I  
Semester: Spring 2026  

---

# Notes

This project is intended as an educational visualization tool.

The focus is understanding algorithm behavior rather than implementing highly optimized production-level code.
