// RenderForge Image Library System
// Handles generated image storage and character image collections

const IMAGE_LIBRARY_KEY = "renderforge_image_library";


function getImageLibrary() {

    try {

        const saved =
            localStorage.getItem(IMAGE_LIBRARY_KEY);

        return saved
            ? JSON.parse(saved)
            : [];

    } catch(error) {

        console.error(
            "Image library load error:",
            error
        );

        return [];
    }
}



function saveImageLibrary(images) {

    try {

        localStorage.setItem(
            IMAGE_LIBRARY_KEY,
            JSON.stringify(images)
        );

        return true;

    } catch(error) {

        console.error(
            "Image library save error:",
            error
        );

        return false;
    }
}



function addImageToLibrary(imageData) {


    const library =
        getImageLibrary();


    const image = {

        id:
            "IMG-" + Date.now(),


        characterID:
            imageData.characterID ||
            "",


        title:
            imageData.title ||
            "RenderForge Image",


        imageURL:
            imageData.imageURL ||
            "",


        thumbnail:
            imageData.thumbnail ||
            "",


        prompt:
            imageData.prompt ||
            "",


        style:
            imageData.style ||
            "",


        generationMode:
            imageData.generationMode ||
            "",


        created:
            new Date().toISOString()
    };


    library.push(image);


    saveImageLibrary(library);


    return image;

}



function getCharacterImages(characterID) {


    const library =
        getImageLibrary();


    return library.filter(
        image =>
            image.characterID === characterID
    );

}



function deleteImage(imageID) {


    let library =
        getImageLibrary();


    library =
        library.filter(
            image =>
                image.id !== imageID
        );


    saveImageLibrary(library);

}



function exportImage(imageURL, filename) {


    const link =
        document.createElement("a");


    link.href =
        imageURL;


    link.download =
        filename ||
        "RenderForge_Image.png";


    link.click();

}



function clearImageLibrary() {

    localStorage.removeItem(
        IMAGE_LIBRARY_KEY
    );

}



window.RenderForgeImageLibrary = {

    add:
        addImageToLibrary,

    getAll:
        getImageLibrary,

    getForCharacter:
        getCharacterImages,

    delete:
        deleteImage,

    export:
        exportImage,

    clear:
        clearImageLibrary

};
