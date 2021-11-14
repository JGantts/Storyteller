export function readProgress(readBytes) {
  console.log("read", (readBytes / 1024 / 1024).toFixed(2), "mb");

  setTimeout(() => stream.once("progress", readProgress), 1000);
}
