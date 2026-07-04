const VERSION = "3.0.5";
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
  "CREATE TABLE IF NOT EXISTS user_ad_preferences (user_id TEXT PRIMARY KEY, preferences_json TEXT, blocked_categories_json TEXT, updated_at TEXT DEFAULT (datetime('now')))",
  "CREATE TABLE IF NOT EXISTS ad_variants (id TEXT PRIMARY KEY, campaign_id TEXT, parent_ad_id TEXT, parent_creative_id TEXT, creator_user_id TEXT, source_capture_id TEXT, variant_type TEXT, title TEXT, copy TEXT, media_r2_key TEXT, prompt_r2_key TEXT, status TEXT DEFAULT 'draft', created_at TEXT DEFAULT (datetime('now')))",
  "CREATE INDEX IF NOT EXISTS idx_ad_variants_capture ON ad_variants(source_capture_id, created_at)",
  "CREATE TABLE IF NOT EXISTS ad_variant_changes (id TEXT PRIMARY KEY, variant_id TEXT, change_type TEXT, before_json TEXT, after_json TEXT, rationale TEXT, created_at TEXT DEFAULT (datetime('now')))",
  "CREATE INDEX IF NOT EXISTS idx_ad_variant_changes_variant ON ad_variant_changes(variant_id)",
  "CREATE TABLE IF NOT EXISTS ad_variant_reviews (id TEXT PRIMARY KEY, variant_id TEXT, reviewer_type TEXT, status TEXT, notes TEXT, created_at TEXT DEFAULT (datetime('now')))",
  "CREATE INDEX IF NOT EXISTS idx_ad_variant_reviews_variant ON ad_variant_reviews(variant_id)",
  "CREATE TABLE IF NOT EXISTS ad_release_events (id TEXT PRIMARY KEY, variant_id TEXT, released_by_user_id TEXT, release_pool TEXT, status TEXT, release_json TEXT, created_at TEXT DEFAULT (datetime('now')))",
  "CREATE INDEX IF NOT EXISTS idx_ad_release_events_variant ON ad_release_events(variant_id)",
  "CREATE TABLE IF NOT EXISTS ad_performance_events (id TEXT PRIMARY KEY, variant_id TEXT, campaign_id TEXT, event_type TEXT, value TEXT, context_json TEXT, created_at TEXT DEFAULT (datetime('now')))",
  "CREATE INDEX IF NOT EXISTS idx_ad_performance_events_variant ON ad_performance_events(variant_id, created_at)",
  "CREATE TABLE IF NOT EXISTS ad_contributor_rewards (id TEXT PRIMARY KEY, user_id TEXT, variant_id TEXT, reward_type TEXT, amount TEXT, status TEXT, reason TEXT, created_at TEXT DEFAULT (datetime('now')))",
  "CREATE INDEX IF NOT EXISTS idx_ad_contributor_rewards_user ON ad_contributor_rewards(user_id, created_at)",
  "CREATE TABLE IF NOT EXISTS ad_variant_policy_checks (id TEXT PRIMARY KEY, variant_id TEXT, quality_score INTEGER, flags_json TEXT, recommendation TEXT, created_at TEXT DEFAULT (datetime('now')))",
  "CREATE INDEX IF NOT EXISTS idx_ad_variant_policy_checks_variant ON ad_variant_policy_checks(variant_id)"
];

const R_GALAXY = 1500;

// =================== v3.0.5 Approval / Policy / Abuse Guardrails ===================
// Variant lifecycle: draft -> pending_review -> approved -> released/rejected/retired
const VARIANT_STATUSES = ["draft","pending_review","approved","released","rejected","retired"];
const MAX_VARIANTS_PER_CAPTURE = 5; // duplicate/spam guard on the Improve form
const REWARD_COOLDOWN_MS = 60*1000; // min gap between contributor-reward grants for the same variant

// Hard-block patterns: claims severe enough to auto-reject without waiting on human review.
// Kept intentionally small and specific (medical/financial absolute-guarantee claims) rather than
// a broad blocklist, since over-blocking ordinary marketing language isn't the goal here.
const CLAIM_HARD_BLOCK_PATTERNS = [
  /\bcures?\b/i, /\bmiracle\b/i, /\bguaranteed?\s+(income|profit|return|money)\b/i,
  /\b100%\s*risk[\s-]?free\b/i, /\bno\s+risk\b/i, /\brisk[\s-]?free\b/i
];
// Soft-flag patterns: don't block, but surface to the reviewer as a caution.
const CLAIM_SOFT_FLAG_PATTERNS = [
  /\bguaranteed?\b/i, /\bfree\s+money\b/i, /\binstant\s+approval\b/i, /\bact\s+now\b/i,
  /\blimited\s+time\b/i, /\bdouble\s+your\b/i, /\bearn\s+\$\d+/i
];

function scanClaims(text){
  const t=String(text||"");
  const hardHits=CLAIM_HARD_BLOCK_PATTERNS.filter(function(re){return re.test(t);}).map(function(re){return re.source;});
  const softHits=CLAIM_SOFT_FLAG_PATTERNS.filter(function(re){return re.test(t);}).map(function(re){return re.source;});
  return {hardHits:hardHits,softHits:softHits};
}

function qualityScore(title,copy,claimFlags){
  let score=100;
  const t=String(title||"").trim(),c=String(copy||"").trim();
  if(!t) score-=25;
  else{
    if(t.length<8||t.length>90) score-=10;
    const letters=t.replace(/[^A-Za-z]/g,"");
    const upper=t.replace(/[^A-Z]/g,"");
    if(letters.length>6&&upper.length/letters.length>0.6) score-=15; // ALL CAPS spam
    if((t.match(/!/g)||[]).length>2) score-=10;
    if((t.match(/\$/g)||[]).length>2) score-=10;
  }
  if(!c) score-=5;
  score-=claimFlags.hardHits.length*40;
  score-=claimFlags.softHits.length*10;
  return Math.max(0,Math.min(100,score));
}

function runPolicyChecks(title,copy){
  const claims=scanClaims((title||"")+" "+(copy||""));
  const score=qualityScore(title,copy,claims);
  const flags=[];
  claims.hardHits.forEach(function(p){flags.push({type:"claim_hard_block",pattern:p});});
  claims.softHits.forEach(function(p){flags.push({type:"claim_soft_flag",pattern:p});});
  if(score<50) flags.push({type:"low_quality_score",score:score});
  const hardBlock=claims.hardHits.length>0;
  const recommendation=hardBlock?"auto_reject":(score<50||claims.softHits.length>0)?"needs_review":"clear";
  return {quality_score:score,flags:flags,recommendation:recommendation,hard_block:hardBlock};
}

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
