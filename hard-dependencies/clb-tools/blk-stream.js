import { ClbStream } from "./clb-stream";

export class BlkStream extends ClbStream {
  emitHeader(chunk) {
    let buffer = Buffer.from(chunk);
    const flags = buffer.readUInt32LE(0);
    const backgroundwidth = buffer.readUInt16LE(4);
    const backgroundheight = buffer.readUInt16LE(6);
    const numframes = buffer.readUInt16LE(8);
    this.header_position = 10;

    this.image_data_offset = buffer.readUInt32LE(this.header_position) + 4;

    this.header = {
      format: flags === 1 ? "565" : "555",
      backgroundwidth,
      backgroundheight,
      numframes,
      image_data_offset: this.image_data_offset,
    };

    this.emit("header", this.header);
  }
}

export const createBlkStream = () => new BlkStream();
