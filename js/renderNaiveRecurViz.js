// ═══════════════════════════════════════════════════════════════════════
//  SVG RENDERING — NAIVE RECURSIVE (reuses Strassen-style region highlighting)
// ═══════════════════════════════════════════════════════════════════════
function renderNaiveRecurSvg(eng,step){
  if(!eng.inputA)return;
  const viz=document.getElementById('vizR');
  const n=currentSize,A=eng.inputA,B=eng.inputB;
  const C=matZeros(n);
  // Only commit finalized results from depth-0 combine or join
  if(step)for(let i=0;i<=eng.stepIdx;i++){const s=eng.steps[i];
    if(s.action==='rn_combine'&&s.depth===0&&s.cTargetReg&&s.result){
      const rg=s.cTargetReg;for(let r=0;r<rg.sz;r++)for(let c=0;c<rg.sz;c++)C[rg.r+r][rg.c+c]=s.result[r][c]}
    if(s.action==='rn_join'&&s.depth===0&&s.result)for(let r=0;r<n;r++)for(let c=0;c<n;c++)C[r][c]=s.result[r][c]}
  let showPart=step!=null,info=step?step.explain:'Ready',formula='';
  let aBoxes=[],bBoxes=[],cBoxes=[];
  if(step){
    const col='#f97316';// orange for naive recursive
    // Ancestor region walk-back
    if(step.aReg&&step.aReg.sz<n){
      const ancestors=[];let prevDepth=step.depth;
      for(let i=eng.stepIdx;i>=0;i--){const s=eng.steps[i];
        if(s.action==='rn_enter'&&s.depth<prevDepth&&s.aReg){
          ancestors.unshift({aReg:s.aReg,bReg:s.bReg,cReg:s.cReg});
          prevDepth=s.depth;if(s.depth===0)break}}
      for(let a=0;a<ancestors.length;a++){
        const anc=ancestors[a],alpha=0.06+a*0.04,sw=1+a*0.3;
        if(anc.aReg.sz<n)aBoxes.push({...anc.aReg,fill:`rgba(249,115,22,${alpha})`,stroke:'#b45309',sw});
        if(anc.bReg.sz<n)bBoxes.push({...anc.bReg,fill:`rgba(249,115,22,${alpha})`,stroke:'#b45309',sw});
        if(anc.cReg.sz<n)cBoxes.push({...anc.cReg,fill:`rgba(249,115,22,${alpha})`,stroke:'#b45309',sw});
      }
    }
    // Current step highlights
    if((step.action==='rn_multiply'||step.action==='rn_prod_done')&&step.aRegs){
      for(const rg of step.aRegs)aBoxes.push({...rg,fill:'rgba(249,115,22,0.18)',stroke:col,sw:2});
      for(const rg of step.bRegs)bBoxes.push({...rg,fill:'rgba(249,115,22,0.18)',stroke:col,sw:2});
      if(step.cTargetReg)cBoxes.push({...step.cTargetReg,fill:'rgba(52,211,153,0.1)',stroke:'#34d399',sw:1.5});
      formula=`${step.left} \u00d7 ${step.right} \u2192 ${step.cq}`;
    }
    if(step.action==='rn_base'&&step.aReg){
      aBoxes.push({...step.aReg,fill:'rgba(251,191,36,0.2)',stroke:'#fbbf24',sw:2});
      bBoxes.push({...step.bReg,fill:'rgba(251,191,36,0.2)',stroke:'#fbbf24',sw:2});
    }
    if(step.action==='rn_combine'&&step.cTargetReg){
      cBoxes.push({...step.cTargetReg,fill:'rgba(52,211,153,0.18)',stroke:'#34d399',sw:2});
      formula=`${step.quadrant} = ${step.left1} + ${step.left2}`;
    }
    if(step.action==='rn_split'&&step.qrA){
      ['A11','A12','A21','A22'].forEach(k=>aBoxes.push({...step.qrA[k],fill:'rgba(249,115,22,0.08)',stroke:'#b45309',sw:1.5}));
      ['B11','B12','B21','B22'].forEach(k=>bBoxes.push({...step.qrB[k],fill:'rgba(249,115,22,0.08)',stroke:'#b45309',sw:1.5}));
    }
    if(step.action==='rn_join'&&step.cReg)cBoxes.push({...step.cReg,fill:'rgba(52,211,153,0.1)',stroke:'#34d399',sw:1.5});
  }
  const svgStr=buildMatrixSvgWithRegions(A,B,C,n,showPart,aBoxes,bBoxes,cBoxes,info,formula);
  // Build operation banner
  let banner='<div class="viz-op-banner">';
  if(!step){banner+='<div class="math-line-xs" style="color:var(--text-muted);text-align:center;padding:6px 0">Click Build then Step or Play.</div>'}
  else if(step.action==='rn_enter'){
    banner+=`<div class="math-line"><span class="op-type-tag op-tag-init">ENTER</span>rec_naive(${mn(step.n)}\u00d7${mn(step.n)}) depth ${mn(step.depth)}</div>`;
  }else if(step.action==='rn_base'&&step.scalar){
    banner+=`<div class="math-line"><span class="op-type-tag op-tag-mult">\u00d7</span>${mn(step.scalar.l)}${mo('\u00d7')}${mn(step.scalar.r)}${meq()}${mr(step.scalar.p)}</div>`;
  }else if(step.action==='rn_split'){
    banner+=`<div class="math-line"><span class="op-type-tag op-tag-split">SPLIT</span>${mv('A')},${mv('B')} \u2192 4 quadrants of ${mn(step.n/2)}\u00d7${mn(step.n/2)}</div>`;
  }else if(step.action==='rn_multiply'){
    banner+=`<div class="math-line"><span class="op-type-tag op-tag-mult">\u00d7</span>${mq(step.left)}${mo('\u00d7')}${mq(step.right)}${mo('\u2192')}${mr(ql(step.cq))}</div>`;
  }else if(step.action==='rn_prod_done'){
    const vs=step.result.length===1?String(step.result[0][0]):matStr(step.result);
    banner+=`<div class="math-line"><span class="op-type-tag op-tag-result">\u2713</span>${mq(step.left)}${mo('\u00d7')}${mq(step.right)}${meq()}${mr(vs)}</div>`;
  }else if(step.action==='rn_combine'){
    const vs=step.result.length===1?String(step.result[0][0]):matStr(step.result);
    banner+=`<div class="math-line"><span class="op-type-tag op-tag-combine">ADD</span>${mr(ql(step.quadrant))}${meq()}${mn(step.left1)}${mo('+')}${mn(step.left2)}</div>`;
    banner+=`<div class="math-line-sm">${meq()}${mr(vs)}</div>`;
  }else if(step.action==='rn_join'){
    banner+=`<div class="math-line"><span class="op-type-tag op-tag-result">JOIN</span>${mv('C')}${meq()}combine(${mq('C11')},${mq('C12')},${mq('C21')},${mq('C22')})</div>`;
  }else{
    banner+=`<div class="math-line-xs">${step.explain||''}</div>`;
  }
  banner+='</div>';
  viz.innerHTML=svgStr+banner;
}

