import * as THREE from 'three';
import {buildIrinaCourtyard} from './irina-courtyard.js';

export function buildCourtyard(scene,bounds){return buildIrinaCourtyard(scene,bounds);}

// A reusable residential courtyard; the selected geographic polygon stays
// untouched in the middle, so existing object coordinates remain valid.
export function buildGenericCourtyard(scene,{minX,maxX,minZ,maxZ,extent}){
 const group=new THREE.Group();group.name='Четыре дома и дворовые проезды';scene.add(group);
 const cube=new THREE.BoxGeometry(1,1,1),materials=new Map(),roads=[],houses=[],viewpoints=[];
 const material=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.95}));return materials.get(color);};
 function box(x,y,z,w,h,d,color,parent=group){const mesh=new THREE.Mesh(cube,material(color));mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=h>.3;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 const cx=(minX+maxX)/2,cz=(minZ+maxZ)/2,w=maxX-minX,d=maxZ-minZ;
 function road(x,z,rw,rd){roads.push({x,z,w:rw,d:rd});return box(x,-.025,z,rw,.09,rd,'#727c7e');}
 function ring(inner,outer,color,y=.015){const edge=(inner+outer)/2,width=outer-inner;box(minX-edge,y,cz,width,.09,d+outer*2,color);box(maxX+edge,y,cz,width,.09,d+outer*2,color);box(cx,y,minZ-edge,w+inner*2,.09,width,color);box(cx,y,maxZ+edge,w+inner*2,.09,width,color);}
 ring(.15,2,'#d4d2c8');
 road(minX-5,cz,6,d+16);road(maxX+5,cz,6,d+16);road(cx,minZ-5,w+4,6);road(cx,maxZ+5,w+4,6);
 ring(8,11,'#cccac1',.025);ring(1.9,2.08,'#e5e2d6',.08);ring(7.92,8.08,'#e5e2d6',.08);
 // Lane markings and occasional drainage grates along the inner curb.
 for(let x=minX-1;x<maxX+2;x+=8)for(const z of [minZ-5,maxZ+5])box(x,.028,z,3,.015,.1,'#e6dfc8');
 for(let z=minZ-6;z<maxZ+8;z+=8)for(const x of [minX-5,maxX+5])box(x,.028,z,.1,.015,3,'#e6dfc8');
 for(let x=minX+5;x<maxX;x+=22)for(const z of [minZ-2.25,maxZ+2.25]){box(x,.04,z,.9,.035,.35,'#424e51');for(let i=-3;i<=3;i++)box(x+i*.12,.062,z,.035,.01,.32,'#9aa4a3');}
 function sign(text,bg='#385e64',width=256,height=64){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);ctx.fillStyle='#f5f5e9';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 25px Arial';ctx.fillText(text,width/2,height/2);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshBasicMaterial({map:texture});}
 function house(number,x,z,length,rotation,color){
  const h=15.4,depth=11,home=new THREE.Group();home.position.set(x,0,z);home.rotation.y=rotation;home.name='Дом '+number;group.add(home);
  box(0,h/2,0,length,h,depth,color,home);box(0,.55,0,length+.08,1.1,depth+.08,'#99998e',home);box(0,3,depth/2+.025,length,.18,.08,'#e9e3d4',home);box(0,h+.16,0,length+.25,.32,depth+.25,'#b4b4a8',home);
  box(0,h+.4,depth/2,length+.3,.45,.18,'#d2cdbf',home);box(0,h+.4,-depth/2,length+.3,.45,.18,'#d2cdbf',home);for(const side of [-1,1])box(side*length/2,h+.4,0,.18,.45,depth,'#d2cdbf',home);
  for(let t=-length/2+5;t<length/2-2;t+=15){box(t,h+.7,0,1.2,1.3,1.2,'#abaea4',home);box(t,h+1.38,0,1.6,.12,1.6,'#818b86',home);}
  const entries=Math.max(2,Math.min(5,Math.floor(length/15))),entryPositions=Array.from({length:entries},(_,i)=>-length/2+(i+.5)*length/entries);
  const entry=entryPositions.reduce((a,b)=>Math.abs(a)<Math.abs(b)?a:b),view=new THREE.Vector3(entry,0,depth/2+6).applyAxisAngle(new THREE.Vector3(0,1,0),rotation).add(new THREE.Vector3(x,0,z));viewpoints.push({position:view,yaw:rotation});
  const panes=[],frames=[],m=new THREE.Matrix4(),v=new THREE.Vector3(),q=new THREE.Quaternion(),scale=new THREE.Vector3();
  for(const side of [-1,1])for(let floor=0;floor<5;floor++)for(let xx=-length/2+2.2;xx<length/2-1.4;xx+=3.15){
   if(side===1&&entryPositions.some(e=>Math.abs(e-xx)<1.1))continue;
   const yy=2.05+floor*2.75,zz=side*(depth/2+.045);frames.push([xx,yy,zz,1.6,1.72,.12]);panes.push([xx,yy,zz+side*.075,1.36,1.47,.035]);
  }
  function instances(data,color){const mesh=new THREE.InstancedMesh(cube,material(color),data.length);data.forEach((a,i)=>{v.set(a[0],a[1],a[2]);scale.set(a[3],a[4],a[5]);m.compose(v,q,scale);mesh.setMatrixAt(i,m);});mesh.receiveShadow=true;home.add(mesh);}
  instances(frames,'#f1eee4');instances(panes,'#718c98');
  for(const [i,ex] of entryPositions.entries()){
   const front=depth/2;
   box(ex,1.25,front+.07,1.45,2.5,.18,'#3c575c',home);box(ex+.34,1.4,front+.185,.035,.34,.035,'#d4d0b6',home);box(ex-.3,1.73,front+.18,.5,.65,.025,'#95adb3',home);
   box(ex,2.9,front+.78,3.05,.18,1.8,'#628485',home);for(const sx of [-1,1])box(ex+sx*1.3,1.46,front+1.4,.07,2.85,.07,'#65797b',home);
   for(let step=0;step<3;step++)box(ex,.05+step*.06,front+1.9-step*.35,2.8,.1+step*.12,1.2,'#b6b9b1',home);
   const plate=new THREE.Mesh(new THREE.PlaneGeometry(1.85,.4),sign('ПОДЪЕЗД '+(i+1)));plate.position.set(ex,2.65,front+.18);home.add(plate);
   for(let floor=1;floor<5;floor++){box(ex,1.8+floor*2.75,front+.12,.8,1.2,.08,'#8fa4a6',home);}
   // Path from each porch, across the drive, to the experimental ground.
   const pos=new THREE.Vector3(ex,0,front+3).applyAxisAngle(new THREE.Vector3(0,1,0),rotation).add(new THREE.Vector3(x,0,z));
   if(Math.abs(Math.sin(rotation))<.5){const dir=z<cz?1:-1;box(pos.x,.045,z+dir*(depth/2+1.6),2.5,.12,3.2,'#d8d4c7');for(let j=0;j<7;j++)box(pos.x,.04,(z<cz?minZ-7.7:maxZ+7.7)+dir*j*.8,2.5,.018,.38,'#eee9da');}
   else{const dir=x<cx?1:-1;box(x+dir*(depth/2+1.6),.045,pos.z,3.2,.12,2.5,'#d8d4c7');for(let j=0;j<7;j++)box((x<cx?minX-7.7:maxX+7.7)+dir*j*.8,.04,pos.z,.38,.018,2.5,'#eee9da');}
  }
  const badge=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.65),sign('ДОМ '+number,'#5d756f'));badge.position.set(-length/2+2,3.6,depth/2+.16);home.add(badge);
  const horizontal=Math.abs(Math.sin(rotation))<.5;houses.push({x,z,w:horizontal?length:depth,d:horizontal?depth:length});
 }
 const lx=Math.max(24,Math.min(96,w*.86)),lz=Math.max(24,Math.min(96,d*.86));
 house(1,cx,minZ-16.5,lx,0,'#ded7c5');house(2,maxX+16.5,cz,lz,-Math.PI/2,'#ced5ce');house(3,cx,maxZ+16.5,lx,Math.PI,'#d9cdbb');house(4,minX-16.5,cz,lz,Math.PI/2,'#d5d9d4');
 // Extra, lightweight residential rows stay behind the compact starter yard.
 function backdrop(x,z,length,rotation){const home=new THREE.Group();home.position.set(x,0,z);home.rotation.y=rotation;group.add(home);const h=15.4,depth=11;box(0,h/2,0,length,h,depth,'#d2d2c6',home);box(0,h+.15,0,length+.3,.3,depth+.3,'#a4ada4',home);box(0,.45,0,length,.9,depth+.06,'#a2a698',home);const positions=[];for(const side of [-1,1])for(let row=0;row<5;row++)for(let xx=-length/2+2;xx<length/2-1;xx+=3.1)positions.push([xx,2+row*2.75,side*(depth/2+.03)]);const windows=new THREE.InstancedMesh(cube,material('#7d979c'),positions.length),matrix=new THREE.Matrix4();positions.forEach((p,i)=>{matrix.makeScale(1.3,1.45,.08);matrix.setPosition(...p);windows.setMatrixAt(i,matrix);});home.add(windows);for(const ex of [-length*.25,length*.25]){box(ex,1.2,depth/2+.04,1.4,2.4,.12,'#3e5d61',home);box(ex,2.7,depth/2+.65,2.6,.14,1.5,'#658887',home);}const horizontal=Math.abs(Math.sin(rotation))<.5;houses.push({x,z,w:horizontal?length:depth,d:horizontal?depth:length});}
 if(extent){const rowsX=Math.min(2,Math.max(0,Math.ceil((extent.maxX-extent.minX-60)/90))),rowsZ=Math.min(2,Math.max(0,Math.ceil((extent.maxZ-extent.minZ-56)/90)));for(let row=0;row<rowsX;row++)for(const side of [-1,1])for(const offset of [-23,23])backdrop(cx+side*(w/2+54+row*38),cz+offset,34,side<0?Math.PI/2:-Math.PI/2);for(let row=0;row<rowsZ;row++)for(const side of [-1,1])for(const offset of [-23,23])backdrop(cx+offset,cz+side*(d/2+54+row*38),34,side<0?0:Math.PI);}
 const bounds={minX:Math.min(minX,...houses.map(h=>h.x-h.w/2)),maxX:Math.max(maxX,...houses.map(h=>h.x+h.w/2)),minZ:Math.min(minZ,...houses.map(h=>h.z-h.d/2)),maxZ:Math.max(maxZ,...houses.map(h=>h.z+h.d/2))};
 return{group,roads,houses,viewpoints,bounds,blocked(x,z){return houses.some(h=>Math.abs(x-h.x)<h.w/2+.3&&Math.abs(z-h.z)<h.d/2+.3);}};
}

export function makeSoilTexture(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#bdad8e';ctx.fillRect(0,0,256,256);let seed=27;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 for(let i=0;i<6500;i++){const shade=rand()>.5?'#a7987d':'#d0c3a8';ctx.globalAlpha=.2+rand()*.25;ctx.fillStyle=shade;ctx.fillRect(rand()*256,rand()*256,1+rand()*3,1+rand()*2);}ctx.globalAlpha=1;const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(.25,.25);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
