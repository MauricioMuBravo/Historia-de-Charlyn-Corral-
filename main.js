(function(){
const hasGL = typeof THREE !== 'undefined';

/* ---------- Counters ---------- */
function runCounters(){
  document.querySelectorAll('[data-count]').forEach(el=>{
    const end=+el.dataset.count, suf=el.dataset.suffix||''; let t0=null;
    function step(t){ if(!t0)t0=t; const p=Math.min((t-t0)/1800,1), e=1-Math.pow(1-p,3);
      el.textContent=Math.round(end*e)+(p===1?suf:''); if(p<1)requestAnimationFrame(step);}
    requestAnimationFrame(step);
  });
}
setTimeout(runCounters,400);

/* ---------- Reveal on scroll ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ---------- HERO 3D ---------- */
function hero(){
  const canvas=document.getElementById('hero-canvas');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(42,1,.1,100); cam.position.set(0,0,8);

  scene.add(new THREE.AmbientLight(0xffffff,.55));
  const dl=new THREE.DirectionalLight(0xffffff,.9); dl.position.set(-3,4,5); scene.add(dl);
  const pl=new THREE.PointLight(0xf5c451,1.4,20); pl.position.set(4,-2,4); scene.add(pl);

  // Soccer-style ball: subdivided icosahedron, faces around the 12 original vertices tinted navy
  const R=1.55;
  const geo=new THREE.IcosahedronGeometry(R,2);
  const base=new THREE.IcosahedronGeometry(1,0).attributes.position;
  const corners=[];
  for(let i=0;i<base.count;i++){const v=new THREE.Vector3().fromBufferAttribute(base,i).normalize();
    if(!corners.some(c=>c.distanceTo(v)<1e-3))corners.push(v);}
  const pos=geo.attributes.position, colors=[];
  const white=new THREE.Color(0xf4f6ff), navy=new THREE.Color(0x13245c);
  for(let i=0;i<pos.count;i+=3){
    let dark=false;
    for(let k=0;k<3&&!dark;k++){const v=new THREE.Vector3().fromBufferAttribute(pos,i+k).normalize();
      if(corners.some(c=>c.dot(v)>0.999))dark=true;}
    const col=dark?navy:white; for(let k=0;k<3;k++)colors.push(col.r,col.g,col.b);
  }
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  const ball=new THREE.Group();
  ball.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.5,metalness:.05})));
  ball.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0x8090c0,transparent:true,opacity:.35})));
  scene.add(ball);

  // Orbit of 176 golden "goals"
  const N=176, gpos=new Float32Array(N*3), seeds=[];
  for(let i=0;i<N;i++){seeds.push({a:Math.random()*Math.PI*2,r:2.4+Math.random()*1.1,y:(Math.random()-.5)*.5,s:.12+Math.random()*.25});}
  const gGeo=new THREE.BufferGeometry(); gGeo.setAttribute('position',new THREE.BufferAttribute(gpos,3));
  const goals=new THREE.Points(gGeo,new THREE.PointsMaterial({color:0xf5c451,size:.06,transparent:true,opacity:.95}));
  const orbit=new THREE.Group(); orbit.add(goals); orbit.rotation.x=1.15; orbit.rotation.y=.35; scene.add(orbit);

  // star field
  const S=900, sp=new Float32Array(S*3);
  for(let i=0;i<S;i++){sp[i*3]=(Math.random()-.5)*40;sp[i*3+1]=(Math.random()-.5)*24;sp[i*3+2]=-Math.random()*20-3;}
  const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.BufferAttribute(sp,3));
  scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0x7fa8ff,size:.04,transparent:true,opacity:.6})));

  const group=new THREE.Group(); group.add(ball); group.add(orbit); scene.add(group);
  let mx=0,my=0;
  window.addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;});

  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight; renderer.setSize(w,h,false); cam.aspect=w/h;
    group.position.x = w>900 ? 1.35*(w/h)/1.53 : -3.07*(w/h)*0.62; group.position.y = w>900 ? -2.05 : 2.05; group.scale.setScalar(w>900?.42:(w<560?.27:.34));
    cam.updateProjectionMatrix();}
  new ResizeObserver(resize).observe(canvas); resize();

  const clock=new THREE.Clock(); let visible=true;
  new IntersectionObserver(es=>{visible=es[0].isIntersecting;}).observe(canvas);
  (function loop(){
    requestAnimationFrame(loop); if(!visible)return;
    const t=clock.getElapsedTime();
    ball.rotation.y+=(window.matchMedia('(prefers-reduced-motion: reduce)').matches?.0015:.006); ball.rotation.x=Math.sin(t*.5)*.2;
    for(let i=0;i<N;i++){const s=seeds[i]; const a=s.a+t*s.s;
      gpos[i*3]=Math.cos(a)*s.r; gpos[i*3+1]=s.y+Math.sin(t*2+i)*.04; gpos[i*3+2]=Math.sin(a)*s.r;}
    gGeo.attributes.position.needsUpdate=true;
    group.rotation.y+=(mx*.8-group.rotation.y)*.05; group.rotation.x+=(my*.5-group.rotation.x)*.05;
    renderer.render(scene,cam);
  })();
}

