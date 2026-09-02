// RenderForge Image Bridge — Phase 3 Generation Studio
// Keeps RenderForge engine-agnostic. A real image backend can be attached later
// without changing Race Generator or the character archive.

(function(){
  const SETTINGS_KEY = "renderforge_generation_settings_v1";
  const RESULTS_KEY = "renderforge_generation_results_v1";

  const defaults = {
    aspectRatio: "1:1",
    imageCount: 1,
    quality: "High",
    seed: "",
    negativePrompt: ""
  };

  function read(key, fallback){
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch(e){ return fallback; }
  }
  function write(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }

  window.RenderForgeImage = {
    currentPrompt: null,

    loadPrompt(data){
      this.currentPrompt = data ? JSON.parse(JSON.stringify(data)) : null;
      return this.currentPrompt;
    },

    getPrompt(){
      return this.currentPrompt;
    },

    getSettings(){
      return Object.assign({}, defaults, read(SETTINGS_KEY, defaults));
    },

    saveSettings(settings){
      const next = Object.assign({}, defaults, settings || {});
      write(SETTINGS_KEY, next);
      return next;
    },

    buildRequest(settings){
      if(!this.currentPrompt || !this.currentPrompt.prompt){
        throw new Error("No prepared RenderForge prompt.");
      }
      const s = this.saveSettings(settings || this.getSettings());
      return {
        app: "RenderForge",
        phase: 3,
        requestId: "RFG-" + Date.now(),
        created: new Date().toISOString(),
        characterId: this.currentPrompt.entry?.id || null,
        promptMode: this.currentPrompt.mode || "master",
        prompt: this.currentPrompt.prompt,
        settings: s
      };
    },

    async requestImageGeneration(settings){
      const request = this.buildRequest(settings);
      if(!window.RenderForgeConnector){
        throw new Error("RenderForge connector module is missing.");
      }
      const response = await window.RenderForgeConnector.generate(request);
      const result = this.saveResult({
        requestId: request.requestId,
        characterId: request.characterId,
        promptMode: request.promptMode,
        prompt: request.prompt,
        settings: request.settings,
        images: Array.isArray(response.images) ? response.images : [],
        model: response.model || "gpt-image-2"
      });
      return {request, response, result};
    },

    saveResult(result){
      const rows = read(RESULTS_KEY, []);
      const entry = Object.assign({
        id: "RFI-" + Date.now(),
        created: new Date().toISOString()
      }, result || {});
      rows.unshift(entry);
      write(RESULTS_KEY, rows.slice(0, 100));
      return entry;
    },

    getResults(){
      return read(RESULTS_KEY, []);
    },

    clearResults(){
      write(RESULTS_KEY, []);
    }
  };
})();
