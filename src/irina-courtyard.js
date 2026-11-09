import * as THREE from 'three';

// Approximate reconstruction from the user's single courtyard photograph.
// Dimensions and the unseen front wing are illustrative, not surveyed data.
export function buildIrinaCourtyard(scene,{minX,maxX,minZ,maxZ,extent}){
 const cx=(minX+maxX)/2,cz=(minZ+maxZ)/2,group=new THREE.Group();group.name='ЖК «Ирина» — реконструкция по фото';scene.add(group);
 const cube=new THREE.BoxGeometry(1,1,1),mats=new Map(),houses=[],roads=[],viewpoints=[],arches=[],obstacles=[];
 const mat=color=>{if(!mats.has(color))mats.set(color,new THREE.MeshStandardMaterial({color,roughness:.92}));return mats.get(color);};
 function box(x,y,z,w,h,d,color,parent=group){const o=new THREE.Mesh(cube,mat(color));o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=h>.4;o.receiveShadow=true;parent.add(o);return o;}
 function label(text,width=256){const c=document.createElement('canvas');c.width=width;c.height=64;const g=c.getContext('2d');g.fillStyle='#623d39';g.fillRect(0,0,width,64);g.fillStyle='#f4e9dc';g.font='bold 24px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(text,width/2,32);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshBasicMaterial({map:t});}
 function brickTexture(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#985c51';g.fillRect(0,0,128,128);for(let row=0;row<16;row++){g.fillStyle=row%3?'#805047':'#ad7060';g.fillRect(0,row*8,128,1);for(let col=0;col<9;col++)g.fillRect(col*16+(row%2?8:0),row*8,1,8);}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(8,6);t.colorSpace=THREE.SRGBColorSpace;return t;}
 const brick=new THREE.MeshStandardMaterial({color:'#bd8c7b',map:brickTexture(),roughness:1});
 function rawBox(x,y,z,w,h,d,material,parent){const o=new THREE.Mesh(cube,material);o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function wing(number,x,z,length,rotation,archX=null){
  const home=new THREE.Group();home.name='Кирпичный корпус '+number;home.position.set(x,0,z);home.rotation.y=rotation;group.add(home);const height=29.2,depth=10,front=depth/2;
  if(archX===null)rawBox(0,height/2,0,length,height,depth,brick,home);
  else{
   const radius=3.1,spring=2.4,left=archX-radius,right=archX+radius;
   rawBox((-length/2+left)/2,height/2,0,left+length/2,height,depth,brick,home);rawBox((right+length/2)/2,height/2,0,length/2-right,height,depth,brick,home);
   const shape=new THREE.Shape();shape.moveTo(-radius,height);shape.lineTo(radius,height);shape.lineTo(radius,spring);shape.absarc(0,spring,radius,0,Math.PI,false);shape.lineTo(-radius,height);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:18});geo.translate(archX,0,-depth/2);const lintel=new THREE.Mesh(geo,brick);lintel.castShadow=lintel.receiveShadow=true;home.add(lintel);
   const passage=new THREE.Vector3(archX,0,0).applyAxisAngle(new THREE.Vector3(0,1,0),rotation).add(new THREE.Vector3(x,0,z));arches.push({x:passage.x,z:passage.z,w:6.2,d:depth+1,rotation,house:number});
   box(archX,.015,0,6.1,.06,depth+7,'#8b8d83',home);
   // Light stone reveal around the actual open arch, not a painted doorway.
   const curve=[];for(let i=0;i<=28;i++){const a=i/28*Math.PI;curve.push(new THREE.Vector3(archX+radius*Math.cos(a),spring+radius*Math.sin(a),front+.04));}const edge=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve),new THREE.LineBasicMaterial({color:0xc9b392}));home.add(edge);for(const side of [-1,1])box(archX+side*(radius+.08),spring/2,front+.05,.16,spring,.12,'#c9b392',home);
  }
  box(0,.48,front+.03,length,.95,.15,'#6c4942',home);box(0,height+.13,0,length+.2,.27,depth+.2,'#6f4741',home);
  for(let floor=1;floor<10;floor++)box(0,floor*2.95+.18,front+.035,length,.085,.1,'#a5786c',home);
  for(let xx=-length/2+5;xx<length/2-2;xx+=13){box(xx,height+.65,0,1.1,1.2,1.1,'#784b42',home);box(xx,height+1.3,0,1.4,.13,1.4,'#6b534b',home);}
  // Several raised roofline sections echo the stepped facade in the photo.
  for(const xx of [-length*.34,length*.12,length*.39]){rawBox(xx,height+.9,0,3.5,1.8,depth,brick,home);box(xx,height+1.85,0,3.65,.12,depth+.15,'#7d5147',home);}
  const batches=new Map();function part(color,x,y,z,w,h,d){if(!batches.has(color))batches.set(color,[]);batches.get(color).push([x,y,z,w,h,d]);}
  let column=0;for(let xx=-length/2+2;xx<length/2-1.5;xx+=3.25,column++)for(let floor=0;floor<9;floor++){
   const yy=1.85+floor*2.95;if(archX!==null&&floor<2&&Math.abs(xx-archX)<4)continue;
   const balcony=column%4===0||column%4===1;
   if(balcony){
    part('#dedbd0',xx,yy-1,front+.48,2.65,.14,1.15);part('#d2d9d4',xx,yy,front+1.04,2.55,1.86,.08);
    part('#809996',xx,yy+.06,front+1.1,2.35,1.52,.04);
    for(const offset of [-1.24,-.42,.42,1.24])part('#f0ede1',xx+offset,yy,front+1.15,.065,1.9,.09);
    for(const dy of [-.93,.1,.93])part('#eee9dc',xx,yy+dy,front+1.15,2.58,.07,.08);
    for(const side of [-1,1])part('#d3dcd6',xx+side*1.27,yy,front+.52,.07,1.86,1.05);
   }else{part('#e7e4da',xx,yy,front+.09,1.52,1.8,.1);part('#9bafad',xx,yy,front+.16,1.33,1.6,.05);part('#eeece4',xx,yy,front+.2,.06,1.62,.05);part('#eee9df',xx,yy+.25,front+.2,1.36,.05,.05);}
  }
  for(const [color,data] of batches){const mesh=new THREE.InstancedMesh(cube,mat(color),data.length),matrix=new THREE.Matrix4();data.forEach((p,i)=>{matrix.makeScale(p[3],p[4],p[5]);matrix.setPosition(p[0],p[1],p[2]);mesh.setMatrixAt(i,matrix);});mesh.receiveShadow=true;home.add(mesh);}
  const entries=[-length*.32,0,length*.32].filter(e=>archX===null||Math.abs(e-archX)>6);
  for(const [i,ex] of entries.entries()){
   box(ex,1.35,front+.13,1.6,2.7,.22,'#493d36',home);box(ex,1.72,front+.26,.9,.9,.035,'#81918a',home);box(ex,3.04,front+1.02,4.1,.2,2.3,'#73605b',home);for(const side of [-1,1])box(ex+side*1.75,1.5,front+1.8,.16,2.9,.16,'#884d45',home);
   box(ex,.13,front+1.25,3.8,.26,2.4,'#a6a397',home);const sign=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.3),label('ПОДЪЕЗД '+(i+1)));sign.position.set(ex,2.73,front+.28);home.add(sign);
  }
  const entry=entries[Math.floor(entries.length/2)]??-length*.25;const p=new THREE.Vector3(entry,0,front+7).applyAxisAngle(new THREE.Vector3(0,1,0),rotation).add(new THREE.Vector3(x,0,z));viewpoints.push({position:p,yaw:rotation});
  houses.push({x,z,w:Math.abs(Math.sin(rotation))<.5?length:depth,d:Math.abs(Math.sin(rotation))<.5?depth:length,rotation,length,archX});
 }
 // Four connected wings form the enclosed courtyard visible in the reference.
 wing(1,cx,cz-35,80,0,13);wing(2,cx+35,cz,60,-Math.PI/2);wing(3,cx,cz+35,80,Math.PI,-15);wing(4,cx-35,cz,60,Math.PI/2);
 // Paved perimeter, central service building, right-side sports and play areas.
 box(cx,-.015,cz,60,.08,60,'#aaa99d');
 function road(x,z,w,d){box(x,.045,z,w,.08,d,'#878b86');roads.push({x,z,w,d});}
 road(cx-24,cz,7,60);road(cx+25,cz,6,60);road(cx,cz-25,44,7);road(cx,cz+25,44,7);road(cx-5,cz,7,43);
 for(const x of [cx-19.8,cx+20.8])box(x,.11,cz,.22,.18,48,'#d1cdbd');
 // Single-storey red-brick service structure in the lower-left of the photo.
 rawBox(cx-11,2,cz+12,12,4,10,brick,group);box(cx-11,4.1,cz+12,12.6,.22,10.6,'#68746e');for(const side of [-1,1])box(cx-11+side*6.2,4.28,cz+12,.2,.25,10.6,'#d1ccc0');box(cx-11,4.28,cz+17.2,12.6,.25,.2,'#d1ccc0');box(cx-11,4.28,cz+6.8,12.6,.25,.2,'#d1ccc0');box(cx-11,1.4,cz+17.06,1.7,2.8,.12,'#574b40');obstacles.push({x:cx-11,z:cz+12,w:12,d:10});
 // Court behind the playground, as seen on the right of the reference image.
 box(cx+12,.12,cz-5,14,.12,17,'#834a4d');for(const x of [cx+5.3,cx+18.7])box(x,.19,cz-5,.07,.012,16.3,'#d7d2bf');for(const z of [cz-13,cz+3])box(cx+12,.19,z,13.4,.012,.07,'#d7d2bf');box(cx+12,.19,cz-5,13.4,.012,.06,'#d7d2bf');
 const wire=new THREE.LineBasicMaterial({color:'#50665b',transparent:true,opacity:.55});for(const side of [-1,1]){const x=cx+12+side*7.2;for(let z=cz-13.5;z<=cz+3.6;z+=2.85)box(x,1.55,z,.065,3,.065,'#566d61');for(const y of [.45,1,1.55,2.1,2.65,3]){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,y,cz-13.5),new THREE.Vector3(x,y,cz+3.5)]),wire);group.add(line);}}
 for(const z of [cz-12.7,cz+2.7]){for(const x of [cx+9.8,cx+14.2])box(x,1,z,.09,2,.09,'#d6d8cb');box(cx+12,2,z,4.5,.09,.09,'#d6d8cb');}
 // Rubber play surface with coloured islands; fixtures are existing context.
 box(cx+12,.12,cz+15,16,.12,18,'#7b5151');box(cx+12,.19,cz+11,15.5,.015,9.2,'#47746a');for(const [x,z,r,color] of [[12,17,2.4,'#bdaf70'],[16,21,1.6,'#799567'],[7,20,1.3,'#a87b76']]){const disc=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.02,24),mat(color));disc.position.set(cx+x,.22,cz+z);group.add(disc);}
 const fixtures=[{type:3,x:cx+11,z:cz+13,scale:1.25},{type:1,x:cx+1,z:cz-13,scale:1},{type:7,x:cx+3,z:cz-13,scale:1},{type:1,x:cx-21,z:cz-12,scale:1}];
 if(extent&&(extent.maxX-extent.minX>70||extent.maxZ-extent.minZ>70)){wing(5,cx-20,cz-65,34,0);wing(6,cx+20,cz-65,34,0);}
 const bounds={minX:cx-40,maxX:cx+40,minZ:Math.min(cz-40,...houses.map(h=>h.z-h.d/2)),maxZ:cz+40};
 return{group,roads,houses,viewpoints:viewpoints.slice(0,4),arches,fixtures,bounds,overview:{position:new THREE.Vector3(cx-12,25,cz+27),target:new THREE.Vector3(cx+1,0,cz-4)},blocked(x,z){
  if(obstacles.some(b=>Math.abs(x-b.x)<b.w/2+.25&&Math.abs(z-b.z)<b.d/2+.25))return true;
  return houses.some(h=>{if(Math.abs(x-h.x)>=h.w/2+.25||Math.abs(z-h.z)>=h.d/2+.25)return false;const dx=x-h.x,dz=z-h.z,localX=dx*Math.cos(h.rotation)-dz*Math.sin(h.rotation);return h.archX===null||Math.abs(localX-h.archX)>2.75;});
 }};
}
