const assert = require('assert');
const crypto = require('crypto');

const { Caos } = require('../sorcerers-table-window/parser/parser.js');

function parseCaosForMetaroom(codeIn) {
    let tree = Caos(codeIn);
    let allCommands = [
      ...breakOutLoops(tree.inject.commands),
      ...breakOutLoops(tree.eventScripts)
    ];

    let metaroomVar = null;
    let va00Var = null;

    let importedJson = {
      id: null,
      name: null,
      background: null,
      x: null,
      y: null,
      width: null,
      height: null,
      rooms: [],
      perms: []
    };

    let keyMap = new Object();

    for (command of allCommands) {
        switch (command.type) {
          case "namespaced-command":
            break;
          case "command":
            switch (command.variant) {
              case "setv":
                let setvArgs = command.arguments;
                assert(setvArgs.length === 2, `${JSON.stringify(command)}`);
                switch(setvArgs[1].variant) {
                  case "addm": {
                    let gameVariable = setvArgs[0];
                    let addmCommand = setvArgs[1];
                    assert(gameVariable.variant === "game");
                    assert(gameVariable.arguments.length === 1);
                    assert(gameVariable.arguments[0].variant === "string");
                    assert(metaroomVar === null, `${JSON.stringify(metaroomVar)}`);
                    metaroomVar = gameVariable.arguments[0].value;
                    assert(addmCommand.arguments.length === 5);
                    importedJson.id = crypto.randomUUID();
                    importedJson.name = "";
                    importedJson.x = addmCommand.arguments[0].value;
                    importedJson.y = addmCommand.arguments[1].value;
                    importedJson.width = addmCommand.arguments[2].value;
                    importedJson.height = addmCommand.arguments[3].value;
                    importedJson.background = addmCommand.arguments[4].value;
                    break;
                  }

                  case "addr": {
                    let va00Variable = setvArgs[0];
                    let addrCommand = setvArgs[1];
                    assert(va00Variable.variant === "va", `${JSON.stringify(va00Variable)}`);
                    assert(va00Variable.name === "va00", `${JSON.stringify(va00Variable)}`);
                    assert(addrCommand.arguments.length === 7);
                    assert(addrCommand.arguments[0].variant === "game");
                    assert(addrCommand.arguments[0].arguments[0].value === metaroomVar);
                    va00Var = crypto.randomUUID();
                    importedJson.rooms[va00Var] = {
                        id: va00Var,
                        leftX: addrCommand.arguments[1].value - importedJson.x,
                        rightX: addrCommand.arguments[2].value - importedJson.x,
                        leftCeilingY: addrCommand.arguments[3].value - importedJson.y,
                        rightCeilingY: addrCommand.arguments[4].value - importedJson.y,
                        leftFloorY: addrCommand.arguments[5].value - importedJson.y,
                        rightFloorY: addrCommand.arguments[6].value - importedJson.y
                    };
                    break;
                  }

                  case "va":{
                    assert(setvArgs[1].name === "va00", `${JSON.stringify(setvArgs[1])}`);
                    assert(setvArgs[0].variant === "game", `${JSON.stringify(setvArgs[0])}`);
                    let gameVariable = setvArgs[0];
                    keyMap[gameVariable.arguments[0].value] = va00Var;
                    break;
                  }


                }
                break;
              case "door":
                let doorArgs = command.arguments;
                assert(doorArgs.length === 3, `${JSON.stringify(command)}`);
                let gameVariableA = doorArgs[0];
                let gameVariableB = doorArgs[1];
                importedJson.perms.push({
                    rooms:
                    {
                        a: keyMap[gameVariableA.arguments[0].value],
                        b: keyMap[gameVariableB.arguments[0].value]
                    },
                    permeability: doorArgs[2].value/100
                });
                break;


            }
            break;
        }
    }
    console.log(importedJson);

    return importedJson;





    /*
      .filter(val =>
          val.type === "command"
      )
      .filter(val =>
          {
              switch (val.variant) {
                case "setv":
                  for (arg of val.arguments) {
                      switch (arg.variant) {
                        case "addm":
                          return true;
                        case "addr":
                          return true;
                        default:
                          break;
                      }
                  }
                  break;
                case "mmsc":
                  return true;
                case "rtyp":
                  return true;
                case "rmsc":
                  return true;
                case "door":
                  return true;
                default:
                  break;
              }
          }
      );*/
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
