
// @ts-ignore
const { loadBackground:mLoad } = require("./../hard-dependencies/NodeBLKLoader.js");


onmessage = async (e) => {
    const absolutePath = e.data.absolutePath;
    const bytes = await mLoad(absolutePath, (pass: number, index: number, total: number) => {
        postMessage({
            progress: {
                pass,
                index,
                total
            }
        });
    });
    console.log("STITCHED BLK!!");
    postMessage({ result: bytes });
}