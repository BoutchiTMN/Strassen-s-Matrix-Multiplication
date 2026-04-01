// ═══════════════════════════════════════════════════════════════════════
//  LIVE COUNTERS
// ═══════════════════════════════════════════════════════════════════════
function updateCounters(eng){
  if(eng.type==='strassen')updateStrassenCounters(eng);
  else if(eng.type==='naiverecur')updateNaiveRecurCounters(eng);
  else updateNaiveCounters(eng);
}
function resetCounters(eng){
  if(eng.type==='strassen'){
    ['sMultsV','sAddsV','sSubsV','sRecurV','sStepsV'].forEach(id=>document.getElementById(id).textContent='0');
    ['sMultsB','sAddsB','sSubsB','sRecurB','sStepsB'].forEach(id=>document.getElementById(id).style.width='0%');
  } else if(eng.type==='naiverecur'){
    ['rMultsV','rAddsV','rRecurV','rStepsV','rDepthV'].forEach(id=>document.getElementById(id).textContent='0');
    ['rMultsB','rAddsB','rRecurB','rStepsB','rDepthB'].forEach(id=>document.getElementById(id).style.width='0%');
  } else {
    ['nMultsV','nAddsV','nCellsV','nStepsV'].forEach(id=>document.getElementById(id).textContent='0');
    document.getElementById('nPctV').textContent='0%';
    ['nMultsB','nAddsB','nCellsB','nStepsB','nPctB'].forEach(id=>document.getElementById(id).style.width='0%');
  }
}
function updateStrassenCounters(eng){
  let mults=0,adds=0,subs=0,recur=0;
  for(let i=0;i<=eng.stepIdx;i++){const s=eng.steps[i];
    if(s.action==='base_case')mults++;
    if(s.action==='prepare_product'){
      if(s.leftOp){const n2=s.leftOp.result.length;if(s.leftOp.op==='add')adds+=n2*n2;if(s.leftOp.op==='sub')subs+=n2*n2}
      if(s.rightOp){const n2=s.rightOp.result.length;if(s.rightOp.op==='add')adds+=n2*n2;if(s.rightOp.op==='sub')subs+=n2*n2}
    }
    if(s.action==='combine_quadrant'){const n2=s.result.length,e=n2*n2;
      if(s.quadrant==='C11'||s.quadrant==='C22'){adds+=2*e;subs+=e}else adds+=e}
    if(s.action==='strassen_enter')recur++;
  }
  const total=eng.steps.length,shown=eng.stepIdx+1;
  document.getElementById('sMultsV').textContent=mults;
  document.getElementById('sAddsV').textContent=adds;
  document.getElementById('sSubsV').textContent=subs;
  document.getElementById('sRecurV').textContent=recur;
  document.getElementById('sStepsV').textContent=`${shown}/${total}`;
  const fm=eng.steps.filter(s=>s.action==='base_case').length||1;
  const fr=eng.steps.filter(s=>s.action==='strassen_enter').length||1;
  document.getElementById('sMultsB').style.width=`${Math.min(100,mults/fm*100)}%`;
  document.getElementById('sRecurB').style.width=`${Math.min(100,recur/fr*100)}%`;
  document.getElementById('sStepsB').style.width=`${total>0?shown/total*100:0}%`;
}
function updateNaiveCounters(eng){
  let mults=0,adds=0,cells=0;
  for(let i=0;i<=eng.stepIdx;i++){const s=eng.steps[i];
    if(s.action==='naive_multiply'){mults++;if(s.k>0)adds++}
    if(s.action==='naive_cell_done')cells++;
  }
  const n=currentSize,totalCells=n*n,totalMults=n*n*n,total=eng.steps.length,shown=eng.stepIdx+1;
  document.getElementById('nMultsV').textContent=mults;
  document.getElementById('nAddsV').textContent=adds;
  document.getElementById('nCellsV').textContent=`${cells}/${totalCells}`;
  document.getElementById('nStepsV').textContent=`${shown}/${total}`;
  document.getElementById('nPctV').textContent=`${totalCells>0?Math.round(cells/totalCells*100):0}%`;
  document.getElementById('nMultsB').style.width=`${totalMults>0?mults/totalMults*100:0}%`;
  document.getElementById('nAddsB').style.width=`${totalMults>0?adds/totalMults*100:0}%`;
  document.getElementById('nCellsB').style.width=`${totalCells>0?cells/totalCells*100:0}%`;
  document.getElementById('nStepsB').style.width=`${total>0?shown/total*100:0}%`;
  document.getElementById('nPctB').style.width=`${totalCells>0?cells/totalCells*100:0}%`;
}
function updateNaiveRecurCounters(eng){
  let mults=0,adds=0,recur=0,maxD=0;
  for(let i=0;i<=eng.stepIdx;i++){const s=eng.steps[i];
    if(s.action==='rn_base')mults++;
    if(s.action==='rn_combine'){const e=s.result.length*s.result.length;adds+=e}
    if(s.action==='rn_enter'){recur++;if(s.depth>maxD)maxD=s.depth}
  }
  const total=eng.steps.length,shown=eng.stepIdx+1;
  const fm=eng.steps.filter(s=>s.action==='rn_base').length||1;
  const fr=eng.steps.filter(s=>s.action==='rn_enter').length||1;
  document.getElementById('rMultsV').textContent=mults;
  document.getElementById('rAddsV').textContent=adds;
  document.getElementById('rRecurV').textContent=recur;
  document.getElementById('rStepsV').textContent=`${shown}/${total}`;
  document.getElementById('rDepthV').textContent=maxD;
  document.getElementById('rMultsB').style.width=`${Math.min(100,mults/fm*100)}%`;
  document.getElementById('rRecurB').style.width=`${Math.min(100,recur/fr*100)}%`;
  document.getElementById('rStepsB').style.width=`${total>0?shown/total*100:0}%`;
  const maxDepth=Math.log2(currentSize)||1;
  document.getElementById('rDepthB').style.width=`${Math.min(100,maxD/maxDepth*100)}%`;
}

