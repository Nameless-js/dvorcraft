import fs from 'node:fs/promises';
import validator from 'gltf-validator';
const dir=new URL('../public/models/',import.meta.url);
const manifest=JSON.parse(await fs.readFile(new URL('manifest.json',dir),'utf8'));
for(const {name} of manifest){const bytes=await fs.readFile(new URL(name+'.glb',dir));const report=await validator.validateBytes(new Uint8Array(bytes),{uri:name+'.glb'});console.log(`${name}: ${report.issues.numErrors} errors, ${report.issues.numWarnings} warnings`);if(report.issues.numErrors){console.error(report.issues.messages);process.exitCode=1;}}