/* ---------- Carousel ---------- */
const stages=[
  {yr:'1991 – 2014',name:'Ecatepec · Louisville',img:'img/juvenil.jpg',pos:'50% 25%',flag:'México · EE.UU.',big:'8,671',bigS:'dominadas · Récord Guinness',c1:'#1fae6b',c2:'#0b4d33',
   pts:['Nace el 11 de septiembre de 1991 en Ecatepec, Estado de México.','A los 13 años logra un Récord Guinness con 8,671 dominadas seguidas.','Juega futbol universitario con la Universidad de Louisville (EE.UU.).','Selección Sub-20: 24 partidos y 18 goles (2006-2010).']},
  {yr:'2014',name:'Merilappi United',img:'img/louisville.jpg',pos:'50% 30%',flag:'Finlandia · Kansallinen Liiga',big:'5',bigS:'goles en 8 partidos',c1:'#3d7bd9',c2:'#13245c',
   pts:['Su primer paso profesional en Europa: Laponia, Finlandia.','Marca 5 goles en 8 partidos de liga.']},
  {yr:'2015 – 2019',name:'Levante UD',img:'img/levante.jpg',pos:'53% 15%',flag:'España · Liga F',big:'86',bigS:'goles en 117 partidos de liga',c1:'#c0213a',c2:'#1d2f7a',
   pts:['Cuatro temporadas, todas con 20 goles o más en liga.','Pichichi 2017-18 con 24 goles.','Su mejor resultado colectivo fue el 3er lugar en 2018-19.']},
  {yr:'2019 – 2021',name:'Atlético de Madrid',img:'img/atletico.jpg',pos:'50% 15%',flag:'España · Liga F',big:'8',bigS:'goles en 20 partidos de liga',c1:'#d0263a',c2:'#5a0f1b',
   pts:['Gana la Supercopa de España, con una final 3-0 ante su exequipo, el Levante.','Una rotura del ligamento cruzado de la rodilla izquierda la deja fuera siete meses.','Termina su contrato y regresa a México en 2021.']},
  {yr:'2021 – hoy',name:'CF Pachuca',img:'img/pachuca.jpg',pos:'62% 20%',flag:'México · Liga MX Femenil',big:'176+',bigS:'goles en Liga MX (mayo 2026)',c1:'#2e5bd8',c2:'#0a1a4d',
   pts:['Es la máxima goleadora histórica del club y la primera en llegar a 100 goles (agosto de 2024).','Gana el campeonato del Clausura 2025, el primer título de liga del club y de su carrera.','Suma cinco títulos de goleo, cuatro de ellos consecutivos.','A mayo de 2026 era la 2ª goleadora histórica de la liga, a 5 de Alicia Cervantes (181).']},
  {yr:'Selección',name:'México',img:'img/seleccion.jpg',pos:'50% 10%',flag:'Selección Femenil Mayor',big:'38',bigS:'goles en 65 partidos (FotMob)',c1:'#0f8a4f',c2:'#7a1020',
   pts:['Es la 2ª goleadora histórica de la Selección Femenil.','Oro en los Juegos Panamericanos Santiago 2023.','Oro en los Juegos Centroamericanos y del Caribe 2018 y 2023.','Marca 7 goles en la eliminatoria de Concacaf de 2025 rumbo al Mundial 2027.']}
];
function carousel(){
  const ring=document.getElementById('ring'), det=document.getElementById('detail');
  const n=stages.length, ang=360/n; let idx=0;
  function radius(){return window.innerWidth<560?250:340;}
  stages.forEach((s,i)=>{
    const c=document.createElement('div'); c.className='ccard'; c.style.setProperty('--c1',s.c1); c.style.setProperty('--c2',s.c2); if(s.img){c.style.setProperty('--img',`url("${new URL(s.img,document.baseURI).href}")`);c.style.setProperty('--pos',s.pos);}
    c.innerHTML=`<div><div class="yr">${s.yr}</div><h3>${s.name}</h3><div class="flag">${s.flag}</div></div><div class="big">${s.big}<small>${s.bigS}</small></div>`;
    c.addEventListener('click',()=>go(i)); ring.appendChild(c);
  });
  const cards=[...ring.children];
  function layout(){const r=radius(); cards.forEach((c,i)=>c.style.transform=`rotateY(${i*ang}deg) translateZ(${r}px)`);}
  let rot=0;
  function go(i){
    // shortest rotation path
    let diff=((i-idx)%n+n)%n; if(diff>n/2)diff-=n; rot-=diff*ang; idx=((i%n)+n)%n;
    ring.style.transform=`translateZ(${-radius()}px) rotateY(${rot}deg)`;
    cards.forEach((c,k)=>c.classList.toggle('active',k===idx));
    const s=stages[idx];
    det.innerHTML=`<div class="dnum">${s.big}<small>${s.bigS}</small></div><div><div class="kicker" style="margin:0">${s.yr} · ${s.flag}</div><h3>${s.name}</h3><ul>${s.pts.map(p=>`<li>${p}</li>`).join('')}</ul></div>`;
  }
  document.getElementById('prev').onclick=()=>go(idx-1);
  document.getElementById('next').onclick=()=>go(idx+1);
  document.addEventListener('keydown',e=>{const r=document.getElementById('trayectoria').getBoundingClientRect();
    if(r.top<innerHeight*.6&&r.bottom>innerHeight*.4){if(e.key==='ArrowLeft')go(idx-1);if(e.key==='ArrowRight')go(idx+1);}});
  // swipe
  let sx=null; const st=document.querySelector('.car-stage');
  st.addEventListener('pointerdown',e=>sx=e.clientX);
  st.addEventListener('pointerup',e=>{if(sx!==null&&Math.abs(e.clientX-sx)>40)go(idx+(e.clientX<sx?1:-1)); sx=null;});
  window.addEventListener('resize',()=>{layout();ring.style.transform=`translateZ(${-radius()}px) rotateY(${rot}deg)`;});
  layout(); go(4);
}

