const { Caos } = require('../sorcerers-table-window/parser/parser.js');

function parseCaosForMetaroom(codeIn) {
    let tree = Caos(codeIn);
    let allCommands = [
      ...breakOutLoops(tree.inject.commands),
      ...breakOutLoops(tree.eventScripts)
    ]
      .filter(val =>
          val.type === "command"
      );
    console.log(allCommands);
}

function breakOutLoops(commands) {
    return commands
        .flatMap(val =>
            ((val.type === "command-list")
                ? breakOutLoops(val.commands)
                : [val]
            )
        );
}

module.exports = {
    parseCaosForMetaroom
}
