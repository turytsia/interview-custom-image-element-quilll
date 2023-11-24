const Delta = Quill.import('delta')
const Block = Quill.import('blots/block');


/**
 * 
 */
class QImage extends Block {

    static blotName = 'qImage'

    static tagName = 'q-image-text'

    /**
     * 
     * @param {*} value 
     * @returns 
     */
    static create(value) {

        const node = super.create(value)
        
        if (Array.isArray(value)) {
            throw new Error("value of type Array is not supported")
        }

        const txt = document.createTextNode(value.text)

        const img = document.createElement('img')

        img.setAttribute("src", value.image)

        node.appendChild(img)

        node.appendChild(txt)

        node.setAttribute("title", "1")

        return node
    }

}

Quill.register(QImage);

/**
 * 
 * @param {*} file 
 * @returns 
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
 * 
 * @param {*} files 
 */
const convertFilesToQImage = async (file) => {
    return {
        image: await readFileAsDataURL(file),
        text: "Your text"
    }
}

Quill.register('modules/image', function (quill, options) {

    /**
     * 
     * @param {*} event 
     * @returns 
     */
    const handleImageUpload = async (event) => {

        const selection = quill.getSelection()

        const [file] = event.target.files

        const contents = new Delta().retain(selection.index).insert({
            qImage: await convertFilesToQImage(file)
        })

        quill.updateContents(contents) 
    }

    /**
     * 
     */
    const imageHandler = () => {
        const fileInput = document.createElement('input');

        fileInput.setAttribute('type', 'file')

        fileInput.click();

        fileInput.addEventListener('change', handleImageUpload)
    }

    quill.getModule('toolbar').addHandler('image', imageHandler);
});


var editor = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: '#toolbar',
        image: true
    }
});

/**
 * 
 * @param {*} event 
 */
const handleFileSelect = async (event) => {
    event.stopPropagation();
    event.preventDefault();

    const [file] = event.dataTransfer.files

    const contents = new Delta().retain(0).insert({
        qImage: await convertFilesToQImage(file)
    })

    editor.updateContents(contents) 
}

/**
 * 
 * @param {*} event 
 */
const handleDragOver = (event) => {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}


const dropZone = document.getElementById('editor');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);

// var Delta = Quill.import('delta')

editor.updateContents(new Delta().retain(0).insert({
    qImage: {
        image: "https://fastly.picsum.photos/id/1035/200/300.jpg?hmac=744aBtkMLjfDyn2TzkMxsFzw2T0L57TMlNGFlX-Qgq0",
        text: "123"
    }
}))

editor.updateContents(new Delta().retain(0).insert({
    qImage: {
        image: "https://fastly.picsum.photos/id/1035/200/300.jpg?hmac=744aBtkMLjfDyn2TzkMxsFzw2T0L57TMlNGFlX-Qgq0",
        text: "123"
    }
}))