/* ---------- 3D bar chart ---------- */
const datasets={
  goleo:{title:'Goles con los que ganó cada título de goleo (fase regular)',items:[
    ['Clausura 2023',20,'Su primer título de goleo en México. Ese torneo jugó la final contra América.'],
    ['Clausura 2024',19,'Segundo título de goleo; ese año fue también la máxima goleadora del mundo.'],
    ['Apertura 2024',18,'Bicampeona de goleo seguida.'],
    ['Clausura 2025',21,'Récord en ese momento. Pachuca fue campeón y ella sumó 26 goles con la Liguilla.'],
    ['Apertura 2025',22,'Récord de los torneos cortos en 17 jornadas. Con este título encadenó cuatro seguidos.']]},
  iffhs:{title:'Goles en el año natural, club y selección (IFFHS)',items:[
    ['2023',39,'2ª goleadora mundial y máxima goleadora nacional con 34 goles.'],
    ['2024',44,'Máxima goleadora del mundo según la IFFHS.'],
    ['2025',57,'50 con Pachuca y 7 con México. Superó a Ewa Pajor (45) y Katie Wilkinson (42).']]},
  europa:{title:'Goles de liga por temporada en España (Liga F)',items:[
    ['Levante 15-16',22,'Temporada de debut en España: 22 goles en 30 partidos.'],
    ['Levante 16-17',20,'20 goles en 30 partidos.'],
    ['Levante 17-18',24,'Pichichi de la liga española.'],
    ['Levante 18-19',20,'El Levante termina 3º, detrás de Barcelona y Atlético.'],
    ['Atlético 19-20',8,'8 goles en 20 partidos. Después llegó la lesión de rodilla.']]}
};
function chart(){
  const box=document.getElementById('chart-box'), canvas=document.getElementById('chart-canvas'), labels=document.getElementById('labels');
  const info=document.getElementById('info'), title=document.getElementById('chart-title');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(40,1,.1,100); cam.position.set(0,6.2,11.5); cam.lookAt(0,1.6,0);
  scene.add(new THREE.AmbientLight(0xffffff,.5));
  const d1=new THREE.DirectionalLight(0xffffff,.85); d1.position.set(5,10,6); scene.add(d1);
  const d2=new THREE.DirectionalLight(0x5ec8ff,.4); d2.position.set(-6,3,-4); scene.add(d2);

  const world=new THREE.Group(); scene.add(world);
  // pitch texture
  const tc=document.createElement('canvas'); tc.width=1024; tc.height=640; const g=tc.getContext('2d');
  for(let i=0;i<10;i++){g.fillStyle=i%2?'#167a4c':'#1a8a56'; g.fillRect(i*102.4,0,102.4,640);}
  g.strokeStyle='rgba(255,255,255,.75)'; g.lineWidth=5;
  g.strokeRect(20,20,984,600); g.beginPath(); g.moveTo(512,20); g.lineTo(512,620); g.stroke();
  g.beginPath(); g.arc(512,320,80,0,Math.PI*2); g.stroke();
  g.strokeRect(20,170,140,300); g.strokeRect(864,170,140,300);
  const tex=new THREE.CanvasTexture(tc);
  const pitch=new THREE.Mesh(new THREE.BoxGeometry(11,.25,6.9),[
    new THREE.MeshStandardMaterial({color:0x0e5534}),new THREE.MeshStandardMaterial({color:0x0e5534}),
    new THREE.MeshStandardMaterial({map:tex,roughness:.9}),new THREE.MeshStandardMaterial({color:0x0e5534}),
    new THREE.MeshStandardMaterial({color:0x0e5534}),new THREE.MeshStandardMaterial({color:0x0e5534})]);
  pitch.position.y=-.125; world.add(pitch);

  let bars=[], current=null;
  const boxGeo=new THREE.BoxGeometry(1,1,1); boxGeo.translate(0,.5,0);
  const raycaster=new THREE.Raycaster(), mouse=new THREE.Vector2(-9,-9); let hovered=null;

  function build(key){
    current=key; const ds=datasets[key];
    bars.forEach(b=>{world.remove(b.mesh); b.lv.remove(); b.ln.remove();}); bars=[];
    title.textContent=ds.title;
    const max=Math.max(...ds.items.map(i=>i[1])), n=ds.items.length, gap=Math.min(2,9/n);
    ds.items.forEach((it,i)=>{
      const t=it[1]/max, isMax=it[1]===max;
      const col=new THREE.Color().lerpColors(new THREE.Color(0x5ec8ff),new THREE.Color(0xf5c451),Math.pow(t,3));
      const mat=new THREE.MeshStandardMaterial({color:col,metalness:.35,roughness:.3,emissive:col,emissiveIntensity:isMax?.25:.08});
      const m=new THREE.Mesh(boxGeo,mat); m.scale.set(.95,.001,.95);
      m.position.set((i-(n-1)/2)*gap,0,0); m.userData={i,target:t*4.2+.05,item:it};
      world.add(m);
      const lv=document.createElement('div'); lv.className='lbl'; lv.textContent=it[1];
      const ln=document.createElement('div'); ln.className='lbl name'; ln.textContent=it[0];
      labels.appendChild(lv); labels.appendChild(ln);
      bars.push({mesh:m,lv,ln});
    });
    showInfo(ds.items.reduce((a,b)=>b[1]>a[1]?b:a));
  }
  function showInfo(it){ info.innerHTML=`<div class="kicker" style="margin:0">${it[0]}</div><div class="num">${it[1]} goles</div><p>${it[2]}</p>`; }

  document.querySelectorAll('[data-ds]').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('[data-ds]').forEach(x=>x.classList.remove('on')); b.classList.add('on'); build(b.dataset.ds);}));

  // drag rotate
  let drag=false, px=0, vy=0, targetY=-.25, idle=0;
  canvas.addEventListener('pointerdown',e=>{drag=true;px=e.clientX;const r=canvas.getBoundingClientRect();mouse.x=((e.clientX-r.left)/r.width)*2-1;mouse.y=-((e.clientY-r.top)/r.height)*2+1;idle=0;try{canvas.setPointerCapture(e.pointerId);}catch(_){}});
  canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointercancel',()=>drag=false);
  canvas.addEventListener('pointermove',e=>{
    const r=canvas.getBoundingClientRect();
    mouse.x=((e.clientX-r.left)/r.width)*2-1; mouse.y=-((e.clientY-r.top)/r.height)*2+1;
    if(drag){targetY+=(e.clientX-px)*.008; px=e.clientX; idle=0;}
  });
  canvas.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')mouse.set(-9,-9);});

  function resize(){const w=box.clientWidth,h=box.clientHeight; renderer.setSize(w,h,false); cam.aspect=w/h;
    cam.position.z = w<600 ? 15 : 11.5; cam.lookAt(0, w<600 ? 2.5 : 1.6, 0); cam.updateProjectionMatrix();}
  new ResizeObserver(resize).observe(box); resize();

  let visible=false; new IntersectionObserver(es=>{visible=es[0].isIntersecting;}).observe(box);
  const v=new THREE.Vector3(), clock=new THREE.Clock();
  (function loop(){
    requestAnimationFrame(loop); if(!visible)return;
    const dt=clock.getDelta(); idle+=dt;
    if(!drag && idle>2.5) targetY+=dt*.18;
    world.rotation.y+=(targetY-world.rotation.y)*.08;
    const w=box.clientWidth,h=box.clientHeight;
    raycaster.setFromCamera(mouse,cam);
    const hit=raycaster.intersectObjects(bars.map(b=>b.mesh))[0];
    const hm=hit?hit.object:null;
    if(hm!==hovered){hovered=hm; if(hm){showInfo(hm.userData.item); idle=0;}}
    bars.forEach(b=>{
      const m=b.mesh, s=m.scale; s.y+=(m.userData.target-s.y)*.07;
      const hv=m===hovered; const k=hv?1.12:.95; s.x+=(k-s.x)*.2; s.z=s.x;
      m.material.emissiveIntensity+=((hv?.55:.1)-m.material.emissiveIntensity)*.2;
      v.set(0,1,0); m.localToWorld(v); v.y+=.18; v.project(cam);
      b.lv.style.left=((v.x+1)/2*w)+'px'; b.lv.style.top=((1-v.y)/2*h)+'px';
      b.lv.style.color=hv?'#f5c451':'#fff';
      v.set(0,0,.75); m.localToWorld(v); v.project(cam);
      b.ln.style.left=((v.x+1)/2*w)+'px'; b.ln.style.top=((1-v.y)/2*h+4)+'px';
    });
    renderer.render(scene,cam);
  })();
  build('goleo');
}

