import { ClbStream } from "./clb-stream";

export class S16Stream extends ClbStream {
  emitHeader(chunk) {
    let buffer = Buffer.from(chunk);
    const flags = buffer.readUInt32LE(0);
    const numframes = buffer.readUInt16LE(4);
    this.header_position = 6;

    this.image_data_offset = buffer.readUInt32LE(this.header_position);

    this.header = {
      format: flags === 1 ? "565" : "555",
      numframes,
      image_data_offset: this.image_data_offset,
    };

    this.emit("header", this.header);
  }
}

export const createS16Stream = () => new S16Stream();
