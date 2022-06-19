var net = require('net');

var caosAssumedWindowsEncoding = 'latin1';
// TODO: Configuration method for these - this should be a persistent application-global.
var caosAssumedHost = '192.168.1.28';
var caosAssumedPort = 19960;

// Buffer -> Promise<Buffer>
var rawCaosRequest = (requestBuffer) => {
  return new Promise((resolve, reject) => {
    try {
      // We don't actually care about the initial 24-byte header, so we effectively have separate readers and writers.
      // Writer's job is to just dump the request buffer.
      // Reader's job is to simply record everything it's given, we're not really picky and we can clean up later.
      var conn = net.connect(caosAssumedPort, caosAssumedHost);
      var allData = [];
      conn.on('data', (data) => {
        allData.push(data);
      });
      conn.on('close', () => {
        // We're done here.
        resolve(Buffer.concat(allData));
      });
      // Write the request.
      var bufferInt = Buffer.alloc(4);
      bufferInt.writeInt32LE(requestBuffer.length);
      conn.write(bufferInt);
      conn.write(requestBuffer);
    } catch (ex) {
      // If for any reason we throw an exception, turn it into a promise rejection.
      // All other errors are caught by pretending there's no errors (decodeCaosResponse will figure it out by omission)
      reject(ex);
    }
  });
};

// Buffer -> string
var decodeCaosResponse = async (input) => {
  if (input.length < 24)
    return "Error connecting to CPX Server (used to connect to the game). Is caosprox.exe running?";
  if (input.length < 48)
    return "CPX Server (used to connect to the game) did not respond to the request properly. Was the connection interrupted?";
  var responseType = input.readInt32LE(32);
  var expectedResponseLength = input.readInt32LE(36);
  if (expectedResponseLength != (input.length - 48))
    return "CPX Server response length did not match.";
  return input.slice(48, 48 + expectedResponseLength - 1).toString(caosAssumedWindowsEncoding);
};

// string -> Promise<string>
var executeCaos = async (input) => {
  return decodeCaosResponse(await rawCaosRequest(Buffer.from("execute\n" + input + "\u0000", caosAssumedWindowsEncoding)));
};

// {family: int, genus: int, species: int, eventNum: int, script: string} -> Promise<string>
var injectScript = async (input) => {
  var classifier = input.family.toString() + " " + input.genus.toString() + " " + input.species.toString() + " " + input.eventNum.toString();
  return decodeCaosResponse(await rawCaosRequest(Buffer.from("scrp " + classifier + "\n" + input.script.toString() + "\u0000", caosAssumedWindowsEncoding)));
};
