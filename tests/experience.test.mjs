import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createCameraPath, validateManifest, render } from '../.prerender/entry-server.js';

const frames = [
  {position:[0,500,1400],target:[0,350,0],fov:45},
  {position:[0,350,900],target:[0,160,0],fov:44},
  {position:[80,160,450],target:[0,80,0],fov:43},
  {position:[55,40,170],target:[0,25,0],fov:42},
  {position:[20,12,90],target:[0,15,0],fov:42},
];
const licensed = url => ({url,sourceUrl:'https://example.com/source',licenseUrl:'https://example.com/license',approved:true});
const fixture = () => ({enabled:true,architecture:licensed('/experience/test-city.glb'),environment:licensed('/experience/test-sky.hdr'),clouds:[0,1].map(index=>({...licensed(`/experience/test-cloud-${index}.png`),position:[0,300,800-index*200],width:800,height:300,opacity:0.5})),camera:frames,collisionBoxes:[{min:[10000,0,10000],max:[10010,100,10010]}],modelScale:1});

test('disabled and unapproved assets cannot activate the scene',()=>{
 assert.equal(validateManifest({enabled:false}).ready,false);
 const value=fixture(); value.architecture.approved=false;
 assert.equal(validateManifest(value).ready,false);
});
test('a complete approved configuration is accepted',()=>assert.equal(validateManifest(fixture()).ready,true));
test('unsafe asset protocols, duplicate layers and invalid poses are rejected',()=>{
 for(const mutate of [v=>v.architecture.url='javascript:alert(1)',v=>v.clouds[1].url=v.clouds[0].url,v=>v.camera=[{position:[0,0,0],target:[0,0,0],fov:45}],v=>v.modelScale=0]){const value=structuredClone(fixture());mutate(value);assert.equal(validateManifest(value).ready,false);}
});
test('camera sampling is deterministic in either scroll direction',()=>{
 const path=createCameraPath(frames);
 const snapshot=p=>{const pose=path.sample(p);return [...pose.position.toArray(),...pose.quaternion.toArray(),pose.fov];};
 const expected=new Map([0,0.1,0.25,0.5,0.75,0.9,1].map(p=>[p,snapshot(p)]));
 for(const p of [1,0.9,0.75,0.5,0.25,0.1,0])assert.deepEqual(snapshot(p),expected.get(p));
});
test('camera endpoints clamp correctly and orientations remain normalized',()=>{
 const path=createCameraPath(frames);
 assert.deepEqual(path.sample(-1).position.toArray(),frames[0].position);
 assert.deepEqual(path.sample(2).position.toArray(),frames.at(-1).position);
 for(let step=0;step<=200;step++){const pose=path.sample(step/200);assert.ok(Math.abs(pose.quaternion.length()-1)<1e-10);assert.ok(pose.position.toArray().every(Number.isFinite));}
});
test('authored exclusion volumes reject an unsafe camera path',()=>{
 const path=createCameraPath(frames);
 assert.equal(path.intersects([{min:[-5,495,1395],max:[5,505,1405]}]),true);
 assert.equal(path.intersects(fixture().collisionBoxes),false);
});
test('business content and working controls are present in server-rendered HTML',()=>{
 const html=render('/');
 for(const content of ['Medical waste','Construction waste','General waste','info@alnouras.com','tel:+97143338339','data-service-dialog','enquiry-form','dubai-map','DEMO'])assert.ok(html.includes(content),content);
 assert.ok(!html.includes('<canvas'));
});
test('public page is prerendered and the retired geographic route redirects',async()=>{
 const home=await fs.readFile('dist/index.html','utf8');
 assert.ok(home.includes('<h1'));assert.ok(home.includes('Al Nouras Waste Collection'));
 const legacy=await fs.readFile('dist/satellite-preview/index.html','utf8');
 assert.ok(legacy.includes('http-equiv="refresh"'));assert.ok(legacy.includes('noindex'));
 const preview=await fs.readFile('dist/experience-preview/index.html','utf8');
 assert.ok(preview.includes('Asset shortlist for review.'));assert.ok(preview.includes('noindex'));
});
test('Astro and Cesium are absent from production dependencies',async()=>{
 const pkg=JSON.parse(await fs.readFile('package.json','utf8'));
 assert.equal(pkg.dependencies.astro,undefined);assert.equal(pkg.dependencies.cesium,undefined);
});
