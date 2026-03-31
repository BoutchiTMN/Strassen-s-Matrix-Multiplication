// ═══════════════════════════════════════════════════════════════════════
//  STRASSEN STEP GENERATION
// ═══════════════════════════════════════════════════════════════════════
const PDEFS=[
  {label:'M1',formula:'(A11+A22)(B11+B22)',pcl:7,lOp:q=>({op:'add',a:'A11',b:'A22',r:matAdd(q.A11,q.A22)}),rOp:q=>({op:'add',a:'B11',b:'B22',r:matAdd(q.B11,q.B22)})},
  {label:'M2',formula:'(A21+A22)(B11)',pcl:8,lOp:q=>({op:'add',a:'A21',b:'A22',r:matAdd(q.A21,q.A22)}),rOp:q=>({op:'id',a:'B11',r:q.B11})},
  {label:'M3',formula:'(A11)(B12-B22)',pcl:9,lOp:q=>({op:'id',a:'A11',r:q.A11}),rOp:q=>({op:'sub',a:'B12',b:'B22',r:matSub(q.B12,q.B22)})},
  {label:'M4',formula:'(A22)(B21-B11)',pcl:10,lOp:q=>({op:'id',a:'A22',r:q.A22}),rOp:q=>({op:'sub',a:'B21',b:'B11',r:matSub(q.B21,q.B11)})},
  {label:'M5',formula:'(A11+A12)(B22)',pcl:11,lOp:q=>({op:'add',a:'A11',b:'A12',r:matAdd(q.A11,q.A12)}),rOp:q=>({op:'id',a:'B22',r:q.B22})},
  {label:'M6',formula:'(A21-A11)(B11+B12)',pcl:12,lOp:q=>({op:'sub',a:'A21',b:'A11',r:matSub(q.A21,q.A11)}),rOp:q=>({op:'add',a:'B11',b:'B12',r:matAdd(q.B11,q.B12)})},
  {label:'M7',formula:'(A12-A22)(B21+B22)',pcl:13,lOp:q=>({op:'sub',a:'A12',b:'A22',r:matSub(q.A12,q.A22)}),rOp:q=>({op:'add',a:'B21',b:'B22',r:matAdd(q.B21,q.B22)})}
];
const CDEFS=[
  {label:'C11',formula:'P1+P4-P5+P7',pcl:15,fn:M=>matAdd(matSub(matAdd(M[0],M[3]),M[4]),M[6])},
  {label:'C12',formula:'P3+P5',pcl:16,fn:M=>matAdd(M[2],M[4])},
  {label:'C21',formula:'P2+P4',pcl:17,fn:M=>matAdd(M[1],M[3])},
  {label:'C22',formula:'P1-P2+P3+P6',pcl:18,fn:M=>matAdd(matAdd(matSub(M[0],M[1]),M[2]),M[5])}
];

/**
 * Region = {r, c, sz} — top-left row/col offset and size within the ORIGINAL matrix.
 *
 * KEY INSIGHT about Strassen regions:
 * The left/right operands of each P-product are COMPUTED intermediates (sums/differences
 * of quadrants), not direct sub-regions of A/B. So we can't assign a single rectangular
 * region in A to the left operand of P1 = (A11+A22)(B11+B22).
 *
 * What we CAN track:
 * - aRegs/bRegs: the source quadrant regions that feed into the current product
 * - cReg: the C region this recursive call's result will eventually land in
 * - For recursive calls, the child inherits properly scoped regions
 *
 * For P-products that use a single quadrant (identity ops like P2's right=B11,
 * P3's left=A11, etc.), the child region IS that quadrant exactly.
 * For combined operands (A11+A22), we highlight BOTH source quadrants.
 */

/**
 * Compute the child region {r,c,sz} for a recursive call.
 * regs: array of source quadrant regions involved in this operand.
 * fallback: the parent region to use if regs is empty.
 *
 * The child's sz is always the same as each individual region's sz (they're all h×h).
 * For combined operands spanning multiple quadrants, we use the centroid of the
 * involved regions as the highlight center, keeping sz = h (the actual submatrix size).
 * For single quadrants, we use that exact region.
 */
function boundingBox(regs,fallback){
  if(!regs||regs.length===0)return{...fallback};
  if(regs.length===1)return{...regs[0]};
  // All source regions have the same sz (they're sibling quadrants of the same split)
  const sz=regs[0].sz;
  // Use the top-left of the first region as anchor — this is the minimum row/col
  let rMin=Infinity,cMin=Infinity;
  for(const rg of regs){if(rg.r<rMin)rMin=rg.r;if(rg.c<cMin)cMin=rg.c}
  return{r:rMin,c:cMin,sz};
}

// Map each P-product to which C quadrants it contributes to
const P_TO_C = {
  M1:['C11','C22'], M2:['C21','C22'], M3:['C12','C22'],
  M4:['C11','C21'], M5:['C11','C12'], M6:['C22'], M7:['C11']
};

