import * as THREE from 'three';

// A continuous folded band, machined as one form. The second state opens its
// negative space into a planar aperture; there are no orbiting decorations.
export function createFormGeometry(segments=240,sides=20){
 const position=[],opened=[],indices=[],color=[];
 for(let i=0;i<=segments;i++){
  const t=i/segments*Math.PI*2,r=1.66+.24*Math.cos(3*t),c=Math.cos(t),s=Math.sin(t),twist=t*2+.38;
  for(let j=0;j<=sides;j++){
   const a=j/sides*Math.PI*2,u=Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.28)*(.37+.07*Math.sin(t*3)),v=Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.5)*.065;
   const radial=u*Math.cos(twist)-v*Math.sin(twist),depth=u*Math.sin(twist)+v*Math.cos(twist);
   position.push((r+radial)*c,(r+radial)*s,.42*Math.sin(t*3)+depth);
   opened.push((1.75+u)*c,(1.75+u)*s,v);
   const bronze=Math.sin(a)<-.65;color.push(bronze?.57:.86,bronze?.44:.89,bronze?.32:.83);
   if(i<segments&&j<sides){const n=i*(sides+1)+j;indices.push(n,n+sides+1,n+1,n+1,n+sides+1,n+sides+2);}
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(position,3));g.setAttribute('color',new THREE.Float32BufferAttribute(color,3));g.setIndex(indices);g.computeVertexNormals();
 const target=g.clone();target.setAttribute('position',new THREE.Float32BufferAttribute(opened,3));target.computeVertexNormals();g.morphAttributes.position=[target.attributes.position];g.morphAttributes.normal=[target.attributes.normal];g.computeBoundingSphere();return g;
}
