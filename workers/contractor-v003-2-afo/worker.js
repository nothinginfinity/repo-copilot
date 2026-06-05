const VERSION='0.3.2-seed-rag';
const EMBEDDING_MODEL='@cf/baai/bge-base-en-v1.5';
const CHAT_MODEL='@cf/meta/llama-3.1-8b-instruct';
const H={'content-type':'application/json;charset=utf-8','access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization'};
function J(x,s){return new Response(JSON.stringify(x,null,2),{status:s||200,headers:H});}
