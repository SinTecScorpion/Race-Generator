// RenderForge Phase 1 Patch
// Add this module after the existing generator code.
// Keeps the original generator archives untouched.

window.RenderForge = window.RenderForge || {};

RenderForge.archiveKey = "renderforge_character_archive_v1";

RenderForge.getArchive = function(){
  return JSON.parse(localStorage.getItem(this.archiveKey) || "[]");
};

RenderForge.saveCharacter = function(character){
  const archive = this.getArchive();

  const entry = {
    id: "RF-" + Date.now(),
    created: new Date().toISOString(),
    character: JSON.parse(JSON.stringify(character))
  };

  archive.unshift(entry);
  localStorage.setItem(this.archiveKey, JSON.stringify(archive));

  return entry;
};

RenderForge.loadCharacter = function(id){
  return this.getArchive().find(x => x.id === id) || null;
};

RenderForge.deleteCharacter = function(id){
  const archive = this.getArchive().filter(x => x.id !== id);
  localStorage.setItem(this.archiveKey, JSON.stringify(archive));
};

RenderForge.exportArchive = function(){
  const blob = new Blob(
    [JSON.stringify(this.getArchive(), null, 2)],
    {type:"application/json"}
  );

  const link=document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download="RenderForge_Character_Archive.json";
  link.click();
};

// Bridge existing generator output into RenderForge.
RenderForge.captureCurrentGeneration = function(){
  return {
    prompt: window.current?.prompt || "",
    race: window.current || null,
    promptArchive: typeof capturePromptArchive === "function"
      ? capturePromptArchive()
      : null,
    savedAt: Date.now()
  };
};
