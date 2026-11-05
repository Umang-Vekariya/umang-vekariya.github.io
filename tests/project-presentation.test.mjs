import test from 'node:test';
import assert from 'node:assert/strict';
import {projects} from '../dist/portfolio-data.js';
import {featuredWork,orderForReading,exhibitCopy} from '../dist/project-presentation.js';
import {demoContent} from '../dist/demo-content.js';

test('selected builds lead the reading order while every project and detailed demonstration remains available',()=>{
 const original=projects.map(p=>p.id),ordered=orderForReading(projects).map(p=>p.id);assert.deepEqual(ordered.slice(0,3),featuredWork.map(p=>p.id));assert.equal(new Set(ordered).size,8);assert.deepEqual([...ordered].sort(),[...original].sort());assert.deepEqual(projects.map(p=>p.id),original,'presentation reordered the physical gallery');
 for(const p of projects){const copy=exhibitCopy[p.id],detail=demoContent.find(d=>d.id===p.id);assert.ok(copy.scope);assert.ok(copy.subtitle.length<65);assert.equal(copy.steps.length,detail.steps.length);for(const text of copy.steps)assert.ok(text.length<=90,'the exhibit explanation is too long');assert.ok(detail.steps.every(s=>s[2].length>0));}
});
