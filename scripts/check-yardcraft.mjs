import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import * as THREE from 'three';
import {buildCourtyard} from '../src/courtyard.js';

// Small far-view dots, bounded native geometry and cancellation of late loads.
let zoom=19.5;const events=new Map(),rendered=new Map(),dots=new Set();let finishLoad;
class Plugin{on(){}async addModels(options){await new Promise(r=>finishLoad=r);options.forEach(o=>rendered.set(o.modelId,o));}destroy(){rendered.clear();}}
class HtmlMarker{constructor(){dots.add(this);}on(){}destroy(){dots.delete(this);}}
const map={getZoom:()=>zoom,on:(key,fn)=>events.set(key,fn),off:key=>events.delete(key)};
const sandbox={window:{mapgl:{GltfPlugin:Plugin}},mapgl:{GltfPlugin:Plugin,HtmlMarker},document:{createElement:()=>({setAttribute(){},addEventListener(){}})},location:{origin:'http://localhost'},console,setTimeout,clearTimeout};vm.createContext(sandbox);vm.runInContext(await fs.readFile('public/yard-models.js','utf8'),sandbox);
const layer=sandbox.window.YardModels.attach(map,()=>{},()=>{});const item={type:1,coord:[76.956,52.2858]};layer.sync([item]);
await new Promise(r=>setTimeout(r,0));finishLoad();await new Promise(r=>setTimeout(r,0));assert.ok([...rendered.values()][0].scale<=2.5);
zoom=14;events.get('zoom')();await new Promise(r=>setTimeout(r,200));assert.equal(rendered.size,0);assert.equal(dots.size,1);layer.sync([]);assert.equal(dots.size,0);
zoom=20;layer.sync([item]);await new Promise(r=>setTimeout(r,0));layer.sync([]);finishLoad();await new Promise(r=>setTimeout(r,0));assert.equal(rendered.size,0);assert.equal(dots.size,0);
layer.destroy();assert.equal(events.size,0);

// The central four houses stay in the same places for small and large plots.
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){},fillText(){}})})};
const starter={minX:-20,maxX:20,minZ:-18,maxZ:18};
const small=buildCourtyard(new THREE.Scene(),{...starter,extent:{minX:-5,maxX:5,minZ:-4,maxZ:4}});
const large=buildCourtyard(new THREE.Scene(),{...starter,extent:{minX:-90,maxX:90,minZ:-70,maxZ:70}});
assert.equal(small.houses.length,4);assert.ok(large.houses.length>4);assert.deepEqual(large.houses.slice(0,4),small.houses);assert.deepEqual(large.viewpoints,small.viewpoints);assert.ok(!small.blocked(6,12));
assert.equal(small.arches.length,2);for(const arch of small.arches)assert.equal(small.blocked(arch.x,arch.z),false);assert.equal(small.blocked(0,-35),true);
console.log('PASS: bounded model size, far-view dots, reset during loading, stable starter courtyard.');

