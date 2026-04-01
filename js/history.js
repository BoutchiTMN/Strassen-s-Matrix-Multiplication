// ═══════════════════════════════════════════════════════════════════════
//  STEP LOG
// ═══════════════════════════════════════════════════════════════════════
function buildStepLog(eng){
  const suf=engSuf(eng);
  const tbody=document.getElementById('stepLogBody'+suf);
  let html='';
  const actionMeta={strassen_enter:{l:'ENTER',c:'la-enter'},base_case:{l:'BASE',c:'la-base'},split:{l:'SPLIT',c:'la-split'},
    prepare_product:{l:'PREP',c:'la-prep'},product_complete:{l:'DONE',c:'la-done'},combine_quadrant:{l:'COMB',c:'la-combine'},
    join:{l:'JOIN',c:'la-done'},naive_start:{l:'START',c:'la-meta'},naive_init:{l:'INIT',c:'la-meta'},
    naive_cell_start:{l:'CELL',c:'la-cell'},naive_multiply:{l:'MULT',c:'la-mult'},naive_cell_done:{l:'DONE',c:'la-done'},
    naive_complete:{l:'END',c:'la-done'},
    rn_enter:{l:'ENTER',c:'la-enter'},rn_base:{l:'BASE',c:'la-base'},rn_split:{l:'SPLIT',c:'la-split'},
    rn_multiply:{l:'MULT',c:'la-mult'},rn_prod_done:{l:'DONE',c:'la-done'},rn_combine:{l:'COMB',c:'la-combine'},rn_join:{l:'JOIN',c:'la-done'}};
  for(let i=0;i<eng.steps.length;i++){const s=eng.steps[i];
    const meta=actionMeta[s.action]||{l:s.action,c:'la-meta'};
    const desc=s.explain.length>50?s.explain.slice(0,49)+'\u2026':s.explain;
    const line=s.pcl!=null?s.pcl:'';
    let extra='';
    if(eng.type==='strassen'||eng.type==='naiverecur')extra=s.depth!=null?`<span class="log-depth">${s.depth}</span>`:'';
    else extra=s.i>=0?`${s.i+1},${s.j+1}${s.k>=0?','+String(s.k+1):''}`:'\u2014';
    html+=`<tr data-step="${i}"><td class="cell-mono">${i+1}</td><td><span class="log-action-badge ${meta.c}">${meta.l}</span></td><td class="log-explain" title="${escSvg(s.explain)}">${escSvg(desc)}</td><td class="cell-mono">${line}</td><td>${extra}</td></tr>`;
  }
  tbody.innerHTML=html;
  tbody.onclick=function(e){const row=e.target.closest('tr[data-step]');if(row)jumpToStep(eng,parseInt(row.dataset.step))};
}
function highlightStepLog(eng){
  const suf=engSuf(eng);
  const tbody=document.getElementById('stepLogBody'+suf);
  const wrap=document.getElementById('stepLogWrap'+suf);
  tbody.querySelectorAll('tr').forEach(r=>r.classList.remove('log-active'));
  const row=tbody.querySelector(`tr[data-step="${eng.stepIdx}"]`);
  if(row){row.classList.add('log-active');
    const rt=row.offsetTop,rh=row.offsetHeight,st=wrap.scrollTop,vh=wrap.clientHeight;
    if(rt<st+30)wrap.scrollTop=Math.max(0,rt-30);
    else if(rt+rh>st+vh-20)wrap.scrollTop=rt+rh-vh+20;
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  STRASSEN PRODUCTS SUMMARY
// ═══════════════════════════════════════════════════════════════════════
function updateProductsSummary(eng,step){
  const container=document.getElementById('prodSummaryS');
  const done=new Set();
  for(let i=0;i<=eng.stepIdx;i++)if(eng.steps[i].action==='product_complete'&&eng.steps[i].depth===0)done.add(eng.steps[i].product);
  let html='';
  for(let i=0;i<7;i++){const pc=PC[i];const isDone=done.has(pc.id);
    let val='\u2014';if(isDone)for(let j=0;j<=eng.stepIdx;j++){const s=eng.steps[j];if(s.action==='product_complete'&&s.depth===0&&s.product===pc.id){val=s.result.length===1?s.result[0][0]:matStr(s.result);break}}
    const cls=isDone?'product-pill pp-done':'product-pill';
    html+=`<div class="${cls}" style="--pill-color:${pc.hex}"><div class="pp-label" style="color:${pc.hex}">${pc.label}</div><div class="pp-val">${val}</div></div>`;
  }
  container.innerHTML=html;
}

