// ═══════════════════════════════════════════════════════════════════════
//  COMPLEXITY GRAPH (Comparison tab)
// ═══════════════════════════════════════════════════════════════════════
function fmtNum(v){if(v>=1e12)return(v/1e12).toFixed(1)+'T';if(v>=1e9)return(v/1e9).toFixed(1)+'B';if(v>=1e6)return(v/1e6).toFixed(1)+'M';if(v>=1e3)return(v/1e3).toFixed(1)+'K';return v.toFixed(0)}
function drawGraph(selN){
  const c=document.getElementById('complexityGraph');if(!c)return;
  const W=540,H=300,m={top:18,right:36,bottom:44,left:58},gW=W-m.left-m.right,gH=H-m.top-m.bottom;
  const nMax=Math.max(selN,16),yMax=Math.pow(nMax,3);
  const xS=n=>m.left+(n/nMax)*gW,yS=v=>m.top+gH-(v/yMax)*gH;
  const pts=200,step=nMax/pts;let nP='',sP='';
  for(let i=0;i<=pts;i++){const n=Math.max(1,i*step),nv=Math.pow(n,3),sv=Math.pow(n,2.807);
    nP+=(i===0?'M':'L')+xS(n).toFixed(1)+','+yS(nv).toFixed(1);
    sP+=(i===0?'M':'L')+xS(n).toFixed(1)+','+yS(sv).toFixed(1)}
  let svg=`<svg class="graph-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">`;
  // Grid
  const yStep=yMax/4;for(let i=0;i<=4;i++){const y=yS(i*yStep);svg+=`<line x1="${m.left}" y1="${y.toFixed(1)}" x2="${W-m.right}" y2="${y.toFixed(1)}" class="grid-line"/>`;svg+=`<text x="${m.left-6}" y="${(y+3).toFixed(1)}" text-anchor="end" class="tick-label">${fmtNum(i*yStep)}</text>`}
  // Axes
  svg+=`<line x1="${m.left}" y1="${m.top}" x2="${m.left}" y2="${m.top+gH}" stroke="#5c6073" stroke-width="1"/>`;
  svg+=`<line x1="${m.left}" y1="${m.top+gH}" x2="${W-m.right}" y2="${m.top+gH}" stroke="#5c6073" stroke-width="1"/>`;
  svg+=`<text x="${W/2}" y="${H-4}" text-anchor="middle" class="axis-title">Matrix size (n)</text>`;
  // X ticks
  const xStep=nMax<=20?2:nMax<=100?10:nMax<=500?50:100;
  for(let x=0;x<=nMax;x+=xStep){const px=xS(x);svg+=`<text x="${px.toFixed(1)}" y="${m.top+gH+14}" text-anchor="middle" class="tick-label">${x}</text>`}
  // Fills & lines
  const nF=nP+`L${xS(nMax).toFixed(1)},${yS(0).toFixed(1)}L${xS(0).toFixed(1)},${yS(0).toFixed(1)}Z`;
  const sF=sP+`L${xS(nMax).toFixed(1)},${yS(0).toFixed(1)}L${xS(0).toFixed(1)},${yS(0).toFixed(1)}Z`;
  svg+=`<path d="${nF}" fill="rgba(248,113,113,0.05)"/><path d="${sF}" fill="rgba(52,211,153,0.05)"/>`;
  svg+=`<path d="${nP}" fill="none" stroke="#f87171" stroke-width="2.5"/><path d="${sP}" fill="none" stroke="#34d399" stroke-width="2.5"/>`;
  // Marker at selN
  const sx=xS(selN),yn=yS(Math.pow(selN,3)),ys=yS(Math.pow(selN,2.807));
  svg+=`<line x1="${sx.toFixed(1)}" y1="${m.top}" x2="${sx.toFixed(1)}" y2="${(m.top+gH).toFixed(1)}" stroke="#6c8aff" stroke-width="1" stroke-dasharray="4,3" opacity=".4"/>`;
  svg+=`<circle cx="${sx.toFixed(1)}" cy="${yn.toFixed(1)}" r="4" fill="#f87171" stroke="#0f1117" stroke-width="2"/>`;
  svg+=`<circle cx="${sx.toFixed(1)}" cy="${ys.toFixed(1)}" r="4" fill="#34d399" stroke="#0f1117" stroke-width="2"/>`;
  if(Math.abs(yn-ys)>5){svg+=`<line x1="${sx.toFixed(1)}" y1="${(yn+5).toFixed(1)}" x2="${sx.toFixed(1)}" y2="${(ys-5).toFixed(1)}" stroke="#fbbf24" stroke-width="1" stroke-dasharray="3,2"/>`;
    const sav=(1-Math.pow(selN,2.807)/Math.pow(selN,3))*100;
    if(sav>1)svg+=`<text x="${(sx+6).toFixed(1)}" y="${((yn+ys)/2).toFixed(1)}" class="annotation" fill="#fbbf24">${sav.toFixed(0)}%</text>`}
  svg+=`<text x="${sx.toFixed(1)}" y="${m.top+gH+28}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#6c8aff">n=${selN}</text>`;
  // Legend
  const lx=m.left+10,ly=m.top+6;svg+=`<rect x="${lx}" y="${ly}" width="120" height="38" rx="4" fill="rgba(15,17,23,.85)" stroke="#2a2e3f"/>`;
  svg+=`<line x1="${lx+6}" y1="${ly+13}" x2="${lx+22}" y2="${ly+13}" stroke="#f87171" stroke-width="2.5"/>`;
  svg+=`<text x="${lx+28}" y="${ly+16}" class="legend-label" fill="#f87171">Naive O(n\u00b3)</text>`;
  svg+=`<line x1="${lx+6}" y1="${ly+27}" x2="${lx+22}" y2="${ly+27}" stroke="#34d399" stroke-width="2.5"/>`;
  svg+=`<text x="${lx+28}" y="${ly+30}" class="legend-label" fill="#34d399">Strassen O(n\u00b2\u00b7\u2078)</text>`;
  svg+='</svg>';c.innerHTML=svg;
}
function updateExplorer(n){
  const nv=Math.pow(n,3),sv=Math.pow(n,2.807),sav=nv>0?(1-sv/nv)*100:0,ratio=sv>0?nv/sv:1;
  document.getElementById('erNaiveV').textContent=fmtNum(nv);
  document.getElementById('erStrassenV').textContent=fmtNum(sv);
  document.getElementById('erSavingsV').textContent=sav.toFixed(1)+'%';
  document.getElementById('erNaiveF').innerHTML=`${n}<sup>3</sup> = ${fmtNum(nv)}`;
  document.getElementById('erStrassenF').innerHTML=`${n}<sup>2.807</sup> = ${fmtNum(sv)}`;
  document.getElementById('erRatio').textContent=`${ratio.toFixed(2)}\u00d7 ratio`;
  const w=document.getElementById('explorerWinner');
  w.classList.remove('winner-strassen','winner-naive','winner-equal');
  if(n<=4){w.className='explorer-winner winner-equal';w.innerHTML=`At <strong>n=${n}</strong>, both trivial. <strong>Naive wins</strong> in practice.`}
  else if(n<=64){w.className='explorer-winner winner-naive';w.innerHTML=`At <strong>n=${n}</strong>, Strassen saves ${sav.toFixed(1)}% theoretically, but <strong>naive often faster</strong> due to overhead.`}
  else{w.className='explorer-winner winner-strassen';w.innerHTML=`At <strong>n=${n}</strong>, Strassen uses <strong>${sav.toFixed(1)}% fewer</strong> ops (<strong>${ratio.toFixed(1)}\u00d7</strong> speedup).`}
}
document.getElementById('nSlider').addEventListener('input',e=>{const n=parseInt(e.target.value);document.getElementById('nDisplay').textContent=n;drawGraph(n);updateExplorer(n)});

