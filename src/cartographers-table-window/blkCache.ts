const fs = require("fs");
const crypto = require('crypto');
const path = require('path');
const cacheDir = require('cache-directory');
const {setStatusRight, clearStatusRight} = require('./statusFooter.js');


const baseCachePath = cacheDir('Storyteller');
if (baseCachePath == null) {
    console.error("Failed to get cache directory");
}
const blkCachePath = baseCachePath != null ?  (path.join(baseCachePath, 'CartographersTable') + '/') : null;

if (!fs.existsSync(blkCachePath)) {
    fs.mkdirSync(blkCachePath, { recursive:true, mode: '744' });
}

async function getFileHash(absolutePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        // if absolutely necessary, use md5
        const hash = crypto.createHash('md5');
        let input: any;
        try {
            input = fs.createReadStream(absolutePath);
        } catch (e) {
        
        }
        input.on('error', reject);
        input.on('data', (chunk: any) => {
            hash.update(chunk);
        });
        input.on('close', () => {
            resolve(hash.digest('hex'));
        });
    });
}

/**
 * A registry of promises, which return a file.
 */
const filePromises: {[id:string]: Promise<BlkData> } = {};

/**
 * Loads a file while caching the result into user storage
 */
export function loadCaching(absolutePath: string, withStatus: boolean, callback: BlkCallback) {
    getFileHash(absolutePath)
        .then(async (hash) => {
            callback( await getCacheLoadingPromise(absolutePath, hash, withStatus) );
        })
    
}

/**
 * Loads file from cache returning a promise for use with await
 * @param absolutePath
 * @param withStatus
 */
export async function loadCachingAsPromise(absolutePath: string, withStatus: boolean): Promise<BlkData> {
    return new Promise((resolve) => {
       loadCaching(absolutePath, withStatus, resolve);
    });
}

/**
 * Restores an already cached image, if the BLK file hash has not changed
 * @param filePath
 */
async function restoreCachedFile(filePath: String): Promise<Nullable<BlkData>> {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    try {
        const buffer = fs.readFileSync(filePath);
        const blob = (new Blob([buffer], {type: 'images/png'}));
        const data = await blobToImage(blob);
        if (data == null) {
            fs.unlinkSync(filePath);
            return null;
        }
        return data;
    } catch (e) {
        return null;
    }
}


/**
 * Gets the cache loading promise, given a file path and the files hash
 * @param absolutePath
 * @param hash
 * @param withStatus
 */
function getCacheLoadingPromise(absolutePath: string, hash: string, withStatus: boolean): Promise<BlkData> {
    const id = path.basename(absolutePath) + '-' + hash;
    let promise: Promise<BlkData>
    if (filePromises.hasOwnProperty(id)) {
        return filePromises[id];
    }
    filePromises[id] = promise = (new Promise(async (resolve) => {
        const baseName = path.basename(absolutePath, '.blk');
        const cachedFile = blkCachePath + baseName + '-' + hash + '.png';
        let image = await restoreCachedFile(cachedFile);
        if (image != null) {
            resolve(image);
            return;
        }
        loadNew(absolutePath, withStatus, (bytes: Int8Array) => {
            try {
                fs.writeFileSync(cachedFile, bytes);
            } catch (error) {
                console.error("Failed to write cached BLK; " + (error ?? ""));
            }
        }, resolve);
    }));
    return promise;
}

function loadNew(absolutePath: string, withStatus: boolean, write:(bytes: Int8Array)=>void, resolve: BlkCallback) {
    if (window.Worker) {
        workerPromise(absolutePath, withStatus, write, resolve);
        return;
    }
    // Get optional logger
    const logger = withStatus ? getPercentLogger() : null;
    
    // Load BLK
    const start = Date.now();
    mLoad(absolutePath, logger)
        .then((bytes: Int8Array) => {
            finish(bytes, write, resolve, start);
        });
}

/**
 * Load BLK using Web Workers to keep event thread responsive
 * @param absolutePath
 * @param withStatus
 * @param write
 * @param callback
 */
function workerPromise(absolutePath: string, withStatus: boolean, write:(bytes: Int8Array)=>void, callback: BlkCallback) {
    const worker = new Worker("./blkLoaderWorker.js");
    const terminate = () => {
        worker.onerror = null;
        worker.onmessage = null;
        worker.terminate();
    }
    const logger = withStatus ? getPercentLogger() : null;
    worker.onerror = (e) => {
        terminate();
        throw new Error("Failed to parse BLK: " + e.message);
    }
    const start = Date.now();
    worker.onmessage = (e) => {
        if (e.data == null) {
            terminate();
            throw new Error("Failed to parse BLK");
        } else if (e.data.result) {
            finish(e.data.result, write, callback, start);
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

function finish(bytes: Int8Array, write:(bytes: Int8Array)=>void, callback: BlkCallback, startTime: number) {
    const time = (Date.now() - startTime) / 1000;
    const blob = new Blob([bytes], {type: "image/png"});
    console.log(`Took: ${time} seconds to parse BLK`);
    blobToImage(blob).then ((data) => {
        callback(data);
    });
    write(bytes);
    clearStatusRight();
}


async function blobToImage(blob: Blob) {
    return new Promise<BlkData>((resolve, reject) => {
        const urlCreator = window.URL || window.webkitURL;
        const url = urlCreator.createObjectURL(blob);
        const image = new Image();
        image.onload = () => {
            resolve(image);
        }
        image.onerror = () => {
            reject(new Error("Failed to load blk"));
        }
        image.src = url;
    });
}

/**
 * Gets a logger for use
 */
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

module.exports = {
    loadCaching,
    loadCachingAsPromise
}