/* ---------- Touch adaptations ---------- */
const isTouch=window.matchMedia('(hover: none)').matches;
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(isTouch){
  const h=document.querySelector('.hint3d'); if(h)h.textContent='👆 Toca y desliza para explorar';
  document.querySelectorAll('.lead').forEach(l=>{l.textContent=l.textContent
    .replace('Arrastra para girar la cancha y pasa el cursor sobre una columna para ver el detalle.','Desliza de lado para girar la cancha y toca una columna para ver el detalle.')
    .replace('Gira el carrusel con las flechas, con las teclas ← → o tocando una tarjeta.','Desliza de lado o toca una tarjeta para girar el carrusel.')
    .replace('Mueve el cursor sobre cada tarjeta para inclinarla.','Toca una tarjeta para inclinarla.')
    .replace('Pasa el cursor o toca cada trofeo para girarlo y ver el contexto.','Toca cada trofeo para girarlo y ver el contexto.');});
  const ch=[...document.querySelectorAll('#origen p')].find(p=>p.textContent.includes('cubo')); if(ch)ch.textContent='Toca el cubo para detenerlo.';
  document.querySelector('.cube-wrap').addEventListener('click',function(){const c=this.querySelector('.cube');c.style.animationPlayState=c.style.animationPlayState==='paused'?'running':'paused';});
}
/* ---------- Tilt cards ---------- */
if(!reduce)document.querySelectorAll('.tilt').forEach(c=>{
  c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
    c.style.transform=`rotateY(${(x-.5)*18}deg) rotateX(${(.5-y)*18}deg) translateZ(10px)`;
    c.style.setProperty('--gx',x*100+'%'); c.style.setProperty('--gy',y*100+'%');});
  c.addEventListener('pointerleave',()=>{c.style.transform='';});
});
if(!isTouch&&!reduce)document.querySelectorAll('.stat').forEach(c=>{
  c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    c.style.transform=`perspective(500px) rotateY(${x*20}deg) rotateX(${-y*20}deg)`;});
  c.addEventListener('pointerleave',()=>c.style.transform='');
});

