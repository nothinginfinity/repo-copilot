const VERSION = "1.1.0";
const WORKER_NAME = "afo-space-shooter";
const R2_PREFIX = "space-shooter/sprites/";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const GUNS = [
  { id: "laser",    name: "Laser",      emoji: "\u26A1", damage: 10,   fireRate: 220,  speed: 9, spread: 0, unlockWave: 0,  cost: 0,    color: "#00ff88", desc: "Fast single shot" },
  { id: "spread",   name: "Spread",     emoji: "\uD83C\uDF1F", damage: 8,    fireRate: 380,  speed: 7, spread: 3, unlockWave: 2,  cost: 150,  color: "#ffaa00", desc: "3 shots wide" },
  { id: "plasma",   name: "Plasma",     emoji: "\uD83D\uDC9C", damage: 50,   fireRate: 950,  speed: 5, spread: 0, unlockWave: 4,  cost: 300,  color: "#ff00ff", desc: "Massive slow shot" },
  { id: "rocket",   name: "Rocket",     emoji: "\uD83D\uDE80", damage: 38,   fireRate: 1400, speed: 4, spread: 0, unlockWave: 6,  cost: 500,  color: "#ff4400", desc: "Splash damage" },
  { id: "lightning",name: "Lightning",  emoji: "\uD83C\uDF29", damage: 22,   fireRate: 280,  speed: 10,spread: 0, unlockWave: 8,  cost: 800,  color: "#aaffff", desc: "Chains to nearby enemies" },
  { id: "railgun",  name: "Railgun",    emoji: "\uD83D\uDD35", damage: 90,   fireRate: 1800, speed: 16,spread: 0, unlockWave: 10, cost: 1200, color: "#ffffff", desc: "Pierces all enemies" },
  { id: "blackhole",name: "Black Hole", emoji: "\uD83C\uDF00", damage: 12,   fireRate: 4000, speed: 3, spread: 0, unlockWave: 12, cost: 2000, color: "#9933ff", desc: "Pulls enemies to impact" },
  { id: "pixelnuke",name: "Pixel Nuke", emoji: "\u2622\uFE0F", damage: 9999, fireRate: 12000,speed: 1, spread: 0, unlockWave: 15, cost: 5000, color: "#ff0000", desc: "Deletes entire screen" }
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
  L.push("const sprites = " + JSON.stringify(sprites) + ";");
  L.push("const GUNS = " + JSON.stringify(GUNS) + ";");
  L.push("const W = 480, H = 640;");
  L.push("let sessionId=null, playerName='', gameState='menu';");
  L.push("let score=0, wave=0, playerHP=100, maxHP=100, credits=0;");
  L.push("let playerX=220, playerY=570;");
  L.push("let currentGunIdx=0, unlockedGuns=['laser'];");
  L.push("let lastShot=0;");
  L.push("let bullets=[], enemies=[], particles=[], stars=[];");
  L.push("let enemyImgs={}, spriteKeys=[];");
  L.push("let enemyDir=1, shopItems=[];");
  L.push("let waveActive=false, showShop=false;");
  L.push("let gameStartTime=0;");
  L.push("let touchStartX=null;");
  L.push("let leaderboardData=[];");
  L.push("let stats={pixelsMoved:0,panicShots:0,gunSwitches:0,longestCombo:0,combo:0,nearMisses:0,totalShots:0,totalHits:0,shotsMissed:0,bossKills:0,consecutiveWavesClean:0,cleanThisWave:true};");
  L.push("let gunStats={}, enemyKills={}, upgradeLog=[];");
  L.push("const canvas=document.getElementById('gc');");
  L.push("const ctx=canvas.getContext('2d');");
  L.push("canvas.width=W; canvas.height=H;");
  L.push("for(let i=0;i<70;i++) stars.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*1.5+0.3,spd:Math.random()*0.5+0.2});");
  L.push("function getEl(id){return document.getElementById(id);}");
  L.push("function setUI(){");
  L.push("  const nb=getEl('nameBox'),gb=getEl('gunBar'),ob=getEl('gameOver');");
  L.push("  if(nb) nb.style.display=gameState==='menu'?'flex':'none';");
  L.push("  if(gb) gb.style.display=(gameState==='playing'&&!showShop)?'flex':'none';");
  L.push("  if(ob) ob.style.display=gameState==='gameover'?'flex':'none';");
  L.push("  updateGunLabel();");
  L.push("}");
  L.push("function updateGunLabel(){");
  L.push("  const g=gun(),el=getEl('gunLabel');");
  L.push("  if(el) el.textContent=g.emoji+' '+g.name+(unlockedGuns.length>1?' ('+(currentGunIdx+1)+'/'+unlockedGuns.length+')':'');");
  L.push("}");
  L.push("function loadSprites(){");
  L.push("  spriteKeys=Object.keys(sprites);");
  L.push("  spriteKeys.forEach(function(k){const img=new Image();img.src=sprites[k];enemyImgs[k]=img;});");
  L.push("}");
  L.push("const FALLBACK=['\uD83D\uDC7E','\uD83D\uDEF8','\uD83D\uDC80','\uD83E\uDD16','\uD83D\uDC79','\uD83D\uDC7B','\uD83E\uDDBE','\uD83D\uDE08','\uD83D\uDC7D','\uD83D\uDC19'];");
  L.push("function getTypes(){return spriteKeys.length>0?spriteKeys:FALLBACK;}");
  L.push("function gun(){return GUNS.find(function(g){return g.id===unlockedGuns[currentGunIdx];})||GUNS[0];}");
  L.push("function text(t,x,y,sz,col,align){ctx.save();ctx.fillStyle=col||'#fff';ctx.font=(sz||16)+'px monospace';ctx.textAlign=align||'left';ctx.fillText(t,x,y);ctx.restore();}");
  L.push("function drawPlayer(){ctx.save();ctx.font='38px serif';ctx.textAlign='center';ctx.fillText('\uD83D\uDE80',playerX+20,playerY+36);ctx.restore();}");
  L.push("function drawEnemy(e){");
  L.push("  const img=enemyImgs[e.type];");
  L.push("  if(img&&img.complete&&img.naturalWidth>0){ctx.drawImage(img,e.x,e.y,e.w,e.h);}");
  L.push("  else{ctx.save();ctx.font=Math.round(e.w*0.82)+'px serif';ctx.textAlign='center';ctx.fillText(e.type,e.x+e.w/2,e.y+e.h*0.85);ctx.restore();}");
  L.push("  if(e.hp<e.maxHp){ctx.fillStyle='#222';ctx.fillRect(e.x,e.y-7,e.w,5);ctx.fillStyle=e.hp/e.maxHp>0.5?'#4f4':'#f44';ctx.fillRect(e.x,e.y-7,e.w*(e.hp/e.maxHp),5);}");
  L.push("  if(e.isBoss){ctx.strokeStyle='#ff4400';ctx.lineWidth=2;ctx.strokeRect(e.x-2,e.y-2,e.w+4,e.h+4);ctx.lineWidth=1;}");
  L.push("}");
  L.push("function drawBullet(b){");
  L.push("  const g=GUNS.find(function(x){return x.id===b.gun;})||GUNS[0];");
  L.push("  if(b.gun==='rocket'||b.gun==='blackhole'){ctx.save();ctx.font='16px serif';ctx.textAlign='center';ctx.fillText(b.gun==='rocket'?'\uD83D\uDE80':'\uD83C\uDF00',b.x+4,b.y+12);ctx.restore();}");
  L.push("  else if(b.gun==='pixelnuke'){ctx.save();ctx.font='20px serif';ctx.textAlign='center';ctx.fillText('\u2622\uFE0F',b.x+4,b.y+14);ctx.restore();}");
  L.push("  else{ctx.fillStyle=g.color;ctx.fillRect(b.x,b.y,b.w||4,b.h||14);}");
  L.push("}");
  L.push("function drawParticle(p){ctx.globalAlpha=p.life/p.maxLife;ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.sz,p.sz);ctx.globalAlpha=1;}");
  L.push("function spawnPart(x,y,col,n){for(let i=0;i<(n||8);i++){particles.push({x:x,y:y,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5,color:col||'#ffaa00',sz:Math.random()*4+2,life:28,maxLife:28});}}");
  L.push("function shoot(){");
  L.push("  const now=Date.now(),g=gun();");
  L.push("  if(now-lastShot<g.fireRate) return;");
  L.push("  lastShot=now;stats.totalShots++;");
  L.push("  if(!gunStats[g.id]) gunStats[g.id]={shots:0,hits:0,damage:0,kills:0};");
  L.push("  gunStats[g.id].shots++;");
  L.push("  if(playerHP<maxHP*0.3) stats.panicShots++;");
  L.push("  if(g.id==='pixelnuke'){spawnPart(W/2,H/3,'#ff0000',60);enemies.forEach(function(e){if(!gunStats[g.id])gunStats[g.id]={shots:0,hits:0,damage:0,kills:0};gunStats[g.id].hits++;gunStats[g.id].kills++;gunStats[g.id].damage+=g.damage;if(!enemyKills[e.type])enemyKills[e.type]=0;enemyKills[e.type]++;score+=e.creditValue;credits+=e.creditValue;});enemies=[];return;}");
  L.push("  if(g.id==='spread'){for(let a=-1;a<=1;a++)bullets.push({x:playerX+20,y:playerY,vx:a*2.5,vy:-g.speed,gun:g.id,dmg:g.damage,pierce:false,alive:true});}");
  L.push("  else{bullets.push({x:playerX+18,y:playerY-4,vx:0,vy:-g.speed,gun:g.id,dmg:g.damage,pierce:g.id==='railgun',alive:true});}");
  L.push("}");
  L.push("function spawnWave(){wave++;waveActive=true;showShop=false;bullets=[];enemies=[];stats.cleanThisWave=true;");
  L.push("  const types=getTypes(),cols=Math.min(7,3+Math.floor(wave/2)),rows=Math.min(5,1+Math.floor(wave/3)),hp=12+wave*10;");
  L.push("  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const type=types[(r*cols+c)%types.length];enemies.push({x:30+c*(Math.floor((W-60)/cols)),y:50+r*62,w:42,h:42,hp:hp,maxHp:hp,type:type,vx:0.8+wave*0.08,vy:0,creditValue:8+wave*3,isBoss:false});}");
  L.push("  if(wave%5===0){const bt=types[wave%types.length];enemies.push({x:W/2-45,y:20,w:90,h:90,hp:hp*12,maxHp:hp*12,type:bt,vx:0.4+wave*0.04,vy:0,creditValue:600+wave*60,isBoss:true});}");
  L.push("  enemyDir=1;setUI();");
  L.push("}");
  L.push("function openShop(){waveActive=false;showShop=true;if(stats.cleanThisWave)stats.consecutiveWavesClean++;else stats.consecutiveWavesClean=0;setUI();}");
  L.push("function buyGun(id){const g=GUNS.find(function(x){return x.id===id;});if(!g||credits<g.cost||unlockedGuns.indexOf(id)>=0)return;credits-=g.cost;unlockedGuns.push(id);upgradeLog.push({gunId:id,cost:g.cost,wave:wave});currentGunIdx=unlockedGuns.length-1;updateGunLabel();}");
  L.push("function switchGun(d){stats.gunSwitches++;currentGunIdx=(currentGunIdx+d+unlockedGuns.length)%unlockedGuns.length;updateGunLabel();}");
  L.push("function drawHUD(){");
  L.push("  ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(0,0,W,42);");
  L.push("  const hpPct=playerHP/maxHP;ctx.fillStyle='#333';ctx.fillRect(8,12,120,16);");
  L.push("  ctx.fillStyle=hpPct>0.5?'#4f4':hpPct>0.25?'#fa0':'#f44';ctx.fillRect(8,12,120*hpPct,16);");
  L.push("  text('HP '+playerHP,8,26,11,'#fff');text(''+score,W/2,28,18,'#ffdd00','center');");
  L.push("  text('\uD83D\uDCB0'+credits,W-8,28,14,'#aaffaa','right');text('W'+wave,8,H-10,12,'#555');");
  L.push("}");
  L.push("function drawShop(){");
  L.push("  ctx.fillStyle='rgba(0,0,15,0.94)';ctx.fillRect(0,0,W,H);");
  L.push("  text('UPGRADE SHOP',W/2,46,26,'#ffdd00','center');text('Wave '+wave+' cleared!',W/2,74,15,'#aaa','center');text('Credits: '+credits,W/2,96,15,'#aaffaa','center');");
  L.push("  const avail=GUNS.filter(function(g){return g.unlockWave<=wave&&unlockedGuns.indexOf(g.id)<0;});shopItems=avail;");
  L.push("  if(avail.length===0){text('All guns unlocked!',W/2,220,18,'#aaa','center');}");
  L.push("  else{avail.forEach(function(g,i){const y=118+i*78,can=credits>=g.cost;ctx.fillStyle=can?'rgba(0,80,20,0.7)':'rgba(60,0,0,0.6)';ctx.fillRect(20,y,W-40,70);ctx.strokeStyle=can?'#00ff88':'#441';ctx.strokeRect(20,y,W-40,70);text(g.emoji+' '+g.name,36,y+24,18,g.color);text(g.desc,36,y+44,12,'#999');text('Cost: '+g.cost,36,y+62,12,can?'#aaffaa':'#f66');text('TAP',W-28,y+40,13,can?'#fff':'#444','right');});}");
  L.push("  ctx.fillStyle='#ffdd00';ctx.fillRect(W/2-90,H-62,180,40);text('NEXT WAVE',W/2,H-36,16,'#000','center');");
  L.push("}");
  L.push("function drawMenu(){");
  L.push("  text('\uD83D\uDC7E SPACE SHOOTER',W/2,90,28,'#00ff88','center');");
  L.push("  text('powered by AFO + Cloudflare',W/2,116,12,'#333','center');");
  L.push("  if(leaderboardData.length>0){text('TOP SCORES',W/2,160,13,'#ffdd00','center');leaderboardData.slice(0,10).forEach(function(r,i){text((i+1)+'. '+r.player_name+'   '+r.score+'   W'+r.wave_reached,W/2,182+i*24,13,i===0?'#ffdd00':i<3?'#aaa':'#444','center');});}");
  L.push("  else{text('Enter your name below and tap PLAY',W/2,200,13,'#444','center');}");
  L.push("}");
  L.push("function showGameOverUI(){const acc=stats.totalShots>0?Math.round(stats.totalHits/stats.totalShots*100):0;const el=getEl('scoreInfo');if(!el)return;el.innerHTML='<b style=color:#ffdd00>Score: '+score+'</b>  Wave: '+wave+'<br>Accuracy: '+acc+'%  |  Pixels moved: '+Math.round(stats.pixelsMoved)+'<br>Panic shots: '+stats.panicShots+'  |  Best combo: '+stats.longestCombo+'<br>Boss kills: '+stats.bossKills+'  |  Near misses: '+stats.nearMisses;}");
  L.push("function update(){");
  L.push("  if(!waveActive||showShop) return;");
  L.push("  bullets=bullets.filter(function(b){b.x+=b.vx;b.y+=b.vy;return b.y>-30&&b.y<H+10&&b.alive;});");
  L.push("  let hitEdge=false;enemies.forEach(function(e){e.x+=e.vx*enemyDir;if(e.x<=0||e.x+e.w>=W)hitEdge=true;});");
  L.push("  if(hitEdge){enemyDir*=-1;enemies.forEach(function(e){e.y+=18;});}");
  L.push("  bullets.forEach(function(b){if(!b.alive)return;enemies.forEach(function(e){if(e.hp<=0)return;if(b.x<e.x+e.w&&b.x+8>e.x&&b.y<e.y+e.h&&b.y+14>e.y){e.hp-=b.dmg;if(!gunStats[b.gun])gunStats[b.gun]={shots:0,hits:0,damage:0,kills:0};gunStats[b.gun].hits++;gunStats[b.gun].damage+=b.dmg;stats.totalHits++;stats.combo++;if(stats.combo>stats.longestCombo)stats.longestCombo=stats.combo;if(b.gun==='rocket'){enemies.forEach(function(n){if(n!==e&&n.hp>0&&Math.abs(n.x-e.x)<70&&Math.abs(n.y-e.y)<70){n.hp-=b.dmg*0.5;}});spawnPart(e.x+e.w/2,e.y+e.h/2,'#ff4400',14);}if(b.gun==='lightning'){const nb=enemies.find(function(n){return n!==e&&n.hp>0&&Math.abs(n.x-e.x)<110;});if(nb)nb.hp-=b.dmg*0.65;}if(b.gun==='blackhole'){enemies.forEach(function(n){if(n.hp>0){const dx=b.x-n.x,dy=b.y-n.y,dist=Math.sqrt(dx*dx+dy*dy)||1;if(dist<150){n.x+=dx/dist*6;n.y+=dy/dist*6;}}});}if(e.hp<=0){gunStats[b.gun].kills++;score+=e.creditValue;credits+=e.creditValue;if(e.isBoss)stats.bossKills++;if(!enemyKills[e.type])enemyKills[e.type]=0;enemyKills[e.type]++;spawnPart(e.x+e.w/2,e.y+e.h/2,e.isBoss?'#ff0000':'#ffaa00',e.isBoss?30:8);}if(!b.pierce)b.alive=false;}});});");
  L.push("  enemies.forEach(function(e){if(e.hp<=0)return;if(e.y+e.h>=playerY&&e.y<playerY+46&&e.x+e.w>playerX&&e.x<playerX+42){playerHP-=e.isBoss?30:15;stats.cleanThisWave=false;e.hp=0;spawnPart(playerX+20,playerY+20,'#ff0000',14);if(playerHP<=0){endGame('hit');}}if(e.y+e.h>playerY+60&&e.hp>0){stats.nearMisses++;stats.cleanThisWave=false;e.y=-e.h-10;}});");
  L.push("  enemies=enemies.filter(function(e){return e.hp>0;});");
  L.push("  bullets.forEach(function(b){if(b.y<0&&b.alive){stats.shotsMissed++;stats.combo=0;}});");
  L.push("  particles.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.life--;});particles=particles.filter(function(p){return p.life>0;});");
  L.push("  stars.forEach(function(s){s.y+=s.spd;if(s.y>H){s.y=0;s.x=Math.random()*W;}});");
  L.push("  if(enemies.length===0&&waveActive)openShop();");
  L.push("}");
  L.push("function startGame(){const inp=getEl('nameInput');if(inp)playerName=inp.value.trim();if(!playerName){if(inp){inp.focus();inp.style.borderColor='#ff4444';}return;}score=0;wave=0;playerHP=100;maxHP=100;credits=100;playerX=220;playerY=570;currentGunIdx=0;unlockedGuns=['laser'];bullets=[];enemies=[];particles=[];stats={pixelsMoved:0,panicShots:0,gunSwitches:0,longestCombo:0,combo:0,nearMisses:0,totalShots:0,totalHits:0,shotsMissed:0,bossKills:0,consecutiveWavesClean:0,cleanThisWave:true};gunStats={};enemyKills={};upgradeLog=[];gameStartTime=Date.now();gameState='playing';setUI();fetch('/api/session/start',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({player_name:playerName})}).then(function(r){return r.json();}).then(function(d){sessionId=d.session_id;}).catch(function(){});spawnWave();}");
  L.push("function endGame(cause){gameState='gameover';setUI();showGameOverUI();if(!sessionId)return;const dur=Date.now()-gameStartTime;const acc=stats.totalShots>0?Math.round(stats.totalHits/stats.totalShots*100):0;const ws=[{name:'accuracy_pct',value:acc},{name:'pixels_traveled',value:Math.round(stats.pixelsMoved)},{name:'panic_shots',value:stats.panicShots},{name:'longest_combo',value:stats.longestCombo},{name:'gun_switches',value:stats.gunSwitches},{name:'near_misses',value:stats.nearMisses},{name:'boss_kills',value:stats.bossKills},{name:'credits_wasted',value:credits},{name:'shots_missed',value:stats.shotsMissed},{name:'consecutive_clean_waves',value:stats.consecutiveWavesClean}];fetch('/api/session/end',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:sessionId,score:score,wave_reached:wave,duration_ms:dur,cause_of_death:cause,credits_wasted:credits,gun_stats:gunStats,enemy_kills:enemyKills,upgrade_log:upgradeLog,weird_stats:ws})}).then(function(){loadLeaderboard();}).catch(function(){});}");
  L.push("function playAgain(){gameState='menu';setUI();loadLeaderboard();}");
  L.push("function loadLeaderboard(){fetch('/api/leaderboard').then(function(r){return r.json();}).then(function(d){leaderboardData=d.rows||[];}).catch(function(){});}");
  L.push("canvas.addEventListener('touchstart',function(e){e.preventDefault();const t=e.touches[0],rect=canvas.getBoundingClientRect();const tx=(t.clientX-rect.left)*(W/rect.width),ty=(t.clientY-rect.top)*(H/rect.height);touchStartX=tx;if(gameState==='gameover')return;if(showShop){if(ty>H-68&&ty<H-20&&tx>W/2-90&&tx<W/2+90){spawnWave();return;}shopItems.forEach(function(g,i){const sy=118+i*78;if(ty>sy&&ty<sy+70&&tx>20&&tx<W-20)buyGun(g.id);});return;}},{passive:false});");
  L.push("canvas.addEventListener('touchmove',function(e){e.preventDefault();if(gameState!=='playing'||showShop)return;const t=e.touches[0],rect=canvas.getBoundingClientRect();const tx=(t.clientX-rect.left)*(W/rect.width);if(touchStartX!==null){const dx=tx-touchStartX;playerX=Math.max(0,Math.min(W-42,playerX+dx*0.7));touchStartX=tx;stats.pixelsMoved+=Math.abs(dx*0.7);}},{passive:false});");
  L.push("canvas.addEventListener('click',function(e){const rect=canvas.getBoundingClientRect();const cx=(e.clientX-rect.left)*(W/rect.width),cy=(e.clientY-rect.top)*(H/rect.height);if(showShop){if(cy>H-68&&cy<H-20&&cx>W/2-90&&cx<W/2+90){spawnWave();return;}shopItems.forEach(function(g,i){const sy=118+i*78;if(cy>sy&&cy<sy+70&&cx>20&&cx<W-20)buyGun(g.id);});}});");
  L.push("document.addEventListener('keydown',function(e){if(gameState==='playing'&&!showShop){if(e.key==='ArrowLeft'||e.key==='a')playerX=Math.max(0,playerX-8);if(e.key==='ArrowRight'||e.key==='d')playerX=Math.min(W-42,playerX+8);if(e.key==='q'||e.key==='Q')switchGun(-1);if(e.key==='e'||e.key==='E')switchGun(1);}if(showShop){if(e.key===' ')spawnWave();const n=parseInt(e.key);if(!isNaN(n)&&shopItems[n-1])buyGun(shopItems[n-1].id);}if(gameState==='gameover'&&e.key==='Enter')playAgain();});");
  L.push("setInterval(function(){if(gameState==='playing'&&!showShop)shoot();},50);");
  L.push("function drawFrame(){ctx.fillStyle='#000010';ctx.fillRect(0,0,W,H);ctx.fillStyle='#ffffff';stars.forEach(function(s){ctx.globalAlpha=s.s/2;ctx.fillRect(s.x,s.y,s.s,s.s);});ctx.globalAlpha=1;if(gameState==='menu'){drawMenu();return;}if(gameState==='gameover'){ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);text('GAME OVER',W/2,H/2,36,'#ff4444','center');return;}if(showShop){drawShop();return;}drawPlayer();enemies.forEach(drawEnemy);bullets.forEach(drawBullet);particles.forEach(drawParticle);drawHUD();}");
  L.push("function loop(){update();drawFrame();requestAnimationFrame(loop);}");
  L.push("loadSprites();loadLeaderboard();setUI();loop();");
  return L.join("\n");
}

