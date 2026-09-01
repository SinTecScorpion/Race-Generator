// RenderForge Character Save System
// Stores generated characters, prompts, images, and identity data

const CHARACTER_STORAGE_KEY = "renderforge_character_archive";

function getCharacterArchive() {
  try {
    const saved = localStorage.getItem(CHARACTER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Character archive load error:", error);
    return [];
  }
}

function saveCharacterArchive(characters) {
  try {
    localStorage.setItem(
      CHARACTER_STORAGE_KEY,
      JSON.stringify(characters)
    );
    return true;
  } catch (error) {
    console.error("Character archive save error:", error);
    return false;
  }
}

function createCharacterSave(characterData) {

  const archive = getCharacterArchive();

  const character = {
    id: "RF-" + Date.now(),

    created: new Date().toISOString(),

    name:
      characterData.name ||
      "Unnamed RenderForge Character",

    race:
      characterData.race ||
      "Unknown Race",

    category:
      characterData.category ||
      "",

    affinity:
      characterData.affinity ||
      "",

    identityBanner:
      characterData.identityBanner ||
      "",

    anatomyAllowlist:
      characterData.anatomyAllowlist ||
      [],

    appearance:
      characterData.appearance ||
      {},

    clothing:
      characterData.clothing ||
      {},

    equipment:
      characterData.equipment ||
      {},

    style:
      characterData.style ||
      "Anime",

    generationMode:
      characterData.generationMode ||
      "Single Image",

    prompt:
      characterData.prompt ||
      "",

    images:
      characterData.images ||
      [],

    notes:
      characterData.notes ||
      ""
  };


  archive.push(character);

  saveCharacterArchive(archive);

  return character;
}


function loadCharacterSave(id) {

  const archive = getCharacterArchive();

  return archive.find(
    character => character.id === id
  );
}


function deleteCharacterSave(id) {

  let archive = getCharacterArchive();

  archive = archive.filter(
    character => character.id !== id
  );

  saveCharacterArchive(archive);

}


function updateCharacterSave(id, updates) {

  const archive = getCharacterArchive();

  const index = archive.findIndex(
    character => character.id === id
  );


  if(index === -1) {
    return false;
  }


  archive[index] = {
    ...archive[index],
    ...updates
  };


  saveCharacterArchive(archive);

  return archive[index];
}


function exportCharacterSave(id) {

  const character = loadCharacterSave(id);

  if(!character) {
    return null;
  }


  const file = new Blob(
    [
      JSON.stringify(
        character,
        null,
        2
      )
    ],
    {
      type:"application/json"
    }
  );


  const url = URL.createObjectURL(file);

  const link = document.createElement("a");

  link.href = url;

  link.download =
    character.name.replace(/\s+/g,"_")
    +
    "_RenderForge_Save.json";


  link.click();

  URL.revokeObjectURL(url);

}


window.RenderForgeCharacterSave = {

  create:
    createCharacterSave,

  load:
    loadCharacterSave,

  delete:
    deleteCharacterSave,

  update:
    updateCharacterSave,

  export:
    exportCharacterSave,

  getAll:
    getCharacterArchive

};
