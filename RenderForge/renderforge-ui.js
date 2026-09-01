// RenderForge UI Hooks
window.RenderForgeUI={
 sendPrompt(data){
  return window.RenderForgeImage?.loadPrompt(data);
 },
 saveCharacter(data){
  return window.RenderForgeSave?.saveCharacter(data);
 }
};