function buildGameHTML(sprites) {
  const script = buildGameScript(sprites);
  const parts = [
    "<!DOCTYPE html>",
    "<html lang='en'><head>",
    "<meta charset='UTF-8'>",
    "<meta name='viewport' content='width=device-width,initial-scale=1,user-scalable=no,viewport-fit=cover'>",
    "<title>Space Shooter</title>",
    "<style>",
    "*{margin:0;padding:0;box-sizing:border-box;}",
    "body{background:#000010;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;min-height:100vh;min-height:100dvh;font-family:monospace;overflow:hidden;padding-top:env(safe-area-inset-top);}",
    "#wrap{position:relative;width:100%;max-width:480px;}",
    "canvas{display:block;touch-action:none;width:100%;height:auto;}",
    "#nameBox{width:100%;max-width:480px;padding:10px 12px;background:#000;border-top:1px solid #1a1a1a;display:flex;gap:8px;align-items:center;}",
    "#nameInput{flex:1;background:#0d0d0d;border:1px solid #2a2a2a;color:#fff;font-family:monospace;font-size:16px;padding:11px 12px;border-radius:6px;outline:none;-webkit-appearance:none;}",
    "#nameInput:focus{border-color:#00ff88;}",
    "#playBtn{background:#00ff88;color:#000;border:none;padding:11px 16px;font-family:monospace;font-size:15px;font-weight:bold;cursor:pointer;border-radius:6px;white-space:nowrap;-webkit-tap-highlight-color:transparent;}",
    "#gunBar{width:100%;max-width:480px;padding:8px 10px;background:#000;border-top:1px solid #1a1a1a;display:none;flex-direction:row;align-items:center;justify-content:space-between;gap:8px;}",
    ".gBtn{background:#0d0d0d;color:#fff;border:1px solid #2a2a2a;font-size:20px;padding:10px 18px;cursor:pointer;border-radius:6px;-webkit-tap-highlight-color:transparent;user-select:none;}",
    ".gBtn:active{background:#1a1a1a;}",
    "#gunLabel{color:#aaa;font-family:monospace;font-size:13px;text-align:center;flex:1;}",
    "#gameOver{width:100%;max-width:480px;padding:16px 12px;background:#000;border-top:1px solid #330000;display:none;flex-direction:column;align-items:center;gap:10px;}",
    "#scoreInfo{color:#888;font-size:12px;text-align:center;line-height:1.8;}",
    "#againBtn{background:#00ff88;color:#000;border:none;padding:12px 32px;font-family:monospace;font-size:16px;font-weight:bold;cursor:pointer;border-radius:6px;-webkit-tap-highlight-color:transparent;}",
    "#adminLink{color:#222;font-size:10px;padding:4px;text-align:center;width:100%;max-width:480px;}",
    "#adminLink a{color:#222;}",
    "</style>",
    "</head><body>",
    "<div id='wrap'><canvas id='gc'></canvas></div>",
    "<div id='nameBox'>",
    "  <input type='text' id='nameInput' placeholder='your name' maxlength='16' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false'>",
    "  <button id='playBtn' onclick='startGame()'>PLAY \u25B6</button>",
    "</div>",
    "<div id='gunBar'>",
    "  <button class='gBtn' onclick='switchGun(-1)'>\u25C0</button>",
    "  <div id='gunLabel'>\u26A1 Laser</div>",
    "  <button class='gBtn' onclick='switchGun(1)'>\u25B6</button>",
    "</div>",
    "<div id='gameOver'>",
    "  <div id='scoreInfo'></div>",
    "  <button id='againBtn' onclick='playAgain()'>PLAY AGAIN</button>",
    "</div>",
    "<div id='adminLink'><a href='/admin'>add enemies from photos</a></div>",
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
    "<style>body{background:#000;color:#aaa;font-family:monospace;padding:24px;max-width:600px;margin:0 auto;}h1{color:#00ff88;margin-bottom:4px;}h2{color:#ffdd00;margin:24px 0 12px;font-size:15px;}input[type=file]{color:#aaa;padding:8px;border:1px solid #333;background:#111;width:100%;margin-bottom:10px;font-size:16px;}button.upload{background:#004400;color:#00ff88;border:1px solid #00ff88;padding:12px 24px;cursor:pointer;font-family:monospace;font-size:16px;border-radius:4px;width:100%;}table{width:100%;border-collapse:collapse;margin-top:8px;}td{padding:6px 0;}#msg{padding:10px;margin:10px 0;border-radius:3px;display:none;}.ok{background:#003300;color:#4f4;border:1px solid #4f4;}.er{background:#330000;color:#f44;border:1px solid #f44;}a{color:#00ff88;text-decoration:none;}</style>",
    "</head><body>",
    "<h1>\uD83D\uDC7E Space Shooter Admin</h1>",
    "<a href='/'>\u2190 back to game</a>",
    "<h2>Upload Enemy Images</h2>",
    "<p style='font-size:12px;color:#555;margin-bottom:12px;'>Tap Choose File to pick photos from your library. They become enemies immediately.</p>",
    "<div id='msg'></div>",
    "<input type='file' id='file' accept='image/*' multiple>",
    "<button class='upload' onclick='upload()'>Upload to R2</button>",
    "<h2>Current Sprites (" + spriteList.length + ")</h2>",
    spriteList.length === 0 ? "<p style='color:#444;font-size:13px;'>No sprites yet.</p>" : "",
    "<table>" + rows + "</table>",
    "<script>function msg(t,ok){const d=document.getElementById('msg');d.textContent=t;d.className=ok?'ok':'er';d.style.display='block';setTimeout(function(){d.style.display='none';},4000);}function upload(){const f=document.getElementById('file').files;if(!f.length){msg('No file selected',false);return;}let done=0;Array.from(f).forEach(function(file){const form=new FormData();form.append('file',file);form.append('name',file.name);fetch('/admin/upload',{method:'POST',body:form}).then(function(r){return r.json();}).then(function(d){done++;if(done===f.length){msg('Uploaded '+done+' file(s) - refresh game!',true);}}).catch(function(e){msg('Failed: '+e,false);});});}function del(key){if(!confirm('Delete '+key+'?'))return;fetch('/admin/sprite/'+encodeURIComponent(key),{method:'DELETE'}).then(function(r){return r.json();}).then(function(d){if(d.ok){location.reload();}else{alert('Error: '+d.error);}}).catch(function(){alert('Delete failed');});}</script>",
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
  const sc = Number(score) || 0, wr = Number(wave_reached) || 0, dur = Number(duration_ms) || 0, cw = Number(credits_wasted) || 0;
  await env.DB.prepare("UPDATE sessions SET score=?,wave_reached=?,duration_ms=?,credits_earned=?,credits_wasted=?,ended_at=datetime('now'),cause_of_death=? WHERE id=?").bind(sc, wr, dur, sc, cw, safe(cause_of_death || "unknown"), session_id).run();
  if (gun_stats && typeof gun_stats === "object") { for (const [gid, gs] of Object.entries(gun_stats)) { const g = gs || {}; await env.DB.prepare("INSERT INTO gun_stats (session_id,gun_type,shots_fired,shots_hit,damage_dealt,kills) VALUES (?,?,?,?,?,?) ON CONFLICT(session_id,gun_type) DO UPDATE SET shots_fired=excluded.shots_fired,shots_hit=excluded.shots_hit,damage_dealt=excluded.damage_dealt,kills=excluded.kills").bind(session_id, safe(gid), Number(g.shots)||0, Number(g.hits)||0, Number(g.damage)||0, Number(g.kills)||0).run(); } }
  if (enemy_kills && typeof enemy_kills === "object") { for (const [type, count] of Object.entries(enemy_kills)) { await env.DB.prepare("INSERT INTO enemy_kills (session_id,enemy_type,kill_count) VALUES (?,?,?) ON CONFLICT(session_id,enemy_type) DO UPDATE SET kill_count=excluded.kill_count").bind(session_id, safe(type), Number(count)||0).run(); } }
  if (Array.isArray(upgrade_log)) { for (const u of upgrade_log) { await env.DB.prepare("INSERT INTO upgrade_log (session_id,gun_id,cost,wave_number) VALUES (?,?,?,?)").bind(session_id, safe(u.gunId||""), Number(u.cost)||0, Number(u.wave)||0).run(); } }
  if (Array.isArray(weird_stats)) { for (const ws of weird_stats) { await env.DB.prepare("INSERT INTO weird_stats (session_id,stat_name,stat_value) VALUES (?,?,?)").bind(session_id, safe(ws.name||""), Number(ws.value)||0).run(); } }
  if (sc > 0) { await env.DB.prepare("INSERT INTO leaderboard (player_name,score,wave_reached,duration_ms,session_id) VALUES (?,?,?,?,?) ON CONFLICT(session_id) DO UPDATE SET score=excluded.score,wave_reached=excluded.wave_reached,duration_ms=excluded.duration_ms").bind(safe(body.player_name||""), sc, wr, dur, session_id).run(); }
  return j({ ok: true });
}

async function apiLeaderboard(env) {
  const res = await env.DB.prepare("SELECT player_name,score,wave_reached,duration_ms,achieved_at FROM leaderboard ORDER BY score DESC LIMIT 20").all();
  return j({ ok: true, rows: res.results || [] });
}

async function serveSprite(env, key) {
  const obj = await env.BUCKET.get(R2_PREFIX + key);
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, { headers: { "Content-Type": obj.httpMetadata?.contentType || "image/png", "Cache-Control": "public, max-age=86400" } });
}

