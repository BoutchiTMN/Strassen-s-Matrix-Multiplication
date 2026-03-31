// ═══════════════════════════════════════════════════════════════════════
//  RECURSION TREE (Strassen only)
// ═══════════════════════════════════════════════════════════════════════
function buildRecursionTree(eng){
  if(eng.type!=='strassen'){eng.tree=null;return}
  const stack=[];let id=0,root=null;
  for(let i=0;i<eng.steps.length;i++){const s=eng.steps[i];
    if(s.action==='strassen_enter'){
      const label=s.depth===0?`strassen(${s.n})`:(s.ctx.match(/M\d/)?.[0]||`d${s.depth}`);
      const pc=s.ctx.match(/M\d/)?pcFor(s.ctx.match(/M\d/)[0]):null;
      const node={id:id++,label,depth:s.depth,n:s.n,pc,children:[],enterIdx:i,exitIdx:-1};
      if(stack.length>0)stack[stack.length-1].children.push(node);else root=node;
      stack.push(node);
    }
    if(s.action==='join'||s.action==='base_case'){if(stack.length>0){stack[stack.length-1].exitIdx=i;stack.pop()}}
  }
  while(stack.length>0){stack[stack.length-1].exitIdx=eng.steps.length-1;stack.pop()}
  eng.tree=root;
}
function updateRecursionTree(eng){
  if(!eng.tree)return;
  const active=findActive(eng.tree,eng.stepIdx);
  renderRecursionTree(eng,active?active.id:null);
  renderCallStack(eng,active?active.id:null);
}
function findActive(node,idx){
  if(idx>=node.enterIdx&&idx<=node.exitIdx){for(const c of node.children){const d=findActive(c,idx);if(d)return d}return node}return null;
}
function pathTo(root,tid){const p=[];function s(n){p.push(n);if(n.id===tid)return true;for(const c of n.children)if(s(c))return true;p.pop();return false}s(root);return p}
function renderRecursionTree(eng,activeId){
  const c=document.getElementById('dcTreeContainer');
  if(!eng.tree){c.innerHTML='<div style="text-align:center;color:var(--text-muted);padding:24px 0;font-size:.86rem;">Click <strong>Build</strong> to see the recursion tree.</div>';return}
  // Layout — compact node sizes with breathing room via inflated viewBox
  const nW=34,nH=18,hG=3,vG=22;let nx=0;
  function ax(nd){if(nd.children.length===0){nd._x=nx;nx+=nW+hG;return}for(const c of nd.children)ax(c);nd._x=(nd.children[0]._x+nd.children[nd.children.length-1]._x)/2}
  ax(eng.tree);
  const W=nx-hG+12,nodes=[],edges=[];let maxD=0;
  function collect(nd){const x=nd._x+nW/2,y=nd.depth*(nH+vG)+nH/2;if(nd.depth>maxD)maxD=nd.depth;nodes.push({nd,x,y});
    for(const ch of nd.children){const cx2=ch._x+nW/2,cy=ch.depth*(nH+vG)+nH/2;edges.push({x1:x,y1:y+nH/2,x2:cx2,y2:cy-nH/2});collect(ch)}}
  collect(eng.tree);
  const H=(maxD+1)*(nH+vG)+6,pad=4;
  // Inflate viewBox for breathing room
  const treeContentW=W+pad*2,treeContentH=H+pad;
  const treePadX=Math.round(treeContentW*0.15),treePadY=Math.round(treeContentH*0.15);
  const treeVbW=treeContentW+treePadX*2,treeVbH=treeContentH+treePadY*2;
  let svg=`<svg class="dc-tree-svg" viewBox="0 0 ${treeVbW} ${treeVbH}" preserveAspectRatio="xMidYMin meet" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;min-height:80px;display:block;">`;
  svg+=`<g transform="translate(${treePadX},${treePadY})">`;
  for(const e of edges)svg+=`<line x1="${e.x1+pad}" y1="${e.y1+pad}" x2="${e.x2+pad}" y2="${e.y2+pad}" stroke="#2a2e3f" stroke-width="1.5"/>`;
  const path=activeId!=null?pathTo(eng.tree,activeId):[];
  for(const nd of nodes){const n=nd.nd,isA=n.id===activeId,isP=path.some(p=>p.id===n.id),isDone=eng.stepIdx>=0&&n.exitIdx>=0&&n.exitIdx<=eng.stepIdx&&!isA;
    let fill='#232738',stroke='#2a2e3f',sw=1.5,tf='#8b90a0';
    if(isA){fill=n.pc?n.pc.fill.replace('0.18','0.35'):'rgba(108,138,255,0.3)';stroke=n.pc?n.pc.hex:'#6c8aff';sw=2.5;tf='#e2e4eb'}
    else if(isP){fill='#2a2e48';stroke=n.pc?n.pc.hex:'#5b6eae';tf='#c0c4d0'}
    else if(isDone){fill='rgba(52,211,153,0.06)';stroke='#34d39940';tf='#5c6073'}
    const rx=nd.x-nW/2+pad,ry=nd.y-nH/2+pad;
    svg+=`<rect x="${rx}" y="${ry}" width="${nW}" height="${nH}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    const lbl=n.pc?n.pc.label:n.label;
    svg+=`<text x="${nd.x+pad}" y="${nd.y+pad+1}" text-anchor="middle" dominant-baseline="middle" font-size="${n.depth===0?6.5:5.5}" font-weight="700" fill="${tf}">${lbl}</text>`;
  }
  svg+='</g></svg>';c.innerHTML=svg;
}
function renderCallStack(eng,activeId){
  const panel=document.getElementById('dcCallStack');
  if(!eng.tree||activeId==null){panel.innerHTML='<div class="dc-stack-empty">No active calls</div>';return}
  const path=pathTo(eng.tree,activeId);if(!path.length){panel.innerHTML='<div class="dc-stack-empty">No active calls</div>';return}
  let html='';
  for(let i=path.length-1;i>=0;i--){const nd=path[i],isTop=i===path.length-1,cls=isTop?'dc-stack-item dc-active':'dc-stack-item';
    const lbl=nd.pc?nd.pc.label:nd.label;
    html+=`<div class="${cls}"><div class="dc-depth-badge">${nd.depth}</div><div class="dc-call-label">${lbl}</div><div class="dc-size-badge">${nd.n}\u00d7${nd.n}</div></div>`}
  panel.innerHTML=html;
}

