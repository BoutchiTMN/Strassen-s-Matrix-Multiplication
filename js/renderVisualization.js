// ═══════════════════════════════════════════════════════════════════════
//  SVG RENDERING — STRASSEN
// ═══════════════════════════════════════════════════════════════════════

function renderInitialViz(eng){
  if(eng.type==='strassen')renderStrassenSvg(eng,null);
  else if(eng.type==='naiverecur')renderNaiveRecurSvg(eng,null);
  else renderNaiveSvg(eng,null);
}

function renderStrassenSvg(eng,step){
  if(!eng.inputA)return;
  const viz=document.getElementById('vizS');
  const n=currentSize,A=eng.inputA,B=eng.inputB;
  const C=matZeros(n);const h=n/2;
  // Only commit finalized results into C:
  // - For n<=2: show combine results immediately (single recursion level, clear enough)
  // - For n>=4: only show values after the top-level join completes,
  //   OR after a top-level (depth 0) combine_quadrant finalizes a full quadrant
  if(step)for(let i=0;i<=eng.stepIdx;i++){const s=eng.steps[i];
    if(n<=2&&s.action==='combine_quadrant'&&s.cTargetReg&&s.result){
      const rg=s.cTargetReg;for(let r=0;r<rg.sz;r++)for(let c=0;c<rg.sz;c++)C[rg.r+r][rg.c+c]=s.result[r][c]}
    if(n>2&&s.action==='combine_quadrant'&&s.depth===0&&s.cTargetReg&&s.result){
      const rg=s.cTargetReg;for(let r=0;r<rg.sz;r++)for(let c=0;c<rg.sz;c++)C[rg.r+r][rg.c+c]=s.result[r][c]}
    if(s.action==='join'&&s.depth===0&&s.result)for(let r=0;r<n;r++)for(let c=0;c<n;c++)C[r][c]=s.result[r][c]}
  // Build nested region highlights
  let showPart=step!=null,info=step?step.explain:'Ready',formula='';
  // regionBoxes: arrays of {r,c,sz,fill,stroke,sw} to overlay on A, B, C grids
  let aBoxes=[],bBoxes=[],cBoxes=[];

  if(step){
    // Find the active product color by walking back through ancestors
    let activePC=step.product?pcFor(step.product):null;
    if(!activePC&&step.depth>0){
      for(let i=eng.stepIdx;i>=0;i--){const s=eng.steps[i];
        if(s.depth<step.depth&&s.product){activePC=pcFor(s.product);break}}}
    const col=activePC?activePC.hex:'#6c8aff';
    const fillOuter=activePC?activePC.fill:'rgba(108,138,255,0.1)';

    // Collect the hierarchy of aReg/bReg from all ancestor enter steps
    // This gives us nested boxes from outermost to innermost
    if(step.aReg&&step.aReg.sz<n){
      // Walk back to find all ancestor regions for nested boxes
      const ancestors=[];let prevDepth=step.depth;
      for(let i=eng.stepIdx;i>=0;i--){const s=eng.steps[i];
        if(s.action==='strassen_enter'&&s.depth<prevDepth&&s.aReg){
          ancestors.unshift({aReg:s.aReg,bReg:s.bReg,cReg:s.cReg,depth:s.depth});
          prevDepth=s.depth;if(s.depth===0)break}}
      // Draw ancestor boxes (outer = dimmer, inner = brighter)
      for(let a=0;a<ancestors.length;a++){
        const anc=ancestors[a];
        const alpha=0.06+a*0.04;const sw=1+a*0.3;
        if(anc.aReg.sz<n)aBoxes.push({...anc.aReg,fill:`rgba(108,138,255,${alpha})`,stroke:'#5b6eae',sw});
        if(anc.bReg.sz<n)bBoxes.push({...anc.bReg,fill:`rgba(108,138,255,${alpha})`,stroke:'#5b6eae',sw});
        if(anc.cReg.sz<n)cBoxes.push({...anc.cReg,fill:`rgba(108,138,255,${alpha})`,stroke:'#5b6eae',sw});
      }
    }
    // Current step specific highlights
    if(step.action==='prepare_product'&&step.aRegs){
      for(const rg of step.aRegs)aBoxes.push({...rg,fill:fillOuter,stroke:col,sw:2});
      for(const rg of step.bRegs)bBoxes.push({...rg,fill:fillOuter,stroke:col,sw:2});
      if(step.cTargets)for(const rg of step.cTargets)cBoxes.push({...rg,fill:fillOuter.replace('0.18','0.08'),stroke:col,sw:1});
      formula=`${activePC?activePC.label:step.product} = ${step.formula}`;
    }
    if(step.action==='product_complete'&&step.aRegs){
      for(const rg of step.aRegs)aBoxes.push({...rg,fill:fillOuter,stroke:col,sw:1.5});
      for(const rg of step.bRegs)bBoxes.push({...rg,fill:fillOuter,stroke:col,sw:1.5});
      if(step.cTargets)for(const rg of step.cTargets)cBoxes.push({...rg,fill:'rgba(52,211,153,0.08)',stroke:col,sw:1});
    }
    if(step.action==='base_case'&&step.aReg){
      aBoxes.push({...step.aReg,fill:'rgba(251,191,36,0.2)',stroke:'#fbbf24',sw:2});
      bBoxes.push({...step.bReg,fill:'rgba(251,191,36,0.2)',stroke:'#fbbf24',sw:2});
    }
    if(step.action==='combine_quadrant'&&step.cTargetReg){
      cBoxes.push({...step.cTargetReg,fill:'rgba(52,211,153,0.18)',stroke:'#34d399',sw:2});
      formula=`${step.quadrant} = ${step.formula}`;
    }
    if(step.action==='join'&&step.cReg){
      cBoxes.push({...step.cReg,fill:'rgba(52,211,153,0.1)',stroke:'#34d399',sw:1.5});
    }
    if(step.action==='split'&&step.qrA){
      ['A11','A12','A21','A22'].forEach(k=>{const rg=step.qrA[k];aBoxes.push({...rg,fill:'rgba(108,138,255,0.08)',stroke:'#5b6eae',sw:1.5})});
      ['B11','B12','B21','B22'].forEach(k=>{const rg=step.qrB[k];bBoxes.push({...rg,fill:'rgba(108,138,255,0.08)',stroke:'#5b6eae',sw:1.5})});
    }
  }
  const svgStr=buildMatrixSvgWithRegions(A,B,C,n,showPart,aBoxes,bBoxes,cBoxes,info,formula);
  const banner=buildStrassenOpBanner(eng,step);
  viz.innerHTML=svgStr+banner;
}

