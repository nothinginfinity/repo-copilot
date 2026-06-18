const VERSION = "1.0.0";
const WORKER_NAME = "afo-memory-lane";
const R2_PREFIX = "memory-lane/photos/";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const CARS = [
  {id:"sedan",   name:"Sedan",      emoji:"\uD83D\uDE97", speed:2.5, desc:"Balanced everyday drive"},
  {id:"sports",  name:"Sports Car", emoji:"\uD83C\uDFCE\uFE0F", speed:4.5, desc:"Fast \u2014 easy to miss photos"},
  {id:"suv",     name:"SUV",        emoji:"\uD83D\uDE99", speed:1.8, desc:"Slow \u2014 great for browsing"},
  {id:"taxi",    name:"Taxi",       emoji:"\uD83D\uDE95", speed:2.5, desc:"Classic city cruiser"},
  {id:"truck",   name:"Truck",      emoji:"\uD83D\uDEFB", speed:1.2, desc:"Slowest \u2014 see everything"}
];

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY, filename TEXT NOT NULL, r2_key TEXT NOT NULL, url TEXT NOT NULL, lat REAL, lng REAL, date_taken TEXT, cluster_id TEXT, cluster_name TEXT, uploaded_at TEXT DEFAULT (datetime('now')))",
  "CREATE TABLE IF NOT EXISTS clusters (id TEXT PRIMARY KEY, name TEXT NOT NULL, lat REAL NOT NULL, lng REAL NOT NULL, photo_count INTEGER DEFAULT 0)"
];

