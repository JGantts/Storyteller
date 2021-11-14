import { Duplex } from "stream";

export class ClbStream extends Duplex {
  constructor(arg) {
    super(arg);

    this.offset = 0;
    this.image_data_offset = 0;
    this.getting_data = false;
    this.buffer = Buffer.alloc(0);
    this.image_buffer = Buffer.alloc(0);
    this.header_position = 6;
    this.header = {};
    this.sprites = [];
  }

  emitSpriteHeaders(header_buffer) {
    for (var i = 0; i < this.header.numframes; i++) {
      const offset = header_buffer.slice(i * 8 + 0, i * 8 + 4).readUInt32LE();
      const width = header_buffer.slice(i * 8 + 4, i * 8 + 6).readUInt16LE();
      const height = header_buffer.slice(i * 8 + 6, i * 8 + 8).readUInt16LE();

      this.sprites.push({
        offset,
        width,
        height,
      });

      this.emit("sprite_header", this.sprites[this.sprites.length - 1]);
    }
  }

  _write(chunk, encoding, callback) {
    if (this.offset === 0) {
      this.emitHeader(chunk);
    }

    if (this.offset + chunk.byteLength < this.image_data_offset) {
      this.buffer = Buffer.concat([this.buffer, chunk]);
    }

    if (
      this.offset + chunk.byteLength > this.image_data_offset &&
      this.getting_data === false
    ) {
      this.emitSpriteHeaders(
        Buffer.concat([this.buffer, chunk]).slice(
          this.header_position,
          this.image_data_offset
        )
      );

      this.getting_data = true;

      chunk = Buffer.concat([this.buffer, chunk]).slice(this.image_data_offset);
    }

    if (this.getting_data === true) {
      this.image_buffer = Buffer.concat([this.image_buffer, chunk]);
      this.emit("progress", this.image_buffer.byteLength);
    }

    callback(undefined);

    this.offset += chunk.byteLength;
  }

  _final(cb) {
    this.getting_data = false;

    this.emit("image", this.image_buffer);

    cb(null);
  }
}
