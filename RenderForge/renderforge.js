// RenderForge Core Engine
// Connects prompts, image generation, character saves, and image library


const RenderForge = {


    currentCharacter: null,


    currentPrompt: "",



    initialize() {

        console.log(
            "RenderForge initialized"
        );

    },



    loadPrompt(prompt) {

        this.currentPrompt =
            prompt || "";

        console.log(
            "Prompt loaded into RenderForge"
        );

        return this.currentPrompt;

    },



    createCharacter(data) {


        if(window.RenderForgeCharacterSave) {


            const character =
                window.RenderForgeCharacterSave.create(
                    {

                        ...data,

                        prompt:
                            this.currentPrompt

                    }
                );


            this.currentCharacter =
                character;


            return character;

        }


        console.error(
            "Character save system missing"
        );


        return null;

    },



    registerImage(imageData) {


        if(!this.currentCharacter) {

            console.error(
                "No active character"
            );

            return null;

        }



        if(window.RenderForgeImageLibrary) {


            const image =
                window.RenderForgeImageLibrary.add(

                    {

                        ...imageData,

                        characterID:
                            this.currentCharacter.id,

                        prompt:
                            this.currentPrompt

                    }

                );


            return image;

        }



        console.error(
            "Image library missing"
        );


        return null;

    },



    prepareGenerationRequest(settings) {


        return {

            prompt:
                this.currentPrompt,


            style:
                settings.style ||
                "Anime",


            mode:
                settings.mode ||
                "Single Image",


            resolution:
                settings.resolution ||
                "1024x1024",


            characterID:
                this.currentCharacter
                ?
                this.currentCharacter.id
                :
                null

        };

    }



};



window.RenderForge =
    RenderForge;



RenderForge.initialize();
