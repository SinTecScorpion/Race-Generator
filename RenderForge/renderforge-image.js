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
    variationMode: "fresh",
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

  function variationDirective(mode){
    const nonce = "RFV-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,9);
    if(mode === "preserve"){
      return `RENDERFORGE CHARACTER VARIATION MODE — PRESERVE CHARACTER:
Preserve the exact individual character already defined by the prompt: same facial structure, eye shape, nose, mouth, body proportions, racial markings, hair design, and other identity-bearing details. Change only rendering stochasticity and details that do not redesign the person.`;
    }
    if(mode === "variation"){
      return `RENDERFORGE CHARACTER VARIATION MODE — VARIATION OF CHARACTER — ${nonce}:
Keep the Locked Racial Identity, anatomy allowlist, sex/form, age category, major equipment, clothing category, and race-defining markings authoritative. Create a visibly different individual interpretation: change facial geometry, eye/brow shape, nose/mouth construction, subtle body proportions, hair arrangement within the selected hairstyle, and personal presence. It should feel related to the prompt but not like the same face copied again.`;
    }
    return `RENDERFORGE CHARACTER VARIATION MODE — FRESH RANDOM INDIVIDUAL — ${nonce}:
Create a NEW individual for this generation. Locked Racial Identity, fusion ratios, anatomy allowlist, race-specific coloration/markings, selected sex/form, age category, clothing/equipment requirements, and scene controls remain authoritative. Do NOT reuse the face, facial geometry, hair arrangement, body proportions, pose micro-details, or overall personal styling of a previous RenderForge generation. Any earlier individual-character snapshot wording is only a race-compatible starting point, NOT an instruction to clone the same person. Deliberately vary face shape, eye/brow construction, nose, mouth, cheek/jaw structure, subtle stature/proportions, hair arrangement within the selected hairstyle, expression nuance, and personal presence. Avoid a recurring default fantasy-model face.`;
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
      const promptWithVariation = this.currentPrompt.prompt + "\n\n" + variationDirective(s.variationMode || "fresh");
      return {
        app: "RenderForge",
        phase: 3,
        requestId: "RFG-" + Date.now(),
        created: new Date().toISOString(),
        characterId: this.currentPrompt.entry?.id || null,
        promptMode: this.currentPrompt.mode || "master",
        prompt: promptWithVariation,
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
