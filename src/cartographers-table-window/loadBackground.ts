// @ts-ignore
const {loadBackground:mLoad} = require("./../hard-dependencies/NodeBLKLoader.js");

function loadBackground(absolutePath: string, callback: (image: ImageData | HTMLImageElement) => void) {
    if (window.Worker) {
        console.log("Using worker");
        workerPromise(absolutePath, callback);
        return;
    }
    console.log("Not using worker");
    const logger = (pass: number, index: number, total: number) => {
        const percent = (((index + ((pass - 1) * total)) / (total * 2.0)) * 100).toFixed(0);
        console.log("ParsingBLK: " + percent + "%");
    };
    mLoad(absolutePath, logger).then((bytes: Int8Array) => {
        pushImageFromBytes(bytes, callback);
    });
}


function workerPromise(absolutePath: string, callback: (image: ImageData | HTMLImageElement) => void) {
    const worker = new Worker("./blkLoaderWorker.js");
    const terminate = () => {
        worker.onerror = null;
        worker.onmessage = null;
        worker.terminate();
    }
    worker.onerror = (e) => {
        terminate();
        throw Error("Failed to parse BLK: " + e.message);
    }
    worker.onmessage = (e) => {
        if (e.data == null) {
            terminate();
            throw Error("Failed to parse BLK");
        } else if (e.data.result) {
            pushImageFromBytes(e.data.result as Int8Array, callback)
            terminate()
        } else {
            const {pass, index, total} = e.data.progress;
            const percent = (((index + ((pass - 1) * total)) / (total * 2.0)) * 100).toFixed(0);
            console.log("ParsingBLK: " + percent + "%");
        }
    }
    worker.postMessage({absolutePath})
}

function pushImageFromBytes(bytes: Int8Array, callback: (image: ImageData | HTMLImageElement) => void) {
    const urlCreator = window.URL || window.webkitURL;
    const blob = new Blob([bytes], {type: "image/png"});
    const url = urlCreator.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
        callback(image);
    }
    image.onerror = () => {
        throw Error("Failed to load blk")
    }
    image.src = url;
}

module.exports = {
    loadBackground
};