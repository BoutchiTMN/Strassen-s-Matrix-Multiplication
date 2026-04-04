# Strassen vs Naive Matrix Multiplication Visualizer

Interactive educational web tool for understanding **Strassen’s Matrix Multiplication**, **Naive Matrix Multiplication**, and **Recursive Naive Multiplication** step-by-step.

Developed for **BCS 309 – Algorithms I** as a web-based teaching and visualization project.

---

## Project Purpose

This tool helps students:

- understand how matrix multiplication works
- visualize algorithm steps interactively
- observe intermediate calculations
- compare different algorithm approaches
- understand the Divide & Conquer paradigm
- explore algorithm time complexity

The visualization transforms abstract algorithm concepts into a clear and intuitive learning experience.

---

## Algorithms Included

### 1. Naive Matrix Multiplication (Iterative)
Standard method using three nested loops.

Formula:

C[i][j] = Σ A[i][k] × B[k][j]

Time Complexity:

O(n³)

Characteristics:
- simple and easy to understand
- computes each result cell independently
- efficient for small matrices

---

### 2. Naive Recursive Matrix Multiplication
Divide & Conquer version of the naive algorithm.

Splits matrices into quadrants and recursively computes results using 8 multiplications.

Time Complexity:

O(n³)

Characteristics:
- demonstrates recursive problem solving
- shows how matrix multiplication can be expressed using Divide & Conquer
- useful for understanding Strassen’s improvement

---

### 3. Strassen’s Matrix Multiplication
Divide & Conquer algorithm that reduces the number of recursive multiplications from 8 to 7.

Time Complexity:

O(n^log₂7) ≈ O(n^2.807)

Characteristics:
- reduces multiplication operations
- improves asymptotic complexity
- more efficient for large matrices
- demonstrates algorithm optimization techniques

---

## Features

- step-by-step algorithm visualization
- matrix cell highlighting during computation
- mathematical operations display
- pseudocode with line highlighting
- recursion depth visualization
- playback controls:
  - Build Steps
  - Step
  - Play
  - Pause
  - Skip to End
  - Reset
- comparison of algorithm behavior
- operation counters:
  - multiplications
  - additions
  - recursive calls
- supports matrix sizes:
  2×2, 4×4, 8×8, 16×16
- includes padded 3×3 example

---

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6)
- SVG for visualization

No external libraries or frameworks were used.

---

## How to Run

Open locally:

open the file  
index.html

Or use the GitHub Pages version:

https://boutchitmn.github.io/Strassen-s-Matrix-Multiplication/

No installation required.

---

## Educational Focus

This project demonstrates:

- algorithm complexity analysis
- Divide & Conquer design paradigm
- recursive computation structure
- algorithm optimization concepts
- comparison between different algorithm approaches

---

## Course Information

Course: BCS 309 – Algorithms I  
Instructor: Dr. Arash Kermani Kolankeh  
University: Canadian University Dubai  

Semester: Spring 2026  

Student: Bouchina, Othmane  
Student ID: 20220001467

---

## Notes

This project is intended for educational purposes to help students better understand algorithm behavior through visualization.
