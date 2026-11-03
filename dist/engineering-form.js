import * as THREE from 'three';

// A continuous folded band, machined as one form. The second state opens its
// negative space into a planar aperture; there are no orbiting decorations.
export function createFormGeometry(segments=320,sides=64){
 const position=[],opened=[],indices=[],color=[];
 for(let i=0;i<=segments;i++){
  const t=i/segments*Math.PI*2,r=1.66+.18*Math.cos(3*t),c=Math.cos(t),s=Math.sin(t),twist=t*2+.38;
  for(let j=0;j<=sides;j++){
   const a=j/sides*Math.PI*2,u=Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.34)*(.37+.07*Math.sin(t*3)),v=Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.34)*.075;
   const radial=u*Math.cos(twist)-v*Math.sin(twist),depth=u*Math.sin(twist)+v*Math.cos(twist);
   position.push((r+radial)*c,(r+radial)*s,.28*Math.sin(t*3)+depth);
   opened.push((1.75+u)*c,(1.75+u)*s,v);
   const bronze=Math.sin(a)<-.65;color.push(bronze?.57:.86,bronze?.44:.89,bronze?.32:.83);
   if(i<segments&&j<sides){const n=i*(sides+1)+j;indices.push(n,n+sides+1,n+1,n+1,n+sides+1,n+sides+2);}
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(position,3));g.setAttribute('color',new THREE.Float32BufferAttribute(color,3));g.setIndex(indices);g.computeVertexNormals();
 stitchNormals(g,segments,sides);
 const target=g.clone();target.setAttribute('position',new THREE.Float32BufferAttribute(opened,3));target.computeVertexNormals();stitchNormals(target,segments,sides);g.morphAttributes.position=[target.attributes.position];g.morphAttributes.normal=[target.attributes.normal];g.computeBoundingSphere();return g;
}

function stitchNormals(g,segments,sides){
 const n=g.attributes.normal,a=new THREE.Vector3(),b=new THREE.Vector3();
 const join=(i,j)=>{a.fromBufferAttribute(n,i);b.fromBufferAttribute(n,j);a.add(b).normalize();n.setXYZ(i,a.x,a.y,a.z);n.setXYZ(j,a.x,a.y,a.z);};
 for(let i=0;i<=segments;i++)join(i*(sides+1),i*(sides+1)+sides);
 for(let j=0;j<=sides;j++)join(j,segments*(sides+1)+j);
 n.needsUpdate=true;
}
