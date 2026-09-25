const MODEL="@cf/black-forest-labs/flux-1-schnell";
const cors=o=>({"Access-Control-Allow-Origin":o||"*","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type"});
const reply=(x,s=200,o="*")=>new Response(JSON.stringify(x),{status:s,headers:{"Content-Type":"application/json",...cors(o)}});
const sizes={"1:1":[768,768],"3:4":[768,1024],"4:3":[1024,768],"9:16":[576,1024],"16:9":[1024,576]};
export default {async fetch(request,env){
 const o=request.headers.get("Origin")||"*"; if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors(o)});
 const u=new URL(request.url);
 if(u.pathname==="/health"&&request.method==="GET")return reply({ok:true,service:"RenderForge Free Test Engine",provider:"Cloudflare Workers AI",model:MODEL},200,o);
 if(u.pathname!=="/generate"||request.method!=="POST")return reply({error:"Not found."},404,o);
 try{
  const b=await request.json(),p=String(b?.prompt||"").trim(); if(!p)return reply({error:"No image prompt supplied."},400,o);
  const s=b?.settings||{},count=Math.max(1,Math.min(4,Number(s.imageCount)||1)),[width,height]=sizes[s.aspectRatio]||sizes["1:1"];
  const neg=String(s.negativePrompt||"").trim(), raw=String(s.seed||"").trim(), seed=raw&&Number.isFinite(Number(raw))?Number(raw):undefined, images=[];
  for(let i=0;i<count;i++){
   const input={prompt:neg?`${p}\n\nAvoid: ${neg}`:p,width,height,num_steps:s.quality==="Maximum"?8:s.quality==="High"?6:4};
   if(seed!==undefined)input.seed=seed+i;
   const r=await env.AI.run(MODEL,input); let ab;
   if(r instanceof ReadableStream)ab=await new Response(r).arrayBuffer(); else if(r instanceof ArrayBuffer)ab=r;
   else if(r?.image){const bin=atob(r.image),a=new Uint8Array(bin.length);for(let j=0;j<bin.length;j++)a[j]=bin.charCodeAt(j);ab=a.buffer;}
   else throw new Error("Unexpected Workers AI image response.");
   const a=new Uint8Array(ab);let bin="";for(let j=0;j<a.length;j+=32768)bin+=String.fromCharCode(...a.subarray(j,j+32768));
   images.push({dataUrl:"data:image/png;base64,"+btoa(bin)});
  }
  return reply({images,model:MODEL,provider:"Cloudflare Workers AI"},200,o);
 }catch(e){return reply({error:e?.message||"Image generation failed."},500,o);}
}};