function strassenGenSteps(A,B,depth,ctx,steps,aReg,bReg,cReg){
  const n=A.length;
  if(!aReg)aReg={r:0,c:0,sz:n};if(!bReg)bReg={r:0,c:0,sz:n};if(!cReg)cReg={r:0,c:0,sz:n};
  steps.push({action:'strassen_enter',pcl:1,depth,n,A:matClone(A),B:matClone(B),ctx,
    aReg:{...aReg},bReg:{...bReg},cReg:{...cReg},
    explain:`Enter strassen(${n}\u00d7${n}) \u2014 ${ctx}.`});
  if(n===1){
    const v=A[0][0]*B[0][0];
    steps.push({action:'base_case',pcl:2,depth,n:1,A:matClone(A),B:matClone(B),result:[[v]],
      scalar:{l:A[0][0],r:B[0][0],p:v},ctx,
      aReg:{...aReg},bReg:{...bReg},cReg:{...cReg},
      explain:`Base: ${A[0][0]} \u00d7 ${B[0][0]} = ${v}.`});
    return[[v]];
  }
  const h=n/2;
  const qA=matSplit(A),qB=matSplit(B);
  const Q={A11:qA.M11,A12:qA.M12,A21:qA.M21,A22:qA.M22,B11:qB.M11,B12:qB.M12,B21:qB.M21,B22:qB.M22};
  // Quadrant regions relative to parent aReg/bReg/cReg (correct nesting!)
  const qrA={A11:{r:aReg.r,c:aReg.c,sz:h},A12:{r:aReg.r,c:aReg.c+h,sz:h},A21:{r:aReg.r+h,c:aReg.c,sz:h},A22:{r:aReg.r+h,c:aReg.c+h,sz:h}};
  const qrB={B11:{r:bReg.r,c:bReg.c,sz:h},B12:{r:bReg.r,c:bReg.c+h,sz:h},B21:{r:bReg.r+h,c:bReg.c,sz:h},B22:{r:bReg.r+h,c:bReg.c+h,sz:h}};
  const qrC={C11:{r:cReg.r,c:cReg.c,sz:h},C12:{r:cReg.r,c:cReg.c+h,sz:h},C21:{r:cReg.r+h,c:cReg.c,sz:h},C22:{r:cReg.r+h,c:cReg.c+h,sz:h}};
  steps.push({action:'split',pcl:4,depth,n,ctx,
    aReg:{...aReg},bReg:{...bReg},cReg:{...cReg},qrA,qrB,qrC,
    explain:`Split ${n}\u00d7${n} into ${h}\u00d7${h} quadrants.`});
  const MP=[];
  for(let p=0;p<7;p++){
    const d=PDEFS[p],lo=d.lOp(Q),ro=d.rOp(Q);
    const aNames=lo.op==='id'?[lo.a]:[lo.a,lo.b],bNames=ro.op==='id'?[ro.a]:[ro.a,ro.b];
    const aRegs=aNames.filter(x=>x.startsWith('A')).map(x=>qrA[x]).filter(Boolean);
    const bRegs=bNames.filter(x=>x.startsWith('B')).map(x=>qrB[x]).filter(Boolean);
    // Determine the C quadrants this product contributes to
    const cTargets=(P_TO_C[d.label]||[]).map(k=>qrC[k]).filter(Boolean);
    steps.push({action:'prepare_product',pcl:d.pcl,depth,product:d.label,pIdx:p+1,formula:d.formula,
      leftOp:{op:lo.op,names:aNames,result:matClone(lo.r)},
      rightOp:{op:ro.op,names:bNames,result:matClone(ro.r)},ctx,
      aReg:{...aReg},bReg:{...bReg},cReg:{...cReg},aRegs,bRegs,cTargets,
      explain:`Prepare ${d.label} = ${d.formula}.`});
    // Recursive call: compute child regions from the bounding box of source quadrants.
    // For identity ops (single quad): child = that exact quadrant.
    // For combined ops (e.g. A11+A22): child = bounding box of the involved quads.
    const childAReg=boundingBox(aRegs,aReg);
    const childBReg=boundingBox(bRegs,bReg);
    const childCReg=cTargets.length?boundingBox(cTargets,cReg):{...cReg};
    const Mk=strassenGenSteps(lo.r,ro.r,depth+1,`${d.label} (depth ${depth+1})`,steps,childAReg,childBReg,childCReg);
    MP.push(Mk);
    steps.push({action:'product_complete',pcl:d.pcl,depth,product:d.label,pIdx:p+1,formula:d.formula,
      result:matClone(Mk),ctx,aReg:{...aReg},bReg:{...bReg},cReg:{...cReg},aRegs,bRegs,cTargets,
      explain:`${d.label} = ${matStr(Mk)}.`});
  }
  const CQ=[];
  for(let c=0;c<4;c++){
    const d=CDEFS[c],Cq=d.fn(MP);CQ.push(Cq);
    steps.push({action:'combine_quadrant',pcl:d.pcl,depth,quadrant:d.label,formula:d.formula,
      result:matClone(Cq),ctx,cReg:{...cReg},cTargetReg:qrC[d.label],
      explain:`${d.label} = ${d.formula} = ${matStr(Cq)}.`});
  }
  const C=matJoin(CQ[0],CQ[1],CQ[2],CQ[3]);
  steps.push({action:'join',pcl:19,depth,n,result:matClone(C),ctx,cReg:{...cReg},
    explain:`Join quadrants into ${n}\u00d7${n} result.`});
  return C;
}

