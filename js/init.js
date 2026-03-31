// ═══════════════════════════════════════════════════════════════════════
//  INITIAL LOAD
// ═══════════════════════════════════════════════════════════════════════
loadMatrices(DEFAULTS[currentSize].A,DEFAULTS[currentSize].B);
setEngineState(SE,'idle');setEngineState(NE,'idle');setEngineState(RE,'idle');
updateProgress(SE);updateProgress(NE);updateProgress(RE);
// Draw initial complexity graph
drawGraph(64);updateExplorer(64);
