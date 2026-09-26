// RenderForge Cloudflare Workers AI Connector
// Connects the browser app to the deployed RenderForge Worker.

(function(){
  const CONFIG_KEY = "renderforge_connector_config_v1";
  const DEFAULT_ENDPOINT = "https://renderforge-image.sintecscorpion.workers.dev";

  function read(){
    try{
      return JSON.parse(localStorage.getItem(CONFIG_KEY) || JSON.stringify({endpoint:DEFAULT_ENDPOINT}));
    }catch(e){
      return {endpoint:DEFAULT_ENDPOINT};
    }
  }

  function write(v){
    localStorage.setItem(CONFIG_KEY, JSON.stringify(v));
  }

  function normalizeEndpoint(value){
    return String(value || DEFAULT_ENDPOINT).trim().replace(/\/+$/, "");
  }

  window.RenderForgeConnector = {
    getConfig(){
      const saved = read();
      return {endpoint: normalizeEndpoint(saved.endpoint)};
    },

    saveConfig(config){
      const next = {endpoint: normalizeEndpoint(config?.endpoint)};
      write(next);
      return next;
    },

    async test(){
      const {endpoint} = this.getConfig();
      if(!endpoint) throw new Error("Enter your RenderForge Worker URL first.");
      const r = await fetch(endpoint, {method:"GET", cache:"no-store"});
      let body = null;
      try { body = await r.json(); } catch(e) {}
      if(!r.ok) throw new Error(body?.error || ("Connector test failed (" + r.status + ")."));
      if(body?.ok === false) throw new Error(body?.error || "Connector test failed.");
      return body || {ok:true};
    },

    async generate(request){
      const {endpoint} = this.getConfig();
      if(!endpoint) throw new Error("RenderForge Worker URL is not configured.");

      const payload = {
        prompt: String(request?.prompt || "").trim()
      };
      if(!payload.prompt) throw new Error("No prompt was supplied to RenderForge.");

      const r = await fetch(endpoint, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload)
      });

      let body = null;
      try { body = await r.json(); } catch(e) {}
      if(!r.ok || body?.ok === false){
        throw new Error(body?.error || ("Image generation failed (" + r.status + ")."));
      }
      if(!body?.image){
        throw new Error("The RenderForge Worker returned no image.");
      }

      // Normalize the Worker response to the format the existing RenderForge UI expects.
      return {
        ok:true,
        model:body.model || "@cf/black-forest-labs/flux-1-schnell",
        images:[{dataUrl:body.image}]
      };
    }
  };
})();
