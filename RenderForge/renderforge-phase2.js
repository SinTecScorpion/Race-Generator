// RenderForge Phase 2 — Character Workbench
// Reads the character packages saved by Race Generator and exposes them to the RenderForge UI.

(function(){
  const ARCHIVE_KEY = "renderforge_character_archive_v1";

  function clone(v){
    try { return JSON.parse(JSON.stringify(v)); } catch(e) { return v; }
  }

  function getArchive(){
    if(window.RenderForge && typeof window.RenderForge.getArchive === "function"){
      return window.RenderForge.getArchive();
    }
    try { return JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "[]"); }
    catch(e) { return []; }
  }

  function saveArchive(rows){
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(rows));
  }

  function promptSet(entry){
    const character = entry?.character || entry?.data || {};
    const current = character.current || character.race || {};
    const a = character.promptArchive || current.promptArchive || {};
    return {
      base: a.base || current.prompt || character.prompt || "",
      master: a.master || character.activePrompt || current.prompt || character.prompt || "",
      realistic: a.realistic || "",
      anime: a.anime || "",
      blenderFinished: a.blenderFinished || "",
      blenderBlueprint: a.blenderBlueprint || ""
    };
  }

  function displayTitle(entry){
    const character = entry?.character || entry?.data || {};
    return character?.current?.title || character?.race?.title || character?.title || entry?.id || "RenderForge Character";
  }

  window.RenderForgeWorkbench = {
    getArchive,
    getLatest(){
      const rows = getArchive();
      return rows.length ? rows[0] : null;
    },
    getById(id){
      return getArchive().find(x => x.id === id) || null;
    },
    getPromptSet: promptSet,
    getDisplayTitle: displayTitle,
    delete(id){
      const rows = getArchive().filter(x => x.id !== id);
      saveArchive(rows);
      return rows;
    },
    exportCharacter(entry){
      if(!entry) return;
      const name = displayTitle(entry).replace(/[\\/:*?"<>|]+/g," ").replace(/\s+/g," ").trim() || "RenderForge_Character";
      const blob = new Blob([JSON.stringify({
        app:"RenderForge",
        format:"renderforge-character-save",
        version:1,
        exportedAt:new Date().toISOString(),
        entry:clone(entry)
      }, null, 2)], {type:"application/json"});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name.replace(/ /g,"_") + ".renderforge.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(()=>URL.revokeObjectURL(a.href),1200);
    }
  };
})();
