// RenderForge Bridge
// Phase 1 connection between Race Generator and RenderForge

window.RenderForgeBridge = {
  sendToRenderForge(prompt) {
    const characterData = {
      id: "RF-" + Date.now(),
      timestamp: new Date().toISOString(),
      prompt: prompt
    };

    localStorage.setItem(
      "renderforge_current_character",
      JSON.stringify(characterData)
    );

    window.location.href = "RenderForge/RenderForge_index.html";
  },

  loadCharacter() {
    const data = localStorage.getItem("renderforge_current_character");
    return data ? JSON.parse(data) : null;
  }
};
