// ═══════════════════════════════════════════════════════════════════════
//  MATRIX UTILITIES
// ═══════════════════════════════════════════════════════════════════════
function matClone(M){return M.map(r=>[...r])}
function matZeros(n){return Array.from({length:n},()=>new Array(n).fill(0))}
function matStr(M){return '['+M.map(r=>'['+r.join(',')+']').join(',')+']'}
function matAdd(A,B){const n=A.length,C=matZeros(n);for(let i=0;i<n;i++)for(let j=0;j<n;j++)C[i][j]=A[i][j]+B[i][j];return C}
function matSub(A,B){const n=A.length,C=matZeros(n);for(let i=0;i<n;i++)for(let j=0;j<n;j++)C[i][j]=A[i][j]-B[i][j];return C}
function matSplit(M){const n=M.length,h=n/2,a=matZeros(h),b=matZeros(h),c=matZeros(h),d=matZeros(h);for(let i=0;i<h;i++)for(let j=0;j<h;j++){a[i][j]=M[i][j];b[i][j]=M[i][j+h];c[i][j]=M[i+h][j];d[i][j]=M[i+h][j+h]}return{M11:a,M12:b,M21:c,M22:d}}
function matJoin(a,b,c,d){const h=a.length,n=h*2,C=matZeros(n);for(let i=0;i<h;i++)for(let j=0;j<h;j++){C[i][j]=a[i][j];C[i][j+h]=b[i][j];C[i+h][j]=c[i][j];C[i+h][j+h]=d[i][j]}return C}
function matEqual(A,B){for(let i=0;i<A.length;i++)for(let j=0;j<A[0].length;j++)if(A[i][j]!==B[i][j])return false;return true}
function escSvg(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

