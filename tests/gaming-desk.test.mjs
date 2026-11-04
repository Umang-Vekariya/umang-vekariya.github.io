import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createGamingDesk,DESK} from '../dist/gaming-desk.js';
import {contactDisplay,displayCorners} from '../dist/studio-reveal-motion.js';

test('the seated workstation has two physical displays, a mechanical keyboard, and a right hand touching the mouse',()=>{
 const desk=createGamingDesk();desk.group.updateMatrixWorld(true);
 const left=new THREE.Box3().setFromObject(desk.leftScreen),right=new THREE.Box3().setFromObject(desk.rightScreen);
 assert.ok(left.max.x<right.min.x,'the monitors overlap');assert.ok(Math.abs(left.getSize(new THREE.Vector3()).y-DESK.height)<1e-6);
 assert.ok(new THREE.Box3().setFromObject(desk.rightHand).intersectsBox(new THREE.Box3().setFromObject(desk.mouse)),'the hand floats away from the mouse');
 let keys=0,submissions=0,vertices=0;desk.group.traverse(o=>{if(!o.isMesh)return;submissions++;if(o.isInstancedMesh)keys+=o.count;vertices+=o.geometry.attributes.position.count;for(const attribute of [o.geometry.attributes.position,o.geometry.attributes.normal])assert.ok(attribute.array.every(Number.isFinite));});
 assert.ok(keys>60,'the keyboard is missing physical keys');assert.ok(submissions<32,'fine details create too many separate submissions');assert.ok(vertices<500000);
 for(const point of displayCorners(contactDisplay()))assert.ok(right.clone().expandByScalar(.08).containsPoint(new THREE.Vector3(...point)),'contact leaves its physical monitor');
 desk.dispose();desk.group.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});
});