/** Draw region overlay boxes using absolute row/col coordinates */
function drawRegionBoxes(mx,my,n,cs,gap,boxes){
  let s='';
  for(const b of boxes){
    const x=mx+b.c*(cs+gap)-1,y=my+b.r*(cs+gap)-1;
    const w=b.sz*cs+(b.sz-1)*gap+2,ht=b.sz*cs+(b.sz-1)*gap+2;
    s+=`<rect x="${x}" y="${y}" width="${w}" height="${ht}" rx="4" fill="${b.fill}" stroke="${b.stroke}" stroke-width="${b.sw}" style="animation:vizFadeIn .2s ease"/>`;
  }
  return s;
}

/** Matrix SVG builder that uses region-based highlighting instead of quadrant names */
function buildMatrixSvgWithRegions(A,B,C,n,showPart,aBoxes,bBoxes,cBoxes,info,formula){
  const cs=n<=2?32:n<=4?22:n<=8?14:8;
  const gp=n<=8?2:1;
  const matW=n*cs+(n-1)*gp;
  const opW=n<=2?24:n<=4?20:n<=8?14:10,padX=n<=8?14:10;
  const infoH=12,formulaH=formula?14:0,gapAfterInfo=6,labelH=10,gapAfterLabel=4,botH=8;
  const topH=infoH+formulaH+gapAfterInfo+labelH+gapAfterLabel;
  const contentW=padX*2+matW*3+opW*2,contentH=topH+matW+botH;
  const vbPadX=Math.round(contentW*0.25),vbPadY=Math.round(contentH*0.22);
  const vbW=contentW+vbPadX*2,vbH=contentH+vbPadY*2;
  const ox=vbPadX,oy=vbPadY;
  const totalW=contentW;
  const matY=topH,ax=padX,bx=padX+matW+opW,cx=bx+matW+opW;
  const infoY=infoH,formulaY=infoH+formulaH,labelY=infoH+formulaH+gapAfterInfo+labelH-2;
  let svg=`<svg class="viz-svg" viewBox="0 0 ${vbW} ${vbH}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;">`;
  svg+=`<rect width="${vbW}" height="${vbH}" fill="#1c1f2e"/>`;
  svg+=`<g transform="translate(${ox},${oy})">`;
  svg+=`<text x="${totalW/2}" y="${infoY}" text-anchor="middle" class="viz-title">${escSvg(info.length>70?info.slice(0,69)+'\u2026':info)}</text>`;
  if(formula)svg+=`<text x="${totalW/2}" y="${formulaY}" text-anchor="middle" class="viz-info" font-size="8">${escSvg(formula)}</text>`;
  svg+=`<text x="${ax+matW/2}" y="${labelY}" text-anchor="middle" class="viz-mat-label" fill="#a78bfa">A</text>`;
  svg+=`<text x="${bx+matW/2}" y="${labelY}" text-anchor="middle" class="viz-mat-label" fill="#f97316">B</text>`;
  svg+=`<text x="${cx+matW/2}" y="${labelY}" text-anchor="middle" class="viz-mat-label" fill="#34d399">C</text>`;
  const opY_=matY+matW/2+3;
  svg+=`<text x="${ax+matW+opW/2}" y="${opY_}" text-anchor="middle" class="viz-op">\u00d7</text>`;
  svg+=`<text x="${bx+matW+opW/2}" y="${opY_}" text-anchor="middle" class="viz-op">=</text>`;
  // Draw matrix cells
  svg+=drawMatrix(A,ax,matY,n,cs,gp,null,showPart,'A');
  svg+=drawMatrix(B,bx,matY,n,cs,gp,null,showPart,'B');
  svg+=drawMatrixC(C,cx,matY,n,cs,gp,showPart);
  // Draw region overlays (nested boxes)
  svg+=drawRegionBoxes(ax,matY,n,cs,gp,aBoxes);
  svg+=drawRegionBoxes(bx,matY,n,cs,gp,bBoxes);
  svg+=drawRegionBoxes(cx,matY,n,cs,gp,cBoxes);
  svg+='</g></svg>';
  return svg;
}

