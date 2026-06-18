const VERSION = "1.0.0";
const WORKER_NAME = "afo-space-shooter";
const R2_PREFIX = "space-shooter/sprites/";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const GUNS = [
  { id: "laser",    name: "Laser",       emoji: "⚡", damage: 10,   fireRate: 220,  speed: 9, spread: 0, unlockWave: 0,  cost: 0,    color: "#00ff88", desc: "Fast single shot" },
  { id: "spread",   name: "Spread",      emoji: "🌟", damage: 8,    fireRate: 380,  speed: 7, spread: 3, unlockWave: 2,  cost: 150,  color: "#ffaa00", desc: "3 shots wide" },
  { id: "plasma",   name: "Plasma",      emoji: "💜", damage: 50,   fireRate: 950,  speed: 5, spread: 0, unlockWave: 4,  cost: 300,  color: "#ff00ff", desc: "Massive slow shot" },
  { id: "rocket",   name: "Rocket",      emoji: "🚀", damage: 38,   fireRate: 1400, speed: 4, spread: 0, unlockWave: 6,  cost: 500,  color: "#ff4400", desc: "Splash damage" },
  { id: "lightning",name: "Lightning",   emoji: "🌩", damage: 22,   fireRate: 280,  speed: 10,spread: 0, unlockWave: 8,  cost: 800,  color: "#aaffff", desc: "Chains to nearby enemies" },
  { id: "railgun",  name: "Railgun",     emoji: "🔵", damage: 90,   fireRate: 1800, speed: 16,spread: 0, unlockWave: 10, cost: 1200, color: "#ffffff", desc: "Pierces all enemies" },
  { id: "blackhole",name: "Black Hole",  emoji: "🌀", damage: 12,   fireRate: 4000, speed: 3, spread: 0, unlockWave: 12, cost: 2000, color: "#9933ff", desc: "Pulls enemies to impact" },
  { id: "pixelnuke",name: "Pixel Nuke",  emoji: "☢️", damage: 9999, fireRate: 12000,speed: 1, spread: 0, unlockWave: 15, cost: 5000, color: "#ff0000", desc: "Deletes entire screen" }
];

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, player_name TEXT NOT NULL, score INTEGER DEFAULT 0, wave_reached INTEGER DEFAULT 0, duration_ms INTEGER DEFAULT 0, credits_earned INTEGER DEFAULT 0, credits_wasted INTEGER DEFAULT 0, started_at TEXT DEFAULT (datetime('now')), ended_at TEXT, cause_of_death TEXT DEFAULT 'unknown')",
  "CREATE TABLE IF NOT EXISTS gun_stats (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL, gun_type TEXT NOT NULL, shots_fired INTEGER DEFAULT 0, shots_hit INTEGER DEFAULT 0, damage_dealt REAL DEFAULT 0, kills INTEGER DEFAULT 0, UNIQUE(session_id, gun_type))",
  "CREATE TABLE IF NOT EXISTS enemy_kills (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL, enemy_type TEXT NOT NULL, kill_count INTEGER DEFAULT 0, UNIQUE(session_id, enemy_type))",
  "CREATE TABLE IF NOT EXISTS upgrade_log (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL, gun_id TEXT NOT NULL, cost INTEGER NOT NULL, wave_number INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS weird_stats (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL, stat_name TEXT NOT NULL, stat_value REAL NOT NULL)",
  "CREATE TABLE IF NOT EXISTS leaderboard (id INTEGER PRIMARY KEY AUTOINCREMENT, player_name TEXT NOT NULL, score INTEGER NOT NULL, wave_reached INTEGER NOT NULL, duration_ms INTEGER NOT NULL, achieved_at TEXT DEFAULT (datetime('now')), session_id TEXT UNIQUE)",
  "CREATE INDEX IF NOT EXISTS idx_lb_score ON leaderboard(score DESC)"
];

