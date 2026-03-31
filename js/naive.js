// ═══════════════════════════════════════════════════════════════════════
//  NAIVE STEP GENERATION (DETAILED)
// ═══════════════════════════════════════════════════════════════════════
function naiveGenSteps(A,B,steps){
  const n=A.length;
  steps.push({action:'naive_start',pcl:1,i:-1,j:-1,k:-1,n,explain:`Begin naive ${n}\u00d7${n} multiplication.`});
  steps.push({action:'naive_init',pcl:2,i:-1,j:-1,k:-1,n,explain:`Initialize ${n}\u00d7${n} result matrix C with zeros.`});
  const C=matZeros(n);
  for(let i=0;i<n;i++){
    for(let j=0;j<n;j++){
      let sum=0;
      steps.push({action:'naive_cell_start',pcl:5,i,j,k:-1,n,sum:0,
        explain:`Start computing C[${i+1}][${j+1}]: dot product of row ${i+1} of A and column ${j+1} of B.`});
      for(let k=0;k<n;k++){
        const prod=A[i][k]*B[k][j];
        sum+=prod;
        steps.push({action:'naive_multiply',pcl:7,i,j,k,n,
          aVal:A[i][k],bVal:B[k][j],prod,sum,
          explain:`A[${i+1}][${k+1}] \u00d7 B[${k+1}][${j+1}] = ${A[i][k]} \u00d7 ${B[k][j]} = ${prod}. Sum so far: ${sum}.`});
      }
      C[i][j]=sum;
      steps.push({action:'naive_cell_done',pcl:8,i,j,k:-1,n,sum,
        explain:`C[${i+1}][${j+1}] = ${sum}. Cell complete.`});
    }
  }
  steps.push({action:'naive_complete',pcl:9,i:-1,j:-1,k:-1,n,result:matClone(C),
    explain:`Naive multiplication complete. Result computed.`});
  return C;
}