async function adminUpload(env, req) {
  const form = await req.formData().catch(() => null);
  if (!form) return j({ ok: false, error: "multipart form required" }, 400);
  const file = form.get("file");
  if (!file) return j({ ok: false, error: "file field required" }, 400);
  const name = (form.get("name") || file.name || "sprite.png").replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
  await env.BUCKET.put(R2_PREFIX + name, await file.arrayBuffer(), { httpMetadata: { contentType: file.type || "image/png" } });
  return j({ ok: true, key: name });
}

async function adminDelete(env, key) { await env.BUCKET.delete(R2_PREFIX + key); return j({ ok: true }); }

async function getSpritesMap(env) {
  try { const list = await env.BUCKET.list({ prefix: R2_PREFIX }); const sprites = {}; for (const obj of (list.objects || [])) { const key = obj.key.replace(R2_PREFIX, ""); if (key) sprites[key] = "/sprites/" + key; } return sprites; } catch { return {}; }
}

async function listSpriteObjects(env) {
  try { const list = await env.BUCKET.list({ prefix: R2_PREFIX }); return (list.objects || []).map(function(o) { return { key: o.key.replace(R2_PREFIX, "") }; }).filter(function(o) { return o.key; }); } catch { return []; }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url), path = url.pathname, method = request.method;
    if (method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (path.startsWith("/sprites/")) return serveSprite(env, decodeURIComponent(path.slice(9)));
    if (path === "/admin" && method === "GET") { const sl = await listSpriteObjects(env); return new Response(buildAdminHTML(sl), { headers: { "Content-Type": "text/html;charset=UTF-8" } }); }
    if (path === "/admin/upload" && method === "POST") return adminUpload(env, request);
    if (path.startsWith("/admin/sprite/") && method === "DELETE") return adminDelete(env, decodeURIComponent(path.slice(14)));
    if (path === "/api/session/start" && method === "POST") return apiStartSession(env, request);
    if (path === "/api/session/end" && method === "POST") return apiEndSession(env, request);
    if (path === "/api/leaderboard" && method === "GET") return apiLeaderboard(env);
    if (path === "/health") return j({ ok: true, worker: WORKER_NAME, version: VERSION });
    if (path === "/admin/setup" && method === "POST") { const results = []; for (const sql of SCHEMA) { try { await env.DB.prepare(sql).run(); results.push({ ok: true }); } catch (e) { results.push({ ok: false, error: e.message }); } } return j({ ok: true, results }); }
    if (path === "/" || path === "") { const sprites = await getSpritesMap(env); return new Response(buildGameHTML(sprites), { headers: { "Content-Type": "text/html;charset=UTF-8" } }); }
    return j({ error: "Not found" }, 404);
  }
};