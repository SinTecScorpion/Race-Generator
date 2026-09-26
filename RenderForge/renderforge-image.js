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

      // Keep the complete Master prompt untouched inside RenderForge.
      // FLUX Schnell accepts a maximum prompt length of 2048 characters,
      // so only the copy sent to the image engine is compacted.
      const originalPrompt = String(this.currentPrompt.prompt || "");
      const directive = variationDirective(s.variationMode || "fresh");

      function normalize(v){
        return String(v || "")
          .replace(/\\r/g, "")
          .replace(/[ \\t]+/g, " ")
          .replace(/\\n{3,}/g, "\\n\\n")
          .trim();
      }

      function firstMatch(source, patterns){
        for(const pattern of patterns){
          const match = source.match(pattern);
          if(match && match[0]) return normalize(match[0]);
        }
        return "";
      }

      function makeFluxSafePrompt(master, variation){
        const LIMIT = 2048;
        const source = normalize(master);

        const identity = firstMatch(source, [
          /=== RACE IDENTITY BANNER[\\s\\S]*?=== END RACE IDENTITY BANNER ===/i,
          /RACE IDENTITY BANNER[\\s\\S]*?(?=\\n\\n|ANATOMY ALLOWLIST|$)/i,
          /Locked Racial Identity:[\\s\\S]*?(?=\\n\\n|$)/i
        ]);

        const anatomy = firstMatch(source, [
          /ANATOMY ALLOWLIST[\\s\\S]*?(?=\\n\\n[A-Z][A-Z _-]{3,}:|$)/i
        ]);

        const fusion = firstMatch(source, [
          /FUSION RATIO:[\\s\\S]*?(?=\\n\\n|$)/i,
          /LOCKED IDENTITY RULE:[\\s\\S]*?(?=\\n\\n|$)/i
        ]);

        const render = firstMatch(source, [
          /REALISTIC STYLE LOCK[\\s\\S]*?(?=\\n\\n|$)/i,
          /REFERENCE SHEET MODE[\\s\\S]*?(?=\\n\\n|$)/i,
          /ANIME CHARACTER REFERENCE SHEET[\\s\\S]*?(?=\\n\\n|$)/i
        ]);

        let opening = source;
        const bannerEnd = opening.search(/=== END RACE IDENTITY BANNER ===/i);
        if(bannerEnd >= 0){
          opening = opening.slice(
            bannerEnd + "=== END RACE IDENTITY BANNER ===".length
          ).trim();
        }
        opening = opening.slice(0, 900);

        const compactVariation = normalize(variation)
          .replace(/RENDERFORGE CHARACTER VARIATION MODE[^:]*:/i, "Variation:")
          .slice(0, 420);

        const parts = [];
        for(const part of [identity, fusion, anatomy, opening, render, compactVariation]){
          const p = normalize(part);
          if(p && !parts.includes(p)) parts.push(p);
        }

        let out = "";
        for(const part of parts){
          const candidate = out ? out + "\\n\\n" + part : part;
          if(candidate.length <= LIMIT){
            out = candidate;
          }else{
            const remaining = LIMIT - out.length - (out ? 2 : 0);
            if(remaining > 80){
              out += (out ? "\\n\\n" : "") + part.slice(0, remaining);
            }
            break;
          }
        }

        return normalize(out).slice(0, LIMIT);
      }

      const enginePrompt = makeFluxSafePrompt(originalPrompt, directive);

      return {
        app: "RenderForge",
        phase: 3,
        requestId: "RFG-" + Date.now(),
        created: new Date().toISOString(),
        characterId: this.currentPrompt.entry?.id || null,
        promptMode: this.currentPrompt.mode || "master",
        prompt: enginePrompt,
        originalPrompt: originalPrompt,
        originalPromptLength: originalPrompt.length,
        enginePromptLength: enginePrompt.length,
        promptLimit: 2048,
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
        prompt: request.originalPrompt || request.prompt,
        enginePrompt: request.prompt,
        originalPromptLength: request.originalPromptLength,
        enginePromptLength: request.enginePromptLength,
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
