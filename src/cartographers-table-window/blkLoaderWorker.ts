
// @ts-ignore
const { loadBackground:mLoad } = require("./../hard-dependencies/NodeBLKLoader.js");


onmessage = async (e) => {
    const absolutePath = e.data.absolutePath;
    let logger: Nullable<(pass: number, index: number, total: number)=>void> = null;
    if (e.data.withStatus) {
        logger = (pass: number, index: number, total: number) => {
            postMessage({
                progress: {
                    pass,
                    index,
                    total
                }
            });
        };
    }
    const bytes = await mLoad(absolutePath, logger);
    console.log("STITCHED BLK!!");
    postMessage({ result: bytes });
}