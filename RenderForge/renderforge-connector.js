// RenderForge Phase 4A — Secure Image Engine Connector
// The API key NEVER belongs in this browser file.
// Point RenderForge at your deployed secure server endpoint.

(function(){
  const CONFIG_KEY = "renderforge_connector_config_v1";

  function read(){
    try{
      return JSON.parse(localStorage.getItem(CONFIG_KEY) || '{"endpoint":""}');
    }catch(e){
      return {endpoint:""};
    }
  }

  function write(v){
    localStorage.setItem(CONFIG_KEY, JSON.stringify(v));
  }

  window.RenderForgeConnector = {
    getConfig(){
      return Object.assign({endpoint:""}, read());
    },

    saveConfig(config){
      const next = {
        endpoint: String(config?.endpoint || "").trim().replace(/\/+$/,"")
      };
      write(next);
      return next;
    },

    async test(){
      const {endpoint} = this.getConfig();
      if(!endpoint) throw new Error("Enter your secure connector URL first.");
      const r = await fetch(endpoint + "/health", {method:"GET", cache:"no-store"});
      if(!r.ok) throw new Error("Connector health check failed (" + r.status + ").");
      return r.json();
    },

    async generate(request){
      const {endpoint} = this.getConfig();
      if(!endpoint) throw new Error("RenderForge connector URL is not configured.");
      const r = await fetch(endpoint + "/generate", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(request)
      });
      let body = null;
      try { body = await r.json(); } catch(e) {}
      if(!r.ok){
        throw new Error(body?.error || ("Image generation failed (" + r.status + ")."));
      }
      return body;
    }
  };
})();
