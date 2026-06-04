const VERSION='0.2.0-vectorize';
const CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization,Mcp-Session-Id'};

const TOOLS=[
  {name:'d1_admin_status',description:'Show D1 admin MCP status and binding presence.',inputSchema:{type:'object',properties:{},required:[]}},
  {name:'create_d1_database',description:'Create a Cloudflare D1 database by name.',inputSchema:{type:'object',properties:{database_name:{type:'string'},name:{type:'string'},account_id:{type:'string'}},required:[]}},
  {name:'list_d1_databases',description:'List Cloudflare D1 databases for the account.',inputSchema:{type:'object',properties:{account_id:{type:'string'},page:{type:'number'},per_page:{type:'number'}},required:[]}},
  {name:'get_d1_database',description:'Get Cloudflare D1 database metadata by database_id.',inputSchema:{type:'object',properties:{database_id:{type:'string'},account_id:{type:'string'}},required:['database_id']}},
  {name:'delete_d1_database',description:'Delete a Cloudflare D1 database. Requires confirm_delete=true.',inputSchema:{type:'object',properties:{database_id:{type:'string'},confirm_delete:{type:'boolean'},account_id:{type:'string'}},required:['database_id','confirm_delete']}},
  {name:'create_vectorize_index',description:'Create a Cloudflare Vectorize index via the CF API.',inputSchema:{type:'object',properties:{index_name:{type:'string'},dimensions:{type:'number'},metric:{type:'string'},account_id:{type:'string'}},required:['index_name']}},
  {name:'list_vectorize_indexes',description:'List all Vectorize indexes for this account.',inputSchema:{type:'object',properties:{account_id:{type:'string'}},required:[]}}
];

function rpc(id,r){return Response.json({jsonrpc:'2.0',id,result:r},{headers:CORS});}
function err(id,c,m){return Response.json({jsonrpc:'2.0',id,error:{code:c,message:m}},{headers:CORS});}
function tool(id,r){return rpc(id,{content:[{type:'text',text:JSON.stringify(r,null,2)}]});}

async function cfApi(env,method,path,body,accountId){
  const aid=accountId||env.CF_ACCOUNT_ID;
  const token=env.CF_API_TOKEN;
  if(!aid||!token)throw new Error('CF credentials not configured');
  const url=`https://api.cloudflare.com/client/v4/accounts/${aid}${path}`;
  const opts={method,headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}};
  if(body)opts.body=JSON.stringify(body);
  const res=await fetch(url,opts);
  return{status:res.status,data:await res.json()};
}

async function handle(name,args,env){
  const aid=args.account_id||env.CF_ACCOUNT_ID;

  if(name==='d1_admin_status')return{status:'ok',worker:'afo-d1-admin-mcp',version:VERSION,bindings:{CF_ACCOUNT_ID:!!env.CF_ACCOUNT_ID,CF_API_TOKEN:!!env.CF_API_TOKEN},tools:TOOLS.map(t=>t.name)};

  if(name==='create_d1_database'){
    const dbName=args.database_name||args.name;
    if(!dbName)throw new Error('database_name or name required');
    const r=await cfApi(env,'POST','/d1/database',{name:dbName},aid);
    if(!r.data.success)throw new Error(JSON.stringify(r.data.errors));
    return{ok:true,account_id:aid,result:r.data.result};
  }

  if(name==='list_d1_databases'){
    const page=args.page||1,per_page=args.per_page||50;
    const r=await cfApi(env,'GET',`/d1/database?page=${page}&per_page=${per_page}`,null,aid);
    if(!r.data.success)throw new Error(JSON.stringify(r.data.errors));
    return{ok:true,account_id:aid,result:r.data.result,result_info:r.data.result_info};
  }

  if(name==='get_d1_database'){
    const r=await cfApi(env,'GET',`/d1/database/${args.database_id}`,null,aid);
    if(!r.data.success)throw new Error(JSON.stringify(r.data.errors));
    return{ok:true,account_id:aid,result:r.data.result};
  }

  if(name==='delete_d1_database'){
    if(!args.confirm_delete)throw new Error('confirm_delete=true required');
    const r=await cfApi(env,'DELETE',`/d1/database/${args.database_id}`,null,aid);
    return{ok:r.data.success,account_id:aid,deleted:args.database_id,result:r.data};
  }

  if(name==='create_vectorize_index'){
    const{index_name,dimensions,metric}=args;
    const body={name:index_name,config:{dimensions:dimensions||768,metric:metric||'cosine'}};
    const r=await cfApi(env,'POST','/vectorize/v2/indexes',body,aid);
    const alreadyExists=r.data.errors?.some(e=>e.code===1001||String(e.message||'').toLowerCase().includes('already exist'));
    if(!r.data.success&&!alreadyExists)throw new Error(JSON.stringify(r.data.errors));
    return{created:!alreadyExists,already_existed:alreadyExists,index_name,dimensions:dimensions||768,metric:metric||'cosine',cloudflare_status:r.status,result:r.data.result||null};
  }

  if(name==='list_vectorize_indexes'){
    const r=await cfApi(env,'GET','/vectorize/v2/indexes',null,aid);
    if(!r.data.success)throw new Error(JSON.stringify(r.data.errors));
    return{ok:true,account_id:aid,indexes:(r.data.result||[]).map(i=>({name:i.name,config:i.config,created_on:i.created_on}))};
  }

  throw new Error('Unknown tool: '+name);
}

export default{
  async fetch(request,env){
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:CORS});
    if(new URL(request.url).pathname==='/health')return Response.json({status:'ok',worker:'afo-d1-admin-mcp',version:VERSION},{headers:CORS});
    if(request.method!=='POST')return new Response('not found',{status:404,headers:CORS});
    let body;try{body=await request.json();}catch{return err(null,-32700,'Parse error');}
    const{id,method,params}=body;
    if(method==='initialize')return rpc(id,{protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:'afo-d1-admin-mcp',version:VERSION}});
    if(method==='notifications/initialized')return new Response(null,{status:204,headers:CORS});
    if(method==='ping')return rpc(id,{});
    if(method==='tools/list')return rpc(id,{tools:TOOLS});
    if(method==='tools/call'){try{return tool(id,await handle(params?.name,params?.arguments||{},env));}catch(e){return err(id,-32603,'Tool error: '+e.message);}}
    return err(id,-32601,'Method not found: '+method);
  }
};