// ── Math formatting helpers ──
function mv(name){return`<span class="m-var">${name}</span>`} // italic variable
function mi(base,sub){return`<span class="m-mat">${base}</span><span class="m-idx">${sub}</span>`} // matrix subscript
function mo(op){return`<span class="m-op">${op}</span>`} // operator
function meq(){return`<span class="m-eq">=</span>`}
function mn(v){return`<span class="m-num">${v}</span>`} // number
function mr(v){return`<span class="m-res">${v}</span>`} // result (green)
function mp(v){return`<span class="m-paren">${v}</span>`} // paren
function mpc(name,color){return`<span class="m-pname" style="color:${color}">${name}</span>`} // product name colored

// ── Display-name mapping: A11→a, B12→f, C21→r, etc. ──
const QMAP={A11:'a',A12:'b',A21:'c',A22:'d',B11:'e',B12:'f',B21:'g',B22:'h'};
/** Convert internal quadrant name to display letter */
function ql(name){return QMAP[name]||name}
/** Format a quadrant name as styled HTML: italic letter */
function mq(name){const l=QMAP[name];return l?`<span class="m-var">${l}</span>`:mi(name[0],name.slice(1))}
/** Format for SVG text: just the letter */
function qlSvg(name){return QMAP[name]||name}

/** Build the operation banner HTML for Strassen (math-style) */
function buildStrassenOpBanner(eng,step){
  if(!step)return`<div class="viz-op-banner"><div class="math-line-xs" style="color:var(--text-muted);text-align:center;padding:6px 0">Click Build then Step or Play to see the live derivation.</div></div>`;
  const pc=step.product?pcFor(step.product):null;
  const pcC=pc?pc.hex:'#6c8aff';
  let lines=[];// each: {cls:'math-line'|'math-line-sm'|'math-line-xs', tag:'', html:''}

  if(step.action==='strassen_enter'){
    lines.push({cls:'math-line',tag:'op-tag-init',tl:'ENTER',
      h:`Strassen${mp('(')}${mv('A')},&thinsp;${mv('B')}${mp(')')}&ensp;\u2014&ensp;${mn(step.n)}\u00d7${mn(step.n)} matrices`});
    lines.push({cls:'math-line-xs',h:step.depth>0?`Recursion depth ${mn(step.depth)}`:'Top-level call'});
  }
  else if(step.action==='split'){
    const h=step.n/2;
    lines.push({cls:'math-line',tag:'op-tag-split',tl:'SPLIT',
      h:`${mv('A')}${mo('\u2192')}${mp('[')}${mq('A11')},&thinsp;${mq('A12')},&thinsp;${mq('A21')},&thinsp;${mq('A22')}${mp(']')}`
       +`&emsp;${mv('B')}${mo('\u2192')}${mp('[')}${mq('B11')},&thinsp;${mq('B12')},&thinsp;${mq('B21')},&thinsp;${mq('B22')}${mp(']')}`});
    lines.push({cls:'math-line-xs',h:`Each quadrant is ${mn(h)}\u00d7${mn(h)}`});
  }
  else if(step.action==='prepare_product'&&step.leftOp&&step.rightOp){
    const lo=step.leftOp,ro=step.rightOp;
    const pLabel=pc?pc.label:step.product;
    function fmtOperand(op){
      if(op.op==='id')return mq(op.names[0]);
      return`${mp('(')}${mq(op.names[0])}${mo(op.op==='add'?'+':'\u2212')}${mq(op.names[1])}${mp(')')}`;
    }
    // Line 1: symbolic formula
    lines.push({cls:'math-line',tag:'op-tag-mult',tl:pLabel,tc:pcC,
      h:`${mpc(pLabel,pcC)}${meq()}${fmtOperand(lo)}${mo('\u00d7')}${fmtOperand(ro)}`});
    // Line 2: numeric substitution
    const lv=lo.result,rv=ro.result;
    if(lv.length===1&&rv.length===1){
      const L=lv[0][0],R=rv[0][0];
      // Show (a + b) = val × val = product
      function numOp(op){
        if(op.op==='id')return mn(op.result[0][0]);
        const va=eng.inputA||[[0]],vb=eng.inputB||[[0]];
        // We can't reliably recover operand values, so just show the result
        return mn(op.result[0][0]);
      }
      lines.push({cls:'math-line-sm',h:`${meq()}${mn(L)}${mo('\u00d7')}${mn(R)}${meq()}${mr(L*R)}`});
    } else {
      lines.push({cls:'math-line-sm',h:`${meq()}${mn(matStr(lv))}${mo('\u00d7')}${mn(matStr(rv))}`});
    }
  }
  else if(step.action==='base_case'&&step.scalar){
    const{l,r,p}=step.scalar;
    lines.push({cls:'math-line',tag:'op-tag-mult',tl:'\u00d7',
      h:`${mn(l)}${mo('\u00d7')}${mn(r)}${meq()}${mr(p)}`});
    lines.push({cls:'math-line-xs',h:`Scalar multiplication at depth ${mn(step.depth)}`});
  }
  else if(step.action==='product_complete'){
    const pLabel=pc?pc.label:step.product;
    const valStr=step.result.length===1?String(step.result[0][0]):matStr(step.result);
    lines.push({cls:'math-line',tag:'op-tag-result',tl:'\u2713',tc:pcC,
      h:`${mpc(pLabel,pcC)}${meq()}${mr(valStr)}`});
    // Show formula reminder
    lines.push({cls:'math-line-xs',h:`from ${step.formula}`});
  }
  else if(step.action==='combine_quadrant'){
    const valStr=step.result.length===1?String(step.result[0][0]):matStr(step.result);
    // Build formula from tokens — NOT regex on HTML
    const tokens=step.formula.match(/[A-Z]\d|[+\-]/g)||[];
    let fHtml='';
    for(const tok of tokens){
      if(tok==='+'){ fHtml+=mo('+'); }
      else if(tok==='-'){ fHtml+=mo('\u2212'); }
      else {
        // tok is like P1, P2, M1, M2 etc — or C11
        const pIdx=parseInt(tok[1])-1;
        const c=PC[pIdx];
        const label='P'+tok[1];
        fHtml+=c?mpc(label,c.hex):mpc(label,'#6c8aff');
      }
    }
    lines.push({cls:'math-line',tag:'op-tag-combine',tl:'COMBINE',
      h:`${mr(ql(step.quadrant))}${meq()}${fHtml}`});
    lines.push({cls:'math-line-sm',h:`${meq()}${mr(valStr)}`});
  }
  else if(step.action==='join'){
    const valStr=step.result?matStr(step.result):'';
    lines.push({cls:'math-line',tag:'op-tag-result',tl:'JOIN',
      h:`${mv('C')}${meq()}${mp('[')}${mq('C11')}&ensp;${mq('C12')}&ensp;${mq('C21')}&ensp;${mq('C22')}${mp(']')}`});
    if(valStr)lines.push({cls:'math-line-sm',h:`${mv('C')}${meq()}${mn(valStr)}`});
  }
  else{
    lines.push({cls:'math-line-xs',tag:'op-tag-init',tl:'INFO',h:step.explain||''});
  }
  // Render
  let html='<div class="viz-op-banner">';
  for(const ln of lines){
    let tagH='';
    if(ln.tag){const tc=ln.tc||'';tagH=`<span class="op-type-tag ${ln.tag}"${tc?` style="background:${tc}22;color:${tc}"`:``}>${ln.tl||''}</span>`}
    html+=`<div class="${ln.cls}">${tagH}${ln.h}</div>`;
  }
  html+='</div>';return html;
}

