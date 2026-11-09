window.YardModels=(()=>{
const names=['lamp','bench','tree','playground','path','swing','bike','bin','parking'];
const dimensions=[[1.4,.65],[1.9,.7],[3.5,3.2],[8,6],[10,5.5],[3.2,1.6],[3,1.2],[.65,.65],[2.7,5.4]];
const hitEvents=new WeakSet(),icon=(type,extra='')=>`<img class="model-preview ${extra}" src="/models/${names[type]}.svg" alt="" loading="lazy" draggable="false">`;
let loading;
function load(){if(window.mapgl?.GltfPlugin)return Promise.resolve();return loading??=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/vendor/mapgl-gltf.js';script.onload=resolve;script.onerror=()=>{loading=null;reject(Error('Не удалось загрузить 3D'));};document.head.append(script);});}
function attach(map,onClick,onStatus,{readOnly=false}={}){let plugin,dead=false,items=[],zone=[],epoch=0,running=false,rerun=false,timer,marks=[];
const clearMarks=()=>{marks.forEach(m=>m.destroy());marks=[];};
function reset(){epoch++;plugin?.destroy();plugin=null;clearMarks();}
function scale(item){const mpp=156543.03392*Math.cos(item.coord[1]*Math.PI/180)/2**map.getZoom(),size=Math.max(...dimensions[item.type]);let cap=2.5;if(zone.length>=3){const xs=zone.map(p=>p[0]),ys=zone.map(p=>p[1]);const span=Math.min((Math.max(...xs)-Math.min(...xs))*111320*Math.cos(item.coord[1]*Math.PI/180),(Math.max(...ys)-Math.min(...ys))*111320);cap=Math.min(cap,Math.max(.05,span*.2/size));}return Math.min(cap,Math.max(1,16*mpp/size));}
function dots(snapshot){clearMarks();snapshot.forEach(item=>{const button=document.createElement('button');button.className='map-object-dot';button.title=['Фонарь','Лавочка','Дерево','Площадка','Дорожка','Качели','Велопарковка','Урна','Парковка'][item.type]+(readOnly?' · просмотр':' · нажмите, чтобы удалить');button.setAttribute('aria-label',button.title);button.addEventListener('click',e=>{e.stopPropagation();if(readOnly)return;hitEvents.add(e);onClick(item);});marks.push(new mapgl.HtmlMarker(map,{coordinates:item.coord,html:button,anchor:[7,7]}));});}
async function render(){if(dead)return;if(running){rerun=true;return;}running=true;rerun=false;reset();const version=epoch,snapshot=[...items];let instance;
try{if(!snapshot.length)return;const needsPreview=()=>map.getZoom()<17;const native=snapshot.map((item,index)=>({item,index})).filter(({item})=>!needsPreview(item));dots(snapshot.filter(needsPreview));if(!native.length){onStatus('Точки показывают ваши объекты. Приблизьте карту, чтобы рассмотреть модели.');return;}await load();if(dead||version!==epoch)return;instance=new mapgl.GltfPlugin(map,{modelsLoadStrategy:'dontWaitAll',zIndex:10,hoverOptions:{color:'#c9ffb5'}});plugin=instance;instance.on('click',e=>{if(e.originalEvent)hitEvents.add(e.originalEvent);const index=Number(e.target?.modelId?.split('-').at(-1));if(snapshot[index]&&version===epoch)onClick(snapshot[index]);});await instance.addModels(native.map(({item,index})=>({modelId:`yard-${version}-${index}`,modelUrl:location.origin+'/models/'+names[item.type]+'.glb',coordinates:item.coord,scale:scale(item),offsetZ:.12,interactive:!readOnly})));if(dead||version!==epoch){instance.destroy();return;}onStatus('Издалека объекты обозначены точками, вблизи видны модели.');
}catch(e){if(!dead&&version===epoch){instance?.destroy();plugin=null;dots(snapshot);onStatus('Объекты обозначены точками. 3D сейчас недоступен.');console.warn(e.message);}}
finally{running=false;if(!dead&&rerun)render();}}
const onZoom=()=>{clearTimeout(timer);timer=setTimeout(render,160);};map.on('zoom',onZoom);
return{sync(next,nextZone=[]){items=[...next];zone=[...nextZone];reset();if(!items.length){rerun=false;return;}render();},destroy(){dead=true;clearTimeout(timer);reset();map.off('zoom',onZoom);}};
}
return{icon,attach,hitEvents};
})();




