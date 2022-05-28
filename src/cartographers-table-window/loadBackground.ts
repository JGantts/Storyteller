// @ts-ignore
const {loadBackground: mLoad} = require("./../hard-dependencies/NodeBLKLoader.js");
const {setStatusRight, clearStatusRight} = require('./statusFooter.js');

function loadBackground(absolutePath: string, withStatus: boolean, callback: (image: ImageData | HTMLImageElement) => void) {
    if (window.Worker) {
        console.log("Loading BLK with worker");
        workerPromise(absolutePath, withStatus, callback);
        return;
    }
    // Get optional logger
    const logger = withStatus ? getPercentLogger() : null;
    
    // Load BLK
    console.log("Loading BLK in window");
    mLoad(absolutePath, logger)
        .then((bytes: Int8Array) => {
            clearStatusRight();
            pushImageFromBytes(bytes, callback);
        });
}

function getPercentLogger():(pass: number, index: number, total: number) => void {
    let lastPercent = "";
    return (pass: number, index: number, total: number) => {
        const percent = ((index * 100.0) / total).toFixed(0);
        if (percent == lastPercent) {
            return;
        }
        lastPercent = percent;
        let action: string;
        if (pass == 1) {
            action = "Parsing"
        } else {
            action = "Stitching";
        }
        setStatusRight(`${action} Background: ${percent}%"`);
    };
}


function workerPromise(absolutePath: string, withStatus: boolean, callback: (image: ImageData | HTMLImageElement) => void) {
    const worker = new Worker("./blkLoaderWorker.js");
    const terminate = () => {
        worker.onerror = null;
        worker.onmessage = null;
        worker.terminate();
    }
    const logger = withStatus ? getPercentLogger() : null;
    worker.onerror = (e) => {
        terminate();
        throw Error("Failed to parse BLK: " + e.message);
    }
    const start = Date.now();
    worker.onmessage = (e) => {
        if (e.data == null) {
            terminate();
            throw Error("Failed to parse BLK");
        } else if (e.data.result) {
            const time = (Date.now() - start) / 1000;
            console.log(`Took: ${time} seconds to parse BLK`);
            pushImageFromBytes(e.data.result as Int8Array, callback)
            clearStatusRight();
            terminate()
        } else {
            const {pass, index, total} = e.data.progress;
            if (withStatus) {
                logger!!(pass, index, total);
            }
        }
    }
    worker.postMessage({absolutePath, withStatus})
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