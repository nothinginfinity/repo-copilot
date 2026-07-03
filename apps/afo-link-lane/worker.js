const VERSION = "2.7.0";
const WORKER_NAME = "afo-link-lane";
const R2_PREFIX = "link-lane/og-images/";
const CORS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,DELETE,OPTIONS","Access-Control-Allow-Headers":"Content-Type"};

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS links (id TEXT PRIMARY KEY, url TEXT NOT NULL, title TEXT, description TEXT, domain TEXT, og_image_key TEXT, group_name TEXT, video_id TEXT, is_short INTEGER DEFAULT 0, published_at TEXT, added_at TEXT DEFAULT (datetime('now')))",
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_links_url ON links(url)",
  "CREATE TABLE IF NOT EXISTS selected_cards (id TEXT PRIMARY KEY, link_id TEXT, selected_face INTEGER, gesture TEXT, status TEXT DEFAULT 'saved', priority INTEGER DEFAULT 0, title TEXT, url TEXT, domain TEXT, face_snapshot_json TEXT, r2_snapshot_key TEXT, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))",
  "CREATE INDEX IF NOT EXISTS idx_selected_cards_status ON selected_cards(status, created_at)",
  "CREATE TABLE IF NOT EXISTS selected_card_faces (id TEXT PRIMARY KEY, card_id TEXT, face_index INTEGER, label TEXT, value TEXT, text TEXT, image_key TEXT, vector_id TEXT, created_at TEXT DEFAULT (datetime('now')))",
  "CREATE INDEX IF NOT EXISTS idx_scf_card ON selected_card_faces(card_id, face_index)",
  "CREATE TABLE IF NOT EXISTS selected_card_events (id TEXT PRIMARY KEY, card_id TEXT, event_type TEXT, event_json TEXT, created_at TEXT DEFAULT (datetime('now')))",
  "CREATE INDEX IF NOT EXISTS idx_sce_card ON selected_card_events(card_id, created_at)",
  "CREATE TABLE IF NOT EXISTS card_notes (id TEXT PRIMARY KEY, card_id TEXT, note_text TEXT, tags_json TEXT, created_at TEXT DEFAULT (datetime('now')))",
  "CREATE INDEX IF NOT EXISTS idx_card_notes_card ON card_notes(card_id, created_at)",
  "CREATE TABLE IF NOT EXISTS ad_campaigns (id TEXT PRIMARY KEY, advertiser_id TEXT, name TEXT, status TEXT, budget_json TEXT, targeting_json TEXT, created_at TEXT DEFAULT (datetime('now')))",
  "CREATE TABLE IF NOT EXISTS ad_creatives (id TEXT PRIMARY KEY, campaign_id TEXT, creative_type TEXT, title TEXT, copy TEXT, media_r2_key TEXT, landing_url TEXT, reward_json TEXT, terms_json TEXT, status TEXT, created_at TEXT DEFAULT (datetime('now')))",
  "CREATE INDEX IF NOT EXISTS idx_ad_creatives_campaign ON ad_creatives(campaign_id)",
  "CREATE TABLE IF NOT EXISTS ad_entities (id TEXT PRIMARY KEY, campaign_id TEXT, creative_id TEXT, entity_type TEXT, spawn_json TEXT, state TEXT, created_at TEXT DEFAULT (datetime('now')))",
  "CREATE TABLE IF NOT EXISTS bounty_vault_items (id TEXT PRIMARY KEY, user_id TEXT, ad_entity_id TEXT, campaign_id TEXT, creative_id TEXT, status TEXT, reward_type TEXT, reward_value TEXT, coupon_code TEXT, claim_url TEXT, expires_at TEXT, captured_context_json TEXT, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))",
  "CREATE INDEX IF NOT EXISTS idx_bounty_vault_status ON bounty_vault_items(status, created_at)",
  "CREATE TABLE IF NOT EXISTS ad_interaction_events (id TEXT PRIMARY KEY, user_id TEXT, ad_entity_id TEXT, campaign_id TEXT, creative_id TEXT, vault_item_id TEXT, event_type TEXT, event_json TEXT, created_at TEXT DEFAULT (datetime('now')))",
  "CREATE INDEX IF NOT EXISTS idx_ad_interaction_vault ON ad_interaction_events(vault_item_id, created_at)",
  "CREATE TABLE IF NOT EXISTS ad_rewards (id TEXT PRIMARY KEY, vault_item_id TEXT, user_id TEXT, reward_type TEXT, amount TEXT, status TEXT, reason TEXT, created_at TEXT DEFAULT (datetime('now')))",
  "CREATE INDEX IF NOT EXISTS idx_ad_rewards_vault ON ad_rewards(vault_item_id)",
  "CREATE TABLE IF NOT EXISTS user_ad_preferences (user_id TEXT PRIMARY KEY, preferences_json TEXT, blocked_categories_json TEXT, updated_at TEXT DEFAULT (datetime('now')))"
];

const R_GALAXY = 1500;

function j(v,s=200){return Response.json(v,{status:s,headers:CORS});}
function uid(){return Math.random().toString(36).slice(2,9)+Date.now().toString(36);}
function safe(v){return String(v||"").replace(/[<>"']/g,"");}

function fibPoint(i,n,radius){
  if(n<=1) return {x:0,y:0,z:radius};
  const golden=Math.PI*(3-Math.sqrt(5));
  const y=1-(i/(n-1))*2;
  const r=Math.sqrt(Math.max(0,1-y*y));
  const theta=golden*i;
  return {x:Math.cos(theta)*r*radius, y:y*radius, z:Math.sin(theta)*r*radius};
}

function clusterRadius(count){
  return Math.max(55, Math.min(500, 36*Math.sqrt(count)));
}

function layoutLinks(links){
  const groups={};
  links.forEach(function(l){const d=l.group_name||l.domain||"other";(groups[d]=groups[d]||[]).push(l);});
  const domains=Object.keys(groups);
  const anchors={};
  domains.forEach(function(d,i){const p=fibPoint(i,domains.length,R_GALAXY);anchors[d]={x:p.x,y:p.y,z:p.z,count:groups[d].length};});
  const galaxies=domains.map(function(d){const a=anchors[d];return{x:a.x,y:a.y,z:a.z,name:d,radius:clusterRadius(a.count),count:a.count};});
  const placed=[];
  domains.forEach(function(d){
    const group=groups[d],a=anchors[d];
    const localR=clusterRadius(group.length);
    group.forEach(function(l,idx){
      const off=fibPoint(idx,group.length,localR);
      placed.push(Object.assign({},l,{x:a.x+off.x,y:a.y+off.y,z:a.z+off.z}));
    });
  });
  const start=galaxies.length>0?{x:galaxies[0].x*0.3,y:galaxies[0].y*0.3+40,z:galaxies[0].z*0.3+220}:{x:0,y:0,z:400};
  return {links:placed,galaxies:galaxies,start:start};
}

// =================== HTML/meta extraction ===================

function decodeHtmlEntities(s){
  return s.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&apos;/g,"'");
}

function extractMetaProperty(html,property){
  const patterns=[
    new RegExp("<meta[^>]+property=[\"']"+property+"[\"'][^>]+content=[\"']([^\"']*)[\"']","i"),
    new RegExp("<meta[^>]+content=[\"']([^\"']*)[\"'][^>]+property=[\"']"+property+"[\"']","i")
  ];
  for(const re of patterns){const m=html.match(re);if(m)return decodeHtmlEntities(m[1]);}
  return null;
}

function extractMetaName(html,name){
  const patterns=[
    new RegExp("<meta[^>]+name=[\"']"+name+"[\"'][^>]+content=[\"']([^\"']*)[\"']","i"),
    new RegExp("<meta[^>]+content=[\"']([^\"']*)[\"'][^>]+name=[\"']"+name+"[\"']","i")
  ];
  for(const re of patterns){const m=html.match(re);if(m)return decodeHtmlEntities(m[1]);}
  return null;
}

function extractTitle(html){
  const m=html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m?decodeHtmlEntities(m[1].trim()):null;
}

function resolveUrl(base,maybeRelative){
  try{return new URL(maybeRelative,base).toString();}catch{return null;}
}

function youtubeVideoId(url){
  try{
    const u=new URL(url);
    if(u.hostname==="youtu.be") return u.pathname.slice(1);
    if(u.hostname.endsWith("youtube.com")){
      if(u.pathname==="/watch") return u.searchParams.get("v");
      if(u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2];
      if(u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2];
    }
  }catch{}
  return null;
}

async function fetchOembedPreview(url){
  const res=await fetch("https://www.youtube.com/oembed?url="+encodeURIComponent(url)+"&format=json");
  if(!res.ok) throw new Error("oEmbed failed: HTTP "+res.status);
  const data=await res.json();
  return {title:data.title||url,description:data.author_name?("by "+data.author_name):"",ogImageUrl:data.thumbnail_url||null,finalUrl:url};
}

async function fetchLinkPreview(targetUrl){
  // YouTube blocks direct scraping of /watch pages from datacenter IPs with a CAPTCHA wall.
  // Their official oEmbed endpoint is designed for exactly this use case and isn't blocked.
  const ytId=youtubeVideoId(targetUrl);
  if(ytId){
    try{ return await fetchOembedPreview(targetUrl); }catch{ /* fall through to generic scraping below */ }
  }
  const res=await fetch(targetUrl,{headers:{"User-Agent":"Mozilla/5.0 (compatible; AFOLinkLane/1.0)"},redirect:"follow"});
  if(!res.ok) throw new Error("Fetch failed: HTTP "+res.status);
  const html=(await res.text()).slice(0,200000);
  const finalUrl=res.url||targetUrl;
  const ogImage=extractMetaProperty(html,"og:image")||extractMetaProperty(html,"twitter:image");
  const title=extractMetaProperty(html,"og:title")||extractTitle(html)||finalUrl;
  const description=extractMetaProperty(html,"og:description")||extractMetaName(html,"description")||"";
  const resolvedImage=ogImage?resolveUrl(finalUrl,ogImage):null;
  return {title,description,ogImageUrl:resolvedImage,finalUrl};
}

async function storeOgImage(env,id,imageUrl){
  try{
    const res=await fetch(imageUrl);
    if(!res.ok) return null;
    const contentType=res.headers.get("content-type")||"image/jpeg";
    if(!contentType.startsWith("image/")) return null;
    const buf=await res.arrayBuffer();
    if(buf.byteLength>8000000) return null;
    const ext=contentType.includes("png")?"png":contentType.includes("webp")?"webp":contentType.includes("gif")?"gif":"jpg";
    const key=R2_PREFIX+id+"."+ext;
    await env.BUCKET.put(key,buf,{httpMetadata:{contentType}});
    return key;
  }catch{return null;}
}

function domainOf(url){
  try{return new URL(url).hostname.replace(/^www\./,"");}catch{return "other";}
}

// =================== YouTube channel RSS (channel groups) ===================

function extractChannelId(html){
  // Canonical link is authoritative by construction - always the page's own
  // channel. The generic 'channelId':'UC...' JSON pattern is NOT reliable:
  // it matches the first such string anywhere in the page's data blob,
  // which is often a recommended video, ad, or related channel instead of
  // the one actually being viewed - confirmed via a real mismatch on
  // @mrbeast. Check canonical first, meta itemprop second, loose JSON last.
  let m=html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[0-9A-Za-z_-]{22})"/i);
  if(m) return m[1];
  m=html.match(/<meta itemprop="channelId" content="([^"]+)"/i);
  if(m) return m[1];
  m=html.match(/"channelId":"(UC[0-9A-Za-z_-]{22})"/);
  if(m) return m[1];
  return null;
}