function renderNaiveSvg(eng,step){
  if(!eng.inputA)return;
  const viz=document.getElementById('vizN');
  const n=currentSize,A=eng.inputA,B=eng.inputB;
  const C=matZeros(n);
  if(step)for(let i=0;i<=eng.stepIdx;i++){const s=eng.steps[i];if(s.action==='naive_cell_done')C[s.i][s.j]=s.sum}
  let aHL=[],bHL=[],cHL=[],info='Ready';
  if(step){
    info=step.explain;
    if(step.action==='naive_cell_start'||step.action==='naive_multiply'){
      for(let c=0;c<n;c++)aHL.push({r:step.i,c,cls:step.action==='naive_multiply'&&c===step.k?'mult':'read'});
      for(let r=0;r<n;r++)bHL.push({r,c:step.j,cls:step.action==='naive_multiply'&&r===step.k?'mult':'read'});
      cHL.push({r:step.i,c:step.j,cls:'write'});
    }
    if(step.action==='naive_cell_done'){cHL.push({r:step.i,c:step.j,cls:'done'})}
  }
  const svgStr=buildNaiveMatrixSvg(A,B,C,n,aHL,bHL,cHL,info,step);
  const banner=buildNaiveOpBanner(eng,step);
  viz.innerHTML=svgStr+banner;
}

