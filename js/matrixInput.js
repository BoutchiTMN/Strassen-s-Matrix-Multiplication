// ═══════════════════════════════════════════════════════════════════════
//  MATRIX INPUT SYSTEM
// ═══════════════════════════════════════════════════════════════════════
function buildGrid(id,dimId,n,vals){
  const grid=document.getElementById(id);
  // Wrap large grids in a scrollable container
  const wrap=grid.parentElement;
  let scrollWrap=wrap.querySelector('.matrix-grid-scroll');
  if(n>=8){
    if(!scrollWrap){scrollWrap=document.createElement('div');scrollWrap.className='matrix-grid-scroll';wrap.insertBefore(scrollWrap,grid);scrollWrap.appendChild(grid)}
  } else {
    if(scrollWrap){scrollWrap.parentElement.insertBefore(grid,scrollWrap);scrollWrap.remove()}
  }
  grid.innerHTML='';grid.style.gridTemplateColumns=`repeat(${n},1fr)`;
  grid.classList.remove('grid-lg','grid-xl');
  if(n===8)grid.classList.add('grid-lg');
  if(n>=16)grid.classList.add('grid-xl');
  document.getElementById(dimId).textContent=`${n} x ${n}`;
  for(let r=0;r<n;r++)for(let c=0;c<n;c++){
    const inp=document.createElement('input');inp.type='number';inp.min='-999';inp.max='999';inp.value=vals[r][c];
    inp.addEventListener('focus',function(){this.select()});
    inp.addEventListener('input',()=>validateMatrices());
    inp.addEventListener('keydown',function(e){const idx=Array.from(grid.children).indexOf(this);let next=null;
      if(e.key==='ArrowRight'&&idx<grid.children.length-1)next=grid.children[idx+1];
      if(e.key==='ArrowLeft'&&idx>0)next=grid.children[idx-1];
      if(e.key==='ArrowDown'&&idx+n<grid.children.length)next=grid.children[idx+n];
      if(e.key==='ArrowUp'&&idx-n>=0)next=grid.children[idx-n];
      if(next){e.preventDefault();next.focus({preventScroll:true})}});
    grid.appendChild(inp);
  }
}
function readMatrix(id){
  const grid=document.getElementById(id),inputs=grid.querySelectorAll('input'),n=currentSize,M=[];let idx=0;
  for(let r=0;r<n;r++){const row=[];for(let c=0;c<n;c++){row.push(inputs[idx]?Number(inputs[idx].value):0);idx++}M.push(row)}return M;
}
function loadMatrices(a,b){buildGrid('matrixA','dimLabelA',currentSize,a);buildGrid('matrixB','dimLabelB',currentSize,b);validateMatrices()}
function validateMatrices(){
  const area=document.getElementById('validationArea'),msg=area.querySelector('.validation-msg'),svg=area.querySelector('svg');
  const inputs=[...document.getElementById('matrixA').querySelectorAll('input'),...document.getElementById('matrixB').querySelectorAll('input')];
  let errors=0;inputs.forEach(inp=>{inp.classList.remove('invalid');if(inp.value.trim()===''||isNaN(Number(inp.value))){inp.classList.add('invalid');errors++}});
  area.classList.remove('success','error','warn','info');
  if(errors>0){area.classList.add('error');msg.textContent=`${errors} cell${errors>1?'s':''} empty or invalid.`;return false}
  area.classList.add('success');msg.textContent=`Both ${currentSize}\u00d7${currentSize} matrices valid.`;return true;
}
function flashValidation(type,text){
  const area=document.getElementById('validationArea'),msg=area.querySelector('.validation-msg');
  area.classList.remove('success','error','warn','info');area.classList.add(type);msg.textContent=text;
}

