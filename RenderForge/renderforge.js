// RenderForge Phase 1
// Main Controller Connection Layer

const RenderForge = {


    version: "Phase 1",


    createCharacterFromPrompt(promptData) {

        if (!window.RenderForgeSave) {

            console.error(
                "RenderForgeSave not loaded"
            );

            return null;
        }


        const character =
            RenderForgeSave.createCharacter(
                promptData
            );


        console.log(
            "RenderForge Character Saved:",
            character
        );


        return character;

    },


    attachImage(characterId, imageData, promptData = {}) {


        if (!window.RenderForgeImageLibrary) {

            console.error(
                "Image Library not loaded"
            );

            return null;

        }


        const image =
            RenderForgeImageLibrary.createImageEntry({

                characterId: characterId,

                imageData: imageData,

                promptUsed:
                    promptData.fullPrompt || "",

                styleMode:
                    promptData.styleMode || ""

            });


        console.log(
            "RenderForge Image Added:",
            image
        );


        return image;

    },


    getCharacters() {

        return RenderForgeSave.getArchive();

    },


    getImages() {

        return RenderForgeImageLibrary.getLibrary();

    },


    exportCharacter(characterId) {


        const character =
            RenderForgeSave.getCharacter(
                characterId
            );


        if (!character) {

            console.error(
                "Character not found"
            );

            return null;

        }


        const file =
            JSON.stringify(
                character,
                null,
                2
            );


        return file;

    }

};


// Global access

window.RenderForge = RenderForge;


console.log(
    "RenderForge Phase 1 Loaded"
);