/** Build the operation banner HTML for Naive (math-style) */
function buildNaiveOpBanner(eng,step){
  if(!step)return`<div class="viz-op-banner"><div class="math-line-xs" style="color:var(--text-muted);text-align:center;padding:6px 0">Click Build then Step or Play to see the live derivation.</div></div>`;
  let lines=[];
  const I=step.i>=0?step.i+1:0,J=step.j>=0?step.j+1:0,K=step.k>=0?step.k+1:0;

  if(step.action==='naive_start'){
    lines.push({cls:'math-line',tag:'op-tag-init',tl:'BEGIN',
      h:`${mv('C')}${meq()}${mv('A')}${mo('\u00d7')}${mv('B')}&emsp;${mp('(')}${mn(step.n)}\u00d7${mn(step.n)}${mp(')')}`});
  }
  else if(step.action==='naive_init'){
    lines.push({cls:'math-line',tag:'op-tag-init',tl:'INIT',
      h:`${mv('C')}${meq()}${mn('0')}&ensp;for all entries`});
  }
  else if(step.action==='naive_cell_start'){
    const A=eng.inputA,B=eng.inputB,n=currentSize;
    // Line 1: Which cell, as dot product
    lines.push({cls:'math-line',tag:'op-tag-init',tl:`C<sub>${I}${J}</sub>`,
      h:`${mv('C')}${mp('[')}${mn(I)}${mp('][')}${mn(J)}${mp(']')}${meq()}`
       +`row ${mn(I)} of ${mv('A')}${mo('\u00b7')}column ${mn(J)} of ${mv('B')}`});
    // Line 2: Show the vectors
    const rowV=A[step.i].map(v=>mn(v)).join(`${mp(',')}&thinsp;`);
    const colV=Array.from({length:n},(_,r)=>mn(B[r][step.j])).join(`${mp(',')}&thinsp;`);
    lines.push({cls:'math-line-sm',
      h:`${meq()}${mp('(')}${rowV}${mp(')')}${mo('\u00b7')}${mp('(')}${colV}${mp(')')}`});
  }
  else if(step.action==='naive_multiply'){
    const prevSum=step.sum-step.prod;
    // Line 1: Symbolic — A[i][k] × B[k][j]
    lines.push({cls:'math-line',tag:'op-tag-mult',tl:'\u00d7',
      h:`${mv('A')}${mp('[')}${mn(I)}${mp('][')}${mn(K)}${mp(']')}`
       +`${mo('\u00d7')}`
       +`${mv('B')}${mp('[')}${mn(K)}${mp('][')}${mn(J)}${mp(']')}`
       +`${meq()}`
       +`${mn(step.aVal)}${mo('\u00d7')}${mn(step.bVal)}${meq()}${mr(step.prod)}`});
    // Line 2: Running sum
    if(step.k>0){
      lines.push({cls:'math-line-sm',
        h:`sum${meq()}${mn(prevSum)}${mo('+')}${mn(step.prod)}${meq()}${mr(step.sum)}`});
    } else {
      lines.push({cls:'math-line-sm',h:`sum${meq()}${mr(step.prod)}`});
    }
    // Line 3: progress context
    lines.push({cls:'math-line-xs',h:`term ${mn(K)} of ${mn(currentSize)} for ${mv('C')}${mp('[')}${mn(I)}${mp('][')}${mn(J)}${mp(']')}`});
  }
  else if(step.action==='naive_cell_done'){
    const A=eng.inputA,B=eng.inputB,n=currentSize;
    // Line 1: Result
    lines.push({cls:'math-line',tag:'op-tag-result',tl:'\u2713',
      h:`${mv('C')}${mp('[')}${mn(I)}${mp('][')}${mn(J)}${mp(']')}${meq()}${mr(step.sum)}`});
    // Line 2: Full dot product expansion
    const terms=Array.from({length:n},(_,k)=>`${mn(A[step.i][k])}${mo('\u00d7')}${mn(B[k][step.j])}`).join(mo('+'));
    lines.push({cls:'math-line-sm',h:`${meq()}${terms}${meq()}${mr(step.sum)}`});
  }
  else if(step.action==='naive_complete'){
    const valStr=step.result?matStr(step.result):'';
    lines.push({cls:'math-line',tag:'op-tag-result',tl:'DONE',h:`Multiplication complete`});
    if(valStr)lines.push({cls:'math-line-sm',h:`${mv('C')}${meq()}${mn(valStr)}`});
  }
  else{
    lines.push({cls:'math-line-xs',tag:'op-tag-init',tl:'INFO',h:step.explain||''});
  }
  let html='<div class="viz-op-banner">';
  for(const ln of lines){
    let tagH='';
    if(ln.tag){const tc=ln.tc||'';tagH=`<span class="op-type-tag ${ln.tag}"${tc?` style="background:${tc}22;color:${tc}"`:``}>${ln.tl||''}</span>`}
    html+=`<div class="${ln.cls}">${tagH}${ln.h}</div>`;
  }
  html+='</div>';return html;
}

