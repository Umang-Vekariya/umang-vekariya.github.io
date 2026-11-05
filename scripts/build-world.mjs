import {build} from 'esbuild';
import {readdir,unlink,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export async function buildWorld({write=true}={}){
 const result=await build({entryPoints:['dist/spatial-world.js'],bundle:true,format:'esm',minify:true,splitting:true,outdir:'dist',entryNames:'[name].bundle',chunkNames:'assets/world/[name]-[hash]',metafile:true,write,logLevel:write?'info':'silent'});
 if(write){
  const generated=new Set(Object.keys(result.metafile.outputs).map(p=>resolve(p))),folder=resolve('dist/assets/world');await mkdir(folder,{recursive:true});
  for(const name of await readdir(folder)){const path=resolve(folder,name);if(name.endsWith('.js')&&!generated.has(path))await unlink(path);}
 }
 return result;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildWorld();