async function resolveChannelId(input){
  const raw=String(input||"").trim();
  if(/^UC[0-9A-Za-z_-]{22}$/.test(raw)) return {channelId:raw,channelName:raw};
  let pageUrl=raw;
  if(!/^https?:\/\//i.test(pageUrl)) pageUrl="https://www.youtube.com/"+pageUrl.replace(/^\/+/,"");
  const res=await fetch(pageUrl,{headers:{"User-Agent":"Mozilla/5.0 (compatible; AFOLinkLane/1.0)"}});
  if(!res.ok) throw new Error("Could not load channel page: HTTP "+res.status);
  const html=await res.text();
  const channelId=extractChannelId(html);
  if(!channelId) throw new Error("Could not resolve a channel ID from that input - try the full channel URL.");
  const channelName=extractMetaProperty(html,"og:title")||raw;
  return {channelId,channelName};
}

// Generic RSS 2.0 / Atom parser (unlike parseAtomFeed above, which is
// YouTube-specific and relies on yt:videoId). Handles <item> (RSS) or
// <entry> (Atom) blocks, common image sources (enclosure, media:content,
// media:thumbnail, first <img> in description), and CDATA-wrapped text.
function stripCdata(s){
  const m=String(s||"").match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
  return m?m[1]:(s||"");
}
function parseGenericFeed(xml,limit){
  const entries=[];
  let blocks=xml.split(/<item[\s>]/i).slice(1);
  if(blocks.length===0) blocks=xml.split(/<entry[\s>]/i).slice(1);
  for(const raw of blocks.slice(0,limit)){
    const block=raw.split(/<\/(item|entry)>/i)[0];
    const title=decodeHtmlEntities(stripCdata((block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||"")).trim();
    let link=null;
    let m=block.match(/<link[^>]*href=["']([^"']+)["']/i);
    if(m) link=m[1];
    else { m=block.match(/<link[^>]*>([^<]*)<\/link>/i); if(m) link=m[1].trim(); }
    const pub=(block.match(/<(?:pubDate|published|updated)>([^<]+)<\/(?:pubDate|published|updated)>/i)||[])[1]||"";
    let desc=stripCdata((block.match(/<(?:description|summary|content)[^>]*>([\s\S]*?)<\/(?:description|summary|content)>/i)||[])[1]||"");
    desc=decodeHtmlEntities(desc.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()).slice(0,300);
    let image=null;
    m=block.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image\/[^"']*["']/i)
      ||block.match(/<media:content[^>]*url=["']([^"']+)["']/i)
      ||block.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i);
    if(m) image=m[1];
    if(!image){ m=block.match(/<img[^>]+src=["']([^"']+)["']/i); if(m) image=m[1]; }
    if(title&&link) entries.push({title,link,published:pub,description:desc,image});
  }
  return entries;
}
async function apiAddFeed(env,req){
  const body=await req.json().catch(()=>({}));
  const feedUrl=body.feed_url;
  const max=Math.max(1,Math.min(Number(body.max||15),30));
  if(!feedUrl) return j({ok:false,error:"feed_url required"},400);
  let xml;
  try{
    const res=await fetch(feedUrl,{headers:{"User-Agent":"Mozilla/5.0 (compatible; AFOLinkLane/1.0)"},redirect:"follow"});
    if(!res.ok) throw new Error("Feed fetch failed: HTTP "+res.status);
    xml=await res.text();
  }catch(e){ return j({ok:false,error:e.message},400); }
  const feedTitleMatch=xml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const groupName=(body.name&&String(body.name).trim())||decodeHtmlEntities(stripCdata(feedTitleMatch?feedTitleMatch[1]:"")).trim()||domainOf(feedUrl);
  const items=parseGenericFeed(xml,max);
  if(items.length===0) return j({ok:false,error:"No entries found in feed (unsupported format or empty feed)."},400);
  let added=0,skipped=0;
  for(const it of items){
    const url=it.link;
    if(!url) continue;
    const existing=await env.DB.prepare("SELECT id FROM links WHERE url=?").bind(url).first();
    if(existing){ skipped++; continue; }
    const id=uid();
    let ogImageKey=null;
    if(it.image) ogImageKey=await storeOgImage(env,id,it.image);
    let publishedAt=null;
    if(it.published){ const d=new Date(it.published); if(!isNaN(d.getTime())) publishedAt=d.toISOString().slice(0,10); }
    await env.DB.prepare("INSERT OR IGNORE INTO links (id,url,title,description,domain,og_image_key,group_name,published_at) VALUES (?,?,?,?,?,?,?,?)")
      .bind(id,url,it.title||url,it.description||"",domainOf(url),ogImageKey,groupName,publishedAt).run();
    added++;
  }
  return j({ok:true,feed:groupName,added,skipped,found:items.length});
}

function parseAtomFeed(xml,limit){
  const entries=[];
  const blocks=xml.split("<entry>").slice(1);
  for(const block of blocks.slice(0,limit)){
    const videoId=(block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)||[])[1];
    const title=decodeHtmlEntities((block.match(/<title>([^<]*)<\/title>/)||[])[1]||"");
    const published=(block.match(/<published>([^<]+)<\/published>/)||[])[1]||"";
    const thumb=(block.match(/<media:thumbnail url="([^"]+)"/)||[])[1]||null;
    if(videoId) entries.push({videoId,title,published,thumb,url:"https://www.youtube.com/watch?v="+videoId});
  }
  return entries;
}

async function fetchChannelVideos(channelId,limit){
  const res=await fetch("https://www.youtube.com/feeds/videos.xml?channel_id="+encodeURIComponent(channelId));
  if(!res.ok) throw new Error("RSS feed fetch failed: HTTP "+res.status);
  const xml=await res.text();
  return parseAtomFeed(xml,limit);
}

// A real Short stays on /shorts/{id}; a regular video gets redirected to
// /watch?v={id}. (oEmbed's width/height is just a scaled default embed size,
// not the video's true aspect ratio - it does not distinguish Shorts.)
async function detectShort(videoId){
  try{
    const res=await fetch("https://www.youtube.com/shorts/"+videoId,{headers:{"User-Agent":"Mozilla/5.0 (compatible; AFOLinkLane/1.0)"},redirect:"follow"});
    res.body&&res.body.cancel&&res.body.cancel();
    return res.url.includes("/shorts/");
  }catch{return false;}
}

async function apiAddChannel(env,req){
  const body=await req.json().catch(()=>({}));
  const input=body.input;
  const max=Math.max(1,Math.min(Number(body.max||15),25));
  if(!input) return j({ok:false,error:"input required"},400);
  let resolved;
  try{ resolved=await resolveChannelId(input); }catch(e){ return j({ok:false,error:e.message},400); }
  let videos;
  try{ videos=await fetchChannelVideos(resolved.channelId,max); }catch(e){ return j({ok:false,error:e.message},400); }
  if(videos.length===0) return j({ok:false,error:"Channel RSS feed returned no videos."},400);
  const groupName=resolved.channelName||resolved.channelId;
  let added=0,skipped=0,shorts=0;
  for(const v of videos){
    const existing=await env.DB.prepare("SELECT id FROM links WHERE video_id=? OR url=?").bind(v.videoId,v.url).first();
    if(existing){ skipped++; continue; }
    const isShort=await detectShort(v.videoId);
    if(isShort) shorts++;
    const finalUrl=isShort?("https://www.youtube.com/shorts/"+v.videoId):v.url;
    const id=uid();
    let ogImageKey=null;
    if(v.thumb) ogImageKey=await storeOgImage(env,id,v.thumb);
    const publishedAt=v.published?v.published.slice(0,10):null;
    const desc="by "+groupName;
    await env.DB.prepare("INSERT OR IGNORE INTO links (id,url,title,description,domain,og_image_key,group_name,video_id,is_short,published_at) VALUES (?,?,?,?,?,?,?,?,?,?)")
      .bind(id,finalUrl,v.title||finalUrl,desc,"youtube.com",ogImageKey,groupName,v.videoId,isShort?1:0,publishedAt).run();
    added++;
  }
  return j({ok:true,channel:groupName,channel_id:resolved.channelId,added,skipped,shorts,found:videos.length});
}

// =================== GAME SCRIPT ===================

function buildGameScript(layout){
  const L=[];
  L.push("const LAYOUT="+JSON.stringify(layout)+";");
  L.push("let scene,camera,renderer,raycaster;");
  L.push("let planetMeshes=[],galaxyMeshes={},galaxyAnchors={};");
  L.push("let nodeData=[],farMesh=null,farOwner=[],farActiveCount=0,thumbCursor=0;");
  L.push("let currentFormation='sphere';");
  L.push("let clusterMode='galaxies';");
  L.push("let galaxyLabels=[];");
  L.push("let insideGalaxy=null;");
  L.push("let gameState='menu';");
  L.push("let speed=3;");
  L.push("let yaw=0,pitch=0,yawVel=0,pitchVel=0;");
  L.push("const PITCH_LIMIT=1.3;");
  L.push("const MAX_PROMOTED=400;");
  L.push("let touchActive=false,touchStartX=0,touchStartY=0,lastX=0,lastY=0,isTap=true;");
  L.push("let targeted=null;");
  L.push("let frame=0;");
  L.push("const MAX_AD_ENTITIES=1;");
  L.push("const AD_WARN_RADIUS=260,AD_CONTACT_RADIUS=90,AD_CONTACT_RESET_RADIUS=150;");
  L.push("let adEntities=[],adContactNotified=false;");

  L.push("let AFO_EVENTS=[];");
  L.push("function logEvent(type,data){");
  L.push("  const evt={type:type,t:Date.now(),data:data||{}};");
  L.push("  AFO_EVENTS.push(evt);");
  L.push("  if(AFO_EVENTS.length>200) AFO_EVENTS.shift();");
  L.push("  console.debug('[afo-event]',type,evt.data);");
  L.push("}");
  L.push("window.AFO_EVENTS=AFO_EVENTS;");
  L.push("let viewportWarned=false;");
  L.push("function checkViewport(){");
  L.push("  const wrap=document.getElementById('wrap');");
  L.push("  const w=wrap.clientWidth,h=wrap.clientHeight;");
  L.push("  const cramped=w<340||h<480;");
  L.push("  if(cramped&&!viewportWarned){");
  L.push("    viewportWarned=true;");
  L.push("    logEvent('mobile_viewport_warning',{width:w,height:h});");
  L.push("  }else if(!cramped&&viewportWarned){");
  L.push("    viewportWarned=false;");
  L.push("  }");
  L.push("}");

  L.push("function initScene(){");
  L.push("  const wrap=document.getElementById('wrap');");
  L.push("  scene=new THREE.Scene();");
  L.push("  camera=new THREE.PerspectiveCamera(72,wrap.clientWidth/wrap.clientHeight,0.1,6000);");
  L.push("  camera.position.set(LAYOUT.start.x,LAYOUT.start.y,LAYOUT.start.z);");
  L.push("  camera.up.set(0,1,0);");
  L.push("  camera.lookAt(0,0,0);");
  L.push("  camera.rotation.reorder('YXZ');");
  L.push("  yaw=camera.rotation.y;pitch=Math.max(-PITCH_LIMIT,Math.min(PITCH_LIMIT,camera.rotation.x));");
  L.push("  camera.quaternion.setFromEuler(new THREE.Euler(pitch,yaw,0,'YXZ'));");
  L.push("  renderer=new THREE.WebGLRenderer({antialias:true,canvas:document.getElementById('gc')});");
  L.push("  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));");
  L.push("  renderer.setSize(wrap.clientWidth,wrap.clientHeight);");
  L.push("  raycaster=new THREE.Raycaster();raycaster.far=4000;");
  L.push("  checkViewport();");
  L.push("  buildStarfield();buildGalaxies();spawnAdEntity();");
  L.push("  const ld=document.getElementById('loadScreen');");
  L.push("  if(ld){ld.classList.add('fadeOut');setTimeout(function(){ld.style.display='none';},700);}");
  L.push("  window.addEventListener('resize',onResize);");
  L.push("}");

  L.push("function onResize(){const wrap=document.getElementById('wrap');camera.aspect=wrap.clientWidth/wrap.clientHeight;camera.updateProjectionMatrix();renderer.setSize(wrap.clientWidth,wrap.clientHeight);checkViewport();}");

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

  L.push("function spawnAdEntity(){");
  L.push("  if(adEntities.length>=MAX_AD_ENTITIES) return;");
  L.push("  const core=new THREE.Mesh(new THREE.IcosahedronGeometry(16,0),new THREE.MeshBasicMaterial({color:0xff5522}));");
  L.push("  const shell=new THREE.Mesh(new THREE.IcosahedronGeometry(22,0),new THREE.MeshBasicMaterial({color:0xff9944,wireframe:true,transparent:true,opacity:0.5}));");
  L.push("  const mesh=new THREE.Group();");
  L.push("  mesh.add(core);mesh.add(shell);");
  L.push("  const sx=LAYOUT.start.x,sy=LAYOUT.start.y,sz=LAYOUT.start.z;");
  L.push("  mesh.position.set(sx+70,sy+25,sz-260);");
  L.push("  mesh.userData={");
  L.push("    id:'ad_entity_test_1',is_ad:true,entity_type:'asteroid',");
  L.push("    campaign_id:'camp_sample_1',creative_id:'creative_sample_1',");
  L.push("    title:'20% Off QuantumBrew Summer Blend',reward_value:'20% off',");
  L.push("    anchor:mesh.position.clone()");
  L.push("  };");
  L.push("  scene.add(mesh);");
  L.push("  adEntities.push(mesh);");
  L.push("}");

  L.push("function updateAdEntities(){");
  L.push("  if(!adEntities.length) return;");
  L.push("  const badge=document.getElementById('adWarnBadge');");
  L.push("  let anyWarn=false;");
  L.push("  adEntities.forEach(function(mesh){");
  L.push("    const a=mesh.userData.anchor;");
  L.push("    const t=frame*0.01;");
  L.push("    mesh.position.set(a.x+Math.sin(t)*40,a.y+Math.cos(t*0.7)*18,a.z+Math.cos(t)*40);");
  L.push("    mesh.rotation.x+=0.01;mesh.rotation.y+=0.014;");
  L.push("    const pulse=1+Math.sin(frame*0.08)*0.08;mesh.scale.set(pulse,pulse,pulse);");
  L.push("    const d=camera.position.distanceTo(mesh.position);");
  L.push("    if(d<AD_WARN_RADIUS) anyWarn=true;");
  L.push("    if(d<AD_CONTACT_RADIUS&&!adContactNotified){");
  L.push("      adContactNotified=true;");
  L.push("      showToast('\u26A0\uFE0F '+mesh.userData.title+' \u2014 '+mesh.userData.reward_value+' (debug: '+mesh.userData.campaign_id+')');");
  L.push("      logEvent('ad_entity_contact',{ad_id:mesh.userData.id,entity_type:mesh.userData.entity_type,campaign_id:mesh.userData.campaign_id});");
  L.push("    } else if(d>AD_CONTACT_RESET_RADIUS&&adContactNotified){");
  L.push("      adContactNotified=false;");
  L.push("    }");
  L.push("  });");
  L.push("  if(badge) badge.classList.toggle('show',anyWarn);");
  L.push("}");

  L.push("function showToast(msg){");
  L.push("  const t=document.getElementById('toast');if(!t) return;");
  L.push("  t.textContent=msg;t.classList.add('show');");
  L.push("  clearTimeout(t._hideTimer);");
  L.push("  t._hideTimer=setTimeout(function(){t.classList.remove('show');},2200);");
  L.push("}");

  L.push("function checkZoneEntry(){");
  L.push("  if(clusterMode==='supercluster'){insideGalaxy=null;return;}");
  L.push("  let inside=null;");
  L.push("  Object.keys(galaxyAnchors).forEach(function(k){");
  L.push("    const a=galaxyAnchors[k];");
  L.push("    const d=Math.sqrt((camera.position.x-a.x)**2+(camera.position.y-a.y)**2+(camera.position.z-a.z)**2);");
  L.push("    if(d<a.radius) inside=k;");
  L.push("  });");
  L.push("  if(inside!==insideGalaxy){if(inside) showToast('\uD83C\uDF10 Entering '+inside);insideGalaxy=inside;}");
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
  L.push("  const turns=3.2;const t=n<=1?0:i/(n-1);const ang=t*turns*Math.PI*2;const rad=t*r;const yh=(t-0.5)*r*0.7;");
  L.push("  return {x:Math.cos(ang)*rad,y:yh,z:Math.sin(ang)*rad};");
  L.push("}");
  L.push("function fmtCube(i,n,r){");
  L.push("  const side=Math.max(1,Math.ceil(Math.pow(n,1/3)));");
  L.push("  const x=(i%side)-(side-1)/2,y=Math.floor((i/side)%side)-(side-1)/2,z=Math.floor(i/(side*side))-(side-1)/2;");
  L.push("  const sp=(r*2)/side;");
  L.push("  return {x:x*sp,y:y*sp,z:z*sp};");
  L.push("}");
  L.push("function fmtTorus(i,n,r){");
  L.push("  const minor=r*0.32,major=r*0.78;");
  L.push("  const u=(i/Math.max(1,n))*Math.PI*4,v=((i*7)%Math.max(1,n)/Math.max(1,n))*Math.PI*2;");
  L.push("  const x=(major+minor*Math.cos(v))*Math.cos(u),y=(major+minor*Math.cos(v))*Math.sin(u),z=minor*Math.sin(v);");
  L.push("  return {x:x,y:y,z:z};");
  L.push("}");
  L.push("const FORMATIONS={sphere:fmtSphere,spiral:fmtSpiral,cube:fmtCube,torus:fmtTorus};");
  L.push("const FORMATION_GEO={");
  L.push("  sphere:function(r){return new THREE.SphereGeometry(r,16,12);},");
  L.push("  spiral:function(r){return new THREE.SphereGeometry(r,16,12);},");
  L.push("  cube:function(r){return new THREE.BoxGeometry(r*1.5,r*1.5,r*1.5);},");
  L.push("  torus:function(r){return new THREE.TorusGeometry(r*0.78,r*0.32,8,24);}");
  L.push("};");

  L.push("function superclusterRadius(count){return Math.max(1200,Math.min(3000,90*Math.sqrt(count)));}");
  L.push("function repositionAll(){");
  L.push("  const _rm4=new THREE.Matrix4();");
  L.push("  if(clusterMode==='supercluster'){");
  L.push("    const r=superclusterRadius(nodeData.length);");
  L.push("    planetMeshes.forEach(function(mesh){");
  L.push("      const off=FORMATIONS[currentFormation](mesh.userData.globalIdx,nodeData.length,r);");
  L.push("      mesh.position.set(off.x,off.y,off.z);");
  L.push("      mesh.userData.x=off.x;mesh.userData.y=off.y;mesh.userData.z=off.z;");
  L.push("    });");
  L.push("    nodeData.forEach(function(p){");
  L.push("      if(p.promoted) return;");
  L.push("      const off=FORMATIONS[currentFormation](p.globalIdx,nodeData.length,r);");
  L.push("      p.x=off.x;p.y=off.y;p.z=off.z;");
  L.push("      _rm4.makeTranslation(p.x,p.y,p.z);");
  L.push("      farMesh.setMatrixAt(p.farSlot,_rm4);");
  L.push("    });");
  L.push("  } else {");
  L.push("    planetMeshes.forEach(function(mesh){");
  L.push("      const a=galaxyAnchors[mesh.userData.galaxyKey];if(!a) return;");
  L.push("      const off=FORMATIONS[currentFormation](mesh.userData.localIdx,mesh.userData.localCount,a.radius);");
  L.push("      mesh.position.set(a.x+off.x,a.y+off.y,a.z+off.z);");
  L.push("      mesh.userData.x=a.x+off.x;mesh.userData.y=a.y+off.y;mesh.userData.z=a.z+off.z;");
  L.push("    });");
  L.push("    nodeData.forEach(function(p){");
  L.push("      if(p.promoted) return;");
  L.push("      const a=galaxyAnchors[p.galaxyKey];if(!a) return;");
  L.push("      const off=FORMATIONS[currentFormation](p.localIdx,p.localCount,a.radius);");
  L.push("      p.x=a.x+off.x;p.y=a.y+off.y;p.z=a.z+off.z;");
  L.push("      _rm4.makeTranslation(p.x,p.y,p.z);");
  L.push("      farMesh.setMatrixAt(p.farSlot,_rm4);");
  L.push("    });");
  L.push("  }");
  L.push("  farMesh.instanceMatrix.needsUpdate=true;");
  L.push("}");

  L.push("function applyFormation(name){");
  L.push("  if(!FORMATIONS[name]) return;");
  L.push("  currentFormation=name;");
  L.push("  repositionAll();");
  L.push("  document.querySelectorAll('.fmtBtn').forEach(function(b){b.classList.toggle('active',b.dataset.f===name);});");
  L.push("  showToast('Formation: '+name.charAt(0).toUpperCase()+name.slice(1));");
  L.push("}");

  L.push("function setClusterMode(mode){");
  L.push("  if(mode===clusterMode) return;");
  L.push("  clusterMode=mode;");
  L.push("  galaxyLabels.forEach(function(l){l.visible=(mode==='galaxies');});");
  L.push("  repositionAll();");
  L.push("  document.querySelectorAll('.clusterBtn').forEach(function(b){b.classList.toggle('active',b.dataset.c===mode);});");
  L.push("  showToast(mode==='supercluster'?'\uD83C\uDF0C Supercluster mode':'\uD83C\uDF10 Galaxy mode');");
  L.push("}");

  L.push("function makeLabelSprite(text){");
  L.push("  const c=document.createElement('canvas');c.width=256;c.height=64;");
  L.push("  const ctx=c.getContext('2d');");
  L.push("  ctx.fillStyle='rgba(0,10,20,0.55)';ctx.fillRect(0,0,256,64);");
  L.push("  ctx.strokeStyle='#00ff88';ctx.lineWidth=2;ctx.strokeRect(2,2,252,60);");
  L.push("  ctx.fillStyle='#00ff88';ctx.font='bold 24px monospace';ctx.textAlign='center';ctx.textBaseline='middle';");
  L.push("  ctx.fillText(text.slice(0,20),128,33);");
  L.push("  const tex=new THREE.CanvasTexture(c);");
  L.push("  const mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false});");
  L.push("  const spr=new THREE.Sprite(mat);spr.scale.set(120,30,1);");
  L.push("  return spr;");
  L.push("}");

  L.push("function makeFaceTexture(label,value,bgColor,isHighlight){");
  L.push("  const c=document.createElement('canvas');c.width=256;c.height=256;");
  L.push("  const ctx=c.getContext('2d');");
  L.push("  ctx.fillStyle=bgColor||'#0a0a18';ctx.fillRect(0,0,256,256);");
  L.push("  ctx.strokeStyle=isHighlight?'rgba(0,255,170,0.7)':'rgba(0,255,170,0.35)';ctx.lineWidth=5;ctx.strokeRect(3,3,250,250);");
  L.push("  ctx.fillStyle='#00ff88';ctx.font='bold 17px monospace';ctx.textAlign='center';");
  L.push("  ctx.fillText(label,128,34);");
  L.push("  ctx.strokeStyle='rgba(0,255,136,0.3)';ctx.beginPath();ctx.moveTo(22,48);ctx.lineTo(234,48);ctx.stroke();");
  L.push("  ctx.fillStyle='#e0e0e0';ctx.font='15px monospace';");
  L.push("  const words=String(value||'(none)').split(' ');let lines=[],cur='';");
  L.push("  words.forEach(function(w){const t=cur?cur+' '+w:w;if(ctx.measureText(t).width>216){lines.push(cur);cur=w;}else cur=t;});");
  L.push("  if(cur)lines.push(cur);lines=lines.slice(0,8);");
  L.push("  const startY=128-(lines.length-1)*11;");
  L.push("  lines.forEach(function(line,i){ctx.fillText(line,128,startY+i*22);});");
  L.push("  return new THREE.CanvasTexture(c);");
  L.push("}");

  L.push("function buildGalaxies(){");
  L.push("  LAYOUT.galaxies.forEach(function(g){");
  L.push("    galaxyAnchors[g.name]={x:g.x,y:g.y,z:g.z,radius:g.radius};");
  L.push("    const label=makeLabelSprite('\uD83C\uDF10 '+g.name);");
  L.push("    label.position.set(g.x,g.y+g.radius+55,g.z);scene.add(label);galaxyLabels.push(label);");
  L.push("  });");
  L.push("  const counts={};");
  L.push("  LAYOUT.links.forEach(function(p){const k=p.group_name||p.domain||'other';counts[k]=(counts[k]||0)+1;});");
  L.push("  const idxCursor={};");
  L.push("  const n=LAYOUT.links.length;");
  L.push("  const farGeo=new THREE.BoxGeometry(28,28,28);");
  L.push("  const farMat=new THREE.MeshBasicMaterial({color:0x223344});");
  L.push("  farMesh=new THREE.InstancedMesh(farGeo,farMat,Math.max(n,1));");
  L.push("  farMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);");
  L.push("  const _bm4=new THREE.Matrix4();");
  L.push("  LAYOUT.links.forEach(function(p,i){");
  L.push("    const k=p.group_name||p.domain||'other';");
  L.push("    const localIdx=idxCursor[k]=(idxCursor[k]||0);idxCursor[k]++;");
  L.push("    const entry=Object.assign({},p,{galaxyKey:k,localIdx:localIdx,localCount:counts[k],globalIdx:i,promoted:false,farSlot:i,loadedTier:'none',loadingTier:null});");
  L.push("    nodeData.push(entry);");
  L.push("    _bm4.makeTranslation(p.x,p.y,p.z);");
  L.push("    farMesh.setMatrixAt(i,_bm4);");
  L.push("    farOwner.push(i);");
  L.push("  });");
  L.push("  farActiveCount=n;");
  L.push("  farMesh.count=farActiveCount;");
  L.push("  farMesh.instanceMatrix.needsUpdate=true;");
  L.push("  scene.add(farMesh);");
  L.push("}");

  L.push("function promoteNode(i){");
  L.push("  const p=nodeData[i];");
  L.push("  if(p.promoted) return;");
  L.push("  p.promoted=true;");
  L.push("  const slot=p.farSlot;");
  L.push("  const lastSlot=farActiveCount-1;");
  L.push("  if(slot!==lastSlot){");
  L.push("    const lastNodeIdx=farOwner[lastSlot];");
  L.push("    const _pm4=new THREE.Matrix4();");
  L.push("    farMesh.getMatrixAt(lastSlot,_pm4);");
  L.push("    farMesh.setMatrixAt(slot,_pm4);");
  L.push("    farOwner[slot]=lastNodeIdx;");
  L.push("    nodeData[lastNodeIdx].farSlot=slot;");
  L.push("  }");
  L.push("  farActiveCount--;");
  L.push("  farMesh.count=farActiveCount;");
  L.push("  farMesh.instanceMatrix.needsUpdate=true;");
  L.push("  p.farSlot=-1;");
  L.push("  const geo=new THREE.BoxGeometry(28,28,28);");
  L.push("  const materials=[");
  L.push("    new THREE.MeshBasicMaterial({color:0x223344}),");
  L.push("    new THREE.MeshBasicMaterial({color:0x223344}),");
  L.push("    new THREE.MeshBasicMaterial({color:0x223344}),");
  L.push("    new THREE.MeshBasicMaterial({color:0x223344}),");
  L.push("    new THREE.MeshBasicMaterial({color:0x223344}),");
  L.push("    new THREE.MeshBasicMaterial({color:0x223344})");
  L.push("  ];");
  L.push("  const mesh=new THREE.Mesh(geo,materials);");
  L.push("  mesh.position.set(p.x,p.y,p.z);");
  L.push("  mesh.userData=p;");
  L.push("  scene.add(mesh);");
  L.push("  planetMeshes.push(mesh);");
  L.push("  loadLabelsFor(mesh);");
  L.push("}");

  L.push("function loadLabelsFor(mesh){");
  L.push("  if(mesh.userData.labelsLoaded) return;");
  L.push("  mesh.userData.labelsLoaded=true;");
  L.push("  const p=mesh.userData;");
  L.push("  const dateStr=(p.added_at||'').slice(0,10);");
  L.push("  const isYT=p.domain==='youtube.com';");
  L.push("  const typeLabel=isYT?(p.is_short?'\uD83D\uDCF1 SHORT':'\uD83C\uDFAC VIDEO'):'\uD83D\uDD17 LINK';");
  L.push("  const typeColor=p.is_short?'#2a0a1a':'#0a0a18';");
  L.push("  const pubDate=(p.published_at||dateStr||'');");
  L.push("  const faces=[[0,'TITLE',p.title||p.url,'#0a0a18',false],[1,'CHANNEL',p.group_name||p.domain,'#0a0a18',false],[2,'TYPE',typeLabel,typeColor,Boolean(p.is_short)],[3,'PUBLISHED',pubDate,'#0a0a18',false],[5,'SOURCE',p.domain,'#0a1f16',true]];");
  L.push("  faces.forEach(function(f){");
  L.push("    const mat=mesh.material[f[0]];");
  L.push("    mat.map=makeFaceTexture(f[1],f[2],f[3],f[4]);");
  L.push("    mat.color.set(0xffffff);");
  L.push("    mat.needsUpdate=true;");
  L.push("  });");
  L.push("}");

  L.push("const texLoader=new THREE.TextureLoader();");
  L.push("function desiredTier(dist){if(dist>700)return'none';if(dist>260)return'thumb';return'full';}");
  L.push("const TIER_RANK={none:0,thumb:1,full:2};");
  L.push("function loadTierFor(mesh,tier){");
  L.push("  if(tier==='none'||mesh.userData.loadingTier===tier||!mesh.userData.og_image_key) return;");
  L.push("  mesh.userData.loadingTier=tier;");
  L.push("  texLoader.load('/og-image/'+mesh.userData.id,function(tex){");
  L.push("    tex.colorSpace=THREE.SRGBColorSpace;");
  L.push("    const faceMat=mesh.material[4];faceMat.map=tex;faceMat.color.set(0xffffff);faceMat.needsUpdate=true;");
  L.push("    mesh.userData.loadedTier=tier;mesh.userData.loadingTier=null;");
  L.push("  },undefined,function(){mesh.userData.loadingTier=null;});");
  L.push("}");
  L.push("let lodCursor=0;");
  L.push("function updateLOD(){");
  L.push("  const promoteBatch=60;");
  L.push("  if(planetMeshes.length<MAX_PROMOTED){");
  L.push("    for(let i=0;i<promoteBatch&&nodeData.length>0;i++){");
  L.push("      const idx=lodCursor%nodeData.length;lodCursor++;");
  L.push("      const p=nodeData[idx];");
  L.push("      if(p.promoted) continue;");
  L.push("      const dx=camera.position.x-p.x,dy=camera.position.y-p.y,dz=camera.position.z-p.z;");
  L.push("      if(dx*dx+dy*dy+dz*dz<810000){");
  L.push("        promoteNode(idx);");
  L.push("        if(planetMeshes.length>=MAX_PROMOTED) break;");
  L.push("      }");
  L.push("    }");
  L.push("  }");
  L.push("  const thumbBatch=24;");
  L.push("  for(let i=0;i<thumbBatch&&planetMeshes.length>0;i++){");
  L.push("    const mesh=planetMeshes[thumbCursor%planetMeshes.length];thumbCursor++;");
  L.push("    const dist=camera.position.distanceTo(mesh.position);");
  L.push("    const want=desiredTier(dist);");
  L.push("    if(TIER_RANK[want]>TIER_RANK[mesh.userData.loadedTier]) loadTierFor(mesh,want);");
  L.push("  }");
  L.push("}");

  L.push("const _toMesh=new THREE.Vector3(),_fwd=new THREE.Vector3();");
  L.push("function updateTarget(){");
  L.push("  camera.getWorldDirection(_fwd);");
  L.push("  let best=null,bestScore=Infinity;");
  L.push("  for(let i=0;i<planetMeshes.length;i++){");
  L.push("    const mesh=planetMeshes[i];");
  L.push("    _toMesh.copy(mesh.position).sub(camera.position);");
  L.push("    const dist=_toMesh.length();");
  L.push("    if(dist>1400||dist<1) continue;");
  L.push("    _toMesh.multiplyScalar(1/dist);");
  L.push("    const dot=_toMesh.dot(_fwd);");
  L.push("    if(dot<0.85) continue;");
  L.push("    const score=(1-dot)+dist*0.0006;");
  L.push("    if(score<bestScore){bestScore=score;best=mesh;}");
  L.push("  }");
  L.push("  targeted=best;");
  L.push("}");
  L.push("function trySelect(){if(targeted) startFocus(targeted);}");

  L.push("function openLink(p){");
  L.push("  const ov=document.getElementById('ov');if(!ov)return;");
  L.push("  const img=document.getElementById('ovImg');");
  L.push("  if(p.og_image_key){img.src='/og-image/'+p.id;img.style.display='block';}else{img.style.display='none';}");
  L.push("  document.getElementById('ovTitle').textContent=p.title||p.url;");
  L.push("  document.getElementById('ovDesc').textContent=p.description||'';");
  L.push("  const badge=p.domain==='youtube.com'?(p.is_short?'\uD83D\uDCF1 Short':'\uD83C\uDFAC Video'):'\uD83D\uDD17 Link';");
  L.push("  document.getElementById('ovDomain').textContent='\uD83C\uDF10 '+(p.group_name||p.domain||'')+' \u00B7 '+badge;");
  L.push("  document.getElementById('ovVisit').onclick=function(){window.open(p.url,'_blank');};");
  L.push("  ov.style.display='flex';gameState='paused';");
  L.push("}");
  L.push("function closeLink(){document.getElementById('ov').style.display='none';gameState='flying';}");

  L.push("let focus=null;");
  L.push("const FOCUS_CAM_DIST=110,FOCUS_GRID_DIST=64;");
  L.push("function easeIO(t){return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}");
  L.push("const FACE_LOCAL=[[1,0,0,0,Math.PI/2,0],[-1,0,0,0,-Math.PI/2,0],[0,1,0,-Math.PI/2,0,0],[0,-1,0,Math.PI/2,0,0],[0,0,1,0,0,0],[0,0,-1,0,Math.PI,0]];");
  L.push("const GRID_ORDER=[0,4,1,2,3,5];");
  L.push("function startFocus(mesh){");
  L.push("  if(!mesh||focus) return;");
  L.push("  logEvent('focus_start',{node_id:mesh.userData.id});");
  L.push("  gameState='focusing';speed=0;targeted=null;yawVel=0;pitchVel=0;");
  L.push("  document.getElementById('crosshair').classList.remove('locked');");
  L.push("  document.getElementById('targetHint').style.display='none';");
  L.push("  loadTierFor(mesh,'full');");
  L.push("  const dir=camera.position.clone().sub(mesh.position);");
  L.push("  if(dir.lengthSq()<1) dir.set(0,0,1);");
  L.push("  dir.normalize();");
  L.push("  const toPos=mesh.position.clone().add(dir.multiplyScalar(FOCUS_CAM_DIST));");
  L.push("  const lm=new THREE.Matrix4().lookAt(toPos,mesh.position,new THREE.Vector3(0,1,0));");
  L.push("  const toQ=new THREE.Quaternion().setFromRotationMatrix(lm);");
  L.push("  focus={mesh:mesh,phase:'camera',t:0,fromPos:camera.position.clone(),toPos:toPos,fromQ:camera.quaternion.clone(),toQ:toQ,planes:[]};");
  L.push("}");
  L.push("function spawnUnfold(){");
  L.push("  const f=focus,mesh=f.mesh;");
  L.push("  mesh.visible=false;");
  L.push("  const vh=2*FOCUS_GRID_DIST*Math.tan(camera.fov*Math.PI/360);");
  L.push("  const vw=vh*camera.aspect;");
  L.push("  const cell=Math.min(vw/2.35,vh/3.6);");
  L.push("  const gap=cell*0.1;");
  L.push("  const right=new THREE.Vector3(1,0,0).applyQuaternion(f.toQ);");
  L.push("  const up=new THREE.Vector3(0,1,0).applyQuaternion(f.toQ);");
  L.push("  const fwd=new THREE.Vector3(0,0,-1).applyQuaternion(f.toQ);");
  L.push("  const center=f.toPos.clone().add(fwd.multiplyScalar(FOCUS_GRID_DIST));");
  L.push("  const s=cell/28;");
  L.push("  for(let k=0;k<6;k++){");
  L.push("    const fi=GRID_ORDER[k];");
  L.push("    const d=FACE_LOCAL[fi];");
  L.push("    const n=new THREE.Vector3(d[0],d[1],d[2]).applyQuaternion(mesh.quaternion);");
  L.push("    const fromPos=mesh.position.clone().add(n.multiplyScalar(14));");
  L.push("    const fromQ=mesh.quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(d[3],d[4],d[5])));");
  L.push("    const col=k%2,row=Math.floor(k/2);");
  L.push("    const toPos=center.clone().add(right.clone().multiplyScalar((col-0.5)*(cell+gap))).add(up.clone().multiplyScalar((1-row)*(cell+gap)));");
  L.push("    const mat=mesh.material[fi];");
  L.push("    mat.side=THREE.DoubleSide;mat.depthTest=false;mat.needsUpdate=true;");
  L.push("    const plane=new THREE.Mesh(new THREE.PlaneGeometry(28,28),mat);");
  L.push("    plane.renderOrder=999;");
  L.push("    plane.position.copy(fromPos);plane.quaternion.copy(fromQ);");
  L.push("    scene.add(plane);");
  L.push("    f.planes.push({m:plane,fromPos:fromPos,toPos:toPos,fromQ:fromQ,toQ:f.toQ.clone(),s:s});");
  L.push("  }");
  L.push("}");
  L.push("function updateFocus(){");
  L.push("  if(!focus) return;");
  L.push("  const f=focus;");
  L.push("  if(f.phase==='camera'){");
  L.push("    f.t=Math.min(1,f.t+0.03);");
  L.push("    const e=easeIO(f.t);");
  L.push("    camera.position.lerpVectors(f.fromPos,f.toPos,e);");
  L.push("    camera.quaternion.slerpQuaternions(f.fromQ,f.toQ,e);");
  L.push("    if(f.t>=1){spawnUnfold();f.phase='unfold';f.t=0;}");
  L.push("  } else if(f.phase==='unfold'||f.phase==='refold'){");
  L.push("    f.t=Math.min(1,f.t+0.04);");
  L.push("    const e=f.phase==='unfold'?easeIO(f.t):easeIO(1-f.t);");
  L.push("    f.planes.forEach(function(p){");
  L.push("      p.m.position.lerpVectors(p.fromPos,p.toPos,e);");
  L.push("      p.m.quaternion.slerpQuaternions(p.fromQ,p.toQ,e);");
  L.push("      const sc=1+(p.s-1)*e;p.m.scale.set(sc,sc,1);");
  L.push("    });");
  L.push("    if(f.t>=1){");
  L.push("      if(f.phase==='unfold'){f.phase='focused';gameState='focused';showFocusBar();logEvent('focus_unfold_complete',{node_id:f.mesh.userData.id});}");
  L.push("      else finishRefold();");
  L.push("    }");
  L.push("  }");
  L.push("}");
  L.push("function showFocusBar(){");
  L.push("  const p=focus.mesh.userData;");
  L.push("  document.getElementById('fbTitle').textContent=p.title||p.url||'';");
  L.push("  document.getElementById('fbVisit').onclick=function(){window.open(p.url,'_blank');};");
  L.push("  document.getElementById('focusBar').style.display='flex';");
  L.push("}");
  L.push("function closeFocus(){");
  L.push("  if(!focus||focus.phase!=='focused') return;");
  L.push("  logEvent('focus_refold',{node_id:focus.mesh.userData.id});");
  L.push("  document.getElementById('focusBar').style.display='none';");
  L.push("  focus.phase='refold';focus.t=0;gameState='refolding';");
  L.push("}");
  L.push("function finishRefold(){");
  L.push("  const f=focus;");
  L.push("  f.planes.forEach(function(p){");
  L.push("    p.m.material.side=THREE.FrontSide;p.m.material.depthTest=true;p.m.material.needsUpdate=true;");
  L.push("    scene.remove(p.m);p.m.geometry.dispose();");
  L.push("  });");
  L.push("  f.mesh.visible=true;");
  L.push("  const eu=new THREE.Euler().setFromQuaternion(camera.quaternion,'YXZ');");
  L.push("  yaw=eu.y;pitch=Math.max(-PITCH_LIMIT,Math.min(PITCH_LIMIT,eu.x));");
  L.push("  camera.quaternion.setFromEuler(new THREE.Euler(pitch,yaw,0,'YXZ'));");
  L.push("  focus=null;gameState='flying';");
  L.push("}");

  L.push("function faceContent(p,fi){");
  L.push("  const dateStr=(p.added_at||'').slice(0,10);");
  L.push("  const isYT=p.domain==='youtube.com';");
  L.push("  const typeLabel=isYT?(p.is_short?'\uD83D\uDCF1 SHORT':'\uD83C\uDFAC VIDEO'):'\uD83D\uDD17 LINK';");
  L.push("  const pubDate=(p.published_at||dateStr||'');");
  L.push("  if(fi===0) return {label:'TITLE',text:p.title||p.url||'',image:false};");
  L.push("  if(fi===1) return {label:'CHANNEL',text:p.group_name||p.domain||'',image:false};");
  L.push("  if(fi===2) return {label:'TYPE',text:typeLabel,image:false};");
  L.push("  if(fi===3) return {label:'PUBLISHED',text:pubDate||'\u2014',image:false};");
  L.push("  if(fi===4) return {label:'IMAGE',text:'',image:true};");
  L.push("  return {label:'SOURCE',text:p.domain||'',image:false};");
  L.push("}");
  L.push("const _fiProjV=new THREE.Vector3();");
  L.push("function projectToScreen(vec3){");
  L.push("  _fiProjV.copy(vec3).project(camera);");
  L.push("  return {x:(_fiProjV.x*0.5+0.5)*canvas.clientWidth,y:(-_fiProjV.y*0.5+0.5)*canvas.clientHeight};");
  L.push("}");
  L.push("function hitTestGridFace(x,y){");
  L.push("  if(!focus||focus.phase!=='focused') return -1;");
  L.push("  const pts=focus.planes.map(function(p){return projectToScreen(p.m.position);});");
  L.push("  const colGap=Math.abs(pts[1].x-pts[0].x)||1,rowGap=Math.abs(pts[2].y-pts[0].y)||1;");
  L.push("  const halfW=colGap/2*0.85,halfH=rowGap/2*0.85;");
  L.push("  let best=-1,bestScore=Infinity;");
  L.push("  for(let k=0;k<pts.length;k++){");
  L.push("    const dx=(pts[k].x-x)/halfW,dy=(pts[k].y-y)/halfH;");
  L.push("    const score=dx*dx+dy*dy;");
  L.push("    if(score<bestScore){bestScore=score;best=k;}");
  L.push("  }");
  L.push("  return bestScore<=1.0?best:-1;");
  L.push("}");
  L.push("function renderFaceInspector(){");
  L.push("  const f=focus;if(!f)return;");
  L.push("  const fi=GRID_ORDER[f.inspectIndex];");
  L.push("  const p=f.mesh.userData;");
  L.push("  const c=faceContent(p,fi);");
  L.push("  document.getElementById('fiLabel').textContent=c.label;");
  L.push("  const img=document.getElementById('fiImg'),txt=document.getElementById('fiText');");
  L.push("  if(c.image){");
  L.push("    txt.style.display='none';img.style.display='block';");
  L.push("    if(p.og_image_key){img.src='/og-image/'+p.id;}else{img.removeAttribute('src');}");
  L.push("  }else{");
  L.push("    img.style.display='none';txt.style.display='block';txt.textContent=c.text||'\u2014';");
  L.push("  }");
  L.push("  const dots=document.getElementById('fiDots').children;");
  L.push("  for(let i=0;i<dots.length;i++) dots[i].classList.toggle('active',i===f.inspectIndex);");
  L.push("  document.getElementById('fiVisit').onclick=function(){window.open(p.url,'_blank');};");
  L.push("}");
  L.push("function openFaceInspector(k){");
  L.push("  if(!focus||focus.phase!=='focused') return;");
  L.push("  logEvent('face_inspector_open',{node_id:focus.mesh.userData.id,face_index:k});");
  L.push("  gameState='inspecting';");
  L.push("  focus.inspectIndex=k;");
  L.push("  renderFaceInspector();");
  L.push("  document.getElementById('faceInspector').classList.add('open');");
  L.push("}");
  L.push("function closeFaceInspector(){");
  L.push("  if(gameState!=='inspecting') return;");
  L.push("  logEvent('face_inspector_back',{node_id:focus.mesh.userData.id,face_index:focus.inspectIndex});");
  L.push("  document.getElementById('faceInspector').classList.remove('open');");
  L.push("  gameState='focused';");
  L.push("}");
  L.push("function faceCarouselStep(delta){");
  L.push("  if(!focus||gameState!=='inspecting') return;");
  L.push("  focus.inspectIndex=(focus.inspectIndex+delta+6)%6;");
  L.push("  logEvent(delta>0?'face_carousel_next':'face_carousel_prev',{node_id:focus.mesh.userData.id,face_index:focus.inspectIndex});");
  L.push("  renderFaceInspector();");
  L.push("}");
  L.push("let fiTouchX=0,fiTouchY=0,fiTouchActive=false;");
  L.push("function fiTouchStart(x,y){fiTouchActive=true;fiTouchX=x;fiTouchY=y;}");
  L.push("function fiTouchEnd(x,y){");
  L.push("  if(!fiTouchActive) return;fiTouchActive=false;");
  L.push("  const dx=x-fiTouchX,dy=y-fiTouchY;");
  L.push("  if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>=40){");
  L.push("    if(focus){");
  L.push("      logEvent('save_gesture_attempt',{node_id:focus.mesh.userData.id,face_index:focus.inspectIndex,direction:dy<0?'up':'down'});");
  L.push("      if(dy<0) saveSelectedCard(focus.inspectIndex,'swipe_up');");
  L.push("      else saveSelectedCard(null,'swipe_down');");
  L.push("    }");
  L.push("  }else if(dx<=-40) faceCarouselStep(1);");
  L.push("  else if(dx>=40) faceCarouselStep(-1);");
  L.push("}");
  L.push("async function saveSelectedCard(selectedFace,gesture){");
  L.push("  if(!focus) return;");
  L.push("  const p=focus.mesh.userData;");
  L.push("  const faces=[0,1,2,3,4,5].map(function(fi){");
  L.push("    const c=faceContent(p,fi);");
  L.push("    return {index:fi,label:c.label,text:c.image?'':(c.text||''),image_key:c.image?(p.og_image_key||null):null};");
  L.push("  });");
  L.push("  const body={link_id:p.id,selected_face:selectedFace,gesture:gesture,title:p.title||p.url||'',url:p.url,domain:p.domain||'',faces:faces};");
  L.push("  try{");
  L.push("    const r=await fetch('/api/selected-cards',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});");
  L.push("    const d=await r.json();");
  L.push("    if(d.ok) showToast(selectedFace===null?'Saved for later \uD83D\uDCE6':'Saved \uD83D\uDCE6 view in Cards');");
  L.push("    else showToast('Save failed: '+(d.error||'unknown error'));");
  L.push("  }catch(e){showToast('Save failed: '+e.message);}");
  L.push("}");
  L.push("function fiSaveClick(){if(focus) saveSelectedCard(focus.inspectIndex,'button');}");
  L.push("function fiAskLaterClick(){if(focus) saveSelectedCard(null,'button');}");

  L.push("let ccOpen=false,ccTab='registry',ccPrevState=null,ccRegistryBuilt=false,activeLoadout='explorer';");
  L.push("function openCommandCenter(){");
  L.push("  if(ccOpen) return;");
  L.push("  ccOpen=true;");
  L.push("  if(gameState==='flying'){ccPrevState='flying';gameState='ccPaused';}else ccPrevState=null;");
  L.push("  if(!ccRegistryBuilt){ccRenderRegistry();ccRegistryBuilt=true;}");
  L.push("  ccRenderSystems();");
  L.push("  document.getElementById('ccDim').classList.add('open');");
  L.push("  document.getElementById('ccOverlay').classList.add('open');");
  L.push("}");
  L.push("function closeCommandCenter(){");
  L.push("  if(!ccOpen) return;");
  L.push("  ccOpen=false;");
  L.push("  document.getElementById('ccDim').classList.remove('open');");
  L.push("  document.getElementById('ccOverlay').classList.remove('open');");
  L.push("  if(ccPrevState==='flying'&&gameState==='ccPaused') gameState='flying';");
  L.push("  ccPrevState=null;");
  L.push("}");
  L.push("async function ccSetTab(name){");
  L.push("  ccTab=name;");
  L.push("  ['registry','cargo','systems'].forEach(function(t){");
  L.push("    document.getElementById('ccTab-'+t).classList.toggle('active',t===name);");
  L.push("    document.getElementById('ccPanel-'+t).classList.toggle('ccActive',t===name);");
  L.push("  });");
  L.push("  if(name==='systems') ccRenderSystems();");
  L.push("  if(name==='cargo') await ccRenderCargo();");
  L.push("}");
  L.push("async function ccRenderCargo(){");
  L.push("  const list=document.getElementById('ccCargoList');");
  L.push("  list.innerHTML='';");
  L.push("  let cards=[];");
  L.push("  try{");
  L.push("    const r=await fetch('/api/selected-cards');");
  L.push("    const d=await r.json();");
  L.push("    cards=(d.ok&&d.cards)?d.cards:[];");
  L.push("  }catch(e){");
  L.push("    document.getElementById('ccCargoCount').textContent='Cargo Bay';");
  L.push("    list.appendChild(ccEl('div','ccNote','Failed to load: '+e.message));");
  L.push("    return;");
  L.push("  }");
  L.push("  document.getElementById('ccCargoCount').textContent='Cargo Bay ('+cards.length+')';");
  L.push("  if(!cards.length){");
  L.push("    list.appendChild(ccEl('div','ccEmpty','\uD83D\uDCE6 Nothing saved yet. Open a node, tap a face, and Save or swipe up.'));");
  L.push("    return;");
  L.push("  }");
  L.push("  cards.forEach(function(c){");
  L.push("    const row=ccEl('div','ccRow');");
  L.push("    if(c.og_image_key){const img=document.createElement('img');img.src='/og-image/'+c.link_id;img.className='ccThumb';img.loading='lazy';row.appendChild(img);}");
  L.push("    else row.appendChild(ccEl('div','ccThumb ccThumbEmpty','\uD83D\uDCE6'));");
  L.push("    const mid=ccEl('div','ccRowMid');");
  L.push("    mid.appendChild(ccEl('div','ccRowTitle',c.title||c.url));");
  L.push("    mid.appendChild(ccEl('div','ccRowDomain',(c.domain||'')+' \u00B7 '+c.status));");
  L.push("    row.appendChild(mid);");
  L.push("    const openBtn=ccEl('button','ccDelBtn','\u2192');");
  L.push("    openBtn.onclick=function(){window.open('/card/'+c.id,'_blank');};");
  L.push("    row.appendChild(openBtn);");
  L.push("    list.appendChild(row);");
  L.push("  });");
  L.push("}");
  L.push("function ccEl(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}");
  L.push("function ccMsgIn(id,t,ok){const d=document.getElementById(id);d.textContent=t;d.className='ccMsg '+(ok?'ok':'er');d.style.display='block';setTimeout(function(){d.style.display='none';},6000);}");
  L.push("function ccRenderRegistry(){");
  L.push("  const list=document.getElementById('ccList');");
  L.push("  list.innerHTML='';");
  L.push("  const links=LAYOUT.links;");
  L.push("  document.getElementById('ccCount').textContent='Your Links ('+links.length+')';");
  L.push("  const cap=Math.min(links.length,200);");
  L.push("  for(let i=0;i<cap;i++){");
  L.push("    (function(l){");
  L.push("      const row=ccEl('div','ccRow');");
  L.push("      if(l.og_image_key){const img=document.createElement('img');img.src='/og-image/'+l.id;img.className='ccThumb';img.loading='lazy';row.appendChild(img);}");
  L.push("      else row.appendChild(ccEl('div','ccThumb ccThumbEmpty','\uD83D\uDD17'));");
  L.push("      const mid=ccEl('div','ccRowMid');");
  L.push("      mid.appendChild(ccEl('div','ccRowTitle',l.title||l.url));");
  L.push("      mid.appendChild(ccEl('div','ccRowDomain',l.group_name||l.domain||''));");
  L.push("      row.appendChild(mid);");
  L.push("      const db=ccEl('button','ccDelBtn','x');");
  L.push("      db.onclick=function(){ccDel(l.id,row);};");
  L.push("      row.appendChild(db);");
  L.push("      list.appendChild(row);");
  L.push("    })(links[i]);");
  L.push("  }");
  L.push("  if(links.length>cap) list.appendChild(ccEl('div','ccNote','Showing first '+cap+' of '+links.length+'.'));");
  L.push("}");
  L.push("function ccDel(id,row){");
  L.push("  if(!confirm('Remove this link?')) return;");
  L.push("  fetch('/admin/link/'+encodeURIComponent(id),{method:'DELETE'}).then(function(r){return r.json();}).then(function(d){");
  L.push("    if(d.ok){");
  L.push("      if(row&&row.parentNode) row.parentNode.removeChild(row);");
  L.push("      const idx=LAYOUT.links.findIndex(function(l){return l.id===id;});");
  L.push("      if(idx>=0) LAYOUT.links.splice(idx,1);");
  L.push("      document.getElementById('ccCount').textContent='Your Links ('+LAYOUT.links.length+')';");
  L.push("      showToast('Removed. Refresh to update 3D.');");
  L.push("    }");
  L.push("  }).catch(function(){});");
  L.push("}");
  L.push("async function ccAddFeed(){");
  L.push("  const feedUrl=document.getElementById('ccFdInput').value.trim();");
  L.push("  const name=document.getElementById('ccFdName').value.trim();");
  L.push("  const max=document.getElementById('ccFdMax').value||15;");
  L.push("  if(!feedUrl){ccMsgIn('ccFdMsg','Enter a feed URL',false);return;}");
  L.push("  const btn=document.getElementById('ccFdBtn');btn.disabled=true;btn.textContent='Fetching feed...';");
  L.push("  try{");
  L.push("    const r=await fetch('/admin/add-feed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({feed_url:feedUrl,name:name||undefined,max:Number(max)})});");
  L.push("    const d=await r.json();");
  L.push("    if(d.ok) ccMsgIn('ccFdMsg','Added '+d.added+' item(s) from '+d.feed+(d.skipped?(' ('+d.skipped+' already had)'):'')+'. Refresh game to see the new galaxy.',true);");
  L.push("    else ccMsgIn('ccFdMsg',d.error||'Failed to add feed',false);");
  L.push("  }catch(e){ccMsgIn('ccFdMsg','Request failed: '+e.message,false);}");
  L.push("  btn.disabled=false;btn.textContent='Add Feed Group \uD83D\uDCF0';");
  L.push("}");
  L.push("async function ccAddChannel(){");
  L.push("  const input=document.getElementById('ccChInput').value.trim();");
  L.push("  const max=document.getElementById('ccChMax').value||15;");
  L.push("  if(!input){ccMsgIn('ccChMsg','Enter a channel URL or handle',false);return;}");
  L.push("  const btn=document.getElementById('ccChBtn');btn.disabled=true;btn.textContent='Fetching channel...';");
  L.push("  try{");
  L.push("    const r=await fetch('/admin/add-channel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:input,max:Number(max)})});");
  L.push("    const d=await r.json();");
  L.push("    if(d.ok) ccMsgIn('ccChMsg','Added '+d.added+' video(s) from '+d.channel+(d.skipped?(' ('+d.skipped+' already had)'):'')+'. Refresh game to see the new galaxy.',true);");
  L.push("    else ccMsgIn('ccChMsg',d.error||'Failed to add channel',false);");
  L.push("  }catch(e){ccMsgIn('ccChMsg','Request failed: '+e.message,false);}");
  L.push("  btn.disabled=false;btn.textContent='Add Channel Group \uD83D\uDCFA';");
  L.push("}");
  L.push("function ccProg(t){const p=document.getElementById('ccProg');p.textContent=t;p.style.display=t?'block':'none';}");
  L.push("async function ccAddLinks(){");
  L.push("  const lines=document.getElementById('ccUrls').value.split('\\n').map(function(s){return s.trim();}).filter(Boolean);");
  L.push("  if(!lines.length){ccMsgIn('ccAddMsg','No URLs entered',false);return;}");
  L.push("  const btn=document.getElementById('ccAddBtn');btn.disabled=true;");
  L.push("  let done=0,errors=0;");
  L.push("  for(const u of lines){");
  L.push("    ccProg('Fetching '+(done+errors+1)+' / '+lines.length+'...');");
  L.push("    try{const r=await fetch('/admin/add',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:u})});const d=await r.json();if(d.ok)done++;else errors++;}catch(e){errors++;}");
  L.push("  }");
  L.push("  ccProg('');btn.disabled=false;");
  L.push("  if(errors) ccMsgIn('ccAddMsg','Added '+done+', '+errors+' failed',done>0);");
  L.push("  else ccMsgIn('ccAddMsg','Added '+done+' link'+(done===1?'':'s')+'! Refresh game to see them.',true);");
  L.push("}");
  L.push("function ccRenderSystems(){");
  L.push("  const el=document.getElementById('ccSysCurrent');");
  L.push("  if(el) el.textContent='Formation: '+currentFormation+' \u00B7 Mode: '+clusterMode+' \u00B7 Speed: '+speed.toFixed(1)+'x \u00B7 Loadout: '+activeLoadout;");
  L.push("}");
  L.push("function ccSetLoadout(name){");
  L.push("  activeLoadout=name;");
  L.push("  ['explorer','research','bounty'].forEach(function(n){document.getElementById('ccLo-'+n).classList.toggle('active',n===name);});");
  L.push("  ccRenderSystems();");
  L.push("  showToast('Loadout: '+name+' (visual only for now)');");
  L.push("}");

  L.push("function startTouch(x,y){touchActive=true;touchStartX=x;touchStartY=y;lastX=x;lastY=y;isTap=true;}");
  L.push("function moveTouch(x,y){");
  L.push("  if(!touchActive) return;");
  L.push("  const dx=x-lastX,dy=y-lastY;");
  L.push("  yawVel=-dx*0.0028;pitchVel=-dy*0.0028;");
  L.push("  lastX=x;lastY=y;");
  L.push("  if(Math.abs(x-touchStartX)>10||Math.abs(y-touchStartY)>10) isTap=false;");
  L.push("}");
  L.push("function endTouch(){");
  L.push("  if(isTap){");
  L.push("    if(gameState==='flying') trySelect();");
  L.push("    else if(gameState==='focused'){");
  L.push("      const k=hitTestGridFace(touchStartX,touchStartY);");
  L.push("      if(k>=0){logEvent('face_tap',{node_id:focus.mesh.userData.id,face_index:k});openFaceInspector(k);}else closeFocus();");
  L.push("    }");
  L.push("  }");
  L.push("  touchActive=false;yawVel=0;pitchVel=0;");
  L.push("}");
  L.push("const fiEl=document.getElementById('faceInspector');");
  L.push("fiEl.addEventListener('touchstart',function(e){fiTouchStart(e.touches[0].clientX,e.touches[0].clientY);},{passive:true});");
  L.push("fiEl.addEventListener('touchend',function(e){fiTouchEnd(e.changedTouches[0].clientX,e.changedTouches[0].clientY);},{passive:true});");
  L.push("fiEl.addEventListener('mousedown',function(e){fiTouchStart(e.clientX,e.clientY);});");
  L.push("fiEl.addEventListener('mouseup',function(e){fiTouchEnd(e.clientX,e.clientY);});");

  L.push("let isPinching=false,pinchStartDist=0,pinchStartSpeed=0;");
  L.push("const PINCH_SENSITIVITY=0.06;");
  L.push("function touchDist(t1,t2){const dx=t1.clientX-t2.clientX,dy=t1.clientY-t2.clientY;return Math.sqrt(dx*dx+dy*dy);}");
  L.push("function startPinch(t1,t2){isPinching=true;pinchStartDist=touchDist(t1,t2);pinchStartSpeed=speed;touchActive=false;}");
  L.push("function movePinch(t1,t2){");
  L.push("  const dist=touchDist(t1,t2);");
  L.push("  const delta=pinchStartDist-dist;");
  L.push("  speed=Math.max(-6,Math.min(14,pinchStartSpeed+delta*PINCH_SENSITIVITY));");
  L.push("}");
  L.push("function endPinch(){isPinching=false;}");

  L.push("const canvas=document.getElementById('gc');");
  L.push("canvas.addEventListener('touchstart',function(e){");
  L.push("  e.preventDefault();");
  L.push("  const r=canvas.getBoundingClientRect();");
  L.push("  if(e.touches.length>=2){startPinch(e.touches[0],e.touches[1]);return;}");
  L.push("  if(!isPinching){const t=e.touches[0];startTouch(t.clientX-r.left,t.clientY-r.top);}");
  L.push("},{passive:false});");
  L.push("canvas.addEventListener('touchmove',function(e){");
  L.push("  e.preventDefault();");
  L.push("  if(isPinching&&e.touches.length>=2){movePinch(e.touches[0],e.touches[1]);return;}");
  L.push("  if(!isPinching){const t=e.touches[0],r=canvas.getBoundingClientRect();moveTouch(t.clientX-r.left,t.clientY-r.top);}");
  L.push("},{passive:false});");
  L.push("canvas.addEventListener('touchend',function(e){");
  L.push("  e.preventDefault();");
  L.push("  if(isPinching){if(e.touches.length<2) endPinch();return;}");
  L.push("  endTouch();");
  L.push("},{passive:false});");
  L.push("canvas.addEventListener('mousedown',function(e){const r=canvas.getBoundingClientRect();startTouch(e.clientX-r.left,e.clientY-r.top);});");
  L.push("canvas.addEventListener('mousemove',function(e){if(!touchActive)return;const r=canvas.getBoundingClientRect();moveTouch(e.clientX-r.left,e.clientY-r.top);});");
  L.push("window.addEventListener('mouseup',function(){endTouch();});");

  L.push("function updateHUD(){");
  L.push("  const hint=document.getElementById('targetHint'),cross=document.getElementById('crosshair');");
  L.push("  if(targeted){cross.classList.add('locked');hint.style.display='block';hint.textContent='TAP TO VIEW \u2014 '+(targeted.userData.title||targeted.userData.url||'link');}");
  L.push("  else{cross.classList.remove('locked');hint.style.display='none';}");
  L.push("  const sl=document.getElementById('speedLabel');");
  L.push("  sl.textContent=speed===0?'\u23F8 STOPPED':speed<0?'\u25C0 REVERSE '+Math.abs(speed).toFixed(1)+'x':'\uD83D\uDE80 '+speed.toFixed(1)+'x';");
  L.push("  sl.style.color=speed<0?'#ffaa44':'#888';");
  L.push("  const arrow=document.getElementById('compass');");
  L.push("  if(clusterMode==='supercluster'){");
  L.push("    arrow.style.display='none'; document.getElementById('compassLabel').textContent='';");
  L.push("  } else {");
  L.push("    let nearest=null,nd=Infinity;");
  L.push("    LAYOUT.galaxies.forEach(function(g){const d=camera.position.distanceTo(new THREE.Vector3(g.x,g.y,g.z));if(d<nd&&d>g.radius+80){nd=d;nearest=g;}});");
  L.push("    if(nearest){const v=new THREE.Vector3(nearest.x,nearest.y,nearest.z).project(camera);const ang=Math.atan2(v.y,v.x);");
  L.push("      arrow.style.display='block';arrow.style.transform='translate(-50%,-50%) rotate('+(-ang)+'rad)';");
  L.push("      document.getElementById('compassLabel').textContent=nearest.name+' \u2014 '+Math.round(nd)+'u';");
  L.push("    } else { arrow.style.display='none'; document.getElementById('compassLabel').textContent=''; }");
  L.push("  }");
  L.push("}");

  L.push("function billboardCubes(){");
  L.push("  planetMeshes.forEach(function(mesh){");
  L.push("    const dx=camera.position.x-mesh.position.x,dz=camera.position.z-mesh.position.z;");
  L.push("    mesh.rotation.y=Math.atan2(dx,dz);");
  L.push("  });");
  L.push("}");

  L.push("function update(){");
  L.push("  if(gameState!=='flying') return;");
  L.push("  frame++;");
  L.push("  yaw+=yawVel;pitch=Math.max(-PITCH_LIMIT,Math.min(PITCH_LIMIT,pitch+pitchVel));");
  L.push("  camera.quaternion.setFromEuler(new THREE.Euler(pitch,yaw,0,'YXZ'));");
  L.push("  camera.translateZ(-speed);");
  L.push("  yawVel*=0.85;pitchVel*=0.85;");
  L.push("  updateTarget();updateLOD();billboardCubes();updateAdEntities();");
  L.push("  if(targeted&&speed>0.3){");
  L.push("    const td=camera.position.distanceTo(targeted.position);");
  L.push("    if(td<220) speed*=0.965;");
  L.push("  }");
  L.push("  if(frame%10===0) checkZoneEntry();");
  L.push("  if(frame%4===0) updateHUD();");
  L.push("}");

  L.push("function drawMenuBg(){}");
  L.push("function loop(){update();updateFocus();renderer.render(scene,camera);requestAnimationFrame(loop);}");

  L.push("function adjustSpeed(d){speed=Math.max(-6,Math.min(14,speed+d));}");
  L.push("function fullStop(){speed=0;showToast('\u23F8 Stopped');}");
  L.push("function startFlying(){");
  L.push("  if(LAYOUT.links.length===0){alert('Add some links at /admin first');return;}");
  L.push("  gameState='flying';");
  L.push("  document.getElementById('menuUI').style.display='none';");
  L.push("  document.getElementById('flyUI').style.display='flex';");
  L.push("  document.getElementById('hud').style.display='block';");
  L.push("  setTimeout(function(){showToast('\uD83E\uDD0F Pinch together = forward, apart = reverse');},800);");
  L.push("}");

  L.push("initScene();loop();");
  return L.join("\n");
}

// =================== HTML ===================

function buildGameHTML(layout){
  const script=buildGameScript(layout);
  const parts=[
    "<!DOCTYPE html>",
    "<html lang='en'><head>",
    "<meta charset='UTF-8'>",
    "<meta name='viewport' content='width=device-width,initial-scale=1,user-scalable=no,viewport-fit=cover'>",
    "<title>Link Lane</title>",
    "<style>",
    "*{margin:0;padding:0;box-sizing:border-box;}",
    "body{background:#000;display:flex;flex-direction:column;align-items:center;min-height:100vh;min-height:100dvh;font-family:monospace;overflow:hidden;padding-top:env(safe-area-inset-top);}",
    "#loadScreen{position:fixed;top:0;left:0;width:100%;height:100%;height:100dvh;background:radial-gradient(ellipse at center,#0a0a1a 0%,#000 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:1000;transition:opacity 0.7s ease-out;}",
    "#loadScreen.fadeOut{opacity:0;}",
    "#loadLogo{font-size:2.2rem;font-weight:200;background:linear-gradient(45deg,#00ffff,#0088ff,#ff00ff);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:14px;animation:gradientShift 3s ease-in-out infinite;}",
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
    "#compass{position:absolute;top:50%;left:50%;width:0;height:0;display:none;}",
    "#compass:before{content:'\u25B2';position:absolute;left:-150px;top:-10px;color:#ffdd00;font-size:14px;}",
    "#compassLabel{position:absolute;top:8px;left:50%;transform:translateX(-50%);color:#ffdd00;font-size:11px;background:rgba(0,0,0,0.55);padding:2px 8px;border-radius:4px;white-space:nowrap;}",
    "#adWarnBadge{display:none;position:absolute;top:36px;left:50%;transform:translateX(-50%);color:#ff5522;font-size:11px;font-weight:bold;letter-spacing:1px;background:rgba(40,10,0,0.75);border:1px solid rgba(255,85,34,0.6);padding:3px 10px;border-radius:4px;white-space:nowrap;animation:adPulse 0.9s ease-in-out infinite;}",
    "#adWarnBadge.show{display:block;}",
    "@keyframes adPulse{0%,100%{opacity:0.6;}50%{opacity:1;}}",
    "#cockpitBottom{position:absolute;bottom:0;left:0;width:100%;height:14%;background:linear-gradient(to top, rgba(10,10,15,0.85), transparent);}",
    "#shipIcon{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);font-size:26px;opacity:0.85;}",
    "#menuUI{width:100%;max-width:480px;background:rgba(0,0,0,0.85);border-top:1px solid rgba(0,255,255,0.2);backdrop-filter:blur(20px);padding:14px 16px;display:flex;flex-direction:column;gap:10px;align-items:center;text-align:center;}",
    "#menuUI h1{color:#00ff88;font-size:22px;}",
    "#menuUI p{color:#4488aa;font-size:12px;}",
    "#startBtn{background:#00ff88;color:#000;border:none;padding:14px 36px;font-family:monospace;font-size:16px;font-weight:bold;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;}",
    "#statBadge{color:#00ff88;font-size:12px;background:rgba(0,255,136,0.1);border:1px solid #00ff88;padding:6px 14px;border-radius:6px;}",
    "#flyUI{width:100%;max-width:480px;background:rgba(0,0,0,0.85);border-top:1px solid rgba(0,255,255,0.2);backdrop-filter:blur(20px);padding:8px 10px;display:none;flex-direction:column;gap:6px;}",
    ".speedRow{display:flex;align-items:center;justify-content:space-between;gap:6px;}",
    ".fmtRow{display:flex;gap:5px;justify-content:center;}",
    ".clusterBtn{background:rgba(255,140,0,0.06);color:#fa8;border:1px solid rgba(255,140,0,0.3);font-size:11px;padding:6px 12px;border-radius:12px;cursor:pointer;-webkit-tap-highlight-color:transparent;font-family:monospace;flex:1;}",
    ".clusterBtn.active{background:rgba(255,140,0,0.25);border-color:#ff8c00;color:#fff;box-shadow:0 0 10px rgba(255,140,0,0.3);}",
    ".fmtBtn{background:rgba(0,255,255,0.06);color:#7ab;border:1px solid rgba(0,255,255,0.25);font-size:10px;padding:5px 10px;border-radius:12px;cursor:pointer;-webkit-tap-highlight-color:transparent;font-family:monospace;}",
    ".fmtBtn.active{background:rgba(0,255,255,0.25);border-color:#00ffff;color:#fff;box-shadow:0 0 10px rgba(0,255,255,0.3);}",
    ".sBtn{background:rgba(0,255,255,0.06);color:#fff;border:1px solid rgba(0,255,255,0.25);font-size:15px;padding:9px 14px;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;font-family:monospace;}",
    ".sBtn:active{background:rgba(0,255,255,0.18);}",
    ".sBtn.stopBtn{background:rgba(170,30,30,0.15);border-color:#aa3333;color:#ff6666;font-size:12px;padding:9px 10px;}",
    "#speedLabel{color:#888;font-size:11px;text-align:center;flex:1;}",
    "#adminLink{color:#222;font-size:10px;padding:4px;text-align:center;width:100%;max-width:480px;}",
    "#adminLink a{color:#222;}",
    "#ccLaunchRow{width:100%;max-width:480px;padding:6px 10px 10px;display:flex;flex-direction:column;gap:4px;align-items:center;}",
    "#ccOpenBtn{width:100%;background:rgba(0,255,136,0.12);color:#00ff88;border:1px solid rgba(0,255,136,0.5);padding:12px;font-family:monospace;font-size:14px;font-weight:bold;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 0 14px rgba(0,255,136,0.15);letter-spacing:1px;}",
    "#ccAdminFallback{color:#222;font-size:10px;text-decoration:none;}",
    "#ccDim{display:block;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.35);backdrop-filter:blur(3px);z-index:390;opacity:0;pointer-events:none;transition:opacity 0.3s ease;}",
    "#ccDim.open{opacity:1;pointer-events:auto;}",
    "#ccOverlay{position:fixed;bottom:0;left:50%;transform:translate(-50%,102%);width:100%;max-width:480px;height:82dvh;background:rgba(10,10,15,0.88);backdrop-filter:blur(8px);border-top:1px solid rgba(0,255,136,0.45);border-radius:14px 14px 0 0;box-shadow:0 -18px 50px rgba(0,255,136,0.12);z-index:400;display:flex;flex-direction:column;transition:transform 0.35s ease;padding-bottom:env(safe-area-inset-bottom);}",
    "#ccOverlay.open{transform:translate(-50%,0);}",
    "#ccHandleWrap{padding:8px 0 2px;cursor:pointer;}",
    "#ccHandle{width:44px;height:4px;border-radius:2px;background:rgba(255,255,255,0.25);margin:0 auto;}",
    "#ccHeader{display:flex;align-items:center;justify-content:space-between;padding:4px 14px 8px;}",
    "#ccTitle{color:#00ff88;font-size:14px;font-weight:bold;letter-spacing:1px;}",
    "#ccClose{background:transparent;color:#888;border:1px solid #333;border-radius:6px;padding:4px 10px;font-family:monospace;cursor:pointer;-webkit-tap-highlight-color:transparent;}",
    "#ccTabs{display:flex;gap:6px;padding:0 12px 10px;}",
    ".ccTabBtn{flex:1;background:rgba(0,255,255,0.05);color:#7ab;border:1px solid rgba(0,255,255,0.25);padding:8px 4px;border-radius:8px;font-family:monospace;font-size:12px;cursor:pointer;-webkit-tap-highlight-color:transparent;}",
    ".ccTabBtn.active{background:rgba(0,255,136,0.14);color:#00ff88;border-color:rgba(0,255,136,0.55);}",
    "#ccPanels{flex:1;position:relative;}",
    ".ccPanel{position:absolute;top:0;left:0;right:0;bottom:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:4px 14px 20px;visibility:hidden;pointer-events:none;}",
    ".ccPanel.ccActive{visibility:visible;pointer-events:auto;}",
    ".ccH{color:#ffdd00;font-size:12px;margin:14px 0 6px;}",
    ".ccMsg{display:none;padding:8px;margin:4px 0;border-radius:4px;font-size:11px;}",
    ".ccMsg.ok{background:#003300;color:#4f4;border:1px solid #4f4;}",
    ".ccMsg.er{background:#330000;color:#f44;border:1px solid #f44;}",
    ".ccInput{width:100%;background:#000;color:#ccc;border:1px solid #1a1a2a;border-radius:4px;padding:9px;font-family:monospace;font-size:13px;margin-bottom:6px;box-sizing:border-box;}",
    ".ccNum{width:60px;background:#000;color:#ccc;border:1px solid #1a1a2a;border-radius:4px;padding:7px;font-family:monospace;}",
    ".ccInline{display:flex;gap:8px;align-items:center;margin-bottom:6px;}",
    ".ccInline label{color:#666;font-size:11px;}",
    ".ccTextarea{width:100%;background:#000;color:#ccc;border:1px solid #1a1a2a;border-radius:4px;padding:9px;font-family:monospace;font-size:13px;min-height:80px;margin-bottom:6px;box-sizing:border-box;}",
    ".ccGo{width:100%;background:#00ff88;color:#000;border:none;padding:11px;font-family:monospace;font-size:13px;font-weight:bold;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;margin-bottom:4px;}",
    ".ccGo:disabled{opacity:0.5;}",
    ".ccRow{background:#06040c;border:1px solid #1a1a2a;border-radius:5px;padding:7px;display:flex;gap:8px;align-items:center;margin-bottom:6px;}",
    ".ccThumb{width:44px;height:44px;object-fit:cover;border-radius:4px;flex-shrink:0;}",
    ".ccThumbEmpty{background:#111;display:flex;align-items:center;justify-content:center;font-size:18px;}",
    ".ccRowMid{flex:1;overflow:hidden;}",
    ".ccRowTitle{color:#ccc;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
    ".ccRowDomain{color:#00ff88;font-size:10px;}",
    ".ccDelBtn{background:#440000;color:#f88;border:1px solid #600;padding:6px 10px;border-radius:4px;cursor:pointer;font-family:monospace;flex-shrink:0;-webkit-tap-highlight-color:transparent;}",
    ".ccNote{color:#556;font-size:10px;line-height:1.5;margin:4px 0;}",
    ".ccEmpty{text-align:center;color:#667;font-size:13px;padding:60px 20px;line-height:2;}",
    ".ccLoadout{background:rgba(0,255,255,0.04);border:1px solid rgba(0,255,255,0.2);border-radius:8px;padding:10px;margin-bottom:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;display:flex;flex-direction:column;gap:3px;}",
    ".ccLoadout b{color:#cde;font-size:13px;}",
    ".ccLoadout span{color:#667;font-size:10px;}",
    ".ccLoadout.active{border-color:rgba(0,255,136,0.6);background:rgba(0,255,136,0.08);box-shadow:0 0 10px rgba(0,255,136,0.15);}",
    "#focusBar{display:none;position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:rgba(0,0,0,0.88);border-top:1px solid rgba(0,255,136,0.35);backdrop-filter:blur(14px);padding:12px 16px calc(12px + env(safe-area-inset-bottom));flex-direction:column;gap:10px;z-index:250;}",
    "#fbTitle{color:#fff;font-size:13px;text-align:center;max-height:3em;overflow:hidden;}",
    ".fbRow{display:flex;gap:8px;}",
    "#fbVisit{flex:2;padding:12px;background:#00ff88;color:#000;border:none;font-family:monospace;font-size:14px;font-weight:bold;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;}",
    "#fbClose{flex:1;padding:12px;background:transparent;color:#888;border:1px solid #333;font-family:monospace;font-size:13px;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;}",
    "#faceInspector{display:none;position:fixed;top:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;height:100%;height:100dvh;background:rgba(6,4,12,0.97);z-index:260;flex-direction:column;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);}",
    "#faceInspector.open{display:flex;}",
    "#fiTop{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(0,255,136,0.2);}",
    "#fiBack{background:transparent;color:#00ff88;border:1px solid rgba(0,255,136,0.4);border-radius:6px;padding:8px 12px;font-family:monospace;font-size:12px;cursor:pointer;-webkit-tap-highlight-color:transparent;}",
    "#fiLabel{color:#ffdd00;font-size:12px;letter-spacing:2px;font-weight:bold;}",
    "#fiDots{display:flex;gap:5px;}",
    ".fiDot{width:6px;height:6px;border-radius:50%;background:#333;}",
    ".fiDot.active{background:#00ff88;box-shadow:0 0 6px rgba(0,255,136,0.6);}",
    "#fiBody{flex:1;display:flex;align-items:center;justify-content:center;padding:24px;overflow:hidden;}",
    "#fiText{color:#eee;font-size:22px;line-height:1.5;text-align:center;word-break:break-word;max-height:100%;overflow-y:auto;}",
    "#fiImg{display:none;max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;}",
    "#fiBottom{display:flex;gap:8px;padding:14px 16px calc(14px + env(safe-area-inset-bottom));border-top:1px solid rgba(0,255,136,0.2);}",
    "#fiPrev,#fiNext{flex:0 0 52px;background:rgba(255,255,255,0.06);color:#ccc;border:1px solid #333;border-radius:6px;font-size:20px;cursor:pointer;-webkit-tap-highlight-color:transparent;}",
    "#fiVisit{flex:1;padding:12px;background:#00ff88;color:#000;border:none;font-family:monospace;font-size:14px;font-weight:bold;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;}",
    "#fiActions{display:flex;gap:8px;padding:0 16px 10px;}",
    "#fiSaveBtn,#fiLaterBtn{flex:1;padding:10px;font-family:monospace;font-size:12px;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;border:1px solid rgba(0,255,136,0.35);background:rgba(0,255,136,0.08);color:#00ff88;}",
    "#fiLaterBtn{border-color:rgba(255,221,0,0.35);background:rgba(255,221,0,0.06);color:#ffdd00;}",
    "#ov{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.97);z-index:200;flex-direction:column;align-items:center;justify-content:center;padding:20px;}",
    "#ovImg{max-width:100%;max-height:42vh;object-fit:contain;border-radius:4px;margin-bottom:14px;}",
    "#ovTitle{color:#fff;font-size:16px;text-align:center;margin-bottom:8px;max-width:90%;}",
    "#ovDesc{color:#888;font-size:12px;text-align:center;max-width:90%;line-height:1.6;margin-bottom:8px;}",
    "#ovDomain{color:#00ff88;font-size:11px;margin-bottom:18px;}",
    "#ovVisit{padding:12px 32px;background:#00ff88;color:#000;border:none;font-family:monospace;font-size:15px;font-weight:bold;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;margin-bottom:10px;}",
    "#ovClose{padding:10px 28px;background:transparent;color:#666;border:1px solid #333;font-family:monospace;font-size:13px;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;}",
    "</style></head><body>",
    "<div id='loadScreen'><div id='loadLogo'>LINK LANE</div><div id='loadText'>Initializing flight systems</div><div id='loadBarTrack'><div id='loadBar'></div></div></div>",
    "<div id='toast'></div>",
    "<div id='wrap'><canvas id='gc'></canvas>",
    "<div id='hud'>",
    "  <div id='crosshair'></div><div id='targetHint'></div>",
    "  <div id='compassLabel'></div><div id='compass'></div>",
    "  <div id='cockpitBottom'></div><div id='shipIcon'>\uD83D\uDE80</div>",
    "  <div id='adWarnBadge'>\u26A0\uFE0F AD CONTACT</div>",
    "</div></div>",
    "<div id='menuUI'>",
    "  <h1>\uD83D\uDD17 LINK LANE</h1>",
    "  <p>fly through your bookmarks</p>",
    "  <div id='statBadge'>"+(layout.links.length>0 ? layout.links.length+" links across "+layout.galaxies.length+" galaxies" : "add links at /admin to begin")+"</div>",
    "  <button id='startBtn' onclick='startFlying()'>LAUNCH \uD83D\uDE80</button>",
    "</div>",
    "<div id='flyUI'>",
    "  <div class='fmtRow'>",
    "    <button class='clusterBtn active' data-c='galaxies' onclick='setClusterMode(\"galaxies\")'>\uD83C\uDF10 Galaxies</button>",
    "    <button class='clusterBtn' data-c='supercluster' onclick='setClusterMode(\"supercluster\")'>\uD83C\uDF0C Supercluster</button>",
    "  </div>",
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
    "<div id='ccLaunchRow'>",
    "  <button id='ccOpenBtn' onclick='openCommandCenter()'>\u2B06 COMMAND CENTER</button>",
    "  <a id='ccAdminFallback' href='/admin'>debug: /admin</a>",
    "</div>",
    "<div id='ccDim' onclick='closeCommandCenter()'></div>",
    "<div id='ccOverlay'>",
    "  <div id='ccHandleWrap' onclick='closeCommandCenter()'><div id='ccHandle'></div></div>",
    "  <div id='ccHeader'><span id='ccTitle'>\uD83D\uDEF8 COMMAND CENTER</span><button id='ccClose' onclick='closeCommandCenter()'>\u2715</button></div>",
    "  <div id='ccTabs'>",
    "    <button id='ccTab-registry' class='ccTabBtn active' onclick='ccSetTab(\"registry\")'>Registry</button>",
    "    <button id='ccTab-cargo' class='ccTabBtn' onclick='ccSetTab(\"cargo\")'>Cargo Bay</button>",
    "    <button id='ccTab-systems' class='ccTabBtn' onclick='ccSetTab(\"systems\")'>Systems</button>",
    "  </div>",
    "  <div id='ccPanels'>",
    "    <div id='ccPanel-registry' class='ccPanel ccActive'>",
    "      <h3 class='ccH'>Add an RSS/Article Feed Group</h3>",
    "      <div id='ccFdMsg' class='ccMsg'></div>",
    "      <input id='ccFdInput' class='ccInput' placeholder='https://example.com/feed/'>",
    "      <input id='ccFdName' class='ccInput' placeholder='Group name (optional)'>",
    "      <div class='ccInline'><label>items:</label><input id='ccFdMax' class='ccNum' type='number' value='15' min='1' max='30'></div>",
    "      <button id='ccFdBtn' class='ccGo' onclick='ccAddFeed()'>Add Feed Group \uD83D\uDCF0</button>",
    "      <h3 class='ccH'>Add a YouTube Channel Group</h3>",
    "      <div id='ccChMsg' class='ccMsg'></div>",
    "      <input id='ccChInput' class='ccInput' placeholder='@PowerfulJRE or channel URL'>",
    "      <div class='ccInline'><label>videos:</label><input id='ccChMax' class='ccNum' type='number' value='15' min='1' max='25'></div>",
    "      <button id='ccChBtn' class='ccGo' onclick='ccAddChannel()'>Add Channel Group \uD83D\uDCFA</button>",
    "      <h3 class='ccH'>Add Individual Links</h3>",
    "      <div id='ccAddMsg' class='ccMsg'></div>",
    "      <div id='ccProg' class='ccNote' style='display:none;'></div>",
    "      <textarea id='ccUrls' class='ccTextarea' placeholder='one URL per line'></textarea>",
    "      <button id='ccAddBtn' class='ccGo' onclick='ccAddLinks()'>Add Links \u2191</button>",
    "      <h3 class='ccH' id='ccCount'>Your Links</h3>",
    "      <div id='ccList'></div>",
    "    </div>",
    "    <div id='ccPanel-cargo' class='ccPanel'>",
    "      <h3 class='ccH' id='ccCargoCount'>Cargo Bay</h3>",
    "      <div id='ccCargoList'></div>",
    "    </div>",
    "    <div id='ccPanel-systems' class='ccPanel'>",
    "      <h3 class='ccH'>Active Systems</h3>",
    "      <div id='ccSysCurrent' class='ccNote'></div>",
    "      <div class='ccNote'>Control slots: left thumb \u00B7 center \u00B7 right thumb \u00B7 HUD \u00B7 gesture \u2014 customization arrives with loadouts.</div>",
    "      <h3 class='ccH'>Loadouts</h3>",
    "      <div id='ccLo-explorer' class='ccLoadout active' onclick='ccSetLoadout(\"explorer\")'><b>\uD83D\uDE80 Explorer</b><span>reverse/stop \u00B7 speed + formation \u00B7 forward \u00B7 free-look</span></div>",
    "      <div id='ccLo-research' class='ccLoadout' onclick='ccSetLoadout(\"research\")'><b>\uD83D\uDD2C Research</b><span>back/refold \u00B7 inspect/save \u00B7 next node \u00B7 face carousel (soon)</span></div>",
    "      <div id='ccLo-bounty' class='ccLoadout' onclick='ccSetLoadout(\"bounty\")'><b>\uD83C\uDFAF Bounty Hunter</b><span>shield/dodge \u00B7 bounty scanner \u00B7 blaster (soon)</span></div>",
    "    </div>",
    "  </div>",
    "</div>",
    "<div id='focusBar'>",
    "  <div id='fbTitle'></div>",
    "  <div class='fbRow'><button id='fbVisit'>Visit \u2192</button><button id='fbClose' onclick='closeFocus()'>\u2715 Close</button></div>",
    "</div>",
    "<div id='faceInspector'>",
    "  <div id='fiTop'>",
    "    <button id='fiBack' onclick='closeFaceInspector()'>\u2190 Back</button>",
    "    <span id='fiLabel'></span>",
    "    <div id='fiDots'>",
    "      <span class='fiDot'></span><span class='fiDot'></span><span class='fiDot'></span>",
    "      <span class='fiDot'></span><span class='fiDot'></span><span class='fiDot'></span>",
    "    </div>",
    "  </div>",
    "  <div id='fiBody'>",
    "    <div id='fiText'></div>",
    "    <img id='fiImg' alt='preview'>",
    "  </div>",
    "  <div id='fiActions'>",
    "    <button id='fiSaveBtn' onclick='fiSaveClick()'>\uD83D\uDCBE Save</button>",
    "    <button id='fiLaterBtn' onclick='fiAskLaterClick()'>\uD83D\uDD52 Later</button>",
    "  </div>",
    "  <div id='fiBottom'>",
    "    <button id='fiPrev' onclick='faceCarouselStep(-1)'>\u2039</button>",
    "    <button id='fiVisit'>Visit \u2192</button>",
    "    <button id='fiNext' onclick='faceCarouselStep(1)'>\u203A</button>",
    "  </div>",
    "</div>",
    "<div id='ov'>",
    "  <img id='ovImg' src='' alt='preview'>",
    "  <div id='ovTitle'></div>",
    "  <div id='ovDesc'></div>",
    "  <div id='ovDomain'></div>",
    "  <button id='ovVisit'>Visit Site \u2192</button>",
    "  <button id='ovClose' onclick='closeLink()'>\u2190 back to space</button>",
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

function buildAdminHTML(links){
  const grid=links.slice(0,60).map(function(l){
    return "<div style='background:#06040c;border:1px solid #1a1a2a;border-radius:5px;padding:8px;display:flex;gap:8px;align-items:center;'>"+
      (l.og_image_key?"<img src='/og-image/"+safe(l.id)+"' style='width:50px;height:50px;object-fit:cover;border-radius:4px;flex-shrink:0;'>":"<div style='width:50px;height:50px;background:#111;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:20px;'>\uD83D\uDD17</div>")+
      "<div style='flex:1;overflow:hidden;'><div style='color:#ccc;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'>"+safe(l.title||l.url)+"</div><div style='color:#00ff88;font-size:10px;'>"+safe(l.domain)+"</div></div>"+
      "<button onclick=\"del('"+safe(l.id)+"')\" style='background:#440000;color:#f88;border:1px solid #600;padding:6px 10px;border-radius:4px;cursor:pointer;font-family:monospace;flex-shrink:0;'>x</button>"+
      "</div>";
  }).join("");
  const parts=[
    "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'>",
    "<title>Link Lane - Add Links</title>",
    "<style>body{background:#06040c;color:#aaa;font-family:monospace;padding:20px;max-width:600px;margin:0 auto;}h1{color:#00ff88;font-size:20px;margin-bottom:4px;}h2{color:#ffdd00;margin:18px 0 8px;font-size:13px;}a{color:#00ff88;}textarea{width:100%;background:#000;color:#ccc;border:1px solid #1a1a2a;border-radius:4px;padding:10px;font-family:monospace;font-size:14px;min-height:100px;margin-bottom:8px;}button.go{background:#00ff88;color:#000;border:none;padding:12px 24px;font-family:monospace;font-size:15px;font-weight:bold;border-radius:6px;cursor:pointer;width:100%;margin-bottom:6px;}.note{color:#444;font-size:11px;line-height:1.6;margin-bottom:10px;}#msg{padding:10px;margin:6px 0;border-radius:4px;display:none;}.ok{background:#003300;color:#4f4;border:1px solid #4f4;}.er{background:#330000;color:#f44;border:1px solid #f44;}#progLabel{color:#666;font-size:11px;margin-bottom:6px;display:none;}.grid{display:flex;flex-direction:column;gap:6px;}</style>",
    "</head><body>",
    "<h1>\uD83D\uDD17 Link Lane</h1>",
    "<a href='/'>\u2190 back to game</a>",
    "<h2>Add an RSS/Article Feed Group</h2>",
    "<p class='note'>Any site with an RSS or Atom feed works - news, blogs, podcasts, tech/science publications. Paste the feed URL directly (not the site's homepage).</p>",
    "<div id='fdMsg'></div>",
    "<input id='fdInput' placeholder='https://example.com/feed/' style='width:100%;background:#000;color:#ccc;border:1px solid #1a1a2a;border-radius:4px;padding:10px;font-family:monospace;font-size:14px;margin-bottom:8px;'>",
    "<input id='fdName' placeholder='Group name (optional - auto-detected from feed)' style='width:100%;background:#000;color:#ccc;border:1px solid #1a1a2a;border-radius:4px;padding:10px;font-family:monospace;font-size:14px;margin-bottom:8px;'>",
    "<div style='display:flex;gap:8px;align-items:center;margin-bottom:8px;'>",
    "  <label style='color:#666;font-size:11px;'>items:</label>",
    "  <input id='fdMax' type='number' value='15' min='1' max='30' style='width:60px;background:#000;color:#ccc;border:1px solid #1a1a2a;border-radius:4px;padding:8px;font-family:monospace;'>",
    "</div>",
    "<button class='go' onclick='addFeed()'>Add Feed Group \uD83D\uDCF0</button>",
    "<h2>Add a YouTube Channel Group</h2>",
    "<p class='note'>Paste a channel URL, @handle, or UC... channel ID. Pulls that channel's newest uploads straight from its public RSS feed (no API key) and drops them into their own 3D galaxy.</p>",
    "<div id='chMsg'></div>",
    "<input id='chInput' placeholder='@PowerfulJRE or https://youtube.com/@channel' style='width:100%;background:#000;color:#ccc;border:1px solid #1a1a2a;border-radius:4px;padding:10px;font-family:monospace;font-size:14px;margin-bottom:8px;'>",
    "<div style='display:flex;gap:8px;align-items:center;margin-bottom:8px;'>",
    "  <label style='color:#666;font-size:11px;'>videos:</label>",
    "  <input id='chMax' type='number' value='15' min='1' max='25' style='width:60px;background:#000;color:#ccc;border:1px solid #1a1a2a;border-radius:4px;padding:8px;font-family:monospace;'>",
    "</div>",
    "<button class='go' onclick='addChannel()'>Add Channel Group \uD83D\uDCFA</button>",
    "<h2>Add Individual Links</h2>",
    "<p class='note'>Paste one URL per line. Each one's real preview image and title are fetched automatically (the same image you'd see in an iMessage or Slack link preview).</p>",
    "<div id='msg'></div>",
    "<div id='progLabel'></div>",
    "<textarea id='urlsInput' placeholder='https://example.com&#10;https://another-site.com/page'></textarea>",
    "<button class='go' onclick='addLinks()'>Add Links \u2191</button>",
    "<h2>Your Links ("+links.length+")</h2>",
    links.length?"<div class='grid'>"+grid+"</div>":"<p style='color:#333;font-size:12px;'>None added yet.</p>",
    "<script>",
    "function msg(t,ok){const d=document.getElementById('msg');d.textContent=t;d.className=ok?'ok':'er';d.style.display='block';setTimeout(function(){d.style.display='none';},6000);}",
    "function chMsg(t,ok){const d=document.getElementById('chMsg');d.textContent=t;d.className=ok?'ok':'er';d.style.display='block';}",
    "function fdMsg(t,ok){const d=document.getElementById('fdMsg');d.textContent=t;d.className=ok?'ok':'er';d.style.display='block';}",
    "async function addFeed(){",
    "  const feedUrl=document.getElementById('fdInput').value.trim();",
    "  const name=document.getElementById('fdName').value.trim();",
    "  const max=document.getElementById('fdMax').value||15;",
    "  if(!feedUrl){fdMsg('Enter a feed URL',false);return;}",
    "  const btn=document.querySelector('button[onclick=\"addFeed()\"]');btn.disabled=true;btn.textContent='Fetching feed...';",
    "  try{",
    "    const r=await fetch('/admin/add-feed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({feed_url:feedUrl,name:name||undefined,max:Number(max)})});",
    "    const d=await r.json();",
    "    if(d.ok) fdMsg('Added '+d.added+' item(s) from \"'+d.feed+'\"'+(d.skipped?(' ('+d.skipped+' already had)'):'')+'. Refresh game to see the new galaxy.',true);",
    "    else fdMsg(d.error||'Failed to add feed',false);",
    "  }catch(e){fdMsg('Request failed: '+e.message,false);}",
    "  btn.disabled=false;btn.textContent='Add Feed Group \uD83D\uDCF0';",
    "}",
    "async function addChannel(){",
    "  const input=document.getElementById('chInput').value.trim();",
    "  const max=document.getElementById('chMax').value||15;",
    "  if(!input){chMsg('Enter a channel URL or handle',false);return;}",
    "  const btn=document.querySelector('button[onclick=\"addChannel()\"]');btn.disabled=true;btn.textContent='Fetching channel...';",
    "  try{",
    "    const r=await fetch('/admin/add-channel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:input,max:Number(max)})});",
    "    const d=await r.json();",
    "    if(d.ok) chMsg('Added '+d.added+' video(s) from \"'+d.channel+'\"'+(d.skipped?(' ('+d.skipped+' already had)'):'')+'. Refresh game to see the new galaxy.',true);",
    "    else chMsg(d.error||'Failed to add channel',false);",
    "  }catch(e){chMsg('Request failed: '+e.message,false);}",
    "  btn.disabled=false;btn.textContent='Add Channel Group \uD83D\uDCFA';",
    "}",
    "function setProg(t){const p=document.getElementById('progLabel');p.textContent=t;p.style.display=t?'block':'none';}",
    "async function addLinks(){",
    "  const lines=document.getElementById('urlsInput').value.split('\\n').map(function(s){return s.trim();}).filter(Boolean);",
    "  if(!lines.length){msg('No URLs entered',false);return;}",
    "  const btn=document.querySelector('button.go');btn.disabled=true;",
    "  let done=0,errors=0;",
    "  for(const url of lines){",
    "    setProg('Fetching '+(done+errors+1)+' / '+lines.length+'...');",
    "    try{const r=await fetch('/admin/add',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:url})});const d=await r.json();if(d.ok)done++;else errors++;}catch(e){errors++;}",
    "  }",
    "  setProg('');btn.disabled=false;",
    "  if(errors) msg('Added '+done+', '+errors+' failed',done>0);",
    "  else msg('Added '+done+' link'+(done===1?'':'s')+'! Refresh game to see them.',true);",
    "}",
    "function del(id){if(!confirm('Remove this link?'))return;fetch('/admin/link/'+id,{method:'DELETE'}).then(function(r){return r.json();}).then(function(d){if(d.ok)location.reload();}).catch(function(){});}",
    "</script>",
    "</body></html>"
  ];
  return parts.join("\n");
}

// =================== API ===================

async function apiAddLink(env,req){
  const body=await req.json().catch(()=>({}));
  const url=body.url;
  if(!url) return j({ok:false,error:"url required"},400);
  let normalizedUrl=url;
  if(!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl="https://"+normalizedUrl;
  const id=uid();
  let title=normalizedUrl,description="",ogImageKey=null;
  try{
    const preview=await fetchLinkPreview(normalizedUrl);
    title=preview.title;description=preview.description;
    if(preview.ogImageUrl) ogImageKey=await storeOgImage(env,id,preview.ogImageUrl);
  }catch(e){
    // Still save the link even if preview fetch failed - just without an image
  }
  const vidId=youtubeVideoId(normalizedUrl);
  let isShort=0,finalUrl=normalizedUrl;
  if(vidId){
    isShort=(await detectShort(vidId))?1:0;
    if(isShort) finalUrl="https://www.youtube.com/shorts/"+vidId;
  }
  const domain=domainOf(finalUrl);
  await env.DB.prepare("INSERT INTO links (id,url,title,description,domain,og_image_key,video_id,is_short) VALUES (?,?,?,?,?,?,?,?)")
    .bind(id,finalUrl,title,description,domain,ogImageKey,vidId,isShort).run();
  return j({ok:true,id,domain,has_image:Boolean(ogImageKey),is_short:Boolean(isShort)});
}

async function apiOgImage(env,id){
  const row=await env.DB.prepare("SELECT og_image_key FROM links WHERE id=?").bind(safe(id)).first();
  if(!row||!row.og_image_key) return new Response("Not found",{status:404});
  const obj=await env.BUCKET.get(row.og_image_key);
  if(!obj) return new Response("Not found",{status:404});
  return new Response(obj.body,{headers:{"Content-Type":obj.httpMetadata?.contentType||"image/jpeg","Cache-Control":"public, max-age=86400"}});
}

async function deleteLink(env,id){
  const row=await env.DB.prepare("SELECT og_image_key FROM links WHERE id=?").bind(safe(id)).first();
  if(row&&row.og_image_key) await env.BUCKET.delete(row.og_image_key);
  await env.DB.prepare("DELETE FROM links WHERE id=?").bind(safe(id)).run();
  return j({ok:true});
}

async function apiCreateSelectedCard(env,req){
  const body=await req.json().catch(()=>({}));
  const linkId=body.link_id;
  if(!linkId) return j({ok:false,error:"link_id required"},400);
  const faces=Array.isArray(body.faces)?body.faces:[];
  const selectedFace=(body.selected_face===0||body.selected_face)?Number(body.selected_face):null;
  const gesture=body.gesture||"button";
  const status=selectedFace===null?"later":"saved";
  const id=uid();
  const now=new Date().toISOString();
  await env.DB.prepare("INSERT INTO selected_cards (id,link_id,selected_face,gesture,status,title,url,domain,face_snapshot_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
    .bind(id,safe(linkId),selectedFace,gesture,status,body.title||"",body.url||"",body.domain||"",JSON.stringify(faces),now,now).run();
  for(const f of faces){
    await env.DB.prepare("INSERT INTO selected_card_faces (id,card_id,face_index,label,value,text,image_key) VALUES (?,?,?,?,?,?,?)")
      .bind(uid(),id,f.index,f.label||"",f.value||"",f.text||"",f.image_key||null).run();
  }
  await env.DB.prepare("INSERT INTO selected_card_events (id,card_id,event_type,event_json) VALUES (?,?,?,?)")
    .bind(uid(),id,"created",JSON.stringify({selected_face:selectedFace,gesture:gesture})).run();
  return j({ok:true,id,status});
}

async function apiListSelectedCards(env){
  const r=await env.DB.prepare("SELECT sc.id,sc.link_id,sc.selected_face,sc.status,sc.priority,sc.title,sc.url,sc.domain,sc.created_at,l.og_image_key FROM selected_cards sc LEFT JOIN links l ON l.id=sc.link_id WHERE sc.status!='archived' ORDER BY sc.created_at DESC LIMIT 500").all();
  return j({ok:true,cards:r.results||[]});
}

async function apiGetSelectedCard(env,id){
  const card=await env.DB.prepare("SELECT * FROM selected_cards WHERE id=?").bind(safe(id)).first();
  if(!card) return j({ok:false,error:"not found"},404);
  const faces=await env.DB.prepare("SELECT face_index,label,value,text,image_key FROM selected_card_faces WHERE card_id=? ORDER BY face_index").bind(safe(id)).all();
  const notes=await env.DB.prepare("SELECT id,note_text,tags_json,created_at FROM card_notes WHERE card_id=? ORDER BY created_at DESC").bind(safe(id)).all();
  return j({ok:true,card,faces:faces.results||[],notes:notes.results||[]});
}

async function apiAddCardNote(env,req,id){
  const card=await env.DB.prepare("SELECT id FROM selected_cards WHERE id=?").bind(safe(id)).first();
  if(!card) return j({ok:false,error:"not found"},404);
  const body=await req.json().catch(()=>({}));
  const noteText=body.note_text;
  if(!noteText) return j({ok:false,error:"note_text required"},400);
  const noteId=uid();
  await env.DB.prepare("INSERT INTO card_notes (id,card_id,note_text,tags_json) VALUES (?,?,?,?)")
    .bind(noteId,safe(id),noteText,JSON.stringify(body.tags||[])).run();
  await env.DB.prepare("INSERT INTO selected_card_events (id,card_id,event_type,event_json) VALUES (?,?,?,?)")
    .bind(uid(),safe(id),"note_added",JSON.stringify({note_id:noteId})).run();
  return j({ok:true,id:noteId});
}

async function apiArchiveSelectedCard(env,id){
  const card=await env.DB.prepare("SELECT id FROM selected_cards WHERE id=?").bind(safe(id)).first();
  if(!card) return j({ok:false,error:"not found"},404);
  await env.DB.prepare("UPDATE selected_cards SET status='archived',updated_at=? WHERE id=?").bind(new Date().toISOString(),safe(id)).run();
  await env.DB.prepare("INSERT INTO selected_card_events (id,card_id,event_type,event_json) VALUES (?,?,?,?)")
    .bind(uid(),safe(id),"archived",JSON.stringify({})).run();
  return j({ok:true});
}

async function apiSetBountyStatus(env,id,newStatus){
  const item=await env.DB.prepare("SELECT id,status FROM bounty_vault_items WHERE id=?").bind(safe(id)).first();
  if(!item) return j({ok:false,error:"not found"},404);
  if(item.status==="discarded"||item.status==="released") return j({ok:false,error:"already "+item.status},400);
  await env.DB.prepare("UPDATE bounty_vault_items SET status=?,updated_at=? WHERE id=?").bind(newStatus,new Date().toISOString(),safe(id)).run();
  await env.DB.prepare("INSERT INTO ad_interaction_events (id,vault_item_id,event_type,event_json) VALUES (?,?,?,?)")
    .bind(uid(),safe(id),newStatus,JSON.stringify({previous_status:item.status})).run();
  return j({ok:true,status:newStatus});
}

function buildCardsHTML(cards){
  const rows=cards.map(function(c){
    return "<a class='cardRow' href='/card/"+safe(c.id)+"'>"+
      "<div class='cardThumb'>"+(c.og_image_key?"<img src='/og-image/"+safe(c.link_id)+"'>":"\uD83D\uDCC7")+"</div>"+
      "<div class='cardMid'><div class='cardTitle'>"+safe(c.title||c.url)+"</div>"+
      "<div class='cardMeta'>"+safe(c.domain||"")+" \u00B7 "+safe(c.status)+" \u00B7 "+safe((c.created_at||"").slice(0,10))+"</div></div>"+
      "</a>";
  }).join("");
  const parts=[
    "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'>",
    "<title>Link Lane - Cards</title>",
    "<style>body{background:#06040c;color:#aaa;font-family:monospace;padding:20px;max-width:600px;margin:0 auto;}h1{color:#00ff88;font-size:20px;margin-bottom:4px;}a.back{color:#00ff88;display:inline-block;margin-bottom:14px;}.cardRow{display:flex;gap:10px;align-items:center;background:#0a0814;border:1px solid #1a1a2a;border-radius:6px;padding:10px;margin-bottom:8px;text-decoration:none;}.cardThumb{width:44px;height:44px;border-radius:4px;background:#111;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;overflow:hidden;}.cardThumb img{width:100%;height:100%;object-fit:cover;}.cardMid{flex:1;overflow:hidden;}.cardTitle{color:#ccc;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}.cardMeta{color:#00ff88;font-size:10px;margin-top:2px;}.empty{color:#333;font-size:13px;}</style>",
    "</head><body>",
    "<a class='back' href='/'>\u2190 back to game</a>",
    "<a class='back' href='/bounty-vault' style='margin-left:14px;'>\uD83C\uDFF0 Bounty Vault</a>",
    "<h1>\uD83D\uDCE6 Selected Cards ("+cards.length+")</h1>",
    cards.length?rows:"<p class='empty'>None saved yet. Open a node in-game, tap a face, and Save or swipe up.</p>",
    "</body></html>"
  ];
  return parts.join("\n");
}

function buildCardDetailHTML(card,faces,notes){
  const faceHtml=faces.map(function(f){
    if(f.label==="IMAGE"){
      return "<div class='faceBlock'><div class='faceLabel'>"+safe(f.label)+"</div>"+(f.image_key?"<img class='faceImg' src='/og-image/"+safe(card.link_id)+"'>":"<div class='faceText'>\u2014</div>")+"</div>";
    }
    return "<div class='faceBlock'><div class='faceLabel'>"+safe(f.label)+"</div><div class='faceText'>"+safe(f.text||f.value||"\u2014")+"</div></div>";
  }).join("");
  const noteHtml=notes.map(function(n){
    return "<div class='noteRow'><div class='noteText'>"+safe(n.note_text)+"</div><div class='noteDate'>"+safe((n.created_at||"").slice(0,16).replace("T"," "))+"</div></div>";
  }).join("");
  const parts=[
    "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'>",
    "<title>"+safe(card.title||"Card")+" - Link Lane</title>",
    "<style>body{background:#06040c;color:#aaa;font-family:monospace;padding:20px;max-width:600px;margin:0 auto;}h1{color:#00ff88;font-size:18px;margin-bottom:4px;word-break:break-word;}a.back{color:#00ff88;display:inline-block;margin-bottom:14px;}.meta{color:#556;font-size:11px;margin-bottom:14px;}.faceBlock{background:#0a0814;border:1px solid #1a1a2a;border-radius:6px;padding:10px;margin-bottom:8px;}.faceLabel{color:#ffdd00;font-size:10px;letter-spacing:1px;margin-bottom:4px;}.faceText{color:#ddd;font-size:13px;}.faceImg{max-width:100%;border-radius:4px;}.btnRow{display:flex;gap:8px;margin:16px 0;}.btn{flex:1;padding:11px;text-align:center;border-radius:6px;font-family:monospace;font-size:13px;cursor:pointer;text-decoration:none;border:none;box-sizing:border-box;}.btnVisit{background:#00ff88;color:#000;font-weight:bold;}.btnArchive{background:#330000;color:#f88;border:1px solid #600;}h2{color:#ffdd00;font-size:13px;margin:18px 0 8px;}#noteMsg{display:none;padding:8px;margin:6px 0;border-radius:4px;font-size:11px;}#noteMsg.ok{background:#003300;color:#4f4;border:1px solid #4f4;display:block;}.noteRow{background:#0a0814;border:1px solid #1a1a2a;border-radius:6px;padding:8px;margin-bottom:6px;}.noteText{color:#ccc;font-size:12px;}.noteDate{color:#445;font-size:10px;margin-top:3px;}textarea{width:100%;background:#000;color:#ccc;border:1px solid #1a1a2a;border-radius:4px;padding:9px;font-family:monospace;font-size:13px;min-height:60px;margin-bottom:6px;box-sizing:border-box;}.go{width:100%;background:#00ff88;color:#000;border:none;padding:10px;font-family:monospace;font-size:13px;font-weight:bold;border-radius:6px;cursor:pointer;}.archived{color:#f88;font-size:11px;}</style>",
    "</head><body>",
    "<a class='back' href='/cards'>\u2190 all cards</a>",
    "<h1>"+safe(card.title||card.url||"Untitled")+"</h1>",
    "<div class='meta'>"+safe(card.domain||"")+" \u00B7 "+safe(card.status)+(card.status==="archived"?" <span class='archived'>(archived)</span>":"")+" \u00B7 saved "+safe((card.created_at||"").slice(0,10))+"</div>",
    "<div class='btnRow'><a class='btn btnVisit' href='"+safe(card.url||"#")+"' target='_blank'>Visit \u2192</a>"+
      (card.status==="archived"?"":"<button class='btn btnArchive' onclick='archiveCard()'>Archive</button>")+"</div>",
    "<h2>Original Faces</h2>",
    faceHtml,
    "<h2>Notes</h2>",
    "<div id='noteMsg'></div>",
    notes.length?noteHtml:"<p style='color:#333;font-size:12px;'>No notes yet.</p>",
    "<textarea id='noteInput' placeholder='Add a note...'></textarea>",
    "<button class='go' onclick='addNote()'>Add Note</button>",
    "<script>",
    "function archiveCard(){if(!confirm('Archive this card?'))return;fetch('/api/selected-cards/"+safe(card.id)+"/archive',{method:'POST'}).then(function(r){return r.json();}).then(function(d){if(d.ok)location.reload();});}",
    "function addNote(){",
    "  const t=document.getElementById('noteInput').value.trim();",
    "  if(!t)return;",
    "  fetch('/api/selected-cards/"+safe(card.id)+"/notes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({note_text:t})}).then(function(r){return r.json();}).then(function(d){",
    "    if(d.ok){const m=document.getElementById('noteMsg');m.textContent='Note added';m.className='ok';location.reload();}",
    "  });",
    "}",
    "</script>",
    "</body></html>"
  ];
  return parts.join("\n");
}

function statusColor(s){
  if(s==="captured"||s==="claimed"||s==="redeemed") return "#00ff88";
  if(s==="expired"||s==="discarded") return "#f66";
  if(s==="released"||s==="transferred") return "#6cf";
  return "#ffdd00";
}

function entityEmoji(t){
  if(t==="boss_ship") return "\uD83D\uDEF8";
  if(t==="alien") return "\uD83D\uDC7D";
  if(t==="satellite") return "\uD83D\uDEF0";
  return "\u2604";
}

function buildBountyVaultHTML(items){
  const rows=items.map(function(it){
    return "<a class='cardRow' href='/bounty/"+safe(it.id)+"'>"+
      "<div class='cardThumb'>"+entityEmoji(it.entity_type)+"</div>"+
      "<div class='cardMid'><div class='cardTitle'>"+safe(it.creative_title||"Untitled bounty")+"</div>"+
      "<div class='cardMeta'>"+safe(it.reward_value||it.reward_type||"")+"</div></div>"+
      "<div class='bvStatus' style='color:"+statusColor(it.status)+"'>"+safe(it.status)+"</div>"+
      "</a>";
  }).join("");
  const parts=[
    "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'>",
    "<title>Link Lane - Bounty Vault</title>",
    "<style>body{background:#06040c;color:#aaa;font-family:monospace;padding:20px;max-width:600px;margin:0 auto;}h1{color:#00ff88;font-size:20px;margin-bottom:4px;}a.back{color:#00ff88;display:inline-block;margin-bottom:14px;}.cardRow{display:flex;gap:10px;align-items:center;background:#0a0814;border:1px solid #1a1a2a;border-radius:6px;padding:10px;margin-bottom:8px;text-decoration:none;}.cardThumb{width:44px;height:44px;border-radius:4px;background:#111;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}.cardMid{flex:1;overflow:hidden;}.cardTitle{color:#ccc;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}.cardMeta{color:#00ff88;font-size:10px;margin-top:2px;}.bvStatus{font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;flex-shrink:0;}.empty{color:#333;font-size:13px;}</style>",
    "</head><body>",
    "<a class='back' href='/'>\u2190 back to game</a>",
    "<a class='back' href='/cards' style='margin-left:14px;'>\uD83D\uDCE6 Selected Cards</a>",
    "<h1>\uD83C\uDFF0 Bounty Vault ("+items.length+")</h1>",
    items.length?rows:"<p class='empty'>Nothing captured yet. Ad asteroids arrive in a future update.</p>",
    "</body></html>"
  ];
  return parts.join("\n");
}

function buildBountyDetailHTML(item,rewards){
  let reward={},terms={};
  try{reward=JSON.parse(item.reward_json||"{}");}catch(e){}
  try{terms=JSON.parse(item.terms_json||"{}");}catch(e){}
  const rewardKeys=Object.keys(reward);
  const rewardHtml=rewardKeys.length?rewardKeys.map(function(k){
    return "<div class='bvRow'><span class='bvKey'>"+safe(k)+"</span><span class='bvVal'>"+safe(String(reward[k]))+"</span></div>";
  }).join(""):"<div class='bvRow'><span class='bvKey'>type</span><span class='bvVal'>"+safe(item.reward_type||"\u2014")+"</span></div><div class='bvRow'><span class='bvKey'>value</span><span class='bvVal'>"+safe(item.reward_value||"\u2014")+"</span></div>";
  const termsKeys=Object.keys(terms);
  const termsHtml=termsKeys.length?termsKeys.map(function(k){
    return "<div class='bvRow'><span class='bvKey'>"+safe(k)+"</span><span class='bvVal'>"+safe(String(terms[k]))+"</span></div>";
  }).join(""):"<p style='color:#333;font-size:12px;'>No terms recorded.</p>";
  const rewardLedgerHtml=rewards.map(function(r){
    return "<div class='noteRow'><div class='noteText'>"+safe(r.reward_type)+" \u2014 "+safe(r.amount||"")+" ("+safe(r.status)+")</div><div class='noteDate'>"+safe((r.created_at||"").slice(0,16).replace("T"," "))+"</div></div>";
  }).join("");
  const sc=statusColor(item.status);
  const parts=[
    "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'>",
    "<title>"+safe(item.creative_title||"Bounty")+" - Link Lane</title>",
    "<style>body{background:#06040c;color:#aaa;font-family:monospace;padding:20px;max-width:600px;margin:0 auto;}h1{color:#00ff88;font-size:18px;margin-bottom:4px;word-break:break-word;}a.back{color:#00ff88;display:inline-block;margin-bottom:14px;}.meta{color:#556;font-size:11px;margin-bottom:14px;}.bvBadge{display:inline-block;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-left:6px;}h2{color:#ffdd00;font-size:13px;margin:18px 0 8px;}.bvBlock{background:#0a0814;border:1px solid #1a1a2a;border-radius:6px;padding:10px;margin-bottom:8px;}.bvRow{display:flex;justify-content:space-between;padding:4px 0;font-size:12px;border-bottom:1px solid #161622;}.bvRow:last-child{border-bottom:none;}.bvKey{color:#667;text-transform:uppercase;font-size:10px;letter-spacing:1px;}.bvVal{color:#ddd;text-align:right;}.noteRow{background:#0a0814;border:1px solid #1a1a2a;border-radius:6px;padding:8px;margin-bottom:6px;}.noteText{color:#ccc;font-size:12px;}.noteDate{color:#445;font-size:10px;margin-top:3px;}.btn{display:block;width:100%;padding:11px;text-align:center;border-radius:6px;font-family:monospace;font-size:13px;font-weight:bold;text-decoration:none;background:#00ff88;color:#000;box-sizing:border-box;margin:16px 0;}.btnRow{display:flex;gap:8px;margin:16px 0;}.btnHalf{flex:1;padding:11px;text-align:center;border-radius:6px;font-family:monospace;font-size:13px;font-weight:bold;cursor:pointer;border:none;box-sizing:border-box;}.btnDiscard{background:#330000;color:#f88;border:1px solid #600;}.btnRelease{background:#00263a;color:#6cf;border:1px solid #069;}.sampleNote{color:#665;font-size:10px;margin-top:16px;font-style:italic;}</style>",
    "</head><body>",
    "<a class='back' href='/bounty-vault'>\u2190 all bounties</a>",
    "<h1>"+safe(item.creative_title||"Untitled bounty")+"<span class='bvBadge' style='background:"+sc+"22;color:"+sc+";border:1px solid "+sc+"'>"+safe(item.status)+"</span></h1>",
    "<div class='meta'>"+safe(item.campaign_name||"")+" \u00B7 "+safe(item.entity_type||"")+" \u00B7 captured "+safe((item.created_at||"").slice(0,10))+(item.expires_at?(" \u00B7 expires "+safe(String(item.expires_at).slice(0,10))):"")+"</div>",
    "<div class='bvBlock'><div class='bvRow'><span class='bvKey'>Source</span><span class='bvVal'>"+safe(item.advertiser_id||item.campaign_name||"\u2014")+"</span></div><div class='bvRow'><span class='bvKey'>Status</span><span class='bvVal' style='color:"+sc+"'>"+safe(item.status)+"</span></div></div>",
    item.coupon_code?("<div class='bvBlock'><div class='bvRow'><span class='bvKey'>Coupon Code</span><span class='bvVal'>"+safe(item.coupon_code)+"</span></div></div>"):"",
    "<h2>Reward</h2>",
    "<div class='bvBlock'>"+rewardHtml+"</div>",
    "<h2>Terms</h2>",
    "<div class='bvBlock'>"+termsHtml+"</div>",
    item.landing_url?("<a class='btn' href='"+safe(item.landing_url)+"' target='_blank'>Visit Offer \u2192</a>"):"",
    (item.status!=="discarded"&&item.status!=="released")?("<div class='btnRow'><button class='btnHalf btnDiscard' onclick=\"setBountyStatus('discarded')\">\uD83D\uDDD1 Discard</button><button class='btnHalf btnRelease' onclick=\"setBountyStatus('released')\">\uD83D\uDD13 Release</button></div>"):"",
    rewards.length?("<h2>Reward Ledger</h2>"+rewardLedgerHtml):"",
    item.status==="discarded"?"<p class='sampleNote'>This item has been discarded and removed from your active vault.</p>":"",
    item.status==="released"?"<p class='sampleNote'>This item has been released back into circulation.</p>":"",
    "<script>",
    "function setBountyStatus(action){",
    "  if(!confirm((action==='discarded'?'Discard':'Release')+' this vault item?'))return;",
    "  fetch('/api/bounty-vault/"+safe(item.id)+"/'+action,{method:'POST'}).then(function(r){return r.json();}).then(function(d){if(d.ok)location.reload();else alert(d.error||'Failed');});",
    "}",
    "</script>",
    "</body></html>"
  ];
  return parts.join("\n");
}

// =================== ROUTER ===================

export default {
  async fetch(request,env){
    const url=new URL(request.url),path=url.pathname,method=request.method;
    if(method==="OPTIONS") return new Response(null,{status:204,headers:CORS});
    if(path.startsWith("/og-image/")) return apiOgImage(env,decodeURIComponent(path.slice(10)));
    if(path==="/admin"&&method==="GET"){
      const r=await env.DB.prepare("SELECT id,url,title,domain,og_image_key,group_name,is_short FROM links ORDER BY added_at DESC LIMIT 1500").all();
      return new Response(buildAdminHTML(r.results||[]),{headers:{"Content-Type":"text/html;charset=UTF-8"}});
    }
    if(path==="/admin/add"&&method==="POST") return apiAddLink(env,request);
    if(path==="/admin/add-channel"&&method==="POST") return apiAddChannel(env,request);
    if(path==="/admin/add-feed"&&method==="POST") return apiAddFeed(env,request);
    if(path.startsWith("/admin/link/")&&method==="DELETE") return deleteLink(env,decodeURIComponent(path.slice(12)));
    if(path==="/health") return j({ok:true,worker:WORKER_NAME,version:VERSION});
    if(path==="/admin/setup"&&method==="POST"){
      const results=[];
      for(const sql of SCHEMA){try{await env.DB.prepare(sql).run();results.push({ok:true});}catch(e){results.push({ok:false,error:e.message});}}
      return j({ok:true,results});
    }
    if(path==="/api/selected-cards"&&method==="POST") return apiCreateSelectedCard(env,request);
    if(path==="/api/selected-cards"&&method==="GET") return apiListSelectedCards(env);
    if(/^\/api\/selected-cards\/[^/]+\/notes$/.test(path)&&method==="POST") return apiAddCardNote(env,request,path.split("/")[3]);
    if(/^\/api\/selected-cards\/[^/]+\/archive$/.test(path)&&method==="POST") return apiArchiveSelectedCard(env,path.split("/")[3]);
    if(/^\/api\/selected-cards\/[^/]+$/.test(path)&&method==="GET") return apiGetSelectedCard(env,path.split("/")[3]);
    if(path==="/cards"&&method==="GET"){
      const r=await env.DB.prepare("SELECT sc.id,sc.link_id,sc.selected_face,sc.status,sc.priority,sc.title,sc.url,sc.domain,sc.created_at,l.og_image_key FROM selected_cards sc LEFT JOIN links l ON l.id=sc.link_id WHERE sc.status!='archived' ORDER BY sc.created_at DESC LIMIT 500").all();
      return new Response(buildCardsHTML(r.results||[]),{headers:{"Content-Type":"text/html;charset=UTF-8"}});
    }
    if(path.startsWith("/card/")&&method==="GET"){
      const cardId=decodeURIComponent(path.slice(6));
      const card=await env.DB.prepare("SELECT * FROM selected_cards WHERE id=?").bind(safe(cardId)).first();
      if(!card) return new Response("Not found",{status:404});
      const faces=await env.DB.prepare("SELECT face_index,label,value,text,image_key FROM selected_card_faces WHERE card_id=? ORDER BY face_index").bind(safe(cardId)).all();
      const notes=await env.DB.prepare("SELECT id,note_text,tags_json,created_at FROM card_notes WHERE card_id=? ORDER BY created_at DESC").bind(safe(cardId)).all();
      return new Response(buildCardDetailHTML(card,faces.results||[],notes.results||[]),{headers:{"Content-Type":"text/html;charset=UTF-8"}});
    }
    if(/^\/api\/bounty-vault\/[^/]+\/discard$/.test(path)&&method==="POST") return apiSetBountyStatus(env,path.split("/")[3],"discarded");
    if(/^\/api\/bounty-vault\/[^/]+\/release$/.test(path)&&method==="POST") return apiSetBountyStatus(env,path.split("/")[3],"released");
    if(path==="/bounty-vault"&&method==="GET"){
      const r=await env.DB.prepare("SELECT bv.id,bv.status,bv.reward_type,bv.reward_value,bv.coupon_code,bv.expires_at,bv.created_at,c.title AS creative_title,c.creative_type,e.entity_type FROM bounty_vault_items bv LEFT JOIN ad_creatives c ON c.id=bv.creative_id LEFT JOIN ad_entities e ON e.id=bv.ad_entity_id WHERE bv.status NOT IN ('discarded','released') ORDER BY bv.created_at DESC LIMIT 200").all();
      return new Response(buildBountyVaultHTML(r.results||[]),{headers:{"Content-Type":"text/html;charset=UTF-8"}});
    }
    if(path.startsWith("/bounty/")&&method==="GET"){
      const bId=decodeURIComponent(path.slice(8));
      const item=await env.DB.prepare("SELECT bv.*,c.title AS creative_title,c.copy,c.creative_type,c.landing_url,c.terms_json,c.reward_json,camp.name AS campaign_name,camp.advertiser_id,e.entity_type FROM bounty_vault_items bv LEFT JOIN ad_creatives c ON c.id=bv.creative_id LEFT JOIN ad_campaigns camp ON camp.id=bv.campaign_id LEFT JOIN ad_entities e ON e.id=bv.ad_entity_id WHERE bv.id=?").bind(safe(bId)).first();
      if(!item) return new Response("Not found",{status:404});
      const rewards=await env.DB.prepare("SELECT id,reward_type,amount,status,reason,created_at FROM ad_rewards WHERE vault_item_id=? ORDER BY created_at DESC").bind(safe(bId)).all();
      return new Response(buildBountyDetailHTML(item,rewards.results||[]),{headers:{"Content-Type":"text/html;charset=UTF-8"}});
    }
    if(path==="/"||path===""){
      const r=await env.DB.prepare("SELECT id,url,title,description,domain,og_image_key,group_name,is_short,published_at,added_at FROM links ORDER BY COALESCE(group_name,domain), added_at LIMIT 1500").all();
      const layout=layoutLinks(r.results||[]);
      return new Response(buildGameHTML(layout),{headers:{"Content-Type":"text/html;charset=UTF-8"}});
    }
    return j({error:"Not found"},404);
  }
};