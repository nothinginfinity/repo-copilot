const MODEL='@cf/baai/bge-base-en-v1.5';
const CHAT_MODEL='@cf/meta/llama-3.1-8b-instruct';
const WORKER='contractor-v003-2-afo';
const R2_PREFIX='contractor-v003-2/';
function j(x,s){return new Response(JSON.stringify(x,null,2),{status:s||200,headers:{'content-type':'application/json;charset=utf-8','access-control-allow-origin':'*'}})}
function h(x,s){return new Response(x,{status:s||200,headers:{'content-type':'text/html;charset=utf-8'}})}
async function body(req){try{return await req.json()}catch(e){return {}}}
function