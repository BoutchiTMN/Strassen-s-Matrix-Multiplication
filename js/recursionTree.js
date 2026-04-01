// ═══════════════════════════════════════════════════════════════════════
//  RECURSION TREE (Strassen + Naive Recursive)
// ═══════════════════════════════════════════════════════════════════════

/** Build tree structure from step data for Strassen engine */
function buildRecursionTree(eng){
  if(eng.type==='strassen'){
    eng.tree=buildTreeFromSteps(eng.steps,'strassen_enter','join','base_case',
      s=>{const m=s.ctx.match(/M\d/);return m?m[0]:null},
      (s,m)=>s.depth===0?`strassen(${s.n})`:(m||`d${s.depth}`),
      (s,m)=>m?pcFor(m):null);
  } else if(eng.type==='naiverecur'){
    eng.tree=buildTreeFromSteps(eng.steps,'rn_enter','rn_join','rn_base',
      s=>{
        // Extract the product label from context like "A11×B11 (depth 1)"
        const m=s.ctx.match(/([A-Z]\d\d)\u00d7([A-Z]\d\d)/);
        return m?m[0]:null;
      },
      (s,prodMatch)=>{
        if(s.depth===0)return`rec(${s.n})`;
        // Use letter mapping for display
        if(prodMatch){
          const parts=prodMatch.split('\u00d7');
          const l=typeof ql==='function'?ql(parts[0]):parts[0];
          const r=typeof ql==='function'?ql(parts[1]):parts[1];
          return`${l}\u00d7${r}`;
        }
        return`d${s.depth}`;
      },
      ()=>null); // no product colors for naive recursive
  } else {
    eng.tree=null;
  }
}

/**
 * Generic tree builder from step arrays.
 * @param {Array} steps - all recorded steps
 * @param {string} enterAction - action name for entering a recursive call
 * @param {string} joinAction - action name for completing (join) a recursive call
 * @param {string} baseAction - action name for base case
 * @param {Function} extractMatch - (step) => string|null, extracts a product identifier
 * @param {Function} makeLabel - (step, match) => string, creates display label
 * @param {Function} makePC - (step, match) => object|null, creates product color
 */
function buildTreeFromSteps(steps,enterAction,joinAction,baseAction,extractMatch,makeLabel,makePC){
  const stack=[];let id=0,root=null;
  for(let i=0;i<steps.length;i++){const s=steps[i];
    if(s.action===enterAction){
      const m=extractMatch(s);
      const label=makeLabel(s,m);
      const pc=makePC(s,m);
      const node={id:id++,label,depth:s.depth,n:s.n,pc,children:[],enterIdx:i,exitIdx:-1};
      if(stack.length>0)stack[stack.length-1].children.push(node);else root=node;
      stack.push(node);
    }
    if(s.action===joinAction||s.action===baseAction){
      if(stack.length>0){stack[stack.length-1].exitIdx=i;stack.pop()}
    }
  }
  while(stack.length>0){stack[stack.length-1].exitIdx=steps.length-1;stack.pop()}
  return root;
}

// ── Shared tree utilities ──
function findActive(node,idx){
  if(idx>=node.enterIdx&&idx<=node.exitIdx){
    for(const c of node.children){const d=findActive(c,idx);if(d)return d}
    return node;
  }
  return null;
}
function pathTo(root,tid){
  const p=[];
  function s(n){p.push(n);if(n.id===tid)return true;for(const c of n.children)if(s(c))return true;p.pop();return false}
  s(root);return p;
}

// ── Strassen tree update (calls generic renderer) ──
function updateRecursionTree(eng){
  if(!eng.tree)return;
  const active=findActive(eng.tree,eng.stepIdx);
  renderGenericTree(eng.tree,eng.stepIdx,'dcTreeContainer',active?active.id:null,'#6c8aff');
  renderGenericCallStack(eng.tree,active?active.id:null,'dcCallStack');
}

// ── Naive Recursive tree update ──
function updateNaiveRecurTree(eng){
  if(!eng.tree)return;
  const active=findActive(eng.tree,eng.stepIdx);
  renderGenericTree(eng.tree,eng.stepIdx,'rnTreeContainer',active?active.id:null,'#f97316');
  renderGenericCallStack(eng.tree,active?active.id:null,'rnCallStack');
}

/**
 * Generic SVG tree renderer. Works for both Strassen (7 children) and
 * Naive Recursive (8 children) trees.
 * For large trees (8×8+), prunes below depth 2 unless the active path goes deeper.
 */
