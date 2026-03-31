// ═══════════════════════════════════════════════════════════════════════
//  EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════════
// Tabs
document.querySelectorAll('.top-tab').forEach(tab=>tab.addEventListener('click',()=>switchTab(tab.dataset.tab)));

// Config
document.getElementById('matrixSize').addEventListener('change',e=>{currentSize=parseInt(e.target.value);resetEngine(SE);resetEngine(NE);resetEngine(RE);loadMatrices(DEFAULTS[currentSize].A,DEFAULTS[currentSize].B);flashValidation('info',`Switched to ${currentSize}\u00d7${currentSize}.`)});
document.getElementById('btnGenerate').addEventListener('click',()=>{
  resetEngine(SE);resetEngine(NE);resetEngine(RE);
  const range=parseInt(document.getElementById('valueRange').value);
  const mk=()=>{const m=[];for(let r=0;r<currentSize;r++){const row=[];for(let c=0;c<currentSize;c++)row.push(Math.floor(Math.random()*range));m.push(row)}return m};
  loadMatrices(mk(),mk());flashValidation('info','Random matrices generated.')});
document.getElementById('btnReset').addEventListener('click',()=>{resetEngine(SE);resetEngine(NE);resetEngine(RE);loadMatrices(DEFAULTS[currentSize].A,DEFAULTS[currentSize].B);flashValidation('info','Reset to defaults.')});
document.getElementById('presetBar').addEventListener('click',e=>{const btn=e.target.closest('[data-preset]');if(!btn)return;const k=btn.dataset.preset,p=PRESETS[k];if(!p||!p[currentSize])return;
  resetEngine(SE);resetEngine(NE);resetEngine(RE);loadMatrices(p[currentSize].A.map(r=>[...r]),p[currentSize].B.map(r=>[...r]));flashValidation('success',`"${btn.textContent.trim()}" loaded.`)});

// Speed sliders
function setupSpeed(suf){
  document.getElementById('speedSlider'+suf).addEventListener('input',e=>{
    const m=parseFloat(e.target.value),ms=Math.round(800/m);
    document.getElementById('speedBadge'+suf).textContent=(m%1===0?m:m.toFixed(2).replace(/0$/,''))+'x';
    document.getElementById('speedMs'+suf).textContent=ms+' ms/step';
    const eng=suf==='S'?SE:NE;
    if(eng.state==='playing'){stopAutoPlay(eng);startAutoPlay(eng)}
  });
}
setupSpeed('S');setupSpeed('N');

// Playback controls — Strassen
document.getElementById('btnBuildS').addEventListener('click',()=>buildSteps(SE));
document.getElementById('btnStepS').addEventListener('click',()=>{if(SE.state==='playing'){stopAutoPlay(SE);setEngineState(SE,'paused')}if(['ready','paused'].includes(SE.state)){if(!advanceStep(SE))setEngineState(SE,'done');else if(SE.state!=='done')setEngineState(SE,'paused')}});
document.getElementById('btnPlayS').addEventListener('click',()=>{if(['ready','paused'].includes(SE.state))startAutoPlay(SE)});
document.getElementById('btnPauseS').addEventListener('click',()=>{if(SE.state==='playing'){stopAutoPlay(SE);setEngineState(SE,'paused')}});
document.getElementById('btnResetS').addEventListener('click',()=>resetEngine(SE));

// Playback controls — Naive
document.getElementById('btnBuildN').addEventListener('click',()=>buildSteps(NE));
document.getElementById('btnStepN').addEventListener('click',()=>{if(NE.state==='playing'){stopAutoPlay(NE);setEngineState(NE,'paused')}if(['ready','paused'].includes(NE.state)){if(!advanceStep(NE))setEngineState(NE,'done');else if(NE.state!=='done')setEngineState(NE,'paused')}});
document.getElementById('btnPlayN').addEventListener('click',()=>{if(['ready','paused'].includes(NE.state))startAutoPlay(NE)});
document.getElementById('btnPauseN').addEventListener('click',()=>{if(NE.state==='playing'){stopAutoPlay(NE);setEngineState(NE,'paused')}});
document.getElementById('btnResetN').addEventListener('click',()=>resetEngine(NE));

// Playback controls — Naive Recursive
setupSpeed('R');
document.getElementById('btnBuildR').addEventListener('click',()=>buildSteps(RE));
document.getElementById('btnStepR').addEventListener('click',()=>{if(RE.state==='playing'){stopAutoPlay(RE);setEngineState(RE,'paused')}if(['ready','paused'].includes(RE.state)){if(!advanceStep(RE))setEngineState(RE,'done');else if(RE.state!=='done')setEngineState(RE,'paused')}});
document.getElementById('btnPlayR').addEventListener('click',()=>{if(['ready','paused'].includes(RE.state))startAutoPlay(RE)});
document.getElementById('btnPauseR').addEventListener('click',()=>{if(RE.state==='playing'){stopAutoPlay(RE);setEngineState(RE,'paused')}});
document.getElementById('btnResetR').addEventListener('click',()=>resetEngine(RE));

