const VERSION = "1.0.0";
const WORKER_NAME = "afo-heli-lane";
const R2_PREFIX = "memory-lane/photos/";
const CORS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,DELETE,OPTIONS","Access-Control-Allow-Headers":"Content-Type"};

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY, filename TEXT NOT NULL, r2_key TEXT NOT NULL, url TEXT NOT NULL, lat REAL, lng REAL, date_taken TEXT, cluster_id TEXT, cluster_name TEXT, uploaded_at TEXT DEFAULT (datetime('now')))",
  "CREATE TABLE IF NOT EXISTS clusters (id TEXT PRIMARY KEY, name TEXT NOT NULL, lat REAL NOT NULL, lng REAL NOT NULL, photo_count INTEGER DEFAULT 0)"
];

const ZONE_COLORS = ["#1a2a0a","#0a1a2a","#2a1a08","#0a2a1a","#1a0a2a","#2a2a0a","#0a1a1a","#1a1a2a"];
const TW=120,TH=90,GAP=18,COLS=5,STEP_X=138,STEP_Y=108,ZONE_PAD_X=260,ZONE_PAD_Y=200;

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

function layoutWorld(photos,clusters){
  const zmap={};
  clusters.forEach(function(c,i){const col=i%3,row=Math.floor(i/3);zmap[c.id]={x:col*(COLS*STEP_X+ZONE_PAD_X),y:row*(6*STEP_Y+ZONE_PAD_Y),name:c.name,ci:i%ZONE_COLORS.length,n:0};});
  zmap[null]={x:-(COLS*STEP_X+ZONE_PAD_X),y:0,name:"Unknown Location",ci:7,n:0};
  const placed=photos.map(function(p){
    const z=zmap[p.cluster_id]||zmap[null];
    const idx=z.n++;const col=idx%COLS,row=Math.floor(idx/COLS);
    return Object.assign({},p,{wx:z.x+30+col*STEP_X,wy:z.y+30+row*STEP_Y});
  });
  const zbounds={};
  placed.forEach(function(p){const k=p.cluster_id||"__none__";const z=zmap[p.cluster_id]||zmap[null];if(!zbounds[k])zbounds[k]={x:p.wx-20,y:p.wy-20,x2:p.wx+TW+20,y2:p.wy+TH+20,name:z.name,ci:z.ci};else{zbounds[k].x=Math.min(zbounds[k].x,p.wx-20);zbounds[k].y=Math.min(zbounds[k].y,p.wy-20);zbounds[k].x2=Math.max(zbounds[k].x2,p.wx+TW+20);zbounds[k].y2=Math.max(zbounds[k].y2,p.wy+TH+20);}});
  const startX=placed.length>0?placed[0].wx+60:0;
  const startY=placed.length>0?placed[0].wy+45:0;
  return{photos:placed,zones:Object.values(zbounds),startX,startY};
}

// =================== GAME SCRIPT ===================

