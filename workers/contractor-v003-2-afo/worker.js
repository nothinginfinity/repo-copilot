const VERSION='0.3.1-seed-rag';
const WORKER_NAME='contractor-v003-2-afo';
const COMPANY='CCS Services Group';
const PHONE='(818) 624-7212';
const EMBEDDING_MODEL='@cf/baai/bge-base-en-v1.5';
const CHAT_MODEL='@cf/meta/llama-3.1-8b-instruct';
const HEADERS={'content-type':'application/json;charset=utf-8','access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization'};
function json(v,s){return new Response(JSON.stringify(v,null,2),{status:s||200,headers:HEADERS});}
function text(v,t){return new Response(v,{headers:{'content-type':t||'text