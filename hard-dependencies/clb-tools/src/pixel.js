export function getPixel(pixel, format) {
  let rgb = [];

  if (format === "555") {
    const red = (pixel & 0x7c00) >> 10;
    const green = (pixel & 0x03e0) >> 5;
    const blue = pixel & 0x001f;
    rgb = [red * 8, green * 8, blue * 8];
  } else {
    const red = (pixel & 0xf800) >> 11;
    const green = (pixel & 0x07e0) >> 5;
    const blue = pixel & 0x001f;
    rgb = [red * 8, green * 4, blue * 8];
  }

  return rgb;
}