function buildGameScript(layout){
  const L=[];
  L.push("const LAYOUT="+JSON.stringify(layout)+";");
  L.push("const ZONE_COLORS="+JSON.stringify(ZONE_COLORS)+";");
  L.push("const TW=120,TH=90;");
  L.push("const W=480,H=640;");
  L.push("let camX=LAYOUT.startX,camY=LAYOUT.startY;");
  L.push("let zoom=0.55;");
  L.push("let velX=0,velY=0;");
  L.push("let frame=0;");
  L.push("let gameState='menu';");
  L.push("let playerName='';");
  L.push("const photoImgs={};");
  L.push("let touchStartX=0,touchStartY=0,lastTouchX=0,lastTouchY=0;");
  L.push("let pinchDist0=0,isPinching=false,isTap=false,tapStartX=0,tapStartY=0;");

  L.push("const canvas=document.getElementById('gc');");
  L.push("const ctx=canvas.getContext('2d');");
  L.push("canvas.width=W;canvas.height=H;");

  L.push("function getImg(p){if(!photoImgs[p.id]){const img=new Image();img.crossOrigin='anonymous';img.src=p.url;photoImgs[p.id]=img;}return photoImgs[p.id];}");
  L.push("function screenToWorld(sx,sy){return{wx:(sx-W/2)/zoom+camX,wy:(sy-H/2)/zoom+camY};}");
  L.push("function viewBounds(){return{l:camX-W/(2*zoom),r:camX+W/(2*zoom),t:camY-H/(2*zoom),b:camY+H/(2*zoom)};}");
  L.push("function pdist(t1,t2){const dx=t1.clientX-t2.clientX,dy=t1.clientY-t2.clientY;return Math.sqrt(dx*dx+dy*dy);}");

  // World render
  L.push("function drawWorld(){");
  L.push("  ctx.save();ctx.translate(W/2,H/2);ctx.scale(zoom,zoom);ctx.translate(-camX,-camY);");
  // Terrain
  L.push("  const vb=viewBounds();");
  L.push("  ctx.fillStyle='#0a1a06';ctx.fillRect(vb.l-200,vb.t-200,vb.r-vb.l+400,vb.b-vb.t+400);");
  // Ground grid (subtle)
  L.push("  ctx.strokeStyle='rgba(255,255,255,0.03)';ctx.lineWidth=1;");
  L.push("  const gs=200;");
  L.push("  for(let gx=Math.floor(vb.l/gs)*gs;gx<vb.r+gs;gx+=gs){ctx.beginPath();ctx.moveTo(gx,vb.t-gs);ctx.lineTo(gx,vb.b+gs);ctx.stroke();}");
  L.push("  for(let gy=Math.floor(vb.t/gs)*gs;gy<vb.b+gs;gy+=gs){ctx.beginPath();ctx.moveTo(vb.l-gs,gy);ctx.lineTo(vb.r+gs,gy);ctx.stroke();}");
  // Zone areas
  L.push("  LAYOUT.zones.forEach(function(z){");
  L.push("    if(z.x2<vb.l||z.x>vb.r||z.y2<vb.t||z.y>vb.b) return;");
  L.push("    const col=ZONE_COLORS[z.ci]||'#1a2a0a';");
  L.push("    ctx.fillStyle=col;ctx.fillRect(z.x,z.y,z.x2-z.x,z.y2-z.y);");
  L.push("    ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;ctx.strokeRect(z.x,z.y,z.x2-z.x,z.y2-z.y);");
  // Zone label
  L.push("    const labelSize=Math.max(10,Math.min(28,18/zoom));");
  L.push("    if(1/zoom>30) return;");
  L.push("    ctx.fillStyle='rgba(255,255,255,0.12)';ctx.font='bold '+labelSize+'px monospace';ctx.textAlign='center';");
  L.push("    ctx.fillText('\uD83D\uDCCD '+z.name,(z.x+z.x2)/2,(z.y+z.y2)/2);ctx.textAlign='left';");
  L.push("  });");
  // Photo tiles
  L.push("  LAYOUT.photos.forEach(function(p){");
  L.push("    if(p.wx+TW<vb.l||p.wx>vb.r||p.wy+TH<vb.t||p.wy>vb.b) return;");
  L.push("    const img=getImg(p);");
  // Shadow
  L.push("    ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(p.wx+4,p.wy+4,TW,TH);");
  // Frame
  L.push("    ctx.fillStyle='#0a0a0a';ctx.fillRect(p.wx-3,p.wy-3,TW+6,TH+6);");
  L.push("    ctx.fillStyle='#1a1a1a';ctx.fillRect(p.wx-2,p.wy-2,TW+4,TH+4);");
  // Photo
  L.push("    if(img.complete&&img.naturalWidth>0){");
  L.push("      ctx.save();ctx.beginPath();ctx.rect(p.wx,p.wy,TW,TH);ctx.clip();");
  L.push("      ctx.drawImage(img,p.wx,p.wy,TW,TH);ctx.restore();");
  L.push("    } else {");
  L.push("      ctx.fillStyle='#1a2a3a';ctx.fillRect(p.wx,p.wy,TW,TH);");
  L.push("      ctx.fillStyle='#2a3a4a';ctx.font='24px serif';ctx.textAlign='center';");
  L.push("      ctx.fillText('\uD83D\uDDBC\uFE0F',p.wx+TW/2,p.wy+TH/2+8);ctx.textAlign='left';");
  L.push("    }");
  // Date label when zoomed in
  L.push("    if(zoom>0.9&&p.date_taken){");
  L.push("      ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(p.wx,p.wy+TH-14,TW,14);");
  L.push("      ctx.fillStyle='#ccc';ctx.font='9px monospace';");
  L.push("      ctx.fillText(p.date_taken.slice(0,10),p.wx+3,p.wy+TH-3);");
  L.push("    }");
  L.push("  });");
  L.push("  ctx.restore();");
  L.push("}");

  // Helicopter
  L.push("function drawHelicopter(){");
  // Shadow on world (at world center = screen center)
  L.push("  ctx.fillStyle='rgba(0,0,0,0.25)';");
  L.push("  ctx.beginPath();ctx.ellipse(W/2+4,H/2+6,28*zoom,18*zoom,0,0,Math.PI*2);ctx.fill();");
  // Rotor blur
  L.push("  ctx.save();ctx.translate(W/2,H/2-18);ctx.rotate(frame*0.22);");
  L.push("  ctx.strokeStyle='rgba(180,180,180,0.5)';ctx.lineWidth=3;");
  L.push("  ctx.beginPath();ctx.moveTo(-26,0);ctx.lineTo(26,0);ctx.stroke();");
  L.push("  ctx.rotate(Math.PI/2);");
  L.push("  ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(18,0);ctx.stroke();");
  L.push("  ctx.restore();");
  // Body
  L.push("  ctx.save();");
  // Tilt slightly in direction of movement
  L.push("  const tiltX=Math.max(-0.12,Math.min(0.12,velX*0.008));");
  L.push("  const tiltY=Math.max(-0.08,Math.min(0.08,velY*0.006));");
  L.push("  ctx.translate(W/2,H/2);ctx.transform(1,tiltY,tiltX,1,0,0);");
  L.push("  ctx.font='38px serif';ctx.textAlign='center';");
  L.push("  ctx.fillText('\uD83D\uDE81',0,12);");
  L.push("  ctx.restore();");
  L.push("}");

  // HUD
  L.push("function drawHUD(){");
  L.push("  ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,W,34);");
  L.push("  ctx.fillStyle='#aaa';ctx.font='12px monospace';");
  L.push("  ctx.fillText('\uD83D\uDDBC\uFE0F '+LAYOUT.photos.length+' photos',8,21);");
  L.push("  ctx.fillStyle='#888';ctx.textAlign='center';");
  L.push("  ctx.fillText('ALT '+(1/zoom*100).toFixed(0)+'m',W/2,21);");
  L.push("  ctx.textAlign='right';ctx.fillStyle='#888';");
  L.push("  ctx.fillText(Math.round(camX)+', '+Math.round(camY),W-8,21);ctx.textAlign='left';");
  // Zoom hint at bottom
  L.push("  ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(0,H-28,W,28);");
  L.push("  ctx.fillStyle='#444';ctx.font='11px monospace';ctx.textAlign='center';");
  L.push("  ctx.fillText('drag to fly  \u00B7  pinch to zoom  \u00B7  tap photo to view',W/2,H-10);ctx.textAlign='left';");
  L.push("}");

  // Menu backdrop
  L.push("function drawMenuBg(){");
  L.push("  ctx.fillStyle='#040c02';ctx.fillRect(0,0,W,H);");
  // Decorative mini world preview
  L.push("  ctx.save();ctx.globalAlpha=0.15;ctx.translate(W/2,H/2);ctx.scale(0.08,0.08);ctx.translate(-camX,-camY);");
  L.push("  LAYOUT.zones.forEach(function(z){ctx.fillStyle=ZONE_COLORS[z.ci]||'#1a2a0a';ctx.fillRect(z.x,z.y,z.x2-z.x,z.y2-z.y);});");
  L.push("  LAYOUT.photos.forEach(function(p){ctx.fillStyle='#2a3a4a';ctx.fillRect(p.wx,p.wy,TW,TH);});");
  L.push("  ctx.restore();ctx.globalAlpha=1;");
  L.push("  ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,W,H);");
  // Title
  L.push("  ctx.fillStyle='#00ff88';ctx.font='bold 26px monospace';ctx.textAlign='center';");
  L.push("  ctx.fillText('\uD83D\uDE81 HELI LANE',W/2,80);");
  L.push("  ctx.fillStyle='#4488aa';ctx.font='13px monospace';");
  L.push("  ctx.fillText('fly over your memories',W/2,104);ctx.textAlign='left';");
  L.push("  if(LAYOUT.photos.length>0){");
  L.push("    ctx.fillStyle='rgba(0,255,136,0.1)';ctx.fillRect(W/2-85,116,170,28);");
  L.push("    ctx.strokeStyle='#00ff88';ctx.lineWidth=1;ctx.strokeRect(W/2-85,116,170,28);");
  L.push("    ctx.fillStyle='#00ff88';ctx.font='12px monospace';ctx.textAlign='center';");
  L.push("    ctx.fillText(LAYOUT.photos.length+' photos in '+LAYOUT.zones.length+' zones',W/2,134);ctx.textAlign='left';");
  L.push("  } else {");
  L.push("    ctx.fillStyle='#555';ctx.font='12px monospace';ctx.textAlign='center';");
  L.push("    ctx.fillText('upload photos at /admin to begin',W/2,134);ctx.textAlign='left';");
  L.push("  }");
  L.push("}");

  // Photo overlay
  L.push("function openPhoto(p){");
  L.push("  const ov=document.getElementById('ov');if(!ov)return;");
  L.push("  document.getElementById('ovImg').src=p.url;");
  L.push("  const parts=[];if(p.filename)parts.push(p.filename);if(p.date_taken)parts.push(p.date_taken.slice(0,10));if(p.cluster_name)parts.push('\uD83D\uDCCD '+p.cluster_name);");
  L.push("  document.getElementById('ovMeta').textContent=parts.join('  \u00B7  ');");
  L.push("  ov.style.display='flex';");
  L.push("}");
  L.push("function closePhoto(){const ov=document.getElementById('ov');if(ov)ov.style.display='none';}");

  // Tap check
  L.push("function checkTap(sx,sy){");
  L.push("  if(gameState!=='flying') return;");
  L.push("  const w=screenToWorld(sx,sy);");
  L.push("  const hit=LAYOUT.photos.find(function(p){return w.wx>=p.wx&&w.wx<=p.wx+TW&&w.wy>=p.wy&&w.wy<=p.wy+TH;});");
  L.push("  if(hit) openPhoto(hit);");
  L.push("}");

  // Fly to zone (used by zone list buttons)
  L.push("function flyTo(zoneIdx){");
  L.push("  const z=LAYOUT.zones[zoneIdx];if(!z) return;");
  L.push("  camX=(z.x+z.x2)/2;camY=(z.y+z.y2)/2;");
  L.push("  zoom=Math.min(0.6,480/(z.x2-z.x+100));");
  L.push("  velX=0;velY=0;");
  L.push("}");

  // Start flying
  L.push("function startFlying(){");
  L.push("  const inp=document.getElementById('nameInput');");
  L.push("  if(inp) playerName=inp.value.trim()||'Pilot';");
  L.push("  if(LAYOUT.photos.length===0){alert('Upload photos at /admin first');return;}");
  L.push("  gameState='flying';");
  L.push("  document.getElementById('menuUI').style.display='none';");
  L.push("  document.getElementById('flyUI').style.display='flex';");
  L.push("  zoom=0.55;camX=LAYOUT.startX;camY=LAYOUT.startY;");
  L.push("}");

  // Input - touch drag + pinch
  L.push("const rect_fn=function(){return canvas.getBoundingClientRect();};");
  L.push("canvas.addEventListener('touchstart',function(e){");
  L.push("  e.preventDefault();");
  L.push("  if(e.touches.length===2){isPinching=true;pinchDist0=pdist(e.touches[0],e.touches[1]);velX=0;velY=0;return;}");
  L.push("  isPinching=false;");
  L.push("  const rect=rect_fn(),t=e.touches[0];");
  L.push("  const sx=(t.clientX-rect.left)*(W/rect.width);");
  L.push("  const sy=(t.clientY-rect.top)*(H/rect.height);");
  L.push("  touchStartX=sx;touchStartY=sy;lastTouchX=sx;lastTouchY=sy;");
  L.push("  tapStartX=sx;tapStartY=sy;isTap=true;");
  L.push("  velX=0;velY=0;");
  L.push("},{passive:false});");

  L.push("canvas.addEventListener('touchmove',function(e){");
  L.push("  e.preventDefault();");
  L.push("  if(e.touches.length===2){");
  L.push("    const d=pdist(e.touches[0],e.touches[1]);");
  L.push("    const delta=d/pinchDist0;");
  L.push("    zoom=Math.max(0.12,Math.min(2.5,zoom*delta));");
  L.push("    pinchDist0=d;isPinching=true;isTap=false;return;");
  L.push("  }");
  L.push("  if(isPinching) return;");
  L.push("  const rect=rect_fn(),t=e.touches[0];");
  L.push("  const sx=(t.clientX-rect.left)*(W/rect.width);");
  L.push("  const sy=(t.clientY-rect.top)*(H/rect.height);");
  L.push("  const dx=sx-lastTouchX,dy=sy-lastTouchY;");
  L.push("  camX-=dx/zoom;camY-=dy/zoom;");
  L.push("  velX=-dx/zoom*0.8;velY=-dy/zoom*0.8;");
  L.push("  lastTouchX=sx;lastTouchY=sy;");
  L.push("  if(Math.abs(sx-tapStartX)>8||Math.abs(sy-tapStartY)>8) isTap=false;");
  L.push("},{passive:false});");

  L.push("canvas.addEventListener('touchend',function(e){");
  L.push("  e.preventDefault();");
  L.push("  if(isTap){const rect=rect_fn(),t=e.changedTouches[0];const sx=(t.clientX-rect.left)*(W/rect.width),sy=(t.clientY-rect.top)*(H/rect.height);checkTap(sx,sy);}");
  L.push("  isPinching=false;isTap=false;");
  L.push("},{passive:false});");

  // Mouse (desktop)
  L.push("let mouseDown=false,mouseX=0,mouseY=0;");
  L.push("canvas.addEventListener('mousedown',function(e){mouseDown=true;mouseX=e.clientX;mouseY=e.clientY;velX=0;velY=0;isTap=true;tapStartX=e.clientX;tapStartY=e.clientY;});");
  L.push("canvas.addEventListener('mousemove',function(e){if(!mouseDown)return;const rect=rect_fn();const dx=(e.clientX-mouseX)*(W/rect.width),dy=(e.clientY-mouseY)*(H/rect.height);camX-=dx/zoom;camY-=dy/zoom;velX=-dx/zoom*0.8;velY=-dy/zoom*0.8;mouseX=e.clientX;mouseY=e.clientY;if(Math.abs(e.clientX-tapStartX)>5||Math.abs(e.clientY-tapStartY)>5)isTap=false;});");
  L.push("canvas.addEventListener('mouseup',function(e){if(isTap){const rect=rect_fn();checkTap((e.clientX-rect.left)*(W/rect.width),(e.clientY-rect.top)*(H/rect.height));}mouseDown=false;isTap=false;});");
  L.push("canvas.addEventListener('wheel',function(e){e.preventDefault();zoom=Math.max(0.12,Math.min(2.5,zoom*(e.deltaY<0?1.1:0.9)));},{passive:false});");

  // Preload visible images
  L.push("function preloadVisible(){const vb=viewBounds();LAYOUT.photos.forEach(function(p){if(p.wx+TW>=vb.l&&p.wx<=vb.r&&p.wy+TH>=vb.t&&p.wy<=vb.b)getImg(p);});}");

  // Zoom buttons
  L.push("function zoomIn(){zoom=Math.min(2.5,zoom*1.3);}");
  L.push("function zoomOut(){zoom=Math.max(0.12,zoom*0.77);}");

  // Update
  L.push("function update(){");
  L.push("  if(gameState!=='flying') return;");
  L.push("  frame++;");
  L.push("  if(!mouseDown&&!isPinching){camX+=velX;camY+=velY;velX*=0.88;velY*=0.88;}");
  L.push("  if(frame%6===0) preloadVisible();");
  L.push("}");

  // Draw
  L.push("function drawFrame(){");
  L.push("  if(gameState==='menu'){drawMenuBg();return;}");
  L.push("  drawWorld();drawHelicopter();drawHUD();");
  L.push("}");

  L.push("function loop(){update();drawFrame();requestAnimationFrame(loop);}");
  L.push("loop();");

  return L.join("\n");
}

