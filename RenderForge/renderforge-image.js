// RenderForge Image Bridge
window.RenderForgeImage = {
 currentPrompt:null,
 loadPrompt(data){ this.currentPrompt=data; return data; },
 getPrompt(){ return this.currentPrompt; },
 requestImageGeneration(){
  console.log("RenderForge request:", this.currentPrompt);
  return this.currentPrompt;
 }
};
