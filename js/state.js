// ═══════════════════════════════════════════════════════════════════════
//  STATE & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════
let currentSize = 2;
let activeTab = 'strassen';

// Engine state for each algorithm
function createEngine(type) {
  return { type, steps:[], result:null, stepIdx:-1, state:'idle', timer:null, tree:null };
}
const SE = createEngine('strassen');   // Strassen engine
const NE = createEngine('naive');      // Naive iterative engine
const RE = createEngine('naiverecur');// Naive recursive engine

// Presets
// Helper: generate deterministic n×n matrix from seed
function seedMatrix(n,seed,mod){const m=[];let v=seed;for(let r=0;r<n;r++){const row=[];for(let c=0;c<n;c++){v=(v*31+7)%mod;row.push(v)}m.push(row)}return m}
function identityN(n){const m=[];for(let r=0;r<n;r++){const row=new Array(n).fill(0);row[r]=1;m.push(row)}return m}
function sparseN(n,seed){const m=[];let v=seed;for(let r=0;r<n;r++){const row=new Array(n).fill(0);v=(v*17+3)%n;row[v]=(v*7+r)%9+1;m.push(row)}return m}

const PRESETS = {
  identity:  {2:{A:[[1,0],[0,1]],B:[[1,0],[0,1]]},4:{A:identityN(4),B:identityN(4)},8:{A:identityN(8),B:identityN(8)},16:{A:identityN(16),B:identityN(16)}},
  fibonacci: {2:{A:[[1,1],[1,0]],B:[[1,1],[1,0]]},4:{A:[[1,1,0,0],[1,0,0,0],[0,0,1,1],[0,0,1,0]],B:[[1,1,0,0],[1,0,0,0],[0,0,1,1],[0,0,1,0]]},8:{A:seedMatrix(8,1,5),B:seedMatrix(8,3,5)},16:{A:seedMatrix(16,1,5),B:seedMatrix(16,3,5)}},
  symmetric: {2:{A:[[4,7],[7,3]],B:[[2,5],[5,9]]},4:{A:[[5,3,1,7],[3,8,2,4],[1,2,6,9],[7,4,9,3]],B:[[2,6,4,1],[6,7,3,5],[4,3,9,8],[1,5,8,4]]},8:{A:seedMatrix(8,5,10),B:seedMatrix(8,8,10)},16:{A:seedMatrix(16,5,10),B:seedMatrix(16,8,10)}},
  sparse:    {2:{A:[[5,0],[0,3]],B:[[0,7],[2,0]]},4:{A:[[3,0,0,5],[0,0,7,0],[0,4,0,0],[8,0,0,2]],B:[[0,0,6,0],[0,9,0,0],[1,0,0,0],[0,0,0,4]]},8:{A:sparseN(8,2),B:sparseN(8,5)},16:{A:sparseN(16,2),B:sparseN(16,5)}},
  // 3×3 matrices padded to 4×4 with zeros (demonstrates Strassen padding technique)
  padded3x3: {4:{
    A:[[1,2,3,0],[4,5,6,0],[7,8,9,0],[0,0,0,0]],
    B:[[9,8,7,0],[6,5,4,0],[3,2,1,0],[0,0,0,0]]
  }}
};
const DEFAULTS = {
  2:{A:[[1,3],[7,5]],B:[[6,8],[4,2]]},
  4:{A:[[2,5,1,8],[3,7,4,6],[9,0,2,1],[4,3,8,5]],B:[[1,4,7,3],[6,2,5,9],[8,3,0,4],[2,7,6,1]]},
  8:{A:seedMatrix(8,42,10),B:seedMatrix(8,17,10)},
  16:{A:seedMatrix(16,42,10),B:seedMatrix(16,17,10)}
};

// P1-P7 colors for Strassen
const PC = [
  {id:'M1',hex:'#6c8aff',fill:'rgba(108,138,255,0.18)',label:'P1'},
  {id:'M2',hex:'#34d399',fill:'rgba(52,211,153,0.18)',label:'P2'},
  {id:'M3',hex:'#fbbf24',fill:'rgba(251,191,36,0.18)',label:'P3'},
  {id:'M4',hex:'#f97316',fill:'rgba(249,115,22,0.18)',label:'P4'},
  {id:'M5',hex:'#a78bfa',fill:'rgba(167,139,250,0.18)',label:'P5'},
  {id:'M6',hex:'#f87171',fill:'rgba(248,113,113,0.18)',label:'P6'},
  {id:'M7',hex:'#22d3ee',fill:'rgba(34,211,238,0.18)',label:'P7'}
];
function pcFor(id){return PC.find(p=>p.id===id)||null}