function renderGenericTree(root,stepIdx,containerId,activeId,accentColor){
  const c=document.getElementById(containerId);
  if(!root){c.innerHTML='<div style="text-align:center;color:var(--text-muted);padding:24px 0;font-size:.86rem;">Click <strong>Build</strong> to see the recursion tree.</div>';return}

  // For large trees, prune: only expand active branch beyond depth limit
  const activePath=activeId!=null?pathTo(root,activeId):[];
  const activeIds=new Set(activePath.map(n=>n.id));
  const maxFullDepth=root.n>4?1:99; // prune below depth 1 for 8×8+

  // Layout
  const nW=34,nH=18,hG=3,vG=22;let nx=0;
  function layoutNode(nd,depth){
    // Check if this node should show children
    const showChildren=depth<maxFullDepth||activeIds.has(nd.id);
    const visChildren=showChildren?nd.children:[];
    nd._collapsed=!showChildren&&nd.children.length>0;
    if(visChildren.length===0){nd._x=nx;nx+=nW+hG;return}
    for(const ch of visChildren)layoutNode(ch,depth+1);
    nd._x=(visChildren[0]._x+visChildren[visChildren.length-1]._x)/2;
  }
  layoutNode(root,0);

  const W=nx-hG+12;
  const nodesArr=[],edgesArr=[];let maxD=0;
  function collect(nd,depth){
    const showChildren=depth<maxFullDepth||activeIds.has(nd.id);
    const visChildren=showChildren?nd.children:[];
    const x=nd._x+nW/2,y=nd.depth*(nH+vG)+nH/2;
    if(nd.depth>maxD)maxD=nd.depth;
    nodesArr.push({nd,x,y});
    for(const ch of visChildren){
      const cx2=ch._x+nW/2,cy=ch.depth*(nH+vG)+nH/2;
      edgesArr.push({x1:x,y1:y+nH/2,x2:cx2,y2:cy-nH/2});
      collect(ch,depth+1);
    }
  }
  collect(root,0);

  const H=(maxD+1)*(nH+vG)+6,pad=4;
  const tCW=W+pad*2,tCH=H+pad;
  const tPX=Math.round(tCW*0.12),tPY=Math.round(tCH*0.12);
  const vbW=tCW+tPX*2,vbH=tCH+tPY*2;

  let svg=`<svg class="dc-tree-svg" viewBox="0 0 ${vbW} ${vbH}" preserveAspectRatio="xMidYMin meet" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;min-height:80px;display:block;">`;
  svg+=`<g transform="translate(${tPX},${tPY})">`;

  // Edges
  for(const e of edgesArr){
    svg+=`<line x1="${e.x1+pad}" y1="${e.y1+pad}" x2="${e.x2+pad}" y2="${e.y2+pad}" stroke="#2a2e3f" stroke-width="1.5"/>`;
  }

  // Nodes
  for(const item of nodesArr){
    const n=item.nd;
    const isA=n.id===activeId;
    const isP=activePath.some(p=>p.id===n.id);
    const isDone=stepIdx>=0&&n.exitIdx>=0&&n.exitIdx<=stepIdx&&!isA;

    let fill='#232738',stroke='#2a2e3f',sw=1.5,tf='#8b90a0';
    if(isA){
      fill=n.pc?n.pc.fill.replace('0.18','0.35'):`${accentColor}4d`;
      stroke=n.pc?n.pc.hex:accentColor;sw=2.5;tf='#e2e4eb';
    } else if(isP){
      fill='#2a2e48';stroke=n.pc?n.pc.hex:'#5b6eae';tf='#c0c4d0';
    } else if(isDone){
      fill='rgba(52,211,153,0.06)';stroke='#34d39940';tf='#5c6073';
    }

    const rx=item.x-nW/2+pad,ry=item.y-nH/2+pad;
    svg+=`<rect x="${rx}" y="${ry}" width="${nW}" height="${nH}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

    // Label
    const lbl=n.pc?n.pc.label:n.label;
    const fs=n.depth===0?6.5:5.5;
    svg+=`<text x="${item.x+pad}" y="${item.y+pad+1}" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="700" fill="${tf}">${lbl}</text>`;

    // Collapsed indicator (small "..." below node)
    if(n._collapsed){
      svg+=`<text x="${item.x+pad}" y="${item.y+pad+nH/2+8}" text-anchor="middle" font-size="5" fill="#5c6073">\u2026${n.children.length}</text>`;
    }
  }

  svg+='</g></svg>';
  c.innerHTML=svg;
}

/** Generic call stack renderer */
function renderGenericCallStack(root,activeId,panelId){
  const panel=document.getElementById(panelId);
  if(!root||activeId==null){panel.innerHTML='<div class="dc-stack-empty">No active calls</div>';return}
  const path=pathTo(root,activeId);
  if(!path.length){panel.innerHTML='<div class="dc-stack-empty">No active calls</div>';return}
  let html='';
  for(let i=path.length-1;i>=0;i--){
    const nd=path[i],isTop=i===path.length-1;
    const cls=isTop?'dc-stack-item dc-active':'dc-stack-item';
    const lbl=nd.pc?nd.pc.label:nd.label;
    html+=`<div class="${cls}"><div class="dc-depth-badge">${nd.depth}</div><div class="dc-call-label">${lbl}</div><div class="dc-size-badge">${nd.n}\u00d7${nd.n}</div></div>`;
  }
  panel.innerHTML=html;
}
