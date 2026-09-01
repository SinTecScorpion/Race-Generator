// RenderForge Phase 1
// Character Save + Archive System

const RenderForgeSave = {

    storageKey: "renderforge_character_archive",

    createCharacter(data = {}) {

        const now = new Date().toISOString();

        const character = {
            id: "RF-" + Date.now(),

            name: data.name || "Unnamed Character",

            created: now,
            updated: now,

            identity: {
                race: data.race || "",
                category: data.category || "",
                theme: data.theme || "",
                primaryAffinity: data.primaryAffinity || "",
                lockedIdentity: data.lockedIdentity || "",
                anatomyAllowlist: data.anatomyAllowlist || ""
            },

            generation: {
                fullPrompt: data.fullPrompt || "",
                styleMode: data.styleMode || "",
                pose: data.pose || "",
                camera: data.camera || "",
                lighting: data.lighting || "",
                environment: data.environment || ""
            },

            design: {
                appearance: data.appearance || "",
                bodyDescription: data.bodyDescription || "",
                hair: data.hair || "",
                markings: data.markings || "",
                clothing: data.clothing || "",
                materials: data.materials || "",
                equipment: data.equipment || ""
            },

            images: {
                primaryImage: "",
                referenceImages: [],
                generatedImages: []
            },

            archive: {
                favorite: false,
                notes: "",
                tags: []
            }
        };

        this.saveCharacter(character);

        return character;
    },


    saveCharacter(character) {

        let archive = this.getArchive();

        const existing = archive.findIndex(
            item => item.id === character.id
        );

        if (existing >= 0) {
            archive[existing] = character;
        } else {
            archive.push(character);
        }

        localStorage.setItem(
            this.storageKey,
            JSON.stringify(archive)
        );

        return true;
    },


    getArchive() {

        const saved = localStorage.getItem(
            this.storageKey
        );

        if (!saved) {
            return [];
        }

        try {
            return JSON.parse(saved);
        } catch {

            return [];
        }
    },


    getCharacter(id) {

        const archive = this.getArchive();

        return archive.find(
            character => character.id === id
        );
    },


    deleteCharacter(id) {

        let archive = this.getArchive();

        archive = archive.filter(
            character => character.id !== id
        );

        localStorage.setItem(
            this.storageKey,
            JSON.stringify(archive)
        );
    },


    clearArchive() {

        localStorage.removeItem(
            this.storageKey
        );
    }

};


// Make available to RenderForge
window.RenderForgeSave = RenderForgeSave;
