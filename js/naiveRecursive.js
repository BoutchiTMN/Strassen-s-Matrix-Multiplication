// ═══════════════════════════════════════════════════════════════════════
//  NAIVE RECURSIVE STEP GENERATION
// ═══════════════════════════════════════════════════════════════════════
// 8 sub-products: standard block formula C_ij = sum_k A_ik * B_kj for blocks
const RPRODS=[
  {cq:'C11',left:'A11',right:'B11',pcl:7,idx:0},
  {cq:'C11',left:'A12',right:'B21',pcl:7,idx:1},
  {cq:'C12',left:'A11',right:'B12',pcl:8,idx:2},
  {cq:'C12',left:'A12',right:'B22',pcl:8,idx:3},
  {cq:'C21',left:'A21',right:'B11',pcl:9,idx:4},
  {cq:'C21',left:'A22',right:'B21',pcl:9,idx:5},
  {cq:'C22',left:'A21',right:'B12',pcl:10,idx:6},
  {cq:'C22',left:'A22',right:'B22',pcl:10,idx:7}
];

function naiveRecurGenSteps(A,B,depth,ctx,steps,aReg,bReg,cReg){
  const n=A.length;
  if(!aReg)aReg={r:0,c:0,sz:n};if(!bReg)bReg={r:0,c:0,sz:n};if(!cReg)cReg={r:0,c:0,sz:n};
  steps.push({action:'rn_enter',pcl:1,depth,n,ctx,
    aReg:{...aReg},bReg:{...bReg},cReg:{...cReg},
    explain:`Enter rec_naive(${n}\u00d7${n}) \u2014 ${ctx}.`});
  if(n===1){
    const v=A[0][0]*B[0][0];
    steps.push({action:'rn_base',pcl:2,depth,n:1,result:[[v]],
      scalar:{l:A[0][0],r:B[0][0],p:v},ctx,
      aReg:{...aReg},bReg:{...bReg},cReg:{...cReg},
      explain:`Base: ${A[0][0]} \u00d7 ${B[0][0]} = ${v}.`});
    return[[v]];
  }
  const h=n/2;
  const qA=matSplit(A),qB=matSplit(B);
  const QN={A11:qA.M11,A12:qA.M12,A21:qA.M21,A22:qA.M22,B11:qB.M11,B12:qB.M12,B21:qB.M21,B22:qB.M22};
  const qrA={A11:{r:aReg.r,c:aReg.c,sz:h},A12:{r:aReg.r,c:aReg.c+h,sz:h},A21:{r:aReg.r+h,c:aReg.c,sz:h},A22:{r:aReg.r+h,c:aReg.c+h,sz:h}};
  const qrB={B11:{r:bReg.r,c:bReg.c,sz:h},B12:{r:bReg.r,c:bReg.c+h,sz:h},B21:{r:bReg.r+h,c:bReg.c,sz:h},B22:{r:bReg.r+h,c:bReg.c+h,sz:h}};
  const qrC={C11:{r:cReg.r,c:cReg.c,sz:h},C12:{r:cReg.r,c:cReg.c+h,sz:h},C21:{r:cReg.r+h,c:cReg.c,sz:h},C22:{r:cReg.r+h,c:cReg.c+h,sz:h}};
  steps.push({action:'rn_split',pcl:4,depth,n,ctx,
    aReg:{...aReg},bReg:{...bReg},cReg:{...cReg},qrA,qrB,qrC,
    explain:`Split ${n}\u00d7${n} into ${h}\u00d7${h} quadrants.`});
  // 8 recursive products, grouped into 4 result quadrants
  const prods=[];// stores {result, cq, left, right}
  for(const rp of RPRODS){
    const lMat=QN[rp.left],rMat=QN[rp.right];
    const aR=qrA[rp.left]||qrA['A11'],bR=qrB[rp.right]||qrB['B11'];
    steps.push({action:'rn_multiply',pcl:rp.pcl,depth,cq:rp.cq,left:rp.left,right:rp.right,idx:rp.idx,
      aRegs:[aR],bRegs:[bR],cTargetReg:qrC[rp.cq],
      aReg:{...aReg},bReg:{...bReg},cReg:{...cReg},
      explain:`Computing ${rp.left} \u00d7 ${rp.right} for ${rp.cq}.`});
    const res=naiveRecurGenSteps(lMat,rMat,depth+1,`${rp.left}\u00d7${rp.right} (depth ${depth+1})`,steps,aR,bR,qrC[rp.cq]);
    prods.push({result:res,cq:rp.cq,left:rp.left,right:rp.right});
    steps.push({action:'rn_prod_done',pcl:rp.pcl,depth,cq:rp.cq,left:rp.left,right:rp.right,idx:rp.idx,
      result:matClone(res),aRegs:[aR],bRegs:[bR],cTargetReg:qrC[rp.cq],
      aReg:{...aReg},bReg:{...bReg},cReg:{...cReg},
      explain:`${rp.left}\u00d7${rp.right} = ${matStr(res)}.`});
  }
  // Combine: C_ij = first_product + second_product
  const pairs=[['C11',0,1],['C12',2,3],['C21',4,5],['C22',6,7]];
  const CQ=[];
  for(const[cq,i1,i2]of pairs){
    const Cq=matAdd(prods[i1].result,prods[i2].result);CQ.push(Cq);
    const pcl={C11:7,C12:8,C21:9,C22:10}[cq];
    steps.push({action:'rn_combine',pcl,depth,quadrant:cq,
      left1:prods[i1].left+'\u00d7'+prods[i1].right,left2:prods[i2].left+'\u00d7'+prods[i2].right,
      result:matClone(Cq),cTargetReg:qrC[cq],cReg:{...cReg},
      explain:`${cq} = ${prods[i1].left}\u00d7${prods[i1].right} + ${prods[i2].left}\u00d7${prods[i2].right} = ${matStr(Cq)}.`});
  }
  const C=matJoin(CQ[0],CQ[1],CQ[2],CQ[3]);
  steps.push({action:'rn_join',pcl:11,depth,n,result:matClone(C),cReg:{...cReg},
    explain:`Join quadrants into ${n}\u00d7${n} result.`});
  return C;
}

