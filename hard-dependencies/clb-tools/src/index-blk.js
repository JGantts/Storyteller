import { createReadStream } from "fs";
import { basename, extname } from "path";
import { createBlkStream } from "./blk-stream";

import { getPixel } from "./pixel";

import Jimp from "jimp";

const file = createReadStream("./" + process.argv[3]);
const blk = createBlkStream();

const stream = file.pipe(blk);

let bigimg;
let blkHeader;

const sprites = [];

stream.on("header", (header) => {
  blkHeader = header;

  console.log(blkHeader);

  bigimg = new Jimp(
    128 * blkHeader.backgroundwidth,
    128 * blkHeader.backgroundheight
  );
});

stream.on("sprite_header", (sprite_info) => {
  sprites.push(sprite_info);
});

stream.once("progress", readProgress);

stream.on("image", (info) => {
  console.log("bytes", info.byteLength);

  let counter = 0;

  console.log("Image format: " + blkHeader.format);

  for (var tilex = 0; tilex < blkHeader.backgroundwidth; tilex++) {
    for (var tiley = 0; tiley < blkHeader.backgroundheight; tiley++) {
      const spriteIndex = counter;
      const sprite = sprites[spriteIndex];

      const tilexpos = tilex * 128;
      const tileypos = tiley * 128;

      const buffer_offset = sprite.offset - sprites[0].offset;

      const data = info.slice(buffer_offset, buffer_offset + 128 * 128 * 2);
      process.stdout.write(".");
      for (var j = 0; j < 128 * 128 * 2; j += 2) {
        try {
          const byte = data.slice(j, j + 2).readUInt16LE();

          const pixel = getPixel(byte, blkHeader.format);
          const ox = (j / 2) % 128;
          const oy = Math.floor(j / 2 / 128);

          const x = tilexpos + ox;
          const y = tileypos + oy;

          const [r, g, b] = pixel;

          const i = r * 16777216 + g * 65536 + b * 256 + 255;

          bigimg.setPixelColor(i, x, y);
        } catch (e) {
          console.log(data.byteLength);
          console.log(j, j + 2);
          console.error(e);
        }
      }

      counter++;
    }
  }

  process.stdout.write("\n");

  bigimg.write(
    basename(process.argv[3], extname(process.argv[3])) + ".png",
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("wrote", blkHeader.numframes, "frames");
      }
    }
  );
});

function readProgress(readBytes) {
  console.log("read", (readBytes / 1024 / 1024).toFixed(2), "mb");

  setTimeout(() => stream.once("progress", readProgress), 1000);
}
