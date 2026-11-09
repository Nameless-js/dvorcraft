/* Step-by-step, non-destructive walkthrough shared by the map and 3D scene. */
window.YardCraftGuide=(()=>{
 let state=null;
 const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const step=(target,title,action,result,art='place')=>({target,title,action,result,art});
 const mapSteps=[
 step('#setup-form','Начните с адреса','Выберите район, введите улицу и номер дома. Нажмите «Найти на карте».','Карта приблизится к вашему дому. Двор можно найти и вручную, перемещая карту.','address'),
 step('#budget','Задайте бюджет','Введите сумму, которую готовы потратить на благоустройство. Например, 5 000 000 ₸.','Это лимит проекта. По мере добавления объектов сайт покажет остаток или нехватку денег.','budget'),
 step('#draw','Отметьте границу двора','Нажмите «Отметить двор», затем кликните по углам территории на карте — минимум три точки. Нажмите «Готово».','Появится зелёная граница. Новые объекты можно будет размещать внутри неё.','zone'),
 step('.catalog','Выберите улучшение','Нажмите на лавочку, фонарь, дерево или другой объект в каталоге слева.','Включится режим размещения выбранной модели. Цена указана за одну штуку или участок.','place'),
 step('#map','Поставьте модель на карту','Нажмите на свободное место внутри отмеченной территории. Повторите клик, если нужны ещё такие же объекты.','Модель появится на карте, а стоимость добавится к проекту. Чтобы убрать модель, нажмите на неё или на × в списке.','place'),
 step('#summary','Проверьте, хватает ли денег','Посмотрите общую стоимость и остаток в блоке «Бюджет двора».','При превышении бюджета появится сумма, которой не хватает. Можно удалить объекты или изменить лимит. Все цены демонстрационные.','budget'),
 step('[data-open-walk]','Посмотрите двор изнутри','Когда граница двора готова, нажмите «Прогуляться по двору».','Откроется 3D-двор с четырьмя домами и вашими моделями. Там тоже есть кнопка «Инструкция».','walk'),
 step('#save','Сохраните свой вариант','Введите понятное название проекта и нажмите «Сохранить вариант».','Вариант сохранится на сервере. На экране результата будут список улучшений, расчёт, скачивание и ссылка для соседей.','save'),
 step('[data-go="vote"]','Выберите вместе с соседями','Откройте «Варианты соседей», сравните предложения и нажмите «Поддержать вариант».','Голос учтётся в общем счётчике. Демо-голос можно изменить; проверка личности жителей пока не используется.','vote'),
 step('[data-open-walk]','Перейдите в 3D и прогуляйтесь','Нажмите «Прогуляться по двору», когда территория отмечена. Для примера можно сначала загрузить «Пример · 5 млн ₸».','Вы увидите свой план на уровне глаз: четыре дома вокруг и ваши модели в центре. WASD — ходить, мышь — осматриваться. В режиме «Редактировать» можно переносить, удалять и добавлять объекты. Кнопка «Инструкция» внутри 3D объяснит каждый шаг.','walk')
 ];
 const walkSteps=[
 step('.walk-canvas','Вы внутри своего двора','Используйте W A S D или стрелки, чтобы идти. Потяните мышью по сцене, чтобы осмотреться. На телефоне есть кнопки движения.','Вы перемещаетесь на уровне глаз. Shift ускоряет ходьбу. Это типовой двор, а расположение ваших моделей взято из плана.','walk'),
 step('.walk-house-links','Осмотрите подъезды','Нажмите «Дом 1», «Дом 2», «Дом 3» или «Дом 4».','Камера переместится к подъезду выбранного дома. Перед ним — проезд, а за вами — центральная территория.','walk'),
 step('.walk-minimap','Не теряйтесь во дворе','Посмотрите на мини-карту в углу сцены.','Синяя стрелка показывает ваше положение и направление взгляда. Точки — ваши объекты, прямоугольники снаружи — дома.','zone'),
 step('.walk-mode','Переключитесь в редактирование','Нажмите «Редактировать» вверху. Затем нажмите на модель в сцене или выберите её в списке «На территории».','Модель выделится зелёной рамкой. В боковой панели появятся команды «Перенести» и «Удалить».','move'),
 step('.walk-selection','Перенесите или удалите объект','Для переноса нажмите «Перенести», наведите на землю и кликните по новому месту внутри границы. Для удаления нажмите «Удалить».','Модель изменит положение или исчезнет. Правка сразу запишется в черновик и отразится на карте. Esc отменяет незавершённый перенос.','move'),
 step('.walk-catalog','Добавьте что-нибудь во время прогулки','Нажмите на нужное улучшение в каталоге, затем нажмите на землю внутри границы двора.','Сначала появится полупрозрачный предпросмотр, после клика — новая модель. Стоимость пересчитается автоматически.','place'),
 step('.walk-budget','Контролируйте стоимость','Следите за суммой и остатком в боковой панели.','Добавление увеличивает стоимость, удаление уменьшает. Перенос модели не меняет цену. Все цены демонстрационные.','budget'),
 step('[data-walk="undo"]','Ошиблись? Отмените правку','Нажмите «↶ Отмена» после добавления, переноса или удаления.','Вернётся предыдущее состояние двора и бюджета. Во время одной прогулки можно отменить до 30 последних правок.','move'),
 step('[data-walk="close"]','Вернитесь к плану и сохраните','Нажмите «К карте». Затем сохраните вариант, если хотите отправить его соседям.','Все правки из прогулки останутся в вашем черновике. Сохранённый вариант можно скачать и открыть по ссылке.','save')
 ];
 function illustration(kind){
 if(kind==='budget')return '<div class="guide-art budget"><div class="ga-price">5 000 000 <small>₸</small></div><div class="ga-meter"><i></i></div><div class="ga-tags"><span>Улучшения</span><b>Остаток бюджета ✓</b></div></div>';
 if(kind==='save')return '<div class="guide-art save"><div class="ga-document"><b>План вашего двора</b><i></i><i></i><i></i><span>Предварительный расчёт</span></div><div class="ga-download">↓</div></div>';
 if(kind==='vote')return '<div class="guide-art vote"><div class="ga-option"><span>Вариант А</span><img src="/models/tree.svg" alt=""><b>♡ Поддержать</b></div><div class="ga-option"><span>Вариант Б</span><img src="/models/playground.svg" alt=""><b>✓ Ваш голос</b></div></div>';
 if(kind==='walk')return '<div class="guide-art walk"><div class="ga-building"></div><div class="ga-ground"></div><img class="ga-tree" src="/models/tree.svg" alt=""><img class="ga-bench" src="/models/bench.svg" alt=""><div class="ga-keys"><b>W</b><span>A&nbsp; S&nbsp; D</span></div></div>';
 if(kind==='address')return '<div class="guide-art address"><div class="ga-search"><span>⌖</span> Павлодар, ваш адрес <b>↵</b></div><div class="ga-map-grid"></div><div class="ga-location">⌖</div><span class="ga-found">Ваш двор найден</span></div>';
 return `<div class="guide-art ${kind}"><div class="ga-map-grid"></div><div class="ga-zone"></div>${kind==='zone'?'<i class="ga-vertex v1"></i><i class="ga-vertex v2"></i><i class="ga-vertex v3"></i><i class="ga-vertex v4"></i>':'<img class="ga-object" src="/models/bench.svg" alt=""><div class="ga-origin"></div>'}<span class="ga-pointer">↖</span><span class="ga-found">${kind==='move'?'Новое место ✓':kind==='zone'?'Граница двора':'Модель на карте'}</span></div>`;
 }
 function close(){if(!state)return;const s=state;state=null;cancelAnimationFrame(s.raf);s.root.remove();s.observer.disconnect();window.removeEventListener('resize',s.position);document.removeEventListener('scroll',s.position,true);document.removeEventListener('keydown',key,true);window.removeEventListener('hashchange',close);s.focus?.focus();s.onClose?.();}
 function key(e){if(!state)return;if(['Escape','ArrowLeft','ArrowRight','Tab'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();if(e.key==='Escape')close();else if(e.key==='ArrowLeft')show(state.index-1);else if(e.key==='ArrowRight')advance();else{const buttons=[...state.root.querySelectorAll('button:not([disabled])')],i=buttons.indexOf(document.activeElement);buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();}}else if(!e.ctrlKey&&!e.metaKey&&!e.altKey){e.stopImmediatePropagation();}}
 function advance(){if(!state)return;if(state.index===state.steps.length-1)close();else show(state.index+1);}
 function start({steps,scope='map',onClose,onStep}){
 close();if(document.pointerLockElement)document.exitPointerLock();
 const root=document.createElement('div');root.className='guide-overlay';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Пошаговая инструкция');
 root.innerHTML='<div class="guide-shade top"></div><div class="guide-shade left"></div><div class="guide-shade right"></div><div class="guide-shade bottom"></div><div class="guide-spot"><span class="guide-target-number"></span></div><div class="guide-guard"></div><article class="guide-card"><div class="guide-card-content"></div></article>';
 document.body.append(root);const q=s=>root.querySelector(s);
 state={root,q,steps,scope,index:0,target:null,focus:document.activeElement,onClose,onStep,raf:0};
 const position=()=>{if(!state||state.root!==root)return;layout();};state.position=position;state.observer=new ResizeObserver(position);state.observer.observe(document.documentElement);window.addEventListener('resize',position);document.addEventListener('scroll',position,true);document.addEventListener('keydown',key,true);window.addEventListener('hashchange',close);
 root.addEventListener('click',e=>{const b=e.target.closest('[data-guide]');if(!b)return;e.stopPropagation();const action=b.dataset.guide;if(action==='close')close();if(action==='next')advance();if(action==='back')show(state.index-1);});
 show(0);
 }
 function layout(){if(!state)return;const {q,target}=state,vw=innerWidth,vh=innerHeight;const r=target?.isConnected?target.getBoundingClientRect():{left:vw/2,top:vh/2,right:vw/2,bottom:vh/2,width:0,height:0};
 const padding=7,left=Math.max(6,Math.min(vw-6,r.left-padding)),top=Math.max(6,Math.min(vh-6,r.top-padding)),right=Math.max(left,Math.min(vw-6,r.right+padding)),bottom=Math.max(top,Math.min(vh-6,r.bottom+padding)),width=right-left,height=bottom-top;
 const set=(selector,x,y,w,h)=>{const el=q(selector);Object.assign(el.style,{left:x+'px',top:y+'px',width:Math.max(0,w)+'px',height:Math.max(0,h)+'px'});};
 set('.guide-shade.top',0,0,vw,top);set('.guide-shade.left',0,top,left,height);set('.guide-shade.right',right,top,vw-right,height);set('.guide-shade.bottom',0,bottom,vw,vh-bottom);set('.guide-spot',left,top,width,height);set('.guide-guard',left,top,width,height);
 const card=q('.guide-card'),cw=Math.min(352,vw-24);card.style.width=cw+'px';const ch=Math.min(card.scrollHeight,vh-24);let x,y;
 if(right+cw+24<vw){x=right+17;y=Math.max(12,Math.min(vh-ch-12,top));}
 else if(left-cw-24>0){x=left-cw-17;y=Math.max(12,Math.min(vh-ch-12,top));}
 else if(bottom+ch+24<vh){x=Math.max(12,Math.min(vw-cw-12,left));y=bottom+17;}
 else if(top-ch-24>0){x=Math.max(12,Math.min(vw-cw-12,left));y=top-ch-17;}
 else{x=vw-cw-12;y=vh-ch-12;}
 Object.assign(card.style,{left:x+'px',top:y+'px',maxHeight:vh-24+'px'});
 }
 function show(index){if(!state||index<0||index>=state.steps.length)return;const s=state;s.index=index;s.onStep?.(index);const item=s.steps[index];s.target=document.querySelector(item.target);s.q('.guide-target-number').textContent=index+1;
 s.q('.guide-card-content').innerHTML=`<div class="guide-heading"><span>${s.scope==='walk'?'ПРОГУЛКА · ИНСТРУКЦИЯ':'YARDCRAFT · ИНСТРУКЦИЯ'}</span><button data-guide="close" aria-label="Закрыть инструкцию">×</button></div><div class="guide-progress">${s.steps.map((_,i)=>`<i class="${i<=index?'done':''}"></i>`).join('')}</div>${illustration(item.art)}<div class="guide-step-label">ШАГ ${index+1} ИЗ ${s.steps.length}</div><h2>${safe(item.title)}</h2><div class="guide-action"><span>Что нажать</span><p>${safe(item.action)}</p></div><div class="guide-result"><span>Что произойдёт</span><p>${safe(item.result)}</p></div><div class="guide-actions"><button data-guide="back" ${index===0?'disabled':''}>← Назад</button><button data-guide="next">${index===s.steps.length-1?'Всё понятно ✓':'Далее →'}</button></div><div class="guide-note">Это подсказки — ваш проект не меняется.<br>Esc — закрыть · ← → — переключить шаг</div>`;
 s.q('[data-guide="next"]').focus({preventScroll:true});s.target?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center',inline:'nearest'});layout();
 const content=s.q('.guide-card-content');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)content.animate?.([{opacity:.3,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'ease-out'});
 cancelAnimationFrame(s.raf);const until=performance.now()+1100;function follow(){if(state!==s)return;layout();if(performance.now()<until)s.raf=requestAnimationFrame(follow);}s.raf=requestAnimationFrame(follow);
 }
 function startPage(){const result=document.querySelector('.result');if(result){start({steps:[step('.result-header','Ваше предложение готово','Проверьте название, адрес, стоимость и перечень улучшений.','Это сохранённый вариант, который можно обсудить с соседями.','save'),step('#download','Скачайте расчёт','Нажмите «Скачать предложение». Для PDF используйте «Печать / PDF».','Выгрузится список улучшений с количеством, демонстрационными ценами и координатами.','save'),step('#share','Отправьте соседям','Нажмите «Ссылка» и отправьте скопированный адрес соседям.','Они смогут открыть ваше предложение и поддержать его на странице вариантов.','vote'),step('#edit','Продолжите эксперимент','Нажмите «Открыть на карте / создать копию».','Сохранённый вариант загрузится в черновик. Можно изменить его и сохранить ещё одно предложение.','move')]});return;}
 if(location.hash==='#vote'){const available=!!document.querySelector('[data-vote]');start({steps:available?[step('.cards','Сравните варианты','Посмотрите стоимость, состав улучшений и остаток бюджета у каждого предложения.','Выберите вариант, который лучше подходит вашему двору.','budget'),step('[data-vote]','Поддержите вариант','Нажмите «Поддержать вариант».','В общем счётчике появится ваш голос. Демо-голос можно поменять, выбрав другой вариант.','vote'),step('[data-result]','Изучите предложение','Нажмите «Посмотреть предложение».','Откроются подробный расчёт, скачивание и ссылка для соседей.','save')]:[step('.empty','Сначала создайте вариант','Нажмите «Открыть конструктор», выберите улучшения и сохраните проект.','Ваше предложение появится здесь для сравнения и голосования.','place')]});return;}
 start({steps:mapSteps});
 }
 document.addEventListener('click',e=>{if(e.target.closest('[data-page-guide]'))startPage();});
 return{startPage,startWalk:(options={})=>start({...options,steps:walkSteps,scope:'walk'}),close,get active(){return !!state;},get scope(){return state?.scope;}};
})();
