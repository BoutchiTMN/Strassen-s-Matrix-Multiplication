#!/bin/bash
# ============================================================
# merge.sh — Merge the multi-file project back into a single HTML file
# Usage: bash merge.sh > submission.html
# ============================================================

cat << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Matrix Multiplication — Strassen vs Naive | Interactive Visualization</title>
<style>
EOF

cat styles.css

cat << 'EOF'
</style>
</head>
EOF

# Extract body content from index.html (skip the head and script tags)
sed -n '/<body>/,/<\/body>/p' index.html | head -n -1 | tail -n +1

# Remove closing body/html from index, we'll add them after scripts
echo ""
echo "<script>"

# Concatenate all JS files in dependency order
cat js/state.js
echo ""
cat js/utils.js
echo ""
cat js/strassen.js
echo ""
cat js/naive.js
echo ""
cat js/naiveRecursive.js
echo ""
cat js/engine.js
echo ""
cat js/renderStep.js
echo ""
cat js/renderVisualization.js
echo ""
cat js/renderNaiveRecurViz.js
echo ""
cat js/counters.js
echo ""
cat js/history.js
echo ""
cat js/recursionTree.js
echo ""
cat js/matrixInput.js
echo ""
cat js/tabs.js
echo ""
cat js/events.js
echo ""
cat js/comparison.js
echo ""
cat js/init.js

echo "</script>"
echo "</body>"
echo "</html>"
