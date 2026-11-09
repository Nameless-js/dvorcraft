import {build} from 'esbuild';
await build({entryPoints:['src/walk.js'],outfile:'public/walk.bundle.js',bundle:true,format:'esm',minify:true,target:'es2022',legalComments:'eof'});
console.log('Walk bundle built.');