function drawMatrix(M,mx,my,n,cs,gap,cellHL,showPart,prefix){
  let s='';const h=n/2,matW=n*cs+(n-1)*gap;
  for(let r=0;r<n;r++)for(let c=0;c<n;c++){
    const x=mx+c*(cs+gap),y=my+r*(cs+gap);
    s+=`<rect x="${x}" y="${y}" width="${cs}" height="${cs}" rx="3" fill="#232738" stroke="#2a2e3f" stroke-width="1"/>`;
    s+=`<text x="${x+cs/2}" y="${y+cs/2+1}" text-anchor="middle" dominant-baseline="middle" class="viz-cell-text" font-size="${n<=2?10:n<=4?7.5:n<=8?5.5:3.8}">${M[r][c]}</text>`;
  }
  if(showPart&&n>1){
    const px=mx+h*(cs+gap)-gap/2,py=my+h*(cs+gap)-gap/2;
    s+=`<line x1="${px}" y1="${my-3}" x2="${px}" y2="${my+matW+3}" stroke="#5b6eae" stroke-width="1.5" stroke-dasharray="4,3"/>`;
    s+=`<line x1="${mx-3}" y1="${py}" x2="${mx+matW+3}" y2="${py}" stroke="#5b6eae" stroke-width="1.5" stroke-dasharray="4,3"/>`;
    const lbls=[{t:qlSvg(prefix+'11'),x:mx+2,y:my+8},{t:qlSvg(prefix+'12'),x:mx+h*(cs+gap)+2,y:my+8},{t:qlSvg(prefix+'21'),x:mx+2,y:my+h*(cs+gap)+8},{t:qlSvg(prefix+'22'),x:mx+h*(cs+gap)+2,y:my+h*(cs+gap)+8}];
    for(const l of lbls)s+=`<text x="${l.x}" y="${l.y}" class="viz-quad-label">${l.t}</text>`;
  }
  return s;
}
function drawMatrixC(C,mx,my,n,cs,gap,showPart){
  let s='';const h=n/2,matW=n*cs+(n-1)*gap;
  for(let r=0;r<n;r++)for(let c=0;c<n;c++){
    const x=mx+c*(cs+gap),y=my+r*(cs+gap),v=C[r][c],has=v!==0||false;
    // Check if any combine has set this cell
    let filled=false;for(let rr=0;rr<n;rr++)for(let cc=0;cc<n;cc++)if(C[rr][cc]!==0)filled=true;
    const isSet=C[r][c]!==0;
    s+=`<rect x="${x}" y="${y}" width="${cs}" height="${cs}" rx="3" fill="#232738" stroke="#2a2e3f" stroke-width="1"/>`;
    if(isSet)s+=`<text x="${x+cs/2}" y="${y+cs/2+1}" text-anchor="middle" dominant-baseline="middle" class="viz-cell-text viz-cell-result" font-size="${n<=2?10:n<=4?7.5:n<=8?5.5:3.8}">${v}</text>`;
    else s+=`<text x="${x+cs/2}" y="${y+cs/2+1}" text-anchor="middle" dominant-baseline="middle" class="viz-cell-text viz-cell-empty" font-size="${n<=2?10:n<=4?7.5:n<=8?5.5:3.8}">?</text>`;
  }
  if(showPart&&n>1){
    const px=mx+h*(cs+gap)-gap/2,py=my+h*(cs+gap)-gap/2;
    s+=`<line x1="${px}" y1="${my-3}" x2="${px}" y2="${my+matW+3}" stroke="#5b6eae" stroke-width="1.5" stroke-dasharray="4,3"/>`;
    s+=`<line x1="${mx-3}" y1="${py}" x2="${mx+matW+3}" y2="${py}" stroke="#5b6eae" stroke-width="1.5" stroke-dasharray="4,3"/>`;
    ['C11','C12','C21','C22'].forEach((lbl,i)=>{
      const qr=i<2?0:1,qc=i%2;
      s+=`<text x="${mx+qc*h*(cs+gap)+2}" y="${my+qr*h*(cs+gap)+8}" class="viz-quad-label">${qlSvg(lbl)}</text>`;
    });
  }
  return s;
}

