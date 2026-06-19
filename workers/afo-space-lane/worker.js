const VERSION = "1.2.0";
const WORKER_NAME = "afo-space-lane";
const R2_PREFIX = "memory-lane/photos/";
const CORS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,DELETE,OPTIONS","Access-Control-Allow-Headers":"Content-Type"};

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY, filename TEXT NOT NULL, r2_key TEXT NOT NULL, url TEXT NOT NULL, lat REAL, lng REAL, date_taken TEXT, cluster_id TEXT, cluster_name TEXT, uploaded_at TEXT DEFAULT (datetime('now')))",
  "CREATE TABLE IF NOT EXISTS clusters (id TEXT PRIMARY KEY, name TEXT NOT NULL, lat REAL NOT NULL, lng REAL NOT NULL, photo_count INTEGER DEFAULT 0)"
];

function j(v,s=200){return Response.json(v,{status:s,headers:CORS});}
function uid(){return Math.random().toString(36).slice(2,9)+Date.now().toString(36);}
function safe(v){return String(v||"").replace(/[<>"']/g,"");}

function haversine(a,b,c,d){const R=6371,dL=(c-a)*Math.PI/180,dG=(d-b)*Math.PI/180;const x=Math.sin(dL/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dG/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}

async function resolveCluster(env,lat,lng){
  if(lat==null||lng==null)return{id:null,name:null};
  const rows=await env.DB.prepare("SELECT * FROM clusters").all();
  for(const c of(rows.results||[])){if(haversine(lat,lng,c.lat,c.lng)<80){await env.DB.prepare("UPDATE clusters SET photo_count=photo_count+1 WHERE id=?").bind(c.id).run();return{id:c.id,name:c.name};}}
  const cid=uid();const name=approxName(lat,lng);
  await env.DB.prepare("INSERT INTO clusters (id,name,lat,lng,photo_count) VALUES (?,?,?,?,1)").bind(cid,name,lat,lng).run();
  return{id:cid,name};
}

function approxName(lat,lng){
  const R=[[34,36,-119,-117,"Los Angeles"],[-34,-33,150,152,"Sydney"],[51,52,-1,1,"London"],[48,49,2,3,"Paris"],[35,36,139,140,"Tokyo"],[37,38,-123,-122,"San Francisco"],[40,41,-74,-73,"New York"],[19,20,-100,-99,"Mexico City"],[25,26,55,56,"Dubai"],[52,53,13,14,"Berlin"],[41,42,12,13,"Rome"],[40,41,-4,-3,"Madrid"],[1,2,103,104,"Singapore"],[28,29,77,78,"New Delhi"],[31,32,121,122,"Shanghai"],[55,56,37,38,"Moscow"],[37,38,23,24,"Athens"],[-24,-22,-47,-46,"Sao Paulo"],[43,44,-80,-79,"Toronto"],[33,34,-84,-83,"Atlanta"]];
  for(const[a,b,c,d,n]of R)if(lat>=a&&lat<=b&&lng>=c&&lng<=d)return n;
  return(lat>=0?Math.round(lat)+"N":Math.round(-lat)+"S")+", "+(lng>=0?Math.round(lng)+"E":Math.round(-lng)+"W");
}

function fibPoint(i,n,radius){
  if(n<=1) return {x:0,y:0,z:radius};
  const golden=Math.PI*(3-Math.sqrt(5));
  const y=1-(i/(n-1))*2;
  const r=Math.sqrt(Math.max(0,1-y*y));
  const theta=golden*i;
  return {x:Math.cos(theta)*r*radius, y:y*radius, z:Math.sin(theta)*r*radius};
}

const R_GALAXY=1500;

function layout3D(photos, clusters){
  const allClusters = clusters.concat([{id:null,name:"Unknown Space"}]);
  const anchorMap = {};
  allClusters.forEach(function(c,i){
    const p = fibPoint(i, allClusters.length, R_GALAXY);
    anchorMap[c.id] = {x:p.x, y:p.y, z:p.z, name:c.name, count:0};
  });
  photos.forEach(function(p){ if(anchorMap[p.cluster_id]) anchorMap[p.cluster_id].count++; else anchorMap[null].count++; });
  const galaxies = Object.keys(anchorMap).map(function(k){
    const a = anchorMap[k];
    return {x:a.x,y:a.y,z:a.z,name:a.name,radius:Math.min(170, 55+a.count*3.2),count:a.count};
  }).filter(function(g){return g.count>0;});
  const localIdx = {};
  const placed = photos.map(function(p){
    const key = (p.cluster_id!=null && anchorMap[p.cluster_id]) ? p.cluster_id : null;
    const a = anchorMap[key];
    const n = a.count;
    const idx = localIdx[key] = (localIdx[key]||0);
    localIdx[key] = idx+1;
    const localR = Math.min(150, 50+n*2.2);
    const off = fibPoint(idx, n, localR);
    return Object.assign({}, p, {
      x: a.x+off.x, y: a.y+off.y, z: a.z+off.z
    });
  });
  const start = galaxies.length>0 ? {x:galaxies[0].x*0.3, y:galaxies[0].y*0.3+40, z:galaxies[0].z*0.3+220} : {x:0,y:0,z:400};
  return {photos:placed, galaxies:galaxies, start:start};
}

// =================== GAME SCRIPT ===================

function buildGameScript(layout){
  const L=[];
  L.push("const LAYOUT="+JSON.stringify(layout)+";");
  L.push("let scene,camera,renderer,raycaster;");
  L.push("let planetMeshes=[];");
  L.push("let galaxyMeshes={},galaxyAnchors={};");
  L.push("let currentFormation='sphere';");
  L.push("let insideGalaxy=null;");
  L.push("let gameState='menu';");
  L.push("let speed=3;");
  L.push("let yawVel=0,pitchVel=0,rollAmt=0;");
  L.push("let touchActive=false,touchStartX=0,touchStartY=0,lastX=0,lastY=0,isTap=true;");
  L.push("let targeted=null;");
  L.push("let frame=0;");

  L.push("function initScene(){");
  L.push("  const wrap=document.getElementById('wrap');");
  L.push("  scene=new THREE.Scene();");
  L.push("  camera=new THREE.PerspectiveCamera(72,wrap.clientWidth/wrap.clientHeight,0.1,6000);");
  L.push("  camera.position.set(LAYOUT.start.x,LAYOUT.start.y,LAYOUT.start.z);");
  L.push("  camera.lookAt(0,0,0);");
  L.push("  renderer=new THREE.WebGLRenderer({antialias:true,canvas:document.getElementById('gc')});");
  L.push("  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));");
  L.push("  renderer.setSize(wrap.clientWidth,wrap.clientHeight);");
  L.push("  raycaster=new THREE.Raycaster();raycaster.far=4000;");
  L.push("  buildStarfield();buildGalaxies();");
  L.push("  const ld=document.getElementById('loadScreen');");
  L.push("  if(ld){ld.classList.add('fadeOut');setTimeout(function(){ld.style.display='none';},700);}");
  L.push("  window.addEventListener('resize',onResize);");
  L.push("}");

  L.push("function onResize(){const wrap=document.getElementById('wrap');camera.aspect=wrap.clientWidth/wrap.clientHeight;camera.updateProjectionMatrix();renderer.setSize(wrap.clientWidth,wrap.clientHeight);}");

  L.push("function buildStarfield(){");
  L.push("  const n=2500;const pos=new Float32Array(n*3);");
  L.push("  for(let i=0;i<n;i++){");
  L.push("    const r=2000+Math.random()*1800;");
  L.push("    const th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1);");
  L.push("    pos[i*3]=r*Math.sin(ph)*Math.cos(th);");
  L.push("    pos[i*3+1]=r*Math.sin(ph)*Math.sin(th);");
  L.push("    pos[i*3+2]=r*Math.cos(ph);");
  L.push("  }");
  L.push("  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));");
  L.push("  const mat=new THREE.PointsMaterial({color:0xaaccff,size:3,sizeAttenuation:true});");
  L.push("  scene.add(new THREE.Points(geo,mat));");
  L.push("}");

  L.push("function showToast(msg){");
  L.push("  const t=document.getElementById('toast');if(!t) return;");
  L.push("  t.textContent=msg;t.classList.add('show');");
  L.push("  clearTimeout(t._hideTimer);");
  L.push("  t._hideTimer=setTimeout(function(){t.classList.remove('show');},2200);");
  L.push("}");

  L.push("function checkZoneEntry(){");
  L.push("  let inside=null;");
  L.push("  Object.keys(galaxyAnchors).forEach(function(k){");
  L.push("    const a=galaxyAnchors[k];");
  L.push("    const d=Math.sqrt((camera.position.x-a.x)**2+(camera.position.y-a.y)**2+(camera.position.z-a.z)**2);");
  L.push("    if(d<a.radius) inside=k;");
  L.push("  });");
  L.push("  if(inside!==insideGalaxy){");
  L.push("    if(inside) showToast('\uD83D\uDCCD Entering '+inside);");
  L.push("    insideGalaxy=inside;");
  L.push("  }");
  L.push("}");

  L.push("function fmtSphere(i,n,r){");
  L.push("  if(n<=1) return {x:0,y:0,z:r};");
  L.push("  const golden=Math.PI*(3-Math.sqrt(5));");
  L.push("  const y=1-(i/(n-1))*2;");
  L.push("  const rad=Math.sqrt(Math.max(0,1-y*y));");
  L.push("  const theta=golden*i;");
  L.push("  return {x:Math.cos(theta)*rad*r,y:y*r,z:Math.sin(theta)*rad*r};");
  L.push("}");
  L.push("function fmtSpiral(i,n,r){");
  L.push("  const turns=3.2;");
  L.push("  const t=n<=1?0:i/(n-1);");
  L.push("  const ang=t*turns*Math.PI*2;");
  L.push("  const rad=t*r;");
  L.push("  const yh=(t-0.5)*r*0.7;");
  L.push("  return {x:Math.cos(ang)*rad,y:yh,z:Math.sin(ang)*rad};");
  L.push("}");
  L.push("function fmtCube(i,n,r){");
  L.push("  const side=Math.max(1,Math.ceil(Math.pow(n,1/3)));");
  L.push("  const x=(i%side)-(side-1)/2;");
  L.push("  const y=Math.floor((i/side)%side)-(side-1)/2;");
  L.push("  const z=Math.floor(i/(side*side))-(side-1)/2;");
  L.push("  const sp=(r*2)/side;");
  L.push("  return {x:x*sp,y:y*sp,z:z*sp};");
  L.push("}");
  L.push("function fmtTorus(i,n,r){");
  L.push("  const minor=r*0.32,major=r*0.78;");
  L.push("  const u=(i/Math.max(1,n))*Math.PI*4;");
  L.push("  const v=((i*7)%Math.max(1,n)/Math.max(1,n))*Math.PI*2;");
  L.push("  const x=(major+minor*Math.cos(v))*Math.cos(u);");
  L.push("  const y=(major+minor*Math.cos(v))*Math.sin(u);");
  L.push("  const z=minor*Math.sin(v);");
  L.push("  return {x:x,y:y,z:z};");
  L.push("}");
  L.push("const FORMATIONS={sphere:fmtSphere,spiral:fmtSpiral,cube:fmtCube,torus:fmtTorus};");
  L.push("const FORMATION_GEO={");
  L.push("  sphere:function(r){return new THREE.SphereGeometry(r,16,12);},");
  L.push("  spiral:function(r){return new THREE.SphereGeometry(r,16,12);},");
  L.push("  cube:function(r){return new THREE.BoxGeometry(r*1.5,r*1.5,r*1.5);},");
  L.push("  torus:function(r){return new THREE.TorusGeometry(r*0.78,r*0.32,8,24);}");
  L.push("};");

  L.push("function applyFormation(name){");
  L.push("  if(!FORMATIONS[name]) return;");
  L.push("  currentFormation=name;");
  L.push("  planetMeshes.forEach(function(mesh){");
  L.push("    const a=galaxyAnchors[mesh.userData.galaxyKey];if(!a) return;");
  L.push("    const off=FORMATIONS[name](mesh.userData.localIdx,mesh.userData.localCount,a.radius);");
  L.push("    mesh.position.set(a.x+off.x,a.y+off.y,a.z+off.z);");
  L.push("  });");
  L.push("  Object.keys(galaxyMeshes).forEach(function(k){");
  L.push("    const wf=galaxyMeshes[k],a=galaxyAnchors[k];if(!wf||!a) return;");
  L.push("    wf.geometry.dispose();");
  L.push("    wf.geometry=FORMATION_GEO[name](a.radius);");
  L.push("  });");
  L.push("  document.querySelectorAll('.fmtBtn').forEach(function(b){b.classList.toggle('active',b.dataset.f===name);});");
  L.push("  showToast('Formation: '+name.charAt(0).toUpperCase()+name.slice(1));");
  L.push("}");

  L.push("function makeLabelSprite(text){");
  L.push("  const c=document.createElement('canvas');c.width=256;c.height=64;");
  L.push("  const ctx=c.getContext('2d');");
  L.push("  ctx.fillStyle='rgba(0,10,20,0.55)';ctx.fillRect(0,0,256,64);");
  L.push("  ctx.strokeStyle='#00ff88';ctx.lineWidth=2;ctx.strokeRect(2,2,252,60);");
  L.push("  ctx.fillStyle='#00ff88';ctx.font='bold 26px monospace';ctx.textAlign='center';ctx.textBaseline='middle';");
  L.push("  ctx.fillText(text.slice(0,18),128,33);");
  L.push("  const tex=new THREE.CanvasTexture(c);");
  L.push("  const mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false});");
  L.push("  const spr=new THREE.Sprite(mat);spr.scale.set(120,30,1);");
  L.push("  return spr;");
  L.push("}");

  L.push("function buildGalaxies(){");
  L.push("  LAYOUT.galaxies.forEach(function(g){");
  L.push("    const wf=new THREE.Mesh(new THREE.SphereGeometry(g.radius,16,12),new THREE.MeshBasicMaterial({color:0x00ffaa,wireframe:true,transparent:true,opacity:0.22}));");
  L.push("    wf.position.set(g.x,g.y,g.z);scene.add(wf);");
  L.push("    galaxyMeshes[g.name]=wf;galaxyAnchors[g.name]={x:g.x,y:g.y,z:g.z,radius:g.radius};");
  L.push("    const label=makeLabelSprite('\uD83D\uDCCD '+g.name);");
  L.push("    label.position.set(g.x,g.y+g.radius+34,g.z);scene.add(label);");
  L.push("  });");
  L.push("  const counts={};");
  L.push("  LAYOUT.photos.forEach(function(p){const k=p.cluster_name||'Unknown Space';counts[k]=(counts[k]||0)+1;});");
  L.push("  const idxCursor={};");
  L.push("  LAYOUT.photos.forEach(function(p){");
  L.push("    const k=p.cluster_name||'Unknown Space';");
  L.push("    const localIdx=idxCursor[k]=(idxCursor[k]||0);idxCursor[k]++;");
  L.push("    const geo=new THREE.SphereGeometry(15,20,16);");
  L.push("    const mat=new THREE.MeshBasicMaterial({color:0x223344});");
  L.push("    const mesh=new THREE.Mesh(geo,mat);");
  L.push("    mesh.position.set(p.x,p.y,p.z);");
  L.push("    mesh.userData=p;");
  L.push("    mesh.userData.loadedTier='none';");
  L.push("    mesh.userData.loadingTier=null;");
  L.push("    mesh.userData.galaxyKey=k;");
  L.push("    mesh.userData.localIdx=localIdx;");
  L.push("    mesh.userData.localCount=counts[k];");
  L.push("    scene.add(mesh);planetMeshes.push(mesh);");
  L.push("  });");
  L.push("}");

  L.push("function tierUrl(p,tier){");
  L.push("  if(tier==='thumb') return p.url+'?size=thumb';");
  L.push("  if(tier==='medium') return p.url+'?size=medium';");
  L.push("  return p.url;");
  L.push("}");

  L.push("function desiredTier(dist){");
  L.push("  if(dist>700) return 'none';");
  L.push("  if(dist>260) return 'thumb';");
  L.push("  if(dist>90) return 'medium';");
  L.push("  return 'full';");
  L.push("}");

  L.push("const TIER_RANK={none:0,thumb:1,medium:2,full:3};");
  L.push("const texLoader=new THREE.TextureLoader();");
  L.push("function loadTierFor(mesh,tier){");
  L.push("  if(tier==='none'||mesh.userData.loadingTier===tier) return;");
  L.push("  mesh.userData.loadingTier=tier;");
  L.push("  texLoader.load(tierUrl(mesh.userData,tier),function(tex){");
  L.push("    tex.colorSpace=THREE.SRGBColorSpace;");
  L.push("    mesh.material.map=tex;mesh.material.color.set(0xffffff);mesh.material.needsUpdate=true;");
  L.push("    mesh.userData.loadedTier=tier;mesh.userData.loadingTier=null;");
  L.push("  },undefined,function(){mesh.userData.loadingTier=null;});");
  L.push("}");

  L.push("let lodCursor=0;");
  L.push("function updateLOD(){");
  L.push("  const batch=24;");
  L.push("  for(let i=0;i<batch&&planetMeshes.length>0;i++){");
  L.push("    const mesh=planetMeshes[lodCursor%planetMeshes.length];");
  L.push("    lodCursor++;");
  L.push("    const dist=camera.position.distanceTo(mesh.position);");
  L.push("    const want=desiredTier(dist);");
  L.push("    if(TIER_RANK[want]>TIER_RANK[mesh.userData.loadedTier]) loadTierFor(mesh,want);");
  L.push("    else if(want==='none'&&mesh.userData.loadedTier!=='none'&&dist>1100){");
  L.push("      mesh.material.map=null;mesh.material.color.set(0x223344);mesh.material.needsUpdate=true;");
  L.push("      mesh.userData.loadedTier='none';");
  L.push("    }");
  L.push("  }");
  L.push("}");

  // Targeting (crosshair raycast every frame)
  L.push("function updateTarget(){");
  L.push("  raycaster.setFromCamera({x:0,y:0},camera);");
  L.push("  const hits=raycaster.intersectObjects(planetMeshes);");
  L.push("  targeted=hits.length>0?hits[0].object:null;");
  L.push("}");

  // Tap select (from screen position, falls back to crosshair if close to center)
  L.push("function trySelect(){");
  L.push("  if(targeted) openPhoto(targeted.userData);");
  L.push("}");

  L.push("function openPhoto(p){");
  L.push("  const ov=document.getElementById('ov');if(!ov)return;");
  L.push("  document.getElementById('ovImg').src=p.url;");
  L.push("  const parts=[];if(p.filename)parts.push(p.filename);if(p.date_taken)parts.push(p.date_taken.slice(0,10));if(p.cluster_name)parts.push('\uD83D\uDCCD '+p.cluster_name);");
  L.push("  document.getElementById('ovMeta').textContent=parts.join('  \u00B7  ');");
  L.push("  ov.style.display='flex';gameState='paused';");
  L.push("}");
  L.push("function closePhoto(){document.getElementById('ov').style.display='none';gameState='flying';}");

  // Touch / mouse steering
  L.push("function startTouch(x,y){touchActive=true;touchStartX=x;touchStartY=y;lastX=x;lastY=y;isTap=true;}");
  L.push("function moveTouch(x,y){");
  L.push("  if(!touchActive) return;");
  L.push("  const dx=x-lastX,dy=y-lastY;");
  L.push("  yawVel=-dx*0.0028;pitchVel=-dy*0.0028;");
  L.push("  rollAmt=Math.max(-0.5,Math.min(0.5,rollAmt-dx*0.003));");
  L.push("  lastX=x;lastY=y;");
  L.push("  if(Math.abs(x-touchStartX)>10||Math.abs(y-touchStartY)>10) isTap=false;");
  L.push("}");
  L.push("function endTouch(){if(isTap&&gameState==='flying')trySelect();touchActive=false;yawVel=0;pitchVel=0;}");

  L.push("const canvas=document.getElementById('gc');");
  L.push("canvas.addEventListener('touchstart',function(e){e.preventDefault();const t=e.touches[0],r=canvas.getBoundingClientRect();startTouch(t.clientX-r.left,t.clientY-r.top);},{passive:false});");
  L.push("canvas.addEventListener('touchmove',function(e){e.preventDefault();const t=e.touches[0],r=canvas.getBoundingClientRect();moveTouch(t.clientX-r.left,t.clientY-r.top);},{passive:false});");
  L.push("canvas.addEventListener('touchend',function(e){e.preventDefault();endTouch();},{passive:false});");
  L.push("canvas.addEventListener('mousedown',function(e){const r=canvas.getBoundingClientRect();startTouch(e.clientX-r.left,e.clientY-r.top);});");
  L.push("canvas.addEventListener('mousemove',function(e){if(!touchActive)return;const r=canvas.getBoundingClientRect();moveTouch(e.clientX-r.left,e.clientY-r.top);});");
  L.push("window.addEventListener('mouseup',function(){endTouch();});");

  // HUD update (DOM, not canvas - cheaper and crisper for text)
  L.push("function updateHUD(){");
  L.push("  const hint=document.getElementById('targetHint');");
  L.push("  const cross=document.getElementById('crosshair');");
  L.push("  if(targeted){");
  L.push("    cross.classList.add('locked');");
  L.push("    hint.style.display='block';");
  L.push("    hint.textContent='TAP TO VIEW \u2014 '+(targeted.userData.filename||'photo');");
  L.push("  } else {");
  L.push("    cross.classList.remove('locked');");
  L.push("    hint.style.display='none';");
  L.push("  }");
  L.push("  document.getElementById('speedLabel').textContent=speed===0?'\u23F8 STOPPED':'\uD83D\uDE80 '+speed.toFixed(1)+'x';");
  // Compass to nearest galaxy not currently near
  L.push("  let nearest=null,nd=Infinity;");
  L.push("  LAYOUT.galaxies.forEach(function(g){");
  L.push("    const d=camera.position.distanceTo(new THREE.Vector3(g.x,g.y,g.z));");
  L.push("    if(d<nd&&d>g.radius+80){nd=d;nearest=g;}");
  L.push("  });");
  L.push("  const arrow=document.getElementById('compass');");
  L.push("  if(nearest){");
  L.push("    const v=new THREE.Vector3(nearest.x,nearest.y,nearest.z).project(camera);");
  L.push("    const ang=Math.atan2(v.y,v.x);");
  L.push("    arrow.style.display='block';");
  L.push("    arrow.style.transform='translate(-50%,-50%) rotate('+(-ang)+'rad)';");
  L.push("    document.getElementById('compassLabel').textContent=nearest.name+' \u2014 '+Math.round(nd)+'u';");
  L.push("  } else { arrow.style.display='none'; document.getElementById('compassLabel').textContent=''; }");
  L.push("}");

  // Update / move
  L.push("function update(){");
  L.push("  if(gameState!=='flying') return;");
  L.push("  frame++;");
  L.push("  camera.rotateY(yawVel);camera.rotateX(pitchVel);");
  L.push("  rollAmt*=0.92;");
  L.push("  camera.rotation.z=rollAmt;");
  L.push("  camera.translateZ(-speed);");
  L.push("  yawVel*=0.85;pitchVel*=0.85;");
  L.push("  updateTarget();");
  L.push("  updateLOD();");
  L.push("  if(frame%10===0) checkZoneEntry();");
  L.push("  if(frame%4===0) updateHUD();");
  L.push("}");

  L.push("function adjustSpeed(d){speed=Math.max(0,Math.min(14,speed+d));}");
  L.push("function fullStop(){speed=0;showToast('\u23F8 Stopped');}");

  L.push("function startFlying(){");
  L.push("  if(LAYOUT.photos.length===0){alert('Upload photos at /admin first');return;}");
  L.push("  gameState='flying';");
  L.push("  document.getElementById('menuUI').style.display='none';");
  L.push("  document.getElementById('flyUI').style.display='flex';");
  L.push("  document.getElementById('hud').style.display='block';");
  L.push("}");

  L.push("function loop(){update();renderer.render(scene,camera);requestAnimationFrame(loop);}");
  L.push("initScene();loop();");

  return L.join("\n");
}

// =================== HTML ===================

function buildGameHTML(layout) {
  const script = buildGameScript(layout);
  const parts = [
    "<!DOCTYPE html>",
    "<html lang='en'><head>",
    "<meta charset='UTF-8'>",
    "<meta name='viewport' content='width=device-width,initial-scale=1,user-scalable=no,viewport-fit=cover'>",
    "<title>Space Lane</title>",
    "<style>",
    "*{margin:0;padding:0;box-sizing:border-box;}",
    "body{background:#000;display:flex;flex-direction:column;align-items:center;min-height:100vh;min-height:100dvh;font-family:monospace;overflow:hidden;padding-top:env(safe-area-inset-top);}",
    "#loadScreen{position:fixed;top:0;left:0;width:100%;height:100%;height:100dvh;background:radial-gradient(ellipse at center,#0a0a1a 0%,#000 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:1000;transition:opacity 0.7s ease-out;}",
    "#loadScreen.fadeOut{opacity:0;}",
    "#loadLogo{font-size:2.4rem;font-weight:200;background:linear-gradient(45deg,#00ffff,#0088ff,#ff00ff);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:14px;animation:gradientShift 3s ease-in-out infinite;}",
    "#loadText{color:#00ffff;font-size:0.85rem;opacity:0.8;margin-bottom:20px;}",
    "#loadBarTrack{width:220px;height:3px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;}",
    "#loadBar{height:100%;width:0%;background:linear-gradient(90deg,#00ffff,#0088ff);box-shadow:0 0 12px rgba(0,255,255,0.6);animation:loadProgress 1.1s ease-out forwards;}",
    "@keyframes gradientShift{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}",
    "@keyframes loadProgress{from{width:0%;}to{width:100%;}}",
    "#toast{position:fixed;top:14%;left:50%;transform:translateX(-50%) translateY(-12px);background:rgba(0,20,15,0.9);color:#00ff88;border:1px solid rgba(0,255,136,0.4);padding:8px 18px;border-radius:20px;font-size:12px;z-index:300;opacity:0;transition:all 0.35s ease;pointer-events:none;white-space:nowrap;backdrop-filter:blur(10px);}",
    "#toast.show{opacity:1;transform:translateX(-50%) translateY(0);}",
    "#wrap{position:relative;width:100%;max-width:480px;height:62vh;height:62dvh;background:#000;}",
    "#gc{display:block;width:100%;height:100%;touch-action:none;}",
    "#hud{display:none;position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;}",
    "#crosshair{position:absolute;top:50%;left:50%;width:26px;height:26px;margin:-13px 0 0 -13px;border:2px solid rgba(255,255,255,0.4);border-radius:50%;transition:border-color 0.15s,transform 0.15s;}",
    "#crosshair.locked{border-color:#00ff88;transform:scale(1.3);box-shadow:0 0 14px rgba(0,255,136,0.6);}",
    "#targetHint{display:none;position:absolute;top:54%;left:50%;transform:translateX(-50%);color:#00ff88;font-size:12px;background:rgba(0,0,0,0.6);padding:4px 10px;border-radius:4px;white-space:nowrap;}",
    "#vignette{position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%);}",
    "#cockpitBottom{position:absolute;bottom:0;left:0;width:100%;height:14%;background:linear-gradient(to top, rgba(10,10,15,0.85), transparent);}",
    "#shipIcon{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);font-size:26px;opacity:0.85;}",
    "#compass{position:absolute;top:50%;left:50%;width:0;height:0;display:none;}",
    "#compass:before{content:'\u25B2';position:absolute;left:-150px;top:-10px;color:#ffdd00;font-size:14px;}",
    "#compassLabel{position:absolute;top:8px;left:50%;transform:translateX(-50%);color:#ffdd00;font-size:11px;background:rgba(0,0,0,0.55);padding:2px 8px;border-radius:4px;white-space:nowrap;}",
    "#menuUI{width:100%;max-width:480px;background:rgba(0,0,0,0.85);border-top:1px solid rgba(0,255,255,0.2);backdrop-filter:blur(20px);padding:14px 16px;display:flex;flex-direction:column;gap:10px;align-items:center;text-align:center;}",
    "#menuUI h1{color:#00ff88;font-size:22px;}",
    "#menuUI p{color:#4488aa;font-size:12px;}",
    "#startBtn{background:#00ff88;color:#000;border:none;padding:14px 36px;font-family:monospace;font-size:16px;font-weight:bold;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;}",
    "#statBadge{color:#00ff88;font-size:12px;background:rgba(0,255,136,0.1);border:1px solid #00ff88;padding:6px 14px;border-radius:6px;}",
    "#flyUI{width:100%;max-width:480px;background:rgba(0,0,0,0.85);border-top:1px solid rgba(0,255,255,0.2);backdrop-filter:blur(20px);padding:8px 10px;display:none;flex-direction:column;gap:6px;}",
    ".speedRow{display:flex;align-items:center;justify-content:space-between;gap:6px;}",
    ".fmtRow{display:flex;gap:5px;justify-content:center;}",
    ".fmtBtn{background:rgba(0,255,255,0.06);color:#7ab;border:1px solid rgba(0,255,255,0.25);font-size:10px;padding:5px 10px;border-radius:12px;cursor:pointer;-webkit-tap-highlight-color:transparent;font-family:monospace;}",
    ".fmtBtn.active{background:rgba(0,255,255,0.25);border-color:#00ffff;color:#fff;box-shadow:0 0 10px rgba(0,255,255,0.3);}",
    ".sBtn{background:rgba(0,255,255,0.06);color:#fff;border:1px solid rgba(0,255,255,0.25);font-size:15px;padding:9px 14px;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;font-family:monospace;}",
    ".sBtn:active{background:rgba(0,255,255,0.18);}",
    ".sBtn.stopBtn{background:rgba(170,30,30,0.15);border-color:#aa3333;color:#ff6666;font-size:12px;padding:9px 10px;}",
    ".sBtn.stopBtn:active{background:rgba(170,30,30,0.3);}",
    "#speedLabel{color:#888;font-size:11px;text-align:center;flex:1;}",
    "#adminLink{color:#222;font-size:10px;padding:4px;text-align:center;width:100%;max-width:480px;}",
    "#adminLink a{color:#222;}",
    "#ov{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);z-index:200;flex-direction:column;align-items:center;justify-content:center;padding:20px;}",
    "#ovImg{max-width:100%;max-height:68vh;object-fit:contain;border-radius:4px;}",
    "#ovMeta{color:#888;font-size:11px;text-align:center;margin-top:10px;line-height:1.8;}",
    "#ovClose{margin-top:14px;padding:12px 36px;background:#00ff88;color:#000;border:none;font-family:monospace;font-size:15px;font-weight:bold;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;}",
    "</style></head><body>",
    "<div id='loadScreen'>",
    "  <div id='loadLogo'>SPACE LANE</div>",
    "  <div id='loadText'>Initializing flight systems</div>",
    "  <div id='loadBarTrack'><div id='loadBar'></div></div>",
    "</div>",
    "<div id='toast'></div>",
    "<div id='wrap'><canvas id='gc'></canvas>",
    "<div id='hud'>",
    "  <div id='vignette'></div>",
    "  <div id='crosshair'></div>",
    "  <div id='targetHint'></div>",
    "  <div id='compassLabel'></div>",
    "  <div id='compass'></div>",
    "  <div id='cockpitBottom'></div>",
    "  <div id='shipIcon'>\uD83D\uDE80</div>",
    "</div></div>",
    "<div id='menuUI'>",
    "  <h1>\uD83D\uDE80 SPACE LANE</h1>",
    "  <p>fly through your photo album</p>",
    "  <div id='statBadge'>"+(layout.photos.length>0 ? layout.photos.length+" photos across "+layout.galaxies.length+" galaxies" : "upload photos at /admin to begin")+"</div>",
    "  <button id='startBtn' onclick='startFlying()'>LAUNCH \uD83D\uDE80</button>",
    "</div>",
    "<div id='flyUI'>",
    "  <div class='fmtRow'>",
    "    <button class='fmtBtn active' data-f='sphere' onclick='applyFormation(\"sphere\")'>Sphere</button>",
    "    <button class='fmtBtn' data-f='spiral' onclick='applyFormation(\"spiral\")'>Spiral</button>",
    "    <button class='fmtBtn' data-f='cube' onclick='applyFormation(\"cube\")'>Cube</button>",
    "    <button class='fmtBtn' data-f='torus' onclick='applyFormation(\"torus\")'>Torus</button>",
    "  </div>",
    "  <div class='speedRow'>",
    "    <button class='sBtn' onclick='adjustSpeed(-1)'>\u23F4</button>",
    "    <button class='sBtn stopBtn' onclick='fullStop()'>\u23F9 STOP</button>",
    "    <div id='speedLabel'>\uD83D\uDE80 3.0x</div>",
    "    <button class='sBtn' onclick='adjustSpeed(1)'>\u23E9</button>",
    "  </div>",
    "</div>",
    "<div id='adminLink'><a href='/admin'>upload photos</a></div>",
    "<div id='ov'>",
    "  <img id='ovImg' src='' alt='photo'>",
    "  <div id='ovMeta'></div>",
    "  <button id='ovClose' onclick='closePhoto()'>\u2190 back to cockpit</button>",
    "</div>",
    "<script src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'></script>",
    "<script>",
    script,
    "</script>",
    "</body></html>"
  ];
  return parts.join("\n");
}

// =================== ADMIN ===================

function buildAdminHTML(photos, clusters) {
  const clusterSection = clusters.map(function(c) {
    return "<div style='background:#06040c;border:1px solid #1a1a2a;border-radius:5px;padding:8px;'><div style='color:#ffdd00;font-size:12px;'>\uD83D\uDCCD "+safe(c.name)+"</div><div style='color:#444;font-size:11px;'>"+c.photo_count+" photos</div></div>";
  }).join("");
  const photoGrid = photos.slice(0,60).map(function(p) {
    return "<div style='aspect-ratio:1;background:#06040c;border-radius:3px;overflow:hidden;position:relative;'><img src='"+safe(p.url)+"' style='width:100%;height:100%;object-fit:cover;' loading='lazy'>"+(p.cluster_name?"<div style='position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.8);color:#ffdd00;font-size:7px;padding:1px 3px;overflow:hidden;white-space:nowrap;'>\uD83D\uDCCD "+safe(p.cluster_name)+"</div>":"")+"</div>";
  }).join("");
  const parts = [
    "<!DOCTYPE html>",
    "<html lang='en'><head>",
    "<meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'>",
    "<title>Space Lane \u2014 Upload</title>",
    "<style>body{background:#06040c;color:#aaa;font-family:monospace;padding:20px;max-width:600px;margin:0 auto;}h1{color:#00ff88;font-size:20px;margin-bottom:4px;}h2{color:#ffdd00;margin:18px 0 8px;font-size:13px;}a{color:#00ff88;}input[type=file]{color:#aaa;padding:8px;border:1px solid #1a1a2a;background:#000;width:100%;margin-bottom:8px;font-size:16px;border-radius:4px;}button.go{background:#00ff88;color:#000;border:none;padding:12px 24px;font-family:monospace;font-size:15px;font-weight:bold;border-radius:6px;cursor:pointer;width:100%;margin-bottom:6px;}.note{color:#444;font-size:11px;line-height:1.6;margin-bottom:10px;}#msg{padding:10px;margin:6px 0;border-radius:4px;display:none;}.ok{background:#003300;color:#4f4;border:1px solid #4f4;}.er{background:#330000;color:#f44;border:1px solid #f44;}#progWrap{display:none;background:#111;border-radius:4px;overflow:hidden;margin:6px 0;height:8px;}#progBar{height:100%;background:#00ff88;width:0%;transition:width 0.2s;}#progLabel{color:#666;font-size:11px;margin-bottom:6px;display:none;}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;}.clusters{display:flex;flex-wrap:wrap;gap:6px;}</style>",
    "<script src='https://cdnjs.cloudflare.com/ajax/libs/exif-js/2.3.0/exif.min.js'></script>",
    "</head><body>",
    "<h1>\uD83D\uDE80 Space Lane</h1>",
    "<a href='/'>\u2190 back to game</a>",
    "<h2>Upload Photos</h2>",
    "<p class='note'>Select up to 100 photos at once. GPS, date, and 3 size tiers (thumb/medium/full) are generated on your device before upload, so the 3D view can load nearby planets fast and far ones even faster. Shared with Memory Lane and Heli Lane too.</p>",
    "<div id='msg'></div>",
    "<div id='progLabel'></div>",
    "<div id='progWrap'><div id='progBar'></div></div>",
    "<input type='file' id='fileInput' accept='image/*' multiple>",
    "<button class='go' onclick='upload()'>Upload Photos \u2191</button>",
    "<h2>Galaxies ("+clusters.length+")</h2>",
    clusters.length ? "<div class='clusters'>"+clusterSection+"</div>" : "<p style='color:#333;font-size:12px;'>None yet \u2014 upload photos with GPS data.</p>",
    "<h2>Photos ("+photos.length+")</h2>",
    photos.length ? "<div class='grid'>"+photoGrid+"</div>" : "<p style='color:#333;font-size:12px;'>None uploaded yet.</p>",
    "<script>",
    "function msg(t,ok){const d=document.getElementById('msg');d.textContent=t;d.className=ok?'ok':'er';d.style.display='block';setTimeout(function(){d.style.display='none';},6000);}",
    "function setProgress(done,total){const pct=total?Math.round(done/total*100):0;document.getElementById('progBar').style.width=pct+'%';document.getElementById('progLabel').textContent='Uploading '+done+' / '+total+' \u2014 '+pct+'%';document.getElementById('progWrap').style.display=total?'block':'none';document.getElementById('progLabel').style.display=total?'block':'none';}",
    "function getExif(file){return new Promise(function(resolve){try{EXIF.getData(file,function(){const la=EXIF.getTag(this,'GPSLatitude'),laR=EXIF.getTag(this,'GPSLatitudeRef'),lo=EXIF.getTag(this,'GPSLongitude'),loR=EXIF.getTag(this,'GPSLongitudeRef'),dt=EXIF.getTag(this,'DateTimeOriginal')||EXIF.getTag(this,'DateTime');let lat=null,lng=null;if(la&&la.length===3){lat=la[0]+la[1]/60+la[2]/3600;if(laR==='S')lat=-lat;}if(lo&&lo.length===3){lng=lo[0]+lo[1]/60+lo[2]/3600;if(loR==='W')lng=-lng;}resolve({lat,lng,date_taken:dt||null});});}catch(e){resolve({lat:null,lng:null,date_taken:null});}});}",
    "function resizeToBlob(img,maxDim,quality){",
    "  let w=img.naturalWidth,h=img.naturalHeight;",
    "  const scale=Math.min(1,maxDim/Math.max(w,h));",
    "  w=Math.max(1,Math.round(w*scale));h=Math.max(1,Math.round(h*scale));",
    "  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;",
    "  canvas.getContext('2d').drawImage(img,0,0,w,h);",
    "  return new Promise(function(resolve){canvas.toBlob(function(b){resolve(b);},'image/jpeg',quality||0.82);});",
    "}",
    "function loadImageEl(file){return new Promise(function(resolve,reject){const img=new Image();img.onload=function(){resolve(img);};img.onerror=reject;img.src=URL.createObjectURL(file);});}",
    "async function makeTiers(file){",
    "  try{",
    "    const img=await loadImageEl(file);",
    "    const thumb=await resizeToBlob(img,180,0.75);",
    "    const medium=await resizeToBlob(img,800,0.82);",
    "    URL.revokeObjectURL(img.src);",
    "    return {thumb,medium};",
    "  }catch(e){return {thumb:null,medium:null};}",
    "}",
    "async function uploadOne(file){const exif=await getExif(file);const tiers=await makeTiers(file);const form=new FormData();form.append('file',file);form.append('name',file.name);if(exif.lat!=null)form.append('lat',exif.lat);if(exif.lng!=null)form.append('lng',exif.lng);if(exif.date_taken)form.append('date_taken',exif.date_taken);if(tiers.thumb)form.append('thumb',tiers.thumb,'thumb.jpg');if(tiers.medium)form.append('medium',tiers.medium,'medium.jpg');const r=await fetch('/admin/upload',{method:'POST',body:form});return r.json();}",
    "async function uploadBatch(files,concurrency){let done=0,errors=0;const total=files.length;const queue=Array.from(files);async function worker(){while(queue.length>0){const f=queue.shift();try{const d=await uploadOne(f);if(d.ok)done++;else errors++;}catch(e){errors++;}setProgress(done+errors,total);}}await Promise.all(Array.from({length:Math.min(concurrency,total)},worker));return{done,errors};}",
    "async function upload(){const files=document.getElementById('fileInput').files;if(!files.length){msg('No files selected',false);return;}const btn=document.querySelector('button.go');btn.disabled=true;btn.textContent='Uploading...';setProgress(0,files.length);try{const{done,errors}=await uploadBatch(files,5);setProgress(0,0);if(errors)msg('Uploaded '+done+', '+errors+' failed',done>0);else msg('Uploaded '+done+' photo'+(done===1?'':'s')+'! Refresh game to see them.',true);}catch(e){msg('Upload error: '+e,false);}finally{btn.disabled=false;btn.textContent='Upload Photos \u2191';}}",
    "</script>",
    "</body></html>"
  ];
  return parts.join("\n");
}

// =================== API ===================

async function apiUpload(env, req) {
  const form = await req.formData().catch(() => null);
  if (!form) return j({ok:false,error:"form required"},400);
  const file = form.get("file");
  if (!file) return j({ok:false,error:"file required"},400);
  const rawName = (form.get("name")||file.name||"photo.jpg").replace(/[^a-zA-Z0-9._-]/g,"_").toLowerCase();
  const lat = form.get("lat") ? parseFloat(form.get("lat")) : null;
  const lng = form.get("lng") ? parseFloat(form.get("lng")) : null;
  const dateTaken = form.get("date_taken") || null;
  const id = uid();
  const r2Key = R2_PREFIX+id+"_"+rawName;
  const url = "/photo/"+id;
  const buf = await file.arrayBuffer();
  await env.BUCKET.put(r2Key, buf, {httpMetadata:{contentType:file.type||"image/jpeg"}});
  // Optional pre-resized tiers, generated client-side before upload (see admin page).
  // Stored under a parallel prefix so the original key can derive them by convention - no DB schema change needed.
  const thumb = form.get("thumb");
  const medium = form.get("medium");
  if (thumb) {
    const thumbKey = r2Key.replace(R2_PREFIX, R2_PREFIX+"thumb/");
    await env.BUCKET.put(thumbKey, await thumb.arrayBuffer(), {httpMetadata:{contentType:thumb.type||"image/jpeg"}});
  }
  if (medium) {
    const mediumKey = r2Key.replace(R2_PREFIX, R2_PREFIX+"medium/");
    await env.BUCKET.put(mediumKey, await medium.arrayBuffer(), {httpMetadata:{contentType:medium.type||"image/jpeg"}});
  }
  const cluster = await resolveCluster(env, lat, lng);
  await env.DB.prepare("INSERT INTO photos (id,filename,r2_key,url,lat,lng,date_taken,cluster_id,cluster_name) VALUES (?,?,?,?,?,?,?,?,?)")
    .bind(id,rawName,r2Key,url,lat,lng,dateTaken,cluster.id,cluster.name).run();
  return j({ok:true,id,cluster_name:cluster.name,tiers:{thumb:Boolean(thumb),medium:Boolean(medium)}});
}

async function apiPhoto(env, id, size) {
  const row = await env.DB.prepare("SELECT r2_key FROM photos WHERE id=?").bind(safe(id)).first();
  if (!row) return new Response("Not found",{status:404});
  let key = row.r2_key;
  if (size === "thumb" || size === "medium") {
    const tieredKey = key.replace(R2_PREFIX, R2_PREFIX + size + "/");
    const tieredObj = await env.BUCKET.get(tieredKey);
    if (tieredObj) return new Response(tieredObj.body,{headers:{"Content-Type":tieredObj.httpMetadata?.contentType||"image/jpeg","Cache-Control":"public, max-age=86400"}});
    // fall through to full if this tier wasn't uploaded (older photos)
  }
  const obj = await env.BUCKET.get(key);
  if (!obj) return new Response("Not found",{status:404});
  return new Response(obj.body,{headers:{"Content-Type":obj.httpMetadata?.contentType||"image/jpeg","Cache-Control":"public, max-age=86400"}});
}

// =================== ROUTER ===================

export default {
  async fetch(request, env) {
    const url = new URL(request.url), path = url.pathname, method = request.method;
    if (method==="OPTIONS") return new Response(null,{status:204,headers:CORS});
    if (path.startsWith("/photo/")) return apiPhoto(env, decodeURIComponent(path.slice(7)), url.searchParams.get("size"));
    if (path==="/admin" && method==="GET") {
      const [pr,cr] = await Promise.all([
        env.DB.prepare("SELECT id,filename,url,lat,lng,date_taken,cluster_name FROM photos ORDER BY uploaded_at DESC LIMIT 300").all(),
        env.DB.prepare("SELECT * FROM clusters ORDER BY photo_count DESC").all()
      ]);
      return new Response(buildAdminHTML(pr.results||[], cr.results||[]), {headers:{"Content-Type":"text/html;charset=UTF-8"}});
    }
    if (path==="/admin/upload" && method==="POST") return apiUpload(env, request);
    if (path==="/health") return j({ok:true,worker:WORKER_NAME,version:VERSION});
    if (path==="/admin/setup" && method==="POST") {
      const results=[];
      for (const sql of SCHEMA) {try{await env.DB.prepare(sql).run();results.push({ok:true});}catch(e){results.push({ok:false,error:e.message});}}
      return j({ok:true,results});
    }
    if (path==="/"||path==="") {
      const [pr,cr] = await Promise.all([
        env.DB.prepare("SELECT id,filename,url,lat,lng,date_taken,cluster_id,cluster_name FROM photos ORDER BY cluster_id, uploaded_at LIMIT 300").all(),
        env.DB.prepare("SELECT * FROM clusters ORDER BY photo_count DESC").all()
      ]);
      const layout = layout3D(pr.results||[], cr.results||[]);
      return new Response(buildGameHTML(layout), {headers:{"Content-Type":"text/html;charset=UTF-8"}});
    }
    return j({error:"Not found"},404);
  }
};