/* ---------- Author card tilt ---------- */
(function(){const c=document.getElementById('author-card'); if(!c||isTouch||reduce)return;
  c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    c.style.transform=`perspective(1200px) rotateY(${(x-.5)*8}deg) rotateX(${(.5-y)*8}deg)`;c.style.setProperty('--gx',x*100+'%');c.style.setProperty('--gy',y*100+'%');});
  c.addEventListener('pointerleave',()=>c.style.transform='');})();
/* ---------- Flip trophies ---------- */
const trophies=[
  ['🏆','Trofeo Gerd Müller','2026 · Balón de Oro','ind','Mejor delantera del mundo','Lo entrega France Football. Es la primera mexicana en recibirlo.'],
  ['🌍','Goleadora mundial IFFHS','2024 y 2025','ind','44 y 57 goles','Fue la máxima goleadora del planeta, sumando club y selección, en dos años seguidos.'],
  ['👑','5 títulos de goleo','Liga MX Femenil','ind','C23 · C24 · A24 · C25 · A25','Es la jugadora con más títulos de goleo en la historia de la liga.'],
  ['🇪🇸','Pichichi','Liga F 2017-18','ind','24 goles con el Levante','Fue la máxima goleadora del campeonato español.'],
  ['🥇','Liga MX Femenil','Clausura 2025 · Pachuca','','Primer título de liga','Es el primer campeonato del club, después de tres finales perdidas, y el primero de su carrera.'],
  ['🏅','Supercopa de España','Atlético de Madrid','','3-0 al Levante','Ganó la final contra su exequipo durante su etapa colchonera.'],
  ['🥇','Juegos Panamericanos','Santiago 2023 · México','','Medalla de oro','Fue el oro panamericano de la Selección Femenil.'],
  ['🥇','Juegos Centroamericanos','2018 y 2023 · México','','Dos medallas de oro','Ganó el oro en Barranquilla 2018 y en San Salvador 2023.']
];
const fg=document.getElementById('flips');
trophies.forEach(t=>{
  const d=document.createElement('div'); d.className='flip reveal';
  d.innerHTML=`<div class="flip-in"><div class="face front"><span class="tag ${t[3]}">${t[3]?'Individual':'Colectivo'}</span><div class="t">${t[0]}</div><h3>${t[1]}</h3><small>${t[2]}</small></div>
  <div class="face back"><b>${t[4]}</b><p>${t[5]}</p></div></div>`;
  d.addEventListener('click',()=>d.classList.toggle('on'));
  fg.appendChild(d); io.observe(d);
});

carousel();
if(hasGL){ try{hero();}catch(e){console.warn(e);} try{chart();}catch(e){console.warn(e);} }
else { document.getElementById('chart-title').textContent='Tu navegador no pudo cargar WebGL.'; }
})();
