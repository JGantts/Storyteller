import { createReadStream } from "fs";
import { basename, extname } from "path";
import { createS16Stream } from "./s16-stream";

import { getPixel } from "./pixel";

import Jimp from "jimp";

const file = createReadStream("./" + process.argv[3]);
const s16 = createS16Stream();

const stream = file.pipe(s16);

let bigimg;
let s16Header;

const sprites = [];

stream.on("header", (header) => {
  s16Header = header;

  console.log(s16Header);
});

stream.on("sprite_header", (sprite_info) => {
  console.log(sprite_info);
  const image = new Jimp(sprite_info.width, sprite_info.height);
  sprites.push({ image, index: sprites.length, ...sprite_info });
});

stream.once("progress", readProgress);

const next = (sprite) =>
  new Promise((resolve, reject) => {
    sprite.image.write(
      basename(process.argv[3], extname(process.argv[3])) +
        sprite.index +
        ".png",
      (err) => {
        if (!err) {
          process.stdout.write(".");
          resolve();
        } else {
          console.log("err", err);
          reject();
        }
      }
    );
  });

stream.on("image", (info) => {
  console.log("Image format: " + s16Header.format);

  for (var spr = 0; spr < sprites.length; spr++) {
    const sprite = sprites[spr];
    const { width, height, offset, image } = sprite;
    const buffer_offset = offset - sprites[0].offset;
    const data = info.slice(buffer_offset, buffer_offset + width * height * 2);

    for (var x = 0; x < width; x++) {
      for (var y = 0; y < height; y++) {
        const j = width * y + x;

        const byte = data.slice(j * 2, j * 2 + 2).readUInt16LE();

        const pixel = getPixel(byte, s16Header.format);

        const [r, g, b] = pixel;
        const i = r * 16777216 + g * 65536 + b * 256 + 255;
        image.setPixelColor(i, x, y);
      }
    }
  }

  let chain = Promise.resolve();

  for (let i = 0; i < sprites.length; i++) {
    chain = chain.then(next(sprites[i]));
  }

  chain = chain.then(() => {
    console.log("wrote", sprites.length, "sprites");
  });
});

function readProgress(readBytes) {
  console.log("read", (readBytes / 1024 / 1024).toFixed(2), "mb");

  setTimeout(() => stream.once("progress", readProgress), 1000);
}