function j(v, s=200) { return Response.json(v, {status:s, headers:CORS}); }
function uid() { return Math.random().toString(36).slice(2,9)+Date.now().toString(36); }
function safe(v) { return String(v||"").replace(/[<>"']/g,""); }

function haversine(lat1,lng1,lat2,lng2) {
  const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

async function resolveCluster(env, lat, lng) {
  if (lat==null || lng==null) return {id:null, name:null};
  const rows = await env.DB.prepare("SELECT * FROM clusters").all();
  for (const c of (rows.results||[])) {
    if (haversine(lat,lng,c.lat,c.lng) < 80) {
      await env.DB.prepare("UPDATE clusters SET photo_count=photo_count+1 WHERE id=?").bind(c.id).run();
      return {id:c.id, name:c.name};
    }
  }
  const cid = uid();
  const name = approxLocationName(lat,lng);
  await env.DB.prepare("INSERT INTO clusters (id,name,lat,lng,photo_count) VALUES (?,?,?,?,1)").bind(cid,name,lat,lng).run();
  return {id:cid, name};
}

function approxLocationName(lat,lng) {
  const regions = [
    [34,36,-119,-117,"Los Angeles"],[-34,-33,150,152,"Sydney"],[51,52,-1,1,"London"],
    [48,49,2,3,"Paris"],[35,36,139,140,"Tokyo"],[37,38,-123,-122,"San Francisco"],
    [40,41,-74,-73,"New York"],[19,20,-100,-99,"Mexico City"],[55,56,37,38,"Moscow"],
    [-24,-22,-47,-46,"Sao Paulo"],[28,29,77,78,"New Delhi"],[31,32,121,122,"Shanghai"],
    [1,2,103,104,"Singapore"],[25,26,55,56,"Dubai"],[52,53,13,14,"Berlin"],
    [41,42,12,13,"Rome"],[40,41,-4,-3,"Madrid"],[59,60,18,19,"Stockholm"],
    [47,48,19,20,"Budapest"],[37,38,23,24,"Athens"]
  ];
  for (const [latMin,latMax,lngMin,lngMax,name] of regions) {
    if (lat>=latMin&&lat<=latMax&&lng>=lngMin&&lng<=lngMax) return name;
  }
  const ns = lat>=0 ? Math.round(lat)+"N" : Math.round(-lat)+"S";
  const ew = lng>=0 ? Math.round(lng)+"E" : Math.round(-lng)+"W";
  return ns+", "+ew;
}

// =================== GAME SCRIPT ===================

function buildGameScript(photos, clusters) {
  const L = [];

  L.push("const PHOTOS=" + JSON.stringify(photos) + ";");
  L.push("const CLUSTERS=" + JSON.stringify(clusters) + ";");
  L.push("const CARS=" + JSON.stringify(CARS) + ";");
  L.push("const W=480,H=640,HORIZON=190,CAR_Y=545;");
  L.push("const RD_CX=W/2,RD_HW_H=28,RD_HW_B=145;");

  L.push("let gameState='menu';");
  L.push("let selCar=CARS[0];");
  L.push("let playerName='';");
  L.push("let speed=2.5;");
  L.push("let scrollOff=0;");
  L.push("let distance=0;");
  L.push("let billboards=[];");
  L.push("let nextSpawn=300;");
  L.push("let photoPool=PHOTOS.slice();");
  L.push("let photoImgs={};");
  L.push("let currentCluster=null;");
  L.push("let frame=0;");

  L.push("const STARS=Array.from({length:40},function(){return{x:Math.random()*480,y:Math.random()*HORIZON,s:Math.random()*1.5+0.3};});");
  L.push("const MTNL=[{x:30,h:60},{x:100,h:90},{x:180,h:70},{x:260,h:100},{x:350,h:75},{x:430,h:85}];");

  L.push("const canvas=document.getElementById('gc');");
  L.push("const ctx=canvas.getContext('2d');");
  L.push("canvas.width=W;canvas.height=H;");

  // Projection
  L.push("function proj(z){const y=HORIZON+(CAR_Y-HORIZON)*z;const hw=RD_HW_H+(RD_HW_B-RD_HW_H)*z;return{y:y,hw:hw,left:RD_CX-hw,right:RD_CX+hw};}");

  // Photo image loader
  L.push("function getImg(p){if(!photoImgs[p.id]){const img=new Image();img.crossOrigin='anonymous';img.src=p.url;photoImgs[p.id]=img;}return photoImgs[p.id];}");

  // Next photo from pool
  L.push("function nextPhoto(){if(!photoPool.length)photoPool=PHOTOS.slice();if(!photoPool.length)return null;const i=Math.floor(Math.random()*photoPool.length);return photoPool.splice(i,1)[0];}");

  // Spawn billboard
  L.push("function spawnBillboard(){");
  L.push("  const p=nextPhoto();if(!p)return;");
  L.push("  const side=billboards.filter(function(b){return b.z>0;}).length%2===0?'left':'right';");
  L.push("  billboards.push({z:0,side:side,photo:p,sx:0,sy:0,sw:0,sh:0});");
  L.push("  nextSpawn=distance+280+Math.random()*180;");
  L.push("  if(p.cluster_name) currentCluster=p.cluster_name;");
  L.push("}");

  // Preload upcoming photos
  L.push("function preloadNear(){photoPool.slice(0,3).forEach(function(p){getImg(p);});}");

  // Draw sky and ground
  L.push("function drawBg(){");
  L.push("  const sg=ctx.createLinearGradient(0,0,0,HORIZON);sg.addColorStop(0,'#080820');sg.addColorStop(0.6,'#1a2855');sg.addColorStop(1,'#2a4a7a');");
  L.push("  ctx.fillStyle=sg;ctx.fillRect(0,0,W,HORIZON);");
  L.push("  STARS.forEach(function(s){ctx.fillStyle='rgba(255,255,255,'+(s.s/2)+')';ctx.fillRect(s.x,s.y,s.s,s.s);});");
  L.push("  MTNL.forEach(function(m){");
  L.push("    const mx=(m.x-scrollOff*0.08+W*20)%W;");
  L.push("    ctx.fillStyle='#1a2a3a';");
  L.push("    ctx.beginPath();ctx.moveTo(mx,HORIZON);ctx.lineTo(mx-m.h*0.6,HORIZON-m.h);ctx.lineTo(mx+m.h*0.6,HORIZON-m.h*0.3);ctx.lineTo(mx+m.h*0.9,HORIZON);ctx.fill();");
  L.push("  });");
  L.push("  const gg=ctx.createLinearGradient(0,HORIZON,0,H);gg.addColorStop(0,'#1a3a0a');gg.addColorStop(1,'#0a1a05');");
  L.push("  ctx.fillStyle=gg;ctx.fillRect(0,HORIZON,W,H-HORIZON);");
  L.push("}");

  // Draw road
  L.push("function drawRoad(){");
  L.push("  ctx.fillStyle='#2a2a2a';");
  L.push("  ctx.beginPath();ctx.moveTo(RD_CX-RD_HW_H,HORIZON);ctx.lineTo(RD_CX+RD_HW_H,HORIZON);ctx.lineTo(RD_CX+RD_HW_B,H);ctx.lineTo(RD_CX-RD_HW_B,H);ctx.closePath();ctx.fill();");
  // Edge lines
  L.push("  ctx.strokeStyle='#ffffff';ctx.lineWidth=2;");
  L.push("  ctx.beginPath();ctx.moveTo(RD_CX-RD_HW_H,HORIZON);ctx.lineTo(RD_CX-RD_HW_B,H);ctx.stroke();");
  L.push("  ctx.beginPath();ctx.moveTo(RD_CX+RD_HW_H,HORIZON);ctx.lineTo(RD_CX+RD_HW_B,H);ctx.stroke();");
  // Center dashes
  L.push("  for(let i=0;i<10;i++){");
  L.push("    const t=((i/10)+(scrollOff%200)/200)%1;");
  L.push("    const t2=((i/10+0.04)+(scrollOff%200)/200)%1;");
  L.push("    if(t<0.05||t2>0.95) continue;");
  L.push("    const p1=proj(t),p2=proj(Math.min(t2,0.95));");
  L.push("    ctx.strokeStyle='#ffff44';ctx.lineWidth=Math.max(1,t*4);");
  L.push("    ctx.beginPath();ctx.moveTo(RD_CX,p1.y);ctx.lineTo(RD_CX,p2.y);ctx.stroke();");
  L.push("  }");
  // Roadside grass strips
  L.push("  ctx.fillStyle='#1a3a0a';");
  L.push("  ctx.beginPath();ctx.moveTo(0,HORIZON);ctx.lineTo(RD_CX-RD_HW_H,HORIZON);ctx.lineTo(RD_CX-RD_HW_B,H);ctx.lineTo(0,H);ctx.fill();");
  L.push("  ctx.beginPath();ctx.moveTo(W,HORIZON);ctx.lineTo(RD_CX+RD_HW_H,HORIZON);ctx.lineTo(RD_CX+RD_HW_B,H);ctx.lineTo(W,H);ctx.fill();");
  L.push("}");

  // Draw billboard
  L.push("function drawBillboard(bb){");
  L.push("  const z=bb.z;if(z<=0||z>1.08) return;");
  L.push("  const p=proj(z);");
  L.push("  const bbW=Math.max(12,z*180);");
  L.push("  const bbH=Math.max(9,z*120);");
  L.push("  const margin=z*24;");
  L.push("  let bx=bb.side==='left'?p.left-bbW-margin:p.right+margin;");
  L.push("  const by=p.y-bbH-z*30;");
  // Clamp to screen
  L.push("  if(bb.side==='left'&&bx<2) bx=2;");
  L.push("  if(bb.side==='right'&&bx+bbW>W-2) bx=W-bbW-2;");
  // Post
  L.push("  const px=bx+bbW/2,postW=Math.max(2,z*7);");
  L.push("  ctx.fillStyle='#5a4a30';ctx.fillRect(px-postW/2,by+bbH,postW,p.y-by-bbH+4);");
  // Shadow/frame
  L.push("  ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(bx+3,by+3,bbW,bbH);");
  L.push("  ctx.fillStyle='#111';ctx.fillRect(bx-3,by-3,bbW+6,bbH+6);");
  // Photo or placeholder
  L.push("  const img=getImg(bb.photo);");
  L.push("  if(img.complete&&img.naturalWidth>0){");
  L.push("    ctx.save();ctx.beginPath();ctx.rect(bx,by,bbW,bbH);ctx.clip();");
  L.push("    ctx.drawImage(img,bx,by,bbW,bbH);ctx.restore();");
  L.push("  } else {");
  L.push("    ctx.fillStyle='#1a2a3a';ctx.fillRect(bx,by,bbW,bbH);");
  L.push("    ctx.fillStyle='#4a6a8a';ctx.font=Math.max(10,z*22)+'px serif';ctx.textAlign='center';");
  L.push("    ctx.fillText('\uD83D\uDDBC\uFE0F',bx+bbW/2,by+bbH*0.6);ctx.textAlign='left';");
  L.push("  }");
  // Tap glow when in range
  L.push("  if(z>0.48&&z<0.96){");
  L.push("    const pulse=0.6+0.4*Math.sin(frame*0.12);");
  L.push("    ctx.strokeStyle='rgba(0,255,136,'+pulse+')';ctx.lineWidth=Math.max(1,z*3);");
  L.push("    ctx.strokeRect(bx-3,by-3,bbW+6,bbH+6);");
  L.push("    if(z>0.6){");
  L.push("      ctx.fillStyle='rgba(0,255,136,0.9)';ctx.font=Math.max(7,z*10)+'px monospace';ctx.textAlign='center';");
  L.push("      ctx.fillText('TAP',bx+bbW/2,by+bbH+z*12);ctx.textAlign='left';");
  L.push("    }");
  L.push("  }");
  // Location badge
  L.push("  if(bb.photo.cluster_name&&z>0.5&&z<0.8){");
  L.push("    ctx.fillStyle='rgba(0,0,0,0.75)';const bw2=Math.max(40,z*90);");
  L.push("    ctx.fillRect(bx,by,bw2,Math.max(10,z*14));");
  L.push("    ctx.fillStyle='#ffdd00';ctx.font=Math.max(6,z*9)+'px monospace';");
  L.push("    ctx.fillText('\uD83D\uDCCD '+bb.photo.cluster_name.slice(0,12),bx+2,by+z*11);");
  L.push("  }");
  // Store tap bounds
  L.push("  bb.sx=bx;bb.sy=by;bb.sw=bbW;bb.sh=bbH;");
  L.push("}");

  // Draw car
  L.push("function drawCar(){");
  L.push("  ctx.save();ctx.font='42px serif';ctx.textAlign='center';");
  L.push("  ctx.fillText(selCar.emoji,RD_CX,CAR_Y+20);");
  // Headlights
  L.push("  ctx.fillStyle='rgba(255,255,180,0.15)';");
  L.push("  ctx.beginPath();ctx.moveTo(RD_CX-15,CAR_Y-20);ctx.lineTo(RD_CX-25,HORIZON+40);ctx.lineTo(RD_CX+5,HORIZON+40);ctx.lineTo(RD_CX+5,CAR_Y-20);ctx.fill();");
  L.push("  ctx.beginPath();ctx.moveTo(RD_CX+15,CAR_Y-20);ctx.lineTo(RD_CX+25,HORIZON+40);ctx.lineTo(RD_CX-5,HORIZON+40);ctx.lineTo(RD_CX-5,CAR_Y-20);ctx.fill();");
  L.push("  ctx.restore();");
  L.push("}");

  // Draw HUD
  L.push("function drawHUD(){");
  L.push("  ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(0,0,W,34);");
  L.push("  ctx.fillStyle='#aaa';ctx.font='12px monospace';");
  L.push("  ctx.fillText('\uD83D\uDDBC\uFE0F '+PHOTOS.length,8,21);");
  L.push("  ctx.fillStyle='#888';ctx.textAlign='right';");
  L.push("  ctx.fillText(selCar.emoji+' '+Math.round(distance)+'m',W-8,21);ctx.textAlign='left';");
  L.push("  if(currentCluster){");
  L.push("    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(W/2-70,4,140,24);");
  L.push("    ctx.strokeStyle='#ffdd00';ctx.lineWidth=1;ctx.strokeRect(W/2-70,4,140,24);");
  L.push("    ctx.fillStyle='#ffdd00';ctx.font='11px monospace';ctx.textAlign='center';");
  L.push("    ctx.fillText('\uD83D\uDCCD '+currentCluster.slice(0,16),W/2,20);ctx.textAlign='left';");
  L.push("  }");
  L.push("}");

  // Menu canvas backdrop
  L.push("function drawMenuBg(){");
  L.push("  const sg=ctx.createLinearGradient(0,0,0,H*0.45);sg.addColorStop(0,'#080820');sg.addColorStop(1,'#1a2855');");
  L.push("  ctx.fillStyle=sg;ctx.fillRect(0,0,W,H*0.45);");
  L.push("  ctx.fillStyle='#0d2a08';ctx.fillRect(0,H*0.45,W,H*0.55);");
  // Preview road
  L.push("  ctx.fillStyle='#2a2a2a';ctx.beginPath();ctx.moveTo(W/2-25,H*0.45);ctx.lineTo(W/2+25,H*0.45);ctx.lineTo(W/2+130,H);ctx.lineTo(W/2-130,H);ctx.fill();");
  L.push("  ctx.strokeStyle='#ffff44';ctx.lineWidth=2;ctx.setLineDash([10,12]);");
  L.push("  ctx.beginPath();ctx.moveTo(W/2,H*0.45);ctx.lineTo(W/2,H);ctx.stroke();ctx.setLineDash([]);");
  // Title
  L.push("  ctx.fillStyle='#00ff88';ctx.font='bold 28px monospace';ctx.textAlign='center';");
  L.push("  ctx.fillText('MEMORY LANE',W/2,70);");
  L.push("  ctx.fillStyle='#4488aa';ctx.font='13px monospace';");
  L.push("  ctx.fillText('drive through your photo album',W/2,94);ctx.textAlign='left';");
  // Photo count badge
  L.push("  if(PHOTOS.length>0){");
  L.push("    ctx.fillStyle='rgba(0,255,136,0.1)';ctx.fillRect(W/2-80,108,160,26);");
  L.push("    ctx.strokeStyle='#00ff88';ctx.lineWidth=1;ctx.strokeRect(W/2-80,108,160,26);");
  L.push("    ctx.fillStyle='#00ff88';ctx.font='12px monospace';ctx.textAlign='center';");
  L.push("    ctx.fillText(PHOTOS.length+' photos ready to explore',W/2,125);ctx.textAlign='left';");
  L.push("  } else {");
  L.push("    ctx.fillStyle='#555';ctx.font='12px monospace';ctx.textAlign='center';");
  L.push("    ctx.fillText('upload photos at /admin to begin',W/2,125);ctx.textAlign='left';");
  L.push("  }");
  L.push("}");

  // Update loop
  L.push("function update(){");
  L.push("  if(gameState!=='driving') return;");
  L.push("  frame++;");
  L.push("  scrollOff+=speed;");
  L.push("  distance+=speed;");
  L.push("  billboards.forEach(function(bb){bb.z+=speed*0.003;});");
  L.push("  billboards=billboards.filter(function(bb){return bb.z<1.1;});");
  L.push("  if(distance>=nextSpawn&&PHOTOS.length>0) spawnBillboard();");
  L.push("  preloadNear();");
  L.push("}");

  // Draw frame
  L.push("function drawFrame(){");
  L.push("  if(gameState==='menu'){drawMenuBg();return;}");
  L.push("  drawBg();drawRoad();");
  L.push("  billboards.sort(function(a,b){return a.z-b.z;}).forEach(drawBillboard);");
  L.push("  drawCar();drawHUD();");
  L.push("}");

  // Tap handler
  L.push("function handleTap(tx,ty){");
  L.push("  if(gameState!=='driving') return;");
  L.push("  const hit=billboards.find(function(bb){return bb.z>0.45&&bb.sx&&tx>=bb.sx&&tx<=bb.sx+bb.sw&&ty>=bb.sy&&ty<=bb.sy+bb.sh;});");
  L.push("  if(hit) openPhoto(hit.photo);");
  L.push("}");

  // Open/close photo
  L.push("function openPhoto(p){");
  L.push("  const ov=document.getElementById('ov');if(!ov)return;");
  L.push("  document.getElementById('ovImg').src=p.url;");
  L.push("  const parts=[];");
  L.push("  if(p.filename) parts.push(p.filename);");
  L.push("  if(p.date_taken) parts.push(p.date_taken.slice(0,10));");
  L.push("  if(p.cluster_name) parts.push('\uD83D\uDCCD '+p.cluster_name);");
  L.push("  document.getElementById('ovMeta').textContent=parts.join('  \u00B7  ');");
  L.push("  ov.style.display='flex';");
  L.push("}");

  L.push("function closePhoto(){const ov=document.getElementById('ov');if(ov)ov.style.display='none';}");

  // Car select UI update
  L.push("function selectCar(id){");
  L.push("  selCar=CARS.find(function(c){return c.id===id;})||CARS[0];");
  L.push("  speed=selCar.speed;");
  L.push("  document.querySelectorAll('.carChip').forEach(function(el){el.classList.toggle('active',el.dataset.id===id);});");
  L.push("}");

  // Start game
  L.push("function startDriving(){");
  L.push("  const inp=document.getElementById('nameInput');");
  L.push("  if(inp) playerName=inp.value.trim()||'Driver';");
  L.push("  if(PHOTOS.length===0){alert('Upload some photos first at /admin');return;}");
  L.push("  gameState='driving';speed=selCar.speed;");
  L.push("  document.getElementById('menuUI').style.display='none';");
  L.push("  document.getElementById('driveUI').style.display='flex';");
  L.push("  spawnBillboard();");
  L.push("}");

  // Input
  L.push("canvas.addEventListener('touchstart',function(e){e.preventDefault();const t=e.touches[0],rect=canvas.getBoundingClientRect();handleTap((t.clientX-rect.left)*(W/rect.width),(t.clientY-rect.top)*(H/rect.height));},{passive:false});");
  L.push("canvas.addEventListener('click',function(e){const rect=canvas.getBoundingClientRect();handleTap((e.clientX-rect.left)*(W/rect.width),(e.clientY-rect.top)*(H/rect.height));});");

  // Speed control
  L.push("function adjustSpeed(d){speed=Math.max(0.5,Math.min(6,speed+d));const sl=document.getElementById('speedLabel');if(sl)sl.textContent=selCar.emoji+' '+speed.toFixed(1)+'x';}");

  // Loop
  L.push("function loop(){update();drawFrame();requestAnimationFrame(loop);}");
  L.push("loop();");

  return L.join("\n");
}

// =================== HTML ===================

function buildGameHTML(photos, clusters) {
  const script = buildGameScript(photos, clusters);
  const carChips = CARS.map(function(c) {
    return "<button class='carChip"+(c.id==='sedan'?' active':'')+"' data-id='"+c.id+"' onclick='selectCar(\""+c.id+"\")' title='"+c.desc+"'><span style='font-size:22px'>"+c.emoji+"</span><br><span style='font-size:10px'>"+c.name+"</span></button>";
  }).join("");
  const parts = [
    "<!DOCTYPE html>",
    "<html lang='en'><head>",
    "<meta charset='UTF-8'>",
    "<meta name='viewport' content='width=device-width,initial-scale=1,user-scalable=no,viewport-fit=cover'>",
    "<title>Memory Lane</title>",
    "<style>",
    "*{margin:0;padding:0;box-sizing:border-box;}",
    "body{background:#000820;display:flex;flex-direction:column;align-items:center;min-height:100vh;min-height:100dvh;font-family:monospace;overflow:hidden;padding-top:env(safe-area-inset-top);}",
    "#wrap{position:relative;width:100%;max-width:480px;}",
    "canvas{display:block;touch-action:none;width:100%;height:auto;}",
    "#menuUI{width:100%;max-width:480px;background:#000;border-top:1px solid #1a1a2a;padding:10px 12px;display:flex;flex-direction:column;gap:8px;}",
    "#nameInput{background:#0a0a18;border:1px solid #2a2a4a;color:#fff;font-family:monospace;font-size:16px;padding:10px 12px;border-radius:6px;outline:none;-webkit-appearance:none;}",
    "#nameInput:focus{border-color:#00ff88;}",
    ".carRow{display:flex;gap:6px;overflow-x:auto;padding:2px 0;}",
    ".carChip{background:#0a0a18;border:1px solid #2a2a4a;color:#aaa;padding:8px 12px;border-radius:6px;cursor:pointer;text-align:center;min-width:72px;-webkit-tap-highlight-color:transparent;font-family:monospace;}",
    ".carChip.active{background:#001a0a;border-color:#00ff88;color:#00ff88;}",
    ".carChip:active{opacity:0.7;}",
    "#startBtn{background:#00ff88;color:#000;border:none;padding:12px;font-family:monospace;font-size:16px;font-weight:bold;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;}",
    "#driveUI{width:100%;max-width:480px;background:#000;border-top:1px solid #1a1a2a;padding:8px 12px;display:none;flex-direction:row;align-items:center;justify-content:space-between;gap:8px;}",
    ".sBtn{background:#0a0a18;color:#fff;border:1px solid #2a2a4a;font-size:18px;padding:10px 20px;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;font-family:monospace;}",
    ".sBtn:active{background:#1a1a2a;}",
    "#speedLabel{color:#888;font-size:12px;text-align:center;flex:1;}",
    "#adminBtn{color:#333;font-size:11px;text-align:center;padding:4px;width:100%;max-width:480px;}",
    "#adminBtn a{color:#333;}",
    "#ov{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);z-index:200;flex-direction:column;align-items:center;justify-content:center;padding:20px;}",
    "#ovImg{max-width:100%;max-height:72vh;object-fit:contain;border-radius:4px;}",
    "#ovMeta{color:#888;font-size:11px;text-align:center;margin-top:10px;line-height:1.8;}",
    "#ovClose{margin-top:14px;padding:12px 36px;background:#00ff88;color:#000;border:none;font-family:monospace;font-size:15px;font-weight:bold;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;}",
    "</style></head><body>",
    "<div id='wrap'><canvas id='gc'></canvas></div>",
    "<div id='menuUI'>",
    "  <input type='text' id='nameInput' placeholder='your name (optional)' maxlength='20' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false'>",
    "  <div class='carRow'>"+carChips+"</div>",
    "  <button id='startBtn' onclick='startDriving()'>START DRIVING \u25B6</button>",
    "</div>",
    "<div id='driveUI'>",
    "  <button class='sBtn' onclick='adjustSpeed(-0.5)'>\u23F4 Slow</button>",
    "  <div id='speedLabel'>\uD83D\uDE97 2.5x</div>",
    "  <button class='sBtn' onclick='adjustSpeed(0.5)'>Fast \u23E9</button>",
    "</div>",
    "<div id='adminBtn'><a href='/admin'>upload photos</a></div>",
    "<div id='ov'>",
    "  <img id='ovImg' src='' alt='photo'>",
    "  <div id='ovMeta'></div>",
    "  <button id='ovClose' onclick='closePhoto()'>BACK TO ROAD \uD83D\uDE97</button>",
    "</div>",
    "<script>",
    script,
    "</script>",
    "</body></html>"
  ];
  return parts.join("\n");
}

// =================== ADMIN ===================

function buildAdminHTML(photos, clusters) {
  const clusterSections = clusters.map(function(c) {
    return "<div style='background:#0a0a18;border:1px solid #2a2a4a;border-radius:6px;padding:10px;margin-bottom:8px;'><div style='color:#ffdd00;font-size:13px;'>\uD83D\uDCCD "+safe(c.name)+"</div><div style='color:#555;font-size:11px;'>"+c.photo_count+" photos \u00B7 "+Number(c.lat).toFixed(2)+", "+Number(c.lng).toFixed(2)+"</div></div>";
  }).join("");
  const photoGrid = photos.slice(0,40).map(function(p) {
    return "<div style='position:relative;aspect-ratio:1;background:#0a0a18;border-radius:4px;overflow:hidden;'><img src='"+safe(p.url)+"' style='width:100%;height:100%;object-fit:cover;' loading='lazy'>"+(p.cluster_name?"<div style='position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.7);color:#ffdd00;font-size:8px;padding:2px 4px;overflow:hidden;white-space:nowrap;'>\uD83D\uDCCD "+safe(p.cluster_name)+"</div>":"")+"</div>";
  }).join("");
  const parts = [
    "<!DOCTYPE html>",
    "<html lang='en'><head>",
    "<meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'>",
    "<title>Memory Lane \u2014 Upload</title>",
    "<style>body{background:#000820;color:#aaa;font-family:monospace;padding:20px;max-width:600px;margin:0 auto;}h1{color:#00ff88;margin-bottom:4px;font-size:20px;}h2{color:#ffdd00;margin:20px 0 10px;font-size:14px;}a{color:#00ff88;}input[type=file]{color:#aaa;padding:8px;border:1px solid #2a2a4a;background:#0a0a18;width:100%;margin-bottom:10px;font-size:16px;border-radius:4px;}button.go{background:#00ff88;color:#000;border:none;padding:12px 24px;font-family:monospace;font-size:15px;font-weight:bold;border-radius:6px;cursor:pointer;width:100%;margin-bottom:6px;}.note{color:#555;font-size:11px;line-height:1.6;margin-bottom:12px;}#msg{padding:10px;margin:8px 0;border-radius:4px;display:none;}.ok{background:#003300;color:#4f4;border:1px solid #4f4;}.er{background:#330000;color:#f44;border:1px solid #f44;}#prog{color:#aaa;font-size:12px;display:none;}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;}</style>",
    "<script src='https://cdnjs.cloudflare.com/ajax/libs/exif-js/2.3.0/exif.min.js'></script>",
    "</head><body>",
    "<h1>\uD83D\uDE97 Memory Lane</h1>",
    "<a href='/'>\u2190 back to game</a>",
    "<h2>Upload Photos</h2>",
    "<p class='note'>Select photos from your library. GPS location and date are read from the photo automatically before upload \u2014 nothing leaves your phone except the photo and its metadata.</p>",
    "<div id='msg'></div>",
    "<div id='prog'></div>",
    "<input type='file' id='fileInput' accept='image/*' multiple>",
    "<button class='go' onclick='upload()'>Upload Photos \u2191</button>",
    "<h2>Location Zones ("+clusters.length+")</h2>",
    clusters.length ? clusterSections : "<p style='color:#333;font-size:12px;'>No location zones yet. Upload photos with GPS data to create zones automatically.</p>",
    "<h2>Your Photos ("+photos.length+")</h2>",
    photos.length ? "<div class='grid'>"+photoGrid+"</div>" : "<p style='color:#333;font-size:12px;'>No photos uploaded yet.</p>",
    "<script>",
    "function msg(t,ok){const d=document.getElementById('msg');d.textContent=t;d.className=ok?'ok':'er';d.style.display='block';setTimeout(function(){d.style.display='none';},5000);}",
    "function prog(t){const d=document.getElementById('prog');d.textContent=t;d.style.display=t?'block':'none';}",
    "function getExif(file){return new Promise(function(resolve){",
    "  try{EXIF.getData(file,function(){",
    "    const lat=EXIF.getTag(this,'GPSLatitude');const latRef=EXIF.getTag(this,'GPSLatitudeRef');",
    "    const lng=EXIF.getTag(this,'GPSLongitude');const lngRef=EXIF.getTag(this,'GPSLongitudeRef');",
    "    const dt=EXIF.getTag(this,'DateTimeOriginal')||EXIF.getTag(this,'DateTime');",
    "    let latD=null,lngD=null;",
    "    if(lat&&lat.length===3){latD=lat[0]+lat[1]/60+lat[2]/3600;if(latRef==='S')latD=-latD;}",
    "    if(lng&&lng.length===3){lngD=lng[0]+lng[1]/60+lng[2]/3600;if(lngRef==='W')lngD=-lngD;}",
    "    resolve({lat:latD,lng:lngD,date_taken:dt||null});",
    "  });} catch(e){resolve({lat:null,lng:null,date_taken:null});}",
    "});}",
    "async function upload(){",
    "  const files=Array.from(document.getElementById('fileInput').files);",
    "  if(!files.length){msg('No files selected',false);return;}",
    "  let done=0,errors=0;",
    "  prog('Uploading 0 of '+files.length+'...');",
    "  for(const file of files){",
    "    try{",
    "      const exif=await getExif(file);",
    "      const form=new FormData();",
    "      form.append('file',file);form.append('name',file.name);",
    "      if(exif.lat!=null)form.append('lat',exif.lat);",
    "      if(exif.lng!=null)form.append('lng',exif.lng);",
    "      if(exif.date_taken)form.append('date_taken',exif.date_taken);",
    "      const r=await fetch('/admin/upload',{method:'POST',body:form});",
    "      const d=await r.json();",
    "      if(d.ok){done++;}else{errors++;console.error(d.error);}",
    "    }catch(e){errors++;console.error(e);}",
    "    prog('Uploaded '+done+' of '+files.length+'...');",
    "  }",
    "  prog('');",
    "  if(errors)msg('Uploaded '+done+', '+errors+' failed',done>0);",
    "  else msg('Uploaded '+done+' photo'+(done===1?'':'s')+'! Reload to see them.',true);",
    "}",
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
  const r2Key = R2_PREFIX + id + "_" + rawName;
  const url = "/photo/" + id;
  const buf = await file.arrayBuffer();
  await env.BUCKET.put(r2Key, buf, {httpMetadata:{contentType:file.type||"image/jpeg"}});
  const cluster = await resolveCluster(env, lat, lng);
  await env.DB.prepare("INSERT INTO photos (id,filename,r2_key,url,lat,lng,date_taken,cluster_id,cluster_name) VALUES (?,?,?,?,?,?,?,?,?)")
    .bind(id, rawName, r2Key, url, lat, lng, dateTaken, cluster.id, cluster.name).run();
  return j({ok:true, id, cluster_name:cluster.name});
}

async function apiPhoto(env, id) {
  const row = await env.DB.prepare("SELECT r2_key FROM photos WHERE id=?").bind(safe(id)).first();
  if (!row) return new Response("Not found",{status:404});
  const obj = await env.BUCKET.get(row.r2_key);
  if (!obj) return new Response("Not found",{status:404});
  const ct = obj.httpMetadata?.contentType || "image/jpeg";
  return new Response(obj.body,{headers:{"Content-Type":ct,"Cache-Control":"public, max-age=86400"}});
}

async function apiPhotos(env) {
  const res = await env.DB.prepare("SELECT id,filename,url,lat,lng,date_taken,cluster_name FROM photos ORDER BY uploaded_at DESC LIMIT 200").all();
  return j({ok:true, photos: res.results||[]});
}

async function apiClusters(env) {
  const res = await env.DB.prepare("SELECT * FROM clusters ORDER BY photo_count DESC").all();
  return j({ok:true, clusters: res.results||[]});
}

async function deletePhoto(env, id) {
  const row = await env.DB.prepare("SELECT r2_key FROM photos WHERE id=?").bind(safe(id)).first();
  if (row) await env.BUCKET.delete(row.r2_key);
  await env.DB.prepare("DELETE FROM photos WHERE id=?").bind(safe(id)).run();
  return j({ok:true});
}

// =================== ROUTER ===================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method==="OPTIONS") return new Response(null,{status:204,headers:CORS});
    if (path.startsWith("/photo/")) {
      const id = decodeURIComponent(path.slice(7));
      return apiPhoto(env, id);
    }
    if (path==="/admin" && method==="GET") {
      const [pr, cr] = await Promise.all([
        env.DB.prepare("SELECT id,filename,url,lat,lng,date_taken,cluster_name FROM photos ORDER BY uploaded_at DESC LIMIT 200").all(),
        env.DB.prepare("SELECT * FROM clusters ORDER BY photo_count DESC").all()
      ]);
      return new Response(buildAdminHTML(pr.results||[], cr.results||[]), {headers:{"Content-Type":"text/html;charset=UTF-8"}});
    }
    if (path==="/admin/upload" && method==="POST") return apiUpload(env, request);
    if (path.startsWith("/admin/photo/") && method==="DELETE") return deletePhoto(env, decodeURIComponent(path.slice(13)));
    if (path==="/api/photos") return apiPhotos(env);
    if (path==="/api/clusters") return apiClusters(env);
    if (path==="/health") return j({ok:true,worker:WORKER_NAME,version:VERSION});
    if (path==="/admin/setup" && method==="POST") {
      const results=[];
      for (const sql of SCHEMA) {
        try{await env.DB.prepare(sql).run();results.push({ok:true});}
        catch(e){results.push({ok:false,error:e.message});}
      }
      return j({ok:true,results});
    }
    if (path==="/"||path==="") {
      const [pr, cr] = await Promise.all([
        env.DB.prepare("SELECT id,filename,url,lat,lng,date_taken,cluster_name FROM photos ORDER BY RANDOM() LIMIT 200").all(),
        env.DB.prepare("SELECT * FROM clusters ORDER BY photo_count DESC").all()
      ]);
      return new Response(buildGameHTML(pr.results||[], cr.results||[]), {headers:{"Content-Type":"text/html;charset=UTF-8"}});
    }
    return j({error:"Not found"},404);
  }
};