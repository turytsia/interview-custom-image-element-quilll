var Delta = Quill.import('delta')

/** @link https://github.com/quilljs/quill/issues/1109 */
const Inline = Quill.import('blots/inline');

/**
 * 
 */
class QImage extends Inline {
    static blotName = 'qImage'
    static tagName = 'q-img-text'

    /**
     * 
     * @param {*} value 
     * @returns 
     */
    static create(value) {
        const node = super.create()

        node.innerHTML = `<img src=${value.image} />${value.text}`

        return node
    }

    /**
     * 
     * @param {*} node 
     * @returns 
     */
    static value(node) {
        const img = node.querySelector('img')

        return {
            image: img.getAttribute('src'),
            text: node.innerHTML,
        };
    }
}

Quill.register(QImage);

/**
 * 
 * @param {*} file 
 * @returns 
 */
function readFileAsDataURL(file) {
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

Quill.register('modules/image', function (quill, options) {

    /**
     * 
     * @param {*} event 
     * @returns 
     */
    const handleImageUpload = async (event) => {
        for (file of event.target.files) {
            const imageUrl = await readFileAsDataURL(file);

            const contents = new Delta().retain(quill.getSelection().index).insert({
                qImage: {
                    image: imageUrl,
                    text: "123"
                }
            })

            quill.updateContents(contents)
        }        
    }

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

// var Delta = Quill.import('delta')

// editor.updateContents(new Delta().retain(10).insert({
//     qImage: {
//         image: "https://fastly.picsum.photos/id/1035/200/300.jpg?hmac=744aBtkMLjfDyn2TzkMxsFzw2T0L57TMlNGFlX-Qgq0",
//         text: "123"
//     }
// }))