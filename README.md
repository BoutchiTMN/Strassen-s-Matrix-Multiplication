## Course Information

Course: BCS 309 – Algorithms I  
Instructor: Dr. Ahmed Hussein  
University: Canadian University Dubai  

Semester: Spring 2026  

Student: Bouchina, Othmane 
ID: 20220001467

---

# Strassen vs Naive Matrix Multiplication Visualizer

Interactive educational web tool for understanding **Strassen’s Matrix Multiplication** and the **Naive Matrix Multiplication** algorithm step-by-step.

Developed for **BCS 309 – Algorithms I** as a teaching and visualization project.

---

## Project Purpose

This tool helps students:

- understand how matrix multiplication works
- visualize algorithm steps interactively
- observe intermediate calculations
- compare algorithm performance
- learn the Divide & Conquer paradigm

The visualization makes abstract algorithm concepts easier to understand.

---

## Algorithms Included

### Naive Matrix Multiplication
Standard method using three nested loops.

Formula:
C[i][j] = Σ A[i][k] × B[k][j]

Time Complexity:
O(n³)

Best for small matrices and simple implementation.

---

### Strassen’s Matrix Multiplication
Divide & Conquer algorithm that reduces the number of multiplications from 8 to 7 per recursion level.

Time Complexity:
O(n^log₂7) ≈ O(n^2.807)

More efficient for large matrices.

---

## Features

- step-by-step algorithm visualization
- matrix highlighting during computation
- mathematical operation display
- pseudocode with line tracking
- playback controls (play, pause, step)
- complexity comparison
- recursion visualization
- supports matrix sizes:
  2×2, 4×4, 8×8, 16×16

---

## Technologies

- HTML5
- CSS3
- JavaScript (ES6)
- SVG visualization

No external libraries used.

---

## How to Run

Open the file:

index.html

Or use the GitHub Pages link.

No installation required.

---

## Educational Focus

This project is designed for learning purposes to demonstrate:

- algorithm complexity
- divide and conquer strategy
- recursive computation
- differences between algorithm approaches