function j(v, s = 200) { return Response.json(v, { status: s, headers: CORS }); }
function uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36); }
function safe(v) { return String(v || "").replace(/[<>"']/g, ""); }

function buildGameScript(sprites) {
  const L = [];
  L.push("const SPRITES = " + JSON.stringify(sprites) + ";");
  L.push("const GUNS = " + JSON.stringify(GUNS) + ";");
  L.push("const W = 480, H = 640;");
  L.push("let sessionId=null, playerName='', gameState='menu';");
  L.push("let score=0, wave=0, playerHP=100, maxHP=100, credits=0;");
  L.push("let playerX=220, playerY=570;");
  L.push("let currentGunIdx=0, unlockedGuns=['laser'];");
  L.push("let lastShot=0, autoFire=true;");
  L.push("let bullets=[], enemies=[], particles=[], stars=[];");
  L.push("let enemyImgs={}, spriteKeys=[];");
  L.push("let enemyDir=1, shopItems=[];");
  L.push("let waveActive=false, showShop=false;");
  L.push("let gameStartTime=0;");
  L.push("let keys={}, touchStartX=null, typingName=false;");
  L.push("let leaderboardData=[];");
  L.push("let stats={pixelsMoved:0,panicShots:0,gunSwitches:0,longestCombo:0,combo:0,nearMisses:0,totalShots:0,totalHits:0,shotsMissed:0,bossKills:0,consecutiveWavesClean:0,cleanThisWave:true,upgradeRegrets:0,lastGunBefore:null,timeSinceLastShot:0};");
  L.push("let gunStats={}, enemyKills={}, upgradeLog=[];");
  L.push("const canvas=document.getElementById('gc');");
  L.push("const ctx=canvas.getContext('2d');");
  L.push("canvas.width=W; canvas.height=H;");
  L.push("for(let i=0;i<70;i++) stars.push({x:Math.random()*W, y:Math.random()*H, s:Math.random()*1.5+0.3, spd:Math.random()*0.5+0.2});");
  L.push("function loadSprites(){");
  L.push("  const keys=Object.keys(sprites);");
  L.push("  spriteKeys=keys;");
  L.push("  keys.forEach(function(k){");
  L.push("    const img=new Image();");
  L.push("    img.src=sprites[k];");
  L.push("    enemyImgs[k]=img;");
  L.push("  });");
  L.push("}");
  L.push("const FALLBACK=['👾','🛸','💀','🤖','👹','👻','🦾','😈','👽','🐙'];");
  L.push("function getTypes(){ return spriteKeys.length>0?spriteKeys:FALLBACK; }");
  L.push("function gun(){ return GUNS.find(function(g){return g.id===unlockedGuns[currentGunIdx];})||GUNS[0]; }");
  L.push("function text(t,x,y,sz,col,align){");
  L.push("  ctx.save(); ctx.fillStyle=col||'#fff'; ctx.font=(sz||16)+'px monospace';");
  L.push("  ctx.textAlign=align||'left'; ctx.fillText(t,x,y); ctx.restore();");
  L.push("}");
  L.push("function drawPlayer(){");
  L.push("  ctx.save(); ctx.font='38px serif'; ctx.textAlign='center';");
  L.push("  ctx.fillText('🚀',playerX+20,playerY+36); ctx.restore();");
  L.push("}");
  L.push("function drawEnemy(e){");
  L.push("  const img=enemyImgs[e.type];");
  L.push("  if(img&&img.complete&&img.naturalWidth>0){");
  L.push("    ctx.drawImage(img,e.x,e.y,e.w,e.h);");
  L.push("  } else {");
  L.push("    ctx.save(); ctx.font=Math.round(e.w*0.82)+'px serif'; ctx.textAlign='center';");
  L.push("    ctx.fillText(e.type,e.x+e.w/2,e.y+e.h*0.85); ctx.restore();");
  L.push("  }");
  L.push("  if(e.hp<e.maxHp){");
  L.push("    ctx.fillStyle='#222'; ctx.fillRect(e.x,e.y-7,e.w,5);");
  L.push("    const pct=e.hp/e.maxHp;");
  L.push("    ctx.fillStyle=pct>0.5?'#4f4':'#f44'; ctx.fillRect(e.x,e.y-7,e.w*pct,5);");
  L.push("  }");
  L.push("  if(e.isBoss){");
  L.push("    ctx.strokeStyle='#ff4400'; ctx.lineWidth=2; ctx.strokeRect(e.x-2,e.y-2,e.w+4,e.h+4); ctx.lineWidth=1;");
  L.push("  }");
  L.push("}");
  L.push("function drawBullet(b){");
  L.push("  const g=GUNS.find(function(x){return x.id===b.gun;})||GUNS[0];");
  L.push("  if(b.gun==='rocket'||b.gun==='blackhole'){");
  L.push("    ctx.save(); ctx.font='16px serif'; ctx.textAlign='center';");
  L.push("    ctx.fillText(b.gun==='rocket'?'🚀':'🌀',b.x+4,b.y+12); ctx.restore();");
  L.push("  } else if(b.gun==='pixelnuke'){");
  L.push("    ctx.save(); ctx.font='20px serif'; ctx.textAlign='center';");
  L.push("    ctx.fillText('☢️',b.x+4,b.y+14); ctx.restore();");
  L.push("  } else {");
  L.push("    ctx.fillStyle=g.color; ctx.fillRect(b.x,b.y,b.w||4,b.h||14);");
  L.push("  }");
  L.push("}");
  L.push("function drawParticle(p){");
  L.push("  ctx.globalAlpha=p.life/p.maxLife;");
  L.push("  ctx.fillStyle=p.color; ctx.fillRect(p.x,p.y,p.sz,p.sz);");
  L.push("  ctx.globalAlpha=1;");
  L.push("}");
  L.push("function spawnPart(x,y,col,n){");
  L.push("  for(let i=0;i<(n||8);i++){");
  L.push("    particles.push({x:x,y:y,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5,color:col||'#ffaa00',sz:Math.random()*4+2,life:28,maxLife:28});");
  L.push("  }");
  L.push("}");
  L.push("function shoot(){");
  L.push("  const now=Date.now();");
  L.push("  const g=gun();");
  L.push("  if(now-lastShot<g.fireRate) return;");
  L.push("  lastShot=now;");
  L.push("  stats.totalShots++;");
  L.push("  if(!gunStats[g.id]) gunStats[g.id]={shots:0,hits:0,damage:0,kills:0};");
  L.push("  gunStats[g.id].shots++;");
  L.push("  if(playerHP<maxHP*0.3) stats.panicShots++;");
  L.push("  if(g.id==='pixelnuke'){");
  L.push("    spawnPart(W/2,H/3,'#ff0000',60);");
  L.push("    enemies.forEach(function(e){ if(!gunStats[g.id]) gunStats[g.id]={shots:0,hits:0,damage:0,kills:0}; gunStats[g.id].hits++; gunStats[g.id].kills++; gunStats[g.id].damage+=g.damage; if(!enemyKills[e.type]) enemyKills[e.type]=0; enemyKills[e.type]++; score+=e.creditValue; credits+=e.creditValue; });");
  L.push("    enemies=[];");
  L.push("    return;");
  L.push("  }");
  L.push("  if(g.id==='spread'){");
  L.push("    for(let a=-1;a<=1;a++) bullets.push({x:playerX+20,y:playerY,vx:a*2.5,vy:-g.speed,gun:g.id,dmg:g.damage,pierce:false,alive:true});");
  L.push("  } else {");
  L.push("    bullets.push({x:playerX+18,y:playerY-4,vx:0,vy:-g.speed,gun:g.id,dmg:g.damage,pierce:g.id==='railgun',alive:true});");
  L.push("  }");
  L.push("}");
  L.push("function spawnWave(){");
  L.push("  wave++; waveActive=true; showShop=false; bullets=[]; enemies=[];");
  L.push("  stats.cleanThisWave=true;");
  L.push("  const types=getTypes();");
  L.push("  const cols=Math.min(7,3+Math.floor(wave/2));");
  L.push("  const rows=Math.min(5,1+Math.floor(wave/3));");
  L.push("  const hp=12+wave*10;");
  L.push("  for(let r=0;r<rows;r++){");
  L.push("    for(let c=0;c<cols;c++){");
  L.push("      const type=types[(r*cols+c)%types.length];");
  L.push("      enemies.push({x:30+c*(Math.floor((W-60)/cols)),y:50+r*62,w:42,h:42,hp:hp,maxHp:hp,type:type,vx:0.8+wave*0.08,vy:0,creditValue:8+wave*3,isBoss:false});");
  L.push("    }");
  L.push("  }");
  L.push("  if(wave%5===0){");
  L.push("    const bt=types[wave%types.length];");
  L.push("    enemies.push({x:W/2-45,y:20,w:90,h:90,hp:hp*12,maxHp:hp*12,type:bt,vx:0.4+wave*0.04,vy:0,creditValue:600+wave*60,isBoss:true});");
  L.push("  }");
  L.push("  enemyDir=1;");
  L.push("}");
  L.push("function openShop(){");
  L.push("  waveActive=false; showShop=true;");
  L.push("  if(stats.cleanThisWave) stats.consecutiveWavesClean++; else stats.consecutiveWavesClean=0;");
  L.push("}");
  L.push("function buyGun(id){");
  L.push("  const g=GUNS.find(function(x){return x.id===id;});");
  L.push("  if(!g||credits<g.cost||unlockedGuns.indexOf(id)>=0) return;");
  L.push("  credits-=g.cost;");
  L.push("  unlockedGuns.push(id);");
  L.push("  upgradeLog.push({gunId:id,cost:g.cost,wave:wave});");
  L.push("  currentGunIdx=unlockedGuns.length-1;");
  L.push("}");
  L.push("function switchGun(d){");
  L.push("  stats.lastGunBefore=unlockedGuns[currentGunIdx];");
  L.push("  currentGunIdx=(currentGunIdx+d+unlockedGuns.length)%unlockedGuns.length;");
  L.push("  stats.gunSwitches++;");
  L.push("}");
  L.push("function update(){");
  L.push("  if(!waveActive||showShop) return;");
  L.push("  const prevX=playerX;");
  L.push("  if(keys['ArrowLeft']||keys['a']||keys['A']) playerX=Math.max(0,playerX-5);");
  L.push("  if(keys['ArrowRight']||keys['d']||keys['D']) playerX=Math.min(W-42,playerX+5);");
  L.push("  stats.pixelsMoved+=Math.abs(playerX-prevX);");
  L.push("  bullets=bullets.filter(function(b){ b.x+=b.vx; b.y+=b.vy; return b.y>-30&&b.y<H+10&&b.alive; });");
  L.push("  let hitEdge=false;");
  L.push("  enemies.forEach(function(e){ e.x+=e.vx*enemyDir; if(e.x<=0||e.x+e.w>=W) hitEdge=true; });");
  L.push("  if(hitEdge){ enemyDir*=-1; enemies.forEach(function(e){ e.y+=18; }); }");
  L.push("  bullets.forEach(function(b){");
  L.push("    if(!b.alive) return;");
  L.push("    enemies.forEach(function(e){");
  L.push("      if(e.hp<=0) return;");
  L.push("      if(b.x<e.x+e.w&&b.x+8>e.x&&b.y<e.y+e.h&&b.y+14>e.y){");
  L.push("        e.hp-=b.dmg;");
  L.push("        if(!gunStats[b.gun]) gunStats[b.gun]={shots:0,hits:0,damage:0,kills:0};");
  L.push("        gunStats[b.gun].hits++;");
  L.push("        gunStats[b.gun].damage+=b.dmg;");
  L.push("        stats.totalHits++;");
  L.push("        stats.combo++;");
  L.push("        if(stats.combo>stats.longestCombo) stats.longestCombo=stats.combo;");
  L.push("        if(b.gun==='rocket'){");
  L.push("          enemies.forEach(function(n){if(n!==e&&n.hp>0&&Math.abs(n.x-e.x)<70&&Math.abs(n.y-e.y)<70){n.hp-=b.dmg*0.5;}});");
  L.push("          spawnPart(e.x+e.w/2,e.y+e.h/2,'#ff4400',14);");
  L.push("        }");
  L.push("        if(b.gun==='lightning'){");
  L.push("          const nb=enemies.find(function(n){return n!==e&&n.hp>0&&Math.abs(n.x-e.x)<110;});");
  L.push("          if(nb){nb.hp-=b.dmg*0.65;}");
  L.push("        }");
  L.push("        if(b.gun==='blackhole'){");
  L.push("          enemies.forEach(function(n){if(n.hp>0){const dx=b.x-n.x,dy=b.y-n.y,dist=Math.sqrt(dx*dx+dy*dy)||1;if(dist<150){n.x+=dx/dist*6;n.y+=dy/dist*6;}}});");
  L.push("        }");
  L.push("        if(e.hp<=0){");
  L.push("          gunStats[b.gun].kills++;");
  L.push("          score+=e.creditValue;");
  L.push("          credits+=e.creditValue;");
  L.push("          if(e.isBoss) stats.bossKills++;");
  L.push("          if(!enemyKills[e.type]) enemyKills[e.type]=0;");
  L.push("          enemyKills[e.type]++;");
  L.push("          spawnPart(e.x+e.w/2,e.y+e.h/2,e.isBoss?'#ff0000':'#ffaa00',e.isBoss?30:8);");
  L.push("        }");
  L.push("        if(!b.pierce) b.alive=false;");
  L.push("      }");
  L.push("    });");
  L.push("  });");
  L.push("  enemies.forEach(function(e){");
  L.push("    if(e.hp<=0) return;");
  L.push("    if(e.y+e.h>=playerY&&e.y<playerY+46&&e.x+e.w>playerX&&e.x<playerX+42){");
  L.push("      playerHP-=e.isBoss?30:15;");
  L.push("      stats.cleanThisWave=false;");
  L.push("      e.hp=0;");
  L.push("      spawnPart(playerX+20,playerY+20,'#ff0000',14);");
  L.push("      if(playerHP<=0){endGame('hit');}");
  L.push("    }");
  L.push("    if(e.y+e.h>playerY+60&&e.hp>0){");
  L.push("      stats.nearMisses++;");
  L.push("      stats.cleanThisWave=false;");
  L.push("      e.y=-e.h-10;");
  L.push("    }");
  L.push("  });");
  L.push("  enemies=enemies.filter(function(e){return e.hp>0;});");
  L.push("  bullets.forEach(function(b){if(b.y<0&&b.alive){stats.shotsMissed++;stats.combo=0;}});");
  L.push("  particles.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.life--;});");
  L.push("  particles=particles.filter(function(p){return p.life>0;});");
  L.push("  stars.forEach(function(s){s.y+=s.spd;if(s.y>H){s.y=0;s.x=Math.random()*W;}});");
  L.push("  if(enemies.length===0&&waveActive) openShop();");
  L.push("}");
  L.push("function draw(){");
  L.push("  ctx.fillStyle='#000010'; ctx.fillRect(0,0,W,H);");
  L.push("  ctx.fillStyle='#ffffff';");
  L.push("  stars.forEach(function(s){ctx.globalAlpha=s.s/2;ctx.fillRect(s.x,s.y,s.s,s.s);});");
  L.push("  ctx.globalAlpha=1;");
  L.push("  if(gameState==='menu'){drawMenu();return;}");
  L.push("  if(gameState==='gameover'){drawGameOver();return;}");
  L.push("  if(showShop){drawShop();return;}");
  L.push("  drawPlayer();");
  L.push("  enemies.forEach(drawEnemy);");
  L.push("  bullets.forEach(drawBullet);");
  L.push("  particles.forEach(drawParticle);");
  L.push("  drawHUD();");
  L.push("}");
  L.push("function drawHUD(){");
  L.push("  ctx.fillStyle='rgba(0,0,0,0.65)'; ctx.fillRect(0,0,W,42);");
  L.push("  const hpPct=playerHP/maxHP;");
  L.push("  ctx.fillStyle='#333'; ctx.fillRect(8,12,120,16);");
  L.push("  ctx.fillStyle=hpPct>0.5?'#4f4':hpPct>0.25?'#fa0':'#f44';");
  L.push("  ctx.fillRect(8,12,120*hpPct,16);");
  L.push("  text('HP '+playerHP,8,26,11,'#fff');");
  L.push("  text(''+score,W/2,28,18,'#ffdd00','center');");
  L.push("  text('💰'+credits,W-8,28,14,'#aaffaa','right');");
  L.push("  ctx.fillStyle='rgba(0,0,0,0.65)'; ctx.fillRect(0,H-38,W,38);");
  L.push("  const g=gun();");
  L.push("  text('W'+wave,8,H-14,13,'#888');");
  L.push("  text(g.emoji+' '+g.name,W/2,H-14,14,g.color,'center');");
  L.push("  text('Q/E',W-8,H-14,12,'#555','right');");
  L.push("}");
  L.push("function drawShop(){");
  L.push("  ctx.fillStyle='rgba(0,0,15,0.94)'; ctx.fillRect(0,0,W,H);");
  L.push("  text('UPGRADE SHOP',W/2,46,26,'#ffdd00','center');");
  L.push("  text('Wave '+wave+' cleared!',W/2,74,15,'#aaa','center');");
  L.push("  text('Credits: '+credits,W/2,96,15,'#aaffaa','center');");
  L.push("  const avail=GUNS.filter(function(g){return g.unlockWave<=wave&&unlockedGuns.indexOf(g.id)<0;});");
  L.push("  shopItems=avail;");
  L.push("  if(avail.length===0){");
  L.push("    text('All guns unlocked!',W/2,220,18,'#aaa','center');");
  L.push("  } else {");
  L.push("    avail.forEach(function(g,i){");
  L.push("      const y=118+i*78;");
  L.push("      const can=credits>=g.cost;");
  L.push("      ctx.fillStyle=can?'rgba(0,80,20,0.7)':'rgba(60,0,0,0.6)';");
  L.push("      ctx.fillRect(20,y,W-40,70);");
  L.push("      ctx.strokeStyle=can?'#00ff88':'#441';");
  L.push("      ctx.strokeRect(20,y,W-40,70);");
  L.push("      text(g.emoji+' '+g.name,36,y+24,18,g.color);");
  L.push("      text(g.desc,36,y+44,12,'#999');");
  L.push("      text('Cost: '+g.cost,36,y+62,12,can?'#aaffaa':'#f66');");
  L.push("      text('['+((i+1))+'] buy',W-28,y+40,13,can?'#fff':'#444','right');");
  L.push("    });");
  L.push("  }");
  L.push("  ctx.fillStyle='#ffdd00'; ctx.fillRect(W/2-90,H-62,180,40);");
  L.push("  text('NEXT WAVE',W/2,H-36,16,'#000','center');");
  L.push("}");
  L.push("function drawMenu(){");
  L.push("  text('👾 SPACE SHOOTER',W/2,90,28,'#00ff88','center');");
  L.push("  text('powered by AFO + Cloudflare',W/2,116,12,'#444','center');");
  L.push("  ctx.fillStyle='#111'; ctx.fillRect(60,140,W-120,44);");
  L.push("  ctx.strokeStyle=typingName?'#00ff88':'#333'; ctx.strokeRect(60,140,W-120,44);");
  L.push("  text(playerName||(typingName?'':'click to enter name...'),76,168,17,playerName?'#fff':'#555');");
  L.push("  if(typingName&&Math.floor(Date.now()/500)%2===0) text('|',76+(playerName.length*10),168,17,'#00ff88');");
  L.push("  ctx.fillStyle='#00ff88'; ctx.fillRect(W/2-80,202,160,42);");
  L.push("  text('PLAY',W/2,229,20,'#000','center');");
  L.push("  if(leaderboardData.length>0){");
  L.push("    text('TOP SCORES',W/2,272,13,'#ffdd00','center');");
  L.push("    leaderboardData.slice(0,8).forEach(function(r,i){");
  L.push("      const col=i===0?'#ffdd00':i<3?'#aaa':'#555';");
  L.push("      text((i+1)+'. '+r.player_name+'  '+r.score+'  W'+r.wave_reached,W/2,292+i*24,13,col,'center');");
  L.push("    });");
  L.push("  }");
  L.push("}");
  L.push("function drawGameOver(){");
  L.push("  ctx.fillStyle='rgba(0,0,0,0.88)'; ctx.fillRect(0,0,W,H);");
  L.push("  text('GAME OVER',W/2,110,38,'#ff4444','center');");
  L.push("  text('Score: '+score,W/2,155,24,'#ffdd00','center');");
  L.push("  text('Wave reached: '+wave,W/2,186,18,'#aaa','center');");
  L.push("  const acc=stats.totalShots>0?Math.round(stats.totalHits/stats.totalShots*100):0;");
  L.push("  const statLines=['Accuracy: '+acc+'%','Pixels traveled: '+Math.round(stats.pixelsMoved),'Panic shots: '+stats.panicShots,'Best combo: '+stats.longestCombo,'Gun switches: '+stats.gunSwitches,'Near misses: '+stats.nearMisses,'Boss kills: '+stats.bossKills,'Credits wasted: '+credits];");
  L.push("  statLines.forEach(function(s,i){text(s,W/2,216+i*24,13,'#888','center');});");
  L.push("  ctx.fillStyle='#00ff88'; ctx.fillRect(W/2-80,420,160,42);");
  L.push("  text('PLAY AGAIN',W/2,447,18,'#000','center');");
  L.push("}");
  L.push("function startGame(){");
  L.push("  if(!playerName.trim()){typingName=true;return;}");
  L.push("  score=0;wave=0;playerHP=100;maxHP=100;credits=100;");
  L.push("  playerX=220;playerY=570;");
  L.push("  currentGunIdx=0;unlockedGuns=['laser'];");
  L.push("  bullets=[];enemies=[];particles=[];");
  L.push("  stats={pixelsMoved:0,panicShots:0,gunSwitches:0,longestCombo:0,combo:0,nearMisses:0,totalShots:0,totalHits:0,shotsMissed:0,bossKills:0,consecutiveWavesClean:0,cleanThisWave:true,upgradeRegrets:0,lastGunBefore:null,timeSinceLastShot:0};");
  L.push("  gunStats={};enemyKills={};upgradeLog=[];");
  L.push("  gameStartTime=Date.now();");
  L.push("  gameState='playing';");
  L.push("  fetch('/api/session/start',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({player_name:playerName})}).then(function(r){return r.json();}).then(function(d){sessionId=d.session_id;}).catch(function(){});");
  L.push("  spawnWave();");
  L.push("}");
  L.push("function endGame(cause){");
  L.push("  gameState='gameover';");
  L.push("  if(!sessionId) return;");
  L.push("  const dur=Date.now()-gameStartTime;");
  L.push("  const ws=[];");
  L.push("  const acc=stats.totalShots>0?Math.round(stats.totalHits/stats.totalShots*100):0;");
  L.push("  ws.push({name:'accuracy_pct',value:acc});");
  L.push("  ws.push({name:'pixels_traveled',value:Math.round(stats.pixelsMoved)});");
  L.push("  ws.push({name:'panic_shots',value:stats.panicShots});");
  L.push("  ws.push({name:'longest_combo',value:stats.longestCombo});");
  L.push("  ws.push({name:'gun_switches',value:stats.gunSwitches});");
  L.push("  ws.push({name:'near_misses',value:stats.nearMisses});");
  L.push("  ws.push({name:'boss_kills',value:stats.bossKills});");
  L.push("  ws.push({name:'credits_wasted',value:credits});");
  L.push("  ws.push({name:'shots_missed',value:stats.shotsMissed});");
  L.push("  ws.push({name:'consecutive_clean_waves',value:stats.consecutiveWavesClean});");
  L.push("  fetch('/api/session/end',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:sessionId,score:score,wave_reached:wave,duration_ms:dur,cause_of_death:cause,credits_wasted:credits,gun_stats:gunStats,enemy_kills:enemyKills,upgrade_log:upgradeLog,weird_stats:ws})}).then(function(){loadLeaderboard();}).catch(function(){});");
  L.push("}");
  L.push("function loadLeaderboard(){");
  L.push("  fetch('/api/leaderboard').then(function(r){return r.json();}).then(function(d){leaderboardData=d.rows||[];}).catch(function(){});");
  L.push("}");
  L.push("document.addEventListener('keydown',function(e){");
  L.push("  keys[e.key]=true;");
  L.push("  if(typingName&&gameState==='menu'){");
  L.push("    if(e.key==='Backspace') playerName=playerName.slice(0,-1);");
  L.push("    else if(e.key==='Enter'){typingName=false;}");
  L.push("    else if(e.key.length===1&&playerName.length<16) playerName+=e.key;");
  L.push("    e.preventDefault(); return;");
  L.push("  }");
  L.push("  if(gameState==='menu'&&e.key==='Enter') startGame();");
  L.push("  if(gameState==='gameover'&&(e.key==='Enter'||e.key===' ')){gameState='menu';loadLeaderboard();}");
  L.push("  if(gameState==='playing'&&!showShop){");
  L.push("    if(e.key==='q'||e.key==='Q') switchGun(-1);");
  L.push("    if(e.key==='e'||e.key==='E') switchGun(1);");
  L.push("  }");
  L.push("  if(showShop){");
  L.push("    const n=parseInt(e.key);");
  L.push("    if(!isNaN(n)&&shopItems[n-1]) buyGun(shopItems[n-1].id);");
  L.push("  }");
  L.push("});");
  L.push("document.addEventListener('keyup',function(e){delete keys[e.key];});");
  L.push("canvas.addEventListener('touchstart',function(e){");
  L.push("  e.preventDefault();");
  L.push("  const t=e.touches[0], rect=canvas.getBoundingClientRect();");
  L.push("  const tx=(t.clientX-rect.left)*(W/rect.width), ty=(t.clientY-rect.top)*(H/rect.height);");
  L.push("  touchStartX=tx;");
  L.push("  if(gameState==='menu'){");
  L.push("    if(ty>140&&ty<184&&tx>60&&tx<W-60){typingName=true; return;}");
  L.push("    typingName=false;");
  L.push("    if(ty>202&&ty<244&&tx>W/2-80&&tx<W/2+80) startGame();");
  L.push("    return;");
  L.push("  }");
  L.push("  if(gameState==='gameover'){");
  L.push("    if(ty>420&&ty<462&&tx>W/2-80&&tx<W/2+80){gameState='menu';loadLeaderboard();}");
  L.push("    return;");
  L.push("  }");
  L.push("  if(showShop){");
  L.push("    if(ty>H-68&&ty<H-20&&tx>W/2-90&&tx<W/2+90){spawnWave();return;}");
  L.push("    shopItems.forEach(function(g,i){const sy=118+i*78;if(ty>sy&&ty<sy+70&&tx>20&&tx<W-20) buyGun(g.id);});");
  L.push("    return;");
  L.push("  }");
  L.push("},{ passive:false });");
  L.push("canvas.addEventListener('touchmove',function(e){");
  L.push("  e.preventDefault();");
  L.push("  if(gameState!=='playing'||showShop) return;");
  L.push("  const t=e.touches[0], rect=canvas.getBoundingClientRect();");
  L.push("  const tx=(t.clientX-rect.left)*(W/rect.width);");
  L.push("  if(touchStartX!==null){const dx=tx-touchStartX; playerX=Math.max(0,Math.min(W-42,playerX+dx*0.6)); touchStartX=tx;}");
  L.push("},{ passive:false });");
  L.push("canvas.addEventListener('click',function(e){");
  L.push("  const rect=canvas.getBoundingClientRect();");
  L.push("  const cx=(e.clientX-rect.left)*(W/rect.width), cy=(e.clientY-rect.top)*(H/rect.height);");
  L.push("  if(gameState==='menu'){");
  L.push("    if(cy>140&&cy<184&&cx>60&&cx<W-60){typingName=true;return;}");
  L.push("    typingName=false;");
  L.push("    if(cy>202&&cy<244&&cx>W/2-80&&cx<W/2+80) startGame();");
  L.push("    return;");
  L.push("  }");
  L.push("  if(gameState==='gameover'&&cy>420&&cy<462&&cx>W/2-80&&cx<W/2+80){gameState='menu';loadLeaderboard();return;}");
  L.push("  if(showShop){");
  L.push("    if(cy>H-68&&cy<H-20&&cx>W/2-90&&cx<W/2+90){spawnWave();return;}");
  L.push("    shopItems.forEach(function(g,i){const sy=118+i*78;if(cy>sy&&cy<sy+70&&cx>20&&cx<W-20) buyGun(g.id);});");
  L.push("  }");
  L.push("});");
  L.push("setInterval(function(){if(gameState==='playing'&&!showShop) shoot();},50);");
  L.push("function loop(){ update(); draw(); requestAnimationFrame(loop); }");
  L.push("loadSprites(); loadLeaderboard(); loop();");
  return L.join("\n");
}

function buildGameHTML(sprites) {
  const script = buildGameScript(sprites);
  const parts = [
    "<!DOCTYPE html>",
    "<html lang='en'><head>",
    "<meta charset='UTF-8'>",
    "<meta name='viewport' content='width=device-width,initial-scale=1,user-scalable=no'>",
    "<title>Space Shooter</title>",
    "<style>",
    "*{margin:0;padding:0;box-sizing:border-box;}",
    "body{background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:monospace;overflow:hidden;}",
    "canvas{display:block;touch-action:none;border:1px solid #111;}",
    "#info{color:#333;font-size:11px;margin-top:6px;text-align:center;}",
    "</style>",
    "</head><body>",
    "<canvas id='gc'></canvas>",
    "<div id='info'>arrow keys to move &bull; Q/E switch gun &bull; auto-fires &bull; <a href='/admin' style='color:#333'>admin</a></div>",
    "<script>",
    script,
    "</script>",
    "</body></html>"
  ];
  return parts.join("\n");
}

function buildAdminHTML(spriteList) {
  const rows = spriteList.map(function(s) {
    return "<tr><td><img src='/sprites/" + safe(s.key) + "' style='width:48px;height:48px;object-fit:contain;'></td><td style='padding:8px 16px;color:#ccc;'>" + safe(s.key) + "</td><td><button onclick=\"del('" + safe(s.key) + "')\" style='background:#440000;color:#f88;border:1px solid #600;padding:4px 10px;cursor:pointer;border-radius:3px;font-family:monospace;'>delete</button></td></tr>";
  }).join("");
  const parts = [
    "<!DOCTYPE html>",
    "<html lang='en'><head>",
    "<meta charset='UTF-8'>",
    "<meta name='viewport' content='width=device-width,initial-scale=1'>",
    "<title>Space Shooter - Admin</title>",
    "<style>",
    "body{background:#000;color:#aaa;font-family:monospace;padding:24px;max-width:600px;margin:0 auto;}",
    "h1{color:#00ff88;margin-bottom:4px;}",
    "h2{color:#ffdd00;margin:24px 0 12px;font-size:15px;}",
    "input[type=file]{color:#aaa;padding:8px;border:1px solid #333;background:#111;width:100%;margin-bottom:10px;}",
    "button.upload{background:#004400;color:#00ff88;border:1px solid #00ff88;padding:10px 24px;cursor:pointer;font-family:monospace;font-size:14px;border-radius:3px;}",
    "table{width:100%;border-collapse:collapse;margin-top:8px;}",
    "td{padding:6px 0;}",
    "#msg{padding:10px;margin:10px 0;border-radius:3px;display:none;}",
    ".ok{background:#003300;color:#4f4;border:1px solid #4f4;}",
    ".er{background:#330000;color:#f44;border:1px solid #f44;}",
    "a{color:#00ff88;text-decoration:none;}",
    "</style>",
    "</head><body>",
    "<h1>👾 Space Shooter Admin</h1>",
    "<a href='/'>back to game</a>",
    "<h2>Upload Sprite / Enemy Image</h2>",
    "<p style='font-size:12px;color:#555;margin-bottom:12px;'>Upload any image from your photo library - it becomes an enemy in the game. PNG/JPG/GIF/WEBP supported.</p>",
    "<div id='msg'></div>",
    "<input type='file' id='file' accept='image/*' multiple>",
    "<button class='upload' onclick='upload()'>Upload to R2</button>",
    "<h2>Current Sprites (" + spriteList.length + ")</h2>",
    spriteList.length === 0 ? "<p style='color:#444;font-size:13px;'>No sprites yet - upload images above to add custom enemies.</p>" : "",
    "<table>" + rows + "</table>",
    "<script>",
    "function msg(t,ok){const d=document.getElementById('msg');d.textContent=t;d.className=ok?'ok':'er';d.style.display='block';setTimeout(function(){d.style.display='none';},3500);}",
    "function upload(){",
    "  const f=document.getElementById('file').files;",
    "  if(!f.length){msg('No file selected',false);return;}",
    "  Array.from(f).forEach(function(file){",
    "    const form=new FormData();",
    "    form.append('file',file);",
    "    form.append('name',file.name);",
    "    fetch('/admin/upload',{method:'POST',body:form}).then(function(r){return r.json();}).then(function(d){if(d.ok){msg('Uploaded: '+file.name,true);}else{msg('Error: '+d.error,false);}}).catch(function(e){msg('Failed: '+e,false);});",
    "  });",
    "}",
    "function del(key){",
    "  if(!confirm('Delete '+key+'?')) return;",
    "  fetch('/admin/sprite/'+encodeURIComponent(key),{method:'DELETE'}).then(function(r){return r.json();}).then(function(d){if(d.ok){location.reload();}else{alert('Error: '+d.error);}}).catch(function(){alert('Delete failed');});",
    "}",
    "</script>",
    "</body></html>"
  ];
  return parts.join("\n");
}

async function apiStartSession(env, req) {
  const body = await req.json().catch(() => ({}));
  const name = safe(body.player_name || "Player");
  if (!name.trim()) return j({ ok: false, error: "player_name required" }, 400);
  const id = uid();
  await env.DB.prepare("INSERT INTO sessions (id, player_name) VALUES (?, ?)").bind(id, name).run();
  return j({ ok: true, session_id: id });
}

async function apiEndSession(env, req) {
  const body = await req.json().catch(() => ({}));
  const { session_id, score, wave_reached, duration_ms, cause_of_death, credits_wasted, gun_stats, enemy_kills, upgrade_log, weird_stats } = body;
  if (!session_id) return j({ ok: false, error: "session_id required" }, 400);
  const sc = Number(score) || 0;
  const wr = Number(wave_reached) || 0;
  const dur = Number(duration_ms) || 0;
  const cw = Number(credits_wasted) || 0;
  await env.DB.prepare("UPDATE sessions SET score=?,wave_reached=?,duration_ms=?,credits_earned=?,credits_wasted=?,ended_at=datetime('now'),cause_of_death=? WHERE id=?").bind(sc, wr, dur, sc, cw, safe(cause_of_death || "unknown"), session_id).run();
  if (gun_stats && typeof gun_stats === "object") {
    for (const [gid, gs] of Object.entries(gun_stats)) {
      const g = gs || {};
      await env.DB.prepare("INSERT INTO gun_stats (session_id,gun_type,shots_fired,shots_hit,damage_dealt,kills) VALUES (?,?,?,?,?,?) ON CONFLICT(session_id,gun_type) DO UPDATE SET shots_fired=excluded.shots_fired,shots_hit=excluded.shots_hit,damage_dealt=excluded.damage_dealt,kills=excluded.kills").bind(session_id, safe(gid), Number(g.shots)||0, Number(g.hits)||0, Number(g.damage)||0, Number(g.kills)||0).run();
    }
  }
  if (enemy_kills && typeof enemy_kills === "object") {
    for (const [type, count] of Object.entries(enemy_kills)) {
      await env.DB.prepare("INSERT INTO enemy_kills (session_id,enemy_type,kill_count) VALUES (?,?,?) ON CONFLICT(session_id,enemy_type) DO UPDATE SET kill_count=excluded.kill_count").bind(session_id, safe(type), Number(count)||0).run();
    }
  }
  if (Array.isArray(upgrade_log)) {
    for (const u of upgrade_log) {
      await env.DB.prepare("INSERT INTO upgrade_log (session_id,gun_id,cost,wave_number) VALUES (?,?,?,?)").bind(session_id, safe(u.gunId||""), Number(u.cost)||0, Number(u.wave)||0).run();
    }
  }
  if (Array.isArray(weird_stats)) {
    for (const ws of weird_stats) {
      await env.DB.prepare("INSERT INTO weird_stats (session_id,stat_name,stat_value) VALUES (?,?,?)").bind(session_id, safe(ws.name||""), Number(ws.value)||0).run();
    }
  }
  if (sc > 0) {
    await env.DB.prepare("INSERT INTO leaderboard (player_name,score,wave_reached,duration_ms,session_id) VALUES (?,?,?,?,?) ON CONFLICT(session_id) DO UPDATE SET score=excluded.score,wave_reached=excluded.wave_reached,duration_ms=excluded.duration_ms").bind(safe(body.player_name||""), sc, wr, dur, session_id).run();
  }
  return j({ ok: true });
}

async function apiLeaderboard(env) {
  const res = await env.DB.prepare("SELECT player_name,score,wave_reached,duration_ms,achieved_at FROM leaderboard ORDER BY score DESC LIMIT 20").all();
  return j({ ok: true, rows: res.results || [] });
}

async function serveSprite(env, key) {
  const obj = await env.BUCKET.get(R2_PREFIX + key);
  if (!obj) return new Response("Not found", { status: 404 });
  const ct = obj.httpMetadata?.contentType || "image/png";
  return new Response(obj.body, { headers: { "Content-Type": ct, "Cache-Control": "public, max-age=86400" } });
}

async function adminUpload(env, req) {
  const form = await req.formData().catch(() => null);
  if (!form) return j({ ok: false, error: "multipart form required" }, 400);
  const file = form.get("file");
  if (!file) return j({ ok: false, error: "file field required" }, 400);
  const rawName = form.get("name") || file.name || "sprite.png";
  const name = rawName.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
  const buf = await file.arrayBuffer();
  await env.BUCKET.put(R2_PREFIX + name, buf, { httpMetadata: { contentType: file.type || "image/png" } });
  return j({ ok: true, key: name });
}

async function adminDelete(env, key) {
  await env.BUCKET.delete(R2_PREFIX + key);
  return j({ ok: true });
}

async function getSpritesMap(env) {
  try {
    const list = await env.BUCKET.list({ prefix: R2_PREFIX });
    const sprites = {};
    for (const obj of (list.objects || [])) {
      const key = obj.key.replace(R2_PREFIX, "");
      if (key) sprites[key] = "/sprites/" + key;
    }
    return sprites;
  } catch { return {}; }
}

async function listSpriteObjects(env) {
  try {
    const list = await env.BUCKET.list({ prefix: R2_PREFIX });
    return (list.objects || []).map(function(o) { return { key: o.key.replace(R2_PREFIX, "") }; }).filter(function(o) { return o.key; });
  } catch { return []; }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (path.startsWith("/sprites/")) { const key = decodeURIComponent(path.slice(9)); return serveSprite(env, key); }
    if (path === "/admin" && method === "GET") { const sl = await listSpriteObjects(env); return new Response(buildAdminHTML(sl), { headers: { "Content-Type": "text/html;charset=UTF-8" } }); }
    if (path === "/admin/upload" && method === "POST") return adminUpload(env, request);
    if (path.startsWith("/admin/sprite/") && method === "DELETE") { const key = decodeURIComponent(path.slice(14)); return adminDelete(env, key); }
    if (path === "/api/session/start" && method === "POST") return apiStartSession(env, request);
    if (path === "/api/session/end" && method === "POST") return apiEndSession(env, request);
    if (path === "/api/leaderboard" && method === "GET") return apiLeaderboard(env);
    if (path === "/health") return j({ ok: true, worker: WORKER_NAME, version: VERSION });
    if (path === "/admin/setup" && method === "POST") {
      const results = [];
      for (const sql of SCHEMA) {
        try { await env.DB.prepare(sql).run(); results.push({ ok: true }); }
        catch (e) { results.push({ ok: false, error: e.message }); }
      }
      return j({ ok: true, results });
    }
    if (path === "/" || path === "") { const sprites = await getSpritesMap(env); return new Response(buildGameHTML(sprites), { headers: { "Content-Type": "text/html;charset=UTF-8" } }); }
    return j({ error: "Not found" }, 404);
  }
};
