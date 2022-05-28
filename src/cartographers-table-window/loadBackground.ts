// @ts-ignore
import {loadCachingAsPromise} from "./blkCache";

const {loadBackground: mLoad} = require("./../hard-dependencies/NodeBLKLoader.js");
const { loadCaching } = require('./blkCache.js');

function loadBackground(absolutePath: string, withStatus: boolean, callback: (image: ImageData | HTMLImageElement) => void) {
    loadCaching(absolutePath, withStatus, callback);
}

async function loadBackgroundAsPromise(absolutePath: string, withStatus: boolean, callback: (image: ImageData | HTMLImageElement) => void) {
    const data = await loadCachingAsPromise(absolutePath, withStatus);
    callback(data);
}

module.exports = {
    loadBackground,
    loadBackgroundAsPromise
};