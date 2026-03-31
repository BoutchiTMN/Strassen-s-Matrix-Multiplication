// ═══════════════════════════════════════════════════════════════════════
//  RENDER STEP (dispatches to Strassen or Naive renderer)
// ═══════════════════════════════════════════════════════════════════════
function renderStep(eng){
  if(eng.stepIdx<0||eng.stepIdx>=eng.steps.length)return;
  const step=eng.steps[eng.stepIdx];
  const suf=engSuf(eng);
  // Pseudocode highlight — scroll only inside the pseudocode container, never the page
  const pcContainer=document.getElementById('pseudocode'+suf);
  const pcLines=pcContainer.querySelectorAll('.line');
  pcLines.forEach(l=>l.classList.remove('active'));
  if(step.pcl!=null){const t=pcLines[step.pcl-1];if(t){t.classList.add('active');
    // Manual scroll within the container only
    const ct=t.offsetTop,ch=t.offsetHeight,st=pcContainer.scrollTop,vh=pcContainer.clientHeight;
    if(ct<st+10)pcContainer.scrollTop=Math.max(0,ct-10);
    else if(ct+ch>st+vh-10)pcContainer.scrollTop=ct+ch-vh+10;
  }}
  // Step explanation
  document.getElementById('stepExplain'+suf).innerHTML=`<div class="step-number">${eng.stepIdx+1}</div><div class="step-content"><h3>${stepTitle(eng,step)}</h3><p class="step-explain">${step.explain}</p>${stepFormula(eng,step)}</div>`;
  // Step log highlight
  highlightStepLog(eng);
  // Counters
  updateCounters(eng);
  // SVG Visualization
  if(eng.type==='strassen'){
    renderStrassenSvg(eng,step);
    updateProductsSummary(eng,step);
    updateRecursionTree(eng);
  } else if(eng.type==='naiverecur'){
    renderNaiveRecurSvg(eng,step);
  } else {
    renderNaiveSvg(eng,step);
  }
}

function stepTitle(eng,step){
  const titles={strassen_enter:'Enter Strassen',base_case:'Base Case',split:'Split Matrices',
    prepare_product:'Prepare Product',product_complete:'Product Done',combine_quadrant:'Combine',
    join:'Join Result',naive_start:'Begin',naive_init:'Initialize',naive_cell_start:'Start Cell',
    naive_multiply:'Multiply & Add',naive_cell_done:'Cell Done',naive_complete:'Complete',
    rn_enter:'Enter Recursive',rn_base:'Base Case',rn_split:'Split Matrices',
    rn_multiply:'Recursive Multiply',rn_prod_done:'Product Done',rn_combine:'Combine Quadrant',rn_join:'Join Result'};
  let t=titles[step.action]||step.action;
  if(step.product){const p=pcFor(step.product);t+=' \u2014 '+(p?p.label:step.product)}
  if(step.quadrant)t+=' \u2014 '+step.quadrant;
  if(step.i>=0&&step.j>=0)t+=` [${step.i+1},${step.j+1}]`;
  return t;
}
function stepFormula(eng,step){
  if(step.formula)return`<div class="step-formula">${step.product?((pcFor(step.product)||{}).label||step.product)+' = ':''}${step.formula}</div>`;
  if(step.action==='naive_multiply')return`<div class="step-formula">sum += ${step.aVal} \u00d7 ${step.bVal} = ${step.prod} \u2192 sum = ${step.sum}</div>`;
  if(step.action==='naive_cell_done')return`<div class="step-formula">C[${step.i+1}][${step.j+1}] = ${step.sum}</div>`;
  return'';
}