// =================== HTML ===================

function buildGameHTML(layout) {
  const script = buildGameScript(layout);
  const zoneButtons = layout.zones.slice(0,8).map(function(z,i) {
    return "<button class='zBtn' onclick='flyTo("+i+")'>\uD83D\uDCCD "+safe(z.name.slice(0,14))+"</button>";
  }).join("");
  const parts = [
    "<!DOCTYPE html>",
    "<html lang='en'><head>",
    "<meta charset='UTF-8'>",
    "<meta name='viewport' content='width=device-width,initial-scale=1,user-scalable=no,viewport-fit=cover'>",
    "<title>Heli Lane</title>",
    "<style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#040c02;display:flex;flex-direction:column;align-items:center;min-height:100vh;min-height:100dvh;font-family:monospace;overflow:hidden;padding-top:env(safe-area-inset-top);}#wrap{position:relative;width:100%;max-width:480px;}canvas{display:block;touch-action:none;width:100%;height:auto;}#menuUI{width:100%;max-width:480px;background:#000;border-top:1px solid #0a1a0a;padding:10px 12px;display:flex;flex-direction:column;gap:8px;}#nameInput{background:#040c02;border:1px solid #1a2a1a;color:#fff;font-family:monospace;font-size:16px;padding:10px 12px;border-radius:6px;outline:none;-webkit-appearance:none;}#nameInput:focus{border-color:#00ff88;}#startBtn{background:#00ff88;color:#000;border:none;padding:12px;font-family:monospace;font-size:16px;font-weight:bold;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;}#flyUI{width:100%;max-width:480px;background:#000;border-top:1px solid #0a1a0a;padding:6px 10px;display:none;flex-direction:column;gap:6px;}.zoneRow{display:flex;gap:5px;overflow-x:auto;padding:2px 0;}.zBtn{background:#040c02;border:1px solid #1a2a1a;color:#aaa;padding:6px 10px;border-radius:5px;cursor:pointer;white-space:nowrap;font-family:monospace;font-size:11px;-webkit-tap-highlight-color:transparent;}.zBtn:active{background:#0a1a0a;}.zoomRow{display:flex;gap:6px;align-items:center;justify-content:flex-end;}.zoomBtn{background:#040c02;color:#aaa;border:1px solid #1a2a1a;font-size:18px;padding:6px 14px;border-radius:5px;cursor:pointer;-webkit-tap-highlight-color:transparent;font-family:monospace;}.zoomBtn:active{background:#0a1a0a;}.zoomLbl{color:#444;font-size:11px;flex:1;}#adminLink{color:#222;font-size:10px;padding:3px;text-align:center;width:100%;max-width:480px;}#adminLink a{color:#222;}#ov{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);z-index:200;flex-direction:column;align-items:center;justify-content:center;padding:20px;}#ovImg{max-width:100%;max-height:72vh;object-fit:contain;border-radius:4px;}#ovMeta{color:#888;font-size:11px;text-align:center;margin-top:10px;line-height:1.8;}#ovClose{margin-top:14px;padding:12px 36px;background:#00ff88;color:#000;border:none;font-family:monospace;font-size:15px;font-weight:bold;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;}</style>",
    "</head><body>",
    "<div id='wrap'><canvas id='gc'></canvas></div>",
    "<div id='menuUI'>",
    "  <input type='text' id='nameInput' placeholder='your name (optional)' maxlength='20' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false'>",
    "  <button id='startBtn' onclick='startFlying()'>TAKE OFF \uD83D\uDE81</button>",
    "</div>",
    "<div id='flyUI'>",
    "  <div class='zoneRow'>"+zoneButtons+"</div>",
    "  <div class='zoomRow'>",
    "    <span class='zoomLbl'>tap zones to fly there</span>",
    "    <button class='zoomBtn' onclick='zoomOut()'>-</button>",
    "    <button class='zoomBtn' onclick='zoomIn()'>+</button>",
    "  </div>",
    "</div>",
    "<div id='adminLink'><a href='/admin'>upload photos</a></div>",
    "<div id='ov'>",
    "  <img id='ovImg' src='' alt='photo'>",
    "  <div id='ovMeta'></div>",
    "  <button id='ovClose' onclick='closePhoto()'>\u2190 back to world</button>",
    "</div>",
    "<script>",
    script,
    "</script>",
    "</body></html>"
  ];
  return parts.join("\n");
}

