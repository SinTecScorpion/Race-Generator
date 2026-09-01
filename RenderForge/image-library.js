// RenderForge Phase 1
// Image Library Foundation

const RenderForgeImageLibrary = {

    storageKey: "renderforge_image_library",


    createImageEntry(data = {}) {

        const imageEntry = {

            id: "IMG-" + Date.now(),

            characterId: data.characterId || "",

            type: data.type || "generated",

            imageData: data.imageData || "",

            promptUsed: data.promptUsed || "",

            styleMode: data.styleMode || "",

            created: new Date().toISOString(),

            notes: data.notes || ""

        };


        this.saveImage(imageEntry);

        return imageEntry;
    },


    saveImage(imageEntry) {

        let library = this.getLibrary();


        const existing = library.findIndex(
            image => image.id === imageEntry.id
        );


        if (existing >= 0) {

            library[existing] = imageEntry;

        } else {

            library.push(imageEntry);

        }


        localStorage.setItem(
            this.storageKey,
            JSON.stringify(library)
        );


        return true;
    },


    getLibrary() {

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


    getCharacterImages(characterId) {

        const library = this.getLibrary();


        return library.filter(
            image => image.characterId === characterId
        );

    },


    deleteImage(id) {

        let library = this.getLibrary();


        library = library.filter(
            image => image.id !== id
        );


        localStorage.setItem(
            this.storageKey,
            JSON.stringify(library)
        );

    },


    clearLibrary() {

        localStorage.removeItem(
            this.storageKey
        );

    }

};


// Make available to RenderForge

window.RenderForgeImageLibrary = RenderForgeImageLibrary;
