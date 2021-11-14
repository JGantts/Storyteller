switch (process.argv[2]) {
  case "s16":
    require("./index-s16");
    break;
  case "blk":
    require("./index-blk");
    break;
  default:
    console.log("Usage:\n\ncbl-tools [s16|blk] <filename>");
}