// =================== ADMIN (batch upload) ===================

function buildAdminHTML(photos, clusters) {
  const clusterSection = clusters.map(function(c) {
    return "<div style='background:#040c02;border:1px solid #1a2a1a;border-radius:5px;padding:8px;'><div style='color:#ffdd00;font-size:12px;'>\uD83D\uDCCD "+safe(c.name)+"</div><div style='color:#444;font-size:11px;'>"+c.photo_count+" photos</div></div>";
  }).join("");
  const photoGrid = photos.slice(0,60).map(function(p) {
    return "<div style='aspect-ratio:1;background:#040c02;border-radius:3px;overflow:hidden;position:relative;'><img src='"+safe(p.url)+"' style='width:100%;height:100%;object-fit:cover;' loading='lazy'>"+(p.cluster_name?"<div style='position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.8);color:#ffdd00;font-size:7px;padding:1px 3px;overflow:hidden;white-space:nowrap;'>\uD83D\uDCCD "+safe(p.cluster_name)+"</div>":"")+"</div>";
  }).join("");
  const parts = [
    "<!DOCTYPE html>",
    "<html lang='en'><head>",
    "<meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'>",
    "<title>Heli Lane \u2014 Upload</title>",
    "<style>body{background:#040c02;color:#aaa;font-family:monospace;padding:20px;max-width:600px;margin:0 auto;}h1{color:#00ff88;font-size:20px;margin-bottom:4px;}h2{color:#ffdd00;margin:18px 0 8px;font-size:13px;}a{color:#00ff88;}input[type=file]{color:#aaa;padding:8px;border:1px solid #1a2a1a;background:#000;width:100%;margin-bottom:8px;font-size:16px;border-radius:4px;}button.go{background:#00ff88;color:#000;border:none;padding:12px 24px;font-family:monospace;font-size:15px;font-weight:bold;border-radius:6px;cursor:pointer;width:100%;margin-bottom:6px;}.note{color:#444;font-size:11px;line-height:1.6;margin-bottom:10px;}#msg{padding:10px;margin:6px 0;border-radius:4px;display:none;}.ok{background:#003300;color:#4f4;border:1px solid #4f4;}.er{background:#330000;color:#f44;border:1px solid #f44;}#progWrap{display:none;background:#111;border-radius:4px;overflow:hidden;margin:6px 0;height:8px;}#progBar{height:100%;background:#00ff88;width:0%;transition:width 0.2s;}#progLabel{color:#666;font-size:11px;margin-bottom:6px;display:none;}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;}.clusters{display:flex;flex-wrap:wrap;gap:6px;}</style>",
    "<script src='https://cdnjs.cloudflare.com/ajax/libs/exif-js/2.3.0/exif.min.js'></script>",
    "</head><body>",
    "<h1>\uD83D\uDE81 Heli Lane</h1>",
    "<a href='/'>\u2190 back to game</a>",
    "<h2>Upload Photos</h2>",
    "<p class='note'>Select up to 100 photos at once. GPS and date are extracted from each photo automatically on your device before upload. Photos are shared with the Memory Lane road game too.</p>",
    "<div id='msg'></div>",
    "<div id='progLabel'></div>",
    "<div id='progWrap'><div id='progBar'></div></div>",
    "<input type='file' id='fileInput' accept='image/*' multiple>",
    "<button class='go' onclick='upload()'>Upload Photos \u2191</button>",
    "<h2>Location Zones ("+clusters.length+")</h2>",
    clusters.length ? "<div class='clusters'>"+clusterSection+"</div>" : "<p style='color:#333;font-size:12px;'>None yet \u2014 upload photos with GPS data.</p>",
    "<h2>Photos ("+photos.length+")</h2>",
    photos.length ? "<div class='grid'>"+photoGrid+"</div>" : "<p style='color:#333;font-size:12px;'>None uploaded yet.</p>",
    "<script>",
    "function msg(t,ok){const d=document.getElementById('msg');d.textContent=t;d.className=ok?'ok':'er';d.style.display='block';setTimeout(function(){d.style.display='none';},6000);}",
    "function setProgress(done,total){const pct=total?Math.round(done/total*100):0;document.getElementById('progBar').style.width=pct+'%';document.getElementById('progLabel').textContent='Uploading '+done+' / '+total+' \u2014 '+pct+'%';document.getElementById('progWrap').style.display=total?'block':'none';document.getElementById('progLabel').style.display=total?'block':'none';}",
    "function getExif(file){return new Promise(function(resolve){try{EXIF.getData(file,function(){const la=EXIF.getTag(this,'GPSLatitude'),laR=EXIF.getTag(this,'GPSLatitudeRef'),lo=EXIF.getTag(this,'GPSLongitude'),loR=EXIF.getTag(this,'GPSLongitudeRef'),dt=EXIF.getTag(this,'DateTimeOriginal')||EXIF.getTag(this,'DateTime');let lat=null,lng=null;if(la&&la.length===3){lat=la[0]+la[1]/60+la[2]/3600;if(laR==='S')lat=-lat;}if(lo&&lo.length===3){lng=lo[0]+lo[1]/60+lo[2]/3600;if(loR==='W')lng=-lng;}resolve({lat,lng,date_taken:dt||null});});}catch(e){resolve({lat:null,lng:null,date_taken:null});}});}",
    "async function uploadOne(file){const exif=await getExif(file);const form=new FormData();form.append('file',file);form.append('name',file.name);if(exif.lat!=null)form.append('lat',exif.lat);if(exif.lng!=null)form.append('lng',exif.lng);if(exif.date_taken)form.append('date_taken',exif.date_taken);const r=await fetch('/admin/upload',{method:'POST',body:form});return r.json();}",
    "async function uploadBatch(files,concurrency){let done=0,errors=0;const total=files.length;const queue=Array.from(files);async function worker(){while(queue.length>0){const f=queue.shift();try{const d=await uploadOne(f);if(d.ok)done++;else errors++;}catch(e){errors++;}done+errors>0&&setProgress(done+errors,total);}}await Promise.all(Array.from({length:Math.min(concurrency,total)},worker));return{done,errors};}",
    "async function upload(){const files=document.getElementById('fileInput').files;if(!files.length){msg('No files selected',false);return;}const btn=document.querySelector('button.go');btn.disabled=true;btn.textContent='Uploading...';setProgress(0,files.length);try{const{done,errors}=await uploadBatch(files,5);setProgress(0,0);if(errors)msg('Uploaded '+done+', '+errors+' failed',done>0);else msg('Uploaded '+done+' photo'+(done===1?'':'s')+'! Refresh page or game to see them.',true);}catch(e){msg('Upload error: '+e,false);}finally{btn.disabled=false;btn.textContent='Upload Photos \u2191';}}",
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
  const cluster = await resolveCluster(env, lat, lng);
  await env.DB.prepare("INSERT INTO photos (id,filename,r2_key,url,lat,lng,date_taken,cluster_id,cluster_name) VALUES (?,?,?,?,?,?,?,?,?)")
    .bind(id,rawName,r2Key,url,lat,lng,dateTaken,cluster.id,cluster.name).run();
  return j({ok:true,id,cluster_name:cluster.name});
}

async function apiPhoto(env, id) {
  const row = await env.DB.prepare("SELECT r2_key FROM photos WHERE id=?").bind(safe(id)).first();
  if (!row) return new Response("Not found",{status:404});
  const obj = await env.BUCKET.get(row.r2_key);
  if (!obj) return new Response("Not found",{status:404});
  return new Response(obj.body,{headers:{"Content-Type":obj.httpMetadata?.contentType||"image/jpeg","Cache-Control":"public, max-age=86400"}});
}

// =================== ROUTER ===================

export default {
  async fetch(request, env) {
    const url = new URL(request.url), path = url.pathname, method = request.method;
    if (method==="OPTIONS") return new Response(null,{status:204,headers:CORS});
    if (path.startsWith("/photo/")) return apiPhoto(env, decodeURIComponent(path.slice(7)));
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
      const layout = layoutWorld(pr.results||[], cr.results||[]);
      return new Response(buildGameHTML(layout), {headers:{"Content-Type":"text/html;charset=UTF-8"}});
    }
    return j({error:"Not found"},404);
  }
};