// SVG for Naive (row/column highlighting)
function buildNaiveMatrixSvg(A,B,C,n,aHL,bHL,cHL,info,step){
  // ── Same zone-based layout as Strassen ──
  const cs=n<=2?32:n<=4?22:n<=8?14:8;
  const gap=n<=8?2:1;
  const matW=n*cs+(n-1)*gap;
  const opW=n<=2?24:n<=4?20:n<=8?14:10,padX=n<=8?14:10;
  const infoH=12,gapAfterInfo=6,labelH=10,gapAfterLabel=4,botH=8;
  const topH=infoH+gapAfterInfo+labelH+gapAfterLabel;
  const contentW=padX*2+matW*3+opW*2,contentH=topH+matW+botH;
  const vbPadX=Math.round(contentW*0.25),vbPadY=Math.round(contentH*0.22);
  const vbW=contentW+vbPadX*2,vbH=contentH+vbPadY*2;
  const ox=vbPadX,oy=vbPadY;
  const totalW=contentW,totalH=contentH;
  const matY=topH,ax=padX,bx=padX+matW+opW,cx=bx+matW+opW;
  const infoY=infoH,labelY=infoH+gapAfterInfo+labelH-2;
  let svg=`<svg class="viz-svg" viewBox="0 0 ${vbW} ${vbH}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;">`;
  svg+=`<rect width="${vbW}" height="${vbH}" fill="#1c1f2e"/>`;
  svg+=`<g transform="translate(${ox},${oy})">`;
  svg+=`<text x="${totalW/2}" y="${infoY}" text-anchor="middle" class="viz-title">${escSvg(info.length>70?info.slice(0,69)+'\u2026':info)}</text>`;
  svg+=`<text x="${ax+matW/2}" y="${labelY}" text-anchor="middle" class="viz-mat-label" fill="#a78bfa">A</text>`;
  svg+=`<text x="${bx+matW/2}" y="${labelY}" text-anchor="middle" class="viz-mat-label" fill="#f97316">B</text>`;
  svg+=`<text x="${cx+matW/2}" y="${labelY}" text-anchor="middle" class="viz-mat-label" fill="#34d399">C</text>`;
  const opY=matY+matW/2+3;
  svg+=`<text x="${ax+matW+opW/2}" y="${opY}" text-anchor="middle" class="viz-op">\u00d7</text>`;
  svg+=`<text x="${bx+matW+opW/2}" y="${opY}" text-anchor="middle" class="viz-op">=</text>`;
  // Draw A with highlights
  for(let r=0;r<n;r++)for(let c=0;c<n;c++){
    const x=ax+c*(cs+gap),y=matY+r*(cs+gap);
    const hl=aHL.find(h=>h.r===r&&h.c===c);
    const fill=hl?(hl.cls==='mult'?'rgba(251,191,36,0.2)':'rgba(108,138,255,0.12)'):'#232738';
    const stroke=hl?(hl.cls==='mult'?'#fbbf24':'#6c8aff'):'#2a2e3f';
    svg+=`<rect x="${x}" y="${y}" width="${cs}" height="${cs}" rx="3" fill="${fill}" stroke="${stroke}" stroke-width="${hl?2:1}"/>`;
    svg+=`<text x="${x+cs/2}" y="${y+cs/2+1}" text-anchor="middle" dominant-baseline="middle" class="viz-cell-text" font-size="${n<=2?10:n<=4?7.5:n<=8?5.5:3.8}">${A[r][c]}</text>`;
  }
  // Draw B with highlights
  for(let r=0;r<n;r++)for(let c=0;c<n;c++){
    const x=bx+c*(cs+gap),y=matY+r*(cs+gap);
    const hl=bHL.find(h=>h.r===r&&h.c===c);
    const fill=hl?(hl.cls==='mult'?'rgba(251,191,36,0.2)':'rgba(249,115,22,0.12)'):'#232738';
    const stroke=hl?(hl.cls==='mult'?'#fbbf24':'#f97316'):'#2a2e3f';
    svg+=`<rect x="${x}" y="${y}" width="${cs}" height="${cs}" rx="3" fill="${fill}" stroke="${stroke}" stroke-width="${hl?2:1}"/>`;
    svg+=`<text x="${x+cs/2}" y="${y+cs/2+1}" text-anchor="middle" dominant-baseline="middle" class="viz-cell-text" font-size="${n<=2?10:n<=4?7.5:n<=8?5.5:3.8}">${B[r][c]}</text>`;
  }
  // Draw C
  for(let r=0;r<n;r++)for(let c=0;c<n;c++){
    const x=cx+c*(cs+gap),y=matY+r*(cs+gap);
    const hl=cHL.find(h=>h.r===r&&h.c===c);
    const isSet=C[r][c]!==0||hl;
    const fill=hl?(hl.cls==='write'?'rgba(52,211,153,0.14)':hl.cls==='done'?'rgba(52,211,153,0.2)':'#232738'):'#232738';
    const stroke=hl?'#34d399':'#2a2e3f';
    svg+=`<rect x="${x}" y="${y}" width="${cs}" height="${cs}" rx="3" fill="${fill}" stroke="${stroke}" stroke-width="${hl?2:1}"/>`;
    // Only show finalized values (from C array, populated by naive_cell_done).
    // During active computation (write highlight), show a dot indicator instead of the partial sum.
    const finalized=C[r][c]!==0;
    const isActive=hl&&hl.cls==='write';
    const fs=n<=2?10:n<=4?7.5:n<=8?5.5:3.8;
    if(finalized)svg+=`<text x="${x+cs/2}" y="${y+cs/2+1}" text-anchor="middle" dominant-baseline="middle" class="viz-cell-text viz-cell-result" font-size="${fs}">${C[r][c]}</text>`;
    else if(hl&&hl.cls==='done')svg+=`<text x="${x+cs/2}" y="${y+cs/2+1}" text-anchor="middle" dominant-baseline="middle" class="viz-cell-text viz-cell-result" font-size="${fs}">${step.sum}</text>`;
    else if(isActive)svg+=`<text x="${x+cs/2}" y="${y+cs/2+1}" text-anchor="middle" dominant-baseline="middle" font-size="${fs*0.7}" fill="#fbbf24">\u2026</text>`;
    else svg+=`<text x="${x+cs/2}" y="${y+cs/2+1}" text-anchor="middle" dominant-baseline="middle" class="viz-cell-text viz-cell-empty" font-size="${fs}">?</text>`;
  }
  svg+='</g></svg>';
  return svg;
}

