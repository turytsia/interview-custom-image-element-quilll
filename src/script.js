const Delta = Quill.import('delta')
const Block = Quill.import('blots/block');

/**
 * Custom element q-img-text
 */
class QImage extends Block {

    static blotName = 'qImage'

    static tagName = 'q-img-text'

    static create(value) {

        const node = super.create(value)

        node.innerHTML = `<img src='${value.image}' />${value.text}`

        return node
    }

}

// Register custom element
Quill.register(QImage);

/**
 * Retrieve url from a file
 * 
 * @param {File} file 
 * @returns {Promise<string>}
 */
const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            resolve(event.target.result);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Retrieve url from the files and create an array of instances of qImage
 * 
 * @param {FileList} files 
 */
const convertFilesToQImage = async (files) => {

    const fileArray = Array.from(files)

    const promises = await Promise.allSettled(fileArray.map(async file => ({
        image: await readFileAsDataURL(file),
        text: "Your text"
    })))

    const fulfilledPromises = promises
        .filter(({ status }) => status === "fulfilled")
        .map(({ value }) => value)

    return fulfilledPromises
}

Quill.register('modules/image', function (quill, options) {

    /**
     * Handle images upload to an editor
     * 
     * @param {Event} event 
     * @returns 
     */
    const handleImageUpload = async (event) => {

        const selection = quill.getSelection()

        const qImages = await convertFilesToQImage(event.target.files)

        qImages.forEach(qImage => {
            const contents = new Delta().retain(selection.index).insert({
                qImage
            })

            quill.updateContents(contents) 
        })
    }

    /**
     * Open window for a user to select an image
     */
    const imageHandler = () => {
        const fileInput = document.createElement('input');

        fileInput.setAttribute('type', 'file')

        fileInput.setAttribute('multiple', 'true')

        fileInput.click();

        fileInput.addEventListener('change', handleImageUpload)
    }

    quill.getModule('toolbar').addHandler('image', imageHandler);
});

/**
 * Handles event when user drops images into a drop zone (editor)
 * 
 * @param {DragEvent} event 
 * @returns {Promise<void>}
 */
const handleDragDrop = async (event) => {
    event.stopPropagation();
    event.preventDefault();

    const qImages = await convertFilesToQImage(event.dataTransfer.files)

    qImages.forEach(qImage => {
        const contents = new Delta().retain(0).insert({
            qImage
        })

        editor.updateContents(contents)
    })
}

/**
 * Handles event when user drags over an image
 * 
 * @param {DragEvent} event 
 * @returns {void}
 */
const handleDragOver = (event) => {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy'; 
}

var editor = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: '#toolbar',
        image: true
    }
});


editor.container.addEventListener('dragover', handleDragOver, false);
editor.container.addEventListener('drop', handleDragDrop, false);

editor.on('text-change', (delta, old, source) => {
    // Find all the q-img-text elements in the editor
    const qimages = document.querySelectorAll('q-img-text')

    // if there is no q-img-text elements, stop
    if (!qimages.length) return

    // Take first found element
    const first = qimages[0]

    // Remove 'title' attribute if it has one
    first.querySelector('img')?.removeAttribute("title")

    // Iterate through other elements
    for (let i = 1; i < qimages.length; i++) {
        // Current element
        const qImage = qimages[i]

        // Find an image inside of an element
        const img = qImage.querySelector('img')

        // If image is not found, continue
        if (!img) {
            continue;
        }

        // if image is found, check if title already set required one
        if (img.getAttribute("title") !== i.toString()) {

            // Update title
            img.setAttribute("title", i)
        }
    }

});

// REVIEW testing
// Uncomment it to generate 100 images
// const COUNT = 100;

// const test = {
//     qImage: {
//         image: "https://i0.wp.com/picjumbo.com/wp-content/uploads/beautiful-nature-mountain-scenery-with-flowers-free-photo.jpg?w=2210&quality=70",
//         text: "Dummy test"
//     }
// };

// const testDelta = new Delta().retain(0).insert(test);

// [...Array(COUNT)].forEach(_ => {
//     editor.updateContents(testDelta)
// })