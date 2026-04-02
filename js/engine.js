// ═══════════════════════════════════════════════════════════════════════
//  ENGINE OPERATIONS (shared logic, parameterized by engine)
// ═══════════════════════════════════════════════════════════════════════
// Element lookup helper: maps short id to suffixed DOM element
function engSuf(eng){return eng.type==='strassen'?'S':eng.type==='naive'?'N':'R'}
function el(eng,id){return document.getElementById(id+engSuf(eng))}

function getDelay(eng){
  const slider=el(eng,'speedSlider');
  const m=parseFloat(slider?slider.value:1)||1;
  return Math.round(800/m);
}

function setEngineState(eng,newState){
  eng.state=newState;
  const suf=engSuf(eng);
  const dot=document.getElementById('statusDot'+suf);
  const txt=document.getElementById('statusText'+suf);
  const labels={idle:'Idle',ready:'Ready',playing:'Playing',paused:'Paused',done:'Done'};
  ['idle','ready','playing','paused','done'].forEach(s=>{dot.classList.remove(s);txt.classList.remove(s)});
  dot.classList.add(newState);txt.classList.add(newState);
  txt.textContent=labels[newState];
  const bb=document.getElementById('btnBuild'+suf);
  const bs=document.getElementById('btnStep'+suf);
  const bp=document.getElementById('btnPlay'+suf);
  const bpa=document.getElementById('btnPause'+suf);
  const bsk=document.getElementById('btnSkip'+suf);
  const br=document.getElementById('btnReset'+suf);
  bb.disabled=newState==='playing';
  bs.disabled=!['ready','paused'].includes(newState);
  bp.disabled=!['ready','paused'].includes(newState);
  bpa.disabled=newState!=='playing';
  if(bsk)bsk.disabled=!['ready','paused','playing'].includes(newState);
  br.disabled=['idle'].includes(newState);
}

function updateProgress(eng){
  const suf=engSuf(eng);
  const total=eng.steps.length;
  const shown=eng.stepIdx+1;
  const pct=total>0?Math.round(shown/total*100):0;
  document.getElementById('stepCounter'+suf).textContent=`Step ${shown}/${total}`;
  document.getElementById('progressStep'+suf).textContent=`Step ${shown}/${total}`;
  document.getElementById('progressPct'+suf).textContent=`${pct}%`;
  document.getElementById('progressFill'+suf).style.width=`${pct}%`;
}

function stopAutoPlay(eng){
  if(eng.timer){clearInterval(eng.timer);eng.timer=null}
}

function startAutoPlay(eng){
  if(eng.timer)return;
  setEngineState(eng,'playing');
  eng.timer=setInterval(()=>{
    if(!advanceStep(eng)){stopAutoPlay(eng);setEngineState(eng,'done')}
  },getDelay(eng));
}

function advanceStep(eng){
  if(eng.stepIdx>=eng.steps.length-1)return false;
  eng.stepIdx++;
  updateProgress(eng);
  renderStep(eng);
  if(eng.stepIdx>=eng.steps.length-1){stopAutoPlay(eng);setEngineState(eng,'done')}
  return true;
}

function jumpToStep(eng,idx){
  if(idx<0||idx>=eng.steps.length)return;
  if(eng.state==='playing')stopAutoPlay(eng);
  eng.stepIdx=idx;
  updateProgress(eng);
  renderStep(eng);
  setEngineState(eng,idx>=eng.steps.length-1?'done':'paused');
}

/** Skip directly to the final step without animating through intermediate steps */
function skipToEnd(eng){
  if(eng.steps.length===0)return;
  if(eng.state==='playing')stopAutoPlay(eng);
  eng.stepIdx=eng.steps.length-1;
  updateProgress(eng);
  renderStep(eng);
  setEngineState(eng,'done');
}

function resetEngine(eng){
  stopAutoPlay(eng);
  eng.steps=[];eng.result=null;eng.stepIdx=-1;eng.tree=null;
  updateProgress(eng);
  setEngineState(eng,'idle');
  const suf=engSuf(eng);
  // Reset viz
  const engNames={strassen:'Strassen',naive:'Naive',naiverecur:'Naive Recursive'};
  document.getElementById('viz'+suf).innerHTML=`<div class="placeholder-msg"><p>${engNames[eng.type]||eng.type} Visualization</p><span>Click <strong>Build</strong> then <strong>Step</strong> or <strong>Play</strong></span></div>`;
  // Reset explanation
  document.getElementById('stepExplain'+suf).innerHTML='<div class="step-number">\u2014</div><div class="step-content"><h3>Waiting to start</h3><p class="step-explain">Click Build to begin.</p></div>';
  // Reset pseudocode
  document.getElementById('pseudocode'+suf).querySelectorAll('.line').forEach(l=>l.classList.remove('active'));
  // Reset step log
  document.getElementById('stepLogBody'+suf).innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:16px">Click <strong>Build</strong> to generate steps.</td></tr>';
  // Reset counters
  resetCounters(eng);
  // Algorithm-specific resets
  if(eng.type==='strassen'){
    document.getElementById('prodSummaryS').innerHTML='';
    document.getElementById('dcTreeContainer').innerHTML='<div style="text-align:center;color:var(--text-muted);padding:24px 0;font-size:.86rem;">Click <strong>Build</strong> to see the recursion tree.</div>';
    document.getElementById('dcCallStack').innerHTML='<div class="dc-stack-empty">No active calls</div>';
  }
  if(eng.type==='naiverecur'){
    document.getElementById('rnTreeContainer').innerHTML='<div style="text-align:center;color:var(--text-muted);padding:24px 0;font-size:.86rem;">Click <strong>Build</strong> to see the recursion tree.</div>';
    document.getElementById('rnCallStack').innerHTML='<div class="dc-stack-empty">No active calls</div>';
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  BUILD STEPS
// ═══════════════════════════════════════════════════════════════════════
function buildSteps(eng){
  if(!validateMatrices())return;
  stopAutoPlay(eng);
  const A=readMatrix('matrixA'),B=readMatrix('matrixB');
  eng.steps=[];eng.stepIdx=-1;
  if(eng.type==='strassen'){
    eng.result=strassenGenSteps(A,B,0,'top-level',eng.steps);
    buildRecursionTree(eng);
    renderGenericTree(eng.tree,eng.stepIdx,'dcTreeContainer',null,'#6c8aff');
    updateProductsSummary(eng,null);
  } else if(eng.type==='naiverecur'){
    eng.result=naiveRecurGenSteps(A,B,0,'top-level',eng.steps);
    buildRecursionTree(eng);
    renderGenericTree(eng.tree,eng.stepIdx,'rnTreeContainer',null,'#f97316');
  } else {
    eng.result=naiveGenSteps(A,B,eng.steps);
  }
  eng.inputA=matClone(A);eng.inputB=matClone(B);
  buildStepLog(eng);
  updateProgress(eng);
  setEngineState(eng,'ready');
  renderInitialViz(eng);
  const names={strassen:'Strassen',naive:'Naive',naiverecur:'Naive Recursive'};
  flashValidation('success',`Built ${eng.steps.length} steps for ${names[eng.type]||eng.type}.`);
}

